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

function expectedCaption(yoy, copy, locale) {
  const first = yoy.comparableMonths[0];
  const last = yoy.comparableMonths[yoy.comparableMonths.length - 1];
  return copy.overlapCaption(
    yoy.comparableCount,
    monthLabel(first, locale),
    monthLabel(last, locale),
  );
}

describe('resolveOverlapCaption — fiscal year labels in comparison period', () => {
  const metric = readMetric('energy');
  const yoy = computePartialYoy(metric, { id: 'energy' });

  it('EN caption includes both fiscal years and the live comparable month range', () => {
    const caption = resolveOverlapCaption(yoy, copyEn, 'en');
    assert.equal(caption, expectedCaption(yoy, copyEn, 'en'));
    assert.match(caption, /FY2569 vs .* FY2568/);
  });

  it('TH caption includes both fiscal years and the live comparable month range', () => {
    const caption = resolveOverlapCaption(yoy, copyTh, 'th');
    assert.equal(caption, expectedCaption(yoy, copyTh, 'th'));
    assert.match(caption, /2569 กับ .* 2568/);
  });
});

describe('matched-period totals row — energy overlap', () => {
  const metric = readMetric('energy');
  const yoy = computePartialYoy(metric, { id: 'energy' });

  it('totals row uses overlap sums, not full-year baseline', () => {
    const row = buildTotalsRow(yoy, 'Matched-period total');
    assert.equal(row[0], 'Matched-period total');
    assert.notEqual(row[1], '—');
    assert.notEqual(row[2], '—');
    assert.notEqual(row[3], '—');
    assert.ok(Number(row[1]) < metric.years['2568'].total);
  });
});
