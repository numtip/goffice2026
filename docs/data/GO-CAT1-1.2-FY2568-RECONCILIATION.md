# GO-CAT1-1.2-FY2568-RECONCILIATION

**Date:** 2026-08-19  
**Status:** COMPLETE — Phase A + About hub reconciliation  
**Scope:** FY2568 indicators 1.2.1 / 1.2.2 + `/about/` foundation hub alignment  
**Primary source:** `1.2/1.2.1-คณะทำงานด้านสิ่งแวดล้อมปี2568.pdf`  
**Supporting:** `doc/Order_appointing_the_committee.pdf` (RAE operational order, scanned)

---

## 1. `/about/committee/` runtime audit

| Aspect | Finding | Classification |
|---|---|---|
| Page implementation | `AboutDocExperience` + `documents.json` metadata | `reusable_with_reconciliation` |
| Member registry JSON | **None** (no duplicate roster) | `canonical_reusable` |
| Committee structure | OCR summary in `document-summaries.json` only | `reusable_with_reconciliation` |
| 1.2.2 understanding doc | Duplicate of policy review (FY2569) | `conflicting` for 1.2.2 only |
| Indicator score claims | None on About page | `canonical_reusable` |

**Material conflict with signed FY2568 order:** None. Page 1 of 1.2.1 PDF confirms president signature 25 Mar 2568, 4 orgs, all-category coverage. RAE order attachment (pages 2–7 scanned) aligns with oversight + category working groups.

---

## 2. Canonical reuse decision

**Single contract:** `src/data/category1/environmental-committee.json`

| Consumer | Role |
|---|---|
| `/about/committee/` | People/structure/governance view via `AboutCanonicalFacts` |
| `/indicators/1.2.1/` | Indicator journey via `Cat1CommitteeGovernanceJourney` |
| `/indicators/1.2.2/` | Evidence-gap journey (MISSING) |

**Organization entities:** Reuse `scope-org-1..4` from `activities-aspects.json` — no second org registry.

**97 count semantics:** Organizational personnel/representative sum (63+25+5+4) — **not** deduplicated unique committee members.

**Order number:** Not on extracted page 1; `orderRef: null` until OCR of scanned pages 2–7. **345/2568** is management-review body order (1.7.1), not GO committee appointment.

---

## 3. 1.2.1 reconciliation

| Field | Value | Source |
|---|---|---|
| Written appointment | Yes | §1.2.1(1) |
| Signed by | President of Maejo University | §1.2.1(1) |
| Date | 25 Mar 2568 (2025-03-25) | §1.2.1(1) |
| Organizations | 4 (RAE 63, IQS 25, ICAP 5, rice unit 4) | §1.2.1(1) |
| Category coverage | All 7 | §1.2.1(1)-(2) + order structure |
| Combined group | Cat 1 + Cat 7 | Order structure (metadata-verified) |
| Governance groups | Oversight + Cat 2–6 WGs + Cat1+7 combined | Order summary |

---

## 4. 1.2.2 result

| Field | Value |
|---|---|
| Status | **MISSING** |
| Sample size | null |
| Understanding % | null |
| Source | PDF p.8 stub `-สัมภาษณ์-` only |
| doc-committee-understanding | Duplicate meeting minutes — not a role-understanding instrument |

---

## 5. ABOUT HUB RECONCILIATION

### Canonical mapping

| About route | CAT1 | Contract domain |
|---|---|---|
| `/about/scope/` | 1.1.1 | `activities-aspects` |
| `/about/policy/` | 1.1.2 | `activities-aspects` |
| `/about/goals/` | 1.1.3 | `targets` |
| `/about/action-plan/` | 1.1.4, 1.6.1 | `projects` (`proj-plan-1`) + FY2569 Excel |
| `/about/committee/` | 1.2.1, 1.2.2 gap | `environmental-committee` |

### Stale items fixed

- Removed generic OCR-pending notices where CAT1 verification complete (scope, policy)
- Goals notice: domain % targets vs FY2567, not “all per-person”
- Action-plan `relatedIndicators`: **1.1.4 / 1.6.1** (was stale 1.5.1/1.5.2)
- Committee: replaced “awaiting PO confirmation” with conclusive **MISSING** for 1.2.2
- Hub index: foundation flow Scope → Policy → Goals → Plan → Governance

### FY2568 / FY2569 separation

- **FY2568:** `AboutCanonicalFacts` baseline panel (proj-plan-1 for action-plan)
- **FY2569:** `ActionPlanExperience` from Excel — explicitly labeled below baseline
- Years not merged into one dataset

### Remaining gaps

- Committee member roster + exact order number: scanned attachment pages 2–7 (OCR pending)
- 1.2.2 interview evidence: MISSING
- 1.1.2(4) executive interview: PARTIAL (unchanged)
- Room inventory tables: partial (image-only in scope PDF)

---

## 6. Phase A gate

**PASS** — Canonical committee identity resolved; no duplicate registry; signed order authority confirmed; 1.2.2 truthfully MISSING.
