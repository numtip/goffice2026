# Architecture Freeze V1 — Green Office 2026 Connected Environmental Knowledge Platform

> **Status:** FROZEN — canonical baseline as of GO-ABOUT-2 + GO-EVIDENCE-1 (commit `25c2cc9`).
> **Sprint constraint (GO-SEARCH-1):** No architectural redesign. Only bug fixes.
> **Companion record:** [ADR-005 — Metadata-Driven Knowledge Graph Navigation](./adr/ADR-005-METADATA-DRIVEN-KNOWLEDGE-GRAPH-NAVIGATION.md)

---

## 1. Frozen Architecture

```
src/
├── layouts/BaseLayout.astro          # Global shell: header, nav, footer, i18n
├── components/
│   ├── ui/                           # FROZEN shared components (GO-EVIDENCE-1)
│   │   ├── Breadcrumb.astro
│   │   ├── JourneyLinks.astro
│   │   ├── RelatedResources.astro
│   │   ├── EvidenceCard.astro
│   │   └── DocumentCard.astro
│   ├── about/AboutPageShell.astro    # All About pages render through this shell
│   ├── dashboard/MetricDashboard.astro
│   └── evidence/...                  # Evidence detail/index components
├── pages/                            # TH + EN route pairs (i18n convention)
│   ├── index.astro / en/index.astro
│   ├── about/... / en/about/...
│   ├── dashboard/... / en/dashboard/...
│   ├── evidence/... / en/evidence/...
│   ├── documents/... / en/documents/...
│   ├── categories/... indicators/... (assessment taxonomy)
│   ├── news/ activities/ knowledge/ (hub route foundations)
│   └── search.astro / en/search.astro
├── data/                             # CANONICAL METADATA (single source of truth)
├── i18n/utils.ts                     # getLocale, getLocalizedPath, labels
└── utils/with-base.ts                # static file base path helper
```

### Module contract

| Module | Route pattern (TH / EN) | Drives from |
|--------|-------------------------|-------------|
| About Center | `/about/*` / `/en/about/*` | `about/pages.json`, `about/content.json`, `about-documents.json` |
| Dashboard | `/dashboard/*` / `/en/dashboard/*` | `dashboard-config.ts`, `dashboard-kpi.json`, `evidence-links.json` |
| Evidence | `/evidence/*` / `/en/evidence/*` | `evidence-index.json` |
| Document Center | `/documents/*` / `/en/documents/*` | `documents.json`, `about-documents.json` |
| Assessment taxonomy | `/categories/*`, `/indicators/*` | `criteria/categories.json`, `criteria/issues.json`, `criteria/indicators.json` |
| Hubs (foundation) | `/news`, `/activities`, `/knowledge` | `content/hubs.json` |

### i18n rule

Every module ships as a **TH route + EN route pair** built from the same metadata. Locale-specific text lives in the metadata (`title: { th, en }`), never duplicated in components.

---

## 2. Reusable Components (canonical, reuse-don't-rebuild)

| Component | Purpose | Reuse points |
|-----------|---------|--------------|
| `Breadcrumb` | Localized trail, `aria-current` | About, Evidence detail, Documents |
| `JourneyLinks` | Platform journey (About/Dashboard/Evidence/Documents) with active state | All module index/detail pages |
| `RelatedResources` | Cross-module related links from `evidence-links.json` | About pages, Evidence detail |
| `EvidenceCard` | Evidence record card | Evidence index, category pages |
| `DocumentCard` | Document metadata card + download link | Document Center, RelatedResources |
| `AboutPageShell` | Universal About page shell (hero + RelatedResources + JourneyLinks) | All About pages |

**Search components (GO-SEARCH-1, new):** `SearchBox`, `SearchResultCard`, `SearchCategoryChip`, `SearchSection`, `SearchHighlight` — all under `src/components/search/`, consumed by a single `SearchPage` component.

---

## 3. Canonical Metadata (single source of truth — no duplication)

