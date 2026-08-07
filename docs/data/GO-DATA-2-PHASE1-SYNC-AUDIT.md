# GO-DATA-2: Phase 1 Sync Pipeline Audit & Implementation Plan

**Date:** 2026-08-07 (updated 2026-08-07 — correction: template-copy interpretation)
**Status:** AUDIT COMPLETE — implementation NOT started (report only, per instruction)
**Scope:** 8 approved OneDrive source workbooks → local staging → parser classification → canonical dashboard schema mapping

> **CORRECTION (2026-08-07):** The FY2569 Waste and GHG workbooks were **intentionally created by copying the FY2568 workbooks as blank/current-year working templates**. Therefore a byte-identical 2026 file is **NOT a blocker** — it is the expected `WAITING_FOR_INPUT` state. Workbook comparison is now an informational diagnostic only. State is derived from **whether actual FY2569 observations exist in the canonical data ranges** (see `data/staging/manifest.json` v2 and GO-DATA-3).

---

## 1. Verdict

| Item | Status |
|------|--------|
| Source files exist & readable (8/8) | ✅ VERIFIED |
| Files copied to staging, SHA-256 recorded | ✅ VERIFIED |
| Workbook structures inspected | ✅ VERIFIED |
| Waste 2025 vs 2026 comparison | ✅ VERIFIED — identical (template copy, **informational only**) |
| GHG 2025 vs 2026 comparison | ✅ VERIFIED — identical except title (template copy, **informational only**) |
| Canonical FY2569 ranges defined | ✅ VERIFIED (see §5 and manifest v2) |
| Dashboard schema reusable for water/electric/fuel/paper | ✅ COMPATIBLE |
| Dashboard schema reusable for waste/GHG category/activity detail | ⚠️ **EXTENSION REQUIRED** (additive, non-breaking) |
| FY2569 dataset states | water/electric `PUBLISHABLE_PARTIAL` · fuel/paper/waste/ghg `WAITING_FOR_INPUT` |

**Overall verdict: VERIFIED (audit). Phase 2 design is ready (GO-DATA-3). No implementation blockers — only PO decisions on baseline reconciliation and paper units.**

---

## 2. File Inventory (SHA-256)

| # | File | Metric | Size | Modified | SHA-256 (first 16) |
|---|------|--------|------|----------|---------------------|
| 1 | `1.1Water.xlsx` | water | 81,930 | 2026-08-07 10:41 | `1915C65BEC732A88…` |
| 2 | `1.2electric.xlsx` | electricity | 74,073 | 2026-08-07 10:48 | `BB4B20D144242230…` |
| 3 | `1.3Gassolene.xlsx` | fuel | 244,585 | 2026-08-07 09:52 | `F50956618E436F6E…` |
| 4 | `1.4paper.xlsx` | paper | 203,467 | 2026-08-07 09:57 | `310A85F3236C02C9…` |
| 5 | `1.5waste2025.xlsx` | waste | 44,028 | 2026-08-07 10:22 | `5512418F9FA10A8B…` |
| 6 | `1.5waste2026.xlsx` | waste | 44,012 | 2026-08-07 10:23 | `2F99F8A573E1D050…` |
| 7 | `1.6GreenHouseGas2025.xlsx` | ghg | 515,168 | 2026-08-07 10:25 | `FFBBDCB2BE28990E…` |
| 8 | `1.6GreenHouseGas2026.xlsx` | ghg | 515,231 | 2026-08-07 10:26 | `1FE6C3FCB026B2A5…` |

Full hashes + metadata: `data/staging/manifest.json` (committed with Phase 1).

**Read-only compliance:** Source folder never written to. All copies made via `Copy-Item` into `data/staging/source/`.

---

## 3. Workbook Structure Matrix

