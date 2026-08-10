# GOFFICE2026 V4 Repository Audit

**Date:** 2026-07-27  
**Auditor:** Head Agent (DeepSeek-V4-Pro)  
**Canonical Reference:** GREENOFFICE2026_PLATFORM_BLUEPRINT_V4.md  
**Audit Type:** Architecture Reconciliation + Repository State

---

## 1. Executive Verdict

> **READY_WITH_RECONCILIATION**

**Reason:** Blueprint V4 and ADR-0001 are committed and correct, the taxonomy (7/24/65) is complete, dashboard routes exist for all 6 resources, and the frontend architecture (Astro + Tailwind) is well-established. However, the **Master Reference still points to V3 as canonical**, **data quality is unverified across all 6 resources (0/6 verified)**, **17/21 evidence items are placeholders**, **About/Activities/Knowledge routes do not exist**, and **target/baseline values are incomplete**. Reconciliation is needed before rapid completion can begin.

---

## 2. Repository Baseline

| Property | Value |
|---|---|
| **Path** | `G:\ProjectAI\goffice2026` |
| **Branch** | `master` |
| **HEAD** | `e8dedb0` — `docs(m365): ADR-0001 remove approval engine from M365 scope` |
| **origin/master** | `e8dedb0` (in sync) |
| **Ahead/Behind** | 0 / 0 |
| **Working tree** | Clean (untracked: 4 canonical docs + 8 source PDFs in `doc/`) |
| **Build command** | `npm run build` (Astro SSG) |
| **Build status** | Verified passing (last daily summary) |
| **Current preview** | `https://numtip.github.io/goffice2026/` (GitHub Pages) |
| **Production** | `https://goffice.mju.ac.th` (Linux VPS + Nginx) |
| **Last 5 commits** | ADR-0001, EPIC-03 manual fix, EPIC-03 complete, EPIC-02, EPIC-01 |

---

## 3. New Product Understanding

1. **Green Office 2026 is an environmental communication and assessment evidence platform** — not a transaction or approval system.
2. **Its four pillars:** Present (data), Prove (evidence), Communicate (news/story), Engage (knowledge/awareness).
3. **It is NOT:** an ERP, BPM, Power Automate approval engine, CMS, microservices, or GraphQL system.
4. **M365 boundary:** Entra ID for authentication only; SharePoint for evidence file storage and metadata; no Power Automate, no approval workflows.
5. **Primary user journeys:** Executive → Dashboard/KPI; Auditor → Category → Indicator → Evidence; Public → News/Results; Staff → Knowledge/Awareness.
6. **P0 release objective:** A production-safe static site with real resource dashboards, 7-category evidence navigation, TH/EN landing, news/awareness sections, and SharePoint document access — all without approval workflow dependencies.
7. **Architecture:** Astro SSG + Tailwind CSS + generated JSON from validated Excel. Static-first, no database dependency for public site.
8. **Data flow:** Validated Excel → normalize → generated JSON → Astro dashboard. SharePoint files linked via metadata, not embedded.
9. **Evidence publication modes:** Public metadata + secure link, public distribution copy, or direct SharePoint access (no approval gate).
10. **Governance:** Product Owner sets priority; Head Agent orchestrates; Workers execute bounded parallel tasks; daily integration with quality gates.

---

## 4. Architecture Document Reconciliation

