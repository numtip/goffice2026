# Bilingual TH/EN Foundation — Green Office 2026

**Date:** 2026-07-15  
**Status:** ACTIVE — Canonical Reference  
**Round:** 1 — Foundation  
**Contract:** `docs/foundation/GOFFICE2026_ROUND1_CONTRACTS.md`

---

## 1. Locale Strategy

| Property | Value |
|----------|-------|
| Default locale | Thai (`th`) |
| Supported locales | `th`, `en` |
| Route model | Thai at `/`, English at `/en/` |
| No `/th/` prefix | Thai is the default; no `/th/` route prefix is used |
| Future expansion | Add new locale via new JSON file + route directory |

### Rationale

Thai is the primary audience language. English is provided for international stakeholders, auditors, and executive visibility. The `/en/` prefix keeps English pages directly addressable without redirects or JavaScript.

---

## 2. Route Strategy

### Current Routes

```
/                              → Thai homepage
/en/                           → English homepage
/dashboard/                    → Dashboard hub (Thai)
/en/dashboard/                 → Dashboard hub (English) [future]
/categories/                   → Categories index (Thai)
/en/categories/                → Categories index (English) [future]
/categories/cat1/ … cat7/      → Category detail (Thai)
/en/categories/cat1/ … cat7/  → Category detail (English) [future]
/evidence/                     → Evidence library (Thai)
/en/evidence/                  → Evidence library (English) [future]
/documents/                    → Document center (Thai)
/en/documents/                 → Document center (English) [future]
/search/                       → Search (Thai)
/en/search/                    → Search (English) [future]
```

### How It Works

```typescript
// src/i18n/utils.ts

// Detect locale from URL
getLocale(url) → 'th' | 'en'

// Generate locale-aware paths
getLocalizedPath(locale, path) → '/en/categories' | '/categories'

// Generate language switcher target URL
getSwitcherHref(currentUrl, targetLocale) → '/en/categories' | '/categories'

// Strip locale prefix for canonical path
stripLocalePrefix(pathname) → '/categories' | '/'
```

### GitHub Pages Compatibility

All internal links use `withBase()` from `src/utils/with-base.ts` to prepend the base path (`/goffice2026/`) when deployed to GitHub Pages. No root-relative URLs that would break under subpath deployment.

---

## 3. Content Model

### Pattern

All locale-sensitive data uses the `{ th, en }` bilingual field pattern:

```typescript
interface LocalizedText {
  th: string;
  en: string;
}
```

### Examples

**Categories (canonical taxonomy):**
```json
{
  "id": "1",
  "code": "cat1",
  "title": {
    "th": "การกำหนดนโยบาย การวางแผนการดำเนินงานสำนักงานสีเขียว",
    "en": "Environmental Policy and Green Office Planning"
  },
  "summary": {
    "th": "กำหนดนโยบายสิ่งแวดล้อม แต่งตั้งคณะทำงาน...",
    "en": "Define environmental policy, appoint working teams..."
  }
}
```

**UI Dictionary (locale JSON):**
```json
{
  "home": {
    "hero": {
      "badge": "Precision Environmentalism",
      "cta_dashboard": "Explore Dashboard"
    }
  }
}
```

### Rules

- Machine IDs (`id`, `code`) are **language-neutral** — never use translated labels as primary IDs
- Thai and English labels map to the same canonical entity
- URLs must not become the database identity
- Future API/data migration must remain possible

---

## 4. UI Dictionary System

### Files

| File | Purpose |
|------|---------|
| `src/i18n/dictionary.ts` | Typed locale module with `getDictionary(locale)` loader and in-memory cache |
| `src/data/locales/th.json` | Thai UI strings for all landing scenes |
| `src/data/locales/en.json` | English UI strings for all landing scenes |

### Types

```typescript
// Dictionary shape (src/i18n/dictionary.ts)
interface LocaleStrings {
  site: SiteStrings;
  home: HomeStrings;       // hero, mission, executive, assessment,
                           // evidence, activities, improvement, cta, nav, footer
}

// Loading
const dict = await getDictionary('th' | 'en');
```

### Usage in Components

```astro
---
import type { HomeHeroStrings } from '../../i18n/dictionary';

interface Props {
  t?: HomeHeroStrings;
}

const t = Astro.props.t ?? { /* English defaults */ };
---

<h1>{t.title_line1}</h1>
<p>{t.description}</p>
```

### Adding a New Translation Key

1. Add the string to `src/data/locales/th.json`
2. Add the English equivalent to `src/data/locales/en.json`
3. Add or extend the corresponding TypeScript interface in `src/i18n/dictionary.ts`
4. Pass the subsection via `t` prop to the consuming component

---

## 5. Glossary Policy

### Source

`src/data/i18n/glossary.ts` — canonical bilingual terminology glossary.

### Term Tiers

| Tier | Meaning |
|------|---------|
| `authoritative` | From official Green Office 2569 PDF or source documents |
| `working` | Project-created translation; approved for platform use |
| `review` | Ambiguous term requiring human reviewer decision |

### Rules

- One canonical English term per concept
- Preserve official acronyms (GHG, KPI, etc.)
- Avoid multiple English translations for the same concept
- Record ambiguous terms requiring future human review
- Distinguish official terminology from project-created translations

### Usage

```typescript
import { glossary, getLocalizedTerm } from '../data/i18n/glossary';

glossary.find(g => g.id === 'greenhouse-gas')?.en;   // 'Greenhouse Gas'
getLocalizedTerm('evidence', 'th');                   // 'หลักฐาน'
```

---

## 6. Language Switcher

### Component