| File | Sheets | Per-sheet dims | Merges | Formulas | Errors | Month layout | Data location |
|------|--------|---------------|--------|----------|--------|--------------|---------------|
| `1.1Water.xlsx` | `2569`, `2568` | A1:S99 (2569), A1:T100 (2568) | 19 / 67 | 116 / 104 | 30 / 0 | Thai months col[0], rows 4–15 | current-year value col[6]; prev-year col[2]; %Δ col[9]; totals row 17 (`รวม`); meter read cols 13–15 |
| `1.2electric.xlsx` | `2569`, `2568` | A1:S100 / A1:T101 | 19 / 67 | 140 / 128 | 29 / 0 | Thai months col[0], rows 4–15 | same template; kWh col[6] |
| `1.3Gassolene.xlsx` | `2569`, `2568`, `2567`, `IQS`, `rae`, `บำรุงรักษา` | A1:T97 / A1:T98 / A1:T98 / A1:Z1000 / A1:Z1000 / A2:P18 | 19 / 48 / 38 / 1 / 1 / 8 | 100 / 101 / 68 / 0 / 0 / 0 | 45 / 12 / 0 / 0 / 0 / 0 | Thai months col[0], rows 4–15 | **2569 sheet has NO 2569 values** — only 2568 reference cols (1–4); 2569 cols 5–8 empty; km/l col[4] |
| `1.4paper.xlsx` | `2569`, `2568`, `2567`, `แต่ละหน่วยงาน`, `Reuse` | A1:T99 / A1:T98 / A1:T98 / A1:Z987 / A1:L20 | 19 / 37 / 37 / 20 / 5 | 103 / 72 / 80 / 230 / 66 | 6 / 0 / 0 / 0 / 0 | Thai months col[0], rows 4–15 | **2569 sheet has NO 2569 values** (only จำนวนคน 2569 = 94 filled); unit changed 2568:kg → 2569:รีม (reams) — unit mismatch to resolve |
| `1.5waste2025.xlsx` | `ปริมาณขยะรายเดือน `, `คำนวณ%`, `คำนวณ ปริมาณขยะ` | A1:M22 / A1:M9 / A1:AA24 | 2 / 2 / 4 | 24 / 78 / 86 | 0 / 0 / 0 | Thai months col[1] (B–M), 12 cols | rows: `ขยะทั่วไป` r3/r2, `ขยะอันตราย` r4/r3, `ขยะรีไซเคิล/นำกลับ` r5/r4, `รวมขยะทั้งหมด` r5(`คำนวณ%`), detailed breakdown rows 5–20 |
| `1.5waste2026.xlsx` | same 3 sheets | identical dims | identical | identical | 0 | same | **content-identical to 2025 (0 cell diffs, 0 formula diffs)** |
| `1.6GreenHouseGas2025.xlsx` | `สรุปการคำนวณ ปี 2568`, `สรุปการคำนวณ ปีฐาน`, `CH4จากseptic tank`, `CH4จากบ่อบำบัด…`, `EF TGO AR5` | A1:AU123 / A1:AW49 / A1:R29 / A1:P18 / A2:M184 | 60 / 25 / 0 / 3 / 11 | 584 / 216 / 21 / 39 / 152 | 0 / 0 / 0 / 0 / 0 | month pairs col 6–29 (ปริมาณ\|CF); annual total col 30; rows: activities 7–24, `รวม` r25 | activity rows: r7/8 diesel, r11 diesel, r15/16 CH4, r19 electricity, r20 paper, r22 water, r23/24 waste |
| `1.6GreenHouseGas2026.xlsx` | same, summary sheet renamed `… ปี 2569` | identical | identical | identical | 0 | same | **identical to 2025 except sheet name + G3 title cell** |

---

## 4. Parser Classification

| Parser | Workbooks | Rationale |
|--------|-----------|-----------|
| **A — Monthly-template (col[6] current-year)** | `1.1Water.xlsx`, `1.2electric.xlsx` | Identical form: Thai month rows 4–15, value in col[6], totals row 17. 2569 sheet **has** 7 months of real FY2569 data. |
| **B — Monthly-template (no FY2569 data yet)** | `1.3Gassolene.xlsx`, `1.4paper.xlsx` | Same form as A but the 2569 sheet's current-year columns are **empty**. Parser A reusable; extraction yields 0 months for 2569. Paper unit kg→รีม mismatch needs flagging. |
| **C — Waste workbook (3-sheet form)** | `1.5waste2025.xlsx`, `1.5waste2026.xlsx` | Same form in both files (contrary to initial assumption of different forms). Sheet `คำนวณ%` is the summary source, `ปริมาณขยะรายเดือน ` is the canonical input sheet. Both years parsed by ONE parser. 2026 == 2025 is the expected **template copy** → `WAITING_FOR_INPUT` (informational diagnostic only). |
| **D — GHG workbook (activity × EF)** | `1.6GreenHouseGas2025.xlsx`, `1.6GreenHouseGas2026.xlsx` | Same form in both files. Activity rows 7–24 with paired ปริมาณ/CF month columns, `รวม` r25, EF from col[3]/`EF TGO AR5` sheet. Both years parsed by ONE parser. 2026 == 2025 except sheet title is the expected **template copy** → `WAITING_FOR_INPUT` (informational diagnostic only). |

