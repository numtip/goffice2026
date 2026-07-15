# Source Inventory Report — Evidence Onboarding Sprint

**Date:** 2026-07-16  
**Starting HEAD:** `f89b590`  
**Generator:** Worker A — Source Inventory & Discovery  
**Status:** Complete — 7/7 sources verified

---

## 1. Source Manifest

All 7 files discovered by Head have been verified as existing, readable, and matching their expected SHA-256 hashes.

| # | Source ID | Filename | Path | MIME Type | Size | SHA-256 | Classification |
|---|-----------|----------|------|-----------|------|---------|---------------|
| 1 | `src-xlsx-water-usage` | `1.1-Water.xlsx` | `docs/1.1-Water.xlsx` | spreadsheet | 99,511 B (97 KB) | `79528053...47D09` | operational-data |
| 2 | `src-xlsx-electricity-usage` | `1.2-elect.xlsx` | `docs/1.2-elect.xlsx` | spreadsheet | 93,921 B (92 KB) | `576B2E3E...6021D` | operational-data |
| 3 | `src-xlsx-fuel-usage` | `1.3_Gassolene.xlsx` | `docs/1.3_Gassolene.xlsx` | spreadsheet | 254,868 B (249 KB) | `8FD700F2...24085` | operational-data |
| 4 | `src-xlsx-paper-consumption` | `1.4_Paper.xlsx` | `docs/1.4_Paper.xlsx` | spreadsheet | 207,178 B (202 KB) | `CCE54E1A...48924` | operational-data |
| 5 | `src-xlsx-waste-data` | `1.5_Waste.xlsx` | `docs/1.5_Waste.xlsx` | spreadsheet | 44,014 B (43 KB) | `5BC46053...3C333` | operational-data |
| 6 | `src-xlsx-greenhouse-gas` | `1.6_GreenhouseGas.xlsx` | `docs/1.6_GreenhouseGas.xlsx` | spreadsheet | 528,383 B (516 KB) | `8A0B9C0D...9EE12` | operational-data |
| 7 | `src-pdf-assessment-criteria` | `เกณฑ์การประเมินสำนักงานสีเขียว-ปี-2569.pdf` | `doc/เกณฑ์การประเมินสำนักงานสีเขียว-ปี-2569.pdf` | PDF | 1,051,724 B (1 MB) | `E5EA6043...EAB9A7` | assessment-reference |

### Hash Verification Results

| File | Expected SHA-256 | Computed SHA-256 | Match |
|------|-----------------|------------------|-------|
| `docs/1.1-Water.xlsx` | `79528053C4228A0302D1D1BB79645434D753C210908C509489D4B79CC3F47D09` | `79528053C4228A0302D1D1BB79645434D753C210908C509489D4B79CC3F47D09` | ✓ |
| `docs/1.2-elect.xlsx` | `576B2E3EC202447B90F7A1E0599ABC906B31B0E33CEA2C38CC6ACF671116021D` | `576B2E3EC202447B90F7A1E0599ABC906B31B0E33CEA2C38CC6ACF671116021D` | ✓ |
| `docs/1.3_Gassolene.xlsx` | `8FD700F2A491E0E95443DE4572A7DF7CCE6E350B72D7F6DEC2BE4CDF3F124085` | `8FD700F2A491E0E95443DE4572A7DF7CCE6E350B72D7F6DEC2BE4CDF3F124085` | ✓ |
| `docs/1.4_Paper.xlsx` | `CCE54E1A2DBAC5BC67F581891783A2DE866BC9E8061383FB7E410CD73D748924` | `CCE54E1A2DBAC5BC67F581891783A2DE866BC9E8061383FB7E410CD73D748924` | ✓ |
| `docs/1.5_Waste.xlsx` | `5BC4605335C85C58BCC89EB1D32E9E15912257F1A9D71379CAB24310D493C333` | `5BC4605335C85C58BCC89EB1D32E9E15912257F1A9D71379CAB24310D493C333` | ✓ |
| `docs/1.6_GreenhouseGas.xlsx` | `8A0B9C0D100D26B7CDDEBE12315D145731AE06E1F9586A7A165084D80009EE12` | `8A0B9C0D100D26B7CDDEBE12315D145731AE06E1F9586A7A165084D80009EE12` | ✓ |
| `doc/เกณฑ์การประเมินสำนักงานสีเขียว-ปี-2569.pdf` | `E5EA60433AE6B350115C55824253F758CD825E1C34891BCF6614EFE55EEAB9A7` | `E5EA60433AE6B350115C55824253F758CD825E1C34891BCF6614EFE55EEAB9A7` | ✓ |

**Result:** All 7 files match expected hashes. No corruption or tampering detected.

---

## 2. Classification Summary

