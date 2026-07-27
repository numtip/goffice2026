# GO-M365-4 — Implementation Specification

> **Date**: 2026-07-27  
> **Authoritative Baseline**: `docs/sharepoint/GO-M365-3-flow-contract.zip`  
> **Reference Docs**: GO-M365-3-flow-contract.md, GO-M365-3-BASELINE-FREEZE.md, GO-M365-3R8-EXTRACTION-REPORT.md  
> **Status**: Specification — not yet implemented

---

## 1. Scope

### In Scope

| Area | Description |
|---|---|
| **Flow Enhancement** | Transform the recovered placeholder flow into a functional approval workflow |
| **Trigger Interface** | Define strict input schema for the Power Apps trigger |
| **Approval Logic** | Implement Microsoft Approvals connector with conditional routing |
| **SharePoint Integration** | Persist assessment records to the GO Approval Workflow SharePoint list |
| **Notifications** | Email notifications to submitters and approvers via Office 365 Outlook |
| **Error Handling** | Failure paths, timeouts, and fallback actions |
| **Audit Trail** | Flow-level logging of all approval decisions |
| **Security** | Connection references, authentication, and permission model |

### Out of Scope

| Area | Rationale |
|---|---|
| Power Apps development | The calling app does not exist; this spec defines the contract only |
| Teams integration | No Teams channel or adaptive card requirements captured in recovered artifacts |
| Scheduled triggers | Only PowerAppV2 trigger recovered; no evidence of scheduling needs |
| Desktop flows | Cloud flow only; no RPA indicated |
| AI Builder | No AI/ML requirements present in recovered flow |
| Multi-environment deployment | Current scope is Default environment only |

---

## 2. Architecture Overview

### Target Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                      Power Platform (Maejo365)                     │
│                                                                   │
│  ┌──────────────────────┐     ┌────────────────────────────────┐ │
│  │  Power Apps (Future) │     │  GO Metric Approval Workflow    │ │
│  │  ───────────────────  │     │  ─────────────────────────────  │ │
│  │  Assessment Form      │────▶│  Trigger: PowerAppV2 (manual)   │ │
│  │  (Not yet created)    │     │  ┌────────────────────────────┐ │ │
│  │                       │     │  │ 1. Validate Input Schema   │ │ │
│  │                       │     │  │ 2. Parse Assessment Data   │ │ │
│  │                       │     │  │ 3. Start Approval          │ │ │
│  │                       │     │  │ 4. Condition: Outcome      │ │ │
│  │                       │     │  │    ├─ Approved             │ │ │
│  │                       │     │  │    │  ├─ SharePoint Create  │ │ │
│  │                       │     │  │    │  ├─ Notify Submitter   │ │ │
│  │                       │     │  │    │  └─ Log Decision       │ │ │
│  │                       │     │  │    └─ Rejected             │ │ │
│  │                       │     │  │       ├─ Notify Submitter   │ │ │
│  │                       │     │  │       └─ Log Decision       │ │ │
│  │                       │     │  └────────────────────────────┘ │ │
│  └──────────────────────┘     └────────────────────────────────┘ │
│                                                    │              │
│                          ┌─────────────────────────┼──────────┐  │
│                          │  SharePoint              │          │  │
│                          │  GO Approval Workflow List           │  │
│                          │  (msteams_54adc4)                    │  │
│                          └──────────────────────────────────────┘  │
│                                                                   │
│                          ┌──────────────────────────────────────┐  │
│                          │  Office 365 Outlook                   │  │
│                          │  Email notifications                 │  │
│                          └──────────────────────────────────────┘  │
│                                                                   │
│                          ┌──────────────────────────────────────┐  │
│                          │  Microsoft Approvals                  │  │
│                          │  Approval routing & decision capture  │  │
│                          └──────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Component Map

| Component | Current State | Target State |
|---|---|---|
| Power Apps App | ❌ Not created | 📋 Future — interface contract defined here |
| Flow Trigger | ✅ PowerAppV2 (no schema) | 🔄 PowerAppV2 (strict schema) |
| Compose Action | ✅ Extracts `Action` field | 🔄 Repurposed as schema validator |
| Approval Action | ❌ Absent | 📋 Start and Wait for Approval |
| Condition Branch | ❌ Absent | 📋 Approve / Reject switch |
| SharePoint Create | ❌ Absent | 📋 Write assessment record |
| Email Notification | ❌ Absent | 📋 Dual-path (approve/reject) |
| Error Handling | ❌ Absent | 📋 runAfter failure paths + Scopes |
| Logging | ❌ Absent | 📋 Audit trail via Compose logging |
| Connections | ❌ None (`{}`) | 📋 SharePoint + Office 365 + Approvals |

