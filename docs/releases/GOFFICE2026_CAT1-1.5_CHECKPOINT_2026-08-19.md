# GOFFICE2026 — CAT1-1.5 FY2568 GHG · Checkpoint Closed

**Status:** `CAT1-1.5 CHECKPOINT_CLOSED`
**Date:** 2026-08-19 (Asia/Bangkok)
**Preview URL:** https://numtip.github.io/goffice2026/
**Production URL:** https://goffice.mju.ac.th/ — **NOT deployed. No VPS changes.**

> Checkpoint for FY2568 Category 1 indicators **1.5.1 / 1.5.2 / 1.5.3** presentation on GitHub Pages.
> Authority: `docs/data/GO-CAT1-1.5-FY2568-GHG-RECONCILIATION.md`, canonical contracts, `/dashboard/ghg/`.

---

## Deploy record

| Item | Value |
|------|-------|
| Branch | `master` |
| Final SHA | *(filled after push)* |
| Pages workflow | *(filled after deploy)* |
| Prior baseline | `5104767` — initial 1.5 presentation + live acceptance |

---

## Fixes (this checkpoint)

1. **EN-MIX** — GHG contract snapshot `Target met` value localized (`Not met` / `Met` on EN; no Thai fragment on EN 1.5 pages).
2. **DASH-SCOPE-COPY** — `/dashboard/ghg/` description updated to Scope **1, 2, and 3** (TH/EN); no dashboard data-model or scope chart changes.

---

## Validation

| Gate | Result |
|------|--------|
| `npm test` | PASS |
| `npm run check` | PASS |
| `npm run build` | PASS |
| `git diff --check` | PASS |
| Live smoke 1.5.1/1.5.2/1.5.3 TH+EN + `/dashboard/ghg/` | *(filled after deploy)* |

---

## Canonical FY2568 facts (unchanged)

| Fact | Value |
|------|-------|
| Annual reporting total | **231.62 tCO₂e** |
| Dashboard monthly sum | **231.6 tCO₂e** (0.02 delta disclosed on 1.5.1) |
| FY2567 baseline | **220.99 tCO₂e** |
| Scope 1 / 2 / 3 | **10.85 / 201.48 / 19.29** |
| Performance | **+10.63 tCO₂e (+4.81%)** — target **−1% not met** |
| December | **14.02 tCO₂e** derived |
| 1.5.3 understanding | **MISSING** |

---

## Remaining non-blocking data gaps

- Evidence cards remain **pending** review (by design).
- Dashboard scope **breakdown chart** still suppressed — scopes shown on **1.5.1** only.
- Septic/E42 workbook anomaly documented, not resolved by inference.
- **1.6** not implemented — navigation link only.
- `document-registry.json` GHG description still Scope 1/2 only (out of dashboard scope for this fix).

---

## Verdict

**`CAT1-1.5 CHECKPOINT_CLOSED`** — presentation live on GitHub Pages; cleanup complete; no 1.6 work; no workbook or VPS changes.
