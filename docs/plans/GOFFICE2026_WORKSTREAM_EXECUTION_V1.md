# GOFFICE2026 Workstream Execution Plan V1

**Date:** 2026-07-27  
**Basis:** Blueprint V4, Rapid Completion Plan V1, Day 1 foundation  
**Model:** Parallel workstreams on feature branches — Head Agent integrates after validation

---

## Git Workflow (effective immediately)

| Rule | Detail |
|------|--------|
| Integration branch | `master` — Head Agent only |
| Worker branches | `rapid/ws-<name>` (e.g. `rapid/ws-data`) |
| Worker commits | On feature branch only — never direct to `master` |
| Merge gate | `npm run data:check` + `npm run build` + `npm run validate` pass |
| Day 1 on master | Accepted as baseline (`b171ab5`…`d2e05fa`) |

---

## WS-A — Data & Dashboard

| Field | Value |
|-------|-------|
| **Owner** | Data Worker |
| **Branch** | `rapid/ws-data` |
| **Write boundary** | `data/`, `src/data/generated/`, `scripts/*data*`, dashboard data bindings only |
| **Dependencies** | PO supplies official FY2569 XLSX/CSV imports |
| **Acceptance** | FY2568 baselines preserved; FY2569 shows only verified official data; targets set only after PO confirmation; `data:check` pass |
| **Next task** | Import official FY2569 workbooks when PO delivers → `extract-xlsx-to-csv` → `data:build` → update `reconciliation-status.json` |

---

## WS-B — Evidence & SharePoint

| Field | Value |
|-------|-------|
| **Owner** | Evidence Worker |
| **Branch** | `rapid/ws-evidence` |
| **Write boundary** | `src/data/evidence*`, `src/data/document*`, `docs/evidence/` |
| **Dependencies** | SharePoint metadata export; PO privacy review for PDFs |
| **Acceptance** | Indicator-linked metadata for published set; SharePoint URL contract populated; no approval engine; broken published links = 0 |
| **Next task** | Map remaining 14 unpublished evidence slots to registry candidates; populate `sharePointUrl` where known |

---

## WS-C — About & Core Content

| Field | Value |
|-------|-------|
| **Owner** | Content Worker |
| **Branch** | `rapid/ws-about` |
| **Write boundary** | `src/pages/about/`, `src/pages/en/about/`, `src/data/about/`, related i18n |
| **Dependencies** | WS-B PDF publication paths; PO redaction approval |
| **Acceptance** | Scope, action-plan, feedback, certification routes (TH/EN); OCR summaries flagged; PDFs in `public/` after redaction |
| **Next task** | Create `/about/scope/` and `/about/action-plan/` TH/EN routes using existing `document-summaries.json` |

---

## WS-D — Landing, News & Activities

| Field | Value |
|-------|-------|
| **Owner** | Content Worker (shared with WS-C, non-overlapping files) |
| **Branch** | `rapid/ws-landing` |
| **Write boundary** | `src/pages/index.astro`, `src/pages/en/index.astro`, `src/components/landing/`, news/activities/knowledge routes, locale strings |
| **Dependencies** | WS-A KPI truthfulness for landing KPI preview |
| **Acceptance** | Landing answers what/where/evidence; real news/activity set; knowledge route exists TH/EN |
| **Next task** | Replace ActivitiesScene preview cards with first approved activity records when PO provides content |

---

## WS-E — QA, SEO & Release

| Field | Value |
|-------|-------|
| **Owner** | QA/Release Worker (Head Agent for integration) |
| **Branch** | `rapid/ws-qa` |
| **Write boundary** | `docs/qa/`, validation scripts, SEO metadata, release notes — no feature rewrites |
| **Dependencies** | WS-A–D merge candidates |
| **Acceptance** | Mobile/a11y pass; sitemap/canonical complete; GitHub Pages preview accepted; production smoke test |
| **Next task** | Run full platform validation after each WS merge; maintain `RAPID_COMPLETION_*_REPORT.md` per integration |

---

## Parallel Start Order

```text
Phase 1 (immediate, no file conflicts):
  WS-A (data)  ║  WS-B (evidence)  ║  WS-C (about scope/action-plan)

Phase 2 (after WS-A truthfulness stable):
  WS-D (landing/news) — depends on KPI preview accuracy

Phase 3 (continuous):
  WS-E — validates each merge; gates release
```

**Head Agent** creates branches, assigns tasks, merges in order: A/B/C → D → E validation.

---

## PO Decisions Required

1. Deliver official FY2569 operational data files (all 6 resources)
2. Confirm per-person targets for dashboard linking (FY2568 announcement values)
3. Approve PDF redaction for public About/evidence publication
4. Confirm distinct document for indicator 1.4.2 (committee role understanding)
5. Provide certification PDF and first news/activity content for WS-D

---

## Out of Scope (all WS)

- Approval engine / Power Automate workflows
- Database/API/backend services
- Direct production VPS edits
