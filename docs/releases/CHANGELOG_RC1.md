# Changelog — RC-1 (`1.2.0-rc.1`)

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).  
**Target commit:** `dbac61c` · **Date:** 2026-07-27 · **Status:** RC accepted — push pending PO approval

---

## [1.2.0-rc.1] — 2026-07-27

### Added

- Bilingual About Center: policy, goals, committee, scope, action-plan (TH/EN)
- News, activities, and knowledge hub route foundations (pending content only)
- Evidence index v0.7.0 — 24 items; SharePoint metadata mapping and link contract
- Navigation: About + hub routes in primary header; scope/action-plan in About subnav
- `data/reconciliation-status.json` and Day 1 resource reconciliation script
- Publication-state utility (`src/utils/publication-states.ts`) for consistent FY2569 copy
- RC-1 release artifacts, gate audits, and readiness report
- GitHub Pages publish checklist for RC-1

### Changed

- FY2569 generated metrics cleared of invented placeholders; baselines 2568 preserved
- Schema-based evidence route validation (replaces fixed count threshold)
- Document registry v0.4.x with orphan disposition for paper usage workbook
- Executive dashboard and landing copy aligned to “Waiting for Official FY2569 Data”

### Fixed

- English About summaries render on EN routes (scope, action-plan, policy, goals, committee)
- Paper usage evidence orphan documented — not linked to committee appointment PDF
- Navigation discoverability for About scope/action-plan and content hubs

### Documentation

- About PDF privacy readiness and publication manifest (0 PUBLIC_READY)
- WS-B evidence mapping and paper usage orphan QA notes
- Parallel workstream and completion sprint QA reports
- RC-1 architecture, UX, content, and dashboard/evidence gate audits

### Tested

- Day 1 rapid completion QA
- WS-E parallel workstreams integration QA
- Navigation cleanup sprint QA
- Content and evidence completion QA
- RC-1 gate validation (build, data:check, validate — PASS)

---

## Commit range (RC-1)

```
f95d4ac docs(release): RC-1 gate readiness report and audit findings
8fce1c1 docs(release): add RC-1 content audit (Subagent C)
f1250a5 docs(release): prepare rc-1 release artifacts
61b5fa9 test(qa): validate content and evidence completion
… Rapid Completion sprint (about, evidence, nav, i18n) …
98f423e fix(i18n): render english about summaries correctly
95d5718 test(qa): WS-E parallel workstreams integration report
6a3403c fix(platform): refine day1 validation and publication states
c74cd34 feat(about): add bilingual about foundation
b171ab5 fix(data): reconcile resource datasets
```

Prior production baseline: **v1.1.3**

---

## [Unreleased / post-RC-1]

- Mobile nav locale injection fix (RC gate finding)
- Evidence `realSourceAvailable` alignment for off-disk workbooks
- `/about/feedback/` route implementation or metadata deferral
- About PDF redaction and public copy
- Official FY2569 XLSX import
