/**
 * test-fy2569-dashboard-edge.mjs
 * ===============================
 * Edge-case regression suite for the FY2569 dashboard/data changes
 * (waste = mass in kg, recycling rate separate; COMPLETE+valid-only
 * verification; provenance on current-year records; partial current data
 * flagged unverified in charts and built pages).
 *
 * Covers:
 *   1. Every current-year dataset record (energy/water/fuel/paper/waste/ghg)
 *      reconciles: total === sum(months); months strictly Jan–Jul with no
 *      zero-fill; provenance.verification.status === 'available_unverified';
 *      sourceSha256 is 64 hex chars; coverage === '7 of 12 months';
 *      observedMonths === [1..7].
 *   2. isCurrentYearVerified: false for PUBLISHABLE_PARTIAL years, true only
 *      for a COMPLETE + quality.valid year.
 *   3. buildMonthlySeries: currentUnverified === true for all six partial
 *      metrics; missing months are null (never 0); waste unit is kg.
 *   4. Waste dashboard config: kpiField total_kg / unit kg in
 *      dashboard-config.ts and resource-indicator-map.json;
 *      generatedMetricMap.waste resolves to generated/waste.json.
 *   5. kpi-summary.json: every entry verified === false; sourceFile cites the
 *      workbook for the six live metrics; fuel value === 396.37.
 *   6. Built pages (skipped when dist/ missing): waste page carries
 *      data-waste-unit-note + kg value and never recycle_pct;
 *      data-current-year-warnings present only on energy/water.
 *   7. Built fuel page current KPI card shows the rounded value 396, not an
 *      em-dash placeholder.
 *
 * Run: node --test scripts/test-fy2569-dashboard-edge.mjs  (Node ≥ 24, native
 * TS type stripping). Only reads source/JSON/build output — never writes.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { isCurrentYearVerified } from '../src/utils/data-status.ts';
import { buildMonthlySeries } from '../src/utils/chart-option.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST_DASHBOARD = join(ROOT, 'dist', 'dashboard');

/** All six FY2569 partial datasets that now carry real workbook data. */
const METRICS = ['energy', 'water', 'fuel', 'paper', 'waste', 'ghg'];

function readJson(rel) {
  return JSON.parse(readFileSync(join(ROOT, rel), 'utf-8'));
}

function readMetric(name) {
  return readJson(`src/data/generated/${name}.json`);
}

function currentYear(name) {
  return readMetric(name).years['2569'];
}

// ── Focus 1: current-year dataset records reconcile ──────────────────────────

