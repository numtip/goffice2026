/**
 * test-fy2569-ghg-reconciliation.mjs
 * ===================================
 * Focused reconciliation: authoritative FY2569 GHG workbook
 * (data/staging/source/1.6GreenHouseGas2026_New.xlsx, the staged copy of the
 * owner-replaced OneDrive source) → canonical generated/ghg.json → rendered
 * /dashboard/ghg/ + /indicators/1.5.1/ output, TH and EN.
 *
 * Enforced:
 *   - Sheet "สรุปการคำนวณ ปี 2569", row "รวม" (r25, 0-based): monthly CF in
 *     H/J/L/N/P/R/T/V/X/Z/AB/AD (cols 7..29 step 2), AE (col 30) = annual total.
 *   - Aug–Dec CF display 0 ⇒ not observed (never zero-filled).
 *   - ghg.json years[2569] months/total/coverage/source identity match the
 *     workbook exactly; unit tCO₂e; verification available_unverified.
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
const STAGED_WB = join(ROOT, 'data', 'staging', 'source', '1.6GreenHouseGas2026_New.xlsx');
const GENERATED_GHG = join(ROOT, 'src/data/generated/ghg.json');

function sha256(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}

function workbookSha() {
  return sha256(STAGED_WB);
}

/** Read the authoritative FY2569 summary row from the staged workbook. */
function readWorkbookFy2569() {
  const wb = XLSX.read(readFileSync(STAGED_WB), { type: 'buffer', cellDates: false });
  const sn = wb.SheetNames.find((s) => s.includes('ปี 2569'));
  assert.ok(sn, 'workbook must contain a "ปี 2569" summary sheet');
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
  };
}

function generatedGhg() {
  return JSON.parse(readFileSync(GENERATED_GHG, 'utf8'));
}

function generatedCurrent() {
  return generatedGhg().years['2569'];
}

describe('workbook → canonical ghg.json reconciliation', () => {
  const wb = readWorkbookFy2569();
  const current = generatedCurrent();

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
    assert.equal(current.provenance.sourceSha256, workbookSha(), 'sha must match the staged authoritative workbook');
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

describe('rendered output — dashboard and 1.5.1 consume the same canonical dataset', () => {
  const current = generatedCurrent();
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

    it('1.5.1 shows unavailable FY2569 panel + collapsed FY2568 baseline journey', () => {
      for (const prefix of ['', 'en/']) {
        const html = readFileSync(join(DIST, prefix, 'indicators', '1.5.1', 'index.html'), 'utf8');
        const kind = html.match(/data-fy2569-kind="([^"]+)"/);
        assert.equal(kind?.[1], 'unavailable', `${prefix}1.5.1 FY2569 panel unavailable`);
        const baselineTags = [...html.matchAll(/<details[^>]*data-fy2568-baseline[^>]*>/g)];
        assert.equal(baselineTags.length, 1, `${prefix}1.5.1 exactly one FY2568 baseline`);
        assert.doesNotMatch(baselineTags[0][0], /\sopen\b/, `${prefix}1.5.1 baseline collapsed`);
        // The baseline journey renders FY2568 inventory (231.62 tCO₂e) — never
        // the FY2569 144.8 current-year total outside the baseline.
        const panelStart = html.indexOf('data-fy2569-status-panel');
        const beforeBaseline = html.slice(panelStart, baselineTags[0].index);
        assert.doesNotMatch(beforeBaseline, /144\.8|145/, `${prefix}1.5.1 FY2569 total must not leak above baseline`);
        // No duplicated hard-coded number: monthly table is server-rendered from
        // the canonical dataset (data-cat15-monthly-table) inside baseline.
        assert.ok(html.indexOf('data-cat15-monthly-table', baselineTags[0].index) !== -1, `${prefix}1.5.1 monthly table inside baseline`);
      }
    });
  });
});
