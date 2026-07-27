# GO-M365-5 — Implementation Backlog

> **Date**: 2026-07-27  
> **Authoritative Baseline**: `docs/sharepoint/GO-M365-3-flow-contract.zip`  
> **Reference Docs**: GO-M365-4-IMPLEMENTATION-SPEC.md, GO-M365-5-DETAILED-DESIGN.md  
> **Status**: Planning — ready for GO-M365-6 execution

---

## Epic Overview

```
EPIC-01 ──▶ EPIC-02 ──▶ EPIC-03 ──▶ EPIC-04 ──▶ EPIC-05 ──▶ EPIC-06 ──▶ EPIC-07 ──▶ EPIC-08
Infra      SP Lists   Approval   Notify     Dashboard  Security   Testing    Deploy
```

| Epic | Name | Priority | Est. Hours | Dependencies |
|---|---|---|---|---|
| EPIC-01 | Infrastructure | 🔴 P0 | 2.0 | None |
| EPIC-02 | SharePoint Lists | 🔴 P0 | 3.0 | EPIC-01 |
| EPIC-03 | Approval Engine | 🔴 P0 | 4.5 | EPIC-01, EPIC-02 |
| EPIC-04 | Notifications | 🟡 P1 | 3.0 | EPIC-03 |
| EPIC-05 | Dashboard Integration | 🟢 P2 | 2.0 | EPIC-02 |
| EPIC-06 | Security | 🟡 P1 | 2.0 | EPIC-01 |
| EPIC-07 | Testing | 🟡 P1 | 3.0 | EPIC-03, EPIC-04 |
| EPIC-08 | Production Deployment | 🔴 P0 | 1.0 | EPIC-07 |

**Total Estimated Effort**: 20.5 hours

---

## EPIC-01 — Infrastructure

### Goal
Establish the foundational Power Platform configuration: connections, solution, and environment setup.

### Owner
Flow Administrator (Research Office)

### Dependencies
- ✅ Maejo365 tenant access
- ✅ Power Automate Maker Portal accessible
- ⚠️ Microsoft Approvals license verification needed (Task 1.6)

### Tasks

| ID | Task | Description | Est. (h) | AC |
|---|---|---|---|---|
| **1.1** | Verify tenant connectivity | Log in to Power Automate Maker Portal as researchmju@mju.ac.th | 0.25 | Portal accessible |
| **1.2** | Create SharePoint connection | Create OAuth connection to shared_sharepointonline for msteams_54adc4 site | 0.5 | Connection appears in Connections list |
| **1.3** | Create O365 Outlook connection | Create OAuth connection to shared_office365 | 0.25 | Connection appears in Connections list |
| **1.4** | Create Approvals connection | Create OAuth connection to shared_approvals | 0.25 | Connection appears in Connections list |
| **1.5** | Create "Green Office Assessment" solution | New solution in Default environment; add publisher metadata | 0.5 | Solution visible in Solutions tab |
| **1.6** | Verify Approvals license | Check that Approvals connector is licensed for the tenant | 0.25 | Confirmed available or escalation raised |

### Acceptance Criteria
- [ ] All 3 connections created and healthy
- [ ] Solution "Green Office Assessment" exists in Default environment
- [ ] Approvals license confirmed or escalation logged

---

## EPIC-02 — SharePoint Lists

### Goal
Prepare the GO Approval Workflow SharePoint list with the required column schema for assessment record persistence.

### Owner
SharePoint Administrator / Flow Owner

### Dependencies
- EPIC-01 (SharePoint connection)

### Tasks

