# FY2569 Facebook Activities Intake Audit

**Date:** 2026-08-26  
**Status:** AUDIT ONLY — no `activity:new` writes, no publish, no `activities.json` mutation  
**Base:** `origin/master` @ `72f62fc` (Phase E `activity:new` + Phase F historical mapping merged)  
**Working branch:** `audit/fy2569-facebook-intake` (docs/audit artefacts only)  
**Authority:** `00-GREENOFFICE_PROJECT_CONSTITUTION.MD`, `ACTIVITY_CONTENT_CONTRACT_V1`, `activity:new`, Phase F mapping audit  

**Final verdict:** `FY2569_FACEBOOK_INTAKE_AUDIT_READY`

---

## 0. Source list reconciliation

`urlgreen.txt` was **not found** in the repo, Desktop, Downloads, or Documents ([Find urlgreen](c40b1b24-f832-475f-ac3a-fd3e239d837f) plus local dir search). Intake used the **7 URLs in the PO task brief** as the source list.

| # | Scope | PO title (supplied) | PO date | Share URL |
|---|-------|---------------------|---------|-----------|
| 1 | FY2569 | ประชุมคณะกรรมการดำเนินงานงานสำนักงานสีเขียว Green Office ครั้งที่ 1/2569 | 9 ก.พ. 2569 | https://www.facebook.com/share/p/1DMe5HQKNd/ |
| 2 | FY2569 | กิจกรรม Big Cleaning day ครั้งที่ 2 ประจำปี 2569 | 13 มี.ค. 2569 | https://www.facebook.com/share/p/1Jk6bSDKhg/ |
| 3 | FY2569 | ตรวจประเมินสำนักงานสีเขียวภายในสำนักงาน (Green Office) ประจำปี 2569 | 17 มี.ค. 2569 | https://www.facebook.com/share/p/19AE1vgSut/ |
| 4 | FY2569 | กิจกรรมการเตรียมความพร้อมกรณีฉุกเฉิน เพลิงไหม้ และการปฐมพยาบาลเบื้องต้น | 8 พ.ค. 2569 | https://www.facebook.com/share/p/1EhpBgJ5FN/ |
| 5 | FY2569 | กิจกรรมวันสิ่งแวดล้อมโลก GREEN SYNERGY | 5 มิ.ย. 2569 | https://www.facebook.com/share/p/1HZ6VEp74X/ |
| 6 | FY2569 | กิจกรรมการทำปุ๋ยหมักฯ จากเศษวัสดุอินทรีย์ | 21 ก.ค. 2569 | https://www.facebook.com/share/p/1BEkSTdbVT/ |
| 7 | FY2568 | โครงการอบรมส่งเสริมการเรียนรู้ "การปลูกต้นไม้ประดับ ปรับอากาศลดโลกร้อน" | 18 ก.ย. 2568 | https://www.facebook.com/share/p/1BkAdddQq4/ |

**Count check:** 7 URLs total · 6 FY2569 candidates · 1 FY2568 OUT_OF_SCOPE.

---

## 1. Source accessibility summary

All **7** posts opened on the public Facebook web UI without signing in.

| Signal | Result |
|--------|--------|
| Page | **Green Office อาคารเฉลิมพระเกียรติสมเด็จพระเทพฯ MJU** (`GofficePhraThepbuilding`) |
| Login overlay | Present on every post (email/password). **Not used.** |
| Post text | Visible without login |
| Photo grid | Visible without login (typically 5 thumbnails) |
| Album remainder | Overlay `+N` visible; album **not opened** (would likely need login) |
| Videos | **0** on inspected posts |
| Auth bypass | **None** |

None of the 7 posts are `BLOCKED_SOURCE`.

---

## Required summary table

