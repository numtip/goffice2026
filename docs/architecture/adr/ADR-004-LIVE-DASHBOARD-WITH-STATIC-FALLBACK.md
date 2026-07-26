# ADR-004: Live Approved Metrics with Static JSON Fallback

## Status

ACCEPTED

## Context

Public dashboards must show current approved environmental metrics for 2569+ while preserving 2568 baseline data already shipped as static JSON. Deployments target static hosting (GitHub Pages preview, VPS static files) where runtime availability of Supabase cannot be guaranteed.

Visitors must never see draft or submitted values. When Supabase is unreachable, misconfigured, or live mode is disabled, the dashboard must remain usable with the last known good static snapshot.

## Decision

Implement a dual-mode dashboard data strategy:

1. **Default mode: static** — `PUBLIC_DASHBOARD_DATA_MODE=static` (or unset). Dashboard reads from `src/data/generated/*.json` and existing baseline files. No Supabase call required for public render.

2. **Live mode: approved metrics only** — When explicitly enabled, client reads from Supabase public-safe view `public_dashboard_monthly_metrics` (approved rows only). Merge live 2569+ values with static 2568 baseline per blueprint rules.

3. **Fallback on failure** — If live fetch fails or Supabase is unavailable, display the latest generated JSON snapshot with a visible last-updated timestamp and optional degraded-mode indicator.

Publishing rule: public dashboard surfaces `status = approved` only.

Operational rule: 2568 baseline may remain static JSON; 2569+ current-year approved data comes from Supabase when live mode is active.

## Consequences

**Positive**

- Public site works fully without Supabase in default configuration.
- Approved live data can refresh without redeploying the entire Astro build.
- Graceful degradation protects visitor experience during outages or env misconfiguration.
- Aligns with constitution performance-first and static-first principles.

**Negative**

- Dashboard client must implement merge logic, mode switching, and fallback UI.
- Static and live data may briefly diverge until snapshots are regenerated or live mode succeeds.
- Live mode exposes Supabase anon key in the browser; RLS must enforce approved-only reads.

## Constraints

- Default deployment must use static mode unless PO explicitly enables live mode per environment.
- Never expose draft, submitted, needs_revision, or internal notes on public dashboard.
- Preserve field names close to existing dashboard JSON model for merge compatibility.
- Include last-updated timestamp when serving fallback or live data.
- Do not require Supabase for GitHub Pages preview to pass smoke checks.

## Related documents

- [Supabase Backend Blueprint V1](../../GREENOFFICE2026_SUPABASE_BACKEND_BLUEPRINT_V1.md) — §5 Data workflow, §7 Public dashboard contract, §8 Phase 4, §9 Environment variables
- [ADR-001](./ADR-001-ASTRO-STATIC-FIRST.md)
- [ADR-003](./ADR-003-SUPABASE-OPERATIONAL-BACKEND.md)
- [Data Flow](../DATA_FLOW.md)
