# GO-CAT1-1.5 — FY2568 GHG Workbook ↔ Dashboard Reconciliation

**Date:** 2026-08-19  
**Status:** RECONCILIATION COMPLETE (historical-baseline)  
**Verdict:** FY2568 GHG baseline **~232 tCO₂e** is verified for dashboard and Category 1 contracts; monthly Jan–Nov from workbook row 68; December and annual total align to narrative **231.62 tCO₂e** (1.5.2 / cell A166), not live formula totals. Septic-tank data-entry anomaly excluded. No FY2569 values created. **1.5 UI not built in this phase.**

---

## 1. VERDICT

FY2568 GHG is **reconcilable as a single historical baseline** when using:

- **Monthly Jan–Nov:** `สรุปการคำนวณ ปี 2568` row **68**, cols **D–N** (kgCO₂e → tCO₂e)
- **December:** **derived** as 231.62 − Σ(Jan–Nov) = **14.02 tCO₂e** — workbook `O68` is corrupted (7,554,708.77 kg)
- **Annual total (authoritative for reporting):** **231.62 tCO₂e** (narrative A166 + 1.5.2 PDF)
- **Dashboard display:** **231.6 tCO₂e** (one-decimal rounding of monthly sum 231.60)

Dashboard **~232 tCO₂e claim is CONFIRMED**. Workbook **formula total E42 = 7,772.31 tCO₂e is REJECTED** (septic anomaly).

---

## 2. Workbook Disposition

| Path | Status |
|------|--------|
| `docs/1.5_GreenhouseGas.xlsx` (pipeline primary) | **Absent** from repo |
| `public/documents/fy2568/cat1/1.5Green house gass/1.5_GreenhouseGas2568.xlsx` | **Present** — audited FY2568 canonical proxy |
| `public/.../1.5_greenhousegass_update.xlsx` | Present — **2567/2566 only**; do not use for FY2568 |

FY2568 year context: sheet `สรุปการคำนวณ ปี 2568`, form label `แบบฟอร์ม 1.5(1)`, header `ปริมาณก๊าซเรือนกระจก (kgCO2e) ประจำปี 2568`.

---

## 3. Source Sheets

| Sheet | Role |
|-------|------|
| `สรุปการคำนวณ ปี 2568` | Main calculator, monthly row 68, scope rollup E39–E42, narrative A140/A166 |
| `CH4จาก Septic tank 2568` | Septic CH₄; **N3 = 1,122,222 employees** (anomaly) |
| `CH4จากบ่อบำบัดไม่เติมอากาศ 2568` | Anaerobic wastewater CH₄ |
| `สรุปการคำนวณ ปี 2567` | Prior-year calculator (220.99 tCO₂e total) |
| `EF TGO AR5` | TGO AR5 emission-factor reference |

---

## 4. Canonical Annual / Monthly Values (FY2568)

### Monthly (tCO₂e) — canonical for dashboard + category1

| M | tCO₂e | Source |
|---|------:|--------|
| Jan | 11.53 | `D68` |
| Feb | 14.45 | `E68` |
| Mar | 21.38 | `F68` |
| Apr | 20.86 | `G68` |
| May | 22.67 | `H68` |
| Jun | 21.78 | `I68` |
| Jul | 21.96 | `J68` |
| Aug | 22.23 | `K68` |
| Sep | 23.44 | `L68` |
| Oct | 18.85 | `M68` |
| Nov | 18.43 | `N68` |
| Dec | 14.02 | **Derived** from A166 total − Σ(Jan–Nov); `O68` unusable |

**Monthly sum:** 231.60 tCO₂e · **Narrative annual:** 231.62 tCO₂e · **Δ = 0.02 tCO₂e** (flagged, not inferred away)

### Annual total by layer

| Layer | Total | Basis |
|-------|------:|-------|
| Category 1 inventory | **231.62** | 1.5.2 PDF / A166 narrative |
| Dashboard `generated/ghg.json` | **231.6** | Rounded sum of 12 months |
| Workbook formula E42 | ~~7,772.31~~ | **Rejected** — septic inflation |

---

## 5. Scope Support

**Source-supported:** Workbook explicitly labels Scope 1 / 2 / 3 (ประเภท 1/2/3).

**Corrected FY2568 scopes** (septic excluded; match 1.5.2):

| Scope | tCO₂e |
|-------|------:|
| 1 | 10.85 |
| 2 | 201.48 |
| 3 | 19.29 |
| **Sum** | **231.62** |

**Workbook formula scopes (broken):** E39 = 7,551.54 (Scope 1 inflated by septic AE16).

**Dashboard:** Scope breakdown **not shown** — `metric-insights.ts` returns “Not Available” (correct; dashboard pipeline does not ingest scope records).

---

## 6. Target Source

| Target | Source | Value |
|--------|--------|-------|
| FY2568 reduction goal | Workbook A140 | **−1.00% vs FY2567** |
| FY2568 actual vs target | A166 + `ghg-perf-1` | **+4.81%** vs −1% → **not met** |
| FY2569 dashboard target | — | `null` / `TARGET_PENDING_APPROVAL` |
| 1.1.3 per-capita target | `category1/targets.json` | 203.15 kg/person (separate from 1.5.2) |

No standalone numeric “target tCO₂e” cell in workbook.

---

## 7. Previous-Year Source

| Item | Source | Value |
|------|--------|------:|
| FY2567 total | `สรุปการคำนวณ ปี 2568!D42` | **220.99 tCO₂e** |
| FY2567 scopes | D39–D41 | 11.02 / 192.53 / 17.44 tCO₂e |
| YoY change (2568 vs 2567) | A166 | +10.63 tCO₂e, **+4.81%** |

