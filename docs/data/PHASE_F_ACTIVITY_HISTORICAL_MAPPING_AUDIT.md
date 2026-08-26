# Phase F — Historical Activity Mapping Audit

**Date:** 2026-08-26  
**Status:** Phase F bounded metadata pass  
**Scope:** 19 published Joomla `project2` activities — Category / Indicator / Evidence  
**Authority:** `ACTIVITY_CONTENT_CONTRACT_V1`, `src/data/criteria/indicators.json`, `src/data/evidence-index.json`

---

## Schema verdict

| Dimension | Field | Verdict |
|-----------|-------|---------|
| **Category** | `category` facet | **PROCEED** — all 19 already set at migration; unchanged in Phase F |
| **Indicator** | `relatedIndicators[]` | **PROCEED** — optional `^\d+\.\d+\.\d+$` codes; validator format-only today |
| **Evidence** | `evidenceIds` / `linkedEvidence` | **`SCHEMA_EXTENSION_REQUIRED`** — no activity record field in contract |

Evidence candidate links are documented below and in `scripts/lib/activity-phase-f-mapping.mjs` (`CANDIDATE_EVIDENCE_BY_ACTIVITY_ID`) but **not written** to `activities.json`.

---

## Coverage summary

| Dimension | Mapped | Total | Notes |
|-----------|--------|-------|-------|
| Category | 19 | 19 | Migration facets confirmed |
| Indicator (`relatedIndicators`) | 11 | 19 | 8 UNRESOLVED (conservative) |
| Evidence (canonical IDs) | 0 on records | 19 | 4 candidate cross-refs documented only |

---

## Audit table

| activity ID | slug | year | category mapping | indicator mapping | evidence mapping | confidence | source basis | unresolved note |
|-------------|------|------|------------------|-------------------|------------------|------------|--------------|-----------------|
| ACT-2568-001 | simina3 | 2568 | meeting (confirmed) | — | — | UNRESOLVED | Steering committee meeting | Generic ops meeting |
| ACT-2568-003 | realy2025 | 2568 | campaign (confirmed) | 2.2.2 | — | SUPPORTED | Community rally / awareness event body | — |
| ACT-2568-002 | mjuecoday2025 | 2568 | campaign (confirmed) | 2.2.2 | — | SUPPORTED | MJU ECO DAY conservation awareness body | — |
| ACT-2568-004 | fire2028 | 2568 | preparedness (confirmed) | 5.5.1 | ev-cat5-emergency-drill-fy2568 (doc only) | CONFIRMED | Evacuation drill; date matches evidence 30 May 2568 | Evidence not on record — schema gap |
| ACT-2568-005 | bigcleaning2025-1 | 2568 | campaign (confirmed) | 5.4.3 | ev-cat5-livability-maintenance-fy2568 (doc only) | CONFIRMED | Title + evidence “Big Cleaning Day #1/2568” | Evidence not on record — schema gap |
| ACT-2568-006 | g-green2025mju | 2568 | award (confirmed) | — | — | UNRESOLVED | G-Green award ceremony | No valid 3-part indicator |
| ACT-2568-007 | simina7mar2025 | 2568 | meeting (confirmed) | — | — | UNRESOLVED | Steering committee | No explicit indicator narrative |
| ACT-2568-008 | simina1-2025 | 2568 | meeting (confirmed) | 1.7.2 | — | CONFIRMED | Body: ทบทวนนโยบายและขอบเขตการจัดการสิ่งแวดล้อม | — |
| ACT-2567-001 | qa2024 | 2567 | assessment (confirmed) | — | — | UNRESOLVED | External GO assessment FY2567 | 7.1/7.2 are 2-part — invalid for relatedIndicators |
| ACT-2567-009 | traininggreen | 2567 | training (confirmed) | — | — | UNRESOLVED | Title cites training; body stub | Title-only blocked |
| ACT-2567-002 | 5s | 2567 | campaign (confirmed) | 2.2.2 | — | SUPPORTED | Body: 5ส Green Office campaign | — |
| ACT-2567-003 | emergency2024 | 2567 | preparedness (confirmed) | 5.5.1 | ev-cat5-emergency-drill-fy2568 (doc only) | CONFIRMED | Fire/earthquake evacuation title | FY2567 activity; FY2568 evidence |
| ACT-2567-004 | green-office2 | 2567 | training (confirmed) | 2.1.1 | — | SUPPORTED | Assessment-prep training (#39+#40 merge) | — |
| ACT-2567-005 | green-office-2567 | 2567 | training (confirmed) | 2.1.1 | — | SUPPORTED | Internal audit training disposition/body | — |
| ACT-2567-006 | problem | 2567 | meeting (confirmed) | 1.3.1 | — | CONFIRMED | Environmental problem identification meeting | — |
| ACT-2567-007 | activity1-2 | 2567 | meeting (confirmed) | — | — | UNRESOLVED | Steering committee | Generic meeting |
| ACT-2567-008 | activity1 | 2567 | meeting (confirmed) | — | — | UNRESOLVED | Cat1 committee meeting | Thin body vs ACT-2568-008 |
| ACT-2566-001 | activity1-6 | 2566 | training (confirmed) | — | — | UNRESOLVED | Title suggests training; body stub | Await body restoration |
| ACT-2566-002 | big | 2566 | campaign (confirmed) | 2.2.2 | — | SUPPORTED | Big Cleaning Day 2023 | — |

---

## Apply / validate

```bash
node scripts/apply-activities-phase-f-mapping.mjs --write   # relatedIndicators only
node scripts/validate-activities.mjs
node --test scripts/test-activities-phase-f.mjs
```

Publish sequence unchanged — search index unaffected (`relatedIndicators` not indexed).

---

## Remaining Phase F backlog

1. PO approve `evidenceIds[]` (or `linkedEvidence[]`) on activity contract
2. Widen `relatedIndicators` validator to accept issue-level codes (`7.1`, `7.2`) OR add 3-part cat7 assessment codes
3. Map 6 UNRESOLVED activities after richer Joomla body OCR or PO disposition
4. Promote evidence candidates (e.g. bigcleaning) after human verification
5. Surface `relatedIndicators` on activity detail UI (currently unused)
