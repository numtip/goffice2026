# Architecture Decision Records (ADR)

This directory contains accepted architecture decisions for Green Office 2026.

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [ADR-001](./ADR-001-ASTRO-STATIC-FIRST.md) | Astro Static-First Public Platform | ACCEPTED |
| [ADR-002](./ADR-002-DOCUMENT-CENTER-BOUNDARY.md) | Document Center M365-Backed, Evidence Separate | ACCEPTED |
| [ADR-003](./ADR-003-SUPABASE-OPERATIONAL-BACKEND.md) | Supabase Operational Backend Only | ACCEPTED |
| [ADR-004](./ADR-004-LIVE-DASHBOARD-WITH-STATIC-FALLBACK.md) | Live Approved Metrics with Static JSON Fallback | ACCEPTED |
| [ADR-005](./ADR-005-METADATA-DRIVEN-KNOWLEDGE-GRAPH-NAVIGATION.md) | Metadata-Driven Knowledge Graph Navigation | ACCEPTED |

## Conventions

- Each ADR uses the sections: Status, Context, Decision, Consequences, Constraints, Related documents.
- ADRs are append-only once accepted; supersession requires a new ADR that references the prior record.
- Implementation status is tracked in the Supabase backend blueprint, not in individual ADRs.

## Related Documents

- [Project Constitution](../../00-GREENOFFICE_PROJECT_CONSTITUTION.MD)
- [Supabase Backend Blueprint V1](../../GREENOFFICE2026_SUPABASE_BACKEND_BLUEPRINT_V1.md)
- [Architecture Overview](../ARCHITECTURE_OVERVIEW.md)
- [Data Flow](../DATA_FLOW.md)
