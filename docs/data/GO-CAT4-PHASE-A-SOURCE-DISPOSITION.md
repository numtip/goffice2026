# GO-CAT4-PHASE-A: Source Disposition + Decision Freeze

**Date:** 2026-08-23 (Asia/Bangkok)
**Status:** DECISION FREEZE — reads only; no runtime/data implementation
**Repository HEAD baseline:** `15b60b42358c3d7d3cc0ff0dd5c29a8a7dc0e4a9` (= origin/master, Cat3 baseline merged)
**Authority:** `docs/GOFFICE2026_CATEGORY4_WASTE_BLUEPRINT_V1.md` · official Green Office 2568/2569 criteria (`src/data/criteria/indicators.json` cat4 5 indicators) · Cat2/Cat3 source-disposition templates (format only — no facts copied)
**Scope:** Resolve Cat4 (หมวด 4 การจัดการของเสีย) FY2568 evidence/version/criterion decisions before Phase C implementation. **Independent verification — Cat2/Cat3 findings not assumed.**

---

## 0. FY2568 source baseline reconciliation

Source (read-only): `G:\GreenData\OneDrive - Maejo university\Mju\GreenOffice\Data2568\หมวด4` — **44 physical files** (live `Get-ChildItem -Recurse -Force -File`); `desktop.ini` (85 B) excluded as non-evidence; **43 evidence-candidate files inventoried below**.

- **Manifest reconcile: 28/28 manifest docs match source by SHA-256 + size** (verified live; `src/data/fy2568-publication.json` `categories.cat4` = 28 docs, 144,189,887 B).
- **Repo mirror `public/documents/fy2568/cat4/` = complete and byte-identical: 28/28 SHA-256 verified.**
- **14 source files are NOT in the manifest** (draft exports, per-year data tables, scans, and reference artifacts) — see §6.
- **3 filename normalizations** (same content hash, different title): `4.1.1 (1) มาตรการควบคุมการใช้พลังงานและทรัพยากร…ประจำปี ปี 2568 .pdf` (src) vs manifest `4.1.1 (1) มาตรการควบคุมพลังงานและทรัพยากร…2568.pdf`; `4.1.1 (4) ประกาศ…การกำหนดบริบทองค์กร และขอบเขตการจัดการสิ่งแวดล้อม ประจำปี 2568.pdf` vs manifest `4.1.1 (4) ประกาศ…บริบทองค์กรและขอบเขตฯ 2568.pdf`. Manifest path is the stable public reference; original OneDrive filename preserved in this record.
- **Manifest anomaly (pre-existing):** `4.2.1 (1) บันทึกการตักคราบน้ำมัน และไขมัน.pdf` and `4.2.2 (3) บันทึกการตักคราบน้ำมัน และไขมัน.pdf` are **byte-identical** (sha `3a21d03a…`); the manifest lists **both** paths. Content duplicate, not a content pair — do not double-count as two evidence items.

### Deterministic 43-file inventory (relative path · type · bytes · SHA-256)

