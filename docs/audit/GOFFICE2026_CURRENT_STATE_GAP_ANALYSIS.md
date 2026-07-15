# GOFFICE2026 Current State Gap Analysis

**Date:** 2026-07-15
**Type:** Gap Analysis — Current State vs Target Architecture
**Audit Basis:** `GOFFICE2026_CURRENT_STATE_AUDIT.md`

---

## Gap Matrix

| Area | Target | Current State | Gap | Reuse Potential | Priority | Notes |
|------|--------|--------------|-----|-----------------|----------|-------|
| **About pages** | `/about`, `/about/scope`, `/about/policy`, `/about/goals`, `/about/committee`, `/about/action-plan`, `/about/certification`, `/about/feedback` | None exist | 8 pages missing | Can reuse `BaseLayout` + `SectionHeader` | **P1** | Static MD/MDX content; low implementation cost |
| **Indicator detail pages** | `/indicators/[indicator-code]` | None | Missing entirely | Needs new component + indicator data model | **P0** | Foundation block — indicators link categories to evidence |
| **Evidence detail pages** | `/evidence/[evidence-id]` | None | Missing entirely | Can reuse `EvidenceCard` pattern; needs new page + richer metadata | **P1** | All 21 items currently unlinked |
| **Activities pages** | `/activities/[slug]` | Placeholder cards only | Content model + pages missing | `ActivitiesScene.astro` exists on homepage; needs content model | **P1** | EP-2 task; blocked on verified source content |
| **Knowledge pages** | `/knowledge/[slug]` | None | Content model + pages missing | None | **P2** | Can defer until post-EP-3 |
| **Green Office taxonomy** | 7 categories · 24 issues · 65 indicators | 7 categories only | Issues (24) and indicators (65) missing completely | Categories JSON extendable; need new data files | **P0** | Foundation for indicator→evidence linking |
| **Indicator codes** | Canonical codes (e.g., "3.2.2") | None | No indicator code system | N/A | **P0** | Prerequisite for search by indicator |
| **Evidence maturity** | Level 3–4 (linked to indicators + dashboards) | Level 1 (files + basic metadata) | 2–3 levels below target | Evidence-index.json schema extensible | **P0** | Blocked on indicator system |
| **Evidence real content** | Actual documents linked | 21 placeholder records | 100% placeholder | Schema and metadata structure are ready | **P0** | Real files must be sourced from Maejo staff |
| **Search by indicator code** | `"3.2.2"` findable | No indicator codes | Cannot search | Search architecture is flexible | **P1** | Depends on indicator system |
| **Search scope** | All content types | Evidence only | Activities, knowledge, documents excluded | Search page extensible | **P2** | Add as content types are built |
| **Dashboard→Indicator linking** | Dashboard values traceable to indicators | No indicator linking | Metrics exist but untraced to certification indicators | Dashboard config extensible | **P1** | Add indicatorId field to DashboardMeta |
| **Evidence→Dashboard linking** | Evidence linked to dashboard metrics | No linking | Evidence references categories only | Evidence schema can add metricId field | **P1** | Connect the "Show → Measure" loop |
| **Real imagery** | PO-approved Maejo images | External CDN placeholders | All imagery missing | Landing components have `srcset`/responsive slots ready | **P0** | EP-2 task; blocked on PO approval |
| **Document Center** | M365 preview integration | Static placeholder pages | Full M365 connection missing | `EvidenceGateway.astro` has placeholder hooks | **P2** | EP-3 scope; not urgent for EP-2 |
| **Image optimization** | WebP + responsive sizes with fallbacks | Not verified as implemented | Unknown | Astro Image component available | **P1** | Important for Lighthouse ≥ 95 target |
| **Lighthouse CI** | Automated perf monitoring | No CI integration | Missing | GitHub Actions workflow extendable | **P2** | Post EP-2 quality gate |
| **Lint/test commands** | Standard quality gates | No lint or test commands | Missing | Can add; `astro check` already exists | **P2** | Add ESLint + basic route tests |
| **KB documentation** | Complete reference docs | 4+ KB docs are placeholders | 4+ stubs need content | File structure exists | **P1** | Fill in CRITERIA, DASHBOARD_SPEC, CONTENT_MODEL, EVIDENCE_MODEL |
| **Thai language layer** | Bilingual platform | English only | No i18n infrastructure | Astro i18n routing available | **P3** | PO decision required |
| **Sitemap/Robots** | SEO essentials | Not verified | Unknown | Astro integrations available | **P2** | Low effort, high SEO value |
| **2 Hero components** | Single hero pattern | `Hero.astro` + `LandingHero.astro` coexist | Duplicate maintenance burden | Can merge or clarify roles | **P3** | Low risk; document which is canonical |
| **Category mapping** | Aligned with 2569 criteria | Categories use mixed operational/certification labels | Potential auditor confusion | Rename or add criteria cross-reference | **P1** | Important for certification preparation |
| **2569 data completeness** | 12/12 months for all metrics | 6–10/12 months varying | Partial year comparison only | Pipeline ready for new data | **P1** | Source data from Maejo staff |
| **No sitemap/robots** | SEO requirements | Not present in repo | Missing | Astro sitemap integration trivial | **P2** | Low effort |

