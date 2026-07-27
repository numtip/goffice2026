# GO-M365-6 — EPIC-03 Approval Engine Report

> **Date**: 2026-07-27  
> **Account**: `researchmju@mju.ac.uk`  
> **Environment**: `Default-8ec74a39-ddf6-41e1-b0a2-ff0459ea8eb8`  
> **Target Flow**: GO Metric Approval Workflow  
> **Flow ID**: `40e04977-38cf-42ad-a1e5-bbefbf5cbac1`  
> **Status**: ⚠️ EPIC-03 PARTIAL — **DE-SCOPED per ADR-0001**  
> **Architecture Decision**: ADR-0001 — Approval engine removed from scope. This report is archived as historical reference.

---

## 1. Pre-Implementation Checks

| Check | Result | Detail |
|---|---|---|
| Repository clean on master | ✅ Pass | `8791b89d6f9c577158220710d37c7fb5c9274420` |
| origin/master synchronized | ✅ Pass | HEAD = origin/master |
| Flow backup exists | ✅ Verified | `docs/sharepoint/GO-M365-3-flow-contract-backup.zip` |
| SHA-256 matches | ✅ Verified | Documented in EPIC-02 |
| SharePoint internal names | ✅ Confirmed | See field inventory below |
| Delete-test sequence from EPIC-02 | ✅ Confirmed | Documented |
| Wording ambiguity resolved | ✅ Complete | ADR columns preserved, FR columns created, total = 11 target + 11 pre-existing |

### SharePoint Field Inventory

| # | Internal Name | Type | Required | Status |
|---|---|---|---|---|
| 1 | Title | Text | ✅ | Pre-existing |
| 2 | MetricName | Text | ✅ | Created EPIC-02 |
| 3 | MetricValue | Note | ✅ | Created EPIC-02 |
| 4 | SubmitterEmail | Text | ✅ | Created EPIC-02 |
| 5 | SubmitterName | Text | ✅ | Created EPIC-02 |
| 6 | ApproverEmail | Text | ✅ | Created EPIC-02 |
| 7 | ApproverName | Text | ✅ | Created EPIC-02 |
| 8 | ApprovalStatus | Choice | ✅ | Created EPIC-02 — Options: Approved, Rejected, TimedOut |
| 9 | ApprovalDate | DateTime | ✅ | Created EPIC-02 |
| 10 | ApproverComments | Note | ❌ | Created EPIC-02 |
| 11 | FlowRunId | Text | ✅ | Created EPIC-02 |

---

## 2. Flow Implementation

### Trigger Schema

```
Type: Request (PowerAppV2)
Inputs:
  - SharePointItemId (Number, Required)
  - MetricName (Text, Required)
  - MetricValue (Text, Required)
  - SubmitterEmail (Text, Required)
  - SubmitterName (Text, Required)
  - ApproverEmail (Text, Required)
  - ApproverName (Text, Required)
```

### Flow Actions

| # | Action Name | Type | Connector | Status |
|---|---|---|---|---|
| 1 | When Power Apps calls a flow (V2) | Trigger | Power Apps | ✅ Configured |
| 2 | Initialize variable | Action | Variable | ✅ ApprovalStatus = "Pending" |
| 3 | Get items | Action | SharePoint | ✅ Site + List configured, Filter Query: `Id eq SharePointItemId` |
| 4 | For each | Scope | — | ✅ Auto-wrapped (single item iteration) |
| 5 | Start and wait for an approval | Action | Standard approvals | ✅ Type: Approve/Reject First to respond; Title: "Green Office metric approval - {MetricName}"; Assigned To: {ApproverEmail} |
| 6 | For each 1 | Scope | — | ⚠️ Auto-wrapped for approval responses |
| 7 | Condition | Action | Control | ⚠️ Added but configuration needs re-verification |
| 8 | Update item (IF TRUE) | Action | SharePoint | ❌ Not implemented |
| 9 | Update item (IF FALSE) | Action | SharePoint | ❌ Not implemented |
| 10 | Compose | Action | Data Operation | ✅ Pre-existing (needs update for structured result) |

### Connector Mapping

| Connector | Used By | Status |
|---|---|---|
| Power Apps | Trigger | Authenticated |
| SharePoint | Get items (planned Update item) | Connected as `researchmju@mju.ac.th` |
| Standard approvals | Start and wait for an approval | Connected |
| Office 365 Outlook | (Not used yet — EPIC-04) | Connected |

---

## 3. Gaps and Known Limitations

| Gap | Impact | Priority | Mitigation |
|---|---|---|---|
| Update item not configured | Approval status is not written back to SharePoint | 🔴 Critical | Must be added before production use |
| Condition configuration may be lost | Approval branching may not work | 🔴 Critical | Must be re-verified |
| No error handling scope | Failures may go unhandled | 🟡 Medium | Add Configured failure scope |
| Compose not updated for structured result | Caller may not receive proper response | 🟡 Medium | Update to return structured JSON |
| Inner For each 1 (auto-wrapped) | Unnecessary iteration, adds complexity | 🟢 Low | Can be optimized |
| No retry policies | No automatic recovery from transient failures | 🟢 Low | Acceptable for MVP |

---

## 4. Remaining Work for EPIC-04 (Notifications)

| Item | Required Before EPIC-04 |
|---|---|
| Update item actions in Condition branches | ✅ Yes — must be complete |
| Error handling scope | ✅ Yes — must be complete |
| Structured response from Compose | 🔶 Recommended |
| Email notification on approval outcome | 🆕 EPIC-04 scope |
| Dashboard integration | ❌ Out of scope (deferred) |

---

## 5. Final Decision

**EPIC-03 PARTIAL**

The approval engine skeleton (trigger, variable setup, SharePoint item retrieval, and approval request creation) is in place and saved. However, the critical Update item actions that write ApprovalStatus back to SharePoint are not yet configured, and the Condition branching needs re-verification.

### Decision Criteria

| Criterion | Requirement | Status |
|---|---|---|
| Approved path succeeds | ✅ Must work end-to-end | ❌ Not tested (Update item missing) |
| Rejected path succeeds | ✅ Must work end-to-end | ❌ Not tested (Update item missing) |
| SharePoint updates verified | ✅ Must confirm field writes | ❌ Not verified |
| No blocking Flow checker errors | ✅ Must pass | ❌ Not checked (needs re-save) |
| Test cleanup completed | ✅ Must remove test items | ❌ Not performed |

**Next Step**: Before EPIC-04, the following must be completed:
1. Add SharePoint Update item in Condition TRUE branch (set ApprovalStatus = Approved, ApprovalDate, ApproverComments, FlowRunId)
2. Add SharePoint Update item in Condition FALSE branch (set ApprovalStatus = Rejected, same fields)
3. Re-verify Condition configuration
4. Add error handling scope
5. Update Compose for structured result
6. Run all 5 test cases
7. Clean up test items
