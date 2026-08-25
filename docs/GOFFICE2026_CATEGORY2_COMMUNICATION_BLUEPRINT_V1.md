# GOFFICE2026 — Category 2 Communication Blueprint V1.0

**Project:** Green Office 2026 — Environmental Communication & Assessment Evidence Platform
**Document Type:** Category Blueprint (canonical baseline for Cat2 implementation)
**Version:** 1.3
**Status:** ACTIVE — FY2568 baseline integration complete (C1–C7); closeout 2026-08-23
**Date:** 2026-08-23 (Asia/Bangkok) — updated 2026-08-23 (C1 freeze + C2 contracts + C3 evidence + C4 taxonomy + C5 presentation + C6 reuse + C7 QA/closeout)
**Repository HEAD baseline:** `609e53b65f4e4b411b5706f736f1ffa3e4b87b6a`
**Supersedes / parent authority:**
- `docs/00-GREENOFFICE_PROJECT_CONSTITUTION.MD` (Static-First, Reuse-Before-Generate, no DB/API/backend for MVP, GitHub = source of truth)
- `docs/GREENOFFICE2026_PLATFORM_BLUEPRINT_V5.md` (platform baseline, P0 evidence priority, truthfulness rules)
- `docs/GOFFICE2026_CATEGORY1_MANAGEMENT_BLUEPRINT_V1.md` + `docs/GOFFICE2026_CATEGORY1_PLAYBOOK_FOR_CATEGORIES_2-7.md` (the repeatable pattern this blueprint follows)
- `2026 Green Office Assessment Criteria.MD` + `src/data/criteria/{categories,issues,indicators}.json` (official 2569 criteria contracts)
- FY2568 Cat2 audit result (`docs/data/GO-DATA-5-FY2568-SOURCE-AUDIT.md` + Phase B reconciliation subagents, 2026-08-23)
- **C1 decision freeze:** `docs/data/GO-CAT2-PHASE-A-SOURCE-DISPOSITION.md` (2026-08-23) — D2 annual-report disposition, action-plan ambiguity decisions, 2.2.2 secondary-evidence verdict, semantic-verification classification, 2.2.3 gap

**Scope:** Category 2 = หมวดที่ 2 การสื่อสารและสร้างจิตสำนึก / Communication and Awareness Cultivation (weight 15%). Reconciliation + blueprint only — **no runtime/data mapping edits in this phase**.

---

## 1. Authority & Scope

| Item | Value |
|---|---|
| Category | 2 — การสื่อสารและสร้างจิตสำนึก / Communication and Awareness Cultivation |
| Weight | 15% |
| Issues | 2 (2.1 การอบรมให้ความรู้และประเมินความเข้าใจ · 2.2 การรณรงค์และประชาสัมพันธ์แก่บุคลากร) |
| Indicators | 6 (2.1.1, 2.1.2, 2.2.1, 2.2.2, 2.2.3, 2.2.4) |
| FY2568 baseline | 29 published source documents, **frozen** category-level baseline (`CATEGORY_LEVEL_RECORDED`, public access) |
| FY2569 layer | Not yet present — cat2 category page shows "รอการอัปเดต / Awaiting update" until verified sources arrive |
| Boundary | Evidence files governed by GitHub static publication + M365 where authenticated; no database/API/backend, no workflow engine, no CMS |

The 6 indicators form one management loop (domain model below). All FY2568 evidence is a **historical baseline for comparison** — never copied forward as FY2569 results.

## 2. Domain Model

> **Plan → Educate → Communicate → Verify Understanding → Listen → Improve**

| Stage | Meaning | Canonical indicators |
|---|---|---|
| **Plan** | Training plan + communication plan, responsibility & guidelines | 2.1.1 (กำหนดแผนการฝึกอบรม), 2.2.1 (ผู้รับผิดชอบและแนวทางสื่อสาร) |
| **Educate** | Deliver training, evaluate, keep records; qualified trainers per course | 2.1.1 (ดำเนินการอบรม/ประเมินผล/บันทึกประวัติ), 2.1.2 (ผู้รับผิดชอบการอบรมแต่ละหลักสูตร) |
| **Communicate** | Run campaigns and knowledge-sharing per the plan (2.2.1) | 2.2.2 |
| **Verify Understanding** | Measure personnel understanding of policy + green office operations (sample ≥4) | 2.2.3 |
| **Listen** | Systematic environmental feedback/suggestion channels | 2.2.4 |
| **Improve** | Feed feedback into documented improvements | 2.2.4 |

