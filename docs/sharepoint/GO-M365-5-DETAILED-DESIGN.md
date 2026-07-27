# GO-M365-5 — Detailed Technical Design

> **Date**: 2026-07-27  
> **Authoritative Baseline**: `docs/sharepoint/GO-M365-3-flow-contract.zip`  
> **Reference Docs**: GO-M365-3-flow-contract.md, GO-M365-3-BASELINE-FREEZE.md, GO-M365-4-IMPLEMENTATION-SPEC.md, GO-M365-4-ARCHITECTURE-REVIEW.md  
> **Status**: Design — not yet implemented

---

## 1. Overall Architecture

### System Context

```
┌────────────────────────────────────────────────────────────────────┐
│                         Maejo365 Tenant                            │
│                         (8ec74a39-ddf6-41e1-b0a2-ff0459ea8eb8)    │
│                                                                   │
│  ┌──────────────────────┐    ┌──────────────────────────────────┐│
│  │   Power Apps (Future)│    │   Power Automate (Default Env)   ││
│  │                      │    │                                  ││
│  │  AssessmentForm      │───▶│  GO Metric Approval Workflow     ││
│  │  (Canvas App)        │    │  40e04977-38cf-42ad-a1e5-       ││
│  │                      │    │  bbefbf5cbac1                   ││
│  └──────────────────────┘    │                                  ││
│                              │  ┌────────────────────────────┐  ││
│                              │  │ Try Scope                  │  ││
│                              │  │ ┌────────────────────────┐ │  ││
│                              │  │ │ 1. ParseInput          │ │  ││
│                              │  │ │ 2. LogTriggered        │ │  ││
│                              │  │ │ 3. CheckDuplicate      │ │  ││
│                              │  │ │ 4. StartApproval       │ │  ││
│                              │  │ │ 5. CheckOutcome        │ │  ││
│                              │  │ │ 6a. CreateSPItem       │ │  ││
│                              │  │ │ 6b. NotifyApproved     │ │  ││
│                              │  │ │ 6c. NotifyRejected     │ │  ││
│                              │  │ │ 6d. NotifyTimeout      │ │  ││
│                              │  │ │ 7. LogOutcome          │ │  ││
│                              │  │ └────────────────────────┘ │  ││
│                              │  │ Catch: HandleError         │  ││
│                              │  └────────────────────────────┘  ││
│                              └──────────────────────────────────┘│
│                                      │          │          │     │
│                                      ▼          ▼          ▼     │
│  ┌────────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   SharePoint       │  │  Office 365     │  │  Microsoft  │  │
│  │   msteams_54adc4   │  │  Outlook        │  │  Approvals  │  │
│  │                    │  │                 │  │             │  │
│  │  GO Approval       │  │  Notification   │  │  Approval   │  │
│  │  Workflow (List)   │  │  Emails         │  │  Routing    │  │
│  └────────────────────┘  └─────────────────┘  └─────────────┘  │
│                                                                   │
└────────────────────────────────────────────────────────────────────┘
```

### Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER (Future)                    │
│  Power Apps Canvas App → Assessment Form → Submit Button          │
└────────────────────────────┬────────────────────────────────────┘
                             │ JSON Payload (PowerAppV2 trigger)
┌────────────────────────────▼────────────────────────────────────┐
│                    ORCHESTRATION LAYER                            │
│  Power Automate Flow                                              │
│  ├── Validation (Parse JSON schema)                               │
│  ├── Routing (Duplicate check → Approval → Outcome branching)     │
│  ├── Persistence (SharePoint Create Item)                         │
│  └── Notification (Email templates)                               │
└────────┬──────────────────┬──────────────────┬──────────────────┘
         │                  │                  │
         ▼                  ▼                  ▼
