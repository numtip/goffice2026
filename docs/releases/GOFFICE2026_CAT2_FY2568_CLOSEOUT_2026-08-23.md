# GOFFICE2026 — Category 2 FY2568 Baseline Closeout

**Status:** `CAT2 FY2568 BASELINE_INTEGRATED` — **`PASS_WITH_GAPS`**
**Date:** 2026-08-23 (Asia/Bangkok)
**Preview URL:** https://numtip.github.io/goffice2026/ — **NOT deployed. No VPS changes. No production edits.**
**Authority:** `docs/GOFFICE2026_CATEGORY2_COMMUNICATION_BLUEPRINT_V1.md` · `docs/data/GO-CAT2-PHASE-A-SOURCE-DISPOSITION.md` · official Green Office 2569 criteria
**Repository HEAD baseline:** `609e53b65f4e4b411b5706f736f1ffa3e4b87b6a` (= origin/master)

> Category 2 (หมวดที่ 2 การสื่อสารและสร้างจิตสำนึก / Communication and Awareness Cultivation, weight 15%) FY2568 historical baseline is fully integrated into the platform. The report is **PASS_WITH_GAPS** — honest gaps are disclosed and never fabricated.

---

## 1. Honest gaps (PASS_WITH_GAPS basis)

| # | Gap | Status |
|---|---|---|
| **B3** | 2.2.2 secondary evidence: BigCleaningDay sign-in and green-office-significance acknowledgment are **pending scan candidates** (`promoted:false`, filename_folder_only). Promotion requires OCR/human verification. | OPEN — data owner |
| **B4** | **2.2.3 = MISSING_DEDICATED_EVIDENCE.** No questionnaire, respondent count (≥4), or percentage in the FY2568 source set; `2.2.3.pdf` is narrative-only. FY2569 action plan also has 0 activities measuring it. Requires a real questionnaire artifact to close. | OPEN — data owner |
| **Water placeholders** | `ev-water-audit-2025` / `ev-water-conservation` remain cat2-tagged placeholders. Left unchanged per C3 rule (no explicit Cat3 target). Cat2 indicator pages no longer render them (cat2 excluded from the category-evidence fallback). | OPEN — pending explicit Cat3 target |
| **B2 (forward)** | 2.1.2 has **0 FY2569 plan activities** (PO decision: no new activity). The FY2569 committee minutes **must** record named trainer assignments per course as the required 2.1.2 cross-evidence. Recorded as `FORWARD_REQUIREMENT` (year 2569) — forward evidence requirement, **not** verified FY2569 evidence. | Forward requirement |
| **No signed-submission claim** | The root `รายงานผลการดำเนินงานหมวด2 (2568).docx` is the **canonical historical baseline only**. No signed/approved submission copy exists in the source set and none is claimed (PO B1). | Resolved as disclosure |

## 2. Indicator coverage (FY2568 baseline)

| Indicator | Evidence | Status |
|---|---|---|
| 2.1.1 | 5 records → 5 evidence entries (plan, delivery, evaluation, history + registration scans pending) | Mapped, pending verification |
| 2.1.2 | 3 records → 3 evidence entries (course responsibility + 2 trainer CVs) | Mapped, pending verification |
| 2.2.1 | 4 records → 4 evidence entries (responsibility, plan, target groups + responsibility scan pending) | Mapped, pending verification |
| 2.2.2 | 1 narrative (THIN) + 2 candidates (promoted:false) | **THIN** — honestly thin |
| 2.2.3 | 0 records / 0 evidence | **MISSING_DEDICATED_EVIDENCE** |
| 2.2.4 | 4 records → 4 evidence entries (channels, guideline, complaint record, aggregate report) | Mapped, pending verification |
| Category-level | Annual report (canonical docx, historical baseline only) | Category-level only |

## 3. C4 action-plan canonical mapping (frozen)

All 20 Cat2 FY2569 activities carry `canonicalIndicatorCode` (legacy codes retained):

| Canonical | Count | Activities |
|---|---|---|
| 2.1.1 | 8 | 6 module trainings + registration/pre-post + training records |
| 2.2.1 | 1 | ประชุมคณะกรรมการหมวด 2 |
| 2.2.2 | 9 | ดำเนินการตามแผนสื่อสาร 2569 + ครั้งที่ 1–8 |
| 2.2.4 | 2 | ช่องทางข้อเสนอแนะ + สรุป/รายงานผลต่อผู้บริหาร |
| 2.1.2 | 0 | Forward committee-minutes requirement only (B2) |
| 2.2.3 | 0 | Not measured (B4) |