| URL | title | event date | source status | media | duplicate? | category | indicator | confidence | intake verdict |
|-----|-------|------------|---------------|-------|------------|----------|-----------|------------|----------------|
| https://www.facebook.com/share/p/1DMe5HQKNd/ | ประชุมคณะกรรมการดำเนินงานงานสำนักงานสีเขียว Green Office ครั้งที่ 1/2569 | 2026-02-09 | accessible | 5 grid (0 overlay) | no | meeting | 1.2.1 / 1.7.2 not mapped | UNRESOLVED | READY_FOR_DRAFT |
| https://www.facebook.com/share/p/1Jk6bSDKhg/ | กิจกรรม Big Cleaning day ครั้งที่ 2 ประจำปี 2569 | 2026-03-13 | accessible | 5 grid +7 overlay | no | campaign | 5.4.3, 2.2.2 / 4.1.3 | SUPPORTED / UNRESOLVED | NEEDS_REVIEW |
| https://www.facebook.com/share/p/19AE1vgSut/ | ตรวจประเมินสำนักงานสีเขียวภายในสำนักงาน (Green Office) ประจำปี 2569 | 2026-03-17 | accessible | 5 grid +9 overlay | no | assessment | 7.1 (issue-level only) | SUPPORTED | READY_FOR_DRAFT |
| https://www.facebook.com/share/p/1EhpBgJ5FN/ | กิจกรามการเตรียมความพร้อมกรณีฉุกเฉิน เพลิงไหม้ และการปฐมพยาบาลเบื้องต้น | 2026-05-08 | accessible | 5 grid +10 overlay | no | preparedness | 5.5.1 / 5.5.2 / 5.5.3 | SUPPORTED / UNRESOLVED | READY_FOR_DRAFT |
| https://www.facebook.com/share/p/1HZ6VEp74X/ | กิจกรรมวันสิ่งแวดล้อมโลก "GREEN SYNERGY ปรับวิถีออฟฟิศ เพื่อโลกที่ยั่งยืน" | 2026-06-05 | accessible | 5 grid +6 overlay | no | campaign | 2.2.2 | SUPPORTED | READY_FOR_DRAFT |
| https://www.facebook.com/share/p/1BEkSTdbVT/ | การทำปุ๋ยหมักฯ จากเศษวัสดุอินทรีย์ | 2026-07-21 | accessible | 5 grid +6 overlay | no | campaign | 4.1.3 | SUPPORTED | NEEDS_REVIEW |
| https://www.facebook.com/share/p/1BkAdddQq4/ | กิจกรรมส่งเสริม ลดโลกร้อน | source 2025-07-17 (PO 18 ก.ย. 2568 conflicts) | accessible | 5 grid +43 overlay | no | n/a this batch | n/a | n/a | OUT_OF_SCOPE |

**Verdict counts (7 URLs):** READY_FOR_DRAFT **4** · NEEDS_REVIEW **2** · BLOCKED_SOURCE **0** · DUPLICATE **0** · OUT_OF_SCOPE **1**

---

## 2. Six FY2569 candidate results

Exact post text is preserved in `src/data/migration/facebook-fy2569-intake-audit.json`. Below is the audit capture, not a rewrite of the source.

Date rule used throughout: **event date from post body**; Facebook UI timestamp is publication only.

### FY2569-FB-01 — Committee meeting 1/2569

| Field | Value |
|-------|--------|
| source URL | https://www.facebook.com/share/p/1DMe5HQKNd/ |
| canonical post | `GofficePhraThepbuilding` post `945801561607319` |
| source accessible? | yes (login overlay present, content visible) |
| exact source title | ประชุมคณะกรรมการดำเนินงานงานสำนักงานสีเขียว Green Office ครั้งที่ 1/2569 |
| source post text | See JSON `exactPostText`. Body: 9 ก.พ. 2569; ติดตามความก้าวหน้า / ปัญหา อุปสรรค์ / วางแผนเตรียมความพร้อมก่อนรับการประเมิน; ห้องประชุม 301 ชั้น 3. Source typos preserved: `ดำนเนินงานงาน`, `อุปสรรค์`. |
| event date candidate | 9 กุมภาพันธ์ 2569 → **2026-02-09** |
| conflicting dates | Facebook UI **11 May** (year not shown) |
| canonical date recommendation | **2026-02-09** |
| source page | Green Office อาคารเฉลิมพระเกียรติสมเด็จพระเทพฯ MJU |
| location | ห้องประชุม 301 ชั้น 3 อาคารเฉลิมพระเกียรติสมเด็จพระเทพรัตนราชสุดา มหาวิทยาลัยแม่โจ้; place tag Chiang Mai |
| participants | คณะกรรมการดำเนินงาน สำนักงานสีเขียว(Green office) only (no personal names in the Facebook text) |
| activity type candidate | `committee` (SUPPORTED) |
| category candidate | `meeting` (SUPPORTED) |
| indicator candidate(s) | **1.2.1 UNRESOLVED** (appointment ≠ this meeting; order is 31 มี.ค. 2569). **1.7.2 UNRESOLVED** (source does not say ทบทวนฝ่ายบริหาร / agenda). Phase F left generic steering meetings unmapped (`ACT-2568-001`). |
| mapping confidence | UNRESOLVED |
| evidence candidate(s) | `doc-policy-review` is same-date minutes (9 ก.พ. 2569, ห้องประชุม 301) in `about/documents.json`. **Not** written onto an activity record (Phase F: no `evidenceIds` field). Do not treat minutes as proof of 1.7.2 from the Facebook post. |
| media count | 5 images in grid; no `+N` overlay |
| downloaded media | 5 JPEGs under `.tmp-audit-facebook-fy2569/FY2569-FB-01/` (HTTP 200; SHA-256 in `media-inventory.json`) |
| duplicate status | **not duplicate** of the 19 published activities (nearest analog: `ACT-2568-001` / `007` / `008`, different FY) |
| source gaps | Facebook timestamp vs event date; source typos; no named chair in the Facebook text (minutes name ผศ.ภานุวัฒน์ เมฆะ — that is a **different artefact**) |
| readiness for `activity:new` | **READY_FOR_DRAFT** — `--title` from source, `--date 2026-02-09 --year 2569 --category meeting --type committee --slug` ASCII. Leave `relatedIndicators` empty. Do **not** publish. |

