import { Plus, Trash2, Settings2, PanelLeftClose, PanelLeftOpen, Sun, Moon } from 'lucide-react';
import { isWebhookConfigured } from '../services/n8nService';

export default function Header({
  activeChatTitle,
  onToggleSidebar,
  sidebarCollapsed,
  onNewChat,
  onClearActiveChat,
  hasMessages,
  onOpenSetup,
  isDark,
  onToggleTheme,
}) {
  const configured = isWebhookConfigured();

  return (
    <header className="h-14 border-b border-slate-200/80 dark:border-[#2f2f2f] bg-white/90 dark:bg-[#212121]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Left side: Sidebar Toggle + Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onToggleSidebar}
          type="button"
          className="p-1.5 -ml-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#2f2f2f] rounded-lg transition-colors cursor-pointer"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          ) : (
            <PanelLeftClose className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          )}
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
            {activeChatTitle || 'New chat'}
          </span>
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-1.5">
        {/* Status Pill */}
        <button
          onClick={onOpenSetup}
          type="button"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${
            configured
              ? 'border-emerald-200/90 bg-emerald-50/70 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100/60'
              : 'border-amber-200/90 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300 hover:bg-amber-100/60'
          }`}
          title="Webhook Connection Status & Settings"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              configured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span className="text-[11.5px] hidden sm:inline">
            {configured ? 'n8n Connected' : 'Setup Webhook'}
          </span>
          <Settings2 className="w-3 h-3 opacity-60" />
        </button>

        {/* Dark / Light Mode Toggle Button */}
        <button
          onClick={onToggleTheme}
          type="button"
          className="p-1.5 rounded-lg border border-slate-200 dark:border-[#383838] bg-white dark:bg-[#2a2a2a] text-slate-600 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-[#333333] transition-colors cursor-pointer"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Clear active chat button (visible only when there are messages) */}
        {hasMessages && (
          <button
            onClick={() => {
              if (window.confirm('Clear all messages in this conversation?')) {
                onClearActiveChat();
              }
            }}
            type="button"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
            title="Clear conversation"
            aria-label="Clear conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          type="button"
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-xs font-medium shadow-2xs transition-colors cursor-pointer"
          title="Start new conversation"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>
    </header>
  );
}
