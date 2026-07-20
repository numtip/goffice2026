# GOFFICE2026 Post-Release Hardening Backlog

**Project:** Green Office 2026  
**Baseline release:** v1.1.1 @ `1c73215` (production RELEASED)  
**Planning phase:** REL-1.1.2-PLANNING  
**Production URL:** https://goffice.mju.ac.th/  
**Date:** 2026-07-20

---

## Executive Summary

Post-release audit of v1.1.1 against the Platform Blueprint V3, Content Architecture V2, and release documentation identifies **12 hardening themes** and **42 backlog items**. Production is stable; defects are **correctness and consistency** issues, not outages.

The hardening backlog prioritizes **bilingual 404 repair**, **dashboard taxonomy alignment**, and **QA gate alignment** before any EP-2 content expansion.

---

## Repository Health Score

| Dimension | Score | Notes |
|-----------|-------|-------|
| Architecture | 8 / 10 | Static Astro SSG, proven deploy pattern |
| Maintainability | 7 / 10 | Validators strong; duplicated EN pages costly |
| Consistency | 6 / 10 | Mapping, status enums, docs diverge |
| Technical debt | 6 / 10 | Concentrated, not blocking operations |
| **Composite** | **7 / 10** | Suitable for patch hardening release |

---

## Quality Score

| Domain | Score | Status |
|--------|-------|--------|
| Accessibility | 7 / 10 | Narrow audit scope in v1.1.1 reports |
| SEO | 8 / 10 | Normal pages strong; 404 hreflang broken |
| Performance | 7 / 10 | 225 pages in ~7.5s build; runtime static-fast |
| PWA | 6 / 10 | Metadata baseline; no service worker |
| Mobile UX | 7 / 10 | Responsive; 404 language switch fails |
| Dashboard | 6 / 10 | Functional with misleading metrics |
| i18n | 7 / 10 | Locale JSON parity; page-tree duplication |
| Security | 8 / 10 | PROD-2 headers; CSP pending |
| **Composite** | **7 / 10** | Hardening improves trust, not uptime |

---

## Post-Release Comparison

### vs Platform Blueprint V3

| Blueprint capability | v1.1.1 status | Hardening action |
|---------------------|---------------|------------------|
| Public Story Platform | Landing operational | EP-2 imagery → v1.2.0 |
| Environmental Performance Portal | 6 dashboards live | Fix category links → v1.1.2 |
| Digital Evidence Navigator | 21 records, mostly placeholder | Verification workflow → v1.2.0 |
| Knowledge & Activity Hub | Not implemented | Static model design → v1.2.0 |
| Bilingual (TH/EN) | Dual routes | 404 parity → v1.1.2; consolidation → v1.2.0 |
| Static-first (no DB) | Compliant | Maintain |

### vs Content Architecture V2

| Architecture element | Expected | Actual | Gap |
|---------------------|----------|--------|-----|
| `/about/*` subtree | 7 pages | Not built | v1.2.0 |
| Dashboard routes | 6 metrics | 6 metrics ✓ | Cross-links wrong |
| Categories cat1–cat7 | Full hub + detail | Built ✓ | EN missing dashboard section |
| Indicators | 65 pages | Built ✓ | TH page hardcoded Thai |
| Evidence | Detail pages | Built ✓ | 17 unresolved |
| Documents | Category folders | Built ✓ | OK |
| Search | Global | Built ✓ | Large duplicated JS |
| Bilingual parity | Equal UX | Partial | v1.1.2 + v1.2.0 |

### vs Release Documentation (v1.1.1)

| Document claim | Verified | Gap |
|----------------|----------|-----|
| SEO/PWA deployed to production | Yes (2026-07-20 deploy) | `/en/404/` known limitation documented |
| 225 pages built | Yes | Runbooks still say 26 |
| Tag at 1c73215 | Yes | Unchanged |
| Rollback to v1.1.0 | v1.1.0 preserved | Ready |
| No service worker | Correct | By design |

---

## Hardening Backlog

### Critical

