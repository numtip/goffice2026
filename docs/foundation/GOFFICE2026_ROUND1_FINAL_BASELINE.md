# Green Office 2026 — Round 1 Final Baseline

**Date:** 2026-07-15  
**Status:** CANONICAL CURRENT — Round 1 Closed  
**Repository:** `numtip/goffice2026`  
**Local path:** `f:\projectAi\goffice2026`

---

## 1. Repository State

| Property | Value |
|----------|-------|
| Branch | `master` |
| Starting HEAD | `fc24d7c` (chore: add master reference pack) |
| Final HEAD | `fc24d7c` (working tree dirty — uncommitted Round 1 changes) |
| Working tree | Dirty — all changes are Round 1 closure artifacts |

### File Classification

| Category | Files |
|----------|-------|
| Worker A (new) | `src/data/criteria/categories.json`, `src/data/criteria/issues.json`, `src/data/criteria/indicators.json`, `scripts/validate-criteria.mjs` |
| Worker A (doc) | `docs/foundation/GOFFICE2026_CANONICAL_TAXONOMY_REPORT.md` |
| Worker B (i18n) | `src/i18n/dictionary.ts`, `src/i18n/utils.ts` |
| Worker B (locales) | `src/data/locales/th.json`, `src/data/locales/en.json` |
| Worker B (glossary) | `src/data/i18n/glossary.ts` |
| Worker B (routes) | `src/pages/en/index.astro`, `src/components/landing/LandingPage.astro` |
| Worker B (UI) | `src/components/ui/LanguageSwitcher.astro` |
| Worker B (modified) | `BaseLayout.astro`, `Navigation.astro`, `index.astro`, all 8 landing components |
| Worker B (docs) | `docs/i18n/BILINGUAL_FOUNDATION.md`, `docs/i18n/BILINGUAL_QA_REPORT.md` |
| Head (doc) | `docs/foundation/GOFFICE2026_ROUND1_CONTRACTS.md`, `docs/foundation/GOFFICE2026_ROUND1_FOUNDATION_REPORT.md`, `docs/foundation/GOFFICE2026_ROUND1_FINAL_BASELINE.md` |
| Untouched | `src/pages/dashboard/**`, `src/pages/categories/**`, `src/pages/documents/**`, `src/pages/evidence.astro`, `src/pages/search.astro`, `src/data/dashboard-*`, `src/data/generated/**`, `src/data/csv/**`, `src/data/evidence-index.json`, `scripts/import-dashboard-data.mjs`, `scripts/smoke-routes.mjs`, `astro.config.mjs`, `tailwind.config.mjs`, `package.json`, `.github/**` |

---

## 2. Canonical Architecture Decisions

### Locale Model

| Property | Value |
|----------|-------|
| Default locale | Thai (`th`) |
| Supported locales | `th`, `en` |
| Thai route | `/` (no `/th/` prefix) |
| English route | `/en/` |
| Content pattern | `{ th, en }` bilingual fields |
| Fallback chain | requested locale → Thai → hardcoded default → empty string |

### Route Strategy

```
/                              → Thai homepage
/en/                           → English homepage
/dashboard/                    → Dashboard hub (Thai)
/categories/                   → Categories index (Thai)
/categories/cat1/ … cat7/      → Category detail (Thai)
/evidence/                     → Evidence library (Thai)
/documents/                    → Document center (Thai)
/search/                       → Search (Thai)
```

All routes work under GitHub Pages base path (`/goffice2026/`). English equivalents for non-landing pages deferred to future rounds.

### Scoring Model

| Category | Weight | Notes |
|----------|--------|-------|
| cat1 — การกำหนดนโยบาย การวางแผนการดำเนินงานสำนักงานสีเขียว | 25 | Main assessment |
| cat2 — การสื่อสารและสร้างจิตสำนึก | 15 | Main assessment |
| cat3 — การใช้ทรัพยากรและพลังงาน | 15 | Main assessment |
| cat4 — การจัดการของเสีย | 15 | Main assessment |
| cat5 — สภาพแวดล้อมและความปลอดภัย | 15 | Main assessment |
| cat6 — การจัดซื้อและจัดจ้าง | 15 | Main assessment |
| cat7 — การดำเนินงานสำนักงานสีเขียวเพื่อความต่อเนื่อง | Separate | Renewal/upgrade only; internal: 7.1=40, 7.2=60 |

No artificial sum-to-100 is applied across all 7 categories. Categories 1–6 constitute the main assessment. Category 7 is a separate continuity assessment.

---

## 3. Taxonomy Baseline

| Dimension | Count | Status |
|-----------|-------|--------|
| Categories | 7 | ✅ Canonical |
| Issues | 24 | ✅ Canonical |
| Indicators | 65 | ✅ Canonical |
| Bilingual titles | All categories, issues, indicators | ✅ TH/EN |
| Dashboard cross-refs | 12 indicators tagged | ✅ |

### Data Files

