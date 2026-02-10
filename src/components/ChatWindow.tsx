import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useChatStore } from '../stores/chatStore';
import { Message } from './Message';
import { streamChat, getProviderForModel } from '../utils/api';
import { MODELS } from '../types';

export const ChatWindow: React.FC = () => {
  const [input, setInput] = useState('');
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    getActiveConversation,
    addMessage,
    updateMessage,
    isStreaming,
    setStreaming,
    apiKeys,
    setConversationModel,
    setConversationSystemPrompt,
    setSidebarOpen,
    setSettingsOpen,
    createConversation,
    exportConversation,
    clearConversation,
  } = useChatStore();

  const conversation = getActiveConversation();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages.length, scrollToBottom]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [input]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [menuOpen]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isStreaming) return;

    let convId = conversation?.id;
    if (!convId) {
      convId = createConversation();
    }

    const conv = useChatStore.getState().conversations.find((c) => c.id === convId)!;
    const modelId = conv.modelId;
    const provider = getProviderForModel(modelId);
    const apiKey = provider ? apiKeys[provider] : '';

    addMessage(convId, { role: 'user', content: input.trim() });
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    // Create placeholder assistant message
    addMessage(convId, { role: 'assistant', content: '', model: modelId });

    setStreaming(true);
    const abortController = new AbortController();
    abortRef.current = abortController;

    const updatedConv = useChatStore.getState().conversations.find((c) => c.id === convId)!;
    const assistantMsg = updatedConv.messages[updatedConv.messages.length - 1];
    let accumulated = '';

    await streamChat({
      messages: updatedConv.messages.slice(0, -1),
      modelId,
      apiKey,
      systemPrompt: conv.systemPrompt || undefined,
      signal: abortController.signal,
      onChunk: (text) => {
        accumulated += text;
        updateMessage(convId!, assistantMsg.id, accumulated);
      },
      onDone: () => {
        setStreaming(false);
        abortRef.current = null;
      },
      onError: (error) => {
        updateMessage(convId!, assistantMsg.id, `⚠️ Error: ${error}`);
        setStreaming(false);
        abortRef.current = null;
      },
    });
  }, [input, isStreaming, conversation, apiKeys, addMessage, updateMessage, setStreaming, createConversation]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
  }, [setStreaming]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleExport = useCallback(
    (format: 'json' | 'text') => {
      if (!conversation) return;
      const data = exportConversation(conversation.id, format);
      const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${conversation.title}.${format === 'json' ? 'json' : 'md'}`;
      a.click();
      URL.revokeObjectURL(url);
      setMenuOpen(false);
    },
    [conversation, exportConversation]
  );

  // Empty state
  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center relative">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden absolute top-4 left-4 p-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 active:scale-95 transition-all"
          aria-label="Open sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-accent-muted flex items-center justify-center mb-5 sm:mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent sm:w-7 sm:h-7"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold text-surface-900 dark:text-surface-100 mb-2">
          StickyCheese
        </h2>
        <p className="text-sm sm:text-base text-surface-500 dark:text-surface-400 mb-6 sm:mb-8 max-w-sm leading-relaxed">
          A private, client-side chat interface. Your API keys stay on your device.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto px-4 sm:px-0">
          <button
            onClick={createConversation}
            className="px-5 py-3 sm:py-2.5 bg-accent hover:bg-accent-hover active:scale-[0.98] text-surface-900 rounded-xl font-medium transition-all"
          >
            New Chat
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="px-5 py-3 sm:py-2.5 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 active:scale-[0.98] text-surface-700 dark:text-surface-300 rounded-xl font-medium transition-all"
          >
            Settings
          </button>
        </div>
      </div>
    );
  }

  const availableModels = MODELS.filter((m) => {
    if (m.provider === 'openai' && apiKeys.openai) return true;
    if (m.provider === 'anthropic' && apiKeys.anthropic) return true;
    return false;
  });

  return (
    <div className="flex-1 flex flex-col h-full min-w-0">
      {/* Header */}
      <div className="relative z-30 flex items-center justify-between px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 border-b border-surface-200 dark:border-surface-800 bg-white/80 dark:bg-surface-900/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2.5 -ml-1 rounded-xl text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 active:scale-95 transition-all"
            aria-label="Open sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <h1 className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate max-w-[120px] sm:max-w-[200px] md:max-w-none">
            {conversation.title}
          </h1>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Model selector */}
          <select
            value={conversation.modelId}
            onChange={(e) => setConversationModel(conversation.id, e.target.value)}
            disabled={isStreaming}
            className="text-xs font-medium bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 border-none rounded-lg px-2 sm:px-2.5 py-2 sm:py-1.5 focus:ring-2 focus:ring-accent/30 focus:outline-none cursor-pointer max-w-[120px] sm:max-w-none"
          >
            {(availableModels.length > 0 ? availableModels : MODELS).map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          {/* Actions menu — click-based for touch support */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2.5 rounded-xl text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 active:scale-95 transition-all"
              aria-label="Chat options"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl shadow-xl py-1.5 z-50 animate-fade-in">
                <button
                  onClick={() => { setShowSystemPrompt(!showSystemPrompt); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 active:bg-surface-200 dark:active:bg-surface-600"
                >
                  {showSystemPrompt ? 'Hide' : 'Show'} System Prompt
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="w-full text-left px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 active:bg-surface-200 dark:active:bg-surface-600"
                >
                  Export as JSON
                </button>
                <button
                  onClick={() => handleExport('text')}
                  className="w-full text-left px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 active:bg-surface-200 dark:active:bg-surface-600"
                >
                  Export as Markdown
                </button>
                <div className="h-px bg-surface-200 dark:bg-surface-700 my-1" />
                <button
                  onClick={() => { clearConversation(conversation.id); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 active:bg-red-100 dark:active:bg-red-500/20"
                >
                  Clear Messages
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System prompt */}
      {showSystemPrompt && (
        <div className="px-3 sm:px-4 lg:px-6 py-3 border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-850 animate-fade-in shrink-0">
          <label className="text-[11px] uppercase tracking-wider font-semibold text-surface-500 dark:text-surface-400 mb-1.5 block">
            System Prompt
          </label>
          <textarea
            value={conversation.systemPrompt}
            onChange={(e) => setConversationSystemPrompt(conversation.id, e.target.value)}
            placeholder="You are a helpful assistant..."
            rows={3}
            className="w-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3.5 py-2.5 text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5 overscroll-contain">
        {conversation.messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-surface-400 dark:text-surface-500 text-sm">
            Start a conversation…
          </div>
        )}
        {conversation.messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
        {isStreaming && (
          <div className="flex items-center gap-1.5 pl-4 sm:pl-5 text-accent">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" style={{ animationDelay: '0s' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" style={{ animationDelay: '0.2s' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" style={{ animationDelay: '0.4s' }} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="px-3 sm:px-4 lg:px-6 pt-3 pb-3 border-t border-surface-200 dark:border-surface-800 bg-white/80 dark:bg-surface-900/80 backdrop-blur-md shrink-0 pb-safe">
        <div className="flex items-end gap-2 sm:gap-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              rows={1}
              disabled={isStreaming}
              className="w-full bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl px-4 py-3 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/30 resize-none transition-all disabled:opacity-50"
            />
          </div>
          {isStreaming ? (
            <button
              onClick={handleStop}
              className="shrink-0 w-11 h-11 sm:w-auto sm:h-auto sm:p-3 flex items-center justify-center rounded-2xl bg-red-500 hover:bg-red-600 active:scale-95 text-white transition-all"
              title="Stop generating"
              aria-label="Stop generating"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="shrink-0 w-11 h-11 sm:w-auto sm:h-auto sm:p-3 flex items-center justify-center rounded-2xl bg-accent hover:bg-accent-hover active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed text-surface-900 transition-all"
              title="Send message"
              aria-label="Send message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          )}
        </div>
        <p className="text-[10px] sm:text-[11px] text-center text-surface-400 dark:text-surface-500 mt-2 hidden sm:block">
          API calls go directly to the provider. Nothing is stored on any server.
        </p>
      </div>
    </div>
  );
};
