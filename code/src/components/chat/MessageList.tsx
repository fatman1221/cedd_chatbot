import React, { useState, useEffect, useRef } from 'react';
import { ThumbsUp, ThumbsDown, Copy } from 'lucide-react';
import { cn } from '../../utils';
import type { Message } from '../../types';
import MarkdownContent from '../ui/MarkdownContent';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from 'react-error-boundary';
import { getfile } from '../../services/documents';
import localForage from 'localforage';
import { Remarkable } from 'remarkable';


interface MessageListProps {
  messages: Message[];
  isReasoning: boolean;
  displayedMessage: string;
  handleFeedback: (messageId: string, isPositive: boolean) => void;
  percentage: number;
}

const formatMarkdown = (content: string) => {
  return content
    // 新增：移除列表项中连字符与粗体标记间的多余空格
    .replace(/(-)\s{1,}(\*\*)/g, '$1 $2')
    // 1. abdc 变成 1. abdc（多个空格变1个）
    .replace(/(\d+\.)\s{2,}([a-zA-Z])/g, '$1 $2')
    .replace(/(\d+\.)\s*\n\s*(\*\*)/g, '$1 $2')
    // - **Communication**: 中 - 和 ** 之间多个空格变1个
    .replace(/(-)\s{2,}(\*\*)/g, '$1 $2')
    .replace(/\n{2,}/g, '\n')
    .replace(/^---\s*$/gm, '');
};


