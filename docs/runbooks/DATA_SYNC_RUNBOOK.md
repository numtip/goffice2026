# DATA_SYNC_RUNBOOK — One-command Green Office data sync

**Scope:** GO-DATA-3 Phase 3. Operators push approved OneDrive workbooks through
the staging → extract → build → validate pipeline with a single command.
No production deploy.

## One command

```powershell
npm run data:sync
```

or (when the `npm` shim cannot resolve `node` in this shell):

```powershell
node scripts/sync-all.mjs
```

## What it does (reuses existing scripts — no redesign)

```
OneDrive (READ-ONLY) ──sync-workbooks.mjs──▶ data/staging/source
        │  SHA-256 + canonical-range fingerprint + datasetState
        ▼
change detection  ── no meaningful change ──▶ exit 0 (no regeneration)
        │  meaningful change
        ▼
extract-workbook.mjs ──▶ data/import/{metric}-{year}.csv   (display-aware: cell.w)
        ▼
data-pipeline.mjs build ──▶ import → validate → generate → determinism
```

## Guarantees

- **OneDrive is strictly read-only.** Files are copied into staging only when
  the SHA-256 differs; nothing is ever written back to the source.
- **Idempotent no-change run.** When SHA-256, canonical-range fingerprints, and
  dataset states are identical to the previous manifest, extract/build/validate
  are skipped entirely — no unnecessary regeneration.
- **Failure stops before publishable data.** `data-pipeline.mjs build` aborts
  (non-zero) if import or validation reports errors, *before* `generateOutputs`
  rewrites any generated file. A failed sync never leaves publishable output.
- **Missing months are never zero.** Display-aware extraction treats `-`/empty
  cells as absent; WAITING_FOR_INPUT metrics emit no CSV.

## Operator use

```powershell
# Normal: staff update OneDrive workbooks → run once
npm run data:sync

# Force full flow even without detected changes (e.g. after schema change)
node scripts/sync-all.mjs --force

# Offline rehearsal with a temp source (does not touch OneDrive or repo staging)
node scripts/sync-all.mjs --source=C:\tmp\src --out=C:\tmp\staging --manifest=C:\tmp\manifest.json
```

## Expected states (FY2569)

| Metric      | datasetState (today) | Notes |
|-------------|----------------------|-------|
| water/energy | `PUBLISHABLE_PARTIAL` | Jan–Jul observed, CONFIRMED_XLSX, reconciled |
| fuel/paper   | `WAITING_FOR_INPUT`   | 0 observations in canonical col6 range |
| waste/ghg    | `WAITING_FOR_INPUT`   | FY2026 = FY2025 template copy (fingerprint == baseline) |

## Runtime requirements

- **Node.js ≥ 20** installed at `G:\nodejs` (`node --version` → v24.x), **npm 11.x**.
- `G:\nodejs` must be on the **system or user PATH**.
- PATH must be free of stray quotes/corrupt entries (a stray `"` or non-ASCII
  entry breaks **cmd**-based command resolution even when PowerShell works).
  Quick check:
  ```powershell
  cmd /c "node --version"
  ```
- After editing PATH (user/system), **new processes** pick it up. A process
  already running (e.g. Cursor) keeps its old PATH until restarted — or run:
  ```powershell
  $env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' +
              [Environment]::GetEnvironmentVariable('Path','User')
  ```
- npm shims: `npm.ps1`/`npm.cmd` in `%APPDATA%\Roaming\npm` are fine; the real
  `npm-cli.js` lives in `G:\nodejs\node_modules\npm`.

## Failures

| Symptom | Meaning | Action |
|---------|---------|--------|
| `❌ Source directory not found` | OneDrive path unavailable | Verify `E:\OneDrive\...\07-GreenOffice\resource` |
| `❌ Import failed … NOT publishable` | CSV unreadable/invalid | Fix workbook or CSV, re-run |
| `❌ Validation failed … NOT publishable` | Generated data structurally invalid | Inspect warnings, fix source, re-run |
| `npm run` → `'node' is not recognized` | PATH corrupt (stray `"`/non-ASCII entry) breaking cmd resolution — fixed 2026-08-07 (User+Machine PATH cleaned) | `cmd /c "node --version"`; if it still fails, check `$env:Path` for `"` or non-ASCII entries and clean |

## See also

- `docs/data/GO-DATA-2-PHASE1-SYNC-AUDIT.md` — Phase 1 audit
- `docs/data/GO-DATA-3-PHASE2-DESIGN.md` — Phase 2 design (ranges, fingerprint, states)
- `scripts/sync-workbooks.mjs`, `scripts/extract-workbook.mjs`, `scripts/sync-all.mjs`
