import { useState } from 'react';
import { Bot, Copy, Check, RotateCcw, AlertCircle } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import { formatTime } from '../utils/helpers';

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
        <div className="flex flex-col items-end max-w-[85%] sm:max-w-[72%]">
          {/* User Bubble */}
          <div className="bg-slate-100 hover:bg-slate-200/70 text-slate-900 rounded-3xl rounded-br-md px-5 py-3 text-[15px] leading-relaxed shadow-2xs whitespace-pre-wrap wrap-break-word border border-slate-200/60 transition-colors">
            {message.content}
          </div>
          {/* Timestamp */}
          <span className="text-[11px] text-slate-400 mt-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
            ? 'bg-rose-500 text-white ring-rose-100'
            : 'bg-linear-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white ring-indigo-50'
        }`}
      >
        {isError ? <AlertCircle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0">
        {isError ? (
          <div className="bg-rose-50/90 border border-rose-200/90 rounded-2xl p-4 text-rose-900 shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm space-y-1">
                <div className="font-semibold text-rose-800">Connection or Workflow Error</div>
                <p className="text-rose-700 text-xs leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                {onRetry && (
                  <div className="pt-2">
                    <button
                      onClick={onRetry}
                      type="button"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-rose-200 hover:bg-rose-100/60 text-rose-700 text-xs font-medium shadow-2xs transition-colors cursor-pointer"
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
            <div className="text-slate-900 leading-relaxed text-[15px]">
              <MarkdownRenderer content={message.content} />
            </div>

            {/* Action Bar (Copy, Retry, Timestamp) */}
            <div className="flex items-center gap-2 pt-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                type="button"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors cursor-pointer"
                title="Copy response"
                aria-label="Copy response"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold text-[11px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Copy</span>
                  </>
                )}
              </button>

              <span className="text-[11px] text-slate-400">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
