# Green Office 2026 — Backend Documentation

Supabase operational backend documentation for monthly environmental metrics, review workflow, and public-safe dashboard data.

**Status:** Foundation reference (GO-BE-1). Not live until migrations are applied and PO approves activation.

## Canonical Principle

> Supabase powers the back-office workflow; Astro remains the public Green Office platform.

## Documents

| Document | Purpose |
|----------|---------|
| [Supabase Backend Blueprint V1](../GREENOFFICE2026_SUPABASE_BACKEND_BLUEPRINT_V1.md) | Approved scope, boundaries, and workflow direction |
| [Schema Reference](./SUPABASE_SCHEMA.md) | Tables, relationships, status model, correction model |
| [RLS Policy Reference](./RLS_POLICY.md) | Role permissions and mandatory security statements |
| [API Contract v1](./API_CONTRACT.md) | Public dashboard data envelope, metadata, fallback |
| [Production Config Readiness](./PRODUCTION_CONFIG_READINESS.md) | GO-BE-2C/2D owner maps, waste kg, GHG evidence |
| [PO Sign-off Checklist](./PO_SIGNOFF_CHECKLIST.md) | Owner department approval matrix (GO-BE-2D) |
| [Reviewer Assignment Runbook](./REVIEWER_ASSIGNMENT_RUNBOOK.md) | Per-metric reviewer UUID procedure (GO-BE-2D) |

## Database & Migrations

| Resource | Location |
|----------|----------|
| Migration guide | [`supabase/README.md`](../../supabase/README.md) |
| SQL migrations | [`supabase/migrations/`](../../supabase/migrations/) |
| Development seed | [`supabase/seed.sql`](../../supabase/seed.sql) |

## Architecture Decisions

| Resource | Location |
|----------|----------|
| ADR index | [`docs/architecture/adr/README.md`](../architecture/adr/README.md) |
| ADR-001 Astro static-first | [`ADR-001-ASTRO-STATIC-FIRST.md`](../architecture/adr/ADR-001-ASTRO-STATIC-FIRST.md) |
| ADR-002 Document Center boundary | [`ADR-002-DOCUMENT-CENTER-BOUNDARY.md`](../architecture/adr/ADR-002-DOCUMENT-CENTER-BOUNDARY.md) |
| ADR-003 Supabase operational backend | [`ADR-003-SUPABASE-OPERATIONAL-BACKEND.md`](../architecture/adr/ADR-003-SUPABASE-OPERATIONAL-BACKEND.md) |
| ADR-004 Live dashboard + static fallback | [`ADR-004-LIVE-DASHBOARD-WITH-STATIC-FALLBACK.md`](../architecture/adr/ADR-004-LIVE-DASHBOARD-WITH-STATIC-FALLBACK.md) |

## TypeScript Boundary

Repository and client scaffolds live under `src/lib/supabase/` and `src/lib/repositories/`. See API contract for the typed envelope consumed by the dashboard layer.

## Out of Scope (This Phase)

- Evidence file upload, versioning, or storage (Document Center / M365)
- Supabase cloud project provisioning
- Complete admin UI
- Service-role key in frontend code
