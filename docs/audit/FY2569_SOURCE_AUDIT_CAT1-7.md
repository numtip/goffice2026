# FY2569 Source & Provenance Audit — Cat1–Cat7

| Field | Value |
|---|---|
| **Date** | 2026-08-28 |
| **Auditor** | Local SOURCE/PROVENANCE AUDIT subagent (read-only; evidence-computed SHA-256, no human verification performed) |
| **Purpose** | Produce a truthful, evidence-grounded FY2569 source audit: enumerate every file in the FY2569 canonical source folder (`Data2569`), hash the FY2569 operational metric workbooks, cross-check published dataset provenance, and record a machine-readable provenance registry. |
| **Constraint** | No existing repo file modified. Only two new files created: this report and `src/data/audit/fy2569-dataset-provenance.json`. |

---

## 1. Scope, Method, and Sources

**Canonical FY2569 evidence source (read-only):**
`RAE-Document-Center/07-GreenOffice/Data2569` (OneDrive) — repository-independent; staged under `data/staging/source/`.

**FY2569 operational metric workbooks (read-only):**
`RAE-Document-Center/07-GreenOffice/Resource` (OneDrive) — repository-independent; staged under `data/staging/source/`.

**Repo-local truth used for cross-checking (not modified):**
- `data/staging/manifest.json` — PHASE2-SYNC staging manifest (`files[].sha256`, `observedMonths`, `datasetState`)
- `data/staging/extract-sources.json` — FY2569 extraction provenance (`sourceWorkbook`, `sourceSheet`, `sourceSha256`, `extractionDate`, `coverage`, `workbookTotalInvalid`)
- `src/data/generated/{energy,water,fuel,paper,waste,ghg}.json` — `years["2569"].provenance` blocks (`verification.status = "available_unverified"`)
- `src/data/evidence-index.json` — 19 items with `"year": 2569`
- `src/data/progress/indicator-progress-2569.json` — 65-indicator FY2569 status registry

**Method:** `Get-ChildItem -Recurse -File` + `Get-FileHash -Algorithm SHA256` + `LastWriteTime` for every file. Thai filenames are preserved (UTF-8); they render as mojibake only in the console, not in this file.

---

## 2. Headline Results

| Category | Files present in Data2569 | Published under `public/documents/fy2569` | Registry evidence state (FY2569) |
|---|---|---|---|
| Root (criteria/guidance) | 3 | n/a | n/a |
| Cat1 | 8 | 8 | 1.1.1–1.2.1 available_unverified (1.1.4 verified) |
| Cat2 | 22 | 12 | 2.1.1, 2.1.2, 2.2.1, 2.2.2 available_unverified; 2.2.3, 2.2.4 unavailable |
| Cat3 | 2 | 2 | 3.1.1, 3.2.1, 3.2.4, 3.3.1, 3.3.4, 3.4.1 available_unverified (plan-only) |
| Cat4 | 0 | 0 | all unavailable |
| Cat5 | 0 | 0 | all unavailable |
| Cat6 | 0 | 0 | all unavailable |
| Cat7 | 0 | 0 | all unavailable |
| **Total** | **35** | **22** | |

- **Resource workbook SHA-256 cross-check: 6/6 MATCH** — every FY2569 workbook hash computed from `Resource` equals `data/staging/manifest.json` and the `src/data/generated/*.json` `years["2569"].provenance.sourceSha256`. Staged copies in `data/staging/source/` also match (8/8, incl. the two FY2568 workbooks).
- **Evidence-index cross-check: 19/19 content MATCH** — every year-2569 evidence item's `manifestSha256` exists in Data2569 (byte-identical content). 16 exact filename matches; 3 trainer-CV entries differ only in whitespace (double-space vs single-space in Thai filename).
- **Published-folder cross-check: 22/22 MATCH** — every file under `public/documents/fy2569` is byte-identical to its Data2569 source (same SHA-256).
- **No operational metric workbooks exist under Data2569** — all six FY2569 metric workbooks live only in the `Resource` folder.

---

## 3. Per-Category File Inventory

Legend for verification state:
- `available_unverified` — file is present and machine-extracted/ingested; human verification pending.
- `unavailable` — no FY2569 file exists for this indicator.
- `held` — file exists but is withheld from publication (see Gaps & Dispositions).

### 3.1 Root — criteria / guidance (3 files)