┌────────────────┐ ┌──────────────┐ ┌──────────────────┐
│ DATA LAYER     │ │ MESSAGING    │ │ WORKFLOW LAYER   │
│ SharePoint     │ │ O365 Outlook │ │ MS Approvals     │
│ Online         │ │              │ │                  │
│ ─────────────  │ │ ──────────── │ │ ──────────────── │
│ Lists:         │ │ Templates:   │ │ Actions:         │
│ • GO Approval  │ │ • Approved   │ │ • Create         │
│   Workflow     │ │ • Rejected   │ │ • Wait           │
│                │ │ • Timeout    │ │ • Respond        │
└────────────────┘ └──────────────┘ └──────────────────┘
```

---

## 2. Component Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│  GO Metric Approval Workflow                                      │
│  (Microsoft.Flow/flows)                                           │
│  ID: 40e04977-38cf-42ad-a1e5-bbefbf5cbac1                        │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Trigger: manual (PowerAppV2)                               │ │
│  │  Schema: Defined (FR-1)                                     │ │
│  │  Output: triggerBody() → {Action, AssessmentId, ...}       │ │
│  └────────────────────────────┬────────────────────────────────┘ │
│                               │                                   │
│  ┌────────────────────────────▼────────────────────────────────┐ │
│  │  Try Scope                                                   │ │
│  │                                                               │ │
│  │  ┌──────────────────────────────────────────────────────┐    │ │
│  │  │  Action: Parse_Input                                 │    │ │
│  │  │  Type: Parse JSON                                    │    │ │
│  │  │  Schema: per FR-1                                    │    │ │
│  │  └────────────────────────┬─────────────────────────────┘    │ │
│  │                           │                                   │ │
│  │  ┌────────────────────────▼─────────────────────────────┐    │ │
│  │  │  Action: Log_Triggered                               │    │ │
│  │  │  Type: Compose                                       │    │ │
│  │  │  Input: {event:"FlowTriggered", assessmentId, ...}   │    │ │
│  │  └────────────────────────┬─────────────────────────────┘    │ │
│  │                           │                                   │ │
│  │  ┌────────────────────────▼─────────────────────────────┐    │ │
│  │  │  Action: Lookup_Duplicate                            │    │ │
│  │  │  Type: SharePoint — Get Items                        │    │ │
│  │  │  Filter: Title eq AssessmentId                       │    │ │
│  │  └────────────────────────┬─────────────────────────────┘    │ │
│  │                           │                                   │ │
│  │  ┌────────────────────────▼─────────────────────────────┐    │ │
│  │  │  Condition: Check_Duplicate                          │    │ │
│  │  │  Condition: length(outputs('Lookup_Duplicate')) > 0  │    │ │
│  │  │  ├── [TRUE] → Send_Duplicate_Warning → Terminate     │    │ │
│  │  │  └── [FALSE] ↓                                       │    │ │
│  │  └────────────────────────┬─────────────────────────────┘    │ │
│  │                           │ (FALSE path)                     │ │
│  │  ┌────────────────────────▼─────────────────────────────┐    │ │
│  │  │  Action: Start_Approval                              │    │ │
│  │  │  Type: Start and Wait for an Approval               │    │ │
│  │  │  Timeout: P7D (7 days)                               │    │ │
│  │  │  Assigned To: @triggerBody()?['ApproverEmail']      │    │ │
│  │  └──────┬──────────────┬──────────────┬─────────────────┘    │ │
│  │         │              │              │                      │ │
│  │  ┌──────▼────┐  ┌──────▼────┐  ┌─────▼──────┐              │ │
│  │  │ Condition │  │ Condition │  │ Condition  │              │ │
│  │  │ Check_    │  │ Check_    │  │ Check_     │              │ │
│  │  │ Outcome   │  │ Outcome   │  │ Outcome    │              │ │
│  │  │ =Approve  │  │ =Reject   │  │ =Timeout   │              │ │
│  │  └──────┬────┘  └──────┬────┘  └─────┬──────┘              │ │
│  │         │              │              │                      │ │
│  │  ┌──────▼────┐  ┌──────▼────┐  ┌─────▼──────┐              │ │
│  │  │ Create_   │  │ Notify_   │  │ Notify_    │              │ │
│  │  │ SP_Item   │  │ Rejected  │  │ Timeout    │              │ │
│  │  │ (Create   │  │ (Email)   │  │ (Email)    │              │ │
│  │  │ Item)     │  └──────┬────┘  └─────┬──────┘              │ │
│  │  └──────┬────┘         │              │                      │ │
│  │         │              │              │                      │ │
│  │  ┌──────▼────┐  ┌──────▼────┐  ┌─────▼──────┐              │ │
│  │  │ Log_      │  │ Log_      │  │ Log_       │              │ │
│  │  │ Approved  │  │ Rejected  │  │ Timeout    │              │ │
│  │  │ (Compose) │  │ (Compose) │  │ (Compose)  │              │ │
│  │  └──────┬────┘  └───────────┘  └────────────┘              │ │
│  │         │                                                    │ │
│  │  ┌──────▼────┐                                              │ │
│  │  │ Notify_   │                                              │ │
│  │  │ Approved  │                                              │ │
│  │  │ (Email)   │                                              │ │
│  │  └───────────┘                                              │ │
│  │                                                               │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Catch Scope (Catch All)                                     │ │
│  │  ┌──────────────────────────────────────────────────────┐    │ │
│  │  │  Action: Catch_Error                                 │    │ │
│  │  │  Type: Compose                                       │    │ │
│  │  │  Input: {event:"ErrorOccurred", error: ...}          │    │ │
│  │  └────────────────────────┬─────────────────────────────┘    │ │
│  │                           │                                   │ │
│  │  ┌────────────────────────▼─────────────────────────────┐    │ │
│  │  │  Action: Send_Error_Email                            │    │ │
│  │  │  Type: Send Email (V2)                               │    │ │
│  │  │  To: Flow Owner                                      │    │ │
│  │  └──────────────────────────────────────────────────────┘    │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Flow

### Primary Data Flow (Happy Path — Approval)

```
Power Apps                  Flow                      Approvals          SharePoint       Email
    │                        │                           │                  │               │
    │──SubmitAssessment──────▶│                           │                  │               │
    │                        │──ParseInput──────────────▶│ (validate)       │               │
    │                        │──LogTriggered────────────▶│ (log event)      │               │
    │                        │──LookupDuplicate─────────▶│                  │               │
    │                        │◀──────────────────────────│ (0 results)      │               │
    │                        │──StartApproval───────────▶│                  │               │
    │                        │                           │──Notify─────────▶│               │
    │                        │                           │  Approver        │               │
    │                        │                           │◀──Respond───────│               │
    │                        │◀──ApprovalResponse────────│  (Approve)       │               │
    │                        │──CreateSPItem────────────▶│                  │               │
    │                        │                           │──CreateItem─────▶│               │
    │                        │                           │◀──ItemCreated───│               │
    │                        │──LogApproved─────────────▶│ (log)            │               │
    │                        │──SendApprovedEmail────────▶│                  │               │
    │                        │                           │                  │──Notify───────▶│
    │◀──Response (200)───────│                           │                  │  Submitter     │
