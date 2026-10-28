import { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowUp,
  ArrowDown,
  Paperclip,
  Square,
  X,
  FileText,
  Image,
  FileCode,
  FileAudio,
  FileVideo,
  File,
} from "lucide-react";

/** Returns the right icon component for a MIME type */
function FileIcon({ type, className }) {
  if (!type) return <File className={className} />;
  if (type.startsWith("image/")) return <Image className={className} />;
  if (type.startsWith("audio/")) return <FileAudio className={className} />;
  if (type.startsWith("video/")) return <FileVideo className={className} />;
  if (type.includes("pdf") || type.includes("word") || type.includes("text"))
    return <FileText className={className} />;
  if (
    type.includes("javascript") ||
    type.includes("json") ||
    type.includes("xml") ||
    type.includes("html") ||
    type.includes("css")
  )
    return <FileCode className={className} />;
  return <File className={className} />;
}

/** Human-readable file size */
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ChatInput({
  onSendMessage,
  onStop,
  isLoading,
  placeholder,
}) {
  const [attachment, setAttachment] = useState(null); // File | null
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [input, setInput] = useState("");

  // Handle pasting images (e.g., screenshots) from the clipboard
  const handlePaste = (e) => {
    const items = e?.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      // We only care about file items that are images
      if (item.kind === "file" && item.type && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          setAttachment(file);
          // Prevent the default paste behavior which would insert binary data as text
          e.preventDefault();
          break;
        }
      }
    }
  };

  // Auto-resize textarea height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, 180);
    textarea.style.height = `${Math.max(newHeight, 44)}px`;
  }, [input]);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (isLoading) {
      onStop?.();
      return;
    }

    const trimmed = input.trim();

    // Require a message or an attachment
    if (!trimmed && !attachment) {
      textareaRef.current?.focus();
      return;
    }

    onSendMessage(trimmed, attachment);

    setInput("");
    setAttachment(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
    }

    // Focus after React updates
    setTimeout(() => {
      if (!isLoading) {
        textareaRef.current?.focus();
      }
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed.");
      e.target.value = "";
      return;
    }

    setAttachment(file);
    e.target.value = "";
  };

  const removeAttachment = () => setAttachment(null);

  const canSend =
    (input.trim().length > 0 || attachment !== null) && !isLoading;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 sm:pb-6">
      {/* Stop Generating Pill */}
      {isLoading && onStop && (
        <div className="flex justify-center mb-2.5 animate-fade-in">
          <button
            onClick={onStop}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#282828] border border-slate-200/90 dark:border-[#3a3a3a] hover:bg-slate-50 dark:hover:bg-[#333333] text-slate-700 dark:text-slate-200 text-xs font-medium shadow-xs transition-all cursor-pointer"
          >
            <Square className="w-3 h-3 fill-slate-700 dark:fill-slate-200 text-slate-700 dark:text-slate-200" />
            <span>Stop generating</span>
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="relative bg-white dark:bg-[#2f2f2f] border border-slate-200/90 dark:border-[#3a3a3a] rounded-3xl shadow-sm hover:shadow-md focus-within:shadow-md focus-within:border-slate-300 dark:focus-within:border-[#4a4a4a] transition-all duration-200"
      >
        {/* Attachment preview strip (shown above the textarea) */}
        {attachment && (
          <div className="px-4 pt-3 pb-1">
            <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-[#383838] border border-slate-200 dark:border-[#4a4a4a] rounded-xl px-3 py-2 max-w-full group relative">
              {/* Thumbnail for images, icon for others */}
              {attachment.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(attachment)}
                  alt={attachment.name}
                  className="w-8 h-8 rounded-md object-cover shrink-0 border border-slate-200 dark:border-[#555]"
                />
              ) : (
                <div className="w-8 h-8 rounded-md bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center shrink-0">
                  <FileIcon
                    type={attachment.type}
                    className="w-4 h-4 text-indigo-600 dark:text-indigo-400"
                  />
                </div>
              )}

              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate max-w-45">
                  {attachment.name}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  {formatBytes(attachment.size)}
                </p>
              </div>

              {/* Remove file button */}
              <button
                type="button"
                onClick={removeAttachment}
                className="ml-1 p-0.5 rounded-full text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                title="Remove attachment"
                aria-label="Remove attachment"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Input Row */}
        <div className="flex items-end px-3 py-2 gap-2">
          {/* Attachment Button — triggers hidden file input */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Select file to attach"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                attachment
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#383838]"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Attach a file (sent as multipart/form-data)"
              aria-label="Attach file"
            >
              <Paperclip className="w-4 h-4" />
            </button>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            onPaste={handlePaste}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={
              attachment
                ? "Add a message (optional)..."
                : placeholder || "Ask anything or paste text..."
            }
            rows={1}
            className="flex-1 max-h-45 py-2 px-1 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-transparent resize-none focus:outline-hidden text-[14.5px] leading-relaxed disabled:opacity-60"
          />

          {/* Send / Stop Button */}
          {isLoading ? (
            <button
              onClick={onStop}
              type="button"
              className="w-8 h-8 rounded-full mb-1 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 transition-all flex items-center justify-center shrink-0 shadow-2xs cursor-pointer active:scale-95"
              title="Stop generating"
            >
              <Square className="w-3 h-3 fill-white dark:fill-slate-900" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!canSend}
              className={`w-8 h-8 rounded-full mb-1 transition-all duration-200 flex items-center justify-center shrink-0 ${
                canSend
                  ? "bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 shadow-2xs cursor-pointer active:scale-95"
                  : "bg-slate-100 dark:bg-[#383838] text-slate-300 dark:text-slate-600 cursor-not-allowed"
              }`}
              title="Send message (Enter)"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </form>

      {/* Footer Disclaimer */}
      <div className="flex items-center justify-center gap-1.5 mt-2 text-[11.5px] text-slate-400 dark:text-slate-500">
        <span>
          Powered by custom n8n workflow. Files are sent as multipart/form-data.
        </span>
      </div>
    </div>
  );
}
