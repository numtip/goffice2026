# Context Pack: Dashboard

Use for KPI display, scoring, and dashboard UX work.

## Page

- Route: `/dashboard`
- File: `src/pages/dashboard.astro`
- Detail route: `/dashboard/{energy,water,fuel,paper,waste,ghg}`
- Detail file: `src/pages/dashboard/[id].astro`

## Data

- **Certification KPIs:** `src/data/dashboard-kpi.json`
  - `overallScore`, `updated`, `kpis[]`
  - Each KPI: `id`, `label`, `value`, `unit`, `categoryId`, `trend` (`up`|`down`|`stable`)
- **Operational metrics:** `src/data/generated/{energy,water,fuel,paper,waste,ghg}.json`
  - 2568 baseline data is complete.
  - 2569 current-year data is partial and displayed with month-count badges.
- **Dashboard metadata:** `src/data/dashboard-config.ts`

## CSV and Import Sources

- `data/csv/energy.sample.csv`
- `data/csv/water.sample.csv`
- `data/csv/waste.sample.csv`
- `data/csv/ghg.sample.csv`
- `data/import/energy-2569.csv`
- `data/import/water-2569.csv`
- `scripts/import-dashboard-data.mjs`

Generated JSON is wired into the dashboard pages at build time. Staff-facing CSV import remains a local static pipeline, not a runtime upload feature.

## Spec Stub

- `docs/KB/GREENOFFICE_DASHBOARD_SPEC.md`

## Constraints

- Static build-time data only (no live API)
- Link KPIs to categories via `categoryId`

## QA

- Verify overall score and all 7 KPI cards render
- Confirm category links resolve (`/categories/catN`)
- Confirm all 6 operational dashboard routes render
- Confirm 2569 month counts match generated JSON
