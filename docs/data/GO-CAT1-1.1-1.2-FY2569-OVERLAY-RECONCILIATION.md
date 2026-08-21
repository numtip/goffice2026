# GO-CAT1-1.1-1.2 — FY2569 Overlay Reconciliation

**Status:** `CURRENT_YEAR_OVERLAY`  
**Date:** 2026-08-21 (Asia/Bangkok)  
**Scope:** Indicators 1.1.1–1.1.4 and 1.2.1 (Define + Governance) for FY2569  
**Authority:** Signed/approved FY2569 sources in `Data2569/Cat1/`; frozen FY2568 contracts remain the historical baseline

> **Principle:** FY2569 is the current assessment year and is presented as **primary**. FY2568 stays the **frozen historical baseline** — no FY2568 contract was mutated. Overlay records are separate year-qualified files.

---

## 1. Source inventory (Data2569/Cat1)

| File | Size | Role | Canonical for |
|------|------|------|---------------|
| `1.1/1.1.1/1.1.1-บริบทองค์กร2569.pdf` | 7 pp scan | Primary scope announcement | **1.1.1** |
| `1.1/1.1.2/1.1.2-นโยบายสำนักงานสีเขียว 2569.pdf` | 2 pp scan | Primary policy announcement | **1.1.2** |
| `1.1/1.1.3/1.1.3-เป้าหมายสิ่งแวดล้อม 2569.pdf` | 1 p scan | Primary targets announcement | **1.1.3** |
| `1.1/1.1.3/1.1.3-มติที่ประชุมการกำหนดเป้าหมายสิ่งแวดล้อม2569.pdf` | 1 p scan | Steering resolution 1/2569 | 1.1.3 (percentages) |
| `1.1/1.1.4/1.1.4 มีการกำหนดแผนการดำเนินงานสำนักงานสีเขียว2569.xlsx` | Excel | Annual plan workbook (147 activities) | **1.1.4** (+ shared 1.6.1) |
| `1.2/1.2.1/1.2.1-การแต่งตั้งคณะกรรมการGreen2569_.doc` | .doc | Committee appointment order (binary) | **1.2.1** |
| `1.2/1.2.1/05-คกกGreen2569_complete.pdf` | 6 pp scan | Printed order evidence | 1.2.1 |
| `04-แผนการดำเนินงานGreen2569.pdf` | 21 pp scan | Printed plan/evidence copy | 1.1.4 / 1.6.1 |

**Byte-identity check:** `public/documents/about/{scope,policy,goals,committee}/*.pdf` are byte-identical to the FY2569 sources above (SHA-256 match) — the About-hub documents were already the FY2569 files but their metadata was mislabeled FY2568. Provenance corrected in `src/data/about/documents.json` + `document-summaries.json`.

---

## 2. Runtime status (before → after overlay)

| Indicator | FY2568 baseline | FY2569 overlay | Presentation |
|-----------|-----------------|----------------|--------------|
| **1.1.1** | 9,873 m² / 4 orgs (signed by president) | 9,873 m² / 97 personnel / 4 orgs; announcement **5 เม.ย. 2569** signed by RAE Director | FY2569 primary + FY2568 baseline panel |
| **1.1.2** | 10 commitments (review 7 มี.ค. 2568 → 25 มี.ค. 2568, president) | 10 commitments; announcement **1 เม.ย. 2569** signed by RAE Director | FY2569 primary + FY2568 baseline panel |
| **1.1.3** | 6 targets vs FY2567 (−1/−3/−1/−3/−3/−1) | 6 targets vs **FY2568** (−1/−3/−1/−3/−1/−1); announcement 5 เม.ย. 2569 + resolution 1/2569 (5 มี.ค. 2569) | FY2569 primary + FY2568 baseline panel |
| **1.1.4** | proj-plan-1 PDF (image tables) | **Excel workbook** 147 activities / 65 indicators / approved **20 เม.ย. 2569** | FY2569 primary + FY2568 baseline panel |
| **1.2.1** | Order 25 มี.ค. 2568 (president); Cat1+Cat7 combined | Order **31 มี.ค. 2569** signed by RAE Director; advisors + steering (RAE Director chair) + 6 WGs (Cat1+7 combined) | FY2569 primary + FY2568 baseline panel |

---

## 3. 1.1.1 — Scope & context (FY2569)

