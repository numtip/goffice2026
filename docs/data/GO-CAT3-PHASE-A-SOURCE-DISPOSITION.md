# GO-CAT3-PHASE-A: Source Disposition + Decision Freeze

**Date:** 2026-08-23 (Asia/Bangkok)
**Status:** DECISION FREEZE — discovery/reads only; no runtime/data implementation
**Repository HEAD baseline:** `b4ee4724512fbb2b87e3ce8797eaef61a5da5b54` (= origin/master, Cat2 baseline merged)
**Authority:** official Green Office 2568/2569 criteria (`indicators.json` cat3 15 indicators) · `docs/data/GO-DATA-5-FY2568-SOURCE-AUDIT.md` · Cat2/Cat1 source-disposition templates (format only)
**Scope:** Resolve Cat3 (หมวด 3 การใช้ทรัพยากรและพลังงาน) FY2568 evidence/version/criterion decisions before implementation. **Independent verification of Cat3 — Cat2 findings not assumed.**

---

## 0. FY2568 source baseline reconciliation

Source (read-only): `G:\GreenData\OneDrive - Maejo university\Mju\GreenOffice\Data2568\หมวด3` — **32 files** (26 PDF + 6 DOCX), `desktop.ini` excluded as non-evidence.

- **All 32 files reconcile to `src/data/fy2568-publication.json` `categories.cat3` by SHA-256 and size: 32/32 match** (verified live; BOM-stripped comparison).
- Repo mirror `public/documents/fy2568/cat3/` is **complete and byte-identical** (32/32 SHA-256 verified).
- One path normalization: the 3.4.2 subfolder is named `3.4.2 การจัดการประชุมและนิทรรศการที่มีการใช้วัสดุ...` at source and `3.4.2 การจัดประชุมและนิทรรศการที่เป็นมิตรกับสิ่งแวดล้อม` in the manifest — same file content (hash-identical), folder-name normalization only.
- Per-category: root-level (GO master report + targets/measures) = 4; 3.1 น้ำ = 9; 3.2 พลังงาน = 8; 3.3 ทรัพยากรอื่นๆ = 7; 3.4 ประชุม/นิทรรศการ = 4.

### Deterministic 32-file manifest (relative path · type · bytes · SHA-256)

