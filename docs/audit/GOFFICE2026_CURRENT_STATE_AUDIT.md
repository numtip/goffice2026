# GOFFICE2026 Current State Audit

**Date:** 2026-07-15
**Auditor:** Cursor Agent (read-only)
**Type:** Repository Implementation Audit — No Code Changes

---

## Executive Summary

The goffice2026 repository is a static-first Astro 4 project building a Green Office Environmental Intelligence Platform for Maejo University. The project is at the EP-2 (Real Content Integration) phase with an approved Design Freeze v1 homepage, a working 6-metric dashboard pipeline, and 21 evidence placeholder records. The working tree is clean. No build or type errors. The repository is structurally sound but has significant content gaps — all evidence is placeholder-classified, approved imagery is absent, and many target routes (about, indicators, activities, knowledge, evidence detail pages) are not yet implemented.

**Overall assessment:** Architecture is solid. Content is the primary gap. 26 routes verified. Build passes.

---

## Repository Baseline

| Field | Value |
|-------|-------|
| Path | `f:\projectAi\goffice2026` |
| Branch | `master` |
| HEAD | `5e1d11a` |
| HEAD message | `feat: advance EP-2 readiness — evidence UX, data provenance, pipeline templates, context` |
| Origin | `https://github.com/numtip/goffice2026.git` |
| Working tree | **Clean** (no uncommitted changes) |
| Package manager | npm (package-lock.json present) |
| Node version (CI) | 20 |
| Astro version | `^4.0.0` |
| Tailwind version | `^3.4.0` |
| TypeScript version | `^5.4.0` |
| Build status | ✅ Passing (`astro check` + `astro build`) |
| Preview URL | `https://numtip.github.io/goffice2026/` |
| Production URL | `greenoffice.mju.ac.th` (manual VPS, not updated) |

---

## Current Architecture

```
Static Astro 4 (output: 'static')
├── Tailwind CSS 3.4 (Design tokens in tailwind.config.mjs)
├── Data: JSON + CSV + Markdown (No DB, no API, no backend)
├── 1 layout: BaseLayout.astro
├── 20 components (8 landing, 6 home/dashboard, 2 UI, 1 evidence, 3 dashboard)
├── 9 page files → 27+ distinct routes
├── 6 generated multi-year JSON data files
├── Client-side JS only on search page (vanilla, no framework)
└── Deploy: GitHub Actions → GitHub Pages (preview) / Manual VPS (production)
```

**Principle compliance:**
- ✅ Static First — all data is JSON/CSV/MD
- ✅ No Database/API/Backend in MVP
- ✅ Markdown First for knowledge
- ✅ GitHub is Source of Truth
- ✅ Reuse Before Build (component architecture)
- ⚠️ Chunk Not Dump — KB docs are still placeholders
- ⚠️ One Source, Many Views — evidence not yet multi-view

---

## Route Inventory

### Implemented and functional routes

| Route | Source File | Status |
|-------|------------|--------|
| `/` | `src/pages/index.astro` | ✅ Implemented (Design Freeze v1 homepage) |
| `/dashboard` | `src/pages/dashboard.astro` | ✅ Implemented (KPI hub) |
| `/dashboard/energy` | `src/pages/dashboard/[id].astro` | ✅ Implemented |
| `/dashboard/water` | `src/pages/dashboard/[id].astro` | ✅ Implemented |
| `/dashboard/fuel` | `src/pages/dashboard/[id].astro` | ✅ Implemented |
| `/dashboard/paper` | `src/pages/dashboard/[id].astro` | ✅ Implemented |
| `/dashboard/waste` | `src/pages/dashboard/[id].astro` | ✅ Implemented |
| `/dashboard/ghg` | `src/pages/dashboard/[id].astro` | ✅ Implemented |
| `/categories` | `src/pages/categories/index.astro` | ✅ Implemented |
| `/categories/cat1`–`cat7` | `src/pages/categories/[id].astro` | ✅ Implemented (7 routes) |
| `/evidence` | `src/pages/evidence.astro` | ✅ Implemented (21 placeholder items) |
| `/documents` | `src/pages/documents.astro` | ✅ Implemented (static preview landing) |
| `/documents/cat1`–`cat7` | `src/pages/documents/[id].astro` | ✅ Implemented (7 routes, placeholder content) |
| `/search` | `src/pages/search.astro` | ✅ Implemented (client-side evidence search) |

