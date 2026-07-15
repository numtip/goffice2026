# Excel Import Workflow

**Last updated:** 2026-06-12

---

## Overview

Staff can update monthly dashboard data by **exporting Excel records to CSV** and running an automated import script. No code changes, no manual JSON editing.

```
Excel Files (1.1-Water.xlsx, 12-elect.xlsx, etc.)
       │
       ▼  (Staff exports to CSV)
CSV in data/import/{metric}-{year}.csv
       │
       ▼  (Import script validates + generates)
node scripts/import-dashboard-data.mjs
       │
       ▼
src/data/generated/{metric}.json
       │
       ▼  (Astro build)
npm run build
       │
       ▼
Static HTML dashboards
```

---

## Step-by-Step: Staff Workflow

### Step 1 — Export Excel to CSV

Open the staff Excel file and export the relevant data as a CSV file with exactly **2 columns**: `month` and `value`.

**Required CSV format:**
```csv
month,value
1,5600
2,5400
3,5200
```

**Naming convention:**
```
{metric}-{year}.csv
```

**Examples:**
| Excel Source File    | Metric | Year | CSV Filename             |
|---------------------|--------|------|--------------------------|
| `1.1-Water.xlsx`    | water  | 2569 | `water-2569.csv`         |
| `1.2-elect.xlsx`    | energy | 2569 | `energy-2569.csv`        |
| `1.6_GreenhouseGas.xlsx` | ghg | 2569 | `ghg-2569.csv`      |
| `1.3_Gassolene.xlsx` | fuel | 2569 | `fuel-2569.csv`       |
| `1.4_Paper.xlsx` | paper | 2569 | `paper-2569.csv`     |
| `1.5_Waste.xlsx` | waste | 2569 | `waste-2569.csv`   |

### Step 2 — Place CSV in Import Directory

Copy the CSV file to:

```
data/import/{metric}-{year}.csv
```

Example: `data/import/water-2569.csv`

A blank template is available at `data/import/templates/import-template.csv`.

### Step 3 — Run Import Script

```bash
node scripts/import-dashboard-data.mjs --metric=water --year=2569 --input=data/import/water-2569.csv
```

Or to import all files in `data/import/` at once:

```bash
node scripts/import-dashboard-data.mjs --all
```

**Use --dry-run to validate without writing:**

```bash
node scripts/import-dashboard-data.mjs --all --dry-run
```

### Step 4 — Run QA

```bash
npm run check
npm run build
npm run preview
```

### Step 5 — Verify Dashboards

Open the preview URL and check:
- `/dashboard/water` — Data status badge, monthly comparison table, YoY cards
- `/dashboard` — Multi-year summary, Data Completeness section

---

## Metric Configuration Reference

| Metric | Label | Unit | KPI Field | Excel Source | Baseline 2568 Months | Current 2569 Months |
|--------|-------|------|-----------|-------------|---------------------|--------------------|
| `energy` | Electricity Consumption | kWh | `kwh` | `1.2-elect.xlsx` | 12 ✅ | 8 🟡 |
| `water` | Water Consumption | m³ | `cubic_meters` | `1.1-Water.xlsx` | 12 ✅ | 7 🟡 |
| `fuel` | Fuel Consumption | L | `liters` | `1.3_Gassolene.xlsx` | 12 ✅ | 9 🟡 |
| `paper` | Paper Consumption | kg | `kg_estimated` | `1.4_Paper.xlsx` | 12 ✅ | 6 🟡 |
| `waste` | Waste Management | % | `recycle_pct` | `1.5_Waste.xlsx` | 12 ✅ | 10 🟡 |
| `ghg` | GHG Emissions | tCO₂e | `total_tco2e` | `1.6_GreenhouseGas.xlsx` | 12 ✅ | 8 🟡 |

---

## Validation Rules

The import script enforces these rules automatically:

| Rule | Check | Error if violated |
|------|-------|------------------|
| **Month range** | Month must be integer 1-12 | `month must be integer 1-12, got '{value}'` |
| **No duplicates** | Each month appears once | `duplicate month {n} ({name})` |
| **Valid number** | Value must be a valid positive number | `value '{val}' is not a valid number` |
| **No negatives** | Value cannot be negative | `value cannot be negative (got {val})` |
| **CSV format** | CSV must have `month` and `value` columns | `CSV must have 'month' and 'value' columns` |
| **Completeness** | Baseline (2568) must have all 12 months | `Baseline data (2568) must have all 12 months` |
| **Non-empty** | At least one data row required | `No data rows provided` |

---

## Script Options

```
node scripts/import-dashboard-data.mjs [options]

Options:
  --metric=<name>    Metric to import (energy|water|fuel|paper|waste|ghg)
  --year=<number>    Year for this data (e.g. 2569)
  --input=<path>     Path to input CSV file
  --source=<string>  Description of source file (e.g. "1.1-Water.xlsx")
  --all              Import all CSV files found in data/import/
  --dry-run          Validate but do not write
  --force            Overwrite existing data without prompt
  --help             Show help message
```

---

## Import Script — What It Does

1. **Parses** the input CSV (read `month` and `value` columns)
2. **Validates** all data against the rules table above
3. **Normalizes** values (string → number, sort by month)
4. **Reads** the existing generated JSON (`src/data/generated/{metric}.json`)
5. **Merges** the new year data into the multi-year structure
6. **Recomputes** totals, averages, and YoY change
7. **Writes** the updated generated JSON
8. **Reports** the import summary

---

## Handling Incomplete Data

Current year (2569) data is expected to be **incomplete** during the year:

- If < 12 months: `dataStatus` is set to `"in_progress"`
- Dashboards show a yellow **"In Progress"** badge with month count
- Missing months display as **"Pending"** at reduced opacity
- YoY comparison notes **"Partial year comparison"**

Once all 12 months are uploaded and validated:
- `dataStatus` automatically changes to `"complete"`
- The yellow badge becomes green **"Complete"**
- YoY comparison becomes **"Annual comparison"**

---

## Adding a New Metric

1. Add the metric config to `scripts/import-dashboard-data.mjs` (the `METRIC_CONFIG` object)
2. Create the input CSV and import via the script
3. Add config entry in `src/data/dashboard-config.ts`
4. Add the generated JSON import in `src/pages/dashboard/[id].astro`
5. Add CSV import in `src/pages/dashboard/[id].astro`
6. Run QA

---

## Troubleshooting

| Problem | Likely Cause | Solution |
|---------|-------------|----------|
| `Input file not found` | CSV not in correct path | Place CSV in `data/import/` or use `--input` with full path |
| `Unknown metric` | Typo in metric name | Use one of: `energy`, `water`, `fuel`, `paper`, `waste`, `ghg` |
| `Validation failed` | Data issue in CSV | Read the specific error messages and fix the CSV |
| `Duplicate month` | Same month number twice | Remove the duplicate row |
| `Not a valid number` | Non-numeric value in CSV | Check for text, symbols, or empty cells |

---

*Source: Green Office Platform, Maejo University.*
