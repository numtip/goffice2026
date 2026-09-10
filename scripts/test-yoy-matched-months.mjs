/** Regression guard for the matched-month YoY contract (PO 2026-09-10). */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MATCHED_YOY_BASIS, computeMatchedYoy, emptyMatchedYoy, isMatchedYoy, recomputeMatchedYoyForMetric } from '../scripts/lib/matched-yoy.mjs';
import { computePartialYoy } from '../src/utils/dashboard-partial-yoy.ts';
import { computeYoy } from '../src/utils/multi-year-schema.ts';
import { formatYoyCoverage, formatYoyReason, formatYoyTrend, isYoyComparable, yoyPercentOf } from '../src/utils/yoy-display.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const GENERATED_DIR = join(ROOT, 'src', 'data', 'generated');
const METRICS = ['energy','water','fuel','paper','waste','ghg','recycling_rate'];
const readMetric = (name) => JSON.parse(readFileSync(join(GENERATED_DIR, `${name}.json`), 'utf8'));
const FROZEN_PERCENT = { energy:10.5, water:17.8, fuel:16.6, paper:-2.7, waste:15.6, ghg:7.7, recycling_rate:null };
const FORBIDDEN_PARTIAL_VS_FULL = { energy:[-25], water:[-26], fuel:[17], paper:[-42,-14.2], waste:[-20,-31], ghg:[-37], recycling_rate:[0,-100] };

const eligibleMonthMap = (yearData) => {
  const map = new Map();
  for (const m of yearData?.months ?? []) if (m.analyticsEligible !== false) map.set(m.month, m.value);
  return map;
};

function independentMatchedYoy(metric) {
  const b = eligibleMonthMap(metric.years[String(metric.baselineYear)]);
  const c = eligibleMonthMap(metric.years[String(metric.currentYear)]);
  const months = []; let bSum = 0; let cSum = 0;
  for (let m=1; m<=12; m++) if (b.has(m) && c.has(m)) { months.push(m); bSum += b.get(m); cSum += c.get(m); }
  const aggregation = metric.years[String(metric.currentYear)]?.aggregation ?? metric.years[String(metric.baselineYear)]?.aggregation;
  if (aggregation === 'average' && months.length) { bSum /= months.length; cSum /= months.length; }
  const bRounded = months.length ? Math.round((bSum + Number.EPSILON) * 100) / 100 : null;
  const cRounded = months.length ? Math.round((cSum + Number.EPSILON) * 100) / 100 : null;
  const percent = bRounded !== null && cRounded !== null && bRounded !== 0 ? Math.round((((cRounded-bRounded)/bRounded)*100 + Number.EPSILON)*10)/10 : null;
  return { months, bSum:bRounded, cSum:cRounded, percent };
}

describe('matched-month YoY — generated metrics', () => {
  for (const id of METRICS) {
    const metric = readMetric(id);
    it(`${id}: stored window uses only analytically eligible month intersection`, () => {
      const yoy = metric.yoyChange; const expected = independentMatchedYoy(metric);
      assert.equal(yoy.basis, MATCHED_YOY_BASIS); assert.ok(isMatchedYoy(yoy));
      assert.deepEqual(yoy.months, expected.months); assert.equal(yoy.count, expected.months.length);
      assert.equal(yoy.baselineMonths, eligibleMonthMap(metric.years[String(metric.baselineYear)]).size);
      assert.equal(yoy.currentMonths, eligibleMonthMap(metric.years[String(metric.currentYear)]).size);
      assert.equal(yoy.percent, FROZEN_PERCENT[id]); assert.equal(yoy.percent, expected.percent);
      for (const legacy of FORBIDDEN_PARTIAL_VS_FULL[id] ?? []) assert.notEqual(yoy.percent, legacy, `${id} legacy value ${legacy}% forbidden`);
    });

    it(`${id}: JS writer, dashboard overlap and TS mirror agree`, () => {
      const yoy = metric.yoyChange;
      const overlap = computePartialYoy(metric, { id });
      assert.equal(overlap.percent, yoy.percent); assert.deepEqual(overlap.comparableMonths, yoy.months); assert.equal(overlap.comparableCount, yoy.count);
      const mirror = computeYoy(metric.years[String(metric.baselineYear)], metric.years[String(metric.currentYear)], { baselineYear:metric.baselineYear, currentYear:metric.currentYear });
      assert.deepEqual(mirror, yoy);
      assert.deepEqual(recomputeMatchedYoyForMetric(metric), yoy);
    });
  }
});

