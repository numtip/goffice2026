/**
 * test-yoy-matched-months.mjs
 * ===========================
 * Regression guard for the matched-month (same-period) YoY contract (PO 2026-09-10).
 *
 * Rules under test:
 *   1. Every generated metric declares `yoyChange.basis === 'matched-months'` and
 *      compares ONLY months present in both years (never partial vs full year).
 *   2. `percent`/`absolute`/`direction` are null (never 0) when the window is not
 *      comparable, with a machine-readable `reason` for the UI to render "—".
 *   3. `yoyChange.percent` equals the same window used by computePartialYoy (UI)
 *      and by computeYoy (schema mirror) — one accepted number, no divergence.
 *   4. The forbidden partial-vs-full-year values (-25 / -26 / -42 / -37 …) can
 *      never reappear as the published YoY.
 *
 * Run: npx tsx --test scripts/test-yoy-matched-months.mjs
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  MATCHED_YOY_BASIS,
  computeMatchedYoy,
  emptyMatchedYoy,
  isMatchedYoy,
  recomputeMatchedYoyForMetric,
} from '../scripts/lib/matched-yoy.mjs';
import { computePartialYoy } from '../src/utils/dashboard-partial-yoy.ts';
import { computeYoy } from '../src/utils/multi-year-schema.ts';
import { formatYoyCoverage, formatYoyReason, formatYoyTrend, isYoyComparable, yoyPercentOf } from '../src/utils/yoy-display.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GENERATED_DIR = join(__dirname, '..', 'src', 'data', 'generated');
const METRICS = ['energy', 'water', 'fuel', 'paper', 'waste', 'ghg', 'recycling_rate'];

const readMetric = (name) => JSON.parse(readFileSync(join(GENERATED_DIR, `${name}.json`), 'utf-8'));

/** Frozen accepted values: the matched-month percent published per metric. */
const FROZEN_PERCENT = {
  energy: 10.5,
  water: 17.8,
  fuel: 16.6,
  paper: -14.2,
  waste: 15.6,
  ghg: 7.7,
  recycling_rate: null,
};

/** Forbidden legacy partial-vs-full-year values (must never be published again). */
const FORBIDDEN_PARTIAL_VS_FULL = {
  energy: [-25],
  water: [-26],
  fuel: [17],
  paper: [-42],
  waste: [-20, -31],
  ghg: [-37],
  recycling_rate: [0, -100],
};

const monthMapOf = (yearData) => new Map((yearData?.months ?? []).map((m) => [m.month, m.value]));

function independentMatchedYoy(metric) {
  const b = monthMapOf(metric.years[String(metric.baselineYear)]);
  const c = monthMapOf(metric.years[String(metric.currentYear)]);
  const months = [];
  let bSum = 0;
  let cSum = 0;
  for (let m = 1; m <= 12; m += 1) {
    if (b.has(m) && c.has(m)) {
      months.push(m);
      bSum += b.get(m);
      cSum += c.get(m);
    }
  }
  const percent = months.length && bSum !== 0
    ? Math.round(((cSum - bSum) / bSum) * 1000) / 10
    : null;
  return { months, bSum, cSum, percent };
}