```

### Secondary Data Flow (Rejection)

```
Flow                      Approvals              Email
    │                        │                      │
    │──StartApproval────────▶│                      │
    │                        │──Notify──────────────▶│ (Approver)
    │                        │◀──Respond────────────│  (Reject)
    │◀──ApprovalResponse────│  (Reject)             │
    │──SendRejectedEmail────▶│                      │
    │                        │──Notify──────────────▶│ (Submitter)
    │──LogRejected──────────▶│                      │
```

### Error Flow

```
Flow                      Try Scope              Email
    │                        │                      │
    │──Any Action───────────▶│                      │
    │                        │──FAILED─────────────▶│
    │                        │──CatchError─────────▶│
    │                        │──SendErrorEmail──────▶│
    │                        │                      │──Notify──────▶│
    │                        │                      │  Owner       │
    │──Terminate─────────────▶│                      │
```

---

## 4. Sequence Diagram — Full Lifecycle

```
Actor      PowerApps    Flow           SP           Approval       Email
  │           │           │             │              │              │
  │─Open─────▶│           │             │              │              │
  │  Form     │           │             │              │              │
  │─Fill─────▶│           │             │              │              │
  │  Data     │           │             │              │              │
  │─Submit───▶│           │             │              │              │
  │           │─Trigger──▶│             │              │              │
  │           │           │─Validate────▶│              │              │
  │           │           │─Log────────▶│              │              │
  │           │           │─GetItems───▶│              │              │
  │           │           │◀─0 items───│              │              │
  │           │           │─Create─────▶│              │              │
  │           │           │             │─Notify──────▶│              │
  │           │◀─202──────│             │              │              │
  │           │           │             │              │              │
  │           │           │  [ WAIT UP TO 7 DAYS ]     │              │
  │           │           │             │              │              │
  │           │           │             │◀─Respond────│              │
  │           │           │◀─Approve───│              │              │
  │           │           │─CreateItem▶│              │              │
  │           │           │◀─Created───│              │              │
  │           │           │─Log────────▶│              │              │
  │           │           │─SendEmail──▶│              │              │
  │           │           │             │              │─Notify──────▶│
  │           │           │◀─Complete──│              │              │
