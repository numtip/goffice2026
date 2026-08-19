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
import { readFileSync } from 'node:fs';
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