describe('matched-month YoY contract — every generated metric', () => {
  for (const id of METRICS) {
    const metric = readMetric(id);

    it(`${id}: basis is matched-months and window is the month intersection`, () => {
      const yoy = metric.yoyChange;
      assert.ok(yoy, `${id} has yoyChange`);
      assert.equal(yoy.basis, MATCHED_YOY_BASIS);
      assert.ok(isMatchedYoy(yoy), `${id} yoyChange follows the matched-month shape`);
      const expected = independentMatchedYoy(metric);
      assert.deepEqual(yoy.months, expected.months, `${id} matched months`);
      assert.equal(yoy.count, expected.months.length, `${id} count`);
      assert.equal(yoy.baselineMonths, monthMapOf(metric.years[String(metric.baselineYear)]).size);
      assert.equal(yoy.currentMonths, monthMapOf(metric.years[String(metric.currentYear)]).size);
    });

    it(`${id}: percent is the matched-month value (never partial vs full-year)`, () => {
      const yoy = metric.yoyChange;
      const expected = independentMatchedYoy(metric);
      assert.equal(yoy.percent, FROZEN_PERCENT[id], `${id} frozen matched-month percent`);
      assert.equal(yoy.percent, expected.percent, `${id} percent derived from matched sums`);
      const forbidden = FORBIDDEN_PARTIAL_VS_FULL[id];
      if (forbidden !== undefined) {
        for (const legacy of forbidden) {
          assert.notEqual(yoy.percent, legacy, `${id} must never publish the partial-vs-full value ${legacy}%`);
        }
      }
      if (expected.percent === null) {
        assert.equal(yoy.valid, false, `${id} invalid window must not be marked valid`);
        assert.equal(yoy.absolute, null, `${id} null absolute (never 0)`);
        assert.equal(yoy.direction, null, `${id} null direction (never "stable" as a substitute)`);
        assert.ok(typeof yoy.reason === 'string' && yoy.reason.length > 0, `${id} reason explains the missing window`);
      } else {
        assert.equal(yoy.valid, true, `${id} valid window`);
        assert.equal(yoy.reason, null);
        assert.equal(yoy.direction, expected.percent > 0 ? 'up' : expected.percent < 0 ? 'down' : 'stable');
      }
    });

    it(`${id}: yoyChange, computePartialYoy and computeYoy agree on the window`, () => {
      const yoy = metric.yoyChange;
      const overlap = computePartialYoy(metric, { id });
      assert.equal(yoy.percent, overlap.percent, `${id} same percent as the UI overlap view`);
      assert.deepEqual(yoy.months, overlap.comparableMonths, `${id} same comparable months`);
      assert.equal(yoy.count, overlap.comparableCount);
      const mirror = computeYoy(
        metric.years[String(metric.baselineYear)],
        metric.years[String(metric.currentYear)],
        { baselineYear: metric.baselineYear, currentYear: metric.currentYear },
      );
      assert.deepEqual(mirror, yoy, `${id} TS mirror recomputes the identical record`);
    });

    it(`${id}: never compares a partial current year against the full baseline year`, () => {
      const yoy = metric.yoyChange;
      const currentMonths = yoy.currentMonths;
      const baselineMonths = yoy.baselineMonths;
      const bYear = metric.years[String(metric.baselineYear)];
      const cYear = metric.years[String(metric.currentYear)];
      const bTotal = bYear?.total ?? 0;
      const cTotal = cYear?.total ?? 0;
      if (currentMonths > 0 && currentMonths < 12 && baselineMonths === 12) {
        assert.equal(yoy.count, currentMonths, `${id} window capped at the observed months of the partial year`);
        const bMap = monthMapOf(bYear);
        const matchedBaseline = yoy.months.reduce((s, m) => s + (bMap.get(m) ?? 0), 0);
        // Only meaningful when the matched baseline subtotal differs from the FULL
        // baseline total, i.e. when a partial-vs-full comparison would produce a
        // different (misleading) number.
        if (Math.abs(matchedBaseline - bTotal) > 0.01 && bTotal !== 0) {
          const partialVsFull = Math.round(((cTotal - bTotal) / bTotal) * 1000) / 10;
          assert.notEqual(yoy.percent, partialVsFull, `${id} published YoY must not be the partial-vs-full value`);
        }
      }
    });
  }
});

describe('matched-month YoY — documented coincidences (checked, not assumed)', () => {
  it('fuel: matched-month percent equals the partial-vs-full rounding because Aug–Dec baseline fuel is 0', () => {
    const fuel = readMetric('fuel');
    const b = fuel.years[String(fuel.baselineYear)];
    const bMap = monthMapOf(b);
    const matchedBaseline = fuel.yoyChange.months.reduce((s, m) => s + (bMap.get(m) ?? 0), 0);
    // If a future baseline gains Aug–Dec fuel data, the two numbers diverge and the
    // stronger notEqual guard above starts applying — this test documents why the
    // coincidence exists rather than silently accepting it.
    assert.ok(Math.abs(matchedBaseline - b.total) < 0.01, 'fuel baseline Aug–Dec is zero so window sums coincide');
  });
});

