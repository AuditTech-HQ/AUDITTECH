import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://audit-tech.vercel.app', // Podes alterar depois para o teu domínio final
  integrations: [sitemap()],
});