# Evidence Review Queue — Provenance Validation Report

**Date:** 2026-07-16
**Repository:** `numtip/goffice2026` at `f89b590`
**Queue Version:** 0.1.0
**Author:** Worker D — Automated Provenance QA

---

## Executive Summary

The evidence review queue has been created with **23 items** requiring human review. These items span across all 7 categories of the Green Office 2026 taxonomy. Of the 21 existing placeholder records in `evidence-index.json`, **7 have candidate real-source mappings** while **14 remain without any identified source document**. An additional **2 queue items** were created for new source files that have no corresponding placeholder record.

---

## 1. Total Pending Items

| Status | Count |
|--------|-------|
| **Total queue items** | **23** |
| `decision: pending` | 23 (100%) |
| `decision: approved` | 0 |
| `decision: rejected` | 0 |
| `decision: needs-more-information` | 0 |

All items start as `pending` per the automated candidate policy. No items have been pre-approved or pre-rejected.

---

## 2. Confidence Breakdown

| Confidence | Count | Percentage |
|-----------|-------|------------|
| **High** | 4 | 17.4% |
| **Medium** | 4 | 17.4% |
| **Low** | 15 | 65.2% |
| **Total** | **23** | **100%** |

### High-confidence items (4)
These have unambiguous source-to-evidence matches with strong document context:

| Review ID | Evidence ID | Source | Proposed Indicator(s) |
|-----------|-------------|--------|-----------------------|
| review-002 | ev-energy-metering-2025 | docs/1.2-elect.xlsx | 3.2.1, 3.2.2 |
| review-004 | ev-water-meter-q1 | docs/1.1-Water.xlsx | 3.1.2 |
| review-009 | ev-waste-monthly-2025 | docs/1.5_Waste.xlsx | 4.1.2 |
| review-010 | ev-ghg-inventory-2025 | docs/1.6_GreenhouseGas.xlsx | 1.5.1 |

### Medium-confidence items (4)
These have plausible source matches but require human verification of scope:

| Review ID | Evidence ID | Source | Proposed Indicator(s) |
|-----------|-------------|--------|-----------------------|
| review-007 | ev-waste-recycling-2025 | docs/1.5_Waste.xlsx | 4.1.3 |
| review-012 | ev-ghg-emission-factors | docs/1.6_GreenhouseGas.xlsx | 1.5.1 |
| review-017 | ev-transport-fleet-2025 | docs/1.3_Gassolene.xlsx | 3.2.4, 3.2.5 |
| review-022 | *(new — paper usage)* | docs/1.4_Paper.xlsx | 3.3.1, 3.3.2 |

### Low-confidence items (14)
These are placeholders with **no identified real source document** in the current `docs/` inventory. Each requires the human reviewer to locate and upload the actual source document.

---

## 3. Breakdown by Category

| Category | Total Items | With Source | No Source | New Source |
|----------|-------------|-------------|-----------|------------|
| **cat1** — Environmental Policy & Planning | 3 | 1 (ev-energy-metering-2025) | 2 (ev-energy-audit-2025, ev-energy-led-project) | — |
| **cat2** — Communication & Awareness | 3 | 1 (ev-water-meter-q1) | 2 (ev-water-audit-2025, ev-water-conservation) | — |
| **cat3** — Resource & Energy Utilization | 3 + 1 | 2 (ev-waste-recycling-2025, ev-waste-monthly-2025) | 1 (ev-waste-audit-2025) | 1 (paper usage) |
| **cat4** — Waste Management | 3 | 2 (ev-ghg-inventory-2025, ev-ghg-emission-factors) | 1 (ev-ghg-reduction-plan) | — |
| **cat5** — Environment & Safety | 3 | 0 | 3 (ev-iaq-survey-2025, ev-iaq-ventilation-logs, ev-iaq-green-cleaning) | — |
| **cat6** — Procurement & Hiring | 3 | 1 (ev-transport-fleet-2025) | 2 (ev-transport-commute-2025, ev-transport-policy) | — |
| **cat7** — Green Office Continuity | 3 | 0 | 3 (ev-innovation-pilot-2025, ev-innovation-staff-2025, ev-innovation-partnerships) | — |
| *(uncategorized)* | — | — | — | 1 (assessment criteria PDF) |
| **Total** | **22 (+1 ref.)** | **7** | **14** | **2** |

