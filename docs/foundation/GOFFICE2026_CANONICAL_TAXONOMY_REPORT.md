# Green Office 2569 Canonical Taxonomy Report

**Date:** 2026-07-15  
**Last updated:** 2026-07-15 (final weight correction)  
**Round:** 1 — Final Weight Reconciliation  
**Base Contract:** `docs/foundation/GOFFICE2026_ROUND1_CONTRACTS.md`

---

## 1. Deliverables

| File | Status |
|------|--------|
| `src/data/criteria/categories.json` | Created and reconciled against official PDF |
| `src/data/criteria/issues.json` | Created |
| `src/data/criteria/indicators.json` | Created and reconciled (72→65) |
| `scripts/validate-criteria.mjs` | Created and updated (official scoring model) |
| `docs/foundation/GOFFICE2026_CANONICAL_TAXONOMY_REPORT.md` | This file |

---

## 2. Validation Result

```
=== CRITERIA VALIDATION REPORT ===

Categories: 7
Issues: 24
Indicators: 65

Official Category Weights:
  cat1: 25 PASS
  cat2: 15 PASS
  cat3: 15 PASS
  cat4: 15 PASS
  cat5: 15 PASS
  cat6: 15 PASS

Category 7:
  separate assessment
  7.1: 40
  7.2: 60

RESULT: PASS ✓
```

All structural checks passed:
- 7/24/65 hard counts maintained
- All issue `categoryCode` values valid
- All indicator `issueCode`, `categoryCode`, `categoryId` values valid
- No duplicate codes or IDs
- All `title.th`, `title.en`, `requirementSummary.th`, `requirementSummary.en` present
- All `relatedDashboards` arrays contain only valid values
- Exact official weights validated for Categories 1–6: cat1=25, cat2=15, cat3=15, cat4=15, cat5=15, cat6=15
- Category 7 separate assessment with internal 40/60 weighting
- **Indicator count is exactly 65** (mandatory hard requirement)

---

## 3. Taxonomy Counts

### Categories (7) — Official 2569 Titles

| Code | Thai Title (Official) | English Title | Weight | Issues | Indicators |
|------|----------------------|---------------|--------|--------|-------------|
| cat1 | การกำหนดนโยบาย การวางแผนการดำเนินงานสำนักงานสีเขียว | Environmental Policy and Green Office Planning | 25 | 7 | 18 |
| cat2 | การสื่อสารและสร้างจิตสำนึก | Communication and Awareness Cultivation | 15 | 2 | 6 |
| cat3 | การใช้ทรัพยากรและพลังงาน | Resource and Energy Utilization | 15 | 4 | 15 |
| cat4 | การจัดการของเสีย | Waste Management | 15 | 2 | 5 |
| cat5 | สภาพแวดล้อมและความปลอดภัย | Environment and Safety | 15 | 5 | 13 |
| cat6 | การจัดซื้อและจัดจ้าง | Procurement and Hiring | 15 | 2 | 6 |
| cat7 | การดำเนินงานสำนักงานสีเขียวเพื่อความต่อเนื่อง | Green Office Operations for Continuity | — | 2 | 2 |

**Main assessment (Categories 1–6):** 7 + 2 + 4 + 2 + 5 + 2 = **22 issues**, 18 + 6 + 15 + 5 + 13 + 6 = **63 indicators**

**Continuity assessment (Category 7):** 2 issues, 2 indicators (renewal/upgrade only)

**Totals:** 7 categories · 24 issues · **65 indicators**

### Indicators by Issue

