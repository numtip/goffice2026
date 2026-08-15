# GO-DATA-4: FY2568 Baseline Evidence Layer

**Date:** 2026-08-15
**Status:** IMPLEMENTED (static Astro / GitHub Pages only)
**Scope:** Public-safe category-level baseline coverage panel — no new data, no re-baseline, no deployment.

---

## 1. Frozen-data rule (PO decision)

- **Freeze** all currently published FY2568 baseline values. Do **not** re-baseline GHG, convert paper units, or change waste authority.
- **Preserve** the current published FY2569 snapshot exactly — no new data, no computed replacements, no zero-filled missing months.
- Source access remains **authenticated Microsoft 365** (OneDrive/SharePoint, read-only). Supabase is stopped.

Reference: `docs/GREENOFFICE2026_PLATFORM_BLUEPRINT_V5.md`
- §2 Operating Architecture — resource pipeline (`Excel → normalize → validate → generated JSON → dashboard`)
- §5 Data and Evidence Truthfulness Rules — baseline/current-year semantics and partial-year labelling

Source-audit reconciliation: see [`GO-DATA-5-FY2568-SOURCE-AUDIT.md`](./GO-DATA-5-FY2568-SOURCE-AUDIT.md) for the aggregate source inventory, per-category type mix, and duplicate/unreadable disposition notes.

## 2. Category-level baseline coverage (frozen)

| Category | code | Baseline count |
|----------|------|---------------:|
| 1 | `cat1` | 38 |
| 2 | `cat2` | 29 |
| 3 | `cat3` | 32 |
| 4 | `cat4` | 28 |
| 5 | `cat5` | 47 |
| 6 | `cat6` | 32 |
| 7 | `cat7` | 3 |
| **Total** | | **209** |

Coverage state for every category is **`CATEGORY_LEVEL_RECORDED`** — baseline coverage is recorded at category level only; **indicator-level mapping is not verified**.

## 3. Implementation

| File | Role |
|------|------|
| `src/data/criteria/baseline-2568.ts` | Typed canonical module: counts, total, lookup, coverage state |
| `src/pages/categories/[id].astro` | Renders the FY2568 baseline panel (TH/EN parity; cat7 keeps separate-assessment styling) |
| `scripts/test-baseline-2568.mjs` | Data-contract and mapping tests (`npx tsx`) |

Public-safe guarantees: no local/OneDrive paths, filenames, URLs, or personal data are rendered. The panel states that source access is authenticated MS365, category-level baseline coverage is recorded, and indicator mapping still requires verification.

## 4. Validation

- `npx tsx scripts/test-baseline-2568.mjs`
- `npm run check`
- `npm run build`
- `git diff --check`
