/**
 * test-category1-fy2569-overlay.mjs
 * Regression suite for the FY2569 CAT1 overlay contracts and presentation view-models.
 * FY2569 = current year (primary); FY2568 frozen contracts remain the historical baseline.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const CONTRACT_DIR = join(ROOT, 'src/data/category1');

const aa2569 = JSON.parse(readFileSync(join(CONTRACT_DIR, 'activities-aspects-2569.json'), 'utf8'));
const targets2569 = JSON.parse(readFileSync(join(CONTRACT_DIR, 'targets-2569.json'), 'utf8'));
const projects2569 = JSON.parse(readFileSync(join(CONTRACT_DIR, 'projects-2569.json'), 'utf8'));
const ec2569 = JSON.parse(readFileSync(join(CONTRACT_DIR, 'environmental-committee-2569.json'), 'utf8'));

const PRESENTATION = join(ROOT, 'src/utils/category1-fy2569-presentation.ts');

describe('FY2569 overlay — data contracts', () => {
  it('all four overlay contracts are year 2569 (separate from frozen 2568)', () => {
    for (const [name, c] of [
      ['activities-aspects-2569', aa2569],
      ['targets-2569', targets2569],
      ['projects-2569', projects2569],
      ['environmental-committee-2569', ec2569],
    ]) {
      assert.equal(c.year, 2569, `${name} contract year`);
      for (const rec of c.records) {
        assert.equal(rec.year, 2569, `${name}/${rec.id} record year`);
      }
    }
  });

  it('frozen FY2568 contracts remain untouched (still year 2568)', () => {
    for (const name of ['activities-aspects', 'targets', 'projects', 'environmental-committee']) {
      const c = JSON.parse(readFileSync(join(CONTRACT_DIR, `${name}.json`), 'utf8'));
      assert.equal(c.year, 2568, `${name} must remain FY2568 frozen`);
    }
  });

  it('scope: 9,873 m², 97 personnel, announced 2026-04-05', () => {
    const scope = aa2569.records.find((r) => r.id === 'scope-2569-1');
    assert.equal(scope.officeAreaSqm, 9873);
    assert.equal(scope.personnelCount, 97);
    assert.equal(scope.announcementDateISO, '2026-04-05');
    const floors = scope.floorAreasSqm;
    assert.equal(1934 + floors.floor1 + floors.floor2 + floors.floor3, 9873);
  });

  it('policy: 10 commitments announced 2026-04-01 by RAE Director', () => {
    const approval = aa2569.records.find((r) => r.id === 'policy-2569-approval-1');
    const commitments = aa2569.records.filter((r) => r.kind === 'policyCommitment');
    assert.equal(approval.announcementDateISO, '2026-04-01');
    assert.match(approval.signedByRoleTh, /ผู้อำนวยการสำนักวิจัย/);
    assert.equal(approval.policyRetainedFromFY2568, false);
    assert.equal(commitments.length, 10);
  });

  it('targets: 6 domains, baseline 2568 → target 2569', () => {
    const targets = targets2569.records.filter((r) => r.kind === 'target');
    assert.equal(targets.length, 6);
    for (const t of targets) {
      assert.equal(t.baselineYear, 2568);
      assert.equal(t.targetYear, 2569);
    }
    const pct = Object.fromEntries(targets.map((t) => [t.domain, t.targetPercent]));
    assert.deepEqual(pct, { electricity: -1, fuel: -3, water: -1, paper: -3, general_waste: -1, ghg: -1 });
  });

  it('plan: 147 activities, approved 2026-04-20, linked to Excel workbook', () => {
    const plan = projects2569.records.find((r) => r.kind === 'plan');
    assert.equal(plan.activityCount, 147);
    assert.equal(plan.indicatorCoverage, 65);
    assert.equal(plan.approvalDateISO, '2026-04-20');
    assert.match(plan.sourceRef, /\.xlsx$/);
  });

  it('committee: appointment 2026-03-31, 4 orgs (97 personnel), Cat1+7 combined', () => {
    const auth = ec2569.records.find((r) => r.kind === 'appointmentAuthority');
    assert.equal(auth.dateISO, '2026-03-31');
    const orgCov = ec2569.records.filter((r) => r.kind === 'organizationCoverage');
    assert.equal(orgCov.reduce((s, r) => s + r.personnelCount, 0), 97);
    const combined = ec2569.records.find(
      (g) => g.kind === 'committeeGroup' && g.combinedGroup === true,
    );
    assert.ok(combined, 'Cat1+Cat7 combined group must exist');
    assert.deepEqual([...combined.categoryCodes].sort(), ['cat1', 'cat7']);
  });

  it('1.2.2 and 1.5.3 remain MISSING (gaps only) in every overlay contract', () => {
    for (const c of [aa2569, targets2569, projects2569, ec2569]) {
      const gapInds = c.gaps.map((g) => g.indicator);
      assert.ok(gapInds.includes('1.2.2'), `${c.domain} must declare 1.2.2`);
      assert.ok(gapInds.includes('1.5.3'), `${c.domain} must declare 1.5.3`);
      for (const rec of c.records) {
        assert.ok(!rec.indicatorCodes.includes('1.2.2'));
        assert.ok(!rec.indicatorCodes.includes('1.5.3'));
      }
    }
  });
});

describe('FY2569 overlay — presentation wiring', () => {
  it('view-model module exists and exposes FY2569 builders', () => {
    const mod = readFileSync(PRESENTATION, 'utf8');
    assert.match(mod, /CAT1_FY2569_YEAR = 2569/);
    for (const fn of [
      'buildScopeView2569',
      'buildPolicyApproval2569',
      'buildPolicyCommitments2569',
      'buildTargetBoard2569',
      'buildAnnualPlanView2569',
      'buildCommitteeFoundation2569',
      'buildAppointmentAuthority2569',
      'buildOrganizationCoverage2569',
      'buildCommitteeGroups2569',
    ]) {
      assert.match(mod, new RegExp(`export function ${fn}`), `${fn} must be exported`);
    }
  });

  it('journey components render FY2569 as primary with FY2568 baseline', () => {
    const scopeJourney = readFileSync(join(ROOT, 'src/components/indicators/Cat1ScopeExplorerJourney.astro'), 'utf8');
    assert.match(scopeJourney, /FY2569/);
    assert.match(scopeJourney, /buildScopeView2569/);
    assert.match(scopeJourney, /historical baseline/);
    assert.match(scopeJourney, /CAT1_FY2569_YEAR/);
    assert.match(scopeJourney, /บุคลากรในขอบเขต|Personnel in scope/);

    const policyJourney = readFileSync(join(ROOT, 'src/components/indicators/Cat1PolicyJourney.astro'), 'utf8');
    assert.match(policyJourney, /buildPolicyApproval2569/);
    assert.match(policyJourney, /1 เม\.ย\. 2569|1 เมษายน 2569/);

    const targetJourney = readFileSync(join(ROOT, 'src/components/indicators/Cat1TargetBoardJourney.astro'), 'utf8');
    assert.match(targetJourney, /buildTargetBoard2569/);
    assert.match(targetJourney, /FY2568/);

    const planJourney = readFileSync(join(ROOT, 'src/components/indicators/Cat1AnnualPlanJourney.astro'), 'utf8');
    assert.match(planJourney, /buildAnnualPlanView2569/);
    assert.match(planJourney, /plan\.activityCount/);

    const committeeJourney = readFileSync(join(ROOT, 'src/components/indicators/Cat1CommitteeGovernanceJourney.astro'), 'utf8');
    assert.match(committeeJourney, /buildAppointmentAuthority2569/);
    assert.match(committeeJourney, /authority\.dateBE/);
    assert.match(committeeJourney, /CAT1_FY2569_YEAR/);
  });

  it('about hub presents FY2569 as primary with FY2568 baseline', () => {
    const facts = readFileSync(join(ROOT, 'src/components/about/AboutCanonicalFacts.astro'), 'utf8');
    assert.match(facts, /CAT1_FY2569_YEAR/);
    assert.match(facts, /buildScopeView2569/);
    assert.match(facts, /historical baseline/);
    const content = JSON.parse(readFileSync(join(ROOT, 'src/data/about/content.json'), 'utf8'));
    assert.match(content.pages['about-scope'].noticeEn, /FY2569/);
    assert.match(content.pages['about-policy'].noticeEn, /1 Apr 2569/);
  });
});

describe('FY2569 overlay — validator parity', () => {
  it('validator script passes standalone', async () => {
    const { execFileSync } = await import('node:child_process');
    const out = execFileSync('node', [join(ROOT, 'scripts/validate-category1-fy2569.mjs')], { encoding: 'utf8' });
    assert.match(out, /RESULT: PASS/);
  });
});