| # | Relative path | Type | Bytes | SHA-256 |
|---|---|---|---|---|
| 1 | การประเมินสานักงานสีเขียว (Green Office) หมวด 3.docx | DOCX | 25,176,318 | 5AF63ACE319CF11B0D67935BA0257C3C2111E5521AF9C897D993760656B9D2F3 |
| 2 | การประเมินสานักงานสีเขียว (Green Office) หมวด 3.pdf | PDF | 8,950,230 | DD5B4ED811B1DD01C522D1E583EFF00A91DD46E2810F7520893B05748C8C48AD |
| 3 | มาตรการควบคุมการใช้พลังงานและทรัพยากร ปี 68.pdf | PDF | 2,068,808 | F6F7E19B82641EA78712617601AD7EBA13C8699E281816D2B9E967055795F51A |
| 4 | หมวดที่ 3 เป้าหมายและตัวชี้วัด และ มาตรการ 68.docx | DOCX | 75,160 | 1581620C4DEEF11E0976EF64B3D061AE4E23C473370CACAC2191E71D881DF4E8 |
| 5 | 3.1 การใช้น้ำ/3.1.1.pdf | PDF | 2,580,937 | E588F03C81BC9A1004EB25D0A83ECEF20F81CE7225ECE4FD64D9C07763A0E64C |
| 6 | 3.1 การใช้น้ำ/3.1.2.pdf | PDF | 1,126,011 | A1A81B1385F768295017211D30B95F1327A405353A72DDE427867B5C7CCA9A72 |
| 7 | 3.1 การใช้น้ำ/3.1.3.pdf | PDF | 197,730 | 96DC30D3F6A558252FDCDC0DED706142611BAC8CA457539AA21768169E93B40C |
| 8 | 3.1 การใช้น้ำ/การใช้น้ำ.docx | DOCX | 5,142,441 | 6495CB893F269A3BD50FEEAFF5A3FFEA8F1BCDE4B4877C7A8DC706AFCF1EDC31 |
| 9 | 3.1 การใช้น้ำ/การใช้น้ำ.pdf | PDF | 3,888,437 | B611B4B53367192884CC2C7E53B72A0A571C64EB4ED7F4488B0D5C18E8A8C591 |
| 10 | 3.1 การใช้น้ำ/3.1.1 มาตรการหรือแนวทางใช้น้ำ/3.1.1 มาตรการหรือแนวทางใช้น้ำ.pdf | PDF | 2,762,758 | 95BB805477BBA575436A076EA47C62176F0594466ED75878983B4F63F3140C91 |
| 11 | 3.1 การใช้น้ำ/3.1.1 มาตรการหรือแนวทางใช้น้ำ/ปริมาณน้ำทั้งเครื่องปรับอากาศ.pdf | PDF | 3,899,731 | 67C366E0AB38EA8173184BE1D0CF4CD50C3DD2D4AF5B1F6326FE6763DC4D606C |
| 12 | 3.1 การใช้น้ำ/3.1.2 มีการจัดทำข้อมูลการใช้น้ำต่อหน่วย/3.1.2 มีการจัดทำข้อมูลการใช้น้ำต่อหน่วย.pdf | PDF | 776,423 | C666B449054098B173120F49D91EB3DCE8E2CDD145B51FFC87985B9CA0357D44 |
| 13 | 3.1 การใช้น้ำ/3.1.3 การปฏิบัติตามมาตรการประหยัดน้ำในพื้นที่ทำงาน (ประเมินจากพฤติกรรมของบุคลากรในพื้นที่)/3.1.3.pdf | PDF | 212,404 | 3BF6D595060340BF9B356229D90258C52327D28F9407ADB47AEFF8F0864D405E |
| 14 | 3.2 การใช้พลังงาน/การใช้พลังงาน.docx | DOCX | 8,347,438 | 0B755F2542C2D3F62D26268DC37AD7F0D4875F1FF285F3B92E21EF20B6F7C464 |
| 15 | 3.2 การใช้พลังงาน/การใช้พลังงาน.pdf | PDF | 6,679,299 | E44264E8F68725D18E7E6D547CB41F0F048FD8DDA5FB085A6A38A1672D4D0C70 |
| 16 | 3.2 การใช้พลังงาน/3.2.1 มาตรการหรือแนวทางใช้ไฟฟ้ากับสำนักงาน/3.2.1 มาตรการหรือแนวทางใช้ไฟฟ้ากับสำนักงาน.pdf | PDF | 2,016,782 | 7AEF62A4CEA6F224505394210FBE5E4504712E5566BF193230DDF8B16DE0121B |
| 17 | 3.2 การใช้พลังงาน/3.2.2 มีการจัดทำข้อมูลการใช้ไฟฟ้าต่อหน่วยเปรียบเทียบกับเป้าหมาย/3.2.2 มีการจัดทำข้อมูลการใช้ไฟฟ้าต่อหน่วยเปรียบเทียบกับเป้าหมาย.pdf | PDF | 543,407 | 96C97DBDA160BF13D34E75274DB49510A93A9AD48831D098F41D92C9BE74F81D |
| 18 | 3.2 การใช้พลังงาน/3.2.3 การปฏิบัติตามมาตรการประหยัดไฟฟ้าในพื้นที่ทำงาน/3.2.3 การปฏิบัติตามมาตรการประหยัดไฟฟ้าในพื้นที่ทำงาน.pdf | PDF | 192,245 | 03A312B3B7F730386CC755D09AD41601F3AB387F733F421CB0D8D969A018BA0D |
| 19 | 3.2 การใช้พลังงาน/3.2.4 มาตรการหรือแนวทางการใช้น้ำมันเชื้อเพลิงในการเดินทางที่เหมาะสมกับสำนักงาน/3.2.4.pdf | PDF | 3,812,507 | A57AA5D4E80B8C63402B41B715FA3BFE697CBE2C00EFACD13863654D638DF785 |
| 20 | 3.2 การใช้พลังงาน/3.2.4 มาตรการหรือแนวทางการใช้น้ำมันเชื้อเพลิงในการเดินทางที่เหมาะสมกับสำนักงาน/รายงานการใช้รถยนต์.pdf | PDF | 936,905 | 22690D5B05AD0A03464740B15F17F36B9654585237981AC8AE4568A4836F7B07 |
| 21 | 3.2 การใช้พลังงาน/3.2.5 มีการจัดทำข้อมูลการใช้น้ำมันเชื้อเพลิงต่อหน่วยเปรียบเทียบกับเป้าหมาย และวิเคราะห์ผล/3.2.5.pdf | PDF | 794,548 | 658078F073B64030F391FA5E07E7D042A4DAEA6B7736C4C16937BFE53AE052BD |
| 22 | 3.3 การทรัพยากรอื่นๆ/การใช้ทรัพยากรอื่นๆ.docx | DOCX | 6,169,815 | 3CBC0CBF2B60E659FDD5A42D5E1D1359A575AD732BB63A412425109915C461A7 |
| 23 | 3.3 การทรัพยากรอื่นๆ/การใช้ทรัพยากรอื่นๆ.pdf | PDF | 4,638,294 | DC73DBC0DA87FFEAF446F09E200CFB0087B19ABC4AB33386F89AC7F2650225FA |
| 24 | 3.3 การทรัพยากรอื่นๆ/3.3.1 มาตรการหรือแนวทางการใช้กระดาษที่เหมาะสมกับสำนักงาน/3.3.1 มาตรการหรือแนวทางการใช้กระดาษที่เหมาะสมกับสำนักงาน.pdf | PDF | 2,155,806 | 5010E706951CFAFD303A88E0DAAAA084124E9033C966F9FD33AF57BFC2633652 |
| 25 | 3.3 การทรัพยากรอื่นๆ/3.3.2 มีการจัดทำข้อมูลการใช้กระดาษต่อหน่วยเปรียบเทียบกับเป้าหมาย/3.3.2.pdf | PDF | 572,471 | C55106396E32ACB345029B3BB2E1E223BB2FF9E50B6887C5E2FBFCFF06DEF801 |
| 26 | 3.3 การทรัพยากรอื่นๆ/3.3.3 การปฏิบัติตามมาตรการการประหยัดกระดาษในพื้นที่ทำงาน/3.3.3 การปฏิบัติตามมาตรการการประหยัดกระดาษในพื้นที่ทำงาน.pdf | PDF | 369,323 | 12FC9E8A9DF8016D60847C55B591A4C5A17113634D743C52AB753390FF6D6679 |
| 27 | 3.3 การทรัพยากรอื่นๆ/3.3.4 มาตรการหรือแนวทางการใช้หมึกพิมพ์ อุปกรณ์เครื่องเขียน วัสดุอุปกรณ์เหมาะสมกับสำนักงาน/3.3.4.pdf | PDF | 2,268,391 | AD55261FB9C24B454A613D54D5ABFFD0B4654843274DA6264D10DD7E788B0386 |
| 28 | 3.3 การทรัพยากรอื่นๆ/3.3.5 การดำเนินตามมาตรการประหยัดการใช้หมึกพิมพ์  อุปกรณ์เครื่องเขียน วัสดุอุปกรณ์สำนักงาน/3.3.5.pdf | PDF | 353,492 | F196DD07A4D1C5DEC1CBE0C15D804736B064CB75E61DC2B32B7F6F822056265D |
| 29 | 3.4 การประชุมและการจัดนิทรรศการ/การประชุมและการจัดนิทรรศการ.docx | DOCX | 8,661,802 | E387F47A82609B0732B479A0D916820C13E56CF00E2744C4010F74504E79DB5F |
| 30 | 3.4 การประชุมและการจัดนิทรรศการ/การประชุมและการจัดนิทรรศการ.pdf | PDF | 4,851,548 | EB88C66DC2130BBD2B921BCF8C9F968E4A191BBB5BC639790815966D1CA26B94 |
| 31 | 3.4 การประชุมและการจัดนิทรรศการ/3.4.1 มาตรการหรือแนวทางการจัดการประชุมและนิทรรศการที่เป็นมิตรกับสิ่งแวดล้อม/3.4.1.pdf | PDF | 2,086,138 | 6C5DEE9A0ABBFA0C30EED9B7352AA2464F46674900E50EF924AA4FD21A55A905 |
| 32 | 3.4 การประชุมและการจัดนิทรรศการ/3.4.2 การจัดการประชุมและนิทรรศการที่มีการใช้วัสดุที่เป็นมิตรกับสิ่งแวดล้อม ลดการใช้ทรัพยากร พลังงาน และลดของ/3.4.2.pdf | PDF | 349,779 | 83EEA050A2F01232010B9C71B402E37FCA1D06A858F981CBE9817D58D5F9125D |

