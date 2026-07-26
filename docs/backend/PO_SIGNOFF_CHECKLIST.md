# PO Sign-off Checklist — Owner Department Mappings

**Task:** GO-BE-2D  
**Date:** 2026-07-26  
**Scope:** Final owner-department decisions before Supabase Dev activation  
**Reference:** [Production Config Readiness](./PRODUCTION_CONFIG_READINESS.md), `supabase/seed.sql`

---

## Decision rule

Mappings are **frozen to workbook evidence** from GO-BE-2C. PO may **confirm** or **override with documented rationale** — not change silently in seed without a matching commit.

Public dashboard publication remains **office-wide** (`OFFICE` label). `department_id` is internal data-owner accountability only.

---

## Approval matrix

| Metric | Owner code | Evidence summary | PO status | PO notes |
|--------|------------|------------------|-----------|----------|
| `energy` | `SAMNG` | Office-wide `2568` sheet in electricity workbook; consolidation unit not named on sheet | **NEEDS_CONFIRMATION** | Confirm Green Office coordinator / สำนักงาน owns entry |
| `water` | `SAMNG` | Office-wide `2568` sheet in water workbook | **NEEDS_CONFIRMATION** | Same as energy |
| `fuel` | `IQS` | Dedicated `IQS` + `สำนักวิจัย` sheets; IQS holds primary fleet diesel logs | **APPROVED** | Workbook structure supports IQS as fuel owner |
| `paper` | `SAMNG` | Row `สำนักงาน` on `แต่ละหน่วยงาน`; office total on `2568` | **NEEDS_CONFIRMATION** | Confirm office consolidation vs. unit-level owner |
| `waste` | `SAMNG` | Form 4.1(1) office-wide totals, `1.5_Waste.xlsx` | **APPROVED** | Mass kg verified 2568 |
| `recycling_rate` | `SAMNG` | Same waste workbook, `%` row | **APPROVED** | Recycling % baseline unchanged |
| `ghg` | `SAMNG` | TGO office-wide summary sheet | **APPROVED** | Derived metric; formula stays **inactive** until separate PO decision |

### Summary

| Status | Count | Metrics |
|--------|-------|---------|
| **APPROVED** | 4 | `fuel`, `waste`, `recycling_rate`, `ghg` |
| **NEEDS_CONFIRMATION** | 3 | `energy`, `water`, `paper` |

---

## Sign-off record (PO completes)

| Field | Value |
|-------|-------|
| Authorized approver | _Pending_ |
| Approval date | _Pending_ |
| Decision | ☐ Confirm all APPROVED rows as-is  ☐ Override rows (attach rationale below) |
| Overrides (if any) | _None — use format: `metric → new_code, reason`_ |

---

## Out of scope for this checklist

Do **not** treat as approved by owner sign-off alone:

| Item | Status |
|------|--------|
| GHG `metric_formulas.tgo_baseline_v1` activation | **Separate decision** — remains `is_active = false` |
| `PUBLIC_DASHBOARD_DATA_MODE` live/hybrid | **Blocked** — remains `static` |
| Reviewer UUID assignment | See [Reviewer Assignment Runbook](./REVIEWER_ASSIGNMENT_RUNBOOK.md) |
| Supabase cloud / Dev project creation | **GO-BE-3** |

---

## After PO sign-off

1. If overrides: update `metric_types.config_metadata.owner_department_code`, `organization_settings.metrics.owner_department_map`, and `supabase/seed.sql` in one commit.
2. Proceed to reviewer UUID assignment (runbook).
3. Enable Supabase **local/Dev** stack only after both owner sign-off and reviewer map are complete (GO-BE-3).

---

## Related documents

- [Production Config Readiness](./PRODUCTION_CONFIG_READINESS.md)
- [Reviewer Assignment Runbook](./REVIEWER_ASSIGNMENT_RUNBOOK.md)
- [Schema — Decision Baseline v1](./SUPABASE_SCHEMA.md#decision-baseline-v1)
