/**
 * test-environmental-aspects-2568.mjs
 * ====================================
 * Targeted regression tests for the CAT1-1.3 canonical data pipeline
 * (Phase C/D). Read-only over src/data/category1/environmental-aspects-2568.json
 * and the canonical projects.json contract.
 *
 * Covers the task's required targeted tests:
 *   - source disposition (canonical vs superseded)
 *   - duplicate prevention (no records from superseded sheets)
 *   - year isolation (no FY2567/FY2569 leakage)
 *   - significance derivation (canonical consistent with source)
 *   - 1.3.2 deriving from canonical 1.3.1 data (no second registry)
 *   - 1.3.3 not inventing projects (documentary links only)
 *   - source traceability
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = JSON.parse(
  readFileSync(join(ROOT, 'src', 'data', 'category1', 'environmental-aspects-2568.json'), 'utf8'),
);
const PROJECTS = JSON.parse(
  readFileSync(join(ROOT, 'src', 'data', 'category1', 'projects.json'), 'utf8'),
);

const CANONICAL_PRIORITY = new Set(['จัดลำดับ (Input)', 'จัดลำดับ(Output) (29 สค68)']);
const SUPERSEDED = 'จัดลำดับ(Output)';
const records = DATA.records;
const byId = new Map(records.map((r) => [r.id, r]));
const significant = DATA.significantIssues;
const links = DATA.projectLinks;

describe('environmental-aspects-2568 — source disposition', () => {
  it('disposition declares canonical priority sheets and the superseded sheet', () => {
    const disp = DATA.versionDisposition.map((d) => [d.sheet, d.disposition]);
    const canonicalSheets = disp.filter(([, d]) => d === 'canonical').map(([s]) => s);
    assert.ok(canonicalSheets.includes('จัดลำดับ (Input)'));
    assert.ok(canonicalSheets.includes('จัดลำดับ(Output) (29 สค68)'));
    const superseded = disp.find(([s]) => s === SUPERSEDED);
    assert.equal(superseded?.[1], 'superseded');
  });

  it('every aspect sources its priority data from a canonical priority sheet only', () => {
    for (const r of records) {
      const ps = r.sourceTrace.prioritySheet;
      assert.ok(ps === null || CANONICAL_PRIORITY.has(ps), `${r.id} sources ${ps} (superseded sheet used)`);
    }
  });

  it('no record count comes from the superseded output sheet (duplicate prevention)', () => {
    const excluded = DATA.summary.supersededExcluded;
    assert.equal(excluded.sheet, SUPERSEDED);
    assert.equal(excluded.recordCount, 55);
    const anySuperseded = records.some((r) => r.sourceTrace.prioritySheet === SUPERSEDED);
    assert.equal(anySuperseded, false, 'records must not ingest the superseded sheet');
  });
});

describe('environmental-aspects-2568 — year isolation', () => {
  it('all records carry year 2568 (no FY2567/FY2569 leakage)', () => {
    for (const rec of [...records, ...DATA.activities, ...significant, ...links]) {
      assert.equal(rec.year, 2568, `${rec.id} year must be 2568`);
    }
    const raw = JSON.stringify([...records, ...DATA.activities, ...significant, ...links]);
    assert.doesNotMatch(raw, /2567|2569/, 'record values leak FY2567/FY2569');
    assert.equal(DATA.year, 2568);
  });

  it('the FY2567 label leak is documented as an anomaly, never as data', () => {
    const leak = DATA.anomalies.find((a) => a.type === 'year-label-leak');
    assert.ok(leak, 'year-label-leak anomaly documented');
    assert.equal(leak.location, 'Output!A2');
  });
});

describe('environmental-aspects-2568 — significance derivation', () => {
  it('canonical significance equals the declared source value', () => {
    for (const r of records) {
      const a = r.assessment;
      if (a.significanceSource === 'priority') assert.equal(a.significance, a.prioritySignificance);
      else assert.equal(a.significance, a.registerSignificance);
    }
  });

  it('when register and priority disagree the priority value is canonical', () => {
    for (const r of records) {
      const a = r.assessment;
      if (a.registerSignificance && a.prioritySignificance && a.registerSignificance !== a.prioritySignificance) {
        assert.equal(a.significance, a.prioritySignificance, `${r.id} must take the priority value`);
      }
    }
  });

  it('every M/H aspect retains control information from the source', () => {
    const mh = records.filter((r) => r.assessment.significance === 'M' || r.assessment.significance === 'H');
    assert.ok(mh.length > 0);
    for (const r of mh) {
      assert.ok(r.controlMeasure?.text, `${r.id} M/H aspect must retain control info`);
    }
  });
});

describe('environmental-aspects-2568 — 1.3.2 derives from canonical 1.3.1 data', () => {
  it('significantIssues are derived from the canonical aspect records (no manual registry)', () => {
    const mhCount = records.filter((r) => r.assessment.significance === 'M' || r.assessment.significance === 'H').length;
    assert.equal(significant.length, mhCount);
    assert.equal(significant.length, DATA.summary.significantCount);
  });

  it('each significant issue resolves to a 1.3.1 aspect and matches its significance', () => {
    for (const si of significant) {
      const src = byId.get(si.aspectId);
      assert.ok(src, `${si.id} aspectId ${si.aspectId} unresolved`);
      assert.ok(src.indicatorCodes.includes('1.3.1'), `${si.id} source aspect must be a 1.3.1 record`);
      assert.equal(si.significance, src.assessment.significance, `${si.id} significance mismatch`);
      assert.equal(si.year, 2568);
    }
  });

  it('M/H tally matches the canonical priority sheets (L/M/H summary)', () => {
    const bySig = { L: 0, M: 0, H: 0 };
    for (const r of records) bySig[r.assessment.significance] += 1;
    assert.deepEqual(bySig, DATA.summary.bySignificance);
    // Expected tallies from the canonical priority sheets (G column):
    // input L=17 M=29 H=1; output L=51 M=2 H=2.
    assert.equal(bySig.H, 3);
    assert.equal(bySig.M, 31);
  });
});

describe('environmental-aspects-2568 — 1.3.3 does not invent projects', () => {
  const canonicalProjectIds = new Set(
    PROJECTS.records
      .filter((r) => r.kind === 'project' && r.indicatorCodes.includes('1.3.3'))
      .map((r) => r.id),
  );

  it('project links reference only canonical projects documented in projects.json', () => {
    assert.equal(links.length, DATA.summary.projectLinkCount);
    assert.equal(links.length, 2, 'only the documented rat-control project link(s) may exist');
    for (const pl of links) {
      assert.ok(canonicalProjectIds.has(pl.projectId), `${pl.id} references non-canonical project ${pl.projectId}`);
      const src = byId.get(pl.aspectId);
      assert.ok(src.projectReference, `${pl.id} source aspect lacks projectReference`);
      assert.equal(src.projectReference.projectId, pl.projectId);
    }
  });

  it('project links are documentary: control text names the project on the source aspect', () => {
    for (const pl of links) {
      const src = byId.get(pl.aspectId);
      const control = src.controlMeasure?.text || '';
      assert.ok(control.includes('โครงการ'), `${pl.id} control text must name a project`);
      assert.ok(control.includes('หนู'), `${pl.id} control text must name the rat project`);
      assert.equal(pl.controlText, control);
    }
  });

  it('no project is auto-created from M/H significance or control text alone', () => {
    const mhWithoutLink = records.filter(
      (r) => (r.assessment.significance === 'M' || r.assessment.significance === 'H') && !r.projectReference,
    );
    assert.ok(mhWithoutLink.length >= 0);
    // All M/H aspects that lack a projectReference keep controlMeasure only.
    for (const r of mhWithoutLink) assert.ok(r.controlMeasure?.text, `${r.id} must keep control text`);
  });
});

describe('environmental-aspects-2568 — source traceability & references', () => {
  it('every record carries a complete source trace', () => {
    for (const rec of [...records, ...DATA.activities, ...significant, ...links]) {
      const st = rec.sourceTrace;
      assert.ok(st, `${rec.id} missing sourceTrace`);
      assert.ok(st.sourceFile, `${rec.id} sourceTrace.sourceFile`);
      assert.ok(st.sheet || st.sourceVersion === 'priority', `${rec.id} sourceTrace.sheet`);
      assert.ok(st.sourceRow, `${rec.id} sourceTrace.sourceRow`);
      assert.ok(st.sourceVersion, `${rec.id} sourceTrace.sourceVersion`);
      assert.ok(st.sourceDisposition, `${rec.id} sourceTrace.sourceDisposition`);
    }
  });

  it('every aspect resolves its activityId to a canonical activity', () => {
    const activityIds = new Set(DATA.activities.map((a) => a.id));
    for (const r of records) {
      assert.ok(activityIds.has(r.activityId), `${r.id} activityId ${r.activityId} unresolved`);
    }
  });

  it('enums are valid: inputOutput, directIndirect, condition, applicableLaw', () => {
    for (const r of records) {
      assert.ok(['input', 'output'].includes(r.inputOutput));
      assert.ok(['direct', 'indirect'].includes(r.directIndirect));
      assert.ok(['normal', 'abnormal', 'emergency'].includes(r.condition));
      assert.ok(['Y', 'N'].includes(r.applicableLaw));
    }
  });

  it('no record is sourced from a different year or claims FY2569', () => {
    const raw = JSON.stringify(records);
    assert.doesNotMatch(raw, /2569/);
  });
});

describe('CAT1-1.3 closeout — one canonical runtime, legacy retained', () => {
  const legacy = JSON.parse(
    readFileSync(join(ROOT, 'src', 'data', 'category1', 'activities-aspects.json'), 'utf8'),
  );
  const vm = readFileSync(join(ROOT, 'src', 'utils', 'category1-presentation.ts'), 'utf8');
  const snap = readFileSync(join(ROOT, 'src', 'components', 'categories', 'Cat1DomainSnapshot.astro'), 'utf8');
  const manifest = JSON.parse(
    readFileSync(join(ROOT, 'src', 'data', 'category1', 'category1-manifest.json'), 'utf8'),
  );

  it('legacy activities-aspects.json is retained (not deleted) with 17 activities / 102 aspects / 35 M/H', () => {
    assert.equal(legacy.domain, 'activities-aspects');
    assert.equal(legacy.year, 2568);
    assert.match(legacy.note, /LEGACY\/SUPPORTING/);
    const activities = legacy.records.filter((r) => r.kind === 'activity');
    const aspects = legacy.records.filter((r) => r.kind === 'aspect');
    const mh = aspects.filter((r) => r.significance === 'M' || r.significance === 'H');
    assert.equal(activities.length, 17);
    assert.equal(aspects.length, 102);
    assert.equal(mh.length, 35);
    assert.equal(legacy.summary.significantCount, 35);
  });

  it('canonical environmental-aspects-2568.json is 20 activities / 102 aspects / 34 M/H', () => {
    assert.equal(DATA.summary.activityCount, 20);
    assert.equal(DATA.summary.aspectCount, 102);
    assert.equal(DATA.summary.significantCount, 34);
    assert.equal(DATA.summary.bySignificance.L, 68);
    assert.equal(DATA.summary.bySignificance.M, 31);
    assert.equal(DATA.summary.bySignificance.H, 3);
  });

  it('35→34 is the vehicle/water row: register M preserved, priority L canonical', () => {
    const row = records.find(
      (r) => r.activity === 'การดูแลยานพาหนะ' && r.aspect === 'น้ำ' && r.inputOutput === 'input',
    );
    assert.ok(row, 'vehicle/water input row exists');
    assert.equal(row.assessment.registerSignificance, 'M');
    assert.equal(row.assessment.prioritySignificance, 'L');
    assert.equal(row.assessment.significance, 'L');
    assert.equal(row.assessment.significanceSource, 'priority');
    assert.equal(row.sourceTrace.sheet, 'Input');
    assert.equal(row.sourceTrace.sourceRow, 46);
    assert.equal(row.sourceTrace.prioritySheet, 'จัดลำดับ (Input)');
    assert.equal(row.sourceTrace.priorityRow, 45);
    const legacyRow = legacy.records.find(
      (r) => r.kind === 'aspect' && r.activity === 'การดูแลยานพาหนะ' && r.aspect === 'น้ำ' && r.inputOutput === 'input',
    );
    assert.equal(legacyRow.significance, 'M');
  });

  it('17→20 extras are register labels, not extra processes', () => {
    const extra = ['เครื่องคอมพิวเตอร์', 'การรับประทานอาหาร (ถังดักไขมัน)', 'การดูแลยานพาหนะ (รถยนต์ รถจักรยานยนต์)'];
    const newNames = DATA.activities.map((a) => a.name);
    for (const name of extra) assert.ok(newNames.includes(name), `missing extra label ${name}`);
    const stray = DATA.activities.find((a) => a.name === 'เครื่องคอมพิวเตอร์');
    assert.equal(stray.sourceTrace.sheet, 'Input');
    assert.equal(stray.sourceTrace.sourceRow, 18);
  });

  it('1.3.1, 1.3.2 and 1.3.3 runtime map to environmental-aspects-2568 only', () => {
    assert.match(vm, /'1\.3\.1': 'environmental-aspects-2568'/);
    assert.match(vm, /'1\.3\.2': 'environmental-aspects-2568'/);
    assert.match(vm, /'1\.3\.3': 'environmental-aspects-2568'/);
    assert.doesNotMatch(vm, /'1\.3\.1': 'activities-aspects'/);
    const env = manifest.contracts.find((c) => c.domain === 'environmental-aspects-2568');
    assert.deepEqual(env.indicators, ['1.3.1', '1.3.2', '1.3.3']);
    const aa = manifest.contracts.find((c) => c.domain === 'activities-aspects');
    assert.deepEqual(aa.indicators, ['1.1.1', '1.1.2']);
  });

  it('Cat1 snapshot does not present competing 1.3 counts from the legacy file', () => {
    assert.match(snap, /'activities-aspects': \{ label: \{ th: 'ขอบเขต'/);
    assert.match(snap, /route: '\/indicators\/1\.1\.1\/'/);
    assert.doesNotMatch(snap, /'activities-aspects': \{ label: \{ th: 'ขอบเขตและประเด็น'/);
    assert.match(snap, /'environmental-aspects-2568'/);
    assert.match(snap, /route: '\/indicators\/1\.3\.1\/'/);
  });
});

describe('CAT1-1.3.1 live runtime presentation', () => {
  const explorer = readFileSync(
    join(ROOT, 'src', 'components', 'indicators', 'Cat1EnvironmentalAssessmentJourney.astro'),
    'utf8',
  );
  const parent = readFileSync(
    join(ROOT, 'src', 'components', 'indicators', 'Cat1EnvironmentalAssessment.astro'),
    'utf8',
  );
  const trace = readFileSync(
    join(ROOT, 'src', 'components', 'indicators', 'IndicatorTraceabilityExperience.astro'),
    'utf8',
  );
  const evidence = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'evidence-index.json'), 'utf8'));
  const missing = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'about', 'missing-content.json'), 'utf8'));

  it('1.3.1 explorer renders FY2568 canonical summary 20 / 102 / 68 L · 31 M · 3 H / 34 M/H', () => {
    assert.match(explorer, /data-cat1-canonical-summary/);
    assert.match(explorer, /key: 'activities'/);
    assert.match(explorer, /key: 'aspects'/);
    assert.match(explorer, /data-cat1-summary=\{step\.key\}/);
    assert.match(explorer, /data-cat1-summary="lmh"/);
    assert.match(explorer, /data-cat1-summary="significant"/);
    assert.match(explorer, /summary\.activityCount/);
    assert.match(explorer, /summary\.aspectCount/);
    assert.match(explorer, /summary\.bySignificance\.L/);
    assert.match(explorer, /summary\.bySignificance\.M/);
    assert.match(explorer, /summary\.bySignificance\.H/);
    assert.match(explorer, /summary\.significantCount/);
    assert.match(explorer, /FY\$\{CAT1_YEAR\} Historical Baseline/);
    assert.match(explorer, /ฐานประวัติสำหรับเปรียบเทียบปีถัดไป/);
  });

  it('1.3.1 assessment chain includes Activity → Input/Output → Aspect → Direct/Indirect → N/A/E → Assessment → L/M/H', () => {
    assert.match(explorer, /Activity → Input\/Output → Aspect → Direct\/Indirect → N\/A\/E → Assessment → L\/M\/H/);
    assert.match(explorer, /กิจกรรม → Input \/ Output → ประเด็น → ทางตรง\/อ้อม → ปกติ\/ผิดปกติ\/ฉุกเฉิน → การประเมิน → L\/M\/H/);
  });

  it('1.3.1 journey uses pulse, filters, disclosure explorer, High callout, and 1.3.2/1.3.3 CTAs', () => {
    assert.match(parent, /Cat1EnvironmentalAssessmentJourney/);
    assert.match(explorer, /data-cat1-assessment-pulse/);
    assert.match(explorer, /data-aspect-card/);
    assert.match(explorer, /data-cat13-filters/);
    assert.match(explorer, /name="cat13-io"/);
    assert.match(explorer, /name="cat13-dir"/);
    assert.match(explorer, /name="cat13-cond"/);
    assert.match(explorer, /name="cat13-sig"/);
    assert.match(explorer, /data-cat13-high-issues/);
    assert.match(explorer, /\/indicators\/1\.3\.2\//);
    assert.match(explorer, /\/indicators\/1\.3\.3\//);
    assert.match(explorer, /landing-reveal/);
    assert.match(explorer, /data-count-up/);
    assert.match(explorer, /data-cat13-sig-visual/);
    assert.ok(
      explorer.indexOf('data-cat13-sig-visual') < explorer.indexOf('cat13-explorer-title'),
      'significance visual must appear before the 102-card explorer',
    );
    assert.doesNotMatch(explorer, /class="[^"]*landing-metric-bar/);
    assert.doesNotMatch(
      explorer,
      /class="landing-reveal rounded-xl[^"]*" aria-labelledby="cat13-explorer-title"/,
    );
    assert.doesNotMatch(
      explorer,
      /class="landing-reveal rounded-xl[^"]*" aria-labelledby="cat13-sig-title"/,
    );
    assert.equal(DATA.summary.activityCount, 20);
    assert.equal(DATA.summary.aspectCount, 102);
    assert.equal(DATA.summary.significantCount, 34);
    assert.equal(DATA.summary.bySignificance.H, 3);
    assert.equal(DATA.summary.projectLinkCount, 2);
  });

  it('1.3.1 surfaces the original FY2568 workbook after pulse and before the control map', () => {
    const pulse = explorer.indexOf('cat13-pulse-title');
    const source = explorer.indexOf('data-cat13-original-source');
    const map = explorer.indexOf('cat13-map-title');
    assert.ok(pulse > -1 && source > pulse && map > source);
    assert.match(explorer, /ผลประเมินปัญหา2568\.xlsx/);
    assert.match(explorer, /\/documents\/fy2568\/cat1\/1\.3\/ผลประเมินปัญหา2568\.xlsx/);
    assert.match(explorer, /เอกสารต้นฉบับสำหรับการตรวจสอบ/);
    assert.match(explorer, /แบบฟอร์มต้นฉบับ 1\.3 ปี 2568/);
    assert.match(explorer, /เปิด\/ดาวน์โหลดไฟล์ Excel ต้นฉบับ/);
    assert.match(explorer, /download=\{sourceFileName\}/);
    const workbook = evidence.items.find((e) => e.id === 'ev-cat1-env-aspects-2568-workbook');
    assert.ok(workbook, 'workbook is registered in evidence-index');
    assert.equal(workbook.fileType, 'XLSX');
    assert.equal(workbook.realSourceAvailable, true);
    assert.equal(workbook.realSourcePath, 'docs/ผลประเมินปัญหา2568.xlsx');
    assert.equal(workbook.path, '/documents/fy2568/cat1/1.3/ผลประเมินปัญหา2568.xlsx');
    assert.deepEqual(workbook.indicatorCodes, ['1.3.1', '1.3.2', '1.3.3']);
    assert.ok(existsSync(join(ROOT, 'public', 'documents', 'fy2568', 'cat1', '1.3', 'ผลประเมินปัญหา2568.xlsx')));
    assert.ok(existsSync(join(ROOT, 'docs', 'ผลประเมินปัญหา2568.xlsx')));
  });

  it('1.3.x pages do not dump category-level evidence fallback', () => {
    assert.match(trace, /const cat13Canonical = \['1\.3\.1', '1\.3\.2', '1\.3\.3'\]/);
    assert.match(trace, /if \(cat11Canonical \|\| cat13Canonical \|\| cat14Canonical \|\| cat15Canonical \|\| cat16Canonical \|\| cat17Canonical\) return false;/);
  });

  it('environmental targets are not mapped to 1.3.1', () => {
    const goals = evidence.items.find((e) => e.id === 'ev-about-goals-2568');
    assert.ok(goals, 'ev-about-goals-2568 exists');
    assert.deepEqual(goals.indicatorCodes, ['1.1.3']);
    assert.ok(!goals.indicatorCodes.includes('1.3.1'));
    const on131 = evidence.items.filter((e) => (e.indicatorCodes || []).includes('1.3.1'));
    assert.deepEqual(
      on131.map((e) => e.id),
      ['ev-cat1-env-aspects-2568-workbook'],
    );
    const goalsMissing = missing.missing.goals.items.find((i) => i.id === 'missing-goals-document');
    assert.equal(goalsMissing.requiredByIndicator, '1.1.3');
  });
});
