/** Category 1 presentation regression tests — structural honesty + source-safe rendering. */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');
const CAT_TH = 'src/pages/categories/[id].astro';
const CAT_EN = 'src/pages/en/categories/[id].astro';
const TRACE = 'src/components/indicators/IndicatorTraceabilityExperience.astro';
const CONTEXT = 'src/components/indicators/Cat1ContractContext.astro';
const GHG_INV = 'src/components/indicators/Cat1GhgInventoryJourney.astro';
const GHG_PERF = 'src/components/indicators/Cat1GhgPerformanceJourney.astro';
const GHG_VM = 'src/utils/category1-ghg-presentation.ts';
const PROJ_VM = 'src/utils/category1-projects-presentation.ts';
const PROJ_PLAN = 'src/components/indicators/Cat1ProjectsPlanJourney.astro';
const PROJ_IMP = 'src/components/indicators/Cat1ProjectsImprovementJourney.astro';

describe('Category 1 — structural parity and honesty', () => {
  it('TH/EN category pages gate the management experience to cat1', () => {
    for (const p of [CAT_TH,CAT_EN]) {
      const src=read(p); assert.match(src,/Cat1ManagementCycle/); assert.match(src,/Cat1DomainSnapshot/); assert.match(src,/category\.code === 'cat1'/);
    }
  });
  it('traceability wires all Category 1 journeys', () => {
    const src=read(TRACE);
    for (const token of ['Cat1ContractContext','Cat1LegalPresentation','Cat1GhgPresentation','Cat1ProjectsPresentation','Cat1ManagementReviewPresentation']) assert.match(src,new RegExp(token));
  });
  it('missing indicators remain explicitly unavailable', () => {
    const src=read(CONTEXT); assert.match(src,/MISSING_CAT1_INDICATORS/); assert.match(src,/data-cat1-missing-notice/);
  });
  it('presentation artifacts do not leak local filesystem paths', () => {
    for (const p of [GHG_INV,GHG_PERF,GHG_VM,PROJ_VM,PROJ_PLAN,PROJ_IMP]) {
      const src=read(p); assert.ok(!/F:\\/i.test(src),p); assert.ok(!/OneDrive - Maejo/i.test(src),p);
    }
  });
});

describe('Category 1 — GHG official/reporting presentation', () => {
  it('1.5.1 presents official annual values and workbook monthly reconciliation without derived-Dec fiction', () => {
    const inv=read(GHG_INV);
    assert.match(inv,/Historical Baseline/); assert.match(inv,/buildGhgInventory/); assert.match(inv,/data-cat15-monthly-table/);
    assert.match(inv,/1\.6GreenHouseGas2025\.xlsx/); assert.match(inv,/documents\/resources\/ghg/); assert.match(inv,/official|ทางการ/i);
    assert.doesNotMatch(inv,/Derived: annual|คำนวณจากผลรวม − Jan–Nov/);
    assert.doesNotMatch(inv,/13\.252/);
    assert.match(inv,/focus-visible:ring-2/);
  });

  it('1.5.2 renders a pending FY2567 comparison rather than a stale +4.82% verdict', () => {
    const perf=read(GHG_PERF);
    assert.match(perf,/FY2567 basis pending|รอตรวจสอบฐาน FY2567/);
    assert.match(perf,/no met\/not-met verdict|ไม่ตัดสินว่าบรรลุหรือไม่บรรลุ/);
    assert.doesNotMatch(perf,/Target not met|ไม่บรรลุเป้าหมาย/);
    assert.doesNotMatch(perf,/\+4\.82%|\+4\.81%/);
    assert.match(perf,/1\.5\.1/); assert.match(perf,/1\.6\.1/);
  });

  it('GHG view-model supports official per-capita and nullable performance', () => {
    const vm=read(GHG_VM);
    assert.match(vm,/perCapitaTCO2e/); assert.match(vm,/perCapitaKgApproximate/); assert.match(vm,/actualChangePct: number \| null/); assert.match(vm,/pending-verification/);
    assert.match(vm,/generatedMetricMap/); assert.doesNotMatch(vm,/derived-dec/);
  });
});

describe('Category 1 — project linkage does not invent a GHG gap', () => {
  it('project view-model is null-safe when FY2567 comparison is pending', () => {
    const vm=read(PROJ_VM); assert.match(vm,/actualChangePct: number \| null/); assert.match(vm,/ฐานเปรียบเทียบ GHG FY2567 ยังรอตรวจสอบ/); assert.match(vm,/actualChangePct === null/);
  });
  it('1.6.1 and 1.6.2 display pending comparison rather than hard-coded not-met/+4.81%', () => {
    for (const p of [PROJ_PLAN,PROJ_IMP]) {
      const src=read(p); assert.match(src,/pending-verification/); assert.match(src,/รอตรวจสอบฐาน FY2567|FY2567 basis pending/); assert.doesNotMatch(src,/\+4\.81%|\+4\.82%/); assert.match(src,/data-cat16-gap-disclaimer/);
    }
  });
});
