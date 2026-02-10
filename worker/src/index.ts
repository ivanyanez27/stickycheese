/**
 * StickyCheese API Proxy Worker
 *
 * A thin Cloudflare Worker that relays requests to LLM providers.
 * The user's API key is passed in a request header — it is NEVER
 * stored, logged, or persisted by the Worker.
 *
 * Routes:
 *   POST /openai/*  → https://api.openai.com/*
 *   POST /anthropic/* → https://api.anthropic.com/*
 *   OPTIONS *        → CORS preflight
 *   GET /health      → health check
 */

// ---------- types ----------

interface Env {
  // Optional: lock down to specific origins (comma-separated)
  // e.g. "https://chat.example.com,https://localhost:5173"
  ALLOWED_ORIGINS?: string;
}

// ---------- CORS ----------

const DEFAULT_ALLOWED_ORIGIN = '*';

function getAllowedOrigin(request: Request, env: Env): string {
  if (!env.ALLOWED_ORIGINS) return DEFAULT_ALLOWED_ORIGIN;

  const origin = request.headers.get('Origin') || '';
  const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim());
  if (allowed.includes(origin)) return origin;

  // No match — return first allowed (browser will block the response)
  return allowed[0];
}

function corsHeaders(request: Request, env: Env): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': getAllowedOrigin(request, env),
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, anthropic-version',
    'Access-Control-Max-Age': '86400',
  };
}

function handleOptions(request: Request, env: Env): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request, env),
  });
}

// ---------- helpers ----------

function jsonError(message: string, status: number, request: Request, env: Env): Response {
  return new Response(JSON.stringify({ error: { message } }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(request, env),
    },
  });
}

// ---------- provider routing ----------

const PROVIDERS: Record<string, { upstream: string; buildHeaders: (req: Request) => Record<string, string> }> = {
  openai: {
    upstream: 'https://api.openai.com',
    buildHeaders: (req) => {
      const key = req.headers.get('Authorization') || '';
      return {
        'Content-Type': 'application/json',
        Authorization: key,
      };
    },
  },
  anthropic: {
    upstream: 'https://api.anthropic.com',
    buildHeaders: (req) => {
      const key = req.headers.get('x-api-key') || '';
      const version = req.headers.get('anthropic-version') || '2023-06-01';
      return {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': version,
      };
    },
  },
};

async function proxyRequest(
  provider: string,
  path: string,
  request: Request,
  env: Env
): Promise<Response> {
  const config = PROVIDERS[provider];
  if (!config) {
    return jsonError(`Unknown provider: ${provider}`, 400, request, env);
  }

  if (request.method !== 'POST') {
    return jsonError('Only POST is supported', 405, request, env);
  }

  const upstreamUrl = `${config.upstream}${path}`;
  const upstreamHeaders = config.buildHeaders(request);

  // Validate API key is present
  const hasKey =
    provider === 'openai'
      ? !!request.headers.get('Authorization')
      : !!request.headers.get('x-api-key');

  if (!hasKey) {
    return jsonError('Missing API key header', 401, request, env);
  }

  // Forward request to upstream provider
  const upstreamResponse = await fetch(upstreamUrl, {
    method: 'POST',
    headers: upstreamHeaders,
    body: request.body,
  });

  // Build response with CORS headers, preserving streaming
  const responseHeaders = new Headers(corsHeaders(request, env));
  responseHeaders.set('Content-Type', upstreamResponse.headers.get('Content-Type') || 'application/json');

  // Preserve SSE cache headers for streaming
  const cacheControl = upstreamResponse.headers.get('Cache-Control');
  if (cacheControl) responseHeaders.set('Cache-Control', cacheControl);

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}

// ---------- main handler ----------

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions(request, env);
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Health check
    if (path === '/health' || path === '/') {
      return new Response(
        JSON.stringify({ status: 'ok', service: 'stickycheese-proxy' }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders(request, env),
          },
        }
      );
    }

    // Route: /openai/v1/chat/completions → api.openai.com/v1/chat/completions
    if (path.startsWith('/openai/')) {
      const providerPath = path.replace('/openai', '');
      return proxyRequest('openai', providerPath, request, env);
    }

    // Route: /anthropic/v1/messages → api.anthropic.com/v1/messages
    if (path.startsWith('/anthropic/')) {
      const providerPath = path.replace('/anthropic', '');
      return proxyRequest('anthropic', providerPath, request, env);
    }

    return jsonError('Not found', 404, request, env);
  },
};
