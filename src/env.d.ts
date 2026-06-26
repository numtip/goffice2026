/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly PUBLIC_PREVIEW_BADGE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}