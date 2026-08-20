# GOFFICE2026 v1.7.0 — Production Deploy Record

**Deploy status:** `PRODUCTION_SUCCESS`  
**Production URL:** https://goffice.mju.ac.th/  
**GitHub Pages preview:** https://numtip.github.io/goffice2026/  
**Deployed commit (source of truth):** `380bf3bd7060585555d5ac7104693a84f0176f70`  
**Commit subject:** `docs: trim trailing whitespace in daily close handoff`  
**PO approval:** 2026-08-20 (explicit production approval in session)  
**Deployment date:** 2026-08-20 (Asia/Bangkok)  
**Deployment timestamp:** 2026-08-20T03:05:18+00:00 (UTC) — deployed_by `rae_admin`  
**Previous release:** `v1.6.0` / `011c9fee0b1dd6a84f6599348db6a46a95754f94` — preserved as rollback target  
**Git tag:** none at record time; VPS release label `v1.7.0` only

> **Scope:** Promote GitHub `master` `380bf3b` after GO-MOTION-V2 production (`011c9fe` → `380bf3b`, **42 commits**). Delivers the CAT1 FY2568 frozen baseline: 1.1–1.7 journeys, 9 canonical contracts, About hub reconciliation, and FY2568 evidence files. Evidence gaps **1.2.2** and **1.5.3** remain disclosed gaps.

---

## Build (development checkout)

| Item | Value |
|------|-------|
| Source workspace | `/home/rae_admin/goffice2026` |
| Deployed source SHA | `380bf3bd7060585555d5ac7104693a84f0176f70` |
| Node (check/build) | v20.19.5 (nvm) |
| Install / Build | existing `node_modules` · `PUBLIC_SITE_URL=https://goffice.mju.ac.th npm run build` |
| Build output | **272 pages** · **589 files** in `dist/` |
| Stage artifact | `/home/rae_admin/goffice2026-stage/v1.7.0.tar.gz` (721M) |
| Artifact sha256 | `b4dbf6f7b02a59285eb6b6b375eed75b9be18f99f4b78b02367c9c1e73982beb` |

### Validation gates (all PASS)

| Gate | Result |
|------|--------|
| `git diff --check` | PASS |
| `npm run check` | PASS — 0 errors, 0 warnings, 16 hints (P2) |
| `npm test` | PASS — 256 tests (`NODE_OPTIONS='--import tsx'` on Node 20; GitHub Actions uses Node 24) |
| `npm run build` | PASS — 272 pages, canonical URL `https://goffice.mju.ac.th/` |
| `npm run validate` | PASS — taxonomy (7/24/65), CAT1 9 contracts, evidence (25 indexed), 271 dist routes, production link check |
| Preview `qa:routes` | PASS — 60/60 |
| Extra CAT1 FY2568 preview routes | PASS — committee/scope/policy/goals/action-plan + indicators 1.1.1–1.7.2 TH/EN |
| GitHub Pages run `32275590702` | PASS (preview already at `380bf3b`) |

---

## Deployment

| Item | Value |
|------|-------|
| Release dir | `/var/www/goffice/releases/v1.7.0` (new, immutable) |
| Symlink | `/var/www/goffice/current` → `/var/www/goffice/releases/v1.7.0` (atomic `ln -sfn`) |
| Rollback target | `/var/www/goffice/releases/v1.6.0` (recorded in `goffice2026-stage/rollback-target.txt`) |
| Deploy script | `/home/rae_admin/goffice2026-stage/deploy-v1.7.0.sh` |
| Copy method | tar extract of `dist/` only from staged tarball |
| Excluded | `.git`, `node_modules`, `src`, `docs`, `supabase` |
| Metadata | `/var/www/goffice/releases/v1.7.0/.release-meta` (pages=272) |
| Nginx | **config unchanged**; `nginx -t` + reload only |
| Cloudflare / M365 / data-sync | not modified |

---

## Smoke test (live production)

| Route | Result |
|-------|--------|
| `/` `/en/` `/dashboard/` `/en/dashboard/` `/evidence/` `/en/evidence/` `/knowledge/` `/en/knowledge/` | all **200** |
| `/about/committee/` `/en/about/committee/` `/about/scope/` `/about/policy/` `/about/goals/` `/about/action-plan/` | all **200** |
| `/indicators/1.1.1/` … `/indicators/1.7.2/` + `/en/indicators/1.1.1/` `/categories/cat1/` `/documents/` | all **200** |
| FY2568 marker on `/about/committee/` | ✓ — count **1** |
| Hero WebP TH `/` | ✓ |
| No fake Command Center sparklines | ✓ — `command-center-title` count **0** |
| Evidence unavailable state | ✓ |
| Sample FY2568 PDF `/documents/fy2568/cat1/1.1/1.1.1 (9-3-69).pdf` | **200** (503372 bytes) |
| Live vs build parity (`index.html` MD5) | **MATCH** (`16fb456cd5886acd6d3a888a7a319765`) |

---

## Rollback

```bash
# as root (sudo -s)
bash /home/rae_admin/goffice2026-stage/rollback-v1.7.0.sh
# → current reverts to /var/www/goffice/releases/v1.6.0; nginx -t + reload.
# v1.7.0 release dir is kept (never deleted).
```

Not executed during this release. Rollback target verified present.

---

## Known MINOR backlog (non-blocking)

1. GitHub Actions Node 20 deprecation annotations — P2.
2. 16 pre-existing `astro check` hints — P2.
3. CAT1 evidence gaps **1.2.2** and **1.5.3** remain truthful gaps (freeze contract).
4. Search-index generation stamp informational drift (committed 2026-08-19 vs regenerate 2026-08-20) — content PASS.

**Verdict:** `PRODUCTION_SUCCESS` · **Release closed:** `CAT1_FY2568_PRODUCTION_DEPLOYED`
