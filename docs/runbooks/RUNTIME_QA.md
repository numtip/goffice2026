# Runtime QA Runbook

Skill: **RUNTIME_QA**

## When to Run

After `rtk npm run build` passes and before commit/push.

## Steps

### 1. Start preview

```powershell
rtk npm run preview -- --host 127.0.0.1 --port 4321
```

### 2. Route smoke test

Verify HTTP 200 for each route:

| Route |
|-------|
| `/` |
| `/dashboard` |
| `/dashboard/energy` |
| `/dashboard/water` |
| `/dashboard/fuel` |
| `/dashboard/paper` |
| `/dashboard/waste` |
| `/dashboard/ghg` |
| `/categories` |
| `/categories/cat1` … `/categories/cat7` |
| `/evidence` |
| `/documents` |
| `/documents/cat1` … `/documents/cat7` |
| `/search` |

Compact local route check after preview is running:

```powershell
rtk npm run qa:routes
```

### 3. Navigation check

- Global nav links present on all pages (via `BaseLayout`)
- Home quick links resolve

### 4. Content sanity

- Dashboard shows KPI data from JSON
- Dashboard detail pages show 2568 baseline and 2569 month-count badges
- Categories index lists 7 categories
- Evidence page lists items from `evidence-index.json`
- Placeholder evidence is visibly marked and does not present missing files as available

## Pass Criteria

- All routes return 200
- No blank main content
- No console-blocking errors in preview (manual browser check optional)

## Related

- `docs/runbooks/HOMEPAGE_REVIEW.md`
- `docs/runbooks/A11Y_REVIEW.md`
- `docs/context-packs/QA_CONTEXT.md`