describe('FY2569 current-year records reconcile (edge)', () => {
  it('total equals the sum of observed monthly values (within pipeline rounding)', () => {
    for (const metric of METRICS) {
      const y = currentYear(metric);
      const sum = y.months.reduce((s, m) => s + m.value, 0);
      // The pipeline stores `total` rounded to 2 decimals while GHG months are
      // stored to 3 decimals — allow that rounding, never a fabricated total.
      assert.ok(
        Math.abs(y.total - sum) < 0.011,
        `${metric} total ${y.total} must equal the sum of observed months (${sum}) within pipeline rounding`,
      );
    }
  });

  it('months are strictly Jan–Aug for energy/water, Jan–Jul for others, with no zero-fill', () => {
    const EXPECTED = {
      energy: { months: [1, 2, 3, 4, 5, 6, 7, 8], count: 8 },
      water: { months: [1, 2, 3, 4, 5, 6, 7, 8], count: 8 },
      fuel: { months: [1, 2, 3, 4, 5, 6, 7], count: 7 },
      paper: { months: [1, 2, 3, 4, 5, 6, 7], count: 7 },
      waste: { months: [1, 2, 3, 4, 5, 6, 7], count: 7 },
      ghg: { months: [1, 2, 3, 4, 5, 6, 7], count: 7 },
    };
    for (const metric of METRICS) {
      const y = currentYear(metric);
      const exp = EXPECTED[metric];
      assert.equal(y.months.length, exp.count, `${metric} has exactly ${exp.count} observed months`);
      assert.deepEqual(y.months.map((m) => m.month), exp.months, `${metric} observed month range`);
      assert.equal(y.months.some((m) => m.value === 0), false, `${metric} observed values are never fabricated zeros`);
      assert.equal(y.latestDataMonth, exp.months[exp.months.length - 1], `${metric} latestDataMonth`);
    }
  });

  it('provenance is complete: verification state, SHA-256, coverage, observed months, extraction date', () => {
    const COVERAGE = {
      energy: '8 of 12 months', water: '8 of 12 months',
      fuel: '7 of 12 months', paper: '7 of 12 months',
      waste: '7 of 12 months', ghg: '7 of 12 months',
    };
    const OBSERVED = {
      energy: [1, 2, 3, 4, 5, 6, 7, 8], water: [1, 2, 3, 4, 5, 6, 7, 8],
      fuel: [1, 2, 3, 4, 5, 6, 7], paper: [1, 2, 3, 4, 5, 6, 7],
      waste: [1, 2, 3, 4, 5, 6, 7], ghg: [1, 2, 3, 4, 5, 6, 7],
    };
    for (const metric of METRICS) {
      const y = currentYear(metric);
      assert.ok(y.provenance, `${metric} has provenance`);
      assert.equal(y.provenance.verification.status, 'available_unverified', `${metric} not human-verified`);
      assert.equal(y.provenance.verification.humanVerificationRequired, true, `${metric} requires human review`);
      assert.match(y.provenance.sourceSha256, /^[0-9a-f]{64}$/, `${metric} sourceSha256 must be 64 lowercase hex chars`);
      assert.equal(y.provenance.coverage, COVERAGE[metric], `${metric} coverage string`);
      assert.deepEqual(y.provenance.observedMonths, OBSERVED[metric], `${metric} observedMonths`);
      assert.ok(y.provenance.extractionDate, `${metric} has extractionDate`);
      assert.equal(y.datasetState, 'PUBLISHABLE_PARTIAL', `${metric} datasetState`);
    }
  });

  it('all six metrics reconcile their total to the monthly sum with zero warnings', () => {
    for (const metric of METRICS) {
      const y = currentYear(metric);
      assert.equal(y.quality.valid, true, `${metric} monthly values confirmed`);
      assert.equal(y.quality.reconciliationDifference, 0, `${metric} total reconciles with the workbook`);
      assert.deepEqual(y.quality.warnings, [], `${metric} no corrupt-total warnings`);
    }
  });
});

// ── Focus 2: isCurrentYearVerified (unit) ───────────────────────────────────

describe('isCurrentYearVerified — Verified requires COMPLETE + valid', () => {
  const months12 = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, value: 10 }));
  const months7 = Array.from({ length: 7 }, (_, i) => ({ month: i + 1, value: 10 }));

  it('undefined / null current year is never verified', () => {
    assert.equal(isCurrentYearVerified(undefined), false);
    assert.equal(isCurrentYearVerified(null), false);
  });

  it('PUBLISHABLE_PARTIAL (even quality.valid true) is never verified', () => {
    assert.equal(
      isCurrentYearVerified({ datasetState: 'PUBLISHABLE_PARTIAL', quality: { valid: true }, months: months7 }),
      false,
    );
  });

  it('COMPLETE + quality.valid true is verified', () => {
    assert.equal(
      isCurrentYearVerified({ datasetState: 'COMPLETE', quality: { valid: true }, months: months12 }),
      true,
    );
  });

  it('COMPLETE with quality.valid === false is never verified', () => {
    assert.equal(
      isCurrentYearVerified({ datasetState: 'COMPLETE', quality: { valid: false }, months: months12 }),
      false,
    );
  });

  it('12 observed months without an explicit datasetState still verifies (documented 12-month fallback)', () => {
    assert.equal(isCurrentYearVerified({ quality: { valid: true }, months: months12 }), true);
  });

  it('every real generated FY2569 partial year is NOT verified', () => {
    for (const metric of METRICS) {
      assert.equal(isCurrentYearVerified(currentYear(metric)), false, `${metric} 2569 partial must be unverified`);
    }
  });

  it('every real generated COMPLETE baseline year (2568) IS verified', () => {
    for (const metric of METRICS) {
      const baseline = readMetric(metric).years['2568'];
      assert.equal(isCurrentYearVerified(baseline), true, `${metric} 2568 baseline must be verified`);
    }
  });
});

