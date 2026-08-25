# GOFFICE2026 — Category 3 FY2568 Baseline Closeout

**Status:** `CAT3 FY2568 BASELINE_INTEGRATED` — **`PASS_WITH_LIMITATIONS`**
**Date:** 2026-08-23 (Asia/Bangkok)
**Preview URL:** https://numtip.github.io/goffice2026/ — **NOT deployed. No VPS changes. No production edits.**
**Authority:** `docs/GOFFICE2026_CATEGORY3_RESOURCE_BLUEPRINT_V1.md` · `docs/data/GO-CAT3-PHASE-A-SOURCE-DISPOSITION.md` · official Green Office 2569 criteria
**Repository HEAD baseline:** `b4ee4724512fbb2b87e3ce8797eaef61a5da5b54` (= origin/master, Cat2 baseline merged)

> Category 3 (หมวดที่ 3 การใช้ทรัพยากรและพลังงาน / Resource and Energy Utilization, weight 15%) FY2568 historical baseline is fully integrated into the platform. All 15 indicators have dedicated content-verified evidence — no GAP/MISSING. The report is **PASS_WITH_LIMITATIONS** — every source limitation (2 scans, garbled measures PDF, image-only per-unit tables, misbounded #19, incomplete #21, partial #32, no signed copy) is honestly disclosed and never fabricated.

---

## 1. Honest source limitations (PASS_WITH_LIMITATIONS basis)

| # | Limitation | Status |
|---|---|---|
| **S1** | **2 image scans** — `#11 ปริมาณน้ำทั้งเครื่องปรับอากาศ.pdf` (12p AC-condensate photos) and `#20 รายงานการใช้รถยนต์.pdf` (22p vehicle log) are `filename_folder_only` (`promoted:false`). Content pending OCR/human verification. | OPEN — data owner |
| **S2** | **Garbled measures PDF** — `#3 มาตรการควบคุมการใช้พลังงานและทรัพยากร ปี 68.pdf` Thai text garbled in extraction (broken font cmap). Verified only as "measures PDF"; details pending OCR review. | OPEN — data owner |
| **S3** | **3.2.2 image-only per-unit tables** — per-unit electricity numbers not text-extractable (MEDIUM strength). Only the summary 403,036.80 u (+4.6%) is text-verified; per-unit values stay `null`/unavailable. | OPEN — data owner (B2) |
| **S4** | **#19 misbounded** — 3.2.4.pdf starts with a 3.2.3 page and ends with 3.2.5 pages; fuel measures on pages 2–9. | Disclosed, not inferred |
| **S5** | **#21 incomplete** — 3.2.5.pdf starts at item (2); item (1) exists only in the compiled reports. | Disclosed, not inferred |
| **S6** | **#32 partial** — 3.4.2.pdf starts at item (3); items (1)/(2) present only in the 3.4 issue-report DOCX. | Disclosed, not inferred |
| **S7** | **No signed copy** — no signature/approval block anywhere in the 32-file FY2568 set; `#4` carries a typed-name placeholder only. The canonical report is a historical baseline — no signed-submission claim. | Disclosed |
| **S8** | **Fuel dashboard discrepancy** — the operational fuel workbook total (339.83 L in `generated/fuel.json`) differs from the published report total (695.82 L); the contract records the C1-verified report value; dashboard reconciliation pending. | OPEN — data owner |

## 2. Verified FY2568 values used (from C1 text extraction — not scores)

| Domain | Target | Actual (FY2568) | Outcome |
|---|---|---|---|
| Electricity (3.2.2) | reduce 1% vs 2024 | 403,036.80 units (+4.6%) | **NOT met** |
| Water (3.1.2) | reduce 1% vs 2024 | 8,337.50 units (+47.1%); 87.76 units/person (+47.71%) | **NOT met** |
| Paper (3.3.2) | reduce 1% vs 2024 | 2,197.80 kg (+117 kg); 23.13 kg/unit (+5.6%) | **NOT met** |
| Fuel (3.2.5) | reduce 1% vs 2024 | 695.82 L (−205 L, −22.7%) | **MET** |

## 3. Indicator coverage (FY2568 baseline)

| Indicator | Evidence entries | Status |
|---|---|---|
| 3.1.1 | 2 (measures + AC-condensate photo scan pending) | Mapped, pending verification |
| 3.1.2 | 1 (water data per unit) | Mapped, pending verification |
| 3.1.3 | 1 (water compliance survey) | Mapped, pending verification |
| 3.2.1 | 1 (electricity measures) | Mapped, pending verification |
| 3.2.2 | 1 (electricity data — **MEDIUM**, per-unit unavailable) | Mapped, MEDIUM |
| 3.2.3 | 1 (electricity compliance survey) | Mapped, pending verification |
| 3.2.4 | 2 (fuel measures + vehicle-log scan pending) | Mapped, pending verification |
| 3.2.5 | 1 (fuel data per distance — MET) | Mapped, pending verification |
| 3.3.1 | 1 (paper measures) | Mapped, pending verification |
| 3.3.2 | 1 (paper data per unit) | Mapped, pending verification |
| 3.3.3 | 1 (paper compliance survey) | Mapped, pending verification |
| 3.3.4 | 1 (ink/stationery measures) | Mapped, pending verification |
| 3.3.5 | 1 (ink/stationery compliance survey) | Mapped, pending verification |
| 3.4.1 | 1 (green meeting/exhibition measures) | Mapped, pending verification |
| 3.4.2 | 1 (eco-material implementation — partial standalone) | Mapped, pending verification |
| Category-level | 2 (targets/measures doc + GO หมวด 3 annual report) | Category-level only |

## 4. C4 action-plan canonical mapping (frozen)

All 6 Cat3 FY2569 activities carry `canonicalIndicatorCode` (legacy 3.1–3.6 codes retained):

| Canonical | Count | Activities |
|---|---|---|
| 3.1.1 | 2 | กำหนดมาตรการ/ค่าเป้าหมาย/แนวทางปฏิบัติ (cross-domain Plan) · แผนปรุงปรับน้ำทิ้งเครื่องปรับอากาศ |
| 3.2.1 | 1 | แผนติดตั้งโซล่าร์เซล + ระบบแสงสว่างประหยัดพลังงาน |
| 3.2.2 | 1 | เก็บข้อมูลการใช้พลังงาน/ทรัพยากรรายเดือน + วิเคราะห์ (น้ำ/ไฟฟ้า/น้ำมัน/กระดาษ) |
| 3.1.2 | 1 | รายงานผลการใช้พลังงาน/ทรัพยากรให้ผู้เกี่ยวข้องทราบ |
| 3.4.1 | 1 | การประชุมและการจัดนิทรรศการ (green meetings) |
| 3.2.4 / 3.2.5 / 3.3.x / 3.4.2 | 0 | No standalone FY2569 plan activity by meaning |

Mapping is reproducibly applied by `scripts/generate-action-plan-2569.mjs`; the binary Excel is not edited (not safely reproducible — canonical code lives in generated JSON + docs). Validator `validateActionPlanCat3Canonical` + tests enforce the frozen counts. **No new activities and no FY2569 facts are added.**

## 5. C5 pages / components (presentation)

- `src/utils/category3-presentation.ts` — management cycle **Measure → Monitor → Compare target → Analyze → Improve**, domain snapshots (targets/measures/data/compliance/meetings), cycle-stage anchors, journeys, MEDIUM (3.2.2) flag.
- `src/components/categories/Cat3ManagementCycle.astro` — compact 5-stage operational loop on `/categories/cat3/` (TH + EN), restrained single-accent hierarchy.
- `src/components/categories/Cat3DomainSnapshot.astro` — FY2568 verified-fact cards per issue (3.1–3.4) + target-fact row, labeled coverage context (never a score).
- `src/components/indicators/Cat3ContractContext.astro` — per-indicator FY2568 contract context with cycle-stage badge, honest per-indicator limitation note, FY2569 "awaiting verified data" panel, and the full source-limitations disclosure.
- `src/components/indicators/Cat3SourceDocuments.astro` — "เอกสารต้นฉบับสำหรับการตรวจสอบ" per issue group (3.1–3.4), filtered to the C1-approved manifest file set (near-duplicates and PDF exports excluded; issue-report DOCX included).
- Wiring: `src/pages/categories/[id].astro` + `src/pages/en/categories/[id].astro` (`category.code === 'cat3'`), `src/components/indicators/IndicatorTraceabilityExperience.astro` (cat3 canonical blocks; cat3 excluded from the legacy category-evidence fallback).
- Category page note updated to reflect reconciled state (all-15 covered + limitations, TH/EN).

## 6. Evidence & data integration (C2–C4)

- C2 canonical contracts: `src/data/category3/{targets,measures,data,compliance,meetings}.json` + `category3-manifest.json` (frozen FY2568; `sourceLimitations` declared; `missingIndicators` empty).
- C3: **17 indicator-level + 2 category-level** Cat3 entries in `evidence-index.json` (all 15 codes covered); contracts `evidenceIds` reconcile exactly (path/hash/indicator/availability/status); validator enforces id/path/hash/indicator equality.
- C3 legacy reconciliation: `ev-energy-audit-2025`, `ev-energy-led-project`, `ev-waste-audit-2025` marked **superseded**; off-manifest operational-workbook claims `ev-energy-metering-2025`, `ev-water-meter-q1`, `ev-transport-fleet-2025` **downgraded to category-level** (`realSourceAvailable:false`, no false indicator claim) with `supersededBy` pointers. Stale cat2 water placeholders (`ev-water-audit-2025`, `ev-water-conservation`) left untouched (cat2 records, not Cat3).
- C6: search index regenerated deterministically (**204 items**, no drift); knowledge practices (`energy-smart`, `water-wise`, `paper-smart`, `green-mobility`, `green-meeting`) already link all 15 cat3 indicators — reused as-is.

## 7. Validation

| Gate | Result |
|---|---|
| `npm run check` | PASS — 0 errors |
| `node scripts/validate-category3-contracts.mjs` | PASS (5 domains, 15/15 indicators in contracts) |
| `node scripts/validate-evidence.mjs` | PASS (64 items) |
| `node scripts/validate-search-index.mjs` | PASS (204 items) |
| `node scripts/validate-action-plan-2569.mjs` | PASS (cat3 canonical frozen counts) |
| `node scripts/validate-evidence-links.mjs` | PASS |
| `npm test` | see report (Cat3 suites green: `test-category3-fy2568.mjs` + `test-category3-presentation.ts`) |
| `npm run build` | see report |
| `npm run validate` | see report |
| `git diff --check` | see report |
| Runtime smoke TH + EN cat3 category + 15 indicator pages | see report |

## 8. Known limitations

- All FY2568 evidence entries are `verification.status: pending` (C1 content verification done for text files; human/PO sign-off still required).
- Source limitations S1–S8 above remain OPEN as data-owner/PO items (no fabrication of OCR, signature, approval, score, or FY2569 data).
- FY2569 Cat3 remains "รอการอัปเดต / Awaiting update" — no FY2569 overlay created (none verified; the action plan holds only unexecuted planned activities with `actualMonths: []`).

## 9. Related documents

- `docs/GOFFICE2026_CATEGORY3_RESOURCE_BLUEPRINT_V1.md`
- `docs/data/GO-CAT3-PHASE-A-SOURCE-DISPOSITION.md`
- `src/data/category3/` contracts + `scripts/validate-category3-contracts.mjs`
- `docs/GOFFICE2026_CATEGORY1_PLAYBOOK_FOR_CATEGORIES_2-7.md`
- `docs/GOFFICE2026_CATEGORY2_COMMUNICATION_BLUEPRINT_V1.md`