**Total functional routes: 27** (1 + 7 dashboard + 1 + 7 categories + 1 evidence + 8 documents + 1 search)

### Target routes not yet implemented

| Target Route | Status | Notes |
|-------------|--------|-------|
| `/about` | ❌ Missing | No about page exists |
| `/about/scope` | ❌ Missing | |
| `/about/policy` | ❌ Missing | |
| `/about/goals` | ❌ Missing | |
| `/about/committee` | ❌ Missing | |
| `/about/action-plan` | ❌ Missing | |
| `/about/certification` | ❌ Missing | |
| `/about/feedback` | ❌ Missing | |
| `/indicators/[indicator-code]` | ❌ Missing | No indicator detail pages |
| `/evidence/[evidence-id]` | ❌ Missing | No evidence detail pages |
| `/activities/[slug]` | ❌ Missing | Activities content model not defined |
| `/knowledge/[slug]` | ❌ Missing | Knowledge base pages not built |

---

## Component Inventory

### Landing Components (Design Freeze v1)

| Component | Path | Reuse Status |
|-----------|------|-------------|
| `LandingHero` | `src/components/landing/LandingHero.astro` | ✅ Active — hero section |
| `MissionScene` | `src/components/landing/MissionScene.astro` | ✅ Active — mission |
| `AssessmentFramework` | `src/components/landing/AssessmentFramework.astro` | ✅ Active — 7 categories overview |
| `ExecutiveCommandCenter` | `src/components/landing/ExecutiveCommandCenter.astro` | ✅ Active — dashboard preview terminal |
| `ImprovementJourney` | `src/components/landing/ImprovementJourney.astro` | ✅ Active — performance story |
| `EvidenceGateway` | `src/components/landing/EvidenceGateway.astro` | ✅ Active — evidence landing preview |
| `ActivitiesScene` | `src/components/landing/ActivitiesScene.astro` | ✅ Active — activities with placeholder cards |
| `LandingCTA` | `src/components/landing/LandingCTA.astro` | ✅ Active — CTA |

### Home Components

| Component | Path | Reuse Status |
|-----------|------|-------------|
| `Hero` | `src/components/home/Hero.astro` | ⚠️ Duplicate — separate home hero, may overlap with LandingHero |
| `CategoryCard` | `src/components/home/CategoryCard.astro` | ✅ Reusable on categories page |
| `MetricCard` | `src/components/home/MetricCard.astro` | ✅ Reusable for KPI display |
| `DashboardPreview` | `src/components/home/DashboardPreview.astro` | ✅ Used on homepage |
| `EvidencePreview` | `src/components/home/EvidencePreview.astro` | ✅ Used on homepage |
| `SectionHeader` | `src/components/home/SectionHeader.astro` | ✅ Reusable section header |

### Dashboard Components

| Component | Path | Reuse Status |
|-----------|------|-------------|
| `DashboardKpiCard` | `src/components/dashboard/DashboardKpiCard.astro` | ✅ Reusable KPI card |
| `DashboardDataTable` | `src/components/dashboard/DashboardDataTable.astro` | ✅ Reusable on all 6 dashboards |
| `Sparkline` | `src/components/dashboard/Sparkline.astro` | ✅ Mini chart, reusable |

### Other Components

| Component | Path | Reuse Status |
|-----------|------|-------------|
| `EvidenceCard` | `src/components/evidence/EvidenceCard.astro` | ✅ Used on evidence + search pages |
| `Navigation` | `src/components/ui/Navigation.astro` | ✅ Global nav |
| `PreviewBadge` | `src/components/ui/PreviewBadge.astro` | ✅ Preview badge for GitHub Pages |

### Components NOT yet existing

- No chart components (Chart.js, D3, or similar)
- No KPI trend/comparison card
- No indicator detail component
- No activity/news card component
- No knowledge base card component
- No evidence detail page component
- No about page components
- No pagination component

---

## Content and Data Inventory

### Data Files