### FY2569-FB-02 — Big Cleaning

| Field | Value |
|-------|--------|
| source URL | https://www.facebook.com/share/p/1Jk6bSDKhg/ |
| source accessible? | yes |
| exact source title | กิจกรรม Big Cleaning day ครั้งที่ **2** ประจำปี 2569 |
| source post text | Body says Big Cleaning day ครั้งที่ **1** ประจำปี 2569 on 13 มี.ค. 2569; 4 agencies; 5ส briefing; cleaning; 3Rs; ปิดไฟช่วงพักกลางวัน. Named: ผศ.ดร.ณัฐพล เลาห์รอดพันธุ์ (ประธาน), ผศ.ภานุวัฒน์ เมฆะ (ชี้แจงนโยบาย). |
| event date candidate | 13 มีนาคม 2569 → **2026-03-13** |
| conflicting dates | FB **11 May**; **title ครั้งที่ 2 vs body ครั้งที่ 1** |
| canonical date recommendation | **2026-03-13** (event). Title/numbering is a **content conflict**, not a date conflict. |
| location | อาคารเฉลิมพระเกียรติสมเด็จพระเทพรัตนราชสุดา มหาวิทยาลัยแม่โจ้ |
| activity type candidate | `cleaning` (SUPPORTED) |
| category candidate | `campaign` (SUPPORTED — same facet as `ACT-2568-005`, from body not title-only) |
| indicator candidate(s) | **5.4.3 SUPPORTED** (cleaning/upkeep in body; 5.4.3 is a **percentage** metric — no % in source). **2.2.2 SUPPORTED** (5ส briefing). **4.1.3 UNRESOLVED** (3Rs named, no outcome). Do **not** reuse FY2568 CONFIRMED mapping; `ev-cat5-livability-maintenance-fy2568` is Big Cleaning **#1/2568**. |
| evidence candidate(s) | none for this FY2569 event |
| media | 5 grid + overlay **+7** (12 UI-stated; 5 downloaded) |
| duplicate status | not duplicate (`ACT-2568-005` is 19 พ.ค. 2568) |
| readiness | **NEEDS_REVIEW** — freeze title only after PO chooses ครั้งที่ 1 vs 2 |

### FY2569-FB-03 — Internal Green Office assessment

