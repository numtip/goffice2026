# GitHub Pages Preview Setup Report

**Date:** 2026-06-26  
**Project:** Green Office Platform (`goffice2026`)  
**Status:** Preview deployment configured — production unchanged

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

## Changes Made

### 1. Astro configuration (`astro.config.mjs`)

Environment-aware `site` and `base` — no hardcoded production URLs:

| `DEPLOY_TARGET` | `site` | `base` |
|-----------------|--------|--------|
| `local` (default) | `PUBLIC_SITE_URL` or unset | `/` |
| `github-pages` | `https://<owner>.github.io` | `/<repo>/` |

- CI sets `DEPLOY_TARGET=github-pages`.
- `GITHUB_REPOSITORY` (set automatically in Actions) drives owner/repo resolution.
- Local fallback: `numtip/goffice2026`.

### 2. GitHub Actions workflow (`.github/workflows/deploy-pages.yml`)

- Triggers: push to `master`, `workflow_dispatch`
- Build job: `npm ci` → `npm run build` with `DEPLOY_TARGET=github-pages`
- Deploy job: official `actions/deploy-pages@v4`
- Permissions: `pages: write`, `id-token: write`

### 3. Base-path link helper (`src/utils/with-base.ts`)

Internal navigation and document links use `withBase()` so routes resolve under the GitHub Pages subpath (`/goffice2026/`) while remaining `/` for local and production VPS builds.

Updated components/pages: `Navigation.astro`, home, dashboard, categories, documents, evidence cards.

---

## Verification Results

### Build PASS

```powershell
cd G:\ProjectAI\goffice2026
npm run check    # 0 errors, 0 warnings
npm run build    # 26 static pages, exit 0
```

### Dist PASS (local default)

- `dist/index.html` present
- Route folders: `categories/`, `dashboard/`, `documents/`, `evidence/`, `search/`
- 26 HTML files generated (13 core routes + detail pages)

### Dist PASS (GitHub Pages mode)

```powershell
$env:DEPLOY_TARGET = 'github-pages'
npm run build
```

- Asset and nav links prefixed with `/goffice2026/` (verified in `dist/index.html`)
- 26 HTML files generated

### Runtime Preview PASS (local default)

```powershell
npm run preview -- --host 127.0.0.1 --port 4321
```

All 13 core routes returned HTTP 200:

`/`, `/dashboard`, `/categories`, `/categories/cat1`–`cat7`, `/evidence`, `/documents`, `/search`

> **Note:** `astro preview` serves the default build at `/`. GitHub Pages serves the same artifact at `https://numtip.github.io/goffice2026/`; subpath behavior is validated via the Pages-mode dist output.

---

## GitHub Pages Enablement

### Automated (if `gh` has admin access)

```powershell
gh api repos/numtip/goffice2026/pages -X POST -f build_type=workflow
```

Or via UI: **Settings → Pages → Build and deployment → Source: GitHub Actions**

### Manual step (if API/settings blocked)

1. Open https://github.com/numtip/goffice2026/settings/pages
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. After the first workflow run on `master`, the preview URL appears in the Actions deploy job and under **Environments → github-pages**

No custom domain should be configured for preview. Do **not** point `greenoffice.mju.ac.th` at GitHub Pages.

---

## Production Deployment (Out of Scope)

VPS production build uses default local settings:

```powershell
# Optional canonical URL for sitemap/OG tags only
$env:PUBLIC_SITE_URL = 'https://greenoffice.mju.ac.th'
npm run build
# Deploy dist/ to VPS manually — separate process
```

---

## Files Added / Modified

| File | Action |
|------|--------|
| `astro.config.mjs` | Modified — env-aware site/base |
| `.github/workflows/deploy-pages.yml` | Added |
| `src/utils/with-base.ts` | Added |
| `src/components/ui/Navigation.astro` | Modified |
| `src/components/evidence/EvidenceCard.astro` | Modified |
| `src/pages/index.astro` | Modified |
| `src/pages/dashboard.astro` | Modified |
| `src/pages/dashboard/[id].astro` | Modified |
| `src/pages/categories/index.astro` | Modified |
| `src/pages/categories/[id].astro` | Modified |
| `src/pages/documents.astro` | Modified |
| `src/pages/documents/[id].astro` | Modified |
| `docs/reports/GITHUB_PAGES_PREVIEW_SETUP.md` | Added (this report) |

---

## Safety Checklist

- [x] No VPS deployment
- [x] No production server edits
- [x] No DNS changes
- [x] No `greenoffice.mju.ac.th` configuration changes
- [x] Static-first preserved (no API/database added)
- [x] Build and preview QA passed locally

---

## Preview URL (after first successful workflow run)

**https://numtip.github.io/goffice2026/**
