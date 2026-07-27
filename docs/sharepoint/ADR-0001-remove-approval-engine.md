# ADR-0001 — Remove Approval Engine from M365 Scope

> **Date**: 2026-07-27  
> **Status**: Accepted  
> **Author**: Platform Architecture Review  
> **Impact**: GO-M365-6 EPIC-03 through EPIC-08

---

## Context

The GO-M365 project (EPIC-01 through EPIC-08) was originally scoped to build a complete Power Automate approval workflow engine on top of SharePoint, including:

- Power Apps–triggered submissions
- Multi-stage approval routing
- Approval notifications (EPIC-04)
- Dashboard integration (EPIC-05)
- Security hardening (EPIC-06)
- Production deployment (EPIC-08)

Three EPICs were completed (infrastructure, SharePoint schema, and partial approval engine skeleton). The remaining EPICs were not started.

## Original Objective

Transform a recovered Power Automate flow skeleton into a fully functional approval engine that writes approval outcomes back to a SharePoint list, sends email notifications, and integrates with an executive dashboard.

## Current Business Objective

The Green Office 2026 platform exists to serve four core objectives:

1. **Executive dashboards** for resource consumption metrics
2. **Evidence repository** for the 7 Green Office assessment categories
3. **Public news and activity portal**
4. **Environmental awareness and learning resources**

Complex approval workflows are **outside this scope**. The platform is not an enterprise workflow system.

## Reason for Scope Reduction

| Factor | Detail |
|---|---|
| Business alignment | Approval workflows do not serve the four core objectives |
| Platform purpose | Green Office 2026 is a data + evidence + awareness platform, not a BPM system |
| Resource optimization | M365 effort is better spent on authentication, storage, and secure access |
| Complexity avoidance | Multi-stage approval, escalation, and audit trails add operational overhead with no direct business value |

## New Microsoft 365 Responsibilities

Microsoft 365 will now provide only:

| Capability | Purpose |
|---|---|
| **Microsoft Entra ID** | User authentication, staff identity, permission management |
| **SharePoint** | Evidence document storage, category libraries, metadata, version history, secure access |

Everything else belongs to the Green Office application codebase (Astro frontend, Supabase backend).

## Impact Analysis

### Work Preserved

| Asset | Location | Action |
|---|---|---|
| SharePoint schema (11 columns) | GO Approval Workflow list | Keep — may be repurposed for evidence metadata |
| Connection inventory | `docs/sharepoint/GO-M365-6-CONNECTION-INVENTORY.md` | Keep — O365 Outlook connection may be useful |
| Flow backup | `docs/sharepoint/GO-M365-3-flow-contract-backup.zip` | Keep |
| SharePoint field inventory | `docs/sharepoint/GO-M365-6-EPIC-02-SHAREPOINT-SCHEMA-REPORT.md` | Keep |
| EPIC-01/02 documentation | `docs/sharepoint/` | Keep |
| EPIC-03 partial work | `docs/sharepoint/GO-M365-6-EPIC-03*.md` | Archive |

### Work De-Scoped

| Epic | Effort Saved | Status |
|---|---|---|
| EPIC-03 (remaining) | ~3h | Not implemented |
| EPIC-04 Notifications | ~3h | Not started |
| EPIC-05 Dashboard | ~2h | Not started |
| EPIC-06 Security | ~2h | Not started |
| EPIC-07 Testing | ~3h | Not started |
| EPIC-08 Deployment | ~1h | Not started |
| **Total** | **~14h** | — |

## Future Reactivation

This approval engine work **can be reactivated** if business requirements change. The following assets make reactivation efficient:

1. SharePoint schema (11 columns) already exist in the GO Approval Workflow list
2. Three M365 connections (SharePoint, O365 Outlook, Standard approvals) are authenticated
3. Partial approval flow skeleton is saved and documented
4. Connection inventory and field maps are committed to the repository

Reactivation would require:
1. Revisit this ADR and change status to "Superseded"
2. Resume from EPIC-03 at the current state
3. Complete Condition field configuration and Update item actions

## Decision

**DE-SCOPED — Business Requirement Removed**

The GO-M365 Approval Engine (EPIC-03 through EPIC-08) is formally de-scoped. No further implementation is required.

Microsoft 365 will provide authentication (Entra ID) and storage (SharePoint) only. All application logic, dashboards, and public-facing features belong to the Green Office application.