```

---

## 5. Approval Workflow Diagram

```
                              ┌─────────┐
                              │  IDLE   │
                              └────┬────┘
                                   │ Trigger received
                                   │ (Action = "SubmitForApproval")
                                   ▼
                         ┌─────────────────┐
                         │   VALIDATING    │
                         │                 │
                         │ Schema check    │
                         │ Duplicate check │
                         └────────┬────────┘
                                  │
                     ┌────────────┼────────────┐
                     │            │            │
                     ▼            ▼            ▼
              ┌──────────┐ ┌──────────┐ ┌──────────┐
              │ INVALID  │ │DUPLICATE │ │  VALID   │
              │ (Error)  │ │ (Warn)   │ │          │
              └──────────┘ └────┬─────┘ └────┬─────┘
                                │             │
                                ▼             ▼
                         ┌──────────┐  ┌──────────────┐
                         │TERMINATE │  │  SUBMITTED   │
                         │(Notified)│  │              │
                         └──────────┘  └──────┬───────┘
                                              │
                                              ▼
                                   ┌──────────────────┐
                                   │ PENDING_APPROVAL │
                                   │                  │
                                   │ Timer: 7 days    │
                                   │ Counter: 0/1     │
                                   └──┬──────────┬────┘
                                      │          │
                            ┌─────────┘          └─────────┐
                            │                              │
                            ▼                              ▼
                   ┌──────────────┐              ┌──────────────┐
                   │  APPROVED    │              │  REJECTED    │
                   │              │              │              │
                   │ → SharePoint│              │ → Notify     │
                   │ → Notify    │              │ → Log        │
                   │ → Log       │              └──────────────┘
                   └──────┬───────┘
                          │
                          ▼
                   ┌──────────────┐
                   │  RECORDED    │
                   │  (Terminal)  │
                   └──────────────┘

                   ┌──────────────┐
                   │  TIMED_OUT   │  ← 7-day elapsed
                   │              │
                   │ → Notify     │
                   │ → Log        │
                   └──────────────┘
