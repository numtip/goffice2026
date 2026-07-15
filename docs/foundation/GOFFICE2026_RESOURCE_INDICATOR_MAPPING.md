# GOFFICE2026 Resource-Indicator Mapping

**Version:** 1.1.0
**Date:** 2026-07-15 (frozen) / 2026-07-16 (validated)
**Status:** CANONICAL AND VALIDATED
**Reference:** `src/data/resource-indicator-map.json`

---

## 1. Overview

This document explains the mapping between the **6 resource monitoring domains** in the Green Office 2026 dashboard platform and the **Green Office certification indicators** defined in the canonical taxonomy (`src/data/criteria/indicators.json`).

Every mapped indicator code has been verified against the canonical taxonomy for existence, exact title, parent issue, parent category, and `relatedDashboards` relationship. No mapping is based on code-number similarity alone.

The mapping supports a **dashboard → indicator → evidence** traceability chain, but it does not guarantee that evidence currently exists at the indicator level. All evidence is currently at the **category** traceability level with `verification.status: "unresolved"`.

**Terminology note:** Where baseline data values are quoted in this document (e.g., "SYSTEM-VALIDATED BASELINE: 8,337.5 m³/ปี"), the status refers to automated system validation only — source workbook identified, extraction path recorded, generated JSON validated, and SHA-256 frozen. It does NOT imply human data-owner sign-off or certification auditor approval. See `GOFFICE2026_BASELINE_FREEZE.md` for the full verification terminology.

---

## 2. Mapping Summary

| # | Resource Domain | Dashboard ID | Unit | Primary Category | Mapped Indicators |
|---|----------------|-------------|------|-----------------|-------------------|
| 1 | Water Consumption | `water` | m³ | cat3 | 3.1.2 |
| 2 | Electricity Consumption | `energy` | kWh | cat3 | 3.2.2 |
| 3 | Fuel Consumption | `fuel` | L | cat3 | 3.2.5, 3.2.4 |
| 4 | Paper Consumption | `paper` | kg | cat3 | 3.3.2 |
| 5 | Waste Management | `waste` | % (recycling) | cat4 | 4.1.2, 4.1.3 |
| 6 | GHG Emissions | `ghg` | tCO₂e | cat1 | 1.5.1, 1.5.2, 1.6.1 |

**Total:** 6 resource domains mapped to 10 indicators across 3 certification categories.

## 3. Detailed Mappings

### 3.1 Water → 3.1.2

- **Indicator 3.1.2**: "มีการจัดทำข้อมูลการใช้น้ำต่อหน่วยเปรียบเทียบกับเป้าหมาย และวิเคราะห์ผล" (cat3, issue: 3.1 การใช้น้ำ)
- Requires compilation of water consumption data per unit compared with targets and analysis of results
- The `water` dashboard tracks monthly water usage extracted from `docs/1.1-Water.xlsx` (SYSTEM-VALIDATED BASELINE: 8,337.5 m³/ปี)
- `relatedDashboards: ["water"]` confirms canonical linkage

### 3.2 Energy → 3.2.2

- **Indicator 3.2.2**: "มีการจัดทำข้อมูลการใช้ไฟฟ้าต่อหน่วยเปรียบเทียบกับเป้าหมาย และวิเคราะห์ผล" (cat3, issue: 3.2 การใช้พลังงาน)
- Requires compilation of electricity consumption data per unit compared with targets and analysis of results
- The `energy` dashboard tracks monthly electricity usage from `docs/1.2-elect.xlsx` (SYSTEM-VALIDATED BASELINE: 403,036.8 kWh/ปี)
- `relatedDashboards: ["energy"]` confirms canonical linkage

### 3.3 Fuel → 3.2.5 + 3.2.4

- **Indicator 3.2.5**: "มีการจัดทำข้อมูลการใช้น้ำมันเชื้อเพลิงต่อระยะทางเปรียบเทียบกับเป้าหมาย และวิเคราะห์ผล" (cat3, issue: 3.2 การใช้พลังงาน)
  - Requires fuel consumption data per distance compared with targets and analysis
  - `relatedDashboards: ["fuel"]` confirms canonical linkage
