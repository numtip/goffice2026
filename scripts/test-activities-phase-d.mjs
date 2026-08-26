import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { reconcileActivitiesPhaseD } from './lib/reconcile-activities-phase-d.mjs';

describe('Phase D — historical migration reconciliation', () => {
  it('Joomla project2 KEEP/MERGE cohort fully migrated (19 published)', () => {
    const result = reconcileActivitiesPhaseD();
    assert.equal(result.publishedCount, 19);
    assert.equal(result.unmigratedEligible.length, 0);
    assert.equal(result.verdict, 'PHASE_D_HISTORICAL_BLOCKED');
  });

  it('year coverage — FY2568/2567/2566 migrated; #21 EXCLUDE unmigrated', () => {
    const result = reconcileActivitiesPhaseD();
    const y2568 = result.yearCoverage.find((y) => y.year === 2568);
    const y2567 = result.yearCoverage.find((y) => y.year === 2567);
    const y2566 = result.yearCoverage.find((y) => y.year === 2566);
    const yUnknown = result.yearCoverage.find((y) => y.year === 'unknown');

    assert.equal(y2568?.alreadyMigrated, 9);
    assert.equal(y2568?.remainingEligible, 0);
    assert.equal(y2567?.alreadyMigrated, 10);
    assert.equal(y2567?.remainingEligible, 0);
    assert.equal(y2566?.alreadyMigrated, 2);
    assert.equal(y2566?.remainingEligible, 0);
    assert.equal(yUnknown?.exclude, 1);
    assert.equal(yUnknown?.alreadyMigrated, 0);
  });

  it('next batch blocked pending legacy archive audit/disposition', () => {
    const result = reconcileActivitiesPhaseD();
    assert.equal(result.nextBatch.kind, 'blocked_pending_audit');
    assert.ok(result.blockers.some((b) => b.kind === 'joomla_project2_complete'));
    assert.deepEqual(result.excludedUnmigrated.map((a) => a.joomlaArticleId), [21]);
  });
});
