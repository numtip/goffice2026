# Green Office 2026 — Release Notes RC-1

**Release candidate:** `1.2.0-rc.1`  
**Recommended tag:** `v1.2.0-rc.1`  
**Target commit:** `ccb205d`  
**Date:** 2026-07-27  
**Status:** **RC accepted by Product Owner** — preview publish pending push approval  
**Production:** Remains **v1.1.3** at https://goffice.mju.ac.th/

---

## Overview

RC-1 is the first release candidate from the **Rapid Completion** sprint (July 2026). It delivers a bilingual About Center, improved navigation and evidence discoverability, SharePoint metadata foundations, and validated QA gates — on the static-first Blueprint V4 architecture (no backend MVP).

Preview deploys automatically to **GitHub Pages** when `master` is pushed. Production VPS deploy is **out of scope** for RC-1.

---

## Highlights

### About Center (TH/EN)

- Policy, goals, committee, scope, and action-plan routes with OCR-derived summaries
- English About summaries and locale-aware rendering on EN routes
- PDF publication readiness assessment (0 files published — privacy review pending)

### Navigation & Content Hubs

- Primary nav: About, News, Activities, Knowledge (TH/EN)
- About subnav includes scope and action-plan
- Hub pages use pending-only slots — no invented events or awards

### Evidence & Data

- Evidence index: 24 items; SharePoint metadata contract documented
- Paper usage orphan explicitly dispositioned (not linked to committee order)
- FY2568 baselines preserved; FY2569 shows **Waiting for Official FY2569 Data**
- Resource dataset reconciliation and publication-state copy unified

### Platform & QA

- Build: 250 pages; platform validation and link check PASS
- Parallel workstream QA reports (Day 1, navigation cleanup, content/evidence completion)
- RC-1 gate audits consolidated in `docs/releases/rc1/`

---

## Validation Summary

| Gate | Result |
|------|--------|
| `npm run build` | PASS — 250 pages |
| `npm run data:check` | PASS — 0 errors (14 FY2569 pending warnings) |
| `npm run validate` | PASS — taxonomy, evidence, routes, links |
| Production link check | PASS — 0 broken links |

---

## Known Limitations (preview)

See [KNOWN_LIMITATIONS_RC1.md](./KNOWN_LIMITATIONS_RC1.md):

1. FY2569 operational data pending (5/6 workbooks off-disk)
2. About PDFs require redaction before `public/` copy
3. Evidence placeholders (14) and paper usage orphan documented
4. OCR-derived About content requires human verification

---

## Upgrade from v1.1.3

| Area | v1.1.3 | RC-1 |
|------|--------|------|
| About routes | Limited | 8+ bilingual routes |
| Content hubs | None | News / Activities / Knowledge foundations |
| Evidence count | 21 | 24 |
| EN About prose | N/A | Summaries live (OCR-derived) |
| Production | Live on VPS | **Unchanged** — preview only |

---

## Publish Steps (after PO push approval)

1. Review [DEPLOYMENT_CHECKLIST_RC1.md](./DEPLOYMENT_CHECKLIST_RC1.md)
2. Review [GITHUB_PAGES_PUBLISH_CHECKLIST_RC1.md](./GITHUB_PAGES_PUBLISH_CHECKLIST_RC1.md)
3. Create tag per [TAG_RC1.md](./TAG_RC1.md) (optional)
4. Push `master` → GitHub Actions deploys preview

---

## References

- [CHANGELOG_RC1.md](./CHANGELOG_RC1.md)
- [GOFFICE2026_RELEASE_READINESS_REPORT_RC1.md](./GOFFICE2026_RELEASE_READINESS_REPORT_RC1.md)
- [ROLLBACK_CHECKLIST_RC1.md](./ROLLBACK_CHECKLIST_RC1.md)
