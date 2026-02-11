export type Provider = 'openai' | 'anthropic' | 'google';

export interface ModelConfig {
  id: string;
  name: string;
  provider: Provider;
  supportsVision?: boolean;
}

export const MODELS: ModelConfig[] = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', supportsVision: true },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', supportsVision: true },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', supportsVision: true },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' },
  { id: 'o1', name: 'o1', provider: 'openai', supportsVision: true },
  { id: 'o1-mini', name: 'o1 Mini', provider: 'openai', supportsVision: true },
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', provider: 'anthropic', supportsVision: true },
  { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', provider: 'anthropic', supportsVision: true },
  { id: 'claude-opus-4-5-20250918', name: 'Claude Opus 4.5', provider: 'anthropic', supportsVision: true },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro Preview', provider: 'google', supportsVision: true },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', provider: 'google', supportsVision: true },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'google', supportsVision: true },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', provider: 'google', supportsVision: true },
];

export interface ImageAttachment {
  id: string;
  data: string;        // base64-encoded image data (without the data URI prefix)
  mediaType: string;   // e.g., "image/png", "image/jpeg", "image/gif", "image/webp"
  name?: string;       // original filename
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  model?: string;
  images?: ImageAttachment[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  modelId: string;
  systemPrompt: string;
  createdAt: number;
  updatedAt: number;
}

export type StorageMode = 'session' | 'local';

export interface ApiKeys {
  openai: string;
  anthropic: string;
  google: string;
}
