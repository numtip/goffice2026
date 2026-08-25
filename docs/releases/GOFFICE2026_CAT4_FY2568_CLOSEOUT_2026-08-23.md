# GOFFICE2026 — Category 4 FY2568 Baseline Closeout

**Status:** `CAT4 FY2568 BASELINE_INTEGRATED` — **`PASS_WITH_LIMITATIONS`**
**Date:** 2026-08-23 (Asia/Bangkok)
**Preview URL:** https://numtip.github.io/goffice2026/ — **NOT deployed. No VPS changes. No production edits.**
**Authority:** `docs/GOFFICE2026_CATEGORY4_WASTE_BLUEPRINT_V1.md` · `docs/data/GO-CAT4-PHASE-A-SOURCE-DISPOSITION.md` · official Green Office 2569 criteria
**Repository HEAD baseline:** `15b60b42358c3d7d3cc0ff0dd5c29a8a7dc0e4a9` (= origin/master, Cat3 baseline merged)

> Category 4 (หมวดที่ 4 การจัดการของเสีย / Waste Management, weight 15%) FY2568 historical baseline is fully integrated into the platform. All 5 indicators (4.1.1, 4.1.2, 4.1.3, 4.2.1, 4.2.2) have dedicated content-verified evidence — no GAP/MISSING. The report is **PASS_WITH_LIMITATIONS** — every source limitation (8 unique scans / 10 scan paths, garbled measures PDF, ปลอดโฟม not implemented, reuse >50% not met, general-waste target not met, monthly-vs-annual scope, external WTMS records, no signed copy) is honestly disclosed and never fabricated.

---

## 1. Honest source limitations (PASS_WITH_LIMITATIONS basis)

| # | Limitation | Status |
|---|---|---|
| **S1** | **8 unique scan contents across 10 scan path instances** — ประกาศเป้าหมาย (1p), ประกาศบริบท (8p), แบบฟอร์มสุ่มตรวจ (24p), สัญญาจ้าง (1p), แบบบันทึกขยะ 2566/2567/2568 (12p×3), บันทึกตักคราบน้ำมัน/ไขมัน (4p; duplicate under 4.2.1 and 4.2.2). All `filename_folder_only`, `promoted:false`. | OPEN — data owner |
| **S2** | **Garbled measures PDF** — `4.1.1 (1) มาตรการควบคุมพลังงานและทรัพยากร…2568.pdf` Thai glyph layer broken; verified by cross-reference to the section narrative only. | OPEN — data owner (OCR) |
| **S3** | **4.1.1(3) ปลอดโฟม NOT implemented in FY2568** — explicitly disclosed by the source note; the FY2569 plan is a forward statement only (`FOAM_FREE_FY2569_PLAN`), not verified FY2569 evidence. | OPEN — PO (disclose vs additional evidence) |
| **S4** | **4.1.3(3) numeric >50% reuse NOT met (31.93%)** — claim rests on the innovation/composting branch, never presented as meeting the >50% threshold. | OPEN — data owner (branch confirmation) |
| **S5** | **4.1.3(4) FY2568 general waste INCREASED +1.68% vs 2567** — the "declining trend" claim is only valid on the 3-year window vs 2566 (−253 kg). | OPEN — data owner |
| **S6** | **Monthly-vs-annual scope** — monthly form (XLSX `คำนวณ%`) totals 5,625.7 kg; annual report scope totals 6,434.70 kg. Both recorded, never conflated. | Disclosed |
| **S7** | **WTMS external records** — แบบ ทส.1/ทส.2 monthly discharge records are external online evidence (building.mju.ac.th bID 18845/18846) — reference links only, not in repo. | OPEN — PO (link-out vs download) |
| **S8** | **No signed copy** — no signature/approval block anywhere in the FY2568 Cat4 set; the canonical 10-03-69 report is a historical baseline — no submission claim. | Disclosed |

## 2. Verified FY2568 values used (from C1 text extraction — not scores)

