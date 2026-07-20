import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

const deployTarget = process.env.DEPLOY_TARGET ?? 'local';
const isGitHubPages = deployTarget === 'github-pages';

const [owner, repo] = (process.env.GITHUB_REPOSITORY ?? 'numtip/goffice2026').split('/');
const site = isGitHubPages
  ? `https://${owner}.github.io`
  : (process.env.PUBLIC_SITE_URL ?? 'https://goffice.mju.ac.th');
const base = isGitHubPages ? `/${repo}/` : '/';

/** @type {import('astro').AstroUserConfig} */
export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  output: 'static',
  integrations: [
    tailwind(),
    sitemap({
      filter: (page) => !page.includes('404'),
    }),
  ],
  vite: {
    define: {
      'import.meta.env.PUBLIC_PREVIEW_BADGE': JSON.stringify(
        process.env.PUBLIC_PREVIEW_BADGE === 'true'
      ),
    },
  },
});