| File (Data2569 root) | SHA-256 | Size (B) | Modified (ICT) | State |
|---|---|---|---|---|
| `GreenAssessmentCriteria2569.pdf` | `e5ea60433ae6b350115c55824253f758cd825e1c34891bcf6614efe55eeab9a7` | 1,051,724 | 2026-06-11 14:12:44 | reference |
| `เกณฑ์การประเมินGreen Office_2569.txt` | `6782219577148e3526d377585f318c993dc5af89f1d5bb0e25f537f6b84debda` | 19,988 | 2026-08-20 13:09:05 | reference |
| `แนวทางการอัปโหลดไฟล์ Green Office ปี 2569 สำหรับสมาชิกแต่ละหมวด 1.docx` | `03bad3ce6a826b0546a54a881b83b8d0334e61d235e5d1dd0b5d82ff8246b621` | 17,008 | 2026-08-20 13:23:39 | reference |

### 3.2 Cat1 — 8 files present (1.1.1, 1.1.2, 1.1.3, 1.1.4, 1.2.1)

| File (relative under Data2569) | SHA-256 | Size (B) | Modified (ICT) | Indicator(s) | State |
|---|---|---|---|---|---|
| `Cat1\04-แผนการดำเนินงานGreen2569.pdf` | `0a155f7e398d1fb859a592775af50e21e35ba84ae579dc674bd3f702ecc823df` | 14,989,463 | 2026-05-19 15:23:03 | 1.1.4 (annual plan PDF, 147 activities) | available_unverified |
| `Cat1\1.1\1.1.1\1.1.1-บริบทองค์กร2569.pdf` | `f10222be108d267281cdd89c19d6650f736b59e55395acf40198abede12f739f` | 5,785,020 | 2026-05-19 15:51:22 | 1.1.1 | available_unverified |
| `Cat1\1.1\1.1.2\1.1.2-นโยบายสำนักงานสีเขียว 2569.pdf` | `710369045bda41d0ec268459f918e6c9f8ca37072df23b2e13afa305a20a0072` | 1,339,028 | 2026-05-19 15:43:03 | 1.1.2 | available_unverified |
| `Cat1\1.1\1.1.3\1.1.3-มติที่ประชุมการกำหนดเป้าหมายสิ่งแวดล้อม2569.pdf` | `ee089c4edad3c5926cfa15aaebd81b2071b10c1209287fe91013acb9c92d0eea` | 458,328 | 2026-05-12 09:10:15 | 1.1.3 | available_unverified |
| `Cat1\1.1\1.1.3\1.1.3-เป้าหมายสิ่งแวดล้อม 2569.pdf` | `6cdbd93692e3e8c418a7471ce7f0d21c55727b606bb0fd92acca82da8b02e2d3` | 511,444 | 2026-05-19 16:07:37 | 1.1.3 | available_unverified |
| `Cat1\1.1\1.1.4\1.1.4 มีการกำหนดแผนการดำเนินงานสำนักงานสีเขียว2569.xlsx` | `43402a7fb2d807958703a8182ec6d46a2994dff75422499384b56f0c728a7944` | 59,047 | 2026-08-04 10:28:24 | 1.1.4 | available_unverified |
| `Cat1\1.2\1.2.1\05-คกกGreen2569_complete.pdf` | `235c6cc5405d2d5b6b711b746469d00efa4169fdbb5aa2eeefb0c49f6ec05d0d` | 195,970 | 2026-04-02 10:38:18 | 1.2.1 | available_unverified |
| `Cat1\1.2\1.2.1\1.2.1-การแต่งตั้งคณะกรรมการGreen2569_.doc` | `6698bbf3de19d596eff4de5f3af4558739b94e3a45fa07253580c7d39899b4cf` | 147,456 | 2026-08-21 14:28:14 | 1.2.1 | available_unverified |

> Notes: All 8 Cat1 files are also published under `public/documents/fy2569/cat1/` (byte-identical). The FY2569 registry marks 1.1.1/1.1.2/1.1.3/1.2.1 as `available_unverified`, 1.1.4 as `verified`. **No year-2569 Cat1 entries exist in `evidence-index.json` yet** (the 19 index items cover only Cat2/Cat3) — Cat1 files are published but not yet registered as index evidence items. Note `05-คกกGreen2569_complete.pdf` (sha `235c6cc5…`) is the same file as `Cat2\2.2.1\…\2.2.1(3)-1 แต่งตั้งคณะกรรมการดำเนินงานสำนักงานสีเขียว.pdf` (byte-identical duplicate across categories).

### 3.3 Cat2 — 22 files present (2.1.1, 2.1.2, 2.2.1, 2.2.2, 2.2.3, 2.2.4)

