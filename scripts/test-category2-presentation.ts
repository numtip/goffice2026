/**
 * test-category2-presentation.ts
 * ================================
 * tsx-run presentation assertions for the Category 2 view-model
 * (GOFFICE2026 CAT2 C5). Run: npx tsx scripts/test-category2-presentation.ts
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CAT2_COMMUNICATION_LOOP,
  CAT2_JOURNEYS,
  buildCat2DomainSnapshot,
  MISSING_CAT2_INDICATORS,
  THIN_CAT2_INDICATORS,
  domainForIndicator,
} from '../src/utils/category2-presentation';

test('communication loop has the five operational stages in order', () => {
  assert.equal(CAT2_COMMUNICATION_LOOP.length, 5);
  assert.deepEqual(
    CAT2_COMMUNICATION_LOOP.map((s) => s.code),
    ['plan', 'assign', 'communicate', 'capture', 'review'],
  );
  assert.deepEqual(
    CAT2_COMMUNICATION_LOOP.map((s) => s.targetCode),
    ['2.1.1', '2.2.1', '2.2.2', '2.2.4', '2.2.4'],
  );
});

test('missing/thin indicator sets are exactly as frozen in C1', () => {
  assert.deepEqual(MISSING_CAT2_INDICATORS, ['2.2.3']);
  assert.deepEqual(THIN_CAT2_INDICATORS, ['2.2.2']);
});

test('domain snapshots build facts without inventing 2.2.3', () => {
  for (const d of ['training', 'communication', 'feedback'] as const) {
    const snap = buildCat2DomainSnapshot(d);
    assert.ok(snap.facts.length > 0, `${d} snapshot must have facts`);
    assert.equal(snap.status, 'historical-baseline');
  }
  // 2.2.3 has no contract domain.
  assert.equal(domainForIndicator('2.2.3'), null);
  assert.equal(domainForIndicator('2.1.1'), 'training');
  assert.equal(domainForIndicator('2.2.4'), 'feedback');
});

test('journeys connect plan→responsibility, communication plan→campaign, feedback→responsibility', () => {
  const fromCodes = CAT2_JOURNEYS.map((j) => j.from).sort();
  assert.deepEqual(fromCodes, ['2.1.1', '2.2.1', '2.2.4']);
});
