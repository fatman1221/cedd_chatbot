import React from 'react';
import { Send, Paperclip, Square, Trash } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils';
import type { ChatTopic, PresetTemplate, RAGPartition } from '../../types';
import RAGPartitions from '../rag/RAGPartitions';


interface MessageInputProps {
    input: string;
    setInput: (value: string) => void;
    handleSend: () => void;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleStopGeneration: () => void;
    isGenerating: boolean;
    uploadedFiles: File[];
    setUploadedFiles: (files: File[]

    ) => void;
    moduleTemplates: PresetTemplate[];
    selectedTemplateId: string | null;
    handlePresetTemplate: (template: PresetTemplate | null) => void;
    availablePartitions: RAGPartition[];
    handleSelectedPartitions: (value: RAGPartition[]) => void;
    handleUsePrompt: (value: boolean) => void;
    usePrompt: boolean;
}

export default function MessageInput({
    input,
    setInput,
    handleSend,
    handleFileUpload,
    handleStopGeneration,
    isGenerating,
    uploadedFiles,
    setUploadedFiles,
    moduleTemplates,
    handlePresetTemplate,
    availablePartitions,
    handleSelectedPartitions,
    handleUsePrompt,
    usePrompt,
}: MessageInputProps) {
    const { t } = useTranslation();

    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    // 新增效果监听器统一处理高度
    React.useEffect(() => {
        if (textareaRef.current) {
            const textarea = textareaRef.current;
            const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 24;
            const minHeight = 2 * lineHeight;

            textarea.style.height = 'auto';
            let currentScrollHeight = textarea.scrollHeight;

            // 调整高度计算逻辑
            const maxHeight = 6 * lineHeight;
            const contentHeight = Math.min(maxHeight, Math.max(currentScrollHeight, minHeight));

            textarea.style.height = `${contentHeight}px`;
            textarea.classList.toggle('overflow-y-auto', currentScrollHeight > maxHeight);
            textarea.classList.toggle('overflow-y-hidden', currentScrollHeight <= maxHeight);
        }
    }, [input]);

    return (
        <div className="pt-4 pb-2">
            <div>
                <div className="flex justify-between items-center">
                    <div className="flex-1 items-center space-x-2">
                        {/* 右侧输入和发送区域 */}
                        <div className="flex items-center space-x-2 flex-1">
                            <div className="relative flex-1">
                                {/* 文件选择显示区域 */}
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
                                <textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={(e) => {
                                        const rawText = e.target.value;
                                        // 将方括号内容转换为粗体
                                        const formattedText = rawText.replace(/\[(.*?)\]/g, '**$1**');
                                        setInput(formattedText);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder={t('typeMessage')}
                                    className="message-textarea w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                {/* 处理预设的模板 */}
                <div className="p-2 ml-2 flex overflow-x-auto">
                    <div className="flex space-x-1 flex-1 justify-start items-start">
                        {moduleTemplates && moduleTemplates.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => {
                                    handlePresetTemplate(template);
                                }}
                                className={cn(
                                    "flex-shrink-0 w-32 flex items-center justify-center space-x-2 p-2 rounded-lg bg-gray-200 mb-4 hover:bg-blue-400",
                                    // selectedTemplateId === template.id && "bg-blue-400"
                                )}
                                title={template.title}
                            >
                                <span className="truncate">{template.type}</span>
                            </button>
                        ))}
                    </div>
                    <div className='flex flex-col'>
                        {/* 发送按钮 */}
                        <div className='flex flex-row'>
                            {/* 文件上传 */}
                            <div className="ml-4 flex-shrink-0 p-2 items-start">
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    multiple
                                    onChange={handleFileUpload}
                                    accept=".doc,.docx,.pdf"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="flex flex-col space-y-2 p-2 rounded-full hover:bg-gray-100 cursor-pointer text-gray-600"
                                    title={t('attachFile')}
                                >
                                    <Paperclip className="w-5 h-5" />
                                </label>
                            </div>
                            {/* 发送/取消按钮 */}
                            <div className="ml-2 p-2 flex-shrink-0 items-center">

                                {/* <div className="flex flex-col space-y-2"> */}

                                <button
                                    onClick={isGenerating ? handleStopGeneration : handleSend}
                                    disabled={!isGenerating && input.trim().length === 0}
                                    className={cn(
                                        "p-2 rounded-full",
                                        isGenerating
                                            ? "bg-red-500 hover:bg-red-600 text-white"
                                            : "bg-blue-500 hover:bg-blue-600 text-white"
                                    )}
                                    title={isGenerating ? t('stopGeneration') : t('sendMessage')}
                                >
                                    {isGenerating ? (
                                        <Square className="w-5 h-5 fill-current" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                                {/* </div> */}
                            </div>
                            {/* 清除按钮 */}
                            <div className="ml-2 p-2 flex-shrink-0 items-center">
                                <button
                                    onClick={() => setInput('')}
                                    className="p-2 rounded-full hover:bg-gray-100 text-red-600"
                                    title={t('clearInput') || 'Clear input'}
                                >
                                    <Trash className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
                {/* 设置rag文档下拉菜单 */}
                <div className='flex flex-1 flex-row justify-between w-full'>
                    <RAGPartitions
                        availablePartitions={availablePartitions}
                        handleSelectedPartitions={handleSelectedPartitions}
                        handleUsePrompt={handleUsePrompt}
                        isGenerating={isGenerating}
                        usePrompt={usePrompt}
                    />
                </div>
            </div>
        </div>
    );
}