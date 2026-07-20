# Green Office 2026 — Development & Release Operations

**Repository:** https://github.com/numtip/goffice2026  
**Production URL:** https://goffice.mju.ac.th/

This runbook covers the **development repository** and how it connects to production releases. For VPS cutover, rollback, Nginx, and monitoring, see the legacy ops archive: `/home/rae_admin/joomla-greenoffice/docs/OPERATIONS_RUNBOOK.md`.

---

## Workspace Layout

| Role | Path |
|------|------|
| Development (Git working copy) | `/home/rae_admin/goffice2026` |
| Build output | `/home/rae_admin/goffice2026/dist/` |
| Production releases | `/var/www/goffice/releases/<version>/` |
| Production live symlink | `/var/www/goffice/current` |
| Legacy Joomla archive + prod ops | `/home/rae_admin/joomla-greenoffice` |

**Do not edit production files directly.** Build from the development path and rsync `dist/` into a versioned release directory.

---

## Daily Development

```bash
cd /home/rae_admin/goffice2026
git status
npm run dev          # http://localhost:3000
```

Before committing changes that touch `src/`, config, or build-time data:

```bash
npm run check
npm run build
```

See also: [BUILD_VERIFICATION.md](BUILD_VERIFICATION.md), [RUNTIME_QA.md](RUNTIME_QA.md).

---

## Production Release Build (VPS)

Use Node 20. Tag must match the release being deployed.

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 20
cd /home/rae_admin/goffice2026
git fetch --tags origin
git checkout vX.Y.Z
npm ci
PUBLIC_SITE_URL=https://goffice.mju.ac.th npm run build
```

Artifact: `dist/` — stage with rsync per the production runbook in `joomla-greenoffice/docs/OPERATIONS_RUNBOOK.md`.

---

## GitHub Pages Preview

Preview builds are automated from GitHub Actions (branches `master` / `main`). Local simulation:

```bash
DEPLOY_TARGET=github-pages PUBLIC_PREVIEW_BADGE=true npm run build
```

Preview URL: https://numtip.github.io/goffice2026/

---

## What NOT to Do

- Do **not** edit `/var/www/goffice` directly
- Do **not** restore or restart Joomla (`goffice-j6`)
- Do **not** deploy preview builds to production without PO approval and version tagging

---

*Last updated: DEV-0 workspace normalization (2026-07-20)*
