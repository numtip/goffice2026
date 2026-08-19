/**
 * test-category1-presentation.mjs
 * ================================
 * GOFFICE2026 Phase E/F regression tests — Category 1 management presentation.
 * Static structural assertions over TH/EN parity, a11y focus affordances,
 * reduced-motion coverage, missing-evidence honesty, and the read-only
 * view-model (src/utils/category1-presentation.ts).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const CAT_TH = join(ROOT, 'src/pages/categories/[id].astro');
const CAT_EN = join(ROOT, 'src/pages/en/categories/[id].astro');
const CYCLE = join(ROOT, 'src/components/categories/Cat1ManagementCycle.astro');
const SNAPSHOT = join(ROOT, 'src/components/categories/Cat1DomainSnapshot.astro');
const CONTEXT = join(ROOT, 'src/components/indicators/Cat1ContractContext.astro');
const TRACE = join(ROOT, 'src/components/indicators/IndicatorTraceabilityExperience.astro');
const LEGAL_REG = join(ROOT, 'src/components/indicators/Cat1LegalRegisterJourney.astro');
const LEGAL_COMP = join(ROOT, 'src/components/indicators/Cat1LegalComplianceJourney.astro');
const LEGAL_VM = join(ROOT, 'src/utils/category1-legal-presentation.ts');
const GHG_INV = join(ROOT, 'src/components/indicators/Cat1GhgInventoryJourney.astro');
const GHG_PERF = join(ROOT, 'src/components/indicators/Cat1GhgPerformanceJourney.astro');
const GHG_UNDR = join(ROOT, 'src/components/indicators/Cat1GhgUnderstandingJourney.astro');
const GHG_VM = join(ROOT, 'src/utils/category1-ghg-presentation.ts');
const PROJ_PLAN = join(ROOT, 'src/components/indicators/Cat1ProjectsPlanJourney.astro');
const PROJ_IMP = join(ROOT, 'src/components/indicators/Cat1ProjectsImprovementJourney.astro');
const PROJ_VM = join(ROOT, 'src/utils/category1-projects-presentation.ts');
const MR_QUORUM = join(ROOT, 'src/components/indicators/Cat1ManagementReviewQuorumJourney.astro');
const MR_MEETING = join(ROOT, 'src/components/indicators/Cat1ManagementReviewMeetingJourney.astro');
const MR_VM = join(ROOT, 'src/utils/category1-management-review-presentation.ts');
const CAT11_SCOPE = join(ROOT, 'src/components/indicators/Cat1ScopeExplorerJourney.astro');
const CAT11_POLICY = join(ROOT, 'src/components/indicators/Cat1PolicyJourney.astro');
const CAT11_TARGETS = join(ROOT, 'src/components/indicators/Cat1TargetBoardJourney.astro');
const CAT11_PLAN = join(ROOT, 'src/components/indicators/Cat1AnnualPlanJourney.astro');
const CAT11_VM = join(ROOT, 'src/utils/category1-foundation-presentation.ts');
const VM = join(ROOT, 'src/utils/category1-presentation.ts');

describe('Phase E — TH/EN structural parity', () => {
  it('both category pages include the management cycle and domain snapshot, gated to cat1', () => {
    for (const p of [CAT_TH, CAT_EN]) {
      const src = readFileSync(p, 'utf8');
      assert.match(src, /Cat1ManagementCycle/);
      assert.match(src, /Cat1DomainSnapshot/);
      assert.match(src, /category\.code === 'cat1'/);
    }
  });

  it('management cycle and snapshot render semantic lists and a11y markers', () => {
    const cycle = readFileSync(CYCLE, 'utf8');
    assert.match(cycle, /<ol /);
    assert.match(cycle, /role="list"/);
    assert.match(cycle, /data-cat1-management-cycle/);
    assert.match(cycle, /focus-visible:ring-2/);
    const snap = readFileSync(SNAPSHOT, 'utf8');
    assert.match(snap, /data-cat1-domain-snapshot/);
    assert.match(snap, /focus-visible:ring-2/);
    assert.match(snap, /data-cat1-domain-status/);
  });

  it('indicator traceability wires the contract context for cat1 only', () => {
    const trace = readFileSync(TRACE, 'utf8');
    assert.match(trace, /Cat1ContractContext/);
    assert.match(trace, /Cat1LegalPresentation/);
    assert.match(trace, /Cat1GhgPresentation/);
    assert.match(trace, /Cat1ProjectsPresentation/);
    assert.match(trace, /Cat1ManagementReviewPresentation/);
    assert.match(trace, /indicator\.categoryCode === 'cat1'/);
  });
});

describe('Phase E — missing indicators stay unavailable and honest', () => {
  it('contract context renders a calm unavailable notice for 1.2.2 and 1.5.3', () => {
    const ctx = readFileSync(CONTEXT, 'utf8');
    assert.match(ctx, /data-cat1-missing-notice/);
    assert.match(ctx, /MISSING_CAT1_INDICATORS/);
    // The notice must not claim evidence exists for missing indicators.
    assert.doesNotMatch(ctx, /ยังไม่มีหลักฐานที่เชื่อมโยงกับตัวชี้วัดนี้โดยตรง/);
  });

  it('indicator pages never fabricate evidence text for missing indicators', () => {
    const trace = readFileSync(TRACE, 'utf8');
    assert.match(trace, /ยังไม่มีหลักฐานที่เชื่อมโยงกับตัวชี้วัดนี้โดยตรง/);
  });
});

describe('Phase E — a11y / motion', () => {
  it('cycle and context links expose focus-visible rings', () => {
    const cycle = readFileSync(CYCLE, 'utf8');
    const ctx = readFileSync(CONTEXT, 'utf8');
    assert.match(cycle, /focus-visible:outline-none/);
    assert.match(ctx, /focus-visible:outline-none/);
  });

  it('global reduced-motion rule covers the new presentation classes', () => {
    const globalCss = readFileSync(join(ROOT, 'src/styles/global.css'), 'utf8');
    assert.match(globalCss, /@media \(prefers-reduced-motion: reduce\)/);
  });

  it('no local filesystem paths or secrets in the presentation artifacts', () => {
    for (const p of [CYCLE, SNAPSHOT, CONTEXT, VM, LEGAL_VM, LEGAL_REG, LEGAL_COMP, GHG_VM, GHG_INV, GHG_PERF, GHG_UNDR, PROJ_VM, PROJ_PLAN, PROJ_IMP, MR_VM, MR_QUORUM, MR_MEETING]) {
      const raw = readFileSync(p, 'utf8');
      assert.ok(!/F:\\/i.test(raw), `${p} leaks F:\\ path`);
      assert.ok(!/OneDrive - Maejo/i.test(raw), `${p} leaks OneDrive path`);
    }
  });
});

describe('Phase F — cross-link journeys and view-model', () => {
  it('journeys and relations cover the required flows', () => {
    const src = readFileSync(VM, 'utf8');
    assert.match(src, /1\.1\.1.*1\.3\.1/s);
    assert.match(src, /1\.3\.1.*1\.4\.1/s);
    assert.match(src, /1\.1\.3.*1\.5\.2/s);
    assert.match(src, /1\.3\.3.*1\.6\.2/s);
    assert.match(src, /1\.7\.2.*1\.1\.4/s);
  });

  it('view-model never exposes local paths and only references the contracts', () => {
    const src = readFileSync(VM, 'utf8');
    assert.match(src, /category1\/activities-aspects\.json/);
    assert.match(src, /category1\/ghg\.json/);
    assert.match(src, /category1\/environmental-aspects-2568\.json/);
  });

  it('snapshot and context state explicitly that facts are coverage, not scores', () => {
    const snap = readFileSync(SNAPSHOT, 'utf8');
    assert.match(snap, /official score|คะแนนอย่างเป็นทางการ/);
    assert.ok(!/data-score|data-official-score/.test(snap), 'snapshot must not emit scoring markers');
  });

  it('1.3.x runtime uses environmental-aspects-2568; scope card is 1.1.1 only', () => {
    const src = readFileSync(VM, 'utf8');
    assert.match(src, /'1\.3\.1': 'environmental-aspects-2568'/);
    assert.match(src, /'1\.3\.2': 'environmental-aspects-2568'/);
    assert.match(src, /'1\.3\.3': 'environmental-aspects-2568'/);
    assert.match(src, /'1\.1\.1': 'activities-aspects'/);
    const snap = readFileSync(SNAPSHOT, 'utf8');
    assert.match(snap, /route: '\/indicators\/1\.1\.1\/'/);
    assert.doesNotMatch(snap, /'activities-aspects': \{ label: \{ th: 'ขอบเขตและประเด็น'/);
  });

  it('1.4 presentation is wired with historical-baseline honesty markers', () => {
    const trace = readFileSync(TRACE, 'utf8');
    assert.match(trace, /cat14Canonical/);
    const reg = readFileSync(LEGAL_REG, 'utf8');
    const comp = readFileSync(LEGAL_COMP, 'utf8');
    assert.match(reg, /Historical Baseline/);
    assert.match(reg, /data-cat14-register-table/);
    assert.match(reg, /data-cat14-aspect-mapping/);
    assert.match(reg, /m\.aspectId/);
    assert.match(reg, /focus-visible:ring-2/);
    assert.match(comp, /Needs review/);
    assert.match(comp, /Do not interpret|ห้ามตีความ/);
    assert.match(comp, /Partial/);
    assert.doesNotMatch(reg, /100% compliant/i);
    const vm = readFileSync(LEGAL_VM, 'utf8');
    assert.match(vm, /buildLegalSummary/);
    assert.match(vm, /buildAspectLegalMappings/);
  });

  it('1.5 presentation is wired with historical-baseline honesty and dashboard reuse', () => {
    const trace = readFileSync(TRACE, 'utf8');
    assert.match(trace, /cat15Canonical/);
    const inv = readFileSync(GHG_INV, 'utf8');
    const perf = readFileSync(GHG_PERF, 'utf8');
    const undr = readFileSync(GHG_UNDR, 'utf8');
    assert.match(inv, /Historical Baseline/);
    assert.match(inv, /231\.62|buildGhgInventory/);
    assert.match(inv, /Derived: annual|คำนวณจากผลรวม/);
    assert.match(inv, /dashboard\/ghg/);
    assert.match(inv, /7,772|E42/);
    assert.match(inv, /data-cat15-monthly-table/);
    assert.match(inv, /focus-visible:ring-2/);
    assert.match(perf, /Target not met|ไม่บรรลุเป้าหมาย/);
    assert.match(perf, /actualChangePct|Target not met/);
    assert.match(perf, /1\.6\.1/);
    assert.doesNotMatch(inv, /100% compliant|official Green Office score achieved/i);
    assert.doesNotMatch(perf, /100% compliant/i);
    assert.match(undr, /MISSING/);
    assert.match(undr, /does NOT satisfy|ไม่ใช่หลักฐาน/);
    assert.match(undr, /dashboard\/ghg/);
    const gvm = readFileSync(GHG_VM, 'utf8');
    assert.match(gvm, /buildGhgInventory/);
    assert.match(gvm, /generatedMetricMap/);
    assert.match(gvm, /category1\/ghg\.json/);
  });

  it('GHG contract snapshot localizes target-met status for EN pages', () => {
    const ctx = readFileSync(CONTEXT, 'utf8');
    const snap = readFileSync(SNAPSHOT, 'utf8');
    const vm = readFileSync(VM, 'utf8');
    assert.match(vm, /resolveDomainFactValue/);
    assert.match(vm, /en: 'Not met'/);
    assert.match(ctx, /resolveDomainFactValue\(fact\.value, locale\)/);
    assert.match(snap, /resolveDomainFactValue\(fact\.value, locale\)/);
  });

  it('1.6 presentation is wired with PARTIAL plan honesty and project KPI truthfulness', () => {
    const trace = readFileSync(TRACE, 'utf8');
    assert.match(trace, /cat16Canonical/);
    const plan = readFileSync(PROJ_PLAN, 'utf8');
    const imp = readFileSync(PROJ_IMP, 'utf8');
    assert.match(plan, /Historical Baseline/);
    assert.match(plan, /PARTIAL/);
    assert.match(plan, /external-not-in-repo|ไม่พร้อมใน repo/);
    assert.match(plan, /data-cat16-gap-disclaimer/);
    assert.match(plan, /1\.7\.1/);
    assert.match(plan, /focus-visible:ring-2/);
    assert.match(imp, /Historical Baseline/);
    assert.match(imp, /buildProjectPortfolio/);
    assert.match(imp, /data-cat16-kpi-table/);
    assert.match(imp, /data-cat16-project=\{project\.id\}/);
    assert.match(imp, /1\.3\.3/);
    assert.match(imp, /ไม่มี kWh|no kWh/i);
    assert.match(imp, /data-cat16-gap-disclaimer/);
    assert.doesNotMatch(plan, /official Green Office score achieved/i);
    assert.doesNotMatch(imp, /ghg_measured|tCO2e reduction achieved/i);
    const pvm = readFileSync(PROJ_VM, 'utf8');
    assert.match(pvm, /buildReductionPlan/);
    assert.match(pvm, /buildProjectPortfolio/);
    assert.match(pvm, /category1\/projects\.json/);
    const projectsJson = readFileSync(join(ROOT, 'src/data/category1/projects.json'), 'utf8');
    assert.match(projectsJson, /97\.78/);
    assert.match(projectsJson, /91\.80/);
    assert.match(projectsJson, /88\.60/);
  });

  it('1.1 presentation is wired with scope, policy, targets, and shared plan journeys', () => {
    const trace = readFileSync(TRACE, 'utf8');
    assert.match(trace, /cat11Canonical/);
    assert.match(trace, /Cat1FoundationPresentation/);
    const scope = readFileSync(CAT11_SCOPE, 'utf8');
    const policy = readFileSync(CAT11_POLICY, 'utf8');
    const targets = readFileSync(CAT11_TARGETS, 'utf8');
    const plan = readFileSync(CAT11_PLAN, 'utf8');
    const fvm = readFileSync(CAT11_VM, 'utf8');
    assert.match(scope, /Historical Baseline/);
    assert.match(scope, /data-cat11-scope/);
    assert.match(scope, /scope\.totalSqm|buildScopeView/);
    assert.match(scope, /9873|scope\.totalSqm/);
    assert.match(scope, /focus-visible:ring-2/);
    assert.match(policy, /data-cat11-policy/);
    assert.match(policy, /NOT COMPLETED/);
    assert.match(policy, /buildPolicyCommitments/);
    assert.match(targets, /data-cat11-targets/);
    assert.match(targets, /−1% → −3%|-1% → -3%/);
    assert.match(targets, /metric famil/i);
    assert.match(plan, /data-cat11-plan/);
    assert.match(plan, /proj-plan-1/);
    assert.match(plan, /plannedVsActualSeparate|planTableStatus/);
    assert.match(fvm, /buildScopeView/);
    assert.match(fvm, /buildTargetBoard/);
    assert.match(fvm, /buildAnnualPlanView/);
    assert.match(fvm, /category1\/activities-aspects\.json/);
  });

  it('1.7 presentation is wired with quorum truthfulness and Meeting #2 gap honesty', () => {
    const trace = readFileSync(TRACE, 'utf8');
    assert.match(trace, /cat17Canonical/);
    const quorum = readFileSync(MR_QUORUM, 'utf8');
    const meeting = readFileSync(MR_MEETING, 'utf8');
    assert.match(quorum, /buildQuorum/);
    assert.match(quorum, /Historical Baseline/);
    assert.match(quorum, /quorum\.invitedCount/);
    assert.match(quorum, /quorum\.attendedCount/);
    assert.match(quorum, /quorum\.attendancePct/);
    assert.match(quorum, /quorum\.thresholdPct/);
    assert.match(quorum, /not_locally_verified/);
    assert.match(quorum, /data-cat17-meeting2-gap/);
    assert.match(quorum, /focus-visible:ring-2/);
    assert.doesNotMatch(quorum, /official Green Office score achieved/i);
    assert.match(meeting, /Historical Baseline/);
    assert.match(meeting, /data-cat17-decision-timeline/);
    assert.match(meeting, /data-cat17-coverage-matrix/);
    assert.match(meeting, /data-cat17-pdca-links/);
    assert.match(meeting, /data-cat17-meeting2-panel/);
    assert.match(meeting, /data-cat17-gaps-panel/);
    assert.match(meeting, /occurrence_supported/);
    assert.match(meeting, /buildDecisions|mr-decision-m1-08/);
    const mvm = readFileSync(MR_VM, 'utf8');
    assert.match(mvm, /−3%|-3%|paper target/i);
    assert.match(mvm, /buildQuorum/);
    assert.match(mvm, /buildDecisions/);
    assert.match(mvm, /category1\/management-review\.json/);
  });
});
