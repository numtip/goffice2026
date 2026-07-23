# GO-DATA-1A — Corrective Actions: Final Report

**Sprint:** GO-DATA-1A — Corrective Actions (remediation of GO-DATA-1)
**Date:** 2026-07-24
**Base commit:** `ab8d9e6` (GO-DATA-1, reopened by QC audit)
**Reference:** `docs/releases/GOFFICE2026_GO-DATA-1_FULL_REPORT.md` (QC audit, verdict: REOPENED)

---

## 1. Verdict

**ACCEPT — GO-DATA-1 can now be closed as corrected.**

All four required corrections (RC-1–RC-4) from the QC audit have been implemented and verified. The data pipeline now reports its true quality state: 0 structural errors, 15 warnings (up from an incorrectly-reported near-zero), and every current-year (2569) metric is explicitly and correctly marked unverified. No placeholder or demo data is presented as confirmed. This is the intended outcome of a real environmental data pipeline that is still waiting on 5 of 6 source XLSX workbooks.

---

## 2. RC-1–RC-4 Status

| ID | Requirement | Status |
|----|-------------|--------|
| RC-1 | Energy/Water 2569 must be `quality.valid=false`, explicitly flagged as demo/unverified, never shown as verified current-year data | ✅ **Fixed** — both now `quality.valid=false`, `dataClassification: DERIVED_FROM_CSV`, explicit warning text |
| RC-2 | Waste must use average aggregation for its `%` unit, not sum | ✅ **Fixed** — `aggregation: 'average'` added; totals corrected 258.83→21.57 (2568), 846→84.6 (2569); YoY corrected +227%→+292% |
| RC-3 | Validator must not report clean/near-zero warnings while unverified data exists; must check `quality.valid`, unit/aggregation validity, provenance | ✅ **Fixed** — validator now checks `quality.valid`, `dataClassification` presence, `sourceEvidence`, %+sum combination (ERROR), extreme YoY swings, and reports 15 warnings honestly |
| RC-4 | Executive KPI output must not present placeholder/unverified data as real; waste indicator mapping must not use invalid wildcard `4.1.x` | ✅ **Fixed** — `kpi-summary.json` now includes `verified: boolean` per metric (all six are currently `false`); waste indicator corrected to `4.1` with a pending-detail note |

---

## 3. Source Filename Verification

Verified against `git log --all --diff-filter=A --name-only -- "*.xlsx"`, which shows only three XLSX files were **ever** committed to this repository (all in commit `fc24d7c`, later removed in `dfa57de` — "chore: remove superseded xlsx files"):

| Metric | Filename used before GO-DATA-1A | Confirmed correct name (git history) | Corrected? |
|--------|----------------------------------|----------------------------------------|------------|
| Electricity | `1.2-elect.xlsx` | `12-elect.xlsx` | ✅ Yes |
| GHG | `1.6_GreenhouseGas.xlsx` | `1.5_GreenhouseGas.xlsx` | ✅ Yes |
| Water | `1.1-Water.xlsx` | `1.1-Water.xlsx` (unchanged, still present in repo) | N/A — already correct |
| Fuel / Paper / Waste | `1.3_Gassolene.xlsx` / `1.4_Paper.xlsx` / `1.5_Waste.xlsx` | Same names, **but never found in any git commit** | N/A — filenames unchanged; classification corrected instead (`PRESERVED_LEGACY`, not `CONFIRMED_XLSX`) |

Corrected in: `scripts/data-pipeline.mjs`, `scripts/extract-xlsx-to-csv.mjs`, `scripts/import-dashboard-data.mjs`, `scripts/inspect-xlsx.mjs`, `scripts/generate-canonical-data.mjs` (GHG/energy source-string fix), `src/data/generated/energy.json`, `src/data/generated/ghg.json`, `docs/data/GO-DATA-1-SOURCE-MAP.md`, `docs/data/GO-DATA-1-DATA-CONTRACT.md`.

No fictional filenames were invented; fuel/paper/waste filenames were left as originally documented since no contradicting git evidence exists — only their **classification** was corrected to reflect that they were never verifiable from repository history.

