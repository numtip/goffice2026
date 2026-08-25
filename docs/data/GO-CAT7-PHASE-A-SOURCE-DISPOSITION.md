# GO-CAT7-PHASE-A: Source Disposition + Decision Freeze

**Date:** 2026-08-24 (Asia/Bangkok)
**Status:** DECISION FREEZE — reads only; no runtime/data mutation of FY2568 sources
**Repository HEAD baseline:** `100f9c2cdca9fafe8ae9bfbf56e93d43921914e9` (= origin/master, Cat6 baseline merged)
**Branch:** `feat/cat7-fy2568-baseline` (local only; no commit/push)
**Authority:** official Green Office 2569 criteria (`src/data/criteria/categories.json` cat7 = การดำเนินงานสำนักงานสีเขียวเพื่อความต่อเนื่อง / Green Office Operations for Continuity) · frozen FY2568 Cat7 sources as the baseline layer for FY2569 · Cat5/Cat6 source-disposition templates (format only — no facts copied)
**Scope:** Resolve Cat7 (หมวด 7 การดำเนินงานสำนักงานสีเขียวเพื่อความต่อเนื่อง) FY2568 evidence/version/criterion decisions before Phase B/C implementation. **Independent verification — Cat5/Cat6 findings not assumed.**
**Correction notice:** this revision supersedes the prior draft. Every claim below is backed by PyMuPDF text/image extraction or exact 3-way SHA-256 reconciliation; nothing is inferred from filenames or the folder name. The prior draft's "all scan_only", "no mixed-year contamination", and filename-derived FY2568 status are **retracted** — actual extraction shows all 3 files carry readable text layers and **mixed-year content** (see §2).

---

## 0. Three-way reconciliation (exact evidence)

Method: SHA-256 + size computed live on the read-only source directory, compared against `src/data/fy2568-publication.json → categories.cat7` and the repo mirror `public/documents/fy2568/cat7/` (script: `scripts/reconcile-cat7-threeway.py`).

| Relative path | Source bytes | Source SHA-256 (full) | Manifest bytes | Manifest SHA-256 | Mirror bytes | Mirror SHA-256 | src↔manifest | src↔mirror | manifest↔mirror |
|---|---|---|---|---|---|---|---|---|---|
| `7.1 (9-3-69).pdf` | 309,091 | `ddd4a25292512a4dec5e08086083dcd0b53dfcd9b60af3975ff1de1a1e5dd485` | 309,091 | identical | 309,091 | identical | OK | OK | OK |
| `7.2 (9-3-69).pdf` | 314,951 | `c2285c41117b3eef21a15aa7d435e8c4a8e2fe0cffa2397666ddc0d63dc2131c` | 314,951 | identical | 314,951 | identical | OK | OK | OK |
| `หมวด 7_(9-3-69).pdf` | 638,909 | `799785ce023dd9f924c17838838f11046c2e5230f6b5d0120cb7c62bba638d5d` | 638,909 | identical | 638,909 | identical | OK | OK | OK |
| **Total** | **1,262,951** | | **1,262,951** | | **1,262,951** | | **3/3** | **3/3** | **3/3** |

**Reconcile result: 3/3 fully matched on all three legs.** No missing/extra paths; no byte or SHA-256 mismatch. Manifest declared count=3, bytes=1,262,951; source total=1,262,951; mirror total=1,262,951.

**Caution:** 3/3 byte-identity proves the three copies are identical — it does **not** prove FY2568 status. Year status is determined by content (§2).

---

## 1. PDF technical analysis (PyMuPDF — no `ReadAllText`, no filename assumption)

Method: `fitz` (PyMuPDF 1.26.7). Per page: extracted-character count, embedded-image count. Classification: `verified` = readable text layer extracted; `scan_only` = page has images and 0 extracted chars (pending OCR); `unverified` = undetermined. No OCR was run in Phase A.

