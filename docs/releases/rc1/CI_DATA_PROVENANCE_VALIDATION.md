# CI Data Provenance Validation (RC-1)

**Workstream:** Subagent C — Generated Data Validation  
**Branch:** `rapid/rc1-ci-data-validation` (from `master@2c9c628`)  
**Date:** 2026-07-27

## Canonical contract

| Year status | Classification | `provenance.sourceSheet` | `provenance.sourceWorkbook` |
|---|---|---|---|
| `VERIFIED_BASELINE` | `CONFIRMED_XLSX` | **Required** (non-empty) | Expected (repo-relative) |
| `VERIFIED_BASELINE` | `PRESERVED_LEGACY` | Optional | Optional |
| `CURRENT_DATA_PENDING` | any | **May be absent** — do not fabricate | May be present (expected future path) |

Additional rules enforced by the validator:

- `provenance.validationStatus` must match `yearData.dataStatus` for pipeline statuses.
- `VERIFIED_BASELINE` rows must include a `provenance` object.
- Absolute filesystem paths in `sourceWorkbook` are rejected.
- Empty-string `sourceSheet` values are rejected (omit the field instead).

Type alignment: `Provenance.sourceSheet` is optional in `src/utils/multi-year-schema.ts` (Subagent B) to reflect pending-year rows.

## How to run

```bash
# Standalone provenance check (7 metric files, 14 year entries)
node scripts/validate-provenance.mjs

# Full pipeline check (includes provenance + schema + KPI regeneration)
npm run data:check
```

## Validation result (RC-1 branch)

| Check | Files | Year entries | Errors | Warnings | Result |
|---|---:|---:|---:|---:|---|
| `node scripts/validate-provenance.mjs` | 7 | 14 | 0 | 0 | PASS |
| `npm run data:check` | 7 metrics | 14 | 0 | 14 | PASS |

Warnings from `data:check` are expected: all seven FY2569 rows are `CURRENT_DATA_PENDING` with `quality.valid: false` and empty `sourceEvidence` arrays. No provenance-shape errors.

## Baseline spot-check (CONFIRMED_XLSX)

| Metric | FY2568 `sourceSheet` | FY2569 `sourceSheet` |
|---|---|---|
| energy | `2568` | *(absent)* |
| water | `2568` | *(absent)* |
| ghg | `สรุปการคำนวณ ปี 2568` | *(absent)* |
| waste | `คำนวณ%` | *(absent)* |

FY2569 rows retain `sourceWorkbook` + `extractionStatus: NO_2569_DATA` only — no fabricated sheet names.

## Generated JSON changes

**None.** Validator and QA note only; existing `src/data/generated/*.json` values were left unchanged.

## Files added/updated

- `scripts/validate-provenance.mjs` — standalone + importable provenance validator
- `scripts/data-pipeline.mjs` — calls `validateMetricProvenance` during `validate` / `check`
- `docs/releases/rc1/CI_DATA_PROVENANCE_VALIDATION.md` — this note
