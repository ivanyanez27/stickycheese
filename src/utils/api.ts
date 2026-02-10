import type { Message, Provider, ModelConfig } from '../types';
import { MODELS } from '../types';

export function getModelConfig(modelId: string): ModelConfig | undefined {
  return MODELS.find((m) => m.id === modelId);
}

export function getProviderForModel(modelId: string): Provider | undefined {
  return getModelConfig(modelId)?.provider;
}

interface StreamParams {
  messages: Message[];
  modelId: string;
  apiKey: string;
  systemPrompt?: string;
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
  signal?: AbortSignal;
}

export async function streamChat(params: StreamParams) {
  const { messages, modelId, apiKey, systemPrompt, onChunk, onDone, onError, signal } = params;
  const provider = getProviderForModel(modelId);

  if (!provider) {
    onError(`Unknown model: ${modelId}`);
    return;
  }

  if (!apiKey) {
    onError(`No API key provided for ${provider}. Open Settings to add one.`);
    return;
  }

  try {
    if (provider === 'openai') {
      await streamOpenAI({ messages, modelId, apiKey, systemPrompt, onChunk, onDone, onError, signal });
    } else {
      await streamAnthropic({ messages, modelId, apiKey, systemPrompt, onChunk, onDone, onError, signal });
    }
  } catch (err: any) {
    if (err.name === 'AbortError') return;
    onError(err.message || 'Unknown error');
  }
}

async function streamOpenAI(params: StreamParams) {
  const { messages, modelId, apiKey, systemPrompt, onChunk, onDone, onError, signal } = params;

  const apiMessages: { role: string; content: string }[] = [];
  if (systemPrompt) {
    apiMessages.push({ role: 'system', content: systemPrompt });
  }
  for (const msg of messages) {
    if (msg.role === 'system') continue;
    apiMessages.push({ role: msg.role, content: msg.content });
  }

  const isO1 = modelId.startsWith('o1');

  const body: any = {
    model: modelId,
    messages: apiMessages,
    stream: !isO1,
  };

  if (!isO1) {
    body.max_tokens = 4096;
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
    onError(err.error?.message || `OpenAI API error: ${res.status}`);
    return;
  }

  if (isO1) {
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    onChunk(text);
    onDone();
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    onError('No response body');
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') {
        onDone();
        return;
      }
      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) onChunk(delta);
      } catch {}
    }
  }
  onDone();
}

async function streamAnthropic(params: StreamParams) {
  const { messages, modelId, apiKey, systemPrompt, onChunk, onDone, onError, signal } = params;

  const apiMessages: { role: string; content: string }[] = [];
  for (const msg of messages) {
    if (msg.role === 'system') continue;
    apiMessages.push({ role: msg.role, content: msg.content });
  }

  const body: any = {
    model: modelId,
    messages: apiMessages,
    max_tokens: 4096,
    stream: true,
  };
  if (systemPrompt) {
    body.system = systemPrompt;
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
    onError(err.error?.message || `Anthropic API error: ${res.status}`);
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    onError('No response body');
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
          onChunk(parsed.delta.text);
        }
        if (parsed.type === 'message_stop') {
          onDone();
          return;
        }
      } catch {}
    }
  }
  onDone();
}