---

## 3. Current Recovered Flow (Baseline)

> **This section describes ONLY what exists. No additions.**

### Existing Structure

```
Flow: GO Metric Approval Workflow
  Flow ID: 40e04977-38cf-42ad-a1e5-bbefbf5cbac1
  Environment: Default-8ec74a39-ddf6-41e1-b0a2-ff0459ea8eb8
  Solution: Default Solution (unmanaged)
  
  Trigger: manual (PowerAppV2)
    Schema: {} (no constraints)
    
  Action: Compose
    Input: @{triggerBody()?['Action']}
    runAfter: {} (runs immediately)
  
  End (no further actions)
```

### Existing Identifiers (Preserved)

| Identifier | Value | Status |
|---|---|---|
| Flow ID | `40e04977-38cf-42ad-a1e5-bbefbf5cbac1` | → Preserve |
| Package Resource ID | `65e382b8-538f-40a9-b102-c4199df03ae3` | → Preserve for future import |
| Creator ID | `6693e9ff-447f-4998-ba67-72a8791aadf1` | → Preserve in audit |
| Tenant ID | `8ec74a39-ddf6-41e1-b0a2-ff0459ea8eb8` | → Preserve |
| SharePoint Site | `msteams_54adc4` | → Target for persistence |
| Shared List | GO Approval Workflow | → Target list |

---

## 4. Gap Analysis

### Capability Gap Matrix

| Capability | Current | Required | Gap |
|---|---|---|---|
| Trigger schema enforcement | ❌ `properties: {}` | ✅ Defined schema with required fields | 🔴 Critical |
| Approval routing | ❌ None | ✅ Start and Wait for Approval | 🔴 Critical |
| Conditional branching | ❌ None | ✅ Approve/Reject switch | 🔴 Critical |
| SharePoint persistence | ❌ None | ✅ Create Item in GO Approval Workflow list | 🔴 Critical |
| Email notification | ❌ None | ✅ Dual-path (approve/reject emails) | 🟡 High |
| Error handling | ❌ None | ✅ runAfter failure/timeout paths | 🟡 High |
| Connection configuration | ❌ Empty | ✅ SharePoint, O365, Approvals connectors | 🔴 Critical |
| Audit trail | ❌ None | ✅ Log decisions, timestamps, actors | 🟡 High |
| Input validation | ❌ None | ✅ Validate required fields before processing | 🟡 High |
| Retry logic | ❌ None | ✅ Retry SharePoint writes on transient failure | 🟢 Medium |
| Security context | ⚠️ Per-user plan | 📋 Consider service principal | 🟢 Medium |
| Content versioning | ❌ `"undefined"` | ✅ `"1.0.0.0"` | 🟢 Low |

### Action Count Delta

| Category | Current | Target | Net New |
|---|---|---|---|
| Triggers | 1 | 1 | 0 |
| Actions (total) | 1 | ~12-15 | ~11-14 |
| Conditions | 0 | 1 | 1 |
| Scopes | 0 | 1 | 1 |
| Connectors | 0 | 3 | 3 |

---

## 5. Functional Requirements

### FR-1: Trigger Input Schema

**Requirement**: The trigger MUST validate a defined JSON schema before processing.

**Proposed Schema**:

```json
{
  "type": "object",
  "properties": {
    "Action": {
      "type": "string",
      "enum": ["SubmitForApproval", "DraftSave", "Resubmit"],
      "description": "The action to perform"
    },
    "AssessmentId": {
      "type": "string",
      "description": "Unique identifier for the assessment record"
    },
    "MetricName": {
      "type": "string",
      "description": "Name of the Green Office metric being assessed"
    },
    "MetricValue": {
      "type": "object",
      "description": "The metric value payload"
    },
    "SubmitterEmail": {
      "type": "string",
      "format": "email",
      "description": "Email of the submitting user"
    },
    "SubmitterName": {
      "type": "string",
      "description": "Display name of the submitting user"
    },
    "ApproverEmail": {
      "type": "string",
      "format": "email",
      "description": "Email of the designated approver"
    },
    "Comments": {
      "type": "string",
      "description": "Optional comments from the submitter"
    }
  },
  "required": ["Action", "AssessmentId", "MetricName", "SubmitterEmail", "ApproverEmail"]
}
```