| Field | Value |
|-------|--------|
| source URL | https://www.facebook.com/share/p/19AE1vgSut/ |
| source accessible? | yes |
| exact source title | ตรวจประเมินสำนักงานสีเขียวภายในสำนักงาน (Green Office) ประจำปี 2569 |
| source post text | 17 มี.ค. 2569; 4 agencies; ประธาน ผศ.ดร.ณัฐพล เลาห์รอดพันธุ์; ต้อนรับคณะผู้ตรวจประเมิน **1-7**; ยกระดับมาตรฐานการจัดการสิ่งแวดล้อม |
| event date candidate | 17 มีนาคม 2569 → **2026-03-17** |
| conflicting dates | FB **11 May** |
| canonical date recommendation | **2026-03-17** |
| category candidate | `assessment` (SUPPORTED) |
| activity type candidate | none in vocabulary for “assessment event”; omit `--type` or PO pick |
| indicator candidate(s) | **7.1 SUPPORTED at issue level** from source (internal audit, categories 1–7). `relatedIndicators` requires `\d+\.\d+\.\d+` — **cannot store `7.1`**. Phase F backlog. |
| evidence candidate(s) | `ev-cat7-internal-audit-request-fy2568` is the **FY2568 request** dated the same calendar day — **not** this activity. `category7/audit.json` quarantines 17/20/23 มี.ค. 2569 **execution** as FY2569. |
| media | 5 grid + overlay **+9** (aria: 9 remaining items) |
| duplicate status | not duplicate (`ACT-2567-001` is FY2567 assessment; `ACT-2567-005` is internal-audit **training**) |
| readiness | **READY_FOR_DRAFT** — `--category assessment --date 2026-03-17 --year 2569`. Keep `relatedIndicators` empty. |

### FY2569-FB-04 — Emergency / fire / first aid workshop

| Field | Value |
|-------|--------|
| source URL | https://www.facebook.com/share/p/1EhpBgJ5FN/ |
| source accessible? | yes |
| exact source title | กิจกร**า**มการเตรียมความพร้อมกรณีฉุกเฉิน เพลิงไหม้ และการปฐมพยาบาลเบื้องต้น (source typo vs PO `กิจกรรมการ`) |
| source post text | 8 พ.ค. 2569; ประธานเปิดโครงการ ผศ.ดร.ณัฐพล เลาห์รอดพันธุ์; ห้องประชุมข้าวหอมมะลิ ชั้น 1; trainers from งานป้องกันและบรรเทาสาธารณภัย เทศบาลเมืองแม่โจ้: คุณยุทธนา นำโน, คุณบัณฑิต ธรรมธิ, คุณปิติพงษ์ วลัญไชย, คุณสุวิทย์ ทองอ่วมใหญ่; อบรมเชิงปฏิบัติการ |
| event date candidate | 8 พฤษภาคม 2569 → **2026-05-08** |
| conflicting dates | FB **11 May** (likely publication) |
| canonical date recommendation | **2026-05-08** |
| category / type | `preparedness` + `workshop` (SUPPORTED). Source is a workshop, not an evacuation drill narrative. |
| indicator candidate(s) | **5.5.1 SUPPORTED** (fire-emergency training). Source does **not** say ฝึกซ้อมอพยพหนีไฟ → not CONFIRMED. **5.5.2 / 5.5.3 UNRESOLVED**. **2.1.1 UNRESOLVED** (delivery visible; plan/eval/records not). First aid has no dedicated 3-part code in the registry. |
| evidence candidate(s) | none. `ev-cat5-emergency-drill-fy2568` is 30 พ.ค. 2568. |
| media | 5 grid + overlay **+10** |
| duplicate status | not duplicate (`ACT-2568-004` 30 พ.ค. 2568; `ACT-2567-003` 29 พ.ค. 2567) |
| readiness | **READY_FOR_DRAFT** — preserve or PO-correct `กิจกรามการ` |

### FY2569-FB-05 — GREEN SYNERGY / World Environment Day

| Field | Value |
|-------|--------|
| source URL | https://www.facebook.com/share/p/1HZ6VEp74X/ |
| source accessible? | yes |
| exact source title | กิจกรรมวันสิ่งแวดล้อมโลก "GREEN SYNERGY ปรับวิถีออฟฟิศ เพื่อโลกที่ยั่งยืน" |
| source post text | 5 มิ.ย. 2569; เข้าร่วม; ผศ.ภานุวัฒน์ เมฆะ และบุคลากรสำนักวิจัยฯ; ประธานพิธีเปิด รศ.จักรพงษ์ พิมพ์พิมล รองอธิการบดี; นิทรรศการกรีนออฟฟิศ โดย นายปริญญา เพียรอุตส่าห์; ห้องประชุมสายน้ำผึ้ง สำนักหอสมุด |
| event date candidate | 5 มิถุนายน 2569 → **2026-06-05** |
| conflicting dates | FB **8 June** |
| canonical date recommendation | **2026-06-05** |
| category / type | `campaign` + `eco-event` (SUPPORTED) |
| indicator candidate(s) | **2.2.2 SUPPORTED** from exhibition/knowledge-sharing content. Same family as `ACT-2568-002` but **new year / new event name** — analog ≠ copy. |
| evidence candidate(s) | none |
| media | 5 grid + overlay **+6** |
| duplicate status | **not duplicate** of `ACT-2568-002` MJU ECO DAY (5 มิ.ย. **2568**, different name/location) |
| readiness | **READY_FOR_DRAFT** |