| Cat | Issue | Indicators | Count |
|-----|-------|-----------|-------|
| 1 | 1.1 การกำหนดแนวทางการดำเนินงานสำนักงานสีเขียว | 1.1.1–1.1.4 | 4 |
| 1 | 1.2 คณะทำงานด้านสิ่งแวดล้อม | 1.2.1–1.2.2 | 2 |
| 1 | 1.3 การระบุประเด็นปัญหาทรัพยากรและสิ่งแวดล้อม | 1.3.1–1.3.3 | 3 |
| 1 | 1.4 กฎหมายและข้อกำหนดอื่นๆ ที่เกี่ยวข้อง | 1.4.1–1.4.2 | 2 |
| 1 | 1.5 ข้อมูลก๊าซเรือนกระจก | 1.5.1–1.5.3 | 3 |
| 1 | 1.6 แผนการดำเนินงานและโครงการลดก๊าซเรือนกระจก | 1.6.1–1.6.2 | 2 |
| 1 | 1.7 การทบทวนฝ่ายบริหาร | 1.7.1–1.7.2 | 2 |
| 2 | 2.1 การอบรมให้ความรู้และประเมินความเข้าใจ | 2.1.1–2.1.2 | 2 |
| 2 | 2.2 การรณรงค์และประชาสัมพันธ์แก่บุคลากร | 2.2.1–2.2.4 | 4 |
| 3 | 3.1 การใช้น้ำ | 3.1.1–3.1.3 | 3 |
| 3 | 3.2 การใช้พลังงาน | 3.2.1–3.2.5 | 5 |
| 3 | 3.3 การใช้ทรัพยากรอื่นๆ | 3.3.1–3.3.5 | 5 |
| 3 | 3.4 การประชุมและการจัดนิทรรศการ | 3.4.1–3.4.2 | 2 |
| 4 | 4.1 การจัดการขยะ | 4.1.1–4.1.3 | 3 |
| 4 | 4.2 การจัดการน้ำเสีย | 4.2.1–4.2.2 | 2 |
| 5 | 5.1 อากาศในสำนักงาน | 5.1.1–5.1.3 | 3 |
| 5 | 5.2 แสงในสำนักงาน | 5.2.1 | 1 |
| 5 | 5.3 เสียง | 5.3.1–5.3.2 | 2 |
| 5 | 5.4 ความน่าอยู่ | 5.4.1–5.4.4 | 4 |
| 5 | 5.5 การเตรียมพร้อมต่อสภาวะฉุกเฉิน | 5.5.1–5.5.3 | 3 |
| 6 | 6.1 การจัดซื้อสินค้า | 6.1.1–6.1.3 | 3 |
| 6 | 6.2 การจัดจ้าง | 6.2.1–6.2.3 | 3 |
| 7 | 7.1 การตรวจประเมินฯ เพื่อการปรับปรุงอย่างต่อเนื่อง | 7.1 | 1 |
| 7 | 7.2 การพัฒนาหรือต่อยอดการดำเนินงาน | 7.2 | 1 |

---

## 4. Reconciliation: Title Corrections Against Official PDF

Three category Thai titles were verified against the official Green Office 2569 PDF and corrected.

| Category | Previous Title | Official Title | Corrected |
|----------|---------------|----------------|-----------|
| cat2 | การสื่อสารและสร้างความรู้ความตระหนัก | **การสื่อสารและสร้างจิตสำนึก** | ✅ |
| cat6 | การจัดซื้อจัดจ้างที่เป็นมิตรกับสิ่งแวดล้อม | **การจัดซื้อและจัดจ้าง** | ✅ |
| cat7 | การพัฒนาและต่อยอดสำนักงานสีเขียว | **การดำเนินงานสำนักงานสีเขียวเพื่อความต่อเนื่อง** | ✅ |

### English Title Adjustments

To align with the corrected official Thai titles:

| Category | Previous English | Corrected English |
|----------|-----------------|-------------------|
| cat2 | Communication and Awareness Building | **Communication and Awareness Cultivation** |
| cat6 | Green Procurement | **Procurement and Hiring** |
| cat7 | Green Office Continuity and Development | **Green Office Operations for Continuity** |

---

## 5. Reconciliation: 72 → 65 Indicators

### Problem Statement

Worker A's initial taxonomy produced 72 indicators. The frozen Round 1 contract and the official Green Office 2569 criteria for renewal/upgrade require exactly **65 indicators**. The 7 extra records were incorrectly classified as canonical indicators.

### Root Cause

Category 7 (การดำเนินงานสำนักงานสีเขียวเพื่อความต่อเนื่อง) in the official criteria has only 2 canonical indicators — one per issue — not sub-item breakdowns. The source material lists sub-items under each issue that are **scoring sub-criteria**, not independent indicators.