**2.1.1 กำหนดแผนการฝึกอบรม ดำเนินการอบรม การประเมินผล และบันทึกประวัติการฝึกอบรม (6 files) → indicator 2.1.1**

| File (relative under Data2569) | SHA-256 | Size (B) | Modified (ICT) | State |
|---|---|---|---|---|
| `Cat2\2.1 การอบรมให้ความรู้และประเมินความเข้าใจ\2.1.1 กำหนดแผนการฝึกอบรม ดำเนินการอบรม การประเมินผล และบันทึกประวัติการฝึกอบรม\2.1.1(4) สรุปรายงานการดำเนินงานการฝึกอบรมตามแผนการฝึกอบรม 2569.pdf` | `859f05943ecff04066f649c3f7017758c23014e32736a6e2ceafb5d2878577f2` | 2,343,267 | 2026-08-26 17:54:28 | available_unverified (not yet published) |
| `…\2.1.1_1หลักสูตรแผผนผลปี2569.xlsx` | `456afea5432eae74660ba676b6218cc1d21c0f42776ef39a23591a26b37aeec9` | 119,332 | 2026-08-26 12:57:03 | available_unverified → `ev-cat2-tr-curriculum-fy2569` |
| `…\2.1.1แผนการฝึกอบรม2569.docx` | `e44be974ba66bc9288d2ac0b9aa1eda130c3b974c1c98050b86af715a7c7fa7a` | 122,514 | 2026-08-26 10:57:05 | available_unverified → `ev-cat2-comm-plan-fy2569` (misnamed; content = communication plan, see 3.3.4) |
| `…\69-2.1.1(1).pdf` | `16704b6131f45c14419135c41adc33537ad54f386497487999f0fa754c82ffe6` | 101,119 | 2026-08-26 17:53:25 | available_unverified → `ev-cat2-tr-delivery-marks-fy2569` |
| `…\69-2.1.1(2) - 14 พ.ค. 69.pdf` | `53575ef58d934bc0a9f2c76f7948ec6d3121a3a348d2a40c73fb2e9ed6ed9b08` | 7,928,906 | 2026-08-26 17:54:08 | available_unverified → `ev-cat2-tr-registration-eval-fy2569` |
| `…\69-2.1.1(3) ประวัติการอบรม บุคลากร.pdf` | `fece26d1543e89fd2a75d32a8342f165206a26842d13a38af46d87ea4c3be0a9` | 908,876 | 2026-08-26 17:54:12 | available_unverified → `ev-cat2-tr-history-fy2569` |

**2.1.2 กำหนดผู้รับผิดชอบด้านการอบรมแต่ละหลักสูตรมีความเหมาะสม (4 files) → indicator 2.1.2**

| File (relative under Data2569) | SHA-256 | Size (B) | Modified (ICT) | State |
|---|---|---|---|---|
| `Cat2\2.1 การอบรมให้ความรู้และประเมินความเข้าใจ\2.1.2 กำหนดผู้รับผิดชอบด้านการอบรมแต่ละหลักสูตรมีความเหมาะสม\ประวัติวิทยากร  นางสาวงามนิจ  อนุศาสน์.pdf` | `66fe9f390781629a3dc3421ca721ed2ecfb5c0a77520c68db63c2db55b67b68f` | 116,635 | 2026-08-26 18:45:03 | available_unverified → `ev-cat2-tr-trainer-cv-ngamnit-fy2569` |
| `…\ประวัติวิทยากร (งานป้องกันและบรรเทาสาธารณภัย เทศบาลเมืองแม่โจ้).pdf` | `afad8682285be153ea83c6900ffeaad468205ff5286e086e8a12c2448771a25e` | 5,277,526 | 2026-08-26 18:45:11 | available_unverified (not yet published) |
| `…\ประวัติวิทยากร คุณวรัญญา  ธนะเพทย์.pdf` | `cf3ea1c946775ea197cdb3891442c3bded2791fed03cfffa29045eef9fc77377` | 3,985,264 | 2026-08-26 18:45:18 | available_unverified → `ev-cat2-tr-trainer-cv-waranya-fy2569` |
| `…\ประวัติวิทยากร รองศาสตราจารย์ ดร.จุฑาภรณ์   ชนะถาวร.pdf` | `a90cc1567f92397d0821f716a8480f648f4d003b7e1344117786ee749bf7bbc1` | 4,005,715 | 2026-08-26 18:45:21 | available_unverified → `ev-cat2-tr-trainer-cv-juthaporn-fy2569` |

