# FY2569 Facebook Backlog Draft Intake — FB-02 + FB-06

**Date:** 2026-08-26  
**Base:** `origin/master` @ `65359c9`  
**Status:** `DRAFT CONTENT ONLY — NOT PUBLIC`

**Final verdict:** `FY2569_FB02_FB06_DRAFTS_READY_FOR_REVIEW`

---

## Summary

| ID | Intake | Slug | Date | Status |
|----|--------|------|------|--------|
| ACT-2569-005 | FY2569-FB-02 | `big-cleaning-1-2569` | 2026-03-13 | draft |
| ACT-2569-006 | FY2569-FB-06 | `compost-organic-waste-2569` | 2026-07-21 | draft |

**Counts:** 25 total · 19 published · 6 draft (all FY2569 Facebook drafts remain non-public)

---

## PO authority applied

### FB-02 Big Cleaning

- **Display title (PO):** `กิจกรรม Big Cleaning Day ครั้งที่ 1 ประจำปี 2569`
- **Numbering:** PO confirmed FY2569 holds Big Cleaning Day twice (March + November per action plan); FB-02 event = ครั้งที่ 1
- **Facebook headline preserved:** `source.exactTitle` retains `…ครั้งที่ 2…`
- **Body:** Facebook `exactPostText` verbatim (internal title/body numbering conflict traceable)
- **Indicators:** `relatedIndicators: []`

### FB-06 Compost

- **Title (PO):** `กิจกรรมการทำปุ๋ยหมักฯ จากเศษวัสดุอินทรีย์`
- **Body (PO):** verbatim including `หน่วยงาย` (not corrected)
- **Facebook layer:** `source.exactTitle` / `source.exactPostText` preserved from audit
- **Indicators:** `relatedIndicators: []`

---

## Media

| Intake | Grid copied | Overlay skipped | Path |
|--------|-------------|-----------------|------|
| FB-02 | 5/5 SHA256 verified | +7 | `public/images/activities/2569/big-cleaning-1-2569/` |
| FB-06 | 5/5 SHA256 verified | +6 | `public/images/activities/2569/compost-organic-waste-2569/` |

---

## Remaining backlog

- **November Big Cleaning (ครั้งที่ 2):** not in this batch — future intake when source exists
- **FY2568-FB-07:** OUT_OF_SCOPE

---

## Files changed

- `src/data/content/activities.json` — 2 new draft records
- `src/data/migration/facebook-fy2569-intake-audit.json` — PO_RESOLVED fields
- `scripts/test-fy2569-facebook-drafts.mjs` — extended for backlog drafts
- `docs/data/FY2569_FB02_FB06_DRAFT_INTAKE_REPORT.md` — this report
- `public/images/activities/2569/big-cleaning-1-2569/*.jpg` — 5 images
- `public/images/activities/2569/compost-organic-waste-2569/*.jpg` — 5 images
