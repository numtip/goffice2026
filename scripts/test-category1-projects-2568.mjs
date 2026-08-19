/**
 * test-category1-projects-2568.mjs
 * =================================
 * CAT1-1.6 FY2568 project/plan reconciliation regression tests.
 * Read-only over projects.json and environmental-aspects projectLinks.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECTS = JSON.parse(
  readFileSync(join(ROOT, 'src', 'data', 'category1', 'projects.json'), 'utf8'),
);
const ASPECTS = JSON.parse(
  readFileSync(join(ROOT, 'src', 'data', 'category1', 'environmental-aspects-2568.json'), 'utf8'),
);

const projects = PROJECTS.records.filter((r) => r.kind === 'project');
const plans = PROJECTS.records.filter((r) => r.kind === 'plan');
const byId = new Map(PROJECTS.records.map((r) => [r.id, r]));

describe('CAT1-1.6 — project deduplication', () => {
  it('has exactly two FY2568 project records (no duplicate registry)', () => {
    assert.equal(projects.length, 2);
    const ids = projects.map((p) => p.id).sort();
    assert.deepEqual(ids, ['proj-1', 'proj-2']);
  });

  it('project IDs are unique across all records', () => {
    const ids = PROJECTS.records.map((r) => r.id);
    assert.equal(new Set(ids).size, ids.length);
  });
});

describe('CAT1-1.6 — 1.3.3 ↔ 1.6.2 identity reuse', () => {
  it('proj-2 is the single canonical record shared by 1.3.3 and 1.6.2', () => {
    const p2 = byId.get('proj-2');
    assert.ok(p2.indicatorCodes.includes('1.3.3'));
    assert.ok(p2.indicatorCodes.includes('1.6.2'));
  });

  it('proj-1 is 1.6.2-only (not duplicated for 1.3.3)', () => {
    const p1 = byId.get('proj-1');
    assert.deepEqual(p1.indicatorCodes, ['1.6.2']);
    assert.ok(!p1.indicatorCodes.includes('1.3.3'));
  });

  it('environmental-aspects projectLinks reference only canonical proj-2', () => {
    const links = ASPECTS.projectLinks;
    assert.equal(links.length, 2);
    for (const pl of links) {
      assert.equal(pl.projectId, 'proj-2');
      assert.ok(byId.has(pl.projectId));
    }
  });
});

describe('CAT1-1.6 — KPI target vs actual (source-supported)', () => {
  it('proj-1 participation KPIs are populated and met', () => {
    const p1 = byId.get('proj-1');
    assert.ok(Array.isArray(p1.kpis) && p1.kpis.length >= 2);
    const unit = p1.kpis.find((k) => k.id === 'participation-owning-unit');
    const building = p1.kpis.find((k) => k.id === 'participation-building');
    assert.equal(unit.actual, '97.78% (44/45)');
    assert.equal(building.actual, '91.80% (112/122)');
    assert.equal(unit.targetMet, true);
    assert.equal(building.targetMet, true);
    assert.ok(p1.results && p1.results.length > 0);
  });

  it('proj-2 rat/IPM KPIs match verified source values', () => {
    const p2 = byId.get('proj-2');
    const trap = p2.kpis.find((k) => k.id === 'trap-installation');
    const sat = p2.kpis.find((k) => k.id === 'staff-satisfaction');
    const access = p2.kpis.find((k) => k.id === 'access-points-sealed');
    assert.match(trap.actual, /100%/);
    assert.match(sat.actual, /88\.60%/);
    assert.match(access.actual, /11/);
    assert.equal(p2.targetStatus, 'met');
  });
});

describe('CAT1-1.6 — GHG measurement truthfulness', () => {
  const ALLOWED = new Set(['ghg_measured', 'ghg_supporting_action', 'environmental_improvement']);

  it('neither project claims measured GHG reduction', () => {
    for (const p of projects) {
      assert.notEqual(p.ghgImpactStatus, 'ghg_measured');
      assert.equal(p.measuredReduction, null);
      assert.equal(p.expectedReduction, null);
    }
  });

  it('proj-1 is ghg_supporting_action; proj-2 is environmental_improvement', () => {
    assert.equal(byId.get('proj-1').ghgImpactStatus, 'ghg_supporting_action');
    assert.equal(byId.get('proj-2').ghgImpactStatus, 'environmental_improvement');
    for (const p of projects) assert.ok(ALLOWED.has(p.ghgImpactStatus));
  });

  it('no project has an explicit source-supported 1.5.2 performance gap link', () => {
    for (const p of [...projects, ...plans]) {
      assert.equal(p.performanceGapLink, null);
    }
  });
});

describe('CAT1-1.6 — plan record (1.6.1)', () => {
  it('proj-plan-1 exists with 1-year duration and 1.1.3 link only', () => {
    const plan = byId.get('proj-plan-1');
    assert.equal(plan.kind, 'plan');
    assert.deepEqual(plan.indicatorCodes, ['1.6.1']);
    assert.equal(plan.durationYears, 1);
    assert.equal(plan.writtenPlan, true);
    assert.equal(plan.executiveApproved, true);
    assert.deepEqual(plan.linksToIndicators, ['1.1.3']);
    assert.equal(plan.performanceGapLink, null);
  });

  it('plan does not overclaim Carbon Neutrality / Net Zero as separately documented', () => {
    const plan = byId.get('proj-plan-1');
    assert.equal(plan.carbonNeutralityDocumented, false);
    assert.equal(plan.netZeroDocumented, false);
    assert.match(plan.verification.basis, /not separately evidenced/i);
  });
});
