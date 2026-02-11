import React, { useState } from 'react';

type Provider = 'openai' | 'anthropic';

interface ProviderGuide {
  id: Provider;
  name: string;
  color: string;
  icon: React.ReactNode;
  keyPrefix: string;
  pricingNote: string;
  steps: { title: string; detail: string; link?: { text: string; url: string } }[];
  tips: string[];
}

const GUIDES: ProviderGuide[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    color: 'emerald',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
      </svg>
    ),
    keyPrefix: 'sk-',
    pricingNote: 'Pay-as-you-go. GPT-4o costs ~$2.50/1M input tokens. $5 minimum credit.',
    steps: [
      {
        title: 'Create an OpenAI account',
        detail: 'Sign up or log in to the OpenAI platform.',
        link: { text: 'platform.openai.com', url: 'https://platform.openai.com/signup' },
      },
      {
        title: 'Add billing credits',
        detail: 'Go to Settings → Billing and add a payment method. You need a minimum of $5 in credits to use the API.',
        link: { text: 'Billing settings', url: 'https://platform.openai.com/settings/organization/billing/overview' },
      },
      {
        title: 'Generate an API key',
        detail: 'Go to API Keys page and click "Create new secret key". Give it a name (e.g. "StickyCheese") and copy the key immediately — you won\'t be able to see it again.',
        link: { text: 'API Keys page', url: 'https://platform.openai.com/api-keys' },
      },
      {
        title: 'Paste the key here',
        detail: 'Come back to StickyCheese Settings and paste the key into the OpenAI field. It should start with sk-.',
      },
    ],
    tips: [
      'Set a monthly usage limit in OpenAI billing settings to avoid surprises.',
      'Project-scoped keys are more secure than account-level keys — create a dedicated project for StickyCheese.',
      'You can revoke and regenerate keys anytime from the API Keys page.',
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    color: 'orange',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M17.304 3.541h-3.672l6.696 16.918h3.672zm-10.608 0L0 20.459h3.744l1.37-3.553h7.005l1.369 3.553h3.744L10.536 3.541zm-.372 10.339l2.496-6.469 2.496 6.469z" />
      </svg>
    ),
    keyPrefix: 'sk-ant-',
    pricingNote: 'Pay-as-you-go. Claude Sonnet 4 costs ~$3/1M input tokens. $5 minimum credit.',
    steps: [
      {
        title: 'Create an Anthropic account',
        detail: 'Sign up or log in to the Anthropic Console.',
        link: { text: 'console.anthropic.com', url: 'https://console.anthropic.com/' },
      },
      {
        title: 'Add billing credits',
        detail: 'Go to Plans & Billing in the console and add a payment method with initial credits.',
        link: { text: 'Billing settings', url: 'https://console.anthropic.com/settings/billing' },
      },
      {
        title: 'Generate an API key',
        detail: 'Go to the API Keys page and click "Create Key". Name it (e.g. "StickyCheese"), select a workspace, and copy the key immediately.',
        link: { text: 'API Keys page', url: 'https://console.anthropic.com/settings/keys' },
      },
      {
        title: 'Paste the key here',
        detail: 'Come back to StickyCheese Settings and paste the key into the Anthropic field. It should start with sk-ant-.',
      },
    ],
    tips: [
      'Set a monthly spending limit in the console to control costs.',
      'Use workspace-scoped keys for better access control.',
      'Keys can be revoked instantly from the API Keys page if compromised.',
    ],
  },
];

interface ApiKeyGuideProps {
  onClose: () => void;
}

export const ApiKeyGuide: React.FC<ApiKeyGuideProps> = ({ onClose }) => {
  const [activeProvider, setActiveProvider] = useState<Provider>('openai');
  const guide = GUIDES.find((g) => g.id === activeProvider)!;

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-surface-900 w-full sm:max-w-xl sm:rounded-2xl rounded-t-2xl shadow-2xl animate-slide-up border border-surface-200 dark:border-surface-800 overflow-hidden max-h-[95dvh] sm:max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-surface-200 dark:border-surface-800 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
              Get Your API Key
            </h2>
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
              Step-by-step guide for each provider
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-1 rounded-xl text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 active:scale-95 transition-all"
            aria-label="Close guide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Provider tabs */}
        <div className="flex px-5 sm:px-6 pt-4 pb-0 gap-2 shrink-0">
          {GUIDES.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveProvider(g.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.97]
                ${activeProvider === g.id
                  ? 'bg-accent-muted text-accent dark:text-accent-hover shadow-sm'
                  : 'text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                }
              `}
            >
              <span className={activeProvider === g.id ? 'text-accent' : 'text-surface-400 dark:text-surface-500'}>
                {g.icon}
              </span>
              {g.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="px-5 sm:px-6 py-5 overflow-y-auto overscroll-contain flex-1 pb-safe">
          {/* Pricing note */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-surface-400 dark:text-surface-500 mt-0.5 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
              <span className="font-semibold">{guide.name} pricing:</span> {guide.pricingNote}
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {guide.steps.map((step, i) => (
              <div key={i} className="flex gap-3.5">
                {/* Step number */}
                <div className="shrink-0 w-7 h-7 rounded-lg bg-accent-muted flex items-center justify-center">
                  <span className="text-xs font-bold text-accent">{i + 1}</span>
                </div>
                {/* Step content */}
                <div className="flex-1 pt-0.5">
                  <h4 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
                    {step.title}
                  </h4>
                  <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed mt-1">
                    {step.detail}
                  </p>
                  {step.link && (
                    <a
                      href={step.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium text-accent hover:text-accent-hover transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      {step.link.text}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Key format hint */}
          <div className="mt-5 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-surface-500 dark:text-surface-400 mb-1.5">
              Your key should look like
            </p>
            <code className="text-xs font-mono text-accent bg-accent-muted px-2 py-1 rounded-lg">
              {guide.keyPrefix}••••••••••••••••••••
            </code>
          </div>

          {/* Tips */}
          <div className="mt-5">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-surface-500 dark:text-surface-400 mb-2.5">
              Tips
            </p>
            <div className="space-y-2">
              {guide.tips.map((tip, i) => (
                <div key={i} className="flex gap-2.5 items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent shrink-0 mt-0.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Security reassurance */}
          <div className="mt-5 pt-4 border-t border-surface-200 dark:border-surface-700">
            <div className="flex gap-2.5 items-start">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 shrink-0 mt-0.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">
                <span className="font-semibold text-surface-700 dark:text-surface-300">Your key stays private.</span>{' '}
                StickyCheese stores it only in your browser and sends it directly to the provider (or through your own proxy). It is never sent to any other server.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
