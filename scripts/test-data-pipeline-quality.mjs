/**
 * test-data-pipeline-quality.mjs
 * ================================
 * Regression tests for the GO-DATA-1A corrective sprint.
 *
 * Covers:
 *   - Current-year CSV-only data must never be silently reported as verified (RC-1)
 *   - Placeholder data must stay invalid and unverified in the KPI summary (RC-1/RC-3)
 *   - Percentage-unit metrics (recycling_rate) must use average aggregation, not sum (RC-2)
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
import { serializeJson } from './lib/serialize-json.mjs';

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

describe('RC-1: current-year FY2569 data provenance (GO-DATA-3 states)', () => {
  it('water 2569 is PUBLISHABLE_PARTIAL, CONFIRMED_XLSX from the approved workbook, Jan–Jul', () => {
    const data = readGenerated('water.json');
    const y2569 = data.years['2569'];
    assert.equal(y2569.datasetState, 'PUBLISHABLE_PARTIAL');
    assert.equal(y2569.latestDataMonth, 7);
    assert.equal(y2569.months.length, 7);
    assert.equal(y2569.months[0].month, 1);
    assert.equal(y2569.months[0].value, 1098.4); // verified against workbook 2569 col[6]
    assert.equal(y2569.dataClassification, 'CONFIRMED_XLSX');
    assert.equal(y2569.dataStatus, 'in_progress');
    assert.equal(y2569.quality.valid, true);     // monthly values confirmed against the 2569 sheet
    // The workbook "รวม" row includes a corrupt negative Aug formula cache,
    // so total reconciliation is skipped with an explicit warning.
    assert.equal(y2569.quality.reconciliationDifference, null);
    assert.equal(
      y2569.quality.warnings.some((w) => w.includes('Workbook total row unusable')),
      true,
    );
    // Missing Aug–Dec are ABSENT — never zero-filled
    const months = y2569.months.map((m) => m.month);
    assert.deepEqual(months, [1, 2, 3, 4, 5, 6, 7]);
    // Provenance must carry SHA-256 + extraction date + available_unverified state
    assert.match(y2569.provenance.sourceSha256, /^[0-9a-f]{64}$/);
    assert.ok(y2569.provenance.extractionDate);
    assert.equal(y2569.provenance.verification.status, 'available_unverified');
    assert.equal(y2569.provenance.verification.humanVerificationRequired, true);
  });

  it('energy 2569 is PUBLISHABLE_PARTIAL, CONFIRMED_XLSX from the approved workbook, Jan–Jul', () => {
    const data = readGenerated('energy.json');
    const y2569 = data.years['2569'];
    assert.equal(y2569.datasetState, 'PUBLISHABLE_PARTIAL');
    assert.equal(y2569.latestDataMonth, 7);
    assert.equal(y2569.months.length, 7);
    assert.equal(y2569.months[0].month, 1);
    assert.equal(y2569.months[0].value, 28618.4); // verified against workbook 2569 col[6]
    assert.equal(y2569.dataClassification, 'CONFIRMED_XLSX');
    assert.equal(y2569.dataStatus, 'in_progress');
    assert.equal(y2569.quality.valid, true);      // monthly values confirmed against the 2569 sheet
    assert.equal(y2569.quality.reconciliationDifference, null); // corrupt workbook total skipped
    const months = y2569.months.map((m) => m.month);
    assert.deepEqual(months, [1, 2, 3, 4, 5, 6, 7]);
    assert.equal(y2569.provenance.verification.status, 'available_unverified');
  });

  it('fuel 2569 is now PUBLISHABLE_PARTIAL (actual FY2569 data); recycling_rate remains WAITING_FOR_INPUT', () => {
    const fuel = readGenerated('fuel.json');
    const fuel2569 = fuel.years['2569'];
    assert.equal(fuel2569.datasetState, 'PUBLISHABLE_PARTIAL');
    assert.equal(fuel2569.months.length, 7, 'fuel 2569 Jan–Jul from the actual FY2569 workbook');
    assert.equal(fuel2569.latestDataMonth, 7);
    assert.equal(fuel2569.dataClassification, 'CONFIRMED_XLSX');
    assert.equal(fuel2569.quality.valid, true);
    assert.equal(fuel2569.quality.reconciliationDifference, 0);
    assert.deepEqual(fuel2569.months.map((m) => m.month), [1, 2, 3, 4, 5, 6, 7]);

    const recycling = readGenerated('recycling_rate.json');
    const recycling2569 = recycling.years['2569'];
    assert.equal(recycling2569.datasetState, 'WAITING_FOR_INPUT', 'recycling_rate 2569 has no FY2569 input');
    assert.equal(recycling2569.months.length, 0, 'recycling_rate 2569 must have no months (never zero-filled)');
    assert.equal(recycling2569.latestDataMonth, null);
    assert.equal(recycling2569.quality.valid, false);
  });

  it('paper/waste/ghg 2569 are PUBLISHABLE_PARTIAL and reconciled', () => {
    for (const metric of ['paper', 'waste', 'ghg']) {
      const data = readGenerated(`${metric}.json`);
      const y2569 = data.years['2569'];
      assert.equal(y2569.datasetState, 'PUBLISHABLE_PARTIAL', `${metric} 2569 should be PUBLISHABLE_PARTIAL`);
      assert.equal(y2569.months.length, 7, `${metric} 2569 Jan–Jul`);
      assert.equal(y2569.latestDataMonth, 7);
      assert.equal(y2569.dataClassification, 'CONFIRMED_XLSX');
      assert.equal(y2569.quality.valid, true, `${metric} 2569 reconciled against workbook`);
      assert.deepEqual(y2569.months.map((m) => m.month), [1, 2, 3, 4, 5, 6, 7]);
      assert.equal(y2569.provenance.verification.status, 'available_unverified', `${metric} is not human-verified`);
    }
  });

  it('confirmed baseline years (energy/water/ghg 2568) remain quality.valid=true and CONFIRMED_XLSX', () => {
    for (const metric of ['energy', 'water', 'ghg']) {
      const data = readGenerated(`${metric}.json`);
      const baseline = data.years[String(data.baselineYear)];
      assert.equal(baseline.quality.valid, true, `${metric} baseline should remain valid`);
      assert.equal(baseline.dataClassification, 'CONFIRMED_XLSX', `${metric} baseline should be CONFIRMED_XLSX`);
      assert.equal(baseline.datasetState, 'COMPLETE', `${metric} baseline should be COMPLETE`);
    }
  });
});

describe('RC-2: recycling_rate (percentage unit) must use average aggregation, not sum', () => {
  it('recycling_rate years use aggregation "average" and total equals the monthly average when months exist', () => {
    const data = readGenerated('recycling_rate.json');
    for (const [yearStr, yearData] of Object.entries(data.years)) {
      assert.equal(yearData.aggregation, 'average', `recycling_rate ${yearStr} must use average aggregation`);
      if (yearData.months.length === 0) {
        // FY2569 pending: empty months, total 0 — do not divide by zero / invent averages
        assert.equal(yearData.total, 0, `recycling_rate ${yearStr} pending year total must be 0`);
        assert.equal(yearData.dataStatus, 'CURRENT_DATA_PENDING');
        continue;
      }
      const avg = Math.round((yearData.months.reduce((s, m) => s + m.value, 0) / yearData.months.length) * 100) / 100;
      assert.equal(yearData.total, avg, `recycling_rate ${yearStr} total must equal monthly average, not a sum`);
    }
  });

  it('recycling_rate yoyChange is suppressed when current year is pending (not a false -100% drop)', () => {
    const data = readGenerated('recycling_rate.json');
    const c = data.years[String(data.currentYear)];
    if (c.dataStatus === 'CURRENT_DATA_PENDING' || c.months.length === 0) {
      assert.equal(data.yoyChange.percent, 0);
      assert.equal(data.yoyChange.direction, 'stable');
      return;
    }
    const b = data.years[String(data.baselineYear)];
    const expectedPercent = Math.round(((c.total - b.total) / b.total) * 100);
    assert.equal(data.yoyChange.percent, expectedPercent);
  });
});

describe('RC-4: indicator mapping no longer uses the invalid wildcard', () => {
  it('recycling_rate relatedIndicators uses "4.1", not the invalid "4.1.x"', () => {
    const data = readGenerated('recycling_rate.json');
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
    // Only recycling_rate 2569 remains WAITING (invalid); energy/water/fuel/
    // paper/waste/ghg current years are confirmed against the actual FY2569 files.
    assert.equal(invalidWarnings.length, 1);
  });

  it('validateGenerated raises an ERROR when a %-unit metric declares aggregation "sum"', () => {
    const tmpFile = join(GENERATED_DIR, '__test_percent_metric.json');
    const badMetric = {
      metric: 'recycling_rate',
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
  it('no partial current-year dataset is marked verified — Verified requires a COMPLETE reconciled year', () => {
    const summary = readGenerated('kpi-summary.json');
    const verified = summary.metrics.filter((e) => e.verified === true).map((e) => e.metric);
    // All FY2569 datasets are partial (PUBLISHABLE_PARTIAL) and not yet
    // human-verified — the Verified flag must be reserved for complete years.
    assert.deepEqual(verified, []);
    for (const entry of summary.metrics) {
      const year = entry.yearBE;
      assert.equal(entry.verified, false, `${entry.metric} ${year} must not claim Verified on partial data`);
    }
  });
});

describe('Determinism: re-writing generated JSON produces byte-identical output', () => {
  const canonicalMetricFiles = [
    'energy.json',
    'water.json',
    'fuel.json',
    'paper.json',
    'waste.json',
    'recycling_rate.json',
    'ghg.json',
    'kpi-summary.json',
  ];

  it('serializeJson uses LF line endings and a single trailing newline', () => {
    const out = serializeJson({ metric: 'test', nested: { value: 1 } });
    assert.ok(!out.includes('\r'), 'canonical JSON must not contain CR bytes');
    assert.ok(out.endsWith('\n'), 'canonical JSON must end with a single LF newline');
    assert.equal(out.split('\n').at(-1), '', 'canonical JSON must have exactly one trailing newline');
  });

  for (const fileName of canonicalMetricFiles) {
    it(`${fileName} is stable across a canonical serialize round-trip`, () => {
      const filePath = join(GENERATED_DIR, fileName);
      const before = readFileSync(filePath, 'utf-8');
      const data = JSON.parse(before);
      const after = serializeJson(data);
      assert.equal(after, before);
    });
  }
});