---

## KEEP — Things Working Well

| # | Asset | Reason |
|---|-------|--------|
| 1 | **Astro 4 static stack** | Correct architecture for MVP; SSR disabled, no backend needed |
| 2 | **Dashboard pipeline** | 6-metric multi-year pipeline with CSV→JSON import, validation, TypeScript types — production-grade |
| 3 | **Design Freeze v1 homepage** | 8-scene landing with premium visuals; PO-approved; should not be redesigned |
| 4 | **7-category data model** | `categories.json` with scores, descriptions, evidence checklists — solid foundation |
| 5 | **21-item evidence schema** | Metadata structure (id, categoryId, year, fileType, status, indicator label) is well-designed |
| 6 | **Component architecture** | 20 components organized by domain (landing, home, dashboard, evidence, UI) — clear separation |
| 7 | **GitHub Pages CI** | Clean deploy-pages workflow, environment separation (preview vs production) |
| 8 | **Navigation + BaseLayout** | Single layout + one nav component — maintainable, token-aligned |
| 9 | **Import pipeline** | CSV templates, validation, dry-run, documentation — complete workflow |
| 10 | **Client-side search** | Zero-dependency vanilla JS search with keyboard shortcut — correct for static MVP |
| 11 | **Tailwind design tokens** | Comprehensive color system (primary, secondary, surface, inverse) + typography scale + spacing |
| 12 | **Multi-year data schema** | TypeScript-typed MultiYearMetric with months, yoyChange, dataStatus — extensible |
| 13 | **Preview badge** | `PreviewBadge.astro` for GitHub Pages preview identification |

---

## ADAPT — Existing Items That Should Be Extended

| # | Asset | Adaptation Needed |
|---|-------|-------------------|
| 1 | **`categories.json`** | Add `issues: []` array with 24 sub-items; add `criteriaRef` for cross-reference to official criteria document |
| 2 | **`evidence-index.json`** | Add `indicatorCode` field (e.g., "3.2.2"); add `metricId` for dashboard linking; add `evidenceId` for detail page routing |
| 3 | **`dashboard-config.ts`** | Add `indicatorIds: string[]` to DashboardMeta for traceability; add `criteriaRef` field |
| 4 | **`dashboard-kpi.json`** | Add `indicatorId` per KPI to link certification scores to specific indicators |
| 5 | **`search.astro`** | Expand search index to include indicator codes; add debounced input; sync state to URL query params |
| 6 | **`EvidenceCard.astro`** | Add link to evidence detail page (when implemented); show indicator code badge |
| 7 | **`ExecutiveCommandCenter.astro`** | Wire to live dashboard data; add indicator traceability labels |
| 8 | **`Navigation.astro`** | Add about section dropdown (when pages exist); do not add new items without PO approval |
| 9 | **KB documents** | Fill in 4+ placeholder stubs (CRITERIA, DASHBOARD_SPEC, CONTENT_MODEL, EVIDENCE_MODEL) |
| 10 | **Evidence pipeline** | Add evidence import/validation script similar to dashboard import pipeline |
| 11 | **`data/import/`** | Add evidence CSV import template alongside dashboard templates |

---

## BUILD — Truly Missing Items

| # | Item | Priority | Effort |
|---|------|----------|--------|
| 1 | **Indicator data model** — JSON/CSV with 65 indicators, canonical codes, category→issue→indicator hierarchy | **P0** | Medium |
| 2 | **Indicator detail pages** — `/indicators/[code].astro` with description, target, related evidence, dashboard links | **P0** | Medium |
| 3 | **Evidence detail pages** — `/evidence/[id].astro` with full metadata, document link, related indicators | **P1** | Medium |
| 4 | **About pages** — 8 static pages (`/about`, `/about/scope`, etc.) using MDX or Astro | **P1** | Low |
| 5 | **Real evidence files** — Actual PDF/XLSX documents in `public/documents/` replacing placeholders | **P0** | Staff-dependent |
| 6 | **PO-approved imagery** — Maejo campus/facility photos in `public/images/` | **P0** | Staff-dependent |
| 7 | **Activities content model** — MD/JSON for activities/news; `/activities/[slug].astro` routes | **P1** | Medium |
| 8 | **Knowledge content model** — MD/JSON for knowledge articles; `/knowledge/[slug].astro` routes | **P2** | Medium |
| 9 | **Evidence import script** — CSV→evidence-index.json pipeline matching dashboard pattern | **P1** | Low |
| 10 | **Complete 2569 data** — Remaining months for all 6 metrics from Maejo staff | **P1** | Staff-dependent |
| 11 | **Sitemap generation** — `@astrojs/sitemap` integration | **P2** | Low |
| 12 | **Robots.txt** — Static file in `public/` | **P2** | Low |
| 13 | **Image optimization** — Verify/implement Astro Image with WebP + responsive srcset | **P1** | Low |
| 14 | **Lighthouse CI** — GitHub Actions workflow for automated performance monitoring | **P2** | Low |
| 15 | **Lint config** — ESLint or biome for code quality | **P2** | Low |

