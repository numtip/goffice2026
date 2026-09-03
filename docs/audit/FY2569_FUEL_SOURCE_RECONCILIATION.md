# FY2569 Fuel Source Reconciliation Audit (Read-Only)

**Date:** 2026-09-03
**Scope:** FY2569 fuel lineage only — no workbook, CSV, generated JSON, provenance, or dashboard value changes.
**Verdict:** `FUEL_SOURCE_RECONCILIATION_REQUIRED — values unchanged`

---

## Summary

Published `fuel.json` shows **Jan–Jun FY2569 identical to Jan–Jun FY2568** (six matching liters values). **Jul FY2569 = 56.54 L** is the only month that differs in the partial-year series. Workbook inspection shows FY2569 sheet column `(ลิตร) ปี 2569` (col G) is the extraction source for published FY2569 values, and the **IQS** auxiliary sheet mirrors those same seven values. However, the **authoritative FY2568 sheet** column `(ลิตร) ปี 2568` (col G) carries **different** Jan–Jun liters than both the published FY2568 baseline in `fuel.json` and FY2569 Jan–Jun. The published FY2568 baseline Jan–Jun instead matches FY2569/IQS columns — indicating baseline misalignment or copy-forward, not verified independent 2568 vs 2569 observation. Data-owner reconciliation is required before changing any published totals.

---

## Source lineage chain

| Layer | Location | SHA-256 / key metadata |
|-------|----------|------------------------|
| Workbook | `data/staging/source/1.3Gassolene.xlsx` | `0e610a4b22ecfdc781d9c14d8b4e4c10ec8189ff019206b631507bb93e121566` |
| Sheet (FY2569) | `2569` | Rows 5–11 (Thai months), col G = liters |
| Sheet (FY2568) | `2568` | Rows 5–16, col G = liters (12 months) |
| Sheet (aux) | `IQS` | Rows 4–10, col C = liters (Jan–Jul only) |
| CSV | `data/import/fuel-2569.csv` | 7 rows — matches generated JSON |
| Generated JSON | `src/data/generated/fuel.json` → `years["2569"]` | `sourceSha256` = workbook SHA above |
| Extract sources | `data/staging/extract-sources.json` → `fuel-2569` | 7 months, total 396.37 L, extractionDate `2026-09-01` |
| Manifest | `data/staging/manifest.json` → `1.3Gassolene.xlsx` | Same SHA |
| Provenance registry | `src/data/audit/fy2569-dataset-provenance.json` → `metric:fuel` | `available_unverified`, 7/12 Jan–Jul |
| Dashboard | `/dashboard/` Normalized + Partial YoY | Reads generated JSON only (unchanged this PR) |

---

## Monthly comparison: FY2568 vs FY2569 (published JSON)

| Month | FY2568 `fuel.json` (L) | FY2569 `fuel.json` (L) | Match? | Published evidence |
|-------|------------------------|------------------------|--------|-------------------|
| Jan | 82.44 | 82.44 | **Yes** | `fuel.json`, `fuel-2569.csv` row 1 |
| Feb | 23.46 | 23.46 | **Yes** | same |
| Mar | 39.18 | 39.18 | **Yes** | same |
| Apr | 39.07 | 39.07 | **Yes** | same |
| May | 48.89 | 48.89 | **Yes** | same |
| Jun | 106.79 | 106.79 | **Yes** | same |
| Jul | **0** | **56.54** | **No** | `fuel.json` Jul 2569; workbook `2569` row 11 col G = 56.54 |
| Aug–Dec | 0 (2568 full-year padding) | *(absent in 2569)* | — | 2569 partial stops at Jul |

**Jan–Jul common-period sums (published):** FY2568 = 339.8 L · FY2569 = 396.4 L → normalized index **117** (dashboard fix uses this overlap, not full-year totals).

---

## Workbook cross-check (staging xlsx, read-only)

Values rounded to 2 decimals for display. Col indices 0-based from sheet dump.

### Sheet `2569` — FY2569 liters (col 6) vs embedded 2568 reference (col 2)

