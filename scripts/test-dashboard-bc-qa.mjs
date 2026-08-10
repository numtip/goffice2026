/**
 * GO-DASH-V2 Phase B-C — source-level QA contracts
 * =================================================
 * Static assertions for TH/EN parity, a11y focus affordances,
 * responsive grid contracts, and prefers-reduced-motion coverage
 * on explorer / pulse / metric dashboards.
 *
 * Does not require a running preview server.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(join(root, rel), 'utf8');

const thDash = read('src/pages/dashboard.astro');
const enDash = read('src/pages/en/dashboard/index.astro');
const echart = read('src/components/dashboard/EChart.astro');
const pulseCard = read('src/components/dashboard/ResourcePulseCard.astro');
const pulseGrid = read('src/components/dashboard/ResourcePulseGrid.astro');
const explorer = read('src/components/dashboard/PerformanceExplorer.astro');
const metricDash = read('src/components/dashboard/MetricDashboard.astro');
const metricChart = read('src/components/dashboard/MetricChartCard.astro');
const metricHero = read('src/components/dashboard/MetricHero.astro');
const monthlyProgress = read('src/components/dashboard/MonthlyProgress.astro');
const metricKpi = read('src/components/dashboard/MetricKpiGrid.astro');
const echartsInit = read('src/scripts/echarts-init.ts');
const thMetricPage = read('src/pages/dashboard/[id].astro');
const enMetricPage = read('src/pages/en/dashboard/[id].astro');

describe('B-C TH/EN structural parity — main dashboard', () => {
  const sharedMarkers = [
    'CommandHero',
    'ResourcePulseGrid',
    'PerformanceExplorer',
    'NormalizedTrendChart',
    'DataReadinessMatrix',
    'JourneyLinks',
    'dashboard-section',
    'prefers-reduced-motion',
    '/about/policy',
    '/about/goals',
  ];

  for (const marker of sharedMarkers) {
    it(`TH and EN both include ${marker}`, () => {
      assert.match(thDash, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      assert.match(enDash, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    });
  }

  it('metric detail pages both orchestrate MetricDashboard', () => {
    assert.match(thMetricPage, /MetricDashboard/);
    assert.match(enMetricPage, /MetricDashboard/);
  });
});

describe('B-C a11y focus / keyboard — explorer + pulse + metric tabs', () => {
  it('ResourcePulseCard exposes focus-visible ring', () => {
    assert.match(pulseCard, /focus-visible:ring-2/);
    assert.match(pulseCard, /focus-visible:ring-primary/);
  });

  it('EChart table-fallback summary has focus-visible ring', () => {
    assert.match(echart, /<summary[^>]*focus-visible:ring-2/);
  });

  it('PerformanceExplorer keeps accessible table fallback via EChart', () => {
    assert.match(explorer, /EChart/);
    assert.match(explorer, /tableSummary/);
    assert.match(explorer, /null \? '—' : String\(v\)/);
  });

  it('MetricChartCard tabs support keyboard Left/Right/Home/End', () => {
    assert.match(metricChart, /ArrowRight/);
    assert.match(metricChart, /ArrowLeft/);
    assert.match(metricChart, /Home/);
    assert.match(metricChart, /End/);
    assert.match(metricChart, /focus-visible:ring-2/);
    assert.match(metricChart, /tabindex="-1"/);
  });

  it('MetricDashboard interactive links carry focus-visible rings', () => {
    assert.match(metricDash, /focus-visible:ring-2/);
  });
});

describe('B-C responsive contracts — pulse + metric dashboards', () => {
  it('ResourcePulseGrid uses 1 → 2 → 3 column breakpoints (xl for desktop 3-col)', () => {
    assert.match(pulseGrid, /grid-cols-1/);
    assert.match(pulseGrid, /sm:grid-cols-2/);
    assert.match(pulseGrid, /xl:grid-cols-3/);
  });

  it('MetricDashboard chart/progress layout is 1-col mobile, 3-col desktop', () => {
    assert.match(metricDash, /grid-cols-1 lg:grid-cols-3/);
  });

  it('MetricKpiGrid is 1 → 2 → 4 columns', () => {
    assert.match(metricKpi, /grid-cols-1 sm:grid-cols-2 lg:grid-cols-4/);
  });
});

describe('B-C prefers-reduced-motion — metric dashboards + shared charts', () => {
  it('echarts-init disables animation under prefers-reduced-motion', () => {
    assert.match(echartsInit, /prefers-reduced-motion:\s*reduce/);
    assert.match(echartsInit, /animation:\s*!reducedMotion/);
  });

  it('MetricHero declares reduced-motion override', () => {
    assert.match(metricHero, /prefers-reduced-motion:\s*reduce/);
  });

  it('MonthlyProgress and MetricKpiGrid progress bars respect motion-reduce', () => {
    assert.match(monthlyProgress, /motion-reduce:transition-none/);
    assert.match(metricKpi, /motion-reduce:transition-none/);
  });

  it('ResourcePulseCard disables hover motion under reduced-motion', () => {
    assert.match(pulseCard, /prefers-reduced-motion:\s*reduce/);
    assert.match(pulseCard, /transition:\s*none/);
  });

  it('MetricChartCard tab transitions honor motion-reduce', () => {
    assert.match(metricChart, /motion-reduce:transition-none/);
  });

  it('EN main dashboard section reveal is gated by prefers-reduced-motion', () => {
    assert.match(enDash, /prefers-reduced-motion:\s*no-preference/);
    assert.match(enDash, /section-reveal/);
  });
});

describe('B-C frozen FY2569 display contracts (regression guards)', () => {
  it('explorer never coerces missing months to 0 in fallback table', () => {
    assert.match(explorer, /v === null \? '—' : String\(v\)/);
    assert.doesNotMatch(explorer, /v \?\? 0/);
  });

  it('pulse card pending totals render via totalDisplay (never hardcode 0 unit)', () => {
    assert.match(pulseCard, /card\.totalDisplay/);
    assert.match(pulseCard, /showUnit = card\.total !== null/);
  });
});