| Fact | Value | Status |
|------|-------|--------|
| Total assessed scope | **9,873 m²** | ✓ summary table + arithmetic |
| External area | 1,934 m² (จอดรถ 1,300 + สวน 180 + จุดรวมพล 70 + โรงจอดหน้า/ข้าง 192+192) | ✓ |
| Floor 1 / 2 / 3 | 3,075 / 2,726 / 2,138 m² | ✓ |
| Rooms | 138 total (54/33/51) | ✓ summary table |
| Personnel | **97** (F1 33 + F2 14 + F3 50) | ✓ |
| Organizations | 4 (RAE 53, IQS 31, ICAP 8, rice 5) + ส่วนกลาง room 541 | ✓ (prose "5 หน่วยงาน" OCR-ambiguous) |
| Announcement | 5 เม.ย. 2569 signed by RAE Director | ✓ |

**Signing-authority change vs FY2568:** FY2568 scope was signed by the University President; FY2569 is signed by the **RAE Director** (Asst.Prof.Dr. Nattapon Laoharodphan). Recorded in overlay contract + journey.

**Room-level registers:** pages 3–7 are OCR-partial; area/personnel/room totals verified from the summary table.

---

## 4. 1.1.2 — Environmental policy (FY2569)

| Fact | Value |
|------|-------|
| Policy statements | **10** (numbered 1–10) |
| Announcement | 1 เม.ย. 2569 — RAE Director |
| Signed by | Asst.Prof.Dr. Nattapon Laoharodphan (RAE Director) |
| Retained from FY2568 | **No** — fresh FY2569 announcement |
| Legal reference | กรมการเปลี่ยนแปลงสภาพภูมิอากาศและสิ่งแวดล้อม (DCCE) |

**1.1.2(4) interview gap:** no FY2569 management-interview record in the provided source set → **PARTIAL** (unchanged).

---

## 5. 1.1.3 — Environmental targets (FY2569)

### Percentages (verified from steering resolution 1/2569, 5 มี.ค. 2569)

| Domain | targetPercent | vs |
|--------|---------------|----|
| Electricity | −1% | FY2568 |
| Fuel | −3% | FY2568 |
| Water | −1% | FY2568 |
| Paper | −3% | FY2568 |
| General waste | **−1%** (FY2568 was −3%) | FY2568 |
| GHG | −1% | FY2568 |

### Absolute values (announcement 5 เม.ย. 2569, OCR-derived)

| Domain | Value | Unit | Note |
|--------|-------|------|------|
| Electricity | 5,252.55 | kWh/person | OCR consistent |
| Fuel | 255.52 | liters | digit-ambiguous (215.52/235.52/255.52) — flagged `ocrNote` |
| Water | 53.30 | m³/person | |
| Paper | 23.13 | kg/person | |
| General waste | 50.00 | kg/person | |
| GHG | 203.15 | kgCO₂e/person | separate metric family from 1.5 |

---

## 6. 1.1.4 — Annual action plan (FY2569)

| Fact | Value |
|------|-------|
| Workbook | `1.1.4 มีการกำหนดแผนการดำเนินงานสำนักงานสีเขียว2569.xlsx` (SHA-256 identical to published copy) |
| Activities | **147** across **7** categories / **65** indicators |
| Approved | 20 เม.ย. 2569 — RAE Director |
| Planned vs actual | separate columns; `/` = planned month |
| Shared with 1.6.1 | Yes (same plan entity, FY2569) |

Plan rows are not treated as completed without evidence; `planTableStatus: 'workbook'`.

---

## 7. 1.2.1 — Committee appointment (FY2569)

| Fact | Value |
|------|-------|
| Written appointment | ✓ order dated 31 มี.ค. 2569 |
| Signed by | RAE Director (Asst.Prof.Dr. Nattapon Laoharodphan) |
| Order number | OCR-ambiguous (possibly ๑๙/๒๕๖๙) — pending .doc verification |
| Structure | ที่ปรึกษา (3) + คณะกรรมการอำนวยการ (RAE Director chair) + 6 category WGs (Cat1+Cat7 combined; Cat2 สื่อสาร; Cat3 ทรัพยากร/พลังงาน; Cat4 ของเสีย; Cat5 สภาพแวดล้อม/ความปลอดภัย; Cat6 จัดซื้อจัดจ้าง) |
| Coverage | 4 orgs / 97 personnel (per 1.1.1 scope table) |

**Structure change vs FY2568:** FY2568 executive steering was chaired by the University Vice President; FY2569 steering is chaired by the **RAE Director** and the order adds an advisors layer.

---

## 8. Cross-indicator reuse

