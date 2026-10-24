import { useState, useRef, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import WelcomeScreen from './components/WelcomeScreen';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import TypingIndicator from './components/TypingIndicator';
import SetupModal from './components/SetupModal';
import { useChat } from './hooks/useChat';
import { isWebhookConfigured } from './services/n8nService';
import { AlertTriangle, ArrowRight } from 'lucide-react';

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar_collapsed_pref') === 'true';
    } catch {
      return false;
    }
  });
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const {
    conversations,
    activeChatId,
    activeConversation,
    isLoading,
    sendMessage,
    stopGenerating,
    retryMessage,
    newChat,
    selectChat,
    deleteChat,
    clearActiveChat,
    clearAllChats,
  } = useChat();

  const isConfigured = isWebhookConfigured();
  const messages = activeConversation?.messages || [];
  const hasMessages = messages.length > 0;

  // Auto-scroll to latest message or typing indicator
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isLoading]);

  const toggleSidebar = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarMobileOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem('sidebar_collapsed_pref', String(next));
        } catch {
          // ignore
        }
        return next;
      });
    }
  }, []);

  const toggleCollapse = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar_collapsed_pref', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return (
    <div className="flex h-screen w-full bg-white text-slate-800 overflow-hidden font-sans">
      {/* Sidebar (Full w-64 or Icon-level w-16 on md/lg) */}
      <Sidebar
        conversations={conversations}
        activeChatId={activeChatId}
        onSelectChat={selectChat}
        onNewChat={newChat}
        onDeleteChat={deleteChat}
        onClearAllChats={clearAllChats}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleCollapse}
        isMobileOpen={sidebarMobileOpen}
        onCloseMobile={() => setSidebarMobileOpen(false)}
        onOpenSetup={() => setSetupModalOpen(true)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative bg-white">
        {/* Header */}
        <Header
          activeChatTitle={activeConversation?.title}
          onToggleSidebar={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
          onNewChat={newChat}
          onClearActiveChat={clearActiveChat}
          hasMessages={hasMessages}
          onOpenSetup={() => setSetupModalOpen(true)}
        />

        {/* Warning notification banner if webhook URL is missing */}
        {!isConfigured && (
          <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 py-2 text-xs text-amber-800 flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2 truncate">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="truncate">
                <strong>Webhook required:</strong> Set <code className="font-mono bg-amber-100/80 px-1 py-0.5 rounded">VITE_N8N_WEBHOOK_URL</code> in <code className="font-mono bg-amber-100/80 px-1 py-0.5 rounded">.env</code> to connect your AI assistant.
              </span>
            </div>
            <button
              onClick={() => setSetupModalOpen(true)}
              type="button"
              className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <span>Setup Guide</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Scrollable Conversation Container */}
        <main className="flex-1 overflow-y-auto flex flex-col">
          {!hasMessages ? (
            <WelcomeScreen onSelectPrompt={(prompt) => sendMessage(prompt)} />
          ) : (
            <div className="py-4 space-y-2">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onRetry={() => retryMessage(message.id)}
                />
              ))}

              {isLoading && <TypingIndicator />}

              {/* Anchor for auto-scroll */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* Fixed Message Composer at Bottom */}
        <footer className="shrink-0 bg-linear-to-t from-white via-white/95 to-transparent pt-2">
          <ChatInput
            onSendMessage={sendMessage}
            onStop={stopGenerating}
            isLoading={isLoading}
            placeholder={
              !isConfigured
                ? 'Configure n8n webhook in .env to chat...'
                : 'Ask anything or paste text...'
            }
          />
        </footer>
      </div>

      {/* Setup Guide & Diagnostics Modal */}
      <SetupModal isOpen={setupModalOpen} onClose={() => setSetupModalOpen(false)} />
    </div>
  );
}