| File | Type | Lines/Items | Status |
|------|------|------------|--------|
| `src/data/categories.json` | JSON | 7 categories | ✅ Complete — scores, descriptions, evidence checklists |
| `src/data/dashboard-kpi.json` | JSON | 9 KPIs (7 scores + fuel + paper) | ✅ Complete |
| `src/data/evidence-index.json` | JSON | 21 items | ⚠️ ALL placeholder status |
| `src/data/dashboard-config.ts` | TS | 6 dashboard metas | ✅ Complete |
| `data/json/navigation.json` | JSON | Nav structure | ✅ Complete |
| `src/data/csv/energy.csv` | CSV | 12-month data | ✅ |
| `src/data/csv/water.csv` | CSV | 12-month data | ✅ |
| `src/data/csv/fuel.csv` | CSV | 12-month data | ✅ |
| `src/data/csv/paper.csv` | CSV | 12-month data | ✅ |
| `src/data/csv/waste.csv` | CSV | 12-month data | ✅ |
| `src/data/csv/ghg.csv` | CSV | 12-month data | ✅ |
| `src/data/generated/energy.json` | JSON | Multi-year (2568+2569) | ✅ Generated from CSV |
| `src/data/generated/water.json` | JSON | Multi-year | ✅ Generated |
| `src/data/generated/fuel.json` | JSON | Multi-year | ✅ Generated |
| `src/data/generated/paper.json` | JSON | Multi-year | ✅ Generated |
| `src/data/generated/waste.json` | JSON | Multi-year | ✅ Generated |
| `src/data/generated/ghg.json` | JSON | Multi-year | ✅ Generated |

### Content Types Present

| Type | Implementation | Status |
|------|---------------|--------|
| Category → Issue | ❌ Not implemented | Only category level; no sub-issues defined |
| Issue → Indicator | ❌ Not implemented | No indicators defined |
| Indicator → Evidence | ❌ Not implemented | Evidence links to categories only, not indicators |
| Evidence ↔ Dashboard | ⚠️ Partial | Evidence metadata exists but all placeholders; dashboards have data but no evidence links |
| Evidence ↔ Activity | ❌ Not implemented | No activity content type |
| Knowledge | ❌ Not implemented | No knowledge pages |

### Content Status

| Content Area | Status |
|-------------|--------|
| Category content | ✅ 7 categories with scores and descriptions |
| Dashboard data | ✅ 6 metrics with multi-year data |
| Evidence records | ⚠️ 21 placeholder records; no actual files |
| Activities/News | ❌ Placeholder cards only; no content model |
| Knowledge base | ❌ Not implemented |
| Images | ❌ Placeholder CDN URLs; no local Maejo imagery |
| Document Center | ❌ Static preview only; M365 integration is EP-3 |

---

## Dashboard Pipeline

### Data Flow (Current Implementation)

```
Staff Excel → Manual CSV conversion → scripts/import-dashboard-data.mjs
    ├── data/import/{metric}-{year}.csv (source CSV for import)
    └── src/data/generated/{metric}.json (canonical multi-year JSON)
            ↓
    src/pages/dashboard/[id].astro (build-time import)
            ↓
    Static HTML (dist/)
```

### Pipeline Status by Metric

| Metric | 2568 Baseline | 2569 Current | Pipeline |
|--------|--------------|-------------|----------|
| Energy | 12/12 months ✅ | 8/12 months 🟡 | CSV → JSON → Dashboard |
| Water | 12/12 months ✅ | 6/12 months 🟡 | CSV → JSON → Dashboard |
| Fuel | 12/12 months ✅ | 9/12 months 🟡 | CSV → JSON → Dashboard |
| Paper | 12/12 months ✅ | 6/12 months 🟡 | CSV → JSON → Dashboard |
| Waste | 12/12 months ✅ | 10/12 months 🟡 | CSV → JSON → Dashboard |
| GHG | 12/12 months ✅ | 8/12 months 🟡 | CSV → JSON → Dashboard |

### Pipeline Features

- ✅ Multi-year schema with TypeScript types (`src/utils/multi-year-schema.ts`)
- ✅ YoY change computation (absolute, percent, direction)
- ✅ Data status tracking (complete/in_progress/missing)
- ✅ Import script with validation (`scripts/import-dashboard-data.mjs`)
- ✅ Dry-run validation mode
- ✅ CSV templates in `data/import/templates/`
- ✅ Import documentation in `data/import/README.md`
- ✅ Month completeness visualization on dashboard overview
- ✅ Partial-year caveat banners
- ✅ Source provenance metadata (source field in generated JSON)
- ⚠️ 2569 data is varying completeness across metrics
- ❌ No automated Excel→CSV conversion (manual step)
- ❌ Target/baseline comparison not linked to indicator detail pages

