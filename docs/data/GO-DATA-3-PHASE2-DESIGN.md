# GO-DATA-3: Phase 2 Sync Pipeline Design (Workbook → Dashboard)

**Date:** 2026-08-07
**Status:** DESIGN — not yet implemented
**Dependencies:** GO-DATA-2 audit (approved), PO decisions (blockers 3–6)
**Constraints:** No production deploy. OneDrive source strictly read-only. Excel workflow used by staff unchanged.

---

## 1. Goals

1. Turn the 8 approved OneDrive workbooks into canonical dashboard JSON with **provenance-grade traceability**.
2. Derive a **dataset state** per metric-year: `WAITING_FOR_INPUT` / `PUBLISHABLE_PARTIAL` / `COMPLETE` / `INVALID_SOURCE_DATA`.
3. Detect **meaningful data change** (canonical-range fingerprint) and ignore formatting/metadata-only edits.
4. Never fabricate values for missing months (display `-` ⇒ missing, **never zero**).
5. Design for **future automatic OneDrive syncing** without changing the staff Excel workflow.

---

## 2. Dataset State Machine

```
                 canonical fingerprint == template baseline
                 ┌────────────────────────────────────────────┐
                 │                                            ▼
  ┌──────────────┴──────────────┐          ┌──────────────────────────────┐
  │       WAITING_FOR_INPUT     │─────────►│       PUBLISHABLE_PARTIAL    │
  │  no FY2569 observations in │  ≥1 valid│  1–11 valid months observed  │
  │  canonical ranges           │  month   │  publish months[] (no zeros) │
  └──────────────┬──────────────┘          └──────────────┬───────────────┘
                 │                                        │  all 12 months valid
                 │  formatting/metadata-only change       ▼
                 │  (fingerprint unchanged)        ┌──────────────────────────────┐
                 └────────────────────────────────►│           COMPLETE           │
                                                  │  12/12 valid + reconciled    │
                                                  └──────────────┬───────────────┘
                                                                 │
   unparseable text / formula errors /                           │
   negative values / cross-sheet mismatch                        │
   ┌──────────────────────────────────────────┐                  │
   │        INVALID_SOURCE_DATA               │◄─────────────────┘
   │  block publication; require PO/staff fix │
   └──────────────────────────────────────────┘
```

### Transition rules

| From | Event | To |
|------|-------|----|
| (any) | Source mtime/SHA changed AND canonical fingerprint changed AND ≥1 valid month | `PUBLISHABLE_PARTIAL` or `COMPLETE` |
| (any) | Source mtime/SHA changed AND canonical fingerprint changed AND 0 valid months remain | `WAITING_FOR_INPUT` |
| (any) | Source changed but **fingerprint unchanged** (formatting/metadata-only) | stay (no state churn) |
| (any) | Canonical range unparseable (text in numeric cells, `#REF!`/`#DIV/0!`, negative, cross-sheet mismatch beyond tolerance) | `INVALID_SOURCE_DATA` |
| `PUBLISHABLE_PARTIAL` | All 12 months valid + reconciliation passes | `COMPLETE` |

### Derivation order (deterministic)

1. Stage: copy source → `data/staging/source/`, record mtime + SHA-256.
2. Fingerprint: hash canonical FY2569 range cells `(value, formattedDisplay, formula)`.
3. Compare fingerprint vs stored template baseline (first-seen snapshot).
4. If equal → `WAITING_FOR_INPUT` (no meaningful change). Stop.
5. If different → parse observations (display-aware) → count valid months.
6. 0 valid → `WAITING_FOR_INPUT`; 1–11 → `PUBLISHABLE_PARTIAL`; 12 → run reconciliation → `COMPLETE` (or `INVALID_SOURCE_DATA`).

---

## 3. Sync Pipeline Architecture (OneDrive-ready)

