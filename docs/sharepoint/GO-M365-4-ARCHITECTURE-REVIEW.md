# GO-M365-4 — Architecture Review

> **Date**: 2026-07-27  
> **Purpose**: Architecture review of the GO Metric Approval Workflow baseline prior to GO-M365-4 implementation  
> **Authoritative Baseline**: `docs/sharepoint/GO-M365-3-flow-contract.zip`  
> **Reference Docs**: GO-M365-3-flow-contract.md, GO-M365-3-BASELINE-FREEZE.md, GO-M365-3R8-EXTRACTION-REPORT.md, GO-M365-4-IMPLEMENTATION-SPEC.md

---

## 1. Executive Summary

The GO Metric Approval Workflow is an **early-stage placeholder** recovered from the live Maejo365 tenant. It contains a valid Power Automate trigger and a single Compose action but **lacks all core business logic**. This review assesses the current architecture, identifies risks and technical debt, and provides a sequenced implementation roadmap.

### Architecture Maturity Score

| Dimension | Score (1-5) | Assessment |
|---|---|---|
| **Trigger Integration** | 2/5 | Valid PowerAppV2 trigger but no schema enforcement |
| **Action Logic** | 1/5 | Single placeholder Compose — no business logic |
| **Connections** | 0/5 | Zero connectors configured |
| **Error Handling** | 0/5 | No error paths or retry logic |
| **Auditability** | 1/5 | Creator tracked but no runtime logging |
| **Security** | 2/5 | Per-user plan active but no explicit security controls |
| **Versioning** | 0/5 | `contentVersion: "undefined"` |
| **Deployability** | 2/5 | Exportable as ZIP but unmanaged |
| **Overall** | **1.0/5** | Placeholder stage — not production-ready |

---

## 2. Risks

### High Risks 🔴

| Risk ID | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| R-01 | **No approval actions** — flow named "Approval Workflow" but contains zero approval logic | Cannot fulfill intended purpose | Certain (100%) | Implement approvals in GO-M365-4 Phase 1 |
| R-02 | **Zero connection references** — flow cannot interact with any external service | Isolation — no SharePoint, email, or approval routing | Certain (100%) | Configure 3 connectors in GO-M365-4 Phase 1 |
| R-03 | **No input validation** — any payload accepted | Data corruption; SQL injection via SharePoint fields | High | Enforce trigger schema per FR-1 |
| R-04 | **No output** — flow terminates silently | Calling Power Apps app receives no feedback | High | Define terminal Compose output per output schema |

### Medium Risks 🟡

| Risk ID | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| R-05 | **Per-user execution plan** — flow runs in triggerer's context | Approver can't be different user unless explicitly configured | Medium | Use per-user connections; specify approver in payload |
| R-06 | **No duplicate detection** — same AssessmentId submitted twice | Duplicate SharePoint records | Medium | Add SharePoint Get Items lookup before create |
| R-07 | **No timeout handling** — approval can pend indefinitely | Orphaned approvals; resource waste | Medium | Configure 7-day timeout in approval action |
| R-08 | **Unmanaged solution** — `isManaged: false` | No ALM lifecycle; edits unrestricted | Medium | Package as managed solution after GO-M365-4 |

### Low Risks 🟢

| Risk ID | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| R-09 | **Undefined content version** — `"undefined"` | Traceability gap | Low | Set `contentVersion: "1.0.0.0"` |
| R-10 | **Power Apps app not created** — flow has no caller | Flow cannot be triggered currently | Low | Deferred to future phase |
| R-11 | **Single environment** — no dev/test/prod separation | Testing risk | Low | Accept for current scope |

---

## 3. Missing Components

### Component Inventory — Current vs Complete