| # | Relative path | Type | Bytes | SHA-256 |
|---|---|---|---|---|
| 1 | `4. หมวด 4 ข้อ 4.1(1) บันทึกปริมาณขยะ.xls  ปี 2568.xls 14-02-68.xlsx` | XLSX | 41,658 | 9EF91B02404C05DCA96B5EA2D3CC97CEA571FD007B63BAFFFAB3668FB419E01E |
| 2 | `4.1/4.1.1.pdf` | PDF | 176,745 | 38D932D8E11C03ABEFAB5E50B2FE04D4BD3ADDA0F9EFAFE2CB708725E2171C70 |
| 3 | `4.1/4.1.2.pdf` | PDF | 2,780,752 | 8A075B6BDC6BDCAD1A26D998948B6046C901D97FDAAB210154FE01B79EC21C71 |
| 4 | `4.1/4.1.3.pdf` | PDF | 1,554,775 | 9A981BBE27390CDD712DB570018A9348E7FE83BD4E39B28970CDE28B352C285C |
| 5 | `4.2/4.2.1.pdf` | PDF | 1,540,787 | 94FFD11FEBC6EB8F3D87115F61C928BBEA3447AD03C3EA8FA21940BF3113747D |
| 6 | `4.2/4.2.2.pdf` | PDF | 523,045 | 38BC2654374158949A9626BC3D1C7FEDDA445EE32781F370F4328C9ED436C4F2 |
| 7 | `4.pdf` | PDF | 6,288,580 | 3DB5495025A3341BEA701695FCEB5DAFA256B398A88334F87B4C2A453A25C081 |
| 8 | `New/4.1 การจัดการขยะ/4.1.1 มาตรการหรือแนวทางจัดการขยะที่เหมาะสม/4.1.1 (1) มาตรการควบคุมการใช้พลังงานและทรัพยากร อาคารเฉลิมพระเกียรติสมเด็จพระเทพฯ ประจำปี ปี 2568 .pdf` | PDF | 2,067,911 | 5C2FF640B8AF80842F213F755952370ECF609A1ACE391F8AB7CC32B83A87CB9F |
| 9 | `New/4.1 การจัดการขยะ/4.1.1 มาตรการหรือแนวทางจัดการขยะที่เหมาะสม/4.1.1 (3) .txt` | TXT | 443 | 89F6AA22D75E889D1EA732FED60B54D3692C282526259452635C796A5E7B1C06 |
| 10 | `New/4.1 การจัดการขยะ/4.1.1 มาตรการหรือแนวทางจัดการขยะที่เหมาะสม/4.1.1 (4) ประกาศมหาวิทยาลัยแม่โจ้ เรื่อง การกำหนดบริบทองค์กร และขอบเขตการจัดการสิ่งแวดล้อม ประจำปี 2568.pdf` | PDF | 25,016,240 | F10AFBF39C6BC4731F1227F3EC3626464FA4279B22DF686308D9CF3E2A3F1D8D |
| 11 | `New/4.1 การจัดการขยะ/4.1.1 มาตรการหรือแนวทางจัดการขยะที่เหมาะสม/4.1.1. (2) ประกาศมหาวิทยาลัยแม่โจ้ เรื่อง การกำหนดเป้าหมายสิ่งแวดล้อม2568.pdf` | PDF | 1,659,344 | D1983FD22805EAADCCB714AC3687709965A9A36DA341BFBA2187577CB4EB981D |
| 12 | `New/4.1 การจัดการขยะ/4.1.1 มาตรการหรือแนวทางจัดการขยะที่เหมาะสม/4.1.1. (5) .txt` | TXT | 286 | 1CDE893EAC064C92646D2FE58BA45FC855A4612EB0D453CA3B7FE0B42324EC4F |
| 13 | `New/4.1 การจัดการขยะ/4.1.2 การดำเนินงานตามแนงทางการคัดแยก รวบรวม และกำจัดขยะอย่างเหมาะสม/4.1.2 (1) .txt` | TXT | 3,039 | ADCE045C6D7211771B684FF7E113DBEE00CC4C20E203F25BDCFE80DDF50FFFAA |
| 14 | `New/4.1 การจัดการขยะ/4.1.2 การดำเนินงานตามแนงทางการคัดแยก รวบรวม และกำจัดขยะอย่างเหมาะสม/4.1.2 (2).txt` | TXT | 953 | 96C7139F1D9C0ADAE83FEA885F37A2264BBA1547BB129AA9E6BEFBA6B12E6DF0 |
| 15 | `New/4.1 การจัดการขยะ/4.1.2 การดำเนินงานตามแนงทางการคัดแยก รวบรวม และกำจัดขยะอย่างเหมาะสม/4.1.2 (3) .txt` | TXT | 1,888 | 03AABA1AC7CCBB7688DA511DA1FABF7B226F81544F054AAA0278079502002980 |
| 16 | `New/4.1 การจัดการขยะ/4.1.2 การดำเนินงานตามแนงทางการคัดแยก รวบรวม และกำจัดขยะอย่างเหมาะสม/4.1.2 (4) แบบฟอร์มบันทึกการสุ่มตรวจการทิ้งขยะ.pdf` | PDF | 7,302,905 | 53250412855EDB6D6E13AC1D321EFD02F4197DC9E8634F571A9E5246C6ACF023 |
| 17 | `New/4.1 การจัดการขยะ/4.1.2 การดำเนินงานตามแนงทางการคัดแยก รวบรวม และกำจัดขยะอย่างเหมาะสม/4.1.2 (5) สัญญาจ้าง.pdf` | PDF | 184,812 | B3FD6FBC7954156C0894CF6429957F8E552ACC82175A60D592A866A5DD0D64DB |
| 18 | `New/4.1 การจัดการขยะ/4.1.2 การดำเนินงานตามแนงทางการคัดแยก รวบรวม และกำจัดขยะอย่างเหมาะสม/4.1.2 (6) .txt` | TXT | 856 | 397AEEBC01B4AA5C0826A11208887F280A0A588A3C38EDDF7BE31DA54BAAD102 |
| 19 | `New/4.1 การจัดการขยะ/4.1.2 การดำเนินงานตามแนงทางการคัดแยก รวบรวม และกำจัดขยะอย่างเหมาะสม/4.1.2 (7) .txt` | TXT | 779 | 713DCB524F5D1F062B93255534F42DC02723E8C0E5FF32A708EEB22CA0D2C8EA |
| 20 | `New/4.1 การจัดการขยะ/4.1.3 การนำขยะกลับไปใช้ประโยชน์หรือนำกลับมาใช้ใหม่/4.1.3 (1) แบบบันทึกข้อมูลปริมาณขยะ.pdf` | PDF | 4,256,199 | 094DCBDE011F8CFC4B0F752FAB9E263753C1A8392F77F29852CB0A4100B75ECB |
| 21 | `New/4.1 การจัดการขยะ/4.1.3 การนำขยะกลับไปใช้ประโยชน์หรือนำกลับมาใช้ใหม่/4.1.3 (2) การวิเคราะห์ปริมาณขยะเทียบค่าเป้าหมาย.pdf` | PDF | 473,701 | 356065C028F42EEA439BB6225959A09D430266872A413EA9B046C2202550DC3F |
| 22 | `New/4.1 การจัดการขยะ/4.1.3 การนำขยะกลับไปใช้ประโยชน์หรือนำกลับมาใช้ใหม่/4.1.3 (3).txt` | TXT | 2,878 | 3DBA6927F77FE23643B953810B69862EA2AD2FCAA47E748E86E69BEEE889F284 |
| 23 | `New/4.1 การจัดการขยะ/4.1.3 การนำขยะกลับไปใช้ประโยชน์หรือนำกลับมาใช้ใหม่/4.1.3 (4).txt` | TXT | 894 | 3E8243B7F80D9C6432AA7B84B03E3EC434133B0AD3B365610F26F9E2BE9C408E |
| 24 | `New/4.2 การจัดการน้ำเสีย/4.2.1 การจัดการน้ำเสียของสำนักงาน/4.2.1 (1) บันทึกการตักคราบน้ำมัน และไขมัน.pdf` | PDF | 1,731,851 | 3A21D03A278B29503433B6B5071F0C588201813D84F9A6B4C2321C5DC0EEDD8A |
| 25 | `New/4.2 การจัดการน้ำเสีย/4.2.1 การจัดการน้ำเสียของสำนักงาน/4.2.1 (1) บันทึกรายละเอียดของสถิติคุณภาพน้ำ ปี 2568.pdf` | PDF | 120,540 | B51F1116851A37DD329D75F64CDC866B60EECEBDFF45B5E7CC3C284A76EAC067 |
| 26 | `New/4.2 การจัดการน้ำเสีย/4.2.1 การจัดการน้ำเสียของสำนักงาน/4.2.1 (2).txt` | TXT | 2,044 | 4CBF86FAE9F5389189629EF670E4DEC42D79B83C8D278E90343643A08169ACD2 |
| 27 | `New/4.2 การจัดการน้ำเสีย/4.2.1 การจัดการน้ำเสียของสำนักงาน/4.2.1 (3).txt` | TXT | 2,335 | A6098F9536FF14D83C58E50DAD15D9F20F575C17C1882FD882B5B38D0C187FBE |
| 28 | `New/4.2 การจัดการน้ำเสีย/4.2.1 การจัดการน้ำเสียของสำนักงาน/4.2.1 (4).txt` | TXT | 2,407 | 8853BE2FA2B0929B523DAFCE14BFCE8AE10129C10E96C5F70A422068061885E3 |
| 29 | `New/4.2 การจัดการน้ำเสีย/4.2.2 การจัดการดูแลการบำบัดน้ำเสีย/4.2.2 (1).txt` | TXT | 1,866 | 5C73319333BA635F3385EC2FD0BAF73F452BD46AD4BE92BF0ABB738ED2EBD7F7 |
| 30 | `New/4.2 การจัดการน้ำเสีย/4.2.2 การจัดการดูแลการบำบัดน้ำเสีย/4.2.2 (2).txt` | TXT | 1,095 | E434155BBA65987B96CA13241E482B175066BFA6A9B65E461E103ACBFCB35B0D |
| 31 | `New/4.2 การจัดการน้ำเสีย/4.2.2 การจัดการดูแลการบำบัดน้ำเสีย/4.2.2 (3) บันทึกการตักคราบน้ำมัน และไขมัน.pdf` | PDF | 1,731,851 | 3A21D03A278B29503433B6B5071F0C588201813D84F9A6B4C2321C5DC0EEDD8A |
| 32 | `New/4.2 การจัดการน้ำเสีย/4.2.2 การจัดการดูแลการบำบัดน้ำเสีย/4.2.2 (4).txt` | TXT | 190 | 714B093CF28D77ACC41D73DD4EA5B2285EAE62D6542255A143FB964CDFEF4FBB |
| 33 | `New/หมวดที่ 4 รายงานผลการจัดการของเสีย  (10-03-69).docx` | DOCX | 49,759,555 | 52C5BB3CEE45013F0B78B2E06800DC9ACB29E61EB72921D746E3685336EBBBB8 |
| 34 | `New/หมวดที่ 4 รายงานผลการจัดการของเสีย  (10-03-69).pdf` | PDF | 3,491,167 | 1577E4A438076D6264A14955DD69E4A4E22979616AB40E6A318728E274A307C9 |
| 35 | `wtms_document[1].aspx` | ASPX (saved HTML) | 53,950 | 321B66E886D50787EDCF585BE940316B4D03088DE521F8CE9E168DE67F0F2364 |
| 36 | `ปี 2566.pdf` | PDF | 68,117 | 3A803FD017D0432C7466AA91D65C022203DD6D1ED4AEB4888B613A65F5860100 |
| 37 | `ปี 2567.pdf` | PDF | 67,807 | C6160CFB3457C0AB1657431B8D6D95C1456D430AEC1BF412BF24A47DEA8D5202 |
| 38 | `ปี 2568.pdf` | PDF | 68,373 | 75A6690DC217115D5302CEBC3E993CFD236AADFBA4AE1FA11E848F461B8E79E5 |
| 39 | `หมวดที่ 4 รายงานผลการจัดการของเสีย  (02-03-69).docx` | DOCX | 49,821,367 | 5C5D582BF6747F8BCDBE8B481BA35D0DD0AEEA9B93D63983F4ECF7D78797D979 |
| 40 | `แบบ ทส. 2.txt` | TXT | 18 | 25E8170BC0DA8E51DF0D3FEF71C386DBFDD0279A85DDAD1B63CE497E4FBB4AAC |
| 41 | `แบบบันทึกปริมาณน้ำหนักขยะ ปี 2566.pdf` | PDF | 4,203,071 | 2A580F5EBE9BE741D5E6F22125A0B0CCF0E499CEE280AEBD0852E035F7800A88 |
| 42 | `แบบบันทึกปริมาณน้ำหนักขยะ ปี 2567.pdf` | PDF | 4,407,487 | 8A084A005B864F396C99CC8EBE6B713E9B034C477464F2E2DCD9FBC585A97E06 |
| 43 | `แบบบันทึกปริมาณน้ำหนักขยะ ปี 2568.pdf` | PDF | 4,256,199 | 094DCBDE011F8CFC4B0F752FAB9E263753C1A8392F77F29852CB0A4100B75ECB |