`src/components/ui/LanguageSwitcher.astro`

### Behavior

| Page | Switcher Shows |
|------|----------------|
| Thai page (`/categories`) | [**TH**] EN |
| English page (`/en/categories`) | TH [**EN**] |

### Accessibility

- Keyboard navigable (focusable `<a>` elements)
- `aria-current` on active language
- `aria-label` on each link describing the target language
- Screen-reader friendly pill toggle text

### Route Preservation

Switching languages preserves the equivalent page when a mapping exists:
- `/categories` ↔ `/en/categories`
- Falls back to locale home page if equivalent does not exist

### No Dependencies

- No JavaScript runtime required (pure static HTML)
- No localStorage or cookies
- Direct URLs remain canonical

---

## 7. Shared Layout + Metadata

### Component

`src/layouts/BaseLayout.astro`

### Locale-Aware Features

| Feature | Implementation |
|---------|---------------|
| `<html lang>` | `lang={locale}` — `"th"` or `"en"` |
| `<title>` | From dictionary: `dict.site.name + ' - ' + dict.site.title_suffix` |
| `<meta description>` | From dictionary: `dict.home.hero.description` |
| Skip-to-content | Localized via `dict.site.skip_to_content` |
| Navigation labels | Localized via `dict.home.nav` |
| Footer text | Localized via `dict.home.footer` |

### Prop Interface

```typescript
interface Props {
  title?: string;       // Legacy: used by non-landing pages
  locale?: 'th' | 'en'; // New: bilingual support
  dict?: LocaleStrings;  // New: bilingual dictionary
}
```

All non-landing pages can continue using the legacy `title` prop without modification.

---

## 8. Fallback Policy

### UI Translation Missing

If a locale dictionary key is undefined at runtime:
- **Fallback**: Use the Thai value if available
- **Secondary fallback**: Use the hardcoded English default embedded in each component
- **Development**: No runtime crash; missing keys produce empty string

### Content Translation Missing

If bilingual content data lacks a locale field (e.g., issue with only `th` title):
- **Fallback**: Use the Thai canonical content
- **Exposure**: Optional translation status field can be added later
- **Rule**: Never silently invent English content

### Unknown Locale

If an unsupported locale is requested:
- **Fallback**: Resolve to Thai (`th`) as the default
- **No runtime crash**: The `getLocale()` function always returns a valid locale

### Deterministic Behavior

The fallback chain is always: requested locale → Thai → hardcoded default → empty string.

---

## 9. GitHub Pages Compatibility

All bilingual features are verified to work under the GitHub Pages base path (`/goffice2026/`).

| Concern | Solution |
|---------|----------|
| Base path | All internal links use `withBase()` |
| Asset URLs | Astro's built-in base path handling |
| `/en/` route output | Static HTML generated at `/en/index.html` |
| Language switcher links | Generated with `getSwitcherHref()` → uses `withBase()` |
| No server middleware | Fully static — no Node runtime dependency |
| No localStorage | Language is purely URL-based |

---

## 10. How to Add a New Bilingual Page

1. Create the page route (e.g., `src/pages/about.astro`)
2. In the frontmatter, detect locale:
   ```astro
   ---
   import { getLocale } from '../i18n/utils';
   import { getDictionary } from '../i18n/dictionary';
   const locale = getLocale(Astro.url);
   const dict = await getDictionary(locale);
   ---
   ```
3. Pass `locale` and `dict` to `BaseLayout`:
   ```astro
   <BaseLayout locale={locale} dict={dict}>...</BaseLayout>
   ```
4. For the English route, create `src/pages/en/about.astro`:
   ```astro
   ---
   import AboutPage from '../../components/AboutPage.astro';
   <AboutPage locale="en" />
   ---
   ```
5. Use `getLocalizedPath()` for any internal links in the component
6. Add any new UI strings to both `th.json` and `en.json`

---

## 11. How to Add a New Translation Key

1. Add the string to `src/data/locales/th.json` in the appropriate section
2. Add the English equivalent to `src/data/locales/en.json`
3. Update the corresponding TypeScript interface in `src/i18n/dictionary.ts`
4. Use the key via the `t` prop pattern in components

---

## 12. Known Translation Gaps

| Term | Status | Notes |
|------|--------|-------|
| Carbon Neutrality (ความเป็นกลางทางคาร์บอน) | `review` | Verify official 2569 criteria term |
| Net Zero (การปล่อยก๊าซเรือนกระจกสุทธิเป็นศูนย์) | `review` | Verify official 2569 criteria term |
| All 63/65 indicators | Not translated | Official English translations not yet available from source |
| Activity records (full set) | Not translated | Pending content approval |
| Knowledge media articles | Not translated | Pending content creation |

---

## 13. Architecture Summary

```
Locale → URL → getLocale() → dictionary → type-safe t props → components

                          ┌─────────────────────┐
                          │  astro.config.mjs   │
                          │  base: /goffice2026/│
                          └────────┬────────────┘
                                   │
  ┌─────────────────────────────────┼────────────────────────────────┐
  │                        URL Path                                  │
  │   /                   → locale='th'   → th.json                  │
  │   /en/                → locale='en'   → en.json                  │
  └─────────────────────────────────┼────────────────────────────────┘
                                   │
                          ┌────────┴────────────┐
                          │   getDictionary()    │
                          │   src/i18n/          │
                          │   dictionary.ts      │
                          │   utils.ts           │
                          └────────┬────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
     BaseLayout.astro     LandingPage.astro      Navigation.astro
     lang, title, desc    t props for scenes     locale links +
     footer, skip-link    via th.json/en.json    LanguageSwitcher
```