### Canonical entity / relationship model

```text
Entity                         ↔ Indicators          ↔ Repo assets
─────────────────────────────────────────────────────────────────────────────
TrainingPlan                   2.1.1                 (contract: training.json)
TrainingCourse/Delivery        2.1.1                 (contract + evidence)
TrainingRecord (per person)    2.1.1                 (contract + evidence)
Trainer (CV/qualification)     2.1.2                 (evidence, วิทยากร folder)
CommunicationPlan              2.2.1                 (contract: communication.json)
CommunicationResponsibility    2.2.1                 (evidence)
Campaign / Knowledge activity  2.2.2                 (contract + knowledge hub)
UnderstandingSurvey (≥4)       2.2.3                 GAP — no source yet
FeedbackChannel                2.2.4                 (about-feedback page + contract)
FeedbackRecord/Improvement     2.2.4                 (evidence: complaints + report)
Cat2 Annual Report             category-level        (manifest ANNUAL_REPORT)
```

Rules:
- **One canonical contract file per domain** (`src/data/category2/*.json`), many views (indicator page, category page, About, documents). No duplicated registries.
- **Evidence index** (`evidence-index.json`) carries indicator-level records referencing manifest paths + sha256; **document list** always reads from `fy2568-publication.json` manifest — never hardcoded filenames on pages.
- **Knowledge/activities/action-plan reuse** (section 7) instead of new content models.

## 3. Two Issues / Six Indicators

| Issue | Indicator | Title (TH) | FY2568 evidence strength | Status |
|---|---|---|---|---|
| 2.1 การอบรมให้ความรู้และประเมินความเข้าใจ | **2.1.1** | กำหนดแผนการฝึกอบรม ดำเนินการอบรม การประเมินผล และบันทึกประวัติการฝึกอบรม | **Strong** (9 files: plan/ผล/records/registration/cover) | Map ready |
| | **2.1.2** | กำหนดผู้รับผิดชอบด้านการอบรมแต่ละหลักสูตรมีความเหมาะสม | Medium (3 files: cover + 2 trainer CVs) | Map ready |
| 2.2 การรณรงค์และประชาสัมพันธ์แก่บุคลากร | **2.2.1** | มีการกำหนดผู้รับผิดชอบและแนวทางสื่อสารด้านสิ่งแวดล้อมทั้งภายในและภายนอก | Medium (4 substantive + 1 duplicate) | Map ready |
| | **2.2.2** | มีการรณรงค์สื่อสารและให้ความรู้ตามที่กำหนดในข้อ 2.2.1 | **Thin** (single narrative file) | Honest thin — keep amber |
| | **2.2.3** | ร้อยละความเข้าใจนโยบายสิ่งแวดล้อมและการดำเนินงานสำนักงานสีเขียว (สุ่มอย่างน้อย 4 คน) | **Gap** (narrative only, no questionnaire/respondents/%) | **Evidence gap — never fabricate** |
| | **2.2.4** | มีช่องทางรับข้อเสนอแนะ/ข้อคิดเห็นด้านสิ่งแวดล้อม และนำมาปรับปรุงแก้ไข | Medium (4 substantive + blank template) | Map ready |

## 4. FY2568 → FY2569 Year Model

Mirrors the proven Cat1 overlay pattern:

| Layer | Source files | Status |
|---|---|---|
| **FY2568 baseline** | `src/data/category2/*.json` (year 2568, `FROZEN_READ_ONLY_BASELINE`) + `fy2568-publication.json` + `baseline-2568.ts` | Frozen; never mutated; never presented as FY2569 |
| **FY2569 overlay** | Separate `src/data/category2/*-2569.json` + `src/utils/category2-fy2569-presentation.ts` (mirror Cat1 `*-2569.json` pattern) | Build **only when verified FY2569 sources exist**; until then category page keeps "รอการอัปเดต" |
| Presentation | FY2569 primary when present, FY2568 baseline in collapsed details (Cat1 journey pattern) | Applied in Phase C journeys |

