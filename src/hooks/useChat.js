import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { generateId, truncate } from '../utils/helpers';
import { sendMessageToN8n, isWebhookConfigured } from '../services/n8nService';

const STORAGE_KEY_CONVERSATIONS = 'n8n_ai_conversations_v1';
const STORAGE_KEY_ACTIVE_ID = 'n8n_ai_active_chat_id_v1';

export function useChat() {
  const abortControllerRef = useRef(null);
  // Initialize conversations from localStorage or default blank
  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    const initialId = generateId('chat');
    return [
      {
        id: initialId,
        title: 'New Conversation',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
      },
    ];
  });

  const [activeChatId, setActiveChatId] = useState(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
      if (savedId) return savedId;
    } catch {
      // ignore
    }
    return conversations[0]?.id || '';
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(conversations));
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeChatId);
    } catch (err) {
      console.warn('Failed to save chat to localStorage:', err);
    }
  }, [conversations, activeChatId]);

  // Find active conversation
  const activeConversation = useMemo(() => {
    return (
      conversations.find((c) => c.id === activeChatId) ||
      conversations[0] || {
        id: 'default',
        title: 'New Conversation',
        createdAt: 0,
        updatedAt: 0,
        messages: [],
      }
    );
  }, [conversations, activeChatId]);

  // Helper to update active conversation messages
  const updateActiveMessages = useCallback(
    (updater) => {
      setConversations((prev) =>
        prev.map((chat) => {
          if (chat.id === activeChatId) {
            const newMessages = typeof updater === 'function' ? updater(chat.messages) : updater;
            return {
              ...chat,
              messages: newMessages,
              updatedAt: Date.now(),
            };
          }
          return chat;
        })
      );
    },
    [activeChatId]
  );

  // Start a new chat
  const handleNewChat = useCallback(() => {
    // If current conversation is already empty, just stay on it
    if (activeConversation.messages.length === 0) {
      return activeConversation.id;
    }

    const newChat = {
      id: generateId('chat'),
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };

    setConversations((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    return newChat.id;
  }, [activeConversation]);

  // Select an existing chat
  const handleSelectChat = useCallback((id) => {
    setActiveChatId(id);
  }, []);

  // Delete a chat
  const handleDeleteChat = useCallback(
    (idToDelete) => {
      setConversations((prev) => {
        const filtered = prev.filter((c) => c.id !== idToDelete);
        if (filtered.length === 0) {
          const fresh = {
            id: generateId('chat'),
            title: 'New Conversation',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            messages: [],
          };
          setActiveChatId(fresh.id);
          return [fresh];
        }

        if (activeChatId === idToDelete) {
          setActiveChatId(filtered[0].id);
        }
        return filtered;
      });
    },
    [activeChatId]
  );

  // Clear current active conversation messages
  const handleClearActiveChat = useCallback(() => {
    setConversations((prev) =>
      prev.map((c) => (c.id === activeChatId ? { ...c, messages: [], updatedAt: Date.now() } : c))
    );
  }, [activeChatId]);

  // Clear all conversations
  const handleClearAllChats = useCallback(() => {
    const fresh = {
      id: generateId('chat'),
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setConversations([fresh]);
    setActiveChatId(fresh.id);
  }, []);

  const stopGenerating = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  }, []);

  // Send a message
  const handleSendMessage = useCallback(
    async (text, attachment = null) => {
      const trimmed = text.trim();
      if ((!trimmed && !attachment) || isLoading) return;

      // Build display label: if only a file, use the filename
      const displayContent = trimmed || (attachment ? `📎 ${attachment.name}` : '');

      const userMessage = {
        id: generateId('msg_user'),
        role: 'user',
        content: displayContent,
        timestamp: Date.now(),
        status: 'success',
        // Store attachment meta for display (not the raw binary)
        attachment: attachment
          ? { name: attachment.name, size: attachment.size, type: attachment.type }
          : null,
      };

      // Add user message & optionally update conversation title
      setConversations((prev) =>
        prev.map((chat) => {
          if (chat.id === activeChatId) {
            const isFirstMessage = chat.messages.length === 0;
            const newTitle = isFirstMessage ? truncate(displayContent, 30) : chat.title;
            return {
              ...chat,
              title: newTitle,
              updatedAt: Date.now(),
              messages: [...chat.messages, userMessage],
            };
          }
          return chat;
        })
      );

      setIsLoading(true);

      // Check if webhook is configured
      if (!isWebhookConfigured()) {
        const errorMsg = {
          id: generateId('msg_bot'),
          role: 'assistant',
          content:
            'n8n Webhook URL is not configured. Please open the `.env` file in your project, set `VITE_N8N_WEBHOOK_URL` to your n8n webhook URL, and restart your Vite server.',
          timestamp: Date.now(),
          status: 'error',
        };
        updateActiveMessages((prev) => [...prev, errorMsg]);
        setIsLoading(false);
        return;
      }

      abortControllerRef.current = new AbortController();

      try {
        const reply = await sendMessageToN8n({
          message: trimmed || (attachment ? attachment.name : ''),
          sessionId: activeChatId,
          history: activeConversation.messages,
          attachment,
          signal: abortControllerRef.current.signal,
        });

        const botMessage = {
          id: generateId('msg_bot'),
          role: 'assistant',
          content: reply,
          timestamp: Date.now(),
          status: 'success',
        };

        updateActiveMessages((prev) => [...prev, botMessage]);
      } catch (err) {
        if (err.name === 'AbortError' || err.message?.includes('cancelled')) {
          // Stopped by user, no error card needed
          return;
        }
        const errorBotMessage = {
          id: generateId('msg_bot'),
          role: 'assistant',
          content: err.message || 'An unexpected error occurred while communicating with n8n.',
          timestamp: Date.now(),
          status: 'error',
        };
        updateActiveMessages((prev) => [...prev, errorBotMessage]);
      } finally {
        abortControllerRef.current = null;
        setIsLoading(false);
      }
    },
    [activeChatId, activeConversation.messages, isLoading, updateActiveMessages]
  );

  // Retry a failed message
  const handleRetry = useCallback(
    async (failedMessageId) => {
      const messages = activeConversation.messages;
      const failedIndex = messages.findIndex((m) => m.id === failedMessageId);
      if (failedIndex === -1) return;

      // Find the user prompt preceding this error message
      let promptToRetry = '';
      for (let i = failedIndex - 1; i >= 0; i--) {
        if (messages[i].role === 'user') {
          promptToRetry = messages[i].content;
          break;
        }
      }

      if (!promptToRetry) return;

      // Remove the failed message
      updateActiveMessages((prev) => prev.filter((m) => m.id !== failedMessageId));

      // Re-trigger sending
      handleSendMessage(promptToRetry);
    },
    [activeConversation.messages, handleSendMessage, updateActiveMessages]
  );

  return {
    conversations,
    activeChatId,
    activeConversation,
    isLoading,
    sendMessage: handleSendMessage,
    stopGenerating,
    retryMessage: handleRetry,
    newChat: handleNewChat,
    selectChat: handleSelectChat,
    deleteChat: handleDeleteChat,
    clearActiveChat: handleClearActiveChat,
    clearAllChats: handleClearAllChats,
  };
}
