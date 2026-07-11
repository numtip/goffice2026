# Build Verification Runbook

Skill: **BUILD_VERIFICATION**

## When to Run

Before every commit that changes `src/`, config, or data consumed at build time.

## Steps

### 1. Install (if needed)

```powershell
rtk pwd
rtk npm ci
```

### 2. Type and template check

```powershell
rtk npm run check
```

**Pass criteria:** 0 errors, 0 warnings (hints acceptable).

### 3. Static build

```powershell
rtk npm run build
```

**Pass criteria:** All expected routes listed; `dist/` generated; exit code 0.

### 4. Verify output

- Confirm 26 pages in build log
- Category routes: `/categories/cat1` … `/categories/cat7` via `[id].astro`
- Dashboard routes: `/dashboard/energy`, `/dashboard/water`, `/dashboard/fuel`, `/dashboard/paper`, `/dashboard/waste`, `/dashboard/ghg`
- Document routes: `/documents/cat1` … `/documents/cat7`

## Fail Actions

1. Read error output (use `rtk` for compact view).
2. Fix source; do not skip check.
3. Re-run check → build.
4. Do not commit until pass.

## Related

- `docs/context-packs/GREENOFFICE_MVP_CONTEXT.md`
- `docs/runbooks/RUNTIME_QA.md`
- `tsconfig.json`, `astro.config.mjs`