export default function MessageList({
  messages,
  isReasoning,
  displayedMessage,
  handleFeedback,
  percentage,
}: MessageListProps) {
  const { t } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      // 明确定义参数类型为ScrollIntoViewOptions
      const scrollOption: ScrollIntoViewOptions = {
        behavior: 'smooth',
        block: 'center',    // 使用合法的block值
        // inline: 'center'  // 使用合法的inline值
      };
      messagesEndRef.current.scrollIntoView(scrollOption);
    }
  };

  useEffect(() => {
    // 添加防抖处理确保滚动稳定性
    const timer = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timer);
  }, [percentage, messages, displayedMessage]);

  function extractPdfData(rawData: string) {
    // 实现具体解析逻辑，例如：
    // console.log(rawData)
    const match = rawData.match(/data:pdf;base64,([\s\S]+)/);
    return match ? match[1] : '';
  }

  // const storedData = sessionStorage.getItem(ref.content);
  // let base64Data: string = '';
  // if (storedData) {
  //   base64Data = storedData;
  // } else {
  //   const pdfData = await getfile(ref.collection_name, ref.content);
  //   base64Data = extractPdfData(pdfData);
  //   sessionStorage.setItem(ref.content, base64Data);
  // }

  const handleGetPDF = async (id: string, collection_name: string) => {
    const cacheKey = `${id}`;

    // 先检查缓存
    const cachedPdf = await localForage.getItem(cacheKey);
    if (cachedPdf) {
      return cachedPdf;
    }
    // 没有缓存则从后端获取

    const pdfData = await getfile(collection_name, id);
    const pdfBase64 = extractPdfData(pdfData);
    await localForage.setItem(cacheKey, pdfBase64);
    // console.log(pdfData)
    // console.log(pdfBase64)
    return pdfBase64;
  }

  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 h-screen">
      {messages.map((message) => (
        <div key={message.id} className="flex flex-col space-y-2">
          {/* 消息时间 */}
          <div className={`text-xs text-gray-500 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
            {message.timestamp.toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })}
          </div>
          {/* 消息内容 */}
          <div
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
          >
            <div
              ref={el => messageRefs.current[message.id] = el}
              className={cn(
                "max-w-[90%] rounded-lg p-3",
                message.sender === 'user'
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800"
              )}
            >
              <ErrorBoundary
                fallback={(
                  <div className={message.sender === 'user' ? 'text-white' : 'text-gray-800'}>
                    {message.content}
                  </div>
                )}
              >
                <MarkdownContent
                  content={formatMarkdown(message.content)}
                  className={message.sender === 'user' ? 'text-white' : 'text-gray-800'}
                />
                {/* {md.render(message.content)} */}

              </ErrorBoundary>
              {/* {message.content} */}
            </div>
          </div>
          {/* 用户消息附件 */}
          {message.sender === 'user' && message.filenames && message.filenames.length > 0 && (
            <div className="flex flex-col space-y-1 mt-2 max-w-[90%] ml-auto">
              <div className="flex justify-end">
                {message.uploadPercentage !== undefined && message.uploadPercentage > 0 && message.uploadPercentage < 100 && (
                  <div className="text-xs text-blue-600">
                    {/* {t('uploadingFile')} */}
                    {message.uploadPercentage.toFixed(2)}%
                  </div>
                )}
              </div>
              {message.uploadPercentage === 100 && <div className="text-xs text-gray-500 items-end flex justify-end"> {t('attachFile')} </div>}
              <div className="flex flex-col gap-2 text-sm text-blue-600 items-end">
                {message.filenames.map((file, index) => (
                  <div key={index} className="text-xs text-gray-500 items-end flex justify-end">
                    {file}
                  </div>
                ))}
              </div>
            </div>
          )}
          {message.sender === 'bot' && (
            <div className="flex flex-col space-y-4 mt-1 ml-2 max-w-[90%]">
              {/* 参考文献部分 */}
              {message.references && message.references.length > 0 && (
                <div className="flex flex-col space-y-1 text-gray-500 text-sm">
                  <div className="flex items-center space-x-1">
                    {/* <Link2 className="w-4 h-4" /> */}
                    <span>{t('references')}:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {message.references
                      .filter((ref, index, self) =>
                        self.findIndex(r => r.title === ref.title) === index
                      )
                      .map((ref, index) => (
                        <a
                          key={index}
                          href="javascript:void(0);"
                          // target="_blank"
                          onClick={async () => {
                            console.log(ref)
                            const pdfData = await handleGetPDF(ref.content, ref.collection_name)
                            try {
                              const pdfWindow = window.open('', '_blank');
                              if (pdfWindow) {
                                pdfWindow.document.title = `${ref.title}`;
                                pdfWindow.document.write(
                                  `<html><head><title>${ref.title}</title></head><body style="margin:0;padding:0"><iframe width='100%' height='100%' src='data:application/pdf;base64,${pdfData}' style="border:none"></iframe></body></html>`
                                );
                                pdfWindow.document.close();
                              } else {
                                const downloadLink = document.createElement('a');
                                downloadLink.href = `data:application/pdf;base64,${base64Data}`;
                                downloadLink.download = `${ref.title}.pdf`;
                                document.body.appendChild(downloadLink);
                                downloadLink.click();
                                setTimeout(() => {
                                  document.body.removeChild(downloadLink);
                                }, 100);
                              }
                            } catch (error) {
                              console.error('PDF打开失败:', error);
                              alert('PDF打开失败，请检查浏览器设置或联系管理员');
                            }
                          }}
                          rel="noopener noreferrer"
                          className="text-blue-600 block w-full"
                        >
                          {ref.title}
                        </a>
                      ))}
                  </div>
                </div>
              )}
              {/* 反馈按钮 */}
              <div className="flex space-x-2 mt-1 ml-2">
                <button
                  // onClick={() => navigator.clipboard.writeText(message.content)}
                  onClick={() => {
                    // 通过ref获取渲染后的文本
                    const renderedElement = messageRefs.current[message.id];
                    const renderedContent = renderedElement?.textContent || '';
                    navigator.clipboard.writeText(renderedContent);
                  }}
                  className="p-1 rounded hover:bg-gray-100"
                  title={t('copyMessage')}
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleFeedback(message.id, true)}
                  className={cn(
                    "p-1 rounded hover:bg-gray-100",
                    message.feedback === 'positive' && "text-green-600"
                  )}
                  title={t('helpful')}
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleFeedback(message.id, false)}
                  className={cn(
                    "p-1 rounded hover:bg-gray-100",
                    message.feedback === 'negative' && "text-red-600"
                  )}
                  title={t('notHelpful')}
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      <div className="flex-col space-y-2">
        {/* 当前推理过程 */}
        {isReasoning && percentage !== 100 && percentage !== -1 && (
          <div className="flex justify-start">
            <div className="bg-gray-200 rounded-lg p-3 max-w-[70%] w-full">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">{t('thinking')}</div>
                <div className="w-24 bg-gray-300 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${percentage}%`,
                      animation: isReasoning ? 'pulse 1.5s infinite' : 'none'
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500">{percentage}%</span>
              </div>
            </div>
          </div>
        )}

        {/* 正常回复 */}
        {displayedMessage && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 max-w-[70%]">
              <div className="text-sm text-gray-800 whitespace-pre-wrap">
                <ErrorBoundary
                  fallback={(
                    <div className="text-sm text-gray-800 whitespace-pre-wrap">
                      {displayedMessage}
                    </div>
                  )}
                >
                  <MarkdownContent content={displayedMessage} />
                </ErrorBoundary>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* <div ref={messagesEndRef} /> */}
    </div>
  );
}