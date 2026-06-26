# Project Memory — Green Office 2026

**Purpose:** Long-term institutional memory for agents, developers, and stakeholders.  
**Last updated:** 2026-06-26  
**Repository:** https://github.com/numtip/goffice2026

---

## Project Vision

Maejo University **Green Office 2026** is a static-first **Environmental Intelligence Platform** for executive decision-makers. It supports Green Office 2569+ certification readiness through dashboards, category assessment, evidence discovery, and a premium institutional landing experience — without unnecessary backend complexity in the MVP.

**Emotional direction:** Precision Environmentalism · Premium Institutional Platform · Soft Glassmorphism · Executive Environmental Intelligence.

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                        SOURCE OF TRUTH                          │
│                     GitHub (numtip/goffice2026)                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
   ┌─────────────────────┐       ┌─────────────────────┐
   │   GitHub Actions    │       │   Manual VPS Deploy │
   │   DEPLOY_TARGET=    │       │   (PO approved)     │
   │   github-pages      │       │                     │
   └──────────┬──────────┘       └──────────┬──────────┘
              ▼                             ▼
   ┌─────────────────────┐       ┌─────────────────────┐
   │   GitHub Pages      │       │   Production VPS    │
   │   PREVIEW ONLY      │       │   greenoffice.mju   │
   │   /goffice2026/     │       │   .ac.th            │
   └─────────────────────┘       └─────────────────────┘

   ┌─────────────────────────────────────────────────────┐
   │   Document Center (SEPARATE PROJECT)                │
   │   Microsoft 365 · SharePoint · Graph · OneDrive     │
   │   Landing previews only — no DMS in goffice2026      │
   └─────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Astro 4 | Static output only |
| Styling | Tailwind CSS 3.4 | Stitch design tokens in `tailwind.config.mjs` |
| Language | TypeScript 5.4 | `astro check` in CI workflow |
| Data | JSON, CSV, Markdown | No database in MVP |
| Preview host | GitHub Pages | Subpath `/goffice2026/` |
| Production host | Linux VPS + Nginx | Manual deploy only |

---

## Locked Decisions

| Decision | Rule |
|----------|------|
| Static-first | Markdown → JSON → CSV before DB/API |
| No MVP backend | No database, API, or CMS unless PO approves |
| GitHub = source of truth | No direct production editing |
| Preview ≠ Production | GitHub Pages preview; VPS production |
| Document Center separate | M365-backed; not built inside goffice2026 |
| Design Freeze v1 approved | Do not redesign homepage without PO approval |
| Constitution-first | See `00-GREENOFFICE_PROJECT_CONSTITUTION.MD` |
| dist/ not committed | Build artifact only |
| RTK for repeated shell ops | See `docs/runbooks/RTK_USAGE.md` |

References: [ADR-0002](../adr/ADR-0002_GITHUB_PAGES_PREVIEW.md)

---

## Design Freeze

| Item | Value |
|------|-------|
| Status | **Approved & implemented** |
| Source | `data/import/googlestitch/` (DESIGN.md, code.html, screen.png) |
| Homepage components | `src/components/landing/*` (8 scenes) |
| Visual system | Deep emerald, mint, sage, glass panels, editorial typography |

**Do not redesign** the approved landing without explicit PO approval.

---

## Information Architecture

| Route | Purpose |
|-------|---------|
| `/` | Stitch landing (Design Freeze homepage) |
| `/dashboard` | Dashboard hub |
| `/dashboard/{energy,water,fuel,paper,waste,ghg}` | Resource dashboards |
| `/categories` | Green Office category index |
| `/categories/cat1`–`cat7` | Category detail |
| `/evidence` | Evidence library |
| `/documents` | Document Center entry (static preview pages in MVP) |
| `/search` | Global search |

All internal links must use `withBase()` for GitHub Pages subpath compatibility.

---

## Document Center Architecture

