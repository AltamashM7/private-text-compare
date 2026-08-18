import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://textcompare.amosfot.in',
  output: 'static',
  integrations: [preact()],
  vite: {
    plugins: [tailwindcss()],
  },
});
