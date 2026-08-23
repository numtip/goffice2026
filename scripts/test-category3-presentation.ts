/**
 * test-category3-presentation.ts
 * ================================
 * tsx-run presentation assertions for the Category 3 view-model
 * (GOFFICE2026 CAT3 C5). Run: npx tsx scripts/test-category3-presentation.ts
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CAT3_MANAGEMENT_CYCLE,
  CAT3_JOURNEYS,
  CAT3_INDICATOR_DOMAIN,
  CAT3_MEDIUM_INDICATORS,
  buildCat3DomainSnapshot,
  cycleStagesForIndicator,
  domainForIndicator,
  resolveDomainFactValue,
} from '../src/utils/category3-presentation';

const CAT3_CODES = [
  '3.1.1', '3.1.2', '3.1.3',
  '3.2.1', '3.2.2', '3.2.3', '3.2.4', '3.2.5',
  '3.3.1', '3.3.2', '3.3.3', '3.3.4', '3.3.5',
  '3.4.1', '3.4.2',
];

test('management cycle has the five operational stages in order (measure→monitor→compare target→analyze→improve)', () => {
  assert.equal(CAT3_MANAGEMENT_CYCLE.length, 5);
  assert.deepEqual(
    CAT3_MANAGEMENT_CYCLE.map((s) => s.code),
    ['measure', 'monitor', 'compare', 'analyze', 'improve'],
  );
  assert.deepEqual(
    CAT3_MANAGEMENT_CYCLE.map((s) => s.targetCode),
    ['3.1.2', '3.1.3', '3.2.2', '3.3.2', '3.4.1'],
  );
});

test('every cat3 indicator maps to exactly one contract domain; 3.2.2 flagged MEDIUM', () => {
  for (const code of CAT3_CODES) {
    const domain = domainForIndicator(code);
    assert.ok(domain, `${code} must map to a domain`);
    assert.ok(
      ['targets', 'measures', 'data', 'compliance', 'meetings'].includes(domain),
      `${code} invalid domain ${domain}`,
    );
  }
  assert.deepEqual(CAT3_MEDIUM_INDICATORS, ['3.2.2']);
  assert.ok(CAT3_INDICATOR_DOMAIN['3.2.2'] === 'data');
});

test('domain snapshots build facts without inventing 3.2.2 per-unit values or FY2569', () => {
  for (const d of ['targets', 'measures', 'data', 'compliance', 'meetings'] as const) {
    const snap = buildCat3DomainSnapshot(d);
    assert.ok(snap.facts.length > 0, `${d} snapshot must have facts`);
    assert.equal(snap.status, 'historical-baseline');
    for (const fact of snap.facts) {
      const value = resolveDomainFactValue(fact.value, 'en');
      assert.ok(typeof value === 'string' && value.length > 0, `${d} fact value must be non-empty`);
      assert.ok(!/2569/.test(value), `${d} fact must not fabricate FY2569`);
    }
  }
  const dataSnap = buildCat3DomainSnapshot('data');
  const electricity = dataSnap.facts.find((f) => f.label.en.includes('Electricity'));
  assert.ok(electricity, 'data snapshot must include electricity fact');
  const electricityValue = electricity.value;
  assert.ok(typeof electricityValue !== 'string', 'electricity fact value must be bilingual');
  assert.ok(!/per.?unit/i.test(electricityValue.en), 'electricity per-unit must stay unavailable');
});

test('cycle stage anchors resolve for the five target indicators', () => {
  assert.deepEqual(cycleStagesForIndicator('3.1.2').map((s) => s.code), ['measure']);
  assert.deepEqual(cycleStagesForIndicator('3.1.3').map((s) => s.code), ['monitor']);
  assert.deepEqual(cycleStagesForIndicator('3.2.2').map((s) => s.code), ['compare']);
  assert.deepEqual(cycleStagesForIndicator('3.3.2').map((s) => s.code), ['analyze']);
  assert.deepEqual(cycleStagesForIndicator('3.4.1').map((s) => s.code), ['improve']);
  assert.deepEqual(cycleStagesForIndicator('3.1.1'), [], '3.1.1 is not a direct stage anchor');
});

test('journeys connect measures→data and green-meeting→eco-materials', () => {
  const fromCodes = CAT3_JOURNEYS.map((j) => j.from).sort();
  assert.deepEqual(fromCodes, ['3.1.1', '3.2.1', '3.2.4', '3.3.1', '3.4.1']);
  const toCodes = CAT3_JOURNEYS.map((j) => j.to).sort();
  assert.deepEqual(toCodes, ['3.1.2', '3.2.2', '3.2.5', '3.3.2', '3.4.2']);
});
