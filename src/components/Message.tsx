import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import type { Message as MessageType } from '../types';
import { getModelConfig } from '../utils/api';

interface Props {
  message: MessageType;
}

export const Message: React.FC<Props> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const isUser = message.role === 'user';
  const model = message.model ? getModelConfig(message.model) : undefined;
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [message.content]);

  const handleCodeCopy = useCallback((code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
  }, []);

  return (
    <div className={`group animate-slide-up ${isUser ? 'flex justify-end' : ''}`}>
      <div
        className={`
          relative rounded-2xl px-3.5 sm:px-5 py-3 sm:py-3.5
          max-w-[92%] sm:max-w-[85%] md:max-w-[80%] lg:max-w-[75%]
          ${isUser
            ? 'bg-accent text-surface-900 rounded-br-md'
            : 'bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-100 rounded-bl-md'
          }
        `}
      >
        {/* Meta bar */}
        <div
          className={`flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 text-[10px] sm:text-[11px] tracking-wide uppercase font-medium ${
            isUser ? 'text-surface-900/50' : 'text-surface-400 dark:text-surface-500'
          }`}
        >
          <span>{isUser ? 'You' : model?.name || 'Assistant'}</span>
          <span className={isUser ? 'text-surface-900/25' : 'text-surface-300 dark:text-surface-600'}>·</span>
          <span>{time}</span>
        </div>

        {/* Image attachments */}
        {message.images && message.images.length > 0 && (
          <div className={`flex flex-wrap gap-2 ${message.content ? 'mb-2' : ''}`}>
            {message.images.map((img) => (
              <a
                key={img.id}
                href={`data:${img.mediaType};base64,${img.data}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src={`data:${img.mediaType};base64,${img.data}`}
                  alt={img.name || 'Attached image'}
                  className="max-w-[240px] max-h-[240px] rounded-xl object-cover border border-surface-200 dark:border-surface-700 hover:opacity-90 transition-opacity cursor-pointer"
                />
              </a>
            ))}
          </div>
        )}

        {/* Content */}
        <div
          className={`
            prose prose-sm max-w-none break-words
            ${isUser
              ? 'prose-p:text-surface-900/90 prose-a:text-surface-900 prose-strong:text-surface-900 prose-code:text-surface-900/80'
              : 'dark:prose-invert prose-p:text-surface-800 dark:prose-p:text-surface-200 prose-code:text-accent dark:prose-code:text-accent-hover'
            }
            prose-pre:bg-surface-900 prose-pre:dark:bg-surface-950
            prose-pre:rounded-xl prose-pre:border prose-pre:border-surface-200 prose-pre:dark:border-surface-700
            prose-pre:text-[13px] prose-pre:leading-relaxed
            prose-headings:mt-3 prose-headings:mb-1.5
            prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5
          `}
        >
          {isUser ? (
            message.content ? <p className="whitespace-pre-wrap m-0">{message.content}</p> : null
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                pre: ({ children, ...props }) => {
                  // Extract code text from children
                  const codeEl = React.Children.toArray(children).find(
                    (child): child is React.ReactElement => React.isValidElement(child) && child.type === 'code'
                  );
                  const codeText = codeEl?.props?.children;

                  return (
                    <div className="relative group/code">
                      <pre {...props} className="!mt-2 !mb-2 overflow-x-auto !text-[13px]">
                        {children}
                      </pre>
                      <button
                        onClick={() => {
                          if (typeof codeText === 'string') handleCodeCopy(codeText);
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 touch-show transition-opacity bg-surface-700 hover:bg-surface-600 active:bg-surface-500 text-surface-300 text-xs px-2.5 py-1.5 rounded-lg"
                      >
                        {codeCopied ? '✓' : 'Copy'}
                      </button>
                    </div>
                  );
                },
                // Make tables horizontally scrollable on mobile
                table: ({ children, ...props }) => (
                  <div className="overflow-x-auto -mx-1 sm:mx-0">
                    <table {...props}>{children}</table>
                  </div>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Copy button — visible on hover (desktop) or always present on touch */}
        <button
          onClick={handleCopy}
          className={`
            absolute -bottom-3 right-3
            opacity-0 group-hover:opacity-100 touch-show
            transition-all text-[11px] px-2.5 py-1.5 rounded-full border shadow-sm
            active:scale-95
            ${isUser
              ? 'bg-accent-dim/80 border-accent/30 text-surface-900/70 hover:text-surface-900 active:bg-accent-dim'
              : 'bg-white dark:bg-surface-700 border-surface-200 dark:border-surface-600 text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'
            }
          `}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
};