Mapping is reproducibly applied by `scripts/generate-action-plan-2569.mjs`; the binary Excel is not edited (not safely reproducible — canonical code lives in generated JSON + docs). Validator `validateActionPlanCat2Canonical` + tests enforce the frozen counts.

## 4. C5 pages / components (presentation)

- `src/utils/category2-presentation.ts` — communication loop **Plan → Assign → Communicate → Capture feedback → Management review**, domain snapshots, journeys, MISSING/THIN indicator sets.
- `src/components/categories/Cat2ManagementCycle.astro` — compact 5-stage operational loop on `/categories/cat2/` (TH + EN), restrained single-accent hierarchy.
- `src/components/categories/Cat2DomainSnapshot.astro` — FY2568 verified-fact cards per issue (2.1, 2.2), labeled coverage context (never a score).
- `src/components/indicators/Cat2ContractContext.astro` — per-indicator FY2568 contract context with honest MISSING (2.2.3), THIN (2.2.2), and FY2569 forward-requirement (2.1.2) states.
- `src/components/indicators/Cat2SourceDocuments.astro` — "เอกสารต้นฉบับสำหรับการตรวจสอบ" per issue group (2.1, 2.2), filtered to the C1-approved manifest file set.
- Wiring: `src/pages/categories/[id].astro` + `src/pages/en/categories/[id].astro` (`category.code === 'cat2'`), `src/components/indicators/IndicatorTraceabilityExperience.astro` (cat2 canonical blocks; cat2 excluded from legacy water category-evidence fallback).
- Category page note updated to reflect reconciled state: 2.2.3 gap + unresolved water placeholders (TH/EN), in lockstep with `test-baseline-2568.mjs`.

## 5. Evidence & data integration (C2–C4)

- C2 canonical contracts: `src/data/category2/{training,communication,feedback}.json` + `category2-manifest.json` (frozen FY2568, B1/B2 recorded).
- C3: 20 indicator-level Cat2 entries + category-level annual report in `evidence-index.json`; contracts `evidenceIds` reconcile exactly; validator enforces id/path/hash/indicator/availability/status equality; search index regenerated (185 items, no drift).
- C6: About feedback hook (2.2.4) verified/retained; knowledge practice `green-office-mindset` → 2.2.1/2.2.2 reused; activities hub retained.

## 6. Validation

| Gate | Result |
|---|---|
| `npm run check` | PASS — 0 errors |
| `node scripts/validate-category2-contracts.mjs` | PASS |
| `node scripts/validate-evidence.mjs` | PASS (45 items) |
| `node scripts/validate-search-index.mjs` | PASS (185 items) |
| `node scripts/validate-action-plan-2569.mjs` | PASS (cat2 canonical frozen counts) |
| `node scripts/validate-criteria.mjs` | PASS |
| `npm test` | see report (Cat2 suites green) |
| `npm run build` | see report |
| `npm run validate` | see report |
| `git diff --check` | see report |
| Runtime smoke TH + EN cat2 routes | see report |

## 7. Known limitations

- All FY2568 evidence entries are `verification.status: pending` (C1 content verification done for text files; human/PO sign-off still required).
- 6 PDFs are scan-only (filename_folder_only) — content not machine-readable without OCR.
- `test-fy2568-publication` reports 1 pre-existing cat1 failure (extra on-disk `1.3/ผลประเมินปัญหา2568.xlsx`) — unrelated to Cat2.
- FY2569 Cat2 remains "รอการอัปเดต / Awaiting update" — no FY2569 overlay created (none verified).

## 8. Related documents

- `docs/GOFFICE2026_CATEGORY2_COMMUNICATION_BLUEPRINT_V1.md` (v1.3)
- `docs/data/GO-CAT2-PHASE-A-SOURCE-DISPOSITION.md`
- `src/data/category2/` contracts + `scripts/validate-category2-contracts.mjs`
- `docs/GOFFICE2026_CATEGORY1_PLAYBOOK_FOR_CATEGORIES_2-7.md`
