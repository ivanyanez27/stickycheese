# 🧀 StickyCheese

**A privacy-first LLM chat interface.** Bring your own API key, chat with multiple models, and keep everything on your device.

No accounts. No backend. No data collection. Just you and the model.

---

## What is this?

StickyCheese is a self-hosted, open-source chat UI for talking to LLMs from OpenAI and Anthropic. It runs entirely in your browser as a static site — your API keys and conversations never leave your device.

It's designed for developers and power users who want a clean, fast chat interface without handing their data to a third party.

## Key Features

- **Multi-provider, multi-model** — Switch between GPT-4o, GPT-3.5, o1, Claude Sonnet 4, Claude Opus 4.5, and more from a single interface
- **Streaming responses** — Real-time token-by-token output as the model generates
- **Multiple conversations** — Create, rename, delete, and switch between chats with full context history
- **Markdown + syntax highlighting** — Rendered messages with code blocks, tables, lists, and links
- **System prompts** — Per-conversation custom instructions
- **Export** — Download any conversation as JSON or Markdown
- **Dark / Light theme** — Follows system preference or manual toggle
- **Fully responsive** — Desktop, tablet, and phone with touch-optimized UI, safe area support for notched devices, and mobile bottom-sheet modals
- **First-time user guide** — Built-in walkthrough for getting API keys from each provider
- **Optional API proxy** — Included Cloudflare Worker proxy for CORS-free requests and keeping keys off the browser network tab
- **Privacy controls** — Choose between session storage (cleared on tab close) or local storage for API keys

## Architecture

```
┌─────────────────────────────────┐
│  Static Frontend (React + Vite) │  ← Deployed to Cloudflare Pages / Vercel / Netlify
│  Runs entirely in the browser   │
└──────────────┬──────────────────┘
               │
       ┌───────┴────────┐
       │  Optional       │
       │  CF Worker Proxy│  ← Relays requests, never stores keys
       └───────┬─────────┘
               │
       ┌───────┴────────┐
       │  LLM Provider   │
       │  (OpenAI /      │
       │   Anthropic)    │
       └────────────────┘
```

Without the proxy, the browser calls providers directly. Either way, nothing is stored server-side.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | **React 18** with **TypeScript** |
| Build | **Vite 5** |
| Styling | **Tailwind CSS 3** |
| State | **Zustand** |
| Markdown | **react-markdown** + remark-gfm + rehype-highlight |
| Syntax highlighting | **highlight.js** |
| API proxy | **Cloudflare Workers** |
| Hosting | **Cloudflare Pages** (or any static host) |

## Privacy & Security

- API keys are stored in your browser only — `sessionStorage` (default, cleared on tab close) or `localStorage` (persists)
- All calls go directly to the LLM provider, or through your own proxy — never through any third-party server
- Zero telemetry, zero analytics, zero cookies
- The proxy Worker forwards your key in a header and discards it immediately — nothing is logged or persisted
- Conversations are stored in `localStorage` and never leave the browser

## License

MIT
