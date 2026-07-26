# Supabase Cloud Dev Provisioning (GO-BE-5)

**Task:** GO-BE-5 · **Status:** PROVISIONED  
**Provisioning date:** 2026-07-26  
**Baseline:** `v1.0.0-backend-freeze` · commit `b5ad716`

---

## Project identity (non-secret)

| Field | Value |
|-------|-------|
| Organization | RAEMJU Org |
| Project name | numtipProject |
| Project ref | `aryshyzolpdxxvmyhedx` |
| Region | ap-northeast-2 |
| Environment role | Cloud Dev |
| Plan | **Free** (zero-cost policy) |
| Migrations applied | `202607260001`–`202607260011` (001–011) |

---

## Zero-cost policy

- Supabase **Free Plan** only — no upgrades, billing, or paid add-ons.
- No production VPS or production backend deployment from this task.
- Cloud Dev is schema-only until GO-BE-6 (Auth, config, smoke-test).

---

## Secrets handling

| Secret | Storage | Git |
|--------|---------|-----|
| Database password | Supabase dashboard / operator only | Never |
| Access token | Local CLI session (`~/.supabase`) | Never |
| Service-role key | Supabase dashboard / local `.env` only | Never |
| Anon/publishable key | Local `.env` when needed | Never |

- Link state lives in `supabase/.temp/` (gitignored).
- Do not commit `.env`, connection strings, or keys.

---

## Provisioning steps (executed)

1. `supabase login` — operator session (local only).
2. `supabase link --project-ref aryshyzolpdxxvmyhedx`
3. `supabase db push --dry-run --linked` — confirmed fresh DB, 11 migrations.
4. `supabase db push --linked` — applied 001–011 successfully.
5. SQL verification + `supabase db advisors --linked --type security`.

**Not applied:** `seed.sql` (local dev reference data only; PO owner map applied in GO-BE-6).

---

## Verification summary (2026-07-26)

| Check | Result |
|-------|--------|
| Migration history (local = remote) | **PASS** — 11/11 matched |
| Tables | **PASS** — 11 operational tables |
| Views | **PASS** — 3 `public_dashboard_*` views |
| Functions | **PASS** — 12 public functions |
| Triggers | **PASS** — 9 triggers |
| Indexes | **PASS** — 32 |
| Primary keys | **PASS** — 11 |
| Foreign keys | **PASS** — 17 |
| CHECK constraints | **PASS** — 80 |
| UNIQUE constraints | **PASS** — 5 |
| RLS on operational tables | **PASS** — enabled on all 11 tables |
| RLS policies | **PASS** — 54 policies; **0 anon write policies** |
| Anon operational table grants | **PASS** — 0 (views only) |
| Storage buckets | **PASS** — none created |
| Seed data | **PASS** — no `seed.sql`; 1 migration-inserted metric row only |
| Auth users | **PASS** — none created (GO-BE-6) |
| Secret scan (tracked files) | **PASS** — no credentials committed |

### RLS / security notes

- Public dashboard views use intentional `SECURITY DEFINER` pattern (migration 004); Supabase linter flags these as expected.
- `authenticated` role has table GRANTs filtered by RLS (migration 010).
- GHG formula remains **inactive**; dashboard stays **static** until separate PO live-mode decision.

---

## GO-BE-6 readiness

| Prerequisite | Status |
|--------------|--------|
| Cloud Dev linked + migrations | **Complete** |
| PO owner sign-off (GO-GATE-1) | **Complete** |
| Auth + reviewer profile UUID | **Pending GO-BE-6** |
| PO owner map in cloud config | **Pending GO-BE-6** |
| Reviewer map in cloud config | **Pending GO-BE-6** |
| Admin smoke-test against cloud | **Pending GO-BE-6** |

---

## Operator commands (reference)

```powershell
cd F:\projectAi\goffice2026
supabase link --project-ref aryshyzolpdxxvmyhedx
supabase migration list --linked
supabase db push --dry-run --linked
supabase db query --linked "SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;"
```

---

## Related docs

- [Production Config Readiness](./PRODUCTION_CONFIG_READINESS.md)
- [Backend V1 Freeze](./BACKEND_V1_FREEZE.md)
- [RLS Policy Reference](./RLS_POLICY.md)
- [Supabase README](../../supabase/README.md)
