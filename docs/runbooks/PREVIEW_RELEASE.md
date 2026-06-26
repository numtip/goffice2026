# Preview Release Runbook

Skill: **PREVIEW_RELEASE**

## Purpose

Define the safe path from developer push to GitHub Pages preview, through QA and executive review, to optional manual VPS production deployment.

**Preview:** GitHub Pages  
**Production:** `greenoffice.mju.ac.th` on VPS

---

## Architecture Lock

```text
GitHub → GitHub Actions → GitHub Pages (Preview) → Manual Approval → Manual VPS → greenoffice.mju.ac.th
```

> **Warning:** Do **not** point `greenoffice.mju.ac.th` to GitHub Pages. Do **not** configure a custom domain for preview.

---

## Roles

| Stage | Owner | Output |
|-------|-------|--------|
| Developer push | Developer | Code on `master` |
| CI build | GitHub Actions | Static artifact |
| Preview deploy | GitHub Pages | Public preview URL |
| QA | Developer / QA | Pass/fail checklist |
| Executive review | Product Owner / stakeholders | Approval decision |
| Production deploy | Authorized operator | VPS update |
| Rollback | Authorized operator | Restored prior VPS build |

---

## Step 1: Developer push

1. Complete local QA:
   - `rtk npm run check`
   - `rtk npm run build`
2. Push to the active repo branch (`master`):
   - `rtk git push origin HEAD`
3. Confirm workflow **Deploy GitHub Pages Preview** starts in GitHub Actions.

---

## Step 2: GitHub Actions build

Workflow: `.github/workflows/deploy-pages.yml`

Build characteristics:

- Node 20
- `npm ci`
- `DEPLOY_TARGET=github-pages`
- Official Pages actions:
  - `actions/configure-pages@v5`
  - `actions/upload-pages-artifact@v3`
  - `actions/deploy-pages@v4`

Pass criteria:

- Build job succeeds
- Deploy job succeeds
- Environment `github-pages` shows deployed URL

---

## Step 3: GitHub Pages preview

Preview URL:

**https://numtip.github.io/goffice2026/**

Expected preview-only signals:

- Fixed badge: **PREVIEW / GitHub Pages**
- Internal links under `/goffice2026/`
- No production custom domain

First-time setup (if preview 404):

1. Open repository **Settings → Pages**
2. Set **Source** to **GitHub Actions**
3. Re-run the workflow if needed

---

## Step 4: QA checklist

### Build QA

- [ ] `rtk npm run check` passes
- [ ] Default `rtk npm run build` passes
- [ ] Pages-mode build passes:
  ```powershell
  $env:DEPLOY_TARGET = 'github-pages'
  rtk npm run build
  Remove-Item Env:DEPLOY_TARGET
  ```
- [ ] `dist/index.html` exists
- [ ] 26 static pages generated
- [ ] Links/assets in Pages build use `/goffice2026/`

### Preview runtime QA

- [ ] Home page loads
- [ ] Global navigation works
- [ ] Dashboard, categories, evidence, documents, search load
- [ ] Preview badge visible
- [ ] No obvious broken internal links
- [ ] External reference links still point off-site correctly

Related runbooks:

- `docs/runbooks/BUILD_VERIFICATION.md`
- `docs/runbooks/RUNTIME_QA.md`
- `docs/runbooks/RELEASE_SAFETY_CHECK.md`

---

## Step 5: Executive review

Share the GitHub Pages preview URL with reviewers.

Review focus:

- Content accuracy
- Dashboard/evidence usability
- Branding and readability
- Accessibility basics

Record approval explicitly before any production action.

---

## Step 6: Manual approval gate

Production deployment is **blocked** until all are true:

- [ ] Preview workflow succeeded
- [ ] QA checklist passed
- [ ] Executive/stakeholder approval recorded
- [ ] Operator confirms no DNS/VPS preview misconfiguration

Reference ADR: `docs/adr/ADR-0002_GITHUB_PAGES_PREVIEW.md`

---

## Step 7: Manual VPS deployment (production only)

Out of scope for GitHub Pages automation.

Production build uses default local/VPS settings:

```powershell
Remove-Item Env:DEPLOY_TARGET -ErrorAction SilentlyContinue
$env:PUBLIC_SITE_URL = 'https://greenoffice.mju.ac.th'
rtk npm run build
# Deploy dist/ to VPS using approved production procedure
```

Requirements:

- No preview badge in production build
- `base` remains `/`
- Deploy only through approved VPS process
- Do not reuse GitHub Pages artifact as production artifact without rebuilding with VPS settings

---

## Step 8: Rollback note

If production issues occur after VPS deployment:

1. Stop further promotion immediately
2. Restore the previous known-good VPS build from backup or prior artifact
3. Document incident and failed release scope
4. Fix on branch, re-run preview flow, and repeat approval gate

GitHub Pages preview rollback:

- Re-run workflow from last known-good commit, or
- Revert offending commit on `master` and let preview redeploy

Preview rollback does **not** rollback production automatically.

---

## Safety warnings

- Do **not** deploy preview workflow output directly to VPS without rebuilding for production settings
- Do **not** configure `greenoffice.mju.ac.th` on GitHub Pages
- Do **not** change DNS for preview
- Do **not** treat preview approval as production deployment approval by itself

---

## Related documents

- ADR: `docs/adr/ADR-0002_GITHUB_PAGES_PREVIEW.md`
- Report: `docs/reports/GITHUB_PAGES_PREVIEW_SETUP.md`
- Constitution: `00-GREENOFFICE_PROJECT_CONSTITUTION.MD`
