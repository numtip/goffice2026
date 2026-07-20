# GOFFICE2026 REL-1.1.2 — Implementation Report

**Date:** 2026-07-20  
**Baseline:** v1.1.1 @ `33bb924` (freeze)  
**Implementation HEAD:** `2483803`  
**Version:** 1.1.2  
**Scope:** Hardening patch (REL-1.1.2-IMPLEMENT)

---

## Summary

REL-1.1.2 corrects bilingual 404 defects, dashboard taxonomy cross-links, data-status UI contradictions, and CI/QA drift. No production deploy, tags, or architecture expansion.

---

## Changes Delivered

| ID | Item | Status |
|----|------|--------|
| M1 | `/en/404/` page + shared `NotFound.astro` + error-page hreflang/switcher | Done |
| M2 | Dashboard `categoryId` aligned to `resource-indicator-map.json` | Done |
| M3 | Unified `data-status.ts` resolver for dashboard UI | Done |
| M4 | Partial-year YoY guard on overview cards | Done |
| M5 | `engines: node >=20` + GHP_BASE auto-detect | Done |
| M6 | Smoke/validate/SEO QA extended for 404 routes | Done |
| U1 | EN categories "Related Dashboards" section | Done |
| U2 | TH category/indicator links → `getLocalizedPath` | Done |
| I1 | CI quality job: check + test + validate + qa:seo | Done |
| M9 | Dead code removed (`parse-csv.ts`, `components/home/*`) | Done |
| M10 | `@astrojs/check`, `xlsx` → devDependencies | Done |

---

## Category Mapping Corrections

| Metric | Before | After |
|--------|--------|-------|
| energy | cat1 | cat3 |
| water | cat2 | cat3 |
| fuel | (none) | cat3 |
| paper | (none) | cat3 |
| waste | cat3 | cat4 |
| ghg | cat4 | cat1 |

---

## QA Results

| Command | Result |
|---------|--------|
| `npm run check` | PASS (0 errors) |
| `npm test` | PASS (13/13) |
| `npm run build` | PASS (226 pages) |
| `GHP_BASE= npm run validate` | PASS |
| `npm run qa:seo` | PASS (25 checks) |
| `npm run qa:links` | PASS (2824 links) |
| `npm run qa:routes` | PASS (34/34 routes) |

---

## Known Issues (Deferred)

- 17/21 evidence items unresolved (v1.2.0 PO workflow)
- EN dashboard detail still duplicates TH template strings inline
- `apple-mobile-web-app-capable` meta not yet migrated (H-029)
- Bilingual page tree consolidation (U4) deferred to v1.2.0
- Runbook page-count reconciliation (M7) not in this implementation pass

---

## Preflight Verdict

**GO** — All acceptance gates pass on production-target build. Ready for tag `v1.1.2` and VPS deploy per existing runbook.

---

*Implementation artifact — commit SHA recorded below after push.*