| Month | Col 2 “(ลิตร)ปี2568” ref | Col 6 “(ลิตร) ปี 2569” | Published 2569 |
|-------|--------------------------|-------------------------|----------------|
| Jan | 76.69 | **82.44** | 82.44 |
| Feb | 61.15 | **23.46** | 23.46 |
| Mar | 94.74 | **39.18** | 39.18 |
| Apr | 88.24 | **39.07** | 39.07 |
| May | 82.00 | **48.89** | 48.89 |
| Jun | 67.30 | **106.79** | 106.79 |
| Jul | 23.71 | **56.54** | 56.54 |

Published FY2569 values match **col 6** (2569 current-year column), not the embedded 2568 reference in col 2.

### Sheet `2568` — authoritative FY2568 liters (col 6) vs published `fuel.json` FY2568

| Month | Workbook `2568` col 6 | Published FY2568 | Match? |
|-------|----------------------|------------------|--------|
| Jan | 76.69 | 82.44 | **No** |
| Feb | 61.15 | 23.46 | **No** |
| Mar | 94.74 | 39.18 | **No** |
| Apr | 88.24 | 39.07 | **No** |
| May | 82.00 | 48.89 | **No** |
| Jun | 67.30 | 106.79 | **No** |
| Jul | 23.71 | 0 | **No** |

Published FY2568 baseline **does not match** the authoritative `2568` sheet col G for any Jan–Jul month. Published FY2568 Jan–Jun **does match** FY2569 col G and **IQS** col C (e.g. IQS Jan = 82.437 → 82.44).

### Sheet `IQS` (Jan–Jul auxiliary)

| Month | IQS col C (L) | Published 2569 |
|-------|---------------|----------------|
| Jan | 82.437 | 82.44 |
| Feb | 23.461 | 23.46 |
| Mar | 39.181 | 39.18 |
| Apr | 39.072 | 39.07 |
| May | 48.894 | 48.89 |
| Jun | 106.788 | 106.79 |
| Jul | 56.54 | 56.54 |

---

## Root cause (fuel)

1. **Jan–Jun FY2569 = FY2568 in published JSON** because the FY2568 baseline months in `fuel.json` were populated from the same numeric series as FY2569 current-year extraction (2569 sheet col G / IQS), not from the authoritative `2568` sheet col G.
2. **Jul = 56.54 L** is consistently observed in workbook `2569` row 11 col G, sheet `IQS` row 10 col C, `fuel-2569.csv`, and `fuel.json` — extraction is internally consistent; the anomaly is baseline alignment, not Jul extraction.
3. Prior audit notes (`docs/reports/GOFFICE2026_FY2569_RESOURCE_DELTA_AUDIT.md`) flagged **IQS Jul 56.54 L** as **NEEDS_DISPOSITION** (possible late FY2568 form fill). Workbook shows IQS holds all seven FY2569-published values; disposition remains with data owner.
4. FY2568 baseline in JSON lists `sourceWorkbook: docs/1.3_Gassolene.xlsx`, sheet `2568`, legacy path — predates Phase-2 staging SHA workflow; reconciliation with staged `2568` sheet is outstanding.

---

## Actions taken in this PR

- **None** on fuel data artifacts (read-only audit).
- Dashboard normalized index fix uses **Jan–Jul common-period sums** from published JSON (fuel index 117) without altering fuel totals.

---

## Recommended data-owner follow-up

1. Confirm whether FY2568 baseline should be re-extracted from `data/staging/source/1.3Gassolene.xlsx` sheet `2568` col G.
2. Confirm whether `IQS` sheet is an intake channel or duplicate of `2569` col G.
3. Resolve Jul 2568 (workbook 23.71 L vs published 0) and Jul 2569 (56.54 L) business meaning before verification upgrade from `available_unverified`.

---

## Related documents

- `docs/audit/FY2569_SOURCE_AUDIT_CAT1-7.md` — metric provenance table (fuel 7/12)
- `src/data/audit/fy2569-dataset-provenance.json` — `metric:fuel` record (unchanged SHA/coverage)
- `docs/data/GO-DATA-2-PHASE1-SYNC-AUDIT.md` — early note that 2569 sheet cols were empty (superseded by current 7-month publish)
