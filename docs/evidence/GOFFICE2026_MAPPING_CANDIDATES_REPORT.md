# GOFFICE2026 — Mapping Candidates Report

**Generated**: 2026-07-16
**Sprint**: Evidence Onboarding
**Worker**: B — Extraction & Candidate Mapping
**Status**: Candidate (not verified)

---

## Summary

| Metric | Count |
|--------|-------|
| Sources inspected | 7 (6 operational spreadsheets + 1 assessment PDF) |
| Candidate mappings total | 13 |
| HIGH confidence | 0 |
| MEDIUM confidence | 7 |
| LOW confidence | 6 |
| Sources requiring human review | 7 |

---

## Confidence Distribution

### HIGH — 0 candidates

No source file contains an explicit canonical indicator code label. The indicator-like codes (`3.2.1`, `3.2.2`, `3.3.1`) found in `EF TGO AR5` were verified as IPCC Volume 2 table references (emission factor source citations), not Green Office indicator codes.

### MEDIUM — 7 candidates (4 primary, 3 secondary)

Sources with strong contextual match: form number + data type + measurement structure clearly map to a specific canonical indicator.

### LOW — 6 candidates

Sources with keyword similarity, indirect relationship, or cross-category applicability.

---

## Candidate Mappings

### 1. Water Usage Spreadsheet

| Field | Value |
|-------|-------|
| **sourceId** | `src-xlsx-water-usage` |
| **File** | `docs/1.1-Water.xlsx` (99 KB) |
| **Sheet names** | 2567, 2568 |
| **Form refs** | 3.2(1) (both sheets) |
| **Year coverage** | 2566 (baseline), 2567, 2568 |
| **Data structure** | Monthly rows (ม.ค.–ธ.ค.); columns: headcount, units (m³), cost (THB), units/person, year-over-year % change |
| **Analysis sections** | รายละเอียด (details), วิเคราะห์สาเหตุ (root cause), แนวทางจัดการ (management approach) per month |
| **Signature fields** | Not found on primary data sheets |

#### Candidate 1a
```json
{
  "sourceId": "src-xlsx-water-usage",
  "candidateIndicatorCodes": ["3.1.1"],
  "confidence": "medium",
  "basis": "Spreadsheet tracks monthly water consumption (units, cost, per-capita) using form 3.2(1). Data structure directly matches indicator 3.1.1 (Water consumption monitoring). PDF criteria (p.28) confirms form 3.1(1) is accepted evidence for water monitoring; form 3.2(1) in this file is a related/adapted form. No explicit canonical code in source.",
  "requiresHumanReview": true
}
```

#### Candidate 1b
```json
{
  "sourceId": "src-xlsx-water-usage",
  "candidateIndicatorCodes": ["3.1.2", "3.1.3"],
  "confidence": "low",
  "basis": "Spreadsheet includes per-month management approach (แนวทางจัดการ) sections discussing water conservation measures and root cause analysis. These sections partially address conservation planning (3.1.2) and conservation results (3.1.3), but the primary function is monitoring, not planning or demonstrated results against explicit targets. Weak evidence for these indicators without additional documentation.",
  "requiresHumanReview": true
}
```

---

### 2. Electricity Usage Spreadsheet

| Field | Value |
|-------|-------|
| **sourceId** | `src-xlsx-elect-usage` |
| **File** | `docs/1.2-elect.xlsx` (92 KB) |
| **Sheet names** | 2567, 2568 |
| **Form refs** | 3.2(1) (both sheets) |
| **Year coverage** | 2566 (baseline), 2567, 2568 |
| **Data structure** | Monthly rows; columns: headcount, kWh consumption, cost (THB), kWh/person, year-over-year change |
| **Analysis sections** | รายละเอียด, วิเคราะห์สาเหตุ, แนวทางจัดการ per month |

#### Candidate 2a
```json
{
  "sourceId": "src-xlsx-elect-usage",
  "candidateIndicatorCodes": ["3.2.1"],
  "confidence": "medium",
  "basis": "Spreadsheet tracks monthly electricity consumption in kWh with cost and per-capita metrics using form 3.2(1). Directly supports indicator 3.2.1 (Energy consumption monitoring). PDF criteria confirms form 3.2(1) is accepted evidence for energy/resource consumption monitoring indicators. No explicit canonical code in source.",
  "requiresHumanReview": true
}
```

