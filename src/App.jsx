import { useState, useRef, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DocsView from "./components/DocsView";
import WelcomeScreen from "./components/WelcomeScreen";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import TypingIndicator from "./components/TypingIndicator";
import SetupModal from "./components/SetupModal";
import { useChat } from "./hooks/useChat";
import { useTheme } from "./hooks/useTheme";
import { isWebhookConfigured } from "./services/n8nService";
import { AlertTriangle, ArrowRight, ArrowDown } from "lucide-react";

export default function App() {
  const { isDark, toggleTheme } = useTheme();

  // State to control Docs side panel visibility
  const [showDocs, setShowDocs] = useState(false);
  const openDocs = () => setShowDocs(true);
  const closeDocs = () => setShowDocs(false);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("sidebar_collapsed_pref") === "true";
    } catch {
      return false;
    }
  });
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const mainScrollRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const isNearBottomRef = useRef(true);

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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isLoading]);

  const scrollToBottom = useCallback((behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({
      behavior,
      block: "end",
    });
  }, []);

  const handleMessagesScroll = useCallback(() => {
    const container = mainScrollRef.current;

    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    const isNearBottom = distanceFromBottom < 120;

    isNearBottomRef.current = isNearBottom;
    setShowScrollButton(!isNearBottom);
  }, []);

  useEffect(() => {
    if (isNearBottomRef.current) {
      scrollToBottom("smooth");
    }
  }, [messages.length, isLoading, scrollToBottom]);

  const toggleSidebar = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarMobileOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem("sidebar_collapsed_pref", String(next));
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
        localStorage.setItem("sidebar_collapsed_pref", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return (
    <div className="flex h-screen w-full bg-white dark:bg-[#212121] text-slate-800 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-200">
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
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative bg-white dark:bg-[#212121] transition-colors duration-200">
        {/* Header */}
        <Header
          activeChatTitle={activeConversation?.title}
          onToggleSidebar={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
          onNewChat={newChat}
          onClearActiveChat={clearActiveChat}
          hasMessages={hasMessages}
          onOpenSetup={() => setSetupModalOpen(true)}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onShowDocs={openDocs}
        />

        {/* Warning notification banner if webhook URL is missing */}
        {!isConfigured && (
          <div className="bg-amber-50/90 dark:bg-amber-950/40 border-b border-amber-200/80 dark:border-amber-900/50 px-4 py-2 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2 truncate">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="truncate">
                <strong>Webhook required:</strong> Set{" "}
                <code className="font-mono bg-amber-100/80 dark:bg-amber-900/60 px-1 py-0.5 rounded">
                  VITE_N8N_WEBHOOK_URL
                </code>{" "}
                in{" "}
                <code className="font-mono bg-amber-100/80 dark:bg-amber-900/60 px-1 py-0.5 rounded">
                  .env
                </code>{" "}
                to connect your AI assistant.
              </span>
            </div>
            <button
              onClick={() => setSetupModalOpen(true)}
              type="button"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold inline-flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <span>Setup Guide</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Scrollable Conversation Container */}
        {/* <main className="flex-1 overflow-y-auto flex flex-col"> */}
        <main
          ref={mainScrollRef}
          onScroll={handleMessagesScroll}
          className="relative flex-1 overflow-y-auto flex flex-col"
        >
          {!hasMessages ? (
            <WelcomeScreen
              onSelectPrompt={(prompt) => sendMessage(prompt, null)}
            />
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

          {!isLoading && showScrollButton && hasMessages && (
            <button
              type="button"
              onClick={() => scrollToBottom("smooth")}
              aria-label="Scroll to latest message"
              title="Scroll to latest message"
              className="
  fixed bottom-30 left-[calc(50%+110px)] -translate-x-1/2 z-30
  flex h-7 w-7 items-center justify-center
  rounded-full border border-slate-200
  bg-white text-slate-700 shadow-lg
  transition-all duration-200
  hover:scale-105 hover:bg-slate-50
  dark:border-slate-600 dark:bg-[#303030]
  dark:text-slate-100 dark:hover:bg-[#3a3a3a]
  focus:outline-none focus:ring-2
  focus:ring-indigo-500 cursor-pointer
"
            >
              <ArrowDown size={18} strokeWidth={2.2} />
            </button>
          )}
        </main>

        {/* Docs side panel (slides in from right) */}
        {showDocs && <DocsView onClose={closeDocs} />}

        {/* Fixed Message Composer at Bottom */}
        <footer className="shrink-0 bg-linear-to-t from-white via-white/95 to-transparent dark:from-[#212121] dark:via-[#212121]/95 dark:to-transparent pt-2 transition-colors duration-200">
          <ChatInput
            onSendMessage={(text, file) => sendMessage(text, file)}
            onStop={stopGenerating}
            isLoading={isLoading}
            placeholder={
              !isConfigured
                ? "Configure n8n webhook in .env to chat..."
                : "Ask anything or paste text..."
            }
          />
        </footer>
      </div>

      {/* Setup Guide & Diagnostics Modal */}
      <SetupModal
        isOpen={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
      />
    </div>
  );
}