---

## DEFER — Items Not Needed Now

| # | Item | Reason for Deferral |
|---|------|---------------------|
| 1 | Thai language layer (i18n) | Not in MVP scope; English platform is adequate for now |
| 2 | Full Document Center (M365 integration) | EP-3 scope; current static preview suffices for EP-2 |
| 3 | Login/Authentication/RBAC | Explicitly excluded from MVP per Constitution |
| 4 | Database/API/Backend | Explicitly excluded per Constitution |
| 5 | Chart library (Chart.js, D3) | Sparkline + data table components adequate for MVP |
| 6 | Mobile app | Out of scope |
| 7 | Knowledge search indexing | Defer until knowledge content exists |
| 8 | Activity full-text search | Defer until activity content model is built |
| 9 | Production VPS deployment | Manual, PO-approved; defer until EP-2 content is ready |
| 10 | Hero component consolidation | Low risk; document which is canonical in PROJECT_MEMORY |

---

## RISKS

### Architecture Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| No indicator system blocks evidence→dashboard traceability | High | High | Build indicator data model as P0 foundation |
| Category mapping doesn't match official 2569 criteria | Medium | Medium | Cross-reference with official criteria document (UNKNOWN if available) |
| 2 hero components cause maintenance confusion | Low | Low | Document which is canonical |

### Content Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| All 21 evidence records are placeholders | High | High | Staff must provide real documents; prioritise cat1–cat4 (data-heavy categories) |
| No Maejo imagery available | High | Medium | EP-2 task; blocked on PO approval |
| 2569 data is partial for all metrics | Medium | Medium | Request remaining months from staff; partial data is visible with caveats |
| KB documentation stubs remain unfilled | Medium | Medium | Fill as part of each sprint; document what you implement |

### Data Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Generated JSON may diverge from staff Excel source | Low | Medium | Import pipeline has validation; regular dry-run checks |
| 2568 baseline values change after audit | Low | High | Version the generated JSON; track audit date in metadata |
| CSV in `src/data/csv/` and `data/import/` may conflict | Low | Low | Document which directory is canonical (`data/import/` is source; `src/data/csv/` may be legacy) |

### Performance Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| External CDN images cause LCP regression | Medium | High | Migrate to local `public/images/` in EP-2 |
| Large generated JSON files slow build | Low | Low | 6 files × ~5KB each — negligible for now |
| No image optimization | Medium | Medium | Implement Astro Image pipeline |

### Broken Link Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Evidence paths point to non-existent files | High | Medium | All placeholder status; real files needed before linking |
| Dashboard links to non-existent indicator pages | Low | Low | Indicator pages don't exist yet — add links when built |
| Googlestitch CDN URLs may break | Medium | High | Replace with local images in EP-2 |

---

## Recommended Implementation Sequence

### Phase A: Foundation (P0 — Blockers)
1. **Indicator data model** — Define 65 indicators, canonical codes, hierarchy
2. **Indicator detail pages** — `/indicators/[code].astro`
3. **Link categories to indicators** — Extend `categories.json` with issues array
4. **Link evidence to indicators** — Add `indicatorCode` to `evidence-index.json`
5. **Real evidence files** — Source actual documents from Maejo staff (prioritise cat1–cat4)
6. **PO-approved imagery** — Replace CDN placeholders with local images

### Phase B: Content-Rich Platform (P1)
7. **About pages** — 8 static pages with institutional content
8. **Evidence detail pages** — `/evidence/[id].astro`
9. **Link dashboard to indicators** — Add `indicatorIds` to `dashboard-config.ts`
10. **Complete 2569 data** — Source remaining months from staff
11. **Activities content model + pages** — Define and build activity/news section
12. **Fill KB documentation** — Complete 4+ stub documents
13. **Image optimization** — Astro Image pipeline
14. **Search expansion** — Add indicator code search

### Phase C: Quality & Polish (P2)
15. **Knowledge content model + pages**
16. **Lighthouse CI** integration
17. **Sitemap + robots.txt**
18. **Lint config**
19. **Document Center M365 preview** (EP-3)

### Phase D: Later (P3)
20. **Thai language layer**
21. **Hero component consolidation** (documentation only)
22. **Chart visualization upgrade**

---

## Summary

| Metric | Current | Target |
|--------|---------|--------|
| Routes implemented | 27 | ~50+ (with about, indicators, evidence detail, activities, knowledge) |
| Category coverage | 7/7 (100%) | 7/7 with issue decomposition |
| Issue coverage | 0/24 (0%) | 24/24 |
| Indicator coverage | 0/65 (0%) | 65/65 |
| Evidence maturity | Level 1 | Level 3–4 |
| Evidence real content | 0/21 (0%) | 21/21 |
| Dashboard data completeness (2569) | Partial (avg ~8/12) | 12/12 all metrics |
| KB documentation | 4+ stubs | All filled |
| Imagery | 0 local images | All PO-approved local images |
| Performance (estimated) | Unknown | Lighthouse ≥ 95 |

**Top priority:** Build the indicator system. Without it, evidence→dashboard→certification traceability is impossible — breaking the core "Show. Measure. Prove. Improve." product principle.
