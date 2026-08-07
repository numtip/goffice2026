# GO-DASH-V2 Phase A — Home Handoff 2026-08-07

---

## State

| Field | Value |
|---|---|
| **Project** | goffice2026 |
| **Repo** | github.com/numtip/goffice2026 |
| **Branch** | `master` |
| **Latest verified commit** | `5a3b6af0154c6b5f4e3f6f641fbbf0152ae9cc34` |
| **HEAD == origin/master** | ✅ yes |
| **Phase A status** | **COMPLETE** |
| **Phase B** | **NOT STARTED** |

---

## Phase A — Completed

### Architecture
- **Shared ViewModel**: `src/utils/dashboard-phase-a-vm.ts` — single-source contract exporting `buildPhaseAVM(locale)` → `PhaseAVM`. Derived from frozen generated JSON; no hardcoded business numbers.
- **Command Hero** (`src/components/dashboard/CommandHero.astro`) — 3-zone dark premium hero (radial | headline | evidence/taxonomy), reuses existing hero image + gradient overlay.
- **MonthlyCoverageRadial** (`src/components/dashboard/MonthlyCoverageRadial.astro`) — ECharts donut via shared `EChart.astro` wrapper, 19% emerald arc + center title 19%/14/72, localized aria + table fallback.
- **ResourcePulseGrid** (`src/components/dashboard/ResourcePulseGrid.astro`) — section header + legend + responsive grid: `xl:grid-cols-3` (desktop 3×2), `sm:grid-cols-2` (tablet 2×3), `grid-cols-1` (mobile 1×).
- **ResourcePulseCard** (`src/components/dashboard/ResourcePulseCard.astro`) — premium single card: accent top bar, icon + name, tabular-nums total (`—` when pending, never 0), x/12 months, genuine sparkline (energy/water only), provenance cue, CTA.
- **Page integration**: `src/pages/dashboard.astro` (TH) + `src/pages/en/dashboard/index.astro` (EN) — sections 1–2 replaced with `<CommandHero>` + `<ResourcePulseGrid>`; old hero with EXCELLENT/GOOD/FAIR badge removed; old `ResourcePerformanceCard` loop removed.
- **ECharts additive** (no refactor): `echarts-init.ts` + `PieChart` + `TitleComponent`; `chart-option.ts` + `buildCoverageRadialOption`.

### Key Data Points (frozen — never recompute)
- Coverage: **14/72 = 19%** (energy 7 months Jan–Jul 2569, water 7 months Jan–Jul 2569, fuel/paper/waste/ghg = 0 months, pending)
- Taxonomy: **7 categories · 24 issues · 65 indicators** (criteria JSONs, canonical)
- Evidence: **24 items**, updated 2026-07-27
- Last updated: **2026-08-07** (max of all year.updated stamps in generated JSON)
- Energy FY2569: 264,594.4 kWh (7 months), Water FY2569: 5,572.03 m³ (7 months)
- Fuel/Paper/Waste/GHG FY2569: `CURRENT_DATA_PENDING`, months=[], total=0 in JSON → VM returns `total: null`

### Frozen Rules
- 14/72 + 19% is **DATA COVERAGE** — never an assessment score
- Never EXCELLENT/GOOD/FAIR badges or score semantics
- Missing months are `null` — never converted to 0
- Pending resources render `—` — never `'0'`, never a fake sparkline or fake arrow
- `ResourcePerformanceCard.astro` is still used by the **landing page** — do not delete it
- ECharts wrapper `EChart.astro` is NOT refactored — reused as-is
- 7/24/65 taxonomy is canonical, not manufactured
- Excel→JSON pipeline is frozen — `src/data/generated/*.json`