### FR-2: Approval Routing

**Requirement**: On receiving a `SubmitForApproval` action, route to Microsoft Approvals.

**Implementation**:
- Action: `Start and Wait for an Approval`
- Approval type: `Approve/Reject — First to respond`
- Title: `Green Office Assessment — {MetricName}`
- Details: Markdown table with assessment fields
- Assigned to: `ApproverEmail` from trigger input
- Timeout: 7 days (configurable)
- Response: Approve / Reject

### FR-3: Conditional Branching

**Requirement**: Branch flow execution based on approval outcome.

**States**:
| Outcome | Next Action(s) |
|---|---|
| `Approve` | SharePoint Create Item → Notify Submitter (Approved) → Log Decision |
| `Reject` | Notify Submitter (Rejected) → Log Decision |
| `Timeout` | Notify Submitter (Timed Out) → Log Decision |

### FR-4: SharePoint Persistence (Approve Path)

**Requirement**: On approval, write the assessment record to the GO Approval Workflow list.

**Target**: `https://maejo365.sharepoint.com/sites/msteams_54adc4/Lists/GO Approval Workflow`

**Mapped Fields**:
| SharePoint Column | Source |
|---|---|
| Title | `AssessmentId` |
| MetricName | `MetricName` |
| MetricValue | JSON string of `MetricValue` |
| SubmitterEmail | `SubmitterEmail` |
| SubmitterName | `SubmitterName` |
| ApproverEmail | `ApproverEmail` |
| ApproverName | `@approvalResponse.responder.displayName` |
| ApprovalStatus | `"Approved"` |
| ApprovalDate | `utcNow()` |
| ApproverComments | `@approvalResponse.comments` |
| FlowRunId | `@workflow().run.name` |

### FR-5: Email Notifications

**Requirement**: Send contextual emails on all outcomes.

#### FR-5.1: Approval Notification to Submitter

| Field | Value |
|---|---|
| To | `SubmitterEmail` |
| Subject | `✅ Approved: Green Office Assessment — {MetricName}` |
| Body | Assessment approved by {ApproverName} on {ApprovalDate}. Comments: {ApproverComments}. |

#### FR-5.2: Rejection Notification to Submitter

| Field | Value |
|---|---|
| To | `SubmitterEmail` |
| Subject | `❌ Rejected: Green Office Assessment — {MetricName}` |
| Body | Assessment rejected by {ApproverName}. Comments: {ApproverComments}. Please revise and resubmit. |

#### FR-5.3: Timeout Notification

| Field | Value |
|---|---|
| To | `SubmitterEmail` |
| Subject | `⏰ Timed Out: Green Office Assessment — {MetricName}` |
| Body | The approval request for {AssessmentId} has exceeded the 7-day timeout. |

---

## 6. Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-1 | **Performance** | Flow must complete trigger-to-first-action within 5 seconds |
| NFR-2 | **Reliability** | SharePoint create must retry up to 3 times on transient failure |
| NFR-3 | **Timeout** | Approval requests must time out after 7 days |
| NFR-4 | **Auditability** | All state transitions must be logged with timestamp and actor identity |
| NFR-5 | **Idempotency** | Duplicate submissions with the same `AssessmentId` must be detected |
| NFR-6 | **Security** | Only authenticated Maejo365 users may trigger the flow |
| NFR-7 | **Data Minimization** | Only required fields persisted to SharePoint |
| NFR-8 | **Versioning** | Flow definition must carry explicit `contentVersion: "1.0.0.0"` |

---

## 7. Trigger Interface

### Power App V2 Contract

The calling Power Apps app must send a JSON payload matching the schema defined in **FR-1**.

**Example Payload**:

```json
{
  "Action": "SubmitForApproval",
  "AssessmentId": "ASSESS-2026-001",
  "MetricName": "Energy_Consumption_kWh",
  "MetricValue": {
    "period": "2026-Q2",
    "value": 12500.5,
    "unit": "kWh",
    "baseline": 15000.0
  },
  "SubmitterEmail": "user@mju.ac.th",
  "SubmitterName": "Researcher Name",
  "ApproverEmail": "approver@mju.ac.th",
  "Comments": "Q2 energy consumption data ready for review."
}
```

