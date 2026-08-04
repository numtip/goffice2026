# GOFFICE2026 v1.2.0 — Production Deploy Record

**Deploy status:** PRODUCTION_SUCCESS
**Production URL:** https://goffice.mju.ac.th/
**Deploy tag:** `v1.2.0` (annotated, pushed → `934e960`)
**Deployed commit:** `934e96075544c131024ba4ef1bd99949e187beb6`
**Deployment timestamp:** 2026-08-02T06:35:26+00:00 (UTC) — deployed_by `rae_admin`
**Previous release:** `v1.1.3` (`df06179`) — preserved as rollback target

> Note: this is the **production deploy record** for v1.2.0. The repository-level
> milestone doc `GOFFICE2026_RELEASE_v1.2.0.md` (Evidence Platform Foundation,
> 2026-07-20) remains unchanged.

---

## Build (isolated worktree)

| Item | Value |
|------|-------|
| Source worktree | `/home/rae_admin/goffice2026-release-v1.2.0` |
| Node | v20.19.5 |
| Install / Build | `npm ci` · `PUBLIC_SITE_URL=https://goffice.mju.ac.th npm run build` |
| Build output | **252 pages** (v1.1.3 was 226) |

### Validation gates (all PASS)

| Gate | Result |
|------|--------|
| `npm run check` | 0 errors, 0 warnings |
| `npm test` | 18/18 |
| `npm run validate` | PASS (7 categories / 24 issues / 65 indicators / 24 evidence) |
| `npm run qa:seo` | PASS |
| `npm run qa:links` | PASS (4232 unique links / 10372 hrefs) |
| `npm run qa:routes` | PASS (34/34) |

---

## Deployment

| Item | Value |
|------|-------|
| Release dir | `/var/www/goffice/releases/v1.2.0` (new, immutable) |
| Symlink | `/var/www/goffice/current` → `v1.2.0` (atomic `ln -sfn`) |
| Rollback target | `/var/www/goffice/releases/v1.1.3` (recorded in `rollback-target.txt`) |
| Copy method | tar extract of `dist/` only (561 files) |
| Excluded | `.git`, `node_modules`, `src`, `docs`, `supabase` — **Supabase NOT deployed** |
| Metadata | `releases/v1.2.0/.release-meta` (pages=252) |
| Nginx | config unchanged; `nginx -t` PASS; `systemctl reload` only |
| Docker | inspection only — no restart/stop/remove |

---

## Smoke test (live production)

| Route / asset | Result |
|---------------|--------|
| `/` `/en/` `/dashboard/` | 200 |
| 6 dashboards TH: energy/fuel/ghg/paper/waste/water | 200 |
| 6 dashboards EN (same) | 200 |
| `/categories/` `/evidence/` `/documents/` `/search/` | 200 |
| `/about/` `/about/feedback/` + EN pair | 200 |
| `/sitemap-index.xml` `/robots.txt` `/favicon.ico` `/favicon.svg` `/manifest.webmanifest` | 200 |
| Assets: `og-default.png` `icons/icon-192|512.png` `LogoGreen2025.png` | 200 |
| Joomla mixed routing `/administrator/*` | 404 (blocked) |
| Live vs dist parity (MD5 of /, /dashboard/, /en/, /about/feedback/) | MATCH |
| Nginx error log post-deploy | 0 new errors |

**Route notes:** dashboards are energy/fuel/ghg/paper/waste/water (not air/health/climate);
feedback lives at `/about/feedback/` (not `/feedback/`).

---

## Rollback

```bash
# as root (sudo -s)
bash /home/rae_admin/goffice2026-stage/rollback-v1.2.0.sh
# → current reverts to /var/www/goffice/releases/v1.1.3; nginx -t + reload.
# v1.2.0 release dir is kept (never deleted).
```

Not executed during this release.

---

## Parity

| Location | SHA |
|----------|-----|
| Local `master` HEAD | `934e96075544c131024ba4ef1bd99949e187beb6` |
| Origin `master` HEAD | `934e96075544c131024ba4ef1bd99949e187beb6` |
| Deployed (`.release-meta`) | `934e96075544c131024ba4ef1bd99949e187beb6` |
| Tag `v1.2.0` (annotated, pushed) | `beccb67121132e31d481fc0442e9b4abab148a60` → `934e960` |

**Verdict:** `PRODUCTION_SUCCESS`