```
OneDrive source (read-only)
  E:\OneDrive\...\07-GreenOffice\resource
        │  (staff keeps editing Excel exactly as today)
        ▼
[1] sync-workbooks.mjs  (trigger: manual | scheduled | OneDrive file-change watcher)
        │  • mtime/SHA change detection
        │  • copy to data/staging/source/ (never touch source)
        │  • canonical-range fingerprinting
        │  • datasetState derivation
        │  • manifest.json v2 write (traceability)
        ▼
[2] extract-workbook.mjs  (parsers A–D)
        │  • display-aware month extraction (w, not v)
        │  • waste categories + GHG activity×EF extraction
        │  • writes data/import/{metric}-{year}.csv
        ▼
[3] data-pipeline.mjs  (existing, reused)
        │  npm run data:build  (import → validate → generate)
        ▼
[4] src/data/generated/*.json  (+ datasetState, wasteBreakdown, ghgActivities)
        ▼
[5] Astro dashboard (unchanged consumers; additive schema fields)
```

- **Trigger portability:** `sync-workbooks.mjs` takes `--source=<dir>` + `--out=<staging>`; today it runs manually against the mapped OneDrive path; tomorrow a scheduler or a OneDrive watcher calls the same script with no staff-facing change.
- **Idempotent:** re-running with unchanged sources is a no-op (fingerprints equal → state unchanged → no import churn).
- **Deterministic:** no runtime timestamps in generated JSON (existing `serialize-json.mjs` policy).

---

## 4. Canonical FY2569 Input Ranges (explicit)

| Metric | Workbook | Sheet | Rows | Columns | Meaning |
|--------|----------|-------|------|---------|---------|
| water | `1.1Water.xlsx` | `2569` | 4–15 | col[6] (col[0]=Thai month) | ปริมาณน้ำ m³, row 17 `รวม` reconcile |
| electricity | `1.2electric.xlsx` | `2569` | 4–15 | col[6] | kWh, row 17 `รวม` |
| fuel | `1.3Gassolene.xlsx` | `2569` | 4–15 | col[6] | ลิตร, row 17 `รวม` |
| paper | `1.4paper.xlsx` | `2569` | 4–15 | col[6] | รีม (2569) — unit conversion pending |
| waste | `1.5waste2026.xlsx` | `ปริมาณขยะรายเดือน ` | 3–18 | cols 1–12 | ขยะทั่วไป r3; ขยะอันตราย r5–11 (รวม r11); ขยะรีไซเคิล r13–18 (รวม r18) |
| waste (reconcile) | same | `คำนวณ%` | 2–5 | cols 1–12 | ขยะทั่วไป/อันตราย/รีไซเคิล/รวมขยะทั้งหมด |
| ghg | `1.6GreenHouseGas2026.xlsx` | `สรุปการคำนวณ ปี 2569` | 7–24 | cols 6,8,…,28 (ปริมาณ) + 7,9,…,29 (CF) | activity × EF; row 25 `รวม`; col 30 annual kgCO2e |
| ghg (EF ref) | same | `EF TGO AR5` | — | — | EF source-of-truth for validation |

### Template vs observation separation

- **Template baseline fingerprint** = canonical-range hash recorded the first time the FY2569 workbook is staged (today: waste2026 = `f3d42ec9970595bd`, ghg2026 = `8cd94aa0a8f0d052` — identical to their FY2568 sources by design).
- Any cell in the canonical range whose `(value | display | formula)` differs from baseline = **user-entered observation**.
- Copied template values (2026 == 2025) are NOT observations — they carry no edit signal.
- Diagnostic pair-compare (2025 vs 2026) stays in `manifest.json.diagnostics` — informational only, never gates publication.

### Display-aware extraction (never zero for missing)

```ts
// Parser rule: a month is "observed" only when its formatted display is a number.
// Raw v may be 0 (formula P12:P16 in water/electric 2569) but display "-" ⇒ missing.
function readMonthCell(cell): number | null {
  if (!cell) return null;
  const disp = String(cell.w ?? cell.v).trim();
  if (disp === '' || disp === '-') return null;          // missing — NOT zero
  const n = Number(disp.replace(/[, ]/g, ''));
  if (Number.isNaN(n)) return null;                      // unparseable → caller flags INVALID
  return n;
}
```

---

## 5. Schema Extension (additive, non-breaking)

