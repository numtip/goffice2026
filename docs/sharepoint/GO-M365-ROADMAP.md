# GO-M365 Roadmap

> **Date**: 2026-07-27  
> **Repository**: `G:\ProjectAI\goffice2026`  
> **Authoritative Baseline**: `docs/sharepoint/GO-M365-3-flow-contract.zip`  
> **Status**: Planning — GO-M365-4 complete, GO-M365-5 in progress

---

## Executive Summary

The **GO-M365** initiative is a multi-phase project to implement a Green Office assessment approval system on the Microsoft Power Platform for Maejo University (Maejo365 tenant). The system consists of a Power Automate approval workflow triggered by a Power Apps form, backed by SharePoint for data persistence.

**Current State**: A placeholder flow (`GO Metric Approval Workflow`) was recovered from the live tenant. It contains a valid trigger and a single Compose action but lacks all business logic. The recovery and baseline documentation phase (GO-M365-3R7 through GO-M365-4) is complete.

**Target State**: A fully functional approval workflow with schema validation, Microsoft Approvals integration, SharePoint persistence, email notifications, error handling, and audit logging. The flow will be packaged as a managed solution ready for production deployment.

---

## Current Baseline

| Property | Value |
|---|---|
| **Flow Name** | GO Metric Approval Workflow |
| **Flow ID** | `40e04977-38cf-42ad-a1e5-bbefbf5cbac1` |
| **Tenant** | Maejo365 (`8ec74a39-ddf6-41e1-b0a2-ff0459ea8eb8`) |
| **Environment** | Default (`Default-8ec74a39-ddf6-41e1-b0a2-ff0459ea8eb8`) |
| **SharePoint Site** | `msteams_54adc4` (สำนักวิจัยฯ) |
| **SharePoint List** | GO Approval Workflow (empty) |
| **Architecture Maturity** | 1.0/5 (placeholder stage) |
| **Connections Configured** | 0 |
| **Actions Implemented** | 1 (Compose placeholder) |
| **Solution Status** | Unmanaged (Default Solution) |

### Baseline Documentation (Committed)

| Document | Commit |
|---|---|
| `GO-M365-3-flow-contract.md` | `8cdb8ec` |
| `GO-M365-3-BASELINE-FREEZE.md` | `8cdb8ec` |
| `GO-M365-3R8-EXTRACTION-REPORT.md` | `8cdb8ec` |
| `GO-M365-3-flow-contract.zip` | `8cdb8ec` |
| `GO-M365-4-IMPLEMENTATION-SPEC.md` | `a5b71fc` |
| `GO-M365-4-ARCHITECTURE-REVIEW.md` | `a5b71fc` |

---

## Recovery Milestones

| Milestone | Task | Status | Date | Commit |
|---|---|---|---|---|
| **M-1** | Bootstrap M365 session | ✅ Complete | 2026-07-27 | — |
| **M-2** | Discover live tenant artifacts | ✅ Complete | 2026-07-27 | — |
| **M-3** | Export flow as .zip | ✅ Complete | 2026-07-27 | — |
| **M-4** | Generate flow contract | ✅ Complete | 2026-07-27 | `8cdb8ec` |
| **M-5** | Freeze baseline | ✅ Complete | 2026-07-27 | `8cdb8ec` |
| **M-6** | Produce implementation spec | ✅ Complete | 2026-07-27 | `a5b71fc` |
| **M-7** | Architecture review | ✅ Complete | 2026-07-27 | `a5b71fc` |
| **M-8** | Detailed design (this phase) | 🔄 In Progress | 2026-07-27 | — |

---

## GO-M365-3 → GO-M365-6 Timeline

