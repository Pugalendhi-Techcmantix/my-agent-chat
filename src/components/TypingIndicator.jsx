import { Bot } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-start gap-4 animate-fade-in">
      {/* Bot Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs ring-2 ring-indigo-50">
        <Bot className="w-4 h-4" />
      </div>

      {/* Typing Bubble */}
      <div className="flex items-center gap-2 py-1.5">
        <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 border border-slate-200/60 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-indigo-600 dot-1"></span>
          <span className="w-2 h-2 rounded-full bg-indigo-600 dot-2"></span>
          <span className="w-2 h-2 rounded-full bg-indigo-600 dot-3"></span>
          <span className="text-xs text-slate-500 font-medium ml-1">Thinking...</span>
        </div>
      </div>
    </div>
  );
}
