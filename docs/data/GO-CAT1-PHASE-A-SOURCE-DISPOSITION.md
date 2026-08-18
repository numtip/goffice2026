# GO-CAT1-PHASE-A-SOURCE-DISPOSITION

**Date:** 2026-08-18
**Status:** COMPLETE — awaiting Product Owner review
**Scope:** FY2568 Category 1 source disposition (read-only source; no files modified)
**Read-only source:** `G:\GreenData_Res\OneDrive - Maejo university\RAE-Document-Center\07-GreenOffice\Data2568\หมวด1`
**Governance:** `GOFFICE2026_CATEGORY1_MANAGEMENT_BLUEPRINT_V1` §13 Phase A
**All paths below are relative to `Data2568\หมวด1\`.** All 38 SHA-256 hashes are unique — no byte-identical duplicates in this category.

---

## 1. Status counts (38 files)

| Status | Count | Files |
|---|---|---|
| CANONICAL | 28 | 1.1.1–1.1.4, 1.2.1, 1.3(1)–1.3(4) ×6, 1.3.1–1.3.3, 1.3 xlsx, 1.3 report docx, 1.4 register docx, 1.4.1 docx, 1.4.2 docx, 1.5.1, 1.5.2, 1.5_GreenhouseGas2568.xlsx, 1.6.1, 1.6.2, ประกอบข้อ 1.6 docx, 5ส report, ลดหนู report, 1.7.1 docx, 1.7.2 docx |
| DUPLICATE | 7 | 1.3 report pdf, 1.4 register pdf, 1.4.1 pdf, 1.4.2 pdf, ประกอบข้อ 1.6 pdf, 1.7.1 pdf, 1.7.2 pdf |
| SUPERSEDED | 1 | 1.5_greenhousegass_update.xlsx |
| SUPPORTING | 2 | ย.002 โครงการ 5ส, ย.002 โครงการลดหนู |
| UNRESOLVED | 0 | — |
| MISSING (indicator) | 2 | 1.2.2, 1.5.3 — no dedicated source file |

## 2. Pair resolution (docx ↔ pdf, all same title)

Pattern: in every pair the PDF is an earlier (2026-03-09) or same-session export of the editable DOCX (2026-08-04). **DOCX = canonical master; PDF = duplicate/archive.**

| Pair | Similarity | Canonical | Basis |
|---|---|---|---|
| 1.3 รายงาน… | NEAR (pdf not opened, 9.63 MB) | DOCX | same base name + identical mtime; docx signed by ผู้อำนวยการ, ประชุม 9 ก.ค. 2568 |
| 1.4 ทะเบียนกฎหมาย | IDENTICAL (pdf p.1 = docx text) | DOCX | docx newer; ทบทวน 9 ก.ค. & 18 ก.ย. 2568 |
| 1.4.1 กฎหมาย… | IDENTICAL (pp.1–3) | DOCX (`…68 รวม (06.03.2569)`) | docx newer; คำสั่ง 344/2568 25 มี.ค. 2568; 9 เรื่อง |
| 1.4.2 ประเมินความสอดคล้อง… | IDENTICAL (2p) | DOCX | docx newer; ผศ.ภานุวัฒน์ ผู้ตรวจสอบ; ทบทวน 9 ก.ค. 2568 |
| ประกอบข้อ 1.6 | IDENTICAL (8p) | DOCX | identical mtime; Big Cleaning 19 พ.ค. 2568; ประกาศ 25 มี.ค. 2568 |
| 1.7.1 องค์ประชุม | IDENTICAL (4p) | DOCX | ประชุม 7 มี.ค. 2568; คำสั่ง 345/2568; 20/23 คน = 86.96% |
| 1.7.2 วาระ/ประชุม | IDENTICAL (18p) | DOCX | 2 ครั้ง/ปี มี.ค. & ก.ย. 2568 |

## 3. GHG workbook verdict

- **`1.5_GreenhouseGas2568.xlsx` = canonical FY2568 inventory.** Summary sheets match `1.5.2 (9-3-69).pdf` exactly: FY2568 รวม **231.62 tCO2e** (Scope1 10.85 / Scope2 201.48 / Scope3 19.29); **ไม่บรรลุเป้า +3.81%** vs FY2567 220.99 tCO2e.
- **`1.5_greenhousegass_update.xlsx` = SUPERSEDED.** Contains only FY2567/2566 sheets — no FY2568 sheet; must not be treated as FY2568.
- **⚠ Data-entry anomaly (canonical file):** `CH4จาก Septic tank 2568` — employee count = 1,122,222 / 1,123,267 (Nov/Dec) instead of 95, inflating CH4 rows to 269,333/269,590 kgCH4 and a summary row of **7,548,513.84 kgCO2e**. Conflicts with the official 231.62 tCO2e (septic ≈ 7.79 t). **This row must not be used for reported totals until corrected.**

## 4. Missing indicators — confirmed

- **1.2.2 (role understanding):** no dedicated file. Only stub in `1.2\1.2.1-คณะทำงาน…pdf` p.8: "1.2.2 …ประเมินจากการสุ่มสอบถาม **-สัมภาษณ์-**" (empty placeholder). Status: `MISSING_DEDICATED_SOURCE` per blueprint §4.2.
- **1.5.3 (GHG knowledge):** no dedicated file; no อบรม/ความรู้ sheet in any workbook. Status: `MISSING_DEDICATED_SOURCE` per blueprint §4.5.
- Both stay MISSING until source proves otherwise. No evidence inferred.

## 5. Year / approval verification (first pages)

- 1.1.1: 2568, ขอบเขต 9,873 ตร.ม., อ้างผลตรวจปี 2567. 1.1.3: ประกาศมหาวิทยาลัยแม่โจ้ เป้าหมายประจำปี 2568 (base ปี 2567). 1.1.4: แผน 2568 อนุมัติโดยผู้บริหาร 4 หน่วยงาน.
- 1.2.1: คำสั่งแต่งตั้ง ลงนามอธิการบดี **25 มีนาคม พ.ศ. 2568**. 1.3.3: โครงการลดหนู IPM 1 ต.ค.–31 ธ.ค. 2568. 1.4.2: ทบทวน 9 ก.ค. 2568. 1.5.2: 231.62 tCO2e / 2.44 tCO2e ต่อคน.

## 6. Open questions for data owner

1. 1.2.2 — where are the interview/comprehension records or %-understanding summary?
2. 1.5.3 — is there any GHG-knowledge training (อบรม) evidence?
3. Septic-tank anomaly — confirm correct employee count (95) for Nov/Dec 2568 and recompute.
4. `รายงาน_1.3….pdf` (9.63 MB) not opened — confirm content-identical export of DOCX.
5. 1.3 xlsx Output sheet carries both ปี 2567 and ปี 2568 headers — confirm intended inventory year (29 สค68 ranking sheet operative).
6. 1.4.1 — confirm `…68 รวม (06.03.2569).docx` is final consolidated version (archive 2026-03-09 pdf).

## 7. Guardrails honored

Source strictly read-only (no modify/move/rename/delete). No score generation. No FY2568→FY2569 leakage. `1.5_greenhousegass_update.xlsx` not assumed FY2568. Filenames and mtimes treated as signals only; content verified on first pages / extracted text where permitted (large files not opened).
