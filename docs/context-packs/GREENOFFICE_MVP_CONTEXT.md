# Context Pack: Green Office MVP

Use for MVP feature work, routing, and static page changes.

## Stack

- **Framework:** Astro 4 (static, `ssr: false`)
- **Styling:** Tailwind CSS
- **Data:** JSON + CSV + Markdown in repo (no DB/API)

## Project Root

- Windows: `F:\projectAi\goffice2026`
- WSL: `/mnt/f/projectAi/goffice2026`

## Routes

| Route | Source |
|-------|--------|
| `/` | `src/pages/index.astro` |
| `/dashboard` | `src/pages/dashboard.astro` → `dashboard-kpi.json` + `src/data/generated/*.json` |
| `/dashboard/{energy,water,fuel,paper,waste,ghg}` | `src/pages/dashboard/[id].astro` → `dashboard-config.ts` + generated metric JSON |
| `/categories` | `src/pages/categories/index.astro` → `categories.json` |
| `/categories/cat1`–`cat7` | `src/pages/categories/[id].astro` → `categories.json` |
| `/evidence` | `src/pages/evidence.astro` → `evidence-index.json` |
| `/documents` | `src/pages/documents.astro` → `categories.json` |
| `/documents/cat1`–`/documents/cat7` | `src/pages/documents/[id].astro` → `categories.json` + `evidence-index.json` |
| `/search` | `src/pages/search.astro` → client-side filtering over `evidence-index.json` |

## Key Files

- Layout: `src/layouts/BaseLayout.astro` (global nav)
- Nav: `src/components/ui/Navigation.astro`
- Config: `astro.config.mjs`, `tsconfig.json`, `tailwind.config.mjs`

## Constraints

- No deploy/production edit without approval
- No backend/database/API for MVP
- Build must pass before commit

## Commands

```powershell
rtk npm run check
rtk npm run build
rtk npm run preview
```

See `docs/runbooks/BUILD_VERIFICATION.md` and `docs/runbooks/RUNTIME_QA.md`.
