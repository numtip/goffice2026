# ADR-003: Supabase Operational Backend Only

## Status

ACCEPTED

## Context

Environmental performance data for fiscal year 2569 and beyond must be updated monthly by assigned staff, reviewed, and approved before appearing on public dashboards. Static JSON alone cannot support authenticated entry, workflow states, or audit traceability without rebuild friction.

The product owner approved a limited Supabase extension that adds operational backend capabilities without replacing the Astro public platform or absorbing document management.

## Decision

Use Supabase as the operational backend **only** for:

| Capability | Purpose |
|------------|---------|
| Authentication | Staff, reviewer, and admin login via Supabase Auth |
| Monthly data entry | CRUD for `monthly_metric_entries` by assigned department |
| Review workflow | Submit, approve, request revision; status transitions |
| Approved metrics exposure | Public-safe views of approved values for dashboard consumption |
| Audit history | Traceability for operational data changes and workflow events |

Supabase does **not** provide: public CMS, evidence storage, Document Center, full real-time collaboration, or replacement of static baseline content.

Canonical schema lives in `supabase/migrations/` with Row Level Security mandatory on all operational tables.

## Consequences

**Positive**

- Monthly 2569+ data can be entered and approved without rebuilding the public site.
- Workflow states prevent draft or submitted values from reaching public views.
- Audit logs support accountability for corrections and approvals.
- PostgreSQL and Supabase Auth provide a well-understood operational stack.

**Negative**

- Adds environment variables, migration discipline, and RLS testing to the project.
- GitHub Pages static deploy cannot run server-side Supabase logic; admin and live reads are client-side or build-assisted.
- Requires ongoing Supabase project ownership (dev/staging/production).

## Constraints

- Scope is limited to auth, monthly entry, review, approved metrics views, and audit — no expansion into CMS or file storage without a new ADR.
- Public dashboard must read approved data only via `public_dashboard_monthly_metrics` or equivalent public-safe view, never internal tables directly.
- `SUPABASE_SERVICE_ROLE_KEY` must never ship to the browser or git.
- Migration files are the schema source of truth; Supabase Studio is for inspection, not untracked production changes.
- Roles: `admin`, `staff`, `reviewer`, `viewer`; public remains anonymous read of approved dashboard data only.

## Related documents

- [Supabase Backend Blueprint V1](../../GREENOFFICE2026_SUPABASE_BACKEND_BLUEPRINT_V1.md) — §2–§7, §10 Security and RLS, §12 Migration rules
- [ADR-001](./ADR-001-ASTRO-STATIC-FIRST.md)
- [ADR-002](./ADR-002-DOCUMENT-CENTER-BOUNDARY.md)
- [ADR-004](./ADR-004-LIVE-DASHBOARD-WITH-STATIC-FALLBACK.md)