| Link | Evidence |
|------|----------|
| 1.1.1 scope ↔ 1.2.1 coverage | Same 4 orgs / 97 personnel (scope table) |
| 1.1.4 plan ↔ 1.6.1 | Shared FY2569 plan entity |
| 1.1.3 targets ↔ 1.5.2 | Targets vs GHG analysis (FY2569 inventory pending) |

---

## 9. Anomalies / accepted gaps

| ID | Finding |
|----|---------|
| GAP-2569-SIGNER | FY2569 announcements signed by RAE Director (not University President) — intentional, recorded |
| GAP-2569-OCR | Thai numerals in scope/policy/targets PDFs OCR-derived; fuel value digit-ambiguous; human verification required |
| GAP-2569-ORDER-REF | Committee order number OCR-ambiguous (๑๙/๒๕๖๙?) |
| GAP-1.1.2-INTERVIEW | Executive interview not evidenced (FY2569) |
| GAP-1.2.2 | Role-understanding interview evidence MISSING (FY2569 plan lists as planned activity) |
| GAP-1.5.3 | GHG-knowledge training evidence MISSING (FY2569 plan lists as planned activity) |
| GAP-2569-PROSE-ORGS | Scope prose "5 หน่วยงาน" vs 4 named units (+ ส่วนกลาง room) unresolved |
| GAP-2569-ROOMS | Room-level registers OCR-partial |

---

## 10. Files changed

| File | Change |
|------|--------|
| `public/documents/fy2569/cat1/**` | FY2569 source evidence ingested (8 files) |
| `src/data/category1/activities-aspects-2569.json` | NEW — FY2569 scope + policy overlay contract |
| `src/data/category1/targets-2569.json` | NEW — FY2569 targets overlay contract |
| `src/data/category1/projects-2569.json` | NEW — FY2569 plan overlay contract |
| `src/data/category1/environmental-committee-2569.json` | NEW — FY2569 committee overlay contract |
| `src/data/category1/category1-manifest.json` | Added `fy2569Overlay` metadata (FY2568 contracts untouched) |
| `src/utils/category1-fy2569-presentation.ts` | NEW — FY2569 view-models + evidence URLs |
| `src/components/indicators/Cat1ScopeExplorerJourney.astro` | FY2569 primary + FY2568 baseline |
| `src/components/indicators/Cat1PolicyJourney.astro` | FY2569 primary + FY2568 baseline |
| `src/components/indicators/Cat1TargetBoardJourney.astro` | FY2569 primary + FY2568 baseline |
| `src/components/indicators/Cat1AnnualPlanJourney.astro` | FY2569 primary + FY2568 baseline |
| `src/components/indicators/Cat1CommitteeGovernanceJourney.astro` | FY2569 primary + FY2568 baseline |
| `src/components/about/AboutCanonicalFacts.astro` | About hub FY2569 primary + FY2568 baseline |
| `src/data/about/content.json` | About notices FY2569-primary |
| `src/data/about/documents.json` | Provenance corrected to FY2569 (checksum-verified) |
| `src/data/about/document-summaries.json` | Scope/goals/policy/committee summaries corrected |
| `scripts/validate-category1-fy2569.mjs` | NEW — FY2569 contract validator |
| `scripts/test-category1-fy2569-overlay.mjs` | NEW — FY2569 regression suite |
| `scripts/test-category1-presentation.mjs` | Updated journey assertions (FY2569 primary) |
| `package.json` | Registered new test |

**Not changed:** frozen FY2568 contracts, source PDFs/DOCX, VPS/production, Category 2/7.

---

## 11. Validation

```bash
node scripts/validate-category1-contracts.mjs      # FY2568 frozen — PASS
node scripts/validate-category1-fy2569.mjs         # FY2569 overlay — PASS
node scripts/validate-action-plan-2569.mjs         # 147 activities — PASS
npm test && npm run check && npm run build          # all PASS (272 pages)
```

---

## 12. Recommended next phase (after PO approval)

1. **FY2569 evidence intake for 1.3–1.7** when Data2569/Cat1 subfolders mature (1.3/1.4/1.5/1.6/1.7 folders exist in source but were not requested in this batch).
2. **Human OCR verification** of Thai numerals (especially targets fuel value and committee order number).
3. **1.2.2 / 1.5.3 evidence** — plan lists these as planned activities; evidence awaited.

---

**Governance:** `GOFFICE2026_CATEGORY1_MANAGEMENT_BLUEPRINT_V1` §3 Define, §13 Phase D; FY2568 freeze policy (no frozen contract mutated).
