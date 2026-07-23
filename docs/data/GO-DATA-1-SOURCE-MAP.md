# GO-DATA-1: Source Workbook Map

**Date:** 2026-07-23 (corrected 2026-07-24 — GO-DATA-1A)  
**Status:** CORRECTED — see GO-DATA-1A remediation report

---

## 1. Source File Inventory

| # | Workbook | Metric | Expected Location | Status | Git history |
|---|----------|--------|-------------------|--------|-------------|
| 1 | `1.1-Water.xlsx` | Water | `docs/1.1-Water.xlsx` | ✅ Present | Confirmed (still tracked) |
| 2 | `12-elect.xlsx` | Electricity | `docs/` | ❌ Missing | Confirmed — committed `fc24d7c`, removed `dfa57de` |
| 3 | `1.3_Gassolene.xlsx` | Fuel | `docs/` | ❌ Missing | **Never committed to git** — origin unverifiable |
| 4 | `1.4_Paper.xlsx` | Paper | `docs/` | ❌ Missing | **Never committed to git** — origin unverifiable |
| 5 | `1.5_Waste.xlsx` | Waste | `docs/` | ❌ Missing | **Never committed to git** — origin unverifiable |
| 6 | `1.5_GreenhouseGas.xlsx` | GHG | `docs/` | ❌ Missing | Confirmed — committed `fc24d7c`, removed `dfa57de` |

**Correction (GO-DATA-1A):** The original GO-DATA-1 sprint used the filenames `1.2-elect.xlsx` and `1.6_GreenhouseGas.xlsx`, which do not match git history. `git log --all --diff-filter=A -- "*.xlsx"` shows only three XLSX files were ever committed: `docs/1.1-Water.xlsx`, `docs/12-elect.xlsx`, `docs/1.5_GreenhouseGas.xlsx` (all added in `fc24d7c`; the electricity and GHG files were later removed in `dfa57de` — "chore: remove superseded xlsx files" — a mistaken removal, since no `1.x`-named replacements were ever added). All pipeline scripts and generated JSON now use the git-confirmed names. `1.3_Gassolene.xlsx`, `1.4_Paper.xlsx`, and `1.5_Waste.xlsx` were **never present in git at all** — their 2568 baseline values are preserved from an earlier extraction but cannot be independently re-verified, and are classified `PRESERVED_LEGACY` (not `CONFIRMED_XLSX`).

---

## 2. Extraction Pipeline

```
XLSX source (docs/*.xlsx)
    │
    ▼  [scripts/extract-xlsx-to-csv.mjs]
CSV import (data/import/{metric}-{year}.csv)
    │
    ▼  [scripts/import-dashboard-data.mjs] or [scripts/data-pipeline.mjs]
Generated JSON (src/data/generated/{metric}.json)
    │
    ▼  [Astro build-time import]
Dashboard pages (src/pages/dashboard/[id].astro)
```

---

## 3. Extraction Details

### Water (`1.1-Water.xlsx`)
- **Sheet:** `2568`
- **Data:** Column [6] — `(หน่วย) ปี 2568` column
- **Rows:** 4–15 (Thai month-labeled)
- **Unit:** m³
- **Status:** ✅ Extracted

### Electricity (`12-elect.xlsx`)
- **Sheet:** `2568`
- **Data:** Column [6] — `(kwh) ปี 2568` column
- **Rows:** 4–15 (Thai month-labeled)
- **Unit:** kWh
- **Status:** ✅ Previously extracted (workbook missing — confirmed committed then removed, see git history above)

### Fuel (`1.3_Gassolene.xlsx`)
- **Sheet:** `2568`
- **Data:** Column [6] — `(ลิตร) ปี 2568` column
- **Rows:** 4–15 (Thai month-labeled)
- **Unit:** L
- **Status:** ⚠ Previously extracted — workbook was **never committed to git**; baseline data classified `PRESERVED_LEGACY`, cannot be independently re-verified

### Paper (`1.4_Paper.xlsx`)
- **Sheet:** `2568`
- **Data:** Column [6] — `(กิโลกรัม) ปี 2568` column
- **Rows:** 4–15 (Thai month-labeled)
- **Unit:** kg
- **Status:** ⚠ Previously extracted — workbook was **never committed to git**; baseline data classified `PRESERVED_LEGACY`, cannot be independently re-verified

### Waste (`1.5_Waste.xlsx`)
- **Sheet:** `คำนวณ%`
- **Data:** Recycling % row — decimal values converted to percentage
- **Unit:** % (aggregated as **average** across months — corrected in GO-DATA-1A; summing percentage rates is invalid)
- **Status:** ⚠ Previously extracted — workbook was **never committed to git**; baseline data classified `PRESERVED_LEGACY`, cannot be independently re-verified

### GHG (`1.5_GreenhouseGas.xlsx`)
- **Sheet:** `สรุปการคำนวณ ปี 2568`
- **Data:** Row "GHG ปี 2568 (kgCO2e)" — kg values converted to tCO₂e
- **Unit:** tCO₂e
- **Status:** ✅ Previously extracted (workbook missing — confirmed committed then removed, see git history above)

---

## 4. Generated Outputs

| Output | Path | Description |
|--------|------|-------------|
| Generated JSON | `src/data/generated/{metric}.json` | Per-metric canonical data |
| KPI Summary | `src/data/generated/kpi-summary.json` | Executive overview |
| Data Quality | `src/data/generated/data-quality.json` | Validation summary |

---

## 5. Missing Workbooks — Recovery Instructions

To restore missing source workbooks:

1. Obtain the original Excel files from the Green Office assessment team.
2. Place them in `docs/` as: `12-elect.xlsx`, `1.3_Gassolene.xlsx`, `1.4_Paper.xlsx`, `1.5_Waste.xlsx`, `1.5_GreenhouseGas.xlsx`.
3. Run: `node scripts/extract-xlsx-to-csv.mjs` to regenerate CSVs.
4. Run: `npm run data:build` to regenerate all JSON.
