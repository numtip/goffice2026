# QA Report — v1.1.1

**Worker:** E (QA + Release)  
**Date:** 2026-07-20

## Commands

| Command | Result |
|---------|--------|
| `npm install` | ✅ |
| `npm run check` | ✅ 0 errors |
| `npm run build` | ✅ 225 pages + sitemap |
| `node scripts/qa-seo-release.mjs` | ✅ All checks passed |

## Artifact validation

| Artifact | dist/ |
|----------|-------|
| robots.txt | ✅ |
| sitemap-index.xml | ✅ |
| sitemap-0.xml | ✅ |
| manifest.webmanifest | ✅ |
| favicon.ico / favicon.svg | ✅ |
| icons (192/512/apple) | ✅ |
| og-default.svg | ✅ |
| 404.html + noindex | ✅ |

## Metadata validation (index.html)

- canonical ✅
- hreflang th/en ✅
- Open Graph ✅
- Twitter Card ✅

## Broken links

- Full link crawl not run (no production deploy).
- Existing `npm run qa:links` requires GitHub Pages build — unchanged.

## Build environment

- Node.js v20.19.5 (nvm)
- Astro 4.16.19
- `@astrojs/sitemap` 3.2.1 (pinned — 3.7.x incompatible with current Astro routes API)

## Release recommendation

- Tag: `v1.1.1`
- VPS deploy: **manual** (infrastructure frozen) — swap release when approved
- GitHub Pages: auto on push to `master`/`main`

**Result:** PASS — ready for tag `v1.1.1`