### FY2569-FB-06 — Compost / organic waste

| Field | Value |
|-------|--------|
| source URL | https://www.facebook.com/share/p/1BEkSTdbVT/ |
| source accessible? | yes |
| exact source title | การทำปุ๋ยหมักฯ จากเศษวัสดุอินทรีย์ (PO title prefixed `กิจกรรม`) |
| source post text | Thin. 21 ก.ค. 2569; ร่วมกับ **หน่วยงาย**ภายในอาคาร… ร่วมกิจกรรม Green Office รักษ์โลก; ด้านหลังอาคาร |
| event date candidate | 21 กรกฎาคม 2569 → **2026-07-21** |
| conflicting dates | FB relative **4h** at inspection 2026-08-26 (publication ≫ event) |
| canonical date recommendation | **2026-07-21** |
| category / type | `campaign` + `community` (SUPPORTED, thin body) |
| indicator candidate(s) | **4.1.3 SUPPORTED** (compost from organic material). No quantity. `ev-cat4-data-reuse-compost-fy2568` is FY2568, not this event. |
| evidence candidate(s) | none |
| media | 5 grid + overlay **+6** |
| duplicate status | not duplicate (no compost activity among the 19) |
| readiness | **NEEDS_REVIEW** — thin caption, typo `หน่วยงาย`, relative FB timestamp, PO vs source title |

---

## Historical / out-of-scope (FY2568)

### FY2568-FB-07 — Plant / cooling-tree training

| Field | Value |
|-------|--------|
| source URL | https://www.facebook.com/share/p/1BkAdddQq4/ |
| source accessible? | yes |
| PO metadata (not substituted for inspection) | title โครงการอบรม… "การปลูกต้นไม้ประดับ ปรับอากาศลดโลกร้อน"; date **18 กันยายน 2568** |
| inspected title on GO page | กิจกรรมส่งเสริม ลดโลกร้อน |
| inspected event date | **17 กรกฎาคม 2568** 13.00–15.00 น. |
| Facebook timestamp | **17 July 2025** |
| location | แปลงสาธิตเกษตรทฤษฎีใหม่ตามแนวพระราชดำริ มหาวิทยาลัยแม่โจ้ |
| participants (source) | รศ.ดร.พัชรินทร์ สุภาพันธ์; S-MAP ป.4–6 โรงเรียนดาราวิทยาลัย 104 คน; ครู 8 คน |
| media | 5 grid + overlay **+43** (not downloaded) |
| duplicate vs 19 | **no** |
| intake verdict | **OUT_OF_SCOPE** for this FY2569 batch |

If this URL is ingested later as historical, use source date **2025-07-17**, not PO 18 ก.ย. 2568.

---

## 3. Media inventory totals

| Bucket | Count | Traceability |
|--------|------:|--------------|
| FY2569 posts inspected | 6 | share URLs 1–6 |
| Videos | 0 | no `<video>` in inspected DOM |
| Visible grid images (downloaded) | **30** | 5 per FY2569 post; HTTP 200 `image/jpeg` |
| Overlay remainder (not downloaded) | **38** | +0+7+9+10+6+6 from UI only |
| UI-stated FY2569 stills (grid+overlay) | **68** | overlay not byte-verified |
| FY2568 overlay (out of scope, not downloaded) | 5 +43 | recorded only |
| SHA-256 duplicate groups among 30 files | **0** | `.tmp-audit-facebook-fy2569/media-inventory.json` |
| Copied to `public/images/activities/…` | **0** | forbidden this task |

Downloads are Facebook **s590x590 display derivatives**, not originals (`mx2048x…` in URL only). CDN URLs expire; do not hotlink at runtime.

Audit location (gitignored via `.tmp-*/`): `.tmp-audit-facebook-fy2569/`.

