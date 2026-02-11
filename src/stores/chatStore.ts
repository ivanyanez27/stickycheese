import { create } from 'zustand';
import type { Conversation, Message, ApiKeys, StorageMode } from '../types';

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function loadApiKeys(mode: StorageMode): ApiKeys {
  try {
    const store = mode === 'local' ? localStorage : sessionStorage;
    const raw = store.getItem('sc-keys');
    if (raw) return JSON.parse(raw);
  } catch {}
  return { openai: '', anthropic: '', google: '',};
}

function saveApiKeys(keys: ApiKeys, mode: StorageMode) {
  try {
    const store = mode === 'local' ? localStorage : sessionStorage;
    store.setItem('sc-keys', JSON.stringify(keys));
  } catch {}
}

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem('sc-conversations');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveConversations(conversations: Conversation[]) {
  try {
    localStorage.setItem('sc-conversations', JSON.stringify(conversations));
  } catch {}
}

function loadTheme(): 'dark' | 'light' {
  try {
    const saved = localStorage.getItem('sc-theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {}
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  apiKeys: ApiKeys;
  proxyUrl: string;
  storageMode: StorageMode;
  theme: 'dark' | 'light';
  isStreaming: boolean;
  sidebarOpen: boolean;
  settingsOpen: boolean;

  // Actions
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setApiKey: (provider: keyof ApiKeys, key: string) => void;
  setProxyUrl: (url: string) => void;
  setStorageMode: (mode: StorageMode) => void;

  createConversation: () => string;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  setActiveConversation: (id: string | null) => void;
  setConversationModel: (id: string, modelId: string) => void;
  setConversationSystemPrompt: (id: string, prompt: string) => void;
  clearConversation: (id: string) => void;

  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (conversationId: string, messageId: string, content: string) => void;
  setStreaming: (streaming: boolean) => void;

  getActiveConversation: () => Conversation | undefined;
  exportConversation: (id: string, format: 'json' | 'text') => string;
}

export const useChatStore = create<ChatState>((set, get) => {
  const initialStorageMode: StorageMode =
    (localStorage.getItem('sc-storage-mode') as StorageMode) || 'session';

  return {
    conversations: loadConversations(),
    activeConversationId: null,
    apiKeys: loadApiKeys(initialStorageMode),
    proxyUrl: localStorage.getItem('sc-proxy-url') || '',
    storageMode: initialStorageMode,
    theme: loadTheme(),
    isStreaming: false,
    sidebarOpen: typeof window !== 'undefined' && window.innerWidth >= 1024,
    settingsOpen: false,

    setTheme: (theme) => {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('sc-theme', theme);
      set({ theme });
    },

    toggleTheme: () => {
      const newTheme = get().theme === 'dark' ? 'light' : 'dark';
      get().setTheme(newTheme);
    },

    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    setSettingsOpen: (open) => set({ settingsOpen: open }),

    setApiKey: (provider, key) => {
      const keys = { ...get().apiKeys, [provider]: key };
      saveApiKeys(keys, get().storageMode);
      set({ apiKeys: keys });
    },

    setProxyUrl: (url) => {
      // Normalize: strip trailing slash
      const cleaned = url.trim().replace(/\/+$/, '');
      localStorage.setItem('sc-proxy-url', cleaned);
      set({ proxyUrl: cleaned });
    },

    setStorageMode: (mode) => {
      localStorage.setItem('sc-storage-mode', mode);
      // Migrate keys
      const keys = get().apiKeys;
      // Clear old storage
      sessionStorage.removeItem('sc-keys');
      localStorage.removeItem('sc-keys');
      // Save to new
      saveApiKeys(keys, mode);
      set({ storageMode: mode });
    },

    createConversation: () => {
      const id = uid();
      const conv: Conversation = {
        id,
        title: 'New Chat',
        messages: [],
        modelId: 'gpt-4o',
        systemPrompt: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const conversations = [conv, ...get().conversations];
      saveConversations(conversations);
      set({ conversations, activeConversationId: id });
      return id;
    },

    deleteConversation: (id) => {
      const conversations = get().conversations.filter((c) => c.id !== id);
      saveConversations(conversations);
      const activeId = get().activeConversationId === id ? null : get().activeConversationId;
      set({ conversations, activeConversationId: activeId });
    },

    renameConversation: (id, title) => {
      const conversations = get().conversations.map((c) =>
        c.id === id ? { ...c, title, updatedAt: Date.now() } : c
      );
      saveConversations(conversations);
      set({ conversations });
    },

    setActiveConversation: (id) => set({ activeConversationId: id }),

    setConversationModel: (id, modelId) => {
      const conversations = get().conversations.map((c) =>
        c.id === id ? { ...c, modelId, updatedAt: Date.now() } : c
      );
      saveConversations(conversations);
      set({ conversations });
    },

    setConversationSystemPrompt: (id, prompt) => {
      const conversations = get().conversations.map((c) =>
        c.id === id ? { ...c, systemPrompt: prompt, updatedAt: Date.now() } : c
      );
      saveConversations(conversations);
      set({ conversations });
    },

    clearConversation: (id) => {
      const conversations = get().conversations.map((c) =>
        c.id === id ? { ...c, messages: [], updatedAt: Date.now() } : c
      );
      saveConversations(conversations);
      set({ conversations });
    },

    addMessage: (conversationId, message) => {
      const msg: Message = { ...message, id: uid(), timestamp: Date.now() };
      const conversations = get().conversations.map((c) => {
        if (c.id !== conversationId) return c;
        let title = c.title;
        if (c.messages.length === 0 && message.role === 'user') {
          const textPart = message.content
            ? message.content.slice(0, 50) + (message.content.length > 50 ? '…' : '')
            : '';
          const imageCount = message.images?.length || 0;
          if (textPart && imageCount) {
            title = textPart;
          } else if (textPart) {
            title = textPart;
          } else if (imageCount) {
            title = `Image${imageCount > 1 ? 's' : ''} shared`;
          }
        }
        return { ...c, title, messages: [...c.messages, msg], updatedAt: Date.now() };
      });
      saveConversations(conversations);
      set({ conversations });
      return msg.id;
    },

    updateMessage: (conversationId, messageId, content) => {
      const conversations = get().conversations.map((c) => {
        if (c.id !== conversationId) return c;
        return {
          ...c,
          messages: c.messages.map((m) => (m.id === messageId ? { ...m, content } : m)),
          updatedAt: Date.now(),
        };
      });
      saveConversations(conversations);
      set({ conversations });
    },

    setStreaming: (streaming) => set({ isStreaming: streaming }),

    getActiveConversation: () => {
      const { conversations, activeConversationId } = get();
      return conversations.find((c) => c.id === activeConversationId);
    },

    exportConversation: (id, format) => {
      const conv = get().conversations.find((c) => c.id === id);
      if (!conv) return '';
      if (format === 'json') {
        return JSON.stringify(conv, null, 2);
      }
      let text = `# ${conv.title}\n\n`;
      if (conv.systemPrompt) text += `[System] ${conv.systemPrompt}\n\n`;
      for (const msg of conv.messages) {
        const time = new Date(msg.timestamp).toLocaleString();
        const role = msg.role === 'user' ? 'You' : msg.model || 'Assistant';
        text += `**${role}** (${time}):\n${msg.content}\n\n---\n\n`;
      }
      return text;
    },
  };
});
