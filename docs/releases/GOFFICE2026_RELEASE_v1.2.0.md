# GOFFICE2026 Release v1.2.0

**Release status:** RELEASED (production)
**Production URL:** https://goffice.mju.ac.th/
**Release tag:** `v1.2.0` (annotated, pushed)
**Release commit:** `934e96075544c131024ba4ef1bd99949e187beb6`
**Canonical branch:** `master`
**Deployment timestamp:** 2026-08-02T06:35:26+00:00 (UTC) — deployed_by `rae_admin`

---

## Summary

v1.2.0 is the **RC-1 candidate** release: closes broken evidence source links,
ships FY2569 data baseline with provenance/pending states, bilingual (TH/EN)
resource dashboards (6), and full about/feedback coverage.

**Proof:** Production built from tag `v1.2.0` at commit `934e960` in isolated worktree.

---

## Build (isolated worktree)

| Item | Value |
|------|-------|
| Source worktree | `/home/rae_admin/goffice2026-release-v1.2.0` |
| Node | v20.19.5 |
| Install | `npm ci` |
| Build | `PUBLIC_SITE_URL=https://goffice.mju.ac.th npm run build` |
| Build output | **252 pages** (v1.1.3 was 226) |

### Validation (worktree)

| Command | Result |
|---------|--------|
| `npm run check` | PASS (0 errors, 0 warnings) |
| `npm test` | PASS (18/18) |
| `npm run validate` | PASS (7 categories / 24 issues / 65 indicators / 24 evidence) |
| `npm run qa:seo` | PASS |
| `npm run qa:links` | PASS (4232 unique internal links, 10372 hrefs) |
| `npm run qa:routes` | PASS (34/34) |

---

## Production deployment

| Item | Value |
|------|-------|
| Previous release | `/var/www/goffice/releases/v1.1.3` |
| Target release | `/var/www/goffice/releases/v1.2.0` |
| Active release | `/var/www/goffice/releases/v1.2.0` |
| Symlink | `/var/www/goffice/current` → `v1.2.0` |
| Deploy method | tar extract of `dist/` only (561 files) via root deploy script |
| Excluded | `.git`, `node_modules`, `src`, `docs`, `supabase` (not deployed) |
| Metadata | `/var/www/goffice/releases/v1.2.0/.release-meta` |
| Nginx config | Unchanged (root → `current`) — `nginx -t` PASS + `reload` only |
| Docker | Inspection only — no restart/stop/remove |

---

## Runtime QA (production smoke — all PASS)

| Check | Result |
|-------|--------|
| `/` `/en/` `/dashboard/` | 200 |
| Resource dashboards (6) TH: energy/fuel/ghg/paper/waste/water | 200 |
| Resource dashboards EN (same 6) | 200 |
| `/categories/` `/evidence/` `/documents/` `/search/` | 200 |
| `/about/` `/about/feedback/` + `/en/about/` `/en/about/feedback/` | 200 |
| `/sitemap-index.xml` `/robots.txt` | 200 |
| `/favicon.ico` `/favicon.svg` `/manifest.webmanifest` | 200 |
| Assets: og-default.png, icons 192/512, LogoGreen2025.png | 200 |
| Joomla mixed routing (`/administrator/*`) | 404 (blocked) |
| Live vs dist content parity (MD5) | MATCH (/, dashboard, en, about/feedback) |
| Nginx error log after deploy | 0 new errors |

**Note:** `/dashboard/air|health|climate/` and `/feedback/` are NOT routes in this
candidate (dashboards are energy/fuel/ghg/paper/waste/water; feedback lives under
`/about/feedback/`). Tested the correct routes — all 200.

---

## Rollback

**Target recorded:** `/var/www/goffice/releases/v1.1.3` (`.release-meta`: commit `df06179`)

```bash
bash /home/rae_admin/goffice2026-stage/rollback-v1.2.0.sh   # as root
# reverts current → v1.1.3, nginx -t + reload. v1.2.0 kept (not deleted).
```

Not executed during this release.

---

## Git & Parity

| Location | SHA |
|----------|-----|
| Local `master` HEAD | `934e96075544c131024ba4ef1bd99949e187beb6` |
| Origin `master` HEAD | `934e96075544c131024ba4ef1bd99949e187beb6` |
| Deployed (`.release-meta`) | `934e96075544c131024ba4ef1bd99949e187beb6` |
| Tag `v1.2.0` | annotated → `934e960` (pushed) |

**Verdict:** `PRODUCTION_SUCCESS`