---

## 4. Duplicate findings

| Check | Result |
|-------|--------|
| vs 19 published activities | **no duplicates** |
| `ACT-2569-*` already in `activities.json` | **0** |
| Same-calendar-day analog | GREEN SYNERGY 5 มิ.ย. 2569 vs `ACT-2568-002` MJU ECO DAY 5 มิ.ย. **2568** — analog, not duplicate |
| Byte-identical downloaded stills | **none** |
| Same-day evidence vs activity | 17 มี.ค. 2569 Facebook audit **≠** `ev-cat7-internal-audit-request-fy2568` (request letter for FY2568) |

---

## 4a. Action-plan overlay (`action-plan-2569.json`)

Read-only overlay from [Canonical recon](e703b913-3423-4757-890b-8255cd3b9a4e) plus `src/data/generated/action-plan-2569.json`. Plan rows **do not replace** Facebook source text. Only three workbook rows have `actualMonths` filled: **5/3/69 + 30/3/69** (1.7.1 / 1.7.2 management review) and **17/3/69** (7.1 internal audit).

| Facebook candidate | Action-plan row | Overlap |
|--------------------|-----------------|---------|
| FB-01 9 ก.พ. 2569 committee | No `9/2/69`. 1.7 actuals are **5/3/69 and 30/3/69** | **Not** the same meeting. Reinforces 1.7.2 UNRESOLVED. |
| FB-02 13 มี.ค. Big Cleaning | `cat-4-4.1.3-17-17` “(6) กิจกรรม Big Clean Day”, planned `mar`+`nov`, `actualMonths: []` | Plan exists; **no actual date** 13/3/69. Does not resolve ครั้งที่ 1 vs 2. |
| FB-03 17 มี.ค. internal audit | `cat-7-7.1-5-5` “รับการตรวจประเมิน…ครบถ้วนทุกหมวด”, actual **17/3/69** | **Same date and execution wording** as the Facebook post. Corroborates the activity event. Still not a 3-part `relatedIndicators` code. `ev-cat7-internal-audit-request-fy2568` remains the **request letter**, not this post. |
| FB-04 8 พ.ค. fire + first aid | `cat-5-5.13-5.13-14` “การฝึกซ้อมดับเพลิง หนีไฟ และแผ่นดินไหว”, planned `may`, `actualMonths: []`; maps to canonical **5.5.1** | Plan is drill/earthquake, **no actual**. Facebook source is a **workshop + first aid**, not an explicit หนีไฟ/แผ่นดินไหว drill. Do not treat as the same row. |
| FB-05 GREEN SYNERGY | No SYNERGY / ไซเนอร์จี string | No plan row |
| FB-06 compost 21 ก.ค. | No `ปุ๋ยหมัก` string | No plan row |

---

## 5. Category / indicator candidate coverage

| Post | Category (vocab) | Type (vocab) | Indicator | Confidence | Why not CONFIRMED / why empty |
|------|------------------|--------------|-----------|------------|-------------------------------|
| 01 meeting | meeting | committee | 1.2.1, 1.7.2 | UNRESOLVED | Appointment vs ops meeting vs management review not proven by Facebook text |
| 02 cleaning | campaign | cleaning | 5.4.3, 2.2.2 | SUPPORTED | No % for 5.4.3; FY2568 evidence not reused |
| 02 cleaning | — | — | 4.1.3 | UNRESOLVED | 3Rs named only |
| 03 audit | assessment | — | 7.1 | SUPPORTED | Issue-level; cannot write 2-part code to `relatedIndicators` |
| 04 fire/first aid | preparedness | workshop | 5.5.1 | SUPPORTED | No explicit evacuation drill |
| 04 fire/first aid | — | — | 5.5.2, 5.5.3, 2.1.1 | UNRESOLVED | Plan / equipment / training records absent |
| 05 GREEN SYNERGY | campaign | eco-event | 2.2.2 | SUPPORTED | Campaign/exhibition in body |
| 06 compost | campaign | community | 4.1.3 | SUPPORTED | Composting stated; no quantity; thin body |

`activity:new` required flags: `--title --date --year --slug --category`. Default status **draft**. `--allow-publish` required to publish — **not used**.

---

## 6. READY / REVIEW / BLOCKED counts

