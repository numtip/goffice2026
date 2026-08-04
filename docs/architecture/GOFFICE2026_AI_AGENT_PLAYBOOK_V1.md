# GOFFICE2026 AI AGENT PLAYBOOK V1.0

| Field | Value |
|---|---|
| Document ID | `GOFFICE2026_AI_AGENT_PLAYBOOK_V1` |
| Version | 1.0 |
| Status | ACTIVE — canonical operational standard |
| Effective date | 2026-08-04 |
| Owner | GPT Chief Architect (governance) / Product Owner (approval) |
| Applies to | All AI agents (Head Agent, Workers, QA agents, Cursor Agent) on Green Office 2026 |
| Supersedes | Sprint-specific conventions (GO-ABOUT-2, GO-EVIDENCE-1, GO-SEARCH-1) where duplicated; this document consolidates them |
| Classification | Enterprise architecture — normative where marked MUST/SHOULD/MAY |

---

## Table of Contents

1. [Purpose and Authority](#1-purpose-and-authority)
2. [Normative References](#2-normative-references)
3. [Roles and Responsibilities](#3-roles-and-responsibilities)
4. [Operating Principles](#4-operating-principles)
5. [Architecture Standard](#5-architecture-standard)
6. [Metadata Standard](#6-metadata-standard)
7. [Component Standard](#7-component-standard)
8. [Source Strategy](#8-source-strategy)
9. [Workflow — Sprint Model](#9-workflow--sprint-model)
10. [Subagent Orchestration Standard](#10-subagent-orchestration-standard)
11. [Prompt Convention](#11-prompt-convention)
12. [Folder Convention](#12-folder-convention)
13. [Quality Gates](#13-quality-gates)
14. [Release Process](#14-release-process)
15. [Governance and Change Control](#15-governance-and-change-control)
16. [Future Extension](#16-future-extension)
17. [Agent Compliance Checklist](#17-agent-compliance-checklist)
- [Appendix A — Worker Report Template](#appendix-a--worker-report-template)
- [Appendix B — Sprint Brief Template](#appendix-b--sprint-brief-template)

---

## 1. Purpose and Authority

This Playbook is the **operational constitution** for every AI agent working on Green Office 2026. It consolidates guidance from the Project Constitution, Platform Blueprint V4, Architecture Decision Records (ADR-001–005), the Architecture Freeze V1, the repository's QA workflow, and the subagent orchestration patterns proven in GO-EVIDENCE-1 and GO-SEARCH-1.

**Authority:** In case of conflict, precedence is:

1. `docs/00-GREENOFFICE_PROJECT_CONSTITUTION.MD` (project constitution)
2. `docs/GREENOFFICE2026_PLATFORM_BLUEPRINT_V4.md` (product/architecture blueprint)
3. Architecture Decision Records (`docs/architecture/adr/`)
4. **This Playbook** (agent operations)
5. `docs/architecture/ARCHITECTURE_FREEZE_V1.md` (frozen implementation baseline)

This document **documents canonical operational standards only**. It does not define new architecture and does not authorize redesign. See [§15 Governance](#15-governance-and-change-control).

## 2. Normative References

| Ref | Document | Role |
|---|---|---|
| CONST | `docs/00-GREENOFFICE_PROJECT_CONSTITUTION.MD` v2.0 | Governance, mission, MVP scope, forbidden architecture |
| BP-V4 | `docs/GREENOFFICE2026_PLATFORM_BLUEPRINT_V4.md` v4.0 | Product definition, information architecture, quality gates (§12), governance (§13), Definition of Done (§14) |
| ADR-001 | `docs/architecture/adr/ADR-001-ASTRO-STATIC-FIRST.md` | Astro static-first public platform |
| ADR-002 | `docs/architecture/adr/ADR-002-DOCUMENT-CENTER-BOUNDARY.md` | Document Center M365-backed; repo is discovery only |
| ADR-003 | `docs/architecture/adr/ADR-003-SUPABASE-OPERATIONAL-BACKEND.md` | Operational backend scope boundary |
| ADR-004 | `docs/architecture/adr/ADR-004-LIVE-DASHBOARD-WITH-STATIC-FALLBACK.md` | Live metrics with static JSON fallback |
| ADR-005 | `docs/architecture/adr/ADR-005-METADATA-DRIVEN-KNOWLEDGE-GRAPH-NAVIGATION.md` | Metadata-driven knowledge graph navigation (search, cross-module links) |
| FREEZE | `docs/architecture/ARCHITECTURE_FREEZE_V1.md` | Canonical frozen baseline: modules, components, metadata, routes, extension points |
| OVERVIEW | `docs/architecture/ARCHITECTURE_OVERVIEW.md` | One-paragraph architecture summary |
| DATAFLOW | `docs/architecture/DATA_FLOW.md` | Static data flow model |
| RULES | `.cursor/rules/goffice2026.mdc` | Editor-level governance rules (mirror of this Playbook's core principles) |

## 3. Roles and Responsibilities

| Role | Map | Responsibilities |
|---|---|---|
| Product Owner | CONST §5 | Vision, priority, release approval. Does not write code. |
| GPT Chief Architect | CONST §5, BP-V4 §13 | Architecture, governance, scope control, technical review, risk assessment. Prevents over-engineering, scope creep, technology bloat. |
| **Head Agent** | BP-V4 §13 | Orchestrates workers, merges outputs, resolves conflicts, runs integration + quality gates, produces the bounded final report. MUST audit before editing. |
| **Worker** | BP-V4 §13 | Executes a bounded parallel task. MUST read only required files, reuse before build, touch only its assigned files, and return a concise report with evidence. |
| **QA Agent** | BP-V4 §12, CONST §10 | Runs build, validators, broken links, runtime smoke, accessibility, performance. MUST make zero feature edits. |
| Cursor Agent | CONST §5 | Coding, refactoring, testing, building. MUST follow this Playbook and the Constitution. |

**General rule for every agent:** assume the architecture is frozen; fix bugs, never redesign. When a request implies redesign, escalate to the Chief Architect/Product Owner instead of implementing.

## 4. Operating Principles

Consolidated from CONST §4/§8/§10/§11/§12, BP-V4 §9, RULES, and sprint practice. These are the canonical principles; all agents MUST comply.

| # | Principle | Normative rule |
|---|---|---|
| P1 | Constitution-first | Reference CONST before making project decisions. |
| P2 | Static-first | Prefer Markdown → JSON → CSV before considering database/API/backend. |
| P3 | Reuse before generate | Check existing components, documents, templates, assets before creating new ones. |
| P4 | Metadata-driven | Content and relationships live in canonical JSON; components only read. Never duplicate data. |
| P5 | No invented relationships | Every cross-module link derives from canonical metadata or is explicitly curated in `evidence-links.json` with a `basis`. Never infer silently. |
| P6 | No duplicated UI | One component per concern; TH/EN pages are thin wrappers over shared components. |
| P7 | Targeted reads | Read only files required for the assigned work. |
| P8 | Bounded output | Final reports are line-limited; no file dumps; evidence-based. |
| P9 | Markdown first | Knowledge stored in Markdown (not chat history). |
| P10 | Context pack before long prompt | Use curated context packs; avoid large prompt dumps. |
| P11 | Chunk not dump | Large files are chunked, indexed, retrieved — never pasted wholesale into AI. |
| P12 | Skill first | Use registered skills (`docs/KB/SKILLS_REGISTRY.md`) before inventing workflows. |
| P13 | Build PASS ≠ Release Ready | Runtime QA (routes, links, a11y, performance, smoke) is mandatory before completion. |
| P14 | No production edit | Direct production editing is prohibited; GitHub is the source of truth. |
| P15 | Token saving | Workflow: Reuse → Context Pack → Chunk → Skill → Build → QA → Commit. Prefer `rtk` for repeated shell reads; record reusable commands in `docs/runbooks/RTK_USAGE.md`; never use `rtk` to edit or deploy. |

## 5. Architecture Standard

The architecture is **frozen** (FREEZE §1, ADR-005). No redesign. Only bug fixes.

### 5.1 Platform modules

| Module | Routes (TH / EN) | Canonical driver |
|---|---|---|
| Home | `/` / `/en/` | `src/pages/index.astro` |
| About Center | `/about/*` / `/en/about/*` | `about/pages.json`, `about/content.json`, `about-documents.json` |
| Dashboard | `/dashboard/*` / `/en/dashboard/*` | `dashboard-config.ts`, `dashboard-kpi.json`, `evidence-links.json` |
| Evidence | `/evidence/*` / `/en/evidence/*` | `evidence-index.json` |
| Document Center | `/documents/*` / `/en/documents/*` | `about/documents.json`, `about-documents.json` |
| Assessment taxonomy | `/categories/*`, `/indicators/*` | `criteria/categories.json`, `issues.json`, `indicators.json` |
| Hubs (foundation) | `/news`, `/activities`, `/knowledge` | `content/hubs.json` |
| Global Search | `/search` / `/en/search` | `search-index.json` (generated) |

### 5.2 Architectural invariants (MUST)

1. Every module ships as a TH route + EN route pair built from the same metadata.
2. Locale text lives in metadata (`title: {th,en}`) or `getLocale`/`getLocalizedPath`/`withBase` helpers — never duplicated in components.
3. Static build only; client JS minimal and keyboard-accessible.
4. File routes (`/documents/*.pdf`) MUST NOT receive the `/en/` locale prefix; page routes MUST resolve through `getLocalizedPath`.
5. Forbidden architecture per CONST §12 (Kubernetes, microservices, Redis, MQ, GraphQL, PostgreSQL, MongoDB, Elasticsearch, and any database/API/backend for the MVP public platform) unless a written ADR is approved.

## 6. Metadata Standard

### 6.1 Canonical metadata sources (single source of truth)

| File | Contents | Consumers |
|---|---|---|
| `src/data/about/pages.json` | About page registry: route, titles, descriptions, relatedIndicators | About shell, RelatedResources, search index |
| `src/data/about/content.json` | About body content + targets | About pages |
| `src/data/about/documents.json` | Document records (public/internal, SHA, path) | Document Center, search index |
| `src/data/about/document-summaries.json` | Verified document summaries | Document Center, search index |
| `src/data/about/about-documents.json` | About page → document + type registry | RelatedResources, About pages |
| `src/data/criteria/categories.json` | 7 certification categories | Category pages, search index |
| `src/data/criteria/issues.json` | 24 issues | Category pages, search index |
| `src/data/criteria/indicators.json` | 65 indicators (+ relatedDashboards) | Indicator pages, dashboards, search index |
| `src/data/evidence-index.json` | 24 evidence records | Evidence pages, search index |
| `src/data/evidence-links.json` | Cross-module link registry (About↔Dashboard↔Evidence) — canonical, derived/curated | RelatedResources, JourneyLinks, search |
| `src/data/dashboard-config.ts` | Dashboard page configuration | Dashboard pages |
| `src/data/dashboard-kpi.json` | KPI values per resource domain | Dashboard pages, search index |
| `src/data/content/hubs.json` | News/Activities/Knowledge hub foundations | Hub pages, search index |
| `src/data/search-index.json` | **Generated** global search index — never hand-edited | Search page |
| `src/data/generated/*.json` | Baseline/fallback operational data (per ADR-004) | Dashboard fallback, validators |

### 6.2 Metadata rules (MUST)

1. Metadata is the source of truth; components and pages only read it.
2. Any new relationship MUST be derivable from canonical sources or explicitly curated in `evidence-links.json` with a `basis` note.
3. `search-index.json` is regenerated by `scripts/generate-search-index.mjs`; regeneration MUST be deterministic and MUST NOT require manual edits. `scripts/validate-search-index.mjs` enforces structure + drift (temp-file regeneration comparison).
4. Index text fields (`title`, `context`, `keywords`) are always `[string,string]`; only `category`, `year`, `fileType` may be `null`.
5. Validators MUST be updated in the same sprint that changes a metadata schema (see §13).

## 7. Component Standard

### 7.1 Reusable component inventory (frozen)

| Component | Path | Purpose |
|---|---|---|
| `Breadcrumb` | `src/components/ui/Breadcrumb.astro` | Localized trail, `aria-current` |
| `JourneyLinks` | `src/components/ui/JourneyLinks.astro` | Platform journey nav with active state |
| `RelatedResources` | `src/components/ui/RelatedResources.astro` | Cross-module related links from `evidence-links.json` |
| `EvidenceCard` | `src/components/ui/EvidenceCard.astro` | Evidence record card |
| `DocumentCard` | `src/components/ui/DocumentCard.astro` | Document metadata card + download link |
| `AboutPageShell` | `src/components/about/AboutPageShell.astro` | Universal About page shell |
| `MetricDashboard` | `src/components/dashboard/MetricDashboard.astro` | Dashboard detail page |
| `SearchBox` | `src/components/search/SearchBox.astro` | Search input + `/` hint |
| `SearchResultCard` | `src/components/search/SearchResultCard.astro` | Typed result card with highlight targets |
| `SearchCategoryChip` | `src/components/search/SearchCategoryChip.astro` | Filter chip (aria-pressed) |
| `SearchSection` | `src/components/search/SearchSection.astro` | Grouped result section |
| `SearchHighlight` | `src/components/search/SearchHighlight.astro` | `<mark>` highlight target span |
| `SearchPage` | `src/components/search/SearchPage.astro` | Single search page component (TH/EN wrappers are thin) |

### 7.2 Component rules (MUST)

1. Reuse before build: check §7.1 and existing `src/components/**` before creating a new component.
2. One component per concern; no duplicated markup across TH/EN routes.
3. Components receive `locale` as a prop; they MUST NOT call `getLocale` internally.
4. Components are presentational unless explicitly a page script: no inline `<script>` in shared components (interactivity lives in page-level bundled scripts).
5. Tailwind utility classes only; semantic landmarks + ARIA (`aria-labelledby`, `role=list/listitem`, `aria-live`) per component contract.
6. Locale labels use `[th,en]` tuple convention.

## 8. Source Strategy

1. **GitHub is the only source of truth** (CONST §6). Workflow: Idea → Dyad → Cursor Agent → GitHub → QA → Production.
2. **No direct production editing.** All work lands in the repo; deployment is a separate approved step.
3. **Knowledge management priority** (CONST §7): GitHub repo → `docs/KB/` → Markitdown-Lab → project documentation.
4. **Markdown first** for knowledge; JSON/CSV for data; never rely on chat history.
5. **RTK policy** (RULES): use `rtk` for repeated read-only shell operations; record patterns in `docs/runbooks/RTK_USAGE.md`; never `rtk`-edit or deploy.
6. **Skills registry**: consult `docs/KB/SKILLS_REGISTRY.md`; register new skills there.

## 9. Workflow — Sprint Model

Sprint IDs follow `GO-<DOMAIN>-<SEQ>` (precedent: GO-ABOUT-2, GO-EVIDENCE-1, GO-SEARCH-1). Each sprint SHALL execute five phases in order:

| Phase | Deliverable | Owner |
|---|---|---|
| 1. Audit | Gap matrix; identify reusable components/metadata/routes; freeze implementation scope | Head Agent |
| 2. Dispatch parallel workers | Disjoint, contract-first tasks (see §10) | Head Agent |
| 3. Integration | Merge worker outputs; resolve conflicts; reuse shared components; preserve frozen architecture | Head Agent |
| 4. Validation | Build, validators, metadata validation, broken links, runtime smoke, a11y, performance (§13) | QA Agent |
| 5. Final report | Bounded report (≤100 lines) with commit SHA and working tree status | Head Agent |

**Sprint success criteria** (cumulative): no duplicated metadata, no duplicated UI, no broken links, modules interconnected, mobile responsive, keyboard accessible, TH/EN parity, Build PASS, Validation PASS, Runtime PASS, production-ready (not deployed).

## 10. Subagent Orchestration Standard

### 10.1 Orchestration rules (MUST)

1. **Audit before dispatch.** Head Agent MUST verify file inventory, APIs, and contracts before spawning workers.
2. **Disjoint file ownership.** Each worker owns exactly its assigned files; no two workers edit the same file (conflict-free merge). If a shared file must change, one worker owns it and others receive the resulting API contract.
3. **Contract-first prompts.** The prompt MUST specify: exact deliverables, exact export/API names, exact JSON schemas, the files the worker may touch, and the bounded report format (see §11, Appendix A).
4. **Parallel waves.** Independent workers run concurrently in a single message. Dependent work (e.g. QA) starts only after producers finish.
5. **QA is a separate worker** with read-only validation scope; it MUST NOT make feature edits.
6. **Head Agent integrates.** Workers do not merge; the Head Agent reconciles outputs, fixes integration gaps, and owns the final commit.

### 10.2 Worker discipline (MUST)

- Read only files required for the assigned work (targeted reads).
- Reuse before build; never duplicate data or UI.
- Never invent relationships, routes, keywords, or metadata.
- Return a bounded report: files created, item counts, exclusions + rationale, confirmation of no other file touched.
- Report contract deviations (schema violations, missing sources) explicitly for the Head Agent to resolve.

### 10.3 Proven pattern (from GO-EVIDENCE-1 / GO-SEARCH-1)

Search sprint wave model: (Wave 1) Index generator ‖ Components ‖ Engine — disjoint; (Wave 2) Page integration ‖ Validator — consume Wave 1 APIs; (Wave 3) QA. Integration fixes occur at Head Agent level, not by re-spawning producers for cosmetic edits.

## 11. Prompt Convention

### 11.1 Sprint brief (Head Agent input) — canonical template

```
<SPRINT-ID> — HEAD AGENT
Repository: G:\ProjectAI\goffice2026
Mission: <one-sentence goal; declare freeze/no-redesign when applicable>
[ARCHITECTURE FREEZE] <list canonical modules; "Do not redesign. Only bug fixes.">
GLOBAL RULES: <P1–P15 references; no backend; no production deployment; no duplicated metadata/UI; no inferred relationships; targeted reads; bounded output>
CANONICAL SOURCES: <file list from §6.1 + blueprint + ADRs>
SPRINT <SPRINT-ID>: <goal; coverage list; "without duplicating data">
Spawn Subagent <A..F>: Scope / Tasks / Deliverable / Ownership / Contract
INTEGRATION: <merge; resolve conflicts; reuse shared components; preserve frozen architecture>
VALIDATION: <build; validators; metadata; broken links; runtime smoke; accessibility; performance>
FINAL REPORT: <max N lines; include: freeze summary, ADR created, subagent summary, files changed, components created, metadata created, coverage, QA results, commit SHA, working tree, blockers>
SUCCESS CRITERIA: <checklist>
Do not deploy.
```

### 11.2 Worker prompt — canonical template

```
<SPRINT-ID> Worker <X> (<Scope>) — repository G:\ProjectAI\goffice2026
CONTEXT: <one paragraph; frozen architecture note; pointer to FREEZE/ADR-005>
YOU OWN EXACTLY: <file list> (create/edit; touch nothing else)
READ FIRST (targeted): <file list>
CONTRACT: <exact export names / JSON schema / interface / component props>
RULES: <reuse; no duplication; no invented data; TH/EN parity; minimal JS; a11y>
VERIFY: <self-check instructions — compile/build mentally or smoke>
RETURN (max N lines): <(1) files, (2) key facts, (3) exclusions, (4) confirmation>
```

### 11.3 Prompt rules (MUST)

1. Every prompt names the Sprint ID (traceability) and states the freeze constraint.
2. Every prompt bounds the final report line count.
3. Contract names (exports, props, schema fields) are spelled exactly; workers implement to them, Head Agent verifies against them.
4. Never paste large files into prompts (P11 chunk not dump); reference paths and read locally.

## 12. Folder Convention

| Path | Canonical content |
|---|---|
| `src/pages/` | TH routes; `src/pages/en/` EN route pairs |
| `src/components/<module>/` | Shared components by module: `ui/`, `about/`, `dashboard/`, `evidence/`, `search/` |
| `src/data/` | Canonical metadata (see §6.1); `src/data/generated/` baseline/fallback |
| `src/layouts/` | Layouts (`BaseLayout.astro`) |
| `src/styles/` | Global styles |
| `src/i18n/` | `getLocale`, `getLocalizedPath`, label helpers |
| `src/utils/` | Framework-agnostic TS modules (`with-base.ts`, `search-engine.ts`) |
| `scripts/` | Build/import/validate/smoke/test scripts (Node ESM `.mjs`) |
| `docs/` | `00-...CONSTITUTION.MD`, `GREENOFFICE2026_PLATFORM_BLUEPRINT_V4.md`, `architecture/` (ADR/, freeze, overview, data flow, **playbook**, README), `audit/`, `KB/`, `runbooks/` |
| `public/documents/` | Public evidence/document files (PDF/XLSX), organized `about/<page>/`, `reference/`, `<catN>/` |

**Rules (MUST):** TH/EN page pairs sit in parallel folders; scripts are `.mjs` (ESM, `node:fs`/`node:path` only, no external deps unless existing); new docs go under `docs/` with the naming conventions above; never commit `dist/` or temp files.

## 13. Quality Gates

Release is NOT ready on Build PASS alone (CONST §10, BP-V4 §12). Every sprint MUST pass:

| Gate | Command | Notes |
|---|---|---|
| Build | `npm run build` | Astro build; exits 0; all routes emitted |
| Platform validation | `npm run validate` | `scripts/validate-platform.mjs` (incl. Evidence-Links phase 1.75 + Search-Index phase 1.9) |
| Criteria validation | `node scripts/validate-criteria.mjs` | 7 categories / 24 issues / 65 indicators |
| Evidence validation | `node scripts/validate-evidence.mjs` | 24 records, 0 unmapped |
| Evidence-links validation | via `validate-platform` | Bidirectional integrity of `evidence-links.json` |
| Search-index validation | `node scripts/validate-search-index.mjs` | Structure + drift (temp regeneration) |
| Broken links | `node scripts/check-production-links.mjs` (`npm run qa:links`) | All `dist/` hrefs resolve |
| Route parity | `node scripts/smoke-routes.mjs` (`npm run qa:routes`) | TH/EN route pairs |
| Runtime smoke | Node UTF-8 inspection of `dist/` (not PowerShell text match — Thai mangling) | Content markers, counts, locale parity |
| Data validation | `npm run data:validate`, `npm run import:validate` | `data-pipeline.mjs`; dry-run import |
| SEO | `node scripts/qa-seo-release.mjs` (`npm run qa:seo`) | Metadata completeness |
| A11y (static) | `npm run check` (`astro check`) + manual/scripted review | Labels, aria, hierarchy, focus |
| Performance | Size review of `dist/` pages + JS chunks | Flag JS > 200 KiB; Lighthouse ≥ 95 target (CONST §15) |
| Tests | `npm test` | Node test suites + dashboard executive |

**Pre-existing known non-blockers (do not fail sprints on these):** `astro check` TS strictness warnings in legacy About components; `npm test` RC-3 warning assertion; `npm run data:validate` action-plan-2569 field gaps (tracked, out of current scope).

## 14. Release Process

1. **Architecture review** — scope verified against FREEZE/ADRs.
2. **Agent execution** — sprint phases (§9).
3. **Runtime QA** — all §13 gates PASS.
4. **GitHub commit** — commit verified code + documentation only; report commit SHA.
5. **Working tree check** — no unintended files; known untracked artifacts (`dist/`, `doc/`, `incoming/`) documented as pre-existing.
6. **Release approval** — Product Owner; **production deployment is a separate, approved step** — agents MUST NOT deploy (CONST §6/§16).

Documentation commits: verified only — no unfinished drafts; versioned docs updated in the same commit as the change they describe.

## 15. Governance and Change Control

1. **Constitution-first** — any decision contrary to CONST requires Product Owner + Chief Architect approval.
2. **Architecture is frozen** (FREEZE) — redesigns require a new ADR and freeze-bump; bug fixes are always allowed.
3. **ADR lifecycle** — ADRs are append-only once accepted; supersession requires a new ADR referencing the prior record (`docs/architecture/adr/README.md` conventions). Number sequentially (ADR-001..005); do not reuse zero-padded names that collide.
4. **Scope control** — the Chief Architect prevents over-engineering and scope creep; workers stay in bounded scope.
5. **No production edit** — enforced by policy; all changes land via git.
6. **MVP boundary** — no database/API/backend for the public platform without an approved written decision (CONST §11/§12, ADR-001/003).

## 16. Future Extension

Canonical extension points (do not implement without an approved sprint):

1. **Global search module reuse** — command-palette `/` search in the global header; search entry points on hub pages (ADR-005 Future extension).
2. **Full-text document search** — indexed PDF/XLSX text corpus when verified extraction pipelines exist (static architecture preserved).
3. **Hub content activation** — News/Activities/Knowledge slots become searchable records as official content is approved (`content/hubs.json`).
4. **Federated metadata** — SharePoint/M365 exports as additional generator inputs (ADR-002 boundary respected: discovery only).
5. **Thai normalization / ranking** — client-side token ranking, Thai character folding (no backend).
6. **Operational backend** — Supabase for back-office monthly metrics per ADR-003/ADR-004, never replacing Astro as the public layer.
7. **New skills** — registered in `docs/KB/SKILLS_REGISTRY.md` per P12.

## 17. Agent Compliance Checklist

Every agent MUST self-verify before reporting completion:

- [ ] Audited before editing; read only required files.
- [ ] Reused existing components/metadata before generating new ones.
- [ ] Touched only assigned files (verified via `git status`).
- [ ] No duplicated data or UI; no invented relationships.
- [ ] TH/EN parity maintained.
- [ ] Build PASS and relevant validators PASS.
- [ ] Runtime smoke / links / a11y / performance checked where applicable.
- [ ] Bounded final report with evidence + commit SHA.
- [ ] No production deployment performed.

---

## Appendix A — Worker Report Template

```
<SPRINT-ID> Worker <X> (<Scope>) — Report
(1) Files created/edited: <list>
(2) <Key deliverable facts: item counts, export names, schemas>
(3) Intentional exclusions + rationale: <list — every exclusion traced to a source>
(4) Contract deviations / flags for Head Agent: <list>
(5) Confirmation: touched no other file; <verification evidence, e.g. git status, build>
Max ~25 lines.
```

## Appendix B — Sprint Brief Template

See §11.1. Baseline sections: Mission → [Architecture Freeze] → Global Rules → Canonical Sources → Sprint Goal → Spawn Subagents (Scope/Tasks/Ownership) → Integration → Validation → Final Report (bounded) → Success Criteria → Do not deploy.