| Document | Current Authority | Conflict | Required Action |
|---|---|---|---|
| `GREENOFFICE2026_PLATFORM_BLUEPRINT_V4.md` | **CANONICAL (V4)** ✅ | None — is the new authority | **KEEP** |
| `GREENOFFICE2026_PLATFORM_BLUEPRINT_V3.md` | Claims **ACTIVE — CANONICAL REFERENCE** | ❌ V4 supersedes V3; V3 status line is wrong | **UPDATE** — change status to `SUPERSEDED BY V4` |
| `GOFFICE2026_NEW_PROJECT_MASTER_REFERENCE.md` | Lists V3 as #1 authority (Section B) | ❌ Section B embeds V3 as canonical; authority order lists V3 first | **UPDATE** — replace Section B with V4 reference; change authority order |
| `GOFFICE2026_CONTENT_ARCHITECTURE_V2.md` | References V3 as parent | ⚠️ Parent ref points to V3; sitemap is compatible with V4 | **UPDATE** — reparent to V4; verify no approval references |
| `00-GREENOFFICE_PROJECT_CONSTITUTION.MD` | V2.0 — "NOT a CMS project" | ✅ Compatible with V4; no contradiction found | **KEEP** (minor: update version reference) |
| `README.md` | References V1-era category scoring | ⚠️ Category scores (85%, 78%, etc.) are hard-coded in README; V4 does not prescribe scores | **UPDATE** — align description with V4 language |
| ADR-0001 (`docs/sharepoint/ADR-0001-remove-approval-engine.md`) | **Accepted** | ✅ Correctly de-scopes GO-M365 EPIC-03–08 | **KEEP** — ensure referenced from all architecture docs |
| `docs/handoff/GOFFICE2026_NEXT_DAY_HANDOFF.md` | 2026-07-24 state | ✅ Compatible; no approval work listed | **KEEP** |
| `docs/releases/GOFFICE2026_RELEASE_v1.2.0.md` | Current release | ⚠️ Needs V4 alignment check | **UPDATE** if needed |
| `docs/sharepoint/GO-M365-5-DETAILED-DESIGN.md` | Pre-ADR approval design | ❌ Contains Power Automate/approval workflow architecture | **ARCHIVE** — mark as superseded by ADR-0001 |
| `docs/sharepoint/GO-M365-5.6-REUSE-ASSESSMENT.md` | Pre-ADR reuse plan | ❌ References approval flow extension | **ARCHIVE** — mark as superseded |
| `docs/backend/SUPABASE_SCHEMA.md` | Contains review/workflow states | ⚠️ "Review workflow" may contradict V4 scope | **REVIEW** — verify workflow states are data-level only, not BPM |
| `docs/backend/REVIEWER_ASSIGNMENT_RUNBOOK.md` | Reviewer workflow runbook | ⚠️ May be out of scope if it implies approval engine | **REVIEW** — de-scope if BPM-related |
| `2026 Green Office Assessment Criteria.MD` | Working reference | ✅ Source taxonomy authority | **KEEP** |

**Summary:** 4 documents need UPDATE, 2 need ARCHIVE, 3 need REVIEW for approval references.

---

## 5. Current Capability Summary

| Capability | Status | Existing Assets | Main Gap |
|---|---|---|---|
| **Present** (Data Dashboards) | **PARTIAL** | 6 resource dashboards (water, energy, fuel, paper, waste, GHG) + executive dashboard with KPI cards, monthly trends, YoY comparison, category scores. All route structures exist TH/EN. | Data quality: 0/6 metrics verified. All targets null. Waste has no 2569 data. Fuel 2569 data is placeholder (4667% YoY increase). Water shows implausible 274% increase. |
| **Prove** (Evidence) | **PARTIAL** | 21 evidence items indexed; 4 available (indicator-linked), 17 placeholders. Evidence navigator with category/issue/indicator browse. Stable indicator routes exist. Evidence detail pages exist. | 17/21 (81%) are placeholders. No SharePoint URL integration. No public/authenticated visibility split. No search/filter for evidence. |
| **Communicate** (Public Story) | **MISSING** | Landing page with hero, KPI preview, category cards. TH/EN i18n structure complete. Locale files have keys for news/activities. | No News page. No Activities page. No About pages (8 routes defined in content inventory but not created). No Featured Projects. No Awards section. |
| **Engage** (Knowledge & Awareness) | **MISSING** | Locale keys exist for knowledge section. | No Knowledge/Awareness page. No knowledge media content. No campaign assets. |
| **M365 Boundary** | **PARTIAL** | ADR-0001 correctly de-scopes approval engine. SharePoint schema exists. Entra ID concept documented. | No actual Entra ID integration. No SharePoint metadata export contract. No verified public/authenticated link behavior. Document registry exists but not operationalized. |

---

## 6. Route and TH/EN Parity Summary

