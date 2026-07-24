# GO-DASH-2 — Professional Detail Dashboards Report

> **Sprint:** GO-DASH-2 — Professional Detail Dashboards  
> **Date:** 2026-07-24  
> **Commit:** `6d23bf4` — `feat(dashboard): redesign environmental metric detail pages`  
> **Branch:** `master` → pushed to `origin/master`  
> **Status:** ✅ PASS

---

## 1. Verdict

✅ **PASS** — All 6 environmental metric dashboards (Energy, Water, Fuel, Paper, Waste, GHG) redesigned with a shared **"Executive Sustainability Intelligence"** design system. All quality gates pass:

| Gate | Result |
|------|--------|
| `npm test` | **28/28 pass** (0 fail) |
| `npx astro check` | **0 errors, 0 warnings, 0 hints** |
| `npm run build` | **226 pages built** in ~6s |
| TH/EN parity | ✅ Both routes use shared orchestrator |
| No hardcoded values | ✅ All numbers from canonical JSON |
| No canonical data changes | ✅ Zero `.json` data files modified |

---

## 2. Before / After

| Aspect | Before | After |
|--------|--------|-------|
| **TH/EN code** | ~360 + ~293 lines duplicated per page | ~35 lines each — thin wrappers |
| **KPI cards** | 3 cards (baseline, target, current) | 4-card command center (baseline, current, completeness, target) |
| **Unverified data** | Same prominence as verified | Dimmed/gray, amber badge, "ข้อมูลตัวอย่าง/รอตรวจสอบ" |
| **Missing months** | Rendered as zero bars | Gaps with dashed placeholder |
| **Target = null** | "TBD" (technical) | "ยังไม่กำหนดเป้าหมาย / Target not set" |
| **Provenance** | Inline technical details | Summary + expandable accordion |
| **Navigation** | Prev/next only | Metric switcher + de-emphasized prev/next |
| **Insights** | Generic YoY + partial-year warning | Data-driven executive strip + metric-specific grid |
| **Chart/Table** | Chart only + collapsible `<details>` | Toggle tabs (Chart/Table) with ARIA roles |
| **Accent colors** | All green | Semantic per-metric (amber/blue/orange/yellow/green/teal) |

---

## 3. Shared Components

### New Components (9 + 1 orchestrator)

| Component | Purpose |
|-----------|---------|
| `MetricIcon.astro` | Inline SVG per metric (energy/water/fuel/paper/waste/ghg), uses `currentColor` |
| `DataStatusBadge.astro` | Verified/unverified badge — **never green when `quality.valid=false`** |
| `MetricHero.astro` | Compact hero: icon, title, purpose, indicator badge, status badge, last-updated |
| `MetricKpiGrid.astro` | Responsive 4-card grid with accent strips, verified icons, progress bars |
| `ExecutiveInsight.astro` | 3-line data-driven summary (what / months / interpretation) |
| `MonthlyProgress.astro` | Compact 12-month timeline with progress bar + legend |
| `MetricChartCard.astro` | Large chart with Chart/Table toggle, unverified badge, missing-month gaps |
| `MetricInsightGrid.astro` | Metric-specific insight cards with semantic tones |
| `DataEvidencePanel.astro` | Summary + accordion for technical provenance details |
| `MetricSwitcher.astro` | Horizontal scrollable metric navigation with active state |
| `MetricDashboard.astro` | **Orchestrator** — composes all sections, eliminates TH/EN duplication |

### Supporting Modules

| File | Purpose |
|------|---------|
| `src/data/metric-theme.ts` | Semantic accent colors per metric (WCAG AA contrast) |
| `src/utils/metric-insights.ts` | Data-driven insight computations + executive insight builder |

### Accent Color Mapping

| Metric | Accent | Color |
|--------|--------|-------|
| Energy | amber/electric | `#b45309` |
| Water | blue | `#0369a1` |
| Fuel | orange | `#c2410c` |
| Paper | warm neutral | `#a16207` |
| Waste | green | `#15803d` |
| GHG | teal/dark green | `#0f766e` |

---

## 4. Metric-specific Improvements

### Energy
- Monthly peak (with month label)
- Average per month
- Completeness %

### Water
- Monthly peak
- Average per month
- **Outlier warning** (>2× average detection)

### Fuel
- Zero-use months count
- Average per recorded month (excludes zeros)
- Completeness %

### Paper
- Average per month
- **Reduction status** (only when target valid AND current verified)
- Completeness %

### Waste
- **Monthly recycling average** (never sums percentages)
- Completeness %
- Explicit **aggregation method** note ("หน่วยเป็นเปอร์เซ็นต์ ใช้ค่าเฉลี่ยรายเดือน ไม่รวมค่าเปอร์เซ็นต์")

### GHG
- Total tCO₂e
- Completeness %
- **Scope breakdown placeholder** — explicitly "ยังไม่มีข้อมูล", no scope chart shown

---

## 5. Data Integrity Safeguards

| Safeguard | Implementation |
|-----------|---------------|
| Unverified current-year data | `quality.valid=false` → amber "Unverified" badge, dimmed KPI value (`text-outline-variant`), gray chart bars at 50% opacity, "ข้อมูลตัวอย่าง/รอตรวจสอบ" label |
| Missing months | Gaps (not zeros) in chart — `<line>` dashed placeholder, table shows "—" |
| `target.targetValue=null` | "ยังไม่กำหนดเป้าหมาย / Target not set" — never "TBD" |
| Waste aggregation | `aggregation: 'average'` enforced, explicit "ไม่ใช่ผลรวม" note in insight grid |
| GHG scope chart | Suppressed — placeholder text "ยังไม่มีข้อมูล" until real Scope 1/2/3 data exists |
| Executive insight | Dynamically generated from `quality.valid` + month count — **never hardcodes numbers** |
| Trend indicators | Only shown when `shouldShowYoy()` returns true AND `currentVerified` is true |
| Canonical data | **Zero `.json` data files modified** — only schema type extended (`labelTh?` added to `IndicatorMapping`) |

