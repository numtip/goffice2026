# Production Readiness Audit — Backend V1

**Task:** GO-QA-1  
**Date:** 2026-07-26  
**Auditor:** Main Agent (Workers A–E integrated)  
**Scope:** Local Supabase schema, RLS, admin MVP, ops docs — **no cloud activation**

---

## Executive verdict

**READY_WITH_CONDITIONS**

Technical blockers found during audit were reproduced and fixed (migration `011`, entry-service). No unresolved **CRITICAL** or **HIGH** defects remain in repo scope. Cloud Dev activation remains gated on PO owner sign-off (3 metrics), production reviewer UUID assignment, and deliberate provisioning — not on schema/code readiness alone.

---

## Scope and evidence

| Area | Evidence reviewed |
|------|-------------------|
| Database | Migrations `001–011`, `seed.sql`, local `supabase db reset` |
| Security | RLS policies, grants (`010`), targeted SQL + `npm run test:admin-e2e` (15 steps) |
| API/code | `src/lib/repositories/*`, `src/lib/admin/*`, `API_CONTRACT.md` |
| Performance | Index definitions (`003`, `002`), admin build output |
| Operations | `LOCAL_DEVELOPMENT_GUIDE.md`, PO checklist, reviewer runbook, config readiness |

Validation run: `supabase db reset` → `bootstrap:local-auth` → `test:admin-e2e` → `check` → `test` → `build` → `git diff --check`.

---

## Findings by severity

### CRITICAL — 0 (none open)

_No CRITICAL defects identified after audit fixes._

### HIGH — 2 found, 2 fixed

| ID | Finding | Evidence | Fix |
|----|---------|----------|-----|
| H-1 | Staff could insert drafts for metrics outside owner department (e.g. fuel/IQS row in SAMNG dept) | SQL insert succeeded before fix; public view would never publish row | Migration `011`: `mme_insert/update/delete_staff` require `department_id = metric_owner_department_id(metric_type_id)` |
| H-2 | Admin staff UI showed zero assignable metrics — `organization_settings` not readable by staff (`is_public=false`) | Staff SELECT returned 0 rows; owner map empty in client | `entry-service` reads `metric_types.config_metadata.owner_department_code` (RLS-safe) |

### MEDIUM — 5 (accepted / documented)

| ID | Finding | Notes |
|----|---------|-------|
| M-1 | Reviewer audit log read was cross-metric | Fixed in `011` (scoped to `is_assigned_reviewer`) |
| M-2 | `service_role` has broad table GRANTs (`010`) | Required for local bootstrap; never expose key in frontend |
| M-3 | `seed.sql` `ON CONFLICT DO UPDATE` on `organization_settings` | Safe for local reset; **do not re-run seed in cloud after reviewer assignment** |
| M-4 | Admin Supabase bundle ~216 KB (client chunk) | Acceptable for local MVP; lazy-loaded on admin routes only |
| M-5 | Ops docs reference GO-BE-3 gates; local admin now complete | Updated in freeze doc |

### LOW — 4 (no fix required)

| ID | Finding |
|----|---------|
| L-1 | `audit-repository` exported but unused in admin UI |
| L-2 | No composite index `(metric_type_id, status)` — status index exists; sufficient at current scale |
| L-3 | `organization-repository.getReviewerMap()` unused in UI (server-side RLS uses DB function) |
| L-4 | PO checklist still lists 3 `NEEDS_CONFIRMATION` owner rows |

---

## Fixes applied

1. `supabase/migrations/202607260011_production_readiness_hardening.sql`
2. `src/lib/admin/entry-service.ts` — assignable metrics via `config_metadata`
3. `src/lib/supabase/types.ts` — `config_metadata` on `MetricType`
4. `scripts/test-admin-e2e.mjs` — steps 14–15 (cross-owner deny, assignable metrics)

---

## Accepted risks

| Risk | Mitigation |
|------|------------|
| `PUBLIC_DASHBOARD_DATA_MODE=static` | No live dashboard until PO approves hybrid/live |
| GHG formula inactive | Documented; separate PO decision |
| Local test users (`*.example.test`) | Bootstrap script only; not for production |
| Service-role bootstrap scripts | Env-only keys; `.gitignore` covers `.env` |
| Broad authenticated GRANT + RLS | Standard Supabase pattern; policies enforce row scope |

---

## Open business blockers

1. PO sign-off: `energy`, `water`, `paper` → `NEEDS_CONFIRMATION`
2. Production reviewer UUID map (7 metrics) — null in seed
3. Supabase Cloud Dev project provisioning (GO-BE-5)
4. Live/hybrid dashboard activation policy

---

## Readiness scores

| Dimension | Score | Deductions |
|-----------|------:|------------|
| Architecture | **86** | Static-first preserved; admin client-side only |
| Database | **84** | Pre-011 owner enforcement gap; seed overwrite ops risk |
| Security | **83** | service_role breadth; resolved audit/owner gaps |
| API/code | **85** | Repository boundary good; org_settings client read removed from staff path |
| Operations/docs | **76** | PO/reviewer gates incomplete |
| **Overall** | **82** | **READY_WITH_CONDITIONS** |

Scoring rule: no inflation above 90 until cloud Dev validated and PO sign-off complete.

---

## Cloud activation gate

Proceed to Supabase Cloud Dev **only when all are true**:

- [x] Migrations `001–011` apply cleanly on local reset
- [x] E2E workflow 15/15 pass
- [x] No unresolved CRITICAL/HIGH in repo
- [ ] PO owner checklist fully APPROVED
- [ ] Reviewer UUID map assigned (secure channel)
- [ ] Cloud project + secrets via approved runbook (GO-BE-5)
- [ ] `PUBLIC_DASHBOARD_DATA_MODE` remains `static` until PO approves live

---

## Freeze recommendation

**Recommend Backend V1 freeze** at commit including migration `011` and audit docs. See [BACKEND_V1_FREEZE.md](./BACKEND_V1_FREEZE.md). No git tag until PO explicitly approves.

---

## Related

- [BACKEND_V1_FREEZE.md](./BACKEND_V1_FREEZE.md)
- [RLS_POLICY.md](./RLS_POLICY.md)
- [PO_SIGNOFF_CHECKLIST.md](./PO_SIGNOFF_CHECKLIST.md)
- [LOCAL_DEVELOPMENT_GUIDE.md](./LOCAL_DEVELOPMENT_GUIDE.md)
