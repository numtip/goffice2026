# Changelog — RC-1

All notable changes on `master` since early July 2026, grouped by [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) conventions.

**Baseline:** `61b5fa9`  
**Range:** 2026-07-01 → 2026-07-27 (Rapid Completion sprint + prior July work)

---

## [Unreleased → RC-1] — 2026-07-27

### Added

- Bilingual About foundation and routes: policy, goals, committee, scope, action-plan, feedback (TH/EN)
- Scope and action-plan About routes with bilingual summaries
- News, activities, and knowledge route foundations
- Evidence metadata mapping for unpublished slots and SharePoint link contract
- `data/reconciliation-status.json` — traceable FY2569 pending status per resource
- WS-E parallel workstreams integration and Day 1 QA reports
- Blueprint V4 repository reconciliation documentation
- M365 SharePoint schema, infrastructure, and EPIC documentation (scope frozen per ADR-0001)
- Executive dashboard visual upgrades, semantic resource cards, and metric detail pages
- SharePoint Green Office evidence library on canonical RAE site (v1.2.0 foundation)
- CI quality gates, Node 24 bump, bilingual 404 pages

### Changed

- Navigation improved for content discoverability across About and evidence sections
- Platform validation and publication states refined for Day 1 pages
- Resource datasets reconciled; FY2569 placeholder values cleared for energy, water, fuel, paper, GHG, recycling
- Evidence index v0.6.0 — 24 items (+3 About PDFs)
- `ev-transport-fleet-2025` promoted from placeholder to available (indicator 3.2.5)
- Landing page executive hero, dashboard showcase, and motion progressively enhanced
- Canonical SharePoint site corrected to RAE `/sites/msteams_54adc4`
- Removed unused Supabase/admin modules (backend deferred from MVP)

### Fixed

- English About summaries render correctly on EN routes
- English About content completion for bilingual parity
- Paper usage evidence orphan documented with explicit disposition (not linked to committee order)
- i18n path and dashboard contrast improvements
- Astro check diagnostics blocking CI deployment
- Dashboard broken indicators link removed from closing banner
- Production links, Thai landing, and header visibility (v1.1.x carry-over fixes)

### Tested

- `test(qa): validate rapid completion day 1`
- `test(qa): validate navigation cleanup sprint`
- `test(qa): WS-E parallel workstreams integration report`
- `test(qa): validate content and evidence completion` — `61b5fa9`

### Documentation

- About PDF publication readiness assessment
- Paper usage orphan QA note (`WS-B_PAPER_USAGE_ORPHAN_QA.md`)
- Rapid Completion Plan V1 and repository audit reports
- Release notes v1.2.0, v1.1.3, v1.1.2 freeze documents

---

## Recent commits (source: `git log --oneline -20 master`)

```
61b5fa9 test(qa): validate content and evidence completion
8b267b5 Merge branch 'rapid/ws-evidence-orphan'
34b3fe2 Merge branch 'rapid/ws-about-en'
1921588 docs(content): assess about pdf publication readiness
f444c82 fix(i18n): complete english about content
da7b102 fix(evidence): document paper usage evidence disposition
98f423e fix(i18n): render english about summaries correctly
bee81b8 test(qa): validate navigation cleanup sprint
47e8d0d fix(content): complete bilingual about summaries
23cba4c fix(evidence): resolve paper usage orphan
9b46130 fix(nav): improve content discoverability
95d5718 test(qa): WS-E parallel workstreams integration report
a549f1d Merge branch 'rapid/ws-landing'
37af36b Merge branch 'rapid/ws-about'
38ae3c5 feat(evidence): map unpublished slots and sharepoint metadata
2233689 feat(content): add news activities knowledge route foundations
f941919 feat(about): add scope and action-plan routes TH/EN
6a3403c fix(platform): refine day1 validation and publication states
d2e05fa test(qa): validate rapid completion day 1
c74cd34 feat(about): add bilingual about foundation
```

---

## Prior July commits (selected)

- `0394539` feat(evidence): improve evidence metadata foundation
- `b171ab5` fix(data): reconcile resource datasets
- `c703b92` docs(architecture): reconcile repository with blueprint v4
- `e8dedb0` docs(m365): ADR-0001 remove approval engine from M365 scope
- `f6f31a6` docs(release): publish v1.2.0 release notes
- `df06179` feat(branding): replace official Green Office logo across site
- `176399a` chore: add CI quality gates, Node engines, and dead code cleanup