### 1.1 `7.1 (9-3-69).pdf` — 7 pages, 6,472 extracted chars total
| Page | Chars | Images | Class |
|---|---|---|---|
| 1 | 1,990 | 0 | verified |
| 2 | 477 | 1 | verified (text) + 1 image |
| 3 | 0 | 1 | scan_only (pending OCR) |
| 4 | 0 | 1 | scan_only (pending OCR) |
| 5 | 1,608 | 0 | verified |
| 6 | 727 | 0 | verified |
| 7 | 1,670 | 0 | verified |

**File-level: verified text layer** (5/7 pages extract text; pages 3–4 are image scans, pending OCR).

### 1.2 `7.2 (9-3-69).pdf` — 2 pages, 2,540 extracted chars total
| Page | Chars | Images | Class |
|---|---|---|---|
| 1 | 2,540 | 0 | verified |
| 2 | 0 | 3 | scan_only (pending OCR) |

**File-level: verified text layer** (page 2 is an image scan, pending OCR).

### 1.3 `หมวด 7_(9-3-69).pdf` — 9 pages, 9,012 extracted chars total
| Page | Chars | Images | Class |
|---|---|---|---|
| 1 | 1,990 | 0 | verified |
| 2 | 477 | 1 | verified (text) + 1 image |
| 3 | 0 | 1 | scan_only (pending OCR) |
| 4 | 0 | 1 | scan_only (pending OCR) |
| 5 | 1,608 | 0 | verified |
| 6 | 727 | 0 | verified |
| 7 | 1,670 | 0 | verified |
| 8 | 2,540 | 0 | verified |
| 9 | 0 | 3 | scan_only (pending OCR) |

**File-level: verified text layer** (pages 3–4, 9 are image scans, pending OCR).

**Content-duplicate candidates (no dedupe):** extracted text of `7.1 (9-3-69).pdf` pages 1,2,5,6,7 matches `หมวด 7_(9-3-69).pdf` pages 1,2,5,6,7 exactly (char counts 1,990/477/1,608/727/1,670). `7.2 (9-3-69).pdf` page 1 (2,540) matches `หมวด 7_(9-3-69).pdf` page 8 (2,540). `หมวด 7_` is a combined export duplicating both the 7.1 and 7.2 documents. Flagged `contentDuplicateCandidate` only — no `duplicateOf`/dedupe performed.

---

## 2. Content verification with page anchors + year classification

### 2.1 `7.1 (9-3-69).pdf`
- **p1** — (1) แต่งตั้งคณะกรรมการตรวจประเมินสำนักงานสีเขียวภายในสำนักงาน ประกอบด้วยหัวหน้าผู้ตรวจประเมินและผู้ตรวจประเมิน … พร้อมรายนามคณะกรรมการ/หมวดที่รับผิดชอบ (appointment + auditor roster).
- **p2** — (2) ความถี่การตรวจประเมินอย่างน้อยปีละ 1 ครั้ง; "ขอรับการตรวจประเมินภายในสำนักงาน Green Office **ประจำปี 2568** (วันที่ 17 มีนาคม 2569)".
- **p3–p4** — no text; embedded images (scan_only, pending OCR).
- **p5** — (3) ข้อกำหนดการตรวจประเมินภายในครอบคลุมทุกหมวด ลงวันที่ 17 มีนาคม 2569 พร้อมตารางเวลา/กำหนดการ.
- **p6** — (4) กำหนดผู้ตรวจประเมินแต่ละหมวดเพียงพอ/เหมาะสมและเป็นอิสระ พร้อมรายนาม.
- **p7** — (5) ดำเนินการตรวจประเมินครบถ้วนทุกหมวด + สรุปผล; กำหนดการ 17/20/23 มี.ค. 2569 (ติดตามผล + จัดส่งรายงาน).