describe('matched-month YoY — invalid windows render null + reason, never 0', () => {
  it('no overlapping months ⇒ nulls and reason "no-overlapping-months"', () => {
    const yoy = computeMatchedYoy(
      { months: [{ month: 1, value: 10 }, { month: 2, value: 20 }] },
      { months: [{ month: 7, value: 30 }, { month: 8, value: 40 }] },
      { baselineYear: 2568, currentYear: 2569 },
    );
    assert.equal(yoy.basis, MATCHED_YOY_BASIS);
    assert.equal(yoy.count, 0);
    assert.equal(yoy.valid, false);
    assert.equal(yoy.reason, 'no-overlapping-months');
    assert.equal(yoy.percent, null);
    assert.equal(yoy.absolute, null);
    assert.equal(yoy.direction, null);
    assert.equal(formatYoyTrend(yoy), '\u2014', 'renders an em dash, not 0%');
    assert.equal(yoyPercentOf(yoy), null);
    assert.equal(isYoyComparable(yoy), false);
    assert.match(formatYoyReason(yoy, 'th'), /เทียบไม่ได้/);
    assert.match(formatYoyReason(yoy, 'en'), /not available/i);
  });

  it('zero baseline ⇒ percent null with reason "baseline-zero" (absolute kept)', () => {
    const yoy = computeMatchedYoy(
      { months: [{ month: 1, value: 0 }, { month: 2, value: 0 }] },
      { months: [{ month: 1, value: 5 }, { month: 2, value: 7 }] },
      { baselineYear: 2568, currentYear: 2569 },
    );
    assert.equal(yoy.valid, false);
    assert.equal(yoy.reason, 'baseline-zero');
    assert.equal(yoy.percent, null);
    assert.equal(yoy.absolute, 12);
    assert.equal(yoy.direction, null);
  });

  it('missing current year ⇒ reason "current-missing" (emptyMatchedYoy stub is null-safe)', () => {
    const stub = emptyMatchedYoy({ baselineYear: 2568, currentYear: 2569, baselineCount: 12 });
    assert.equal(stub.basis, MATCHED_YOY_BASIS);
    assert.equal(stub.valid, false);
    assert.equal(stub.reason, 'current-missing');
    assert.equal(stub.percent, null);
    assert.equal(stub.absolute, null);
    assert.equal(stub.direction, null);
    assert.equal(formatYoyTrend(stub), '\u2014');
    assert.match(formatYoyReason(stub, 'en'), /No current-year data/);
  });

  it('missing months in one year are never coerced to 0', () => {
    const yoy = computeMatchedYoy(
      { months: [{ month: 1, value: 10 }, { month: 2, value: 20 }, { month: 3, value: 30 }] },
      { months: [{ month: 1, value: 5 }] },
      { baselineYear: 2568, currentYear: 2569 },
    );
    assert.deepEqual(yoy.months, [1]);
    assert.equal(yoy.baselineMatched, 10);
    assert.equal(yoy.currentMatched, 5);
    assert.equal(yoy.percent, -50);
  });

  it('average aggregation compares means over the matched window (recycling_rate semantics)', () => {
    const yoy = computeMatchedYoy(
      { months: [{ month: 1, value: 40 }, { month: 2, value: 50 }], aggregation: 'average' },
      { months: [{ month: 1, value: 44 }, { month: 2, value: 56 }], aggregation: 'average' },
      { baselineYear: 2568, currentYear: 2569 },
    );
    assert.equal(yoy.baselineMatched, 45);
    assert.equal(yoy.currentMatched, 50);
    assert.equal(yoy.percent, 11.1);
  });

  it('recomputeMatchedYoyForMetric reproduces the stored record for every metric', () => {
    for (const id of METRICS) {
      const metric = readMetric(id);
      assert.deepEqual(recomputeMatchedYoyForMetric(metric), metric.yoyChange, `${id} stored record is reproducible`);
    }
  });
});

describe('matched-month YoY — localized coverage text', () => {
  it('partial year names the matched window and both coverage counts (TH + EN)', () => {
    const ghg = readMetric('ghg');
    const th = formatYoyCoverage(ghg.yoyChange, 'th');
    const en = formatYoyCoverage(ghg.yoyChange, 'en');
    assert.match(th, /เทียบเดือนเดียวกัน ม\.ค\.–ก\.ค\./);
    assert.match(th, /7\/12 เดือน/);
    assert.match(en, /Matched months Jan–Jul/);
    assert.match(en, /7\/12 months/);
    assert.match(en, /baseline FY2568 12\/12 months/);
  });

  it('complete-year coverage states the full-year basis instead of a matched subset', () => {
    const yoy = computeMatchedYoy(
      { months: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, value: 10 })) },
      { months: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, value: 11 })) },
      { baselineYear: 2568, currentYear: 2569 },
    );
    assert.equal(yoy.percent, 10);
    assert.match(formatYoyCoverage(yoy, 'en'), /full 12 months/);
    assert.match(formatYoyCoverage(yoy, 'th'), /ครบ 12 เดือน/);
  });

  it('no coverage text when there is no window at all', () => {
    assert.equal(formatYoyCoverage(emptyMatchedYoy(), 'en'), null);
  });
});
