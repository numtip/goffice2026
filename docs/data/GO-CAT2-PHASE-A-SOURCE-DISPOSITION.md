# GO-CAT2-PHASE-A: Source Disposition + Decision Freeze

**Date:** 2026-08-23 (Asia/Bangkok)
**Status:** DECISION FREEZE — reads only; no runtime/data implementation
**Repository HEAD baseline:** `609e53b65f4e4b411b5706f736f1ffa3e4b87b6a` (= origin/master)
**Authority:** `docs/GOFFICE2026_CATEGORY2_COMMUNICATION_BLUEPRINT_V1.md` · official Green Office 2569 criteria · `docs/data/GO-DATA-5-FY2568-SOURCE-AUDIT.md` · Phase A/B reconciliation
**Scope:** Resolve the remaining evidence/version/mapping decisions for Category 2 (2.1.1–2.2.4) before Phase C implementation.

---

## 0. FY2568 source baseline reconciliation

The read-only FY2568 source baseline is the 29-file Category 2 set under
`Data2568\หมวด2` in the RAE Document Center OneDrive mirror. It is a historical
comparison baseline only: no FY2568 result is a FY2569 result.

- All 29 source contents reconcile to `src/data/fy2568-publication.json` by
  SHA-256 and size.
- One source filename is a harmless normalization difference, not a 30th file:
  the OneDrive file named `68-2.1(2) ใบลงทะเบียน (กิจารรมการให้ความรู้เรื่องกฎหมายและทบทวนกฎหมายที่เกี่ยวข้องกับสิ่งแวดล้อมในการดำเนินงาน Green Office) สี.pdf`
  has SHA-256 `5aeeccd6…9798bb` and is the same content as the published
  manifest entry whose normalized filename starts `68-2.1(2) ใบลงทะเบียน (ให้ความรู้และทบทวนกฎหมายสิ่งแวดล้อม GO) สี.pdf`.
- The published manifest path remains the stable public reference; preserve the
  original OneDrive filename in source-audit records and do not create a
  duplicate evidence record.

---

## 1. D2 Disposition — Annual-report versions (3 files)

Content compared by actual extraction (dates, approval, revision relationship) — not filename assumptions.

| File (in `public/documents/fy2568/cat2/`) | sizeBytes | sha256 (on-disk = manifest) | Verdict |
|---|---|---|---|
| `รายงานผลการดำเนินงานหมวด2 (2568).docx` (root) | 37,344,232 | `4b4182a65142d1278789d6faf8785d2e3bce4e4fa5643c1a1f9f520717bcedbd` | **CANONICAL** |
| `2.3/รายงานผลการดำเนินงานหมวด2 (2568).docx` | 37,344,917 | `ebecee13784423855f7e1db4bbcb94e09992e51d86f2eca0767a4c312e5264e2` | **SUPERSEDED** |
| `รายงานผลการดำเนินงานหมวด2 (2568).pdf` (root) | 6,076,264 | `56ad8f17d9953143be4b3e52a35f61f7e150d366d9d279ff2ab6ddc496caf252` | **EXPORT** |

### Evidence basis

- **Root docx = CANONICAL:** latest saved revision — `docProps/core.xml` Revision **60**, modified **2026-03-12 09:23**, 5,063 words, 19,898 text chars. Contains the **two-line** evidence block under 2.2.2(2) (ทะเบียนจัดลำดับปัญหาฯ 1.3.1(4) + 1.3.1 ด้านมลพิษ).
- **2.3 docx = SUPERSEDED:** earlier revision — Revision **57**, modified **2026-03-11 03:25**, 5,000 words. Single-line evidence block (`1.3.1 การประเมินเพื่อจัดลำดับความสำคัญของปัญหาสิ่งแวดล้อม`). Same 76 embedded images; the only text delta is the evidence block plus rId renumbering.
- **Root pdf = EXPORT:** 30-page Microsoft Word 2019 render, created **2026-03-12 16:22** (after final docx save), carries the ROOT two-line block, 20,661 extracted chars, text layer + embedded evidence images.
- **No approval/signature block exists in any of the three files** (no ผู้รับรอง/ลงนาม/ตำแหน่ง/ลายเซ็น). If the official submission requires a signed version, it is **not present in this folder** → UNRESOLVED (PO must confirm whether a signed/รับรอง version exists elsewhere).

