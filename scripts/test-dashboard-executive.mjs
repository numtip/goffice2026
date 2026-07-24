/**
 * Targeted tests for dashboard-executive.ts
 * 
 * Tests critical data-integrity safeguards:
 * - Indicator-level direction (not slug-based)
 * - Recency scoring with proper thresholds
 * - Comparable-month safety
 * - Confidence caps and safeguards
 */

import { resolveIndicatorDirection, calculateRecencyScore, getComparableMonths, calculateConfidence } from '../src/utils/dashboard-executive.ts';
import assert from 'node:assert';

console.log('Testing dashboard-executive.ts...\n');

// Test counter
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`✗ ${name}`);
    console.error(`  ${err.message}`);
    failed++;
  }
}

// === TEST 1: Total waste → lower-is-better ===
test('total waste → lower-is-better', () => {
  const metric = {
    metric: 'waste',
    label: 'Waste Generated',
    relatedIndicators: [
      { indicatorId: 'total-waste-generated', label: 'Total Waste Generated' }
    ],
    years: {},
    baselineYear: 2023,
    currentYear: 2024,
    unit: 'kg'
  };
  assert.strictEqual(resolveIndicatorDirection(metric), 'lower-is-better');
});

// === TEST 2: Recycling rate → higher-is-better ===
test('recycling rate → higher-is-better', () => {
  const metric = {
    metric: 'waste',
    label: 'Waste Recycling Rate',
    relatedIndicators: [
      { indicatorId: 'waste-recycling-rate', label: 'Waste Recycling Rate' }
    ],
    years: {},
    baselineYear: 2023,
    currentYear: 2024,
    unit: '%'
  };
  assert.strictEqual(resolveIndicatorDirection(metric), 'higher-is-better');
});

// === TEST 3: Unknown indicator → neutral ===
test('unknown indicator → neutral', () => {
  const metric = {
    metric: 'unknown',
    label: 'Unknown Metric',
    relatedIndicators: [
      { indicatorId: 'unknown-indicator', label: 'Unknown Indicator' }
    ],
    years: {},
    baselineYear: 2023,
    currentYear: 2024,
    unit: 'units'
  };
  assert.strictEqual(resolveIndicatorDirection(metric), 'neutral');
});

// === TEST 4: No related indicators → neutral ===
test('no related indicators → neutral', () => {
  const metric = {
    metric: 'energy',
    label: 'Energy Consumption',
    relatedIndicators: [],
    years: {},
    baselineYear: 2023,
    currentYear: 2024,
    unit: 'kWh'
  };
  assert.strictEqual(resolveIndicatorDirection(metric), 'neutral');
});

// === TEST 5: Missing date → 0 recency score ===
test('missing date → 0 recency score', () => {
  assert.strictEqual(calculateRecencyScore(null), 0);
  assert.strictEqual(calculateRecencyScore(undefined), 0);
});

// === TEST 6: Invalid date → 0 recency score ===
test('invalid date → 0 recency score', () => {
  assert.strictEqual(calculateRecencyScore('not-a-date'), 0);
  assert.strictEqual(calculateRecencyScore(NaN), 0);
});

// === TEST 7: Future date → 0 recency score ===
test('future date → 0 recency score', () => {
  const now = Date.parse('2024-01-01');
  const future = Date.parse('2025-01-01');
  assert.strictEqual(calculateRecencyScore(future, now), 0);
});

// === TEST 8: 0-90 days → 10 recency score ===
test('0-90 days → 10 recency score', () => {
  const now = Date.parse('2024-01-01');
  assert.strictEqual(calculateRecencyScore(Date.parse('2024-01-01'), now), 10); // 0 days
  assert.strictEqual(calculateRecencyScore(Date.parse('2023-12-15'), now), 10); // 17 days
  assert.strictEqual(calculateRecencyScore(Date.parse('2023-10-03'), now), 10); // 90 days
});

// === TEST 9: 91-180 days → 7 recency score ===
test('91-180 days → 7 recency score', () => {
  const now = Date.parse('2024-01-01');
  assert.strictEqual(calculateRecencyScore(Date.parse('2023-10-02'), now), 7); // 91 days
  assert.strictEqual(calculateRecencyScore(Date.parse('2023-07-05'), now), 7); // 180 days
});

// === TEST 10: 181-365 days → 4 recency score ===
test('181-365 days → 4 recency score', () => {
  const now = Date.parse('2024-01-01');
  assert.strictEqual(calculateRecencyScore(Date.parse('2023-07-04'), now), 4); // 181 days
  assert.strictEqual(calculateRecencyScore(Date.parse('2023-01-01'), now), 4); // 365 days
});

// === TEST 11: Over 365 days → 1 recency score ===
test('over 365 days → 1 recency score', () => {
  const now = Date.parse('2024-01-01');
  assert.strictEqual(calculateRecencyScore(Date.parse('2022-12-31'), now), 1); // 366 days
  assert.strictEqual(calculateRecencyScore(Date.parse('2020-01-01'), now), 1); // 730 days
});

// === TEST 12: Comparable months - identical 3+ valid months ===
test('identical 3+ valid months can be compared', () => {
  const baseline = {
    months: [
      { month: 1, value: 100 },
      { month: 2, value: 110 },
      { month: 3, value: 105 },
      { month: 4, value: 120 },
    ],
    dataClassification: 'CONFIRMED_XLSX',
    quality: { valid: true },
  };

  const current = {
    months: [
      { month: 1, value: 95 },
      { month: 2, value: 100 },
      { month: 3, value: 98 },
      { month: 5, value: 90 },
    ],
    dataClassification: 'CONFIRMED_XLSX',
    quality: { valid: true },
  };

  const result = getComparableMonths(baseline, current);
  assert(result !== null);
  assert.strictEqual(result.monthCount, 3); // Only months 1, 2, 3 match
  assert.deepStrictEqual(result.baselineValues, [100, 110, 105]);
  assert.deepStrictEqual(result.currentValues, [95, 100, 98]);
});

