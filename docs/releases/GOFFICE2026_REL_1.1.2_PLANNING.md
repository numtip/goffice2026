# GOFFICE2026 REL-1.1.2 — Engineering Plan

**Project:** Green Office 2026 — Environmental Intelligence & Evidence Platform  
**Phase:** REL-1.1.2-PLANNING (planning only — no production changes)  
**Repository:** https://github.com/numtip/goffice2026  
**Production baseline:** v1.1.1 @ `1c73215` (RELEASED)  
**Freeze commit:** `33bb924`  
**Production URL:** https://goffice.mju.ac.th/  
**Planning date:** 2026-07-20

---

## Executive Summary

Green Office 2026 v1.1.1 is **stable in production**. SEO, metadata, and PWA baseline shipped successfully from tag `1c73215`. REL-1.1.2 should be a **hardening and correctness release**, not a feature expansion.

The highest-value work corrects **known bilingual 404 defects**, **dashboard category cross-link errors**, **data-status UI contradictions**, and **QA/documentation drift**. These are low-risk maintenance items with clear acceptance criteria and rollback to v1.1.0.

EP-2 content integration (real imagery, activities model, evidence verification) belongs in **v1.2.0** due to PO dependency and scope.

**Recommendation:** **GO** for REL-1.1.2 implementation as a patch/hardening release.

---

## Repository Health Score

| Dimension | Score | Summary |
|-----------|-------|---------|
| **Architecture** | 8 / 10 | Static-first Astro 4 SSG, clear data layers, locked preview/production split, 225-page build scale |
| **Maintainability** | 7 / 10 | Strong validators and runbooks; bilingual page duplication and stale docs increase change cost |
| **Consistency** | 6 / 10 | Dashboard mappings, status vocabularies, and domain references diverge across files |
| **Technical debt** | 6 / 10 | Manageable for MVP; concentrated in i18n duplication, dead code, CI gaps |
| **Overall** | **7 / 10** | Production-ready platform with targeted hardening needed before content scale-up |

---

## Production Stability

| Item | Status |
|------|--------|
| Active release | `/var/www/goffice/releases/v1.1.1` |
| Symlink | `/var/www/goffice/current` → v1.1.1 |
| Rollback target | v1.1.0 preserved |
| Health script | PASS at cutover |
| Runtime routes | 200 on primary TH/EN routes |
| Known defect | `/en/404/` returns 404; Thai error page served for all misses |

Production is **stable**. REL-1.1.2 planning does not require emergency rollback.

---

## Architecture Review

### Strengths

- Astro 4 static SSG with TypeScript strict mode
- Data pipeline: CSV import → generated JSON → build-time pages
- Taxonomy integrity: 7 categories, 24 issues, 65 indicators validated
- Central metadata via `src/config/site-meta.ts` and `BaseLayout.astro`
- Release discipline: tag-based VPS deploy, isolated worktree pattern proven in v1.1.1

### Gaps vs Blueprint / Content Architecture

| Blueprint expectation | Current state | Gap |
|----------------------|---------------|-----|
| 4 capabilities (Show, Measure, Prove, Improve) | Landing + dashboard + evidence + search present | `/about/*` subtree not implemented |
| Bilingual parity | Dual page trees (`/` and `/en/`) | Feature drift (EN categories missing dashboard section) |
| Evidence traceability | 21 records, structural PASS | 17/21 unresolved verification |
| Document Center | Preview/link-out only | Correct per constitution — no gap |
| Performance portal | 6 metric dashboards | Category cross-links miswired |

### Build pipeline

| Stage | Tooling | Gap |
|-------|---------|-----|
| Install | `npm ci` | No `engines` field — Node 20 not enforced in repo |
| Check | `npm run check` | Not in GitHub Actions CI |
| Validate | `npm run validate` | Link check fails on prod build without `GHP_BASE=` |
| Build | `astro build` | CI runs Pages build only |
| Deploy | Manual VPS + symlink | Documented in release notes; no in-repo VPS runbook |

