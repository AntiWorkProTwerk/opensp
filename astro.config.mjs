import {defineConfig} from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://opensp.fyi',
  output: 'static',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap()],
  prefetch: {prefetchAll: false, defaultStrategy: 'hover'},
  build: {inlineStylesheets: 'never'},
});
