# GO-M365-6 — EPIC-03C Manual Completion Gate Report

> **Date**: 2026-07-27  
> **Flow**: GO Metric Approval Workflow  
> **Flow ID**: `40e04977-38cf-42ad-a1e5-bbefbf5cbac1`  
> **Status**: ⚠️ EPIC-03 PARTIAL

---

## What Was Accomplished

### Step 1 — Condition ✅

| Field | Value |
|---|---|
| Left | Outcome from Start and wait for an approval |
| Operator | is equal to |
| Right | Approve |
| Extra row | Empty row (harmless — always evaluates to TRUE with AND) |

### Step 2 — Update item (Approve branch) ✅ (Added, needs manual fix)

Added in **IF YES (True)** branch.

| Field | Status |
|---|---|
| Site Address | ✅ `https://maejo365.sharepoint.com/sites/msteams_54adc4` |
| List Name | ✅ `GO Approval Workflow` |
| Id | ✅ `@{triggerBody()?['number']}` |
| Title | Needs manual entry — expression |
| MetricName | Needs manual entry |
| MetricValue | ❌ Rich text editor — expression insertion failed |
| SubmitterEmail | Needs manual entry |
| SubmitterName | Needs manual entry |
| ApproverEmail | Needs manual entry |
| ApproverName | Needs manual entry |
| Entry Ref | Needs manual entry |
| ApprovalDate | Needs manual entry |
| FlowRunId | Needs manual entry |
| ApprovalStatus | Needs to be set to "Approved" |
| ApproverComments | Needs manual entry |
| Other ADR fields | Need manual preservation |

### Step 3 — Update item (Reject branch) ✅ (Added, needs manual fix)

Added in **IF NO (False)** branch. All fields same as Approve except **ApprovalStatus = "Rejected"**.

### Steps 4-6 — Structured result, Error handling, Flow checker

❌ **Not completed** — blocked by pending Update item configuration.

### Step 7 — Tests

❌ **Not run** — blocked by 12 Flow checker errors from unfilled required fields.

---

## Remaining Manual Steps

The following fields need to be manually configured in **both** Update item actions:

| Action | Required Configuration |
|---|---|
| **Both Update items** | Click each field, type "/" or use the ⚡ dynamic content button, select the corresponding value from **Get items** output |
| **MetricValue (both)** | Click "Toggle code view" in the rich text toolbar, then type: `@{first(outputs('Get_items')?['body/value'])?['MetricValue']}` |
| **ApprovalStatus** | For Approve branch: set to "Approved". For Reject branch: set to "Rejected" |
| **ApprovalDate** | Type: `@{utcNow()}` |
| **FlowRunId** | Type: `@{workflow()?['run']?['name']}` |
| **ApproverComments** | Type: `@{outputs('Start_and_wait_for_an_approval')?['body/responses']?[0]?['comments']}` |

After all fields are configured:
1. **Save** the flow
2. Run **Flow checker** — verify 0 errors
3. **Test** with test accounts (5 test cases)
4. Clean up test items

---

## Final Decision

**⚠️ EPIC-03 PARTIAL**

Both Update item actions are structurally present in their respective Condition branches. The Condition is correctly configured. However, the 12 required SharePoint fields could not be set programmatically due to Power Automate designer limitations with rich text editors and contenteditable fields. Manual completion is needed.

### Readiness for EPIC-04

| Prerequisite | Status |
|---|---|
| Flow skeleton exists | ✅ Yes |
| Approval request can be created | ✅ Yes |
| Condition branching exists | ✅ Yes (Outcome = Approve) |
| SharePoint write-back (Update item) | ⚠️ Added but not configured |
| Error handling | ❌ Not added |
| Flow checker | ❌ 12 errors (unfilled required fields) |
| Test evidence | ❌ None |
| **Ready for EPIC-04?** | **❌ No** |
