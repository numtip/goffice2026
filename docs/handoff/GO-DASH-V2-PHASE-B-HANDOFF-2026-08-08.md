# GO-DASH-V2 Phase B — Home Handoff 2026-08-08

---

## State

| Field | Value |
|---|---|
| **Project** | goffice2026 |
| **Repo** | github.com/numtip/goffice2026 |
| **Branch** | `master` |
| **Latest verified commit** | `5f3209a4999bb08004f909dc79ea27571c056dc6` |
| **HEAD == origin/master** | ✅ yes |
| **Version** | `1.3.0` (package.json) |
| **Phase A status** | **COMPLETE** |
| **Phase B status** | **PARTIAL — B-A + B-B done, B-C remaining** |
| **GitHub Pages** | ✅ deployed (Run #144, commit `5f3209a`) |

---

## Phase B — Completed (2026-08-08)

### B-B: Composition Cleanup — Removed 7 dead-code components

Removed components that were no longer imported anywhere (verified via full
`src/` search):

| Removed component | Reason |
|---|---|
| `CategoryScoreChart.astro` | unused |
| `MonthlyComparisonChart.astro` | unused |
| `DashboardInsight.astro` | unused |
| `DashboardKpiCard.astro` | unused |
| `ExecutiveKpi.astro` | unused |
| `ExecutiveInsight.astro` | unused |
| `Sparkline.astro` | unused (ResourcePulseCard uses inline SVG) |

> **Kept** (still in use): `ChartLegend`, `ExecutiveSummary`, `MetricDashboard`,
> `MetricHero`, `MetricKpiGrid`, `MonthlyProgress`, `MetricChartCard`,
> `MetricInsightGrid`, `DataEvidencePanel`, `MetricSwitcher`, `DashboardEmptyState`,
> `ResourcePerformanceCard` (landing page), `EChart` (shared wrapper).

### B-A: Performance Explorer (new feature)

- **`src/utils/chart-option.ts`** — added `buildExplorerOption` (additive, no
  refactor of existing builders). Multi-line chart, one series per resource,
  12 month slots, missing months stay `null` (never 0), `connectNulls: false`,
  JSON-serializable + aria description.
- **`src/components/dashboard/PerformanceExplorer.astro`** — new component
  using the shared `EChart` wrapper + accessible `<details>` table fallback.
- **`src/pages/dashboard.astro`** (TH) + **`src/pages/en/dashboard/index.astro`**
  (EN) — added section 2b after `<ResourcePulseGrid>`.
- **`scripts/test-chart-option.mjs`** — added 5 contract tests for
  `buildExplorerOption` (22/22 total pass).

### Verification (all PASS)

| Gate | Result |
|---|---|
| `buildExplorerOption` tests | ✅ 22/22 |
| `npm test` | ✅ all pass |
| `npm run build` | ✅ 252 pages |
| Smoke routes | ✅ 42/42 |
| Production links | ✅ 10,488 hrefs / 4,316 unique |
| GitHub Pages TH/EN | ✅ explorer renders, 3 ECharts, 0 console errors |
| a11y | ✅ heading structure H1→H2→H3, table fallback, no missing alt |
| reduced-motion | ✅ no animation when `prefers-reduced-motion: reduce` |
| responsive | ✅ no horizontal overflow at 390px / 768px |

---

## Phase B — Remaining (B-C)

### B-C: QA / i18n — remaining items

- [ ] Full TH/EN parity audit across all dashboard pages (spot-checked, not exhaustive)
- [ ] Desktop/tablet/mobile visual regression on all metric dashboards (`/dashboard/[id]/`)
- [ ] a11y keyboard navigation audit (tab order, focus states) on explorer + pulse
- [ ] Lighthouse ≥95 retest (baseline pending per maintenance backlog)
- [ ] Confirm `prefers-reduced-motion` on metric dashboards (not just main dashboard)

---

## Phase C — Next Feature Candidates (NOT STARTED)

From the original Phase B handoff, the remaining dashboard work after B-C:

- **Data-table drill-down** — interactive monthly data table with sorting/filtering
  per resource (extend `PerformanceExplorer` or add a dedicated component).
- **YoY comparison explorer** — multi-metric YoY comparison view (baseline vs
  current) beyond the current normalized bar chart.
- **Metric detail enhancements** — deeper drill-down on `/dashboard/[id]/`.

### Files / Areas to Inspect First
1. `src/pages/dashboard.astro` + `src/pages/en/dashboard/index.astro` — current
   section order after Phase B (1 hero, 2 pulse, 2b explorer, 3 insights, 4 baseline,
   5 categories, 6 readiness, 7 trust, 8 closing).
2. `src/components/dashboard/*.astro` — `NormalizedTrendChart`,
   `DataReadinessMatrix`, `MetricDashboard` for extension points.
3. `src/utils/chart-option.ts` — existing builders to extend (never refactor).
4. `src/utils/dashboard-phase-a-vm.ts` — VM contract (read-only, extend additively).

### Do NOT Touch
- `ResourcePerformanceCard.astro` — still used by landing page
- `EChart.astro` — shared wrapper, no refactor
- `dashboard-phase-a-vm.ts` — modify only additively
- All `src/data/generated/*.json` — frozen pipeline
- All `src/data/criteria/*.json` — canonical taxonomy

---

## Maintenance Backlog (v1.3.1 patch line)

From `docs/operations/GOFFICE2026_MAINTENANCE_BACKLOG.md`:

- [ ] Dependency advisories — 6 items (astro/vite/js-yaml/postcss/sharp = high,
      esbuild = moderate). Plan Astro line bump + re-run `npm audit --omit=dev`.
      **Do NOT run `npm audit fix`** (auto-fix can break the Astro build).
- [ ] Classify/commit remaining untracked docs (NEEDS_PO_REVIEW list)
- [ ] Review large generated migration data dumps (25 MB under `docs/migration/`)
- [ ] Baseline RUNTIME_QA / Lighthouse ≥95 retest after v1.3.0 deploy

---

## Home Resume Procedure

```sh
# 1. Clone or pull
cd F:/projectAi/goffice2026
git pull origin master

# 2. Verify checkpoint
git rev-parse HEAD
# Expected: 5f3209a4999bb08004f909dc79ea27571c056dc6
git log --oneline -1
# Expected: "feat(dashboard): GO-DASH-V2 Phase B - performance explorer + composition cleanup"

# 3. Install dependencies (only if package.json changed)
npm install

# 4. Targeted baseline checks
npm run check                         # 0 errors expected
node --test scripts/test-chart-option.mjs  # 22/22 expected
npm run build                         # 252 pages expected

# 5. Read this handoff
cat docs/handoff/GO-DASH-V2-PHASE-B-HANDOFF-2026-08-08.md

# 6. Continue Phase B-C or Phase C — STOP, do not redo Phase A/B-A/B-B
```

---

## Unrelated Untracked Files — Leave Untouched
- `.browser-profile/` — local browser profile, do not commit
- `.vscode/` — local editor settings, do not commit
- All files under `dist/` — build output
- `.astro/types.d.ts` — generated
