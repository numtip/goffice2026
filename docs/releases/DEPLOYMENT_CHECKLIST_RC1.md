# Deployment Checklist — RC-1

**Release candidate:** RC-1  
**Baseline commit:** `61b5fa9`  
**Do not deploy to production without Product Owner sign-off.**

---

## 1. Pre-flight

- [ ] Working branch is `rapid/rc-release` (or tagged RC commit on `master`)
- [ ] `git status` clean — no uncommitted changes
- [ ] Release artifacts present under `docs/releases/*_RC1.md`
- [ ] [KNOWN_LIMITATIONS_RC1.md](./KNOWN_LIMITATIONS_RC1.md) reviewed and accepted
- [ ] Product Owner approval recorded (Section 8)

```powershell
git.exe status
git.exe log --oneline -1
```

---

## 2. Install & Type Check

- [ ] Node.js ≥ 20 (CI uses 24)
- [ ] Dependencies installed via `npm ci`

```powershell
node --version
npm ci
npm run check
```

**Expected:** 0 TypeScript / Astro errors.

---

## 3. Unit Tests

- [ ] All unit tests pass

```powershell
npm test
```

**Expected:** 13/13 PASS (data-status, i18n paths, pipeline quality, dashboard executive).

---

## 4. Data Pipeline

- [ ] Data check passes (warnings for CURRENT_DATA_PENDING are expected)

```powershell
npm run data:check
npm run data:validate
```

**Expected:** 0 errors; FY2569 pending warnings documented in known limitations.

---

## 5. Production Build

- [ ] Build completes with exit code 0
- [ ] `dist/` populated

```powershell
npm run build
```

**Expected:** ~240 pages (RC-1 Day 1 QA baseline).

### GitHub Pages preview build (local simulation)

```powershell
$env:DEPLOY_TARGET='github-pages'
$env:PUBLIC_PREVIEW_BADGE='true'
npm run build
```

- [ ] Preview badge visible
- [ ] Base paths use `/goffice2026/` prefix

---

## 6. Platform Validation

- [ ] Taxonomy validation passes (7 categories, 24 issues, 65 indicators)
- [ ] Evidence schema validation passes
- [ ] Route verification passes

```powershell
$env:DEPLOY_TARGET='github-pages'
npm run validate
npm run qa:seo
```

**Note:** Evidence route count may be 24 vs legacy threshold 21 — documented known limitation.

---

## 7. Runtime QA

- [ ] Preview server starts

```powershell
npm run preview
# Separate terminal:
$env:PREVIEW_BASE_URL='http://localhost:4321'
npm run qa:routes
npm run qa:links
```

- [ ] Core routes return HTTP 200
- [ ] TH and EN About routes load
- [ ] Dashboard resource pages render with baseline 2568 data
- [ ] No broken internal links in `dist/`

---

## 8. GitHub Pages Deploy (preview only)

Automated via `.github/workflows/deploy-pages.yml` on push to `master`.

| Step | Owner | Check |
|------|-------|-------|
| CI quality job | GitHub Actions | check, test, build, validate, qa:seo PASS |
| Pages artifact upload | GitHub Actions | `dist/` uploaded |
| Pages deploy | GitHub Actions | Environment `github-pages` succeeds |

**Preview URL:** https://numtip.github.io/goffice2026/

- [ ] Workflow run green on target commit
- [ ] Preview site loads with RC-1 content
- [ ] Preview badge displayed

**Production VPS (`goffice.mju.ac.th`):** Do **not** deploy RC-1 until PO acceptance and formal tag. See [ROLLBACK_CHECKLIST_RC1.md](./ROLLBACK_CHECKLIST_RC1.md).

---

## 9. Post-deploy Verification (preview)

- [ ] `/` and `/en/` — 200
- [ ] `/about/` routes (policy, goals, committee, scope, action-plan) — 200 TH/EN
- [ ] `/dashboard/` resource pages — 200
- [ ] `/evidence/` index — 200
- [ ] Favicon, manifest, OG image — 200
- [ ] Logo (`LogoGreen2025.png`) — 200

---

## 10. Sign-off

| Role | Name | Date | Approved |
|------|------|------|----------|
| QA / Validation | | | |
| Build Gate (CI) | | | |
| Release Manager | Subagent E | 2026-07-27 | RC artifacts prepared |
| Product Owner | | | |

---

## Quick Reference

```powershell
npm ci
npm run check
npm test
npm run data:check
npm run build
npm run validate
npm run qa:seo
npm run preview
# then: npm run qa:routes && npm run qa:links
```