---

## 4. Items with Real Source Available

These 7 queue items have a candidate source file ready for human review:

| Review ID | Evidence | Source File | Confidence | Action Required |
|-----------|----------|-------------|------------|-----------------|
| review-002 | ev-energy-metering-2025 | docs/1.2-elect.xlsx | **High** | Approve or reject mapping; update evidence-index.json path |
| review-004 | ev-water-meter-q1 | docs/1.1-Water.xlsx | **High** | Approve or reject mapping; update evidence-index.json path |
| review-007 | ev-waste-recycling-2025 | docs/1.5_Waste.xlsx | **Medium** | Verify scope alignment; confirm recycling data coverage |
| review-009 | ev-waste-monthly-2025 | docs/1.5_Waste.xlsx | **High** | Approve or reject mapping; update evidence-index.json path |
| review-010 | ev-ghg-inventory-2025 | docs/1.6_GreenhouseGas.xlsx | **High** | Approve or reject mapping; update evidence-index.json path |
| review-012 | ev-ghg-emission-factors | docs/1.6_GreenhouseGas.xlsx | **Medium** | Verify emission factor coverage; may need separate doc |
| review-017 | ev-transport-fleet-2025 | docs/1.3_Gassolene.xlsx | **Medium** | Verify fleet fuel data scope; note cross-category mapping |

> **Note:** Items review-007 and review-012 share source files with review-009 and review-010 respectively. The human reviewer should verify whether a single source file can serve multiple evidence records. See **Duplicate Detection** section below.

---

## 5. Items Still Needing Source Documents

These 14 placeholder records have **no matching real source file** in the current `docs/` inventory:

| Category | Evidence ID | Title | Placeholder Path |
|----------|-------------|-------|------------------|
| cat1 | ev-energy-audit-2025 | Energy Audit Report 2025 | /documents/cat1/placeholder.md |
| cat1 | ev-energy-led-project | LED Retrofit Project Summary | /documents/cat1/led-retrofit-summary.pdf |
| cat2 | ev-water-audit-2025 | Water Audit Report 2025 | /documents/cat2/water-audit-2025.pdf |
| cat2 | ev-water-conservation | Water Conservation Initiative Records | /documents/cat2/conservation-initiatives.pdf |
| cat3 | ev-waste-audit-2025 | Waste Audit Report 2025 | /documents/cat3/waste-audit-2025.pdf |
| cat4 | ev-ghg-reduction-plan | Carbon Reduction Project Plan | /documents/cat4/carbon-reduction-plan.pdf |
| cat5 | ev-iaq-survey-2025 | Indoor Air Quality Survey 2025 | /documents/cat5/placeholder.md |
| cat5 | ev-iaq-ventilation-logs | Ventilation Maintenance Logs 2025 | /documents/cat5/ventilation-logs-2025.xlsx |
| cat5 | ev-iaq-green-cleaning | Green Cleaning Product Inventory | /documents/cat5/green-cleaning-inventory.pdf |
| cat6 | ev-transport-commute-2025 | Employee Commute Survey 2025 | /documents/cat6/placeholder.md |
| cat6 | ev-transport-policy | Sustainable Transport Policy | /documents/cat6/transport-policy.pdf |
| cat7 | ev-innovation-pilot-2025 | Green Innovation Pilot Project | /documents/cat7/placeholder.md |
| cat7 | ev-innovation-staff-2025 | Staff Green Engagement Records 2025 | /documents/cat7/staff-engagement-2025.pdf |
| cat7 | ev-innovation-partnerships | External Partnerships & Recognition | /documents/cat7/partnerships-2025.pdf |

---

## 6. New Source Files Without Matching Placeholder

Two source files were found in the `docs/` inventory that do not correspond to any existing placeholder record:

