# Runtime QA Runbook

Skill: **RUNTIME_QA**

## When to Run

After `npm run build` passes and before commit/push.

## Steps

### 1. Start preview

```powershell
cd G:\ProjectAI\goffice2026
npm run preview -- --host 127.0.0.1 --port 4321
```

### 2. Route smoke test

Verify HTTP 200 for each route:

| Route |
|-------|
| `/` |
| `/dashboard` |
| `/categories` |
| `/categories/cat1` … `/categories/cat7` |
| `/evidence` |
| `/documents` |
| `/search` |

PowerShell example:

```powershell
$routes = @('/', '/dashboard', '/categories',
  '/categories/cat1','/categories/cat2','/categories/cat3',
  '/categories/cat4','/categories/cat5','/categories/cat6','/categories/cat7',
  '/evidence','/documents','/search')
$base = 'http://127.0.0.1:4321'
foreach ($r in $routes) {
  (Invoke-WebRequest ($base + $r) -UseBasicParsing).StatusCode
}
```

### 3. Navigation check

- Global nav links present on all pages (via `BaseLayout`)
- Home quick links resolve

### 4. Content sanity

- Dashboard shows KPI data from JSON
- Categories index lists 7 categories
- Evidence page lists items from `evidence-index.json`

## Pass Criteria

- All routes return 200
- No blank main content
- No console-blocking errors in preview (manual browser check optional)

## Related

- `docs/runbooks/HOMEPAGE_REVIEW.md`
- `docs/runbooks/A11Y_REVIEW.md`
- `docs/context-packs/QA_CONTEXT.md`