---

## 6. Responsive / Accessibility

### Responsive Breakpoints
- **375px (mobile):** 1-column stack, chart-first, collapsible table, horizontal-scroll switcher
- **768px (tablet):** 2-column KPI grid, chart + progress side-by-side
- **1440px (desktop):** 4-column KPI grid, 3-column chart+progress layout, full switcher visible
- **No horizontal overflow** at any breakpoint

### Accessibility
- ✅ Semantic headings (h1 → h2 → h3)
- ✅ Keyboard-accessible tabs (`role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`)
- ✅ Keyboard-accessible accordion (`<details>` / `<summary>` with focus ring)
- ✅ ARIA labels on all interactive elements
- ✅ `role="progressbar"` with `aria-valuenow` / `aria-valuemin` / `aria-valuemax`
- ✅ Visible focus rings (`focus-visible:ring-2`)
- ✅ Chart `<title>` / `<desc>` for screen readers
- ✅ `prefers-reduced-motion` support (animations disabled)
- ✅ No information by color alone — icons + text always accompany color
- ✅ WCAG AA contrast on all accent colors

---

## 7. Tests / Build

```
npm test          → 28/28 pass (0 fail)
npx astro check   → 0 errors, 0 warnings, 0 hints
npm run build     → 226 pages built in 5.73s
```

---

## 8. Files Changed

**16 files changed, +1942 insertions, −581 deletions**

### New Files (13)
```
src/data/metric-theme.ts
src/utils/metric-insights.ts
src/components/dashboard/MetricIcon.astro
src/components/dashboard/DataStatusBadge.astro
src/components/dashboard/MetricHero.astro
src/components/dashboard/MetricKpiGrid.astro
src/components/dashboard/ExecutiveInsight.astro
src/components/dashboard/MonthlyProgress.astro
src/components/dashboard/MetricChartCard.astro
src/components/dashboard/MetricInsightGrid.astro
src/components/dashboard/DataEvidencePanel.astro
src/components/dashboard/MetricSwitcher.astro
src/components/dashboard/MetricDashboard.astro
```

### Modified Files (3)
```
src/pages/dashboard/[id].astro       (360 → 35 lines)
src/pages/en/dashboard/[id].astro    (293 → 35 lines)
src/utils/multi-year-schema.ts       (added labelTh? to IndicatorMapping)
```

---

## 9. Git

- **Commit:** `6d23bf4` — `feat(dashboard): redesign environmental metric detail pages`
- **Push:** `4708414..6d23bf4 master -> master`
- **Workflow:** `.github/workflows/deploy-pages.yml` auto-triggers on push to master
  - Quality job: `npm ci` → `npm run check` → `npm test` → `npm run build` → `npm run validate` → `npm run qa:seo`
  - Build job: Upload Pages artifact
  - Deploy job: Deploy to GitHub Pages
- **No manual production deploy** — GitHub Pages preview only

---

## 10. Production URLs

### Thai (TH)
- https://numtip.github.io/goffice2026/dashboard/energy/
- https://numtip.github.io/goffice2026/dashboard/water/
- https://numtip.github.io/goffice2026/dashboard/fuel/
- https://numtip.github.io/goffice2026/dashboard/paper/
- https://numtip.github.io/goffice2026/dashboard/waste/
- https://numtip.github.io/goffice2026/dashboard/ghg/

### English (EN)
- https://numtip.github.io/goffice2026/en/dashboard/energy/
- https://numtip.github.io/goffice2026/en/dashboard/water/
- https://numtip.github.io/goffice2026/en/dashboard/fuel/
- https://numtip.github.io/goffice2026/en/dashboard/paper/
- https://numtip.github.io/goffice2026/en/dashboard/waste/
- https://numtip.github.io/goffice2026/en/dashboard/ghg/

---

## Architecture Diagram

```
[id].astro (TH/EN) — thin wrapper
  └── MetricDashboard.astro — orchestrator
        ├── MetricSwitcher.astro       — Energy | Water | Fuel | Paper | Waste | GHG
        ├── MetricHero.astro           — icon + title + badges
        ├── MetricKpiGrid.astro        — 4-card: Baseline | Current | Completeness | Target
        ├── ExecutiveInsight.astro     — data-driven 3-line summary
        ├── MetricChartCard.astro      — chart/table toggle + unverified badge
        ├── MonthlyProgress.astro      — 12-month compact timeline
        ├── MetricInsightGrid.astro    — metric-specific insights
        ├── DataEvidencePanel.astro    — summary + accordion technical details
        ├── LinkedEvidenceList         — (existing, reused)
        └── Related Indicators         — (inline, reused)
```

---

## Acceptance Criteria Checklist

- [x] ทั้ง 6 หน้าใช้ design system เดียวกัน
- [x] ดู professional และอ่าน insight ได้ภายใน 10 วินาที
- [x] warning ของ unverified data ชัดเจน
- [x] current placeholder ไม่เด่นเหมือน verified KPI
- [x] waste ใช้ average %
- [x] chart/table accessible
- [x] source technical details ไม่รบกวน main dashboard
- [x] TH/EN parity
- [x] build/tests pass