#### Candidate 2b
```json
{
  "sourceId": "src-xlsx-elect-usage",
  "candidateIndicatorCodes": ["3.2.2", "3.2.5"],
  "confidence": "low",
  "basis": "Spreadsheet includes year-over-year trend analysis and management action sections discussing energy conservation measures and results. These sections partially address energy management results (3.2.2) and conservation results (3.2.5), but the primary purpose is consumption monitoring. No explicit conservation targets or quantified energy savings against baseline are documented.",
  "requiresHumanReview": true
}
```

---

### 3. Fuel/Gasoline Usage Spreadsheet

| Field | Value |
|-------|-------|
| **sourceId** | `src-xlsx-fuel-usage` |
| **File** | `docs/1.3_Gassolene.xlsx` (249 KB) |
| **Sheet names** | IQS, สำนักวิจัย, 2567, 2568, 2569, บำรุงรักษา, น้ำมันเชื้อเพลิง แยกทะเบียนรถ |
| **Form refs** | 3.2(1) (2567, 2568 sheets), 3.2(2) (2569, IQS, สำนักวิจัย, ทะเบียนรถ sheets) |
| **Year coverage** | 2566–2569 |
| **Data structure** | Monthly aggregated (2567–2569); per-vehicle trip logs (ทะเบียนรถ); per-department (IQS, สำนักวิจัย); maintenance log (บำรุงรักษา) |
| **Signature fields** | Found on บำรุงรักษา sheet: Prepared-by / Approved-by signature lines with date fields (official record indicator) |

#### Candidate 3a
```json
{
  "sourceId": "src-xlsx-fuel-usage",
  "candidateIndicatorCodes": ["3.2.3"],
  "confidence": "medium",
  "basis": "Spreadsheet tracks fuel consumption (diesel, gasoline, gasohol) in liters by vehicle and department, using forms 3.2(1) and 3.2(2). Data includes monthly totals, per-vehicle trip logs (distance km, km/liter efficiency), and department-level breakdown. Directly supports indicator 3.2.3 (Fuel consumption monitoring). Maintenance sheet includes signature/approval fields indicating official record status. No explicit canonical code in source.",
  "requiresHumanReview": true
}
```

#### Candidate 3b
```json
{
  "sourceId": "src-xlsx-fuel-usage",
  "candidateIndicatorCodes": ["3.2.5"],
  "confidence": "low",
  "basis": "Fuel usage sheets include per-month analysis sections discussing conservation measures (e.g., use of online meetings to reduce travel). These partially address energy conservation results (3.2.5), but the spreadsheet lacks explicit reduction targets or quantified conservation outcomes. Weak standalone evidence for this indicator.",
  "requiresHumanReview": true
}
```

---

### 4. Paper Usage Spreadsheet

| Field | Value |
|-------|-------|
| **sourceId** | `src-xlsx-paper-usage` |
| **File** | `docs/1.4_Paper.xlsx` (202 KB) |
| **Sheet names** | Reuse, แต่ละหน่วยงาน, 2567, 2568, 2569 |
| **Form refs** | 3.2(1) (Reuse, 2567, 2568), 3.1(1) (2569) |
| **Year coverage** | 2566–2569 |
| **Data structure** | Monthly consumption in reams (รีม) and kg; per-capita; cost; year-over-year comparison |

#### Candidate 4a
```json
{
  "sourceId": "src-xlsx-paper-usage",
  "candidateIndicatorCodes": ["3.3.1"],
  "confidence": "medium",
  "basis": "Spreadsheet tracks monthly paper consumption (reams, kg, cost, per-capita) using form 3.2(1) across multiple years. Directly supports indicator 3.3.1 (Paper consumption monitoring). Note: 2569 sheet uses form 3.1(1) — may be a different form version or typo. No explicit canonical code in source.",
  "requiresHumanReview": true
}
```