| Domain | Target | Actual (FY2568) | Outcome |
|---|---|---|---|
| General waste sent for disposal (4.1.3) | **−3% vs 2567** (ประกาศเป้าหมาย 2568) | **4,380.10 kg (+72.40 kg, +1.68%)** | **NOT met** |
| Total all waste (4.1.3) | — | 6,434.70 kg (ส่งกำจัด 4,380.10 + reuse 1,223.50 + เศษอาหาร 820.70 + เศษกิ่งไม้/ใบไม้ 10.40) | — |
| Reuse incl. food/leaves (4.1.3) | numeric >50% threshold | 2,054.60 kg = **31.93%** | numeric **NOT met** — innovation/compost branch |
| Monthly-form scope (4.1.3) | — | 5,625.7 kg (`คำนวณ%` sheet; matches `generated/waste.json`) | recorded separately |
| Wastewater (4.2.1) | legal standard (ประกาศ 2548) | Monthly effluent stats within standard; accredited-lab testing | Compliant (narrative) |

## 3. Indicator coverage (FY2568 baseline)

| Indicator | Evidence entries | Status |
|---|---|---|
| 4.1.1 | 5 (measures cross-ref, 2 scans, campaign, foam-free gap) | Mapped, scans/garbled pending |
| 4.1.2 | 7 (5 narrative + 2 scans) | Mapped, 2 scans pending |
| 4.1.3 | 8 (annual data, analysis, reuse, trend, log scan, 3 promoted year tables) | Mapped, log scan pending |
| 4.2.1 | 5 (stats, 3 narrative, skim scan) | Mapped, skim scan pending |
| 4.2.2 | 5 (4 narrative, skim scan duplicate G2) | Mapped, skim scan pending |
| Category-level | 1 (annual report 10-03-69 DOCX canonical; 02-03-69 superseded; 10-03-69 PDF export) | Category-level only |

## 4. C4 action-plan canonical mapping (frozen)

| Canonical | Count | Activities |
|---|---|---|
| 4.1.1 | **5** | มาตรการจัดการขยะ · แผน Zero Waste · ปลอดโฟม · เจตนารมณ์/ข้อตกลง · รณรงค์ลดพลาสติก |
| 4.1.2 | **8** | 7 sorting/collection/disposal items + **Big Clean Day** (cleaning/sorting/collection campaign) |
| 4.1.3 | **3** | บันทึกข้อมูลปริมาณขยะ · นำขยะกลับมาใช้ประโยชน์ >50%/RDF · ปริมาณขยะส่งกำจัดลดลง |
| 4.2.1 | **4** | ผู้รับผิดชอบ · บำบัดน้ำเสียอย่างเหมาะสม · บำบัดครบทุกจุด · ระบบพร้อมใช้/คุณภาพน้ำทิ้ง |
| 4.2.2 | **4** | ดูแลระบบ/ตักทำความสะอาด · จัดการไขมัน/กากตะกอน · ตรวจสอบซ่อมแซม · ตรวจสอบรั่วไหล |
| **Disclosed** | **1** | กิจกรรม 5 ส (5S workplace-organization) — **cannot be supported by a single canonical Cat4 indicator; left unmapped (`canonicalMappingNote: DISCLOSED`) rather than invented** |

Mapping is reproducibly applied by `scripts/generate-action-plan-2569.mjs` (`CAT4_CANONICAL_INDICATOR` + `CAT4_CANONICAL_MAPPING_NOTE`); enforced by `validateActionPlanCat4Canonical` in `scripts/validate-action-plan-2569.mjs` + `test-action-plan-2569.mjs`. **No new activities and no FY2569 facts are added.**

## 5. C5 pages / components (presentation)

- `src/utils/category4-presentation.ts` — waste-management cycle **Plan → Sort/Collect/Dispose → Reuse/Recycle → Wastewater Control → Care/Maintain**, domain snapshots, journeys, honest scope/threshold handling (annual 6,434.70 vs monthly-form 5,625.7; reuse 31.93% never presented as >50% met).
- `src/components/categories/Cat4ManagementCycle.astro` — compact 5-stage operational loop on `/categories/cat4/` (TH + EN), restrained single-accent hierarchy.
- `src/components/categories/Cat4DomainSnapshot.astro` — FY2568 verified-fact cards per issue (4.1, 4.2) + target-fact row, labeled coverage context (never a score).
- `src/components/indicators/Cat4ContractContext.astro` — per-indicator FY2568 contract context with cycle-stage badge, honest per-indicator limitation note, FY2569 "awaiting verified data" panel, and the full source-limitations disclosure.
- `src/components/indicators/Cat4SourceDocuments.astro` — "เอกสารต้นฉบับสำหรับการตรวจสอบ" per issue group (4.1/4.2), filtered to the C1-approved manifest file set (superseded 02-03-69 DOCX and PDF export excluded; promoted year tables + form XLSX + canonical report included).
- Wiring: `src/pages/categories/[id].astro` + `src/pages/en/categories/[id].astro` (`category.code === 'cat4'`), `src/components/indicators/IndicatorTraceabilityExperience.astro` (cat4 canonical blocks; cat4 excluded from the legacy category-evidence fallback).
- Category page note updated to reflect the reconciled state (all-5 covered + limitations, TH/EN).

