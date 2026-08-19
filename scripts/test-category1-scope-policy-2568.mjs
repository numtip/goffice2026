/**
 * test-category1-scope-policy-2568.mjs
 * CAT1-1.1 FY2568 scope, policy, targets, and plan reconciliation tests.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const AA = JSON.parse(readFileSync(join(ROOT, 'src/data/category1/activities-aspects.json'), 'utf8'));
const TARGETS = JSON.parse(readFileSync(join(ROOT, 'src/data/category1/targets.json'), 'utf8'));
const PROJECTS = JSON.parse(readFileSync(join(ROOT, 'src/data/category1/projects.json'), 'utf8'));
const MR = JSON.parse(readFileSync(join(ROOT, 'src/data/category1/management-review.json'), 'utf8'));
const byId = (arr) => new Map(arr.map((r) => [r.id, r]));

describe('CAT1-1.1.1 — scope area integrity', () => {
  it('scope components sum to 9,873 m²', () => {
    const scope = byId(AA.records).get('scope-1');
    assert.equal(scope.officeAreaSqm, 9873);
    assert.equal(scope.externalAreaSqm, 1934);
    const floors = scope.floorAreasSqm;
    assert.equal(floors.floor1 + floors.floor2 + floors.floor3, 9873 - 1934);
    const areas = AA.records.filter((r) => r.kind === 'scopeArea');
    const sum = areas.reduce((s, r) => s + r.areaSqm, 0);
    assert.equal(sum, 9873);
  });

  it('has four participating organizations with rice alias normalized', () => {
    const orgs = AA.records.filter((r) => r.kind === 'scopeOrganization');
    assert.equal(orgs.length, 4);
    const rice = orgs.find((o) => o.tableAliases?.includes('โครงการข้าวฯ'));
    assert.ok(rice?.nameTh.includes('ศูนย์ปรับปรุงพันธุ์ข้าว'));
  });
});

describe('CAT1-1.1.2 — policy approval integrity', () => {
  it('has ten policy commitments', () => {
    const policies = AA.records.filter((r) => r.kind === 'policyCommitment');
    assert.equal(policies.length, 10);
    const nums = policies.map((p) => p.statementNumber).sort((a, b) => a - b);
    assert.deepEqual(nums, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('distinguishes review date from announcement date', () => {
    const approval = byId(AA.records).get('policy-approval-1');
    assert.equal(approval.reviewDateISO, '2025-03-07');
    assert.equal(approval.announcementDateISO, '2025-03-25');
    assert.notEqual(approval.reviewDateISO, approval.announcementDateISO);
  });

  it('declares 1.1.2(4) interview as partial, not completed', () => {
    const gap = AA.gaps.find((g) => g.indicator === '1.1.2' && g.status === 'PARTIAL');
    assert.ok(gap);
    assert.match(gap.note, /interview/i);
  });
});

describe('CAT1-1.1.3 — target authority and conflicts', () => {
  const expected = {
    electricity: -1,
    fuel: -3,
    water: -1,
    paper: -3,
    general_waste: -3,
    ghg: -1,
  };

  it('records six domains with targetPercent against FY2567', () => {
    const targets = TARGETS.records.filter((r) => r.kind === 'target');
    assert.equal(targets.length, 6);
    for (const t of targets) {
      assert.equal(t.baselineYear, 2567);
      assert.equal(t.targetYear, 2568);
      assert.equal(t.targetPercent, expected[t.domain]);
    }
  });

  it('paper target reflects post-MR −3% amendment', () => {
    const paper = byId(TARGETS.records).get('target-paper');
    assert.equal(paper.targetPercent, -3);
    assert.equal(paper.supersedes.priorTargetPercent, -1);
    assert.equal(paper.supersedes.amendedByDecisionId, 'mr-decision-m1-08');
  });

  it('numeric source is Green_Office_Goals.pdf not wrapper only', () => {
    for (const t of TARGETS.records.filter((r) => r.kind === 'target')) {
      assert.match(t.sourceRef, /Green_Office_Goals/);
    }
  });
});

describe('CAT1-1.1.4 — plan dedup and truthfulness', () => {
  it('proj-plan-1 is shared by 1.1.4 and 1.6.1 without duplicate plan records', () => {
    const plans = PROJECTS.records.filter((r) => r.kind === 'plan');
    assert.equal(plans.length, 1);
    const plan = plans[0];
    assert.equal(plan.id, 'proj-plan-1');
    assert.ok(plan.indicatorCodes.includes('1.1.4'));
    assert.ok(plan.indicatorCodes.includes('1.6.1'));
    assert.match(plan.sourceRef, /1\.1\.4/);
    assert.equal(plan.plannedVsActualSeparate, true);
    assert.equal(plan.approvingOrganizationCount, 4);
    assert.equal(plan.categoryCoverage, 7);
  });
});

describe('CAT1-1.1 — cross-indicator reference integrity', () => {
  it('MR scope decision matches scope-1 total', () => {
    const scope = byId(AA.records).get('scope-1');
    const d4 = byId(MR.records).get('mr-decision-m1-04');
    assert.match(d4.text, /9,873/);
    assert.equal(scope.officeAreaSqm, 9873);
  });

  it('MR paper amendment aligns with target-paper supersedes', () => {
    const d8 = byId(MR.records).get('mr-decision-m1-08');
    const paper = byId(TARGETS.records).get('target-paper');
    assert.match(d8.text, /3%/);
    assert.equal(paper.supersedes.amendedByDecisionId, 'mr-decision-m1-08');
  });
});