- **Indicator 3.2.4**: "มาตรการหรือแนวทางการใช้น้ำมันเชื้อเพลิงในการเดินทางที่เหมาะสมกับสำนักงาน" (cat3, issue: 3.2 การใช้พลังงาน)
  - Evaluates fuel conservation measures for office-related travel
  - `relatedDashboards: ["fuel"]` confirms canonical linkage
- The `fuel` dashboard tracks fleet fuel usage from `docs/1.3_Gassolene.xlsx` (SYSTEM-VALIDATED BASELINE: 339.83 L/ปี)
- Note: Fuel baseline has 6 months with zero values (Jul–Dec). Human review is required.

### 3.4 Paper → 3.3.2

- **Indicator 3.3.2**: "มีการจัดทำข้อมูลการใช้กระดาษต่อหน่วยเปรียบเทียบกับเป้าหมาย และวิเคราะห์ผล" (cat3, issue: 3.3 การใช้ทรัพยากรอื่นๆ)
- Requires compilation of paper consumption data per unit compared with targets and analysis
- The `paper` dashboard tracks monthly usage from `docs/1.4_Paper.xlsx` (SYSTEM-VALIDATED BASELINE: 2,197.8 kg/ปี)
- `relatedDashboards: ["paper"]` confirms canonical linkage

### 3.5 Waste → 4.1.2 + 4.1.3

- **Indicator 4.1.2**: "มีการดำเนินงานตามแนวทางการคัดแยก รวบรวม และกำจัดขยะอย่างเหมาะสม" (cat4, issue: 4.1 การจัดการขยะ)
  - Evaluates implementation of waste sorting, collection, and disposal
  - `relatedDashboards: ["waste"]` confirms canonical linkage
- **Indicator 4.1.3**: "การนำขยะกลับมาใช้ประโยชน์ หรือนำกลับมาใช้ใหม่ ส่งผลให้ขยะที่จะส่งไปกำจัดมีปริมาณน้อยลง" (cat4, issue: 4.1 การจัดการขยะ)
  - Measures waste reuse/recycling resulting in reduced waste sent for disposal
  - `relatedDashboards: ["waste"]` confirms canonical linkage
- The `waste` dashboard tracks recycling rates from `docs/1.5_Waste.xlsx` (SYSTEM-VALIDATED BASELINE: ~21.57% avg recycling rate)

### 3.6 GHG → 1.5.1 + 1.5.2 + 1.6.1

- **Indicator 1.5.1**: "การเก็บข้อมูลก๊าซเรือนกระจกจากกิจกรรมในสำนักงาน" (cat1, issue: 1.5 ข้อมูลก๊าซเรือนกระจก)
  - Requires collection of GHG data from office activities
  - `relatedDashboards: ["ghg"]` confirms canonical linkage
- **Indicator 1.5.2**: "ปริมาณก๊าซเรือนกระจกบรรลุเป้าหมาย สรุปและการวิเคราะห์ผล" (cat1, issue: 1.5 ข้อมูลก๊าซเรือนกระจก)
  - Evaluates whether GHG emissions meet targets, with summary and analysis
  - `relatedDashboards: ["ghg"]` confirms canonical linkage
- **Indicator 1.6.1**: "จัดทำแผนการดำเนินงานขับเคลื่อนสู่การลดก๊าซเรือนกระจกของหน่วยงาน" (cat1, issue: 1.6 แผนการดำเนินงานและโครงการเพื่อมุ่งสู่การลดก๊าซเรือนกระจก)
  - Requires a GHG reduction action plan
  - `relatedDashboards: ["ghg"]` confirms canonical linkage
- The `ghg` dashboard tracks emissions from `docs/1.6_GreenhouseGas.xlsx` (SYSTEM-VALIDATED BASELINE: 231.60 tCO₂e/ปี)