```

### State Transition Table

| From | To | Trigger | Action |
|---|---|---|---|
| `IDLE` | `VALIDATING` | Power Apps trigger | ParseInput |
| `VALIDATING` | `INVALID` | Schema validation fails | Return 400 |
| `VALIDATING` | `DUPLICATE` | AssessmentId exists | Send_Duplicate_Warning |
| `VALIDATING` | `SUBMITTED` | Schema passes + no dup | Start_Approval |
| `DUPLICATE` | `TERMINATED` | Email sent | End flow |
| `SUBMITTED` | `PENDING_APPROVAL` | Approval sent | Wait for response |
| `PENDING_APPROVAL` | `APPROVED` | Approver responds Approve | Branch approve |
| `PENDING_APPROVAL` | `REJECTED` | Approver responds Reject | Branch reject |
| `PENDING_APPROVAL` | `TIMED_OUT` | 7 days elapsed | Branch timeout |
| `APPROVED` | `RECORDED` | SharePoint item created | Log + Notify |
| `REJECTED` | `TERMINATED` | Email sent to submitter | Log |
| `TIMED_OUT` | `TERMINATED` | Email sent to submitter | Log |
| Any | `ERROR` | Any action fails | Catch + notify owner |

---

## 6. SharePoint Design

### Lists

| List | Site | Purpose | Status |
|---|---|---|---|
| **GO Approval Workflow** | `msteams_54adc4` | Assessment records (approved/rejected) | ✅ Exists (empty) |
| **GreenOfficeEvidence** | `msteams_54adc4` | Evidence documents | ✅ Exists (may be used later) |

### GO Approval Workflow — Column Schema

| Column Name | Type | Required | Default | Notes |
|---|---|---|---|---|
| `Title` | Single line of text | ✅ | — | Stores `AssessmentId` |
| `MetricName` | Single line of text | ✅ | — | e.g., "Energy_Consumption_kWh" |
| `MetricValue` | Multiple lines of text | ✅ | — | JSON serialized payload |
| `SubmitterEmail` | Single line of text | ✅ | — | From trigger input |
| `SubmitterName` | Single line of text | ✅ | — | From trigger input |
| `ApproverEmail` | Single line of text | ✅ | — | From trigger input |
| `ApproverName` | Single line of text | ✅ | — | From approval response |
| `ApprovalStatus` | Choice | ✅ | "Approved" | Options: Approved, Rejected, TimedOut |
| `ApprovalDate` | Date and Time | ✅ | — | `utcNow()` at approval moment |
| `ApproverComments` | Multiple lines of text | ❌ | — | From approval response |
| `FlowRunId` | Single line of text | ✅ | — | `workflow().run.name` |
| `Created` | Date and Time | ✅ | Auto | SharePoint built-in |
| `Modified` | Date and Time | ✅ | Auto | SharePoint built-in |

### Content Types

| Content Type | Parent | Columns Added |
|---|---|---|
| **Assessment Record** | Item | All custom columns above |

### Relationships

| From | To | Type | Key |
|---|---|---|---|
| Flow → SP List | `Create_Sp_Item` → GO Approval Workflow | 1:1 create | `AssessmentId` → `Title` |
| Flow → SP List | `Lookup_Duplicate` → GO Approval Workflow | 1:0..1 lookup | `Title eq AssessmentId` |

### Indexes

| Index | Column(s) | Purpose |
|---|---|---|
| **AssessmentId lookup** | `Title` | Fast duplicate detection |
| **Status filter** | `ApprovalStatus` | Dashboard queries |

---

## 7. Power Automate Design

### Trigger

| Property | Current | Target |
|---|---|---|
| **Name** | `manual` | `manual` (preserved) |
| **Type** | `Request` | `Request` (preserved) |
| **Kind** | `PowerAppV2` | `PowerAppV2` (preserved) |
| **Schema Properties** | `{}` | Defined schema per FR-1 |
| **Required Fields** | `[]` | `["Action","AssessmentId","MetricName","SubmitterEmail","ApproverEmail"]` |

### Actions Inventory (Target)

| # | Name | Type | Connector | Input/Config |
|---|---|---|---|---|
| 1 | `Parse_Input` | Parse JSON | — | FR-1 schema |
| 2 | `Log_Triggered` | Compose | — | `{event:"FlowTriggered", assessmentId, timestamp, submitter}` |
| 3 | `Lookup_Duplicate` | Get Items | SharePoint | Filter: `Title eq '@{body('Parse_Input')?['AssessmentId']}'` |
| 4 | `Check_Duplicate` | Condition | — | `@greater(length(outputs('Lookup_Duplicate')?['body/value']), 0)` |
| 5 | `Send_Dup_Warning` | Send Email (V2) | O365 Outlook | To: SubmitterEmail |
| 6 | `Terminate_Dup` | Terminate | — | Status: Failed |
| 7 | `Start_Approval` | Start and Wait | Approvals | Timeout: P7D, Assigned to: ApproverEmail |
| 8 | `Check_Outcome` | Condition | — | `@equals(outputs('Start_Approval')?['body/outcome'], 'Approve')` |
| 9 | `Create_SP_Item` | Create Item | SharePoint | FR-4 mapping |
| 10 | `Log_Approved` | Compose | — | `{event:"ApprovalOutcome", outcome:"Approved", ...}` |
| 11 | `Send_Approved_Email` | Send Email (V2) | O365 Outlook | FR-5.1 template |
| 12 | `Send_Rejected_Email` | Send Email (V2) | O365 Outlook | FR-5.2 template |
| 13 | `Log_Rejected` | Compose | — | `{event:"ApprovalOutcome", outcome:"Rejected", ...}` |
| 14 | `Send_Timeout_Email` | Send Email (V2) | O365 Outlook | FR-5.3 template |
| 15 | `Log_Timeout` | Compose | — | `{event:"ApprovalOutcome", outcome:"TimedOut", ...}` |

### Conditions

| Condition | Expression | True Branch | False Branch |
|---|---|---|---|
| `Check_Duplicate` | `length(outputs('Lookup_Duplicate')?['body/value']) > 0` | Send_Dup_Warning → Terminate | Continue to Start_Approval |
| `Check_Outcome` | `outputs('Start_Approval')?['body/outcome'] == 'Approve'` | Approve path | Check_Outcome_Reject |

### Branches

```
                     ┌── Check_Duplicate (TRUE) → Send_Dup_Warning → Terminate
Check_Duplicate ─────┤
                     └── Check_Duplicate (FALSE) → Start_Approval
                                                        │
                                     ┌──────────────────┼──────────────────┐
                                     │                  │                  │
                              ┌──────▼─────┐    ┌──────▼─────┐    ┌──────▼─────┐
                              │  Approve   │    │  Reject    │    │  Timeout   │
                              │            │    │            │    │            │
                              │ CreateSP   │    │ NotifyRej  │    │ NotifyTime │
                              │ LogApproved│    │ LogRej     │    │ LogTime    │
                              │ NotifyAppr │    │            │    │            │
                              └────────────┘    └────────────┘    └────────────┘
```

### Error Paths

```
Try (Scope)
  └── [All primary actions]
Catch (All Errors)
  ├── Catch_Error (Compose — log error details)
  │   Input: {
  │     event: "ErrorOccurred",
  │     assessmentId: @{triggerBody()?['AssessmentId']},
  │     errorCode: @{result('Try')?['code']},
  │     errorMessage: @{result('Try')?['message']},
  │     failedAction: @{workflow()?['action']?['name']},
  │     timestamp: @{utcNow()}
  │   }
  └── Send_Error_Email (Email → flow owner)
