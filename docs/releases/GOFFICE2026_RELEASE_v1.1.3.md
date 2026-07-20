# GOFFICE2026 Release v1.1.3

**Release status:** RELEASED (production)  
**Production URL:** https://goffice.mju.ac.th/  
**Release tag:** `v1.1.3`  
**Release commit:** `df06179f87b48b085fb561dd49b2cd766b45fdc0`  
**Canonical branch:** `master` (documentation only post-tag — not deployed)  
**Deployment timestamp:** 2026-07-20T05:00:00+00:00 (UTC)

---

## Summary

v1.1.3 is a **logo hotfix**: replaces the interim `GO` badge with the official Green Office logo (`LogoGreen2025.png`) across header navigation, favicon, PWA icons, and OG default image.

**Proof:** Production built from tag `v1.1.3` at commit `df06179` in isolated worktree. Tags `v1.1.2` and `v1.1.3` not moved.

---

## Build (isolated worktree)

| Item | Value |
|------|-------|
| Source worktree | `/home/rae_admin/goffice2026-release-v1.1.3` |
| Node | v20.19.5 |
| Install | `npm ci` |
| Build | `PUBLIC_SITE_URL=https://goffice.mju.ac.th npm run build` |
| Build output | 226 pages |
| Build SHA | `df06179` |

### Validation (worktree)

| Command | Result |
|---------|--------|
| `npm run check` | PASS (0 errors) |
| `npm test` | PASS (13/13) |
| `GHP_BASE= npm run validate` | PASS |
| `npm run qa:seo` | PASS |
| `npm run qa:links` | PASS |
| `npm run qa:routes` | PASS (34/34) |

---

## Production deployment

| Item | Value |
|------|-------|
| Previous release | `/var/www/goffice/releases/v1.1.2` |
| Target release | `/var/www/goffice/releases/v1.1.3` |
| Active release | `/var/www/goffice/releases/v1.1.3` |
| Symlink | `/var/www/goffice/current` → `v1.1.3` |
| Deploy method | `cp -a` via docker volume mount (Alpine apk/rsync unavailable) |
| Excluded | `.git`, `node_modules`, `src`, `docs` |
| Metadata | `/var/www/goffice/releases/v1.1.3/.release-meta` |
| Nginx config | Unchanged — reload not required |

---

## Runtime QA (production)

| Check | Result |
|-------|--------|
| Header logo TH `/` | `LogoGreen2025.png` (no GO badge) |
| Header logo EN `/en/` | `LogoGreen2025.png` |
| Mobile (iPhone UA) TH/EN | `LogoGreen2025.png` |
| `/images/LogoGreen2025.png` | 200 |
| Favicon `.ico` / `.svg` | 200 |
| `manifest.webmanifest` | 200 |
| PWA icons (`/icons/*`) | 200 |
| OG image | `https://goffice.mju.ac.th/images/og-default.png` — 200 |
| CSS assets (`/_astro/*`) | 200 |
| Cache-bust fetch | Logo visible |
| Health script | PASS |
| `/`, `/en/` | 200 |

---

## Rollback

**Preserved:** `/var/www/goffice/releases/v1.1.2` (and v1.1.1, v1.1.0)

```bash
docker run --rm -v /var/www:/var/www alpine:3.20 \
  ln -sfn /var/www/goffice/releases/v1.1.2 /var/www/goffice/current
```

Not executed during this release.

---

## Git

Tag `v1.1.3` remains at `df06179`. Tag `v1.1.2` remains at `8030a4e`. This freeze document is a post-tag commit on `master`.

**Verdict:** `RELEASED`