> **Correction to task assumption:** The task stated "Waste 2025 and Waste 2026 use different workbook forms" and "GHG 2025 and GHG 2026 may also use different workbook structures." Audited evidence: **each pair uses the SAME form.** One parser per pair is correct, not two.

---

## 5. Source → Schema Mapping

| Metric | Workbook → Sheet | Parser | Canonical output | FY2569 state |
|--------|-----------------|--------|------------------|--------------|
| water | `1.1Water.xlsx` → `2569`, col[6] (rows 4–15) | A | `water.json` (existing schema, `m³`) | `PUBLISHABLE_PARTIAL` (7/12 — Jan–Jul) |
| electricity | `1.2electric.xlsx` → `2569`, col[6] (rows 4–15) | A | `energy.json` (existing schema, `kWh`) | `PUBLISHABLE_PARTIAL` (7/12 — Jan–Jul) |
| fuel | `1.3Gassolene.xlsx` → `2569`, col[6] (rows 4–15) | A | `fuel.json` (existing schema, `L`) | `WAITING_FOR_INPUT` (0/12) |
| paper | `1.4paper.xlsx` → `2569`, col[6] (rows 4–15) | A | `paper.json` (existing schema, `kg`) | `WAITING_FOR_INPUT` (0/12; unit 2569=รีม) |
| waste | `1.5waste2026.xlsx` → `ปริมาณขยะรายเดือน ` rows 3–18, cols 1–12 | C | `waste.json` (kg) + `recycling_rate.json` (%) + `wasteBreakdown` | `WAITING_FOR_INPUT` (template copy, 0 observations) |
| ghg | `1.6GreenHouseGas2026.xlsx` → `สรุปการคำนวณ ปี 2569` rows 7–24 | D | `ghg.json` (tCO₂e) + `ghgActivities` | `WAITING_FOR_INPUT` (template copy, 0 observations) |

### Canonical FY2569 input ranges (explicit)

| Metric | Sheet | Rows | Columns | Reconcile |
|--------|-------|------|---------|-----------|
| water/electric/fuel/paper | `2569` | 4–15 (Thai month rows) | col[6] = FY2569 value; col[0] = month | row 17 `รวม` col[6] |
| waste | `ปริมาณขยะรายเดือน ` | 3–18 (ขยะทั่วไป r3; ขยะอันตราย r5–11; ขยะรีไซเคิล r13–18) | cols 1–12 (B–M) | `คำนวณ%` rows 2–5 |
| ghg | `สรุปการคำนวณ ปี 2569` | 7–24 (activity rows) | cols 6,8,…,28 ปริมาณ + 7,9,…,29 CF | row 25 `รวม` + col 30 annual |

### Template vs observation separation

- A **template baseline fingerprint** (SHA-256 over canonical-range cells: value + display + formula) is recorded per FY2569 workbook at first staging (`manifest.json`).
- On each sync, the canonical fingerprint is recomputed. **Only a fingerprint change over the canonical ranges = meaningful data change.**
- Formatting-only / metadata-only / sheet-name changes do NOT alter the canonical fingerprint → state stays `WAITING_FOR_INPUT`.
- Missing months display `-` (or empty) in the workbook and are **never emitted as zero** — the raw cell may hold a formula returning 0, but the formatted display `-` marks it missing.
- waste2026 / ghg2026 fingerprints equal their FY2568 template baselines today → `WAITING_FOR_INPUT` by design, not a blocker.

### Canonical schema changes (additive — no breaking changes)

```ts
// multi-year-schema.ts — proposed additive optional fields (Phase 2)
export type DatasetState = 'WAITING_FOR_INPUT' | 'PUBLISHABLE_PARTIAL' | 'COMPLETE' | 'INVALID_SOURCE_DATA';

export interface YearData {
  // ...existing fields unchanged...
  datasetState?: DatasetState;          // NEW — Phase 2 sync state
  wasteBreakdown?: {
    categories: { key: string; labelTh: string; labelEn: string; months: MonthlyValue[]; total: number }[];
  };
  ghgActivities?: {
    items: {
      key: string; labelTh: string; scope: 1 | 2 | 3;
      activityUnit: string; ef: number; efUnit: string;
      months: { month: number; activity: number; emissionKgCO2e: number }[];
      annualEmissionKgCO2e: number;
    }[];
  };
}
```

These are additive (`?:`), so all existing consumers (`dashboard.astro`, `dashboard-executive.ts`, `dashboard-generated-metrics.ts`, `kpi-summary.json`, validators) continue to work unchanged. KPI totals still derive from `months[]`.

---

