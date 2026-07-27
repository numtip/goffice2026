# GO-M365-6 — SharePoint Field Inventory

> **Date**: 2026-07-27  
> **Site**: `https://maejo365.sharepoint.com/sites/msteams_54adc4`  
> **List**: `GO Approval Workflow`  
> **List GUID**: `1a3e6d4d-4858-448c-b205-09e3a101d314`  
> **Status**: ✅ Complete

---

## Complete Field Inventory

### Target Columns (FR-4 Schema) — 11 columns

| # | Display Name | Internal Name | Type | Required | Default | Source Design | REST API GUID |
|---|---|---|---|---|---|---|---|
| 1 | Title | Title | Single line of text | ✅ | — | Default | Pre-existing |
| 2 | MetricName | MetricName | Single line of text | ✅ | — | FR-4 | — |
| 3 | MetricValue | MetricValue | Multiple lines of text | ✅ | — | FR-4 | — |
| 4 | SubmitterEmail | SubmitterEmail | Single line of text | ✅ | — | FR-4 | — |
| 5 | SubmitterName | SubmitterName | Single line of text | ✅ | — | FR-4 | — |
| 6 | ApproverEmail | ApproverEmail | Single line of text | ✅ | — | FR-4 | — |
| 7 | ApproverName | ApproverName | Single line of text | ✅ | — | FR-4 | — |
| 8 | ApprovalStatus | ApprovalStatus | Choice | ✅ | Approved | FR-4 | `bc3c50a9-3b84-40dd-9035-4417322b9989` |
| 9 | ApprovalDate | ApprovalDate | Date and Time | ✅ | — | FR-4 | `7714d884-048d-4fb0-97cb-c51da5bcbf3d` |
| 10 | ApproverComments | ApproverComments | Multiple lines of text | ❌ | — | FR-4 | `734c45e3-3825-442f-9e42-54eba465eb12` |
| 11 | FlowRunId | FlowRunId | Single line of text | ✅ | — | FR-4 | `4ec2cd0c-754b-417b-a1b7-0fe7cd7fc6ec` |

### Pre-existing Columns (ADR-0008 — Unchanged)

| # | Display Name | Internal Name | Type | Required | Notes |
|---|---|---|---|---|---|
| 1 | Actor Role | Actor_Role | Choice | ❌ | Preserved as-is |
| 2 | Actor UPN | Actor_UPN | Single line of text | ❌ | Preserved as-is |
| 3 | Comment | Comment | Multiple lines of text | ❌ | Preserved as-is |
| 4 | Entry Ref | Entry_Ref | Single line of text | ❌ | Preserved as-is |
| 5 | From Status | From_Status | Choice | ❌ | Preserved as-is |
| 6 | GORecord ID | GORecord_ID | Single line of text | ❌ | Preserved as-is |
| 7 | Metric Code | Metric_Code | Choice | ❌ | Preserved as-is |
| 8 | Notes | Notes | Multiple lines of text | ❌ | Preserved as-is |
| 9 | Timestamp | Timestamp | Date and Time | ❌ | Preserved as-is |
| 10 | To Status | To_Status | Choice | ❌ | Preserved as-is |

### System Columns (Always Present)

| Column | Type |
|---|---|
| Created | Date and Time |
| Modified | Date and Time |
| Created By | Person or Group |
| Modified By | Person or Group |

---

## ApprovalStatus Choice Options

| Value | Default |
|---|---|
| **Approved** | ✅ Yes |
| Rejected | No |
| TimedOut | No |

---

## Index Configuration

| Column | Indexed |
|---|---|
| Title | ❌ Not indexed |

**Recommendation**: Index Title for faster duplicate detection during EPIC-03 Lookup_Duplicate action.

---

## Content Types

| Content Type | Visible on New Button | Default |
|---|---|---|
| Item | ✅ Yes | ✅ Yes |

**Note**: List allows multiple content types. Default content type is Item.

---

## Views

| View | Type | Default | Mobile |
|---|---|---|---|
| All Items | Standard | ✅ Yes | ✅ Yes |
| Active Current | Standard | ❌ | ❌ |

---

*End of SharePoint Field Inventory*  
*Document Version: 1.0*  
*Date: 2026-07-27*
