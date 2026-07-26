# PO Sign-off Checklist — Owner Department Mappings

**Task:** GO-BE-2D · **Gate:** GO-GATE-1
**Date:** 2026-07-26
**Scope:** Final owner-department decisions before Supabase Cloud Dev (GO-BE-5)
**Reference:** [Production Config Readiness](./PRODUCTION_CONFIG_READINESS.md), `supabase/seed.sql`

**Gate status:** **`PO_OWNER_SIGNOFF_COMPLETE`**

---

## Decision rule

Mappings are **PO-approved** as recorded below. `department_id` is internal data-owner accountability only. Public dashboard publication remains **office-wide** (`OFFICE` label).

**Note:** Approved owner codes differ from pre-signoff `seed.sql` / workbook defaults. Apply to database config in **GO-BE-5** (separate commit — not part of this gate).

---

## Sign-off record

| Field | Value |
|-------|-------|
| Gate status | **`PO_OWNER_SIGNOFF_COMPLETE`** |
| Authorized approver | Prinya Painussa |
| Approval date | 2026-07-26 |
| Ownership | ☑ All 7 metrics approved (see matrix) |
| Workflow | ☑ All 5 workflow decisions approved |
| Reviewers | ☑ Names/emails assigned (UUID pending Cloud Auth) |
| Overrides | See approval matrix — PO overrides prior SAMNG defaults |

---

## Approval matrix (PO final — GO-GATE-1)

| Metric | Owner (PO label) | Owner code | PO status | PO notes |
|--------|------------------|------------|-----------|----------|
| `energy` | IQS | `IQS` | **APPROVED** | PO override from prior SAMNG proposal |
| `water` | IQS | `IQS` | **APPROVED** | PO override from prior SAMNG proposal |
| `fuel` | IQS | `IQS` | **APPROVED** | Confirmed |
| `paper` | สำนักวิจัยฯ | `SRCH` | **APPROVED** | PO override — research unit owner |
| `waste` | สำนักวิจัยฯ | `SRCH` | **APPROVED** | PO override from prior SAMNG |
| `recycling_rate` | สำนักวิจัยฯ | `SRCH` | **APPROVED** | PO override from prior SAMNG |
| `ghg` | สำนักวิจัยฯ | `SRCH` | **APPROVED** | PO override; formula remains inactive |

### Summary

| Status | Count | Metrics |
|--------|-------|---------|
| **APPROVED** | 7 | all canonical metrics |

Department code reference: `IQS` = IQS · `SRCH` = สำนักวิจัย (seed label; PO uses สำนักวิจัยฯ)

---

## GO-GATE-1 — Workflow decisions (approved)

| # | Decision | PO response |
|---|----------|-------------|
| 1 | One reviewer per metric | **APPROVED** |
| 2 | One person may review **multiple** metrics | **YES** |
| 3 | Approved correction method: archive + replacement | **APPROVED** |
| 4 | GHG formula `tgo_baseline_v1` inactive during Cloud Dev | **APPROVED** |
| 5 | Public dashboard mode during Cloud Dev: **`static`** | **APPROVED** |

---

## GO-GATE-1 — Reviewer assignment matrix

Single reviewer assigned to all seven metrics (PO approved concentration of duty). **Profile UUID filled after Cloud Auth — not in git.**

| Metric code | Reviewer name | Reviewer email | Profile UUID (post-Auth) | Assigned |
|-------------|---------------|----------------|--------------------------|:--------:|
| `energy` | Prinya Painussa | raemju@gmail.com | _TODO — after Cloud Auth_ | ☑ |
| `water` | Prinya Painussa | raemju@gmail.com | _TODO — after Cloud Auth_ | ☑ |
| `fuel` | Prinya Painussa | raemju@gmail.com | _TODO — after Cloud Auth_ | ☑ |
| `paper` | Prinya Painussa | raemju@gmail.com | _TODO — after Cloud Auth_ | ☑ |
| `waste` | Prinya Painussa | raemju@gmail.com | _TODO — after Cloud Auth_ | ☑ |
| `recycling_rate` | Prinya Painussa | raemju@gmail.com | _TODO — after Cloud Auth_ | ☑ |
| `ghg` | Prinya Painussa | raemju@gmail.com | _TODO — after Cloud Auth_ | ☑ |

Apply UUIDs per [Reviewer Assignment Runbook](./REVIEWER_ASSIGNMENT_RUNBOOK.md) after Supabase Cloud Dev Auth provisioning.

---

## Out of scope (unchanged by this sign-off)

| Item | Status |
|------|--------|
| GHG `metric_formulas.tgo_baseline_v1` activation | **Inactive** — separate future decision |
| `PUBLIC_DASHBOARD_DATA_MODE` live/hybrid | **Static** during Cloud Dev |
| Reviewer profile UUID in git | **Prohibited** — secure channel only |
| Supabase Cloud Dev provisioning | **GO-BE-5** — gate now open for owner/workflow |

---

## After PO sign-off (GO-BE-5 actions)

1. Provision Supabase Cloud Dev (migrations `001–011`; dashboard stays static).
2. Create Auth account for reviewer email; capture profile UUID.
3. Apply owner map + reviewer map to cloud DB (config commit — not this gate).
4. Smoke-test admin workflow against cloud Dev.

---

## Related documents

- [Production Config Readiness](./PRODUCTION_CONFIG_READINESS.md)
- [Reviewer Assignment Runbook](./REVIEWER_ASSIGNMENT_RUNBOOK.md)
- [Backend V1 Freeze](./BACKEND_V1_FREEZE.md)