> Whitespace discrepancy: the three published trainer-CV `manifestPath` values in `evidence-index.json` use single spaces (`ประวัติวิทยากร นางสาวงามนิจ อนุศาสน์.pdf`), while the actual Data2569 filenames contain double/triple spaces (see table). Content hashes are identical.

**2.2.1 กำหนดผู้รับผิดชอบและแนวทางสื่อสารด้านสิ่งแวดล้อมทั้งภายในและภายนอกสำนักงาน (4 files) → indicator 2.2.1**

| File (relative under Data2569) | SHA-256 | Size (B) | Modified (ICT) | State |
|---|---|---|---|---|
| `Cat2\2.2 การรณรงค์และประชาสัมพันธ์แก่บุคลากร\2.2.1 กำหนดผู้รับผิดชอบและแนวทางสื่อสารด้านสิ่งแวดล้อมทั้งภายในและภายนอกสำนักงาน\2.2.1(3)-1 แต่งตั้งคณะกรรมการดำเนินงานสำนักงานสีเขียว.pdf` | `235c6cc5405d2d5b6b711b746469d00efa4169fdbb5aa2eeefb0c49f6ec05d0d` | 195,970 | 2026-08-26 20:19:14 | available_unverified (not yet published; byte-identical to Cat1 `05-คกกGreen2569_complete.pdf`) |
| `…\69-2.2.1(1) แผนสื่อสารสิ่งแวดล้อม.pdf` | `1e4f396788fad13b4b9c91c98e248d1d761c84dd826d6f27b14f8d8bdd2c614d` | 260,137 | 2026-08-26 20:06:40 | available_unverified → `ev-cat2-comm-plan-form-pdf-fy2569` |
| `…\69-2.2.1(2) ช่องทางการสื่อสาร เพื่อสร้างความร่วมมือในการดำเนินงานด้านสิ่งแวดล้อม.pdf` | `34c07d69b46c9afd6aeb14f95588fa09a244b3f1bd5365019aa22236d0baac2e` | 878,899 | 2026-08-27 08:52:10 | available_unverified (not yet published) |
| `…\69-2.2.1(3)-2 กำหนดกลุ่มเป้าหมายรับเรื่องสื่อสาร  (มอบหมายงานและกำหนดกลุ่มเป้าหมาย).pdf` | `ffac01c054c42078e770fcfad0ae6c42d9d78da71ac796947507938ccebe2680` | 91,496 | 2026-08-27 08:50:08 | available_unverified (not yet published) |

**2.2.1(1) กำหนดหัวข้อและความถี่การสื่อสาร (3 files) → indicator 2.2.1 (supporting)**

| File (relative under Data2569) | SHA-256 | Size (B) | Modified (ICT) | State |
|---|---|---|---|---|
| `Cat2\2.2 การรณรงค์และประชาสัมพันธ์แก่บุคลากร\2.2.1(1) กำหนดหัวข้อและความถี่การสื่อสาร\2.2.1(1)-1 นโยบายสำนักงานสีเขียวอาคารพระเทพรัตนราชสุดา ประจำปี พ.ศ. 2569.pdf` | `1c409f42c77551669252c5f0d23fe9fb2b24443e291d6103aa3a98b19b0cc8ae` | 1,339,030 | 2026-08-26 19:01:38 | available_unverified → `ev-cat2-comm-policy-supporting-fy2569` |
| `…\2.2.1(1)-2 มติการกำหนดนโยบายสิ่งแวดล้อม 2569.pdf` | `a9779c98929d14069b4a24cd0768c3d3d5ed7d535dcf65bd0b31402b501e019a` | 457,639 | 2026-08-26 18:55:55 | available_unverified → `ev-cat2-comm-minutes-supporting-fy2569` |
| `…\2.2.1(1)-3 มาตรการควบคุมการใช้พลังงานและทรัพยากร ปี.pdf` | `f6f7e19b82641ea78712617601ad7eba13c8699e281816d2b9e967055795f51a` | 2,068,808 | 2026-08-26 20:14:33 | available_unverified (not yet published) |

**2.2.2 มีการรณรงค์สื่อสารและให้ความรู้ตามที่กำหนดในข้อ 2.2.1 (3 files) → indicator 2.2.2**

