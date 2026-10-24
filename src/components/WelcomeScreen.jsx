import { Sparkles, Lightbulb, FileText, Code2 } from 'lucide-react';

const SUGGESTIONS = [
  {
    icon: Sparkles,
    title: 'Summarize Information',
    prompt: 'Summarize the key takeaways and actionable insights from our latest project notes.',
  },
  {
    icon: FileText,
    title: 'Draft a Professional Email',
    prompt: 'Draft a polite follow-up email to a client regarding our upcoming project deliverable.',
  },
  {
    icon: Code2,
    title: 'Write a Code Snippet',
    prompt: 'Write a JavaScript function to debounce an API call with clean error handling.',
  },
  {
    icon: Lightbulb,
    title: 'Brainstorm Ideas',
    prompt: 'Brainstorm 5 innovative marketing ideas for launching a new developer tool.',
  },
];

export default function WelcomeScreen({ onSelectPrompt }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-3xl mx-auto w-full animate-fade-in select-none">
      {/* AI Assistant Icon with soft glowing aura */}
      <div className="relative mb-6">
        <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-xl"></div>
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-4 ring-white">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>
      </div>

      {/* Heading & Subtitle */}
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-2.5">
        How can I help you today?
      </h1>
      <p className="text-slate-500 text-sm sm:text-base max-w-md mb-8 leading-relaxed">
        Connect to your custom n8n AI workflow to answer questions, process documents, or automate tasks.
      </p>

      {/* Clickable Suggested Prompt Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
        {SUGGESTIONS.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => onSelectPrompt(item.prompt)}
              type="button"
              className="group p-4 bg-white hover:bg-slate-50/90 border border-slate-200/80 hover:border-slate-300 rounded-2xl shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer text-left flex flex-col justify-between"
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-semibold text-slate-800 text-xs sm:text-sm tracking-tight">
                  {item.title}
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {item.prompt}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