```

### Retry Paths

| Action | Retry Policy |
|---|---|
| `Create_SP_Item` | Fixed: 3 retries, 10s interval |
| `Lookup_Duplicate` | Fixed: 2 retries, 5s interval |
| `Start_Approval` | None (flow-level timeout P7D) |
| Email actions | None (non-blocking — log and continue) |

---

## 8. Approvals Design

### State Machine

States: `IDLE → VALIDATING → SUBMITTED → PENDING_APPROVAL → {APPROVED | REJECTED | TIMED_OUT} → {RECORDED | TERMINATED}`

See [Section 5 — Approval Workflow Diagram](#5-approval-workflow-diagram) for the full state diagram.

### Transition Table

See [Section 5 — State Transition Table](#state-transition-table) for all 14 transitions.

### SLA

| Metric | Target |
|---|---|
| **Time to approval decision** | < 7 calendar days |
| **Time to SharePoint record** | < 30 seconds after approval |
| **Time to notification** | < 30 seconds after decision |
| **Flow execution timeout** | P7D (7 days) |
| **Flow trigger response** | < 5 seconds (202 Accepted) |

### Escalation

| Trigger | Action |
|---|---|
| Approval pending > 5 days | Send reminder email to approver |
| Approval pending > 7 days | Timeout — notify submitter |
| SharePoint create fails ×3 | Notify flow owner via email |
| Any unrecoverable error | Catch block → email flow owner |

---

## 9. Notifications Design

### Email Templates

#### Template 1: Approval Confirmation (To Submitter — Approve)

```
Subject: ✅ Approved: Green Office Assessment — {MetricName}

Body:
Dear {SubmitterName},

Your Green Office assessment has been APPROVED.

Assessment ID: {AssessmentId}
Metric: {MetricName}
Approved by: {ApproverName}
Approved on: {ApprovalDate}

Approver Comments:
{ApproverComments}

This record has been saved to the GO Approval Workflow system.

---
Green Office Assessment System
Maejo University
```

#### Template 2: Rejection Notification (To Submitter — Reject)

```
Subject: ❌ Rejected: Green Office Assessment — {MetricName}

Body:
Dear {SubmitterName},

Your Green Office assessment has been REJECTED.

Assessment ID: {AssessmentId}
Metric: {MetricName}
Rejected by: {ApproverName}

Approver Comments:
{ApproverComments}

Please review the comments above, revise your submission, and resubmit for approval.

---
Green Office Assessment System
Maejo University
```

#### Template 3: Timeout Notification (To Submitter)

```
Subject: ⏰ Timed Out: Green Office Assessment — {MetricName}

Body:
Dear {SubmitterName},

Your Green Office assessment has TIMED OUT after 7 days without a decision.

Assessment ID: {AssessmentId}
Metric: {MetricName}
Submitted on: {SubmissionDate}

Please resubmit if approval is still required.

---
Green Office Assessment System
Maejo University
```

#### Template 4: Duplicate Warning (To Submitter)

```
Subject: ⚠️ Duplicate Submission: Green Office Assessment — {MetricName}

Body:
Dear {SubmitterName},

Assessment ID {AssessmentId} has already been submitted and processed. This submission has been rejected as a duplicate.

If you believe this is an error, please contact the system administrator.

---
Green Office Assessment System
Maejo University
```

#### Template 5: Error Alert (To Flow Owner)

```
Subject: 🚨 Flow Error: GO Metric Approval Workflow

Body:
An error occurred in the GO Metric Approval Workflow.

Assessment ID: {AssessmentId}
Error Code: {ErrorCode}
Error Message: {ErrorMessage}
Failed Action: {FailedAction}
Timestamp: {Timestamp}

Please investigate in Power Automate run history.