### 2.2 `7.2 (9-3-69).pdf`
- **p1** — 7.2 facets (1)–(4): (1) ต่อยอดสู่รางวัล/การรับรอง (Carbon Footprint for Organization, ISO 14001); (2) ส่งเสริมโดยเป็นวิทยากร/ให้คำแนะนำ/สถานที่ศึกษาดูงาน (คณะสัตวแพทยศาสตร์ มหาวิทยาลัยแม่โจ้); (3) สร้างเครือข่าย/ทีมพี่เลี้ยง Coaching; (4) กิจกรรมร่วมกับชุมชน/หน่วยงานภายนอก — **ส่งเสริมการทำเกษตรอินทรีย์ผ่านโครงการอบรม MAEJO PGS** (Participatory Guarantee Systems). Facets (1)–(3) ระบุ "กำหนดแผนการดำเนินงานสำนักงานสีเขียว … **ประจำปี 2569**"; facet (4) **ไม่มีปีกำกับ** (declares กิจกรรมร่วมกับชุมชน without date).
- **p2** — no text; embedded images (scan_only, pending OCR).

### 2.3 `หมวด 7_(9-3-69).pdf` (combined export = 7.1 pages 1–7 + 7.2 page 8 + scan page 9)
- **p1** — committee appointed "**ประจำปี 2569** เพื่อดำเนินการตรวจประเมิน … ของอาคาร … **ประจำปี 2568** ในวันที่ 17 มีนาคม 2569" — explicitly mixed.
- **p2, p5–p7** — same 7.1 content as §2.1.
- **p8** — same 7.2 content as §2.2 (ประจำปี 2569).
- **p3, p4, p9** — scan_only.

### 2.4 File-level year disposition (claims split at claim level in §3)
| File | Content year evidence | File-level class |
|---|---|---|
| `7.1 (9-3-69).pdf` | Contains explicit 2568 (audited period, p1/p2) AND explicit 2569 (appointment p1; criteria/execution/report p5/p7) | **MIXED_YEAR** — claims split in §3; file **not** quarantined wholesale |
| `7.2 (9-3-69).pdf` | Facets (1)–(3) explicit 2569 plans; facet (4) no explicit year | **MIXED_YEAR** — claims split in §3 |
| `หมวด 7_(9-3-69).pdf` | Combined export; same claims as 7.1 + 7.2 | **MIXED_YEAR** — claims split in §3 |

- `documentRevisionDate`: the filename evidences `(9-3-69)` → **2569-03-09**, recorded as evidenced metadata only. This date is **not** FY2568 proof and is not used to infer a baseline year. Content independently shows March 2569 execution dates (17/20/23 มี.ค. 2569).
- A `MIXED_YEAR` file is **not quarantined wholesale**. Every claim on every page is individually classified: explicitly FY2568 → **baseline-eligible**; explicitly FY2569 → **QUARANTINE**; no explicit year → **YEAR_UNVERIFIED** (see §3 claim matrix).

---

## 3. Claim matrix (source · page · claim · explicit year · status)

Rules: **baseline-eligible** = page text/scan explicitly labels the claim FY2568 (ประจำปี 2568); **QUARANTINE** = page text explicitly labels the claim FY2569 (ประจำปี 2569 / มี.ค. 2569); **YEAR_UNVERIFIED** = no explicit year label for that claim on that page.

