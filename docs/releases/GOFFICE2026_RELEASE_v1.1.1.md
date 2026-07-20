# Green Office 2026 — Release v1.1.1

**Date:** 2026-07-20  
**Tag:** `v1.1.1`  
**Previous production:** v1.1.0 (VPS live — not modified by this release)  
**Repository:** https://github.com/numtip/goffice2026  

---

## Summary

v1.1.1 adds **production metadata, SEO, PWA baseline, and custom 404** without changing URLs, routing, UI design, or business logic.

---

## Features

### SEO (Worker A)
- Dynamic `robots.txt` with sitemap reference
- `@astrojs/sitemap` (sitemap-index.xml + sitemap-0.xml)
- Canonical URLs on all pages
- hreflang verified (th / en / x-default)
- Trailing slash consistency preserved

### Metadata (Worker B)
- Open Graph and Twitter Card tags
- Author, keywords, application-name, theme-color, color-scheme
- Apple mobile web app meta
- Default OG image (`/images/og-default.svg`)
- Central config: `src/config/site-meta.ts`

### PWA (Worker C)
- `manifest.webmanifest`
- favicon.ico, favicon.svg, apple-touch-icon, 192/512 icons
- Safari pinned tab + browserconfig.xml
- **No Service Worker** (by design)

### 404 + Accessibility (Worker D)
- Custom localized `404.astro` with `noindex`
- Search empty state: `aria-live`, `role="status"`, heading fix

### QA (Worker E)
- `npm run check` — pass
- `npm run build` — 225 pages
- `npm run qa:seo` — pass

---

## Migration

**None.** Drop-in static replacement for v1.1.0 on VPS when ops approves:

1. Build v1.1.1 with `PUBLIC_SITE_URL=https://goffice.mju.ac.th npm run build`
2. Rsync to `/var/www/goffice/releases/v1.1.1/`
3. Update `current` symlink

---

## Known Issues

1. OG default image is SVG — some social crawlers prefer PNG/JPG (future enhancement).
2. `@astrojs/sitemap` pinned at 3.2.1 (3.7.x fails on Astro 4.16 routes API).
3. GitHub Pages preview shows preview badge (unchanged).
4. VPS remains on v1.1.0 until manual deploy.

---

## Reports

| Report | Path |
|--------|------|
| SEO | `docs/reports/SEO_REPORT.md` |
| Metadata | `docs/reports/METADATA_REPORT.md` |
| PWA | `docs/reports/PWA_REPORT.md` |
| Accessibility | `docs/reports/ACCESSIBILITY_REPORT.md` |
| QA | `docs/reports/QA_REPORT.md` |

---

## Git

```bash
git tag v1.1.1
git push origin master --tags
```

GitHub Pages deploys automatically on push to `master` or `main`.

---

**Verdict:** `RELEASE_v1.1.1_COMPLETE` (repository)
