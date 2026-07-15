# Green Office 2026 — Release v1.0.0

**Release Date:** 2026-07-16
**Baseline Commit:** `7fb3182`
**Release Commit:** `[set during commit]`

---

## Key Capabilities

| Capability | Status |
|---|---|
| Canonical Taxonomy (7 categories, 24 issues, 65 indicators) | CANONICAL AND FROZEN |
| Bilingual TH/EN Platform | COMPLETE |
| Category & Indicator Detail Pages | COMPLETE |
| Dashboard Pages (6 resource domains) | COMPLETE |
| Evidence Traceability (21 records, category-level) | SYSTEM-VALIDATED |
| Search & Discovery | COMPLETE |
| Resource-Indicator Mapping (6 domains to 10 indicators) | CANONICAL AND VALIDATED (v1.1.0) |
| Full Bilingual Route Expansion (208 static pages) | COMPLETE |
| UX/Accessibility/SEO Audit | COMPLETE |

---

## 2568 Real Baseline Integration

All 6 dashboard metrics now source from real operational XLSX files:

| Metric | Baseline Value | Unit | Source Workbook |
|--------|---------------|------|-----------------|
| Water Consumption | 8,337.5 | m³ | `docs/1.1-Water.xlsx` |
| Electricity Consumption | 403,036.8 | kWh | `docs/1.2-elect.xlsx` |
| Fuel Consumption | 339.83 | L | `docs/1.3_Gassolene.xlsx` |
| Paper Consumption | 2,197.80 | kg | `docs/1.4_Paper.xlsx` |
| Waste Recycling Rate | ~21.57% | % | `docs/1.5_Waste.xlsx` |
| GHG Emissions | 231.60 | tCO₂e | `docs/1.6_GreenhouseGas.xlsx` |

**Status:** SYSTEM-VALIDATED AND FROZEN (automated extraction pipeline verified; human data-owner sign-off not yet recorded)

---

## Resource-Indicator Mapping

- **Version:** v1.1.0 — CANONICAL AND VALIDATED
- Every mapped indicator code confirmed against canonical `indicators.json` (existence, title, parent issue, parent category, relatedDashboard)
- Automated validator: `scripts/validate-resource-indicator-map.mjs`
- **Note:** This is a structural mapping; evidence remains at category-level/unresolved

---

## Evidence Status

- 21 evidence records in total
- All at `traceabilityLevel: "category"`, `verification.status: "unresolved"`
- 0 exact indicator-level mappings
- 4 records SYSTEM-VALIDATED with real source files
- 17 placeholders (no real source file)
- HUMAN REVIEW REQUIRED before exact indicator-level promotion
- Pending review queue: `docs/evidence/GOFFICE2026_EVIDENCE_REVIEW_QUEUE.md`

---

## Validation Results

| Check | Result |
|---|---|
| `npm run validate` — Phase 1: Taxonomy | PASS (7/24/65) |
| `npm run validate` — Phase 1.5: Resource-Indicator Map | PASS (10 indicators) |
| `npm run validate` — Phase 2: Evidence | PASS (21 records, unresolved) |
| `npm run validate` — Phase 3: Routes | PASS (208 static routes) |
| `astro check` | 0 errors, 0 warnings |
| `astro build` | 208 pages |
| SHA-256 freeze hashes | 6/6 match |

---

## Known External Dependencies

- Operational XLSX files remain in `docs/` (internal — not published to GitHub Pages)
- Git LFS not configured for binary files
- 2569 target values not yet established (status: TARGET_PENDING_APPROVAL)
- 2569 current data not yet available (status: CURRENT_DATA_PENDING)
- Human baseline verification not yet recorded
- Production VPS (greenoffice.mju.ac.th) is separate from GitHub Pages preview

---

## GitHub Pages Preview

- **URL:** https://numtip.github.io/goffice2026/
- **Deployment:** Automatic via `.github/workflows/deploy-pages.yml` (push to master)
- **Status:** LIVE (verified via runtime checks)
- **Routes verified:** homepage, /dashboard/ (water, energy, ghg, +3), /categories/, /evidence/, /search/, /en/ — all HTTP 200 with real baseline data

---

## Document Versions

| Document | Version |
|---|---|
| `GOFFICE2026_BASELINE_FREEZE.md` | v1.1.0 |
| `GOFFICE2026_RESOURCE_INDICATOR_MAPPING.md` | v1.1.0 |
| `src/data/resource-indicator-map.json` | v1.1.0 |
| `package.json` | v1.0.0 |
