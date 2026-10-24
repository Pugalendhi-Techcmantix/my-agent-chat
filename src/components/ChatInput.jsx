import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Paperclip, Square } from 'lucide-react';

export default function ChatInput({ onSendMessage, onStop, isLoading, placeholder }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 180);
    textarea.style.height = `${Math.max(newHeight, 44)}px`;
  }, [input]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (isLoading) {
      if (onStop) onStop();
      return;
    }

    const trimmed = input.trim();
    if (!trimmed) return;

    onSendMessage(trimmed);
    setInput('');

    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
    }
  };

  const handleKeyDown = (e) => {
    // Enter without shift sends the message
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 sm:pb-6">
      {/* Floating Stop Generating Pill when loading */}
      {isLoading && onStop && (
        <div className="flex justify-center mb-2.5 animate-fade-in">
          <button
            onClick={onStop}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-xs transition-all cursor-pointer hover:border-slate-300"
          >
            <Square className="w-3 h-3 fill-slate-700 text-slate-700" />
            <span>Stop generating</span>
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="relative bg-white border border-slate-200/90 rounded-3xl shadow-sm hover:shadow-md focus-within:shadow-md focus-within:border-slate-300 transition-all duration-200"
      >
        <div className="flex items-end px-3 py-2 gap-2">
          {/* Attachment Icon Placeholder */}
          <div className="relative group mb-0.5">
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              title="Attach file (coming soon)"
              aria-label="Attach file"
              disabled={isLoading}
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-[11px] font-medium py-1 px-2.5 rounded-md whitespace-nowrap shadow-md z-20">
              Attachments coming soon
            </span>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={placeholder || 'Ask anything or paste text...'}
            rows={1}
            className="flex-1 max-h-45 py-2 px-1 text-slate-900 placeholder-slate-400 bg-transparent resize-none focus:outline-hidden text-[14.5px] leading-relaxed disabled:opacity-60"
          />

          {/* Action Button: Send or Stop */}
          {isLoading ? (
            <button
              onClick={onStop}
              type="button"
              className="w-8 h-8 rounded-full mb-1 bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center justify-center shrink-0 shadow-2xs cursor-pointer active:scale-95"
              title="Stop generating"
              aria-label="Stop generating"
            >
              <Square className="w-3 h-3 fill-white" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className={`w-8 h-8 rounded-full mb-1 transition-all duration-200 flex items-center justify-center shrink-0 ${
                input.trim()
                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs cursor-pointer active:scale-95'
                  : 'bg-slate-150 text-slate-300 cursor-not-allowed'
              }`}
              title="Send message (Enter)"
              aria-label="Send message"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </form>

      {/* Footer Disclaimer */}
      <div className="flex items-center justify-center gap-1.5 mt-2 text-[11.5px] text-slate-400">
        <span>Powered by custom n8n workflow. Press Enter to send.</span>
      </div>
    </div>
  );
}
