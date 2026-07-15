# Bilingual TH/EN Foundation — QA Report

**Date:** 2026-07-15  
**Branch:** `master` (working tree)  
**Starting HEAD:** `fc24d7c`

---

## Files Changed

### Created (Worker B — Round 1)

| File | Purpose |
|------|---------|
| `src/i18n/dictionary.ts` | Typed locale module with `getDictionary()` loader |
| `src/i18n/utils.ts` | `getLocale`, `getLocalizedPath`, `switchLocale`, `stripLocalePrefix`, `getSwitcherHref` |
| `src/data/locales/th.json` | Thai UI dictionary (all landing scenes) |
| `src/data/locales/en.json` | English UI dictionary (all landing scenes) |
| `src/components/ui/LanguageSwitcher.astro` | TH\|EN pill toggle with keyboard accessibility |
| `src/components/landing/LandingPage.astro` | Shared landing template consuming `locale` prop |
| `src/pages/en/index.astro` | English homepage route |

### Created (Worker B — This round)

| File | Purpose |
|------|---------|
| `src/data/i18n/glossary.ts` | Canonical bilingual terminology glossary (73 entries) |
| `docs/i18n/BILINGUAL_FOUNDATION.md` | Bilingual architecture documentation |
| `docs/i18n/BILINGUAL_QA_REPORT.md` | This report |

### Modified (Worker B — Round 1)

| File | Change |
|------|--------|
| `src/layouts/BaseLayout.astro` | Locale-aware lang, title, description, nav, footer |
| `src/components/ui/Navigation.astro` | Locale-aware nav labels + LanguageSwitcher |
| `src/pages/index.astro` | Thin wrapper using LandingPage with locale detection |
| 8 landing components | Each accepts `t` prop with English fallback defaults |

---

## Routes Tested

| Route | TH | EN | Status |
|-------|----|----|--------|
| `/` / `/en/` | ✅ `lang="th"`, Thai text | ✅ `lang="en"`, English text | PASS |
| `/dashboard/` | ✅ Existing (unchanged) | — | PASS |
| `/categories/` | ✅ Existing (unchanged) | — | PASS |
| `/categories/cat1/`–`cat7/` | ✅ Existing (unchanged) | — | PASS |
| `/evidence/` | ✅ Existing (unchanged) | — | PASS |
| `/documents/` | ✅ Existing (unchanged) | — | PASS |
| `/search/` | ✅ Existing (unchanged) | — | PASS |

**Total built pages:** 27 (26 existing + 1 new `/en/`)

---

## Commands Executed

| Command | Result |
|---------|--------|
| `npm run check` (astro check) | **PASS** (0 errors, 0 warnings, 3 pre-existing hints) |
| `npm run build` | **PASS** (27 pages, 1.71s) |
| `node scripts/validate-criteria.mjs` | **PASS** (7/24/65, all weights correct) |

---

## PASS/FAIL Results

| Check | Result |
|-------|--------|
| Thai homepage builds (`/`) | ✅ PASS |
| English homepage builds (`/en/`) | ✅ PASS |
| HTML `lang="th"` on TH page | ✅ PASS |
| HTML `lang="en"` on EN page | ✅ PASS |
| Thai description in TH page `<meta>` | ✅ PASS |
| English description in EN page `<meta>` | ✅ PASS |
| Thai nav labels on TH page (หน้าแรก, แดชบอร์ด, etc.) | ✅ PASS |
| English nav labels on EN page (Home, Dashboard, etc.) | ✅ PASS |
| Language switcher present on TH page | ✅ PASS |
| Language switcher present on EN page | ✅ PASS |
| TH active state when on TH page | ✅ PASS |
| EN active state when on EN page | ✅ PASS |
| Language switcher link preserves equivalent route | ✅ PASS |
| No broken internal links | ✅ PASS |
| No canonical taxonomy IDs changed | ✅ PASS |
| No existing data files corrupted | ✅ PASS |
| No large unrelated refactor | ✅ PASS |
| GitHub Pages base path preserved (all links use `withBase()`) | ✅ PASS |
| No JavaScript-only locale switching | ✅ PASS |
| No redirect loops | ✅ PASS |
| Glossary created (73 entries: 39 authoritative, 32 working, 2 review) | ✅ PASS |
| Glossary includes authoritative, working, and review tiers | ✅ PASS |
| Bilingual foundation documentation | ✅ PASS |
| No database/API/backend introduced | ✅ PASS |
| No redesign of landing page | ✅ PASS |
| No invention of official English translations | ✅ PASS |

---

## Known Limitations

1. **Non-landing pages not yet bilingual**: Dashboard, categories, evidence, documents, and search pages still use hardcoded English metadata (unchanged from before Round 1). Bilingual expansion to these pages is deferred to a future round.

2. **English indicator translations**: The 63/65 indicator texts are not translated. Official English translations are not yet available from the authoritative source. The canonical taxonomy uses Thai as the primary language with English fields populated with working translations where available.

3. **Activity content**: Activity scene content is placeholder text in both languages. Real content requires PO-approved source materials.

4. **Hreflang metadata**: Not yet implemented. Deferred until more routes have bilingual equivalents.

5. **Language switcher fallback**: Currently links to the opposite locale's homepage rather than an equivalent page when the equivalent does not exist yet (e.g., `/en/dashboard`). This is correct behavior per the fallback policy.

---

## Unresolved Terminology Requiring Review

| Term | Issue |
|------|-------|
| Carbon Neutrality (ความเป็นกลางทางคาร์บอน) | Verify official 2569 criteria Thai term |
| Net Zero (การปล่อยก๊าซเรือนกระจกสุทธิเป็นศูนย์) | Verify official 2569 criteria Thai term |
| Green Procurement (working) | Official category title is "การจัดซื้อและจัดจ้าง" — conceptual term differs from canonical title |

These are marked `review` in the glossary and are safe to defer.
