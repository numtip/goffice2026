# GitHub Pages Preview Setup Report

**Date:** 2026-06-26  
**Project:** Green Office Platform (`goffice2026`)  
**Branch:** `master`  
**Status:** Preview deployment finalized — production unchanged

---

## Objective

Enable **GitHub Pages as preview only**. Production remains on manual VPS deployment at `greenoffice.mju.ac.th`. No DNS, VPS, or production changes were made.

## Architecture (Locked)

```text
GitHub → GitHub Actions → GitHub Pages (Preview) → Manual VPS → greenoffice.mju.ac.th (Production)
```

| Layer | URL / Target | Notes |
|-------|----------------|-------|
| Preview | https://numtip.github.io/goffice2026/ | Automated via Actions |
| Production | https://greenoffice.mju.ac.th | Manual VPS only — **not modified** |

---

## Governance Links

| Document | Purpose |
|----------|---------|
| [ADR-0002: GitHub Pages as Preview Only](../adr/ADR-0002_GITHUB_PAGES_PREVIEW.md) | Architecture decision |
| [Preview Release Runbook](../runbooks/PREVIEW_RELEASE.md) | End-to-end preview → production process |

---

## Changes Made

### 1. Astro configuration (`astro.config.mjs`)

Environment-aware `site` and `base` — no hardcoded production URLs:

| `DEPLOY_TARGET` | `site` | `base` | Preview badge |
|-----------------|--------|--------|---------------|
| `local` (default) | `PUBLIC_SITE_URL` or unset | `/` | Hidden |
| `github-pages` | `https://<owner>.github.io` | `/<repo>/` | Shown |

- CI sets `DEPLOY_TARGET=github-pages`.
- `GITHUB_REPOSITORY` (set automatically in Actions) drives owner/repo resolution.
- Local fallback only: `numtip/goffice2026`.
- Optional local badge test: `PUBLIC_PREVIEW_BADGE=true`.

### 2. GitHub Actions workflow (`.github/workflows/deploy-pages.yml`)

- Branch trigger: `master`
- Manual trigger: `workflow_dispatch`
- Node 20, `npm ci`
- Concurrency group: `pages` with cancel-in-progress enabled
- Build env: `DEPLOY_TARGET=github-pages` and `PUBLIC_PREVIEW_BADGE=true`
- Pages actions:
  - `actions/configure-pages@v5`
  - `actions/upload-pages-artifact@v3`
  - `actions/deploy-pages@v4`
- Deploy environment: `github-pages`
- Environment URL: `${{ steps.deployment.outputs.page_url }}`

### 3. Base-path link helper (`src/utils/with-base.ts`)

Internal navigation and document links use `withBase()` so routes resolve under the GitHub Pages subpath (`/goffice2026/`) while remaining `/` for local and production VPS builds.

Safeguards:

- Skips external URLs (`http`, `https`, `mailto`, `tel`)
- Skips anchors (`#...`)
- Avoids double-prefix when path already includes `BASE_URL`

### 4. Preview badge (`src/components/ui/PreviewBadge.astro`)

Shown only when:

- `DEPLOY_TARGET=github-pages`, or
- `PUBLIC_PREVIEW_BADGE=true`

Hidden in default/VPS production builds. Fixed-position, accessible, mobile-safe badge text:

- **PREVIEW**
- GitHub Pages

---

## Verification Results

### Latest QA (2026-06-26)

| Check | Result |
|-------|--------|
| `npm run check` | PASS — 0 errors, 0 warnings, 0 hints |
| `npm run build` (default) | PASS — 26 pages, exit 0 |
| Pages-mode build (`DEPLOY_TARGET=github-pages`, `PUBLIC_PREVIEW_BADGE=true`) | PASS — 26 pages, exit 0 |
| `dist/index.html` | Present |
| Pages links/assets use `/goffice2026/` | Verified in `dist/index.html` |
| Preview badge in Pages build | Present (`role="status"`, GitHub Pages label) |
| 26 static pages | Confirmed |

### Runtime Preview (default build)

All 13 core routes previously returned HTTP 200 on local preview:

`/`, `/dashboard`, `/categories`, `/categories/cat1`–`cat7`, `/evidence`, `/documents`, `/search`

> **Note:** `astro preview` serves the default build at `/`. GitHub Pages serves the Pages-mode artifact at `https://numtip.github.io/goffice2026/`.

---

## GitHub Pages Enablement

### Current Pages UI Diagnosis

The Pages settings now show **Source = GitHub Actions** for `numtip/goffice2026`, which is the correct configuration for this Astro preview build.

If the UI ever flips back to **Deploy from a branch** / `master` / `root`, that branch source should be treated as invalid for this project and changed back to **GitHub Actions** before relying on the preview URL.

### Manual step (only if the UI reverts)

1. Open https://github.com/numtip/goffice2026/settings/pages
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. Rerun the workflow named **Deploy GitHub Pages Preview** on `master`
4. Use the deploy job URL after the next successful run

No custom domain should be configured for preview. Do **not** point `greenoffice.mju.ac.th` at GitHub Pages.

---

## Production Deployment (Out of Scope)

VPS production build uses default local settings:

```powershell
Remove-Item Env:DEPLOY_TARGET -ErrorAction SilentlyContinue
$env:PUBLIC_SITE_URL = 'https://greenoffice.mju.ac.th'
npm run build
# Deploy dist/ to VPS manually — separate process
```

---

## Files Added / Modified

| File | Action |
|------|--------|
| `astro.config.mjs` | Modified — env-aware site/base + preview badge flag |
| `.github/workflows/deploy-pages.yml` | Modified — added `configure-pages@v5` |
| `src/utils/with-base.ts` | Modified — external/anchor/double-prefix guards |
| `src/components/ui/PreviewBadge.astro` | Added |
| `src/layouts/BaseLayout.astro` | Modified — render preview badge |
| `docs/adr/ADR-0002_GITHUB_PAGES_PREVIEW.md` | Added |
| `docs/runbooks/PREVIEW_RELEASE.md` | Added |
| `docs/reports/GITHUB_PAGES_PREVIEW_SETUP.md` | Updated (this report) |

---

## Safety Checklist

- [x] No VPS deployment
- [x] No production server edits
- [x] No DNS changes
- [x] No custom domain for preview
- [x] No `greenoffice.mju.ac.th` configuration changes
- [x] Static-first preserved (no API/database added)

---

## Preview URL

**https://numtip.github.io/goffice2026/**
