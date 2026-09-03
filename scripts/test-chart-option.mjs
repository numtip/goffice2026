/**
 * test-chart-option.mjs
 * =====================
 * Contract tests for src/utils/chart-option.ts — the server-side builders
 * that turn canonical generated JSON into ECharts options.
 *
 * Enforced rules:
 *   - Missing 2569 months are ALWAYS null — never converted to 0.
 *   - Values originate from generated JSON only (no hardcoded KPI numbers).
 *   - Units + year labels propagate from the metric schema.
 *   - Options are JSON-serializable (no functions), so they can be embedded
 *     as data attributes and hydrated client-side.
 *
 * Run with: node --test scripts/test-chart-option.mjs  (Node ≥ 24 type stripping)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildMonthlySeries,
  buildMonthlyOption,
  buildNormalizedSeries,
  buildNormalizedOption,
  buildCategoryScoreOption,
  buildCoverageRadialOption,
  buildExplorerOption,
  buildExplorerSingleOption,
  buildCategoryProgressDonutOption,
  buildProgressStackedBarOption,
  PROGRESS_STATUS_COLORS,
  categoryStatusTexts,
  rollingAverage,
  monthLabel,
} from '../src/utils/chart-option.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GENERATED_DIR = join(__dirname, '..', 'src', 'data', 'generated');

function readMetric(name) {
  return JSON.parse(readFileSync(join(GENERATED_DIR, `${name}.json`), 'utf-8'));
}

describe('buildMonthlySeries — missing months are null, never zero', () => {
  it('energy 2569: 8 populated months + 4 nulls; baseline 12 values', () => {
    const metric = readMetric('energy');
    const series = buildMonthlySeries(metric, 'en');
    assert.equal(series.labels.length, 12);
    assert.equal(series.baseline.length, 12);
    assert.equal(series.baseline.filter((v) => v !== null).length, 12, 'baseline 2568 is complete');
    assert.equal(series.current.length, 12);
    assert.equal(series.current.filter((v) => v !== null).length, 8, 'energy 2569 has Jan–Aug');
    assert.equal(series.current.filter((v) => v === null).length, 4, 'Sep–Dec must be null, NOT 0');
    assert.equal(series.current.includes(0), false, 'missing months must never be 0');
    assert.equal(series.unit, 'kWh');
    assert.equal(series.baselineYear, 2568);
    assert.equal(series.currentYear, 2569);
  });

  it('ghg 2569 (partial): 7 populated months + 5 nulls; never zero-filled', () => {
    const metric = readMetric('ghg');
    const series = buildMonthlySeries(metric, 'en');
    assert.equal(series.baseline.filter((v) => v !== null).length, 12);
    assert.equal(series.current.filter((v) => v !== null).length, 7, 'ghg 2569 has Jan–Jul');
    assert.equal(series.current.filter((v) => v === null).length, 5, 'Aug–Dec must be null, NOT 0');
    assert.equal(series.current.includes(0), false);
    // A partial (PUBLISHABLE_PARTIAL) current year is machine-extracted but not
    // human-verified — it must be flagged unverified, never shown as Verified.
    assert.equal(series.currentUnverified, true, 'partial FY2569 data must be marked unverified');
    assert.equal(series.unit, 'tCO₂e');
  });

  it('recycling_rate (percentage metric) keeps baseline values as-is', () => {
    const metric = readMetric('recycling_rate');
    const series = buildMonthlySeries(metric, 'en');
    assert.equal(series.baseline[0], 20.83, 'first baseline month preserved verbatim');
    assert.equal(series.current.every((v) => v === null), true);
    assert.equal(series.unit, '%');
  });

  it('TH month labels are Thai abbreviations', () => {
    const metric = readMetric('energy');
    const series = buildMonthlySeries(metric, 'th');
    assert.equal(series.labels[0], 'ม.ค.');
    assert.equal(series.labels[11], 'ธ.ค.');
  });

  it('monthLabel helper is 1-indexed', () => {
    assert.equal(monthLabel(1, 'en'), 'Jan');
    assert.equal(monthLabel(12, 'en'), 'Dec');
    assert.equal(monthLabel(3, 'th'), 'มี.ค.');
  });
});

describe('rollingAverage — nulls preserved', () => {
  it('computes 3-month windows only from consecutive valid values', () => {
    const out = rollingAverage([10, 20, 30, null, 50, 60, 70], 3);
    assert.deepEqual(out, [null, null, 20, null, null, null, 60]);
  });
  it('returns all nulls for a fully missing series', () => {
    const out = rollingAverage([null, null, null, null], 3);
    assert.deepEqual(out, [null, null, null, null]);
  });
});

describe('buildMonthlyOption — serializable + data contract', () => {
  it('energy option round-trips through JSON with nulls intact', () => {
    const metric = readMetric('energy');
    const series = buildMonthlySeries(metric, 'en');
    const option = buildMonthlyOption({
      series,
      theme: { baseline: '#78350f', current: '#b45309', target: '#d97706' },
      locale: 'en',
      names: { baseline: '2568 Baseline', current: '2569 Current', target: '2569 Target' },
      ariaDescription: 'Monthly comparison',
    });
    const roundTripped = JSON.parse(JSON.stringify(option));
    assert.equal(roundTripped.series.length >= 2, true);
    const barSeries = roundTripped.series.filter((s) => s.type === 'bar');
    const currentBar = barSeries.find((s) => s.name === '2569 Current');
    assert.ok(currentBar, 'current series present');
    assert.equal(currentBar.data.length, 12);
    assert.equal(currentBar.data.filter((v) => v === null).length, 4);
    assert.equal(currentBar.data.includes(0), false);
    assert.equal(roundTripped.yAxis.name, 'kWh', 'unit propagated to axis');
    assert.equal(roundTripped.aria.enabled, true);
  });

  it('target series is omitted when all target values are null', () => {
    const metric = readMetric('ghg'); // target.months is empty
    const series = buildMonthlySeries(metric, 'en', { showTarget: true });
    const option = buildMonthlyOption({
      series,
      theme: { baseline: '#134e4a', current: '#0f766e', target: '#d97706' },
      locale: 'en',
      names: { baseline: '2568', current: '2569' },
      ariaDescription: 'x',
    });
    const targets = option.series.filter((s) => s.name === 'Target');
    assert.equal(targets.length, 0);
  });

  it('rolling-average line included for partially populated current data', () => {
    const metric = readMetric('energy');
    const series = buildMonthlySeries(metric, 'en');
    const option = buildMonthlyOption({
      series,
      theme: { baseline: '#78350f', current: '#b45309', target: '#d97706' },
      locale: 'en',
      names: { baseline: '2568', current: '2569' },
      ariaDescription: 'x',
    });
    const lineSeries = option.series.filter((s) => s.type === 'line');
    assert.equal(lineSeries.length, 1, '3-mo rolling avg line present');
  });
});

describe('buildNormalizedSeries/Option — baseline index = 100', () => {
  const resources = [
    { id: 'energy', label: 'Energy', color: '#059669', baselineTotal: 400, currentTotal: 300 },
    { id: 'water', label: 'Water', color: '#0284c7', baselineTotal: 200, currentTotal: 250 },
    { id: 'ghg', label: 'GHG', color: '#dc2626', baselineTotal: 0, currentTotal: 0 },
  ];

  it('computes index = round(current / baseline × 100); zero baseline → 0', () => {
    const s = buildNormalizedSeries(resources);
    assert.deepEqual(s.values, [75, 125, 0]);
    assert.deepEqual(s.labels, ['Energy', 'Water', 'GHG']);
  });

  it('option is JSON-serializable with baseline markLine at x=100', () => {
    const s = buildNormalizedSeries(resources);
    const option = buildNormalizedOption({ series: s, locale: 'en', baselineLabel: 'Baseline 2568', currentLabel: 'Current 2569', ariaDescription: 'x' });
    const rt = JSON.parse(JSON.stringify(option));
    const markLine = rt.series[0].markLine;
    assert.equal(markLine.data[0].xAxis, 100);
    assert.equal(markLine.label.formatter, 'Baseline 2568 = 100');
  });
});

describe('buildCategoryScoreOption — labels, statuses, serializability', () => {
  const categories = [
    { code: 'cat1', label: 'Category One', score: 85, trend: 'up', href: '/categories/cat1/' },
    { code: 'cat2', label: 'Category Two', score: 60, trend: 'down', href: '/categories/cat2/', statusText: 'Needs attention' },
  ];

  it('appends trend arrows to category labels and keeps status text separate', () => {
    const option = buildCategoryScoreOption({ categories, locale: 'en', ariaDescription: 'x' });
    const rt = JSON.parse(JSON.stringify(option));
    assert.deepEqual(rt.yAxis.data, ['Category One \u2191', 'Category Two \u2193']);
    assert.deepEqual(categoryStatusTexts(categories), ['', 'Needs attention']);
  });

  it('maxScore defaults to at least 100', () => {
    const option = buildCategoryScoreOption({ categories, locale: 'en', ariaDescription: 'x' });
    assert.equal(option.xAxis.max >= 100, true);
  });
});

describe('buildCoverageRadialOption — coverage donut, never a score', () => {
  it('produces a serializable donut with covered/remaining segments and center title', () => {
    const option = buildCoverageRadialOption({ covered: 14, total: 72, percent: 19, locale: 'en' });
    const rt = JSON.parse(JSON.stringify(option));
    assert.equal(rt.series[0].type, 'pie');
    assert.equal(rt.series[0].data[0].value, 14, 'covered slice value');
    assert.equal(rt.series[0].data[0].itemStyle.color, '#10b981', 'covered segment is emerald');
    assert.equal(rt.series[0].data[1].value, 58, 'remaining = total - covered');
    assert.equal(rt.title.text, '19%', 'center title shows percent');
    assert.equal(rt.title.subtext, '14/72', 'center subtext shows covered/total');
    assert.equal(rt.aria.enabled, true, 'aria enabled with description');
    assert.match(rt.aria.label.description, /14 of 72 months, 19 percent/);
  });

  it('localizes the aria description for th', () => {
    const option = buildCoverageRadialOption({ covered: 14, total: 72, percent: 19, locale: 'th' });
    assert.match(option.aria.label.description, /14 จาก 72 เดือน, 19 เปอร์เซ็นต์/);
  });

  it('keeps remaining non-negative when coverage is complete', () => {
    const option = buildCoverageRadialOption({ covered: 72, total: 72, percent: 100, locale: 'en' });
    assert.equal(option.series[0].data[1].value, 0);
  });
});

describe('buildExplorerOption — multi-metric monthly explorer (GO-DASH-V2-B-A)', () => {
  const resources = [
    { id: 'energy', label: 'Energy', color: '#006c49', months: [100, 110, null, 130, null, null, null, null, null, null, null, null], unit: 'kWh' },
    { id: 'water', label: 'Water', color: '#0ea5e9', months: [50, null, 60, null, null, null, null, null, null, null, null, null], unit: 'm³' },
  ];

  it('builds one line series per resource with 12 month slots', () => {
    const option = buildExplorerOption({ resources, locale: 'en', yearLabel: 'FY2569', ariaDescription: 'test' });
    assert.equal(option.series.length, 2, 'one series per resource');
    assert.equal(option.series[0].type, 'line');
    assert.equal(option.series[0].data.length, 12, '12 month slots');
    assert.equal(option.series[0].name, 'Energy');
    assert.equal(option.series[1].name, 'Water');
  });

  it('preserves nulls for missing months — never converts to 0', () => {
    const option = buildExplorerOption({ resources, locale: 'en', yearLabel: 'FY2569', ariaDescription: 'test' });
    const energy = option.series[0].data;
    assert.equal(energy[0], 100);
    assert.equal(energy[2], null, 'missing month stays null');
    assert.equal(energy.includes(0), false, 'no fabricated zeros');
  });

  it('uses localized month labels on the x-axis', () => {
    const th = buildExplorerOption({ resources, locale: 'th', yearLabel: 'ปี 2569', ariaDescription: 'test' });
    assert.equal(th.xAxis.data[0], 'ม.ค.');
    assert.equal(th.xAxis.data[11], 'ธ.ค.');
    const en = buildExplorerOption({ resources, locale: 'en', yearLabel: 'FY2569', ariaDescription: 'test' });
    assert.equal(en.xAxis.data[0], 'Jan');
    assert.equal(en.xAxis.data[11], 'Dec');
  });

  it('is JSON-serializable (no functions) and sets aria description', () => {
    const option = buildExplorerOption({ resources, locale: 'en', yearLabel: 'FY2569', ariaDescription: 'Monthly explorer' });
    assert.doesNotThrow(() => JSON.stringify(option));
    assert.equal(option.aria.enabled, true);
    assert.equal(option.aria.label.description, 'Monthly explorer');
  });

  it('keeps connectNulls false so gaps are not bridged', () => {
    const option = buildExplorerOption({ resources, locale: 'en', yearLabel: 'FY2569', ariaDescription: 'test' });
    assert.equal(option.series[0].connectNulls, false);
  });
});

describe('buildExplorerSingleOption — small-multiples monthly panel (GO-DASH-V2)', () => {
  const resource = {
    id: 'energy',
    label: 'Energy',
    color: '#006c49',
    months: [100, 110, null, 130, null, null, null, null, null, null, null, null],
    unit: 'kWh',
  };

  it('builds one line series with per-resource Y-axis unit', () => {
    const option = buildExplorerSingleOption({
      resource,
      locale: 'en',
      yearLabel: 'FY2569',
      ariaDescription: 'Energy panel',
    });
    assert.equal(option.series.length, 1);
    assert.equal(option.series[0].type, 'line');
    assert.equal(option.series[0].data.length, 12);
    assert.equal(option.yAxis.name, 'kWh');
    assert.equal(option.series[0].connectNulls, false);
    assert.equal(option.xAxis.axisLabel.interval, 0, 'all month labels shown');
  });

  it('preserves nulls — never converts missing months to 0', () => {
    const option = buildExplorerSingleOption({
      resource,
      locale: 'en',
      yearLabel: 'FY2569',
      ariaDescription: 'test',
    });
    assert.equal(option.series[0].data[2], null);
    assert.equal(option.series[0].data.includes(0), false);
  });

  it('uses localized month labels and is JSON-serializable', () => {
    const th = buildExplorerSingleOption({ resource, locale: 'th', yearLabel: 'ปี 2569', ariaDescription: 'test' });
    assert.equal(th.xAxis.data[0], 'ม.ค.');
    const en = buildExplorerSingleOption({ resource, locale: 'en', yearLabel: 'FY2569', ariaDescription: 'test' });
    assert.equal(en.xAxis.data[0], 'Jan');
    assert.doesNotThrow(() => JSON.stringify(en));
  });
});

describe('buildCategoryProgressDonutOption — criteria progress donut (D3)', () => {
  it('is JSON-serializable, shows percent in title and ready/applicable in subtext', () => {
    const option = buildCategoryProgressDonutOption({
      ready: 4,
      applicable: 18,
      percent: 22.2,
      locale: 'th',
      ariaDescription: 'หมวด 1: 4 จาก 18 ตัวชี้วัด',
    });
    assert.doesNotThrow(() => JSON.stringify(option));
    // counts-first: title leads with ready/applicable, percent is secondary subtext
    assert.equal(option.title.text, '4/18');
    assert.equal(option.title.subtext, '22.2%');
    assert.equal(option.series[0].type, 'pie');
    assert.equal(option.series[0].data[0].value, 4);
    assert.equal(option.series[0].data[1].value, 14, 'remaining = applicable - ready');
    assert.equal(option.series[0].data[0].itemStyle.color, PROGRESS_STATUS_COLORS.ready);
  });

  it('clamps remaining to zero when ready equals applicable', () => {
    const option = buildCategoryProgressDonutOption({ ready: 18, applicable: 18, percent: 100, locale: 'en', ariaDescription: 'x' });
    assert.equal(option.series[0].data[1].value, 0);
    assert.equal(option.title.text, '18/18');
    assert.equal(option.title.subtext, '100%');
  });
});

describe('buildProgressStackedBarOption — horizontal status stacks (D3)', () => {
  const items = [
    { label: '1 หมวด 1', ready: 4, inProgress: 2, notStarted: 2, unavailable: 10 },
    { label: '2 หมวด 2', ready: 0, inProgress: 0, notStarted: 0, unavailable: 6 },
  ];

  it('renders four stacked series in progress order with count labels', () => {
    const option = buildProgressStackedBarOption({ items, locale: 'th', ariaDescription: 'test' });
    assert.doesNotThrow(() => JSON.stringify(option));
    assert.equal(option.series.length, 4);
    assert.ok(option.series.every((s) => s.stack === 'progress'));
    assert.equal(option.series[0].name, 'พร้อม');
    assert.equal(option.series[0].data[0], 4);
    assert.equal(option.series[3].data[1], 6);
    assert.ok(option.series.every((s) => s.label.formatter === '{c}'), 'labels use serializable {c} template');
    assert.equal(option.yAxis.data.length, 2);
  });

  it('keeps status colors from the shared palette', () => {
    const option = buildProgressStackedBarOption({ items, locale: 'en', ariaDescription: 'test' });
    assert.equal(option.series[0].itemStyle.color, PROGRESS_STATUS_COLORS.ready);
    assert.equal(option.series[1].itemStyle.color, PROGRESS_STATUS_COLORS.inProgress);
    assert.equal(option.series[2].itemStyle.color, PROGRESS_STATUS_COLORS.notStarted);
    assert.equal(option.series[3].itemStyle.color, PROGRESS_STATUS_COLORS.unavailable);
  });
});
