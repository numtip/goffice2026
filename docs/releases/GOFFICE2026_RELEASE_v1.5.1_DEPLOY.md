# GOFFICE2026 v1.5.1 — Production Deploy Record

**Deploy status:** `PRODUCTION_SUCCESS`  
**Production URL:** https://goffice.mju.ac.th/  
**GitHub Pages preview:** https://numtip.github.io/goffice2026/  
**Deployed commit (source of truth):** `2bfd7cadebe5c7472205c6316a94ab6e56f547bd`  
**Commit subject:** `fix(engage): uniform card grid and 16:9 visuals`  
**Deployment date:** 2026-08-11 (Asia/Bangkok)  
**Deployment timestamp:** 2026-08-10T18:01:58+00:00 (UTC) — deployed_by `rae_admin`  
**Previous release:** `v1.5.0` / `c7966115c4540bf060e19800b3016119d2fa03f4` — preserved as rollback target  
**Git tag:** none at record time (`git tag --list '*v1.5.1*'` empty); VPS release label `v1.5.1` only

> **Scope note:** This production cutover promotes **2 commits** on `origin/master` after `v1.5.0` (`c796611` → `2bfd7ca`): the **Engage visual system** — 8 PO-approved local WebP visuals (2048×1152, native 16:9), uniform 4-column desktop card grid, bilingual TH/EN copy. `ccd3d4e` (`feat(engage)`) is superseded by `2bfd7ca` (`fix(engage)`); the deployed lineage is exactly `2bfd7ca`.

---

## Build (development checkout)

| Item | Value |
|------|-------|
| Source workspace | `/home/rae_admin/goffice2026` |
| HEAD at deploy | `2bfd7cadebe5c7472205c6316a94ab6e56f547bd` |
| Node (check/build) | v20.19.5 (nvm, per production runbook) |
| Install / Build | `npm ci` · `PUBLIC_SITE_URL=https://goffice.mju.ac.th npm run build` |
| Build output | **254 pages** · **324 files** in `dist/` |
| Stage artifact | `/home/rae_admin/goffice2026-stage/v1.5.1.tar.gz` |
| Artifact sha256 | `9dce853ae4800f475fe5f0192739a84178f82dabd5cce0af4206958e3d237842` |

### Validation gates (all PASS)

| Gate | Result |
|------|--------|
| `npm run check` | PASS — 0 errors, 0 warnings (11 hints, P2) |
| `npm run build` | PASS — 254 pages, canonical URL `https://goffice.mju.ac.th/` |
| `npm run validate` | PASS — taxonomy (7/24/65), evidence (24 indexed), routes (253 in dist), production link check |
| `git diff --check` | clean (tracked tree) |
| GitHub Actions Pages run `31413926194` | PASS — quality/build/deploy ✓ (Node 20 deprecation annotations only = P2) |

---

## Deployment

| Item | Value |
|------|-------|
| Release dir | `/var/www/goffice/releases/v1.5.1` (new, immutable) |
| Symlink | `/var/www/goffice/current` → `/var/www/goffice/releases/v1.5.1` (atomic `ln -sfn`) |
| Rollback target | `/var/www/goffice/releases/v1.5.0` (recorded in `goffice2026-stage/rollback-target.txt`) |
| Deploy script | `/home/rae_admin/goffice2026-stage/deploy-v1.5.1.sh` (modeled on `deploy-v1.5.0.sh`) |
| Copy method | tar extract of `dist/` only from staged tarball |
| Excluded | `.git`, `node_modules`, `src`, `docs`, `supabase` — **Supabase NOT deployed** |
| Metadata | `/var/www/goffice/releases/v1.5.1/.release-meta` (pages=254) |
| Nginx | **config unchanged** (vhost mtime 2026-07-20); `nginx -t` + reload only |
| Cloudflare | not modified |
| Data-sync / Excel sources | not modified |

---

## Commit range deployed (`c796611..2bfd7ca`)

| SHA | Summary |
|-----|---------|
| `ccd3d4e` | feat(engage): add visual system section *(superseded by `2bfd7ca`)* |
| `2bfd7ca` | fix(engage): uniform card grid and 16:9 visuals |

Source diff (non-docs): `public/images/engage/2026/*.webp` (8× WebP), `src/components/landing/EngageVisualSection.astro`, `src/data/engageVisuals.ts`, `LandingPage.astro`, `locales th/en`, `i18n/dictionary.ts`, `README.md`.

---

## Smoke test (live production)

| Route | Result |
|-------|--------|
| `/` `/en/` `/dashboard/` `/evidence/` `/indicators/` `/documents/` `/about/` | all 200 |
| Engage TH `/` | 8/8 images, 8× `lg:col-span-3` (uniform 4-col), 8× `aspect-[16/9]`, 0 placeholders, heading “8 วิถีปฏิบัติ Green Office ในสำนักงาน” |
| Engage EN `/en/` | 8/8 images, 8× `lg:col-span-3`, 8× `aspect-[16/9]`, 0 placeholders, heading “Eight Green Practices in the Office” |
| Asset dims | all 8 WebP 2048×1152 (native 16:9 — no crop, no letterbox) |
| Evidence unavailable-state | “ไฟล์ต้นฉบับไม่อยู่ในระบบ” present on `/evidence/` and `/evidence/?indicator=3.2.2` — unchanged from v1.5.0 |
| Live vs build parity (`index.html` MD5) | MATCH (`dist/` vs `/var/www/goffice/current`) |
| `_astro` asset refs (homepage) | parity MATCH vs `dist/` |

---

## Rollback

```bash
# as root (sudo -s)
bash /home/rae_admin/goffice2026-stage/rollback-v1.5.1.sh
# → current reverts to /var/www/goffice/releases/v1.5.0; nginx -t + reload if script used with sudo.
# v1.5.1 release dir is kept (never deleted).
```

Not executed during this release. Rollback target verified present (316 files, commit `c796611`).

---

## Parity

| Location | SHA / path |
|----------|------------|
| GitHub `origin/master` (at deploy) | `2bfd7cadebe5c7472205c6316a94ab6e56f547bd` |
| Local `master` HEAD (at deploy) | `2bfd7cadebe5c7472205c6316a94ab6e56f547bd` |
| Deployed (`.release-meta`) | `2bfd7cadebe5c7472205c6316a94ab6e56f547bd` |
| Active symlink | `/var/www/goffice/current` → `v1.5.1` |

---

## Known P2 issues (non-blocking)

1. GitHub Actions Node 20 deprecation annotations (`actions/checkout`, `setup-node`, `deploy-pages`, etc. forced to Node 24) — no failure; action upgrade tracked separately.
2. `astro check` 11 hints (e.g. `yearLabel` unused in `src/utils/chart-option.ts:512`, inline-script `is:inline` hint) — 0 errors / 0 warnings.

**Verdict:** `PRODUCTION_SUCCESS` · **Release closed:** `RELEASE_CLOSED` (documentation record 2026-08-11)
