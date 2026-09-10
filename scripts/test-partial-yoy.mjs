/** GO-DASH-V2 Phase C — overlap YoY contracts. */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { computePartialYoy, formatNullableCell } from '../src/utils/dashboard-partial-yoy.ts';
import { buildPartialYoyOption, monthLabel } from '../src/utils/chart-option.ts';

const GENERATED_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'generated');
const readMetric = (name) => JSON.parse(readFileSync(join(GENERATED_DIR, `${name}.json`), 'utf8'));

describe('computePartialYoy — energy partial Jan–Aug', () => {
  const metric=readMetric('energy'); const result=computePartialYoy(metric,{id:'energy'});
  it('status is partial with comparable months 1–8',()=>{assert.equal(result.status,'partial');assert.deepEqual(result.comparableMonths,[1,2,3,4,5,6,7,8]);assert.equal(result.comparableCount,8);});
  it('uses matched months, never partial-vs-full',()=>{assert.equal(metric.yoyChange.percent,10.5);assert.notEqual(metric.yoyChange.percent,-25);assert.equal(metric.yoyChange.percent,result.percent);assert.equal(result.direction,'up');});
  it('Sep–Dec raw current series are null',()=>{for(let i=8;i<12;i++)assert.equal(result.currentSeries[i],null);for(let i=0;i<8;i++)assert.equal(typeof result.currentSeries[i],'number');});
  it('result never copies a yoyChange property',()=>assert.ok(!('yoyChange' in result)));
});

describe('computePartialYoy — water/fuel/paper/waste/ghg/recycling', () => {
  it('water partial Jan–Aug +17.8%',()=>{const m=readMetric('water');const r=computePartialYoy(m,{id:'water'});assert.equal(r.comparableCount,8);assert.equal(r.percent,17.8);assert.notEqual(r.percent,-26);});
  it('fuel partial Jan–Jul',()=>{const r=computePartialYoy(readMetric('fuel'),{id:'fuel'});assert.equal(r.comparableCount,7);assert.notEqual(r.percent,null);});
  it('paper keeps raw Aug visible but compares verified Jan–Jul only',()=>{
    const m=readMetric('paper');const r=computePartialYoy(m,{id:'paper'});
    assert.equal(r.status,'partial');assert.deepEqual(r.comparableMonths,[1,2,3,4,5,6,7]);assert.equal(r.comparableCount,7);
    assert.equal(m.yoyChange.percent,-2.7);assert.notEqual(m.yoyChange.percent,-42);assert.notEqual(m.yoyChange.percent,-14.2);assert.equal(r.percent,-2.7);assert.equal(r.direction,'down');
    assert.equal(r.currentSeries[7],30.4,'raw Aug remains visible');assert.equal(r.points[7].comparable,false,'flagged Aug excluded from analytics');
  });
  it('waste partial Jan–Aug +15.6%',()=>{const r=computePartialYoy(readMetric('waste'),{id:'waste'});assert.equal(r.comparableCount,8);assert.equal(r.percent,15.6);assert.equal(r.direction,'up');});
  it('ghg partial Jan–Jul +7.7%',()=>{const m=readMetric('ghg');const r=computePartialYoy(m,{id:'ghg'});assert.deepEqual(r.comparableMonths,[1,2,3,4,5,6,7]);assert.equal(r.percent,7.7);assert.notEqual(r.percent,-37);assert.ok(Math.abs(r.baselineOverlapTotal-134.408)<0.01);assert.ok(Math.abs(r.currentOverlapTotal-144.803)<0.001);});
  it('recycling pending renders em dash',()=>{const r=computePartialYoy(readMetric('recycling_rate'),{id:'recycling_rate'});assert.equal(r.status,'pending');assert.equal(r.percent,null);assert.ok(r.currentSeries.every((v)=>v===null));assert.equal(formatNullableCell(r.percent),'—');});
});

describe('buildPartialYoyOption — JSON + null continuity + locale', () => {
  it('energy EN option serializes and never connects nulls',()=>{
    const result=computePartialYoy(readMetric('energy'),{id:'energy'});const option=buildPartialYoyOption({result,locale:'en',label:{baseline:'FY2568',current:'FY2569'},colors:{baseline:'#94a3b8',current:'#059669'},ariaDescription:'Energy overlap YoY'});
    const parsed=JSON.parse(JSON.stringify(option));assert.deepEqual(parsed.xAxis.data,['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']);assert.equal(parsed.series.length,2);for(const s of parsed.series)assert.equal(s.connectNulls,false);assert.equal(parsed.series[1].data.filter((v)=>v===null).length,4);
  });
  it('TH labels are correct',()=>{assert.equal(monthLabel(1,'th'),'ม.ค.');assert.equal(monthLabel(7,'th'),'ก.ค.');assert.equal(monthLabel(12,'th'),'ธ.ค.');});
  it('pending still returns a serializable null current series',()=>{const r=computePartialYoy(readMetric('recycling_rate'),{id:'recycling_rate'});const o=buildPartialYoyOption({result:r,locale:'en',label:{baseline:'FY2568',current:'FY2569'},colors:{baseline:'#94a3b8',current:'#d97706'},ariaDescription:'Recycling rate pending'});assert.equal(o.series[1].data.every((v)=>v===null),true);assert.doesNotThrow(()=>JSON.stringify(o));});
});

describe('raw series vs analytical eligibility', () => {
  it('missing months stay null and present zero stays zero',()=>{
    const metric=readMetric('energy');const result=computePartialYoy(metric,{id:'energy'});assert.equal(result.currentSeries.includes(0),false);assert.equal(result.points.find((p)=>p.month===9).current,null);
    const synthetic=structuredClone(metric);synthetic.years['2569'].months=[...synthetic.years['2569'].months.filter((m)=>m.month!==1),{month:1,value:0,label:'Jan'}].sort((a,b)=>a.month-b.month);const sr=computePartialYoy(synthetic,{id:'energy'});assert.equal(sr.currentSeries[0],0);
  });
  it('analyticsEligible=false affects comparisons but not raw chart series',()=>{
    const synthetic=structuredClone(readMetric('water'));const m=synthetic.years['2569'].months.find((x)=>x.month===8);m.analyticsEligible=false;m.analyticsExclusionCode='TEST-HOLD';const r=computePartialYoy(synthetic,{id:'water'});assert.equal(r.currentSeries[7],m.value);assert.equal(r.points[7].comparable,false);assert.deepEqual(r.comparableMonths,[1,2,3,4,5,6,7]);
  });
});
