# Data Pipeline: Multi-Year Dashboard Data

**Last updated:** 2026-06-12

---

## Overview

The Green Office multi-year dashboard model compares **2568 (baseline)** data against **2569 (current operational year)** data. All data is static JSON, generated from staff Excel submissions and validated before inclusion.

**NEW — Automated Import Pipeline:** Staff can now export Excel data to CSV and run `node scripts/import-dashboard-data.mjs` to automatically validate, normalize, and generate the dashboard JSON files. See [Excel Import Workflow](excel-import-workflow.md) for the full guide.

---

## 1. Data Flow

```
Staff Excel Files (1.1-Water.xlsx, 12-elect.xlsx, 1.5_GreenhouseGas.xlsx, etc.)
        │
        ▼
Manual conversion → validated CSV/JSON
        │
        ▼
src/data/generated/{metric}.json   ← Canonical multi-year data
        │
        ▼
src/pages/dashboard/[id].astro      ← Build-time import
        │
        ▼
Static HTML pages in dist/          ← Published
```

### Key Principle
- No runtime database, API, or backend.
- Excel → CSV/JSON conversion is done **manually** or via a build script.
- Dashboards consume the generated JSON at build time.

---

## 2. Canonical Schema

Each dashboard metric is stored in `src/data/generated/{metric}.json` using this schema:

```typescript
interface MultiYearMetric {
  metric: string;          // Unique key: "energy", "water", "fuel", "paper", "waste", "ghg"
  label: string;           // Human-readable: "Electricity Consumption"
  unit: string;            // "kWh", "m³", "L", "kg", "%", "tCO₂e"
  kpiField: string;        // The data field name used for KPI display
  baselineYear: number;    // 2568
  currentYear: number;     // 2569
  years: Record<number, YearData>;
  yoyChange: YoyChange;    // Pre-computed Year-over-Year change
}

interface YearData {
  year: number;
  isBaseline: boolean;
  dataStatus: 'complete' | 'in_progress' | 'missing';
  source: string;           // Source file reference, e.g. "1.1-Water.xlsx (converted)"
  updated: string;          // ISO date
  months: MonthlyValue[];   // Monthly data points
  total: number;            // Sum of monthly values
  average: number;          // Average monthly value
}

interface MonthlyValue {
  month: number;            // 1-12
  value: number;
  label: string;            // "Jan", "Feb", etc.
}

interface YoyChange {
  absolute: number;         // currentTotal - baselineTotal
  percent: number;          // (absolute / baselineTotal) * 100
  direction: 'up' | 'down' | 'stable';
}
```

Type definitions are in `src/utils/multi-year-schema.ts`.

---

## 3. 2568 Baseline Data

| Metric | Source File | Months | Status | Updated |
|--------|-------------|--------|--------|---------|
| Energy | `1.2-elect.xlsx` — XLSX Sheet "2568" col[6] (kWh) | 12 | ✅ Complete | 2026-07-15 |
| Water | `1.1-Water.xlsx` — XLSX Sheet "2568" col[6] (m³) | 12 | ✅ Complete | 2026-07-15 |
| Fuel | `1.3_Gassolene.xlsx` — XLSX Sheet "2568" col[6] (liters) | 12 | ✅ Complete | 2026-07-15 |
| Paper | `1.4_Paper.xlsx` — XLSX Sheet "2568" col[6] (kg) | 12 | ✅ Complete | 2026-07-15 |
| Waste | `1.5_Waste.xlsx` — Sheet "คำนวณ%" recycling % (decimal → %) | 12 | ✅ Complete | 2026-07-15 |
| GHG | `1.6_GreenhouseGas.xlsx` — Sheet "สรุปการคำนวณ ปี 2568" row "GHG ปี 2568 (kgCO2e)" | 12 | ✅ Complete | 2026-07-15 |

Baseline is marked with `"isBaseline": true` and `"dataStatus": "complete"`.

---

## 4. 2569 Current-Year Data

| Metric | Source File | Months Available | Status | Updated |
|--------|-------------|-----------------|--------|---------|
| Energy | `1.2-elect.xlsx` | 8 (Jan-Aug) | 🟡 In Progress | 2026-06-12 |
| Water | `1.1-Water.xlsx` | 6 (Jan-Jun) | 🟡 In Progress | 2026-06-12 |
| Fuel | `1.3_Gassolene.xlsx` | N/A (no 2569 data in XLSX) | 🟡 In Progress | 2026-06-12 |
| Paper | `1.4_Paper.xlsx` | N/A (no 2569 data in XLSX) | 🟡 In Progress | 2026-06-12 |
| Waste | `1.5_Waste.xlsx` | N/A (no 2569 data in XLSX) | 🟡 In Progress | 2026-06-12 |
| GHG | `1.6_GreenhouseGas.xlsx` | N/A (no 2569 data in XLSX) | 🟡 In Progress | 2026-06-12 |