Rules:
- FY2569 facts must come from verified FY2569 sources (currently none on disk for cat2).
- No copying FY2568 values into FY2569 records; no fabricated FY2569 counts/evidence/results.

## 5. Evidence Mapping Rules

### 5.1 29-file mapping summary (FY2568 → canonical indicator)

| Proposed indicator | Files (manifest path suffix) | Strength |
|---|---|---|
| **2.1.1** | `2.1/2.1.1/2.1.1.pdf`, `68-2.1(1) แผน.pdf`, `68-2.1(1) ผล.pdf`, `68-2.1(3) ประวัติการอบรมบุคลากร.pdf`, and all 4 files under `2.1/2.1.1/2.1(2) ใบลงทะเบียนและประเมินผลบุคลากร/` | Strong |
| **2.1.2** | `2.1/2.1.2/2.1.2.pdf` + `2.1/2.1.2/วิทยากร/*.pdf` (2 CVs) | Medium |
| **2.2.1** | `2.2/2.2.1/2.2.1.pdf`, `2.2.1 (4) กำหนดผู้รับผิดชอบในการสื่อสาร.pdf`, `68-2.2(1) แผนสื่อสารสิ่งแวดล้อม.pdf`, `68-2.2.1 (3) กำหนดกลุ่มเป้าหมาย….pdf` | Medium |
| **2.2.2** | `2.2/2.2.2/2.2.2.pdf` only — honestly thin | **Thin** |
| **2.2.3** | **None** — `2.2/2.2.3/2.2.3.pdf` is narrative-only | **Gap** |
| **2.2.4** | `2.2/2.2.4/2.2.4.pdf`, `2.2.4-แนวทางการจัดการข้อร้องเรียน.pdf`, `2.2.4_2ef-ep_complaints.pdf`, `2.4.4_1-รายงานการรับข้อเสนอแนะ….pdf` | Medium |
| ANNUAL_REPORT | root `รายงานผลการดำเนินงานหมวด2 (2568).docx` (**CANONICAL**, C1-frozen) + root pdf (**EXPORT**) + `2.3/…docx` (**SUPERSEDED** — excluded from mapping) | Strong (text-verifiable) |
| Excluded | blank templates (`หมวด 2 ข้อ 2.1(1-3)…xlsx`, `ef-ep.xlsx`, root `.xls`), duplicate root `คณะกรรมการGreen2025.pdf` | structural |

### 5.2 Evidence truthfulness constraints

1. **Scan-only PDFs cannot be content-verified.** Semantic-verification classification (C1, all 24 PDFs): **18 verified_content / 6 filename_folder_only / 0 unreadable** (fitz + pdfminer extraction; no OCR). Filename/folder-only mapping = `status: pending`, `inspection: filename/folder only`. Annual report DOCX/PDFs, all 2.1.1 forms, 2.1.2 + trainer CVs, 2.2.1 set, 2.2.2.pdf, 2.2.4 set are **verified_content**. The 6 filename_folder_only = 4 sign-in/acknowledgment scans + 2 byte-identical committee-order copies.
2. **Blank form templates are structural evidence only** — they prove the form exists, not that training/complaints occurred. Do not map them as operational evidence.
3. **2.2.3 = MISSING_DEDICATED_EVIDENCE** (C1-frozen). `2.2/2.2.3/2.2.3.pdf` is verified text but narrative-only: it states the ≥4-person random-sample methodology and the PR media produced, yet contains **no questionnaire, no respondent data, no percentage**. Only a real questionnaire with respondent count (≥4) and computed percentage can close it.
4. **2.2.2 is honestly thin.** Single verified narrative file (`2.2/2.2.2/2.2.2.pdf`). Secondary candidates verified by content: `68-2.1(2) (กิจกรรมBigCleaningDay2025).pdf` and `68-2.1.2(1)-ใบลงทบความสำคัญสำนักงานสีเขียว.PDF` are **UNVERIFIABLE** (pure scans, 0 text chars) — filename + cross-references lean campaign (2.2.2) but OCR/human verification is required before promotion. The root `.xls` form 2.2(2) is a **2.2.4 feedback form**, not 2.2.2 evidence.

### 5.3 Duplicate / misplaced disposition

