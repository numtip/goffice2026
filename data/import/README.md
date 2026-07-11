# Green Office Dashboard — CSV Import

This directory holds CSV source files for the dashboard data import pipeline.

## CSV Format

Every CSV file **must** contain exactly two columns:

| Column  | Description                                  |
| ------- | -------------------------------------------- |
| `month` | Month number (integer 1–12)                  |
| `value` | Numeric metric value for that month          |

**Header row is required** — the first line must be `month,value`.

### Example (12 rows for a complete year)

```csv
month,value
1,5400
2,5200
3,5100
4,5050
5,5150
6,5300
7,5480
8,5560
9,5400
10,5350
11,5480
12,5560
```

### Validation rules

- `month`: integer, 1–12, no duplicates.
- `value`: non-negative number. Empty or non-numeric values are rejected.
- Baseline data (year ≤ 2568) must have **all 12 months**.
- Current-year data (2569+) may be partial.

---

## Naming Convention

```
{metric}-{year}.csv
```

| Part     | Description                                                    |
| -------- | -------------------------------------------------------------- |
| metric   | One of: `energy`, `water`, `fuel`, `paper`, `waste`, `ghg`     |
| year     | Buddhist calendar year (e.g. `2568` for baseline, `2569` for current) |

Examples: `water-2569.csv`, `energy-2568.csv`, `fuel-2569.csv`

---

## Exporting from Excel to CSV

### Method A — Save As (single file)

1. Open your spreadsheet in Microsoft Excel.
2. Go to **File → Save As** (or **Save a Copy**).
3. Set **Save as type** to `CSV UTF-8 (Comma delimited) (*.csv)`.
4. Name the file according to the naming convention above (e.g. `water-2569.csv`).
5. Save to `data/import/`.

> ⚠️ Excel may warn about features not supported in CSV — click **Yes** to continue.

### Method B — Export (multiple sheets)

1. Open the workbook and activate the sheet you want to export.
2. **File → Export → Change File Type → CSV**.
3. Name and save following the convention.

---

## Running the Import Pipeline

### Validate only (dry run)

```bash
node scripts/import-dashboard-data.mjs --all --dry-run
```

This checks all CSV files in `data/import/` without writing any files.

### Import a single metric

```bash
node scripts/import-dashboard-data.mjs --metric=water --year=2569
```

### Import all available CSVs

```bash
npm run import:data -- --all
```

Or via the package script:

```bash
npm run import:validate
```

### Output

Generated JSON files are written to `src/data/generated/{metric}.json`. These are consumed by the Astro dashboard pages at `src/pages/dashboard/`.

---

## Template Files

See `templates/` for empty template CSVs with just the header row. Copy one of these when preparing new data.

## Existing data files

| File              | Metric | Year | Status   |
| ----------------- | ------ | ---- | -------- |
| `water-2569.csv`  | water  | 2569 | partial  |
| `energy-2569.csv` | energy | 2569 | partial  |