| Route | TH | EN | Status | Notes |
|---|---|---|---|---|
| Home (/) | `/index.astro` | `/en/index.astro` | ✅ COMPLETE | Both use `LandingPage` component |
| Executive Dashboard | `/dashboard.astro` | `/en/dashboard/index.astro` | ✅ COMPLETE | Full KPI, trend, category score |
| Resource Dashboard (generic) | `/dashboard/[id].astro` | `/en/dashboard/[id].astro` | ✅ COMPLETE | energy, water, fuel, paper, waste, ghg |
| Categories (list) | `/categories/index.astro` | `/en/categories/index.astro` | ✅ COMPLETE | 7 categories with issue/indicator counts |
| Category detail | `/categories/[id].astro` | `/en/categories/[id].astro` | ✅ COMPLETE | cat1–cat7 with issues, indicators, dashboard links |
| Indicator page | `/indicators/[code].astro` | `/en/indicators/[code].astro` | ✅ COMPLETE | All 65 indicators with evidence links |
| Evidence list | `/evidence.astro` | `/en/evidence/index.astro` | ✅ COMPLETE | Traceability stats, category grouping |
| Evidence detail | `/evidence/[id].astro` | `/en/evidence/[id].astro` | ✅ COMPLETE | 21 evidence items |
| Document center | `/documents.astro` | `/en/documents/index.astro` | ✅ COMPLETE | Per-category document browser |
| Document category | `/documents/[id].astro` | `/en/documents/[id].astro` | ✅ COMPLETE | Documents filtered by category |
| Search | `/search.astro` | `/en/search.astro` | ✅ COMPLETE | Indexes categories, issues, indicators, evidence |
| About/* | **MISSING** | **MISSING** | ❌ NOT CREATED | 8 About routes defined in content inventory but not implemented |
| Activities | **MISSING** | **MISSING** | ❌ NOT CREATED | No activities route or content |
| Knowledge | **MISSING** | **MISSING** | ❌ NOT CREATED | No knowledge/awareness route or content |
| 404 | `/404.astro` | (shared) | ✅ COMPLETE | Custom 404 |
| robots.txt | `/robots.txt.ts` | (shared) | ✅ COMPLETE | Dynamic robots.txt |

**TH/EN Parity:** Dashboard, Categories, Indicators, Evidence, Documents, Search — all have TH/EN parity. **About, Activities, Knowledge are missing entirely** in both languages.

**Duplicate/Legacy routes:** None found. Route structure is clean and consistent.

---

## 7. Dashboard and Data Summary

| Resource | Unit | Baseline 2568 | Current 2569 | Target | Verified | Monthly Data | Status |
|---|---|---|---|---|---|---|---|
| Energy | kWh | 403,037 | 149,100 | null | ❌ | 12/12 (2568) | Current data from CSV only, no XLSX reconciliation |
| Water | m³ | 8,338 | 31,200 | null | ❌ | 12/12 (2568) | Current data from CSV only; 274% increase suspicious |
| Fuel | L | 340 | 16,200 | null | ❌ | 8 months (2568) | Current data PLACEHOLDER; 4667% increase is implausible |
| Paper | kg | 2,198 | 916 | null | ❌ | 12/12 (2568) | Baseline verified; current data from CSV |
| Waste | kg | 5,626 | **0** (no data) | null | ❌ | 12/12 (2568) | **No 2569 mass data** in source XLSX |
| Recycling Rate | % | 21.57 | 84.6 | null | ❌ | Partial | Rate increased significantly; needs verification |
| GHG | tCO₂e | 232 | 349 | null | ❌ | 12/12 (2568) | Baseline verified; current needs confirmation |

**Key data gaps:**
- **0/7 metrics have targets defined** (all `target: null`)
- **0/7 metrics are verified** (all `dataQuality.valid: false`)
- **Waste has zero current-year data**
- **Fuel and water current values are implausible** — likely placeholder data
- **Hard-coded KPI scores** in `dashboard-kpi.json` (Energy 85, Water 78, etc.) duplicate what should be calculated

---

## 8. Taxonomy and Evidence Summary

### Taxonomy (Criteria)

| Element | Required | Found | Status |
|---|---|---|---|
| Categories | 7 | 7 (cat1–cat7) | ✅ COMPLETE |
| Issues | 24 | 24 (distributed across all 7 categories) | ✅ COMPLETE |
| Indicators | 65 | 65 (with TH/EN titles, requirement summaries, dashboard links) | ✅ COMPLETE |
| Canonical IDs | Required | `1.1.1` through `7.2.2` format | ✅ COMPLETE |
| Indicator-dashboard mapping | Required | `resource-indicator-map.json` with validated mappings | ✅ COMPLETE |

**Distribution:** cat1: 7 issues, cat2: 2, cat3: 4, cat4: 2, cat5: 5, cat6: 2, cat7: 2

### Evidence

| Metric | Value |
|---|---|
| Total evidence items | 21 |
| Available (real) | **4** (19%) — ev-energy-metering-2025, ev-water-meter-q1, ev-waste-monthly-2025, ev-ghg-inventory-2025 |
| Placeholder | **17** (81%) |
| Indicator-linked | 4 (all available) |
| Category-linked | 16 (mostly placeholder) |
| Unmapped | 1 |
| SharePoint URLs | **0** — no evidence item has a SharePoint storage URL |
| Approval dependency | **None** — evidence operations do not depend on any approval engine |

**Critical evidence gaps:**
- 17/21 evidence items are placeholders with no real documents
- Zero SharePoint URLs configured
- No public/authenticated visibility split implemented
- Evidence search/filter limited to client-side page-level search
- Most items are category-level only (not linked to specific indicators)

---

## 9. Content Readiness Summary

| Content Area | TH | EN | Status | Notes |
|---|---|---|---|---|
| **Landing** | ✅ Real | ✅ Real | **COMPLETE** | Full hero, KPI preview, categories, activities section (empty), CTA |
| **About pages** (8 routes) | ❌ | ❌ | **MISSING** | Content inventory done (GO-ABOUT-1B), 8 PDFs digitized, but **no pages created** |
| **News** | ❌ | ❌ | **MISSING** | No route, no content |
| **Activities** | ❌ | ❌ | **MISSING** | No route, no content |
| **Featured Projects** | ❌ | ❌ | **MISSING** | No route, no content |
| **Awards** | ❌ | ❌ | **MISSING** | No certificate obtained |
| **Knowledge Media** | ❌ | ❌ | **MISSING** | No route, no content |
| **Awareness Campaigns** | ❌ | ❌ | **MISSING** | No route, no content |
| **Contact/Feedback** | ❌ | ❌ | **MISSING** | No route (feedback channels PDF exists but needs redaction) |

**Content classification:**
- **REAL:** Landing (TH/EN)
- **PARTIAL:** Dashboard descriptions, category/indicator text, evidence metadata
- **PLACEHOLDER:** 17/21 evidence items
- **MISSING:** All About pages, News, Activities, Knowledge, Awareness, Contact
- **HISTORICAL ONLY:** PDF documents in `doc/` (not yet integrated into pages)

---

## 10. UX/SEO/A11y/Performance Risks

| Area | Risk Level | Finding |
|---|---|---|
| **Mobile layout** | 🟢 LOW | Tailwind responsive classes used throughout; grid adapts to mobile |
| **Header/footer consistency** | 🟡 MEDIUM | Navigation exists but missing About, Activities, Knowledge links (since routes don't exist) |
| **Keyboard navigation** | 🟡 MEDIUM | Not explicitly tested; Astro components may not have focus management |
| **Color contrast** | 🟢 LOW | Tailwind default palette; generally accessible |
| **Semantic headings** | 🟢 LOW | h1/h2 hierarchy present on most pages |
| **Alt text** | 🟡 MEDIUM | Some images may lack descriptive alt text; not verified across all components |
| **Page titles/descriptions** | 🟢 LOW | BaseLayout provides title/description props; most pages set them |
| **Canonical URL** | 🟡 MEDIUM | Astro sitemap generates canonical; no explicit canonical link tag verified |
| **Sitemap** | 🟢 LOW | `@astrojs/sitemap` configured with filter for 404 |
| **robots.txt** | 🟢 LOW | Dynamic robots.txt generated |
| **Image optimization** | 🟡 MEDIUM | `wow2-images` utility provides responsive URLs; actual optimization depends on CDN |
| **Client JS weight** | 🟢 LOW | Astro SSG ships minimal JS; no heavy frameworks detected |
| **Horizontal overflow** | 🟢 LOW | Tailwind container/max-width patterns used |
| **Lighthouse risks** | 🟡 MEDIUM | Dashboard pages with data tables may have accessibility gaps on mobile |

**Key risks:** Missing navigation links for non-existent routes (About, Activities, Knowledge); dashboard data tables on mobile may need horizontal scroll treatment; no explicit accessibility QA has been performed.

---

## 11. GitHub Backlog Reconciliation

| Category | Items | Action |
|---|---|---|
| **Valid active work** | GO-UX-4 (landing motion), GO-ABOUT-1A/B/C (about content), GO-DASH-2 (dashboards), GO-DATA-1 (data pipeline) | ✅ Keep — all align with V4 |
| **Obsolete approval tasks** | GO-M365-6 EPIC-03–08 (approval engine, notifications, dashboard integration, security, testing, deployment) | ✅ De-scoped per ADR-0001. Already committed. |
| **Approval-related docs** | `docs/sharepoint/GO-M365-5-DETAILED-DESIGN.md`, `GO-M365-5.6-REUSE-ASSESSMENT.md` | ⚠️ Should be archived or marked superseded |
| **Remaining approval artifacts** | SharePoint list "GO Approval Workflow" with 11 columns, 3 M365 connections, partial flow skeleton | ✅ Preserved but de-scoped. No further work. |
| **Missing P0 tasks** | About pages creation, News/Activities routes, Knowledge page, data verification (all 6 resources), target definition, waste data import, SharePoint evidence link integration, search/filter enhancement | ❌ Need to be created as issues |
| **Duplicate tasks** | No significant duplication found | ✅ Clean |

**Counts:**
- Valid active work: ~6 sprints (GO-ABOUT, GO-DATA, GO-DASH, GO-UX, GO-EVIDENCE, GO-SEO)
- Obsolete approval tasks de-scoped: 6 EPICs (EPIC-03 through EPIC-08)
- Missing P0 tasks identified: **~10** (see gap matrix)
- Duplicate backlog: None detected

---

## 12. Consolidated Gap Matrix

| ID | Area | Requirement | Current State | Evidence/File | Reuse | Gap | Priority | Recommended Action | Owner |
|---|---|---|---|---|---|---|---|---|---|
| G01 | Architecture | Master Reference points to V4 as canonical | Points to V3 as #1 authority | `GOFFICE2026_NEW_PROJECT_MASTER_REFERENCE.md` §B | High — just replace section | CONFLICTING | P0 | Update master reference to V4; repoint authority order | Head Agent |
| G02 | Architecture | V3 marked as superseded | V3 still claims ACTIVE/CANONICAL | `GREENOFFICE2026_PLATFORM_BLUEPRINT_V3.md` L6 | High — just change status line | CONFLICTING | P0 | Change V3 status to `SUPERSEDED BY V4` | Head Agent |
| G03 | Architecture | Content architecture references V4 | References V3 as parent | `GOFFICE2026_CONTENT_ARCHITECTURE_V2.md` L8 | High — reparent only | CONFLICTING | P1 | Update parent reference to V4 | Head Agent |
| G04 | Data | All 6 resource dashboards use verified data | 0/6 verified; all targets null; waste has no 2569 data | `kpi-summary.json` | Medium — pipeline exists | PARTIAL | P0 | Verify data from source XLSX; define targets; fix waste | Worker A |
| G05 | Data | Fuel and water data plausible | Fuel: 4667% YoY increase; Water: 274% increase | `kpi-summary.json` | Low — values are placeholder | PARTIAL | P0 | Re-import from source XLSX; verify with data owner | Worker A |
| G06 | Data | Hard-coded KPI scores eliminated | `dashboard-kpi.json` has hard-coded scores (85, 78, etc.) | `dashboard-kpi.json` | Medium — replace with computed values | CONFLICTING | P1 | Derive scores from actual data; remove hard-coding | Worker A |
| G07 | Evidence | All 65 indicators have linked evidence | Only 4 items are real; 17 placeholders | `evidence-index.json` | Low — schema exists | PARTIAL | P0 | Populate real evidence for all indicators | Worker B |
| G08 | Evidence | SharePoint URLs connected | Zero SharePoint URLs in evidence items | `evidence-index.json` | Medium — metadata schema ready | MISSING | P0 | Add SharePoint URLs per publication mode | Worker B |
| G09 | Evidence | Public/authenticated visibility split | Not implemented; all items treated as public | `evidence-index.json`, evidence pages | Medium — field exists | MISSING | P1 | Implement visibility filter | Worker B |
| G10 | Content | About pages (8 routes) | Not created; content inventory done, PDFs digitized | `docs/handoff/*` | High — content ready | MISSING | P0 | Create About pages from verified content | Worker C |
| G11 | Content | News page | Not created | N/A | — | MISSING | P0 | Create news route and first content batch | Worker C |
| G12 | Content | Activities page | Not created | N/A | — | MISSING | P0 | Create activities route and first content batch | Worker C |
| G13 | Content | Knowledge & Awareness page | Not created | N/A | — | MISSING | P1 | Create knowledge route and first media batch | Worker C |
| G14 | Content | Contact/Feedback page | Not created; PDF needs redaction | `doc/Details of the feedback channels.pdf` | Low — needs redaction | MISSING | P1 | Create contact page; redact PII from source PDF | Worker C |
| G15 | M365 | Entra ID authentication | Not integrated | N/A | — | MISSING | P1 | Implement Entra ID for staff auth | M365 Worker |
| G16 | M365 | SharePoint evidence link contract | Not defined | N/A | Medium — schema exists | MISSING | P0 | Define metadata export contract; map 7 categories to libraries | M365 Worker |
| G17 | UX | Keyboard navigation verified | Not tested | N/A | — | MISSING | P1 | Add focus management; verify tab order | Worker D |
| G18 | UX | Mobile data table overflow | Not tested on all dashboard pages | Dashboard pages | Medium — responsive classes exist | PARTIAL | P1 | Add horizontal scroll for data tables on mobile | Worker D |
| G19 | SEO | Explicit canonical link tags | Not verified | Astro config | High — sitemap exists | PARTIAL | P1 | Add canonical link tags to all pages | Worker D |
| G20 | Content | Navigation missing key links | About, Activities, Knowledge, Contact not in nav | `src/components/ui/` | High — nav component exists | MISSING | P0 | Add navigation entries (blocked on route creation) | Worker D |
| G21 | Release | Build passes | ✅ Verified passing | CI pipeline | — | COMPLETE | — | — | — |
| G22 | Release | GitHub Pages preview | ✅ Working | `deploy-pages.yml` | — | COMPLETE | — | — | — |

**Gap count by priority:**
- **P0:** 10 (G01, G02, G04, G05, G07, G08, G10, G11, G12, G16, G20)
- **P1:** 10 (G03, G06, G09, G13, G14, G15, G17, G18, G19)
- **P2:** 0
- **REMOVE:** 0
- **COMPLETE:** 2 (G21, G22)

---

## 13. P0 Critical Path

Maximum 12 steps to Acceptance Candidate:

1. **Freeze architecture** — Update Master Reference to V4; mark V3 as SUPERSEDED; verify no approval references remain active
2. **Verify all 6 resource datasets** — Reconcile energy, water, fuel, paper, waste, and GHG against source XLSX; fix waste (no 2569 data) and fuel (placeholder)
3. **Define targets** — Add target values for all 6 metrics; update generated JSON
4. **Populate evidence** — Convert minimum 2 real evidence items per category (14 items); link to indicators
5. **Connect SharePoint** — Define 7-category library mapping; add SharePoint URLs to evidence metadata
6. **Create About pages** — Build 6–8 About routes from verified PDF content (scope, policy, goals, committee, action plan, certification, feedback)
7. **Create News & Activities** — Build routes; add first batch of real content
8. **Build Landing + Navigation** — Wire up all new routes in navigation; ensure TH/EN parity
9. **Mobile QA** — Verify dashboard tables, navigation, and evidence browser on mobile
10. **SEO pass** — Add canonical tags; verify sitemap; check page titles/descriptions
11. **Integration build + evidence link validation** — Full build; broken link check; data validation
12. **Preview acceptance** — GitHub Pages deploy; Product Owner review; fix targeted issues

---

## 14. Recommended Parallel Work Allocation

| Worker | Scope | Write Boundary | Day 1 Tasks |
|---|---|---|---|
| **A: Data/Dashboard** | Data pipeline, XLSX reconciliation, target definition, generated JSON | `src/data/generated/*.json`, `data/csv/import/*.xlsx`, `src/data/dashboard-kpi.json` | Reconcile all 6 resources from source XLSX; fix waste/fuel; define targets; validate |
| **B: Criteria/Evidence** | Evidence metadata, indicator pages, SharePoint links, search/filter | `src/data/evidence-index.json`, `src/data/document-registry.json` | Populate 14 real evidence items; add SharePoint URLs; verify indicator↔evidence mapping |
| **C: Content/i18n** | About pages, News, Activities, Knowledge, landing enhancements | `src/pages/about/`, `src/pages/news/`, `src/pages/activities/`, `src/pages/knowledge/`, locale JSON files | Create About routes from verified documents; create News route; first content batch |
| **D: UX/SEO/a11y** | Navigation, mobile QA, SEO tags, alt text, focus management | `src/components/ui/`, `src/layouts/`, `src/styles/` | Add navigation links; verify mobile data tables; add canonical tags; accessibility smoke test |
| **E: Validation/Release** | Tests, link checks, build verification, QA reports | `docs/audit/`, `scripts/` | Set up evidence link validation; verify build passes; prepare release checklist |
| **M365** (single worker) | Entra ID, SharePoint mapping | Config files, metadata contracts | Map 7 categories to SharePoint libraries; define metadata export contract |

**Head Agent integration responsibilities:**
- Daily merge of all worker branches
- Verify non-overlapping write boundaries
- Run integration build
- Update gap matrix
- Report to Product Architect

---

## 15. Risks and Blockers

| # | Risk | Evidence | Impact | Decision | PO Input? |
|---|---|---|---|---|---|
| R1 | **Data quality unknown** | 0/6 metrics verified; all targets null; waste has no 2569 data; fuel/water values implausible | Blocking P0 dashboard credibility | Must prioritize data verification Day 1; if source XLSX is incomplete, use best available and mark clearly | YES — need confirmation on target values and data sources |
| R2 | **81% evidence placeholders** | 17/21 evidence items are placeholder; 0 SharePoint URLs | Blocking Evidence Navigator credibility | Populate minimum 14 real items; prioritize indicator-linked evidence | YES — need real document files for placeholder items |
| R3 | **Missing core content routes** | About, News, Activities, Knowledge pages do not exist (0/4) | Blocking "Communicate" and "Engage" capabilities | Create routes in parallel with data work | NO — content direction is clear from V4 |
| R4 | **Approval workflow artifacts in docs** | `docs/sharepoint/GO-M365-5-DETAILED-DESIGN.md` and others contain approval architecture | Confusion risk; could trigger re-implementation | Archive superseded docs; add ADR-0001 reference to all | NO — ADR-0001 is accepted |
| R5 | **V3 still marked ACTIVE** | `GREENOFFICE2026_PLATFORM_BLUEPRINT_V3.md` status line | Workers may follow V3 instead of V4 | Fix V3 status line and master reference immediately | NO — clear from V4 |
| R6 | **No Entra ID integration** | No authentication implemented | Authenticated evidence access blocked | Defer to M365 Worker; P1 priority | YES — need university Entra ID tenant access |

---

## 16. Final Recommendation

### Can Rapid Completion Plan start now?

**YES — with immediate reconciliation.**

The Rapid Completion Plan (GOFFICE2026_RAPID_COMPLETION_PLAN_V1.md) is architecturally valid and can start. However, Day 1 must include architecture freeze (V3→V4 repointing) before parallel work begins.

### Estimated realistic duration

**10 working days** — as planned in the Rapid Completion Plan. The 7-day compressed schedule is not recommended due to:
- Data verification for all 6 resources (requires human confirmation)
- 17 placeholder evidence items need real documents (requires PO coordination)
- 4 missing content areas need creation from scratch (About, News, Activities, Knowledge)

### Gate 1 conditions

Before parallel work starts:
- [x] Blueprint V4 committed and canonical
- [x] ADR-0001 accepted and referenced
- [x] Repository baseline captured
- [x] Gap matrix complete
- [ ] **Master Reference updated to point to V4** (P0)
- [ ] **V3 status changed to SUPERSEDED** (P0)
- [ ] **Approval-engine docs archived or annotated** (P1)
- [ ] **Workers briefed on non-overlapping write boundaries**

### First execution batch recommended

1. **Head Agent:** Fix V3 status, update Master Reference, archive approval docs, create GitHub issues for P0 gaps
2. **Worker A (Data):** Verify all 6 resource datasets from source XLSX; define targets; fix waste and fuel
3. **Worker B (Evidence):** Populate 14 real evidence items; start SharePoint link mapping
4. **Worker C (Content):** Create About routes from verified PDF content
5. **Worker D (UX):** Add navigation skeleton for new routes

Start Workers A, B, and C on Day 1 in parallel. Worker D on Day 2. M365 Worker on Day 3.

---

*End of Audit Report. Prepared per GO-V4-AUDIT task. No application code, datasets, workflows, or GitHub issues were modified during this audit.*