### Response Contract

The flow returns the final Compose output (last action). The caller SHOULD handle:
- `200 OK` — Flow triggered successfully
- `202 Accepted` — Flow processing (approval in progress — async)
- Flow run URL for status polling

---

## 8. Input Schema

> See **FR-1** for the full schema definition.

### Validation Strategy

1. `Action` is checked first — if not `SubmitForApproval`, skip approval and log as draft
2. Required fields validated by trigger schema enforcement (Power Automate rejects at trigger level)
3. Email format validated via `format: "email"` constraint
4. `AssessmentId` uniqueness check via SharePoint Get Items (configurable)

---

## 9. Output Schema

The flow's terminal output will be the result of the last `Compose` action in each branch:

**Approved Path Output**:
```json
{
  "status": "Approved",
  "assessmentId": "ASSESS-2026-001",
  "approvalDate": "2026-07-27T10:00:00Z",
  "approverName": "Approver Display Name",
  "sharePointItemId": 42,
  "flowRunId": "08585500000000000"
}
```

**Rejected Path Output**:
```json
{
  "status": "Rejected",
  "assessmentId": "ASSESS-2026-001",
  "rejectionDate": "2026-07-27T10:00:00Z",
  "approverComments": "Incorrect data — please resubmit.",
  "flowRunId": "08585500000000001"
}
```

---

## 10. SharePoint Mapping

### Target List: GO Approval Workflow

| Column | Type | Required | Source Expression |
|---|---|---|---|
| `Title` | Single line of text | ✅ | `@{triggerBody()?['AssessmentId']}` |
| `MetricName` | Single line of text | ✅ | `@{triggerBody()?['MetricName']}` |
| `MetricValue` | Multiple lines of text | ✅ | `@{string(triggerBody()?['MetricValue'])}` |
| `SubmitterEmail` | Single line of text | ✅ | `@{triggerBody()?['SubmitterEmail']}` |
| `SubmitterName` | Single line of text | ✅ | `@{triggerBody()?['SubmitterName']}` |
| `ApproverEmail` | Single line of text | ✅ | `@{triggerBody()?['ApproverEmail']}` |
| `ApproverName` | Single line of text | ✅ | `@{outputs('Start_and_wait_for_an_approval')?['body/responder/displayName']}` |
| `ApprovalStatus` | Choice | ✅ | `"Approved"` (hardcoded in approve branch) |
| `ApprovalDate` | Date and Time | ✅ | `@utcNow()` |
| `ApproverComments` | Multiple lines of text | ❌ | `@{outputs('Start_and_wait_for_an_approval')?['body/comments']}` |
| `FlowRunId` | Single line of text | ✅ | `@{workflow()?['run']?['name']}` |

**Note**: SharePoint columns may need to be created or verified to match the above schema. The current list is empty.

---

## 11. Approval State Machine

```
                    ┌──────────┐
                    │  IDLE    │
                    └────┬─────┘
                         │ Trigger received
                         ▼
                    ┌──────────┐
                    │SUBMITTED │
                    └────┬─────┘
                         │ Approval sent
                         ▼
              ┌─────────────────────┐
              │  PENDING_APPROVAL   │──── (7 days) ────▶ TIMED_OUT
              └────────┬────────────┘
                       │
              ┌────────┴────────┐
              ▼                 ▼
        ┌──────────┐     ┌──────────┐
        │ APPROVED │     │ REJECTED │
        └──────────┘     └──────────┘
              │                 │
              ▼                 ▼
        ┌──────────┐     ┌──────────┐
        │RECORDED  │     │NOTIFIED  │
        └──────────┘     └──────────┘
```

**States**:
| State | Description | Transition Trigger |
|---|---|---|
| `IDLE` | Flow not running | External trigger |
| `SUBMITTED` | Payload validated, flow running | Internal — immediate |
| `PENDING_APPROVAL` | Approval request sent to approver | Approval outcome or timeout |
| `APPROVED` | Approver accepted | Internal — immediate |
| `REJECTED` | Approver declined | Internal — immediate |
| `TIMED_OUT` | 7-day timeout elapsed | Internal — automatic |
| `RECORDED` | SharePoint item created | Terminal state |
| `NOTIFIED` | Email sent to submitter | Terminal state |

---