// ── Focus 3: buildMonthlySeries on all six partial metrics ──────────────────

describe('buildMonthlySeries — partial current years are unverified, nulls never 0', () => {
  it('currentUnverified === true for every partial metric', () => {
    for (const metric of METRICS) {
      const series = buildMonthlySeries(readMetric(metric), 'en');
      assert.equal(series.currentUnverified, true, `${metric} must be flagged unverified`);
    }
  });

  it('missing months are null (never 0) and observed values are preserved verbatim', () => {
    const POPULATED = {
      energy: 8, water: 8, fuel: 7, paper: 7, waste: 7, ghg: 7,
    };
    for (const metric of METRICS) {
      const y = currentYear(metric);
      const series = buildMonthlySeries(readMetric(metric), 'en');
      const populated = POPULATED[metric];
      assert.equal(series.current.length, 12, `${metric} 12 month slots`);
      assert.equal(series.current.filter((v) => v !== null).length, populated, `${metric} observed months populated`);
      assert.equal(series.current.filter((v) => v === null).length, 12 - populated, `${metric} missing months must be null`);
      assert.equal(series.current.includes(0), false, `${metric} no fabricated zeros`);
      assert.deepEqual(
        series.current.filter((v) => v !== null),
        y.months.map((m) => m.value),
        `${metric} observed values match the generated JSON`,
      );
      // Month-position mapping: months 1..N hold values, the rest are null.
      for (const m of y.months) {
        assert.equal(series.current[m.month - 1], m.value, `${metric} month ${m.month}`);
      }
      for (let i = populated; i < 12; i++) {
        assert.equal(series.current[i], null, `${metric} month ${i + 1} is null`);
      }
    }
  });

  it('waste monthly series unit is kg (mass), not %', () => {
    const series = buildMonthlySeries(readMetric('waste'), 'en');
    assert.equal(series.unit, 'kg');
  });
});

// ── Focus 4: waste dashboard configuration ─────────────────────────────────

describe('Waste dashboard configuration — kg mass, recycling rate separate', () => {
  it('dashboard-config waste uses kpiField total_kg and kpiUnit kg (never recycle_pct)', () => {
    const src = readFileSync(join(ROOT, 'src/data/dashboard-config.ts'), 'utf8');
    const wasteBlock = src.slice(src.indexOf("id: 'waste'"), src.indexOf("id: 'ghg'"));
    assert.match(wasteBlock, /kpiField: 'total_kg'/);
    assert.match(wasteBlock, /kpiUnit: 'kg'/);
    assert.doesNotMatch(wasteBlock, /recycle_pct/);
  });

  it('resource-indicator-map.json waste unit is kg', () => {
    const map = readJson('src/data/resource-indicator-map.json');
    const waste = map.mappings.find((m) => m.dashboardId === 'waste');
    assert.ok(waste, 'waste mapping present');
    assert.equal(waste.unit, 'kg');
    assert.doesNotMatch(waste.unit, /%/);
  });

  it('generatedMetricMap.waste resolves to generated/waste.json (source text)', () => {
    const src = readFileSync(join(ROOT, 'src/utils/dashboard-generated-metrics.ts'), 'utf8');
    assert.match(src, /wasteGen from '\.\.\/data\/generated\/waste\.json'/);
    assert.match(src, /waste: wasteGen/);
    assert.doesNotMatch(src, /waste: recyclingRateGen/);
  });

  it('waste.json is a mass dataset while recycling_rate.json stays a separate % metric', () => {
    const waste = readMetric('waste');
    assert.equal(waste.unit, 'kg');
    assert.equal(waste.kpiField, 'total_kg');
    assert.equal(waste.years['2569'].months.length, 7, 'waste mass FY2569 partial is published');
    const recycling = readMetric('recycling_rate');
    assert.equal(recycling.unit, '%');
    assert.equal(recycling.kpiField, 'recycle_pct');
  });
});

// ── Focus 5: kpi-summary.json ──────────────────────────────────────────────