| ID | Finding | Root cause | Fix | Version |
|----|---------|------------|-----|---------|
| H-001 | `/en/404/` 404 on production | No `en/404.astro`; hreflang advertises missing URL | Add EN 404 page + layout error mode | v1.1.2 |
| H-002 | Dashboard category links wrong | `dashboard-config.ts` / `dashboard-kpi.json` misaligned with `resource-indicator-map.json` | Rewire categoryId values | v1.1.2 |
| H-003 | `npm run validate` FAIL on prod build | `check-production-links.mjs` defaults to GHP base | Auto-detect or document `GHP_BASE=` | v1.1.2 |

### High

| ID | Finding | Fix | Version |
|----|---------|-----|---------|
| H-004 | Overview YoY misleading for partial 2569 data | Suppress or annualize when months < 12 | v1.1.2 |
| H-005 | Detail page "No data" vs heatmap contradiction | Unified dataStatus resolver | v1.1.2 |
| H-006 | EN categories missing "Related Dashboards" | Port section from TH template | v1.1.2 |
| H-007 | TH category links use `withBase` not locale-aware | Switch to `getLocalizedPath` | v1.1.2 |
| H-008 | CI runs build only, not check/validate | Add GitHub Actions quality job | v1.1.2 |
| H-009 | No Node `engines` constraint | Add `"node": ">=20"` | v1.1.2 |
| H-010 | 17/21 evidence items unresolved | PO verification workflow | v1.2.0 |

### Medium

| ID | Finding | Fix | Version |
|----|---------|-----|---------|
| H-011 | Runbook page count stale (26 vs 225) | Update BUILD_VERIFICATION, RUNTIME_QA | v1.1.2 |
| H-012 | CHANGELOG missing v1.1.0/v1.1.1 | Add entries | v1.1.2 |
| H-013 | Domain name drift in docs | Normalize to `goffice.mju.ac.th` | v1.1.2 |
| H-014 | Architecture docs are stubs | Write ARCHITECTURE_OVERVIEW, DATA_FLOW | v1.1.2 |
| H-015 | EN pages use generic meta descriptions | Page-specific descriptions | v1.2.0 |
| H-016 | EN dashboard titles mix Thai | Localize titles | v1.1.2 |
| H-017 | Dual status vocabularies in JSON | Schema unification | v1.1.2 |
| H-018 | Legacy `src/data/categories.json` vs criteria | Deprecate or merge | v1.2.0 |
| H-019 | CSP not in nginx snippet | Add tuned CSP | v1.2.0 |
| H-020 | Manifest Thai-only lang/start_url | Bilingual manifest or document limitation | v1.2.0 |

### Low

| ID | Finding | Fix | Version |
|----|---------|-----|---------|
| H-021 | Dead `src/utils/parse-csv.ts` | Delete | v1.1.2 |
| H-022 | Unused `src/components/home/*` (402 lines) | Delete | v1.1.2 |
| H-023 | `xlsx`, `@astrojs/check` in dependencies | Move to devDependencies | v1.1.2 |
| H-024 | Redundant postcss/autoprefixer deps | Verify and remove if unused | v1.1.2 |
| H-025 | Tailwind primary scale semantic mismatch | Align tokens | v1.2.0 |
| H-026 | `@astrojs/sitemap` pin blocks upgrade | Document; evaluate Astro 5 path | v2.0 |
| H-027 | No Lighthouse CI | Add optional gate | v1.2.0 |
| H-028 | Sitemap lacks hreflang alternates | Enhancement | v1.2.0 |
| H-029 | `apple-mobile-web-app-capable` deprecated meta | Update to mobile-web-app-capable | v1.1.2 |
| H-030 | smoke-routes covers 32 not all EN detail routes | Expand coverage | v1.1.2 |

---

## Broken References & Dead Routes

| Type | Item | Status |
|------|------|--------|
| Broken href | `404.html` → `/en/404/` | Missing target |
| Dead route | `/en/404/` | Returns nginx 404 |
| Blueprint routes | `/about/*` (7 pages) | Not implemented |
| Stale doc reference | `npm run validate:data` in README | Script does not exist |
| Stale doc reference | `greenoffice.mju.ac.th` in ADR-0002 | Domain changed |

---

## Unused / Duplicate Assets

| Category | Items | Action |
|----------|-------|--------|
| Components | `src/components/home/*` (6 files) | Remove |
| Utilities | `src/utils/parse-csv.ts` | Remove |
| Data | `src/data/categories.json` (legacy scores) | Deprecate v1.2.0 |
| CSV | `src/data/csv/*.csv` (old schema) | Document or remove |
| Pages | ~5,294 lines duplicated TH/EN | Consolidate v1.2.0 |

