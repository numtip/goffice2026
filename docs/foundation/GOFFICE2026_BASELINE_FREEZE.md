# GOFFICE2026 Baseline Freeze — 2568

**Status:** VERIFIED AND FROZEN
**Freeze Date:** 2026-07-15
**Platform:** Green Office 2026 (goffice2026)
**Reference:** `docs/foundation/GOFFICE2026_FINAL_PLATFORM_BASELINE.md`

---

## 1. Freeze Declaration

The **2568 baseline** is hereby declared **VERIFIED** — extracted from real operational XLSX files, validated, and frozen. This baseline must NOT be modified except through an explicit governance process (authorized staff review, documented data correction, and re-freeze).

All dashboard metrics are derived from actual operational records maintained by the Green Office team at the Office of the President, Maejo University.

---

## 2. Per-Metric Baseline Table

| Metric | Label | Annual Total | Unit | Source Workbook | Sheet | Extraction Method | Extraction Date |
|--------|-------|-------------|------|-----------------|-------|-------------------|-----------------|
| water | Water Consumption | 8,337.5 | m³ | `docs/1.1-Water.xlsx` | 2568 | `scripts/extract-xlsx-to-csv.mjs` col[6] rows 4-15 | 2026-07-15 |
| energy | Electricity Consumption | 403,036.8 | kWh | `docs/1.2-elect.xlsx` | 2568 | `scripts/extract-xlsx-to-csv.mjs` col[6] rows 4-15 | 2026-07-15 |
| fuel | Fuel Consumption | 339.83 | L | `docs/1.3_Gassolene.xlsx` | 2568 | `scripts/extract-xlsx-to-csv.mjs` col[6] rows 4-15 | 2026-07-15 |
| paper | Paper Consumption | 2,197.80 | kg | `docs/1.4_Paper.xlsx` | 2568 | `scripts/extract-xlsx-to-csv.mjs` col[6] rows 4-15 | 2026-07-15 |
| waste | Waste Management | 21.57% (avg) | % recycling rate | `docs/1.5_Waste.xlsx` | คำนวณ% | col[1]-col[12] row "%ขยะรีไซเคิล / นำกลับมาใช้ใหม่" | 2026-07-15 |
| ghg | GHG Emissions | 231.60 | tCO₂e | `docs/1.6_GreenhouseGas.xlsx` | สรุปการคำนวณ ปี 2568 | col[3]-col[14] row 67 "GHG ปี 2568 (kgCO2e)" converted kg→tCO₂e | 2026-07-15 |

---

## 3. Content Fingerprint (SHA-256)

Hash of the 6 generated baseline JSON files at freeze time:

| File | SHA-256 |
|------|---------|
| `src/data/generated/energy.json` | `3868B0AB0E8D829CACD4009DF7DBDB2661B8E744338774323F91F63E05FB6545` |
| `src/data/generated/fuel.json` | `50BF074835F2A497299F6E097F8AC3BD4F11CE9A1ECF93806CCA924198CA3FF5` |
| `src/data/generated/ghg.json` | `6E082AE0E5D1E9C5B0C906A6228AEA5EC3D5595046538F75978D0E90E07B4286` |
| `src/data/generated/paper.json` | `280CDD2FC2AD9C9720F49C1A6FBDEDFC27F6B871F663D4EE2E9010B3C3964709` |
| `src/data/generated/waste.json` | `FCDABECEAD640D513492147EB84478008F2172535A3BBB50FB54D5B5C9BEBA7B` |
| `src/data/generated/water.json` | `753C59C13D58DD691418CD7B0DF17ED065736ECBD26960F845E7B87103BCAE8A` |

---

## 4. Governance Statement

This baseline is NOT to be modified except by explicit governance process:

1. **Authorized staff** must initiate a baseline amendment request
2. The amendment must be documented with reason, source verification, and approval signature
3. After amendment, a new freeze document must be created with a version increment
4. The prior freeze document remains as an immutable historical record

---

## 5. Platform Blueprint Reference

This baseline freeze is part of the Green Office 2026 Platform Blueprint:

- **Canonical Taxonomy:** `src/data/criteria/categories.json`, `indicators.json`, `issues.json`
- **Dashboard Configuration:** `src/data/dashboard-config.ts`
- **Resource-Indicator Mapping:** `src/data/resource-indicator-map.json`
- **Evidence Traceability:** `src/data/evidence/evidence-index.json`
- **Import Pipeline:** `scripts/extract-xlsx-to-csv.mjs` → `scripts/import-dashboard-data.mjs` → `src/data/generated/*.json`

---

*Document version: 1.0.0 — frozen baseline.*

## 6. Related Documents

- `docs/foundation/GOFFICE2026_RESOURCE_INDICATOR_MAPPING.md`
- `docs/foundation/GOFFICE2026_FINAL_PLATFORM_BASELINE.md`
- `docs/foundation/GOFFICE2026_CANONICAL_TAXONOMY_REPORT.md`