#### Candidate 4b
```json
{
  "sourceId": "src-xlsx-paper-usage",
  "candidateIndicatorCodes": ["3.3.2"],
  "confidence": "low",
  "basis": "Spreadsheet provides year-over-year consumption comparison which could indirectly demonstrate reduction results. No explicit reduction targets, baseline commitment, or quantified conservation outcomes are documented in the spreadsheet. The 'Reuse' sheet label is potentially relevant but its data structure tracks consumption, not reuse activity.",
  "requiresHumanReview": true
}
```

#### Candidate 4c
```json
{
  "sourceId": "src-xlsx-paper-usage",
  "candidateIndicatorCodes": ["3.3.3"],
  "confidence": "low",
  "basis": "Spreadsheet includes a sheet labeled 'Reuse' which could support reuse/waste reduction indicator 3.3.3. However, the actual data columns track paper consumption (ปริมาณการใช้กระดาษ), not reuse/回收 activity. Sheet name and data content are mismatched. Requires human verification of whether reuse tracking exists in non-sampled rows or separate documentation.",
  "requiresHumanReview": true
}
```

---

### 5. Waste Management Spreadsheet

| Field | Value |
|-------|-------|
| **sourceId** | `src-xlsx-waste-mgmt` |
| **File** | `docs/1.5_Waste.xlsx` (43 KB) |
| **Sheet names** | ปริมาณขยะรายเดือน, คำนวณ%, คำนวณ ปริมาณขยะ |
| **Form refs** | 4.1(1) (ปริมาณขยะรายเดือน and คำนวณ ปริมาณขยะ sheets) |
| **Year coverage** | 2566, 2568 |
| **Data structure** | Monthly waste quantity; recycling percentage calculation; waste composition calculation |

#### Candidate 5a
```json
{
  "sourceId": "src-xlsx-waste-mgmt",
  "candidateIndicatorCodes": ["4.1.1"],
  "confidence": "medium",
  "basis": "Spreadsheet tracks monthly waste quantities with form 4.1(1) reference. PDF criteria (p.43) confirms form 4.1(1) is the prescribed evidence form for waste management indicators. Data supports indicator 4.1.1 (Waste segregation) by tracking waste volumes by category. No explicit canonical code in source.",
  "requiresHumanReview": true
}
```

#### Candidate 5b
```json
{
  "sourceId": "src-xlsx-waste-mgmt",
  "candidateIndicatorCodes": ["4.1.2"],
  "confidence": "medium",
  "basis": "Spreadsheet includes recycling calculation sheets (คำนวณ%, คำนวณ ปริมาณขยะ) that compute waste reuse/recycling percentages. These calculations directly support indicator 4.1.2 (Waste reduction results) by quantifying the proportion of waste diverted from disposal. Form 4.1(1) reference aligns with PDF criteria. No explicit canonical code or reduction targets in source.",
  "requiresHumanReview": true
}
```

---

### 6. Greenhouse Gas Calculation Spreadsheet

| Field | Value |
|-------|-------|
| **sourceId** | `src-xlsx-ghg-calculation` |
| **File** | `docs/1.6_GreenhouseGas.xlsx` (516 KB) |
| **Sheet names** | สรุปการคำนวณ ปี 2568, CH4จาก Septic tank 2568, CH4จากบ่อบำบัดไม่เติมอากาศ 2568, สรุปการคำนวณ ปี 2567, CH4จาก Septic tank 2567, CH4จากบ่อบำบัดไม่เติมอากาศ2567, EF TGO AR5 |
| **Form refs** | None found |
| **Year coverage** | 2564–2568 |
| **Data structure** | Scope 1, 2, 3 GHG emissions calculation; emission factors (TGO AR5); monthly activity data; CH4 from septic tanks and wastewater treatment |

#### Candidate 6a
```json
{
  "sourceId": "src-xlsx-ghg-calculation",
  "candidateIndicatorCodes": ["4.2.1"],
  "confidence": "medium",
  "basis": "Spreadsheet performs comprehensive GHG inventory calculation covering Scope 1 (stationary/mobile combustion, septic tanks, wastewater treatment, refrigerants), Scope 2 (purchased electricity), and Scope 3 (paper, water, waste). Uses Thailand Greenhouse Gas Organization (TGO) emission factors (AR5). Directly supports indicator 4.2.1 (GHG inventory) with full calculation methodology. Note: codes 3.2.1, 3.2.2, 3.3.1 found in EF TGO AR5 sheet are IPCC Volume 2 table references, not canonical indicator codes. No explicit canonical code in source.",
  "requiresHumanReview": true
}
```