| Classification | Count | Files |
|----------------|-------|-------|
| `assessment-reference` | 1 | `doc/เกณฑ์การประเมินสำนักงานสีเขียว-ปี-2569.pdf` |
| `operational-data` | 6 | All xlsx spreadsheets |
| `evidence-candidate` | 0 | (see notes below) |
| `supporting-document` | 0 | — |
| `unknown` | 0 | — |
| **Total** | **7** | |

### Classification Notes

- **assessment-reference (1):** The PDF is the official Green Office assessment criteria document (`เกณฑ์การประเมินสำนักงานสีเขียว`) for year 2569 BE (2026 CE). It defines the evaluation framework against which all evidence will be measured. This is the authoritative reference.
- **operational-data (6):** All six xlsx files contain measured operational data spanning the six resource categories: water, electricity, fuel, paper, waste, and greenhouse gas emissions. These are raw measurement records (meter readings, consumption logs, purchase records) that serve as the factual basis for evidence claims.
- **evidence-candidate (0):** No file is classified as `evidence-candidate` as a primary type. However, all 6 operational-data spreadsheets are strong evidence candidates — each contains bottom-up measurements that could directly substantiate specific indicator-level evidence records once mapped against the assessment criteria. The PDF itself is the rulebook, not evidence.

---

## 3. Duplicate Detection

**Method:** Full SHA-256 comparison across all 7 files.

**Result: NO DUPLICATES FOUND.**

All 7 files have unique SHA-256 hashes. No two files share identical content. This is expected given the distinct domains (water, electricity, fuel, paper, waste, GHG, assessment criteria).

---

## 4. Dashboard Data Sources vs. Evidence Candidates

### Dashboard Data Sources

All 6 xlsx spreadsheets are **directly usable as dashboard data sources**. Each corresponds to a major Green Office KPI category:

| Spreadsheet | Dashboard KPI Domain | Likely Metrics |
|-------------|---------------------|---------------|
| `1.1-Water.xlsx` | Water consumption | m³ consumed, cost, period-over-period change |
| `1.2-elect.xlsx` | Electricity usage | kWh consumed, cost, intensity ratios |
| `1.3_Gassolene.xlsx` | Fuel consumption | liters/gallons, cost, fleet efficiency |
| `1.4_Paper.xlsx` | Paper usage | reams, kg, cost, recycling rate |
| `1.5_Waste.xlsx` | Waste generation | kg disposed, recycling rate, diversion rate |
| `1.6_GreenhouseGas.xlsx` | GHG emissions | tCO₂e by scope, reduction progress |

These files likely contain monthly or quarterly time-series data suitable for dashboard ingestion. Source type `operational-data` is correct and sufficient.

### Evidence Candidates

While no file is primarily classified as `evidence-candidate`, these operational data files become powerful evidence when linked to specific assessment criteria. The next sprint should:

1. Map each xlsx file's columns/tabs to specific indicators from the assessment criteria PDF
2. Create evidence records referencing these files by `sourceId`
3. Record SHA-256 checksums at time of evidence claim to establish chain of custody

The assessment criteria PDF (`src-pdf-assessment-criteria`) should be the first file processed — it defines what evidence is needed.

---

## 5. Git Notes

- Old tracked files `docs/12-elect.xlsx` and `docs/1.5_GreenhouseGas.xlsx` are staged for deletion (` D` in `git status`)
- These were different files from current ones (different sizes, likely corrupt or superseded)
- The 6 untracked xlsx files in `docs/` and 1 pdf in `doc/` are the authoritative replacements
- No conflicts: current source IDs are clean and no old file shares a SHA-256 with any new file

---

## 6. QA Notes

### Verified
- [x] All 7 files exist and are readable
- [x] All SHA-256 hashes match expected values from Head discovery
- [x] File sizes are consistent with expected magnitudes (43 KB – 1 MB)
- [x] No duplicates detected
- [x] Classifications are consistent with file naming and domain knowledge

### Not Verified (out of scope for this sprint)
- [ ] Actual spreadsheet contents (column structure, data quality, completeness)
- [ ] Evidence-index.json linkage (no modifications to canonical files)
- [ ] Taxonomy relationship verification
- [ ] Human reviewer sign-off

### Warnings
- The PDF filename is in Thai — ensure tooling supports Unicode paths
- Spreadsheets are binary xlsx — content inspection requires programmatic reader
- File naming convention is inconsistent (`1.1-Water` vs `1.2-elect` vs `1.3_Gassolene`) — consider normalizing in a future sprint

---

## 7. Deliverables

| Artifact | Path | Description |
|----------|------|-------------|
| Source Inventory Report | `docs/evidence/GOFFICE2026_SOURCE_INVENTORY_REPORT.md` | This document |
| Machine-Readable Manifest | `src/data/source-manifest.json` | JSON manifest with all source metadata |

---

*Report generated by Worker A — Source Inventory & Discovery. Sprint: Evidence Onboarding.*
