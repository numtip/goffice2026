# Green Office 2026 — Release Notes RC-1

**Release candidate:** RC-1  
**Baseline commit:** `61b5fa9` (`master`)  
**Branch:** `rapid/rc-release`  
**Date:** 2026-07-27  
**Status:** Release candidate — not deployed to production

---

## Overview

RC-1 is the first release candidate from the **Rapid Completion** sprint (July 2026). It delivers bilingual About Center routes, improved navigation and evidence discoverability, SharePoint metadata foundations, and validated platform QA gates — while keeping the static-first, no-backend MVP architecture.

Production remains on **v1.1.3** (`https://goffice.mju.ac.th/`). Preview builds deploy automatically to GitHub Pages on push to `master`.

---

## Highlights

### About Center (TH/EN)

- Bilingual About foundation with policy, goals, committee, scope, action-plan, and feedback routes
- Scope and action-plan pages with OCR-derived summaries and publication-state banners
- English About content and summary rendering fixes
- PDF publication readiness assessment documented

### Evidence & Content

- Evidence index expanded to 24 items; unpublished slots and SharePoint metadata mapped
- Paper usage orphan (`doc-paper-usage-2025`) explicitly documented — not incorrectly linked
- News, activities, and knowledge route foundations added
- Navigation cleanup for improved content discoverability

### Data & Dashboard

- FY2568 baseline preserved; FY2569 operational placeholders cleared pending official data
- Resource dataset reconciliation and provenance validation
- Executive dashboard visual polish and environmental metric detail pages (prior sprint carry-over)

### Platform & QA

- Day 1 rapid completion validation: build PASS (240 pages), data pipeline PASS
- WS-E parallel workstreams integration report
- Content and evidence completion QA gate at `61b5fa9`
- Blueprint V4 repository reconciliation and M365 scope freeze (ADR-0001)

### Infrastructure (documentation / preview)

- GitHub Pages preview workflow with quality gates (check, test, build, validate, SEO QA)
- SharePoint evidence library foundation (v1.2.0 scope — not bulk-migrated)

---

## Upgrade from v1.1.3

| Area | v1.1.3 | RC-1 |
|------|--------|------|
| About routes | Limited | 8+ bilingual About routes |
| Evidence count | 21 | 24 (+ About PDFs) |
| FY2569 dashboard data | Partial placeholders | Cleared — pending official sources |
| EN About prose | N/A | Summaries live; full translation pass pending |
| Production deploy | v1.1.3 live | **Not deployed** — preview only |

---

## Validation Summary (Day 1 QA)

| Gate | Result |
|------|--------|
| `npm run build` | PASS — 240 pages |
| `npm run data:check` | PASS — 14 warnings (CURRENT_DATA_PENDING) |
| `npm run validate` | PASS WITH NOTES — evidence route count 24 vs legacy threshold 21 |
| Production link check | PASS — 7024 hrefs |

---

## What's Next

- Restore missing operational XLSX workbooks (5/6 absent from `docs/`)
- Copy About PDFs to `public/` after redaction review
- Update validator expected evidence count threshold
- Product Owner preview acceptance before production tag and VPS deploy

---

## References

- [CHANGELOG_RC1.md](./CHANGELOG_RC1.md)
- [KNOWN_LIMITATIONS_RC1.md](./KNOWN_LIMITATIONS_RC1.md)
- [DEPLOYMENT_CHECKLIST_RC1.md](./DEPLOYMENT_CHECKLIST_RC1.md)
- [VERSION_RECOMMENDATION_RC1.md](./VERSION_RECOMMENDATION_RC1.md)
