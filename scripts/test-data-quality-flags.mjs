/** Guard for curated FY2569 data-quality flags (PO 2026-09-10). */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { recomputeMatchedYoyForMetric } from './lib/matched-yoy.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (rel) => JSON.parse(readFileSync(join(ROOT, rel), 'utf8'));
const registry = readJson('src/data/audit/fy2569-dataset-provenance.json');
const paper = readJson('src/data/generated/paper.json');
const paperEntry = () => registry.find((r) => r.id === 'metric:paper' && r.fiscalYear === 2569);
const paperFlag = () => (paperEntry()?.dataQualityFlags ?? []).find((f) => f.code === 'DQ-PAPER-2569-AUG-LOW');

describe('FY2569 paper data-quality hold', () => {
  it('flags Aug 2569 = 30.4 kg and requires owner verification', () => {
    const flag = paperFlag();
    assert.ok(flag);
    assert.equal(flag.metric, 'paper');
    assert.equal(flag.fiscalYear, 2569);
    assert.equal(flag.month, 8);
    assert.equal(flag.value, 30.4);
    assert.equal(flag.unit, 'kg');
    assert.equal(flag.ownerVerification, 'required');
    assert.match(flag.action, /UNCHANGED/);
    assert.match(flag.action, /verification/i);
  });

  it('publishes the raw value unchanged while marking it analytically ineligible', () => {
    const y2569 = paper.years['2569'];
    const aug = y2569.months.find((m) => m.month === 8);
    assert.ok(aug);
    assert.equal(aug.value, 30.4);
    assert.equal(aug.analyticsEligible, false);
    assert.equal(aug.analyticsExclusionCode, 'DQ-PAPER-2569-AUG-LOW');
    assert.equal(paperFlag().value, aug.value);
    const rawSum = Math.round(y2569.months.reduce((s, m) => s + m.value, 0) * 100) / 100;
    assert.equal(y2569.total, rawSum, 'raw published total still includes every observed source month');
    assert.equal(y2569.provenance.coverage, '8 of 12 months');
    assert.deepEqual(y2569.provenance.observedMonths, [1,2,3,4,5,6,7,8]);
  });

  it('excludes the unverified month from trend/YoY until the hold clears', () => {
    assert.deepEqual(paper.yoyChange.months, [1,2,3,4,5,6,7]);
    assert.equal(paper.yoyChange.currentMonths, 7);
    assert.equal(paper.yoyChange.baselineMatched, 1274.4);
    assert.equal(paper.yoyChange.currentMatched, 1239.76);
    assert.equal(paper.yoyChange.absolute, -34.64);
    assert.equal(paper.yoyChange.percent, -2.7);
    assert.deepEqual(recomputeMatchedYoyForMetric(paper), paper.yoyChange, 'stored YoY must reproduce from analyticsEligible policy');
  });

  it('keeps the flag genuinely exceptional and source verification unresolved', () => {
    const other = paper.years['2569'].months.filter((m) => m.month !== 8).map((m) => m.value);
    assert.ok(paperFlag().value < Math.min(...other) / 2);
    assert.deepEqual(paperFlag().otherObservedMonthsKg, other);
    assert.equal(paperEntry().verificationState, 'available_unverified');
    assert.equal(paper.years['2569'].provenance.verification.status, 'available_unverified');
    assert.match(paper.years['2569'].quality.warnings.join(' '), /DQ-PAPER-2569-AUG-LOW/);
  });
});