## 6. Evidence & data integration (C2–C4)

- C2 canonical contracts: `src/data/category4/{targets,measures,sorting,data,wastewater,treatment-care}.json` + `category4-manifest.json` (frozen FY2568; `sourceLimitations` declared; `missingIndicators` empty; `FOAM_FREE_FY2569_PLAN` forward requirement).
- **Publication delta (C3):** 4 files promoted into `public/documents/fy2568/cat4/` + `fy2568-publication.json` (cat4 28 → **32** docs; platform total 209 → **213**; totalBytes 793,831,313): `ปี 2566.pdf`, `ปี 2567.pdf`, `ปี 2568.pdf` (verified data tables) + `หมวดที่ 4 รายงานผลการจัดการของเสีย (10-03-69).pdf` (reader export). `baseline-2568.ts` cat4 updated to 32 / {xlsx:1, pdf:14, txt:15, docx:2}.
- C3: **31 Cat4 evidence-index entries** (1 category-level annual-report + 30 indicator-level across all 5 indicators); contracts `evidenceIds` reconcile exactly (path/hash/indicator/availability/status).
- C3 legacy reconciliation: `ev-waste-recycling-2025`, `ev-waste-monthly-2025` (off-manifest `docs/1.5_Waste.xlsx` workbook claims) **downgraded to category-level** (`realSourceAvailable:false`, indicatorCodes cleared) with `supersededBy` → `ev-cat4-data-reuse-compost-fy2568` / `ev-cat4-data-waste-annual-fy2568`.
- C6: search index regenerated deterministically (**235 items**, no drift); action-plan cat4 canonical mapping frozen (25 activities, 1 disclosed).
- Dashboard note: `generated/waste.json` FY2568 monthly-form total (5,625.7 kg) reconciles with the Cat4 XLSX `คำนวณ%` sheet; the annual report scope (6,434.70 kg) is the authoritative annual value — both documented, C2 reconciliation note recorded in the data contract.

## 7. Validation

| Gate | Result |
|---|---|
| `npm run check` | PASS — 0 errors |
| `npm test` | PASS (all suites incl. `test-category4-fy2568.mjs` + `test-category4-presentation.ts` + updated action-plan/baseline/publication suites) |
| `node scripts/validate-category4-contracts.mjs` | PASS (6 domains, 5/5 indicators in contracts, annual-fact + scan + G2-duplicate + superseded/export invariants) |
| `node scripts/validate-evidence.mjs` | PASS (95 items) |
| `node scripts/validate-search-index.mjs` | PASS (235 items, no drift) |
| `node scripts/validate-action-plan-2569.mjs` | PASS (cat4 canonical 4.1.1=5/4.1.2=8/4.1.3=3/4.2.1=4/4.2.2=4 + 1 disclosed) |
| `npm run validate` | PASS (10/10 phases, 95 evidence, 411 routes, 18,339 links checked) |
| `npm run build` | PASS (412 pages) |
| `git diff --check` | PASS |
| `npm run qa:routes` + `smoke-action-plan-runtime.mjs` | PASS (60/60 routes + action-plan runtime) |

## 8. Remaining C1 blockers (unchanged, forwarded)

B1 ปลอดโฟม FY2568 gap · B2 >50% reuse branch · B3 +1.68% trend honesty · B4 8 unique scans / 10 paths pending OCR · B5 garbled measures PDF · B6 WTMS external records · B7 no signed copy · B8 dashboard `waste.json` (5,625.7, form scope) vs report (6,434.70, annual scope) reconciliation — all recorded in `docs/data/GO-CAT4-PHASE-A-SOURCE-DISPOSITION.md`.