| ID | Task | Description | Est. (h) | AC |
|---|---|---|---|---|
| **2.1** | Verify list access | Navigate to msteams_54adc4 → GO Approval Workflow list; confirm read/write | 0.25 | List opens, no permission errors |
| **2.2** | Create MetricName column | Add Single line of text column | 0.25 | Column visible in list settings |
| **2.3** | Create MetricValue column | Add Multiple lines of text column | 0.25 | Column visible |
| **2.4** | Create SubmitterEmail column | Add Single line of text column | 0.25 | Column visible |
| **2.5** | Create SubmitterName column | Add Single line of text column | 0.25 | Column visible |
| **2.6** | Create ApproverEmail column | Add Single line of text column | 0.25 | Column visible |
| **2.7** | Create ApproverName column | Add Single line of text column | 0.25 | Column visible |
| **2.8** | Create ApprovalStatus column | Add Choice column: Approved, Rejected, TimedOut | 0.5 | Choices visible |
| **2.9** | Create ApprovalDate column | Add Date and Time column | 0.25 | Column visible |
| **2.10** | Create ApproverComments column | Add Multiple lines of text column | 0.25 | Column visible |
| **2.11** | Create FlowRunId column | Add Single line of text column | 0.25 | Column visible |
| **2.12** | Validate column schema | Cross-check against FR-4 specification in IMPLEMENTATION-SPEC.md | 0.25 | All 11 custom columns match spec |

### Acceptance Criteria
- [ ] All 11 custom columns created per FR-4 specification
- [ ] Choice column has correct options (Approved, Rejected, TimedOut)
- [ ] List accessible from flow (test connection from Power Automate)

---

## EPIC-03 — Approval Engine

### Goal
Convert the recovered Flow skeleton into a working approval engine implementing the core path: Submission → Approval request → Approved/Rejected → Update SharePoint item.

### Owner
Flow Developer

### Dependencies
- ✅ EPIC-01 (connections established: SharePoint, O365 Outlook, Standard approvals)
- ✅ EPIC-02 (SharePoint columns created)

### Implementation Status: ⚠️ PARTIAL

| ID | Task | Description | Est. (h) | Actual | Status |
|---|---|---|---|---|---|
| **3.1** | Backup flow before changes | Export flow as .zip backup | 0.25 | 0.25 | ✅ Done |
| **3.2** | Configure trigger schema | Add 7 inputs: SharePointItemId, MetricName, MetricValue, SubmitterEmail, SubmitterName, ApproverEmail, ApproverName | 0.5 | 1.0 | ✅ Done |
| **3.3** | Add Initialize variable | ApprovalStatus = "Pending" (String) | 0.25 | 0.5 | ✅ Done |
| **3.4** | Add SharePoint Get items | Retrieve item by ID with filter query | 0.5 | 1.0 | ✅ Done |
| **3.5** | Add Start and wait for approval | First to respond, assigned to ApproverEmail | 1.0 | 2.0 | ✅ Done |
| **3.6** | Add Condition (Approve/Reject) | Check Responses Approver response = "Approve" | 0.5 | 1.0 | ⚠️ Partial |
| **3.7** | Add Update item (IF TRUE) | Set ApprovalStatus = Approved, date, comments, run ID | 1.0 | 0.0 | ❌ Not done |
| **3.8** | Add Update item (IF FALSE) | Set ApprovalStatus = Rejected, date, comments, run ID | 1.0 | 0.0 | ❌ Not done |
| **3.9** | Add error handling scope | Configured failure scope with structured error result | 0.5 | 0.0 | ❌ Not done |
| **3.10** | Update Compose for structured result | Return JSON to Power Apps caller | 0.25 | 0.0 | ❌ Not done |
| **3.11** | Flow checker validation | Run checker, fix errors | 0.25 | 0.0 | ❌ Not done |

### Acceptance Criteria (Updated)
- [ ] ✅ Trigger accepts 7 input parameters
- [ ] ✅ Approval request sent to ApproverEmail
- [ ] ❌ Approve branch updates SharePoint item with correct values
- [ ] ❌ Reject branch updates SharePoint item with correct values
- [ ] ❌ Error handling returns structured result
- [ ] ❌ Flow checker has no blocking errors
- [ ] ❌ Test items cleaned up after validation

---

## EPIC-04 — Notifications

### Goal
Implement the complete notification matrix: 5 email templates covering all outcomes.

### Owner
Flow Developer

### Dependencies
- EPIC-03 (approval engine with condition branches)

