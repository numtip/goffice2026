# GO-CAT6-PHASE-A: Source Disposition + Decision Freeze

**Date:** 2026-08-24 (Asia/Bangkok)
**Status:** DECISION FREEZE — reads only; no runtime/data mutation of FY2568 sources
**Repository HEAD baseline:** `5e36e1fc1f0367cc0b59bcf4186f283552d599ff` (branch `fix/cat5-action-plan-semantic-mapping`)
**Authority:** official Green Office 2569 criteria only (`src/data/criteria/indicators.json` cat6 = 6.1.1–6.1.3, 6.2.1–6.2.3) · frozen FY2568 Cat6 sources as the baseline layer for FY2569 · Cat4/Cat5 source-disposition templates (format only — no facts copied)
**NOT used as taxonomy:** `docs/context-packs/GREENOFFICE_2569_CONTEXT.md` (its Cat6 = Transport mapping is **wrong** for this disposition; Cat6 here = การจัดซื้อและจัดจ้าง / Procurement)
**Scope:** Resolve Cat6 (หมวด 6 การจัดซื้อและจัดจ้าง) FY2568 evidence/version/criterion decisions before Phase B/C implementation. **Independent verification — Cat4/Cat5 findings not assumed.**

---

## 0. FY2568 source baseline reconciliation

Source (read-only, private OneDrive location): `Data2568/หมวด6` — **32 physical files**, **106,547,663 bytes** total (31 PDF + 1 DOCX), live `Get-ChildItem -Recurse -Force -File`.

- **Manifest reconcile: 32/32 manifest docs match source by SHA-256 + size** (verified live; `src/data/fy2568-publication.json` `categories.cat6` = 32 docs, declared bytes 106,547,663 = actual sum 106,547,663; **0 sha/size mismatches**).
- **Path reconcile: 32/32** — every source relative path appears in the manifest and vice-versa; no source-not-in-manifest, no manifest-not-in-source.
- **Repo mirror `public/documents/fy2568/cat6/` = complete and byte-identical: 32/32 SHA-256 verified** (32 files, 106,547,663 B).
- **Byte-identical duplicates: none** (no shared SHA-256 group; no size collision).
- **Content-duplicate candidate pairs: 2** (same embedded scan images re-exported for two indicators, different PDF wrapper bytes; each kept as a separate `sourceRef` flagged `contentDuplicateCandidate` — no dedup) — see §2.
- **1 FY2569-contamination file EXCLUDED from FY2568 evidence mapping** — `สัญญาจ้างทำความสะอาด 69.pdf` (**QUARANTINE · `candidateFy2569Only`**, see §5 `FY2569_CONTRACT_QUARANTINED`).
- **12 files are image-only scans** classified `scan_only` (no OCR/transcription performed in this phase); **14 PDFs + 1 DOCX carry a readable text layer** (19 text-bearing PDF paths, of which 5 are photo/caption pages — see §1/§2 classification).
- The annual report DOCX `รายงานหมวด6 (แก้ไข) 17-3-69.docx` is the **only fully content-verified source covering all 6 indicators** (text extracted read-only).

### Deterministic 32-file inventory (relative path · type · bytes · SHA-256)