## 6. Waste Categories (from source)

Sheet `คำนวณ%` (source of truth) rows:
- `ขยะทั่วไป` (general/landfill) — r2, kg
- `ขยะอันตราย` (hazardous) — r3, kg
- `ขยะรีไซเคิล / นำกลับมาใช้ใหม่` (recycled/reused) — r4, kg
- `รวมขยะทั้งหมด` (total) — r5, kg
- `%ขยะรีไซเคิล` r6, `%ขยะทั่วไป` r7, `%ขยะอันตราย` r8

Detail sheet `คำนวณ ปริมาณขยะ` preserves sub-categories (กระดาษ, กล่องลัง, ขวดพลาสติก, ใบไม้, เศษอาหาร; หมึกพิมพ์, หลอดไฟ, ถ่ายไฟฉาย, น้ำยาลบคำผิด, ขวดสเปรย์, กระป๋องน้ำยาเคมี) — preserved in `wasteBreakdown` under the 3 main categories.

> ⚠️ **Sheet inconsistency found:** `คำนวณ%` r3 ขยะอันตราย ม.ค. = 0, but `คำนวณ ปริมาณขยะ` r13 รวมขยะอันตราย ม.ค. = 0.8 (and total 468.9 vs 468.1). The summary sheet rounds/simplifies. Validation rule must reconcile and flag; primary source = `คำนวณ ปริมาณขยะ` detail sheet for accuracy, `คำนวณ%` for dashboard totals (matches existing waste.json exactly: 468.1…417.4 ✓).

---

## 7. GHG Traceability (from source)

Activity rows preserve: activity quantity (ปริมำณ) + computed footprint (CF) per month, EF value + unit, source scope:
- Scope 1: r7/8 Diesel (EF 2.7078), r11 Diesel (2.7406), r12/13 Gasohol (2.2394), r15 CH4 septic (28), r16 CH4 บ่อบำบัด (28), r17/18 refrigerants
- Scope 2: r19 electricity (EF 0.4999 kgCO2e/kWh)
- Scope 3: r20 paper A4/A3 (2.102), r22 water (0.541), r23/24 waste (2.32 / 2.7078)
- EF reference sheet: `EF TGO AR5` (GWP AR5: CO2=1, CH4=28, N2O=265)

Total row r25: monthly totals (kgCO2e) cols 6,8,…,28 + annual col 30 = **231,229.39 kgCO2e = 231.23 tCO₂e**.

> ⚠️ **Baseline drift:** existing `ghg.json` 2568 baseline total = 231.6 tCO₂e (extracted from old `docs/1.5_GreenhouseGas.xlsx` row 67). New approved workbook r25 = 231.23 tCO₂e. Small variance → re-extraction would change baseline. PO decision required (blocker 3).

---

## 8. Validation Rules per Metric

| Metric | Rule |
|--------|------|
| All | Month 1–12 integers, unique, ascending; value ≥ 0; total = sum(months) within tolerance; year keys 2567–2570 |
| All (state) | `datasetState` derived from canonical-range observations only: 0 valid → `WAITING_FOR_INPUT`; 1–11 → `PUBLISHABLE_PARTIAL`; 12 → `COMPLETE`; parse/reconcile failure → `INVALID_SOURCE_DATA` |
| All (missing) | Cells displayed `-`/empty are **missing, never zero** — even when the raw cell is a formula returning 0 (verified: water/electric 2569 Aug–Dec are `P12:P16` formulas displaying `-`). Formatting-only changes never change state. |
| water / electricity | unit `m³` / `kWh`; tolerance ±0.5 / ±5; 2569 = `PUBLISHABLE_PARTIAL` (7/12); reconciliation vs workbook `รวม` row (water 5,572.03 ✓ = sum of 7 real months; electric 264,594.40 ✓) |
| fuel / paper | same as water; 0/12 → `WAITING_FOR_INPUT`, quality.valid=false, months emitted as `[]` (not zeros) |
| paper | unit flag: 2569 sheet labeled รีม not kg — require explicit conversion factor or PO confirmation before 2569 extraction |
| waste | category sums must reconcile: ขยะทั่วไป + ขยะอันตราย + ขยะรีไซเคิล = รวมขยะทั้งหมด (both sheets); flag cross-sheet mismatch (468.1 vs 468.9 Jan); % rows average-aggregated (never summed); template copy → `WAITING_FOR_INPUT` until fingerprint changes |
| ghg | monthly totals must equal sum of activity CF rows (reconcile r25 vs rows 7–24); EF values must match `EF TGO AR5` sheet within tolerance; annual kgCO2e→tCO₂e ÷1000; template copy → `WAITING_FOR_INPUT` until fingerprint changes |