| Component | Current State | Complete State | Priority |
|---|---|---|---|
| **Trigger Input Schema** | `properties: {}` | Defined schema per FR-1 | 🔴 P1 |
| **Approval Action** | ❌ | Start and Wait for Approval | 🔴 P1 |
| **Condition (Approve/Reject)** | ❌ | Outcome branching | 🔴 P1 |
| **SharePoint Create Item** | ❌ | Write to GO Approval Workflow | 🔴 P1 |
| **SharePoint Connection** | ❌ | OAuth connection reference | 🔴 P1 |
| **Approvals Connection** | ❌ | OAuth connection reference | 🔴 P1 |
| **Office 365 Connection** | ❌ | OAuth connection reference | 🟡 P2 |
| **Email (Approve)** | ❌ | Send Email (V2) | 🟡 P2 |
| **Email (Reject)** | ❌ | Send Email (V2) | 🟡 P2 |
| **Email (Timeout)** | ❌ | Send Email (V2) | 🟡 P2 |
| **Duplicate Detection** | ❌ | SharePoint Get Items lookup | 🟡 P2 |
| **Try Scope** | ❌ | Scope with catch-all | 🟡 P2 |
| **Retry Policy** | ❌ | Fixed retry ×3 on SharePoint | 🟢 P3 |
| **Audit Logging** | ❌ | Compose logs at each decision point | 🟢 P3 |
| **Content Version** | `"undefined"` | `"1.0.0.0"` | 🟢 P3 |
| **Managed Solution** | `false` | Custom solution packaged | 🟢 P3 |
| **Error Notification** | ❌ | Email flow owner on failure | 🟢 P3 |

**Total Missing**: 17 components  
**Recovered**: 2 (trigger + Compose placeholder)

### Dependency Graph of Missing Components

```
                    ┌──────────────────┐
                    │ Trigger Schema   │ (FR-1)
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │ Parse Input      │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
    ┌─────────▼────┐  ┌─────▼──────┐  ┌───▼──────────┐
    │Approval      │  │Duplicate   │  │Connections   │
    │Connector ◀───┤  │Check       │  │(3 connectors)│
    └─────────┬────┘  └─────┬──────┘  └──────────────┘
              │              │
    ┌─────────▼────┐        │
    │Condition     │        │
    │(Approve/     │        │
    │Reject/       │        │
    │Timeout)      │        │
    └────┬────┬────┘        │
         │    │             │
    ┌────▼┐ ┌─▼────┐       │
    │SP   │ │Email │       │
    │Create│ │Send  │       │
    └──┬──┘ └──┬───┘       │
       │       │            │
    ┌──▼───────▼──┐        │
    │Audit Log    │◀───────┘
    │(Compose)    │
    └─────────────┘
```

---

## 4. Technical Debt

### Existing Technical Debt

| Debt ID | Item | Remediation | Effort |
|---|---|---|---|
| TD-01 | Empty trigger schema (`properties: {}`) | Define strict JSON schema | Low |
| TD-02 | `contentVersion: "undefined"` | Set `1.0.0.0` | Trivial |
| TD-03 | No connection references (`apisMap: {}`, `connectionsMap: {}`) | Add 3 connector references | Medium |
| TD-04 | `isManaged: false` — unmanaged flow | Package as managed solution | Low |
| TD-05 | Per-user plan — no service principal | Evaluate service account for production | Medium |
| TD-06 | Zero actions after Compose — dead end | Build complete action chain | High |
| TD-07 | Flow name "Approval Workflow" misleading | Rename or implement approvals (latter chosen) | — |
| TD-08 | No solution packaging — Default Solution | Create custom "Green Office Assessment" solution | Low |
| TD-09 | SharePoint "GO Approval Workflow" list empty | Design and create list columns per FR-4 | Medium |
| TD-10 | No Power Apps caller app | Future development (not GO-M365-4 scope) | High |

### Technical Debt Severity

```
TD-01 ████████░░ Low (fix during GO-M365-4)
TD-02 ██████░░░░ Trivial (1 line change)
TD-03 ██████████████░░ Medium (3 connector configs)
TD-04 ████████░░ Low (solution packaging)
TD-05 ████████████░░ Medium (evaluate options)
TD-06 ████████████████████ High (entire flow rebuild)
TD-07 ████████░░ Low (resolved by implementation)
TD-08 ████████░░ Low (1-time setup)
TD-09 ████████████░░ Medium (list schema design)
TD-10 ████████████████████ High (future project)
```

