# GO-DATA-1: Validation Report

**Date:** 2026-07-23 (corrected 2026-07-24 — GO-DATA-1A)

This report was found to be materially inaccurate by an independent QC audit
(`docs/releases/GOFFICE2026_GO-DATA-1_FULL_REPORT.md`, verdict: REOPENED) and
has been corrected here. The original version incorrectly reported energy and
water 2569 as "✅ Valid" and waste's summed percentage totals as valid. See
`docs/releases/GOFFICE2026_GO-DATA-1A_REPORT.md` for the full remediation.

---

## 1. Summary

| Check | Result |
|-------|--------|
| Schema validation (`npm run data:validate`) | ✅ PASS — 0 errors |
| Warnings (unverified/placeholder data flagged) | ⚠ 15 warnings — expected and correct; see §2 |
| Reconciliation | ✅ PASS (baseline, where an XLSX was confirmed) / ⚠ Unverified (current year — no XLSX available) |
| Deterministic output | ✅ PASS |
| TypeScript types (`astro check`) | ✅ PASS — 0 errors |

**Note:** "0 warnings" is not achievable (nor desirable) while 6 of 12 metric-year
entries are current-year data with no source workbook available for
reconciliation. A PASS result with warnings is the correct, honest outcome.

---

## 2. Per-Metric Validation (corrected)

### Energy (Electricity)

| Year | Months | Total | Unit | Quality | Classification |
|------|--------|-------|------|---------|-----------------|
| 2568 | 12/12 | 403,036.8 | kWh | ✅ Valid | `CONFIRMED_XLSX` |
| 2569 | 8/12 | 149,100 | kWh | ⚠ **Invalid — unverified** | `DERIVED_FROM_CSV` (demo CSV, no XLSX reconciliation) |

### Water

| Year | Months | Total | Unit | Quality | Classification |
|------|--------|-------|------|---------|-----------------|
| 2568 | 12/12 | 8,337.5 | m³ | ✅ Valid (independently re-verified against `docs/1.1-Water.xlsx`) | `CONFIRMED_XLSX` |
| 2569 | 6/12 | 31,200 | m³ | ⚠ **Invalid — unverified** | `DERIVED_FROM_CSV` (demo CSV, no XLSX reconciliation) |

### Fuel

| Year | Months | Total | Unit | Quality | Classification |
|------|--------|-------|------|---------|-----------------|
| 2568 | 12/12 | 339.83 | L | ✅ Valid (source XLSX never in git — unverifiable) | `PRESERVED_LEGACY` |
| 2569 | 9/12 | 16,200 | L | ⚠ Invalid — placeholder | `PLACEHOLDER` |

### Paper

| Year | Months | Total | Unit | Quality | Classification |
|------|--------|-------|------|---------|-----------------|
| 2568 | 12/12 | 2,197.8 | kg | ✅ Valid (source XLSX never in git — unverifiable) | `PRESERVED_LEGACY` |
| 2569 | 6/12 | 916 | kg | ⚠ Invalid — placeholder | `PLACEHOLDER` |

### Waste (Recycling %) — corrected aggregation

| Year | Months | Total (was: sum) | Total (corrected: average) | Unit | Quality | Classification |
|------|--------|-------------------|-----------------------------|------|---------|-----------------|
| 2568 | 12/12 | 258.83 (invalid — sum of %) | **21.57** | % | ✅ Valid | `PRESERVED_LEGACY` |
| 2569 | 10/12 | 846 (invalid — sum of %) | **84.6** | % | ⚠ Invalid — placeholder | `PLACEHOLDER` |

YoY change corrected from the invalid +227% (sum-to-sum) to **+292%** (average-to-average).

### GHG

| Year | Months | Total | Unit | Quality | Classification |
|------|--------|-------|------|---------|-----------------|
| 2568 | 12/12 | 231.6 | tCO₂e | ✅ Valid | `CONFIRMED_XLSX` |
| 2569 | 8/12 | 349 | tCO₂e | ⚠ Invalid — placeholder | `PLACEHOLDER` |

---

## 3. Known Issues (updated)

1. **Missing source workbooks (5/6):** Only `1.1-Water.xlsx` exists in the repository. `12-elect.xlsx` and `1.5_GreenhouseGas.xlsx` were confirmed via git history (committed `fc24d7c`, removed `dfa57de`) but are now absent. `1.3_Gassolene.xlsx`, `1.4_Paper.xlsx`, and `1.5_Waste.xlsx` were **never committed to git at all** — their origin cannot be verified from repository history.
2. **2569 data is unverified for all six metrics**, not just fuel/paper/waste/GHG. Energy and water 2569 were previously (incorrectly) reported as valid; they are demo/CSV-only imports with no workbook reconciliation and are now correctly flagged `quality.valid: false` / `DERIVED_FROM_CSV`.
3. **No workbook totals for reconciliation:** The pipeline cannot reconcile calculated totals against workbook-calculated totals because the workbook totals are not stored anywhere and the source XLSX files are absent. This is a structural limitation, not something GO-DATA-1A can resolve without the original files.
4. **Waste aggregation was invalid and is now corrected:** Waste is a percentage-rate metric; summing 12 monthly percentages (yielding "258.83%") is mathematically meaningless. Waste now uses `aggregation: 'average'`.
5. **Waste indicator mapping was an invalid wildcard (`4.1.x`)** and is now `4.1`, with an explicit note that detailed sub-indicator mapping is still pending confirmation from the Green Office 2569 criteria document.
6. **GHG data is single-dimension:** Currently tracks total tCO₂e only. Scope 1, 2, 3 breakdown and activity source data should be added when available (out of scope for GO-DATA-1A).

---

## 4. Derived Values (2568 Baseline — Cross-Check)

| Metric | Known Value | Pipeline Value | Match | Independently re-verified in GO-DATA-1A? |
|--------|-------------|---------------|-------|----|
| Water | 8,337.5 m³ | 8,337.5 m³ | ✅ | ✅ Yes — read directly from `docs/1.1-Water.xlsx` |
| Electricity | 403,036.8 kWh | 403,036.8 kWh | ✅ | ❌ No — source XLSX absent, classified `CONFIRMED_XLSX` based on git history only |
| Fuel | 339.83 L | 339.83 L | ✅ (internally consistent) | ❌ No — source XLSX never in git, classified `PRESERVED_LEGACY` |
| Paper | ~2,197.8 kg | 2,197.8 kg | ✅ (internally consistent) | ❌ No — source XLSX never in git, classified `PRESERVED_LEGACY` |
| Waste | 21.57% (avg, corrected) | 21.57% | ✅ | ❌ No — source XLSX never in git, classified `PRESERVED_LEGACY` |
| GHG | 231.6 tCO₂e | 231.6 tCO₂e | ✅ (internally consistent) | ❌ No — source XLSX absent, classified `CONFIRMED_XLSX` based on git history only |

Only water's 2568 baseline has been independently cross-checked against a live source workbook in this repository. All other baselines rely on prior extraction records that cannot currently be re-verified.

