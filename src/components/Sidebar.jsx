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
        className={`fixed md:static inset-y-0 left-0 z-50 bg-slate-50 border-r border-slate-200/80 flex flex-col shrink-0 transition-all duration-200 ease-in-out ${
          // Mobile drawer logic
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
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 transition-colors cursor-pointer"
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
                className="w-10 h-10 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200/90 shadow-2xs flex items-center justify-center transition-all cursor-pointer hover:border-slate-300 active:scale-95"
                title="New chat"
                aria-label="New chat"
              >
                <Plus className="w-4 h-4 text-slate-700 stroke-[2.5]" />
              </button>
            </div>

            {/* Divider */}
            <div className="w-8 h-px bg-slate-200/80 mb-3" />

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
                        ? 'bg-slate-200/90 text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-800'
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
            <div className="w-8 h-px bg-slate-200/80 my-2" />

            {/* Footer Icon: Webhook Status / Setup */}
            <div className="flex flex-col items-center gap-2 pt-1">
              <button
                onClick={onOpenSetup}
                type="button"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer border ${
                  configured
                    ? 'border-emerald-200/80 bg-white text-emerald-600 hover:bg-emerald-50'
                    : 'border-amber-200/90 bg-amber-50 text-amber-600 hover:bg-amber-100'
                }`}
                title={configured ? 'Webhook Connected (Click for details)' : 'Setup Webhook Required'}
                aria-label="Webhook Status"
              >
                {configured ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
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
          <div className="p-3.5 flex items-center justify-between border-b border-slate-200/60 bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 tracking-tight leading-none">AgentIQ</div>
                <div className="text-[10.5px] font-medium text-slate-500 mt-1 flex items-center gap-1">
                  <span>AI Assistant</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Desktop Collapse Button */}
              <button
                onClick={onToggleCollapse}
                type="button"
                className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>

              {/* Mobile Close Button */}
              <button
                onClick={onCloseMobile}
                type="button"
                className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
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
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white hover:bg-slate-100/90 text-slate-800 font-medium text-xs border border-slate-200/90 shadow-2xs transition-all cursor-pointer hover:border-slate-300"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-slate-600 stroke-[2.5]" />
                <span>New chat</span>
              </div>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] text-slate-400 bg-slate-100 rounded border border-slate-200 font-mono">
                /
              </kbd>
            </button>
          </div>

          {/* Chat History List */}
          <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4">
            {conversations.length === 0 ? (
              <div className="text-center py-10 px-4 text-xs text-slate-400">
                <MessageSquare className="w-6 h-6 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                <p className="font-medium text-slate-500 text-[11px]">No chats yet</p>
              </div>
            ) : (
              Object.entries(grouped).map(([groupName, chats]) => (
                <div key={groupName} className="space-y-0.5">
                  <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    {groupName}
                  </div>
                  {chats.map((chat) => {
                    const isActive = chat.id === activeChatId;
                    return (
                      <div
                        key={chat.id}
                        className={`group relative flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-all cursor-pointer ${
                          isActive
                            ? 'bg-slate-200/80 text-slate-900 font-medium shadow-2xs'
                            : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                        }`}
                        onClick={() => {
                          onSelectChat(chat.id);
                          if (window.innerWidth < 768 && onCloseMobile) onCloseMobile();
                        }}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1 pr-1">
                          <MessageSquare
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isActive ? 'text-slate-700' : 'text-slate-400'
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
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
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
          <div className="p-2.5 border-t border-slate-200/70 space-y-1.5 bg-slate-50">
            {/* Status card */}
            <div
              onClick={onOpenSetup}
              className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                configured
                  ? 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-100/70'
                  : 'bg-amber-50/70 border-amber-200/90 text-amber-900 hover:bg-amber-100/60'
              }`}
              title="Click to view n8n configuration"
            >
              <div className="flex items-center gap-2 min-w-0">
                {configured ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                )}
                <div className="truncate">
                  <div className="font-semibold text-[11px] leading-tight">
                    {configured ? 'n8n Webhook' : 'Setup Required'}
                  </div>
                  <div className="text-[9.5px] text-slate-400">
                    {configured ? 'Online & ready' : 'Configure URL'}
                  </div>
                </div>
              </div>
              <Settings2 className="w-3.5 h-3.5 shrink-0 text-slate-400 hover:text-slate-600" />
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
                className="w-full flex items-center justify-center gap-1.5 px-2 py-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50/60 text-[11px] font-medium transition-colors cursor-pointer"
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
