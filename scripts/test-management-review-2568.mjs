/**
 * test-management-review-2568.mjs
 * =================================
 * CAT1-1.7 FY2568 management-review reconciliation regression tests.
 * Read-only over management-review.json.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MR = JSON.parse(
  readFileSync(join(ROOT, 'src', 'data', 'category1', 'management-review.json'), 'utf8'),
);
const byId = new Map(MR.records.map((r) => [r.id, r]));

describe('CAT1-1.7 — quorum calculation (Meeting #1)', () => {
  it('documents 20/23 = 86.96% with >75% threshold met', () => {
    const q = byId.get('mr-quorum-1');
    assert.equal(q.meetingId, 'mr-meeting-1');
    assert.equal(q.invitedCount, 23);
    assert.equal(q.attendedCount, 20);
    assert.equal(q.thresholdPct, 75);
    assert.equal(q.thresholdOperator, 'gt');
    assert.equal(q.quorumMet, true);
    const calc = Math.round((20 / 23) * 10000) / 100;
    assert.equal(calc, 86.96);
    assert.equal(q.attendancePct, 86.96);
  });

  it('has no quorum record for Meeting #2', () => {
    const quorums = MR.records.filter((r) => r.kind === 'quorum');
    assert.equal(quorums.length, 1);
    assert.equal(quorums[0].meetingId, 'mr-meeting-1');
  });
});

describe('CAT1-1.7 — meeting/date integrity', () => {
  it('has two distinct FY2568 meetings with explicit identity', () => {
    const meetings = MR.records.filter((r) => r.kind === 'meeting').sort((a, b) => a.dateISO.localeCompare(b.dateISO));
    assert.equal(meetings.length, 2);
    assert.equal(meetings[0].id, 'mr-meeting-1');
    assert.equal(meetings[0].meetingNumber, '1/2568');
    assert.equal(meetings[0].dateISO, '2025-03-07');
    assert.equal(meetings[1].id, 'mr-meeting-2');
    assert.equal(meetings[1].meetingNumber, '2/2568');
    assert.equal(meetings[1].dateISO, '2025-09-18');
  });

  it('Meeting #1 is content-verified; Meeting #2 is occurrence-only', () => {
    assert.equal(byId.get('mr-meeting-1').reviewStatus, 'content-verified');
    assert.equal(byId.get('mr-meeting-2').reviewStatus, 'occurrence_supported');
    assert.equal(byId.get('mr-meeting-2').agendaStatus, 'not_locally_verified');
    assert.equal(byId.get('mr-meeting-2').decisionsStatus, 'not_locally_verified');
    assert.equal(byId.get('mr-meeting-2').quorumStatus, 'not_locally_verified');
    assert.equal(byId.get('mr-meeting-2').participantsCount, null);
  });

  it('frequency plan specifies 2 meetings per year (Mar + Sep)', () => {
    const fp = byId.get('mr-frequency-plan-1');
    assert.equal(fp.plannedPerYear, 2);
    assert.deepEqual(fp.plannedMonths, ['มี.ค.', 'ก.ย.']);
    assert.equal(fp.executedPerPlan, true);
  });
});

describe('CAT1-1.7 — agenda/input coverage', () => {
  it('upstream coverage matrix marks domains truthfully for MR #1', () => {
    const cov = byId.get('mr-upstream-coverage-1').coverage;
    assert.equal(cov['1.1'], 'explicitly_reviewed');
    assert.equal(cov['1.2'], 'explicitly_reviewed');
    assert.equal(cov['1.3'], 'referenced_only');
    assert.equal(cov['1.4'], 'explicitly_reviewed');
    assert.equal(cov['1.5'], 'referenced_only');
    assert.equal(cov['1.6'], 'explicitly_reviewed');
  });
});

describe('CAT1-1.7 — decision traceability', () => {
  it('has nine source-traced decisions for Meeting #1 only', () => {
    const decisions = MR.records.filter((r) => r.kind === 'decision');
    assert.equal(decisions.length, 9);
    for (const d of decisions) {
      assert.equal(d.meetingId, 'mr-meeting-1');
      assert.ok(d.text && d.text.length > 10);
      assert.ok(d.verification?.basis);
    }
  });

  it('paper target amendment links to 1.1.3 PDCA', () => {
    const d = byId.get('mr-decision-m1-08');
    assert.match(d.text, /3%/);
    assert.equal(d.pdcaLink.target, '1.1.3');
  });

  it('Meeting #2 has zero decisions (no fabrication)', () => {
    const m2Decisions = MR.records.filter((r) => r.kind === 'decision' && r.meetingId === 'mr-meeting-2');
    assert.equal(m2Decisions.length, 0);
  });
});

describe('CAT1-1.7 — participant summaries', () => {
  it('management (9) + category reps (11) = 20 attended', () => {
    const mgmt = byId.get('mr-participant-mgmt-1');
    const cat = byId.get('mr-participant-cat-1');
    assert.equal(mgmt.attendedCount + cat.attendedCount, 20);
    assert.equal(cat.categoryRange, '1-7');
    assert.ok(cat.absentNotes.includes('หมวด 6'));
  });
});

describe('CAT1-1.7 — truthfulness guards', () => {
  it('contract is FY2568 historical-baseline only', () => {
    assert.equal(MR.year, 2568);
    assert.equal(MR.status, 'historical-baseline');
    for (const rec of MR.records) assert.equal(rec.year, 2568);
  });

  it('declares Meeting #2 minutes gap and GHG performance not reviewed', () => {
    const partial = MR.gaps.find((g) => g.status === 'PARTIAL' && g.indicator === '1.7.2');
    assert.ok(partial);
    assert.match(partial.note, /18 ก.ย. 2568/);
    const ghgGap = MR.gaps.find((g) => g.status === 'NOT_REVIEWED');
    assert.ok(ghgGap);
    assert.match(ghgGap.note, /4\.81/);
  });
});
