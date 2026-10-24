import {
  Bot,
  Plus,
  MessageSquare,
  Trash2,
  X,
  Settings2,
  CheckCircle2,
  AlertTriangle,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
} from 'lucide-react';
import { formatChatGroupDate } from '../utils/helpers';
import { isWebhookConfigured } from '../services/n8nService';

export default function Sidebar({
  conversations,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onClearAllChats,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onOpenSetup,
  isDark,
  onToggleTheme,
}) {
  const configured = isWebhookConfigured();

  // Group conversations by relative date
  const grouped = conversations.reduce((acc, chat) => {
    const groupKey = formatChatGroupDate(chat.updatedAt || chat.createdAt);
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(chat);
    return acc;
  }, {});

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 bg-slate-50 dark:bg-[#171717] border-r border-slate-200/80 dark:border-[#262626] flex flex-col shrink-0 transition-all duration-200 ease-in-out ${
          isMobileOpen
            ? 'translate-x-0 w-64'
            : '-translate-x-full md:translate-x-0 ' + (isCollapsed ? 'md:w-16' : 'md:w-64')
        }`}
      >
        {/* =========================================
            COLLAPSED VIEW (Desktop Icon-Level Rail)
           ========================================= */}
        {isCollapsed ? (
          <div className="hidden md:flex flex-col h-full w-16 items-center py-3 select-none">
            {/* Top Toggle Button */}
            <div className="mb-3">
              <button
                onClick={onToggleCollapse}
                type="button"
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-[#262626] transition-colors cursor-pointer"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen className="w-5 h-5" />
              </button>
            </div>

            {/* New Chat Icon Button */}
            <div className="mb-4">
              <button
                onClick={onNewChat}
                type="button"
                className="w-10 h-10 rounded-xl bg-white dark:bg-[#212121] hover:bg-slate-100 dark:hover:bg-[#282828] text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-[#333] shadow-2xs flex items-center justify-center transition-all cursor-pointer hover:border-slate-300 dark:hover:border-[#444] active:scale-95"
                title="New chat"
                aria-label="New chat"
              >
                <Plus className="w-4 h-4 text-slate-700 dark:text-slate-200 stroke-[2.5]" />
              </button>
            </div>

            {/* Divider */}
            <div className="w-8 h-px bg-slate-200/80 dark:bg-[#2a2a2a] mb-3" />

            {/* Collapsed Chat History Icons */}
            <div className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col items-center space-y-1.5 px-2">
              {conversations.map((chat) => {
                const isActive = chat.id === activeChatId;
                return (
                  <button
                    key={chat.id}
                    onClick={() => onSelectChat(chat.id)}
                    type="button"
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 relative group ${
                      isActive
                        ? 'bg-slate-200/90 dark:bg-[#2a2a2a] text-slate-900 dark:text-white shadow-2xs font-semibold'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-[#222222] hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                    title={chat.title || 'Conversation'}
                    aria-label={chat.title || 'Conversation'}
                  >
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    {/* Active indicator dot */}
                    {isActive && (
                      <span className="absolute left-1 w-1 h-3 rounded-full bg-indigo-600" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="w-8 h-px bg-slate-200/80 dark:bg-[#2a2a2a] my-2" />

            {/* Theme Toggle Button (Collapsed) */}
            <button
              onClick={onToggleTheme}
              type="button"
              className="w-10 h-10 rounded-xl mb-1.5 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-amber-400 hover:bg-slate-200/70 dark:hover:bg-[#262626] transition-colors cursor-pointer"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Footer Icon: Webhook Status / Setup */}
            <div className="flex flex-col items-center gap-2 pt-1">
              <button
                onClick={onOpenSetup}
                type="button"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer border ${
                  configured
                    ? 'border-emerald-200/80 dark:border-emerald-900/60 bg-white dark:bg-[#212121] text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                    : 'border-amber-200/90 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100'
                }`}
                title={configured ? 'Webhook Connected' : 'Setup Webhook Required'}
                aria-label="Webhook Status"
              >
                {configured ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                )}
              </button>
            </div>
          </div>
        ) : null}

        {/* =========================================
            EXPANDED VIEW (Full Desktop & Mobile Drawer)
           ========================================= */}
        <div className={`flex flex-col h-full w-64 ${isCollapsed ? 'md:hidden' : 'flex'}`}>
          {/* Brand Header */}
          <div className="p-3.5 flex items-center justify-between border-b border-slate-200/60 dark:border-[#262626] bg-slate-50 dark:bg-[#171717]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                  AgentIQ
                </div>
                <div className="text-[10.5px] font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <span>n8n Assistant</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Desktop Collapse Button */}
              <button
                onClick={onToggleCollapse}
                type="button"
                className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-[#262626] transition-colors cursor-pointer"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>

              {/* Mobile Close Button */}
              <button
                onClick={onCloseMobile}
                type="button"
                className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-[#262626]"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* New Chat Button */}
          <div className="p-3">
            <button
              onClick={() => {
                onNewChat();
                if (window.innerWidth < 768 && onCloseMobile) onCloseMobile();
              }}
              type="button"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white dark:bg-[#212121] hover:bg-slate-100/90 dark:hover:bg-[#282828] text-slate-800 dark:text-slate-200 font-medium text-xs border border-slate-200/90 dark:border-[#333] shadow-2xs transition-all cursor-pointer hover:border-slate-300 dark:hover:border-[#444]"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-slate-600 dark:text-slate-300 stroke-[2.5]" />
                <span>New chat</span>
              </div>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-[#2a2a2a] rounded border border-slate-200 dark:border-[#383838] font-mono">
                /
              </kbd>
            </button>
          </div>

          {/* Chat History List */}
          <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4">
            {conversations.length === 0 ? (
              <div className="text-center py-10 px-4 text-xs text-slate-400 dark:text-slate-500">
                <MessageSquare className="w-6 h-6 mx-auto mb-2 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                <p className="font-medium text-slate-500 dark:text-slate-400 text-[11px]">No chats yet</p>
              </div>
            ) : (
              Object.entries(grouped).map(([groupName, chats]) => (
                <div key={groupName} className="space-y-0.5">
                  <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                    {groupName}
                  </div>
                  {chats.map((chat) => {
                    const isActive = chat.id === activeChatId;
                    return (
                      <div
                        key={chat.id}
                        className={`group relative flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-all cursor-pointer ${
                          isActive
                            ? 'bg-slate-200/80 dark:bg-[#2a2a2a] text-slate-900 dark:text-white font-medium shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-[#222222] hover:text-slate-900 dark:hover:text-slate-100'
                        }`}
                        onClick={() => {
                          onSelectChat(chat.id);
                          if (window.innerWidth < 768 && onCloseMobile) onCloseMobile();
                        }}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1 pr-1">
                          <MessageSquare
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isActive ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'
                            }`}
                          />
                          <span className="truncate text-[12.5px]">{chat.title || 'New conversation'}</span>
                        </div>

                        {/* Delete Conversation action */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(chat.id);
                          }}
                          type="button"
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                          title="Delete chat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer Area */}
          <div className="p-2.5 border-t border-slate-200/70 dark:border-[#262626] space-y-1.5 bg-slate-50 dark:bg-[#171717]">
            {/* Status card */}
            <div
              onClick={onOpenSetup}
              className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                configured
                  ? 'bg-white dark:bg-[#212121] border-slate-200/80 dark:border-[#333] text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-[#282828]'
                  : 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200/90 dark:border-amber-900/60 text-amber-900 dark:text-amber-300 hover:bg-amber-100/60'
              }`}
              title="Click to view n8n configuration"
            >
              <div className="flex items-center gap-2 min-w-0">
                {configured ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                )}
                <div className="truncate">
                  <div className="font-semibold text-[11px] leading-tight">
                    {configured ? 'n8n Webhook' : 'Setup Required'}
                  </div>
                  <div className="text-[9.5px] text-slate-400 dark:text-slate-500">
                    {configured ? 'Online & ready' : 'Configure URL'}
                  </div>
                </div>
              </div>
              <Settings2 className="w-3.5 h-3.5 shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
            </div>

            {/* Clear history button (if chats exist) */}
            {conversations.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete all chat history?')) {
                    onClearAllChats();
                  }
                }}
                type="button"
                className="w-full flex items-center justify-center gap-1.5 px-2 py-1 rounded-md text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/60 dark:hover:bg-rose-950/40 text-[11px] font-medium transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear history</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
