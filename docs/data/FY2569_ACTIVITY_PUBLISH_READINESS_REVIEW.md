# FY2569 Activity Publish Readiness Review — Phase A

**Date:** 2026-08-26  
**Base:** `origin/master` @ `347905b`  
**Scope:** ACT-2569-001 … ACT-2569-006 (6 canonical drafts)  
**Mode:** REVIEW/AUDIT ONLY — no `activities.json` changes

**Subagents:** A1 content/source fidelity · A2 media · A3 runtime/publication safety

**Final Phase A verdict:** All six drafts are **factually ready for PO publish decision**; none are `NOT_READY`.

---

## Executive summary

| Publish verdict | Count | IDs |
|-----------------|-------|-----|
| **READY_TO_PUBLISH** | 3 | 001, 002, 004 |
| **READY_WITH_PO_ACK** | 3 | 003, 005, 006 |
| **NOT_READY** | 0 | — |

**Blockers for public exposure today:** all six remain `status=draft` by governance (correct).  
**Not automatic blockers:** EN translation (`translationPending: true`), empty `relatedIndicators`, partial Facebook albums (grid-only).

---

## Phase A table

| ID | title / date | source fidelity | media | contract | unresolved issue | publish verdict | rationale |
|----|--------------|---------------|-------|----------|------------------|-----------------|-----------|
| **ACT-2569-001** | ประชุมคณะกรรมการ… ครั้งที่ 1/2569 · 2026-02-09 | **PASS** — display title normalized; `bodyTh` + `source.exactTitle`/`exactPostText` = Facebook verbatim | **PASS** — 5/5 SHA256; alt = `titleTh`; overlay 0 | Draft-safe; validator passes if published with `translationPending` | EN empty; location/participants body-only | **READY_TO_PUBLISH** | PO display fix applied; full grid media; no factual conflict |
| **ACT-2569-002** | ตรวจประเมินสำนักงานสีเขียวภายใน… 2569 · 2026-03-17 | **PASS** — title/body exact vs audit; action-plan `17/3/69` corroborates date | **PASS** — 5/5; overlay **+9** not fetched | Valid; `activityType` omitted (optional); 7.1 context does not block | Overlay album; no `source.exactTitle` stored (body matches) | **READY_TO_PUBLISH** | Internal assessment event; 7.1 issue-level kept out of `relatedIndicators` correctly |
| **ACT-2569-003** | กิจกรรมการเตรียมความพร้อม… · 2026-05-08 | **PASS** — display title fixes `กิจกราม→กิจกรรม`; body retains FB typo `กิจกรามการ` | **PASS** — 5/5; overlay **+10** | Valid; plan fire-drill row not equated | Intentional title/body typo split; overlay | **READY_WITH_PO_ACK** | PO must acknowledge body typo preservation at publish |
| **ACT-2569-004** | GREEN SYNERGY WED · 2026-06-05 | **PASS** — title/body exact vs audit | **PASS** — 5/5; overlay **+6** | Valid; no `source.exactTitle`/`exactPostText` fields (content still matches) | Overlay; optional source field parity | **READY_TO_PUBLISH** | Source-supported; not duplicate of ACT-2568-002 |
| **ACT-2569-005** | Big Cleaning Day ครั้งที่ **1** · 2026-03-13 | **PASS** — PO title = ครั้งที่ 1; `source.exactTitle` = FB ครั้งที่ 2; body = FB verbatim (internal 1/2 traceable) | **PASS** — 5/5; overlay **+7** | Valid; PO resolution note preserved | Body/summary opening still says ครั้งที่ 2 (intentional traceability); overlay | **READY_WITH_PO_ACK** | PO resolved numbering; reader sees title=1 / body opening=2 by design |
| **ACT-2569-006** | กิจกรรมการทำปุ๋ยหมักฯ… · 2026-07-21 | **MINOR_DISPLAY_ISSUE** — PO title prefix `กิจกรรม`; `source.exactTitle` without prefix; **not** factual conflict | **PASS** — 5/5; overlay **+6** | Valid; `poAuthorityBody` = `bodyTh`; `หน่วยงาย` preserved | Thin PO body; no action-plan row; overlay | **READY_WITH_PO_ACK** | PO-supplied authority accepted; acknowledge thin caption at publish |

---

## Source fidelity detail (A1)

### Governance compliance

| ID | Rule | Status |
|----|------|--------|
| 001 | Display normalized; source verbatim in body/`exactTitle` | ✓ |
| 002 | Internal assessment; 7.1 does not block publication | ✓ |
| 003 | Display typo normalized; source typo in body | ✓ |
| 004 | Source-supported | ✓ |
| 005 | PO March = ครั้งที่ 1; FB ครั้งที่ 2 in source only | ✓ |
| 006 | PO authority body; `หน่วยงาย` preserved | ✓ |

**FACTUAL_CONFLICT vs PO authority:** none across all six.

---

## Media detail (A2)

| ID | Files | SHA256 vs audit | Alt vs `titleTh` | Overlay remainder |
|----|-------|-----------------|------------------|-------------------|
| 001 | 5/5 | PASS | PASS | 0 |
| 002 | 5/5 | PASS | PASS | +9 |
| 003 | 5/5 | PASS | PASS | +10 |
| 004 | 5/5 | PASS | PASS | +6 |
| 005 | 5/5 | PASS | PASS | +7 |
| 006 | 5/5 | PASS | PASS | +6 |

- **38** overlay images documented project-wide; not fetched (no auth bypass).
- All grid files are Facebook **s590×590** derivatives — acceptable for web; not full album resolution.
- **No wrong-post or cross-activity duplicate SHA256** detected.

---

## Runtime & contract detail (A3)

| Surface | Draft exclusion |
|---------|-----------------|
| Detail routes `[slug].astro` | `status === 'published'` only |
| ContentHub / hub | published filter |
| Search index generation | skips non-published |
| Homepage latest | `getPublishedItems` only |

**Validator if flipped to `published` (keeping `translationPending: true`):** all six pass `validate-activities.mjs` with **zero errors**.

**Publish process gates (PO/workflow, not schema):**
1. Explicit PO `status: published` decision
2. Regenerate search index + validate + build/QA
3. Optional: EN translation before clearing `translationPending`
4. Optional: fetch overlay albums (+38 total across posts)

**Provenance at publish:** `source.*` Facebook/PO fields unchanged when only `status` flips.

---

## Document authority notes

| Document | Use |
|----------|-----|
| `facebook-fy2569-intake-audit.json` | Primary inspected source |
| `FY2569_FACEBOOK_DRAFT_PO_REVIEW.md` | PO review for 001–004 |
| `FY2569_FB02_FB06_DRAFT_INTAKE_REPORT.md` | PO authority for 005–006 |
| `FY2569_FACEBOOK_BACKLOG_RESOLUTION.md` | Historical conflict context (superseded by PO resolution for 005/006) |

---

## Phase A conclusion

**`FY2569_PUBLISH_READINESS_REVIEW_COMPLETE`** — no draft requires content repair before PO may authorize publication. Three records may publish with standard PO sign-off; three require explicit PO acknowledgment of documented display/source layering (003, 005, 006).
