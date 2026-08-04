# Green Office 2026 — Architecture Documentation

Index of the canonical architecture documentation set for Green Office 2026.

## Operational Standard

| Document | Purpose |
|---|---|
| [GOFFICE2026_AI_AGENT_PLAYBOOK_V1](./GOFFICE2026_AI_AGENT_PLAYBOOK_V1.md) | **Operational constitution for all AI agents** — architecture, workflow, governance, source strategy, metadata, components, subagent orchestration, quality gates, release process, prompt/folder conventions, future extension. |

## Baseline

| Document | Purpose |
|---|---|
| [ARCHITECTURE_FREEZE_V1](./ARCHITECTURE_FREEZE_V1.md) | Canonical frozen baseline (modules, components, metadata, routes, extension points, QA baseline) |
| [ARCHITECTURE_OVERVIEW](./ARCHITECTURE_OVERVIEW.md) | One-paragraph architecture summary |
| [DATA_FLOW](./DATA_FLOW.md) | Static data flow model (JSON/CSV → Astro → pages) |

## Decision Records

| ADR | Title | Status |
|-----|-------|--------|
| [ADR-001](./adr/ADR-001-ASTRO-STATIC-FIRST.md) | Astro Static-First Public Platform | ACCEPTED |
| [ADR-002](./adr/ADR-002-DOCUMENT-CENTER-BOUNDARY.md) | Document Center M365-Backed, Evidence Separate | ACCEPTED |
| [ADR-003](./adr/ADR-003-SUPABASE-OPERATIONAL-BACKEND.md) | Supabase Operational Backend Only | ACCEPTED |
| [ADR-004](./adr/ADR-004-LIVE-DASHBOARD-WITH-STATIC-FALLBACK.md) | Live Approved Metrics with Static JSON Fallback | ACCEPTED |
| [ADR-005](./adr/ADR-005-METADATA-DRIVEN-KNOWLEDGE-GRAPH-NAVIGATION.md) | Metadata-Driven Knowledge Graph Navigation | ACCEPTED |

See [adr/README.md](./adr/README.md) for ADR conventions (append-only, sequential numbering).

## Related Documents

- [Project Constitution](../../00-GREENOFFICE_PROJECT_CONSTITUTION.MD)
- [Platform Blueprint V4](../../GREENOFFICE2026_PLATFORM_BLUEPRINT_V4.md)
- [Supabase Backend Blueprint V1](../../GREENOFFICE2026_SUPABASE_BACKEND_BLUEPRINT_V1.md)

## Reading Order for New Agents

1. Project Constitution → 2. Platform Blueprint V4 → 3. **AI Agent Playbook V1** → 4. Architecture Freeze V1 → 5. ADR-001..005 as needed.