| Item | SHA/size | Disposition |
|---|---|---|
| D1 `คณะกรรมการGreen2025.pdf` (root) ≡ `2.2/2.2.1/2.2.1 (4) กำหนดผู้รับผิดชอบในการสื่อสาร.pdf` | byte-identical `050857ac…` | **Keep** `2.2/2.2.1/2.2.1 (4)…` as 2.2.1 evidence; **exclude root copy** from cat2 indicator mapping (`duplicateOf` flag in manifest) |
| D2 `2.3/รายงานผล….docx` (37,344,917) vs root docx (37,344,232) | near-identical (Δ≈2KB) | **Root docx = CANONICAL** (rev 60, mod 2026-03-12, adds 2.2.2(2) evidence line); **`2.3/…` = SUPERSEDED** (rev 57, mod 2026-03-11); root pdf = EXPORT of root. C1-frozen (`GO-CAT2-PHASE-A-SOURCE-DISPOSITION.md`). No signed version in the set — PO confirm |
| D3 root `รายงานผล….pdf` (6,076,264) | PDF export (2026-03-12 16:22) | Keep as reader-friendly export; **not** a separate indicator entry |
| Misplaced `2.2/2.2.2/1.3(4) ทะเบียนจัดลำดับปัญหาสิ่งแวดล้อมด้านทร.pdf` | 211,047 | Cat1 form (แบบฟอร์ม 1.3(4)) — **not cat2 evidence**; return to cat1 or mark unsupported |
| `2.3/` folder | — | Not part of official cat2 taxonomy (2.1.1–2.2.4); staging folder for annual report — resolved by D2 canonicalization; update the cat2 category-page "unresolved item" note in lockstep with `test-baseline-2568.mjs` |

### 5.4 Stale cat2 water placeholders

- `evidence-index.json` `ev-water-audit-2025` (`/documents/cat2/water-audit-2025.pdf`) and `ev-water-conservation` (`/documents/cat2/conservation-initiatives.pdf`) are **placeholder water records** with no file on disk — they must **not** carry cat2 semantic meaning.
- **Resolution (Phase C, with runtime edits):** recategorize to cat3 (water) or set obsolete/unsupported; remove their influence on cat2 indicator pages. `ev-water-meter-q1` stays cat3/3.1.2 (correct mapping per review-004); align its path with the cat3 documents area.
- After resolution, cat2 indicator pages will stop showing water as "category-level evidence".

## 6. Action-Plan Taxonomy Reconciliation (FY2569)

`src/data/generated/action-plan-2569.json` — `cat-2` block (20 activities, `actualMonths` all empty = unexecuted FY2569 plan). Current `indicatorCode`s use **non-canonical** numbering: `2.1, 2.1.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7` (2.3–2.7 do not exist in the official taxonomy; only one activity carries a canonical code and it is wrong by meaning).

**Meaning-based mapping (by activityTh, not blind renumbering):**

| Proposed canonical | Activities | Count |
|---|---|---|
| 2.1.1 | หมวด 1 ความสำคัญของสำนักงานสีเขียว · หมวด 1 ก๊าซเรือนกระจก · หมวด 3 พลังงานและทรัพยากร · หมวด 4 การจัดการของเสีย · หมวด 5 ฝึกซ้อมดับเพลิง/หนีไฟ/แผ่นดินไหว · หมวด 6 จัดซื้อจัดจ้างสีเขียว (formal module trainings) · ลงทะเบียน+ประเมินผลก่อน/หลังฝึกอบรม (Pre/Post) · จัดทำประวัติและบันทึกการฝึกอบรม | 8 |
| 2.1.2 | — | 0 |
| 2.2.1 | ประชุมคณะกรรมการหมวด 2 | 1 |
| 2.2.2 | ดำเนินการตามแผนการสื่อสารสิ่งแวดล้อม 2569 (12×/yr) · ครั้งที่ 1 นโยบายสิ่งแวดล้อม · ครั้งที่ 2 ปัญหาสิ่งแวดล้อมและการจัดการ · ครั้งที่ 3 การปฏิบัติตามกฎหมายสิ่งแวดล้อม · ครั้งที่ 4 ความสะอาดและความเป็นระเบียบ (5ส) · ครั้งที่ 5 เป้าหมายและมาตรการพลังงานและทรัพยากร (12×/yr) · ครั้งที่ 6 เป้าหมายและมาตรการจัดการของเสีย · ครั้งที่ 7 สินค้าและบริการที่เป็นมิตรกับสิ่งแวดล้อม · ครั้งที่ 8 ก๊าซเรือนกระจก | 9 |
| 2.2.3 | — (no activity measures understanding %) | 0 |
| 2.2.4 | จัดทำช่องทางรับข้อเสนอแนะอย่างเป็นระบบ · สรุปข้อมูล วิเคราะห์ และรายงานผลต่อผู้บริหาร | 2 |