| Verdict | Count | IDs |
|---------|------:|-----|
| READY_FOR_DRAFT | 4 | FB-01, FB-03, FB-04, FB-05 |
| NEEDS_REVIEW | 2 | FB-02 (ครั้งที่ 1 vs 2), FB-06 (thin text + 4h timestamp) |
| BLOCKED_SOURCE | 0 | — |
| DUPLICATE | 0 | — |
| OUT_OF_SCOPE | 1 | FB-07 FY2568 |

Not all six FY2569 posts are READY_FOR_DRAFT.

---

## 7. Exact blockers

**Source access:** none (all 7 readable without login).

**Draft blockers (NEEDS_REVIEW):**

1. FB-02 title `ครั้งที่ 2` vs body `ครั้งที่ 1`.
2. FB-06 thin caption, `หน่วยงาย` typo, Facebook `4h` vs event 21 ก.ค. 2569.

**Mapping / schema (not source blocks):**

1. `7.1` cannot be stored on `relatedIndicators` (2-part vs 3-part validator).
2. Activity contract still has **no** `evidenceIds` field (Phase F `SCHEMA_EXTENSION_REQUIRED`).
3. Overlay album images not retrieved without opening Facebook album/login.
4. Display JPEGs are not archival originals.

**Out of scope:** FB-07; PO date 18 ก.ย. 2568 **conflicts** with inspected 17 ก.ค. 2568.

---

## 8. Files written

| Path | Role |
|------|------|
| `docs/data/FY2569_FACEBOOK_ACTIVITIES_INTAKE_AUDIT.md` | This report |
| `src/data/migration/facebook-fy2569-intake-audit.json` | Structured audit (not runtime) |
| `.tmp-audit-facebook-fy2569/` | Temporary media + `media-inventory.json` + download script (gitignored `.tmp-*/`) |

**Not written / not run:** `activity:new`, publish, `public/images/activities/…`, Phase F mapping files, evidence schema, dashboard, `content1`/knowledge, deploy.

---

## 9. Confirmation: no canonical activity data changed

| Check | Result |
|-------|--------|
| `src/data/content/activities.json` | **unchanged** vs `origin/master` (`git diff` empty; blob `2db28dea…`) |
| Published count | **19** |
| `ACT-2569-*` | **0** |
| Phase F `relatedIndicators` | **untouched** |
| Evidence index / links | **untouched** |

---

## Suggested next `activity:new` commands (not executed)

PO must still approve. Draft-only examples:

```bash
npm run activity:new -- --title "ประชุมคณะกรรมการดำเนินงานงานสำนักงานสีเขียว Green Office ครั้งที่ 1/2569" --date 2026-02-09 --year 2569 --slug committee-ops-1-2569 --category meeting --type committee --dry-run

npm run activity:new -- --title "ตรวจประเมินสำนักงานสีเขียวภายในสำนักงาน (Green Office) ประจำปี 2569" --date 2026-03-17 --year 2569 --slug internal-audit-2569 --category assessment --dry-run

npm run activity:new -- --title "กิจกรรมการเตรียมความพร้อมกรณีฉุกเฉิน เพลิงไหม้ และการปฐมพยาบาลเบื้องต้น" --date 2026-05-08 --year 2569 --slug emergency-first-aid-2569 --category preparedness --type workshop --dry-run

npm run activity:new -- --title "กิจกรรมวันสิ่งแวดล้อมโลก GREEN SYNERGY ปรับวิถีออฟฟิศ เพื่อโลกที่ยั่งยืน" --date 2026-06-05 --year 2569 --slug green-synergy-2569 --category campaign --type eco-event --dry-run
```

Hold FB-02 and FB-06 until review. Copy media from `.tmp-audit-facebook-fy2569/` into public activity folders **only in a later approved task**. Do not hotlink Facebook CDN.

---

## Inspection method (subagent scopes)

| Scope | What ran |
|-------|----------|
| A — Facebook extraction | Public web UI: exact text, page identity, dates, location, named participants, media counts, blockers |
| B — Media audit | 30 visible-grid JPEGs downloaded to temp; SHA-256; 0 cross-post duplicates; overlay remainder documented not fetched |
| C — Canonical reconciliation | 19 activities, contract, `activity:new`, criteria, evidence-index, Phase F mapping, cat7 FY2568/2569 year split |

No git commit / push / PR unless requested after review.
