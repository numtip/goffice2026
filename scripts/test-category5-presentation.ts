/**
 * test-category5-presentation.ts
 * ================================
 * tsx-run presentation assertions for the Category 5 view-model
 * (GOFFICE2026 CAT5 Phase B). Run: npx tsx scripts/test-category5-presentation.ts
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CAT5_MANAGEMENT_CYCLE,
  CAT5_JOURNEYS,
  CAT5_INDICATOR_DOMAIN,
  buildCat5DomainSnapshot,
  cycleStagesForIndicator,
  domainForIndicator,
  resolveDomainFactValue,
} from '../src/utils/category5-presentation';

const CAT5_CODES = [
  '5.1.1', '5.1.2', '5.1.3',
  '5.2.1',
  '5.3.1', '5.3.2',
  '5.4.1', '5.4.2', '5.4.3', '5.4.4',
  '5.5.1', '5.5.2', '5.5.3',
];

test('management cycle has the five operational stages in order (air–lighting–noise–livability–emergency)', () => {
  assert.equal(CAT5_MANAGEMENT_CYCLE.length, 5);
  assert.deepEqual(
    CAT5_MANAGEMENT_CYCLE.map((s) => s.code),
    ['air', 'lighting', 'noise', 'livability', 'emergency'],
  );
  assert.deepEqual(
    CAT5_MANAGEMENT_CYCLE.map((s) => s.targetCode),
    ['5.1.1', '5.2.1', '5.3.1', '5.4.1', '5.5.1'],
  );
});

test('every cat5 indicator maps to exactly one contract domain', () => {
  for (const code of CAT5_CODES) {
    const domain = domainForIndicator(code);
    assert.ok(domain, `${code} must map to a domain`);
    assert.ok(
      ['air', 'lighting', 'noise', 'livability', 'emergency'].includes(domain),
      `${code} invalid domain ${domain}`,
    );
  }
  assert.equal(CAT5_INDICATOR_DOMAIN['5.2.1'], 'lighting');
  assert.equal(CAT5_INDICATOR_DOMAIN['5.5.3'], 'emergency');
});

test('domain snapshots build facts without inventing values or fabricating FY2569 results', () => {
  for (const d of ['air', 'lighting', 'noise', 'livability', 'emergency'] as const) {
    const snap = buildCat5DomainSnapshot(d);
    assert.ok(snap.facts.length > 0, `${d} snapshot must have facts`);
    assert.equal(snap.status, 'historical-baseline');
    for (const fact of snap.facts) {
      const value = resolveDomainFactValue(fact.value, 'en');
      assert.ok(typeof value === 'string' && value.length > 0, `${d} fact value must be non-empty`);
      // FY2569 may only appear as "awaiting update" context, never as a result.
      if (/2569/.test(value)) {
        assert.match(value, /await|re-|FY2569 collection/i, `${d}: FY2569 mention must be awaiting-update context`);
      }
    }
  }
});

test('unevidenced percentages are shown as unavailable, never as values', () => {
  const livability = buildCat5DomainSnapshot('livability');
  const utilization = livability.facts.find((f) => f.label.en.includes('Space utilization'));
  assert.ok(utilization, 'livability snapshot must include the utilization fact');
  assert.equal(utilization.kind, 'unavailable');
  const maintenance = livability.facts.find((f) => f.label.en.includes('Area maintenance'));
  assert.equal(maintenance?.kind, 'unavailable');

  const noise = buildCat5DomainSnapshot('noise');
  const measurement = noise.facts.find((f) => f.label.en.includes('Sound-level'));
  assert.equal(measurement?.kind, 'unavailable');
});

test('cycle stages anchor one indicator each and journeys reference valid codes', () => {
  for (const step of CAT5_MANAGEMENT_CYCLE) {
    assert.ok(cycleStagesForIndicator(step.targetCode).length >= 1);
  }
  for (const j of CAT5_JOURNEYS) {
    assert.ok(CAT5_CODES.includes(j.from), `journey from ${j.from} invalid`);
    assert.ok(CAT5_CODES.includes(j.to), `journey to ${j.to} invalid`);
  }
});