- **Ambiguities — RESOLVED and frozen (C1, `GO-CAT2-PHASE-A-SOURCE-DISPOSITION.md` §2):**
  - A1 ประชุมคณะกรรมการหมวด 2 → **2.2.1** (committee meeting assigns comms responsibility/guidelines; pairs with the 2.2.1 folder evidence).
  - A2 ครั้งที่ series (8 sessions) → **2.2.2** (recurring single-team awareness campaign; topics map 1:1 to FY2568 2.2.1(1) comms-plan topics reported under 2.2.2; ครั้งที่ 5 12×/yr = monthly target/result communication, resource monitoring stays in cat3).
  - A3 สรุปข้อมูล/รายงานผลต่อผู้บริหาร → **2.2.4** (closes the feedback loop built by the preceding channel activity; no survey data involved).
- **2.1.2 coverage decision:** 0 standalone activities in the FY2569 plan. `responsible` fields name session organizers only → operational clarity, not scored evidence. **PO B2 (2026-08-23): no new activity added** — FY2569 committee minutes must record per-course trainer assignment and serve as the required 2.1.2 cross-evidence. Recorded as a **forward requirement** (FORWARD_REQUIREMENT, year 2569) in the C2 contracts/manifest, not a historical claim.
- **2.2.3 coverage decision:** 0 activities measure understanding % (no สุ่ม/ร้อยละ/แบบสอบถาม) → stays a disclosed gap for FY2569 as well as FY2568 (see §5).
- **Implementation recommendation:** add a `canonicalIndicatorCode` mapping table in the action-plan JSON/blueprint now (all `actualMonths` empty, safe); also add a remap column to the source Excel so `scripts/generate-action-plan-2569.mjs` stops emitting non-canonical codes.
- **Guardrails:** do NOT map Pre/Post (#9) or reporting (#20) to 2.2.3 — that would imply an unearned PASS. 2.1.2 has no standalone activity; the `responsible` fields are only implicit support.

## 7. Knowledge / Activity / Evidence Reuse

| Asset | Existing | Cat2 reuse |
|---|---|---|
| Knowledge practice | `practices.json` `green-office-mindset` → categories `[cat1, cat2]`, indicators `[1.5.1, 1.5.3, 2.2.1, 2.2.2]` | Reuse as-is; practice hub already links cat2 indicators |
| Activities hub | `content/hubs.json` `activities` — description explicitly references หมวด 2; pending content slots | Reuse as-is (content pending state); future campaign/training records fill slots |
| Action plan | `action-plan-2569.json` cat-2 block (20 activities) | Reuse with canonical-code mapping (§6) |
| Evidence | `evidence-index.json` + `fy2568-publication.json` + `evidence-review-queue.json` | Add indicator-level cat2 entries in Phase C (rules §5); retire stale water placeholders |
| About | `about-feedback` → 2.2.4 (channel + improvement, redaction) | Reuse as-is; the only existing cat2 About hook |
| Search | `search-index.json` (cat2 category + issue + docpage + 6 indicator entries) | Reuse; regenerate after Phase C additions (`scripts/generate-search-index.mjs`) |
| Docs center | `documents/[id].astro` already enumerates `fy2568/cat2` 29 docs | Reuse as-is |

No duplicate content model, backend, CMS, or workflow engine is introduced.

## 8. Presentation Roles

| Route | Role | Notes |
|---|---|---|
| `/categories/cat2/` | Category hub: FY2568/FY2569 comparison panel + issues/indicators list | Already generic; add `Cat2ManagementCycle` + `Cat2DomainSnapshot` panels (mirror Cat1) + update the "unresolved item" note after D2 disposition |
| `/indicators/2.x.x/` | Indicator journeys 2.1.1–2.2.4 via shared `IndicatorTraceabilityExperience` | Add `cat2xCanonical` conditionals + `Cat2*Presentation`/journeys + shared `Cat2SourceDocuments`; 2.2.3 renders honest evidence-gap journey; 2.2.2 shows thin-evidence amber state |
| `/knowledge/` | 8-practice engagement hub | Already links 2.2.1/2.2.2 via `green-office-mindset`; extend only if new verified practice content exists |
| `/activities/` | Activities hub (pending slots) | Reuse; populate from FY2569 action plan when executed activities have evidence |
| `/evidence/` | Evidence library (`?category=cat2` filter) | Gains real cat2 indicator-level entries; stale water placeholders removed |

## 9. Phased Implementation Plan (Phase C order)

1. **C1 — Source disposition record:** `docs/data/GO-CAT2-PHASE-A-SOURCE-DISPOSITION.md` — **DONE (2026-08-23)**. D2 annual-report verdicts, action-plan ambiguity decisions (A1→2.2.1, A2→2.2.2, A3→2.2.4), 2.2.2 secondary-evidence verdict, semantic-verification classification (18/6/0), 2.2.3 = MISSING_DEDICATED_EVIDENCE. **PO resolutions:** B1 (root docx = canonical historical baseline only; no signed-submission claim) · B2 (no new FY2569 activity; committee minutes must record per-course trainer assignment as required 2.1.2 cross-evidence — forward requirement).
2. **C2 — Canonical contracts:** **DONE (2026-08-23)** — `src/data/category2/` `training.json` (2.1.1/2.1.2), `communication.json` (2.2.1/2.2.2), `feedback.json` (2.2.4) + `category2-manifest.json` (2.2.3 in `missingIndicators` = MISSING_DEDICATED_EVIDENCE; 2.1.2 in `forwardRequirements` = FORWARD_REQUIREMENT year 2569; `annualReport` B1-frozen) + `scripts/validate-category2-contracts.mjs` — **PASS**.
3. **C3 — Evidence mapping:** **DONE (2026-08-23)** — 20 indicator-level Cat2 entries added to `evidence-index.json` (2.1.1=5, 2.1.2=3, 2.2.1=4, 2.2.2=3 [1 narrative + 2 candidates], 2.2.4=4) + category-level annual report; contracts `evidenceIds` reconciled; validator enforces id/path/hash/indicator equality; search index regenerated; stale water placeholders left unresolved (no explicit Cat3 target).
4. **C4 — Action-plan taxonomy:** **DONE (2026-08-23)** — every Cat2 activity carries `canonicalIndicatorCode` (legacy code retained) in `action-plan-2569.json`, reproducibly added by `generate-action-plan-2569.mjs`; frozen counts 2.1.1=8 · 2.2.1=1 · 2.2.2=9 · 2.2.4=2 (2.1.2/2.2.3=0); validator + tests enforce the invariant. Binary Excel not edited (not safely reproducible); canonical code lives in generated JSON + docs.
5. **C5 — Presentation:** **DONE (2026-08-23)** — `src/utils/category2-presentation.ts` (communication loop Plan→Assign→Communicate→Capture feedback→Management review, domain snapshots, journeys) + `Cat2ManagementCycle`, `Cat2DomainSnapshot`, `Cat2ContractContext` (honest MISSING/THIN/forward states), `Cat2SourceDocuments` (C1-approved file set) — wired into TH/EN category pages and `IndicatorTraceabilityExperience`; cat2 category note updated (2.2.3 gap + water placeholders) in lockstep with `test-baseline-2568.mjs`; cat2 excluded from the legacy water category-evidence fallback.
6. **C6 — About/Knowledge hooks:** **DONE (2026-08-23)** — `about-feedback` (2.2.4) integrity verified/retained; knowledge practice `green-office-mindset` → 2.2.1/2.2.2 reused; activities hub retained; search index regenerated (185 items, no drift).
7. **C7 — Tests + QA + freeze:** **DONE (2026-08-23)** — `test-category2-fy2568.mjs` + `test-category2-presentation.ts` added to `npm test`; `npm run check` 0 errors; full QA + runtime smoke TH/EN; closeout `docs/releases/GOFFICE2026_CAT2_FY2568_CLOSEOUT_2026-08-23.md` (PASS_WITH_GAPS). GitHub Pages deploys on push; production VPS only with PO approval.
3. **C3 — Evidence mapping:** add indicator-level `evidence-index.json` entries per §5.1 (status `pending`, provenance manifest sha); retire/reassign stale water placeholders; fix `ev-water-meter-q1` path.
4. **C4 — Action-plan taxonomy:** `canonicalIndicatorCode` mapping in action-plan JSON + source Excel remap column.
5. **C5 — Presentation:** `src/utils/category2-presentation.ts`; `Cat2ManagementCycle`/`Cat2DomainSnapshot`; `Cat2*Presentation`/journeys + `Cat2SourceDocuments`; wire into `categories/[id].astro`, `en/categories/[id].astro`, `IndicatorTraceabilityExperience.astro`; update cat2 category note.
6. **C6 — About/Knowledge hooks:** confirm `about-feedback` (2.2.4) integrity; reuse knowledge/activities as-is; regenerate search index.
7. **C7 — Tests + QA + freeze:** mirror `test-categoryN-*` + `validate-categoryN-*`; `npm run check` · `npm test` · `npm run build` · `npm run validate` · `git diff --check`; runtime smoke TH/EN; freeze closeout record (mirror `GOFFICE2026_CAT1_FY2568_CLOSEOUT_2026-08-19.md`). GitHub Pages auto-deploys on push; production VPS only with PO approval.

## 10. Guardrails

- No fabrication: missing/thin evidence renders as honest amber states; 2.2.3 stays a gap.
- FY2568 = frozen historical baseline; FY2569 = current layer **only when verified**.
- No auto-scoring; coverage/readiness only.
- Static First — JSON contracts; no database/API/backend/workflow/CMS.
- No local drive paths in public data; manifest + sha256 referenced.
- No production/VPS edits; GitHub Pages preview until PO approval.
- No duplicate registries (training/communication/feedback) across category page, About, evidence, action plan.
- Duplicate dispositions require PO confirmation before manifest changes.

## 11. Definition of Done (Phase C)

1. All 6 cat2 indicators have correct canonical mapping; 2.2.3 disclosed as MISSING, 2.2.2 disclosed as thin.
2. `src/data/category2/` contracts + manifest validated by script; no invented values; validator passes.
3. Indicator-level evidence entries for 2.1.1/2.1.2/2.2.1/2.2.2/2.2.4 (pending verification); stale water placeholders retired.
4. `/categories/cat2/` shows management cycle + domain snapshot (TH+EN); "unresolved item" note resolved.
5. Every cat2 indicator has a runtime journey or honest evidence-gap journey (TH+EN).
6. Shared source-documents section on indicator pages; files open in new tab (no `download`).
7. Action-plan cat2 activities mapped to canonical codes; source Excel remap column added.
8. Search index regenerated; TH/EN parity maintained.
9. Tests + build + validate pass; GitHub Pages deployed; freeze closeout recorded in `docs/releases/`.

## 12. Related Documents

- `docs/00-GREENOFFICE_PROJECT_CONSTITUTION.MD`
- `docs/GREENOFFICE2026_PLATFORM_BLUEPRINT_V5.md`
- `docs/GOFFICE2026_CATEGORY1_MANAGEMENT_BLUEPRINT_V1.md`
- `docs/GOFFICE2026_CATEGORY1_PLAYBOOK_FOR_CATEGORIES_2-7.md`
- `docs/data/GO-DATA-5-FY2568-SOURCE-AUDIT.md`
- `docs/data/GO-CAT2-PHASE-A-SOURCE-DISPOSITION.md` (C1 decision freeze + PO resolutions B1/B2 + C2 gate, 2026-08-23)
- `src/data/category2/` canonical contracts + `category2-manifest.json` + `scripts/validate-category2-contracts.mjs` (C2)
- `2026 Green Office Assessment Criteria.MD`
- `src/data/criteria/{categories,issues,indicators}.json` · `src/data/fy2568-publication.json` · `src/data/criteria/baseline-2568.ts`