> Note: #20 and #43 are **byte-identical** (sha `094DCBDE…`) — the FY2568 monthly waste log exists twice (root copy `แบบบันทึกปริมาณน้ำหนักขยะ ปี 2568.pdf` ≡ `New/…/4.1.3 (1) แบบบันทึกข้อมูลปริมาณขยะ.pdf`). #24 and #31 are **byte-identical** (sha `3A21D03A…`).

---

## 1. DOCX core revision/date metadata (2 DOCX)

| # | File | creator | lastModifiedBy | revision | created | modified | lastPrinted | words | pages | chars |
|---|---|---|---|---|---|---|---|---|---|---|
| 39 | `หมวดที่ 4 รายงานผลการจัดการของเสีย (02-03-69).docx` | Areerat | Guest User | 106 | 2026-02-23 | 2026-03-02 | 2026-02-18 | — (app.xml no Words) | 33 (text blocks) | 21,247 |
| 33 | `หมวดที่ 4 รายงานผลการจัดการของเสีย (10-03-69).docx` | Areerat | Windows User | 129 | 2026-02-23 | 2026-03-11 | 2026-03-09 | 3,356 | 33 | 21,375 |

- Both reports are 33-page Word documents with **104 embedded images each**.
- **10-03-69 is the LATER revision** (revision 129 vs 106; modified 2026-03-11 vs 2026-03-02) → **CANONICAL annual report**.
- **02-03-69 is the EARLIER revision** → **SUPERSEDED** (retain on disk, `supersededBy` → 10-03-69).