| File | Records |
|------|---------|
| `src/data/criteria/categories.json` | 7 categories with TH/EN titles, summaries, weights |
| `src/data/criteria/issues.json` | 24 issues with TH/EN titles, category links |
| `src/data/criteria/indicators.json` | 65 indicators with TH/EN titles, requirement summaries, dashboard refs |

### Validator

`scripts/validate-criteria.mjs` — enforces:
- Exactly 7 categories, 24 issues, 65 indicators
- Reference integrity (issue→category, indicator→issue→category)
- No duplicate codes or IDs
- Required bilingual fields present
- Valid dashboard references
- Exact official weights (cat1=25, cat2–cat6=15)
- Category 7 separate assessment (weight=null, internalWeighting 40/60)

---

## 4. Bilingual Baseline

### Architecture

| Component | Location | Purpose |
|-----------|----------|---------|
| Dictionary | `src/i18n/dictionary.ts` | Typed `getDictionary()` loader with cache |
| Utilities | `src/i18n/utils.ts` | Locale detection, path localization, switcher |
| Thai strings | `src/data/locales/th.json` | All landing scene strings |
| English strings | `src/data/locales/en.json` | All landing scene strings |
| Glossary | `src/data/i18n/glossary.ts` | 73 entries (39 authoritative, 32 working, 2 review) |
| Language switcher | `src/components/ui/LanguageSwitcher.astro` | TH\|EN pill toggle, accessible |
| Shared template | `src/components/landing/LandingPage.astro` | Locale-aware landing composition |
| EN route | `src/pages/en/index.astro` | English homepage |

### Modified Components

| Component | Localization |
|-----------|-------------|
| `BaseLayout.astro` | `lang`, title, description, nav, footer — all locale-aware |
| `Navigation.astro` | Locale-aware nav labels + LanguageSwitcher |
| All 8 landing components | Accept `t` prop with English fallback defaults |

### Glossary Coverage

| Tier | Count | Description |
|------|-------|-------------|
| Authoritative | 39 | Official 2569 PDF terms |
| Working | 32 | Project-created translations |
| Review | 2 | Terms requiring human verification (Carbon Neutrality, Net Zero) |

---

## 5. Validated Routes

| Route | Status | Notes |
|-------|--------|-------|
| `/` (TH homepage) | ✅ PASS | `lang="th"`, Thai metadata, Thai nav |
| `/en/` (EN homepage) | ✅ PASS | `lang="en"`, English metadata, English nav |
| `/dashboard/` | ✅ PASS | Unchanged |
| `/dashboard/energy/` `/water/` `/fuel/` `/paper/` `/waste/` `/ghg/` | ✅ PASS | Unchanged |
| `/categories/` | ✅ PASS | Unchanged |
| `/categories/cat1/`–`cat7/` | ✅ PASS | Unchanged |
| `/evidence/` | ✅ PASS | Unchanged |
| `/documents/` | ✅ PASS | Unchanged |
| `/documents/cat1/`–`cat7/` | ✅ PASS | Unchanged |
| `/search/` | ✅ PASS | Unchanged |

**Total:** 27 pages built (26 existing + 1 new `/en/`)

---

## 6. Validation Results

| Gate | Command | Result |
|------|---------|--------|
| Typecheck | `npm run check` | **PASS** (0 errors, 0 warnings, 3 pre-existing hints) |
| Build | `npm run build` | **PASS** (27 pages, 1.72s) |
| Taxonomy | `node scripts/validate-criteria.mjs` | **PASS** (7/24/65, all weights correct) |

### Taxonomy Validator Output

```
=== CRITERIA VALIDATION REPORT ===

Categories: 7
Issues: 24
Indicators: 65

Official Category Weights:
  cat1: 25 PASS
  cat2: 15 PASS
  cat3: 15 PASS
  cat4: 15 PASS
  cat5: 15 PASS
  cat6: 15 PASS

Category 7:
  separate assessment
  7.1: 40
  7.2: 60

RESULT: PASS ✓
```

---

## 7. Known Limitations

1. **Non-landing pages not yet bilingual**: English equivalents for `/dashboard/`, `/categories/`, `/evidence/`, `/documents/`, `/search/` deferred to future rounds.
2. **Indicator translations**: The 63/65 indicator English texts are working translations; official English source not yet available.
3. **Activity content**: Placeholder text in both languages; real content requires PO-approved source materials.
4. **English language content**: The English landing page is a platform translation; authoritative English content from the university is not yet available.
5. **Hreflang metadata**: Not implemented; deferred until more routes have bilingual equivalents.
6. **Category 7 scoring sub-criteria**: The 9 scoring sub-items (7.1.1–7.1.5, 7.2.1–7.2.4) exist in the official criteria as internal scoring rubrics but are not modeled as canonical indicators in the JSON. They are available in the Master Reference and can be implemented as a scoring/rubric data model in a future round.
7. **No real evidence files**: Evidence records remain placeholder-classified pending PO-approved source documents.
8. **No Maejo imagery**: Hero and activity sections use CDN placeholders pending approved local assets.
9. **No about pages**: 8 planned about routes not yet created.

---

## 8. Deferred Work

