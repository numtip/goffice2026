/**
 * test-fy2569-ghg-reconciliation.mjs
 * ===================================
 * Focused reconciliation for the multi-year GHG dataset:
 *   FY2569 — authoritative 1.6GreenHouseGas2026_New.xlsx (owner-replaced)
 *   FY2568 — authoritative 1.5_greenhousegass_update2.xlsx (owner-designated)
 * → canonical generated/ghg.json → rendered /dashboard/ghg/ +
 * /indicators/1.5.1/ output, TH and EN.
 *
 * Enforced:
 *   - Sheet "สรุปการคำนวณ ปี {year}", row "รวม" (r25, 0-based): monthly CF in
 *     H/J/L/N/P/R/T/V/X/Z/AB/AD (cols 7..29 step 2), AE (col 30) = annual total.
 *   - FY2569: Aug–Dec CF display 0 ⇒ not observed (never zero-filled); 7/12,
 *     available_unverified.
 *   - FY2568: 12/12 observed months, total 222.68 tCO₂e (row รวม AE26
 *     222,679.34 kgCO₂e), VERIFIED_BASELINE/CONFIRMED_XLSX; stale narrative
 *     (231.62) disclosed and not used.
 *   - Dashboard + 1.5.1 consume the same canonical generated ghg.json (no
 *     duplicated hard-coded number), TH and EN.
 *   - FY2568 stays a collapsed baseline on the 1.5.1 page.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as XLSX from 'xlsx';

import { buildMonthlySeries } from '../src/utils/chart-option.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const STAGED_WB_2569 = join(ROOT, 'data', 'staging', 'source', '1.6GreenHouseGas2026_New.xlsx');
const STAGED_WB_2568 = join(ROOT, 'data', 'staging', 'source', '1.5_greenhousegass_update2.xlsx');
const GENERATED_GHG = join(ROOT, 'src/data/generated/ghg.json');

function sha256(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}

/** Read the authoritative {year} summary row (รวม, r25) from a staged workbook. */
function readWorkbookGhg(file, year) {
  const wb = XLSX.read(readFileSync(file), { type: 'buffer', cellDates: false });
  const sn = wb.SheetNames.find((s) => s.includes(`ปี ${year}`));
  assert.ok(sn, `${file} must contain a "ปี ${year}" summary sheet`);
  const ws = wb.Sheets[sn];

  // Row 25 (0-based) = "รวม". Monthly CF columns 7..29 step 2 (H..AD).
  const months = [];
  let month = 1;
  for (let c = 7; c <= 29; c += 2) {
    const cell = ws[XLSX.utils.encode_cell({ r: 25, c })];
    const disp = cell ? String(cell.w !== undefined ? cell.w : cell.v).trim() : '';
    const kg = disp === '' || disp === '-' ? null : Number(disp.replace(/[, ]/g, ''));
    if (kg !== null && kg > 0) months.push({ month, kg });
    month++;
  }
  const totalCell = ws[XLSX.utils.encode_cell({ r: 25, c: 30 })];
  const totalKg = Number(String(totalCell?.w ?? totalCell?.v).replace(/[, ]/g, ''));
  return {
    sheet: sn,
    row: 25,
    months: months.map((m) => ({ month: m.month, tCO2e: Math.round((m.kg / 1000) * 1000) / 1000 })),
    totalTCO2e: Math.round((totalKg / 1000) * 100) / 100,
    totalKg,
  };
}

function generatedGhg() {
  return JSON.parse(readFileSync(GENERATED_GHG, 'utf8'));
}

function generatedYear(year) {
  return generatedGhg().years[String(year)];
}

