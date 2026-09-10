/**
 * test-data-quality-flags.mjs
 * ===========================
 * Guard for curated FY2569 data-quality flags (PO 2026-09-10).
 *
 * The August 2569 paper value (30.4 kg) is far below every other observed month
 * (145–226 kg). The contract is:
 *   • the SOURCE value is published unchanged — no correction is invented;
 *   • the outlier is machine-readable and flagged for owner verification;
 *   • the flag can never silently disappear, and the published value can never be
 *     "smoothed" without a new flag update.
 *
 * Run: node --test scripts/test-data-quality-flags.mjs
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const readJson = (rel) => JSON.parse(readFileSync(join(ROOT, rel), 'utf8'));

const registry = readJson('src/data/audit/fy2569-dataset-provenance.json');
const paper = readJson('src/data/generated/paper.json');
const paperFlag = (rel) => {
  const entry = registry.find((r) => r.id === 'metric:paper' && r.fiscalYear === 2569);
  return (entry?.dataQualityFlags ?? []).find((f) => f.code === 'DQ-PAPER-2569-AUG-LOW');
};

describe('FY2569 curated data-quality flags', () => {
  it('paper Aug 2569 outlier is flagged with owner verification required', () => {
    const flag = paperFlag();
    assert.ok(flag, 'DQ-PAPER-2569-AUG-LOW must exist in the provenance registry');
    assert.equal(flag.metric, 'paper');
    assert.equal(flag.fiscalYear, 2569);
    assert.equal(flag.month, 8);
    assert.equal(flag.value, 30.4);
    assert.equal(flag.unit, 'kg');
    assert.equal(flag.ownerVerification, 'required', 'data owner must verify the month');
    assert.match(flag.action, /UNCHANGED/, 'the flag must state the source value is published unchanged');
    assert.match(flag.action, /verification/i);
  });

  it('the source value is published untouched (no invented correction)', () => {
    const y2569 = paper.years['2569'];
    const aug = y2569.months.find((m) => m.month === 8);
    assert.ok(aug, 'August 2569 month present');
    assert.equal(aug.value, 30.4, 'published August value must equal the workbook value');
    assert.equal(paperFlag().value, aug.value, 'flag value must match the published value');
    // Total must still be the arithmetic sum of the observed months (nothing smoothed).
    const sum = Math.round(y2569.months.reduce((s, m) => s + m.value, 0) * 100) / 100;
    assert.equal(y2569.total, sum, 'paper 2569 total must remain the sum of published months');
  });

  it('the flag is genuinely an outlier versus the other observed months', () => {
    const months = paper.years['2569'].months.filter((m) => m.month !== 8).map((m) => m.value);
    const minOther = Math.min(...months);
    assert.ok(
      paperFlag().value < minOther / 2,
      `flagged value ${paperFlag().value} must be well below the other months (min ${minOther})`,
    );
    assert.deepEqual(
      paperFlag().otherObservedMonthsKg,
      months,
      'flag lists exactly the other observed months for the reviewer',
    );
  });

  it('the flagged month is not treated as human-verified', () => {
    const entry = registry.find((r) => r.id === 'metric:paper' && r.fiscalYear === 2569);
    assert.equal(entry.verificationState, 'available_unverified');
    assert.equal(paper.years['2569'].provenance.verification.status, 'available_unverified');
  });
});