#### Candidate 6b
```json
{
  "sourceId": "src-xlsx-ghg-calculation",
  "candidateIndicatorCodes": ["4.2.2"],
  "confidence": "low",
  "basis": "Spreadsheet provides annual GHG calculations for 2567 and 2568 which could demonstrate year-over-year reduction results. However, no explicit reduction targets, baseline reference (beyond raw year comparison), or quantified reduction outcomes are documented. The data structure supports calculation rather than reduction demonstration.",
  "requiresHumanReview": true
}
```

---

### 7. Assessment Criteria PDF

| Field | Value |
|-------|-------|
| **sourceId** | `src-pdf-assessment-criteria` |
| **File** | `doc/เกณฑ์การประเมินสำนักงานสีเขียว-ปี-2569.pdf` (1 MB) |
| **Pages** | 70 |
| **Category** | Assessment reference (not compliance evidence) |

#### Candidate 7
```json
{
  "sourceId": "src-pdf-assessment-criteria",
  "candidateIndicatorCodes": [],
  "confidence": "medium",
  "basis": "PDF documents the official Green Office 2569 assessment criteria across 7หมวด (categories) matching the canonical taxonomy. Contains form-to-indicator mapping references (e.g., form 3.1(1) for water, form 3.2(1) for energy/fuel, form 4.1(1) for waste, form 4.1(2) for grease traps, form 5.4.1 for maintenance, form 6.1(1) for green procurement). This document is an assessment-reference source — it defines criteria and acceptable evidence types. It does not constitute compliance evidence itself but provides essential context for mapping operational spreadsheets to indicators.",
  "requiresHumanReview": true,
  "mappingType": "assessment-reference"
}
```

---

## Detailed Basis by Source

### Form-to-Indicator Mapping Context (from PDF)

The PDF assessment criteria provide the following form-to-indicator mappings, extracted from evidence requirement sections:

| PDF Form Ref | PDF Context | Probable Indicator Target |
|---|---|---|
| 3.1(1) | บันทึกการใช้น้ำ (Water usage record) (p.28) | 3.1.x series |
| 3.2(1) | บันทึกการใช้น้ำมันเชื้อเพลิง (Fuel usage record) (p.31, p.33) | 3.2.x series |
| 4.1(1) | การนำขยะกลับมาใช้ประโยชน์ (Waste reuse calculation) (p.43) | 4.1.x series |
| 4.1(2) | บันทึกการตักคราบน้ำมันและไขมัน (Grease trap record) (p.45) | 4.1.x (hazardous/non-hazardous) |
| 5.4(1) | แผนการดูแลพื้นที่ (Area maintenance plan) (p.51) | 5.x series |
| 6.1(1) | บัญชีรายชื่อสินค้าที่เป็นมิตร (Green product list) (p.58, p.62) | 6.1.1 |
| 6.2(1) | ใบอนุญาต/ข้อตกลงสิ่งแวดล้อม (Environmental permits/agreements) (p.63) | 6.2.x |
| 7.1(1) | บันทึกการตรวจประเมินภายใน (Internal audit record) (p.66) | 7.1.x |

**Critical note**: The form numbers found in operational spreadsheets (3.2(1), 3.2(2), 4.1(1)) do NOT always match the PDF's prescribed form numbers for each indicator. The PDF explicitly states (p.1): "แบบฟอร์มที่สำนักงานใช้ในการบันทึกข้อมูล อาจมีการปรับเปลี่ยนได้ขึ้นอยู่แต่ละองค์กร" (Forms used by offices may be adjusted depending on each organization). This means organizations may use adapted form numbering.

### Year Coverage Summary

| Source | 2564 | 2565 | 2566 | 2567 | 2568 | 2569 |
|--------|------|------|------|------|------|------|
| Water | - | - | Baseline | Active | Active | - |
| Elect | - | - | Baseline | Active | Active | - |
| Gasolene | - | - | Baseline | Active | Active | Template |
| Paper | - | - | Baseline | Active | Active | Active |
| Waste | - | - | Baseline | - | Active | - |
| GHG | Reference | Reference | Reference | Active | Active | - |
| PDF | - | - | - | - | - | Criteria |