| Source | Page | Claim (summary) | Explicit year | Status |
|---|---|---|---|---|
| `7.1 (9-3-69).pdf` (= `หมวด 7_` p1) | p1 | แต่งตั้งคณะกรรมการตรวจประเมินสำนักงานสีเขียว อาคาร… **ประจำปี 2569** (พร้อมรายนาม/หมวด) | ประจำปี **2569** | **QUARANTINE** |
| `7.1 (9-3-69).pdf` (= `หมวด 7_` p1) | p1 | ตรวจประเมินการดำเนินงานตามเกณฑ์ Green Office ของอาคาร… **ประจำปี 2568** ในวันที่ 17 มีนาคม 2569 (audited period) | ประจำปี **2568** | **baseline-eligible** |
| `7.1 (9-3-69).pdf` (= `หมวด 7_` p2) | p2 | (2) ความถี่อย่างน้อยปีละ 1 ครั้ง; แจ้งความประสงค์ขอรับการตรวจประเมินภายใน Green Office **ประจำปี 2568** (วันที่ 17 มีนาคม 2569) ไปยังประธานคณะกรรมการขับเคลื่อนฯ | ประจำปี **2568** + date 17 มี.ค. 2569 | **baseline-eligible** (request for FY2568 audit) |
| `7.1 (9-3-69).pdf` (= `หมวด 7_` p5) | p5 | (3) จัดทำข้อกำหนดการตรวจประเมินภายใน **17 มีนาคม 2569** ครอบคลุมทุกหมวด + กำหนดการ (ติดตาม 20 มี.ค., ส่งรายงาน 23 มี.ค. 2569) | **2569** (17/20/23 มี.ค.) | **QUARANTINE** (criteria/schedule 2569-dated) |
| `7.1 (9-3-69).pdf` (= `หมวด 7_` p6) | p6 | (4) กำหนดผู้ตรวจประเมินแต่ละหมวดเพียงพอ/เหมาะสม/อิสระ + รายนาม | none | **YEAR_UNVERIFIED** |
| `7.1 (9-3-69).pdf` (= `หมวด 7_` p7) | p7 | (5) ตรวจประเมิน **17 มีนาคม 2569** ครบทุกหมวด + สรุปผล; ติดตาม 20 มี.ค., จัดส่งรายงาน 23 มี.ค. 2569 | **2569** (17/20/23 มี.ค.) | **QUARANTINE** (execution/report 2569-dated) |
| `7.1 (9-3-69).pdf` (= `หมวด 7_` p3/p4) | p3–p4 | photos/scans (1 image each) — content pending OCR | none (scan) | **YEAR_UNVERIFIED** (gap — pending OCR) |
| `7.2 (9-3-69).pdf` (= `หมวด 7_` p8) | p1 | (1) ต่อยอดสู่รางวัล/การรับรอง (Carbon Footprint, ISO 14001) — กำหนดแผน… ประจำปี 2569 | ประจำปี **2569** | **QUARANTINE** |
| `7.2 (9-3-69).pdf` (= `หมวด 7_` p8) | p1 | (2) ส่งเสริมเป็นวิทยากร/ให้คำแนะนำ/สถานที่ศึกษาดูงาน (คณะสัตวแพทยศาสตร์) — กำหนดแผน… ประจำปี 2569 | ประจำปี **2569** | **QUARANTINE** |
| `7.2 (9-3-69).pdf` (= `หมวด 7_` p8) | p1 | (3) สร้างเครือข่าย/ทีมพี่เลี้ยง Coaching — กำหนดแผน… ประจำปี 2569 | ประจำปี **2569** | **QUARANTINE** |
| `7.2 (9-3-69).pdf` (= `หมวด 7_` p8) | p1 | (4) กิจกรรมร่วมชุมชน: ส่งเสริมเกษตรอินทรีย์ผ่านโครงการอบรม MAEJO PGS — "มีการดำเนินกิจกรรมร่วมกับชุมชน" (no date/result) | none | **YEAR_UNVERIFIED** |
| `7.2 (9-3-69).pdf` | p2 | activity photos ×3 — content pending OCR | none (scan) | **YEAR_UNVERIFIED** (gap — pending OCR) |