---

## Obsolete Documentation

| Document | Issue | Action |
|----------|-------|--------|
| `docs/runbooks/BUILD_VERIFICATION.md` | 26 pages | Update to 225 |
| `docs/runbooks/RUNTIME_QA.md` | 26 pages | Update |
| `CHANGELOG.md` | Missing 1.1.x | Add entries |
| `docs/architecture/*.md` | Stubs | Expand v1.1.2 |
| `docs/reports/EXECUTIVE_HANDOFF.md` | Pre-v1.1.1 | Refresh v1.2.0 |
| `README.md` | Windows path primary | VPS path documented ✓ |

---

## Stale Configuration

| File | Issue |
|------|-------|
| `package.json` | No engines; misplaced dev deps |
| `validate-platform.mjs` | No build-target awareness |
| `check-production-links.mjs` | GHP_BASE default breaks prod QA |
| `manifest.webmanifest` | Thai-only; no Pages base |
| `tailwind.config.mjs` | primary scale vs brand color |

---

## Dashboard Hardening (6 Metrics)

| Metric | Loading | Charts/Tables | Responsive | Units | Empty state | Error state | Cross-links |
|--------|---------|---------------|------------|-------|-------------|-------------|-------------|
| Water | Static ✓ | Heatmap ✓ | ✓ | m³ ✓ | Fallback ✓ | Contradictory pending | **Wrong cat** |
| Energy | Static ✓ | ✓ | ✓ | kWh ✓ | ✓ | Contradictory | **Wrong cat** |
| Fuel | Static ✓ | ✓ | ✓ | L ✓ | ✓ | Contradictory | **No cat link** |
| Paper | Static ✓ | ✓ | ✓ | kg ✓ | ✓ | Contradictory | **No cat link** |
| Waste | Static ✓ | ✓ | ✓ | % ✓ | ✓ | Contradictory | **Wrong cat** |
| GHG | Static ✓ | ✓ | ✓ | tCO₂e ✓ | ✓ | Contradictory | **Wrong cat** |

**v1.1.2 actions:** H-002, H-004, H-005, H-006, H-007.

---

## Content & i18n Hardening

| Area | Thai | English | Gap |
|------|------|---------|-----|
| Locale JSON keys | 155 | 155 | Parity ✓ |
| Dashboard detail strings | Inline | Inline | Not in JSON — v1.2.0 |
| Indicator pages | Hardcoded TH | Proper EN duplicate | TH not localized |
| Categories dashboard section | Present | **Missing** | v1.1.2 |
| Meta descriptions | Page-specific | Generic fallback | v1.2.0 |
| Document back-link suffix | Empty | "overview" | Asymmetric |

---

## Recommended Scope (v1.1.2)

**In scope (10 items):** H-001 through H-009, H-011, H-012, H-013, H-016, H-021, H-022, H-023, H-029, H-030.

**Estimated effort:** 3–5 engineering days (single agent + QA).

**Out of scope:** EP-2 content, page consolidation, evidence PO workflow, CSP, `/about/*` routes.

---

## Release Recommendation

| Decision | Value |
|----------|-------|
| Recommended milestone | **v1.1.2** |
| Release type | Patch / hardening |
| Production risk | Low (rollback to v1.1.0 ready) |
| Go / No-Go for implementation | **GO** |

---

## Risk Matrix

| ID | Risk | L | I | Mitigation |
|----|------|---|---|------------|
| R1 | 404 regression | L | M | Smoke tests + rollback |
| R2 | Dashboard link change confusion | L | L | Release notes |
| R3 | Scope creep to EP-2 | M | H | Charter lock |
| R4 | CI gate blocks team | M | L | Fix validate first |
| R5 | Partial data fix upsets stakeholders | L | M | Communicate YoY change |

---

## Final Proof (Planning Baseline)

| Field | Value |
|-------|-------|
| Production version | v1.1.1 |
| Production commit | 1c73215 |
| Production path | `/var/www/goffice/releases/v1.1.1` |
| Planning modifies production | **No** |
| Next recommended version | v1.1.2 |

---

*Post-release hardening backlog — planning artifact only. Not committed.*