```
Jul 26    Jul 27         Jul 28+        Jul 29+        Jul 30+
  │         │              │              │              │
  │ GO-M365-3│R7           │ GO-M365-5    │ GO-M365-6    │
  │  Flow    │Recovery     │  Design      │  Build       │
  │  Created │+ R8 Extract │              │              │
  │          │+ R4 Prep    │              │              │
  ▼          ▼              ▼              ▼              ▼
┌──────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ DISCOVER │   DOCUMENT   │    DESIGN    │    BUILD     │   DEPLOY     │
│          │              │              │              │              │
│ GO-M365-3│ GO-M365-3R7  │ GO-M365-5    │ GO-M365-6    │ GO-M365-6    │
│ (Live)   │ GO-M365-3R8  │              │              │ (continued)  │
│          │ GO-M365-4    │              │              │              │
└──────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

### Phase Summary

| Phase | Name | Type | Status | Duration |
|---|---|---|---|---|
| **GO-M365-3** | Flow Creation | Build | ✅ Complete | Jul 26 |
| **GO-M365-3R7** | Live Recovery | Recovery | ✅ Complete | Jul 27 |
| **GO-M365-3R8** | Extraction & Baseline | Analysis | ✅ Complete | Jul 27 |
| **GO-M365-4** | Preparation & Specification | Design | ✅ Complete | Jul 27 |
| **GO-M365-5** | Detailed Design | Design | 🔄 In Progress | Jul 27 |
| **GO-M365-6** | Implementation & Deploy | Build | ⏳ Planned | Jul 28+ |

---

## Phase Objectives

### GO-M365-5 Objectives (This Phase)

| Objective | Description | Output |
|---|---|---|
| **O-5.1** | Define project roadmap | `GO-M365-ROADMAP.md` |
| **O-5.2** | Produce detailed technical design | `GO-M365-5-DETAILED-DESIGN.md` |
| **O-5.3** | Create epic-based backlog | `GO-M365-5-IMPLEMENTATION-BACKLOG.md` |
| **O-5.4** | Establish risk register | `GO-M365-5-RISK-REGISTER.md` |

### GO-M365-6 Objectives (Next Phase)

| Objective | Description | Output |
|---|---|---|
| **O-6.1** | Implement trigger schema | Flow update |
| **O-6.2** | Configure 3 connectors | SharePoint, O365, Approvals |
| **O-6.3** | Build approval engine | Approval action + conditions |
| **O-6.4** | Implement SharePoint persistence | Create Item action |
| **O-6.5** | Add email notifications | 3 email templates |
| **O-6.6** | Add error handling | Try/Catch + retry |
| **O-6.7** | Package as managed solution | .zip export |
| **O-6.8** | Test end-to-end | Test report |

---

## Deliverables

### Completed Deliverables

| ID | Deliverable | Phase | Status |
|---|---|---|---|
| D-01 | `GO-M365-3-flow-contract.zip` | R7 | ✅ |
| D-02 | `GO-M365-3R7-LIVE-MS365-RECOVERY-REPORT.md` | R7 | ✅ |
| D-03 | `GO-M365-3-flow-contract.md` | R8 | ✅ |
| D-04 | `GO-M365-3-BASELINE-FREEZE.md` | R8 | ✅ |
| D-05 | `GO-M365-3R8-EXTRACTION-REPORT.md` | R8 | ✅ |
| D-06 | `GO-M365-4-IMPLEMENTATION-SPEC.md` | R4 | ✅ |
| D-07 | `GO-M365-4-ARCHITECTURE-REVIEW.md` | R4 | ✅ |

### In-Progress Deliverables

| ID | Deliverable | Phase | Status |
|---|---|---|---|
| D-08 | `GO-M365-ROADMAP.md` | R5 | 🔄 |
| D-09 | `GO-M365-5-DETAILED-DESIGN.md` | R5 | 🔄 |
| D-10 | `GO-M365-5-IMPLEMENTATION-BACKLOG.md` | R5 | 🔄 |
| D-11 | `GO-M365-5-RISK-REGISTER.md` | R5 | 🔄 |

### Future Deliverables

| ID | Deliverable | Phase | Status |
|---|---|---|---|
| D-12 | Updated flow `.zip` (v1.0.0.0) | R6 | ⏳ |
| D-13 | Managed solution export | R6 | ⏳ |
| D-14 | Test report | R6 | ⏳ |
| D-15 | Deployment runbook | R6 | ⏳ |

---

## Dependencies

### Internal Dependencies

```
GO-M365-3R7 (Recovery) ──┐
                          ├──▶ GO-M365-3R8 (Extract) ──▶ GO-M365-4 (Spec) ──▶ GO-M365-5 (Design) ──▶ GO-M365-6 (Build)
