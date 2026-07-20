# GOFFICE2026 Release v1.1.2

**Release status:** RELEASED (production)  
**Production URL:** https://goffice.mju.ac.th/  
**Release tag:** `v1.1.2`  
**Release commit:** `8030a4e0a37a1ed3c07a576ed9400b7b2aac4e08`  
**Canonical branch:** `master` (documentation only post-tag — not deployed)  
**Deployment timestamp:** 2026-07-20T04:33:45+00:00 (UTC)

---

## Summary

v1.1.2 is a **hardening patch**: bilingual 404, dashboard category mapping fixes, unified data-status resolver, partial-year YoY guard, CI quality gates, dead code cleanup.

**Proof:** Production built from tag `v1.1.2` at commit `8030a4e` in isolated worktree. Tag not moved.

---

## Build (isolated worktree)

| Item | Value |
|------|-------|
| Source worktree | `/home/rae_admin/goffice2026-release-v1.1.2` |
| Node | v20.19.5 |
| Install | `npm ci` |
| Build | `PUBLIC_SITE_URL=https://goffice.mju.ac.th npm run build` |
| Build output | 226 pages |
| Build SHA | `8030a4e` |

### Validation (worktree)

| Command | Result |
|---------|--------|
| `npm run check` | PASS (0 errors) |
| `npm test` | PASS (13/13) |
| `GHP_BASE= npm run validate` | PASS |
| `npm run qa:seo` | PASS (25 checks) |

---

## Production deployment

| Item | Value |
|------|-------|
| Previous release | `/var/www/goffice/releases/v1.1.1` |
| Target release | `/var/www/goffice/releases/v1.1.2` |
| Active release | `/var/www/goffice/releases/v1.1.2` |
| Symlink | `/var/www/goffice/current` → `v1.1.2` |
| Deploy method | `rsync -a --delete` (via docker volume mount) |
| Excluded | `.git`, `node_modules`, `src`, `docs` |
| Metadata | `/var/www/goffice/releases/v1.1.2/.release-meta` |
| Nginx config | Unchanged — reload not required |

---

## Runtime QA (production)

| Check | Result |
|-------|--------|
| `/`, `/en/` | 200 |
| `/en/404/` | 200 (English content) |
| `/404.html` | 200 |
| Dashboards (6 metrics) | 200 |
| Categories / indicators | 200 |
| Evidence / documents / search | 200 |
| SEO (canonical, hreflang) | PASS |
| PWA manifest / favicon | 200 |
| CSS assets (`/_astro/*`) | 200 |
| Health script | PASS |
| Missing route | 404 |

---

## Rollback

**Preserved:** `/var/www/goffice/releases/v1.1.1`

```bash
docker run --rm -v /var/www:/var/www alpine:3.20 \
  ln -sfn /var/www/goffice/releases/v1.1.1 /var/www/goffice/current
```

Not executed during this release.

---

## Known limitations (deferred)

- 17/21 evidence items unresolved (v1.2.0)
- Runbook page-count drift
- EN dashboard strings inline (not locale JSON)

---

## Git

Tag `v1.1.2` remains at `8030a4e`. This freeze document is a post-tag commit on `master`.

**Verdict:** `RELEASED`
