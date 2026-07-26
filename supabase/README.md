# Supabase — Green Office 2026

Operational backend schema for monthly environmental data entry, review workflow, and dashboard cache. This folder is **source of truth** for database structure; do not apply schema changes in Supabase Studio without a matching migration commit.

## Migration order (001–006)

Apply migrations in numeric filename order:

| File | Owner | Purpose |
|------|-------|---------|
| `202607260001_*` | Worker A | Core tables: `departments`, `profiles`, `metric_types`, `monthly_metric_entries`, `review_comments` |
| `202607260002_create_supporting_tables.sql` | Worker B | Supporting tables: settings, formulas, notifications, cache, evidence links, audit logs |
| `202607260003_*` | Worker C | Indexes, constraints, and performance tuning (TBD) |
| `202607260004_*` | Worker D | Row Level Security policies (TBD) |
| `202607260005_*` | Worker E | Public-safe views and dashboard contract (TBD) |
| `202607260006_create_audit_functions.sql` | Worker B | Audit trigger functions and triggers |

Worker B deliverables in this sprint: **002** and **006** only. Migrations 003–005 are placeholders for parallel workers.

## Local development

Prerequisites: [Supabase CLI](https://supabase.com/docs/guides/cli) installed.

```bash
# From repository root
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

- Six `metric_types` (`energy`, `water`, `fuel`, `paper`, `waste`, `ghg`)
- Three `[DEV]` departments (`DEV-HQ`, `DEV-OPS`, `DEV-QA`)

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