| File (relative under Data2569) | SHA-256 | Size (B) | Modified (ICT) | State |
|---|---|---|---|---|
| `Cat2\2.2 การรณรงค์และประชาสัมพันธ์แก่บุคลากร\2.2.2 มีการรณรงค์สื่อสารและให้ความรู้ตามที่กำหนดในข้อ 2.2.1\69-2.2.2 (1) มีการสื่อสารตามหัวข้อและช่องทางการสื่อสารที่กำหนดไว้.pdf` | `2c128a5e464989f5f98d62a8402758ec5ace7bfffb6153447a243ce83b205b7c` | 1,977,876 | 2026-08-27 12:18:24 | available_unverified (not yet published) |
| `…\69-2.2.2(2) แผนสื่อสารสิ่งแวดล้อม.pdf` | `1e4f396788fad13b4b9c91c98e248d1d761c84dd826d6f27b14f8d8bdd2c614d` | 260,137 | 2026-08-27 12:05:03 | available_unverified (byte-identical duplicate of `69-2.2.1(1) แผนสื่อสารสิ่งแวดล้อม.pdf`; not ingested separately) |
| `…\69-2.2.2(3) แบบสำรวจประเมินความพึงพอใจด้านการสื่อสาร 52คน.pdf` | `3e4d54a9eda0dc297b3131903adb6d9ba822921f133740fcfe11e25edbfc18ca` | 310,656 | 2026-08-27 12:18:33 | available_unverified → `ev-cat2-comm-channel-satisfaction-fy2569` (2.2.2 secondary only) |

**2.2.3 ร้อยละความเข้าใจนโยบายสิ่งแวดล้อมและการดำเนินงานสำนักงานสีเขียว (1 file) → indicator 2.2.3**

| File (relative under Data2569) | SHA-256 | Size (B) | Modified (ICT) | State |
|---|---|---|---|---|
| `Cat2\2.2 การรณรงค์และประชาสัมพันธ์แก่บุคลากร\2.2.3 ร้อยละความเข้าใจนโยบายสิ่งแวดล้อมและการดำเนินงานสำนักงานสีเขียว\2.2.3 แบบประเมินความพึงพอใจ กิจกรรม 5 ส (Big Cleaning Day) และสำนักงานสีเขียว  13 มี.ค. 69.pdf` | `dcda7e3fc9adf42660fbd9897aff6b36af414aad1e0a8ef2ff75989361a190f4` | 385,930 | 2026-08-27 13:20:29 | available_unverified — file present but **NOT mapped as 2.2.3 understanding evidence** (it is a satisfaction survey; indicator 2.2.3 remains `unavailable`) |

**2.2.4 มีช่องทางรับข้อเสนอแนะข้อคิดเห็นด้านสิ่งแวดล้อม และนำมาปรับปรุงแก้ไข (1 file) → indicator 2.2.4**

| File (relative under Data2569) | SHA-256 | Size (B) | Modified (ICT) | State |
|---|---|---|---|---|
| `Cat2\2.2 การรณรงค์และประชาสัมพันธ์แก่บุคลากร\2.2.4 มีช่องทางรับข้อเสนอแนะข้อคิดเห็นด้านสิ่งแวดล้อม และนำมาปรับปรุงแก้ไข\2.2.4-แนวทางการจัดการข้อร้องเรียน.pdf` | `2ded651a57c922baa03571a44f35ae1899d47f7dfcc64b960037722cab1bd873` | 149,953 | 2026-08-27 13:22:55 | **held** — byte-identical to FY2568 `public/documents/fy2568/cat2/2.2/2.2.4/2.2.4-แนวทางการจัดการข้อร้องเรียน.pdf` (same SHA-256, verified); not a fresh FY2569 artifact; indicator 2.2.4 `unavailable` |

### 3.4 Cat3 — 2 files present (3.1.1, 3.2.1, 3.2.4, 3.3.1, 3.3.4, 3.4.1; plan-only)

| File (relative under Data2569) | SHA-256 | Size (B) | Modified (ICT) | Indicator(s) | State |
|---|---|---|---|---|---|
| `Cat3\3.1-มาตรการควบคุมการใช้พลังงานและทรัพยากร2569.docx` | `5f3a72e532041d46b6c994db3c9f58e1dc2daff54665b33ba47e1919b0b45b12` | 75,908 | 2026-08-21 15:01:10 | 3.1.1, 3.2.1, 3.2.4, 3.3.1, 3.3.4, 3.4.1 (shared source; sections 1–5; sections 6–9 OUT OF CAT3 scope) | available_unverified → `ev-cat3-measures-{water,electricity,fuel,paper,ink,meetings}-fy2569` |
| `Cat3\3.1-มาตรการควบคุมการใช้พลังงานและทรัพยากร2569_pdf.pdf` | `3deec37f9f0e1b039588b2982fd695f52880e55278a2c49d1d9d9da5ad8c793b` | 117,836 | 2026-08-24 15:53:46 | PDF render of the measures DOCX (same scope) | available_unverified (published; not separately indexed) |