### Version delta (02-03-69 → 10-03-69), by actual extraction

Text difference is small (21,247 → 21,375 chars, 136 net added chars; ~14 changed blocks) and is **editorial alignment to the official criterion wording**:

| Area | 02-03-69 (superseded) | 10-03-69 (canonical) | Meaning |
|---|---|---|---|
| 4.1.1(1) item 8 | `…จัดทำผลรวมการลดปริมาณขยะ… (มาตรการควบคุมการใช้พลังงานและทรัพยากร…)` | `…จัดทำผลรวมการลดปริมาณขยะ… มาตรการควบคุมการใช้พลังงานและทรพัยากร…` | typo variants (`ทรัพยากร`→`ทรพัยากร`); same meaning |
| 4.1.1(4) | `(ประกาศ…การกำหนดบริบทองค์กร… ประจำปี พ.ศ.2568)` | `(ประกาศ…การกำหนดบริบทองค์กร… ประจำปี 2568)` | date format only |
| 4.1.2(1) | `มีการคัดแยกขยะตามประเภทขยะ…ทุกจุดที่สุ่มตรวจสอบ` | `มีการกำหนดจุดวางถังขยะบริเวณสำนักงานอย่างเหมาะสม และมีการคัดแยกขยะตามตามประเภทขยะ…` | wording aligned to criterion |
| 4.1.2(4) | `…มีการบันทึกผลขยะที่สุ่มตรวจทุกครั้ง (แบบฟอร์มบันทึกการสุ่มตรวจการทิ้งขยะ)` | `…มีการบันทึกผลขยะที่สุ่มตรวจทุกครั้ง แบบฟอร์มบันทึกการสุ่มตรวจการทิ้งขยะ` | parenthesis dropped |
| 4.1.3(2) | `หมวด 1 ข้อ 1.1.5` | `หมวด 1 ข้อ 1.1.3` | **reference corrected** (1.1.3 = targets in Cat1) |
| 4.1.3(3) | `มีการนำขยะกลับมาใช้ประโยชน์หรือนำกลับมาใช้ใหม่` | `มีการนำขยะกลับมาใช้ประโยชน์ มากกว่าร้อยละ 50 ของปริมาณขยะทั้งหมดของหน่วยงานต่อเดือน หรือมีนวัตกรรมหรือมีการส่งขยะไปเป็นเชื้อเพลิง (RDF)` | **criterion expanded** — >50% OR innovation/RDF |
| 4.1.3(4) | `ปริมาณขยะที่ส่งกำจัดมีแนวโน้มลดลง` | `ปริมาณขยะที่ส่งกำจัด (ขยะทั่วไป) มีแนวโน้มลดลง` | clarified scope |
| 4.2.1(2) | `มีการบำบัดน้ำเสียอย่างเหมาะสม…` | `หน่วยงานมีการบำบัดน้ำเสียอย่างเหมาะสม…` | wording aligned |
| 4.2.1(4) | `มีผลการตรวจสอบคุณภาพน้ำทิ้งที่อยู่ในเกณฑ์มาตรฐานตามที่กฎหมายกำหนด` | `ระบบบำบัดน้ำเสียอยู่ในสภาพพร้อมใช้งาน และมีผลการตรวจสอบคุณภาพน้ำทิ้งที่อยู่ในเกณฑ์มาตราฐานตามกฎหมายกำหนด` | **criterion expanded** — system readiness + effluent standard |
| 4.2.2(3) | `…ซ่อมแซมให้สามารถใช้งานได้ในทันที บันทึกการตักคราบน้ำมัน และไขมัน` | `…ซ่อมแซมให้สามารถใช้งานได้ในทันที แบบบันทึกการตักคราบน้ำมัน และไขมัน` | reference clar |
| Flowchart (4.1.2(6)) | `มหาวิทยาทำการรวบรวม` (one line) | `มหาวิทยาลัย ทำการรวบรวม` (two lines) | line-break only |

**No numeric, factual, or evidentiary change between revisions** — only criterion wording alignment and the Cat1 reference fix (1.1.5 → 1.1.3). Both carry identical 104-image sets and identical monthly data tables (see §4).

### PDF export pair

