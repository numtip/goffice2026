# Context Pack: Dashboard

Use for KPI display, scoring, and dashboard UX work.

## Page

- Route: `/dashboard`
- File: `src/pages/dashboard.astro`

## Data

- **Primary:** `src/data/dashboard-kpi.json`
  - `overallScore`, `updated`, `kpis[]`
  - Each KPI: `id`, `label`, `value`, `unit`, `categoryId`, `trend` (`up`|`down`|`stable`)

## Sample CSV (not yet wired)

- `data/csv/energy.sample.csv`
- `data/csv/water.sample.csv`
- `data/csv/waste.sample.csv`
- `data/csv/ghg.sample.csv`

Future sprint: chart or table views from CSV at build time.

## Spec Stub

- `docs/KB/GREENOFFICE_DASHBOARD_SPEC.md`

## Constraints

- Static build-time data only (no live API)
- Link KPIs to categories via `categoryId`

## QA

- Verify overall score and all 7 KPI cards render
- Confirm category links resolve (`/categories/catN`)
