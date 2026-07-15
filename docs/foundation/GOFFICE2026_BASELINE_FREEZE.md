# GOFFICE2026 Baseline Freeze — 2568

**Status:** SYSTEM-VALIDATED AND FROZEN
**Freeze Date:** 2026-07-15
**Last Validation:** 2026-07-16
**Platform:** Green Office 2026 (goffice2026)
**Reference:** `docs/foundation/GOFFICE2026_FINAL_PLATFORM_BASELINE.md`

---

## 1. Freeze Declaration

The **2568 baseline** is hereby declared **SYSTEM-VALIDATED AND FROZEN**.

This means:
- Source workbooks have been identified and their sheets/columns documented
- Extraction path is recorded and reproducible (`scripts/extract-xlsx-to-csv.mjs` → `scripts/import-dashboard-data.mjs`)
- Generated JSON has passed automated validation
- SHA-256 fingerprints are frozen
- **Human data-owner sign-off is NOT yet recorded**

The data has passed **automated system validation only**. It has not been reviewed or approved by an authorized human (e.g., facilities manager, environmental officer, or certification auditor). The term "VERIFIED" in this context refers to pipeline integrity, not human attestation of data accuracy.

This baseline must NOT be modified except through an explicit governance process:
1. Authorized staff initiates a baseline amendment request
2. Amendment is documented with reason, source verification, and approval signature
3. After amendment, a new freeze document is created with version increment
4. Prior freeze document remains as immutable historical record

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
| `src/data/generated/energy.json` | `78AC3C2935CFDAC0F38A0BD209250243C04E1B03A4CF4098AC7545F4455618C2` |
| `src/data/generated/fuel.json` | `34775994BBAF55C30F9A2793FDAE3D4529E3CFF19B109282CBAD14A6BEBDD94D` |
| `src/data/generated/ghg.json` | `24AC9715312063EA60C3837F99E4BBF6C5414DEEE3AEBBFA7DDE70677A965FCC` |
| `src/data/generated/paper.json` | `CC593DBC0DF94B7EC0411A694D0205661F4EC40E605C2FC0FEBB6293C6D0B99B` |
| `src/data/generated/waste.json` | `EFD1917DC131C4041DD6CC003CF481FF1627B4CDEF507D3BC61EFC878F853290` |
| `src/data/generated/water.json` | `BB23EC0C162002D0222FDC13CA5F9D1940B73F615F6C09B7D2C18FF311B97089` |

---

## 4. Verification Terminology

| Term | Definition | Applied To |
|------|-----------|------------|
| **SYSTEM-VALIDATED** | Data passed automated extraction, validation, and build pipelines. Source workbook, sheet, and column identified. Extraction path recorded. SHA-256 frozen. | 2568 baseline (all 6 metrics) |
| **HUMAN-REVIEWED** | Authorized person (e.g., facilities manager, environmental officer) has inspected data and confirmed accuracy against source records. | Not yet recorded for any metric |
| **HUMAN-VERIFIED** | Data has been reviewed AND approved under project governance (e.g., certification auditor sign-off). | Not yet recorded for any metric |

Current state: **SYSTEM-VALIDATED AND FROZEN** — no human verification has been recorded.

---

## 5. Governance Statement

This baseline is NOT to be modified except by explicit governance process:

1. **Authorized staff** must initiate a baseline amendment request
2. The amendment must be documented with reason, source verification, and approval signature
3. After amendment, a new freeze document must be created with a version increment
4. The prior freeze document remains as an immutable historical record

---

## 6. Platform Blueprint Reference

This baseline freeze is part of the Green Office 2026 Platform Blueprint:

- **Canonical Taxonomy:** `src/data/criteria/categories.json`, `indicators.json`, `issues.json` (7/24/65)
- **Dashboard Configuration:** `src/data/dashboard-config.ts`
- **Resource-Indicator Mapping:** `src/data/resource-indicator-map.json` (v1.1.0, CANONICAL AND VALIDATED)
- **Evidence Traceability:** `src/data/evidence/evidence-index.json` (21 records, all unresolved)
- **Import Pipeline:** `scripts/extract-xlsx-to-csv.mjs` → `scripts/import-dashboard-data.mjs` → `src/data/generated/*.json`

---

## 7. Related Documents

- `docs/foundation/GOFFICE2026_RESOURCE_INDICATOR_MAPPING.md` — resource-indicator mapping (v1.1.0)
- `docs/foundation/GOFFICE2026_FINAL_PLATFORM_BASELINE.md` — platform baseline report
- `docs/foundation/GOFFICE2026_CANONICAL_TAXONOMY_REPORT.md` — canonical taxonomy report
- `docs/evidence/GOFFICE2026_EVIDENCE_REVIEW_QUEUE.md` — human review queue (23 pending items)
- `scripts/validate-resource-indicator-map.mjs` — mapping validator

---

*Document version: 1.1.0 — SYSTEM-VALIDATED AND FROZEN. Human sign-off not yet recorded.*