### 3.5 Cat4–Cat7 — NO FY2569 FILES PRESENT

**Cat4 (หมวด 4 — การจัดการของเสียและมลพิษ), Cat5 (หมวด 5 — การจัดซื้อจัดจ้างและทรัพยากร), Cat6 (หมวด 6 — การขนส่ง), Cat7 (หมวด 7 — การมีส่วนร่วมและกิจกรรม)** contain zero files under `Data2569`.

> **Cat4–Cat7: NO FY2569 FILES PRESENT → all indicators unavailable; baseline only.** The 65-indicator registry (`indicator-progress-2569.json`) confirms every Cat4 (4.1.1–4.2.2), Cat5 (5.1.1–5.5.3), Cat6 (6.1.1–6.2.3), and Cat7 (7.1, 7.2) indicator is `unavailable`/`unavailable` for FY2569. No FY2569 evidence can be claimed for these categories; only the FY2568 baseline exists.

---

## 4. Published FY2569 Resource Datasets (6 metric workbooks)

Source folder: `…\07-GreenOffice\Resource`. All six SHA-256 values **match** both `data/staging/manifest.json` and `src/data/generated/*.json` `years["2569"].provenance.sourceSha256`. Verification state per generated JSON: `available_unverified` (human verification required).

| Metric | Source workbook | SHA-256 | Sheet | Extraction date | Coverage | Verification state | Classification |
|---|---|---|---|---|---|---|---|
| energy | `1.2electric.xlsx` | `31c70e5e4eb40c90df602a76a1dcb12dd3bf4f11ad652228d41859ed1a67273c` | `2569` | 2026-08-28 | 7 of 12 months (Jan–Jul) | available_unverified | CONFIRMED_XLSX |
| water | `1.1Water.xlsx` | `87d3dc99b9c86a365b977a6a4eb73d1defe340fabe1d03aa6d41c64b492a58d9` | `2569` | 2026-08-28 | 7 of 12 months (Jan–Jul) | available_unverified | CONFIRMED_XLSX |
| fuel | `1.3Gassolene.xlsx` | `0e610a4b22ecfdc781d9c14d8b4e4c10ec8189ff019206b631507bb93e121566` | `2569` | 2026-08-28 | 7 of 12 months (Jan–Jul) | available_unverified | CONFIRMED_XLSX |
| paper | `1.4paper.xlsx` | `4d7d1560381563d7cb7e3aa2d8b63ba3b4df05ce0dcc5b406e2b437c5dd06354` | `2569` | 2026-08-28 | 7 of 12 months (Jan–Jul) | available_unverified | CONFIRMED_XLSX |
| waste | `1.5waste2026.xlsx` | `02b1f624796e3ce49599adb0837712a0ac5cac3794a4cabf5bc404501d398df2` | `ปริมาณขยะรายเดือน ` | 2026-08-28 | 7 of 12 months (Jan–Jul) | available_unverified | CONFIRMED_XLSX |
| ghg | `1.6GreenHouseGas2026.xlsx` | `e6bc56fd5ed8f3dd952725dfeef162ea0e7a46679dd3d6ad03d921102261b219` | `สรุปการคำนวณ ปี 2569` | 2026-08-28 | 7 of 12 months (Jan–Jul) | available_unverified | CONFIRMED_XLSX |

Cross-check details:
- `data/staging/manifest.json`: files `1.1Water.xlsx`, `1.2electric.xlsx`, `1.3Gassolene.xlsx`, `1.4paper.xlsx`, `1.5waste2026.xlsx`, `1.6GreenHouseGas2026.xlsx` → sha256 identical to computed Resource hashes (6/6). Staged copies `data/staging/source/*.xlsx` → identical (8/8 including FY2568 pair `1.5waste2025.xlsx`, `1.6GreenHouseGas2025.xlsx`).
- `data/staging/extract-sources.json` matches on `sourceWorkbook`, `sourceSheet`, `sourceSha256`, `extractionDate` (2026-08-28), `coverage` ("7 of 12 months"), and `workbookTotalInvalid` flags.
- `src/data/generated/*.json` `years["2569"].provenance` blocks match on `sourceSha256`, `sourceSheet`, `coverage`, `observedMonths` [1–7].

---

## 5. Evidence-Index Cross-Check (year 2569, 19 items)

All 19 items' `manifestSha256` values are present in Data2569 (content-identical). Published copies under `public/documents/fy2569` are byte-identical to their Data2569 sources (22/22).