---

## 4. Dashboard → Indicator → Evidence Chain

```
Resource Monitoring (Dashboard)
  → Resource Data (src/data/generated/{metric}.json — SYSTEM-VALIDATED BASELINE)
    → Certification Indicator (canonical code — relatedDashboards verified)
      → Evidence Files (src/data/evidence-index.json — category-level, unresolved)
```

**Existing related source/evidence candidates (Energy → 3.2.2):**

Three evidence records exist in `evidence-index.json`. They are **not** currently a valid exact evidence chain for Indicator 3.2.2, and they must not be presented as such. The issues are:

- **Category mismatch:** Indicator 3.2.2 belongs to **cat3** (การใช้ทรัพยากรและพลังงาน), but the existing evidence records are linked to **cat1** (การกำหนดนโยบาย การวางแผนการดำเนินงานสำนักงานสีเขียว). This taxonomy misalignment means the records have never been evaluated for the correct category context.
- **Traceability level:** All three records remain at `traceabilityLevel: "category"`, `verification.status: "unresolved"` — none are at exact indicator-level traceability.
- **Human review required:** Proper evidence alignment to Indicator 3.2.2 requires human review to assess content relevance, confirm the correct category association in `categoryCodes`, and potentially raise traceability to the indicator level.

The existing records are:

   - `ev-energy-metering-2025` — SYSTEM-VALIDATED source-backed (linked to `docs/1.2-elect.xlsx`)
   - `ev-energy-audit-2025` — placeholder (no real source file)
   - `ev-energy-led-project` — placeholder (no real source file)

**Summary:** These records are category-level evidence candidates in cat1. Before any can be claimed as Indicator 3.2.2 evidence, a human reviewer must: (1) confirm content relevance to 3.2.2's requirement, (2) update `categoryCodes` to include cat3 where appropriate, and (3) approve a traceability upgrade if warranted. Until then, they are **related candidates only**, not exact indicator evidence.

---

## 5. Category Alignment

| Category | Code | Label | Mapped Resources |
|----------|------|-------|-----------------|
| การใช้ทรัพยากรและพลังงาน | cat3 | Resource and Energy Utilization | Water, Energy, Fuel, Paper |
| การจัดการของเสีย | cat4 | Waste Management | Waste |
| การกำหนดนโยบาย การวางแผนการดำเนินงานสำนักงานสีเขียว | cat1 | Environmental Policy and Green Office Planning | GHG |

Categories cat2 (Communication), cat5 (Environment & Safety), cat6 (Procurement), cat7 (Continuity) are not directly linked to resource monitoring dashboards but connect through evidence relationships and assessment indicators.

---

## 6. Governance

- This mapping is **validated** against canonical taxonomy as of 2026-07-16
- Every mapped indicator code exists in `indicators.json`
- Every `relatedDashboards` relationship is confirmed
- Changes require explicit governance process
- The canonical taxonomy remains the authoritative source for indicator definitions
- This mapping is a **supplement** — it does not modify the canonical taxonomy

---

## 7. Evidence Claim Policy

- Category-level evidence (`traceabilityLevel: "category"`) is NOT indicator-level traceability
- All 21 evidence records currently have `verification.status: "unresolved"`
- Dashboard → indicator mapping is structural, not evidential
- Indicator-level evidence requires human review and explicit approval (see `docs/evidence/GOFFICE2026_EVIDENCE_REVIEW_QUEUE.md`)

---

## 8. Related Documents

- `docs/foundation/GOFFICE2026_BASELINE_FREEZE.md` — baseline freeze declaration
- `src/data/resource-indicator-map.json` — machine-readable mapping (v1.1.0)
- `src/data/criteria/indicators.json` — canonical indicator definitions (7/24/65)
- `scripts/validate-resource-indicator-map.mjs` — automated validator
- `docs/evidence/GOFFICE2026_EVIDENCE_REVIEW_QUEUE.md` — human review queue