### Disposition

- **Keep root docx as the canonical ANNUAL_REPORT source.**
- **Keep root pdf as the reader-friendly export** (same evidence, do not double-map as separate indicator evidence).
- **2.3 docx = superseded version** — retain on disk (frozen baseline, byte-identical publication) but mark `supersededBy` in manifest/contract; **exclude from indicator-level mapping**; keep the `2.3/` folder documented as a staging folder (not official taxonomy).
- **Hash verification note:** on-disk sha256 for all three files **matches** `fy2568-publication.json` exactly. An earlier audit pass reported a PDF hash `050857ac…` mismatch — **false alarm** (that hash belongs to the D1 committee-order duplicate, 250,114 B; re-verification confirms `56ad8f17…` is correct for the 6,076,264 B report PDF).

### Phase C action

- Map the canonical root docx as ANNUAL_REPORT (category/header-level) in the cat2 contracts; root pdf as its export; 2.3 docx excluded.
- **PO B1 decision (2026-08-23):** the root `รายงานผลการดำเนินงานหมวด2 (2568).docx` is the **canonical historical baseline only** — **no claim of a signed/approved submission copy**. No signed version exists in the FY2568 source set; the annual report is never presented as a submitted/approved document.

---

## 2. FY2569 action-plan ambiguity decisions (resolved by meaning + owner + evidence)

Source: `src/data/generated/action-plan-2569.json`, cat-2 block (20 activities). Resolved **by activity meaning + responsible + expected output/evidence** — not by legacy code.

| Ambiguity | Activity id | Decision | Owner / pairing FY2568 evidence | Expected output |
|---|---|---|---|---|
| A1 "ประชุมคณะกรรมการหมวด 2" | `cat-2-2.1-2.1-1` | **2.2.1** | นายปริญญา เพียรอุตส่าห์ (ประธานหมวด 2) + น.ส.เกศรา เทียมทอง; pairs with `2.2/2.2.1/2.2.1.pdf`, `2.2.1 (4) กำหนดผู้รับผิดชอบในการสื่อสาร.pdf`, `68-2.2(1) แผนสื่อสารสิ่งแวดล้อม.pdf`, `68-2.2.1 (3) กำหนดกลุ่มเป้าหมาย….pdf` | Meeting minutes recording comms responsibility assignment + internal/external communication guidelines |
| A2 "ครั้งที่ 1–8" series | `cat-2-2.5-11-11` … `cat-2-2.5-18-18` | **2.2.2** (all 8, incl. ครั้งที่ 5 at 12×/yr) | Same 6-person comms team (ปริญญา/จิดาภา/เกศรา/รัญรณา/ธนาพร/วิลาวรรณ); pairs with `2.2/2.2.2/2.2.2.pdf` + channel postings | Session records/photos, knowledge materials, monthly resource-result communications |
| A3 "สรุปข้อมูล วิเคราะห์ และรายงานผลต่อผู้บริหาร" | `cat-2-2.7-2.7-20` | **2.2.4** | นายปริญญา + น.ส.เกศรา; pairs with `2.2/2.2.4/2.2.4.pdf`, `2.2.4-แนวทางการจัดการข้อร้องเรียน.pdf`, `2.2.4_2ef-ep_complaints.pdf`, `2.4.4_1-รายงานการรับข้อเสนอแนะ….pdf` | Management report on feedback/complaints received + improvements implemented (closes the 2.2.4 loop) |

### Updated mapping (20 activities)