---

## 4. Data Classification Changes

New `DataClassification` enum added to `src/utils/multi-year-schema.ts` (`CONFIRMED_XLSX`, `DERIVED_FROM_CSV`, `PRESERVED_LEGACY`, `PLACEHOLDER`, `MANUAL_ENTRY`, `UNKNOWN`), replacing the fragile "does the source string contain the word 'placeholder'" heuristic that missed energy/water 2569.

| Metric | 2568 (baseline) | 2569 (current) |
|--------|------------------|------------------|
| Energy | `CONFIRMED_XLSX` | `DERIVED_FROM_CSV` *(was incorrectly valid=true; now valid=false)* |
| Water | `CONFIRMED_XLSX` (independently re-verified against live `docs/1.1-Water.xlsx`) | `DERIVED_FROM_CSV` *(was incorrectly valid=true; now valid=false)* |
| Fuel | `PRESERVED_LEGACY` (source XLSX never in git — unverifiable) | `PLACEHOLDER` |
| Paper | `PRESERVED_LEGACY` (source XLSX never in git — unverifiable) | `PLACEHOLDER` |
| Waste | `PRESERVED_LEGACY` (source XLSX never in git — unverifiable) | `PLACEHOLDER` |
| GHG | `CONFIRMED_XLSX` | `PLACEHOLDER` |

---

## 5. Waste Calculation Before/After

| | Before (invalid — sum of monthly %) | After (corrected — average of monthly %) |
|---|---|---|
| 2568 total | 258.83% | **21.57%** |
| 2569 total | 846% | **84.6%** |
| YoY change | +227% (absolute +587.17) | **+292%** (absolute +63.03) |
| `aggregation` field | not present (implicitly `sum`) | `'average'` (explicit) |
| Indicator mapping | `4.1.x` (invalid wildcard) | `4.1` + note: "Detailed sub-indicator mapping pending confirmation from Green Office 2569 criteria document." |

A new validator rule now raises an **ERROR** if any `%`-unit metric declares `aggregation: 'sum'`, preventing this defect from recurring.

---

## 6. Validator Results

```
npm run data:validate
Errors:   0
Warnings: 15
Result:   ✅ PASS
```

Warnings breakdown (verified by `scripts/test-data-pipeline-quality.mjs`):
- 6× "quality flagged INVALID" — one per metric's unverified 2569 entry (energy, water, fuel, paper, waste, ghg)
- 6× "no sourceEvidence recorded" — one per metric (evidence documents not yet linked; pre-existing gap, unchanged scope)
- 3× additional structural/consistency warnings surfaced by the new checks

This is a **PASS WITH WARNINGS**, not a silent zero-warning pass — the validator now correctly refuses to report a clean state while unverified data exists (this was the core defect flagged as D-2/RC-3 in the QC audit).

---

## 7. KPI Safety

`generateOutputs()` in `scripts/data-pipeline.mjs` (and the mirrored logic in `scripts/generate-canonical-data.mjs`) now adds an explicit `verified: boolean` field to every entry in `src/data/generated/kpi-summary.json`, computed as `currentYearData.quality.valid === true`.

Current state: **all six metrics report `verified: false`** for 2569, because none of the six current-year datasets can currently be reconciled against a source workbook. This is the correct, honest state — not a defect. The `kpi-summary.json` artifact is not yet wired into any Astro page (`grep` confirms no `src/` file imports it), so no dashboard UI changes were made or were necessary to satisfy this requirement; the fix is fully contained in the data layer.

---

## 8. Tests / Build

| Gate | Result |
|------|--------|
| `npm run data:build` (import → validate → generate → determinism check) | ✅ 0 errors, 15 warnings, deterministic |
| `npm test` (13 pre-existing + 15 new tests in `scripts/test-data-pipeline-quality.mjs`) | ✅ 28/28 pass |
| `npx astro check` | ✅ 0 errors, 0 warnings, 0 hints (92 files) |
| `npm run build` (Astro production build) | ✅ 226 pages built successfully |

