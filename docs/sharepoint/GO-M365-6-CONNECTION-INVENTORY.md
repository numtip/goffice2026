# GO-M365-6 — Connection Inventory

> **Date**: 2026-07-27  
> **Account**: `researchmju@mju.ac.th`  
> **Environment**: `Default-8ec74a39-ddf6-41e1-b0a2-ff0459ea8eb8`  
> **Status**: ✅ Complete — all 3 connections established

---

## Connection Summary

| # | Connector Name | Type | Status | Owner | Created | Usable by Flow? |
|---|---|---|---|---|---|---|
| 1 | **SharePoint** | Standard | ✅ **Connected** | researchmju@mju.ac.th | 2026-07-21 | ✅ Yes — pre-existing |
| 2 | **Office 365 Outlook** | Standard | ✅ **Connected** | researchmju@mju.ac.th | 2026-07-27 | ✅ Yes — created EPIC-01 |
| 3 | **Standard approvals** | Standard | ✅ **Connected** | researchmju@mju.ac.th (connector credential); displayed as "Standard approvals" | 2026-07-27 | ✅ Yes — created EPIC-01 |

---

## Connection 1: SharePoint

| Property | Value |
|---|---|
| **Connector Name (in list)** | SharePoint |
| **Displayed Connection Name** | `researchmju@mju.ac.th` |
| **Connection ID** | Not exposed in UI |
| **API** | `/providers/Microsoft.PowerApps/apis/shared_sharepointonline` |
| **Publisher** | Microsoft |
| **Type** | Standard |
| **Status** | ✅ Connected |
| **Owner** | researchmju@mju.ac.th |
| **Created** | 2026-07-21 |
| **Last Modified** | 6 days ago (at inspection time) |
| **Authentication** | OAuth 2.0 (interactive consent) |
| **Target Site** | `https://maejo365.sharepoint.com/sites/msteams_54adc4` |
| **Usable by Target Flow** | ✅ Yes — connection exists in same environment as GO Metric Approval Workflow |

---

## Connection 2: Office 365 Outlook

| Property | Value |
|---|---|
| **Connector Name (in list)** | Office 365 Outlook |
| **Displayed Connection Name** | `researchmju@mju.ac.th` |
| **Connection ID** | Not exposed in UI |
| **API** | `/providers/Microsoft.PowerApps/apis/shared_office365` |
| **Publisher** | Microsoft |
| **Type** | Standard |
| **Status** | ✅ Connected |
| **Owner** | researchmju@mju.ac.th |
| **Created** | 2026-07-27 (during EPIC-01) |
| **Last Modified** | 23 seconds ago (at inspection time) |
| **Authentication** | OAuth 2.0 (interactive consent — "Signing in..." flow completed successfully) |
| **OAuth Consent Result** | No admin consent required — self-consent succeeded |
| **Usable by Target Flow** | ✅ Yes — connection exists in same environment as GO Metric Approval Workflow |

---

## Connection 3: Standard Approvals

| Property | Value |
|---|---|
| **Connector Name (in list)** | Standard approvals |
| **Displayed Connection Name** | Standard approvals |
| **Connection ID** | Not exposed in UI |
| **API** | `/providers/Microsoft.PowerApps/apis/shared_approvals` |
| **Publisher** | Microsoft |
| **Type** | Standard |
| **Status** | ✅ Connected |
| **Owner** | researchmju@mju.ac.th (connector uses delegated auth from session context; display name shows "Standard approvals" without user prefix, which is the normal display pattern for this connector type) |
| **Created** | 2026-07-27 (during EPIC-01) |
| **Last Modified** | 0 seconds ago (at inspection time) |
| **Authentication** | OAuth 2.0 (system/embedded — no interactive prompt) |
| **Usable by Target Flow** | ✅ Yes — connection exists in same environment as GO Metric Approval Workflow |

---

## Connection Environment Context

| Property | Value |
|---|---|
| **Environment** | `Default-8ec74a39-ddf6-41e1-b0a2-ff0459ea8eb8` |
| **Environment Name** | Maejo university (default) |
| **All 3 connections in same environment?** | ✅ Yes |
| **All 3 connections same type (Standard)?** | ✅ Yes |
| **Target Flow in same environment?** | ✅ Yes |

---

## Validation Per Connector

| Connector | Visible in Catalog | Connection Created | Authentication Result | Status Indicator | Error Message |
|---|---|---|---|---|---|
| SharePoint | ✅ Yes | ✅ Pre-existing | ✅ OAuth succeeded | Connected (green) | None |
| Office 365 Outlook | ✅ Yes | ✅ Created EPIC-01 | ✅ OAuth succeeded — "Signing in..." completed | Connected (green) | None |
| Standard approvals | ✅ Yes | ✅ Created EPIC-01 | ✅ Embedded authentication succeeded | Connected (green) | None |

**Note**: Connector catalog availability (visible when searched) is NOT the same as a usable connection. A connection must be created and authenticated. All 3 connections have been created and authenticated successfully.

---

## Connection References Status

The flow's `connectionReferences` JSON remains `{}` (empty) in the definition. This is expected — connection references are populated when the flow is edited to use the connectors. The connections now exist in the environment and can be referenced when the flow actions are added in EPIC-03.

---

*End of Connection Inventory*  
*Document Version: 1.0*  
*Date: 2026-07-27*
