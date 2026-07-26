# Row Level Security (RLS) Policy Reference

**Version:** GO-BE-1 foundation  
**Updated:** 2026-07-26  
**Implementation:** `supabase/migrations/202607260005_enable_rls_and_policies.sql`

RLS is **mandatory** on every operational table. Anonymous users never receive direct access to operational tables.

---

## Mandatory Security Statements

These statements are non-negotiable project policy:

1. **Public reads approved safe views only.** Anonymous (`anon`) and public website clients may `SELECT` from `public_dashboard_*` views only. They cannot query `profiles`, `monthly_metric_entries`, `audit_logs`, or other operational tables.

2. **Staff manage assigned department drafts.** Staff may create and update entries for their `profiles.department_id` when status is `draft` or `needs_revision`. They cannot act on other departments' entries.

3. **Staff cannot approve.** Transition to `approved` is reserved for `reviewer` and `admin` roles. Staff `UPDATE` policies must not permit setting `status = approved`.

4. **Reviewer handles submitted workflow.** Reviewers read `submitted` entries (and context rows), set `approved` or `needs_revision`, and insert `review_comments`. They cannot bypass audit or immutability triggers.

5. **Approved values cannot be silently overwritten.** Database triggers block non-admin modification of approved row values. Corrections require archive + replacement workflow (see [Schema](./SUPABASE_SCHEMA.md#correction-model)).

6. **Audit logs are not public.** `audit_logs` are readable by `admin` and limited `reviewer` access only. No anon, viewer, or staff global read.

7. **Profiles are not public.** `profiles` (including email) are never exposed through public views or anon policies.

8. **Service-role key is server-only and absent from browser code.** `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS and must never appear in frontend bundles, git, or client-side environment variables. Browser uses `PUBLIC_SUPABASE_ANON_KEY` only, protected by RLS.

---

## Role Definitions

| Role | Auth | Scope |
|------|------|-------|
| `public` / `anon` | Unauthenticated Supabase anon key | Public views only |
| `viewer` | Authenticated, `profiles.role = viewer` | Internal read where noted |
| `staff` | Authenticated, `profiles.role = staff` | Own department drafts |
| `reviewer` | Authenticated, `profiles.role = reviewer` | Submitted workflow |
| `admin` | Authenticated, `profiles.role = admin` | Full operational manage |

Helper functions (migration 005): `current_user_role()`, `current_user_department_id()`, `is_admin()`, `is_reviewer()`.

---

## Permission Matrix

Legend: **Y** = allowed, **—** = denied, **own** = own row or own department, **pub** = public-safe subset, **sub** = submitted rows, **appr** = approved rows.

### Core tables

| Table | public SELECT | viewer SELECT | staff SELECT | reviewer SELECT | admin SELECT | staff INSERT | staff UPDATE | staff DELETE | reviewer INSERT | reviewer UPDATE | admin INSERT | admin UPDATE | admin DELETE |
|-------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `profiles` | — | own | own | own + workflow | Y | — | own | — | — | — | Y | Y | — |
| `departments` | — | Y (active) | Y (active) | Y (active) | Y | — | — | — | — | — | Y | Y | — |
| `metric_types` | — | Y (active) | Y (active) | Y (active) | Y | — | — | — | — | — | Y | Y | — |
| `monthly_metric_entries` | — | appr | own dept | sub + own dept + appr | Y | own dept draft | own draft/needs_revision | — | — | sub→appr/needs_revision | Y | Y | — |
| `review_comments` | — | own dept entries | own dept entries | Y | Y | — | — | — | Y | — | Y | Y | — |

### Supporting tables

| Table | public SELECT | viewer SELECT | staff SELECT | reviewer SELECT | admin SELECT | staff INSERT | staff UPDATE | staff DELETE | reviewer INSERT | reviewer UPDATE | admin INSERT | admin UPDATE | admin DELETE |
|-------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `audit_logs` | — | — | — | workflow-related | Y | — | — | — | — | — | — | — | — |
| `organization_settings` | pub (`is_public`) | Y | Y | Y | Y | — | — | — | — | — | Y | Y | — |
| `metric_formulas` | — | Y (active) | Y (active) | Y (active) | Y | — | — | — | — | — | Y | Y | — |
| `notifications` | — | own | own | own | Y | — | own (`read_at`) | — | — | — | Y | Y | — |
| `dashboard_cache` | — | — | — | — | Y | — | — | — | — | — | Y | Y | Y |
| `external_evidence_links` | — | appr entry links | own dept entries | Y | Y | own dept entries | own dept entries | — | — | — | Y | Y | Y |

### Public views

| View | public SELECT | viewer SELECT | staff SELECT | reviewer SELECT | admin SELECT | All roles INSERT/UPDATE/DELETE |
|------|:---:|:---:|:---:|:---:|:---:|:---:|
| `public_dashboard_monthly_metrics` | Y | Y | Y | Y | Y | — |
| `public_dashboard_executive_summary` | Y | Y | Y | Y | Y | — |
| `public_dashboard_metadata` | Y | Y | Y | Y | Y | — |

Views are read-only. Writes go through base tables under RLS.

---

## Policy Details by Role

### Public / anon

- `GRANT SELECT` on `public_dashboard_monthly_metrics`, `public_dashboard_executive_summary`, `public_dashboard_metadata`.
- `GRANT USAGE` on schema; **no** policies on operational tables (default deny).
- May read `organization_settings` rows where `is_public = true` if exposed via metadata view (not direct table access for anon).

### Viewer

- Read active reference data: `departments`, `metric_types`, `metric_formulas`.
- Read **approved** `monthly_metric_entries` and linked `external_evidence_links`.
- Read own `profile` and `notifications`.
- Read public `organization_settings` and internal non-secret settings as defined by admin policy.
- **No** INSERT, UPDATE, or DELETE on any operational table.

### Staff

- All viewer read permissions for own department scope where narrower.
- **INSERT** entries: `department_id = current_user_department_id()`, initial `status = draft`.
- **UPDATE** entries: own department, `status IN (draft, needs_revision)` only; cannot set `approved`.
- **INSERT** `external_evidence_links` for own department entries.
- **UPDATE** own `notifications.read_at`.
- **No** access to global `audit_logs`.
- **No** approve authority.

### Reviewer

- **SELECT** entries with `status = submitted` across departments (or per metric assignment when configured).
- **UPDATE** submitted entries: transition to `approved` or `needs_revision`; set `approved_at` / `approved_by` on approve.
- **INSERT** `review_comments` on entries under review.
- **SELECT** `audit_logs` for workflow entities under review (not full admin audit export).
- **Cannot** modify `value` on `approved` rows or bypass correction workflow.

### Admin

- Full CRUD on reference tables: `departments`, `metric_types`, `metric_formulas`, `organization_settings`.
- Manage `profiles` (role assignment, deactivation).
- **UPDATE** any entry including `archived` transition on approved rows.
- Full **SELECT** on `audit_logs`.
- Manage `dashboard_cache`.
- **Cannot** expose service-role credentials via policies (credential isolation is application-level).

---

## Immutability Trigger (Approved Rows)

Migration 003 defines a `BEFORE UPDATE` trigger on `monthly_metric_entries`:

- Blocks changes to `value`, dimensional keys, and status (except `approved → archived`) for non-admin callers.
- Ensures RLS alone is not the only line of defense against silent overwrites.

---

## View Security

Public views are created with `security_invoker = true` (PostgreSQL 15+). They inherit the caller's RLS context on underlying tables while projecting only approved, non-sensitive columns.

Do not grant anon direct SELECT on base tables even if a view exists.

---

## Environment Rules

| Variable | Client | RLS |
|----------|--------|-----|
| `PUBLIC_SUPABASE_ANON_KEY` | Browser / static build | Required; policies enforce access |
| `SUPABASE_SERVICE_ROLE_KEY` | Server automation only | Bypasses RLS; never in frontend |

Default dashboard mode remains `static` (`PUBLIC_DASHBOARD_DATA_MODE`). Live mode uses anon key against public views only.

---

## Related Documents

- [Schema Reference](./SUPABASE_SCHEMA.md)
- [API Contract v1](./API_CONTRACT.md)
- [Supabase Backend Blueprint V1](../GREENOFFICE2026_SUPABASE_BACKEND_BLUEPRINT_V1.md)
- [ADR-003 Supabase Operational Backend](../architecture/adr/ADR-003-SUPABASE-OPERATIONAL-BACKEND.md)