---

## Known Issues

### P0 — `/en/404/` (confirmed)

| Field | Detail |
|-------|--------|
| **Root cause** | Single `src/pages/404.astro` builds `dist/404.html`; `BaseLayout` hreflang and language switcher generate `/en/404/` via `getLocalizedPath()`, but no `src/pages/en/404.astro` exists |
| **Impact** | Broken hreflang; EN users see Thai 404; language switcher hits second 404 |
| **Fix scope** | **v1.1.2** — Low-risk maintenance |
| **Solution** | (1) Add `src/pages/en/404.astro` or shared NotFound component; (2) error-page mode in layout — switcher targets `/` ↔ `/en/`; (3) extend QA to cover 404 routes |

### P0 — Dashboard category cross-links (confirmed)

| Metric | Wired `categoryId` | Correct (per `resource-indicator-map.json`) |
|--------|-------------------|-----------------------------------------------|
| energy | cat1 | cat3 |
| water | cat2 | cat3 |
| waste | cat3 | cat4 |
| ghg | cat4 | cat1 |
| fuel, paper | none | cat3 |

**Impact:** Auditors and users navigate to wrong certification categories. **Fix scope: v1.1.2.**

### P1 — Data status UI contradictions

- Generated JSON uses `CURRENT_DATA_PENDING` with 6–10 months of data
- Overview shows YoY; detail page shows "No data" / pending badges
- Two status vocabularies: import script vs hand-authored JSON

**Fix scope: v1.1.2** (resolver + UI alignment).

### P2 — Documentation drift

- Runbooks cite 26 pages; build produces 225
- CHANGELOG stops at 0.2.0
- Domain references mix `goffice.mju.ac.th` and `greenoffice.mju.ac.th`
- Architecture docs are stubs

**Fix scope: v1.1.2** (doc reconciliation).

---

## Quality Audit Summary

| Area | Score | Priority findings |
|------|-------|-------------------|
| Accessibility | 7 / 10 | 404/search PASS; charts/contrast not audited |
| SEO | 8 / 10 | Strong on normal pages; 404 hreflang broken |
| Performance | 7 / 10 | Static SSG fast; external fonts; no Lighthouse CI |
| PWA | 6 / 10 | Manifest + icons; no SW (by design); Thai-only manifest lang |
| Mobile UX | 7 / 10 | Responsive layout; language switcher breaks on 404 |
| Header navigation | 8 / 10 | Sticky header, bilingual toggle works on normal pages |
| Dashboard rendering | 6 / 10 | Renders but misleading YoY and wrong category links |
| Error handling | 5 / 10 | 404 bilingual gap; no locale-aware server error routing |
| Security headers | 8 / 10 | PROD-2 hardened; CSP not implemented |

---

## Technical Debt Register

| Item | Risk | Complexity | Expected gain | Milestone |
|------|------|------------|---------------|-----------|
| Fix `/en/404/` | Low | Low | SEO + UX + QA green | v1.1.2 |
| Dashboard category mapping | Low | Low | Auditor trust | v1.1.2 |
| Data status resolver | Medium | Medium | Dashboard truthfulness | v1.1.2 |
| Suppress partial-year YoY on overview | Low | Low | Data honesty | v1.1.2 |
| CI: add `check` + `validate` | Low | Low | Regression prevention | v1.1.2 |
| `engines: node >=20` | Low | Trivial | Reproducible builds | v1.1.2 |
| `validate-platform` GHP_BASE auto-detect | Low | Low | Correct prod QA | v1.1.2 |
| Remove dead code (`parse-csv.ts`, `components/home/*`) | Low | Low | Cleaner repo | v1.1.2 |
| Move `xlsx`, `@astrojs/check` to devDeps | Low | Low | Dependency hygiene | v1.1.2 |
| Consolidate TH/EN page trees | Medium | High | 50% page maintenance reduction | v1.2.0 |
| Evidence verification (17 unresolved) | Medium | Medium | Certification readiness | v1.2.0 |
| EP-2 real content / imagery | Medium | High | Executive review unblock | v1.2.0 |
| CSP header | Medium | Medium | Security hardening | v1.2.0 |
| Search scale / backend | High | High | Performance at scale | v2.0 |