## 9. Reusable Existing Code

| Asset | Purpose |
|-------|---------|
| `scripts/data-pipeline.mjs` | Canonical CSV→JSON import, validation, KPI/quality generation (`npm run data:build`) — **reuse for water/electric/fuel/paper** |
| `scripts/data-validator.mjs` | `validateMonthData`, header validation, month labels — reuse |
| `scripts/validate-provenance.mjs` | RC-1 provenance shape checks — reuse |
| `scripts/lib/serialize-json.mjs` | Deterministic JSON writer — reuse |
| `src/utils/multi-year-schema.ts` | Canonical `MultiYearMetric`/`YearData` types — reuse; extend additively (`datasetState`, `wasteBreakdown`, `ghgActivities`) |
| `src/data/generated/*.json` | Existing baselines 2568 — keep as-is unless PO approves re-baseline |
| `data/import/templates/*.csv` | Import templates — reuse |
| `scripts/extract-xlsx-to-csv.mjs` | Col[6] month-row extractor — **reusable baseline for parser A** (needs sheet-name update + 2569 handling) |

## 10. Required New Code (Phase 2 — see GO-DATA-3)

1. `scripts/sync-phase1-stage.mjs` — idempotent staging: verify 8 sources, copy → `data/staging/source/`, compute SHA-256, **canonical-range fingerprints**, template baselines, `datasetState` derivation, write `data/staging/manifest.json` (scriptifies the v2 manifest already drafted).
2. `scripts/extract-workbook.mjs` — replaces ad-hoc `_tmp-*.mjs`: implements parsers A–D with sheet auto-detection (`2568`/`2569` / `ปริมาณขยะรายเดือน ` / `สรุปการคำนวณ ปี X`), month-row detection, display-aware value extraction (`w` not `v`), totals, unit handling.
3. `data/import/*-2569.csv` regeneration from workbooks (currently stale placeholders — water Jan 5400 ≠ real 1,098.40; electric Jan 18200 ≠ real 28,618.40 — **must be replaced**). Missing months omitted — never zero.
4. `datasetState` + `wasteBreakdown` / `ghgActivities` schema extension in `multi-year-schema.ts` and `generate-canonical-data.mjs` (additive).
5. Validator additions: cross-sheet waste reconciliation; GHG CF-sum vs total-row; **fingerprint-change guard** (formatting-only edits ignored); paper unit flag.

---

## 11. Blockers / Product Owner Decisions

| # | Blocker | Question | Suggested default |
|---|---------|----------|-------------------|
| 1 | ~~waste2026 = copy of 2025~~ **RESOLVED** — intentional template copy | — | `WAITING_FOR_INPUT`; no import until canonical fingerprint changes |
| 2 | ~~ghg2026 = copy of 2025~~ **RESOLVED** — intentional template copy | — | `WAITING_FOR_INPUT`; no import until canonical fingerprint changes |
| 3 | New GHG workbook total (231.23 tCO₂e) ≠ existing baseline (231.6 tCO₂e) | Re-baseline 2568 GHG from the new approved workbook, or keep existing baseline? | Re-baseline from approved source (official), update docs |
| 4 | Paper 2569 sheet unit changed kg→รีม (reams) | Conversion factor ream→kg for FY2569 paper? | Await PO/staff value; flag until then |
| 5 | Waste sheets internally inconsistent (ขยะอันตราย ม.ค. 0 vs 0.8) | Which sheet is authoritative for dashboard totals? | Keep `คำนวณ%` for KPI (matches existing); detail sheet for breakdown |
| 6 | Water/electric FY2569 only 7/12 months | Import partial year now (marked `PUBLISHABLE_PARTIAL`) or wait for complete year? | Import now, `datasetState: PUBLISHABLE_PARTIAL`, quality.valid=false until 12/12 |

---

## 12. Next Steps (gated on decisions)

1. PO answers blockers 3–6 (1–2 resolved).
2. Phase 2 (per GO-DATA-3): implement `sync-phase1-stage.mjs` + `extract-workbook.mjs` (parsers A–D, display-aware).
3. Regenerate `data/import/*-2569.csv` from staging workbooks (replace stale placeholders; omit missing months).
4. Extend schema additively (`datasetState`, `wasteBreakdown`, `ghgActivities`); extend `generate-canonical-data.mjs` + validators.
5. `npm run data:build` + `data:validate` + runtime QA (`npm run qa:routes`). **No production deploy.**
