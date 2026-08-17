/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Admin Portal login email. Set in .env — see .env.example. */
  readonly VITE_ADMIN_EMAIL?: string;
  /** Admin Portal password. Set in .env — see .env.example. */
  readonly VITE_ADMIN_PASSWORD?: string;
  /** Turnstile site key. Public by design — safe to ship to the browser. */
  readonly VITE_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Turnstile's script attaches this global once loaded. */
interface TurnstileApi {
  render(
    container: HTMLElement,
    options: {
      sitekey: string;
      action?: string;
      callback?: (token: string) => void;
      'expired-callback'?: () => void;
      'error-callback'?: () => void;
      theme?: 'light' | 'dark' | 'auto';
    },
  ): string;
  reset(widgetId?: string): void;
  remove(widgetId?: string): void;
}

interface Window {
  turnstile?: TurnstileApi;
}

declare module '*.svg' {
  const content: string;
  export default content;
}
