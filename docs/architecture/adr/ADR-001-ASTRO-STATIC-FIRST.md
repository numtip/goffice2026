# ADR-001: Astro Static-First Public Platform

## Status

ACCEPTED

## Context

Green Office 2026 is a public environmental performance portal, executive dashboard, evidence discovery site, and indicator reference. The project constitution mandates static-first architecture: Markdown, JSON, and CSV before database, API, or backend services.

The platform must load quickly on institutional networks, deploy as static files to GitHub Pages preview and Linux VPS production, and remain maintainable by non-developer staff through file-based content updates.

Introducing operational backend capabilities for monthly data entry must not convert the public site into a dynamic CMS or server-rendered application.

## Decision

Retain Astro as the sole public platform for all visitor-facing surfaces:

- Landing page, categories, indicators, and evidence discovery pages
- Dashboard UI shell and chart rendering
- Public documents entry and navigation
- Static baseline and fallback data from `src/data/` and `src/data/generated/`

Build-time content continues to flow from Markdown, MDX, JSON, and CSV. GitHub remains the source of truth for public content. Supabase, when present, serves operational back-office workflow only and does not replace Astro as the public delivery layer.

## Consequences

**Positive**

- Public pages remain fast, cacheable, and deployable without a runtime server.
- Content and baseline metrics stay version-controlled and reviewable in git.
- Preview and production deploy pipelines stay compatible with static hosting.
- Operational backend scope stays bounded and auditable.

**Negative**

- Live dashboard values require client-side Supabase reads or pre-generated JSON snapshots; the site cannot rely on server-side rendering for data freshness.
- Content updates that are not metric-related still require a build and deploy cycle.
- Admin workflow pages are the only authenticated surfaces; they do not share a unified CMS with public pages.

## Constraints

- Do not move the whole public site into Supabase or any other backend.
- Do not add a full CMS or public page editing through the database in this phase.
- Do not expose draft or unapproved operational data on public Astro pages.
- Preserve `src/data/generated/*.json` as baseline and fallback regardless of live data mode.
- Follow the constitution static-first evaluation order before adding new dynamic capabilities.

## Related documents

- [Project Constitution](../../00-GREENOFFICE_PROJECT_CONSTITUTION.MD)
- [Supabase Backend Blueprint V1](../../GREENOFFICE2026_SUPABASE_BACKEND_BLUEPRINT_V1.md) — §1 Purpose, §2 Architecture Decision, §8 Astro Integration Plan
- [ADR-003](./ADR-003-SUPABASE-OPERATIONAL-BACKEND.md)
- [ADR-004](./ADR-004-LIVE-DASHBOARD-WITH-STATIC-FALLBACK.md)
- [Architecture Overview](../ARCHITECTURE_OVERVIEW.md)
- [Data Flow](../DATA_FLOW.md)
