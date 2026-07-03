/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly STRAPI_URL?: string;
  readonly CONTENT_SOURCE?: "local" | "strapi";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
