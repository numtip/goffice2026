# GO-M365-6 — EPIC-01 Infrastructure Report

> **Date**: 2026-07-27  
> **Account**: `researchmju@mju.ac.th`  
> **Environment**: `Default-8ec74a39-ddf6-41e1-b0a2-ff0459ea8eb8`  
> **Flow**: `GO Metric Approval Workflow` (ID: `40e04977-38cf-42ad-a1e5-bbefbf5cbac1`)  
> **Status**: ✅ EPIC-01 PASS

---

## 1. Flow Backup / Export

### Backup Export

| Property | Value |
|---|---|
| **Package Name** | `GO-M365-3-flow-contract-backup` |
| **Export Timestamp** | `2026-07-27T05:33:23Z` |
| **Export Method** | Power Automate Maker Portal → Export → Package (.zip) |
| **Exporting User** | `researchmju@mju.ac.th` |
| **Exporting Environment** | `Default-8ec74a39-ddf6-41e1-b0a2-ff0459ea8eb8` |
| **File Name** | `GO-M365-3-flow-contract-backup_20260727053323.zip` |
| **File Size** | 2,109 bytes |
| **SHA-256** | `5F0EEB158E49E7CB14BFC69665DBEB401BA757611E7547CDD40EEDD283DE89C8` |
| **Archived Location** | `docs/sharepoint/GO-M365-3-flow-contract-backup.zip` |
| **Previous Export (M-3)** | `GO-M365-3-flow-contract_20260727044127.zip` (SHA-256: `62D2CB35...`) |

### Backup Verification

| Check | Result | Detail |
|---|---|---|
| Export dialog opened successfully | ✅ Pass | Export configuration page loaded with "Export package" heading |
| Package name entered | ✅ Pass | Name: `GO-M365-3-flow-contract-backup` |
| Export button enabled after name | ✅ Pass | Button enabled |
| Download initiated | ✅ Pass | Azure Blob Storage SAS URL generated |
| File downloaded | ✅ Pass | File present in Downloads folder |
| File copied to repo | ✅ Pass | `docs/sharepoint/GO-M365-3-flow-contract-backup.zip` |

**Verdict**: ✅ Backup created and archived successfully.

---

## 2. Connection Inventory

### Before EPIC-01

| Connector | Status | Owner |
|---|---|---|
| SharePoint | ✅ Connected (Jul 21) | researchmju@mju.ac.th |
| Office 365 Outlook | ❌ Not created | — |
| Standard approvals | ❌ Not created | — |

### After EPIC-01

| Connector | Status | Owner | Created |
|---|---|---|---|
| SharePoint | ✅ Connected | researchmju@mju.ac.th | Jul 21 (pre-existing) |
| Office 365 Outlook | ✅ Connected | researchmju@mju.ac.th | EPIC-01 |
| Standard approvals | ✅ Connected | Standard approvals (system) | EPIC-01 |

---

## 3. Connection Details

### Connection Creation Log

#### Office 365 Outlook
- **Navigated**: Available connectors → searched "Office 365 Outlook"  
- **Connector found**: Office 365 Outlook — Microsoft — Standard  
- **Dialog**: "Connect to Office 365 Outlook" — Display name field optional  
- **Action**: Clicked "Create"  
- **OAuth flow**: "Signing in..." progress shown (3-5 seconds)  
- **Result**: Redirected to Connections page  
- **Status**: **Connected** (shows `researchmju@mju.ac.th` — Office 365 Outlook — Connected)  
- **Connection name**: `researchmju@mju.ac.th`  

#### Standard Approvals
- **Navigated**: Available connectors → searched "Standard approvals"  
- **Connector found**: Standard approvals — Microsoft — Standard  
- **Dialog**: "Connect to Standard approvals" — Display name field optional  
- **Action**: Clicked "Create"  
- **OAuth flow**: Brief progress indicators  
- **Result**: Redirected to Connections page  
- **Status**: **Connected** (shows "Standard approvals" — Standard approvals — Connected)  
- **Connection name**: `Standard approvals` (no user prefix — authentication embedded in connector)  

---

## 4. Flow Ownership Inspection

| Property | Value | Evidence |
|---|---|---|
| **Flow ID** | `40e04977-38cf-42ad-a1e5-bbefbf5cbac1` | Flow details page |
| **Primary Owner** | สำนักวิจัยและส่งเสริมวิชาการการเกษตร (Research Office) | Flow details page |
| **Plan** | The user who runs the flow (per-user) | Flow details page |
| **Created** | Jul 26, 2026, 09:55 PM | Flow details page |
| **Modified** | Jul 26, 2026, 09:55 PM | Flow details page |
| **Status** | On (Enabled) | Flow details page |
| **Type** | Instant | Flow details page |
| **Edit button** | ✅ Visible | Command bar |
| **Share button** | ✅ Visible | Command bar |
| **Run button** | ✅ Enabled | Command bar |
| **Co-owners** | None (only primary owner) | Owners section |
| **Connections on flow** | 0 (none configured in definition) | Connections section shows "There aren't any connections for this flow" |

**Note**: No additional owners were added per the "do not add unless explicitly required" instruction.

---

## 5. Environment Verification

| Property | Expected | Verified | Match |
|---|---|---|---|
| Tenant ID | `8ec74a39-ddf6-41e1-b0a2-ff0459ea8eb8` | `8ec74a39-ddf6-41e1-b0a2-ff0459ea8eb8` | ✅ |
| Environment ID | `Default-8ec74a39-ddf6-41e1-b0a2-ff0459ea8eb8` | `Default-8ec74a39-ddf6-41e1-b0a2-ff0459ea8eb8` | ✅ |
| Environment Name | Maejo university (default) | Maejo university (default) | ✅ |
| Flow ID | `40e04977-38cf-42ad-a1e5-bbefbf5cbac1` | `40e04977-38cf-42ad-a1e5-bbefbf5cbac1` | ✅ |
| Flow Name | GO Metric Approval Workflow | GO Metric Approval Workflow | ✅ |
| SP Site | `msteams_54adc4` | `msteams_54adc4` | ✅ |
| SP List | GO Approval Workflow | GO Approval Workflow | ✅ |

**Verdict**: ✅ Environment 7/7 properties consistent.

---

## 6. Summary

| Task | Status | Detail |
|---|---|---|
| Flow backup exported | ✅ Complete | SHA-256: `5F0EEB...`, archived in repo |
| SharePoint connection verified | ✅ Pre-existing | Connected since Jul 21 |
| Office 365 Outlook connection | ✅ Created | Connected |
| Standard approvals connection | ✅ Created | Connected |
| Flow ownership inspected | ✅ Complete | No co-owners added |
| Environment verified | ✅ Complete | 7/7 properties match |

**EPIC-01 Decision**: ✅ **PASS**

---

*End of EPIC-01 Infrastructure Report*  
*Document Version: 1.0*  
*Date: 2026-07-27*