| File | Contents | Consumers |
|------|----------|-----------|
| `about/pages.json` | About page registry: routes, titles, descriptions, relatedIndicators | About shell, RelatedResources, Search index |
| `about/content.json` | About page body content + targets | About pages |
| `about/documents.json` | 13 document records (public/internal, SHA, path) | Document Center, search |
| `about/document-summaries.json` | 8 verified summaries | Document Center |
| `about-documents.json` | About page → document + document-type registry | RelatedResources, About pages |
| `criteria/categories.json` | 7 certification categories | Category pages, search |
| `criteria/issues.json` | 24 issues | Category pages, search |
| `criteria/indicators.json` | 65 indicators (+ relatedDashboards) | Indicator pages, dashboards, search |
| `evidence-index.json` | 24 evidence records | Evidence pages, search |
| `evidence-links.json` | **Cross-module link registry** (About↔Dashboard↔Evidence) — canonical, derived-only | RelatedResources, JourneyLinks, search |
| `dashboard-config.ts` / `dashboard-kpi.json` | 6 resource dashboards + KPI values | Dashboard pages, search |
| `content/hubs.json` | News / Activities / Knowledge hub foundations | Hub pages, search |
| `search-index.json` | **GO-SEARCH-1:** one generated global search index (derived, never hand-edited) | Search page |

### Metadata rules (frozen)

- Metadata is the source of truth; components only read.
- Relationships must be derivable or explicitly curated in `evidence-links.json` — never inferred silently.
- `search-index.json` is **generated** from the above sources by `scripts/generate-search-index.mjs`; regenerating must not require manual edits.
- Validators (see QA) enforce referential integrity on every source.

---

## 4. Approved Routes

Frozen route table — no new top-level routes in GO-SEARCH-1; only existing routes plus `/search` are touched:

| Route (TH) | Route (EN) | Page |
|-----------|-----------|------|
| `/` | `/en/` | Home |
| `/about/`, `/about/policy/`, `/about/goals/`, `/about/scope/`, `/about/committee/`, `/about/action-plan/`, `/about/feedback/` | `/en/about/...` | About Center |
| `/dashboard/` + 6 domain pages | `/en/dashboard/...` | Dashboard |
| `/evidence/` + 24 detail pages | `/en/evidence/...` | Evidence |
| `/documents/` + category + reference pages | `/en/documents/...` | Document Center |
| `/categories/` (7) + `/indicators/` (65) | `/en/...` | Assessment taxonomy |
| `/news/`, `/activities/`, `/knowledge/` | `/en/...` | Hub foundations |
| `/search/` | `/en/search/` | **Global Search (GO-SEARCH-1)** |

---

## 5. Extension Points (future sprints, not this one)

1. **Global search module reuse** — command-palette style `/` search in the global header; search entry points on hub pages.
2. **Full-text document search** — extract PDF/XLSX text into the static index corpus when verified text pipelines exist (ADR-005 Future extension).
3. **Hub content** — News/Activities/Knowledge slots (currently "pending publication") become searchable records as official content is approved.
4. **Federated metadata** — SharePoint/M365 exports can feed the search index generator as additional canonical inputs.
5. **Thai normalization / ranking** — client-side token ranking and Thai character folding without backend changes.

---

## 6. QA Baseline (frozen gates)

| Gate | Command | Status at freeze |
|------|---------|------------------|
| Build | `npm run build` | PASS |
| Platform validation | `npm run validate` (validate-platform) | PASS |
| Criteria validation | `npm run validate:criteria` | PASS |
| Evidence validation | `npm run validate:evidence` | PASS |
| Evidence-links validation | integrated in `validate-platform` Phase 1.75 | PASS |
| Broken links | `check-production-links` | PASS |
| Runtime smoke | Node smoke script over `dist/` | PASS |
| A11y (static pass) | `astro check` + manual review | PASS (pre-existing `astro check` warnings out of scope) |

**Known pre-existing (non-blocking, out of GO-SEARCH-1 scope):** `astro check` reports TS strictness warnings in legacy About components; `npm test` RC-3 legacy validator warning assertion predates GO-ABOUT-2.
