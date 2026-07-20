# GOFFICE2026 Release v1.1.1

**Release status:** RELEASED (production)  
**Production URL:** https://goffice.mju.ac.th/  
**Release tag:** `v1.1.1`  
**Release commit:** `1c73215f5048fc77ae3e5c51b4cb168e143d5275`  
**Canonical branch:** `master`  
**Master HEAD at deployment time:** `a20fe1d` (documentation only — not deployed)  
**GitHub operator:** `numtip`  
**Deployment timestamp:** 2026-07-20T04:12:53+00:00 (UTC)

---

## Summary

v1.1.1 adds **production metadata, SEO, PWA baseline, and custom 404** without changing URLs, routing, UI design, or business logic.

**Proof:** Production v1.1.1 was built from tag `v1.1.1` at commit `1c73215`. The deployed artifact does not include post-tag documentation commits on `master`.

---

## Build (isolated worktree)

| Item | Value |
|------|-------|
| Source worktree | `/home/rae_admin/goffice2026-release-v1.1.1` |
| Node | v20.19.5 |
| npm | 10.8.2 |
| Package manager | npm (`package-lock.json`) |
| Install command | `npm ci` |
| Build command | `PUBLIC_SITE_URL=https://goffice.mju.ac.th npm run build` |
| Build duration | ~7.5s (225 pages) |
| Build output | `dist/` |
| Release SHA recorded | `1c73215` in `/var/www/goffice/releases/v1.1.1/.release-meta` |

### Validation commands

| Command | Result |
|---------|--------|
| `npm run check` | PASS (0 errors) |
| `npm run validate` | PASS (taxonomy, evidence, routes) |
| `npm run qa:seo` | PASS |
| `GHP_BASE= node scripts/check-production-links.mjs` | 1 known issue (`/en/404/` href target missing) |
| `PREVIEW_BASE_URL=http://127.0.0.1:8765 node scripts/smoke-routes.mjs` | PASS 32/32 routes |

---

## Production deployment

| Item | Value |
|------|-------|
| Previous release | `/var/www/goffice/releases/v1.1.0` |
| Target release | `/var/www/goffice/releases/v1.1.1` |
| Active release | `/var/www/goffice/releases/v1.1.1` |
| Production path (symlink) | `/var/www/goffice/current` → `v1.1.1` |
| Nginx root | `/var/www/goffice/current` |
| Switch method | Atomic symlink (`ln -sfn`) |
| Ownership | `www-data:www-data` (33:33) |
| Nginx validation | Not re-run (static symlink swap; config unchanged) |
| Nginx reload | Not required (existing runbook) |

Deploy pattern:

```bash
# Build from tag worktree, then:
docker run --rm -v /var/www:/var/www -v $DIST:/src:ro alpine:3.20 \
  cp -a /src/. /var/www/goffice/releases/v1.1.1/
docker run --rm -v /var/www:/var/www alpine:3.20 \
  ln -sfn /var/www/goffice/releases/v1.1.1 /var/www/goffice/current
```

---

## Runtime QA (production)

| Check | Result |
|-------|--------|
| Homepage `/` | 200 |
| Thai homepage | 200 |
| English `/en/` | 200 |
| Dashboard `/dashboard/` | 200 |
| Metric dashboards | 200 (`/dashboard/energy/`) |
| Categories | 200 |
| Indicators | 200 (`/indicators/1.1.1/`) |
| Evidence | 200 |
| Documents | 200 |
| Search | 200 |
| Desktop header navigation | Present in HTML (nav links render) |
| Mobile header / language switch | Language toggle links present |
| Thai/English switch | hreflang + `/en/` routes 200 |
| SEO title / canonical / OG | Verified on `/` |
| PWA manifest / favicon | 200 (`/manifest.webmanifest`, `/favicon.ico`) |
| Service worker | Not enabled (by design) |
| Static assets (CSS) | 200 (`/_astro/*.css`) |
| Broken links (static crawl) | 1 known: `/en/404/` page not built |
| Console errors | Not automated; static deploy |
| Nginx errors post-cutover | No new errors at cutover time |
| Health script | PASS (`ops/prod2/health-check.sh`) |

---

## Rollback

**Previous release preserved:** `/var/www/goffice/releases/v1.1.0` (intact)

```bash
docker run --rm -v /var/www:/var/www alpine:3.20 \
  ln -sfn /var/www/goffice/releases/v1.1.0 /var/www/goffice/current
sudo nginx -t && sudo systemctl reload nginx   # reload optional for static swap
```

---

## Features

### SEO
- Dynamic `robots.txt` with sitemap reference
- `@astrojs/sitemap` (sitemap-index.xml)
- Canonical URLs, hreflang (th / en / x-default)

### Metadata
- Open Graph and Twitter Card tags
- Central config: `src/config/site-meta.ts`

### PWA
- `manifest.webmanifest`, favicons, apple-touch-icon
- **No Service Worker** (by design)

### 404
- Custom localized `404.html` with `noindex`

---

## Known limitations

1. `/en/404/` route referenced in hreflang but not built — returns 404 (Thai `/404.html` works).
2. OG default image is SVG — some social crawlers prefer PNG/JPG.
3. `@astrojs/sitemap` pinned at 3.2.1 (Astro 4 compatibility).
4. GitHub Pages preview badge unchanged on preview host only.

---

## Reports

| Report | Path |
|--------|------|
| SEO | `docs/reports/SEO_REPORT.md` |
| Metadata | `docs/reports/METADATA_REPORT.md` |
| PWA | `docs/reports/PWA_REPORT.md` |
| Accessibility | `docs/reports/ACCESSIBILITY_REPORT.md` |
| QA | `docs/reports/QA_REPORT.md` |
| Preflight | `docs/releases/GOFFICE2026_RELEASE_PREFLIGHT.md` |

---

## Git

Tag `v1.1.1` remains at `1c73215`. Production documentation freeze is a separate commit on `master`.

**Verdict:** `RELEASED` — production runtime QA passed.