Flow Run: https://make.powerautomate.com/environments/Default-8ec74a39-ddf6-41e1-b0a2-ff0459ea8eb8/flows/40e04977-38cf-42ad-a1e5-bbefbf5cbac1/runs/{FlowRunId}
```

### Notification Matrix

| Event | Recipient | Channel | Template | Trigger |
|---|---|---|---|---|
| Assessment Submitted | Approver | MS Approvals | Built-in | Flow action |
| Assessment Approved | Submitter | Email | T1 | Condition: Approve |
| Assessment Rejected | Submitter | Email | T2 | Condition: Reject |
| Assessment Timed Out | Submitter | Email | T3 | Condition: Timeout |
| Duplicate Submission | Submitter | Email | T4 | Condition: Duplicate |
| Flow Error | Flow Owner | Email | T5 | Catch block |

### Teams Integration

| Status | Plan |
|---|---|
| **Current** | ❌ Not implemented |
| **GO-M365-6** | ❌ Out of scope |
| **Future** | 📋 Adaptive card notifications to Teams channel |

### Dashboard Integration

| Status | Plan |
|---|---|
| **Current** | ❌ No dashboard |
| **GO-M365-6** | ❌ Out of scope |
| **Future** | 📋 Power BI dashboard reading from GO Approval Workflow list |

---

## 10. Security Design

### Roles

| Role | Description | Access Level |
|---|---|---|
| **Submitter** | Any authenticated Maejo365 user | Can submit assessments; receives own notifications |
| **Approver** | Designated per submission | Can approve/reject assigned requests |
| **Flow Owner** | Research Office (สำนักวิจัยฯ) | Can edit flow, manage connections, view all runs |
| **SharePoint Reader** | Auditors, report consumers | Can read approved records in GO Approval Workflow list |

### Permissions Matrix

| Resource | Submitter | Approver | Flow Owner | SP Reader |
|---|---|---|---|---|
| Trigger flow | ✅ | ✅ | ✅ | ❌ |
| View own submissions | ✅ | ✅ | ✅ | ❌ |
| Approve/reject | ❌ | ✅ (assigned only) | ❌ | ❌ |
| Edit flow definition | ❌ | ❌ | ✅ | ❌ |
| Manage connections | ❌ | ❌ | ✅ | ❌ |
| Read SP list (approved) | ✅ (own) | ✅ (assigned) | ✅ (all) | ✅ (all) |
| Create SP item | ❌ | ❌ | ❌ | ❌ |

### Least Privilege

| Principle | Implementation |
|---|---|
| **Minimal trigger access** | Flow set to "The user who runs the flow" (per-user plan) |
| **Scoped SharePoint access** | Flow writes only to GO Approval Workflow list |
| **Approver isolation** | Approver cannot modify flow; only respond to assigned requests |
| **Connection isolation** | Each connector uses OAuth delegated permissions — no shared secrets |

### Authentication

| Component | Method |
|---|---|
| Power Apps → Flow | Embedded authentication via PowerAppV2 trigger |
| Flow → SharePoint | OAuth (delegated — flow owner's connection) |
| Flow → O365 Outlook | OAuth (delegated — flow owner's connection) |
| Flow → Approvals | OAuth (delegated — flow owner's connection) |

### Audit

| Event | Captured | Storage |
|---|---|---|
| Flow triggered | ✅ | Flow run history |
| Schema validation | ✅ | Flow run history |
| Duplicate check | ✅ | Flow run history |
| Approval sent | ✅ | MS Approvals |
| Approval outcome | ✅ | Flow run history + SharePoint |
| SharePoint item created | ✅ | SharePoint audit log |
| Email sent | ✅ | O365 message trace |
| Error occurred | ✅ | Flow run history + owner email |

---

## 11. Logging Design

### Audit Events

| Event ID | Event Name | Logged By | Data |
|---|---|---|---|
| `EVT-001` | Flow Triggered | `Log_Triggered` (Compose) | AssessmentId, SubmitterEmail, Timestamp |
| `EVT-002` | Duplicate Detected | `Check_Duplicate` (Condition) | AssessmentId, ExistingItemId |
| `EVT-003` | Approval Sent | `Start_Approval` (Approvals) | AssessmentId, ApproverEmail, RequestId |
| `EVT-004` | Approval Approved | `Log_Approved` (Compose) | AssessmentId, ApproverName, Comments, Timestamp |
| `EVT-005` | Approval Rejected | `Log_Rejected` (Compose) | AssessmentId, ApproverName, Comments, Timestamp |
| `EVT-006` | Approval Timed Out | `Log_Timeout` (Compose) | AssessmentId, TimeoutDuration, Timestamp |
| `EVT-007` | SharePoint Created | `Create_SP_Item` (SP) | AssessmentId, ListItemId |
| `EVT-008` | Email Sent | Email actions (O365) | AssessmentId, Recipient, Template |
| `EVT-009` | Flow Error | `Catch_Error` (Compose) | AssessmentId, ErrorCode, ErrorMessage, FailedAction |

### Correlation IDs

| ID | Scope | Source |
|---|---|---|
| `AssessmentId` | Cross-system (Power Apps → Flow → SP → Email) | Trigger input |
| `FlowRunId` | Single flow execution | `workflow().run.name` |
| `ApprovalRequestId` | Approval lifecycle | `Start_Approval` output |
| `SharePointItemId` | SharePoint record | `Create_SP_Item` output |

### Error Codes

| Code | Description | Recovery |
|---|---|---|
| `ERR-001` | Schema validation failed | Return to Power Apps for correction |
| `ERR-002` | Duplicate AssessmentId | Notify submitter, terminate |
| `ERR-003` | SharePoint connection failed | Retry ×3, then escalate |
| `ERR-004` | Approval service unavailable | Retry, then escalate |
| `ERR-005` | Email delivery failed | Log and continue (non-blocking) |
| `ERR-006` | Unknown error in Try scope | Catch, log, notify owner |

---

## 12. Deployment Design

### Environment Strategy

| Environment | Purpose | Status |
|---|---|---|
| **Default** | Development + Production (single env) | ✅ Active |
| **Dev** (future) | Isolated development | 📋 Future |
| **Test** (future) | Pre-production validation | 📋 Future |

### Deployment Steps

| Step | Action | Tool | Rollback |
|---|---|---|---|
| 1 | Export current flow as backup | Maker Portal | Import backup |
| 2 | Update trigger schema | Flow Designer | Revert to `{}` |
| 3 | Add connections | Maker Portal | Remove references |
| 4 | Add all actions | Flow Designer | Import backup |
| 5 | Test with sample payload | Manual trigger | — |
| 6 | Update contentVersion | Definition edit | Revert string |
| 7 | Create solution | Maker Portal | Delete solution |
| 8 | Package as managed | Solution export | Import backup |
| 9 | Commit updated ZIP | Git | Revert commit |

### Post-Deployment Validation

| Check | Method |
|---|---|
| Trigger accepts valid schema | Test run with sample payload |
| Trigger rejects invalid schema | Test run with malformed payload |
| Approval routes to correct approver | Submit with test approver |
| SharePoint item created on approval | Check list after approve |
| Email delivered on all outcomes | Check inbox for each template |
| Error caught in catch block | Force failure, check owner email |

---

## 13. Versioning

### Artifact Versioning

| Artifact | Current | GO-M365-6 Target |
|---|---|---|
| Flow `contentVersion` | `"undefined"` | `"1.0.0.0"` |
| Solution version | N/A | `1.0.0.0` |
| Solution name | Default Solution | `Green Office Assessment` |
| Managed | `false` | `true` |
| ZIP filename | `GO-M365-3-flow-contract.zip` | `GO-M365-6-flow-v1.0.0.0.zip` |

### Git Tagging

```
v1.0.0-go-m365-6  → GO-M365-6 implementation complete
```

### Future Version Strategy

| Version | Scope |
|---|---|
| `1.0.0.0` | Core approval workflow (GO-M365-6) |
| `1.0.1.0` | Bug fixes and minor enhancements |
| `1.1.0.0` | Teams notifications, reminder emails |
| `2.0.0.0` | Multi-environment deployment, CI/CD |

---

## Appendix A: Connection References (Target)

| Reference Key | Connector Name | API URI |
|---|---|---|
| `shared_sharepointonline` | SharePoint | `/providers/Microsoft.PowerApps/apis/shared_sharepointonline` |
| `shared_office365` | Office 365 Outlook | `/providers/Microsoft.PowerApps/apis/shared_office365` |
| `shared_approvals` | Microsoft Approvals | `/providers/Microsoft.PowerApps/apis/shared_approvals` |

## Appendix B: Preserved Identifiers

| Identifier | Value | Source |
|---|---|---|
| Flow ID | `40e04977-38cf-42ad-a1e5-bbefbf5cbac1` | definition.json |
| Package Resource ID | `65e382b8-538f-40a9-b102-c4199df03ae3` | manifest.json |
| Tenant ID | `8ec74a39-ddf6-41e1-b0a2-ff0459ea8eb8` | definition.json |
| Creator ID | `6693e9ff-447f-4998-ba67-72a8791aadf1` | definition.json |
| Package Telemetry ID | `156c1031-cd40-4020-ae39-0055054e17b6` | manifest.json |
| Environment ID | `Default-8ec74a39-ddf6-41e1-b0a2-ff0459ea8eb8` | manifest.json |
| SharePoint Site | `msteams_54adc4` | SharePoint |
| SharePoint List | `GO Approval Workflow` | SharePoint |
| SHA-256 | `62D2CB350D04A4CC91427561557795E310D65B5E5771AEA65E2F3ACE2CD1438E` | ZIP |

---

*End of Detailed Design*  
*Document Version: 1.0*  
*Date: 2026-07-27*