### Reconciliation Table

| Removed/Moved Record | Previously Treated As | Correct Classification | Reason |
|----------------------|----------------------|-----------------------|--------|
| 7.1.1 การแต่งตั้งคณะกรรมการตรวจประเมินภายใน | Canonical indicator | Scoring sub-criteria under indicator 7.1 | Section 7.1 is a single indicator covering all internal audit requirements |
| 7.1.2 การกำหนดความถี่ในการตรวจประเมิน | Canonical indicator | Scoring sub-criteria under indicator 7.1 | Same as above |
| 7.1.3 การกำหนดข้อกำหนดในการตรวจประเมิน | Canonical indicator | Scoring sub-criteria under indicator 7.1 | Same as above |
| 7.1.4 คุณสมบัติผู้ตรวจประเมินภายใน | Canonical indicator | Scoring sub-criteria under indicator 7.1 | Same as above |
| 7.1.5 การดำเนินการตรวจประเมินภายในและรายงานผล | Canonical indicator | Scoring sub-criteria under indicator 7.1 | Same as above |
| 7.2.1 การต่อยอดสู่มาตรฐานอื่น | Canonical indicator | Scoring sub-criteria under indicator 7.2 | Section 7.2 is a single indicator covering all advancement activities |
| 7.2.2 การส่งเสริมความรู้ให้หน่วยงานอื่น | Canonical indicator | Scoring sub-criteria under indicator 7.2 | Same as above |
| 7.2.3 การสร้างเครือข่ายและเป็นพี่เลี้ยง | Canonical indicator | Scoring sub-criteria under indicator 7.2 | Same as above |
| 7.2.4 กิจกรรมร่วมกับชุมชน | Canonical indicator | Scoring sub-criteria under indicator 7.2 | Same as above |

**Net change:** Removed 9 sub-items, kept 2 canonical indicators → **-7 net**

### Preserved Data

- All bilingual TH/EN titles and requirement summaries for the 65 canonical indicators
- All 12 dashboard cross-references
- All category weight assignments (Categories 1–6)
- All 7 category and 24 issue structures remain unchanged
- The 9 sub-item texts are available in the official 2569 criteria reference for future scoring/rubric implementation

---

## 6. Official Scoring Model

### Main Assessment (Categories 1–6)

Categories 1–6 are assessed with the following official weights. These weights represent the distribution of assessment focus across the six main categories.

| Category | Official Weight |
|----------|----------------|
| 1 — การกำหนดนโยบาย การวางแผนการดำเนินงานสำนักงานสีเขียว | 25 |
| 2 — การสื่อสารและสร้างจิตสำนึก | 15 |
| 3 — การใช้ทรัพยากรและพลังงาน | 15 |
| 4 — การจัดการของเสีย | 15 |
| 5 — สภาพแวดล้อมและความปลอดภัย | 15 |
| 6 — การจัดซื้อและจัดจ้าง | 15 |
| **Categories 1–6 total** | Not summed (Category 7 is separate) |

### Continuity Assessment (Category 7) — Separate Structure

Category 7 is **not part of the main 100-point assessment**. It is a separate continuity assessment structure that applies only to organizations applying for **renewal or upgrade certification**.

Per the official Green Office 2569 criteria (Section D of Master Reference):

> **หมวด 7: การดำเนินงานสำนักงานสีเขียวเพื่อความต่อเนื่อง (สำหรับหน่วยงานขอต่ออายุและขอยกระดับการรับรอง)**
> - 7.1 การตรวจประเมินสำนักงานสีเขียวเพื่อให้เกิดการปรับปรุงอย่างต่อเนื่อง (ร้อยละ 40)
> - 7.2 การพัฒนาหรือต่อยอดการดำเนินงานสำนักงานสีเขียว (ร้อยละ 60)

Category 7 has its own internal scoring distribution:

| Issue | Internal Weight |
|-------|----------------|
| 7.1 ตรวจประเมินฯ เพื่อการปรับปรุงอย่างต่อเนื่อง | 40% |
| 7.2 พัฒนาหรือต่อยอดการดำเนินงาน | 60% |
| **Category 7 total** | **100%** |