New tests cover (exceeding the required ≥8): demo-CSV detection, placeholder detection, waste average-vs-sum aggregation, %+sum validation error, missing-required-field structural error, quality.valid surfacing, KPI `verified` flag consistency, indicator mapping correction, and JSON determinism. All new tests read/write only to temporary, uniquely-named fixture files that are removed in a `finally` block — no real generated data was mutated by the test suite itself.

---

## 9. Files Changed

**Modified:**
`scripts/data-pipeline.mjs`, `scripts/generate-canonical-data.mjs`, `scripts/extract-xlsx-to-csv.mjs`, `scripts/import-dashboard-data.mjs`, `scripts/inspect-xlsx.mjs`, `src/utils/multi-year-schema.ts`, `src/data/generated/energy.json`, `src/data/generated/water.json`, `src/data/generated/fuel.json`, `src/data/generated/paper.json`, `src/data/generated/waste.json`, `src/data/generated/ghg.json`, `src/data/generated/kpi-summary.json`, `src/data/generated/data-quality.json`, `package.json`, `docs/data/GO-DATA-1-SOURCE-MAP.md`, `docs/data/GO-DATA-1-DATA-CONTRACT.md`, `docs/data/GO-DATA-1-VALIDATION-REPORT.md`, `docs/releases/GOFFICE2026_GO-DATA-1_REPORT.md` (superseded notice added, original content preserved)

**Added:**
`scripts/test-data-pipeline-quality.mjs`, `docs/releases/GOFFICE2026_GO-DATA-1A_REPORT.md` (this report)

**Not touched (explicitly out of scope):** No `.astro` files, no dashboard UI/UX code, no new features. Fuel/Paper/Waste source XLSX files were not fabricated.

---

## 10. Git

- Base commit: `ab8d9e6` (local HEAD confirmed equal to `origin/master` at sprint start)
- Working tree confirmed clean at Phase 0 except known pre-existing untracked files (`build_output.txt`, `docs/design/GO_DASH_1_REPORT.md`, `docs/design/GO_UX_1_REPORT.md`, `docs/prompt3.MD`, `docs/releases/GOFFICE2026_GO-DATA-1_FULL_REPORT.md`) — none of these were modified
- Commit message used: `fix(data): correct provenance validation and waste aggregation`
- Pushed to `origin/master` after all quality gates passed
- No manual production deployment was performed; only the GitHub Pages workflow status was expected to run automatically on push

---

## 11. Remaining Warnings

These are known, pre-existing gaps that remain **out of scope** for GO-DATA-1A and are unchanged by this sprint:

1. 5 of 6 source XLSX workbooks remain physically absent from the repository (`12-elect.xlsx`, `1.3_Gassolene.xlsx`, `1.4_Paper.xlsx`, `1.5_Waste.xlsx`, `1.5_GreenhouseGas.xlsx`) — full re-extraction and true reconciliation against workbook totals is not possible until they are restored.
2. `sourceEvidence` is empty for all six metrics — evidence documents have not yet been linked.
3. Fuel, paper, and waste 2568 baselines are classified `PRESERVED_LEGACY` because their source XLSX was never in git — they are internally consistent but not independently re-verifiable.
4. GHG remains single-dimension (total tCO₂e only); Scope 1/2/3 breakdown is not tracked.
5. Energy and water 2569 remain demo/placeholder data pending real 2569 measurements — the pipeline now reports this honestly, but the underlying data gap itself is unresolved (expected; resolving it requires new source data, not a pipeline fix).

---

## 12. Accept or Reopen GO-DATA-1

**ACCEPT.** GO-DATA-1's canonical data pipeline, schema, and generated outputs now accurately represent the true state of the underlying data: confirmed baselines are marked confirmed, unverifiable legacy baselines are marked as such, and all placeholder/demo current-year data is explicitly and consistently flagged as unverified across every generated artifact (metric JSON, KPI summary, data-quality report) and enforced by an expanded automated test suite. No new dashboard features, UX changes, or GO-DATA-2 scope were introduced.
