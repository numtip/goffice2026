# Green Office 2026 — Round 2 Contracts

**Date:** 2026-07-15  
**Round 1 Baseline Commit:** `75a8b14`  
**Round 2 Starting HEAD:** `75a8b14`  
**Branch:** `master`

---

## 1. Taxonomy Contract (FROZEN)

### Canonical Sources

```
src/data/criteria/categories.json  → 7 categories
src/data/criteria/issues.json      → 24 issues
src/data/criteria/indicators.json  → 65 indicators
```

### Counts

| Entity | Count |
|--------|-------|
| Categories | 7 |
| Issues | 24 (categories 1–6: 22, category 7: 2) |
| Indicators | 65 (categories 1–6: 63, category 7: 2) |

### Per-Category Issue/Indicator Breakdown

| Category | Code | Weight | Issues | Indicators |
|----------|------|--------|--------|------------|
| 1 | cat1 | 25 | 7 | 22 |
| 2 | cat2 | 15 | 2 | 5 |
| 3 | cat3 | 15 | 4 | 13 |
| 4 | cat4 | 15 | 2 | 9 |
| 5 | cat5 | 15 | 5 | 9 |
| 6 | cat6 | 15 | 2 | 5 |
| 7 | cat7 | null (separate) | 2 | 2 |

### Field Map (canonical data)

- `categories[i].code` → route param (e.g. `cat1`)
- `categories[i].title.{th,en}` → display title
- `categories[i].summary.{th,en}` → display summary
- `categories[i].weight` → display (null for cat7 = "separate assessment")
- `categories[6].scoringModel` → Category 7 special handling
- `issues[i].id` → issue id (e.g. `1.1`)
- `issues[i].categoryCode` → parent category
- `indicators[i].code` → indicator route param (e.g. `1.1.1`)
- `indicators[i].issueCode` → parent issue (e.g. `1.1`)
- `indicators[i].categoryCode` → parent category

### Workers must NOT

- Rename IDs, codes, or weights
- Add/remove indicators
- Duplicate taxonomy into dictionaries
- Change scoring rules

### OLD operational data (do NOT use)

`src/data/categories.json` is pre-Round-1 operational data with legacy fields
(`number`, `score`, `purpose`, `criteriaSummary`, `evidenceChecklist`).
Workers must use canonical sources only.

---

## 2. Route Contract (FROZEN)

### Category Routes

```
/categories/            → Category index (all 7)
/categories/cat1/       → Category 1 detail
/categories/cat2/       → Category 2 detail
/categories/cat3/       → Category 3 detail
/categories/cat4/       → Category 4 detail
/categories/cat5/       → Category 5 detail
/categories/cat6/       → Category 6 detail
/categories/cat7/       → Category 7 detail
```

Route param: `code` field from canonical categories (NOT `id` which is `"1"`..`"7"`).

### Indicator Routes (NEW)

```
/indicators/{indicator-code}/
```

Examples: `/indicators/1.1.1/`, `/indicators/7.2.1/`

Route param: `code` field from canonical indicators (same as `id`).

All 65 indicators must produce valid static routes.

---

## 3. Locale Contract (from Round 1, unchanged)

- Default locale: `th`
- Supported: `th`, `en`
- Thai root: `/` (no `/th/` prefix)
- English root: `/en/`
- Content fields: `{ th, en }`
- Round 2 primary delivery: Thai experience
- English optional but all components must accept locale-ready data

---

## 4. Static Site Contract (unchanged)

- Astro 4 with static output
- GitHub Pages compatible
- No SSR, no middleware, no runtime locale service

---

## 5. File Ownership

### Worker A (Category Experience)

- `src/pages/categories/index.astro` (REWRITE)
- `src/pages/categories/[id].astro` (REWRITE — use canonical data)
- New category components under `src/components/categories/`
- May read: `BaseLayout`, `withBase()`, locale helpers, canonical JSON

### Worker B (Indicator Experience)

- `src/pages/indicators/` (CREATE — new directory)
- New indicator components under `src/components/indicators/`
- May read: `BaseLayout`, `withBase()`, locale helpers, canonical JSON, dashboard routes, evidence-index

### Shared (do NOT modify independently)

- `src/layouts/BaseLayout.astro`
- `src/components/ui/Navigation.astro`
- `src/i18n/*`
- Canonical taxonomy JSON
- If shared helper needed → propose to Head → Head assigns ownership

---

## 6. Traceability Contract

```
Category → Issue → Indicator → Related Dashboard → Evidence
```

Round 2 implements the navigational structure:
- Category pages show issues and indicator links
- Indicator pages show parent hierarchy, dashboard links, evidence state

If evidence is unavailable: show placeholder state `"ยังไม่มีหลักฐานที่เชื่อมโยง"`.
Never invent evidence records.

---

## 7. Validation Requirements

Must pass:
- `npm run check`
- `npm run build`
- `node scripts/validate-criteria.mjs`

Route assertions:
- 7 category detail pages
- 65 indicator pages
- No duplicate routes
- No broken category↔indicator links
- Existing dashboard routes intact
- `/` and `/en/` remain intact
