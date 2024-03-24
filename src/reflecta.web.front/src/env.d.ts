/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_API_ENDPOINT: string;
  readonly VITE_LOG_LEVEL: 4 | 3 | 2 | 1 | 0,
  readonly VITE_AUTH_CLIENT_ID: string;
  readonly VITE_AUTH_AUTHORITY: string;
  readonly VITE_ENABLE_MOCK: string;
  readonly VITE_INCIDENT_URL_FORMAT: string;
  readonly VITE_APPINSIGHTS_KEY:string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}