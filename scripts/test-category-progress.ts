/**
 * test-category-progress.ts — contract tests for the FY2569 criteria-progress
 * generated dataset and its view models (D3).
 *
 * Enforced rules:
 *   - generated category-progress-2569.json reconciles exactly (evidence sums,
 *     issue totals, canonical counts) — validated at depth by
 *     scripts/validate-progress-contract.mjs; spot checks live here.
 *   - VM output is localized, count-derived, and never a score.
 *   - progressStatus and evidenceStatus stay separate.
 *
 * Run with: npx tsx scripts/test-category-progress.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildProgressOverview,
  buildCat1Progress,
  buildCategoryProgress,
  progressStatusLabel,
  evidenceStatusLabel,
} from '../src/utils/category-progress-vm.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const generated = JSON.parse(
  readFileSync(join(ROOT, 'src/data/generated/category-progress-2569.json'), 'utf8'),
);

const PROGRESS_SUM = ['ready', 'inProgress', 'notStarted', 'unavailable', 'notApplicable'];
const EVIDENCE_SUM = ['verified', 'availableUnverified', 'pending', 'unavailable', 'notApplicable'];

function sum(obj: Record<string, number>, keys: string[]): number {
  return keys.reduce((s, k) => s + (obj[k] ?? 0), 0);
}

// ── Generated dataset integrity ─────────────────────────────────────────

assert.equal(generated.year, 2569, 'year is 2569');
assert.equal(generated.overall.total, 65, 'overall total 65');
assert.equal(sum(generated.overall, PROGRESS_SUM), 65, 'overall progress counts sum to 65');
assert.equal(sum(generated.overall.evidence, EVIDENCE_SUM), 65, 'overall evidence counts sum to 65');

for (const cat of generated.categories) {
  assert.equal(sum(cat, PROGRESS_SUM), cat.total, `cat ${cat.id} progress sums to total`);
  assert.equal(sum(cat.evidence, EVIDENCE_SUM), cat.total, `cat ${cat.id} evidence sums to total`);
  const issueTotal = cat.issues.reduce((s: number, iss: { total: number }) => s + iss.total, 0);
  assert.equal(issueTotal, cat.total, `cat ${cat.id} issue totals sum to category total`);
  for (const iss of cat.issues) {
    assert.equal(sum(iss, PROGRESS_SUM), iss.total, `issue ${iss.id} counts sum to its total`);
  }
}

const cat1 = generated.categories.find((c: { code: string }) => c.code === 'cat1');
assert.equal(cat1?.total, 18, 'cat1 has 18 indicators');
assert.equal(cat1?.ready, 2, 'cat1 ready = 2');
assert.equal(cat1?.inProgress, 5, 'cat1 in_progress = 5');
assert.equal(cat1?.notStarted, 2, 'cat1 not_started = 2');
assert.equal(cat1?.unavailable, 9, 'cat1 unavailable = 9');
assert.equal(cat1?.readyRate, 11.1, 'cat1 readyRate 11.1% (derived, not hardcoded)');
assert.equal(cat1?.evidence.verified, 0, 'cat1 evidence verified = 0');
assert.equal(cat1?.evidence.availableUnverified, 7, 'cat1 evidence available_unverified = 7');
assert.equal(cat1?.evidence.unavailable, 11, 'cat1 evidence unavailable = 11');

// Progress ≠ Evidence (separate semantics)
assert.notDeepEqual(
  { ready: cat1?.ready, unavailable: cat1?.unavailable },
  { ready: cat1?.evidence.verified, unavailable: cat1?.evidence.unavailable },
  'progress counts must differ from evidence counts',
);

// ── View models ─────────────────────────────────────────────────────────

assert.equal(generated.overall.ready, 5, 'overall ready = 5');
assert.equal(generated.overall.inProgress, 15, 'overall in_progress = 15');
assert.equal(generated.overall.notStarted, 2, 'overall not_started = 2');
assert.equal(generated.overall.unavailable, 43, 'overall unavailable = 43');

const cat2 = generated.categories.find((c: { code: string }) => c.code === 'cat2');
assert.equal(cat2?.total, 6, 'cat2 has 6 indicators');
assert.equal(cat2?.ready, 3, 'cat2 ready = 3 (owner-approved 2.1.1 / 2.1.2 / 2.2.1)');
assert.equal(cat2?.inProgress, 0, 'cat2 in_progress = 0');
assert.equal(cat2?.unavailable, 3, 'cat2 unavailable = 3 (2.2.2 / 2.2.3 / 2.2.4)');
assert.equal(cat2?.evidence.verified, 3, 'cat2 evidence verified = 3');

const cat3 = generated.categories.find((c: { code: string }) => c.code === 'cat3');
assert.equal(cat3?.total, 15, 'cat3 has 15 indicators');
assert.equal(cat3?.inProgress, 10, 'cat3 in_progress = 10');
assert.equal(cat3?.unavailable, 5, 'cat3 unavailable = 5');

const overviewTh = buildProgressOverview('th');
assert.equal(overviewTh.categories.length, 7, 'overview has 7 categories');
assert.equal(overviewTh.overall.total, 65);
assert.equal(overviewTh.fallbackRows.length, 7, 'fallback table has 7 rows');
assert.match(overviewTh.overallSummary, /5|พร้อม/, 'TH summary carries counts');
assert.ok(overviewTh.categories.every((c) => c.label.length > 0), 'category labels resolved');
assert.equal(overviewTh.started.count, 20, 'started = ready + in_progress');
assert.equal(overviewTh.remaining.count, 45, 'remaining = not_started + unavailable');
assert.equal(overviewTh.pulse.length, 4, 'pulse has four statuses');
assert.ok(overviewTh.pulse.every((p) => typeof p.rate === 'number'), 'pulse includes share %');

const overviewEn = buildProgressOverview('en');
assert.match(overviewEn.overallSummary, /ready/i, 'EN summary carries counts');
assert.equal(overviewEn.categories[0].code, 'cat1');
assert.equal(overviewEn.categories[0].label.length > 0, true);

const cat2Vm = buildCategoryProgress('cat2', 'en');
assert.equal(cat2Vm.overall.inProgress, 0);
assert.equal(cat2Vm.overall.ready, 3, 'cat2 ready = 3 (owner-approved)');
assert.equal(cat2Vm.overall.unavailable, 3, 'cat2 unavailable = 3');
assert.equal(cat2Vm.issues.length >= 2, true, 'cat2 has issue rows');
const cat3Vm = buildCategoryProgress('cat3', 'th');
assert.equal(cat3Vm.overall.inProgress, 10);

const cat1Vm = buildCat1Progress('th');
assert.equal(cat1Vm.issues.length, 7, 'cat1 has 7 issues (1.1–1.7)');
const issueTotal = cat1Vm.issues.reduce((s, i) => s + i.total, 0);
assert.equal(issueTotal, 18, 'issue totals sum to 18');
assert.equal(cat1Vm.fallbackRows.length, 7, 'cat1 fallback table has 7 rows');
const chipSum = cat1Vm.statusChips.reduce((s, c) => s + c.count, 0);
assert.equal(chipSum, 18, 'status chips sum to 18');
assert.equal(cat1Vm.issues[0].id, '1.1');
assert.ok(cat1Vm.issues[0].title.length > 0, 'issue titles resolved');

// Localized labels
assert.equal(progressStatusLabel('ready', 'th'), 'พร้อม');
assert.equal(progressStatusLabel('in_progress', 'en'), 'In Progress');
assert.equal(evidenceStatusLabel('available_unverified', 'th'), 'มีแต่ยังไม่ยืนยัน');
assert.equal(evidenceStatusLabel('verified', 'en'), 'Verified');

// ── Year scoping / no FY2568 leakage in generated output ────────────────
assert.equal(JSON.stringify(generated).includes('2568'), false, 'no FY2568 year leakage in generated progress dataset');

console.log('test-category-progress: ALL PASS ✓');