### 6.1 Paper Usage Data
- **File:** `docs/1.4_Paper.xlsx` (207KB, SHA256: CCE54E1A2...)
- **Form:** 3.2(1) — Paper usage + reuse
- **Review ID:** review-022
- **Recommended Indicators:** 3.3.1 (Paper conservation measures), 3.3.2 (Paper consumption data per unit)
- **Action:** Human reviewer should determine whether to create a new evidence record for paper usage or map this to an existing placeholder if scope overlap is found.

### 6.2 Assessment Criteria Reference
- **File:** `doc/เกณฑ์การประเมินสำนักงานสีเขียว-ปี-2569.pdf` (1MB, SHA256: E5EA60433...)
- **Review ID:** review-023
- **Type:** Reference document (not operational evidence)
- **Action:** Human reviewer should determine if this reference PDF should be linked as supporting documentation for any evidence records or maintained as a standalone reference.

---

## 7. Mapping Basis Summary

### Source-to-Indicator Mapping Logic

| Source File | Form | Canonical Issue | Proposed Indicators | Rationale |
|-------------|------|-----------------|-------------------|-----------|
| docs/1.2-elect.xlsx | 3.2(1) | 3.2 — Energy Consumption | 3.2.1, 3.2.2 | Electricity metering data directly supports energy consumption monitoring indicators |
| docs/1.1-Water.xlsx | 3.2(1) | 3.1 — Water Consumption | 3.1.2 | Water usage data supports water consumption tracking indicator |
| docs/1.3_Gassolene.xlsx | 3.2(2), 3.2(1) | 3.2 — Energy Consumption | 3.2.4, 3.2.5 | Fuel usage data supports fuel consumption monitoring indicators |
| docs/1.4_Paper.xlsx | 3.2(1) | 3.3 — Other Resources | 3.3.1, 3.3.2 | Paper usage + reuse data supports paper conservation indicators |
| docs/1.5_Waste.xlsx | 4.1(1) | 4.1 — Waste Management | 4.1.2, 4.1.3 | Waste management data supports waste sorting and recycling indicators |
| docs/1.6_GreenhouseGas.xlsx | 1.5(1) | 1.5 — GHG Data | 1.5.1 | GHG calculation data supports GHG data collection indicator |

### Cross-Category Mapping Notes

Several evidence records are categorized differently in the pre-existing `evidence-index.json` than the canonical taxonomy would suggest for the proposed indicators:

| Evidence Record | Current Category | Proposed Indicator Category | Issue |
|-----------------|-----------------|---------------------------|-------|
| ev-water-meter-q1 | cat2 (Communication) | cat3 (Resources) | Water consumption data is a resource utilization issue (cat3), not a communication issue (cat2) |
| ev-waste-monthly-2025 | cat3 (Resources) | cat4 (Waste) | Waste management data is a waste issue (cat4), not a resource issue (cat3) |
| ev-waste-recycling-2025 | cat3 (Resources) | cat4 (Waste) | Same as above |
| ev-ghg-inventory-2025 | cat4 (Waste) | cat1 (Planning) | GHG data collection is a planning/EMS issue (cat1), not a waste issue (cat4) |
| ev-ghg-emission-factors | cat4 (Waste) | cat1 (Planning) | Same as above |
| ev-transport-fleet-2025 | cat6 (Procurement) | cat3 (Resources) | Fleet fuel consumption is an energy/resource issue (cat3), not a procurement issue (cat6) |

These category discrepancies should be resolved during human review. The automated system flags them but does not reassign categories.

---

## 8. Duplicate Detection Notes

- **review-007** (ev-waste-recycling-2025) and **review-009** (ev-waste-monthly-2025) both map to `src-xlsx-waste-management` (`docs/1.5_Waste.xlsx`). A single source file is proposed for two different evidence records. Human reviewer should verify whether this is appropriate or if separate source documents are needed.
- **review-010** (ev-ghg-inventory-2025) and **review-012** (ev-ghg-emission-factors) both map to `src-xlsx-ghg-data` (`docs/1.6_GreenhouseGas.xlsx`). Same concern applies.
- No exact filename or content duplicates were detected among the 7 source files (all SHA-256 hashes are unique).