describe('workbook → canonical ghg.json reconciliation', () => {
  const wb = readWorkbookGhg(STAGED_WB_2569, 2569);
  const current = generatedYear(2569);

  it('workbook has exactly 7 observed months (Jan–Jul); Aug–Dec CF display 0', () => {
    assert.deepEqual(wb.months.map((m) => m.month), [1, 2, 3, 4, 5, 6, 7]);
    assert.ok(current.months.length === 7);
    assert.deepEqual(current.months.map((m) => m.month), [1, 2, 3, 4, 5, 6, 7]);
  });

  it('generated months equal workbook CF values (kg/1000, 3 decimals)', () => {
    const gen = current.months.map((m) => m.value);
    const wbMonths = wb.months.map((m) => m.tCO2e);
    assert.deepEqual(gen, wbMonths, 'monthly tCO2e must equal the workbook CF column');
  });

  it('generated total equals workbook AE total and the sum of observed months', () => {
    const sum = Math.round(wb.months.reduce((s, m) => s + m.tCO2e, 0) * 100) / 100;
    assert.equal(wb.totalTCO2e, sum, 'workbook AE total must equal sum of CF months');
    assert.equal(current.total, wb.totalTCO2e, 'generated total must equal workbook total');
    assert.equal(current.total, sum, 'generated total must equal sum of months (no fake values)');
  });

  it('source identity: unit tCO₂e, new authoritative workbook, sha, coverage, verification', () => {
    assert.equal(generatedGhg().unit, 'tCO₂e');
    assert.equal(current.provenance.sourceWorkbook, '1.6GreenHouseGas2026_New.xlsx');
    assert.equal(current.provenance.sourceSheet, 'สรุปการคำนวณ ปี 2569');
    assert.equal(current.provenance.sourceSha256, sha256(STAGED_WB_2569), 'sha must match the staged authoritative workbook');
    assert.equal(current.provenance.coverage, '7 of 12 months');
    assert.deepEqual(current.provenance.observedMonths, [1, 2, 3, 4, 5, 6, 7]);
    assert.equal(current.provenance.verification.status, 'available_unverified');
    assert.equal(current.dataStatus, 'in_progress');
    assert.equal(current.datasetState, 'PUBLISHABLE_PARTIAL');
    assert.equal(current.dataClassification, 'CONFIRMED_XLSX');
  });

  it('KPI summary uses the same canonical total and source identity', () => {
    const kpi = JSON.parse(readFileSync(join(ROOT, 'src/data/generated/kpi-summary.json'), 'utf8')).metrics.find((m) => m.metric === 'ghg');
    assert.equal(kpi.value, current.total);
    assert.equal(kpi.unit, 'tCO₂e');
    assert.match(kpi.sourceFile, /1\.6GreenHouseGas2026_New\.xlsx/);
    assert.equal(kpi.verified, false, 'partial current-year data is never flagged verified');
  });
});