---

## 1. DOCX core revision/date metadata (6 DOCX)

| # | File | creator | lastModifiedBy | revision | created | modified | lastPrinted | words | pages |
|---|---|---|---|---|---|---|---|---|---|
| 1 | GO หมวด 3.docx | angkhan pocarat | Jumpon Sriudomsuwan | 81 | 2026-03-02 | 2026-03-16 | 2026-03-11 | 5,191 | 64 |
| 4 | เป้าหมาย/มาตรการ 68.docx | worrawit songkham | worrawit songkham | 21 | 2025-10-01 | 2025-10-22 | 2025-10-22 | 1,972 | 7 |
| 8 | 3.1 การใช้น้ำ.docx | angkhan pocarat | Jumpon Sriudomsuwan | 8 | 2026-02-17 | 2026-02-18 | 2026-02-17 | 871 | 13 |
| 14 | 3.2 การใช้พลังงาน.docx | angkhan pocarat | Jumpon Sriudomsuwan | 7 | 2026-02-17 | 2026-02-17 | **2024-06-24 (stale)** | 1,199 | 24 |
| 22 | 3.3 การใช้ทรัพยากรอื่นๆ.docx | angkhan pocarat | Jumpon Sriudomsuwan | 7 | 2026-02-17 | 2026-02-18 | **2024-06-24 (stale)** | 820 | 18 |
| 29 | 3.4 การประชุมฯ.docx | angkhan pocarat | Jumpon Sriudomsuwan | 4 | 2026-02-17 | 2026-02-17 | 2026-02-17 | 643 | 13 |