Full FY2567 calculator sheet included in same workbook.

---

## 8. Dashboard Reconciliation

| Check | Result |
|-------|--------|
| ~232 tCO₂e on `/dashboard/ghg/` | **PASS** (231.6 displayed) |
| 12/12 months | **PASS** (verified baseline) |
| Source traceability | **Partial** — provenance pointed at missing `docs/` path; corrected to published workbook + row 68 |
| Scope on dashboard | **Not shown** (by design) |
| FY2569 leakage | **None** — `CURRENT_DATA_PENDING`, empty months |
| Verified wording vs evidence | **Split** — dataset `VERIFIED_BASELINE`; evidence-index `pending` |

### Canonical feed chain

```
1.5_GreenhouseGas2568.xlsx (public FY2568 evidence copy)
  → scripts/extract-xlsx-to-csv.mjs (row 68, kg→t)
  → data/import/ghg-2568.csv (not committed)
  → scripts/import-dashboard-data.mjs
  → src/data/generated/ghg.json          ← dashboard canonical
  → kpi-summary.json, data-quality.json

Parallel (Category 1 / 1.5 indicators):
  → src/data/category1/ghg.json          ← inventory, scopes, performance, exclusions
```

**One-source rule:** Monthly values **must match** between `generated/ghg.json` and `category1/ghg.json` monthly records. Annual total: category1 uses narrative **231.62**; dashboard uses **231.6** (sum rounding) — **0.02 tCO₂e documented delta**.

---

## 9. Status / Label Inconsistencies

| Area | Issue | Disposition |
|------|-------|-------------|
| Dataset vs evidence | Contract `reviewed` vs evidence `pending` | **By design** — numeric validation ≠ human sign-off |
| Dashboard “Verified” | Baseline dataset complete | Does not imply evidence verified |
| `relatedIndicators` 1.5.2 label | Was “GHG reduction target” | **Corrected** to criteria title |
| Evidence description | “Scope 1 and 2” only | Inventory includes Scope 3 — metadata note |
| Evidence `realSourcePath` | `docs/1.6_GreenhouseGas.xlsx` | **Corrected** to published 1.5 FY2568 path |
| `ghg-perf-1 actualChangePct` | Was 3.81% | **Corrected** to workbook **4.81%** |
| Stale `src/data/csv/ghg.csv` | Sample placeholder data | **Not canonical** — do not use |
| 1.5.3 | MISSING | Dashboard link is navigation only; not proof of training |

---

## 10. Anomalies / Blockers

| ID | Description | Blocks baseline? |
|----|-------------|------------------|
| ANOM-SEPTIC-NOV-DEC | `CH4จาก Septic tank 2568!N3` = 1,122,222 employees | No — excluded from reported totals |
| ANOM-FORMULA-E42 | E42/AE26 = 7,772 tCO₂e | No — rejected; documented |
| ANOM-DEC-O68 | O68 = 7,554,708.77 kg | No — Dec uses derived 14.02 tCO₂e |
| ANOM-TOTAL-0.02 | Monthly sum 231.60 vs narrative 231.62 | No — explicit flag |
| ANOM-SOURCE-PATH | `docs/1.5_GreenhouseGas.xlsx` missing | Partial — extraction uses public fallback |
| ANOM-CSV-NOT-COMMITTED | `ghg-2568.csv` absent | Partial — reproducibility gap |
| 1.5.3 evidence | No FY2568 training record | Yes for 1.5.3 only |

**Not blockers for 1.5.1/1.5.2 baseline or dashboard.**

---

## 11. Files Changed (this reconciliation)

| File | Change |
|------|--------|
| `docs/data/GO-CAT1-1.5-FY2568-GHG-RECONCILIATION.md` | This report |
| `src/data/category1/ghg.json` | Fix `actualChangePct` 4.81%; add anomaly records |
| `src/data/generated/ghg.json` | Provenance + 1.5.2 label correction |
| `src/data/evidence-index.json` | FY2568 workbook path + availability |
| `scripts/extract-xlsx-to-csv.mjs` | Public workbook fallback |
| `scripts/test-category1-contracts.mjs` | Dashboard ↔ category1 monthly reconciliation test |

---

## 12. Validation

Run: category1 contract validator, `npm test`, `npm run check`, `npm run build`, `git diff --check`.

Regression: `/dashboard/ghg/` TH/EN; no 1.3/1.4 regression; no FY2569 GHG values.

---

## 13. Recommended Presentation Phase (not in scope)

1. Build 1.5.1 / 1.5.2 journey pages (pattern: 1.3 / 1.4) reading **one** view-model from category1 + generated monthly sync.
2. Wire scope breakdown from category1 inventory (optional dashboard insight — not required for baseline truth).
3. Surface performance block (target −1%, actual +4.81%, not met) on 1.5.2 — not on dashboard KPI card.
4. Keep 1.5.3 amber/missing until dedicated training evidence exists.
5. Restore/commit `docs/1.5_GreenhouseGas.xlsx` or standardize on published path in all provenance.
6. Fix workbook septic N3/N4 at source (operational, outside repo).

---

## Contract Mapping (existing schema — no new schemas)

| Blueprint entity | Implementation |
|------------------|----------------|
| `ghgInventory` | `kind: "inventory"` |
| `ghgEmissionRecord` | `kind: "monthly"` × 12 |
| `ghgPerformanceAnalysis` | `kind: "performance"` (`ghg-perf-1`) |
| `ghgActivityData` | Implicit in monthly + workbook activity rows |
| `emissionFactor` | Workbook `EF TGO AR5` sheet; not standalone contract records |