## 12. Status Lifecycle

### Assessment Status Values

| Status | Set By | Condition |
|---|---|---|
| `Submitted` | Flow (initial) | Trigger received with Action=SubmitForApproval |
| `PendingApproval` | Flow | Approval request sent |
| `Approved` | Flow (Approve branch) | Approval outcome = Approve |
| `Rejected` | Flow (Reject branch) | Approval outcome = Reject |
| `TimedOut` | Flow (Timeout branch) | Approval exceeds 7 days |
| `Recorded` | SharePoint | Item successfully created in list |
| `Error` | Flow (Error handler) | Any action failure |

### SharePoint Status Column

The `ApprovalStatus` column in the GO Approval Workflow list SHALL store one of:
- `Approved`
- `Rejected`
- `TimedOut`

---

## 13. Notification Matrix

| Event | Recipient | Channel | Template | Priority |
|---|---|---|---|---|
| Assessment Submitted | Approver | MS Approvals | Built-in approval card | 🔴 Critical |
| Assessment Approved | Submitter | Email (O365) | FR-5.1 | 🔴 Critical |
| Assessment Rejected | Submitter | Email (O365) | FR-5.2 | 🔴 Critical |
| Assessment Timed Out | Submitter | Email (O365) | FR-5.3 | 🟡 High |
| Flow Error | Flow Owner | Email (O365) | Error details | 🟡 High |
| Duplicate Submission | Submitter | Email (O365) | Duplicate warning | 🟢 Medium |

**Note**: Teams notifications are deferred to future phase (see FR Appendix).

---

## 14. Error Handling

### Error Strategy

