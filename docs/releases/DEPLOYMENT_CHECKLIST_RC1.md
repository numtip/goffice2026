# Deployment Checklist — RC-1

**Release candidate:** `1.2.0-rc.1`  
**Target commit:** `ccb205d`  
**RC status:** Accepted by Product Owner  
**Push/deploy:** Blocked until PO push approval  
**Production VPS:** Do **not** deploy RC-1 — preview only

---

## 1. Pre-flight

- [ ] Branch `master` at commit `ccb205d` (RC release pack)
- [ ] `git status` clean for tracked files
- [ ] [RELEASE_NOTES_RC1.md](./RELEASE_NOTES_RC1.md) reviewed
- [ ] [KNOWN_LIMITATIONS_RC1.md](./KNOWN_LIMITATIONS_RC1.md) acknowledged
- [ ] PO RC acceptance recorded

```powershell
git.exe -C "G:/ProjectAI/goffice2026" log --oneline -1
git.exe -C "G:/ProjectAI/goffice2026" status -sb
```

---

## 2. Local quality gates

```powershell
$env:PATH = "G:\nodejs;" + $env:PATH
cd G:/ProjectAI/goffice2026
npm ci
npm run check
npm test
npm run data:check
npm run data:validate
npm run build
npm run validate
npm run qa:seo
```

| Step | Expected |
|------|----------|
| `check` | 0 errors |
| `test` | 13/13 PASS |
| `data:check` | 0 errors (FY2569 warnings OK) |
| `build` | ~250 pages |
| `validate` | PASS |
| `qa:seo` | PASS |

---

## 3. GitHub Pages preview build (local)

```powershell
$env:DEPLOY_TARGET = "github-pages"
$env:PUBLIC_PREVIEW_BADGE = "true"
$env:GITHUB_REPOSITORY = "numtip/goffice2026"
npm run build
```

- [ ] Preview badge in output
- [ ] Base path `/goffice2026/`

---

## 4. Runtime QA (optional, local)

```powershell
npm run preview
# Separate terminal:
$env:PREVIEW_BASE_URL = "http://localhost:4321"
npm run qa:routes
npm run qa:links
```

- [ ] Core routes HTTP 200
- [ ] TH/EN About and hub routes load
- [ ] Dashboard shows FY2569 waiting state

---

## 5. Tag (recommended — after PO push approval)

See [TAG_RC1.md](./TAG_RC1.md). **Do not tag until PO approves push.**

```powershell
git.exe tag -a v1.2.0-rc.1 ccb205d -m "Green Office 2026 RC-1 — Rapid Completion preview candidate"
```

- [ ] Tag created locally (optional)
- [ ] Tag **not** pushed until PO approval

---

## 6. Push & preview deploy (PO approval required)

```powershell
git.exe push origin master
git.exe push origin v1.2.0-rc.1   # if tag created
```

- [ ] PO push approval obtained
- [ ] GitHub Actions **Deploy GitHub Pages Preview** workflow green
- [ ] Preview smoke test per [GITHUB_PAGES_PUBLISH_CHECKLIST_RC1.md](./GITHUB_PAGES_PUBLISH_CHECKLIST_RC1.md)

**Preview URL:** https://numtip.github.io/goffice2026/

---

## 7. Production VPS — NOT IN SCOPE

| Target | Action |
|--------|--------|
| `goffice.mju.ac.th` | **No deploy** — remains v1.1.3 |
| Stable `v1.2.0` | Separate PO gate after limitation remediation |

See [ROLLBACK_CHECKLIST_RC1.md](./ROLLBACK_CHECKLIST_RC1.md).

---

## 8. Post-deploy verification (preview)

- [ ] `/` and `/en/` — 200
- [ ] `/about/policy/`, `/about/scope/`, `/about/action-plan/` — TH/EN 200
- [ ] `/news/`, `/activities/`, `/knowledge/` — 200
- [ ] `/dashboard/`, `/evidence/` — 200
- [ ] Favicon, manifest, logo assets — 200

---

## 9. Sign-off

| Role | Name | Date | Approved |
|------|------|------|----------|
| Product Owner | | | RC accepted / push approved |
| Release Manager | | | |
| QA | | | Local gates PASS |

---

## Quick reference

```powershell
npm ci && npm run check && npm test && npm run data:check && npm run build && npm run validate
```
