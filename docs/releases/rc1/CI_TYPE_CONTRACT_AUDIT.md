# RC-1 CI Remediation — Subagent A: Type Contract Audit

**Date:** 2026-07-27  
**Branch:** `rapid/rc1-ci-type-contract` (from `master@2c9c628`)  
**Auditor:** Subagent A (Type Contract Audit)  
**Scope:** `Provenance` / `MultiYearMetric` contract vs generated FY2569 JSON and dashboard import casts  
**Mode:** Audit only — no application code changes in this pass

---

## Executive Verdict

> **CONFIRMED — schema drift blocks CI**

`npm run check` (`astro check`) fails because the canonical TypeScript contract requires `Provenance.sourceSheet`, while Day-1 reconciliation intentionally omits it for FY2569 `CURRENT_DATA_PENDING` years. JSON is truthful; the type definition is too strict. Fix the schema (not the data, not `as any`).

---

## Root Cause (Verified)

### 1. Required field in schema

`src/utils/multi-year-schema.ts` declares:

```typescript
export interface Provenance {
  sourceWorkbook: string;
  sourceSheet: string;          // REQUIRED
  // ...
  extractionStatus?: string;    // already optional
  validationStatus: DataStatus;
}
```

### 2. Generated JSON omits `sourceSheet` for pending FY2569

All seven metric files under `src/data/generated/` share the same FY2569 `provenance` shape, written by `scripts/reconcile-resource-data-day1.mjs` (`emptyYear2569()`):

| Field | FY2568 baseline | FY2569 pending |
|---|---|---|
| `sourceWorkbook` | Present (e.g. `docs/12-elect.xlsx`) | Present (expected workbook path) |
| `sourceSheet` | Present (e.g. `"2568"`) | **Absent** — no sheet exists yet |
| `extractionStatus` | Usually absent | `"NO_2569_DATA"` |
| `reconciliationDay1` | Absent | `"2026-07-27"` |
| `validationStatus` | `VERIFIED_BASELINE` | `CURRENT_DATA_PENDING` |

Example (energy, `years.2569.provenance`):

```json
{
  "sourceWorkbook": "docs/12-elect.xlsx",
  "extractionStatus": "NO_2569_DATA",
  "validationStatus": "CURRENT_DATA_PENDING",
  "reconciliationDay1": "2026-07-27"
}
```

This is **intentional**: the Day-1 script explicitly does not invent sheet names or current-year values.

### 3. Dashboard pages cast JSON → `MultiYearMetric`

Seven consumers import generated JSON and assert `as MultiYearMetric`. Astro/TypeScript resolves JSON imports structurally; nested `years.2569.provenance` missing `sourceSheet` fails the cast.

Reported CI failure: **37 errors** from `npm run check` (cast + structural mismatch across metric imports and downstream usage).

### 4. UI already tolerates absent sheet

`src/components/dashboard/DataEvidencePanel.astro` conditionally renders `currentProvenance.sourceSheet` (lines 169–173). Baseline block still assumes presence (2568 always has a sheet). No UI change required for optional `sourceSheet`.

---

## Canonical Contract Decision

**Adopt the following `Provenance` contract** (align types with truthful JSON; do not backfill fake sheet names):

```typescript
export interface Provenance {
  /** Expected or actual workbook path; present even when FY data is pending. */
  sourceWorkbook: string;
  /** Sheet tab name when extracted; omit when no sheet exists (e.g. CURRENT_DATA_PENDING). */
  sourceSheet?: string;
  sourceColumn?: string;
  sourceRowRange?: string;
  extractionScript?: string;
  extractionTimestamp?: string;
  normalizationScript?: string;
  normalizationTimestamp?: string;
  /** Pipeline state when extraction has not run (e.g. NO_2569_DATA). */
  extractionStatus?: string;
  /** ISO date when Day-1 reconciliation stamped this year entry. */
  reconciliationDay1?: string;
  validationStatus: DataStatus;
}
```

| Decision | Rationale |
|---|---|
| `sourceSheet?` optional | Pending years have no sheet; inventing names violates data-integrity policy |
| `sourceWorkbook` **required** | All 7 pending FY2569 entries include it (future source path) |
| `reconciliationDay1?` optional | Present in all pending JSON; absent on verified 2568 baselines |
| `extractionStatus?` optional | Already optional in schema; pending JSON uses `NO_2569_DATA` |
| **Do not** add placeholder sheet names to JSON | Conflicts with `reconcile-resource-data-day1.mjs` and RC-1 truthfulness |
| **Do not** use `as any` | Masks contract drift; breaks CI purpose |

### Post-fix verification

1. `npm run check` — expect 0 provenance-related errors  
2. `npm run data:validate` — pipeline still passes  
3. Spot-check dashboard provenance panel for a pending metric (sheet row hidden, workbook shown)

---

## Affected Files

### Types (fix target)

| File | Role |
|---|---|
| `src/utils/multi-year-schema.ts` | `Provenance` interface — make `sourceSheet?`, add `reconciliationDay1?` |

### Generated JSON (source of truth — no change)

| File | FY2569 status |
|---|---|
| `src/data/generated/energy.json` | `CURRENT_DATA_PENDING`, no `sourceSheet` |
| `src/data/generated/water.json` | same |
| `src/data/generated/fuel.json` | same |
| `src/data/generated/paper.json` | same |
| `src/data/generated/waste.json` | same |
| `src/data/generated/recycling_rate.json` | same |
| `src/data/generated/ghg.json` | same |

### Pipeline (documents intent — no change)

| File | Role |
|---|---|
| `scripts/reconcile-resource-data-day1.mjs` | `emptyYear2569()` omits `sourceSheet` by design |

### Dashboard / landing consumers (casts — should pass after schema fix)

| File | Pattern |
|---|---|
| `src/pages/dashboard.astro` | `genMap: Record<string, MultiYearMetric>` + 6× `as MultiYearMetric` |
| `src/pages/dashboard/[id].astro` | same |
| `src/pages/en/dashboard/index.astro` | same |
| `src/pages/en/dashboard/[id].astro` | same |
| `src/components/landing/ExecutiveCommandCenter.astro` | same |
| `src/components/landing/LandingPage.astro` | same |
| `src/components/landing/ExecutiveKPIPreview.astro` | `genMap[id] as MultiYearMetric` |

### Related utilities (typed against schema — no cast fix needed)

| File | Notes |
|---|---|
| `src/utils/metric-insights.ts` | Uses `MultiYearMetric` |
| `src/utils/dashboard-executive.ts` | Uses `dataClassification`, not `sourceSheet` |
| `src/components/dashboard/DataEvidencePanel.astro` | Already optional-safe for current year |

---

## Rejected Alternatives

| Alternative | Why rejected |
|---|---|
| Add `"2569"` or `"pending"` to JSON `sourceSheet` | Invents provenance; contradicts Day-1 reconciliation |
| `as any` / double cast on imports | Hides drift; fails RC-1 CI remediation goal |
| Make entire `provenance` optional on pending years | Loses workbook path and validation status already shown in UI |

---

## Cross-References

- Data truthfulness audit: `docs/releases/rc1/D_DASHBOARD_EVIDENCE_AUDIT.md` (FY2569 pending posture PASS)  
- Day-1 script: `scripts/reconcile-resource-data-day1.mjs`  
- Canonical schema: `src/utils/multi-year-schema.ts`
