# GOFFICE2026 v1.5.0 — Production Deploy Record

**Deploy status:** `PRODUCTION_SUCCESS`  
**Production URL:** https://goffice.mju.ac.th/  
**GitHub Pages preview:** https://numtip.github.io/goffice2026/  
**Deployed commit (source of truth):** `c7966115c4540bf060e19800b3016119d2fa03f4`  
**Commit subject:** `fix(pages): mark client filter scripts inline for astro check`  
**Deployment date:** 2026-08-10 (Asia/Bangkok)  
**Deployment timestamp:** 2026-08-10T07:45:27+00:00 (UTC) — deployed_by `rae_admin`  
**Previous release:** `v1.4.0` / `075866b43e7e05e21aee9733fac5b744c0e8f6fe` — preserved as rollback target  
**Git tag:** none at record time (`git tag --list '*v1.5.0*'` empty); VPS release label `v1.5.0` only  

> **Scope note:** This production cutover promotes **16 commits** on `origin/master` after `v1.4.0` (`075866b` → `c796611`). It includes **GO-EVIDENCE-1** indicator/evidence traceability completion, **GO-DASH-V2** dashboard phases, preview hardening, and Astro check fixes — not a single-sprint-only delta.

---

## Build (development checkout)

| Item | Value |
|------|-------|
| Source workspace | `/home/rae_admin/goffice2026` |
| HEAD at deploy | `c7966115c4540bf060e19800b3016119d2fa03f4` |
| Node (tests) | v22.23.2 (required for `.ts` imports in `node --test` suites) |
| Node (build) | v22.23.2 |
| Install / Build | `npm ci` · `PUBLIC_SITE_URL=https://goffice.mju.ac.th npm run build` |
| Build output | **254 pages** · **315 files** in `dist/` |
| Stage artifact | `/home/rae_admin/goffice2026-stage/v1.5.0.tar.gz` |
| Artifact sha256 | `1084ee5917cb74f1e9d2d06d351de332fd3314954a5a46c65a4c03b0fa4cb1d5` |

### Validation gates (all PASS)

| Gate | Result |
|------|--------|
| `npm test` | PASS — 121 Node tests + 18 dashboard-executive checks |
| `npm run build` | PASS — 254 pages |
| `npm run validate` | PASS — platform validation (taxonomy, evidence-links, routes, production link check) |
| `git diff --check` | clean (tracked tree) |

---

## Deployment

| Item | Value |
|------|-------|
| Release dir | `/var/www/goffice/releases/v1.5.0` (new, immutable) |
| Symlink | `/var/www/goffice/current` → `/var/www/goffice/releases/v1.5.0` (atomic `ln -sfn`) |
| Rollback target | `/var/www/goffice/releases/v1.4.0` (recorded in `goffice2026-stage/rollback-target.txt`) |
| Deploy script | `/home/rae_admin/goffice2026-stage/deploy-v1.5.0.sh` (modeled on `deploy-v1.4.0.sh`) |
| Copy method | tar extract of `dist/` only from staged tarball |
| Excluded | `.git`, `node_modules`, `src`, `docs`, `supabase` — **Supabase NOT deployed** |
| Metadata | `/var/www/goffice/releases/v1.5.0/.release-meta` (pages=254) |
| Nginx | **config unchanged** (no vhost edits); prior deploys used `nginx -t` + reload — this cutover used Docker-equivalent file staging without config change |
| Cloudflare | not modified |

---

## Commit range deployed (`075866b..c796611`)

| SHA | Summary |
|-----|---------|
| `9c705ed` | feat(dashboard): Apache ECharts 6 + localized TH insights |
| `9e928e3` | fix(i18n): TH confidence reasons in exec summary |
| `7a7e5c2` | fix(preview): remove unverified demo scores |
| `5ac98ad` | hardening(preview): quarantine demo data |
| `5a3b6af` | feat(dashboard): GO-DASH-V2 Phase A |
| `268aee1` | docs(dashboard): Phase A closeout |
| `5f3209a` | feat(dashboard): GO-DASH-V2 Phase B |
| `7b44c5d` | docs(handoff): Phase B handoff |
| `a0b877b` | fix(dashboard): GO-DASH-V2 Phase B–C QA/i18n |
| `78c4f92` | feat(dashboard): partial YoY explorer |
| `50df491` | feat(evidence): GO-EVIDENCE-1 traceability foundation |
| `1f4b9ee` | fix(evidence): Thai source availability metadata |
| `f946033` | test(evidence): Thai source metadata parity |
| `b075151` | fix(evidence): client-side query filters (static hosting) |
| `9a57877` | feat(evidence): GO-EVIDENCE-1 indicator & traceability |
| `c796611` | fix(pages): inline client filter scripts for `astro check` |

---

## Smoke test (live production)

| Route | Result |
|-------|--------|
| `/` | 200 |
| `/indicators/` `/en/indicators/` | 200 |
| `/evidence/?indicator=3.2.2` `/en/evidence/?indicator=3.2.2` | 200 — client `URLSearchParams` filter present |
| `/indicators/3.2.2/` `/en/indicators/3.2.2/` | 200 — traceability / linked evidence sections |
| `/dashboard/` `/evidence/` `/about/` `/documents/` | 200 |
| Live vs build parity (`index.html` MD5) | MATCH (`dist/` vs `/var/www/goffice/current`) |

**Evidence UX checks:** offline source items show unavailable copy (e.g. “ไฟล์ต้นฉบับไม่อยู่ในระบบ”) without fake download hrefs to missing `.xlsx` paths.

---

## Rollback

```bash
# as root (sudo -s)
bash /home/rae_admin/goffice2026-stage/rollback-v1.5.0.sh
# → current reverts to /var/www/goffice/releases/v1.4.0; nginx -t + reload if script used with sudo.
# v1.5.0 release dir is kept (never deleted).
```

Not executed during this release.

---

## Parity

| Location | SHA / path |
|----------|------------|
| GitHub `origin/master` (at deploy) | `c7966115c4540bf060e19800b3016119d2fa03f4` |
| Local `master` HEAD (at deploy) | `c7966115c4540bf060e19800b3016119d2fa03f4` |
| Deployed (`.release-meta`) | `c7966115c4540bf060e19800b3016119d2fa03f4` |
| Active symlink | `/var/www/goffice/current` → `v1.5.0` |

**Verdict:** `PRODUCTION_SUCCESS` · **Release closed:** `RELEASE_CLOSED` (documentation record 2026-08-10)
