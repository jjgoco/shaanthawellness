import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://shaanthawellness.com',
  output: 'static',
  build: { format: 'file', inlineStylesheets: 'always' },
  trailingSlash: 'never',
  compressHTML: true,
  devToolbar: { enabled: false },
});
