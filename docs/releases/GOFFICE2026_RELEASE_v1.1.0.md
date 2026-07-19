# Green Office 2026 Platform

| Field | Value |
|---|---|
| **Version** | 1.1.0 |
| **Release date** | 2026-07-19 |
| **Repository** | https://github.com/numtip/goffice2026 |
| **Production URL** | https://numtip.github.io/goffice2026/ |
| **Git tag** | `v1.1.0` |
| **Commit** | See git tag `v1.1.0` |

---

# Executive Summary

## Purpose

Version 1.1.0 freezes the Green Office 2026 static platform as the official production baseline after production deployment hardening, evidence review, and full Thai localization of user-facing routes.

## Current platform status

- **224** static pages (Thai default + English under `/en/`)
- **7** assessment categories, **24** issues, **65** indicators
- **21** evidence records indexed (**4** indicator-linked pending PO sign-off, **17** category-level unresolved)
- **6** operational resource dashboards (energy, water, fuel, paper, waste, GHG)
- GitHub Pages deployment with automated link and route QA

## Production readiness

The platform is **production-ready for static publication and stakeholder review**. Evidence verification remains **pending Product Owner approval** for four indicator-level mappings. Operational XLSX/CSV source files remain local and are not published to GitHub Pages.

---

# Completed Features

| Feature | Status |
|---|---|
| Landing Page (TH default, responsive) | COMPLETE |
| Bilingual TH/EN (`/` Thai, `/en/` English) | COMPLETE |
| Dashboard (index + 6 resource domains, YoY 2568→2569) | COMPLETE |
| Evidence Center (index + 21 detail pages) | COMPLETE |
| Documents Center (index + 7 category pages) | COMPLETE |
| Search (124 indexed items, client-side filter) | COMPLETE |
| Categories (index + 7 detail pages) | COMPLETE |
| Indicators (65 detail pages) | COMPLETE |
| Responsive UI (desktop, tablet, mobile navigation) | COMPLETE |
| GitHub Pages deployment (`DEPLOY_TARGET=github-pages`) | COMPLETE |
| Production link checker + route smoke tests | COMPLETE |

---

# Architecture Baseline

| Layer | Implementation |
|---|---|
| **Framework** | Astro 4.x static site generation |
| **Styling** | Tailwind CSS |
| **i18n** | Locale dictionaries (`src/data/locales/th.json`, `en.json`), route prefix `/en/` |
| **Evidence** | `src/data/evidence-index.json` v0.5.1, traceability utils, verification states |
| **Dashboard** | Generated JSON (`src/data/generated/`), import pipeline from CSV/XLSX |
| **Documents** | Category-grouped evidence index, shared `EvidenceCard` component |
| **Search** | Build-time index JSON embedded in static page |
| **QA pipeline** | `validate`, `check`, `qa:links`, `qa:routes` npm scripts |

No database, API, or backend services (MVP constitution).

---

# Data Coverage

## Resource metrics (2568 baseline + 2569 partial operational year)

| Domain | Dashboard ID | Baseline source | 2569 status |
|---|---|---|---|
| Water | `water` | `docs/1.1-Water.xlsx` | Partial monthly entry |
| Electricity | `energy` | `docs/1.2-elect.xlsx` | Partial monthly entry |
| Fuel | `fuel` | `docs/1.3_Gassolene.xlsx` | Partial monthly entry |
| Paper | `paper` | `docs/1.4_Paper.xlsx` | Partial monthly entry |
| Waste | `waste` | `docs/1.5_Waste.xlsx` | Partial monthly entry |
| GHG | `ghg` | `docs/1.6_GreenhouseGas.xlsx` | Partial monthly entry |

## Evidence mappings

| Level | Count | Verification |
|---|---|---|
| Indicator-linked (ET-1 promoted) | 4 | `pending` — awaiting PO sign-off |
| Category-linked | 17 | `unresolved` |
| **Total** | **21** | No fabricated approvals |

Indicator mappings (pending): `3.2.2`, `3.1.2`, `4.1.2`, `1.5.1`

Resource-indicator map: `src/data/resource-indicator-map.json` v1.1.0 (validated)

---

# Quality Assurance

| Check | Result (RF-1) |
|---|---|
| `npm run check` | PASS — 0 errors |
| `npm run validate` | PASS — taxonomy, evidence, routes, links |
| `npm run qa:links` | PASS — 2802 unique internal links |
| `npm run qa:routes` | PASS — 32/32 smoke routes |
| `DEPLOY_TARGET=github-pages npm run build` | PASS — 224 pages |

## Production verification

| URL | Status |
|---|---|
| https://numtip.github.io/goffice2026/ | 200 — Thai landing |
| https://numtip.github.io/goffice2026/evidence/ | 200 — Thai evidence hub |
| https://numtip.github.io/goffice2026/dashboard/ | 200 — Thai dashboard |
| https://numtip.github.io/goffice2026/en/ | 200 — English landing |

Operational source files (`docs/*.xlsx`, `data/import/*.csv`) remain **untracked / not published**.

---

# Git History

| Phase | Commit | Description |
|---|---|---|
| **ET-1** | `df34312` | Indicator-level evidence traceability foundation |
| **ET-2** | `d9ae015` | Real source inventory, mapping candidates, review queue |
| **PH-1** | `75064b8` | GitHub Pages production hotfix — links, Thai landing, header |
| **REL-1** | `ba8ac94` | v1.0.1 evidence review — 4 mappings audited, remain pending |
| **UX-TH-1** | `e57d27d` | Thai dashboard and evidence UI wording |
| **UX-TH-2** | `fb53cdc` | Complete Thai localization — evidence content, documents, dashboard |
| **RF-1** | See tag `v1.1.0` | v1.1.0 production baseline freeze |

Prior releases: `v1.0.0` (initial platform), `v1.0.1` (evidence review patch)

---

# Known Limitations

1. **Pending evidence verification** — Four indicator-level mappings require explicit Product Owner approval before `verified` status.
2. **Operational monthly updates** — 2569 dashboard data is partial-year; monthly CSV import is manual via `npm run import:data`.
3. **Placeholder evidence** — 17 of 21 evidence records have no approved source file uploaded yet.
4. **Preview badge** — GitHub Pages shows a preview indicator badge (sub-path deployment).
5. **No authentication** — Static site only; no user login or data entry UI.

---

# Roadmap

| Phase | Focus |
|---|---|
| **GO-1** | Content — approved institutional photos, activity records, campaign summaries |
| **GO-2** | SEO — structured data, sitemap refinement, Open Graph |
| **GO-3** | Performance — asset optimization, lazy loading audit |
| **GO-4** | Accessibility — WCAG audit, keyboard navigation polish |
| **GO-5** | Analytics — privacy-respecting usage metrics |
| **GO-6** | Monthly operation — recurring data import runbook, PO verification workflow |

---

# Freeze Declaration

**Version 1.1.0 is the official Release Baseline.**

- Future development **must branch from** tag `v1.1.0`.
- Major architectural redesign (database, API, backend, framework migration) is **prohibited** unless approved by Product Owner.
- Evidence verification status changes require **documented PO decision** — no automated promotion to `verified`.
- Operational source files remain **local-only** unless explicitly approved for publication.

**Frozen:** 2026-07-19  
**Package version:** `1.1.0`  
**Platform locale metadata:** `site.platform_version` = `1.1.0`