| Canonical code | Count | Notes |
|---|---|---|
| 2.1.1 | **8** | 6 module trainings (หมวด1×2, 3, 4, 5, 6) + Pre/Post registration + training records |
| 2.1.2 | **0** ⚠ | No standalone activity — see §2.2 below |
| 2.2.1 | **1** | A1 committee meeting |
| 2.2.2 | **9** | A2 ครั้งที่ 1–8 + "ดำเนินการตามแผนการสื่อสาร 2569" (12×/yr) |
| 2.2.3 | **0** ⚠ | No activity measures understanding % — see §4 |
| 2.2.4 | **2** | channel establishment + reporting/analysis |
| **Total** | **20** | sum = 20 ✓ |

### 2.1.2 decision

No FY2569 activity assigns a responsible trainer per course. The `responsible` fields name **session organizers**, not qualified course owners. **PO B2 decision (2026-08-23):** **do not add a new activity.** The FY2569 committee minutes must record per-course trainer assignment and serve as the **required cross-evidence for 2.1.2**. This is a **forward evidence requirement** (recorded as `FORWARD_REQUIREMENT`, year 2569 in the C2 contracts/manifest) — **not verified FY2569 evidence** and not a historical claim.

---

## 3. 2.2.2 secondary-evidence verdict

2.2.2 = มีการรณรงค์สื่อสารและให้ความรู้ตามที่กำหนดในข้อ 2.2.1. Primary evidence: `2.2/2.2.2/2.2.2.pdf` (verified_content, 5,310 chars).

