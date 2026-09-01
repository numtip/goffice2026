# GOFFICE2026 v1.11.0 — Production Deploy Record

**Deploy status:** `PRODUCTION_SUCCESS`  
**Production URL:** https://goffice.mju.ac.th/  
**GitHub Pages preview:** https://numtip.github.io/goffice2026/  
**Deployed commit (source of truth):** `e7b68282da2053c9f610dbc6f6a74a5fbf764a31`  
**Commit subject:** Merge pull request #35 from numtip/dependabot/npm_and_yarn/astrojs/check-0.9.10  
**Deployment date:** 2026-09-01 (Asia/Bangkok)  
**Deployment timestamp:** 2026-09-01T08:41:58+00:00 (UTC) — deployed_by `rae_admin`  
**Previous release:** `v1.10.0` / `400105b8236a8fa4ec4e984ca46d748b47987fa4` — preserved as rollback target  
**Git tag:** none; VPS release label `v1.11.0` only

> **Scope:** Promote GitHub `master` `e7b6828` after v1.10.0 (`400105b` → `e7b6828`). Delivers authoritative FY2569 GHG workbook adoption, FY2568 GHG baseline update2, Cat1 FY2569 owner status alignment, Cat2 FY2569 owner approvals, FY2569 Cat1–Cat3 incremental progress, FY2569 primary presentation and evidence truthfulness fixes, and dependency/CI maintenance merges. No source commit or push during VPS deploy.

---

## Pre-production gate

| Check | Result |
|-------|--------|
| `origin/master` == accepted SHA `e7b6828` | ✓ PASS |
| Production not advanced beyond accepted SHA | ✓ PASS (was `v1.10.0` @ `400105b`) |
| Working tree clean at build | ✓ PASS |
| Build | ✓ PASS — **539 routes** |
| Validate | ✓ PASS |
| Check | ✓ PASS — 0 errors / 0 warnings |
| Tests | ✓ PASS — 32/32 |

| Item | Value |
|------|-------|
| Accepted SHA | `e7b68282da2053c9f610dbc6f6a74a5fbf764a31` |
| Pre-deploy production SHA | `400105b8236a8fa4ec4e984ca46d748b47987fa4` (`v1.10.0`) |
| Rollback target | `/var/www/goffice/releases/v1.10.0` |

---

## Build (development checkout)

| Item | Value |
|------|-------|
| Source workspace | `/home/rae_admin/goffice2026` |
| Deployed source SHA | `e7b68282da2053c9f610dbc6f6a74a5fbf764a31` |
| Build output | **539 pages** in `dist/` |
| Stage deploy log | `/home/rae_admin/goffice2026-stage/deploy-v1.11.0.log` |
| Artifact sha256 | `b4b2ad91c81bea2742484c01bfbd17ec14bec90989754a38f62d5bc52345dd9e` |

### Validation gates (all PASS)

| Gate | Result |
|------|--------|
| `npm run build` | PASS — 539 routes |
| `npm run validate` | PASS |
| `npm run check` | PASS — 0 errors / 0 warnings |
| `npm test` | PASS — 32/32 |
| Git working tree | PASS — clean @ `e7b6828` |

---

## Deployment

| Item | Value |
|------|-------|
| Release dir | `/var/www/goffice/releases/v1.11.0` (immutable) |
| Symlink | `/var/www/goffice/current` → `/var/www/goffice/releases/v1.11.0` |
| Rollback record | `/home/rae_admin/goffice2026-stage/rollback-target-v1.11.0.txt` |
| Metadata | `/var/www/goffice/releases/v1.11.0/.release-meta` |
| Nginx | **config unchanged**; reload skipped (static cutover) |
| Nginx `-t` | **not executed** — privilege limitation (sudo required); live routes confirmed serving |

---

## Smoke test (live production)

| Route | Result |
|-------|--------|
| `/` | **200** |
| `/dashboard/` | **200** |
| `/dashboard/ghg/` | **200** |
| `/categories/cat1/` | **200** |
| `/indicators/1.5.1/` | **200** |
| `/indicators/1.5.2/` | **200** |
| `/activities/` | **200** |
| `/evidence/` | **200** |
| `/en/` | **200** |

**Smoke verdict:** all **PASS**

---

## GHG verification (live production)

| Check | Expected | Result |
|-------|----------|--------|
| FY2569 value | 144.8 / display 145 | ✓ PASS |
| FY2569 progress | 7/12 | ✓ PASS |
| FY2568 baseline | 222.68 / display 223 | ✓ PASS |
| Indicator 1.5.1 kind | partial | ✓ PASS |

**GHG verdict:** **PASS**

---

## Rollback

```bash
docker run --rm -v /var/www:/var/www alpine:3.20 \
  ln -sfn /var/www/goffice/releases/v1.10.0 /var/www/goffice/current
```

Not executed. Rollback target `v1.10.0` verified present.

---

## Closeout verification (2026-09-01)

| Check | Result |
|-------|--------|
| Live `current` → `v1.11.0` | ✓ PASS |
| `.release-meta` matches deployed SHA, pages, artifact | ✓ PASS |
| Deploy log present | ✓ PASS |
| Rollback record present | ✓ PASS |
| No rollback performed | ✓ confirmed |
| No source commit/push during deploy | ✓ confirmed |

**Verdict:** `PRODUCTION_SUCCESS` · **Release closed:** `V1.11.0_PRODUCTION_RELEASE_CLOSED`
