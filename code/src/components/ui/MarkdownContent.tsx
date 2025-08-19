import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../utils';
import './MarkdownContent.css';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

// 递归替换 li 下的 p 为 span
function replacePWithSpan(children: React.ReactNode): React.ReactNode {
  return React.Children.map(children, child => {
    if (!React.isValidElement(child)) return child;
    if (child.type === 'p') {
      return <span className="inline">{replacePWithSpan(child.props.children)}</span>;
    }
    // 递归处理子节点
    if (child.props && child.props.children) {
      return React.cloneElement(child, {
        ...child.props,
        children: replacePWithSpan(child.props.children),
      });
    }
    return child;
  });
}

export default function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div className={cn('prose prose-sm max-w-none whitespace-pre-wrap break-words', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
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
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200" {...props}>
                {children}
              </table>
            </div>
          ),
          ul: ({ children, ...props }) => (
            <ul className="list-disc pl-6 space-y-2" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal pl-6 space-y-2" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="my-0" {...props}>
              {replacePWithSpan(children)}
            </li>
          ),
          // 普通 p 直接渲染
          // p: ({ children, ...props }) => (
          //   <p className="my-1" {...props}>{children}</p>
          // ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}