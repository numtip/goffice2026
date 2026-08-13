# GO-MOTION-V2 — Production Deploy / Closeout Record

**Deploy status:** `PRODUCTION_SUCCESS`  
**Production URL:** https://goffice.mju.ac.th/  
**GitHub Pages preview:** https://numtip.github.io/goffice2026/  
**Deployed commit (source of truth):** `011c9fee0b1dd6a84f6599348db6a46a95754f94`  
**Acceptance-doc commit:** `75206dd0f664bad49edc1feb62895068cc9e1a39`  
**Acceptance record:** `docs/reviews/GO_MOTION_V2_PREVIEW_ACCEPTANCE.md`  
**Deployment date:** 2026-08-13 (Asia/Bangkok)  
**Deployment timestamp:** 2026-08-13T16:36:49+00:00 (UTC) — deployed_by `rae_admin`  
**Previous release:** `v1.5.1` / `2bfd7ca` — preserved as rollback target  
**Git tag:** none at record time; VPS release label `v1.6.0` only

> **Scope:** GO-MOTION-V2 Phases A/B/C — Evidence Control Room landing, visual refinement, hero LCP WebP. Promotes 18 commits after v1.5.1 production (`2bfd7ca` → `011c9fe`).

---

## Build (development checkout)

| Item | Value |
|------|-------|
| Source workspace | `/home/rae_admin/goffice2026` |
| Deployed source SHA | `011c9fee0b1dd6a84f6599348db6a46a95754f94` |
| Node (check/build) | v20.19.5 (nvm) |
| Install / Build | existing `node_modules` · `PUBLIC_SITE_URL=https://goffice.mju.ac.th npm run build` |
| Build output | **270 pages** · **375 files** in `dist/` |
| Stage artifact | `/home/rae_admin/goffice2026-stage/v1.6.0.tar.gz` |
| Artifact sha256 | `c34e37c108f6d5a51760349b54a593ab19566c01abd3a4292ea1be3e83d7ea27` |

### Validation gates (all PASS)

| Gate | Result |
|------|--------|
| `git diff --check` | PASS |
| `npm run check` | PASS — 0 errors, 14 hints (P2) |
| `npm test` | PASS — 139 tests |
| `npm run build` | PASS — 270 pages, canonical URL `https://goffice.mju.ac.th/` |
| `npm run validate` | PASS — taxonomy (7/24/65), evidence (24 indexed), routes, production link check |
| GitHub Pages run `31715072246` | PASS |
| Source delta after `011c9fe` | 0 non-docs files (acceptance doc only) |

---

## Deployment

| Item | Value |
|------|-------|
| Release dir | `/var/www/goffice/releases/v1.6.0` (new, immutable) |
| Symlink | `/var/www/goffice/current` → `/var/www/goffice/releases/v1.6.0` (atomic `ln -sfn`) |
| Rollback target | `/var/www/goffice/releases/v1.5.1` (recorded in `goffice2026-stage/rollback-target.txt`) |
| Deploy script | `/home/rae_admin/goffice2026-stage/deploy-v1.6.0.sh` |
| Copy method | tar extract of `dist/` only from staged tarball |
| Excluded | `.git`, `node_modules`, `src`, `docs`, `supabase` |
| Metadata | `/var/www/goffice/releases/v1.6.0/.release-meta` (pages=270) |
| Nginx | **config unchanged**; `nginx -t` + reload only |
| Cloudflare / M365 / data-sync | not modified |

---

## Smoke test (live production)

| Route | Result |
|-------|--------|
| `/` `/en/` `/dashboard/` `/en/dashboard/` `/evidence/` `/en/evidence/` `/knowledge/` `/en/knowledge/` | all **200** |
| Hero WebP TH `/` | ✓ — `Executive Dashboard Hero.webp` referenced |
| Hero WebP EN `/en/` | ✓ |
| Hero WebP asset HTTP | **200** |
| Dashboard + Evidence hero CTAs | ✓ |
| No fake Command Center sparklines | ✓ — `command-center-title` count **0** on landing |
| TH/EN landing reveals | **64 / 64** parity |
| Evidence unavailable state | ✓ — truthful copy present on `/evidence/` |
| Live vs build parity (`index.html` MD5) | **MATCH** (`dist/` vs `/var/www/goffice/releases/v1.6.0`) |

---

## Rollback

```bash
# as root (sudo -s)
bash /home/rae_admin/goffice2026-stage/rollback-v1.6.0.sh
# → current reverts to /var/www/goffice/releases/v1.5.1; nginx -t + reload.
# v1.6.0 release dir is kept (never deleted).
```

Not executed during this release. Rollback target verified present.

---

## Known MINOR backlog (non-blocking)

1. GitHub Actions Node 20 deprecation annotations — P2.
2. 14 pre-existing `astro check` hints — P2.
3. No Lighthouse CLI in repo — LCP improvement not formally measured on production.
4. Unused locale keys retained for rollback.

**Verdict:** `PRODUCTION_SUCCESS` · **Release closed:** `GO_MOTION_V2_PRODUCTION_DEPLOYED`