| Evidence id | Data2569 file | manifestSha256 = Data2569 SHA-256 | Filename match |
|---|---|---|---|
| ev-cat2-tr-plan-fy2569 (SUPERSEDED) | `2.1.1แผนการฝึกอบรม2569.docx` | ✅ MATCH | exact |
| ev-cat2-comm-plan-fy2569 | `2.1.1แผนการฝึกอบรม2569.docx` | ✅ MATCH | exact |
| ev-cat2-tr-curriculum-fy2569 | `2.1.1_1หลักสูตรแผผนผลปี2569.xlsx` | ✅ MATCH | exact |
| ev-cat3-measures-water-fy2569 | `3.1-มาตรการควบคุมการใช้พลังงานและทรัพยากร2569.docx` | ✅ MATCH | exact (shared file) |
| ev-cat3-measures-electricity-fy2569 | `3.1-มาตรการควบคุมการใช้พลังงานและทรัพยากร2569.docx` | ✅ MATCH | exact (shared file) |
| ev-cat3-measures-fuel-fy2569 | `3.1-มาตรการควบคุมการใช้พลังงานและทรัพยากร2569.docx` | ✅ MATCH | exact (shared file) |
| ev-cat3-measures-paper-fy2569 | `3.1-มาตรการควบคุมการใช้พลังงานและทรัพยากร2569.docx` | ✅ MATCH | exact (shared file) |
| ev-cat3-measures-ink-fy2569 | `3.1-มาตรการควบคุมการใช้พลังงานและทรัพยากร2569.docx` | ✅ MATCH | exact (shared file) |
| ev-cat3-measures-meetings-fy2569 | `3.1-มาตรการควบคุมการใช้พลังงานและทรัพยากร2569.docx` | ✅ MATCH | exact (shared file) |
| ev-cat2-tr-delivery-marks-fy2569 | `69-2.1.1(1).pdf` | ✅ MATCH | exact |
| ev-cat2-tr-registration-eval-fy2569 | `69-2.1.1(2) - 14 พ.ค. 69.pdf` | ✅ MATCH | exact |
| ev-cat2-tr-history-fy2569 | `69-2.1.1(3) ประวัติการอบรม บุคลากร.pdf` | ✅ MATCH | exact |
| ev-cat2-tr-trainer-cv-ngamnit-fy2569 | `ประวัติวิทยากร  นางสาวงามนิจ  อนุศาสน์.pdf` | ✅ MATCH (content) | ⚠️ double-space filename vs single-space manifestPath |
| ev-cat2-tr-trainer-cv-waranya-fy2569 | `ประวัติวิทยากร คุณวรัญญา  ธนะเพทย์.pdf` | ✅ MATCH (content) | ⚠️ double-space filename vs single-space manifestPath |
| ev-cat2-tr-trainer-cv-juthaporn-fy2569 | `ประวัติวิทยากร รองศาสตราจารย์ ดร.จุฑาภรณ์   ชนะถาวร.pdf` | ✅ MATCH (content) | ⚠️ triple-space filename vs single-space manifestPath |
| ev-cat2-comm-plan-form-pdf-fy2569 | `69-2.2.1(1) แผนสื่อสารสิ่งแวดล้อม.pdf` (and byte-identical `69-2.2.2(2) …`) | ✅ MATCH | exact |
| ev-cat2-comm-policy-supporting-fy2569 | `2.2.1(1)-1 นโยบายสำนักงานสีเขียวอาคารพระเทพรัตนราชสุดา ประจำปี พ.ศ. 2569.pdf` | ✅ MATCH | exact |
| ev-cat2-comm-minutes-supporting-fy2569 | `2.2.1(1)-2 มติการกำหนดนโยบายสิ่งแวดล้อม 2569.pdf` | ✅ MATCH | exact |
| ev-cat2-comm-channel-satisfaction-fy2569 | `69-2.2.2(3) แบบสำรวจประเมินความพึงพอใจด้านการสื่อสาร 52คน.pdf` | ✅ MATCH | exact |

**Result: 19/19 content matches; no hash mismatches.** The 3 trainer-CV entries differ only in filename whitespace (see Gaps & Dispositions item g).

---

## 6. Gaps & Dispositions

