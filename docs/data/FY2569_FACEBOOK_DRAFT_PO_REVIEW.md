# FY2569 Facebook Draft — PO Review Report

**Date:** 2026-08-26  
**PR:** [#60](https://github.com/numtip/goffice2026/pull/60)  
**Branch:** `feat/fy2569-facebook-draft-intake`  
**Authority:** inspected Facebook audit (`docs/data/FY2569_FACEBOOK_ACTIVITIES_INTAKE_AUDIT.md`, `src/data/migration/facebook-fy2569-intake-audit.json`)

**Status:** `DRAFT CONTENT ONLY — NOT PUBLIC` — do not merge/deploy for publication.

**Final verdict:** `FY2569_PO_DRAFT_REVIEW_READY_FOR_APPROVAL`

---

## PO review table

| ID | title decision | body decision | media | category/type | indicators | PO verdict | notes |
|----|----------------|---------------|-------|---------------|------------|------------|-------|
| ACT-2569-001 | **SAFE_NORMALIZATION** — display title dedupes `งาน` + normalizes `(Green Office)`; `source.exactTitle` preserves Facebook verbatim | **EXACT** — `bodyTh` = audited `exactPostText` (typos `ดำนเนินงานงาน`, `อุปสรรค์` preserved) | 5/5 grid SHA256 match; overlay 0 N/A | meeting / committee **SUPPORTED** | `[]` | **APPROVE_AFTER_DISPLAY_TITLE_FIX** | Location/participants in body only (not structured fields) |
| ACT-2569-002 | **EXACT** | **EXACT** | 5/5 match; overlay +9 not copied (audit) | assessment / omitted **SUPPORTED** | `[]` (7.1 not 3-part) | **APPROVE_AS_IS** | 17/3/69 action-plan row corroborates date only |
| ACT-2569-003 | **SAFE_NORMALIZATION** — display fixes `กิจกราม→กิจกรรม`; `source.exactTitle` keeps source typo | **EXACT** — body retains `กิจกรามการ` verbatim | 5/5 match; overlay +10 not copied | preparedness / workshop **SUPPORTED** | `[]` (5.5.1 not confirmed) | **APPROVE_AFTER_DISPLAY_TITLE_FIX** | Do not equate with plan fire-drill row |
| ACT-2569-004 | **EXACT** — matches audited `exactTitle` | **EXACT** | 5/5 match; overlay +6 not copied | campaign / eco-event **SUPPORTED** | `[]` (2.2.2 not confirmed) | **APPROVE_AS_IS** | Not duplicate of ACT-2568-002 |

---

## Field fidelity (Subagent A summary)

| ID | title | date | summary | body | category/type | media count | location/participants |
|----|-------|------|---------|------|---------------|-------------|---------------------|
| 001 | SAFE_NORMALIZATION (after fix) | EXACT | SAFE_NORMALIZATION (display-led summary) | EXACT | SUPPORTED | EXACT (5) | UNSUPPORTED (in body text only) |
| 002 | EXACT | EXACT | EXACT | EXACT | SUPPORTED | EXACT (5) | UNSUPPORTED (in body text only) |
| 003 | SAFE_NORMALIZATION (after fix) | EXACT | SAFE_NORMALIZATION | EXACT | SUPPORTED | EXACT (5) | UNSUPPORTED (in body text only) |
| 004 | EXACT | EXACT | EXACT | EXACT | SUPPORTED | EXACT (5) | UNSUPPORTED (in body text only) |

No **CONFLICT** fields across the four approved drafts.

---

## Display-copy changes applied

### ACT-2569-001
- **titleTh (display):** `ประชุมคณะกรรมการดำเนินงานสำนักงานสีเขียว (Green Office) ครั้งที่ 1/2569`
- **source.exactTitle (verbatim):** `ประชุมคณะกรรมการดำเนินงานงานสำนักงานสีเขียว Green Office ครั้งที่ 1/2569`
- **bodyTh:** unchanged (Facebook verbatim)
- **media altTh:** updated to display title

### ACT-2569-003
- **titleTh (display):** `กิจกรรมการเตรียมความพร้อมกรณีฉุกเฉิน เพลิงไหม้ และการปฐมพยาบาลเบื้องต้น`
- **source.exactTitle (verbatim):** `กิจกรามการเตรียมความพร้อมกรณีฉุกเฉิน เพลิงไหม้ และการปฐมพยาบาลเบื้องต้น`
- **bodyTh:** unchanged (keeps `กิจกรามการ` typo)
- **media altTh:** updated to display title

### ACT-2569-002 / ACT-2569-004
- No display-copy changes.

---

## Source-fidelity proof

| Layer | Location | Status |
|-------|----------|--------|
| Audit JSON | `src/data/migration/facebook-fy2569-intake-audit.json` | Unchanged |
| Audit MD | `docs/data/FY2569_FACEBOOK_ACTIVITIES_INTAKE_AUDIT.md` | Unchanged |
| Activity body | `bodyTh` on all 4 drafts | Equals audit `exactPostText` |
| Facebook trace | `source.facebookShareUrl`, `facebookCanonicalUrl`, `facebookPostId`, `intakeId` | Present on all 4 |
| Verbatim title (001, 003) | `source.exactTitle` + `source.exactPostText` | Preserved after display fix |

---

## Media proof (Subagent B summary)

| Draft | Files | SHA256 | Order | Overlay not copied |
|-------|-------|--------|-------|-------------------|
| ACT-2569-001 | 5/5 | 20/20 inventory hashes match on disk | 01–05 = audit grid order | 0 |
| ACT-2569-002 | 5/5 | match | 01–05 | +9 |
| ACT-2569-003 | 5/5 | match | 01–05 | +10 |
| ACT-2569-004 | 5/5 | match | 01–05 | +6 |

No duplicate hashes, corruption, or wrong-post images detected. Grid derivatives only (s590×590); no Facebook redownload.

---

## Counts

| Metric | Value |
|--------|-------|
| Total activity records | **23** |
| Published | **19** |
| Draft (FY2569) | **4** |
| Public routes for drafts | **0** |
| Search-index entries for drafts | **0** |

---

## Remaining PO blockers (post-review)

1. **Publish gate** — explicit PO decision to set `status=published` (out of scope for this review)
2. **Overlay albums** — FB-03/04/05 have additional images not in intake copy
3. **EN translation** — all four remain `translationPending=true`
4. **Indicator mapping** — none assigned; PO may later accept SUPPORTED codes
5. **Intake backlog** — FY2569-FB-02 (Big Cleaning conflict), FY2569-FB-06 (compost/thin caption) still NEEDS_REVIEW

---

## Contract/runtime safety (Subagent C)

Display-title fixes touch only `titleTh`, `summaryTh`, `media[].altTh`, and additive `source.exactTitle` / `source.exactPostText`. No changes to `publishDate`, `fiscalYear`, `slug`, media paths, `status`, or `relatedIndicators`. Validator and draft-exclusion behavior unchanged. No schema extension.