### Tasks

| ID | Task | Description | Est. (h) | AC |
|---|---|---|---|---|
| **4.1** | Implement T1 (Approved email) | Add Send_Approved_Email in Approve branch | 0.5 | Email received by test submitter on approval |
| **4.2** | Implement T2 (Rejected email) | Add Send_Rejected_Email in Reject branch | 0.5 | Email received with approver comments |
| **4.3** | Implement T3 (Timeout email) | Add Send_Timeout_Email in Timeout branch | 0.5 | Email received after timeout simulation |
| **4.4** | Implement T4 (Duplicate warning) | Add Send_Dup_Warning in Duplicate branch | 0.25 | Email received on duplicate submit |
| **4.5** | Implement T5 (Error alert) | Add Send_Error_Email in Catch block | 0.25 | Owner receives error alert |
| **4.6** | Validate all templates | Test each template with sample data | 1.0 | All 5 templates deliver correctly |

### Acceptance Criteria
- [ ] 5 distinct email templates working
- [ ] Templates contain all required merge fields (AssessmentId, MetricName, ApproverName, etc.)
- [ ] Email sender address is flow owner (not personal account)
- [ ] HTML formatting renders correctly in Outlook

---

## EPIC-05 — Dashboard Integration

### Goal
Prepare SharePoint data for future dashboard consumption.

### Owner
Flow Developer / SharePoint Admin

### Dependencies
- EPIC-02 (SharePoint columns)

### Tasks

| ID | Task | Description | Est. (h) | AC |
|---|---|---|---|---|
| **5.1** | Create view: Pending Approvals | SharePoint view filtering ApprovalStatus = "Approved" in last 30 days | 0.25 | View shows filtered results |
| **5.2** | Create view: All Records | SharePoint view showing all columns, sorted by ApprovalDate desc | 0.25 | View shows all records |
| **5.3** | Validate data integrity | Verify all required columns populated in test records | 0.25 | No nulls in required columns |
| **5.4** | Document Power BI schema | Write data dictionary for future Power BI connection | 1.0 | Document committed |
| **5.5** | Test Power BI connection | Connect Power BI Desktop to GO Approval Workflow list | 0.25 | Connection succeeds, data visible |

### Acceptance Criteria
- [ ] 2 SharePoint views configured
- [ ] Power BI can connect to the list
- [ ] Data dictionary document committed

---

## EPIC-06 — Security

### Goal
Harden the flow with error handling, audit logging, and least-privilege configuration.

### Owner
Flow Developer

### Dependencies
- EPIC-01 (connections)

### Tasks

| ID | Task | Description | Est. (h) | AC |
|---|---|---|---|---|
| **6.1** | Wrap primary actions in Try Scope | Create Try scope containing all validation + approval + persistence actions | 0.5 | Scope visible in Designer |
| **6.2** | Add Catch_Error handler | Add Catch All branch with Compose logging EVT-009 | 0.25 | Error captured in log |
| **6.3** | Wire Send_Error_Email to Catch | Connect Catch_Error → Send_Error_Email (T5) | 0.25 | Owner notified on error |
| **6.4** | Configure retry on SharePoint Create | Set retry policy: fixed, 3 retries, 10s interval | 0.25 | Retry policy visible in action settings |
| **6.5** | Validate least privilege | Review each connector permission; confirm minimal scope | 0.5 | No excess permissions |
| **6.6** | Document security model | Update design doc with as-built security configuration | 0.25 | Documentation committed |

### Acceptance Criteria
- [ ] Try/Catch scope wraps all primary actions
- [ ] All 9 audit events (EVT-001 through EVT-009) loggable
- [ ] SharePoint retry policy active
- [ ] No hardcoded credentials
- [ ] Security documentation updated

---

## EPIC-07 — Testing

### Goal
Comprehensive end-to-end validation of all flow paths.

### Owner
QA / Flow Developer

### Dependencies
- EPIC-03 (approval engine)
- EPIC-04 (notifications)
- EPIC-06 (error handling)

### Tasks

