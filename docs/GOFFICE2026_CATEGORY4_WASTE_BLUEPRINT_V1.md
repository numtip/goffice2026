# GOFFICE2026 — Category 4 Waste Blueprint V1.0

**Document Type:** Category Blueprint (C1-frozen baseline for Cat4 implementation)
**Version:** 1.0
**Status:** ACTIVE — C1 decision freeze (2026-08-23); Phase C gates C2–C7 pending
**Date:** 2026-08-23 (Asia/Bangkok)
**Repository HEAD baseline:** `15b60b42358c3d7d3cc0ff0dd5c29a8a7dc0e4a9` (= origin/master, Cat3 baseline merged)
**Parent authority:**
- `docs/00-GREENOFFICE_PROJECT_CONSTITUTION.MD`
- `docs/GREENOFFICE2026_PLATFORM_BLUEPRINT_V5.md`
- `docs/GOFFICE2026_CATEGORY1_PLAYBOOK_FOR_CATEGORIES_2-7.md`
- `docs/GOFFICE2026_CATEGORY3_RESOURCE_BLUEPRINT_V1.md` (format template)
- `docs/data/GO-CAT4-PHASE-A-SOURCE-DISPOSITION.md` (C1 decisions — this blueprint's authority)

**Scope:** Category 4 = หมวดที่ 4 การจัดการของเสีย / Waste Management (weight 15%). C1-only frozen blueprint — **no runtime/data implementation in this phase**.

---

## 1. Authority & Scope

| Item | Value |
|---|---|
| Category | 4 — การจัดการของเสีย / Waste Management |
| Weight | 15% |
| Issues | 2 (4.1 การจัดการขยะ · 4.2 การจัดการน้ำเสีย) |
| Indicators | 5 (4.1.1, 4.1.2, 4.1.3, 4.2.1, 4.2.2) |
| FY2568 baseline | 44 physical source files; `desktop.ini` excluded as non-evidence → **43 evidence-candidate files**; **28 published manifest docs (frozen)** + 14 non-published drafts/references (see disposition §6) |
| FY2569 layer | Not yet present — cat4 category page shows "รอการอัปเดต / Awaiting update" until verified sources arrive |
| Boundary | Static-first (JSON contracts, manifest + sha256); no DB/API/backend; evidence governed by GitHub public publication |

Official criteria verified against `src/data/criteria/indicators.json` cat4 block (5 indicators, faithful canonical representation — no re-title work needed). Each indicator was **independently verified against actual source content in C1** (all 5 confirmed present; honest caveats per §4).

---

## 2. Domain Model

> **Plan → Sort/Collect/Dispose → Reuse/Recycle → Wastewater Control → Care/Maintain**

| Stage | Meaning | Canonical indicators |
|---|---|---|
| **Plan** | Waste management measures + awareness + participation + zero-waste target | 4.1.1 |
| **Sort/Collect/Dispose** | Bin layout, labeling, holding points, random checks, contractor routing, no burning | 4.1.2 |
| **Reuse/Recycle** | Monthly waste data, target analysis, reuse/compost/3Rs, disposal-trend | 4.1.3 |
| **Wastewater Control** | Grease traps, all-point treatment, effluent quality vs legal standard | 4.2.1 |
| **Care/Maintain** | Weekly skimming, grease/waste handling, repair, leak inspection | 4.2.2 |

### Canonical entity / relationship model

```text
Entity                         ↔ Indicators        ↔ Repo assets (proposed)
──────────────────────────────────────────────────────────────────────────────
WasteMeasures (2568)            4.1.1               (contract: measures.json)
WasteTargets (2568)             4.1.1/4.1.3         (target: −3% general waste vs 2567)
WasteSorting/Disposal           4.1.2               (contract: sorting.json)
WasteData monthly               4.1.3               (dashboard waste + generated/waste.json)
WasteReuse/Compost              4.1.3               (contract: reuse.json)
WastewaterControl               4.2.1               (contract: wastewater.json)
WastewaterCare                  4.2.2               (contract: treatment-care.json)
Cat4 Annual Report              category-level       (manifest ANNUAL_REPORT)
```

Rules:
- **One canonical contract file per domain**, many views; no duplicate registries.
- **One-source rule** (Cat1 convention): dashboard KPI values and contract records must share the same numeric source — never hardcode KPI values in components.
- Evidence index carries indicator-level records referencing manifest paths + sha256; document lists always read from `fy2568-publication.json`.

---

## 3. Two Issues / Five Indicators (C1-frozen evidence map)

| Issue | Indicator | FY2568 evidence (content-verified) | Strength |
|---|---|---|---|
| 4.1 การจัดการขยะ / Solid waste | **4.1.1** | Measures: 3Rs/8-item waste plan (standard measures PDF #8 garbled → cross-verified via section PDF), ประกาศเป้าหมาย (scan), ประกาศบริบท/ขอบเขต 9,873 m² (scan), plastic-reduction campaign (txt), annual report | **STRONG** (narrative) |
| | **4.1.2** | Bin layout 4-point + 2 dining areas, color labels 4 types, covered holding point, monthly random checks (2 days/month, form scan), contract # มจ.(กค.) 9/2568 with บริษัทเชียงใหม่เมืองสะอาด, contractor monitoring, no burning | **STRONG** (narrative) |
| | **4.1.3** | Monthly waste data (XLSX form + verified year tables), target analysis 4,380.10 vs 4,307.70 (+1.68% **NOT met**), reuse 31.93% + compost/3Rs innovation activity | **STRONG** (numeric) |
| 4.2 การจัดการน้ำเสีย / Wastewater | **4.2.1** | Grease-trap 2 points + all-point treatment, effluent statistics FY2568 within legal standard (BOD/COD/SS/TDS/pH/Temp/Cl₂), accredited-lab testing | **STRONG** |
| | **4.2.2** | Weekly Friday skimming record (scan), ถังหมักรักษ์โลก disposal, repair/leak-inspection procedures, ทส.1/ทส.2 WTMS references | **STRONG** |

**All 5 indicators have dedicated evidence — no GAP/MISSING at indicator level.** Honest caveats (do not overclaim):

| # | Caveat | Status |
|---|---|---|
| C1 | **4.1.1(3) ปลอดโฟม not implemented in FY2568** — source txt #9 explicitly: "ไม่มีการจัดประกาศ เนื่องจากไม่ได้ทำกิจกรรมรณรงค์ งดการใช้โฟม…แต่ในปี 2569 มีแผนการดำเนินงานลดการใช้โฟม" → presented as **disclosed FY2568 gap** + forward FY2569 plan statement (not verified FY2569 fact). | OPEN — data owner |
| C2 | **4.1.3(3) numeric >50% reuse not met (31.93%)** — claim rests on the innovation/compost branch (compost, 3Rs seedling-planters at ครั้งที่ 12 conference 4–10 พ.ย. 2568). | OPEN — data owner |
| C3 | **4.1.3(4) FY2568 general waste INCREASED +1.68% vs 2567** (4,380.10 vs 4,307.70); the "แนวโน้มลดลง" claim is only valid on the 3-yr window vs 2566 (4,633.10). Present honestly. | OPEN — data owner |
| C4 | **8 unique scan contents across 10 scan path instances** (ประกาศเป้าหมาย 1p, ประกาศบริบท 8p, แบบฟอร์มสุ่มตรวจ 24p, สัญญาจ้าง 1p, แบบบันทึก 2566/2567/2568 12p×3, บันทึกตักคราบ 4p; 10 paths because แบบบันทึก2568 ≡ 4.1.3(1) and บันทึกตักคราบ duplicated under 4.2.1/4.2.2) — `pending` OCR/human verification. | OPEN — data owner |
| C5 | Garbled-text `4.1.1 (1)` measures PDF — text layer broken glyph mapping; verified by cross-reference to section PDF (not OCR). | OPEN — data owner |
| C6 | WTMS แบบ ทส.1/ทส.2 monthly records are **external online evidence** (building.mju.ac.th bID 18845/18846) — link-out vs download decision. | OPEN — data owner |
| C7 | **No signed/approved copy** of the annual report exists in the FY2568 set — historical baseline, no submission claim. | Disclosed |

---

## 4. Verified FY2568 facts and targets (from C1 text extraction — not scores)

| Domain | Target | Actual (FY2568) | Outcome |
|---|---|---|---|
| General waste sent for disposal (4.1.3) | **−3% vs 2567** (ประกาศเป้าหมายสิ่งแวดล้อม 2568) | 4,380.10 kg (**+72.40 kg, +1.68%**) | **NOT met** |
| Total all waste (4.1.3) | — | 6,434.70 kg (ส่งกำจัด 4,380.10 + reuse 1,223.50 + เศษอาหาร 820.70 + เศษกิ่งไม้/ใบไม้ 10.40) | — |
| Reuse incl. food/leaves (4.1.3) | numeric >50% threshold | 2,054.60 kg = **31.93%** | numeric **NOT met** — claimed via innovation/compost branch |
| Trend (4.1.3) | เปรียบเทียบ 3 ปี | 2566: 4,633.10 · 2567: 4,307.70 · 2568: 4,380.10 | down vs 2566 (−253), up vs 2567 (+1.68%) |

FY2566/FY2567/FY2568 annual totals and reuse % are historical FY2568-era facts (from `ปี 2566/2567/2568.pdf` and report tables) — **they are trend context, never FY2569 values.**

Wastewater facts (4.2): building connected to MJU central SBR plant; 2 grease-trap points (floor 1 front/back); weekly Friday skimming by cleaning staff; effluent tested by บริษัทห้องปฏิบัติการกลาง (ประเทศไทย) จำกัด (accredited) and reported within ประกาศกระทรวงทรัพยากรธรรมชาติและสิ่งแวดล้อม 2548 building-discharge standards; FY2568 monthly stats verified in `4.2.1 (1) บันทึกรายละเอียดของสถิติคุณภาพน้ำ ปี 2568.pdf`.

---

## 5. FY2568 → FY2569 Year Model

Mirrors the proven Cat1/Cat2/Cat3 overlay pattern:

| Layer | Source files | Status |
|---|---|---|
| **FY2568 baseline** | `src/data/category4/*.json` (year 2568, `FROZEN_READ_ONLY_BASELINE`) + `fy2568-publication.json` + `baseline-2568.ts` (cat4 = 28) | Frozen; never mutated; never presented as FY2569 |
| **FY2569 overlay** | Separate `src/data/category4/*-2569.json` + presentation (mirror Cat2 `*-2569.json` pattern) | Build **only when verified FY2569 sources exist**; until then cat4 page keeps "รอการอัปเดต" |
| Presentation | FY2569 primary when present, FY2568 baseline in collapsed details | Applied in Phase C journeys |

Rules:
- FY2569 facts must come from verified FY2569 sources. **No verified FY2569 sources exist on disk for cat4.**
- The only FY2569 mention in the FY2568 source set is the **4.1.1(3) forward plan** ("ปี 2569 มีแผนการดำเนินงานลดการใช้โฟม") — record as `FORWARD_REQUIREMENT` statement, **not** a verified FY2569 fact.
- No copying FY2568 values (4,380.10 kg, 31.93%, −3% target, +1.68% outcome) into FY2569 records.
- No invented FY2569 activities.

---

## 6. Evidence Mapping Rules

### 6.1 Mapping design (conceptual — file edits happen in C3)

- **4.1.1** → `4.1/4.1.1.pdf` (canonical narrative), `New/…/4.1.1 (1)` measures (garbled, cross-verified), `4.1.1 (2)` ประกาศเป้าหมาย (scan), `4.1.1 (4)` ประกาศบริบท (scan), `4.1.1 (5)` campaign txt, annual report
- **4.1.2** → `4.1/4.1.2.pdf` (canonical narrative), `4.1.2 (1)–(3),(6),(7)` txt, `4.1.2 (4)` สุ่มตรวจ form (scan), `4.1.2 (5)` สัญญาจ้าง (scan), annual report
- **4.1.3** → `ปี 2566/2567/2568.pdf` (**verified data tables — promote**), `4.1.3 (1)` แบบบันทึก 12p (scan, canonical), `4.1.3 (2)` การวิเคราะห์ (verified), `4.1.3 (3)/(4)` txt, XLSX form 4.1(1), annual report
- **4.2.1** → `4.2/4.2.1.pdf` (canonical narrative), `4.2.1 (1)` สถิติคุณภาพน้ำ (verified), `4.2.1 (1)` บันทึกตักคราบ (scan), `4.2.1 (2)–(4)` txt, annual report
- **4.2.2** → `4.2/4.2.2.pdf` (canonical narrative), `4.2.2 (1),(2),(4)` txt, `4.2.2 (3)` บันทึกตักคราบ (scan, = G2 duplicate), annual report
- **Category reports** → `New/… (10-03-69).docx` (canonical ANNUAL_REPORT) + `10-03-69.pdf` (export) + `02-03-69.docx` (supersededBy)
- **Cross-category** → `docs/1.5_Waste.xlsx` provenance for `waste.json` (same monthly totals as cat4 XLSX `คำนวณ%` sheet)

### 6.2 Evidence truthfulness constraints

1. **Scans are honest**: 8 unique scan contents across 10 scan path instances → `pending` (OCR required); never claim `verified`.
2. **Garbled measures PDF**: `4.1.1 (1)` verified by cross-reference only (content quoted in section PDF); glyph layer pending OCR.
3. **Byte-identical duplicates**: G1 (`แบบบันทึก…2568.pdf` ≡ `4.1.3 (1)`), G2 (`4.2.1 (1)` ≡ `4.2.2 (3)`) — keep one canonical each, mark second `duplicateOf`; manifest's existing double-listing of G2 is an anomaly to clean.
4. **No signed/approved claim**: no signature block exists; report is a historical baseline.
5. **4.1.1(3) gap**: ปลอดโฟม not implemented in FY2568 — disclose, do not fabricate.
6. **4.1.3(3) numeric not met** (>50%): claim via innovation/compost branch only.
7. **Dashboard vs report scope**: monthly-form total 5,625.7 kg (`waste.json`, `คำนวณ%` sheet) vs annual-report total 6,434.70 kg — record both scopes with definitions; reconcile in C2.

### 6.3 Legacy evidence-index entries to reconcile in C3

Inspect existing `evidence-index.json` cat4-tagged entries (if any legacy placeholders like `ev-waste-audit-2025`, `ev-waste-recycling`, etc. exist) and reconcile against the C1 manifest set — same procedure as Cat3 §5.3. **Do not reuse Cat3 waste entries for Cat4 claims** (Cat3's `ev-waste-audit-2025` was a legacy misassociation; Cat4 evidence is its own set).

---

## 7. Dashboard & KPI requirements (C2–C4 scope; not built in C1)

- Waste KPI (4.1.2/4.1.3): FY2568 general waste 4,380.10 kg, reuse 31.93%, target −3% vs 2567 **NOT met**.
- Monthly series: 12-month FY2568 ส่งกำจัด values (370.60 … 331.30) and reuse series from `ปี 2568.pdf` / XLSX — single numeric source rule.
- Wastewater KPI (4.2): no numeric KPI required by criteria (qualitative control indicators); keep to verified-fact presentation.
- `generated/waste.json` currently carries 5,625.7 total (form scope). C2 reconciles scope definition and updates provenance to cat4 form + report.

---

## 8. Blockers (from disposition §7)

B1 ปลอดโฟม gap · B2 >50% reuse branch · B3 +1.68% trend honesty · B4 8 unique scan contents / 10 scan paths pending OCR · B5 garbled measures PDF · B6 WTMS external records · B7 no signed copy · B8 dashboard/report scope reconciliation. Full detail in `docs/data/GO-CAT4-PHASE-A-SOURCE-DISPOSITION.md`.

---

## 9. Phase C acceptance criteria (draft — for architect)

- [ ] C2 contracts `src/data/category4/*.json` + `category4-manifest.json` freeze FY2568 facts from disposition §4 (exact values above).
- [ ] C3 evidence-index cat4 entries reconcile path/hash/indicator; scans `pending`; no fabricated claims.
- [ ] C4 action-plan canonical mapping for cat4 (FY2569 activities from `action-plan-2569.json` — none fabricated).
- [ ] C5 category page + components: FY2568 baseline visible, honest limitation disclosure, FY2569 awaiting-update panel.
- [ ] Validators + tests green; `npm run check`, `npm run build`, runtime QA per constitution.