---

## 5. Architecture Decision Records (Inferred from Baseline)

### ADR Implicit in Current Architecture

| Decision | Rationale (Inferred) | Assessment |
|---|---|---|
| PowerAppV2 trigger (not HTTP, not scheduled) | Flow is intended to be called from a Power Apps assessment form | ✅ Appropriate for use case |
| Manual trigger (not automated) | Approval is a human-in-the-loop process | ✅ Correct pattern |
| Default Solution (not named solution) | Early development; no ALM consideration yet | ⚠️ Acceptable for now; remediate in GO-M365-4 |
| Per-user plan (not per-flow) | Simple startup; no service principal available | ⚠️ Works but limits automation |
| Single Compose placeholder | Created as skeleton; not yet evolved | ⚠️ Expected for initial portal creation |

---

## 6. Recommended Implementation Order

### Phase 1 — Foundation (Critical Path)

**Goal**: Establish the core approval capability with persistence

| Step | Component | Dependency | Effort (est.) |
|---|---|---|---|
| 1.1 | Define trigger input schema (FR-1) | None | 1h |
| 1.2 | Add Parse JSON action | 1.1 | 30m |
| 1.3 | Configure SharePoint connection | None | 30m |
| 1.4 | Configure Approvals connection | None | 30m |
| 1.5 | Add Start and Wait for Approval action | 1.2, 1.4 | 1h |
| 1.6 | Add Condition (Approve/Reject/Timeout) | 1.5 | 1h |
| 1.7 | Add SharePoint Create Item (Approve branch) | 1.6, 1.3 | 1h |
| 1.8 | Verify SharePoint list columns match FR-4 mapping | None | 1h |

**Phase 1 Total**: ~6.5h  
**Deliverable**: Functional approval flow that validates input, routes to approver, and persists approved records

### Phase 2 — Notifications & Safety

**Goal**: Add email notifications and duplicate detection

| Step | Component | Dependency | Effort (est.) |
|---|---|---|---|
| 2.1 | Configure Office 365 connection | None | 30m |
| 2.2 | Add Send Email (Approve branch) | 2.1, 1.7 | 30m |
| 2.3 | Add Send Email (Reject branch) | 2.1, 1.6 | 30m |
| 2.4 | Add Send Email (Timeout branch) | 2.1, 1.6 | 30m |
| 2.5 | Add SharePoint Get Items (duplicate check) | 1.3, 1.2 | 1h |
| 2.6 | Add Condition for duplicate detection | 2.5 | 30m |
| 2.7 | Add Send Email for duplicate warning | 2.1, 2.6 | 30m |

**Phase 2 Total**: ~4h  
**Deliverable**: Complete notification matrix and duplicate submission handling

### Phase 3 — Resilience & Production Readiness

**Goal**: Error handling, logging, versioning, and solution packaging

| Step | Component | Dependency | Effort (est.) |
|---|---|---|---|
| 3.1 | Wrap primary actions in Try Scope | 2.x | 1h |
| 3.2 | Add Catch-All error handler (Compose + Email) | 3.1, 2.1 | 1h |
| 3.3 | Configure retry policy on SharePoint Create | 3.1 | 30m |
| 3.4 | Add audit log Compose actions (6 log points) | 3.1 | 1h |
| 3.5 | Set `contentVersion` to `"1.0.0.0"` | None | 15m |
| 3.6 | Create "Green Office Assessment" solution | None | 30m |
| 3.7 | Package flow as managed solution | 3.5, 3.6 | 30m |
| 3.8 | Export updated ZIP and commit to Git | 3.7 | 15m |

**Phase 3 Total**: ~5h  
**Deliverable**: Production-ready flow with error handling, audit trail, and solution packaging

---

## 7. Estimated Development Phases

### Gantt Overview

```
Week 1            Week 2            Week 3
M  T  W  T  F     M  T  W  T  F     M  T  W  T  F
███████████████
█████████████████████████████████
               ██████████████████████
                                 █████████████████
                                        ████████████

Phase 1 (Foundation):      ███████████████  (6.5h, ~2 days)
Phase 2 (Notifications):           ██████████████████████  (4h, ~1.5 days)
Phase 3 (Resilience):                        █████████████████  (5h, ~1.5 days)
Testing & Validation:                                  ███████████████  (3h, ~1 day)
```