| ID | Task | Description | Est. (h) | AC |
|---|---|---|---|---|
| **7.1** | Test happy path | Submit valid payload → approve → verify SP item + email | 0.5 | All steps pass |
| **7.2** | Test reject path | Submit valid payload → reject → verify email only (no SP item) | 0.5 | Rejection email sent, no SP item |
| **7.3** | Test timeout path | Submit valid payload → wait/force timeout → verify timeout email | 0.5 | Timeout email sent |
| **7.4** | Test duplicate path | Submit same AssessmentId twice → verify duplicate warning | 0.25 | Duplicate detected, warning sent |
| **7.5** | Test schema validation | Submit invalid payloads (missing required, bad email) → verify rejection | 0.5 | All invalid payloads rejected |
| **7.6** | Test error handling | Force SP connection failure → verify Catch block + owner email | 0.5 | Error caught, owner notified |
| **7.7** | Test SharePoint columns | Verify all 11 columns populated correctly in approved record | 0.25 | No missing or truncated data |

### Acceptance Criteria
- [ ] All 6 flow paths tested
- [ ] 0 unhandled errors
- [ ] All AC categories from IMPLEMENTATION-SPEC.md verified
- [ ] Test results documented

---

## EPIC-08 — Production Deployment

### Goal
Package flow as managed solution, export, version, and commit to repository.

### Owner
Flow Developer

### Dependencies
- EPIC-07 (all tests pass)

### Tasks

| ID | Task | Description | Est. (h) | AC |
|---|---|---|---|---|
| **8.1** | Update contentVersion | Set `contentVersion` to `"1.0.0.0"` in flow definition | 0.1 | Value updated |
| **8.2** | Add flow to solution | Associate GO Metric Approval Workflow with "Green Office Assessment" solution | 0.25 | Flow listed in solution |
| **8.3** | Export as managed solution | Export solution as managed .zip | 0.25 | ZIP file generated |
| **8.4** | Validate exported package | Check ZIP structure, JSON validity, connection references | 0.25 | All valid |
| **8.5** | Commit to Git | Add exported ZIP + updated docs; commit | 0.1 | Commit pushed to origin/master |
| **8.6** | Tag release | Create Git tag `v1.0.0-go-m365-6` | 0.05 | Tag created |

### Acceptance Criteria
- [ ] `contentVersion: "1.0.0.0"` set
- [ ] Flow in "Green Office Assessment" solution
- [ ] Managed .zip exported and valid
- [ ] Git tag `v1.0.0-go-m365-6` created
- [ ] All documentation updated with final as-built state

---

## Backlog Summary

| Epic | Tasks | Est. Hours | Priority |
|---|---|---|---|
| EPIC-01 Infrastructure | 6 | 2.0 | 🔴 P0 |
| EPIC-02 SharePoint Lists | 12 | 3.0 | 🔴 P0 |
| EPIC-03 Approval Engine | 12 | 4.5 | 🔴 P0 |
| EPIC-04 Notifications | 6 | 3.0 | 🟡 P1 |
| EPIC-05 Dashboard Integration | 5 | 2.0 | 🟢 P2 |
| EPIC-06 Security | 6 | 2.0 | 🟡 P1 |
| EPIC-07 Testing | 7 | 3.0 | 🟡 P1 |
| EPIC-08 Production Deployment | 6 | 1.0 | 🔴 P0 |
| **Total** | **60** | **20.5** | |

### Critical Path

```
EPIC-01 → EPIC-02 → EPIC-03 → EPIC-07 → EPIC-08
                             ↘ EPIC-04 ↗
                             ↘ EPIC-06 ↗
```

### Parallelizable Work

- EPIC-04 and EPIC-06 can start once EPIC-03 is underway (not complete)
- EPIC-05 can start after EPIC-02 is complete (independent of EPIC-03)
- EPIC-07 requires EPIC-03 + EPIC-04 complete
- EPIC-08 requires EPIC-07 complete

---

*End of Implementation Backlog*  
*Document Version: 1.0*  
*Date: 2026-07-27*
