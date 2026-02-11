import React, { useState, useEffect } from 'react';
import { useChatStore } from '../stores/chatStore';

export const SettingsModal: React.FC = () => {
  const { settingsOpen, setSettingsOpen, apiKeys, setApiKey, proxyUrl, setProxyUrl, storageMode, setStorageMode } =
    useChatStore();
  const [showOpenAI, setShowOpenAI] = useState(false);
  const [showAnthropic, setShowAnthropic] = useState(false);

  // Lock body scroll when modal open
  useEffect(() => {
    if (settingsOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [settingsOpen]);

  if (!settingsOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setSettingsOpen(false)}
      />

      {/* Modal — full height on small phones, centered on larger */}
      <div className="relative bg-white dark:bg-surface-900 w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl animate-slide-up border border-surface-200 dark:border-surface-800 overflow-hidden max-h-[95dvh] sm:max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-surface-200 dark:border-surface-800 shrink-0">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Settings</h2>
          <button
            onClick={() => setSettingsOpen(false)}
            className="p-2 -mr-1 rounded-xl text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 active:scale-95 transition-all"
            aria-label="Close settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="px-5 sm:px-6 py-5 space-y-6 overflow-y-auto overscroll-contain flex-1 pb-safe">
          {/* API Keys */}
          <div>
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-1">
              API Keys
            </h3>
            <p className="text-xs text-surface-500 dark:text-surface-400 mb-4 leading-relaxed">
              Keys are stored only in your browser. They are sent to the provider (directly or via your proxy) and never persisted server-side.
            </p>

            {/* OpenAI */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-surface-600 dark:text-surface-400 uppercase tracking-wider mb-1.5 block">
                OpenAI
              </label>
              <div className="relative">
                <input
                  type={showOpenAI ? 'text' : 'password'}
                  value={apiKeys.openai}
                  onChange={(e) => setApiKey('openai', e.target.value)}
                  placeholder="sk-..."
                  autoComplete="off"
                  className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3.5 py-3 pr-16 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-accent/30 font-mono"
                />
                <button
                  onClick={() => setShowOpenAI(!showOpenAI)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-medium text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 active:text-accent transition-colors"
                >
                  {showOpenAI ? 'Hide' : 'Show'}
                </button>
              </div>
              {apiKeys.openai && (
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Key saved
                </div>
              )}
            </div>

            {/* Anthropic */}
            <div>
              <label className="text-xs font-semibold text-surface-600 dark:text-surface-400 uppercase tracking-wider mb-1.5 block">
                Anthropic
              </label>
              <div className="relative">
                <input
                  type={showAnthropic ? 'text' : 'password'}
                  value={apiKeys.anthropic}
                  onChange={(e) => setApiKey('anthropic', e.target.value)}
                  placeholder="sk-ant-..."
                  autoComplete="off"
                  className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3.5 py-3 pr-16 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-accent/30 font-mono"
                />
                <button
                  onClick={() => setShowAnthropic(!showAnthropic)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-medium text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 active:text-accent transition-colors"
                >
                  {showAnthropic ? 'Hide' : 'Show'}
                </button>
              </div>
              {apiKeys.anthropic && (
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Key saved
                </div>
              )}
            </div>
          </div>
          
          {/* API Proxy */}
          {/*
          <div>
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-1">
              API Proxy
              <span className="ml-2 text-[10px] uppercase tracking-wider font-semibold text-surface-500 dark:text-surface-400 bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded-md">
                Optional
              </span>
            </h3>
            <p className="text-xs text-surface-500 dark:text-surface-400 mb-3 leading-relaxed">
              Route API calls through a Cloudflare Worker proxy to avoid CORS issues and keep your API key off the browser network tab. The proxy never stores your key.
            </p>
            <input
              type="url"
              value={proxyUrl}
              onChange={(e) => setProxyUrl(e.target.value)}
              placeholder="https://stickycheese-proxy.yourname.workers.dev"
              autoComplete="off"
              className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3.5 py-3 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-accent/30 font-mono text-xs"
            />
            {proxyUrl && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Proxy enabled — calls route through {(() => { try { return new URL(proxyUrl).hostname; } catch { return proxyUrl; } })()}
              </div>
            )}
            {!proxyUrl && (
              <p className="text-[11px] text-surface-400 dark:text-surface-500 mt-1.5">
                Leave empty to call providers directly from the browser.
              </p>
            )}
          </div> */}

          {/* Storage mode */}
          <div>
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-1">
              Key Storage
            </h3>
            <p className="text-xs text-surface-500 dark:text-surface-400 mb-3 leading-relaxed">
              Choose where to store your API keys in the browser.
            </p>
            <div className="space-y-2">
              <label
                className={`flex items-start gap-3 p-3.5 sm:p-3.5 rounded-xl border cursor-pointer transition-colors active:scale-[0.99] ${
                  storageMode === 'session'
                    ? 'border-accent bg-accent-muted dark:bg-accent-muted'
                    : 'border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800/50'
                }`}
              >
                <input
                  type="radio"
                  name="storage"
                  value="session"
                  checked={storageMode === 'session'}
                  onChange={() => setStorageMode('session')}
                  className="mt-0.5 accent-accent w-4 h-4"
                />
                <div>
                  <div className="text-sm font-medium text-surface-900 dark:text-surface-100">
                    Session Storage
                    <span className="ml-2 text-[10px] uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5 leading-relaxed">
                    Keys are cleared when you close the browser tab. More private.
                  </p>
                </div>
              </label>
              <label
                className={`flex items-start gap-3 p-3.5 sm:p-3.5 rounded-xl border cursor-pointer transition-colors active:scale-[0.99] ${
                  storageMode === 'local'
                    ? 'border-accent bg-accent-muted dark:bg-accent-muted'
                    : 'border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800/50'
                }`}
              >
                <input
                  type="radio"
                  name="storage"
                  value="local"
                  checked={storageMode === 'local'}
                  onChange={() => setStorageMode('local')}
                  className="mt-0.5 accent-accent w-4 h-4"
                />
                <div>
                  <div className="text-sm font-medium text-surface-900 dark:text-surface-100">
                    Local Storage
                  </div>
                  <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5 leading-relaxed">
                    Keys persist across sessions. More convenient but less private.
                  </p>
                  {storageMode === 'local' && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600 dark:text-amber-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      Keys will persist until manually cleared.
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* About */}
          <div className="pt-2 border-t border-surface-200 dark:border-surface-800">
            <p className="text-xs text-surface-400 dark:text-surface-500 leading-relaxed">
              This is a fully client-side application. Your API keys and conversations never leave your
              browser. API calls go directly to the provider, or through your own proxy if configured —
              either way, nothing is stored server-side.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
