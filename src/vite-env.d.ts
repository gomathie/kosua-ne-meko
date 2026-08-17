/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Admin Portal login email. Set in .env — see .env.example. */
  readonly VITE_ADMIN_EMAIL?: string;
  /** Admin Portal password. Set in .env — see .env.example. */
  readonly VITE_ADMIN_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.svg' {
  const content: string;
  export default content;
}
