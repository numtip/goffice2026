# Accessibility Report — v1.1.1

**Worker:** D (404 + Accessibility)  
**Date:** 2026-07-20

## Custom 404

- **File:** `src/pages/404.astro`
- Localized TH/EN headings and actions
- Links: Home + Dashboard
- **`noindex, follow`** via `BaseLayout noindex={true}`
- Builds to `dist/404.html`

## Empty states (low-risk improvements)

| Location | Change |
|----------|--------|
| `search.astro` | `role="status"`, `aria-live="polite"`, empty title → `<h2>` |
| `en/search.astro` | Same |

## Existing accessibility (verified, unchanged)

| Feature | Status |
|---------|--------|
| Skip link to `#main-content` | ✅ |
| `lang` on `<html>` | ✅ th / en |
| Language switcher `aria-current` | ✅ (Navigation component) |
| Focus visibility on 404 actions | ✅ `focus-visible:ring-*` |
| Decorative SVG `aria-hidden` | ✅ search empty icon |

## Heading hierarchy

- 404 page: `h1` main message, action links (no skipped levels)
- Search empty: promoted to `h2` under page `h1`

## Not changed

- Dashboard/chart accessibility (out of scope — no UI redesign)
- Color contrast tokens (existing Tailwind theme)

**Result:** PASS