### Tests / Build / Preview
| Gate | Result |
|---|---|
| `astro check` | 0 errors, 0 warnings, 10 hints (all pre-existing) |
| `node --test` (60/60) | all pass (incl. 3 new chart-option radial tests) |
| `npx tsx test-dashboard-executive` | 18/18 pass |
| `astro build` (GH Pages) | 252 pages, success |
| Smoke routes | 42/42 |
| **Public preview** | https://numtip.github.io/goffice2026/dashboard/ (TH) · https://numtip.github.io/goffice2026/en/dashboard/ (EN) |
| Workflow | [Deploy GitHub Pages Preview run 31165023526](https://github.com/numtip/goffice2026/actions/runs/31165023526) — `success` |

### Known Visual Observations
- ECharts donut renders as a canvas element — HTML table fallback available via `<details>`
- Pulse grid uses `xl:grid-cols-3` (≥1280px for 3 columns); 1024px = 2 columns
- Respected `prefers-reduced-motion` — no CSS animation, ECharts sets `animation: false`
- `<title>` shows both locales (`Dashboard | แดชบอร์ด`) on each locale page — pre-existing
- Single H1 per dashboard page (coverage title)
- No horizontal overflow at 390px

---

## Phase B — Performance Explorer (NOT STARTED)

### Objective
Performance Explorer with comparable baseline + legacy composition cleanup.

### Recommended Subagent Structure
- **B-A — Explorer / Data Interaction**: multi-metric ECharts explorer, Yoy comparison, data-table drill-down. Inspect first: `src/utils/chart-option.ts` (existing builders), `buildPhaseAVM` (VM contract), `NormalizedTrendChart.astro`, `DataReadinessMatrix.astro`.
- **B-B — Composition Cleanup**: remove or refactor legacy dashboard components that are now superseded by Phase-A hero/pulse (e.g. old `MetricHero`, `ExecutiveScore`, repeated readiness sections in `dashboard.astro` pages). Inspect first: full `dashboard.astro` page after `<ResourcePulseGrid>` to identify dead/composed sections.
- **B-C — QA / i18n**: TH/EN parity, desktop/tablet/mobile, a11y, console, reduced-motion regression.

### Files / Areas to Inspect First
1. `src/pages/dashboard.astro` + `src/pages/en/dashboard/index.astro` — the full page after Phase-A replacement to identify remaining sections and dead code
2. `src/components/dashboard/*.astro` — `NormalizedTrendChart`, `DataReadinessMatrix`, `ExecutiveKpi`, `ExecutiveSummary`, `ExecutiveInsight`, `MetricHero`, `CategoryScoreChart`, `DataEvidencePanel` — to determine which to keep/refactor/remove
3. `src/utils/chart-option.ts` — existing pure builders to extend (never refactor)
4. `src/utils/dashboard-phase-a-vm.ts` — VM contract (read-only, extend additively if needed for explorer)
5. `src/utils/dashboard-generated-metrics.ts` — metric map (read-only)
6. `src/scripts/echarts-init.ts` — only add chart types additively

### Do NOT Touch
- `ResourcePerformanceCard.astro` — still used by landing page
- `EChart.astro` — shared wrapper, no refactor
- `dashboard-phase-a-vm.ts` — modify only additively
- All `src/data/generated/*.json` — frozen pipeline
- All `src/data/criteria/*.json` — canonical taxonomy

---

## Unrelated Untracked Files — Leave Untouched
- `docs/GOFFICE2026_RAPID_COMPLETION_PLAN_V1.md`
- `docs/audit/GOFFICE2026_V4_REPOSITORY_AUDIT.md`
- `scripts/_tmp-check-live.mjs`
- `scripts/_tmp-context.mjs`
- `scripts/_tmp-live-heading.mjs`
- `scripts/_tmp-verify-heading.mjs`
- `scripts/_tmp-verify-heading2.mjs`
- `scripts/_tmp-verify-summary.mjs`
- `scripts/_tmp-verify-summary2.mjs`
- All files under `dist/`
- `.astro/types.d.ts`
- `archive/demo-data/README.md`

---

## Home Resume Procedure

```sh
# 1. Clone or pull
cd G:/ProjectAI/goffice2026
git pull origin master

# 2. Verify checkpoint
git rev-parse HEAD
# Expected: 5a3b6af0154c6b5f4e3f6f641fbbf0152ae9cc34
git log --oneline -1
# Expected: "feat(dashboard): GO-DASH-V2 Phase A — command hero + resource pulse"

# 3. Install dependencies (only if package.json changed)
npm install

# 4. Targeted baseline checks
npm run check                         # 0 errors expected
node --test scripts/test-chart-option.mjs  # 17/17 expected

# 5. Read handoff
cat docs/handoff/GO-DASH-V2-HANDOFF-2026-08-07.md

# 6. Start Phase B — STOP, do not start Phase A again
```