---

## Green Office Taxonomy Coverage

### Target: 7 Categories · 24 Issues · 65 Indicators

| Level | Target | Implemented | Coverage |
|-------|--------|------------|----------|
| Categories | 7 | 7 | **100%** |
| Issues | 24 | 0 | **0%** |
| Indicators | 65 | 0 | **0%** |

### Category Alignment

| # | Repo Category | Criteria Reference | Match |
|---|--------------|-------------------|-------|
| 1 | Energy Management | หมวดที่ 3 การใช้ทรัพยากรและพลังงาน | ⚠️ Mapping divergence — energy + resource in same category |
| 2 | Water Management | หมวดที่ 3 การใช้ทรัพยากรและพลังงาน | ⚠️ Same category mapping issue |
| 3 | Waste Management | หมวดที่ 4 การจัดการของเสีย | ✅ |
| 4 | GHG Emissions | หมวดที่ 5 สภาพแวดล้อมและความปลอดภัย | ⚠️ Criteria labels differ |
| 5 | Indoor Environmental Quality | — | ⚠️ Needs criteria cross-reference |
| 6 | Transportation | — | ⚠️ Needs criteria cross-reference |
| 7 | Innovation and Additional Features | — | ⚠️ Needs criteria cross-reference |

### Key Gap

- Repository has operational KPI categories (6 resource dashboards) mapped into 7 certification categories
- No canonical indicator codes (e.g., "3.2.2")
- No sub-issue decomposition
- No indicator detail pages
- Evidence links to categories, not to specific indicators
- Criteria reference is a placeholder (only category names)

---

## Evidence System Maturity

### Current Level: **LEVEL 1 — Files + Basic Metadata**

Evidence for this classification:

- ✅ **LEVEL 0 (files):** `public/documents/` directories exist (cat1–cat7 with placeholder.md files)
- ✅ **LEVEL 1 (basic metadata):** `evidence-index.json` with 21 items containing: id, title, description, year, fileType, categoryId, indicator (label only), path, status, updated
- ❌ **LEVEL 2 (searchable):** Search exists but limited to evidence-index content only; cannot search indicator codes
- ❌ **LEVEL 3 (linked to indicators):** No indicator system exists
- ❌ **LEVEL 4 (linked to indicators + dashboards + history):** Not implemented

### Evidence Statistics

| Property | Value |
|----------|-------|
| Total items | 21 |
| Placeholder items | 21 (100%) |
| Actual documents | 0 |
| Categories covered | 7 (cat1–cat7, 3 items each) |
| Years represented | 2024 (3 items), 2025 (18 items) |
| File types referenced | MD (7), PDF (10), XLSX (4) |
| Evidence detail pages | None |
| Indicator linking | Label-only (text string, not code) |
| Year metadata | Present |
| Status metadata | All "placeholder" |
| Document registry | Via evidence-index.json |

---

## Search Capability

### Current Implementation

- **Method:** Client-side JavaScript filtering (vanilla, no framework)
- **Source:** `src/pages/search.astro` (inline script)
- **Indexed content:** evidence-index.json (21 items)
- **Search fields:** title, indicator label, description, category title, year
- **Filters:** Category dropdown, year dropdown
- **Interactive features:** `/` keyboard shortcut to focus search input
- **Zero-dependency:** No search library loaded

### Search Coverage

| Domain | Searchable | Notes |
|--------|-----------|-------|
| Evidence titles | ✅ | |
| Evidence descriptions | ✅ | |
| Category names | ✅ | Via filter + free text |
| Years | ✅ | Filter widget |
| Indicator codes (e.g., "3.2.2") | ❌ | No indicator codes exist |
| Dashboard data | ❌ | Not indexed |
| Activities/News | ❌ | Not implemented |
| Knowledge articles | ❌ | Not implemented |
| Document metadata | ❌ | All placeholders |
| Full-text document content | ❌ | No actual documents |

### Search Maturity

- Architecture: Client-side static (correct for MVP stack)
- Scalability: Adequate for current 21 items; would need optimization at 200+ items
- Missing: Debounced input, URL query param sync, no-result telemetry