---

## REL-1.1.2 Scope Proposal

### Maintenance (Low-risk — primary v1.1.2 scope)

| ID | Task | Priority | Effort | Risk | Dependencies |
|----|------|----------|--------|------|--------------|
| M1 | Fix `/en/404/` + layout error mode | Critical | S | Low | None |
| M2 | Correct dashboard `categoryId` in config + KPI JSON | Critical | S | Low | None |
| M3 | Unified `dataStatus` resolver for dashboard UI | High | M | Low | M2 optional |
| M4 | Partial-year YoY guard on overview | High | S | Low | M3 |
| M5 | Add `engines` + align validate with prod `GHP_BASE` | High | S | Low | None |
| M6 | Extend smoke/QA for 404 and hreflang | High | S | Low | M1 |
| M7 | Reconcile runbooks (225 pages, domain, scripts) | Medium | M | Low | None |
| M8 | Update CHANGELOG for v1.1.0–v1.1.2 | Medium | S | Low | None |
| M9 | Remove dead utilities and legacy home components | Low | S | Low | None |
| M10 | Dependency cleanup (devDeps) | Low | S | Low | None |

### UX

| ID | Task | Priority | Effort | Risk | Milestone |
|----|------|----------|--------|------|-----------|
| U1 | Port "Related Dashboards" to EN categories | High | S | Low | v1.1.2 |
| U2 | Fix `withBase` → `getLocalizedPath` on TH category/indicator links | High | S | Low | v1.1.2 |
| U3 | EN dashboard titles (remove Thai suffix) | Medium | S | Low | v1.1.2 |
| U4 | Consolidate bilingual page trees | Medium | XL | Medium | v1.2.0 |

### Performance

| ID | Task | Priority | Effort | Milestone |
|----|------|----------|--------|-----------|
| P1 | Self-host or preload fonts | Medium | M | v1.2.0 |
| P2 | Lighthouse CI gate | Medium | M | v1.2.0 |

### SEO

| ID | Task | Priority | Effort | Milestone |
|----|------|----------|--------|-----------|
| S1 | 404 hreflang fix | Critical | S | v1.1.2 |
| S2 | Page-specific EN meta descriptions | Medium | M | v1.2.0 |
| S3 | Sitemap hreflang alternates | Low | M | v1.2.0 |

### Accessibility

| ID | Task | Priority | Effort | Milestone |
|----|------|----------|--------|-----------|
| A1 | Dashboard chart accessible summaries | Medium | M | v1.2.0 |
| A2 | Color contrast audit (header/nav) | Medium | M | v1.2.0 |

### Dashboard

| ID | Task | Priority | Effort | Milestone |
|----|------|----------|--------|-----------|
| D1 | Category mapping fix | Critical | S | v1.1.2 |
| D2 | Status resolver + badge alignment | High | M | v1.1.2 |
| D3 | Migrate dashboard detail strings to locale JSON | Medium | L | v1.2.0 |
| D4 | Import script schema merge (provenance preservation) | Medium | M | v1.2.0 |

### Content

| ID | Task | Priority | Effort | Milestone |
|----|------|----------|--------|-----------|
| C1 | Evidence verification backlog (17 items) | High | L | v1.2.0 |
| C2 | EP-2 imagery and activities model | High | XL | v1.2.0 |
| C3 | `/about/*` routes per content architecture | Medium | L | v1.2.0 |

### Infrastructure

