# GO-DATA-1: Source Workbook Map

**Date:** 2026-07-23  
**Status:** FINAL

---

## 1. Source File Inventory

| # | Workbook | Metric | Expected Location | Status |
|---|----------|--------|-------------------|--------|
| 1 | `1.1-Water.xlsx` | Water | `docs/1.1-Water.xlsx` | ✅ Present |
| 2 | `1.2-elect.xlsx` | Electricity | `docs/` | ❌ Missing |
| 3 | `1.3_Gassolene.xlsx` | Fuel | `docs/` | ❌ Missing |
| 4 | `1.4_Paper.xlsx` | Paper | `docs/` | ❌ Missing |
| 5 | `1.5_Waste.xlsx` | Waste | `docs/` | ❌ Missing |
| 6 | `1.6_GreenhouseGas.xlsx` | GHG | `docs/` | ❌ Missing |

**Note:** Only `1.1-Water.xlsx` remains in the repository. The other five workbooks are absent. All 2568 baseline data was previously extracted and validated before the workbooks were removed. 2569 data for missing workbooks uses placeholder values marked with quality warnings.

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

### Electricity (`1.2-elect.xlsx`)
- **Sheet:** `2568`
- **Data:** Column [6] — `(kwh) ปี 2568` column
- **Rows:** 4–15 (Thai month-labeled)
- **Unit:** kWh
- **Status:** ✅ Previously extracted (workbook missing)

### Fuel (`1.3_Gassolene.xlsx`)
- **Sheet:** `2568`
- **Data:** Column [6] — `(ลิตร) ปี 2568` column
- **Rows:** 4–15 (Thai month-labeled)
- **Unit:** L
- **Status:** ✅ Previously extracted (workbook missing)

### Paper (`1.4_Paper.xlsx`)
- **Sheet:** `2568`
- **Data:** Column [6] — `(กิโลกรัม) ปี 2568` column
- **Rows:** 4–15 (Thai month-labeled)
- **Unit:** kg
- **Status:** ✅ Previously extracted (workbook missing)

### Waste (`1.5_Waste.xlsx`)
- **Sheet:** `คำนวณ%`
- **Data:** Recycling % row — decimal values converted to percentage
- **Unit:** %
- **Status:** ✅ Previously extracted (workbook missing)

### GHG (`1.6_GreenhouseGas.xlsx`)
- **Sheet:** `สรุปการคำนวณ ปี 2568`
- **Data:** Row "GHG ปี 2568 (kgCO2e)" — kg values converted to tCO₂e
- **Unit:** tCO₂e
- **Status:** ✅ Previously extracted (workbook missing)

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
2. Place them in `docs/` as: `1.2-elect.xlsx`, `1.3_Gassolene.xlsx`, `1.4_Paper.xlsx`, `1.5_Waste.xlsx`, `1.6_GreenhouseGas.xlsx`.
3. Run: `node scripts/extract-xlsx-to-csv.mjs` to regenerate CSVs.
4. Run: `npm run data:build` to regenerate all JSON.