Notes:
- `หมวด 7_(9-3-69).pdf` p1–7 ≡ `7.1 (9-3-69).pdf` p1–7 and p8 ≡ `7.2 (9-3-69).pdf` p1 (extracted char counts identical) → every row applies to both files. `หมวด 7_` remains `contentDuplicateCandidate` only, with **separate sourceRefs** — no `duplicateOf`/dedupe.
- Tally: **2 baseline-eligible** (p1 audited-period, p2 FY2568 request) · **7 QUARANTINE** (p1 appointment, p5 criteria, p7 execution/report, 7.2 (1)(2)(3)) · **4 YEAR_UNVERIFIED** (p6 roster, 7.2 (4), p3–p4 scan, p2 scan).

---

## 4. 7.1 / 7.2 mapping classification (execution-evidence rules)

Execution evidence requires event-specific facts (who/what/date/result) in page text or scan — a criterion heading, checklist, or form label alone is **not** execution evidence. Canonical taxonomy preserved: only **7.1** and **7.2**; the five 7.2 activity types are **facets**, not new indicators.

### 4.1 Indicator 7.1 — internal audit (การตรวจประเมินฯ เพื่อการปรับปรุงอย่างต่อเนื่อง)
| Element | Anchor | Classification | Rationale |
|---|---|---|---|
| Appointment / auditor competence | `7.1 p1`; `หมวด7 p1` | **candidate** | Named roster + appointment text (who/what/date 17 มี.ค. 2569) but appointment is 2569-dated → QUARANTINE; formal order/competence likely on p3–p4 scans (pending OCR) |
| Annual plan / frequency / FY2568 request | `7.1 p2`; `หมวด7 p2` | **verified execution** | Who (อาคาร…), what (แจ้งความประสงค์ขอรับการตรวจประเมินประจำปี 2568), date (17 มี.ค. 2569), recipient (ประธานคณะกรรมการฯ) — event-specific; **baseline-eligible (2568)**; request letter = p2 embedded image (pending OCR) |
| Audit scope / assignments | `7.1 p5, p6`; `หมวด7 p5, p6` | **declared-only** | p5 criteria/schedule 17 มี.ค. 2569 (2569-dated → QUARANTINE); p6 roster has who/what but no date/result (YEAR_UNVERIFIED) |
| Audit execution | `7.1 p7`; `หมวด7 p7` | **verified execution (2569-dated)** | Who, what (ตรวจประเมินครบทุกหมวด + สรุปผล), date (17 มี.ค. 2569), result (สรุปผล/รายงาน 23 มี.ค.) — but **QUARANTINE** for FY2568 baseline |
| Photos | `7.1 p2/p3/p4`; `หมวด7 p2/p3/p4` | **gap** | scan_only, pending OCR |
| Result report | `7.1 p7`; `หมวด7 p7` | **candidate** | Reported in text (จัดส่งรายงาน 23 มี.ค. 2569) but 2569-dated → QUARANTINE; no standalone report file in the 3-file set |

### 4.2 Indicator 7.2 — continuity & advancement (การดำเนินงานเพื่อความต่อเนื่อง/ยกระดับ)
| Facet | Anchor | Classification | Rationale |
|---|---|---|---|
| Continuation / certification | `7.2 p1`; `หมวด7 p8` | **declared-only** | FY2569 plan statement; no event who/date/result → QUARANTINE |
| Mentor-speaker | `7.2 p1`; `หมวด7 p8` | **declared-only** | FY2569 plan; target named (คณะสัตวแพทยศาสตร์) but no event/date/result → QUARANTINE |
| Study visit | `7.2 p1`; `หมวด7 p8` | **declared-only** | FY2569 plan; no event/date/result → QUARANTINE |
| Network | `7.2 p1`; `หมวด7 p8` | **declared-only** | FY2569 plan; no event/date/result → QUARANTINE |
| Community activity | `7.2 p1`; `หมวด7 p8` | **candidate** | Concrete program declared (MAEJO PGS อบรม) + "มีการดำเนินกิจกรรมร่วมกับชุมชน" but no date/result on page; no explicit year → YEAR_UNVERIFIED; photos on p2 scan (pending OCR) |