GO-M365-3 (Live Flow)  ──┘
```

### External Dependencies

| Dependency | Required By | Status | Owner |
|---|---|---|---|
| Maejo365 tenant access | GO-M365-6 | ✅ Available | Research Office |
| Power Automate Maker Portal | GO-M365-6 | ✅ Accessible | researchmju@mju.ac.th |
| SharePoint site (msteams_54adc4) | GO-M365-6 | ✅ Accessible | Research Office |
| Microsoft Approvals license | GO-M365-6 | ⚠️ Pending verification | M365 Admin |
| Office 365 Outlook license | GO-M365-6 | ✅ Standard | M365 Admin |
| SharePoint list columns | GO-M365-6 | ❌ Not yet created | Flow owner |

### Blocking Dependencies

```
⚠️ Approvals License ──▶ BLOCKS ──▶ EPIC-03 (Approval Engine)
❌ SP List Columns  ──▶ BLOCKS ──▶ EPIC-02 (SharePoint Lists)
```

---

## Success Criteria

### GO-M365-5 Success Criteria

| ID | Criterion | Target |
|---|---|---|
| SC-5.1 | All 4 design documents created | 4/4 files |
| SC-5.2 | All IDs preserved from baseline | 11/11 identifiers |
| SC-5.3 | 8 epics defined with ACs | 8/8 epics |
| SC-5.4 | Risk register complete | All 11 baseline risks + new |
| SC-5.5 | Consistency validated across documents | 0 discrepancies |
| SC-5.6 | All documents committed and pushed | origin/master |

### GO-M365-6 Success Criteria

| ID | Criterion | Target |
|---|---|---|
| SC-6.1 | Flow accepts valid schema input | FR-1 complete |
| SC-6.2 | Approval workflow executes end-to-end | All 8 states reachable |
| SC-6.3 | SharePoint items created on approval | FR-4 complete |
| SC-6.4 | 3 email templates working | FR-5 complete |
| SC-6.5 | Error handling catches all failures | Try/Catch scope active |
| SC-6.6 | Managed solution exported | .zip with version 1.0.0.0 |
| SC-6.7 | Acceptance criteria passed | 8 AC categories × 3 criteria each |

---

## Risks

| Risk ID | Risk | Impact | Mitigation |
|---|---|---|---|
| R-A | Approvals license not available | 🔴 Blocks EPIC-03 | Verify before Phase 6 |
| R-B | SharePoint columns not created | 🔴 Blocks EPIC-02 | Create columns in advance |
| R-C | Flow designer limitations | 🟡 May require workarounds | Use Compose for complex logic |
| R-D | Single environment | 🟡 No dev/test separation | Export backup before changes |
| R-E | Power Apps app not built | 🟢 Flow untestable without caller | Use manual trigger test |

---

## Estimated Effort

| Phase | Tasks | Est. Hours | Calendar Days |
|---|---|---|---|
| GO-M365-3R7 (Recovery) | M365 inspection | 4h | 0.5 |
| GO-M365-3R8 (Extraction) | Extract + document | 3h | 0.5 |
| GO-M365-4 (Specification) | 2 design docs | 4h | 0.5 |
| GO-M365-5 (Detailed Design) | 4 design docs | 3h | 0.5 |
| **Total (Design)** | | **14h** | **2.0 days** |
| | | | |
| GO-M365-6 Phase 1 | Foundation | 6.5h | 2.0 |
| GO-M365-6 Phase 2 | Notifications | 4.0h | 1.5 |
| GO-M365-6 Phase 3 | Resilience | 5.0h | 1.5 |
| Testing | Validation | 3.0h | 1.0 |
| **Total (Build)** | | **18.5h** | **6.0 days** |
| | | | |
| **Grand Total** | | **32.5h** | **~8 days** |

---

## Milestone Checklist

### ✅ Completed
- [x] Recover flow from live tenant (GO-M365-3R7)
- [x] Export flow as .zip package
- [x] Generate flow contract documentation
- [x] Generate baseline freeze documentation
- [x] Generate extraction report
- [x] Generate implementation specification
- [x] Generate architecture review

### 🔄 In Progress
- [ ] Generate roadmap (this document)
- [ ] Generate detailed design
- [ ] Generate implementation backlog
- [ ] Generate risk register

### ⏳ Future
- [ ] Verify Approvals license
- [ ] Create SharePoint list columns per FR-4
- [ ] Implement Phase 1 — Foundation
- [ ] Implement Phase 2 — Notifications
- [ ] Implement Phase 3 — Resilience
- [ ] Package as managed solution
- [ ] End-to-end testing
- [ ] Production deployment

---

## Document Map

```
docs/sharepoint/
├── GO-M365-3-flow-contract.zip          ← Authoritative source
├── GO-M365-3-flow-contract.md           ← R8: Flow contract
├── GO-M365-3-BASELINE-FREEZE.md         ← R8: Architecture snapshot
├── GO-M365-3R8-EXTRACTION-REPORT.md     ← R8: Extraction report
├── GO-M365-4-IMPLEMENTATION-SPEC.md     ← R4: Implementation spec
├── GO-M365-4-ARCHITECTURE-REVIEW.md     ← R4: Architecture review
├── GO-M365-ROADMAP.md                   ← R5: Roadmap (this file)
├── GO-M365-5-DETAILED-DESIGN.md         ← R5: Detailed design
├── GO-M365-5-IMPLEMENTATION-BACKLOG.md  ← R5: Backlog
└── GO-M365-5-RISK-REGISTER.md           ← R5: Risk register
```

---

*End of Roadmap*  
*Document Version: 1.0*  
*Date: 2026-07-27*
