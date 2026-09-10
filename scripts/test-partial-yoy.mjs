/**
 * test-partial-yoy.mjs
 * ====================
 * GO-DASH-V2 Phase C — overlap YoY contracts.
 *
 * Run: npm run test:dashboard-phase-c
 * (Node ≥ 20 with native TS type-stripping for .ts imports, or Node 22+)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { computePartialYoy, formatNullableCell } from '../src/utils/dashboard-partial-yoy.ts';
import { buildPartialYoyOption, monthLabel } from '../src/utils/chart-option.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GENERATED_DIR = join(__dirname, '..', 'src', 'data', 'generated');

function readMetric(name) {
  return JSON.parse(readFileSync(join(GENERATED_DIR, `${name}.json`), 'utf-8'));
}

describe('computePartialYoy — energy partial Jan–Aug', () => {
  const metric = readMetric('energy');
  const result = computePartialYoy(metric, { id: 'energy' });

  it('status is partial with comparable months 1–8', () => {
    assert.equal(result.status, 'partial');
    assert.deepEqual(result.comparableMonths, [1, 2, 3, 4, 5, 6, 7, 8]);
    assert.equal(result.comparableCount, 8);
  });

  it('metric.yoyChange uses the SAME matched-month window (no partial-vs-full value)', () => {
    // The frozen full-year value -25 (partial FY2569 total ÷ FULL FY2568 total)
    // is forbidden; yoyChange must equal the matched-month overlap result.
    assert.equal(metric.yoyChange.percent, 10.5, 'matched-month YoY for energy');
    assert.notEqual(metric.yoyChange.percent, -25, 'never the partial-vs-full-year value');
    assert.equal(metric.yoyChange.percent, result.percent, 'same window as computePartialYoy');
    assert.deepEqual(metric.yoyChange.months, [1, 2, 3, 4, 5, 6, 7, 8]);
    assert.equal(metric.yoyChange.count, 8);
    assert.equal(metric.yoyChange.basis, 'matched-months');
    assert.equal(metric.yoyChange.currentMonths, 8);
    assert.equal(metric.yoyChange.baselineMonths, 12);
    assert.equal(result.direction, 'up');
    assert.equal(metric.yoyChange.direction, 'up');
  });

  it('Sep–Dec current series are null (never 0); baseline stays populated', () => {
    assert.equal(result.currentSeries.length, 12);
    assert.equal(result.baselineSeries.length, 12);
    for (let i = 8; i < 12; i++) {
      assert.equal(result.currentSeries[i], null, `month ${i + 1} current must be null`);
      assert.notEqual(result.currentSeries[i], 0);
      assert.equal(typeof result.baselineSeries[i], 'number');
    }
    for (let i = 0; i < 8; i++) {
      assert.equal(typeof result.currentSeries[i], 'number');
    }
  });

  it('never reads or copies yoyChange onto the result shape', () => {
    assert.ok(!('yoyChange' in result));
  });
});

describe('computePartialYoy — water partial', () => {
  const metric = readMetric('water');
  const result = computePartialYoy(metric, { id: 'water' });

  it('partial Jan–Aug with matched-month percent (never the old -26 partial-vs-full)', () => {
    assert.equal(result.status, 'partial');
    assert.equal(result.comparableCount, 8);
    assert.equal(metric.yoyChange.percent, 17.8);
    assert.notEqual(metric.yoyChange.percent, -26, 'never the partial-vs-full-year value');
    assert.equal(metric.yoyChange.percent, result.percent);
    assert.equal(result.percent, 17.8);
  });
});

describe('computePartialYoy — recycling_rate pending; fuel/paper/waste/ghg partial', () => {
  it('recycling_rate is pending with null totals and — formatting', () => {
    const metric = readMetric('recycling_rate');
    const result = computePartialYoy(metric, { id: 'recycling_rate' });
    assert.equal(result.status, 'pending');
    assert.equal(result.comparableCount, 0);
    assert.equal(result.percent, null);
    assert.equal(result.absolute, null);
    assert.equal(result.baselineOverlapTotal, null);
    assert.equal(result.currentOverlapTotal, null);
    assert.equal(result.direction, null);
    assert.ok(result.currentSeries.every((v) => v === null));
    assert.equal(formatNullableCell(result.percent), '—');
  });

  it('fuel is now partial Jan–Jul from the actual FY2569 workbook', () => {
    const metric = readMetric('fuel');
    const result = computePartialYoy(metric, { id: 'fuel' });
    assert.equal(result.status, 'partial');
    assert.equal(result.comparableCount, 7);
    assert.notEqual(result.percent, null);
  });

  it('paper is partial Jan–Aug with matched-month YoY (never the old -42 partial-vs-full)', () => {
    const metric = readMetric('paper');
    const result = computePartialYoy(metric, { id: 'paper' });
    assert.equal(result.status, 'partial');
    assert.equal(result.comparableCount, 8);
    assert.equal(metric.yoyChange.percent, -14.2);
    assert.notEqual(metric.yoyChange.percent, -42, 'never the partial-vs-full-year value');
    assert.equal(metric.yoyChange.percent, result.percent);
    assert.equal(result.percent, -14.2);
    assert.equal(result.direction, 'down');
  });

  it('waste is partial Jan–Aug', () => {
    const metric = readMetric('waste');
    const result = computePartialYoy(metric, { id: 'waste' });
    assert.equal(result.status, 'partial');
    assert.equal(result.comparableCount, 8);
    assert.equal(result.percent, 15.6);
    assert.equal(result.direction, 'up');
  });

  it('ghg is partial Jan–Jul with same-period +7.7% (never the old -37 partial-vs-full)', () => {
    const metric = readMetric('ghg');
    const result = computePartialYoy(metric, { id: 'ghg' });
    assert.equal(result.status, 'partial');
    assert.equal(result.comparableCount, 7);
    assert.deepEqual(result.comparableMonths, [1, 2, 3, 4, 5, 6, 7]);
    // Matched-month basis: yoyChange now equals the same-period comparison and
    // can never be the partial-vs-full-year value (-37) again.
    assert.equal(metric.yoyChange.percent, 7.7, 'matched-month YoY for ghg');
    assert.notEqual(metric.yoyChange.percent, -37, 'never the partial-vs-full-year value');
    assert.equal(metric.yoyChange.percent, result.percent);
    assert.equal(metric.yoyChange.basis, 'matched-months');
    assert.deepEqual(metric.yoyChange.months, [1, 2, 3, 4, 5, 6, 7]);
    assert.equal(metric.yoyChange.baselineMonths, 12);
    assert.equal(metric.yoyChange.currentMonths, 7);
    assert.ok(Math.abs(result.baselineOverlapTotal - 134.408) < 0.01, 'baseline overlap from Resource workbook');
    assert.ok(Math.abs(result.currentOverlapTotal - 144.803) < 0.001, 'current overlap 144.803');
    assert.ok(Math.abs(result.absolute - 10.395) < 0.01, 'absolute delta +10.395');
    assert.equal(result.percent, 7.7);
    assert.equal(result.direction, 'up');
  });
});

describe('buildPartialYoyOption — JSON + connectNulls false + locale months', () => {
  it('energy EN option is JSON-serializable with connectNulls:false', () => {
    const metric = readMetric('energy');
    const result = computePartialYoy(metric, { id: 'energy' });
    const option = buildPartialYoyOption({
      result,
      locale: 'en',
      label: { baseline: 'FY2568', current: 'FY2569' },
      colors: { baseline: '#94a3b8', current: '#059669' },
      ariaDescription: 'Energy overlap YoY',
    });

    const json = JSON.stringify(option);
    assert.ok(json.length > 0);
    const parsed = JSON.parse(json);
    assert.deepEqual(parsed.xAxis.data, [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ]);
    assert.equal(parsed.series.length, 2);
    for (const s of parsed.series) {
      assert.equal(s.connectNulls, false);
      assert.equal(s.data.length, 12);
    }
    assert.equal(parsed.series[1].data.filter((v) => v === null).length, 4);
    assert.equal(parsed.aria.label.description, 'Energy overlap YoY');
  });

  it('TH month labels via monthLabel', () => {
    assert.equal(monthLabel(1, 'th'), 'ม.ค.');
    assert.equal(monthLabel(7, 'th'), 'ก.ค.');
    assert.equal(monthLabel(12, 'th'), 'ธ.ค.');
    const metric = readMetric('energy');
    const result = computePartialYoy(metric, { id: 'energy' });
    const option = buildPartialYoyOption({
      result,
      locale: 'th',
      label: { baseline: 'ปีฐาน 2568', current: 'ปีปัจจุบัน 2569' },
      colors: { baseline: '#94a3b8', current: '#059669' },
      ariaDescription: 'ไฟฟ้า',
    });
    assert.equal(option.xAxis.data[0], 'ม.ค.');
    assert.equal(option.xAxis.data[11], 'ธ.ค.');
  });

  it('pending still returns valid null series with aria', () => {
    const metric = readMetric('recycling_rate');
    const result = computePartialYoy(metric, { id: 'recycling_rate' });
    const option = buildPartialYoyOption({
      result,
      locale: 'en',
      label: { baseline: 'FY2568', current: 'FY2569' },
      colors: { baseline: '#94a3b8', current: '#d97706' },
      ariaDescription: 'Recycling rate pending',
    });
    assert.equal(option.series[1].data.every((v) => v === null), true);
    assert.equal(option.aria.enabled, true);
    assert.equal(option.aria.label.description, 'Recycling rate pending');
    assert.doesNotThrow(() => JSON.stringify(option));
  });
});

describe('no null→0 coercion', () => {
  it('missing months stay null in series and points', () => {
    const metric = readMetric('energy');
    const result = computePartialYoy(metric, { id: 'energy' });
    assert.equal(result.currentSeries.includes(0), false);
    const aug = result.points.find((p) => p.month === 8);
    assert.equal(aug.current, 37210.4, 'Aug is now observed from the synced workbook');
    assert.equal(aug.comparable, true);
    const sep = result.points.find((p) => p.month === 9);
    assert.equal(sep.current, null, 'Sep remains missing');
    assert.equal(sep.delta, null);
    assert.equal(sep.comparable, false);
  });

  it('present zero would be preserved (synthetic)', () => {
    const metric = readMetric('energy');
    const synthetic = structuredClone(metric);
    synthetic.years['2569'].months = [
      ...synthetic.years['2569'].months.filter((m) => m.month !== 1),
      { month: 1, value: 0, label: 'ม.ค.' },
    ];
    // ensure month 1 is 0
    synthetic.years['2569'].months.sort((a, b) => a.month - b.month);
    const idx = synthetic.years['2569'].months.findIndex((m) => m.month === 1);
    synthetic.years['2569'].months[idx] = { month: 1, value: 0, label: 'ม.ค.' };
    const result = computePartialYoy(synthetic, { id: 'energy' });
    assert.equal(result.currentSeries[0], 0);
  });
});
