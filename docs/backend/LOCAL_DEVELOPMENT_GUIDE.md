# Local Development Guide

**Task:** GO-INFRA-1 · **Next:** GO-BE-3 local auth + admin MVP

Reproducible local setup for the Astro frontend and optional Supabase local stack. No cloud login or production changes.

---

## Prerequisites

| Tool | Required for | Install |
|------|----------------|---------|
| Node.js ≥ 20 | Frontend, tests, build | [nodejs.org](https://nodejs.org/) |
| npm | Package scripts | Bundled with Node |
| Git | Source control | [git-scm.com](https://git-scm.com/) |
| PowerShell ≥ 5.1 | Helper scripts | Windows built-in |
| Docker Desktop | Local Supabase | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) |
| Supabase CLI | Migrations / seed | [supabase.com/docs/guides/cli](https://supabase.com/docs/guides/cli) |

Check status:

```powershell
.\scripts\check-local.ps1
```

Statuses: `READY` · `NOT_INSTALLED` · `VERSION_MISMATCH`

---

## Bootstrap

```powershell
# 1. Clone and enter repo
cd F:\projectAi\goffice2026

# 2. Install frontend dependencies
npm install

# 3. Environment file (no secrets in git)
copy .env.example .env
# Leave PUBLIC_DASHBOARD_DATA_MODE=static for safe default

# 4. Optional — local Supabase (Docker + CLI required)
.\scripts\start-local.ps1
.\scripts\reset-local.ps1

# 5. After supabase start — fill .env from local keys only:
supabase status -o env

# 6. Frontend
npm run dev
```

Static dashboard works **without** Supabase when `PUBLIC_DASHBOARD_DATA_MODE=static`.

---

## Common commands

| Action | Command |
|--------|---------|
| Prerequisite check | `.\scripts\check-local.ps1` |
| Start Supabase local | `.\scripts\start-local.ps1` |
| Migrations + seed | `.\scripts\reset-local.ps1` |
| Seed only | `.\scripts\seed-local.ps1` |
| Stop Supabase | `supabase stop` |
| Typecheck | `npm run check` |
| Tests | `npm test` |
| Production build | `npm run build` |
| Data pipeline | `npm run data:check` |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `docker not recognized` | Install Docker Desktop; restart shell |
| `supabase not recognized` | Install CLI; add to PATH |
| `supabase start` fails | Ensure Docker daemon is running |
| `.env` ignored by git | Expected — never commit `.env` |
| Live dashboard empty | Keep `PUBLIC_DASHBOARD_DATA_MODE=static` until PO sign-off |
| Reviewer cannot approve | Assign UUIDs per [Reviewer Assignment Runbook](./REVIEWER_ASSIGNMENT_RUNBOOK.md) |

---

## Readiness checklist (GO-BE-3)

| Step | Command / artifact |
|------|-------------------|
| ☐ Docker running | `docker info` |
| ☐ Supabase CLI | `supabase --version` |
| ☐ Node ≥ 20 | `node -v` |
| ☐ `config.toml` present | `supabase/config.toml` |
| ☐ Migrations applied | `.\scripts\reset-local.ps1` |
| ☐ Seed loaded | Included in reset; or `.\scripts\seed-local.ps1` |
| ☐ Frontend build | `npm run build` |
| ☐ Local auth bootstrap | `LOCAL_DEV_TEST_PASSWORD=… npm run bootstrap:local-auth` |
| ☐ Admin E2E | `npm run test:admin-e2e` |
| ☐ Admin UI | `/admin/login/` (local Supabase + `.env`) |
| ☐ PO owner sign-off | [PO Sign-off Checklist](./PO_SIGNOFF_CHECKLIST.md) |
| ☐ Reviewer UUIDs | [Reviewer Assignment Runbook](./REVIEWER_ASSIGNMENT_RUNBOOK.md) |

---

## Related

- [Production Config Readiness](./PRODUCTION_CONFIG_READINESS.md)
- [Supabase README](../../supabase/README.md)
- [Backend docs index](./README.md)
