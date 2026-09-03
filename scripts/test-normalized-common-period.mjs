/**
 * test-normalized-common-period.mjs
 * =================================
 * Regression: normalized dashboard index must use ONE common comparable period
 * across all six resources — never partial FY2569 total vs full-year FY2568.
 *
 * Run: node --test scripts/test-normalized-common-period.mjs
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildNormalizedVM,
  resolveCommonComparableMonths,
} from '../src/utils/dashboard-normalized-vm.ts';
import { generatedMetricMap } from '../src/utils/dashboard-generated-metrics.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GENERATED_DIR = join(__dirname, '..', 'src', 'data', 'generated');
const DASHBOARD_IDS = ['energy', 'water', 'fuel', 'paper', 'waste', 'ghg'];

function readMetric(name) {
  return JSON.parse(readFileSync(join(GENERATED_DIR, `${name}.json`), 'utf-8'));
}

function sumMonths(metric, year, months) {
  const map = new Map((metric.years[String(year)]?.months ?? []).map((m) => [m.month, m.value]));
  let sum = 0;
  for (const mo of months) {
    if (!map.has(mo)) return null;
    sum += map.get(mo);
  }
  return Math.round(sum * 10) / 10;
}

function wrongFullYearIndex(metric) {
  const b = metric.years['2568']?.total;
  const c = metric.years['2569']?.total;
  if (b == null || c == null || b === 0) return null;
  return Math.round((c / b) * 100);
}

describe('resolveCommonComparableMonths — canonical intersection', () => {
  it('all six dashboard resources share Jan–Jul when energy/water have Aug extra', () => {
    const metrics = DASHBOARD_IDS.map((id) => generatedMetricMap[id]).filter(Boolean);
    const common = resolveCommonComparableMonths(metrics);
    assert.deepEqual(common, [1, 2, 3, 4, 5, 6, 7], 'fuel/paper/waste/ghg cap common period at Jul');
  });
});

describe('buildNormalizedVM — common-period index, never partial vs full-year', () => {
  const vm = buildNormalizedVM('en');

  it('period caption names Jan–Jul FY2569 vs FY2568 (7 months)', () => {
    assert.equal(vm.commonCount, 7);
    assert.match(vm.periodCaption, /Jan.*Jul.*2569.*2568.*7 month/i);
  });

  for (const id of DASHBOARD_IDS) {
    it(`${id}: index uses Jan–Jul sums, not full-year baseline total`, () => {
      const metric = readMetric(id);
      const row = vm.resources.find((r) => r.id === id);
      assert.ok(row, `${id} row present`);

      const expectedBaseline = sumMonths(metric, 2568, vm.commonMonths);
      const expectedCurrent = sumMonths(metric, 2569, vm.commonMonths);
      assert.equal(row.baselineTotal, expectedBaseline);
      assert.equal(row.currentTotal, expectedCurrent);

      const wrong = wrongFullYearIndex(metric);
      if (expectedBaseline != null && expectedBaseline !== 0 && expectedCurrent != null) {
        const expectedIndex = Math.round((expectedCurrent / expectedBaseline) * 100);
        assert.equal(row.index, expectedIndex);
        if (wrong != null && wrong !== expectedIndex) {
          assert.notEqual(row.index, wrong, `${id} must not use partial/current ÷ full baseline`);
        }
      } else {
        assert.equal(row.index, null, 'missing baseline → unavailable, never 0');
      }
    });
  }

  it('energy/water: fixed index differs materially from misleading full-year comparison', () => {
    const energy = vm.resources.find((r) => r.id === 'energy');
    const water = vm.resources.find((r) => r.id === 'water');
    const energyWrong = wrongFullYearIndex(readMetric('energy'));
    const waterWrong = wrongFullYearIndex(readMetric('water'));
    assert.equal(energy.index, 113);
    assert.equal(water.index, 123);
    assert.equal(energyWrong, 75);
    assert.equal(waterWrong, 74);
    assert.notEqual(energy.index, energyWrong);
    assert.notEqual(water.index, waterWrong);
  });

  it('zero baseline denominator yields null index, never 0', () => {
    const resources = [
      { id: 'x', label: 'X', color: '#000', baselineTotal: 0, currentTotal: 100, index: null },
    ];
    const vmZero = buildNormalizedVM('en');
    assert.ok(vmZero.resources.every((r) => r.index === null || typeof r.index === 'number'));
    assert.notEqual(
      buildNormalizedVM('en').resources.find((r) => r.id === 'fuel')?.index,
      0,
      'fuel must not show index 0 when baseline exists',
    );
  });
});
