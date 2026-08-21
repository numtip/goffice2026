# GOFFICE2026 v1.8.0 — Production Deploy Record

**Deploy status:** `PRODUCTION_SUCCESS`
**Production URL:** https://goffice.mju.ac.th/
**GitHub Pages preview:** https://numtip.github.io/goffice2026/
**Deployed commit (source of truth):** `1b11c48b5297fe9ac798a16a6a5c760539b48d34`
**Commit subject:** `feat(cat1): polish Category 1 presentation + add playbook for categories 2-7`
**PO approval:** 2026-08-21 (explicit production approval in session)
**Deployment date:** 2026-08-21 (Asia/Bangkok)
**Deployment timestamp:** 2026-08-21T06:25:04+00:00 (UTC) — deployed_by `rae_admin`
**Previous release:** `v1.7.0` / `380bf3bd7060585555d5ac7104693a84f0176f70` — preserved as rollback target
**Git tag:** none at record time; VPS release label `v1.8.0` only

> **Scope:** Promote GitHub `master` `1b11c48` after v1.7.0 CAT1 FY2568 freeze (`380bf3b` → `1b11c48`, **2 commits**). Delivers the cinematic Green Office hero (H1.5) and Category 1 presentation polish with a playbook for categories 2–7.

---

## Build (development checkout)

| Item | Value |
|------|-------|
| Source workspace | `/home/rae_admin/goffice2026` |
| Deployed source SHA | `1b11c48b5297fe9ac798a16a6a5c760539b48d34` |
| Node (check/build) | v20.19.5 (nvm) |
| Install / Build | `npm ci` · `PUBLIC_SITE_URL=https://goffice.mju.ac.th npm run build` |
| Build output | **272 pages** · **593 files** in `dist/` |
| Stage artifact | `/home/rae_admin/goffice2026-stage/v1.8.0.tar.gz` (762M) |
| Artifact sha256 | `ff50dd9bcbc2198f5d78ba955265b51ecc18dd02363485a91dd612de7aaf84e0` |

### Validation gates (all PASS)

| Gate | Result |
|------|--------|
| `git diff --check` | PASS (clean working tree before build) |
| `npm run check` | PASS — 0 errors, 0 warnings, 16 hints (P2, pre-existing) |
| `npm test` | PASS — 216 tests, 0 failures (`NODE_OPTIONS='--import tsx'` on Node 20; plain-Node 20 lacks `.ts` type-stripping for 3 dashboard/evidence tests, which pass on Node 22) |
| `npm run build` | PASS — 272 pages, canonical URL `https://goffice.mju.ac.th/` |
| `npm run validate` | PASS — taxonomy (7/24/65), CAT1 9 contracts, evidence (25 indexed), 271 dist routes, production link check |
| Preview `qa:routes` | PASS — 60/60 |
| `qa:seo` | PASS — robots/sitemap/canonical/hreflang/OG/manifest/noindex all OK |
| Hero media budget | PASS — MP4 6,596,107 bytes (< 10 MB hard cap) |
| Hero runtime contract | PASS — poster `eager` + `fetchpriority="high"` in HTML; video `data-src` + `preload="none"` (JS-gated) |

---

## Deployment

| Item | Value |
|------|-------|
| Release dir | `/var/www/goffice/releases/v1.8.0` (new, immutable) |
| Symlink | `/var/www/goffice/current` → `/var/www/goffice/releases/v1.8.0` (atomic `ln -sfn`) |
| Rollback target | `/var/www/goffice/releases/v1.7.0` (recorded in `goffice2026-stage/rollback-target.txt`) |
| Deploy script | `/home/rae_admin/goffice2026-stage/deploy-v1.8.0.sh` |
| Copy method | tar extract of `dist/` only from staged tarball |
| Excluded | `.git`, `node_modules`, `src`, `docs`, `supabase` |
| Metadata | `/var/www/goffice/releases/v1.8.0/.release-meta` (pages=272, commit=1b11c48) |
| Nginx | **config unchanged**; `nginx -t` + reload only |
| Cloudflare / M365 / data-sync | not modified |

---

## Smoke test (live production)

| Check | Result |
|-------|--------|
| `/` `/en/` `/dashboard/` `/en/dashboard/` `/evidence/` `/en/evidence/` `/knowledge/` `/en/knowledge/` | all **200** |
| `/about/committee/` `/en/about/committee/` `/about/scope/` `/about/policy/` `/about/goals/` `/about/action-plan/` | all **200** |
| `/indicators/1.1.1/` … `/indicators/1.7.2/` + `/en/indicators/1.1.1/` `/categories/cat1/` `/documents/` | all **200** |
| FY2568 marker on `/about/committee/` | ✓ — count ≥ 1 |
| Cinematic hero poster WebP on `/` | ✓ — `green-office-building-hero-1920.webp` present |
| Hero cinematic MP4 served | ✓ — HTTP **200** |
| No fake Command Center sparklines | ✓ — `command-center-title` count **0** |
| Evidence unavailable state | ✓ |
| Health check (all routes + TLS + disk) | PASS — TLS expiry 2027-01-02, disk 47% |
| Live vs build parity (`index.html` MD5) | **MATCH** (`046922577f6b15fda671c397058f3114`) |

---

## Rollback

```bash
# as root (sudo -s)
bash /home/rae_admin/goffice2026-stage/rollback-v1.8.0.sh
# → current reverts to /var/www/goffice/releases/v1.7.0; nginx -t + reload.
# v1.8.0 release dir is kept (never deleted).
```

Not executed during this release. Rollback target verified present.

---

## Known MINOR backlog (non-blocking)

1. GitHub Actions Node 20 deprecation annotations — P2.
2. 16 pre-existing `astro check` hints — P2.
3. No Git tag `v1.8.0` at record time — VPS release label only (matches v1.7.0 pattern).
4. 3 tests (`test-chart-option`, `test-evidence-indicator-foundation`, `test-partial-yoy`) import `.ts` directly and need Node 22+ type-stripping or the `tsx` loader on Node 20 — covered by the repo's documented `NODE_OPTIONS='--import tsx'` convention.

**Verdict:** `PRODUCTION_SUCCESS` · **Release closed:** `V1.8.0_PRODUCTION_DEPLOYED`