describe('paper Aug 2569 analytical hold', () => {
  it('raw Aug remains visible but cannot enter the comparison while owner verification is required', () => {
    const paper = readMetric('paper'); const aug = paper.years['2569'].months.find((m) => m.month === 8);
    assert.equal(aug.value, 30.4); assert.equal(aug.analyticsEligible, false); assert.equal(aug.analyticsExclusionCode, 'DQ-PAPER-2569-AUG-LOW');
    assert.deepEqual(paper.yoyChange.months, [1,2,3,4,5,6,7]); assert.equal(paper.yoyChange.percent, -2.7);
    const overlap = computePartialYoy(paper, { id:'paper' });
    assert.equal(overlap.currentSeries[7], 30.4, 'raw chart series keeps August visible');
    assert.equal(overlap.points[7].comparable, false, 'August is not analytical comparison data');
  });

  it('generic analyticsEligible=false is honored by computeMatchedYoy', () => {
    const yoy = computeMatchedYoy(
      { months:[{month:1,value:100},{month:2,value:100}] },
      { months:[{month:1,value:90},{month:2,value:1,analyticsEligible:false}] },
      { baselineYear:2568,currentYear:2569 },
    );
    assert.deepEqual(yoy.months,[1]); assert.equal(yoy.currentMonths,1); assert.equal(yoy.baselineMatched,100); assert.equal(yoy.currentMatched,90); assert.equal(yoy.percent,-10);
  });
});

describe('invalid matched windows', () => {
  it('no overlap renders null + reason, never 0', () => {
    const yoy = computeMatchedYoy({months:[{month:1,value:10}]},{months:[{month:7,value:30}]},{baselineYear:2568,currentYear:2569});
    assert.equal(yoy.valid,false); assert.equal(yoy.reason,'no-overlapping-months'); assert.equal(yoy.percent,null); assert.equal(yoy.absolute,null); assert.equal(yoy.direction,null);
    assert.equal(formatYoyTrend(yoy),'—'); assert.equal(yoyPercentOf(yoy),null); assert.equal(isYoyComparable(yoy),false); assert.match(formatYoyReason(yoy,'th'),/เทียบไม่ได้/);
  });
  it('zero baseline keeps absolute but percent/direction null', () => {
    const yoy=computeMatchedYoy({months:[{month:1,value:0}]},{months:[{month:1,value:5}]},{baselineYear:2568,currentYear:2569});
    assert.equal(yoy.reason,'baseline-zero'); assert.equal(yoy.absolute,5); assert.equal(yoy.percent,null); assert.equal(yoy.direction,null);
  });
  it('empty current year is null-safe', () => {
    const yoy=emptyMatchedYoy({baselineYear:2568,currentYear:2569,baselineCount:12});
    assert.equal(yoy.reason,'current-missing'); assert.equal(formatYoyTrend(yoy),'—'); assert.match(formatYoyReason(yoy,'en'),/No analytically eligible current-year data/);
  });
});

describe('localized coverage', () => {
  it('GHG names Jan-Jul and analytical month counts', () => {
    const ghg=readMetric('ghg'); const th=formatYoyCoverage(ghg.yoyChange,'th'); const en=formatYoyCoverage(ghg.yoyChange,'en');
    assert.match(th,/ม\.ค\.–ก\.ค\./); assert.match(th,/ใช้วิเคราะห์ปี 2569 7\/12 เดือน/); assert.match(en,/Matched months Jan–Jul/); assert.match(en,/uses 7\/12 analytically eligible months/);
  });
  it('paper coverage states Jan-Jul analytics despite 8 raw observations', () => {
    const paper=readMetric('paper'); const th=formatYoyCoverage(paper.yoyChange,'th'); const en=formatYoyCoverage(paper.yoyChange,'en');
    assert.match(th,/ม\.ค\.–ก\.ค\./); assert.match(th,/7\/12 เดือน/); assert.match(en,/Jan–Jul/); assert.match(en,/7\/12 analytically eligible months/);
  });
});
