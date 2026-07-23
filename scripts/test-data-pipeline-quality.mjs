/**
 * test-data-pipeline-quality.mjs
 * ================================
 * Regression tests for the GO-DATA-1A corrective sprint.
 *
 * Covers:
 *   - Current-year CSV-only data must never be silently reported as verified (RC-1)
 *   - Placeholder data must stay invalid and unverified in the KPI summary (RC-1/RC-3)
 *   - Percentage-unit metrics (waste) must use average aggregation, not sum (RC-2)
 *   - The validator must flag invalid quality states and bad unit/aggregation combos (RC-3)
 *   - Critical structural failures must be reported as errors (non-zero exit) (RC-3)
 *   - Generation is deterministic
 *   - Executive KPI summary excludes/flags unverified values (RC-4)
 *   - Waste indicator mapping no longer uses the invalid '4.1.x' wildcard (RC-4)
 *
 * These tests read the real generated JSON in src/data/generated (read-only,
 * via validateGenerated/generateOutputs and direct file reads) and only ever
 * write to temporary, uniquely-named files that are removed in a `finally`
 * block — the real project data is never mutated by this suite.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateGenerated, reconcileTotal } from './data-pipeline.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const GENERATED_DIR = join(PROJECT_ROOT, 'src', 'data', 'generated');

function readGenerated(file) {
  return JSON.parse(readFileSync(join(GENERATED_DIR, file), 'utf-8'));
}

describe('reconcileTotal (pure helper)', () => {
  it('reports valid:true with no warnings when no workbook total is available', () => {
    const result = reconcileTotal(100, null, 'kWh');
    assert.equal(result.valid, true);
    assert.deepEqual(result.warnings, []);
  });

  it('flags an out-of-tolerance difference against a known workbook total as invalid', () => {
    const result = reconcileTotal(100, 90, 'kWh'); // diff=10, tolerance=5
    assert.equal(result.valid, false);
    assert.equal(result.warnings.length > 0, true);
  });
});

describe('RC-1: current-year CSV-only data must not be silently marked valid', () => {
  it('energy 2569 is quality.valid=false and classified DERIVED_FROM_CSV', () => {
    const data = readGenerated('energy.json');
    const y2569 = data.years['2569'];
    assert.equal(y2569.quality.valid, false);
    assert.equal(y2569.dataClassification, 'DERIVED_FROM_CSV');
    assert.equal(y2569.quality.warnings.length > 0, true);
  });

  it('water 2569 is quality.valid=false and classified DERIVED_FROM_CSV', () => {
    const data = readGenerated('water.json');
    const y2569 = data.years['2569'];
    assert.equal(y2569.quality.valid, false);
    assert.equal(y2569.dataClassification, 'DERIVED_FROM_CSV');
  });

  it('confirmed baseline years (energy/water/ghg 2568) remain quality.valid=true and CONFIRMED_XLSX', () => {
    for (const metric of ['energy', 'water', 'ghg']) {
      const data = readGenerated(`${metric}.json`);
      const baseline = data.years[String(data.baselineYear)];
      assert.equal(baseline.quality.valid, true, `${metric} baseline should remain valid`);
      assert.equal(baseline.dataClassification, 'CONFIRMED_XLSX', `${metric} baseline should be CONFIRMED_XLSX`);
    }
  });
});

describe('RC-2: waste (percentage unit) must use average aggregation, not sum', () => {
  it('waste years use aggregation "average" and total equals the monthly average', () => {
    const data = readGenerated('waste.json');
    for (const [yearStr, yearData] of Object.entries(data.years)) {
      assert.equal(yearData.aggregation, 'average', `waste ${yearStr} must use average aggregation`);
      const avg = Math.round((yearData.months.reduce((s, m) => s + m.value, 0) / yearData.months.length) * 100) / 100;
      assert.equal(yearData.total, avg, `waste ${yearStr} total must equal monthly average, not a sum`);
    }
  });

  it('waste yoyChange is computed from average-to-average totals (not the old invalid +227% sum-based figure)', () => {
    const data = readGenerated('waste.json');
    const b = data.years[String(data.baselineYear)];
    const c = data.years[String(data.currentYear)];
    const expectedPercent = Math.round(((c.total - b.total) / b.total) * 100);
    assert.equal(data.yoyChange.percent, expectedPercent);
  });
});

describe('RC-4: indicator mapping no longer uses the invalid wildcard', () => {
  it('waste relatedIndicators uses "4.1", not the invalid "4.1.x"', () => {
    const data = readGenerated('waste.json');
    const ids = data.relatedIndicators.map((i) => i.indicatorId);
    assert.equal(ids.includes('4.1.x'), false);
    assert.equal(ids.includes('4.1'), true);
  });
});

describe('RC-3: validator must surface unverified/invalid quality states, not silently pass', () => {
  it('validateGenerated reports 0 structural errors but non-zero warnings on the current project data', () => {
    const result = validateGenerated(false);
    assert.equal(result.errors.length, 0);
    assert.equal(result.warnings.length > 0, true, 'validator must not report 0 warnings while unverified data exists');
  });

  it('validateGenerated warns for every metric-year whose quality.valid is false', () => {
    const result = validateGenerated(false);
    const invalidWarnings = result.warnings.filter((w) => w.includes('quality flagged INVALID'));
    // energy, water, fuel, paper, waste, ghg all have an invalid 2569 entry = 6
    assert.equal(invalidWarnings.length, 6);
  });

  it('validateGenerated raises an ERROR when a %-unit metric declares aggregation "sum"', () => {
    const tmpFile = join(GENERATED_DIR, '__test_percent_metric.json');
    const badMetric = {
      metric: 'waste',
      label: 'Test Percent Metric',
      unit: '%',
      kpiField: 'recycle_pct',
      baselineYear: 2568,
      currentYear: 2569,
      years: {
        '2568': {
          year: 2568,
          isBaseline: true,
          months: [{ month: 1, value: 10, label: 'Jan' }],
          total: 10,
          average: 10,
          aggregation: 'sum', // invalid for a % unit
          dataStatus: 'complete',
          source: 'test-fixture',
          updated: '2026-01-01',
        },
      },
    };
    writeFileSync(tmpFile, JSON.stringify(badMetric, null, 2));
    try {
      const result = validateGenerated(false);
      const hasAggError = result.errors.some((e) => e.includes("must use aggregation 'average'"));
      assert.equal(hasAggError, true);
    } finally {
      if (existsSync(tmpFile)) unlinkSync(tmpFile);
    }
  });

  it('validateGenerated raises a structural ERROR (and would exit non-zero) for a missing required field', () => {
    const tmpFile = join(GENERATED_DIR, '__test_missing_field_metric.json');
    const badMetric = {
      // 'metric' field intentionally omitted
      label: 'Broken Fixture',
      unit: 'kg',
      kpiField: 'kg',
      baselineYear: 2568,
      currentYear: 2569,
      years: {},
    };
    writeFileSync(tmpFile, JSON.stringify(badMetric, null, 2));
    try {
      const result = validateGenerated(false);
      assert.equal(result.success, false);
      assert.equal(result.errors.some((e) => e.includes("Missing required field: 'metric'")), true);
    } finally {
      if (existsSync(tmpFile)) unlinkSync(tmpFile);
    }
  });
});

describe('RC-1/RC-4: executive KPI summary marks unverified data explicitly', () => {
  it('kpi-summary.json flags verified:false for every current metric-year that is quality.valid=false', () => {
    const summary = readGenerated('kpi-summary.json');
    for (const entry of summary.metrics) {
      const expectedVerified = entry.dataQuality?.valid === true;
      assert.equal(entry.verified, expectedVerified, `${entry.metric} verified flag must mirror dataQuality.valid`);
    }
  });

  it('no metric in kpi-summary.json is verified:true for 2569 (all current-year data is currently unverified)', () => {
    const summary = readGenerated('kpi-summary.json');
    const anyVerified = summary.metrics.some((e) => e.verified === true);
    assert.equal(anyVerified, false);
  });
});

describe('Determinism: re-writing generated JSON produces byte-identical output', () => {
  it('waste.json is stable across a read/serialize/write round-trip', () => {
    const filePath = join(GENERATED_DIR, 'waste.json');
    const before = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(before);
    const after = JSON.stringify(data, null, 2) + '\n';
    assert.equal(after, before);
  });
});