| ID | Task | Priority | Effort | Milestone |
|----|------|----------|--------|-----------|
| I1 | CI: `check` + `validate` on PR/push | High | S | v1.1.2 |
| I2 | In-repo VPS deploy runbook | Medium | S | v1.1.2 |
| I3 | CSP header (nginx snippet) | Medium | M | v1.2.0 |

### Developer Experience

| ID | Task | Priority | Effort | Milestone |
|----|------|----------|--------|-----------|
| X1 | Architecture doc stubs → real overviews | Medium | M | v1.1.2 |
| X2 | Shared NotFound + locale-aware layout patterns | Medium | M | v1.1.2 |

---

## Priority Matrix

```
              IMPACT
         Low    Med    High
       ┌──────┬──────┬──────┐
   Low │ M9   │ M7   │ M1   │
EFFORT     │ M10  │ M8   │ M2   │
       ├──────┼──────┼──────┤
   Med │ X1   │ M3   │ I1   │
       │      │ U1   │ D2   │
       ├──────┼──────┼──────┤
  High │      │ U4   │ C2   │
       │      │ C1   │      │
       └──────┴──────┴──────┘
```

**v1.1.2 sweet spot:** Top-right quadrant — high impact, low effort (M1, M2, M4, M5, M6, U1, U2).

---

## Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| 404 fix breaks Thai 404 | Low | Medium | Pre-switch smoke + rollback to v1.1.0 |
| Dashboard mapping confuses users mid-release | Low | Low | Deploy as atomic release; no partial deploy |
| CI validate blocks merges | Medium | Low | Fix GHP_BASE detection before enabling CI gate |
| Scope creep into EP-2 | Medium | High | Strict v1.1.2 charter: maintenance only |
| Bilingual consolidation regression | Medium | High | Defer to v1.2.0 with dedicated QA |

---

## Roadmap

### v1.1.2 — Hardening Patch (recommended next)

**Theme:** Correctness, QA gates, documentation truth.

**Includes:** M1–M10, U1–U3, I1, I2, X1, X2 (404 component only).

**Excludes:** EP-2 content, page tree consolidation, CSP, evidence PO workflow.

**Why here:** Known production defects with low risk and clear acceptance tests. Keeps production trustworthy while v1.1.1 is fresh.

### v1.2.0 — Content & UX Release

**Theme:** EP-2 integration, bilingual consolidation, evidence quality.

**Includes:** U4, C1–C3, D3–D4, P1–P2, A1–A2, S2–S3, I3.

**Why here:** Requires PO decisions, content assets, and larger refactors unsuitable for a patch.

### v2.0 — Platform Evolution

**Theme:** Scale, optional backend, Document Center integration depth.

**Includes:** Search indexing at scale, activities CMS, API if constitution exception approved, major architecture shifts.

**Why here:** Violates current static-first MVP unless PO approves.

---

## Release Recommendation

| Field | Recommendation |
|-------|----------------|
| **Next version** | v1.1.2 |
| **Type** | Patch / hardening |
| **Branch** | `master` (no release branch) |
| **Tag source** | New commit after M1–M6 + QA pass |
| **Deploy source** | Tag `v1.1.2` from isolated worktree |
| **Production change** | None during planning phase |
| **Go / No-Go** | **GO** for implementation |

### Acceptance criteria for v1.1.2 release

1. `GHP_BASE= npm run validate` PASS on production build
2. `/en/404/` returns 200 with English content OR switcher no longer links there with verified hreflang
3. Dashboard category links match `resource-indicator-map.json`
4. `ops/prod2/health-check.sh` PASS after deploy
5. Rollback to v1.1.0 verified (readiness only)
6. Release notes + CHANGELOG updated

---

## Out of Scope (REL-1.1.2 Planning)

- Production deploy or configuration changes
- Release branch creation
- Tag creation or movement
- Feature implementation beyond Low-risk Maintenance
- Joomla legacy archive modifications (except read-only reference)

---

*Planning artifact — not committed per REL-1.1.2-PLANNING instructions.*
