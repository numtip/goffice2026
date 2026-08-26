# FY2569 Facebook Draft Intake Report

**Date:** 2026-08-26  
**Status:** `DRAFT CONTENT ONLY — NOT PUBLIC`  
**Base:** `origin/master` @ `72f62fc`  
**Branch:** `feat/fy2569-facebook-draft-intake`  
**Authority:** completed FY2569 Facebook intake audit (`docs/data/FY2569_FACEBOOK_ACTIVITIES_INTAKE_AUDIT.md`, `src/data/migration/facebook-fy2569-intake-audit.json`)

**Final verdict:** `FY2569_DRAFT_INTAKE_READY_FOR_REVIEW`

Audit artefacts are preserved unchanged. `urlgreen.txt` was not used (not present). No record was published.

---

## 1. READY_FOR_DRAFT selected

**4 of 7** audit records. Selection used inspected body text, not title-only inference.

| Intake ID | Verdict basis | Date | Proposed slug |
|-----------|---------------|------|---------------|
| FY2569-FB-01 | Body: `จัดการประชุม` → meeting / committee | 2026-02-09 | `committee-ops-1-2569` |
| FY2569-FB-03 | Body: `เข้ารับการตรวจประเมินภายใน` → assessment (no type) | 2026-03-17 | `internal-audit-2569` |
| FY2569-FB-04 | Body: `อบรมเชิงปฏิบัติการ` → preparedness / workshop | 2026-05-08 | `emergency-first-aid-2569` |
| FY2569-FB-05 | Body: `วันสิ่งแวดล้อมโลก` → campaign / eco-event | 2026-06-05 | `green-synergy-2569` |

## 2. Created drafts

| ID | Slug | Status | Title (inspected) |
|----|------|--------|-------------------|
| `ACT-2569-001` | `committee-ops-1-2569` | `draft` | ประชุมคณะกรรมการดำเนินงานงานสำนักงานสีเขียว Green Office ครั้งที่ 1/2569 |
| `ACT-2569-002` | `internal-audit-2569` | `draft` | ตรวจประเมินสำนักงานสีเขียวภายในสำนักงาน (Green Office) ประจำปี 2569 |
| `ACT-2569-003` | `emergency-first-aid-2569` | `draft` | กิจกรามการเตรียมความพร้อมกรณีฉุกเฉิน เพลิงไหม้ และการปฐมพยาบาลเบื้องต้น (source typo preserved) |
| `ACT-2569-004` | `green-synergy-2569` | `draft` | กิจกรรมวันสิ่งแวดล้อมโลก "GREEN SYNERGY ปรับวิถีออฟฟิศ เพื่อโลกที่ยั่งยืน" |

All: `fiscalYear=2569`, `translationPending=true`, empty EN, `source.system=manual` plus Facebook share/canonical/post id/page/`intakeId`.

## 3. Skipped

| Intake ID | Verdict | Why skipped |
|-----------|---------|-------------|
| FY2569-FB-02 | `NEEDS_REVIEW` | Title ครั้งที่ 2 vs body ครั้งที่ 1 |
| FY2569-FB-06 | `NEEDS_REVIEW` | Thin caption / `หน่วยงาย` / relative timestamp |
| FY2568-FB-07 | `OUT_OF_SCOPE` | Source date 2025-07-17; not FY2569 intake |
| — | `BLOCKED_SOURCE` | none |
| — | `DUPLICATE` | none |

## 4. Media copied

Verified SHA-256 of previously audited grid JPEGs. **No Facebook redownload. No hotlink.** Overlay remainder was never downloaded in the audit and was **not** copied.

| Draft | Copied | Overlay not copied | Destination |
|-------|--------|--------------------|-------------|
| ACT-2569-001 | 5 / 5 | 0 | `public/images/activities/2569/committee-ops-1-2569/` |
| ACT-2569-002 | 5 | +9 | `public/images/activities/2569/internal-audit-2569/` |
| ACT-2569-003 | 5 | +10 | `public/images/activities/2569/emergency-first-aid-2569/` |
| ACT-2569-004 | 5 | +6 | `public/images/activities/2569/green-synergy-2569/` |

Canonical filenames: `01.jpg` … `05.jpg` (byte-identical to audit copies).

## 5. Category / type / indicator mappings retained

| Draft | Category | Type | `relatedIndicators` |
|-------|----------|------|---------------------|
| ACT-2569-001 | meeting | committee | `[]` (1.2.1 / 1.7.2 UNRESOLVED) |
| ACT-2569-002 | assessment | omitted | `[]` (7.1 SUPPORTED but 2-part — invalid for validator) |
| ACT-2569-003 | preparedness | workshop | `[]` (5.5.1 SUPPORTED not CONFIRMED; fire-plan wording not equated) |
| ACT-2569-004 | campaign | eco-event | `[]` (2.2.2 SUPPORTED not CONFIRMED) |

No evidence IDs. Action-plan overlay did not override Facebook source (9 Feb is not 1.7.1/1.7.2; 17/3/69 corroborates FB-03 only).

## 6. Unresolved fields left empty

- `titleEn` / `summaryEn` / `bodyEn`
- `relatedIndicators`
- `relatedLinks` (Facebook URLs are **not** stored as routes)
- `activityType` on ACT-2569-002
- Overlay album remainder
- Location / participant structured fields (not in Activity contract)

## 7. Published count proof = 19

`activities.json` items with `status=published` = **19**. FY2569 records = 4, all `draft`. Historical IDs unchanged. Published-core fingerprint unchanged at create time.

## 8. Draft exclusion proof

- `/activities/[slug]` and `/en/activities/[slug]` emit `getStaticPaths` from `status === 'published'` only
- `ContentHub` filters published for listing
- `getLatestPublished` (homepage) published-only
- `generate-search-index.mjs` skips non-published; committed `search-index.json` was **not** manually edited and contains no `ACT-2569-*`

## 9. Remaining FY2569 intake backlog

1. PO review of the 4 drafts (do not publish in this PR)
2. FY2569-FB-02 Big Cleaning title/body conflict
3. FY2569-FB-06 compost / thin caption
4. Overlay remainder media if PO wants complete albums (requires a later public-grid capture; no Facebook login bypass)
5. Indicator mapping only after PO accepts SUPPORTED codes (and 7.1 schema question remains Phase F backlog)
6. EN translation
