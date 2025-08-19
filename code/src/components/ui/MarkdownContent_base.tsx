import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../utils';
import type { Components } from 'react-markdown';

interface MarkdownContentProps {
    content: string;
    className?: string;
}

export default function MarkdownContent({ content, className }: MarkdownContentProps) {
    return (
        <div className={cn('prose prose-sm max-w-none whitespace-pre-wrap break-words', className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // 自定义代码块样式
                    code: ({ className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return (
                            <code
                                className={cn(
                                    'bg-gray-100 rounded px-1 py-0.5',
                                    !match && 'text-sm',
                                    match && 'block p-4 my-2',
                                    className
                                )}
                                {...props}
                            >
                                {children}
                            </code>
                        );
                    },
                    // 自定义链接样式
                    a: ({ children, ...props }) => (
                        <a
                            className="text-blue-600 hover:text-blue-800 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                            {...props}
                        >
                            {children}
                        </a>
                    ),
                    // 自定义表格样式
                    table: ({ children, ...props }) => (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200" {...props}>
                                {children}
                            </table>
                        </div>
                    ),
                    // 自定义列表样式
                    ul: ({ children, ...props }) => (
                        <ul className="list-disc pl-4 space-y-1" {...props}>
                            {children}
                        </ul>
                    ),
                    ol: ({ children, ...props }) => (
                        <ol className="list-decimal pl-4 space-y-1" {...props}>
                            {children}
                        </ol>
                    ),
                } as Components}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
} 