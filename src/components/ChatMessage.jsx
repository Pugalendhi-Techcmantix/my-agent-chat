import { useState } from 'react';
import { Bot, Copy, Check, RotateCcw, AlertCircle, Paperclip, FileText, Image, FileCode, FileAudio, FileVideo, File } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import { formatTime } from '../utils/helpers';

/** Returns the right icon for an attachment MIME type */
function AttachmentIcon({ type, className }) {
  if (!type) return <File className={className} />;
  if (type.startsWith('image/')) return <Image className={className} />;
  if (type.startsWith('audio/')) return <FileAudio className={className} />;
  if (type.startsWith('video/')) return <FileVideo className={className} />;
  if (type.includes('pdf') || type.includes('word') || type.includes('text')) return <FileText className={className} />;
  if (type.includes('javascript') || type.includes('json') || type.includes('xml') || type.includes('html') || type.includes('css')) return <FileCode className={className} />;
  return <File className={className} />;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ChatMessage({ message, onRetry }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isError = message.status === 'error';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  if (isUser) {
    return (
      <div className="group w-full max-w-3xl mx-auto px-4 sm:px-6 py-2 flex justify-end animate-fade-in">
        <div className="flex flex-col items-end max-w-[85%] sm:max-w-[72%] gap-1.5">
          {/* Attachment badge (shown above the text bubble) */}
          {message.attachment && (
            <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-[#383838] border border-slate-200 dark:border-[#4a4a4a] rounded-xl px-3 py-2 self-end">
              <div className="w-7 h-7 rounded-md bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center shrink-0">
                <AttachmentIcon type={message.attachment.type} className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-slate-800 dark:text-slate-200 truncate max-w-40">
                  {message.attachment.name}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Paperclip className="w-2.5 h-2.5" />
                  {formatBytes(message.attachment.size)}
                </p>
              </div>
            </div>
          )}

          {/* User text bubble (only when there is actual text beyond the file-only sentinel) */}
          {message.content && !message.content.startsWith('📎 ') && (
            <div className="bg-slate-100 dark:bg-[#2f2f2f] hover:bg-slate-200/70 dark:hover:bg-[#383838] text-slate-900 dark:text-slate-100 rounded-3xl rounded-br-md px-5 py-3 text-[15px] leading-relaxed shadow-2xs whitespace-pre-wrap wrap-break-word border border-slate-200/60 dark:border-[#3a3a3a] transition-colors">
              {message.content}
            </div>
          )}

          {/* Timestamp */}
          <span className="text-[11px] text-slate-400 dark:text-slate-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    );
  }

  // Assistant Message
  return (
    <div className="group w-full max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-start gap-4 animate-fade-in">
      {/* Bot Avatar (Sticky so it stays visible during long scroll) */}
      <div
        className={`sticky top-20 w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-xs ring-2 ${
          isError
            ? 'bg-rose-500 text-white ring-rose-100 dark:ring-rose-950'
            : 'bg-linear-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white ring-indigo-50 dark:ring-indigo-950'
        }`}
      >
        {isError ? <AlertCircle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0">
        {isError ? (
          <div className="bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200/90 dark:border-rose-900/60 rounded-2xl p-4 text-rose-900 dark:text-rose-200 shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm space-y-1">
                <div className="font-semibold text-rose-800 dark:text-rose-300">Connection or Workflow Error</div>
                <p className="text-rose-700 dark:text-rose-300 text-xs leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                {onRetry && (
                  <div className="pt-2">
                    <button
                      onClick={onRetry}
                      type="button"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#252525] border border-rose-200 dark:border-rose-800/80 hover:bg-rose-100/60 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-medium shadow-2xs transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry Request</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-slate-900 dark:text-slate-100 leading-relaxed text-[15px]">
              <MarkdownRenderer content={message.content} />
            </div>

            {/* Action Bar (Copy, Retry, Timestamp) */}
            <div className="flex items-center gap-2 pt-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                type="button"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2c2c2c] text-xs font-medium transition-colors cursor-pointer"
                title="Copy response"
                aria-label="Copy response"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Copy</span>
                  </>
                )}
              </button>

              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
