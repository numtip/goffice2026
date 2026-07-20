# SEO Report — v1.1.1

**Worker:** A (SEO)  
**Date:** 2026-07-20  
**Scope:** Repository only (no VPS changes)

## Implemented

| Item | Status | Location |
|------|--------|----------|
| `robots.txt` | ✅ | `src/pages/robots.txt.ts` → dynamic `Allow: /` + Sitemap URL |
| `sitemap-index.xml` | ✅ | `@astrojs/sitemap` 3.2.1 |
| `sitemap-0.xml` | ✅ | Auto-generated (225 routes incl. robots endpoint page) |
| Canonical URLs | ✅ | `<link rel="canonical">` in `BaseLayout.astro` |
| hreflang | ✅ | `th`, `en`, `x-default` verified in build |
| Trailing slash | ✅ | Preserved (`trailingSlash: 'always'`) — no URL changes |

## Verification

```
robots.txt → Sitemap: https://goffice.mju.ac.th/sitemap-index.xml
sitemap-index.xml → present
index.html → canonical + hreflang present
```

## Notes

- Sitemap excludes paths containing `404` via integration filter.
- Production sitemap URL uses `site` from `astro.config.mjs` (`PUBLIC_SITE_URL` or default `https://goffice.mju.ac.th`).
- GitHub Pages preview uses `DEPLOY_TARGET=github-pages` (unchanged workflow).

## Remaining (future)

- Submit sitemap to search consoles after VPS deploy of v1.1.1.
- Consider `lastmod` enrichment if content timestamps become available.

**Result:** PASS