| File | Pages | Text chars | Relationship |
|---|---|---|---|
| `New/… (10-03-69).pdf` (#34) | 33 | 22,314 | **Export of canonical 10-03-69 docx** (Word export, same page count as docx) → keep as reader-friendly export of ANNUAL_REPORT |
| `4.pdf` (#7, root) | 34 | 22,130 | Compiled **draft** export (2026-03-10) = concatenation of `4.1/*.pdf` + `4.2/*.pdf` (SequenceMatcher 0.9764) → **SUPERSEDED** by 10-03-69 pdf |

The root `4.pdf` is a pre-final compiled copy of the whole category (it equals the concatenation of the five section PDFs `4.1/4.1.1.pdf` + `4.1.2.pdf` + `4.1.3.pdf` + `4.2.1.pdf` + `4.2.2.pdf`). It predates the 10-03-69 final report. **Not published as separate evidence.**

---

## 2. Duplicate / canonical / export verdicts

### 2.1 Byte-identical duplicates (2 groups)

| Group | Files (sha256 identical) | Verdict |
|---|---|---|
| G1 | `แบบบันทึกปริมาณน้ำหนักขยะ ปี 2568.pdf` (root, #43) ≡ `New/…/4.1.3 (1) แบบบันทึกข้อมูลปริมาณขยะ.pdf` (#20) — sha `094DCBDE…` | Same monthly FY2568 waste log, two copies. Manifest keeps `4.1.3 (1)` path as canonical; root copy = duplicate. |
| G2 | `New/…/4.2.1 (1) บันทึกการตักคราบน้ำมัน และไขมัน.pdf` (#24) ≡ `New/…/4.2.2 (3) บันทึกการตักคราบน้ำมัน และไขมัน.pdf` (#31) — sha `3A21D03A…` | Same 4-page oil/grease skimming record. Manifest lists BOTH paths (pre-existing anomaly). **Keep ONE canonical (4.2.1(1) as primary skimming record; 4.2.2(3) = duplicate reference for 4.2.2(1))** — mark second as `duplicateOf`, do not count as separate evidence item. |

### 2.2 Annual-report versions (root report vs New report)

| File | sizeBytes | sha256 | Verdict |
|---|---|---|---|
| `New/… (10-03-69).docx` | 49,759,555 | `52C5BB3C…` | **CANONICAL** (revision 129, modified 2026-03-11) |
| `New/… (10-03-69).pdf` | 3,491,167 | `1577E4A4…` | **EXPORT** of canonical docx |
| `หมวดที่ 4… (02-03-69).docx` (root) | 49,821,367 | `5C5D582B…` | **SUPERSEDED** (revision 106, modified 2026-03-02) |

Both DOCX are already in the manifest (28 count). In Phase C the manifest/contract must express `supersededBy` from 02-03-69 → 10-03-69 and mark `4.pdf` as draft export (excluded).

### 2.3 Section PDFs (root `4.1/`, `4.2/` folders)

`4.1/4.1.1.pdf`, `4.1/4.1.2.pdf`, `4.1/4.1.3.pdf`, `4.2/4.2.1.pdf`, `4.2/4.2.2.pdf` are **draft section narratives** (verified text, with photos) that were compiled into `4.pdf` and then into the 10-03-69 report. They are NOT in the manifest. Verdict: **SUPERSEDED by the canonical 10-03-69 report** (same narrative content; keep on disk as frozen source, exclude from publication mapping).

### 2.4 Per-year data tables (root `ปี 2566/2567/2568.pdf`) — NOT in manifest

Verified text tables with monthly waste quantities + annual totals (see §4). These are the **primary numeric data artifacts** for 4.1.3(1)/(4) and must be promoted in Phase C as indicator evidence (decision recorded here). They are small, verified, and authoritative (they match the report tables exactly).

---

## 3. Semantic-verification classification (FY2568 source)

Method: actual text extraction (PyMuPDF) for every PDF; txt/XLSX/DOCX read directly; **no OCR, no invented content**. Garbled-text PDFs verified by pdfplumber cross-check.

| Classification | Count (paths) | Files |
|---|---|---|
| **verified_content** | **30** | 12 verified PDFs: 5 section narratives `4.1/4.1.1–4.1.3.pdf`, `4.2/4.2.1–4.2.2.pdf` (#2–6), draft `4.pdf` (#7), `4.1.3 (2)` การวิเคราะห์ (#21), `4.2.1 (1)` สถิติคุณภาพน้ำ (#25), `New/… (10-03-69).pdf` (#34), `ปี 2566/2567/2568.pdf` (#36–38) · 15 narrative txt notes (#9,12,13,14,15,18,19,22,23,26,27,28,29,30,32) · 2 DOCX (#33,#39) · 1 XLSX (#1) |
| **scan_only_unverifiable** | **10** (8 unique contents) | `4.1.1 (4)` ประกาศบริบท 8p (#10), `4.1.1 (2)` ประกาศเป้าหมาย 1p (#11), `4.1.2 (4)` แบบฟอร์มสุ่มตรวจ 24p (#16), `4.1.2 (5)` สัญญาจ้าง 1p (#17), `4.1.3 (1)` แบบบันทึกข้อมูลปริมาณขยะ 12p (#20), `แบบบันทึกปริมาณน้ำหนักขยะ ปี 2566` 12p (#41), `ปี 2567` 12p (#42), `ปี 2568` 12p (#43), `4.2.1 (1)` บันทึกการตักคราบ 4p (#24), `4.2.2 (3)` บันทึกการตักคราบ 4p (#31). 8 unique contents because #20≡#43 (sha `094DCBDE…`) and #24≡#31 (sha `3A21D03A…`) are byte-identical pairs |
| **garbled_text_layer** | **1** | `4.1.1 (1) มาตรการควบคุมการใช้พลังงานและทรัพยากร…2568.pdf` (#8): Thai text layer present but glyph mapping broken (fitz + pdfplumber both output mojibake). Content = measures (cross-verified via `4.1/4.1.1.pdf` which quotes it verbatim). Classify **verified by cross-reference, glyph layer pending OCR** — not invented. |
| **reference_artifact (non-evidence)** | **2** | `wtms_document[1].aspx` (#35) — saved WTMS web page listing monthly แบบ ทส.1 PDFs (12 months FY2568) → reference only, **exclude from publication**; `แบบ ทส. 2.txt` (#40) — 18-byte label "แบบ ทส.2", no evidentiary narrative → **non-evidence** |

**Count check (mutually exclusive, one class per path): 30 + 10 + 1 + 2 = 43 = total unique source files ✓.** No path is double-counted: #8 is garbled (not verified), #40 is reference (not verified txt), and the duplicate scan pairs #20/#43 and #24/#31 are each counted once as scan paths (10 paths, 8 unique contents).

**Rule confirmed:** no semantic verification claim for the 10 scan-only PDF paths; they remain mapped at filename/folder level with `status: pending` (OCR/human verification required before promotion).

---

## 4. Verified FY2568 facts and measurements (from text extraction — not scores)

### 4.1 Waste mass (ขยะทั่วไป/ส่งกำจัด = general waste sent for disposal)

| Year | Total all waste (kg) | General waste ส่งกำจัด (kg) | Reuse incl. food+leaves (kg) | Reuse % |
|---|---|---|---|---|
| 2566 | 6,028.30 | 4,633.10 | 1,395.20 | 23.14% |
| 2567 | 5,737.40 | 4,307.70 | 1,429.70 | 24.92% |
| **2568** | **6,434.70** | **4,380.10** | **2,054.60** | **31.93%** |

- **FY2568 general waste = 4,380.10 kg** (ส่งกำจัด), **+72.40 kg (+1.68%) vs 2567**, **−253 kg vs 2566**.
- **FY2568 total all waste = 6,434.70 kg** (ส่งกำจัด 4,380.10 + จำหน่าย 0 + นำกลับมาใช้ใหม่ 1,223.50 + เศษอาหาร 820.70 + เศษกิ่งไม้/ใบไม้ 10.40).
- **FY2568 total reuse incl. food/leaves = 2,054.60 kg = 31.93%** of total.
- FY2568 monthly breakdown (from `ปี 2568.pdf` and `New/…(10-03-69).docx`): ส่งกำจัด Jan 370.60 → Dec 331.30 (12 values sum 4,380.10); นำกลับมาใช้ใหม่ sum 1,223.50; เศษอาหาร sum 820.70; เศษกิ่งไม้/ใบไม้ sum 10.40. Matches `4.1(1) บันทึกปริมาณขยะ.xlsx` exactly (sheet `ปริมาณขยะรายเดือน` + `คำนวณ%`).

### 4.2 Target analysis (4.1.3(2))

| Indicator | Target (from ประกาศ เป้าหมายสิ่งแวดล้อม 2568) | FY2567 actual | FY2568 actual | Delta | Result |
|---|---|---|---|---|---|
| ขยะทั่วไป (general waste) | ลดลง 3% จากปี 2567 | 4,307.70 kg | 4,380.10 kg | **+72.40 kg (+1.68%)** | **TARGET NOT MET** |

- The report itself discloses this: `ได้ผลต่างคือมีขยะเพิ่มขึ้น 72.40 กิโลกรัม คิดเป็น 1.68%` — the FY2568 target of −3% general waste was **not achieved** (actual +1.68%).

### 4.3 Reuse/composting (4.1.3(3))

- Actual reuse rate 31.93% — **BELOW the "มากกว่าร้อยละ 50" numeric threshold** in the criterion.
- The report claims 4.1.3(3) via the **alternative branch**: `มีนวัตกรรม` — activities documented: used-packaging upcycling, organic-waste composting (ปุ๋ยหมัก), and the 3Rs activity at the ครั้งที่ 12 "ทรัพยากรไทย" conference (4–10 พ.ย. 2568) converting plastic cups into seedling containers.
- **Honest classification:** 4.1.3(3) is claimed via the innovation/composting branch, NOT via the >50% numeric branch. Do not present 31.93% as meeting ">50%".

### 4.4 Wastewater (4.2.1 / 4.2.2)

- Building wastewater routed to **MJU central SBR treatment plant**; `4.2.1 (1) บันทึกรายละเอียดของสถิติคุณภาพน้ำ ปี 2568.pdf` (#25) contains **verified monthly water-quality statistics** (BOD/COD/SS/TDS/pH/Temp/Cl₂ + treatment-efficiency %) for FY2568, e.g. BOD inf ≤20* / eff ~10, COD inf ≤120* / eff ~25, SS inf ≤30* / eff ~12, TDS inf ≤500* / eff ~240, pH 5.0–9.0, Temp ≤40*, Cl₂ ≤0.3* — **within the legal standard thresholds printed on the form**.
- Effluent tested by บริษัทห้องปฏิบัติการกลาง (ประเทศไทย) จำกัด (accredited lab); results "อยู่ในเกณฑ์มาตรฐานตามที่กฎหมายกำหนด" per ประกาศกระทรวงทรัพยากรธรรมชาติและสิ่งแวดล้อม เรื่อง กำหนดมาตรฐานควบคุมการระบายน้ำทิ้งจากอาคารบางประเภทและบางขนาด พ.ศ. 2548.
- `4.2.2 (4).txt` + `wtms_document[1].aspx` reference **แบบ ทส.1 / แบบ ทส.2** (WTMS online records, building.mju.ac.th bID 18845/18846) — **monthly wastewater discharge records FY2568** (12 monthly ทส.1 PDFs listed in the saved page).
- Grease-trap maintenance: every Friday, cleaning staff, recorded in `บันทึกการตักคราบน้ำมัน และไขมัน` (4p scan, #24/#31).

### 4.5 Scope/context (4.1.1(4))

- อาคารเฉลิมพระเกียรติสมเด็จพระเทพรัตนราชสุดา: total certified area **9,873 m²** (outdoor 1,934 + floor1 3,075 + floor2 2,726 + floor3 2,138). 4 cooperating units (สำนักวิจัยฯ, สถาบัน IQS, สถาบันรับรองระบบฯ, ศูนย์ปรับปรุงพันธุ์ข้าว คณะวิทยาศาสตร์).

### 4.6 Cross-check with existing dashboard data

- `src/data/generated/waste.json` FY2568 (total 5,625.7 kg, avg 468.81, `VERIFIED_BASELINE`) was sourced from `docs/1.5_Waste.xlsx` (คำนวณ% sheet). **This Cat4 XLSX `คำนวณ%` sheet carries identical monthly totals** (468.1…417.4 = 5,625.7) — the Cat4 form and the dashboard baseline agree on the monthly form scope. The Cat4 annual report scope (6,434.70 total) additionally counts เศษอาหาร + เศษกิ่งไม้/ใบไม้ separately. **Disposition:** monthly form total (5,625.7) and annual-report total (6,434.70) are two legitimately different aggregation scopes; the report total is the authoritative annual value. Flag for C2 reconciliation (dashboard total vs report total).
- Note `waste.json` `target` is `TARGET_PENDING_APPROVAL` with no value; Cat4 report target = **−3% general waste vs 2567 (per ประกาศเป้าหมาย 2568)** → this is the defensible FY2568 target fact.

---

## 5. Indicator coverage map (all 5 Cat4 indicators — frozen)

| Indicator | Title (TH, criteria) | FY2568 evidence (verified) | Strength | Gap |
|---|---|---|---|---|
| **4.1.1** | มาตรการหรือแนวทางจัดการขยะที่เหมาะสม + สร้างความตระหนัก/มีส่วนร่วม | `4.1/4.1.1.pdf` (measures 3Rs/8 items), `4.1.1(1)` measures PDF (garbled, cross-verified), `4.1.1(2)` ประกาศเป้าหมาย (scan), `4.1.1(4)` ประกาศบริบท/ขอบเขต (scan), `4.1.1(5)` rณรงค์ลดพลาสติก (txt), annual report | STRONG narrative; scans pending OCR | 4.1.1(3) ปลอดโฟม = **NOT DONE in FY2568** (txt #9 explicitly: ไม่มีการจัดประกาศ เนื่องจากไม่ได้ทำกิจกรรมรณรงค์งดการใช้โฟม; FY2569 has a plan) |
| **4.1.2** | การคัดแยก รวบรวม กำจัดขยะอย่างเหมาะสม | `4.1.2(1)–(3),(6),(7)` txt (bin layout, labels, holding point, contractor monitoring, no burning), `4.1/4.1.2.pdf`, `4.1.2(4)` แบบฟอร์มสุ่มตรวจ (24p scan), `4.1.2(5)` สัญญาจ้าง (scan: บริษัทเชียงใหม่เมืองสะอาด, เลขที่ มจ.(กค.) 9/2568), annual report | STRONG | 2 scans pending OCR (สุ่มตรวจ form, สัญญา) |
| **4.1.3** | นำขยะกลับมาใช้ประโยชน์/ใช้ใหม่ → ขยะส่งกำจัดน้อยลง | `ปี 2566/2567/2568.pdf` (verified data tables), `4.1.3(2)` การวิเคราะห์เทียบค่าเป้าหมาย (verified), `4.1.3(1)` แบบบันทึก 12p (scan), `4.1.3(3)` txt (reuse/compost/3Rs), `4.1.3(4)` txt (trend), XLSX form 4.1(1) | STRONG numeric | 4.1.3(3) numeric **>50% not met** (31.93%) — claim via innovation branch; 4.1.3(4) FY2568 **increased** vs 2567 (+1.68%) — trend claim only true 3-yr window vs 2566 |
| **4.2.1** | การจัดการน้ำเสีย + คุณภาพน้ำทิ้งตามกฎหมาย | `4.2.1(1)` สถิติคุณภาพน้ำ 2568 (verified), `4.2.1(2)-(4)` txt (grease trap, all points, effluent standard), `4.2/4.2.1.pdf`, annual report | STRONG | skimming record 4p scan pending OCR |
| **4.2.2** | การจัดการดูแลการบำบัดน้ำเสีย | `4.2.2(1)` txt (weekly skimming), `4.2.2(2)` txt (ถังหมักรักษ์โลก disposal), `4.2.2(3)` skimming record (scan = G2 dup), `4.2.2(4)` txt (ทส.1/ทส.2 links), `4.2/4.2.2.pdf`, annual report, `wtms_document[1].aspx` (reference) | STRONG | skimming record is the scan; WTMS ทส.1/ทส.2 monthly records are **remote online evidence** — reference links only, not in repo |

**All 5 indicators have dedicated evidence — no GAP/MISSING at indicator level.** The honest caveats are: (a) 4.1.1(3) ปลอดโฟม = not implemented in FY2568 (explicit source statement), (b) 4.1.3(3) numeric >50% threshold not met (claim via innovation branch), (c) 4.1.3(4) FY2568 increased vs 2567, (d) 8 unique scan contents across 10 scan path instances pending OCR, (e) 1 garbled-text PDF verified by cross-reference, (f) WTMS online records are external references, (g) no signed/approved copy.

---

## 6. Files NOT in manifest — disposition freeze

| # | File | Verdict |
|---|---|---|
| 2–6 | `4.1/4.1.1–4.1.3.pdf`, `4.2/4.2.1–4.2.2.pdf` | **DRAFT section narratives** → SUPERSEDED by 10-03-69 report; keep frozen on disk, exclude from publication |
| 7 | `4.pdf` | **DRAFT compiled export** → SUPERSEDED by `10-03-69.pdf`; exclude |
| 34 | `New/… (10-03-69).pdf` | **EXPORT** of canonical report → publish (add to manifest in C2) as report PDF export |
| 35 | `wtms_document[1].aspx` | **Reference artifact** (WTMS page listing monthly ทส.1) → exclude from publication; record as external reference URL |
| 36–38 | `ปี 2566/2567/2568.pdf` | **Verified data tables → PROMOTE** to indicator evidence (4.1.3(1)/(4)) in C2 |
| 40 | `แบบ ทส. 2.txt` | Non-evidence label → exclude |
| 41–42 | `แบบบันทึกปริมาณน้ำหนักขยะ ปี 2566/2567.pdf` | FY2566/67 monthly-log scans (supporting trend) → optional supporting evidence; pending OCR |
| 43 | `แบบบันทึกปริมาณน้ำหนักขยะ ปี 2568.pdf` | **Byte-identical duplicate** of `4.1.3 (1)` → exclude from publication (keep canonical 4.1.3(1)) |

**Net publication-delta recommendation for Phase C:** promote `ปี 2566/2567/2568.pdf` (verified tables) + `10-03-69.pdf` (export) as manifest additions; exclude drafts/reference/duplicates. Decisions are frozen for architect approval.

---

## 7. Blockers / PO decisions required

| # | Blocker | Owner | Evidence |
|---|---|---|---|
| B1 | 4.1.1(3) ปลอดโฟม NOT implemented in FY2568 — criterion item missing. FY2569 has a plan (txt #9). Decide presentation (disclosed gap) vs requiring additional evidence. | PO / data owner | `4.1.1 (3) .txt` |
| B2 | 4.1.3(3) >50% reuse numeric not met (31.93%) — claim rests on innovation/compost branch. Confirm which branch Cat4 certifies. | PO / data owner | `4.1.3 (3).txt`, report table 31.93% |
| B3 | 4.1.3(4) FY2568 general waste **increased** +1.68% vs 2567 (target −3% NOT met). Confirm honest presentation of "แนวโน้มลดลง" (only true vs 2566). | PO / data owner | `4.1.3 (2)` analysis + `ปี 2568.pdf` |
| B4 | **8 unique scan contents across 10 scan path instances** (ประกาศเป้าหมาย, ประกาศบริบท, แบบฟอร์มสุ่มตรวจ, สัญญาจ้าง, แบบบันทึก 2566/2567/2568, บันทึกตักคราบ; 10 paths because แบบบันทึก2568 duplicates 4.1.3(1) and บันทึกตักคราบ appears under both 4.2.1 and 4.2.2) — need OCR or human verification before `verified` claims. | data owner | extraction: 0 text chars on 10 paths |
| B5 | Garbled-text `4.1.1 (1)` measures PDF — glyph layer unreadable; verified only by cross-reference in `4.1/4.1.1.pdf`. OCR recommended. | data owner | fitz+pdfplumber mojibake |
| B6 | WTMS แบบ ทส.1/ทส.2 monthly records are external online evidence (building.mju.ac.th) — decide link-out vs download-to-repo. | PO / data owner | `4.2.2 (4).txt`, `wtms_document[1].aspx` |
| B7 | No signed/approved copy of the annual report exists in the source set. Report = historical baseline; no submission claim. | PO | all DOCX/PDF — no signature block |
| B8 | Dashboard `waste.json` total (5,625.7, form scope) vs Cat4 report total (6,434.70, annual scope) — reconcile definition in C2. | PO / architect | XLSX `คำนวณ%` vs report tables |

---

## 8. Phase C action summary (frozen)

1. Map canonical `New/… (10-03-69).docx` as ANNUAL_REPORT (category-level); `10-03-69.pdf` as its export; `02-03-69.docx` marked `supersededBy`; `4.pdf` + section PDFs excluded.
2. Promote `ปี 2566/2567/2568.pdf` as 4.1.3 data evidence (verified). Keep `4.1.3 (1)` canonical for the FY2568 monthly log; mark root `แบบบันทึก…2568.pdf` duplicate.
3. Indicator contracts (4.1.1–4.2.2) carry: verified narrative + numeric facts (§4), scan items `pending`, garbled measures cross-verified, 4.1.1(3) disclosed gap, 4.1.3(3) innovation-branch claim, WTMS external reference.
4. Dashboard waste KPI: record FY2568 general waste 4,380.10 kg (annual) + 31.93% reuse as canonical annual facts; reconcile form-total scope note with `waste.json`.
5. No FY2569 facts are added. FY2569 layer remains "awaiting verified sources" (only 4.1.1(3) FY2569 plan is mentioned in source txt — record as forward statement, not verified fact).
