/**
 * test-category1-committee-2568.mjs
 * CAT1-1.2 FY2568 committee/governance reconciliation tests.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const EC = JSON.parse(readFileSync(join(ROOT, 'src/data/category1/environmental-committee.json'), 'utf8'));
const AA = JSON.parse(readFileSync(join(ROOT, 'src/data/category1/activities-aspects.json'), 'utf8'));
const byId = (arr) => new Map(arr.map((r) => [r.id, r]));

describe('CAT1-1.2.1 — appointment and coverage', () => {
  it('records signed appointment on 25 Mar 2568 by university president', () => {
    const auth = byId(EC.records).get('appt-auth-1');
    assert.equal(auth.dateISO, '2025-03-25');
    assert.equal(auth.writtenAppointment, true);
    assert.match(auth.signedByRoleEn, /President/i);
  });

  it('organization coverage sums to 97 with explicit semantics', () => {
    const ec = byId(EC.records).get('ec-fy2568');
    assert.equal(ec.personnelCoverageTotal, 97);
    assert.equal(ec.personnelCoverageSemantics, 'organizational_staffing_not_unique_committee_members');
    const cov = EC.records.filter((r) => r.kind === 'organizationCoverage');
    assert.equal(cov.reduce((s, r) => s + r.personnelCount, 0), 97);
  });

  it('reuses scope-org IDs from activities-aspects (no duplicate org registry)', () => {
    const scopeOrgIds = new Set(AA.records.filter((r) => r.kind === 'scopeOrganization').map((r) => r.id));
    for (const c of EC.records.filter((r) => r.kind === 'organizationCoverage')) {
      assert.ok(scopeOrgIds.has(c.organizationId), `org ${c.organizationId} must exist in scope contract`);
    }
  });

  it('preserves combined Cat1+Cat7 working group', () => {
    const wg = EC.records.find((r) => r.id === 'grp-wg-cat1-cat7');
    assert.ok(wg?.combinedGroup);
    assert.ok(wg.categoryCodes.includes('cat1'));
    assert.ok(wg.categoryCodes.includes('cat7'));
  });

  it('does not conflate MR order 345/2568 with committee appointment', () => {
    const auth = byId(EC.records).get('appt-auth-1');
    assert.equal(auth.orderRef, null);
    assert.match(auth.orderRefNoteEn, /345\/2568/);
  });
});

describe('CAT1-1.2.2 — role understanding truthfulness', () => {
  it('declares MISSING with null sample and percentage in gaps only', () => {
    const gap = EC.gaps.find((g) => g.indicator === '1.2.2');
    assert.equal(gap.status, 'MISSING');
    assert.equal(gap.sampleSize, null);
    assert.equal(gap.understandingPercent, null);
    assert.equal(gap.sourceStub, '-สัมภาษณ์-');
    const records122 = EC.records.filter((r) => r.indicatorCodes?.includes('1.2.2'));
    assert.equal(records122.length, 0);
  });
});