| Candidate | Extraction result | Verdict |
|---|---|---|
| `2.1/…/68-2.1(2) ใบลงทะเบียน (กิจกรรมBigCleaningDay2025).pdf` (16,750,799 B, 8p) | Pure image scan — **0 text chars** (fitz + pdfminer agree); grid analysis shows sign-in table, not photos | **UNVERIFIABLE** (content not readable). Filename + cross-references lean **2.2.2** (Big Cleaning Day is NOT in the 2.1(1) training plan's 10 courses; `2.2.1.pdf` describes it as a PR campaign). Candidate only — requires OCR/human verification before promotion. |
| `2.1/…/68-2.1.2(1)-ใบลงทบความสำคัญสำนักงานสีเขียว.PDF` (8,779,671 B, 5p) | Pure image scan — **0 text chars** | **UNVERIFIABLE** — genuinely ambiguous between 2.1.1 (course-1 acknowledgment) and 2.2.2 (awareness acknowledgment). No defensible assignment. |
| `หมวด 2 ข้อ 2.2(2) ใบรับข้อเสนอแนะด้านสิ่งแวดล้อม.xls` (134,656 B) | OLE2 structure; filename = form 2.2(2) | **NOT 2.2.2** — it is a 2.2.4 feedback form, not campaign evidence. |

**Verdict: 2.2.2 remains THIN — one verified narrative file.** The BigCleaningDay sign-in is a *candidate* secondary (positioned in the 2.2.2 direction) but is unverifiable without OCR; do not claim it as verified 2.2.2 evidence.

---

## 4. Semantic-verification classification (scan-only FY2568 PDFs)

Method: actual text extraction (PyMuPDF + pdfminer cross-check) for every PDF; no OCR, no invented content.

| Classification | Count (of 24 PDFs) | Files |
|---|---|---|
| **verified_content** | **18** | All 2.1.1 forms (2.1.1.pdf, แผน, ผล, ประวัติการอบรม 104p), 2.1.2.pdf + 2 trainer CVs, 2.2.1.pdf, 68-2.2(1), 68-2.2.1 (3), 2.2.2.pdf, 2.2.3.pdf (narrative), all 4× 2.2.4 PDFs, 1.3(4) misplaced form, annual-report PDF |
| **filename_folder_only** | **6** | 4 sign-in/acknowledgment scans (ไฟล์ 2.1(2): ดับเพลิง, BigCleaningDay, กฎหมาย GO, ความสำคัญ) + 2 byte-identical committee-order copies (D1: `คณะกรรมการGreen2025.pdf` ≡ `2.2.1 (4)…`) |
| **unreadable** | **0** | — (all 24 open cleanly on the mirror; the OneDrive phantom exists only at the G: source path for `68-2.1(2) (ให้ความรู้…)`, the mirror copy is intact) |

- DOCX (2) and XLSX (2) are structurally valid and text-extractable → **verified_content**. The `.xls` is valid OLE2 (structure only, presumed blank form).
- Rule confirmed: **no semantic verification claim for the 6 filename_folder_only scans** (sign-in sheets and committee order). They remain mapped at filename/folder level with `status: pending`.

---

## 5. 2.2.3 = MISSING_DEDICATED_EVIDENCE (recorded)

`2.2/2.2.3/2.2.3.pdf` (verified_content, 464 chars) is **narrative only**:

- States the **methodology**: "ร้อยละความเข้าใจนโยบายสิ่งแวดล้อมและการดำเนินงานสำนักงานสีเขียว (สุ่มอย่างน้อย 4 คน) โดยจะต้องสอบถามบุคลากรแต่ละคนอย่างน้อยตามข้อ 2.2.1(1)".
- Describes PR media produced per 2.2.1 and disseminated for staff understanding (incl. a green-office article).
- **Contains NO questionnaire/survey form, NO respondent names, NO percentage/respondent-result data.** The 8 embedded images on the single page are unverifiable without OCR.

**Disposition:** `2.2.3 = MISSING_DEDICATED_EVIDENCE` — a real questionnaire with respondent count (≥4) and computed percentage is required. Do **not** infer 2.2.3 coverage from Pre/Post training evaluation (`-2.3-9`) or from the reporting activity (`-2.7-20`), both of which belong to 2.1.1 / 2.2.4. No FY2569 plan activity measures it either (0 activities) → the gap is disclosed for both years.

---

## 6. Decision freeze summary

| # | Decision | Status |
|---|---|---|
| 1 | D2: root docx = CANONICAL ANNUAL_REPORT; root pdf = EXPORT; 2.3 docx = SUPERSEDED (excluded from indicator mapping) | **FROZEN** |
| 2 | A1 committee meeting → 2.2.1; A2 ครั้งที่ series → 2.2.2; A3 reporting → 2.2.4 | **FROZEN** |
| 3 | 2.2.2 secondary evidence (BigCleaningDay / significance acknowledgment) = **UNVERIFIABLE**; 2.2.2 stays THIN | **FROZEN** |
| 4 | Semantic verification: 18 verified_content / 6 filename_folder_only / 0 unreadable | **FROZEN** |
| 5 | 2.2.3 = MISSING_DEDICATED_EVIDENCE (FY2568 + FY2569) | **FROZEN** |
| 6 | Manifest hashes verified on-disk = manifest (PDF `56ad8f17…` correct; `050857ac…` belongs to D1 duplicate) | **FROZEN** |

## 7. Remaining blockers / PO confirmations

| # | Blocker | Type | Status |
|---|---|---|---|
| B1 | **Signed/รับรอง annual report version not found** — PO resolved: root docx = canonical historical baseline only; **no signed-submission claim** | PO | **RESOLVED (2026-08-23)** |
| B2 | **2.1.2 FY2569 coverage = 0 activities** — PO resolved: **no new activity**; FY2569 committee minutes must record per-course trainer assignment as required 2.1.2 cross-evidence (forward requirement) | PO | **RESOLVED (2026-08-23)** |
| B3 | **2.2.2 promotion of BigCleaningDay sign-in** requires OCR/human verification before it can count as secondary 2.2.2 evidence | Data owner | **OPEN** |
| B4 | **2.2.3 closure** requires a real questionnaire artifact (respondent ≥4 + %) — no source exists in FY2568 | Data owner | **OPEN** |

## 8. Phase C gate status (C2–C7, 2026-08-23)

| Gate | Status |
|---|---|
| C2 `src/data/category2/` contracts + `category2-manifest.json` | **DONE** — frozen FY2568 baseline only; evidenceIds reconciled in C3 |
| C2 `scripts/validate-category2-contracts.mjs` | **PASS** (3 domains; record counts 2.1.1=5, 2.1.2=3, 2.2.1=4, 2.2.2=3 [1 narrative + 2 candidates], 2.2.4=4; 2.2.3 = MISSING_DEDICATED_EVIDENCE invariant) |
| C3 evidence-index mapping | **DONE** — 20 indicator-level Cat2 entries + category-level annual report; contracts evidenceIds exactly reference them; validator enforces id/path/hash/indicator/availability/status equality; search index regenerated (185 items) |
| C4 action-plan taxonomy | **DONE** — `canonicalIndicatorCode` on all 20 Cat2 activities (legacy retained), reproducibly generated; frozen counts 2.1.1=8 · 2.2.1=1 · 2.2.2=9 · 2.2.4=2 (2.1.2/2.2.3=0); validator + tests enforce. Binary Excel not edited (not safely reproducible); canonical code in generated JSON + docs |
| C5 presentation | **DONE** — `category2-presentation.ts`, `Cat2ManagementCycle`, `Cat2DomainSnapshot`, `Cat2ContractContext`, `Cat2SourceDocuments` wired into TH/EN category + indicator pages; cat2 category note updated (2.2.3 gap + water placeholders) in lockstep with `test-baseline-2568.mjs` |
| C6 reuse | **DONE** — About feedback (2.2.4) retained; knowledge/activities reused; search index no drift |
| C7 QA/freeze | **DONE** — focused tests in `npm test`; `npm run check` 0 errors; full QA + runtime smoke TH/EN; closeout `docs/releases/GOFFICE2026_CAT2_FY2568_CLOSEOUT_2026-08-23.md` (PASS_WITH_GAPS) |
| 2.2.3 gap | Declared `MISSING_DEDICATED_EVIDENCE` in manifest + all 3 contract gaps; **no record, no evidence entry, no score** |
| 2.2.2 thin status | Single promoted `campaignNarrative` (THIN); 2 scan candidates `promoted:false`, verification pending |
| 2.1.2 forward requirement | `FORWARD_REQUIREMENT` year 2569 in manifest + training contract (PO B2) |
| 2.1.2 FY2569 minutes requirement | In forward requirement/gap only — no historical claim |
| Stale water placeholders | Left unchanged (no explicit Cat3 target); cat2 indicator pages no longer render them (cat2 excluded from category-evidence fallback) |

## 9. Files changed (C1–C7, 2026-08-23)

- `docs/data/GO-CAT2-PHASE-A-SOURCE-DISPOSITION.md` — **created** (C1); **updated** with PO resolutions B1/B2 (C2) and full C2–C7 gate status
- `docs/GOFFICE2026_CATEGORY2_COMMUNICATION_BLUEPRINT_V1.md` — **updated** through C7 (v1.3)
- `docs/releases/GOFFICE2026_CAT2_FY2568_CLOSEOUT_2026-08-23.md` — **created** (C7)
- `src/data/category2/` — **created (C2)**: `training.json`, `communication.json`, `feedback.json`, `category2-manifest.json`
- `src/data/evidence-index.json` — **modified (C3)**: 20 Cat2 indicator-level entries + annual-report entry
- `src/data/search-index.json` — **regenerated (C3/C6)**
- `src/data/generated/action-plan-2569.json` — **regenerated (C4)**: `canonicalIndicatorCode` added, 147 activities preserved
- `src/utils/category2-presentation.ts` + `src/components/categories/Cat2ManagementCycle.astro`, `Cat2DomainSnapshot.astro` + `src/components/indicators/Cat2ContractContext.astro`, `Cat2SourceDocuments.astro` — **created (C5)**
- `src/pages/categories/[id].astro`, `src/pages/en/categories/[id].astro`, `src/components/indicators/IndicatorTraceabilityExperience.astro` — **modified (C5)**
- `scripts/generate-action-plan-2569.mjs`, `scripts/validate-action-plan-2569.mjs`, `scripts/test-action-plan-2569.mjs`, `scripts/test-baseline-2568.mjs`, `scripts/validate-category2-contracts.mjs`, `scripts/test-category2-fy2568.mjs`, `scripts/test-category2-presentation.ts`, `package.json` — **created/modified (C2/C4/C7)**
- Runtime/public-documents/FY2569 output: **untouched**; pre-existing untracked temp files: **preserved**