describe('kpi-summary.json — verified flags, workbook sources, fuel value', () => {
  it('every entry has verified === false (no current year is COMPLETE+valid yet)', () => {
    const summary = readJson('src/data/generated/kpi-summary.json');
    assert.ok(summary.metrics.length >= 7, 'kpi-summary contains the six metrics + recycling_rate');
    for (const entry of summary.metrics) {
      assert.equal(entry.verified, false, `${entry.metric} must not claim Verified`);
    }
  });

  it('live metrics cite their workbook sourceFile, not "Waiting for Official FY2569 Data"', () => {
    const summary = readJson('src/data/generated/kpi-summary.json');
    for (const metric of METRICS) {
      const entry = summary.metrics.find((e) => e.metric === metric);
      assert.ok(entry, `${metric} present in kpi-summary`);
      assert.equal(
        entry.sourceFile.includes('Waiting for Official FY2569 Data'),
        false,
        `${metric} sourceFile must cite its workbook`,
      );
      assert.ok(entry.sourceFile.length > 0, `${metric} sourceFile non-empty`);
      assert.notEqual(entry.value, null, `${metric} has a numeric value`);
    }
    // recycling_rate is the only metric still genuinely waiting for FY2569 input.
    const recycling = summary.metrics.find((e) => e.metric === 'recycling_rate');
    assert.ok(recycling, 'recycling_rate present');
    assert.equal(recycling.sourceFile, 'Waiting for Official FY2569 Data');
  });

  it('kpi-summary values equal the generated current-year totals', () => {
    const summary = readJson('src/data/generated/kpi-summary.json');
    for (const metric of METRICS) {
      const entry = summary.metrics.find((e) => e.metric === metric);
      assert.equal(entry.value, currentYear(metric).total, `${metric} kpi value equals generated total`);
    }
  });

  it('fuel entry value is 396.37 (exact, from the actual FY2569 workbook)', () => {
    const summary = readJson('src/data/generated/kpi-summary.json');
    const fuel = summary.metrics.find((e) => e.metric === 'fuel');
    assert.equal(fuel.value, 396.37);
  });
});

// ── Focus 6 & 7: built pages (skip when dist/ missing) ─────────────────────

const hasDist = existsSync(join(DIST_DASHBOARD, 'waste', 'index.html'));
const builtDescribe = hasDist ? describe : describe.skip;

builtDescribe('Built dashboard pages — FY2569 provenance + KPI truthfulness (edge)', () => {
  it('waste page shows the kg-mass note and a kg value, and never exposes recycle_pct', () => {
    const html = readFileSync(join(DIST_DASHBOARD, 'waste', 'index.html'), 'utf8');
    assert.match(html, /data-waste-unit-note/, 'waste page has the kg-mass unit note');
    // Current KPI card value = 3,910 kg (rounded from waste.json total 3909.7).
    assert.match(
      html,
      /text-2xl font-bold[^>]*>\s*3,910\s*<\/p>\s*<span[^>]*>\s*kg\s*<\/span>/,
      'waste current KPI card shows the kg mass value with kg unit',
    );
    assert.doesNotMatch(html, /recycle_pct/, 'waste page must never present recycling rate as waste mass');
  });

  it('data-current-year-warnings appears on NO dashboard once corrupt totals are resolved', () => {
    for (const metric of METRICS) {
      const html = readFileSync(join(DIST_DASHBOARD, metric, 'index.html'), 'utf8');
      assert.equal(
        html.includes('data-current-year-warnings'),
        false,
        `${metric} must not surface a current-year warning (all totals reconciled to 0)`,
      );
    }
  });

  it('fuel current KPI card shows the rounded value 396, not an em-dash placeholder', () => {
    const html = readFileSync(join(DIST_DASHBOARD, 'fuel', 'index.html'), 'utf8');
    assert.match(
      html,
      /text-2xl font-bold[^>]*>\s*396\s*<\/p>\s*<span[^>]*>\s*L\s*<\/span>/,
      'fuel current KPI value must be 396 (rounded from 396.37) with L unit',
    );
    assert.doesNotMatch(
      html,
      /text-2xl font-bold[^>]*>\s*\u2014\s*<\/p>/,
      'fuel current KPI value must not be an em-dash placeholder',
    );
  });
});
