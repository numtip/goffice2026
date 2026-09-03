/**
 * test-explorer-vm.mjs — Partial YoY explorer VM contracts (caption + totals)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { computePartialYoy, formatNullableCell } from '../src/utils/dashboard-partial-yoy.ts';
import { monthLabel, round1 } from '../src/utils/chart-option.ts';
import { resolveOverlapCaption } from '../src/utils/dashboard-explorer-vm.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GENERATED_DIR = join(__dirname, '..', 'src', 'data', 'generated');

function readMetric(name) {
  return JSON.parse(readFileSync(join(GENERATED_DIR, `${name}.json`), 'utf-8'));
}

const copyEn = {
  overlapCaption: (n, firstMonth, lastMonth) =>
    `${firstMonth}–${lastMonth} FY2569 vs ${firstMonth}–${lastMonth} FY2568 (${n} months)`,
};

const copyTh = {
  overlapCaption: (n, firstMonth, lastMonth) =>
    `เปรียบเทียบ ${firstMonth}–${lastMonth} 2569 กับ ${firstMonth}–${lastMonth} 2568 (${n} เดือน)`,
};

function buildTotalsRow(yoy, label) {
  return [
    label,
    formatNullableCell(yoy.baselineOverlapTotal != null ? round1(yoy.baselineOverlapTotal) : null),
    formatNullableCell(yoy.currentOverlapTotal != null ? round1(yoy.currentOverlapTotal) : null),
    formatNullableCell(yoy.absolute != null ? round1(yoy.absolute) : null),
  ];
}

describe('resolveOverlapCaption — fiscal year labels in comparison period', () => {
  const metric = readMetric('energy');
  const yoy = computePartialYoy(metric, { id: 'energy' });

  it('EN caption includes both fiscal years and month range', () => {
    const caption = resolveOverlapCaption(yoy, copyEn, 'en');
    assert.match(caption, /FY2569 vs .* FY2568/);
    assert.match(caption, /Jan–Jul/);
    assert.match(caption, /\(7 months\)/);
  });

  it('TH caption includes both fiscal years and month range', () => {
    const caption = resolveOverlapCaption(yoy, copyTh, 'th');
    assert.match(caption, /2569 กับ .* 2568/);
    assert.match(caption, /ม\.ค\.–ก\.ค\./);
    assert.match(caption, /\(7 เดือน\)/);
  });
});

describe('matched-period totals row — energy Jan–Jul overlap', () => {
  const metric = readMetric('energy');
  const yoy = computePartialYoy(metric, { id: 'energy' });

  it('totals row uses overlap sums, not full-year baseline', () => {
    const row = buildTotalsRow(yoy, 'Matched-period total');
    assert.equal(row[0], 'Matched-period total');
    assert.notEqual(row[1], '—');
    assert.notEqual(row[2], '—');
    assert.notEqual(row[3], '—');
    // Full-year baseline total is ~403K; overlap Jan–Jul is much smaller
    assert.ok(Number(row[1]) < metric.years['2568'].total);
  });
});