### Total Estimated Effort

| Phase | Hours | Calendar Days (1 dev) |
|---|---|---|
| Phase 1 — Foundation | 6.5 | 2 |
| Phase 2 — Notifications | 4.0 | 1.5 |
| Phase 3 — Resilience | 5.0 | 1.5 |
| Testing & Validation | 3.0 | 1 |
| Documentation updates | 2.0 | 0.5 |
| **Total** | **20.5h** | **~6.5 days** |

### Critical Path

```
Trigger Schema → Parse Input → Approval Action → Condition → SharePoint → Email → Scope → Solution → Export
                                                                                                    │
                              Duplicate Check ──────────────────────────────────────────────────────┘
```

### Parallelization Opportunities

- Connections (1.3, 1.4, 2.1) can be configured in parallel
- SharePoint list columns (1.8) can be verified while Phase 1 development proceeds
- Solution creation (3.6) can be done early and the flow added later

---

## 8. Readiness Assessment for GO-M365-4

### Prerequisites

| Prerequisite | Status | Action Needed |
|---|---|---|
| Flow ZIP archived in Git | ✅ `docs/sharepoint/GO-M365-3-flow-contract.zip` | None |
| R8 documentation complete | ✅ 3 docs generated | None |
| Baseline frozen | ✅ GO-M365-3-BASELINE-FREEZE.md | None |
| Implementation spec complete | ✅ GO-M365-4-IMPLEMENTATION-SPEC.md | None |
| Architecture review complete | ✅ This document | None |
| Access to Power Automate Maker Portal | ✅ `researchmju@mju.ac.th` | None |
| SharePoint list accessible | ✅ `msteams_54adc4` — empty list | Verify/create columns |
| Approvals connector licensed | ⚠️ Requires verification | Check Microsoft 365 license |
| Office 365 Outlook licensed | ✅ Standard M365 license | None |

### Go/No-Go Checklist

| Criterion | Status | Notes |
|---|---|---|
| Documentation baseline committed | ⬜ TODO | Phase 1 commit needed |
| Implementation spec approved | ⬜ TODO | Review by project lead |
| Architecture risks accepted | ⬜ TODO | Review R-01 through R-05 |
| SharePoint list columns designed | ⬜ TODO | FR-4 mapping |
| Development environment ready | ✅ | Default environment accessible |
| All 3 connector licenses verified | ⚠️ | Approvals connector needs verification |

### Recommendation

**GO/NO-GO**: 🟢 **GO** — with conditions

**Conditions**:
1. Commit all documentation baseline before any flow modifications
2. Verify Microsoft Approvals licensing in Maejo365 tenant
3. Create/verify SharePoint list columns per FR-4 mapping
4. Review and accept implementation risks (R-01 through R-05)

---

## 9. Appendix — Reference Architecture Comparison

| Aspect | Recovered (Current) | GO-M365-4 (Target) | Industry Standard |
|---|---|---|---|
| Trigger | No-schema PowerAppV2 | Strict-schema PowerAppV2 | OpenAPI-defined |
| Actions | 1 (Compose placeholder) | ~12-15 actions | 10-30 typical |
| Approval | None | Start and Wait for Approval | Service-bus + queue |
| Persistence | None | SharePoint Create | Database + blob |
| Notifications | None | Email (O365) | Email + Teams + SMS |
| Error Handling | None | Try/Catch + retry | DLQ + circuit breaker |
| Logging | None | Compose audit logs | App Insights + Log Analytics |
| Versioning | `"undefined"` | `"1.0.0.0"` | Semantic versioning |
| ALM | Unmanaged | Managed solution | CI/CD pipeline |
| Connections | 0 | 3 (SP, O365, Approvals) | Service principal + managed identity |

---

*End of Architecture Review*  
*Document Version: 1.0*  
*Date: 2026-07-27*
