# GOFFICE2026 — FY2569 Resource Delta Audit

**Date:** 2026-08-27  
**Baseline:** `master` @ `13be6a99f8cfa363b8ba981bb1ea34db2f322531`  
**Source (read-only):** `RAE-Document-Center/07-GreenOffice/Resource` (OneDrive, repository-independent)
**Authority:** Blueprint V5 · Dashboard Progress Blueprint V1 · GO-DATA-3 pipeline · existing validators  

**Rules honored:** mtime ≠ truth · FY2568 ↛ FY2569 · template ≠ data · missing ≠ zero · no criteria-progress edits · no ready/score inference · no VPS deploy  

**Pipeline used:** `sync-workbooks → extract-workbook → data:build` (Excel → CSV → validate → generated JSON)

---

## Verdict

`FY2569_RESOURCE_AUDIT_VERDICT`: **PARTIAL_DELTA — paper / waste / GHG intake; water & energy unchanged; fuel empty**

| Domain | Source | Period | Repo state (before) | Delta | Action |
|--------|--------|--------|---------------------|-------|--------|
| **Water** | `1.1Water.xlsx` sha `1915c65b…` | FY2569 Jan–Jul (7/12) m³ | Already match CSV/JSON | **UNCHANGED** | None |
| **Electricity** | `1.2electric.xlsx` sha `bb4b20d1…` | FY2569 Jan–Jul (7/12) kWh | Already match CSV/JSON | **UNCHANGED** | None |
| **Fuel** | `1.3Gassolene.xlsx` sha `18fc635d…` | Sheet `2569` col G empty | `WAITING_FOR_INPUT` | **NO_FY2569_DATA** | Wait for liters |
| **Paper** | `1.4paper.xlsx` sha `190f9e67…` | FY2569 Jan–Jul (7/12) kg · Σ 1,239.76 | 2569 empty | **NEW_USABLE** | Intake |
| **Waste** | `1.5waste2026.xlsx` sha `02b1f624…` | FY2569 Jan–Jul (7/12) kg · Σ 3,909.7 | 2569 empty | **UPDATED_PARTIAL** | Intake (raw sheet only) |
| **GHG** | `1.6GreenHouseGas2026.xlsx` sha `e6bc56fd…` | FY2569 Jan–Jul (7/12) tCO₂e · Σ 145.07 | 2569 empty | **UPDATED_PARTIAL** | Intake (CF>0 only) |

Supporting / non-intake:

| File | Class | Note |
|------|-------|------|
| `1.5waste2025.xlsx` | FY2568 baseline twin | Header mislabels “2569”; totals = FY2568 — **not** FY2569 |
| `1.6GreenHouseGas2025.xlsx` | FY2568 inventory | Do not promote as 2569 |
| Waste `คำนวณ%` / third sheet | **NEEDS_DISPOSITION** | Feb/Mar hardcoded 2568; use raw monthly sheet only |
| Fuel `IQS` Jul 56.54 L | **NEEDS_DISPOSITION** | Possible late FY2568 form fill — not sheet `2569` |

---

## Intake summary (this change set)

| Metric | CSV | Generated | datasetState |
|--------|-----|-----------|--------------|
| paper | `data/import/paper-2569.csv` | `paper.json` years.2569 | PUBLISHABLE_PARTIAL |
| waste | `data/import/waste-2569.csv` | `waste.json` years.2569 | PUBLISHABLE_PARTIAL |
| ghg | `data/import/ghg-2569.csv` | `ghg.json` years.2569 | PUBLISHABLE_PARTIAL |

Extractor extended: `scripts/extract-workbook.mjs` now emits waste/GHG CSVs when observations exist (was hardcoded WAITING).  
Staging/manifest re-synced to OneDrive hashes.  
**Not modified:** `indicator-progress-2569.json`. Aug–Dec never written as zero.

---

## Checkpoint

`FY2569_RESOURCE_DELTA_READY_FOR_MERGE` — after gates + PR (stop before merge)