Anomaly: #14/#22 `lastPrinted` = 2024-06-24 (20 months before document creation) — stale template metadata, not evidence of 2024 printing.

## 2. Duplicate / canonical / export verdicts

- **Byte-identical duplicates: NONE** (all 32 sha256 unique).
- **Content-level near-duplicate groups (3):**
  - G1 {#7, #13}: text-identical 3.1.3 (337 normalized chars; different bytes → re-export). **Keep #7 (folder-level) canonical; #13 subfolder copy = duplicate re-export.**
  - G2 {#6, #12}: 3.1.2, 1-char diff (807 vs 808 chars; #12 regenerated 2026-03-16). **Keep #6 canonical; #12 = re-export near-duplicate.**
  - G3 {#5, #10}: 3.1.1 near-identical, #10 is 9p with a stray 3.1.2 page (p9) and a dropped caption. **Keep #5 canonical; #10 = version drift at subfolder level.**
- **DOCX↔PDF pairs (5):** each PDF is a direct export of its DOCX (page counts match, text within ±135 chars):

| Pair | DOCX (body chars) | PDF (chars/pages) | Verdict |
|---|---|---|---|
| #1↔#2 GO หมวด 3 | 25,792 | 27,166 / 64 | **#1 CANONICAL · #2 EXPORT** |
| #8↔#9 การใช้น้ำ | 4,462 | 4,665 / 13 | **#8 CANONICAL · #9 EXPORT** |
| #14↔#15 การใช้พลังงาน | 6,125 | 6,377 / 24 | **#14 CANONICAL · #15 EXPORT** |
| #22↔#23 การใช้ทรัพยากรอื่นๆ | 4,293 | 4,497 / 18 | **#22 CANONICAL · #23 EXPORT** |
| #29↔#30 การประชุมฯ | 3,212 | 3,563 / 13 | **#29 CANONICAL · #30 EXPORT** |

- **#4 หมวดที่ 3 เป้าหมายและตัวชี้วัด และ มาตรการ 68.docx = CRITERIA_TARGETS_MEASURES (canonical):** contains the FY2568 KPI/target table (electricity, fuel, water, paper, general waste, GHG each reduce 1% vs 2024; green procurement >60%) plus the complete 9-section มาตรการควบคุมการใช้พลังงานและทรัพยากร. This is the single source of targets + measures.
- **#3 มาตรการควบคุมการใช้พลังงานและทรัพยากร ปี 68.pdf = EXPORT** of the มาตรการ section of #4 (6p). Thai text **garbled in extraction** (broken font cmap) — visually readable only; details unverifiable without OCR.

## 3. Approval / signature findings

- **No file contains a ผู้รับรอง / ลงนาม / ลายมือชื่อ / ลายเซ็น block in any text layer** (keyword scan over all 26 PDFs + 6 DOCX: zero hits).
- **Only #4** carries a typed signatory **name/title placeholder** (twice): `(ผู้ช่วยศาสตราจารย์ ดร.ณัฐพล เลาห์รอดพันธุ์) / ประธานคณะกรรมการสำนักงานสีเขียว...`. This is a typed name, **not an executed signature** — **do not call anything signed/approved.**
- **#1** lists the Cat3 working committee (13 members) but has no signature block.
- 25 MB #1 embeds many photos, so a scanned signature could exist as an image — **nothing verifiable via text; do not claim signed/approved.**

## 4. Semantic verification classification (all 32)

Method: actual text extraction (PyMuPDF fitz for PDFs, WordprocessingML for DOCX); **no OCR**.

| Classification | Count | Files |
|---|---|---|
| **VERIFIED_CONTENT** | **30** | All 6 DOCX + 24 PDFs with extractable text (incl. all category reports, all criterion PDFs, all near-duplicate copies). Caveat: #3 text is garbled (font cmap) — verified only as "measures PDF", details pending OCR. |
| **FILENAME_FOLDER_ONLY (image scan)** | **2** | #11 ปริมาณน้ำทั้งเครื่องปรับอากาศ.pdf (12p AC-condensate photos), #20 รายงานการใช้รถยนต์.pdf (22p vehicle log) — no text layer, content unverifiable without OCR. |
| **UNREADABLE** | **0** | — |

## 5. Per-file criterion assignment + rationale (32 rows)

| # | Criterion | Confidence | Basis |
|---|---|---|---|
| 1 | CATEGORY_REPORT (all 3.1–3.4) | high | Master compiled report: committee list, all 15 criteria, all numeric summaries + embedded มาตรการ |
| 2 | CATEGORY_REPORT (all 3.1–3.4) | high | PDF export of #1 (same 64p, same-day 2026-03-16); some section headers dropped in render |
| 3 | CRITERIA_TARGETS_MEASURES | medium | PDF of the มาตรการ section in #4; Thai garbled; readable bits match #4 |
| 4 | CRITERIA_TARGETS_MEASURES | high | KPI/targets table (reduce 1% each, green procurement >60%) + full 9-section มาตรการ |
| 5 | 3.1.1 | high | Water measures: stickers, 08.00–09.00 schedule, timer-app watering, reuse AC water, sensor faucets |
| 6 | 3.1.2 | high | Water data: 8,337.50 units, +47.1% vs 2024 (NOT met); 87.76 u/person (+47.71%) |
| 7 | 3.1.3 | high | Compliance survey: no leaks/drips found at faucets |
| 8 | CATEGORY_REPORT (3.1) | high | Canonical 3.1 report (3.1.1–3.1.3) incl. sensor-install table & summaries |
| 9 | CATEGORY_REPORT (3.1) | high | Export of #8; page sequence = #5+#6+#7 concatenated |
| 10 | 3.1.1 | high | Near-duplicate of #5 (9p; stray 3.1.2 page p9; dropped caption) |
| 11 | 3.1.1 (photo evidence) | none | 12p image-only AC-condensate water photos; no OCR |
| 12 | 3.1.2 | high | Near-duplicate of #6 (1-char diff); regenerated 2026-03-16 |
| 13 | 3.1.3 | high | Content-identical to #7; different bytes (re-export 2026-02-17) |
| 14 | CATEGORY_REPORT (3.2) | high | Canonical 3.2 report (3.2.1–3.2.5) incl. all summaries |
| 15 | CATEGORY_REPORT (3.2) | high | Export of #14 |
| 16 | 3.2.1 | high | Electricity measures: LED T8 ×150, solar ×4, motion sensors |
| 17 | 3.2.2 | high | Electricity data: 403,036.80 units, +4.6% (NOT met); per-unit tables are images |
| 18 | 3.2.3 | high | Compliance survey: no lights left on in unused areas |
| 19 | 3.2.4 (misbounded) | medium | p1 = 3.2.3 page; p2–9 fuel measures; p10–13 = 3.2.5 content |
| 20 | 3.2.4 (vehicle log) | none | 22p image-only scanned vehicle-use log; no OCR |
| 21 | 3.2.5 | high | Fuel data: 695.82 L, −205 L, −22.7% (MET); starts at item (2) — missing (1) page |
| 22 | CATEGORY_REPORT (3.3) | high | Canonical 3.3 report (3.3.1–3.3.5) |
| 23 | CATEGORY_REPORT (3.3) | high | Export of #22 |
| 24 | 3.3.1 | high | Paper measures: reuse, double-side, e-documents |
| 25 | 3.3.2 | high | Paper data: 2,197.80 kg (+117) and 23.13 kg/unit (+2) = +5.6% (NOT met) |
| 26 | 3.3.3 | high | Compliance: no wasteful paper use found |
| 27 | 3.3.4 | high | Ink/stationery measures: shared printers & office supplies |
| 28 | 3.3.5 | high | Compliance: no wasteful ink/stationery use found |
| 29 | CATEGORY_REPORT (3.4) | high | Canonical 3.4 report (3.4.1–3.4.2) |
| 30 | CATEGORY_REPORT (3.4) | high | Export of #29; complete 3.4.2 (1)–(5) |
| 31 | 3.4.1 | high | Green-meeting measures: e-meeting, QR-Code, online invite |
| 32 | 3.4.2 (partial) | medium | Starts at item (3) (energy in rooms + food/drink); items (1),(2) absent; regenerated 2026-03-16 |

## 6. Per-criterion coverage + content counts

### 6.1 Per-criterion coverage (frozen)

| Criterion | Direct source files | MEASUREMENT DATA | MEASURE | TARGET | ANALYSIS | Strength |
|---|---|---|---|---|---|---|
| 3.1.1 น้ำ measures | #5, #10, #11(scan), #8, #1, #2, #4 | — | ✔ | — | — | **STRONG** |
| 3.1.2 น้ำ data/unit | #6, #12, #8, #1, #2, #4 | ✔ 8,337.50 u (+47.1%); 87.76 u/person (+47.71%) | — | ✔ reduce 1% → **NOT met** | ✔ % + met/not-met | **STRONG** |
| 3.1.3 น้ำ compliance | #7, #13, #8, #1, #2 | — (behavioral survey text) | — | — | — | **STRONG** |
| 3.2.1 ไฟฟ้า measures | #16, #14, #1, #2, #4 | — | ✔ | — | — | **STRONG** |
| 3.2.2 ไฟฟ้า data/unit | #17, #14, #1, #2, #4 | ✔ 403,036.80 u (+4.6%) in text; **per-unit tables only in images** | — | ✔ reduce 1% → **NOT met** | ✔ +4.6% | **MEDIUM** (per-unit numbers not text-extractable) |
| 3.2.3 ไฟฟ้า compliance | #18, #14, #1, #2 | — | — | — | — | **STRONG** |
| 3.2.4 น้ำมัน measures | #19, #20(scan), #14, #1, #2, #4 | — | ✔ | — | — | **STRONG** (+ scanned vehicle log) |
| 3.2.5 น้ำมัน data/unit | #21, #15, #19, #14, #1, #2, #4 | ✔ 695.82 L (−205 L, −22.7%) | — | ✔ reduce 1% → **MET** | ✔ | **STRONG** (standalone #21 missing (1) page) |
| 3.3.1 กระดาษ measures | #24, #22, #1, #2, #4 | — | ✔ | — | — | **STRONG** |
| 3.3.2 กระดาษ data/unit | #25, #22, #1, #2, #4 | ✔ 2,197.80 kg (+117); 23.13 kg/unit (+2, +5.6%) | — | ✔ reduce 1% → **NOT met** | ✔ | **STRONG** |
| 3.3.3 กระดาษ compliance | #26, #22, #1, #2 | — | — | — | — | **STRONG** |
| 3.3.4 หมึก/วัสดุ measures | #27, #22, #1, #2, #4 | — | ✔ | — | — | **STRONG** |
| 3.3.5 หมึก/วัสดุ compliance | #28, #22, #1, #2 | — | — | — | — | **STRONG** |
| 3.4.1 ประชุม eco measures | #31, #29, #1, #2, #4 | — | ✔ | — | — | **STRONG** |
| 3.4.2 ประชุม eco materials | #32, #30, #29, #1, #2 | — | ✔ | — | — | **STRONG** (complete in #30/#2; #32 standalone partial) |

**No GAP/MISSING criterion.** All 15 criteria have dedicated, content-verified evidence. Numeric measurement data exists for 3.1.2, 3.2.2, 3.2.5, 3.3.2.

### 6.2 Content counts

- **32 files** (6 DOCX + 26 PDF); VERIFIED_CONTENT **30** / FILENAME_FOLDER_ONLY **2** / UNREADABLE **0**.
- Per-category: root 4 · 3.1 น้ำ 9 · 3.2 พลังงาน 8 · 3.3 ทรัพยากรอื่นๆ 7 · 3.4 ประชุม/นิทรรศการ 4.
- Per-criterion distinct-file support: 3.1.1=7, 3.1.2=6, 3.1.3=5, 3.2.1=5, 3.2.2=5, 3.2.3=4, 3.2.4=6, 3.2.5=7, 3.3.1=5, 3.3.2=5, 3.3.3=4, 3.3.4=5, 3.3.5=4, 3.4.1=5, 3.4.2=5 (total 78 criterion-file associations).
- Duplicate groups: 0 byte-identical; 3 content-level near-duplicate groups (G1/G2/G3 above).

### 6.3 FY2568 target outcomes (from text — do NOT treat as scores)

| Domain | Target | Actual | Outcome |
|---|---|---|---|
| Electricity | reduce 1% vs 2024 | +4.6% | NOT met |
| Water | reduce 1% vs 2024 | +47.1% | NOT met |
| Paper | reduce 1% vs 2024 | +5.6% | NOT met |
| Fuel | reduce 1% vs 2024 | −22.7% | **MET** |

## 7. Ambiguities / anomalies

1. **#3 garbled font**: Thai text unreadable in extraction (broken ToUnicode/cmap) — needs visual/OCR review to verify measure content.
2. **#19 misbounded**: file named 3.2.4 actually starts with the 3.2.3 page and ends with 3.2.5 pages.
3. **#21 incomplete**: 3.2.5.pdf begins at item (2); item (1) page exists only in compiled #15/#19.
4. **#10 stray page**: subfolder 3.1.1 PDF includes one 3.1.2 page (p9) and omits a caption line present in #5.
5. **#32 partial**: 3.4.2.pdf starts at item (3), missing (1)/(2), despite newest regenerated date (2026-03-16).
6. **Stale lastPrinted** (2024-06-24) in #14/#22, 20 months before creation.
7. **Version proliferation**: folder-level #5/#6/#7 (2026-03-10) vs subfolder copies (2026-02-17 / 2026-03-16); content differs slightly — risk of inconsistent evidence submission.
8. **Compiled PDF #2 drops section headers** (3.1.1, 3.1.2, 3.2.1, 3.2.4, 3.3.1, 3.4.1 missing) while the DOCX has them.
9. **Image-only tables**: 3.2.2 per-unit electricity tables and water monthly charts have no extractable numbers; summary numbers exist only in text lines.
10. **No signature evidence** anywhere — formal approval audit trail not documentable from these 32 files.

## 8. Decision freeze summary

| # | Decision | Status |
|---|---|---|
| 1 | Canonical/export verdicts per §2 (5 DOCX canonical + PDF exports; #4 targets/measures canonical; #3 = export; G1/G2/G3 canonical copies = folder-level #5/#6/#7) | **FROZEN** |
| 2 | Semantic verification: 30 VERIFIED_CONTENT / 2 FILENAME_FOLDER_ONLY / 0 UNREADABLE | **FROZEN** |
| 3 | All 15 criteria (3.1.1–3.4.2) have dedicated evidence; no GAP/MISSING; 3.2.2 MEDIUM (image-only per-unit tables) | **FROZEN** |
| 4 | No signed/approved claim anywhere (no signature block; #4 typed-name placeholder only) | **FROZEN** |
| 5 | Manifest 32/32 hash-verified against `fy2568-publication.json` | **FROZEN** |
| 6 | Anomalies #1–#10 documented, not resolved by inference | **FROZEN** |

## 9. Remaining blockers / PO confirmations

| # | Blocker | Type |
|---|---|---|
| B1 | #3 มาตรการ PDF garbled text — OCR/visual review to verify measure content | Data owner |
| B2 | 3.2.2 per-unit electricity tables image-only — numbers not text-extractable; confirm summary figure 403,036.80 u (+4.6%) | Data owner |
| B3 | #21 3.2.5 missing item (1) page (present only in compiled #15/#19) — confirm intended standalone completeness | Data owner |
| B4 | #19 misbounded + #10 stray page + #32 partial — confirm which file set is authoritative for 3.2.4/3.1.1/3.4.2 | PO |
| B5 | No signature/approval block anywhere — PO confirm whether a signed submission copy exists (like Cat2 B1) | PO |

## 10. Files changed (this phase)

- `docs/data/GO-CAT3-PHASE-A-SOURCE-DISPOSITION.md` — **created** (this document)
- `docs/GOFFICE2026_CATEGORY3_RESOURCE_BLUEPRINT_V1.md` — **created** (C1-frozen blueprint)
- Runtime/data mappings, contracts, pages, generated data, search index, package scripts, deploy config, git history: **untouched**
- Pre-existing worktree changes: **preserved** (none exist — tree was clean at HEAD `b4ee472`)
- `.tmp_cat3_manifest.txt` — temporary work file, to be deleted after use

---

## Guardrails

- Source strictly read-only; no OneDrive modification/copy/delete.
- No invented baseline values, scores, approvals, or FY2569 activities.
- FY2568 = frozen historical baseline; never presented as FY2569.
- Scan-only / garbled / image-only artifacts are honestly classified; never claim semantic verification without content.