| # | Relative path | Type | Bytes | SHA-256 | Class |
|---|---|---|---|---|---|
| 1 | `6.1 การจัดซื้อสินค้า/6.1.1(1) 1 คำสั่งGreen Office 68.pdf` | PDF | 2,624,997 | 9557573e0268f9d949d5e6cbf89271ac87a7fd33d97bad9225961e774de1c4dc | verified |
| 2 | `6.1 การจัดซื้อสินค้า/6.1.1(2) 1 ค้นหารายการสินค้าที่เป็นมิตรกับสิ่งแวดล.pdf` | PDF | 730,768 | 49e3ee23887829d16806ac0a1f12cf770eb5f261a9b50ad477153b5e648f3b19 | verified |
| 3 | `6.1 การจัดซื้อสินค้า/6.1.1(3) 1 รายการสินค้าที่เป็นมิตรกับสิ่งแวดล้อม+ทบทวน.pdf` | PDF | 1,225,502 | da42fda6f3c4260a57b9821c747ac8becbe3fba577ea2aa4a81bc608e17f1aa1 | verified |
| 4 | `6.1 การจัดซื้อสินค้า/6.1.1(3) 2 แผนการดำเนินการโครงการสำนักงานสีเขียวฯ.pdf` | PDF | 78,247 | 75bfacf41b62b1a2e85c692f13ec3dcd8f538a66aa6725deba29a7d66be23e00 | scan |
| 5 | `6.1 การจัดซื้อสินค้า/6.1.1(4) 1 หนังสือขอความร่วมมือ.pdf` | PDF | 3,432,408 | 898b00e3b364a239ced55dc7fe95cd56002b1ecf44c750902bd197761fb1af2d | scan |
| 6 | `6.1 การจัดซื้อสินค้า/6.1.1(4) 2 แบบตอบรับ.pdf` | PDF | 883,504 | 18a186f95868a16fefb3033d69910667ab126832c707e7ae33f27f2c30af1afe | scan |
| 7 | `6.1 การจัดซื้อสินค้า/6.1.1.pdf` | PDF | 1,424,233 | 95cd849e622525f9802b49d7d1e152ce1a494bb50090ab24399e1fe6d0355776 | verified |
| 8 | `6.1 การจัดซื้อสินค้า/6.1.2.pdf` | PDF | 413,517 | 0e180beccaa77379966437fcaf1a480b8111547c0e42eac022e4245637f808d2 | verified |
| 9 | `6.1 การจัดซื้อสินค้า/6.1.3(1) 1 ภาพถ่ายรายการสินค้าที่เป็นมิตรกับสิ่งแวดล้อมภายในอาคารฯ.pdf` | PDF | 225,903 | c0a84cd941668cb73fbb352393fe23a396acf1fc0c14d50c53413458146b5b6c | photo label |
| 10 | `6.1 การจัดซื้อสินค้า/6.1.3.pdf` | PDF | 291,017 | 02032e658260ece880551832588ad3c11220a05d8a34f5890f2be8a6e2da58b4 | verified |
| 11 | `6.2 การจัดจ้าง/6.2.1(1) 2 รับรองฉลากเขียว_บริษัท เควี เพสท์ จำกัด.pdf` | PDF | 215,429 | 167b4b80a6b28a46a5b37dabaf3ae751931356e916c2815e086c038ca14f6599 | scan |
| 12 | `6.2 การจัดจ้าง/6.2.1(1) 3 รับรองเครื่องถ่ายเอกสารฉลากเขียว.pdf` | PDF | 439,491 | 449a96d799c08edcd6b32eee9121bc64440b28c62a5c173f0714d884f71806dd | photo label |
| 13 | `6.2 การจัดจ้าง/6.2.1(2) 1 ใบประเมินด้านสิ่งแวดล้อมฯ จ้างเหมาทำความสะอาดอาคารฯ.pdf` | PDF | 15,018,069 | d1e52def30ac74575782bbfe623847af2612e2c9f340f7734626f4244e6fc26e | scan |
| 14 | `6.2 การจัดจ้าง/6.2.1(2) 1 รายงานจัดซื้อจัดจ้าง ฟอร์มใหม่.pdf` | PDF | 206,974 | 3296cbf456e238ea67c0013de5710b6f130e7f93d1639994d3921c46a88daa6d | verified |
| 15 | `6.2 การจัดจ้าง/6.2.1(2) 2 ภาพถ่ายการส่งมอบผลิตภัณฑ์.pdf` | PDF | 199,801 | 5ed4394a4f6974a8cde96dcb33d82f6183996e0bdd97cf1d2f6988955ac37dcc | photo label |
| 16 | `6.2 การจัดจ้าง/6.2.1(2) 4 ใบประเมินด้านสิ่งแวดล้อมฯ ล้างเครื่องปรับอากาศ.pdf` | PDF | 426,286 | 6b849103a5b7024a5ddd07e6c0f9cebd2ed683f45ef6ca42ad0fe1e663c1ea5a | scan |
| 17 | `6.2 การจัดจ้าง/6.2.1(2)3 หนังสือรับรองผลิตภัณฑ์.pdf` | PDF | 700,724 | b0a6e36372071cb4ea606073de4ab346fdc63b46626aff1d0341188998230908 | scan |
| 18 | `6.2 การจัดจ้าง/6.2.1(3) 1 สัญญาจ้างทำความสะอาด 68.pdf` | PDF | 22,842,025 | 199bfb355a03e87aa3727de6c41e8118e0e8ceb5ffaf48164b9ce3a25a02258e | scan |
| 19 | `6.2 การจัดจ้าง/6.2.1(3) 1 สัญญาจ้างทำความสะอาด 69.pdf` | PDF | 5,803,901 | 60422788a6af3877324abc0581c0561dd467be29cba26174465fe436bc3d9b24 | scan · **QUARANTINE · `candidateFy2569Only`** |
| 20 | `6.2 การจัดจ้าง/6.2.1(3) 2  ใบอนุญาตปฏิบัติงานและข้อตกลงด้านสิ่งแวดล้อม.pdf` | PDF | 4,004,706 | 7c38f509a2085d756ad7f48fb4d00967e0547a239d27df282415e2a09d70811f | scan |
| 21 | `6.2 การจัดจ้าง/6.2.1(4) 1 ประกาศคณะฯ เรื่องนโยบาย ปี 2568.pdf` | PDF | 806,614 | 8279d1767003ee6a71ec61450bf1a13f6230f53cfdbc9501f4646d376bd9a973 | photo label |
| 22 | `6.2 การจัดจ้าง/6.2.1(4) 2 ภาพถ่าย ลายเซ็นการชี้แจงนโยบายสิ่งแวดล้อม.pdf` | PDF | 562,228 | ca840fcdc7f8170b4d84154d1bdb0f1afa7d14b8cd69fe8275df90f1333f9e9c | photo label |
| 23 | `6.2 การจัดจ้าง/6.2.1.pdf` | PDF | 1,559,884 | 992c398b40c2e778b14a61ae1f9a9c6a1921a542ede5fb7af02fb137d31fa7c6 | verified |
| 24 | `6.2 การจัดจ้าง/6.2.2(1) 1 ใบประเมินด้านสิ่งแวดล้อมฯ จ้างเหมาทำความสะอาดอาคารฯ.pdf` | PDF | 15,017,319 | f49e64cc18e5e9094ce6476fcbe1310f0750ab98b937149aa6de6141a1232c11 | scan |
| 25 | `6.2 การจัดจ้าง/6.2.2(1) 2 หนังสือแจ้งผลการประเมินประสิทธิภาพการปฏิบัติงาน.pdf` | PDF | 90,721 | 1e7bcc75c58b73b5aea3d583248d4f9ea3395b6a40ef0dcda03461774969e07a | verified |
| 26 | `6.2 การจัดจ้าง/6.2.2(2 )1 ใบประเมินประสิทธิภาพผู้รับจ้างล้างเครื่องปรับอากาศ.pdf` | PDF | 426,097 | a1987d770932e87a30a914bdd128f58c475d226fe149d2dd6ecd7905658e16ca | scan |
| 27 | `6.2 การจัดจ้าง/6.2.2.pdf` | PDF | 329,011 | 103f8944f7ad2566e26744db3d92ac665a223373eecb59d2097ecc5b081d04aa | verified |
| 28 | `6.2 การจัดจ้าง/6.2.3(1) 1 แหล่งสืบค้นข้อมูลโรงแรมที่เป็นมิตรกับสิ่งแวดล้อมจากเว็บไซต์.pdf` | PDF | 442,284 | f27fa5bc37feef85958d836a203b976dacaef95f3beec9a58977ba2f78a370c6 | verified |
| 29 | `6.2 การจัดจ้าง/6.2.3(1) 2 ตัวอย่างโรงแรมที่เป็นมิตรกับสิ่งแวดล้อมที่เลือกมา.pdf` | PDF | 276,393 | 1c759513b7de810c7ea7332413c824debc308b4e3549a0eeca9ee5ef548fa87e | verified |
| 30 | `6.2 การจัดจ้าง/6.2.3(1) 3 การคัดเลือกสถานที่ที่เป็นมิตรกับสิ่งแวดล้อม.pdf` | PDF | 124,832 | ddf5a1fdb09ff7cd056b119de2f0d53bdf56343602ff231fe91dbd25897df5b0 | verified |
| 31 | `6.2 การจัดจ้าง/6.2.3.pdf` | PDF | 683,621 | e2ca5a7492512c0b702da6e2be9d4d5e6c836a5da36b49af88945bc5dd6be5e8 | verified |
| 32 | `รายงานหมวด6 (แก้ไข) 17-3-69.docx` | DOCX | 25,041,157 | 523210c53e46a5294bf36383d899c277f4e2729fb4cd44e7c4077e9aa00a787f | verified |

