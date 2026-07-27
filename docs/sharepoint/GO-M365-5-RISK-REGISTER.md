# GO-M365-5 — Risk Register

> **Date**: 2026-07-27  
> **Authoritative Baseline**: `docs/sharepoint/GO-M365-3-flow-contract.zip`  
> **Reference Docs**: GO-M365-4-ARCHITECTURE-REVIEW.md (baseline risks), GO-M365-5-DETAILED-DESIGN.md  
> **Status**: Living document — reviewed before GO-M365-6 execution

---

## Risk Taxonomy

| Level | Description |
|---|---|
| 🔴 **Critical** | Would prevent GO-M365-6 implementation or cause data loss |
| 🟡 **High** | Would significantly delay or degrade the implementation |
| 🟠 **Medium** | Would require workaround or add <2 days to schedule |
| 🟢 **Low** | Minor impact; acceptable or easily mitigated |

---

## Inherited Baseline Risks (from GO-M365-4 Architecture Review)

These risks were identified during the baseline analysis and remain active.

| ID | Description | Impact | Probability | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|
| **R-01** | No approval actions — flow named "Approval Workflow" but contains zero approval logic | 🔴 Critical | Certain | EPIC-03 implements Start and Wait for Approval | Flow Developer | 🟡 Open — will be resolved in EPIC-03 |
| **R-02** | Zero connection references — flow cannot interact with any external service | 🔴 Critical | Certain | EPIC-01 creates 3 connectors | Flow Developer | 🟡 Open — will be resolved in EPIC-01 |
| **R-03** | No input validation — any payload accepted, risk of data corruption | 🔴 Critical | High | EPIC-03 Task 3.2 enforces schema | Flow Developer | 🟡 Open — will be resolved in EPIC-03 |
| **R-04** | No output — flow terminates silently, caller receives no feedback | 🔴 Critical | High | EPIC-04 implements notification matrix | Flow Developer | 🟡 Open — will be resolved in EPIC-04 |
| **R-05** | Per-user execution plan — approver must be explicitly configured per submission | 🟡 High | Medium | Assign ApproverEmail in trigger payload; document limitation | Flow Developer | 🟢 Accepted — documented in spec |
| **R-06** | No duplicate detection — same AssessmentId can create duplicate records | 🟡 High | Medium | EPIC-03 Task 3.5-3.7 implement duplicate check | Flow Developer | 🟡 Open — will be resolved in EPIC-03 |
| **R-07** | No timeout handling — approval can pend indefinitely | 🟡 High | Medium | EPIC-03 Task 3.8 configures P7D timeout | Flow Developer | 🟡 Open — will be resolved in EPIC-03 |
| **R-08** | Unmanaged solution — `isManaged: false`, no ALM lifecycle | 🟠 Medium | Medium | EPIC-08 packages as managed solution | Flow Developer | 🟡 Open — will be resolved in EPIC-08 |
| **R-09** | Undefined content version — `"undefined"`, traceability gap | 🟢 Low | High | EPIC-08 Task 8.1 sets version | Flow Developer | 🟡 Open — will be resolved in EPIC-08 |
| **R-10** | Power Apps app not created — flow has no caller | 🟠 Medium | High | Deferred to future project; manual test trigger used in GO-M365-6 | Product Owner | 🟢 Accepted — out of scope |
| **R-11** | Single environment — no dev/test/prod separation | 🟠 Medium | Medium | Export backup before changes; manual rollback plan | Flow Developer | 🟢 Accepted — documented mitigation |

---

## Implementation Risks (New for GO-M365-5/6)

These risks are specific to the GO-M365-6 implementation phase.

