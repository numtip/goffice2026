# Round 1 Shared Contracts — Frozen Before Parallel Work

**Date:** 2026-07-15
**Start HEAD:** `fc24d7c`
**Branch:** `master`

---

## A. Locale Model

| Lang | Route Base | Default |
|------|-----------|---------|
| Thai (th) | `/` | ✅ Yes |
| English (en) | `/en/` | No |

All future routes mirror this pattern. No `/th/` prefix.

---

## B. Canonical Criteria Data Shape

### categories.json
```json
{
  "categories": [{
    "id": "1",
    "code": "cat1",
    "title": { "th": "...", "en": "..." },
    "summary": { "th": "...", "en": "..." },
    "weight": 25
  }]
}
```

### issues.json
```json
{
  "issues": [{
    "id": "1.1",
    "code": "issue-1-1",
    "categoryCode": "cat1",
    "categoryId": "1",
    "title": { "th": "...", "en": "..." }
  }]
}
```

### indicators.json
```json
{
  "indicators": [{
    "id": "1.1.1",
    "code": "1.1.1",
    "categoryCode": "cat1",
    "categoryId": "1",
    "issueCode": "1.1",
    "title": { "th": "...", "en": "..." },
    "requirementSummary": { "th": "...", "en": "..." },
    "relatedDashboards": ["energy", "water", "fuel", "paper", "waste", "ghg"]
  }]
}
```

---

## C. Route Policy

- Existing routes MUST NOT break
- Homepage design MUST NOT be redesigned
- Dashboard pipeline MUST NOT be modified
- Worker A owns: `src/data/criteria/**`, `scripts/validate-criteria.*`
- Worker B owns: `src/i18n/**`, `src/data/locales/**`, `src/pages/en/**`, index.astro, landing components, Navigation, BaseLayout
- No overlapping edits

---

## D. Shared Naming Conventions

- Indicator codes: `"1.1.1"` (dot-separated)
- Evidence IDs: `"GO-{YEAR}-{INDICATOR}-{SEQ}"`
- Data file names: lowercase with hyphens
- Locale keys: `th`, `en`
- Current categories.json `code` values (`cat1`–`cat7`) preserved

---

## E. File Ownership

### Worker A Only
- `src/data/criteria/categories.json`
- `src/data/criteria/issues.json`
- `src/data/criteria/indicators.json`
- `scripts/validate-criteria.mjs`
- `docs/foundation/GOFFICE2026_CANONICAL_TAXONOMY_REPORT.md`

### Worker B Only
- `src/i18n/dictionary.ts`
- `src/i18n/utils.ts`
- `src/data/locales/th.json`
- `src/data/locales/en.json`
- `src/pages/en/index.astro`
- `src/components/ui/LanguageSwitcher.astro`
- `src/layouts/BaseLayout.astro` (locale metadata)
- `src/components/ui/Navigation.astro` (language switch)
- `src/components/landing/*.astro` (localization refactor)
- `src/pages/index.astro` (localization refactor)
- `docs/foundation/GOFFICE2026_BILINGUAL_FOUNDATION_REPORT.md`

### Neither Worker May Touch
- `src/pages/dashboard/**`
- `src/pages/categories/**`
- `src/pages/documents/**`
- `src/pages/evidence.astro`
- `src/pages/search.astro`
- `src/data/dashboard-*`
- `src/data/generated/**`
- `src/data/csv/**`
- `src/data/evidence-index.json`
- `scripts/import-dashboard-data.mjs`
- `scripts/smoke-routes.mjs`
- `astro.config.mjs`
- `tailwind.config.mjs`
- `package.json`
- `.github/**`

---

## F. Certification vs Performance

Certification taxonomy (7 categories / 24 issues / 65 indicators) and operational performance dimensions (6 dashboards: electricity, water, fuel, paper, waste, ghg) are SEPARATE systems that cross-reference each other.

Do not replace one with the other.
