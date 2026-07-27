# GitHub Pages Publish Checklist — RC-1

**Release candidate:** `1.2.0-rc.1`  
**Target commit:** `ccb205d`  
**Preview URL:** https://numtip.github.io/goffice2026/  
**Production URL (unchanged):** https://goffice.mju.ac.th/  
**Workflow:** `.github/workflows/deploy-pages.yml`  
**Status:** Awaiting PO approval to push

---

## 1. Pre-push (local)

- [ ] On branch `master` at commit `f95d4ac` or later (includes RC release pack)
- [ ] `git status` — no unintended staged changes
- [ ] PO recorded RC acceptance for **preview** (not production VPS)
- [ ] [KNOWN_LIMITATIONS_RC1.md](./KNOWN_LIMITATIONS_RC1.md) acknowledged

```powershell
$env:PATH = "G:\nodejs;" + $env:PATH
cd G:/ProjectAI/goffice2026
git.exe log --oneline -1
npm ci
npm run check
npm test
npm run data:check
npm run build
npm run validate
```

**Expected:** build ~250 pages; validate PASS; 0 link errors.

---

## 2. GitHub Pages preview build (local simulation)

Matches CI environment variables:

```powershell
$env:DEPLOY_TARGET = "github-pages"
$env:PUBLIC_PREVIEW_BADGE = "true"
$env:GITHUB_REPOSITORY = "numtip/goffice2026"
npm run build
npm run validate
npm run qa:seo
```

- [ ] `dist/` generated with `/goffice2026/` base path
- [ ] Preview badge visible in built HTML
- [ ] Sitemap includes About, hub, and evidence routes

---

## 3. Push gate (PO approval required)

**Do not push until Product Owner approves.**

```powershell
git.exe push origin master
# Optional after tag creation (see TAG_RC1.md):
# git.exe push origin v1.2.0-rc.1
```

- [ ] PO sign-off date recorded
- [ ] Push initiated by authorized release manager

---

## 4. GitHub Actions — automated deploy

Triggered by push to `master`. Workflow: **Deploy GitHub Pages Preview**.

| Job | Steps | Pass criteria |
|-----|-------|---------------|
| **quality** | check → test → build → validate → qa:seo | All green |
| **build** | configure-pages → build → upload artifact | Artifact uploaded |
| **deploy** | deploy-pages → `github-pages` environment | Deploy succeeds |

Monitor: GitHub → Actions → **Deploy GitHub Pages Preview**

- [ ] `quality` job PASS
- [ ] `build` job PASS
- [ ] `deploy` job PASS
- [ ] Environment `github-pages` shows successful deployment

---

## 5. GitHub repository settings (one-time verify)

- [ ] **Settings → Pages → Build and deployment:** Source = **GitHub Actions**
- [ ] Repository visibility allows Pages (public repo)
- [ ] `github-pages` environment exists (created on first deploy)

---

## 6. Post-deploy smoke test (preview site)

Base: `https://numtip.github.io/goffice2026`

| Check | URL | Expected |
|-------|-----|----------|
| Home TH | `/` | 200, preview badge |
| Home EN | `/en/` | 200 |
| About policy | `/about/policy/` | 200 TH/EN |
| About scope | `/about/scope/` | 200 TH/EN |
| News hub | `/news/` | 200, pending banner |
| Dashboard | `/dashboard/` | 200, FY2569 waiting state |
| Evidence | `/evidence/` | 200 |
| Favicon | `/favicon.ico` | 200 |

- [ ] TH/EN language switcher works
- [ ] Mobile nav opens (verify menu label after any UX fixes)
- [ ] No mixed-content or 404 on core routes

---

## 7. Rollback (preview)

If preview deploy fails or wrong commit shipped:

1. Revert or reset `master` to last good commit locally
2. Push with PO approval, or re-run workflow on known-good SHA via `workflow_dispatch`
3. See [ROLLBACK_CHECKLIST_RC1.md](./ROLLBACK_CHECKLIST_RC1.md)

Production VPS (`goffice.mju.ac.th`) is **not** affected by GitHub Pages deploy.

---

## 8. Sign-off

| Role | Name | Date | Approved |
|------|------|------|----------|
| Product Owner | | | Preview push |
| Release Manager | | | |
| QA | | | Actions green + smoke PASS |

---

## Quick reference

**Preview:** https://numtip.github.io/goffice2026/  
**Workflow file:** `.github/workflows/deploy-pages.yml`  
**Node version (CI):** 24