| ID | Description | Impact | Probability | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|
| **R-12** | Microsoft Approvals license not available in Maejo365 tenant | 🔴 Critical | Medium | EPIC-01 Task 1.6 verifies license before EPIC-03 starts. Escalate to M365 Admin if unavailable. | M365 Admin | ⚠️ Open — verification pending |
| **R-13** | SharePoint list columns cannot be created (permission error) | 🔴 Critical | Low | EPIC-02 verifies list access; escalate to Site Owner if blocked | SharePoint Admin | ⚠️ Open — verification pending |
| **R-14** | Flow Designer limits on action count (15 actions may hit UI complexity) | 🟡 High | Low | Use Compose actions to minimize connector usage; test gradually | Flow Developer | 🟢 Mitigated — 15 actions is well within limits |
| **R-15** | OAuth connection consent required from tenant admin | 🟡 High | Medium | EPIC-01 creates connections; if consent blocked, escalate to M365 Admin | M365 Admin | ⚠️ Open — may affect EPIC-01 |
| **R-16** | Email deliverability — notification emails may go to spam/junk | 🟠 Medium | Medium | Use verified sender (flow owner account); test deliverability in EPIC-07 | Flow Developer | 🟡 Open — test during EPIC-07 |
| **R-17** | SharePoint retry policy may not cover all transient failures | 🟠 Medium | Low | Configure standard retry ×3; monitor flow run history for patterns | Flow Developer | 🟢 Mitigated — retry configured |
| **R-18** | Approval timeout P7D may be too short/long for business process | 🟠 Medium | Medium | Document as configurable; adjust based on stakeholder feedback during testing | Product Owner | 🟢 Accepted — adjustable before go-live |
| **R-19** | Flow per-user plan means flow owner must have all connector permissions | 🟠 Medium | Low | Verify owner permissions during EPIC-01; document required permissions | Flow Developer | 🟡 Open — verify during EPIC-01 |
| **R-20** | Git repository merge conflicts with concurrent documentation updates | 🟢 Low | Low | Commit documentation-only changes before implementation starts | Developer | 🟢 Mitigated — docs committed first |

---

## Operational Risks

| ID | Description | Impact | Probability | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|
| **R-21** | Flow disabled by Microsoft due to inactivity (90-day policy) | 🟡 High | Low | Include test trigger in monthly workflow; document runbook | Flow Owner | 🟢 Mitigated — documented in runbook |
| **R-22** | Approver leaves organization — pending approvals stranded | 🟠 Medium | Medium | Flow owner can reassign; document reassignment procedure | Flow Owner | 🟢 Accepted — manual reassignment |
| **R-23** | SharePoint storage limits exceeded | 🟢 Low | Very Low | Assessment records are small (text); estimate <1 MB/year | SharePoint Admin | 🟢 Mitigated — negligible storage |
| **R-24** | Power Automate service outage during approval window | 🟠 Medium | Very Low | Microsoft SLA covers platform availability; no client-side mitigation | N/A | 🟢 Accepted — platform risk |

---

## Risk Summary by Status

| Status | Count | Risks |
|---|---|---|
| 🔴 Open (Critical) | 2 | R-12 (license), R-13 (SP permissions) |
| 🟡 Open (High/Medium) | 10 | R-01 to R-08, R-15, R-16 |
| 🟢 Accepted/Mitigated | 12 | R-05, R-09, R-10, R-11, R-14, R-17, R-18, R-20, R-21, R-22, R-23, R-24 |
| **Total** | **24** | |

---

## Pre-Implementation Checklist

Before starting GO-M365-6, verify the following mitigation actions:

| # | Action | Owner | Status |
|---|---|---|---|
| 1 | Verify Microsoft Approvals license (R-12) | M365 Admin | ⬜ |
| 2 | Confirm SharePoint list write permissions (R-13) | SharePoint Admin | ⬜ |
| 3 | Verify OAuth consent availability (R-15) | M365 Admin | ⬜ |
| 4 | Confirm flow owner has required permissions (R-19) | Flow Developer | ⬜ |
| 5 | Export current flow as backup before changes | Flow Developer | ⬜ |
| 6 | Review risk register with stakeholders | Product Owner | ⬜ |

---

## Risk Review Cadence

| Milestone | Review Trigger |
|---|---|
| Before EPIC-01 start | Review R-12, R-13, R-15, R-19 |
| After EPIC-03 complete | Review R-01, R-03, R-06, R-07 (resolved?) |
| Before EPIC-07 start | Review R-16, R-17, R-18 |
| Before EPIC-08 start | Review R-08, R-09 (resolved?) |
| Monthly post-deployment | Review R-21, R-22, R-23, R-24 |

---

*End of Risk Register*  
*Document Version: 1.0*  
*Date: 2026-07-27*