- **Owner:** Separate project (not goffice2026 core)
- **Backend:** Microsoft 365 — SharePoint, Microsoft Graph, OneDrive
- **goffice2026 role:** Landing **preview only** via `EvidenceGateway.astro`
- **Excluded from goffice2026:** Upload, permissions, versioning UI, metadata editing
- **CTA copy:** "Open Document Center"

EP-3 will define integration hooks; EP-2 prepares placeholders and content contract.

---

## Dashboard Architecture

- Config: `src/data/dashboard-config.ts`, `dashboard-kpi.json`
- Data pipeline: CSV → `scripts/import-dashboard-data.mjs` → JSON
- Six operational dashboards + KPI scores for seven categories
- Landing `ExecutiveCommandCenter.astro` is a **preview terminal** — links to real dashboard routes, not embedded live charts

---

## GitHub Pages Preview Workflow

1. Push to `master`
2. GitHub Actions runs `npm ci`, `npm run build` with:
   - `DEPLOY_TARGET=github-pages`
   - `PUBLIC_PREVIEW_BADGE=true`
3. Artifact deployed to GitHub Pages
4. Preview URL: **https://numtip.github.io/goffice2026/**
5. Preview badge shown bottom-right

Local Pages simulation:

```powershell
$env:DEPLOY_TARGET='github-pages'
$env:PUBLIC_PREVIEW_BADGE='true'
npm run build
```

Docs: [GITHUB_PAGES_PREVIEW_SETUP.md](./GITHUB_PAGES_PREVIEW_SETUP.md), [PREVIEW_RELEASE.md](../runbooks/PREVIEW_RELEASE.md)

---

## Production Workflow

1. Preview QA pass on GitHub Pages
2. PO / executive approval
3. Manual VPS deploy to `greenoffice.mju.ac.th`
4. Runtime QA on production
5. **Never** auto-deploy preview to production

Docs: [RELEASE_SAFETY_CHECK.md](../runbooks/RELEASE_SAFETY_CHECK.md)

---

## Current Sprint

| Sprint | Status |
|--------|--------|
| Design Freeze v1 | ✅ Complete |
| EP-1 Experience Polish | ✅ Complete |
| Session handoff docs | ✅ Complete (2026-06-26) |

**Latest commits:** `f639956` (Stitch landing), `4c07989` (EP-1 polish)

---

## Next Sprint

**EP-2 — Real Content Integration**

- Maejo imagery (replace CDN placeholders)
- Real dashboard preview data wiring
- Real activities/news content
- Document Center hook preparation
- Nav/footer visual alignment
- Executive review prep

Plan: [NEXT_SPRINT_PLAN.md](./NEXT_SPRINT_PLAN.md)

---

## Known Constraints

- External Stitch CDN images impact LCP until EP-2 self-hosting
- Nav/footer still legacy styling (outside EP-1 scope)
- Activity cards use placeholder editorial content
- Document Center not yet connected to M365 APIs
- Production VPS not updated during preview sprints
- Untracked repo files: `.zai/`, `data/import/googlestitch/`, `compliance-criteria.json` — triage next session

---

## Outstanding Tasks

- [ ] EP-2 sprint kickoff and PO content approval
- [ ] Self-host hero and activity images
- [ ] Static activities/news data model
- [ ] Nav/footer Stitch token alignment
- [ ] Commit or gitignore untracked import/design assets
- [ ] EP-3 Document Center integration spec
- [ ] Production VPS release (PO-approved, manual)

---

## Key Documentation Index

| Document | Path |
|----------|------|
| Session summary (today) | `docs/reports/SESSION_SUMMARY_2026-06-26.md` |
| EP-1 performance review | `docs/reports/EP1_PERFORMANCE_REVIEW.md` |
| Executive handoff | `docs/reports/EXECUTIVE_HANDOFF.md` |
| Next sprint plan | `docs/reports/NEXT_SPRINT_PLAN.md` |
| Pages preview setup | `docs/reports/GITHUB_PAGES_PREVIEW_SETUP.md` |
| Architecture ADR | `docs/adr/ADR-0002_GITHUB_PAGES_PREVIEW.md` |
