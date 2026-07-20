# Metadata Report — v1.1.1

**Worker:** B (Metadata)  
**Date:** 2026-07-20

## Implemented in `BaseLayout.astro`

| Meta | Status |
|------|--------|
| `<title>` | ✅ Page title hierarchy preserved |
| `description` | ✅ Per-page or default hero description |
| `author` | ✅ Maejo University — Research and Extension Office |
| `keywords` | ✅ Green Office / sustainability keyword set |
| `application-name` | ✅ Green Office 2026 |
| `theme-color` | ✅ `#003527` |
| `color-scheme` | ✅ `light` |
| `robots` | ✅ `index, follow` ( `noindex, follow` on 404 ) |
| Open Graph (`og:*`) | ✅ type, site_name, title, description, url, locale, image |
| Twitter Card | ✅ `summary_large_image` + title/description/image |
| Apple web app | ✅ mobile-web-app-capable, title, status-bar-style |
| MS browser config | ✅ `browserconfig.xml` |

## Default social image

- Path: `/images/og-default.svg`
- Dimensions meta: 1200×630
- Override: optional `ogImage` prop on `BaseLayout`

## Title hierarchy

- Pages pass explicit `title` where needed (documents, evidence, dashboards).
- Fallback: `{site.name} - {title_suffix}` from locale dictionary.

## Configuration source

- `src/config/site-meta.ts` — centralized production constants

## Verification (dist/index.html)

- canonical ✅
- og:title, og:image ✅
- twitter:card ✅
- theme-color ✅

**Result:** PASS
