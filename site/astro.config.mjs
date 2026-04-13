// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeFigureCaptions from './src/plugins/rehype-figure-captions.mjs';

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL ?? 'http://localhost:4321',
  redirects: {
    '/cn/projects/catia-v5-rb22-reconstruction': '/cn/projects/3dexperience-rb22-surface-reconstruction',
  },
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex, rehypeFigureCaptions],
    shikiConfig: {
      theme: 'github-light',
    },
  },
});
