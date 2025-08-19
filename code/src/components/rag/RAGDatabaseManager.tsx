import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Database, FileText, BookOpen, FileQuestion, LayoutIcon, Search, Upload, FolderPlus, Settings, Plus, Pencil, Send } from 'lucide-react';
import type { RAGDatabase, FileData, FileStatus } from '../../types';
import { cn } from '../../utils';
import { uploadFile, getModuleDetails, getOriginFile } from '../../services/documents'
import { useAuth } from '../../contexts/AuthContext';
import localForage from "localforage"


interface RAGDatabaseManagerProps {
  selectedDatabase: RAGDatabase | null;
}


export default function RAGDatabaseManager({ selectedDatabase }: RAGDatabaseManagerProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'general' | 'consultancy' | 'contract'>('general');
  // const [activeTab, setActiveTab] = useState<'general' | 'tender' | 'consultancy' | 'contract'>('general');
  // const [searchQuery, setSearchQuery] = useState('');
  // const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  // const [embeddingModel, setEmbeddingModel] = useState('e5-large-v2');
  // const [chunkSize, setChunkSize] = useState(5);
  // const [showUploadModal, setShowUploadModal] = useState(false);
  // const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  // const [isRenaming, setIsRenaming] = useState<string | null>(null);
  // const [newFolderName, setNewFolderName] = useState('');

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const filesRef = useRef<File[]>([]);
  filesRef.current = uploadedFiles;


  const moduleData = {
    general: {
      icon: LayoutIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    // tender: {
    //   icon: FileText,
    //   color: 'text-green-600',
    //   bgColor: 'bg-green-50'
    // },
    consultancy: {
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    contract: {
      icon: FileQuestion,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  };


  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ${t('kb')}`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} ${t('mb')}`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} ${t('gb')}`;
  };


  const [isUploading, setIsUploading] = useState(false);
  // 在组件状态中添加
  const [selectedFileForManagement, setSelectedFileForManagement] = useState<FileStatus | null>(null);

  useEffect(() => {
    // 设置定时刷新，每30秒刷新一次数据
    const interval = setInterval(() => {
      refreshModuleInfo()
    }, 30000);

    return () => clearInterval(interval);
  }, [activeTab]);

  const refreshModuleInfo = async () => {
    function sumEnhancedChunks(data) {
      return Object.keys(data).reduce((sum, key) => {
        // 只累加以"need_enhanced_chunk_"开头的属性
        if (key.startsWith("need_enhanced_chunk_")) {
          return sum + data[key];
        }
        return sum;
      }, 0);
    }
    try {
      const res = await getModuleDetails(activeTab);
      res.forEach(element => {
        element.metadata.num_chunk = element.metadata.num_chunk === 0 ? sumEnhancedChunks(element.metadata) + element.metadata.no_need_enhance : element.metadata.num_chunk
      });
      console.log(res);
      setRealFiles(res as FileStatus[]);
      console.log(realFiles)
    } catch (error) {
      setRealFiles([]);
      console.error('Error fetching module details:', error);
    }
  };

  const handleFileUpload = async () => {
    const files = uploadedFiles
    if (files && files.length > 0) {
      // Handle file upload logic here
      console.log('Files to upload:', files);
      setIsUploading(true);
      try {
        // 文件上传逻辑
        await uploadFile(files, activeTab);
        await refreshModuleInfo()
        window.alert(`${files[0].name} ${t('upload_success')}`);
        handleModuleChange();
      } finally {
        setIsUploading(false);
      }
    } else {
      window.alert(t('no_file_selected'));
    }

  }

  const [selectedFileName, setSelectedFileName] = useState<string[]>([]);

  //选择上传文件
  const handleSelectUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    // 支持的文件类型
    const allowedTypes = [
      // 'application/msword', // .doc
      // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/pdf' // .pdf
    ];

    const validFiles = Array.from(files).filter(file => {
      return allowedTypes.includes(file.type) &&
        !filesRef.current.some(
          f => f.name === file.name &&
            f.size === file.size &&
            f.lastModified === file.lastModified
        );
    });
    if (validFiles.length > 0) {
      // 添加新文件而不是替换
      setUploadedFiles(prev => [...prev, ...validFiles]);
      filesRef.current = [...filesRef.current, ...validFiles];
      setSelectedFileName(prev => [...prev, ...validFiles.map(file => file.name)]);
    }

    e.target.value = ''; // 清空input以便重复选择文件
  };

  const handleChunkDocument = async (id: string, module: string) => {
    const temp = realFiles.filter(file => file._id === id);
    if (window.confirm('确定分块: \n' + temp[0].filename)) {
      // 在这里添加实际的删除逻辑
      console.log('分块文件:', id);
      await processDocument(temp[0]._id, module)
    }
    else {
      console.log("取消")
    }
    setSelectedFileForManagement(null)
    await refreshModuleInfo()
  }

  const handleDelete = async (id: string, module: string) => {
    const temp = realFiles.filter(file => file._id === id);
    if (window.confirm('确定删除: \n' + temp[0].filename)) {
      // 在这里添加实际的删除逻辑
      // console.log('删除文件:', id);
      await removeDocument(temp[0].filename, module)
      await refreshModuleInfo()
      setSelectedFileForManagement(null)
    }
    else {
      console.log("取消")
    }
  }

  const handleModuleChange = () => {
    setUploadedFiles([]);
    setSelectedFileName([]);
    if (filesRef.current) filesRef.current = [];
  };

  const [realFiles, setRealFiles] = useState<FileStatus[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      await refreshModuleInfo();
    };
    fetchData();
  }, [activeTab]);

  // 在组件中使用效果钩子监听模块变化
  useEffect(() => {
    return () => {
      const cleanup = async () => {
        await handleModuleChange();
      };
      cleanup();
    };
  }, [activeTab]);

  const { user, logout, isAdmin, removeDocument, processDocument } = useAuth();

  function extractPdfData(rawData: string) {
    // 实现具体解析逻辑，例如：
    const match = rawData.match(/data:pdf;base64,([\s\S]+)/);
    return match ? match[1] : '';
  }

  const handleGetPDF = async (id: string, module: string) => {
    const cacheKey = `pdf_${id}`;

    // 先检查缓存
    const cachedPdf = await localForage.getItem(cacheKey);
    if (cachedPdf) {
      return cachedPdf;
    }
    // 没有缓存则从后端获取

    const pdfData = await getOriginFile(id, module);
    const pdfBase64 = extractPdfData(pdfData.pdf_data);
    await localForage.setItem(cacheKey, pdfBase64);
    // console.log(pdfData)
    // console.log(pdfBase64)

    return pdfBase64;
  }


  return (
    <div className="h-full flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            {selectedDatabase?.name || t('ragManagement')}
          </h2>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {Object.entries(moduleData).map(([key, data]) => {
            const Icon = data.icon;
            return (
              <button
                key={key}
                onClick={() => (key === 'general' || key === 'contract') && setActiveTab(key as keyof typeof moduleData)}
                className={cn(
                  "w-full flex items-center gap-2 p-2 rounded-lg transition-colors",
                  activeTab === key ? data.bgColor : "hover:bg-gray-50"
                )}
              >
                <Icon className={cn("w-5 h-5", data.color)} />
                <span>
                  {key !== 'contract' ? t(`${key}Module`) : t('contractualQueryModule')}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">
            {activeTab !== 'contract' ? t(`${activeTab}Module`) : t('contractualQueryModule')} - {t('moduleFiles')}
          </h2>

          {/* File Management Tools */}
          {isAdmin() && <div className="flex items-center gap-4 mb-6">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleSelectUpload}
              accept=".pdf"
              multiple
            />
            <label
              htmlFor="file-upload"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              title={t('SelectFiles')}
            >
              <Upload className="w-5 h-5" />
              {t('SelectFiles')}
            </label>
            <div className="mt-2 text-sm text-gray-600">
              {uploadedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1"
                      title={file.name}>
                      <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newFiles = [...uploadedFiles];
                          newFiles.splice(index, 1);
                          setUploadedFiles(newFiles);
                        }}
                        className="ml-2 text-gray-500 hover:text-red-500"
                      >
                        <span className="text-xs font-bold">×</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleFileUpload}
              className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:bg-blue-700 ml-auto ${isUploading ? 'bg-red-600' : 'bg-blue-600'}`}
              disabled={isUploading}
            >
              <Send className="w-5 h-5" />
              {isUploading ? t('uploading') : t('uploadFiles')}
            </button>

          </div>
          }

        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="max-h-[calc(100vh-300px)] overflow-y-auto w-full">
            <div className="overflow-x-auto">
              {isAdmin() ? (<table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('fileName')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('fileSize')}({t('kb')})
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('fileStatus')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {`${t('processedChunkNumber')} / ${t('fileChunkNumber')}`}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('manage')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {realFiles && realFiles.length > 0 ? (
                    realFiles.map((file) => (
                      <tr key={file._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <a
                              href="javascript:void(0);"
                              // target="_blank"
                              onClick={async (e) => {
                                try {
                                  const pdfData = await handleGetPDF(file._id, activeTab);
                                  const byteCharacters = atob(pdfData);
                                  const byteNumbers = new Array(byteCharacters.length);
                                  for (let i = 0; i < byteCharacters.length; i++) {
                                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                                  }
                                  const byteArray = new Uint8Array(byteNumbers);
                                  const blob = new Blob([byteArray], { type: 'application/pdf' });
                                  const url = URL.createObjectURL(blob);
                                  const pdfWindow = window.open('', '_blank');
                                  if (pdfWindow) {
                                    pdfWindow.document.title = `${file.filename}`;
                                    pdfWindow.location.href = url;
                                    // 添加超时以确保窗口加载完成
                                    setTimeout(() => {
                                      URL.revokeObjectURL(url);
                                    }, 1000);
                                  } else {
                                    // 浏览器拦截处理
                                    const downloadLink = document.createElement('a');
                                    downloadLink.href = url;
                                    downloadLink.download = `${file.filename}.pdf`;
                                    document.body.appendChild(downloadLink);
                                    downloadLink.click();
                                    setTimeout(() => {
                                      document.body.removeChild(downloadLink);
                                      URL.revokeObjectURL(url);
                                    }, 100);
                                  }
                                } catch (error) {
                                  console.error('PDF打开失败:', error);
                                  alert('PDF打开失败，请检查浏览器设置或联系管理员');
                                }
                              }}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                              rel="noopener noreferrer"
                              title={file.filename}
                            >
                              {file.filename.length > 15 ? `${file.filename.substring(0, 15)}...` : file.filename}
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500">
                            {file.length}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500">
                            {file.metadata.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500">
                            {
                              file.metadata?.total_chunks > 0
                                ? `${file.metadata.num_chunk || 0} / ${file.metadata.total_chunks}`
                                : '——'
                            }
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mx-auto block"
                            onClick={() => setSelectedFileForManagement(file)}
                          >
                            {t("manage")}
                          </button>
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        {t('noFilesAvailable')}
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('fileName')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('fileSize')}({t('kb')})
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {realFiles && realFiles.length > 0 ? (
                      realFiles.map((file) => (
                        <tr key={file._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <a
                                href="javascript:void(0);"
                                // target="_blank"
                                onClick={async (e) => {
                                  try {
                                    const pdfData = await handleGetPDF(file._id, activeTab);
                                    const byteCharacters = atob(pdfData);
                                    const byteNumbers = new Array(byteCharacters.length);
                                    for (let i = 0; i < byteCharacters.length; i++) {
                                      byteNumbers[i] = byteCharacters.charCodeAt(i);
                                    }
                                    const byteArray = new Uint8Array(byteNumbers);
                                    const blob = new Blob([byteArray], { type: 'application/pdf' });
                                    const url = URL.createObjectURL(blob);
                                    const pdfWindow = window.open('', '_blank');
                                    if (pdfWindow) {
                                      pdfWindow.document.title = `${file.filename}`;
                                      pdfWindow.location.href = url;
                                      // 添加超时以确保窗口加载完成
                                      setTimeout(() => {
                                        URL.revokeObjectURL(url);
                                      }, 1000);
                                    } else {
                                      // 浏览器拦截处理
                                      const downloadLink = document.createElement('a');
                                      downloadLink.href = url;
                                      downloadLink.download = `${file.filename}.pdf`;
                                      document.body.appendChild(downloadLink);
                                      downloadLink.click();
                                      setTimeout(() => {
                                        document.body.removeChild(downloadLink);
                                        URL.revokeObjectURL(url);
                                      }, 100);
                                    }
                                  } catch (error) {
                                    console.error('PDF打开失败:', error);
                                    alert('PDF打开失败，请检查浏览器设置或联系管理员');
                                  }
                                }}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                rel="noopener noreferrer"
                                title={file.filename}
                              >
                                {file.filename.length > 50 ? `${file.filename.substring(0, 50)}...` : file.filename}
                              </a>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-500">
                              {file.length}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                          {t('noFilesAvailable')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* 文档管理模块 */}
      {
        selectedFileForManagement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-1/2">
              <h3 className="text-lg font-semibold mb-4">
                {t('managingDocument')}: {selectedFileForManagement.filename}
              </h3>

              <div className="flex gap-4 mb-4">
                {selectedFileForManagement.metadata.status === "pending" && (
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => handleChunkDocument(selectedFileForManagement._id, activeTab)}
                  >
                    {t('chunkDocument')}
                  </button>
                )}

                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => handleDelete(selectedFileForManagement._id, activeTab)}
                >
                  {t('deleteDocument')}
                </button>

                <button
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 ml-auto"
                  onClick={() => setSelectedFileForManagement(null)}
                >
                  {t('close')}
                </button>

              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}