---

## Homepage Current State

### Against Impact-First Target

| # | Target Section | Current State |
|---|---------------|---------------|
| 1 | Hero | ✅ **Exists** — `LandingHero.astro` |
| 2 | Environmental Pulse | ⚠️ **Partial** — `ExecutiveCommandCenter.astro` preview terminal shows dashboard preview; not live environmental pulse |
| 3 | 7 Green Office Dimensions | ✅ **Exists** — `AssessmentFramework.astro` with 7 categories |
| 4 | Performance Story | ✅ **Exists** — `ImprovementJourney.astro` |
| 5 | Featured Action / Project | ❌ **Missing** — no featured action section |
| 6 | Latest Evidence | ⚠️ **Partial** — `EvidenceGateway.astro` shows placeholder-classified evidence |
| 7 | Activities & Knowledge | ⚠️ **Partial** — `ActivitiesScene.astro` with source-pending cards |
| 8 | Trust / Footer | ✅ **Exists** — Integrated in BaseLayout + Navigation |

### Existing Sections Worth Preserving

- `MissionScene.astro` — mission statement (not in target but adds institutional value)
- `AssessmentFramework.astro` — well-structured 7-category overview with scores
- `ExecutiveCommandCenter.astro` — dashboard preview terminal with KPI + completeness heatmap
- All 8 landing components are Design Freeze v1 approved — **do not redesign without PO approval**

---

## Build / CI / Deployment

### Build

| Aspect | Status |
|--------|--------|
| Build command | `npm run build` → `astro build` |
| Type check | `npm run check` → `astro check` |
| QA commands | `npm run qa:build`, `npm run qa:runtime`, `npm run qa:routes` |
| Import pipeline | `npm run import:data`, `npm run import:validate` |
| Current build result | ✅ 0 type errors, 0 build errors (per PROJECT_MEMORY) |
| Lint | ❌ No lint command defined |
| Test | ❌ No test framework or commands |

### CI Workflow

| Field | Value |
|-------|-------|
| Workflow file | `.github/workflows/deploy-pages.yml` |
| Trigger | Push to `master` + manual |
| Steps | Checkout → Setup Node 20 → npm ci → Build (with Pages env) → Upload artifact → Deploy |
| Deploy target | GitHub Pages (`/goffice2026/` base) |
| Production | Manual VPS deploy (not automated) |

### Configuration

| File | Purpose |
|------|---------|
| `astro.config.mjs` | Static output, dual deploy mode (local vs GitHub Pages), Tailwind integration |
| `tailwind.config.mjs` | Custom color tokens (primary, secondary, surface, inverse), typography scale, spacing |
| `tsconfig.json` | Extends `astro/tsconfigs/strict` |
| `.gitignore` | Excludes node_modules, dist, .astro, logs, .env |

### Performance Risks

- ⚠️ Placeholder CDN imagery may cause layout shift / loading delays
- ⚠️ Google Stitch CDN references may be unavailable or slow
- ⚠️ No image optimization pipeline (WebP, responsive sizes) verified as implemented
- ⚠️ No Lighthouse CI integration
- ⚠️ Target: Lighthouse ≥ 95, Homepage < 2s — not verified in this audit

### Accessibility

- ⚠️ `A11Y_REVIEW.md` runbook exists but state of current compliance unknown
- ⚠️ Navigation uses `overflow-x-auto` on mobile — may impact keyboard navigation
- ✅ `sr-only` labels present on search page
- ✅ Semantic HTML structure in landing components

---

## Reusable Assets

### Architecture Reuse

- `BaseLayout.astro` — single layout; can support all future pages
- `Navigation.astro` — one nav component used globally
- Dashboard KPI card pattern — reusable across all dashboards
- Dashboard data table — generic component consuming config
- Category card — reusable across category index + homepage
- Evidence card — reusable across evidence + search + homepage
- Section header — generic reusable component
- Multi-year schema (TypeScript) — strong type foundation for all dashboards
- Import pipeline script — extensible to new metrics
- CSV templates — ready for new data sources

### Data Reuse

- 7 categories with full metadata (scores, descriptions, evidence checklists)
- 6 dashboard configs with complete meta
- Multi-year data structure (2568 baseline + 2569 current) — reusable for future years
- Evidence metadata schema (21 items) — extensible template