**Total: 32 files · 106,547,663 bytes ✓ (matches manifest `categories.cat6.count`=32, `bytes`=106547663).**

---

## 1. DOCX annual report (canonical cross-reference)

| Property | Value |
|---|---|
| File | `รายงานหมวด6 (แก้ไข) 17-3-69.docx` (#32) — CANONICAL FY2568 annual report |
| baselineDataYear | **2568** |
| revisionDate | **2569-03-17** |
| core author / lastModifiedBy | Computer Service Unit / Thipsuda Pookmanee |
| revision | 13 |
| created / modified | 2026-03-16 15:26 UTC / 2026-03-16 16:18 UTC (= 17 Mar 2569 BE, Asia/Bangkok) |
| core title (metadata) | แบบสำรวจการจัดซื้อผลิตภัณฑ์ที่เป็นมิตรต่อสิ่งแวดล้อมที่มีการใช้งานในหน่วยงานรัฐ (survey-template title) |
| content title | หมวดที่ 6 การจัดซื้อและจัดจ้าง (full category report) |
| paragraphs / tables | 412 / 2 (14 rows) · 14,233 text chars |

Notes:
- `baselineDataYear: 2568` / `revisionDate: 2569-03-17` — the report's data year is **FY2568**; it was revised 17 March 2569 (BE). Only facts the report explicitly marks as FY2568 are used in §4; nothing is inferred from the revision date.
- Filename `17-3-69` is a **calendar date** (17 March 2569 BE), not a fiscal-year marker.
- Core-title metadata is a survey-template artifact and does **not** describe the content; the content is the complete Cat6 FY2568 report (covers all 6 indicators + the FY2568/FY2569 cleaning-contract reference). Keep the file name as the stable reference.

---

## 2. Duplicate / content-pair verdicts

### 2.1 Byte-identical duplicates

**None** — no shared SHA-256 across the 32 files.

### 2.2 Content-duplicate pairs (same embedded scan images, different PDF wrapper)

| Pair | Files (sha256 differs; embedded-image digests identical on every page) | Verdict |
|---|---|---|
| P1 | `6.2.1(2) 1 ใบประเมินด้านสิ่งแวดล้อมฯ จ้างเหมาทำความสะอาดอาคารฯ.pdf` (#13, 34p, 15,018,069 B) ≡ `6.2.2(1) 1 ใบประเมินด้านสิ่งแวดล้อมฯ จ้างเหมาทำความสะอาดอาคารฯ.pdf` (#24, 34p, 15,017,319 B) | Same 34-page cleaning-contractor environmental-evaluation pack exported twice. The annual report references it under **both** 6.2.1(2) and 6.2.2(1). Flag **both** as `contentDuplicateCandidate`; keep **each path's own `sourceRef`** — no `duplicateOf`, no deduplication. |
| P2 | `6.2.1(2) 4 ใบประเมินด้านสิ่งแวดล้อมฯ ล้างเครื่องปรับอากาศ.pdf` (#16, 1p, 426,286 B) ≡ `6.2.2(2 )1 ใบประเมินประสิทธิภาพผู้รับจ้างล้างเครื่องปรับอากาศ.pdf` (#26, 1p, 426,097 B) | Same 1-page AC-cleaning evaluation form exported twice; referenced under both 6.2.1(2) and 6.2.2(2). Flag **both** as `contentDuplicateCandidate`; keep **each path's own `sourceRef`** — no `duplicateOf`, no deduplication. |

### 2.3 Year-leakage

- `สัญญาจ้างทำความสะอาด 69.pdf` (#19) is a **FY2569-budget cleaning contract** — **QUARANTINE · `candidateFy2569Only`** (see §5).
- No other filename carries a fiscal-year marker beyond the FY2568 set (`คำสั่ง…68`, `สัญญา…68`, `ประกาศ…ปี 2568`); the DOCX `69` is a calendar date (see §1).

---

## 3. Six-indicator evidence matrix (primary source · readability · verification)

Method: actual text extraction (PyMuPDF) for every PDF; DOCX read directly (python-docx); **no OCR, no invented content**. Classification: `verified` = readable text layer; `photo label` = text layer is only a caption over an image; `scan` = image-only (12 files), mapped at filename/folder level only.

| Indicator | Primary source path(s) | Strength | Verification | Gap |
|---|---|---|---|---|
| 6.1.1 จัดซื้อสินค้าที่เป็นมิตรต่อสิ่งแวดล้อม | #1 order, #2 search-sources, #3 product list+review, #4 GO plan (scan), #5 request letter (scan), #6 response form (scan), #7 narrative + report §6.1.1 | Strong | verified (order web-printout, search sources, Form 6.1(1) list w/ label+expiry+review 4 Jun 2568) | #4/#5/#6 scans pending OCR |
| 6.1.2 รายงานการจัดซื้อวัสดุอุปกรณ์ฯ ที่เป็นมิตร | #8 narrative (incl. % table), #14 Form 6.1(2) procurement report, + report §6.1.2 | Strong | verified_content (FY2568 table 92.33% / 89.80% vs >40% target) | — |
| 6.1.3 ร้อยละปริมาณ/ประเภทวัสดุอุปกรณ์ฯ ที่เป็นมิตร | #9 photos (label), #10 narrative + report §6.1.3 | Medium | verified narrative; photo pages are image content | **PERCENT_NOT_EVIDENCED** (report declares "สุ่มตรวจ –") |
| 6.2.1 จัดจ้างหน่วยงาน/บุคคลที่ดำเนินงานเป็นมิตรฯ | #11 green-label cert cleaning (scan), #12 photocopier cert (label), #13 eval pack (scan), #14 Form 6.1(2), #15 delivery photos (label), #16 AC eval (scan), #17 product cert (scan), #18 cleaning contract 68 (scan), #20 work permit+env agreement (scan), #21 policy 2568 (label), #22 signature photos (label), #23 narrative + report §6.2.1 | Strong | verified narrative (4 engagements, 100% declared) + Form 6.1(2) | #11/#13/#16/#17/#18/#20 scans pending OCR; #19 contract 69 = QUARANTINE · `candidateFy2569Only` (excluded from FY2568 mapping) |
| 6.2.2 ตรวจสอบการดูแลสิ่งแวดล้อมในพื้นที่ปฏิบัติงาน | #24 eval pack (scan), #25 eval-result letter (verified, 30 Sep 2568, ระดับดีมาก), #26 AC eval (scan), #27 narrative + report §6.2.2 | Strong | verified letter + narrative (monthly evaluation) | #24/#26 scans pending OCR |
| 6.2.3 แนวทางการเลือกใช้บริการเป็นมิตรฯ (นอกสำนักงาน) | #28 hotel sources, #29 example hotels, #30 Form 6.2(3) selection, #31 narrative + report §6.2.3 | Strong | all verified_content (sources, examples, form, narrative) | no external eco service used in FY2568 (declared) |

**Coverage: 6/6 indicators resolve to ≥1 valid manifest document** (enforced deterministically in Phase B by a manifest↔contract↔evidence gate). The FY2569-budget cleaning contract (#19) is excluded from FY2568 evidence mapping and is **not counted as FY2569 evidence** (see §5 locked disclosure).

---

## 4. Verified facts safe for FY2568 presentation

Extracted read-only from the content-verified annual report DOCX + section narratives + Form 6.1(2). **Only facts the documents explicitly mark as FY2568 (or explicitly labeled by their own fiscal year within the FY2568 report) are listed**; no figure is inferred. These are **source-declared FY2568 facts, not scoring claims**:

- Building: อาคารเฉลิมพระเกียรติสมเด็จพระเทพรัตนราชสุดา มหาวิทยาลัยแม่โจ้; **4 หน่วยงาน** (สำนักวิจัยและส่งเสริมวิชาการการเกษตร · สถาบันบริการตรวจสอบคุณภาพและมาตรฐานผลิตภัณฑ์ · สถาบันรับรองระบบการผลิตผลิตภัณฑ์การเกษตร · ศูนย์ปรับปรุงพันธุ์ข้าว คณะวิทยาศาสตร์).
- **6.1.2 eco-procurement (source-declared):** FY2568 = **92.33%** by volume / **89.80%** by value vs handbook target **>40%**; FY2567 = 70 / 78.99; FY2566 = 44.81 / 63.63.
- **6.2.1 engagements Jan–Dec 2568 (4 รายการ, source-declared 4/4 = 100%, total 515,367.88 บาท):** 1) cleaning — บริษัท เควี เพสท์ จำกัด (ฉลากเขียว certified; 373,344.00 บาท) 2) AC cleaning — หจก.สยามแพลตินั่ม ซิลเต็ม (env. evaluation >70%; 13,080.00 บาท) 3) elevator maintenance — บริษัท ฮิตาซิ (ประเทศไทย) (env. evaluation >70%; 95,299.00 บาท) 4) photocopier rental — บริษัท ริโก้ เซอร์วิสเซส (ประเทศไทย) (ฉลากเขียว certified, Ricoh IM C2010; 33,644.88 บาท).
- **6.2.1(3):** FY2568 cleaning contract + TOR requires eco-certified cleaning products (contract covers both งบ 2568 and งบ 2569; the **68 contract** is the FY2568 source; the **69 contract is QUARANTINE · `candidateFy2569Only` — not counted as FY2568 or FY2569 evidence here**).
- **6.2.1(4):** policy/Green Office communication to contractors; briefing session with cleaning staff **27 ตุลาคม 2568**.
- **6.2.2:** cleaning contractor evaluated **monthly** (คณะกรรมการตรวจรับ); evaluation-result letter to เควี เพสท์ dated **30 กันยายน 2568**, result **ระดับดีมาก**.
- **6.2.3:** no external hotel/venue eco service used in FY2568/FY2567 (in-building meeting rooms); selection guideline = Form 6.2(3); Green Meeting measures defined in the energy/resource-control measures (ข้อ 5).

**NOT safe / unverified:** any figure inside the 12 scan-only files until OCR/human verification; anything implying FY2569 results; any PASS/score judgment — the figures above are presented as source-declared facts only.

---

## 5. Locked disclosures (decision freeze)

| Code | Disclosure |
|---|---|
| `FY2569_CONTRACT_QUARANTINED` | `6.2.1(3) 1 สัญญาจ้างทำความสะอาด 69.pdf` is a **FY2569-budget contract**; **excluded from all FY2568 records / evidence mapping** (remains in manifest/source as a frozen file, **`candidateFy2569Only`** — a candidate to be re-examined in the FY2569 cycle, **not FY2569 evidence now**; never call/count it as FY2569 evidence). The FY2568 twin `… 68.pdf` is canonical for 6.2.1(3). |
| `EVAL_FORM_CONTENT_DUPLICATES` | P1 (34p cleaning eval pack: #13 ≡ #24) and P2 (1p AC eval form: #16 ≡ #26) are same-scan re-exports for two indicators — flag **each** as `contentDuplicateCandidate`, keep **each path's own `sourceRef`** — no `duplicateOf`, no deduplication. |
| `CAT613_PERCENT_NOT_EVIDENCED` | 6.1.3 percentage of eco office materials is **not numerically evidenced** (report declares "สุ่มตรวจ –"). |
| `SCAN_ONLY_FILES` | 12 image-only scans stay `filename_folder_only`; **no OCR/transcription in this phase**. |
| `DOCX_TITLE_METADATA_QUIRK` | DOCX core title is a survey-template string; content is the full Cat6 report. Filename `17-3-69` = calendar date (17 Mar 2569 BE), not a fiscal-year marker. |

---

## 6. FY2569 baseline-layer principle

FY2568 Cat6 is the **baseline layer for FY2569**:

- Every contract record carries `baselineYearLabel` ("ข้อมูลฐานปี 2568") and `fy2569Status: "awaiting-update"`.
- Recurring evidence streams declared per-record via `fy2569Recurrence`: 6.1.2 % annual (FY2569 % to be produced), 6.1.1(3) product-list review (review cadence June), 6.2.1(3) cleaning contract — **`69.pdf` = `candidateFy2569Only` (candidate for the FY2569 cycle; not counted as FY2569 evidence now)**, 6.2.1(4) policy briefing annual, 6.2.2 monthly evaluations continuous, 6.2.3 as-needed.
- **Never relabel a FY2568 result as FY2569** — the FY2568 percentages (92.33/89.80), the 27 ตุลาคม 2568 briefing, and the 30 กันยายน 2568 evaluation letter are permanently FY2568 facts.
- Static infrastructure (search sources, Form 6.1(1) list, Form 6.1(2) report template, Form 6.2(3) selection form, policy, evaluation forms) is reusable baseline unless changed.

## 7. Implementation artifacts (Phase B — recommended, not executed here)

- `src/data/category6/category6-manifest.json` + `procurement.json` (6.1.x) / `contracting.json` (6.2.x) — canonical static contracts (schema mirrors Cat4/Cat5).
- `src/data/evidence-index.json` — 6 indicator-level entries `ev-cat6-*-fy2568` (do NOT touch evidence-index in this phase).
- `scripts/validate-category6-contracts.mjs` — deterministic gate: manifest↔contract↔evidence path/hash equality, 6/6 coverage, locked disclosures (QUARANTINE · candidateFy2569Only, contentDuplicateCandidate, PERCENT_NOT_EVIDENCED).
- Presentation wiring reuses the Cat3–5 architecture (management cycle + domain snapshot on category page; contract context + source documents on indicator pages). **No score, no PASS claim, no FY2569 claim.**

## 8. Gaps / data-owner questions

1. **งบ 69 contract** — confirm QUARANTINE of `สัญญาจ้างทำความสะอาด 69.pdf` from FY2568 mapping; record it as `candidateFy2569Only` and decide its FY2569-cycle disposition in the FY2569 phase (**not counted as FY2569 evidence here**).
2. **Content-duplicate candidate pairs P1/P2** — confirm flagging both as `contentDuplicateCandidate` while keeping **each path's own `sourceRef`** (34p cleaning pack; 1p AC form) — no `duplicateOf`, no deduplication.
3. **6.1.3 percentage** — confirm how the FY2569 6.1.3 % will be produced (survey instrument / random-check tally), since FY2568 declares "สุ่มตรวจ –" without a number.
4. **OCR scope** — approve OCR/manual transcription for the 12 scan-only files before their contents may be quoted.
5. **Report ownership** — DOCX core author "Computer Service Unit" / lastModifiedBy "Thipsuda Pookmanee"; confirm the data owner to contact for FY2569 updates and any corrections.

---

*Read-only Phase A — no OneDrive, manifest, runtime, evidence-index, route, or deploy changes made. Local source paths are not committed to the repository; the mirror `public/documents/fy2568/cat6/` is unchanged (32/32 SHA-verified).*

**Git state:** the only repository change from this task is **1 untracked deliverable file** — `docs/data/GO-CAT6-PHASE-A-SOURCE-DISPOSITION.md`. **No tracked files modified; no commit created.** Other untracked entries (`data/clips/`, `docs/1-6/`, `docs/1.4*.docx`, `public/images/engage/2026/...`) pre-date this task and are untouched.