| Item | Reason | Target |
|------|--------|--------|
| Bilingual non-landing routes | Requires page component extraction | Round 2+ |
| Indicator detail pages | Requires template | Round 2 |
| Evidence detail pages | Requires template + real evidence | Round 2+ |
| Category/About pages | Content not yet created | Round 2+ |
| Hreflang metadata | Insufficient bilingual route coverage | After 50% route bilingual |
| 63/65 indicator official EN translations | No authoritative source | Content team |
| Real activity content | PO approval pending | Content team |
| Real imagery | PO approval pending | Content team |
| Production VPS deploy | PO approval + GitHub release | After Round 2 QA |

---

## 9. Canonical Document List

### CANONICAL CURRENT

| Document | Path |
|----------|------|
| Round 1 Shared Contracts | `docs/foundation/GOFFICE2026_ROUND1_CONTRACTS.md` |
| Canonical Taxonomy Report | `docs/foundation/GOFFICE2026_CANONICAL_TAXONOMY_REPORT.md` |
| Round 1 Final Baseline | `docs/foundation/GOFFICE2026_ROUND1_FINAL_BASELINE.md` (this file) |
| Bilingual Foundation | `docs/i18n/BILINGUAL_FOUNDATION.md` |
| Bilingual QA Report | `docs/i18n/BILINGUAL_QA_REPORT.md` |

### SUPERSEDED HISTORICAL

| Document | Path | Notes |
|----------|------|-------|
| Round 1 Foundation Report | `docs/foundation/GOFFICE2026_ROUND1_FOUNDATION_REPORT.md` | Pre-dates weight correction; historical workflow record only |
| Audit — Current State | `docs/audit/GOFFICE2026_CURRENT_STATE_AUDIT.md` | Round 0 audit |
| Audit — Gap Analysis | `docs/audit/GOFFICE2026_CURRENT_STATE_GAP_ANALYSIS.md` | Round 0 audit |

---

## 10. Worker Conflict Assessment

| Check | Result |
|-------|--------|
| Taxonomy bilingual fields conform to locale model | ✅ `{ th, en }` pattern consistent |
| Locale keys are exactly th/en | ✅ |
| Canonical IDs remain language-neutral | ✅ (`id`, `code` fields unaffected) |
| Glossary does not replace canonical taxonomy | ✅ Separate concern |
| UI dictionary does not duplicate taxonomy | ✅ Taxonomy is data; dictionary is UI strings |
| English landing is not a disconnected second site | ✅ Shared `LandingPage.astro` template |
| Existing routes remain intact | ✅ 27 routes verified |
| Dashboard pipeline untouched | ✅ |
| No forbidden file ownership collision | ✅ Worker A/B ownership respected |
| No overlapping edits | ✅ |

**Verdict:** No integration conflicts detected.

---

## 11. ROUND 1 CLOSED

Canonical foundations established:

1. **Canonical Green Office 2569 taxonomy** — 7 categories, 24 issues, 65 indicators, official scoring model, bilingual TH/EN data
2. **Bilingual TH/EN foundation** — locale model, routing, UI dictionary, glossary, language switcher, documentation

All validation gates pass.

---

## 12. Recommended Round 2 Workstream

### Recommendation: **A — Category & Indicator Experience**

**Why:** The canonical taxonomy (7/24/65) and bilingual foundation (TH/EN) both exist. The next logical step is to make the taxonomy visible and navigable as real pages.

**Scope:**
- Build canonical category detail page (`/categories/cat1/`–`/categories/cat7/`) using the taxonomy JSON
- Build canonical indicator routing (`/indicators/1.1.1/`–`/indicators/7.2/`)
- Build indicator detail page with the canonical template:
  - Indicator code + title
  - Requirement summary
  - Related dashboards (cross-reference)
  - Evidence list (placeholder-aware)
  - Responsible team
- Update category index page to link to indicator pages
- Bilingual: apply existing locale model to these new pages

**Alignment with product principles:**
- **SHOW** → Makes the 7 Green Office dimensions visible as navigable content
- **PROVE** → Creates the canonical link between indicators and evidence (traceability)
- Reuses existing: `categories.json`, `issues.json`, `indicators.json`, locale model, `BaseLayout`, `Navigation`
- Does NOT touch: dashboard pipeline, evidence pipeline, search, deployment

**Boundary:**
- Starts with Thai; English routing can follow as a sub-task
- Evidence detail pages deferred (need real evidence files first)
- Dashboard integration (linking indicators → dashboards) deferred
- Search enhancement deferred

### Alternative Ordering

| Priority | Workstream | Dependency | Risk |
|----------|-----------|------------|------|
| **A** | Category & Indicator Experience | ✅ Taxonomy exists, bilingual exists | Low |
| B | Dashboard Integration | Needs indicator pages first | Medium |
| C | Evidence Navigator | Needs indicator pages + real evidence | High |
| D | Search & Discovery | Needs indicator/evidence pages | High |
| E | Broader Bilingual Routes | Needs page components first | Low |

**A is the smallest safe increment** that builds on both completed foundations.
