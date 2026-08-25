# GOFFICE2026 v1.9.0 — Production Deploy Record

**Deploy status:** `PRODUCTION_SUCCESS`
**Production URL:** https://goffice.mju.ac.th/
**GitHub Pages preview:** https://numtip.github.io/goffice2026/
**Deployed commit (source of truth):** `da3450985784ecce283e0df341532efa06d88905`
**Commit subject:** `feat(cat3): add FY2569 energy and resource measures plan`
**PO approval:** 2026-08-25 (explicit production promotion in session)
**Deployment date:** 2026-08-25 (Asia/Bangkok)
**Deployment timestamp:** 2026-08-25T06:40:35+00:00 (UTC) — deployed_by `rae_admin`
**Previous release:** `v1.8.0` / `1b11c48b5297fe9ac798a16a6a5c760539b48d34` — preserved as rollback target
**Git tag:** none at record time; VPS release label `v1.9.0` only

> **Scope:** Promote GitHub `master` `da34509` after v1.8.0 (`1b11c48` → `da34509`, **27 commits**). Delivers Cat2–Cat7 FY2568 baseline contracts and presentation layers, Cat1 FY2569 overlay, Cat3 FY2569 measures plan, Cat5 semantic action-plan mapping corrections, and platform validation expansion (451 routes, 115 evidence items indexed).

---

## Build (development checkout)

| Item | Value |
|------|-------|
| Source workspace | `/home/rae_admin/goffice2026` |
| Deployed source SHA | `da3450985784ecce283e0df341532efa06d88905` |
| Node (check/build) | v22.23.2 (nvm) |
| Install / Build | `npm ci` · `PUBLIC_SITE_URL=https://goffice.mju.ac.th npm run build` |
| Build output | **452 pages** · **785 files** in `dist/` |
| Stage artifact | `/home/rae_admin/goffice2026-stage/v1.9.0.tar.gz` |
| Artifact sha256 | `65d711e72202815dc5590e91fc7f03b9b38593f4971f4028555b9e6541c5fd4e` |

### Validation gates (all PASS)

| Gate | Result |
|------|--------|
| `git diff --check` | PASS (clean working tree before build) |
| `npm run check` | PASS — 0 errors, 0 warnings, 23 hints (P2, pre-existing) |
| `npm test` | PASS — 335+ tests, 0 failures (Node 22) |
| `npm run build` | PASS — 452 pages, canonical URL `https://goffice.mju.ac.th/` |
| `npm run validate` | PASS — taxonomy (7/24/65), CAT1–CAT7 contracts, evidence (115 indexed), 451 dist routes, production link check |
| GitHub Pages workflow run #32709738356 | PASS — quality → build → deploy @ `da34509` |

---

## Deployment

| Item | Value |
|------|-------|
| Release dir | `/var/www/goffice/releases/v1.9.0` (new, immutable) |
| Symlink | `/var/www/goffice/current` → `/var/www/goffice/releases/v1.9.0` (atomic `ln -sfn` via Docker) |
| Rollback target | `/var/www/goffice/releases/v1.8.0` (recorded in `goffice2026-stage/rollback-target-v1.9.0.txt`) |
| Deploy method | Docker volume mount (Alpine 3.20) — dist extract + symlink; no Nginx config change |
| Copy method | tar extract of `dist/` only from staged tarball |
| Excluded | `.git`, `node_modules`, `src`, `docs`, `supabase` |
| Metadata | `/var/www/goffice/releases/v1.9.0/.release-meta` (pages=452, commit=da34509) |
| Nginx | **config unchanged**; reload not required (static symlink swap) |
| Cloudflare / M365 / data-sync | not modified |

---

## Smoke test (live production)

| Check | Result |
|-------|--------|
| `/` `/en/` `/dashboard/` `/en/dashboard/` `/evidence/` `/en/evidence/` | all **200** |
| `/categories/cat5/` `/en/categories/cat5/` `/categories/cat3/` `/categories/cat6/` `/categories/cat7/` + EN | all **200** |
| `/indicators/5.3.1/` `/indicators/5.4.2/` `/indicators/5.5.2/` + EN | all **200** |
| Cat5 5.3.1 `CONTEXTUAL_NA_PENDING_ASSESSOR` | ✓ present |
| Cat5 5.5.3 `EXPECTED_SOURCE_UNCONFIRMED` | ✓ present (×3) |
| Cat5 5.5.2 unevidenced disclosure | ✓ — `ไม่มีหลักฐาน` shown |
| No local-path leakage | ✓ — 0 matches |
| Live vs build parity (`index.html` MD5) | **MATCH** (`8332036715b7d237b35c8ed8a990d676`) |

---

## Cat5 acceptance (invariants preserved)

| Invariant | Status |
|-----------|--------|
| FY2568 remains historical/frozen baseline | ✓ |
| Never relabel FY2568 facts as FY2569 | ✓ |
| 5.3.1 = `CONTEXTUAL_NA_PENDING_ASSESSOR` | ✓ |
| 5.4.2 / 5.4.3 / 5.5.2 unevidenced percentages disclosed | ✓ |
| 5.5.3-3 = `EXPECTED_SOURCE_UNCONFIRMED` | ✓ |
| FY2569 Cat5 action-plan: 14 mapped + 3 disclosed unmapped | ✓ (validator) |
| 5.4.2 and 5.5.2 not backfilled | ✓ |
| No fabricated PASS/score/evidence | ✓ |

---

## Rollback

```bash
docker run --rm -v /var/www:/var/www alpine:3.20 \
  ln -sfn /var/www/goffice/releases/v1.8.0 /var/www/goffice/current
# v1.9.0 release dir is kept (never deleted).
```

Not executed during this release. Rollback target verified present.

---

## Known gaps (non-blocking, disclosed)

1. Cat7 7.2 advancement — mandatory evidence gap (0 records by design).
2. Cat2 2.2.3 — `MISSING_DEDICATED_EVIDENCE` gap invariant.
3. Cat5 5.4.2 / 5.5.2 — unevidenced percentages remain disclosed, not backfilled.
4. Cat5 5.5.3-3 — `EXPECTED_SOURCE_UNCONFIRMED`.
5. 23 pre-existing `astro check` hints — P2.
6. No Git tag `v1.9.0` at record time — VPS release label only.

**Verdict:** `PRODUCTION_SUCCESS` · **Release closed:** `V1.9.0_PRODUCTION_DEPLOYED`
