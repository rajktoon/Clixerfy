import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  integrations: [sitemap()],
  site: "https://clixerfy.com",
  compressHTML: true,
  build: {
    inlineStylesheets: "always",
  },
  vite: {
    build: {
      cssMinify: true,
      minify: "esbuild",
    },
  },
});