### Signature/Approval Field Check

| Source | Signature fields found |
|--------|----------------------|
| Water | Not found on main data sheets |
| Elect | Not found on main data sheets |
| Gasolene | Found on บำรุงรักษา (Maintenance) sheet: Prepared-by + Approved-by lines |
| Paper | Not found on main data sheets |
| Waste | Not found on main data sheets |
| GHG | Not found on main data sheets |
| PDF | N/A — assessment criteria document |

---

## Reasons Requiring Human Review

Every candidate mapping requires human review. Specific areas needing attention:

1. **Form number inconsistency (ALL sources)**: The spreadsheets use form numbers (3.2(1), 3.2(2), 4.1(1)) that reference the old Thai assessment form system, not canonical indicator codes. The PDF confirms adapted forms are acceptable, but human verification is needed to confirm the data actually fulfills each indicator's requirements.

2. **Paper "Reuse" sheet (src-xlsx-paper-usage)**: Sheet labeled "Reuse" contains consumption data, not reuse tracking. Human must verify whether reuse data exists elsewhere or if the sheet name is a mislabel.

3. **Paper 2569 sheet form ref**: Uses form 3.1(1) instead of 3.2(1) used by other paper sheets. Human must verify if this is an intentional change, a different form version, or a data entry error.

4. **GHG EF TGO AR5 codes**: Codes 3.2.1, 3.2.2, 3.3.1 in the EF sheet are IPCC Volume 2 table references (e.g., "IPCC Vol.2 table 3.2.1, 3.2.2, DEDE"), NOT canonical indicator codes. Human must verify this interpretation is correct and confirm there are no actual indicator code references elsewhere.

5. **Cross-category applicability**: Several spreadsheets support multiple indicators (e.g., water spreadsheet for 3.1.1 primary, plus 3.1.2/3.1.3 secondary). Human must determine whether additional documentation exists (e.g., separate conservation plans, reduction target documents) that would elevate the secondary mappings.

6. **LOW confidence downgrades**: All LOW confidence candidates could potentially be upgraded to MEDIUM if additional context documents are available (e.g., environmental policy documents with reduction targets, water conservation plans, energy management reports).

7. **Gasolene sheet count anomaly**: 7 sheets (IQS, สำนักวิจัย, 2567, 2568, 2569, บำรุงรักษา, น้ำมันเชื้อเพลิง แยกทะเบียนรถ). The large IQS and สำนักวิจัย sheets have 1000 rows each — likely detailed trip logs. Human should verify this data is complete and accurate.

8. **Waste data limited year coverage**: Only 2568 data found (plus 2566 for baseline comparison). 2567 is missing. Human should verify if this is intentional or a data gap.

9. **GHG does not use Thai form numbers**: Unlike all other operational spreadsheets, the GHG file has no Thai form number references. Human should confirm if this is because GHG calculation has no prescribed form in the old system, or if the file uses a different classification.

---

## QA Notes

- All 7 sources (6 xlsx + 1 pdf) were successfully inspected programmatically
- No canonical indicator codes were found as explicit labels in any source file
- All 3 "indicator codes" detected in GHG EF sheet were verified as IPCC table references
- The PDF form-to-indicator mapping table above was manually extracted from the criteria document
- File size and structure metadata is recorded in `docs/evidence/_inspection_results.json`
- This report follows the "conservative" principle — prefer lower confidence when uncertain
- No modifications were made to canonical taxonomy, evidence-index.json, or any verified records

### Files Created
- `docs/evidence/GOFFICE2026_MAPPING_CANDIDATES_REPORT.md` (this report)
- `docs/evidence/_inspection_results.json` (raw inspection data for reference)

### Handoff Summary

| Item | Value |
|------|-------|
| Total candidates | 13 |
| HIGH | 0 |
| MEDIUM | 7 |
| LOW | 6 |
| Sources req. review | 7 (all) |
| Key decision | All codes in EF TGO AR5 are IPCC refs, not indicator codes |
| Key gap | No source has explicit canonical indicator code labels |
| Key finding | PDF provides form-to-indicator mapping context that helps validate spreadsheet mappings |