---

## 9. Source File Integrity

All 7 source files have been hashed and verified at ingestion:

| Source ID | File | SHA-256 |
|-----------|------|---------|
| src-xlsx-water-usage | docs/1.1-Water.xlsx | 79528053C4228A0302D1D1BB79645434D753C210908C509489D4B79CC3F47D09 |
| src-xlsx-elect-usage | docs/1.2-elect.xlsx | 576B2E3EC202447B90F7A1E0599ABC906B31B0E33CEA2C38CC6ACF671116021D |
| src-xlsx-fuel-usage | docs/1.3_Gassolene.xlsx | 8FD700F2A491E0E95443DE4572A7DF7CCE6E350B72D7F6DEC2BE4CDF3F124085 |
| src-xlsx-paper-usage | docs/1.4_Paper.xlsx | CCE54E1A2DBAC5BC67F581891783A2DE866BC9E8061383FB7E410CD73D748924 |
| src-xlsx-waste-management | docs/1.5_Waste.xlsx | 5BC4605335C85C58BCC89EB1D32E9E15912257F1A9D71379CAB24310D493C333 |
| src-xlsx-ghg-data | docs/1.6_GreenhouseGas.xlsx | 8A0B9C0D100D26B7CDDEBE12315D145731AE06E1F9586A7A165084D80009EE12 |
| src-pdf-assessment-criteria-2026 | doc/เกณฑ์การประเมินสำนักงานสีเขียว-ปี-2569.pdf | E5EA60433AE6B350115C55824253F758CD825E1C34891BCF6614EFE55EEAB9A7 |

---

## 10. Call to Action for Human Reviewer

### Immediate Actions Required

1. **Approve or reject the 4 high-confidence mapping candidates** (review-002, review-004, review-009, review-010). These have strong source-to-evidence matches and are the most straightforward decisions.

2. **Review the 4 medium-confidence candidates** (review-007, review-012, review-017, review-022). These require judgment calls:
   - Can a single XLSX file serve as evidence for multiple records? (review-007/009 and review-010/012 share sources)
   - Is the fuel usage spreadsheet (docs/1.3_Gassolene.xlsx) sufficient for fleet fuel tracking?
   - Should a new evidence record be created for paper usage data (docs/1.4_Paper.xlsx)?
   - How should the assessment criteria PDF be referenced?

3. **Locate source documents for the 14 placeholders with no identified source.** These are the highest-priority gaps and span all 7 categories:
   - **cat5** (Environment & Safety) has the most critical gap — **0 of 3** evidence records have a real source
   - **cat7** (Green Office Continuity) similarly has **0 of 3** with real sources

4. **Resolve cross-category discrepancies** — Several evidence records are categorized differently in `evidence-index.json` than the canonical taxonomy would suggest (see section 7). This does not require changing `evidence-index.json` but the human reviewer should confirm the intended categorization.

### Decision Guide

| If you see... | Then... |
|---------------|---------|
| A source file that fully covers the evidence scope | Set `decision` to `approved`; update `evidence-index.json` path |
| A source file that partially covers the evidence scope | Set `decision` to `approved` with notes; or `needs-more-information` |
| A source file that does NOT match the evidence | Set `decision` to `rejected` with notes explaining why |
| No source file identified | Keep as `pending`; locate and upload the real document |
| A new source without matching evidence | Decide whether to create a new evidence record |

### After Review

Once decisions are made, downstream actions include:
- Updating `evidence-index.json` with real file paths and `verification.status`
- Promoting `traceabilityLevel` from `category` to `indicator` where applicable
- Regenerating the Evidence Mapping Report
- Committing the updated evidence state to the repository

---

## Appendix A: Queue File Location

The machine-readable review queue is at:
- `src/data/evidence-review-queue.json`

This file contains all 23 queue items with the complete data structure including source inventory, proposed indicator codes, confidence ratings, mapping basis, and reviewer notes.

---

*This report was generated automatically by Worker D — Provenance QA. No human review decisions have been automated.*