---

## Legacy / Duplicate / Risk Areas

### Duplicates

- `src/components/home/Hero.astro` vs `src/components/landing/LandingHero.astro` — two hero components
- `src/data/csv/` directory contains CSV files that may be superseded by `data/import/` + generated JSON
- `.sample.csv` files in `data/csv/` vs actual CSV files — potential confusion

### Placeholder/Stub Content

- `docs/KB/GREENOFFICE_2569_CRITERIA.md` — placeholder (category names only)
- `docs/KB/GREENOFFICE_DASHBOARD_SPEC.md` — placeholder
- `docs/KB/GREENOFFICE_CONTENT_MODEL.md` — minimal (content type names only)
- `docs/KB/GREENOFFICE_EVIDENCE_MODEL.md` — placeholder
- `docs/architecture/ARCHITECTURE_OVERVIEW.md` — one-line placeholder
- `docs/architecture/DATA_FLOW.md` — one-line placeholder
- `public/documents/cat*/placeholder.md` — 7 placeholder files

### Missing Assets

- No approved Maejo imagery in `public/images/`
- Googlestitch directory (`data/import/googlestitch/`) referenced in PROJECT_MEMORY but not present on disk
- External CDN references in landing components may break

### Risk Areas

| Risk | Severity | Detail |
|------|----------|--------|
| Placeholder evidence | High | All 21 items marked placeholder; no real documents linked |
| Missing imagery | Medium | Landing components reference external CDN; no fallback |
| Incomplete 2569 data | Low | Varying month completeness across metrics |
| KB docs are stubs | Medium | Key reference docs are placeholders |
| No indicator system | Medium | Cannot link evidence to specific indicators |
| No about/contact pages | Low | Institutional credibility gap |
| 2 hero components | Low | Potential maintenance burden |

---

## Verified Facts

| # | Fact | Evidence |
|---|------|----------|
| 1 | Working tree is clean | `git status --porcelain` returns empty |
| 2 | 9 Astro page files produce 27+ routes | `src/pages/` file list |
| 3 | 6 dashboard metrics have multi-year data | `src/data/generated/*.json` (6 files) |
| 4 | 21 evidence items, all placeholder | `src/data/evidence-index.json` |
| 5 | 7 categories defined with scores | `src/data/categories.json` |
| 6 | GitHub Pages CI deploys on push to master | `.github/workflows/deploy-pages.yml` |
| 7 | Astro 4 + Tailwind 3.4 + TS 5.4 | `package.json` |
| 8 | Design Freeze v1 approved | PROJECT_MEMORY.md |
| 9 | 26/26 routes verified (per PROJECT_MEMORY) | EP-2 Readiness Advancement notes |
| 10 | No database, API, or backend in MVP | Constitution + package.json |
| 11 | 0 indicators defined | No indicator code files or data |
| 12 | 0 issues/sub-categories defined | categories.json has no issue decomposition |
| 13 | 20 Astro components | File system count |

---

## Unknowns Requiring Follow-up

1. **Reference documents:** `GOFFICE2026_NEW_PROJECT_MASTER_REFERENCE.md`, `GREENOFFICE2026_PLATFORM_BLUEPRINT_V3.md`, `GOFFICE2026_CONTENT_ARCHITECTURE_V2.md` — not found in repo or at specified path. May exist on GitHub or external storage.
2. **Current build result:** Not run during this audit (per task constraints). Relies on PROJECT_MEMORY claim of 0 errors.
3. **Lighthouse score:** Not measured in this audit. Target is ≥ 95.
4. **Homepage load time:** Not measured. Target is < 2 seconds.
5. **Mobile responsiveness:** Not visually verified. Responsive CSS patterns exist in components.
6. **Actual 2569 data provenance:** Generated JSON files show 2569 data but source Excel files are not in repo (kept on shared drive). Data accuracy not verified.
7. **Google Stitch CDN availability:** Landing components reference external URLs not verified during audit.
8. **Tailwind v3.4 vs v4:** Package specifies `^3.4.0`; actual installed version depends on `package-lock.json`.
9. **Green Office 2569 official criteria:** Not available locally. Category mapping inferred from PROJECT_MEMORY and migration audit.
10. **Production VPS state:** Not checked. Known to not be updated during preview sprints.