```
┌──────────────────────────┐
│  Try Scope               │
│  ┌────────────────────┐  │
│  │ Primary Actions    │  │
│  │ (Approval +        │  │
│  │  SharePoint +      │  │
│  │  Notifications)    │  │
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │ Catch (All Errors) │  │
│  │ - Log error detail  │  │
│  │ - Notify submitter  │  │
│  │ - Set Error status  │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

### Run-After Configuration

| Action | Configured Paths | Behavior |
|---|---|---|
| Start and Wait for Approval | Success, Timed Out, Failed | Branch on each |
| SharePoint Create Item | Success, Failed (retry), Skipped | 3 retries, then error |
| Send Email (Approve) | Success, Failed | Log failure, do not block |
| Send Email (Reject) | Success, Failed | Log failure, do not block |

### Error Categories

| Category | Handling |
|---|---|
| **Input validation** | Reject at trigger schema enforcement — return 400 to Power Apps |
| **Approval timeout** | Branch to timeout path; notify submitter; log |
| **SharePoint connectivity** | Retry ×3 with 10s delay; escalate to flow owner on final failure |
| **Email delivery failure** | Log and continue (non-blocking) |
| **Duplicate AssessmentId** | Detect via SharePoint lookup; notify submitter; terminate gracefully |

---

## 15. Retry Strategy

| Action | Retry Count | Delay | Backoff | On Final Failure |
|---|---|---|---|---|
| SharePoint Create Item | 3 | 10s | Linear | Email flow owner, log error |
| SharePoint Get Items (dup check) | 2 | 5s | Linear | Proceed without duplicate check |
| Send Email | 0 | — | — | Log and continue (non-blocking) |
| Start and Wait for Approval | 0 | — | — | Flow-level timeout (7d) |

### Retry Configuration (SharePoint)

```json
{
  "retryPolicy": {
    "type": "fixed",
    "count": 3,
    "interval": "PT10S"
  }
}
```

---

## 16. Logging

### Audit Trail Strategy

**Method**: Compose actions at key decision points, writing structured JSON to flow run history.

**Log Points**:

| Log Point | Location | Data Captured |
|---|---|---|
| `FlowTriggered` | After trigger | AssessmentId, Action, SubmitterEmail, Timestamp |
| `ApprovalSent` | After approval action | AssessmentId, ApproverEmail, ApprovalRequestId |
| `ApprovalOutcome` | After condition | AssessmentId, Outcome (Approve/Reject), Responder, Comments, Timestamp |
| `SharePointCreated` | After SharePoint | AssessmentId, ListItemId, Timestamp |
| `NotificationSent` | After email | AssessmentId, Recipient, Template, Timestamp |
| `ErrorOccurred` | In catch block | AssessmentId, ErrorCode, ErrorMessage, FailedAction |

### Log Format

```json
{
  "event": "ApprovalOutcome",
  "assessmentId": "ASSESS-2026-001",
  "timestamp": "2026-07-27T10:00:00Z",
  "flowRunId": "08585500000000000",
  "data": {
    "outcome": "Approved",
    "responder": "approver@mju.ac.th",
    "comments": "Looks good"
  }
}
```

---

## 17. Audit Trail

### Data Retention

- All flow run history retained per Power Automate default (28 days)
- SharePoint list serves as permanent audit record
- Key metadata persisted in SharePoint columns

### Audit Query Path

To reconstruct the full audit trail for an assessment:
1. Query SharePoint list by `AssessmentId`
2. Check `FlowRunId` column
3. Look up flow run history via Power Automate portal

### Compliance

- All actions traceable to authenticated Maejo365 user
- Creator ID preserved: `6693e9ff-447f-4998-ba67-72a8791aadf1`
- Flow modification history preserved in definition metadata
- No PII beyond email addresses and names stored

---

## 18. Security Model

### Authentication

| Aspect | Configuration |
|---|---|
| Trigger Authentication | Power Apps passes user context (PowerAppV2) |
| Flow Plan | Per-user (runs in triggerer's context) |
| Connections | OAuth — user must consent on first run |

### Authorization

| Role | Permissions |
|---|---|
| **Submitter** (any Maejo365 user) | Can trigger flow, receives own notifications |
| **Approver** (designated per submission) | Can approve/reject assigned requests |
| **Flow Owner** (Research Office) | Can edit flow definition, view all runs, manage connections |
| **SharePoint Users** | Inherited from GO Approval Workflow list permissions |

### Connection Security

| Connector | Reference Key | Authentication |
|---|---|---|
| SharePoint | `shared_sharepointonline` | OAuth (delegated) |
| Office 365 Outlook | `shared_office365` | OAuth (delegated) |
| Microsoft Approvals | `shared_approvals` | OAuth (delegated) |

---

## 19. Permissions

### Required Permissions (SharePoint)

| Permission | Purpose |
|---|---|
| **Add Items** | Create assessment records in GO Approval Workflow list |
| **View Items** | Read existing items for duplicate `AssessmentId` check |
| **Edit Items** | Not initially required; may be needed for status updates |

### Required Permissions (Office 365)

| Permission | Purpose |
|---|---|
| **Send Mail** | Send notification emails to submitters |

### Required Permissions (Approvals)

| Permission | Purpose |
|---|---|
| **Create Approvals** | Initiate approval requests |
| **Read Approval Responses** | Capture approver decisions |

---

## 20. Connection References

### Target Connection References

```json
{
  "shared_sharepointonline": {
    "connectionName": "shared_sharepointonline",
    "connectionId": "/providers/Microsoft.PowerApps/apis/shared_sharepointonline",
    "id": "/providers/Microsoft.PowerApps/apis/shared_sharepointonline"
  },
  "shared_office365": {
    "connectionName": "shared_office365",
    "connectionId": "/providers/Microsoft.PowerApps/apis/shared_office365",
    "id": "/providers/Microsoft.PowerApps/apis/shared_office365"
  },
  "shared_approvals": {
    "connectionName": "shared_approvals",
    "connectionId": "/providers/Microsoft.PowerApps/apis/shared_approvals",
    "id": "/providers/Microsoft.PowerApps/apis/shared_approvals"
  }
}
```

### Current vs Target

| File | Current | Target |
|---|---|---|
| `connectionReferences` | `{}` | 3 entries (SharePoint, O365, Approvals) |
| `apisMap.json` | `{}` | 3 entries |
| `connectionsMap.json` | `{}` | 3 entries |

---

## 21. Versioning Strategy

### Content Versioning

| Version | Description | Status |
|---|---|---|
| `undefined` | Recovered placeholder (portal creation) | 📋 Current |
| `1.0.0.0` | First complete approval flow | 📋 Target for GO-M365-4 |
| `1.0.x.0` | Minor fixes and enhancements | 📋 Future patches |
| `1.x.0.0` | New capabilities (Teams, scheduling) | 📋 Future feature releases |
| `x.0.0.0` | Architecture redesign | 📋 Future major version |

### Solution Versioning

| Aspect | Current | Target |
|---|---|---|
| Solution | Default Solution (unmanaged) | Custom solution "Green Office Assessment" |
| Managed | `false` | `true` (for production) |
| Version | N/A | `1.0.0.0` |

### Git Tag Strategy

```
v1.0.0-go-m365-4  → First complete approval flow
```

---

## 22. Deployment Strategy

### Phase: Single-Environment (Current Scope)

```
┌─────────────────────────┐
│  Default Environment    │
│  (Maejo university)      │
│                          │
│  1. Import updated flow  │
│  2. Configure connections│
│  3. Test with sample data│
│  4. Enable               │
└─────────────────────────┘
```

### Deployment Steps

| Step | Action | Tool |
|---|---|---|
| 1 | Export current flow as backup | Power Automate Maker Portal |
| 2 | Update flow definition per this spec | Power Automate Designer |
| 3 | Add SharePoint connection reference | Portal |
| 4 | Add Office 365 connection reference | Portal |
| 5 | Add Approvals connection reference | Portal |
| 6 | Test with sample payload | Manual trigger test |
| 7 | Update `contentVersion` to `1.0.0.0` | Definition edit |
| 8 | Export as managed solution | Solution export |
| 9 | Commit updated ZIP to repo | Git |

### Rollback Plan

1. Import backup ZIP from Step 1
2. Restore `contentVersion: "undefined"`
3. Verify trigger returns to no-schema mode

---

## 23. Future Power Apps Integration

> **Status**: 📋 Future — not part of GO-M365-4 scope

### Integration Contract

The flow defines a strict interface that a future Power Apps app must satisfy:

```powerfx
// Power Fx — SubmitAssessment button OnSelect
Set(
    gblAssessmentPayload,
    {
        Action: "SubmitForApproval",
        AssessmentId: "ASSESS-" & Text(Now(), "yyyy") & "-" & Text(CountRows(Filter(AssessmentRecords, Year = Year(Now()))) + 1, "000"),
        MetricName: ddlMetric.Selected.Value,
        MetricValue: {
            period: txtPeriod.Text,
            value: Value(txtValue.Text),
            unit: ddlUnit.Selected.Value,
            baseline: Value(txtBaseline.Text)
        },
        SubmitterEmail: User().Email,
        SubmitterName: User().FullName,
        ApproverEmail: ddlApprover.Selected.Email,
        Comments: txtComments.Text
    }
);
SubmitAssessmentFlow.Run(gblAssessmentPayload);
```

### App Fields Needed

| Field | Control Type | Source |
|---|---|---|
| Metric Selector | Dropdown | Green Office criteria list |
| Period | Text input | Calendar year/quarter picker |
| Value | Number input | Measurement data |
| Unit | Dropdown | kWh, m³, kg, etc. |
| Baseline | Number input | Pre-configured baseline |
| Approver Selector | People Picker | Maejo365 directory |
| Comments | Multiline text | Free text |

---

## 24. Acceptance Criteria

### AC-1: Trigger Validation

| Criterion | Pass Condition |
|---|---|
| AC-1.1 | Flow rejects payloads missing `Action`, `AssessmentId`, `MetricName`, `SubmitterEmail`, or `ApproverEmail` |
| AC-1.2 | Flow rejects payloads with non-enum `Action` values |
| AC-1.3 | Flow accepts valid payloads with all required fields |

### AC-2: Approval Routing

| Criterion | Pass Condition |
|---|---|
| AC-2.1 | Approval request sent to `ApproverEmail` within 10s of trigger |
| AC-2.2 | Approver receives adaptive card with assessment details |
| AC-2.3 | Approver can Approve or Reject |

### AC-3: Conditional Processing

| Criterion | Pass Condition |
|---|---|
| AC-3.1 | Approve outcome creates SharePoint item with correct field mapping |
| AC-3.2 | Reject outcome sends rejection email without creating SharePoint item |
| AC-3.3 | Timeout outcome sends timeout email after 7 days |

### AC-4: SharePoint Persistence

| Criterion | Pass Condition |
|---|---|
| AC-4.1 | SharePoint item created within 30s of approval |
| AC-4.2 | All mapped fields populated correctly |
| AC-4.3 | `FlowRunId` matches actual flow run |

### AC-5: Notifications

| Criterion | Pass Condition |
|---|---|
| AC-5.1 | Approve email sent to submitter within 30s of approval |
| AC-5.2 | Reject email includes approver comments |
| AC-5.3 | Timeout email sent after 7-day threshold |

### AC-6: Error Handling

| Criterion | Pass Condition |
|---|---|
| AC-6.1 | SharePoint failure retries 3 times |
| AC-6.2 | Email failure does not block flow termination |
| AC-6.3 | All errors logged with AssessmentId and timestamp |

### AC-7: Security

| Criterion | Pass Condition |
|---|---|
| AC-7.1 | Flow runs in authenticated user context |
| AC-7.2 | Connections use OAuth (not hardcoded credentials) |
| AC-7.3 | No PII logged beyond email and name |

### AC-8: Documentation

| Criterion | Pass Condition |
|---|---|
| AC-8.1 | `contentVersion` set to `"1.0.0.0"` |
| AC-8.2 | Flow definition committed to Git as updated ZIP |
| AC-8.3 | Implementation spec (this document) committed |

---

## Appendix A: Action Inventory (Target)

| # | Action Name | Type | Connector | Depends On |
|---|---|---|---|---|
| 1 | `manual` (trigger) | Request/PowerAppV2 | — | — |
| 2 | `Parse_Input` | Parse JSON | — | `manual` |
| 3 | `Log_Triggered` | Compose | — | `Parse_Input` |
| 4 | `Lookup_Duplicate` | Get Items | SharePoint | `Log_Triggered` |
| 5 | `Check_Duplicate` | Condition | — | `Lookup_Duplicate` |
| 6 | `Start_Approval` | Start and Wait for Approval | Approvals | `Check_Duplicate` (no dup) |
| 7 | `Check_Outcome` | Condition | — | `Start_Approval` |
| 8 | `Create_SP_Item` | Create Item | SharePoint | `Check_Outcome` (Approve) |
| 9 | `Log_Approved` | Compose | — | `Create_SP_Item` |
| 10 | `Send_Approved_Email` | Send Email (V2) | O365 Outlook | `Log_Approved` |
| 11 | `Send_Rejected_Email` | Send Email (V2) | O365 Outlook | `Check_Outcome` (Reject) |
| 12 | `Log_Rejected` | Compose | — | `Send_Rejected_Email` |
| 13 | `Send_Timeout_Email` | Send Email (V2) | O365 Outlook | `Check_Outcome` (Timeout) |
| 14 | `Catch_Error` | Compose | — | `Try` scope (Failed) |
| 15 | `Send_Error_Email` | Send Email (V2) | O365 Outlook | `Catch_Error` |

---

## Appendix B: Flow Definition Skeleton (Target)

```
manual (PowerAppV2 trigger)
  │
  ├─ Try (Scope)
  │   ├─ Parse_Input (Parse JSON — validates schema)
  │   ├─ Log_Triggered (Compose — audit log)
  │   ├─ Lookup_Duplicate (SharePoint Get Items)
  │   ├─ Check_Duplicate (Condition)
  │   │   ├─ [Duplicate] → Send_Duplicate_Warning (Email) → Terminate
  │   │   └─ [Not Duplicate] →
  │   │       ├─ Start_Approval (Start and Wait for Approval)
  │   │       ├─ Check_Outcome (Condition)
  │   │       │   ├─ [Approve] →
  │   │       │   │   ├─ Create_SP_Item (SharePoint Create)
  │   │       │   │   ├─ Log_Approved (Compose)
  │   │       │   │   └─ Send_Approved_Email (Email)
  │   │       │   ├─ [Reject] →
  │   │       │   │   ├─ Send_Rejected_Email (Email)
  │   │       │   │   └─ Log_Rejected (Compose)
  │   │       │   └─ [Timeout] →
  │   │       │       └─ Send_Timeout_Email (Email)
  │   │       └─ Compose_Output (Compose — final output)
  │   └─ [End Try]
  └─ Catch_Error (Catch All)
      └─ Send_Error_Email (Email — notify flow owner)
```

---

## Appendix C: Connection Reference Keys

| Reference Key | API URI |
|---|---|
| `shared_sharepointonline` | `/providers/Microsoft.PowerApps/apis/shared_sharepointonline` |
| `shared_office365` | `/providers/Microsoft.PowerApps/apis/shared_office365` |
| `shared_approvals` | `/providers/Microsoft.PowerApps/apis/shared_approvals` |

---

*End of Implementation Specification*  
*Document Version: 1.0*  
*Date: 2026-07-27*