Current-year data is marked with `"isBaseline": false` and `"dataStatus": "in_progress"` until all 12 months are present.

---

## 5. How to Update Data

**Recommended — Automated Import (NEW):**

Use the import script to update data from CSV. See [Excel Import Workflow](excel-import-workflow.md) for full instructions.

Quick reference:
```bash
# Place CSV in data/import/{metric}-{year}.csv
node scripts/import-dashboard-data.mjs --metric=water --year=2569
# Or import all files at once:
node scripts/import-dashboard-data.mjs --all
# Validate without writing:
node scripts/import-dashboard-data.mjs --all --dry-run
```

### Manual Fallback

If you prefer to edit JSON directly:

### Adding New 2569 Monthly Data

1. **Obtain the Excel file** from staff (e.g., updated `1.1-Water.xlsx` with new months).
2. **Convert to JSON:**
   - Open the Excel file.
   - Extract the monthly values for the relevant metric.
   - Add each new month to the `months` array in `src/data/generated/{metric}.json`.
   - Recalculate `total`, `average`, and `yoyChange`.
3. **Update metadata:**
   - Set `"updated": "2026-06-12"` to the current date.
   - If all 12 months are now present, change `"dataStatus": "in_progress"` → `"complete"`.
4. **Run validation:**
   ```bash
   npm run check
   npm run build
   npm run preview
   ```
5. **Verify:** Check `/dashboard/{metric}` renders correctly with new data.

### Example: Adding Month 9 for Water

```json
// In src/data/generated/water.json, years.2569.months:
"months": [
  { "month": 1, "value": 5600, "label": "Jan" },
  // ... existing 6 months ...
  { "month": 7, "value": 5400, "label": "Jul" },
  { "month": 8, "value": 5300, "label": "Aug" }  // ← ADD
],
// Recompute total and average from the full months array
// Recompute yoyChange
```

---

## 6. Validation Rules

| Check | Rule | Error Handling |
|-------|------|---------------|
| Month range | Each month value must be 1-12 | JSON schema validation |
| Duplicates | No duplicate month numbers in same year | Manual review |
| Completeness | 12 months → status=complete; <12 → status=in_progress | Auto-detected by `computeYearData()` in `multi-year-schema.ts` |
| Baseline flag | Exactly 1 year must have isBaseline=true | Enforced at build time |
| Missing data | Missing months show as "Pending" in UI with reduced opacity | Dashboard handles gracefully |

---

## 7. UI Behavior for Incomplete Data

- **2569 Badge:** Yellow "In Progress" badge with month count (e.g., "8 of 12 months").
- **Monthly Table:** Rows without 2569 data are shown at 50% opacity with "Pending" label.
- **YoY Cards:** Differences and percent changes are computed only on available months.
- **Sparkline:** Plots only available 2569 months.
- **Attribution:** Notes "Partial year comparison" when <12 months.

---

## 8. Adding a New Dashboard Metric

1. Create the Excel source file for baseline + current year data.
2. Create `src/data/generated/{metric}.json` following the schema.
3. Add the config entry in `src/data/dashboard-config.ts`.
4. Add the raw CSV to `src/data/csv/` for backward compatibility.
5. Add the import in `src/pages/dashboard/[id].astro`.
6. Run QA.

---

## 9. Excel Reference Files

Staff submit data in the following files (tracked in `docs/`, not directly consumed by dashboards):

| File | Metric | Column Extracted |
|------|--------|-----------------|
| `1.1-Water.xlsx` | Water consumption | Sheet "2568", col[6] (units = m³) |
| `1.2-elect.xlsx` | Electricity consumption | Sheet "2568", col[6] (kWh) |
| `1.3_Gassolene.xlsx` | Fuel consumption | Sheet "2568", col[6] (liters) |
| `1.4_Paper.xlsx` | Paper consumption | Sheet "2568", col[6] (kg) |
| `1.5_Waste.xlsx` | Waste & recycling | Sheet "คำนวณ%", recycling % row |
| `1.6_GreenhouseGas.xlsx` | GHG emissions | Sheet "สรุปการคำนวณ ปี 2568", row "GHG ปี 2568 (kgCO2e)" |

The extraction pipeline is `scripts/extract-xlsx-to-csv.mjs` → `data/import/{metric}-2568.csv` → `scripts/import-dashboard-data.mjs` → `src/data/generated/{metric}.json`.

Only the converted `src/data/generated/*.json` files are committed as canonical dashboard data.

---

*Source: Green Office Platform, Maejo University.*
