# GO-DATA-4: FY2568 Baseline Evidence Layer

**Date:** 2026-08-15
**Status:** IMPLEMENTED (static Astro / GitHub Pages only)
**Scope:** Public-safe category-level baseline coverage panel — no new data, no re-baseline, no deployment.

---

## 1. Frozen-data rule (PO decision)

- **Freeze** all currently published FY2568 baseline values. Do **not** re-baseline GHG, convert paper units, or change waste authority.
- **Preserve** the current published FY2569 snapshot exactly — no new data, no computed replacements, no zero-filled missing months.
- **Public baseline decision (2026-08-15):** FY2568 is a frozen **public** baseline. Source documents are **physically published inside the Astro site** under `public/documents/fy2568/cat1..cat7` (byte-identical static copies); **no authentication is required** and no access restrictions apply. Supabase is stopped.

Reference: `docs/GREENOFFICE2026_PLATFORM_BLUEPRINT_V5.md`
- §2 Operating Architecture — resource pipeline (`Excel → normalize → validate → generated JSON → dashboard`)
- §5 Data and Evidence Truthfulness Rules — baseline/current-year semantics and partial-year labelling

Source-audit reconciliation: see [`GO-DATA-5-FY2568-SOURCE-AUDIT.md`](./GO-DATA-5-FY2568-SOURCE-AUDIT.md) for the aggregate source inventory, per-category type mix, and duplicate/unreadable disposition notes.

### FY2568/FY2569 comparison workflow

- Each category detail page presents a **paired comparison panel**: **FY2568 (ปีฐาน / Year Base)** shows the audited baseline record count, the safe document-type aggregate, and a public link to the category Document Center; **FY2569 (ปีประเมิน / Assessment Year)** shows status **รอการอัปเดต / Awaiting update**.
- The committee reviews the FY2568 baseline together with the FY2569 assessment. No FY2569 counts, evidence, results, or indicator mappings are invented in this release.

### FY2568 evidence publication (physically in Astro)

- **All 209 FY2568 source documents are published** under `public/documents/fy2568/cat1..cat7`, preserving the original relative structure, filenames, and byte content. The source tree is never modified.
- The Document Center detail pages (`/documents/catN` TH/EN) enumerate and directly link every published document, showing the **original title, type, and file size**.
- A **deterministic manifest** `src/data/fy2568-publication.json` records every published document (path, title, type, size, SHA-256, percent-encoded URL) plus per-category counts/bytes and totals. Regenerate with `scripts/publish-fy2568-documents.mjs` (source root via `GOFFICE_FY2568_SOURCE_ROOT`).
- `scripts/test-fy2568-publication.mjs` proves all 209 files and category totals (byte-identity vs source when the source root is supplied).

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
| `src/data/criteria/baseline-2568.ts` | Typed canonical module: counts, total, lookup, coverage state, public source access |
| `src/pages/categories/[id].astro` | Renders the paired FY2568/FY2569 comparison panel (TH/EN parity; cat7 keeps separate-assessment styling) |
| `scripts/test-baseline-2568.mjs` | Data-contract, public-access, parity, and no-fabrication tests (`npx tsx`) |
| `public/documents/fy2568/cat1..cat7` | Static public copies of all 209 FY2568 source documents |
| `src/data/fy2568-publication.json` | Deterministic publication manifest (path, title, type, size, SHA-256, URL) |
| `scripts/publish-fy2568-documents.mjs` | Regenerates the static public copy + manifest |
| `scripts/test-fy2568-publication.mjs` | Proves all 209 published files, category totals, byte-identity |
| `src/pages/documents/[id].astro`, `src/pages/en/documents/[id].astro` | Enumerate and directly link each published FY2568 document (original title, type, size) |

Public-safe guarantees: no local paths, source filenames outside the published Document Center listing, URLs, or personal data are rendered. The panel states that FY2568 is a frozen **public** baseline with source documents physically published on this site, that category-level baseline coverage is recorded, and that indicator mapping still requires verification. FY2569 is presented only as **รอการอัปเดต / Awaiting update** — no fabricated counts, evidence, results, or indicator mappings.

## 4. Validation

- `npx tsx scripts/test-baseline-2568.mjs`
- `node --test scripts/test-fy2568-publication.mjs` (with `GOFFICE_FY2568_SOURCE_ROOT` for source byte-identity)
- `npm run check`
- `npm run build`
- `git diff --check`