No score, PASS, certification status, or FY2569 claim is made. `scan_only` pages remain pending OCR — nothing on them is quoted or relied on.

---

## 5. Gaps and data-owner questions

- **Year resolution for 7.1:** the FY2568 internal audit (ประจำปี 2568) was executed and reported in March 2569 (17/20/23 มี.ค. 2569). The p2 request is 2568-eligible (baseline); the p1 appointment, p5 criteria/schedule, and p7 execution/report are 2569-dated (currently QUARANTINE). Which year's baseline should the execution/result claims be attributed to — FY2568 (audited period) or FY2569 (execution/report dates)?
- **7.2 (1)–(3) are explicitly FY2569 plans** — confirm they are excluded from the FY2568 baseline (QUARANTINE) and belong to the FY2569 cycle; if FY2568 continuation evidence exists elsewhere, it is not in `Data2568/หมวด7`.
- **7.2 (4) MAEJO PGS community activity** has no explicit year — confirm its FY and provide supporting event facts (date, participants, results); photos on p2 scan (3 images) pending OCR.
- **7.1 (1) formal order/competence:** the roster is in text, but the formal appointment order / training certificates are likely on p3–p4 scans — confirm and OCR.
- **Result report:** the 7.1 result report is referenced (จัดส่งรายงาน 23 มี.ค. 2569) but no standalone report file exists in the 3-file set — locate or confirm.
- **Duplicate-candidate:** `หมวด 7_(9-3-69).pdf` duplicates the extracted text of both `7.1` and `7.2`. Confirm canonical sourceRef(s); separate sourceRefs retained, no dedupe.
- **documentRevisionDate 2569-03-09** (filename evidence) — confirm the actual revision date and that no earlier/later dated source exists outside `Data2568/หมวด7`.

---

## 6. Quarantine / year status (claim-level; no wholesale file quarantine)

- File-level: all 3 files remain **MIXED_YEAR**. A mixed-year file is **not quarantined wholesale** — claims are split in §3.
- Claim-level: **2 baseline-eligible** (2568 audited period + FY2568 audit request) · **7 QUARANTINE** (2569-dated appointment/criteria/execution/report + three 7.2 FY2569 plan facets) · **4 YEAR_UNVERIFIED** (p6 roster, 7.2 (4) MAEJO PGS, scan pages).
- `หมวด 7_` = `contentDuplicateCandidate` only; separate sourceRefs; no `duplicateOf`/dedupe; no removal from manifest.
- Scan-only pages **pending OCR**; nothing on them is quoted, scored, or claimed.

---

## 7. Proposed Phase B scope (no work performed in this phase)

1. OCR scan pages: `7.1` p3–p4, `7.2` p2, `หมวด7` p3–p4/p9 → classify photos/orders; elevate `gap`/`candidate`/`YEAR_UNVERIFIED` claims.
2. Data-owner resolution of year per claim matrix (§3): confirm which claims are FY2568 baseline-eligible vs FY2569 QUARANTINE.
3. Confirm 7.2 (1)–(3) FY2569 plans remain outside the FY2568 baseline.
4. For 7.2 (4) MAEJO PGS: obtain/OCR supporting event evidence (date, participants, photos, results).
5. Confirm canonical sourceRef(s) given the `หมวด 7_` duplicate-candidate.
6. Build sourceRefs + evidence-index with page anchors per approved (baseline-eligible) claims only.
7. Cat7's separate scoring model (7.1=40 / 7.2=60) is **not** part of Phase A.

---

## 8. Final git status

- **git diff --check:** clean (no whitespace errors).
- **git status:** only `docs/data/GO-CAT7-PHASE-A-SOURCE-DISPOSITION.md` (modified) plus pre-existing untracked files; nothing staged/committed/pushed.
- Branch `feat/cat7-fy2568-baseline` unchanged; no runtime/manifest/evidence-index/routes/build/deploy touched.

---