- **(a) Energy/Water workbook total rows are corrupt** — `1.2electric.xlsx` and `1.1Water.xlsx` `รวม` (total) cells in the canonical range carry a negative Aug-2026 formula-cache value, so **total reconciliation was skipped** (`workbookTotalInvalid: true` in `extract-sources.json`; `quality.reconciliationDifference: null` in `energy.json`/`water.json`). Monthly values are confirmed against the `2569` sheet. **Data-owner action required**: correct the corrupt total cell before any annual claim.
- **(b) Fuel now has 7 observed months (Jan–Jul) published from `1.3Gassolene.xlsx`** — `fuel.json` FY2569 shows months 1–7 with `total: 396.37 L` and `datasetState: PUBLISHABLE_PARTIAL` (previous publication was 6 months). Jul = 56.54 L.
- **(c) Cat4–Cat7 absent** — no FY2569 files in Data2569 for categories 4–7; all their indicators remain `unavailable` (baseline only). See §3.5.
- **(d) Cat2 2.2.3 satisfaction survey NOT mapped as understanding evidence** — the single 2.2.3-folder file (`2.2.3 แบบประเมินความพึงพอใจ … 13 มี.ค. 69.pdf`) is a satisfaction survey, not a "ร้อยละความเข้าใจ" (percentage-of-understanding) evidence artifact, and no evidence-index item maps it to 2.2.3 (`ev-cat2-comm-channel-satisfaction-fy2569` is explicitly "NOT auto-mapped to 2.2.3"). Indicator 2.2.3 stays `unavailable`.
- **(e) Cat2 2.2.4 guideline PDF is byte-identical to FY2568 → held** — `2.2.4-แนวทางการจัดการข้อร้องเรียน.pdf` in Data2569 has SHA-256 `2ded651a…`, identical to `public/documents/fy2568/cat2/2.2/2.2.4/2.2.4-แนวทางการจัดการข้อร้องเรียน.pdf` (verified). It is held (not published as FY2569 evidence); indicator 2.2.4 stays `unavailable`.
- **(f) 10 of 22 Data2569 Cat2 files are not yet published** under `public/documents/fy2569` — `2.1.1(4)` summary report, `ประวัติวิทยากร (งานป้องกันและบรรเทาสาธารณภัย เทศบาลเมืองแม่โจ้).pdf`, `2.2.1(3)-1`, `69-2.2.1(2)`, `69-2.2.1(3)-2`, `2.2.1(1)-3`, `69-2.2.2(1)`, `69-2.2.2(2)` (byte-identical duplicate, intentionally not ingested), `2.2.3` survey, `2.2.4` guideline. Consistent with the evidence-index disposition note ("Held offline files and NEEDS_DISPOSITION 2.2.3/2.2.4/measures-misfile").
- **(g) Trainer-CV filename whitespace discrepancy** — `evidence-index.json` `manifestPath` for the three published trainer CVs uses single spaces, while the canonical Data2569 filenames contain double/triple spaces. Content SHA-256 identical; recommend normalizing the manifest path or the source filename to avoid future sync mismatches.
- **(h) Cat1 published but not yet indexed** — 8 Cat1 files are present in Data2569 and published under `public/documents/fy2569/cat1/`, but there are no year-2569 Cat1 entries in `evidence-index.json` (the 19 year-2569 items cover only Cat2/Cat3). Cat1 provenance is tracked via the FY2569 registry and generated category JSONs.
- **(i) Cross-category byte-identical duplicate** — `Cat1\1.2\1.2.1\05-คกกGreen2569_complete.pdf` is byte-identical to `Cat2\2.2\2.2.1\…\2.2.1(3)-1 แต่งตั้งคณะกรรมการดำเนินงานสำนักงานสีเขียว.pdf` (sha `235c6cc5…`), and `69-2.2.1(1) แผนสื่อสารสิ่งแวดล้อม.pdf` is byte-identical to `69-2.2.2(2) แผนสื่อสารสิ่งแวดล้อม.pdf` (sha `1e4f3967…`). Duplicates are intentional (same artifact referenced by multiple criteria) but should be tracked to avoid double-counting.
- **(j) No operational metric workbooks in Data2569** — all six FY2569 metric workbooks reside only in `Resource`; Data2569 holds criteria/evidence documents only. Provenance for the six metrics is anchored to `Resource` paths (as recorded in `fy2569-dataset-provenance.json`).

**Verification ceiling:** every record is `available_unverified` (or `unavailable`/`held`). No human verification exists for any FY2569 dataset or evidence file; nothing in this audit claims verified status beyond the registry's existing `verified` entries (1.1.4, 1.6.1).

---

## 7. Machine-Readable Provenance Record

See `src/data/audit/fy2569-dataset-provenance.json` (created additively with this report) for the JSON array covering the 6 metric records (`metric:energy|water|fuel|paper|waste|ghg`) and the 19 year-2569 evidence records (`evidence:ev-…`).
