/**
 * test-category4-presentation.ts
 * ================================
 * tsx-run presentation assertions for the Category 4 view-model
 * (GOFFICE2026 CAT4 C5). Run: npx tsx scripts/test-category4-presentation.ts
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CAT4_MANAGEMENT_CYCLE,
  CAT4_JOURNEYS,
  CAT4_INDICATOR_DOMAIN,
  buildCat4DomainSnapshot,
  cycleStagesForIndicator,
  domainForIndicator,
  resolveDomainFactValue,
} from '../src/utils/category4-presentation';

const CAT4_CODES = ['4.1.1', '4.1.2', '4.1.3', '4.2.1', '4.2.2'];

test('management cycle has the five operational stages in order (plan→sort→reuse→control→maintain)', () => {
  assert.equal(CAT4_MANAGEMENT_CYCLE.length, 5);
  assert.deepEqual(
    CAT4_MANAGEMENT_CYCLE.map((s) => s.code),
    ['plan', 'sort', 'reuse', 'control', 'maintain'],
  );
  assert.deepEqual(
    CAT4_MANAGEMENT_CYCLE.map((s) => s.targetCode),
    ['4.1.1', '4.1.2', '4.1.3', '4.2.1', '4.2.2'],
  );
});

test('every cat4 indicator maps to exactly one contract domain', () => {
  for (const code of CAT4_CODES) {
    const domain = domainForIndicator(code);
    assert.ok(domain, `${code} must map to a domain`);
    assert.ok(
      ['targets', 'measures', 'sorting', 'data', 'wastewater', 'treatment-care'].includes(domain),
      `${code} invalid domain ${domain}`,
    );
  }
  assert.ok(CAT4_INDICATOR_DOMAIN['4.1.3'] === 'data');
  assert.ok(CAT4_INDICATOR_DOMAIN['4.2.1'] === 'wastewater');
});

test('domain snapshots build facts without inventing values, conflating scopes, or fabricating FY2569', () => {
  for (const d of ['targets', 'measures', 'sorting', 'data', 'wastewater', 'treatment-care'] as const) {
    const snap = buildCat4DomainSnapshot(d);
    assert.ok(snap.facts.length > 0, `${d} snapshot must have facts`);
    assert.equal(snap.status, 'historical-baseline');
    for (const fact of snap.facts) {
      const value = resolveDomainFactValue(fact.value, 'en');
      assert.ok(typeof value === 'string' && value.length > 0, `${d} fact value must be non-empty`);
      assert.ok(!/2569/.test(value), `${d} fact must not fabricate FY2569`);
    }
  }
  const dataSnap = buildCat4DomainSnapshot('data');
  const general = dataSnap.facts.find((f) => f.label.en.includes('General waste'));
  assert.ok(general, 'data snapshot must include the general-waste fact');
  const generalValue = general.value as { th: string; en: string };
  assert.ok(generalValue.en.includes('4,380.1'), 'general-waste fact must state 4,380.10 kg');
  assert.ok(/not met/i.test(generalValue.en), 'general-waste fact must state target not met');
  const reuse = dataSnap.facts.find((f) => f.label.en.includes('Waste reused'));
  assert.ok(reuse, 'data snapshot must include the reuse fact');
  const reuseValue = reuse.value as { th: string; en: string };
  assert.ok(/31\.93/.test(reuseValue.en), 'reuse fact must state 31.93%');
  assert.ok(/not met/i.test(reuseValue.en), 'reuse fact must NOT claim the >50% threshold is met');
  const scope = dataSnap.facts.find((f) => f.label.en.includes('Monthly-form scope'));
  assert.ok(scope, 'data snapshot must expose the monthly-form scope separately');
  const scopeValue = scope.value as { th: string; en: string };
  assert.ok(/5,625\.7/.test(scopeValue.en), 'monthly-form scope must be 5,625.7 kg');
});

test('cycle stage anchors resolve for the five indicators', () => {
  assert.deepEqual(cycleStagesForIndicator('4.1.1').map((s) => s.code), ['plan']);
  assert.deepEqual(cycleStagesForIndicator('4.1.2').map((s) => s.code), ['sort']);
  assert.deepEqual(cycleStagesForIndicator('4.1.3').map((s) => s.code), ['reuse']);
  assert.deepEqual(cycleStagesForIndicator('4.2.1').map((s) => s.code), ['control']);
  assert.deepEqual(cycleStagesForIndicator('4.2.2').map((s) => s.code), ['maintain']);
});

test('journeys connect measures→sorting→data→review and wastewater control→care', () => {
  const fromCodes = CAT4_JOURNEYS.map((j) => j.from).sort();
  assert.deepEqual(fromCodes, ['4.1.1', '4.1.2', '4.1.3', '4.2.1']);
  const toCodes = CAT4_JOURNEYS.map((j) => j.to).sort();
  assert.deepEqual(toCodes, ['4.1.1', '4.1.2', '4.1.3', '4.2.2']);
});