```ts
// multi-year-schema.ts
export type DatasetState = 'WAITING_FOR_INPUT' | 'PUBLISHABLE_PARTIAL' | 'COMPLETE' | 'INVALID_SOURCE_DATA';

export interface YearData {
  // ...existing fields unchanged...
  datasetState?: DatasetState;   // NEW — sync state for this year
  wasteBreakdown?: {
    categories: {
      key: string;            // 'general' | 'hazardous' | 'recyclable' (+ sub-rows preserved)
      labelTh: string; labelEn: string;
      months: MonthlyValue[]; // observed months only (no zeros)
      total: number;
    }[];
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

`datasetState` maps to existing fields for dashboard compatibility:

| datasetState | dataStatus | dataClassification | quality.valid |
|--------------|------------|--------------------|---------------|
| `WAITING_FOR_INPUT` | `CURRENT_DATA_PENDING` | `WAITING_FOR_INPUT` (new) | false (no data) |
| `PUBLISHABLE_PARTIAL` | `in_progress` | `CONFIRMED_XLSX` | true (partial-year reconciliation) |
| `COMPLETE` | `complete` | `CONFIRMED_XLSX` | true |
| `INVALID_SOURCE_DATA` | `in_progress` | `INVALID_SOURCE_DATA` (new) | false |

> Add the two new `DataClassification` values (`WAITING_FOR_INPUT`, `INVALID_SOURCE_DATA`) to the union in `multi-year-schema.ts`; `PROVENANCE_SCORES` in `dashboard-executive.ts` falls back to `0` for unknown keys (no code change required, but document the scores).

---

## 6. Validation Rules (per metric, Phase 2)

| Metric | Rules |
|--------|-------|
| All | months 1–12 unique ascending; observed values ≥ 0; total = sum(observed) within tolerance; missing months absent from array; `datasetState` consistent with month count |
| water/electric | `m³`/`kWh`; tolerance ±0.5/±5; reconcile vs `รวม` row 17 col[6] (water 5,572.03 ✓; electric 264,594.40 ✓ — both verified 2026-08-07) |
| fuel/paper | 0/12 → `WAITING_FOR_INPUT`; paper unit kg→รีม requires conversion factor (PO) |
| waste | ขยะทั่วไป+ขยะอันตราย+ขยะรีไซเคิล = รวม (both sheets, tolerance 0.5); flag cross-sheet mismatch (Jan 468.1 vs 468.9); `%`-rows average-aggregated; template copy → `WAITING_FOR_INPUT` |
| ghg | Σ(activity CF rows) = row 25 `รวม` per month; EF matches `EF TGO AR5`; annual kg→t ÷1000; baseline total 231.23 vs existing 231.6 (PO decision) |

---

## 7. File Inventory & Deliverables (Phase 2)

| Deliverable | Path | Status |
|-------------|------|--------|
| Staged sources (8) + manifest v2 | `data/staging/` | ✅ done (Phase 1) |
| `sync-workbooks.mjs` (stage + fingerprint + state) | `scripts/` | ⛔ to build |
| `extract-workbook.mjs` (parsers A–D) | `scripts/` | ⛔ to build |
| Regenerated `data/import/*-2569.csv` (no stale placeholders) | `data/import/` | ⛔ to build |
| Schema extension (`datasetState`, `wasteBreakdown`, `ghgActivities`) | `src/utils/multi-year-schema.ts` | ⛔ to build |
| Validator additions + `dataClassification` values | `scripts/data-validator.mjs`, `validate-provenance.mjs` | ⛔ to build |
| Runtime QA (`npm run data:build`, `data:validate`, `qa:routes`) | — | ⛔ after build |

---

## 8. Open Decisions (PO)

| # | Decision | Needed by |
|---|----------|-----------|
| 3 | GHG 2568 baseline: re-baseline to 231.23 tCO₂e from approved workbook, or keep 231.6? | extraction of ghg-2568 |
| 4 | Paper 2569 ream→kg conversion factor | extraction of paper-2569 |
| 5 | Waste authoritative sheet for KPI totals (`คำนวณ%` vs detail) | waste normalization |
| 6 | Publish water/electric 7/12 as `PUBLISHABLE_PARTIAL` now | Phase 2 import |

**No production deployment. Excel workflow used by staff is unchanged; OneDrive source remains read-only.**
