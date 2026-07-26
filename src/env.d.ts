/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly PUBLIC_PREVIEW_BADGE?: string;
  readonly PUBLIC_SUPABASE_URL?: string;
  readonly PUBLIC_SUPABASE_ANON_KEY?: string;
  readonly PUBLIC_DASHBOARD_DATA_MODE?: 'static' | 'live' | 'hybrid';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}