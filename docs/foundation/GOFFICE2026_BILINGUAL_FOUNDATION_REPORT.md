# Green Office 2026 — Bilingual Foundation Report

**Date:** 2026-07-15
**Worker:** B (Thai/English Foundation)
**Branch:** `master`
**Build:** 27 pages, all passing

---

## Summary

Added Thai/English bilingual support to the Astro static site. Thai is default at `/`. English at `/en/`. All 8 landing scenes render identically in both languages. Existing routes, dashboard pipeline, and Design Freeze v1 homepage design preserved unchanged.

---

## Files Created (10)

| File | Purpose |
|---|---|
| `src/data/locales/th.json` | Thai locale strings for all landing page content |
| `src/data/locales/en.json` | English locale strings for all landing page content |
| `src/i18n/dictionary.ts` | Typed dictionary interface + async loader with cache |
| `src/i18n/utils.ts` | `getLocale`, `getLocalizedPath`, `switchLocale`, `stripLocalePrefix`, `getSwitcherHref` |
| `src/components/ui/LanguageSwitcher.astro` | TH \| EN toggle component, keyboard accessible |
| `src/components/landing/LandingPage.astro` | Shared landing template accepting `locale` prop |
| `src/pages/en/index.astro` | English homepage route (thin wrapper) |

## Files Modified (10)

| File | Change |
|---|---|
| `src/layouts/BaseLayout.astro` | Accepts optional `locale`/`dict`; locale-aware `lang`, title, description, footer; backward compatible with legacy `title` prop |
| `src/components/ui/Navigation.astro` | Locale-aware nav labels + LanguageSwitcher; optional `locale` prop defaults to `en` |
| `src/pages/index.astro` | Now a thin wrapper: detects locale from URL, renders `LandingPage` |
| `src/components/landing/LandingHero.astro` | Added optional `t` prop with English defaults |
| `src/components/landing/MissionScene.astro` | Added optional `t` prop with English defaults |
| `src/components/landing/ExecutiveCommandCenter.astro` | Added optional `t` prop with English defaults |
| `src/components/landing/AssessmentFramework.astro` | Added optional `t` prop with English defaults |
| `src/components/landing/EvidenceGateway.astro` | Added optional `t` prop with English defaults |
| `src/components/landing/ActivitiesScene.astro` | Added optional `t` prop with English defaults |
| `src/components/landing/ImprovementJourney.astro` | Added optional `t` prop with English defaults |
| `src/components/landing/LandingCTA.astro` | Added optional `t` prop with English defaults |

## Untouched (per contract)

- `src/pages/dashboard/**`, `src/pages/categories/**`, `src/pages/documents/**`
- `src/pages/evidence.astro`, `src/pages/search.astro`
- `src/data/dashboard-*`, `src/data/generated/**`, `src/data/csv/**`
- `src/data/evidence-index.json`, `src/data/categories.json`
- `src/data/criteria/**`
- `scripts/`, `astro.config.mjs`, `tailwind.config.mjs`, `package.json`

---

## Architecture

```
                  ┌──────────────────────────┐
                  │   src/pages/index.astro   │  ← detects locale from URL
                  │   getLocale(Astro.url)     │
                  └────────────┬─────────────┘
                               │ locale
                  ┌────────────▼─────────────┐
                  │  LandingPage.astro        │  ← shared template
                  │  loads dict, passes t[]   │
                  └────────────┬─────────────┘
                               │ t props
        ┌──────────────────────┼──────────────────────┐
        │ LandingHero, MissionScene, ExecutiveCC, ...  │
        │       (8 landing components)                 │
        │       t?: LocaleStrings → default = English  │
        └──────────────────────────────────────────────┘
```

**Backward compatibility:** Non-landing pages (dashboard, categories, etc.) pass only `title` to BaseLayout. BaseLayout defaults to `lang="en"` with hardcoded English strings when `dict` is not provided. Navigation defaults to English labels and `locale='en'`.

---

## Locale Model

| Lang | Route Base | Default | `lang` attr | Source |
|---|---|---|---|---|
| Thai (th) | `/` | Yes | `th` | `src/data/locales/th.json` |
| English (en) | `/en/` | No | `en` | `src/data/locales/en.json` |

No `/th/` prefix. Thai is root.

---

## Language Switcher

- Simple TH | EN pill toggle in navigation bar
- Current locale shows as active (filled background)
- Links use `Astro.url` for correct current-page switching
- All links pass through `withBase()` for GitHub Pages subpath
- Keyboard accessible (native `<a>` elements with `aria-current`)

---

## Verified

- [x] `/` loads with Thai content (`lang="th"`, Thai nav labels, Thai hero text)
- [x] `/en/` loads with English content (`lang="en"`, English nav labels, English hero text)
- [x] Language switcher: TH → `/`, EN → `/en/` paths correct
- [x] All 8 landing scenes render with locale strings
- [x] All 27 pages build successfully (0 errors)
- [x] Existing routes unmodified (categories, dashboard, documents, evidence, search)
- [x] Backward compatible: legacy `title` prop on BaseLayout still works
- [x] "Green Office 2026" and "Maejo University" appear in both locales
- [x] Visual design identical between locales (same CSS, layout, scene order)
- [x] GitHub Pages base path (`/goffice2026/`) supported via `withBase()`