### Implementation in categories.json

```json
{
  "id": "7",
  "code": "cat7",
  "weight": null,
  "scoringModel": {
    "type": "separate",
    "description": "Category 7 is assessed independently from Categories 1–6. It applies only to renewal or upgrade certification.",
    "internalWeighting": {
      "7.1": 40,
      "7.2": 60
    }
  }
}
```

### Validator Enforcement

The validator enforces exact official weights for Categories 1–6 (cat1=25, cat2=15, cat3=15, cat4=15, cat5=15, cat6=15) and validates Category 7 has `weight: null` with a properly structured `scoringModel` and `internalWeighting` of 40/60. No artificial sum-to-100 rule is applied.

---

## 7. Dashboard Cross-References

| Dashboard | Indicators Tagged |
|-----------|-------------------|
| `ghg` | 1.5.1, 1.5.2, 1.5.3, 1.6.1, 1.6.2 (5 indicators) |
| `water` | 3.1.2 (1 indicator) |
| `energy` | 3.2.2 (1 indicator) |
| `fuel` | 3.2.4, 3.2.5 (2 indicators) |
| `paper` | 3.3.2 (1 indicator) |
| `waste` | 4.1.2, 4.1.3 (2 indicators) |

Total dashboard-tagged indicators: 12

---

## 8. Certification vs Performance Dimensions

The canonical certification taxonomy (7 categories, 24 issues, 65 indicators) is a **separate system** from the operational performance dashboards (6 metrics: electricity, water, fuel, paper, waste, ghg). They cross-reference through `relatedDashboards` but are not replacements for each other.

| Aspect | Certification Taxonomy | Performance Dimensions |
|--------|----------------------|-----------------------|
| Purpose | Audit / compliance (Green Office 2569) | Operational monitoring |
| Structure | 7 categories → 24 issues → 65 indicators | 6 dashboards (energy, water, fuel, paper, waste, ghg) |
| Scoring | Categories 1–6 = 100% main assessment; Category 7 = separate 100% continuity assessment | N/A (trend analysis) |
| Data source | Official criteria + evidence files | CSV → Generated JSON pipeline |
| Link | Indicators reference dashboards | Dashboards reference indicator IDs |

---

## 9. Data Shape Specification

### categories.json
```
categories[] → {
  id, code,
  title.{th,en},
  summary.{th,en},
  weight (number | null),
  scoringModel? (Category 7 only) → { type, description, internalWeighting }
}
```

### issues.json
```
issues[] → { id, code, categoryCode, categoryId, title.{th,en} }
```

### indicators.json
```
indicators[] → { id, code, categoryCode, categoryId, issueCode, title.{th,en}, requirementSummary.{th,en}, relatedDashboards[] }
```

### Code Patterns
- Category codes: `cat1`–`cat7`
- Issue codes: `issue-{cat}-{issue}` (e.g., `issue-1-3`)
- Indicator codes: dot-separated hierarchy (e.g., `1.1.1`, `3.2.4`)

### Locale Model
- Primary field: `th` (Thai)
- Secondary field: `en` (English)
- All titles, summaries, and requirement summaries are bilingual

---

## 10. Validator Rules (Hard Requirements)

1. Categories === 7 (error if ≠)
2. Issues === 24 (error if ≠)
3. Indicators === 65 (error if ≠ — 64 or 66 both fail)
4. Every issue references valid `categoryCode` + `categoryId`
5. Every indicator references valid `issueCode` + `categoryCode` + `categoryId`
6. All codes and IDs unique per collection
7. All Thai and English title/summary fields present
8. `relatedDashboards` only from canonical set: `energy`, `water`, `fuel`, `paper`, `waste`, `ghg`
9. Specific indicators have mandatory dashboard tags
10. **Official weights**: cat1=25, cat2=15, cat3=15, cat4=15, cat5=15, cat6=15 (exact values); Category 7: `weight: null` + `scoringModel.internalWeighting` of 40/60

---

## 11. Running the Validator

```bash
node scripts/validate-criteria.mjs
```

Exit code: `0` on pass, `1` on failure.
