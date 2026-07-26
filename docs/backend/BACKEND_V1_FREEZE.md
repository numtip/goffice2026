# Backend V1 Freeze Record

**Date:** 2026-07-26  
**Task:** GO-QA-1  
**Status:** **FROZEN** (local + schema; cloud not activated)  
**Audit:** [PRODUCTION_READINESS_AUDIT.md](./PRODUCTION_READINESS_AUDIT.md)

---

## Frozen scope

### In scope (V1)

- Supabase schema migrations `202607260001` through `202607260011`
- Seven canonical metrics (Decision Baseline v1)
- Staff draft → submit workflow (owner-department enforced)
- Per-metric reviewer approve / needs_revision
- Approved-entry immutability + archive partial unique index
- Public views: approved owner-department rows only
- Local admin UI: `/admin/login/`, `/admin/`, `/admin/entries/`, `/admin/review/`
- Static dashboard (`PUBLIC_DASHBOARD_DATA_MODE=static`)
- Local bootstrap: `scripts/bootstrap-local-auth.mjs`, `scripts/test-admin-e2e.mjs`

### Explicit exclusions (not V1)

- Supabase Cloud Dev/production projects
- Live/hybrid dashboard mode
- GHG runtime formula engine (`metric_formulas.tgo_baseline_v1` inactive)
- File upload / evidence storage in Supabase
- Production reviewer UUIDs in git
- Git release tag (PO approval pending)

---

## Migration set (frozen)

| # | File |
|---|------|
| 001 | `create_core_tables.sql` |
| 002 | `create_supporting_tables.sql` |
| 003 | `indexes_and_constraints.sql` |
| 004 | `public_dashboard_views.sql` |
| 005 | `enable_rls_and_policies.sql` |
| 006 | `create_audit_functions.sql` |
| 007 | `harden_rls_and_profile_privileges.sql` |
| 008 | `implement_decision_baseline_v1.sql` |
| 009 | `fix_audit_row_change_seed_compat.sql` |
| 010 | `grant_table_privileges.sql` |
| 011 | `production_readiness_hardening.sql` |

Apply in filename order only. No Studio-only changes.

---

## Workflow invariants (frozen)

1. Staff create/update/delete drafts only for metrics owned by their department.
2. Staff cannot approve.
3. Reviewers act only on assigned metrics (`workflow.metric_reviewer_map`).
4. Approved rows immutable except admin archive path.
5. Public/anon reads `public_dashboard_*` views only.
6. Browser uses anon key only; service role scripts are local/bootstrap only.

---

## Rollback point

- **Git:** commit containing migration `011` + audit docs (GO-QA-1)
- **Database:** forward-only migrations; local rollback = `supabase db reset` (destroys local data)
- **Dashboard:** revert to static JSON anytime via `PUBLIC_DASHBOARD_DATA_MODE=static`

---

## Known limitations at freeze

| Item | State |
|------|-------|
| Owner map PO confirmation | 3/7 metrics NEEDS_CONFIRMATION |
| Reviewer UUIDs | Null in seed; local bootstrap assigns test users |
| Cloud secrets | Not provisioned |
| Admin bundle size | ~216 KB Supabase client on admin routes |

---

## Next phase (GO-BE-5)

1. PO completes owner sign-off checklist
2. Assign production reviewer UUIDs (secure channel)
3. Provision Supabase Cloud Dev per blueprint
4. Apply migrations + reference seed (not local test users)
5. Smoke-test admin against cloud Dev
6. Keep public dashboard static until PO approves live mode

---

## Verification commands (repeat before cloud)

```powershell
supabase db reset
$env:LOCAL_DEV_TEST_PASSWORD = '...'  # never commit
npm run bootstrap:local-auth
npm run test:admin-e2e
npm run check && npm test && npm run build
```

Expected: E2E **15/15** pass; build **230** pages.