// === TEST 13: Comparable months - fewer than 3 common months ===
test('fewer than 3 common months → unavailable', () => {
  const baseline = {
    months: [
      { month: 1, value: 100 },
      { month: 2, value: 110 },
    ],
    dataClassification: 'CONFIRMED_XLSX',
    quality: { valid: true },
  };

  const current = {
    months: [
      { month: 1, value: 95 },
      { month: 3, value: 90 },
    ],
    dataClassification: 'CONFIRMED_XLSX',
    quality: { valid: true },
  };

  const result = getComparableMonths(baseline, current);
  assert.strictEqual(result, null); // Only month 1 matches
});

// === TEST 14: Comparable months - partial vs full baseline ===
test('partial current vs full baseline requires matching months', () => {
  const baseline = {
    months: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, value: 100 })),
    dataClassification: 'CONFIRMED_XLSX',
    quality: { valid: true },
  };

  const current = {
    months: [
      { month: 1, value: 95 },
      { month: 2, value: 100 },
      { month: 3, value: 98 },
    ],
    dataClassification: 'CONFIRMED_XLSX',
    quality: { valid: true },
  };

  const result = getComparableMonths(baseline, current);
  assert(result !== null);
  assert.strictEqual(result.monthCount, 3); // Only compares 3 matching months, not totals
});

// === TEST 15: Confidence - unverified cannot be High ===
test('unverified confidence cannot be High', () => {
  const metric = {
    metric: 'energy',
    label: 'Energy',
    relatedIndicators: [],
    years: {
      '2024': {
        months: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, value: 100 })),
        total: 1200,
        dataClassification: 'CONFIRMED_XLSX',
        quality: { valid: false }, // Unverified
        updated: Date.now() - 1000 * 60 * 60 * 24 * 30, // 30 days ago
        provenance: { extractionTimestamp: Date.now() - 1000 * 60 * 60 * 24 * 30 },
      }
    },
    baselineYear: 2023,
    currentYear: 2024,
    unit: 'kWh'
  };

  const result = calculateConfidence(metric, 2024);
  assert.notStrictEqual(result.level, 'High');
  assert.ok(result.level === 'Medium' || result.level === 'Low');
  assert.ok(result.reasons.some(r => r.includes('Unverified') || r.includes('not yet verified')));
});

// === TEST 16: Confidence - placeholder provenance cannot be High ===
test('placeholder/unknown provenance cannot be High', () => {
  const metric = {
    metric: 'energy',
    label: 'Energy',
    relatedIndicators: [],
    years: {
      '2024': {
        months: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, value: 100 })),
        total: 1200,
        dataClassification: 'PLACEHOLDER', // Placeholder
        quality: { valid: true },
        updated: Date.now() - 1000 * 60 * 60 * 24 * 30,
        provenance: { extractionTimestamp: Date.now() - 1000 * 60 * 60 * 24 * 30 },
      }
    },
    baselineYear: 2023,
    currentYear: 2024,
    unit: 'kWh'
  };

  const result = calculateConfidence(metric, 2024);
  assert.notStrictEqual(result.level, 'High');
  assert.ok(result.level === 'Medium' || result.level === 'Low');
});

// === TEST 17: Confidence - fewer than 6 months capped Low ===
test('fewer than 6 months capped Low', () => {
  const metric = {
    metric: 'energy',
    label: 'Energy',
    relatedIndicators: [],
    years: {
      '2024': {
        months: [
          { month: 1, value: 100 },
          { month: 2, value: 110 },
          { month: 3, value: 105 },
          { month: 4, value: 95 },
          { month: 5, value: 108 },
        ], // Only 5 months
        total: 518,
        dataClassification: 'CONFIRMED_XLSX',
        quality: { valid: true },
        updated: Date.now() - 1000 * 60 * 60 * 24 * 30,
        provenance: { extractionTimestamp: Date.now() - 1000 * 60 * 60 * 24 * 30 },
      }
    },
    baselineYear: 2023,
    currentYear: 2024,
    unit: 'kWh'
  };

  const result = calculateConfidence(metric, 2024);
  assert.strictEqual(result.level, 'Low');
  assert.ok(result.reasons.some(r => r.includes('Less than 6 months')));
});

// === TEST 18: Comparable months - ignore null/invalid values ===
test('comparable months ignore null/invalid values', () => {
  const baseline = {
    months: [
      { month: 1, value: 100 },
      { month: 2, value: null },
      { month: 3, value: undefined },
      { month: 4, value: NaN },
      { month: 5, value: 110 },
      { month: 6, value: 120 },
      { month: 7, value: 130 },
    ],
    dataClassification: 'CONFIRMED_XLSX',
    quality: { valid: true },
  };

  const current = {
    months: [
      { month: 1, value: 95 },
      { month: 2, value: 105 },   // baseline null → should be ignored
      { month: 5, value: 100 },
      { month: 6, value: 115 },
      { month: 7, value: 125 },
    ],
    dataClassification: 'CONFIRMED_XLSX',
    quality: { valid: true },
  };

  const result = getComparableMonths(baseline, current);
  assert(result !== null);
  assert.strictEqual(result.monthCount, 4); // Months 1, 5, 6, 7 have valid values in both
  assert.deepStrictEqual(result.baselineValues, [100, 110, 120, 130]);
  assert.deepStrictEqual(result.currentValues, [95, 100, 115, 125]);
});

// Summary
console.log(`\n${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}

console.log('\nAll tests passed! ✓');