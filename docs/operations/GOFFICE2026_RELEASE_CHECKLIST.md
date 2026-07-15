# Green Office 2026 — Release Checklist

> Use this checklist to qualify every production release candidate.
> Each gate must pass (or be explicitly documented as a known limitation)
> before marking the release as ready.

---

## 1. Repository State

- [ ] `git status` is clean (no uncommitted changes)
- [ ] Working tree has no untracked files except intended new assets
- [ ] All Round 4 work is committed on the release branch
- [ ] Release branch is based on a known clean baseline

```bash
git status
git log --oneline -5
```

---

## 2. Validation (`npm run validate`)

- [ ] Taxonomy validation passes (7 categories, 24 issues, 65 indicators, official weights)
- [ ] Evidence validation passes (21 records, valid traceability, no structural errors)
- [ ] Route verification passes (dist/ exists, counts match expectations)
- [ ] No unexpected validator failures

```bash
npm run validate
```

---

## 3. Astro Check (`npm run check`)

- [ ] No TypeScript errors
- [ ] No Astro component errors
- [ ] No unresolved imports or missing exports

```bash
npm run check
```

---

## 4. Production Build (`npm run build`)

- [ ] Build completes with exit code 0
- [ ] dist/ directory is populated
- [ ] All expected static routes are present
- [ ] No build warnings that indicate missing content

```bash
npm run build
```

---

## 5. Route Smoke Test

- [ ] Preview server starts successfully
- [ ] All core routes return HTTP 200 (or valid redirect 3xx)
- [ ] No route returns 404 or 500

```bash
npx astro preview &
sleep 3
node scripts/smoke-routes.mjs
kill %1
```

### Smoke Test Result (Round 4)

- **Status:** 26/26 routes PASS (all HTTP 200)
- **Method:** `npx astro preview &` then `node scripts/smoke-routes.mjs`
- **Note:** Uses `PREVIEW_BASE_URL=http://localhost:4321` (not `127.0.0.1`) for Windows compatibility
- **No blocker — smoke test is fully functional**

---

## 6. GitHub Pages Readiness

- [ ] Build output is fully static (no server-side rendering)
- [ ] All asset paths use relative or correct base path
- [ ] No backend or database dependencies
- [ ] GitHub Pages deploy target is configured (if applicable)

### Verification

```bash
# Check that dist/ contains no server-side files
ls dist/ | head -20
# Verify index.html is self-contained
head -5 dist/index.html
```

---

## 7. Production VPS Deployment

- [ ] Production VPS deployment is **deferred** for this round
- [ ] VPS deployment requires: credentials, domain config, SSL setup
- [ ] This checklist applies to the GitHub Pages static deployment only

> **Status:** DEFERRED — Production VPS deployment is out of scope for the
> current platform completion phase. Requires separate operational planning,
> credential provisioning, and infrastructure setup.

---

## 8. Rollback Reference

- **Current HEAD commit:**
  ```
  6cf76d3 feat(round3): add evidence traceability foundation with schema, validation, and navigator
  ```
  (Round 4 work is staged but not yet committed)
- **Rollback command:**
  ```bash
  git reset --hard <PREVIOUS_STABLE_COMMIT>
  git push --force-with-lease
  ```
- **Rollback verification:** Confirm dist/ reverts to previous version

---

## 9. Known Limitations

| # | Limitation | Impact | Status |
|---|-----------|--------|--------|
| 1 | Evidence documents are placeholder files (not official auditor-verified sources) | Content completeness | Accepted — MVP scope |
| 2 | English route coverage is complete (208 pages total including bilingual routes) | Internationalization | Complete — TH/EN categories, indicators, evidence |
| 3 | Evidence records are category-level only (not mapped to specific indicators/issues) | Traceability depth | Accepted — MVP scope |
| 4 | Smoke test requires manual preview server startup; default base URL uses 127.0.0.1 but Windows needs localhost | Automation dependency | Functional — pass with PREVIEW_BASE_URL override |
| 5 | Search index is generated at build time; no live/API-based search | Search freshness | Accepted — static-only constraint |
| 6 | Production VPS not deployed | Hosting | Deferred |

---

## 10. Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA / Validation | Worker E (Auto) | 2026-07-15 | Platform validator passed |
| Build Gate | CI / Local | | |
| Release Approval | Product Owner | | |

---

## 11. Quick Reference

```bash
# Full release qualification pipeline
git status                                            # 1. Clean state
npm run validate                                      # 2. Platform validation
npm run check                                         # 3. Astro type check
npm run build                                         # 4. Production build
npm run validate                                      # 5. Re-validate after build (route verification)

# Smoke test (requires preview server)
npx astro preview &
sleep 3
$env:PREVIEW_BASE_URL="http://localhost:4321"
node scripts/smoke-routes.mjs
Stop-Process -Name "node" -Force
```
