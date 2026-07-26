# Supabase — Green Office 2026

Operational backend schema for monthly environmental data entry, review workflow, and dashboard cache. This folder is **source of truth** for database structure; do not apply schema changes in Supabase Studio without a matching migration commit.

## Migration order (001–011)

Apply migrations in numeric filename order:

| File | Purpose |
|------|---------|
| `202607260001_create_core_tables.sql` | Core tables: `departments`, `profiles`, `metric_types`, `monthly_metric_entries`, `review_comments` |
| `202607260002_create_supporting_tables.sql` | Supporting tables: settings, formulas, notifications, cache, evidence links, audit logs |
| `202607260003_create_indexes_and_constraints.sql` | Indexes, canonical unit CHECKs, approved-entry immutability trigger |
| `202607260004_create_public_dashboard_views.sql` | Public-safe dashboard views (approved rows only) |
| `202607260005_enable_rls_and_policies.sql` | RLS helper functions and policies |
| `202607260006_create_audit_functions.sql` | Audit trigger functions and triggers |
| `202607260007_harden_rls_and_profile_privileges.sql` | Profile privilege trigger, scoped reviewer audit read, audit insert hardening |
| `202607260008_implement_decision_baseline_v1.sql` | Decision Baseline v1: 7-metric catalog, partial unique index, owner-dept views, per-metric reviewer RLS |
| `202607260009_fix_audit_row_change_seed_compat.sql` | Multi-table audit trigger fix for organization_settings seed |
| `202607260010_grant_table_privileges.sql` | Grant authenticated/service_role table access (RLS still applies) |
| `202607260011_production_readiness_hardening.sql` | Staff owner-dept entry enforcement; reviewer audit scope |

## Local development

**Bootstrap:** [docs/backend/LOCAL_DEVELOPMENT_GUIDE.md](../docs/backend/LOCAL_DEVELOPMENT_GUIDE.md)

Prerequisites: [Supabase CLI](https://supabase.com/docs/guides/cli) + Docker Desktop.

```powershell
# From repository root (Windows)
.\scripts\check-local.ps1
.\scripts\start-local.ps1
.\scripts\reset-local.ps1
```

Or manually:

```bash
supabase start
supabase db reset    # runs all migrations + seed.sql
```

Inspect schema:

```bash
supabase status
psql "$(supabase status -o env | grep DATABASE_URL | cut -d= -f2-)" -c '\dt public.*'
```

Stop local stack when finished:

```bash
supabase stop
```

## Seed usage

`seed.sql` loads **development reference data only**:

- Seven `metric_types` (`energy`, `water`, `fuel`, `paper`, `waste`, `recycling_rate`, `ghg`)
- Three `[DEV]` departments (`DEV-HQ`, `DEV-OPS`, `DEV-QA`)
- Placeholder `organization_settings` for owner-department and reviewer maps (null reviewer UUIDs until PO assigns)

It does **not** create users, auth accounts, monthly entries, or production values. All inserts use `ON CONFLICT DO NOTHING` for idempotent re-runs.

Re-apply seed without full reset:

```bash
psql "$(supabase status -o env | grep DATABASE_URL | cut -d= -f2-)" -f supabase/seed.sql
```

## Rules

1. **No Studio-only changes** — every schema change must be a committed migration file.
2. **No service-role key in frontend** — browser code uses `PUBLIC_SUPABASE_ANON_KEY` only; RLS (004) enforces access. Never expose `SUPABASE_SERVICE_ROLE_KEY` in Astro client bundles or git.
3. **Cloud deployment outside scope** — dev/staging/production Supabase project provisioning, secrets, and CI deploy are documented separately. This README covers local schema workflow only.
4. **Evidence links are URL-only** — `external_evidence_links` stores M365/SharePoint references; file upload remains in Document Center.
5. **Audit logs exclude PII device data** — no IP addresses, fingerprints, or device IDs in schema or audit functions.

## Related docs

- `docs/GREENOFFICE2026_SUPABASE_BACKEND_BLUEPRINT_V1.md` — architecture and data workflow
- `docs/GREENOFFICE2026_PLATFORM_BLUEPRINT_V3.md` — parent platform blueprint
