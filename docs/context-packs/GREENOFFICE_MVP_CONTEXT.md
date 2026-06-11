# Context Pack: Green Office MVP

Use for MVP feature work, routing, and static page changes.

## Stack

- **Framework:** Astro 4 (static, `ssr: false`)
- **Styling:** Tailwind CSS
- **Data:** JSON + CSV + Markdown in repo (no DB/API)

## Project Root

- Windows: `G:\ProjectAI\goffice2026`
- WSL: `/mnt/g/ProjectAI/goffice2026`

## Routes (13 pages)

| Route | Source |
|-------|--------|
| `/` | `src/pages/index.astro` |
| `/dashboard` | `src/pages/dashboard.astro` → `dashboard-kpi.json` |
| `/categories` | `src/pages/categories/index.astro` → `categories.json` |
| `/categories/cat1`–`cat7` | `src/pages/categories/[id].astro` → `categories.json` |
| `/evidence` | `src/pages/evidence.astro` → `evidence-index.json` |
| `/documents` | `src/pages/documents.astro` → `categories.json` |
| `/search` | `src/pages/search.astro` (static placeholder) |

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
npm run check
npm run build
npm run preview
```

See `docs/runbooks/BUILD_VERIFICATION.md` and `docs/runbooks/RUNTIME_QA.md`.