describe('FY2568 authoritative baseline → canonical ghg.json reconciliation', () => {
  const wb = readWorkbookGhg(STAGED_WB_2568, 2568);
  const baseline = generatedYear(2568);

  it('workbook has 12 observed months; generated matches 1:1', () => {
    assert.equal(wb.months.length, 12, 'FY2568 workbook is complete (12/12)');
    assert.deepEqual(baseline.months.map((m) => m.month), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    assert.deepEqual(baseline.months.map((m) => m.value), wb.months.map((m) => m.tCO2e));
  });

  it('generated total = workbook AE total = 222.68 tCO₂e = sum of months', () => {
    const sum = Math.round(wb.months.reduce((s, m) => s + m.tCO2e, 0) * 100) / 100;
    assert.equal(wb.totalTCO2e, 222.68, 'workbook AE26 total (222,679.34 kgCO2e / 1000)');
    assert.equal(baseline.total, wb.totalTCO2e);
    assert.equal(baseline.total, sum);
  });

  it('baseline status is VERIFIED_BASELINE/COMPLETE/CONFIRMED_XLSX with new source identity', () => {
    assert.equal(baseline.dataStatus, 'VERIFIED_BASELINE');
    assert.equal(baseline.datasetState, 'COMPLETE');
    assert.equal(baseline.dataClassification, 'CONFIRMED_XLSX');
    assert.equal(baseline.provenance.sourceWorkbook, '1.5_greenhousegass_update2.xlsx');
    assert.equal(baseline.provenance.sourceSheet, 'สรุปการคำนวณ ปี 2568');
    assert.equal(baseline.provenance.sourceSha256, sha256(STAGED_WB_2568), 'sha must match staged authoritative FY2568 workbook');
    assert.equal(baseline.provenance.coverage, '12 of 12 months');
    assert.equal(baseline.provenance.validationStatus, 'VERIFIED_BASELINE');
    // Stale narrative (231.62) must NOT be used anywhere as the active value.
    assert.notEqual(baseline.total, 231.62);
  });

  it('KPI baselineValue uses the new 222.68 total', () => {
    const kpi = JSON.parse(readFileSync(join(ROOT, 'src/data/generated/kpi-summary.json'), 'utf8')).metrics.find((m) => m.metric === 'ghg');
    assert.equal(kpi.baselineValue, 222.68);
  });
});

describe('rendered output — dashboard and 1.5.1 consume the same canonical dataset', () => {
  const current = generatedYear(2569);
  const baseline = generatedYear(2568);
  const series = buildMonthlySeries(generatedGhg(), 'en');

  it('buildMonthlySeries values match generated ghg.json (no hard-coded numbers)', () => {
    const observed = series.current.filter((v) => v !== null);
    assert.deepEqual(observed, current.months.map((m) => m.value));
    assert.equal(series.unit, 'tCO₂e');
    assert.equal(series.currentUnverified, true);
  });

  const hasDist = existsSync(join(DIST, 'dashboard', 'ghg'));
  const built = hasDist ? describe : describe.skip;

  built('built pages TH+EN', () => {
    it('dashboard/ghg current-year KPI shows the workbook total and 7/12 coverage', () => {
      for (const prefix of ['', 'en/']) {
        const html = readFileSync(join(DIST, prefix, 'dashboard', 'ghg', 'index.html'), 'utf8');
        const rounded = Intl.NumberFormat(prefix === '' ? 'th' : 'en').format(Math.round(current.total));
        // KPI card: "ปีปัจจุบัน 2569 <rounded> tCO₂e" + coverage line.
        assert.ok(html.includes(rounded), `${prefix}dashboard ghg must render total ${rounded}`);
        assert.match(html, /7 จาก 12 เดือน|7 of 12 months/);
        // Current-year provenance is used in the evidence panel.
        assert.match(html, /ที่มาข้อมูลปีปัจจุบัน|Current-Year Provenance/);
        // Unverified copy — never a green Verified claim for partial data.
        assert.match(html, /ข้อมูลบางส่วน|Partial|ยังไม่ยืนยัน|Unverified/);
      }
    });

    it('dashboard/ghg baseline KPI shows the new 222.68 total (FY2568)', () => {
      for (const prefix of ['', 'en/']) {
        const html = readFileSync(join(DIST, prefix, 'dashboard', 'ghg', 'index.html'), 'utf8');
        const rounded = Intl.NumberFormat(prefix === '' ? 'th' : 'en').format(Math.round(baseline.total));
        assert.ok(html.includes(rounded), `${prefix}dashboard ghg baseline must render total ${rounded}`);
        // Provenance workbook label for the baseline is the new file.
        assert.ok(html.includes('1.5_greenhousegass_update2.xlsx'), `${prefix}dashboard ghg shows new baseline source`);
      }
    });

    it('1.5.1 shows unavailable FY2569 panel + collapsed FY2568 baseline journey with new baseline values', () => {
      for (const prefix of ['', 'en/']) {
        const html = readFileSync(join(DIST, prefix, 'indicators', '1.5.1', 'index.html'), 'utf8');
        const kind = html.match(/data-fy2569-kind="([^"]+)"/);
        assert.equal(kind?.[1], 'unavailable', `${prefix}1.5.1 FY2569 panel unavailable`);
        const baselineTags = [...html.matchAll(/<details[^>]*data-fy2568-baseline[^>]*>/g)];
        assert.equal(baselineTags.length, 1, `${prefix}1.5.1 exactly one FY2568 baseline`);
        assert.doesNotMatch(baselineTags[0][0], /\sopen\b/, `${prefix}1.5.1 baseline collapsed`);
        // The FY2569 144.8 current-year total must not leak above the baseline.
        const panelStart = html.indexOf('data-fy2569-status-panel');
        const beforeBaseline = html.slice(panelStart, baselineTags[0].index);
        assert.doesNotMatch(beforeBaseline, /144\.8|145/, `${prefix}1.5.1 FY2569 total must not leak above baseline`);
        // The FY2568 baseline journey renders the NEW total (222.68) inside the
        // baseline section and the source workbook is the new file.
        const inside = html.slice(baselineTags[0].index, html.indexOf('</details>', baselineTags[0].index));
        assert.ok(inside.includes('222.68') || inside.includes('222'), `${prefix}1.5.1 baseline renders 222.68 tCO2e`);
        assert.ok(html.indexOf('data-cat15-monthly-table', baselineTags[0].index) !== -1, `${prefix}1.5.1 monthly table inside baseline`);
        // The stale narrative value 231.62 must only appear inside the baseline
        // as the ANOM-NARRATIVE-STALE disclosure — never above it as a value.
        assert.ok(!beforeBaseline.includes('231.62'), `${prefix}1.5.1 stale narrative must not appear above baseline`);
        assert.ok(inside.includes('ANOM-NARRATIVE-STALE'), `${prefix}1.5.1 discloses the stale narrative conflict`);
        assert.ok(inside.includes('231.62'), `${prefix}1.5.1 stale narrative disclosed verbatim for transparency`);
      }
    });
  });
});
