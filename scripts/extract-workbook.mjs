#!/usr/bin/env node
/**
 * extract-workbook.mjs — Phase 2 (GO-DATA-3)
 * ==========================================
 * Display-aware extraction from staged workbooks → data/import/{metric}-{year}.csv
 *
 * Rules:
 *   - A month is observed ONLY when the formatted display (cell.w) is numeric.
 *     Cells displayed '-' or empty are MISSING — never zero (raw formula value
 *     may be 0 while display is '-', e.g. water/electric 2569 P12:P16).
 *   - Only observed months are written; missing future months are omitted.
 *   - Metrics with 0 observations (WAITING_FOR_INPUT) produce NO CSV — the
 *     canonical pipeline keeps their current-year months empty.
 *   - Read-only on staging source; only data/import is written.
 *
 * Usage:
 *   node scripts/extract-workbook.mjs          (defaults to data/staging/source)
 *   node scripts/extract-workbook.mjs --staging=<dir>
 *
 * Parser A (col6 template): water / electricity / fuel / paper.
 * Parser C (waste): monthly total = general + hazardous total + recycle total
 *   from sheet "ปริมาณขยะรายเดือน " (raw sheet only — not คำนวณ%).
 * Parser D (ghg): monthly CF kgCO₂e from สรุปการคำนวณ ปี 2569 row รวม CF
 *   columns → tCO₂e (/1000). CF display 0 with no activity = MISSING.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import * as XLSX from 'xlsx';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const DEFAULT_STAGING = join(PROJECT_ROOT, 'data', 'staging', 'source');
const IMPORT_DIR = join(PROJECT_ROOT, 'data', 'import');
const REGISTRY_PATH = join(PROJECT_ROOT, 'data', 'staging', 'extract-sources.json');

const THAI_MONTHS = { 'ม.ค.': 1, 'ก.พ.': 2, 'มี.ค.': 3, 'เม.ย.': 4, 'พ.ค.': 5, 'มิ.ย.': 6, 'ก.ค.': 7, 'ส.ค.': 8, 'ก.ย.': 9, 'ต.ค.': 10, 'พ.ย.': 11, 'ธ.ค.': 12 };

const TARGETS = [
  { fileName: '1.1Water.xlsx',     metric: 'water',      year: 2569, workbookName: '1.1Water.xlsx' },
  { fileName: '1.2electric.xlsx',  metric: 'energy',     year: 2569, workbookName: '1.2electric.xlsx' },
  { fileName: '1.3Gassolene.xlsx', metric: 'fuel',       year: 2569, workbookName: '1.3Gassolene.xlsx' },
  { fileName: '1.4paper.xlsx',     metric: 'paper',      year: 2569, workbookName: '1.4paper.xlsx' },
  { fileName: '1.5waste2026.xlsx', metric: 'waste',      year: 2569, workbookName: '1.5waste2026.xlsx' },
  { fileName: '1.6GreenHouseGas2026.xlsx', metric: 'ghg', year: 2569, workbookName: '1.6GreenHouseGas2026.xlsx' },
];

function displayOf(cell) {
  if (!cell) return '';
  if (cell.w !== undefined) return String(cell.w).trim();
  return String(cell.v ?? '').trim();
}

/** Numeric value from display, or null when missing/unparseable. */
function numOrNull(disp) {
  if (disp === '' || disp === '-') return null;
  const n = Number(disp.replace(/[, ]/g, ''));
  return Number.isNaN(n) ? null : n;
}

/**
 * Positive numeric value from display, or null when missing/unparseable.
 * Negative monthly consumption (energy/water/fuel/paper/waste) is physically
 * impossible and indicates a corrupted formula cache in the source workbook
 * (e.g. 1.2electric.xlsx "2569" Aug = -8,038,867.20). Such cells are treated
 * as MISSING, never published.
 */
function positiveNumOrNull(disp) {
  const n = numOrNull(disp);
  if (n === null || n <= 0) return null;
  return n;
}

/** Parser A: col[6] values for Thai-month rows 4–15 in sheet "2569". */
function extractCol6(ws) {
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: true });
  const out = [];
  let sawNegative = false;
  for (let r = 4; r <= 15; r++) {
    const m = THAI_MONTHS[String(rows[r]?.[0] ?? '').trim()];
    if (!m) continue;
    const disp = displayOf(ws[XLSX.utils.encode_cell({ r, c: 6 })]);
    if (numOrNull(disp) !== null && numOrNull(disp) < 0) sawNegative = true;
    const v = positiveNumOrNull(disp);
    if (v !== null) out.push({ month: m, value: Math.round(v * 100) / 100 });
  }
  return { months: out.sort((a, b) => a.month - b.month), sawNegative };
}

/**
 * Parser C — waste total kg per month from raw monthly sheet.
 * Rows (0-based): r3 general landfill, r11 hazardous total, r18 recycle total.
 * Month columns c1..c12. A month is observed when general (r3) display is numeric.
 */
function extractWaste(ws) {
  const out = [];
  let sawNegative = false;
  for (let c = 1; c <= 12; c++) {
    const genDisp = displayOf(ws[XLSX.utils.encode_cell({ r: 3, c })]);
    const gen = positiveNumOrNull(genDisp);
    if (gen === null) continue; // month missing — never invent zero
    const haz = positiveNumOrNull(displayOf(ws[XLSX.utils.encode_cell({ r: 11, c })])) ?? 0;
    const rec = positiveNumOrNull(displayOf(ws[XLSX.utils.encode_cell({ r: 18, c })])) ?? 0;
    if (numOrNull(genDisp) !== null && numOrNull(genDisp) < 0) sawNegative = true;
    out.push({ month: c, value: Math.round((gen + haz + rec) * 100) / 100 });
  }
  return { months: out.sort((a, b) => a.month - b.month), sawNegative };
}

/**
 * Parser D — GHG monthly CF from สรุปการคำนวณ ปี 2569.
 * Row r25 (รวม) CF columns c7,c9,…c29 → kgCO₂e; convert to tCO₂e.
 * CF display 0 is MISSING (formula zero for blank months), not measured zero.
 */
function extractGhg(wb) {
  const sn = wb.SheetNames.find((s) => s.includes('ปี 2569'));
  if (!sn) return { months: [], workbookTotal: null, sourceSheet: null };
  const ws = wb.Sheets[sn];
  const out = [];
  let month = 1;
  for (let c = 7; c <= 29; c += 2) {
    const disp = displayOf(ws[XLSX.utils.encode_cell({ r: 25, c })]);
    const kg = numOrNull(disp);
    if (kg !== null && kg > 0) {
      out.push({ month, value: Math.round((kg / 1000) * 1000) / 1000 });
    }
    month++;
  }
  const yearTotalKg = numOrNull(displayOf(ws[XLSX.utils.encode_cell({ r: 25, c: 30 })]));
  const workbookTotal =
    yearTotalKg !== null && yearTotalKg > 0
      ? Math.round((yearTotalKg / 1000) * 100) / 100
      : out.length > 0
        ? Math.round(out.reduce((s, m) => s + m.value, 0) * 100) / 100
        : null;
  return { months: out.sort((a, b) => a.month - b.month), workbookTotal, sourceSheet: sn };
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {};
  for (const a of args) {
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq === -1) opts[a.slice(2)] = true;
      else opts[a.slice(2, eq)] = a.slice(eq + 1);
    }
  }
  return opts;
}

function main() {
  const opts = parseArgs();
  const staging = opts.staging || DEFAULT_STAGING;
  if (!existsSync(staging)) {
    console.error(`❌ Staging directory not found: ${staging} — run sync-workbooks.mjs first.`);
    process.exit(1);
  }
  if (!existsSync(IMPORT_DIR)) mkdirSync(IMPORT_DIR, { recursive: true });

  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  Extract Workbooks — display-aware → CSV (GO-DATA-3)   ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  let written = 0;
  let skipped = 0;
  const registry = {};

  for (const t of TARGETS) {
    const abs = join(staging, t.fileName);
    if (!existsSync(abs)) {
      console.log(`  ⚠ ${t.fileName}: not staged, skipping`);
      skipped++;
      continue;
    }
    const wb = XLSX.read(readFileSync(abs), { type: 'buffer', cellDates: false });

    let months = [];
    let workbookTotal = null;
    let sourceSheet = '2569';
    let sawNegative = false;

    if (t.metric === 'waste') {
      const wsName = wb.SheetNames.find((s) => s.includes('ปริมาณขยะรายเดือน'));
      const ws = wsName ? wb.Sheets[wsName] : null;
      if (!ws) {
        console.log(`  ⚠ ${t.fileName}: waste monthly sheet not found`);
        skipped++;
        continue;
      }
      const w = extractWaste(ws);
      months = w.months;
      sawNegative = w.sawNegative;
      sourceSheet = wsName;
      workbookTotal = months.length > 0
        ? Math.round(months.reduce((s, m) => s + m.value, 0) * 100) / 100
        : null;
    } else if (t.metric === 'ghg') {
      const ghg = extractGhg(wb);
      months = ghg.months;
      workbookTotal = ghg.workbookTotal;
      sourceSheet = ghg.sourceSheet || 'สรุปการคำนวณ ปี 2569';
    } else {
      const ws = wb.Sheets['2569'];
      if (!ws) {
        console.log(`  ⚠ ${t.fileName}: sheet '2569' not found`);
        skipped++;
        continue;
      }
      const c = extractCol6(ws);
      months = c.months;
      sawNegative = c.sawNegative;
      // Workbook total from the 2569 sheet `รวม` row (row 17), display-aware.
      const totalDisp = displayOf(ws[XLSX.utils.encode_cell({ r: 17, c: 6 })]);
      const rawTotal = numOrNull(totalDisp);
      // A corrupt negative cell in the canonical range invalidates the `รวม`
      // total (it includes the bad value) — skip reconciliation on it.
      workbookTotal = rawTotal !== null && rawTotal >= 0 && !sawNegative ? rawTotal : null;
    }

    if (months.length === 0) {
      console.log(`  ℹ ${t.fileName}: 0 observations → WAITING_FOR_INPUT (no CSV emitted)`);
      skipped++;
      continue;
    }

    const csvPath = join(IMPORT_DIR, `${t.metric}-${t.year}.csv`);
    const lines = ['month,value', ...months.map((m) => `${m.month},${m.value}`)];
    writeFileSync(csvPath, lines.join('\n') + '\n', 'utf-8');
    const total = months.reduce((s, m) => s + m.value, 0);
    const sourceSha256 = createHash('sha256').update(readFileSync(abs)).digest('hex');
    const extractionDate = statSync(csvPath).mtime.toISOString().slice(0, 10);
    registry[`${t.metric}-${t.year}`] = {
      workbookTotal,
      sourceWorkbook: t.workbookName,
      sourceSheet,
      classification: 'CONFIRMED_XLSX',
      extractionScript: 'scripts/extract-workbook.mjs',
      sourceSha256,
      extractionDate,
      observedMonths: months.map((m) => m.month),
      coverage: `${months.length} of 12 months`,
      workbookTotalInvalid: sawNegative || workbookTotal === null,
    };
    console.log(`  ✅ ${t.fileName} → ${csvPath}: ${months.length}/12 months (Jan–month ${months[months.length - 1].month}), total=${total.toLocaleString()}${workbookTotal !== null ? `, workbook total=${workbookTotal.toLocaleString()}` : ', workbook total UNUSABLE (corrupt negative cell)'}`);
    written++;
  }

  writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2) + '\n', 'utf-8');
  console.log(`\n📦 CSVs written: ${written} | skipped: ${skipped}`);
  console.log(`📋 Source registry: ${REGISTRY_PATH}`);
  if (written === 0) console.log('ℹ No FY2569 observations to import — pipeline stays WAITING_FOR_INPUT.');
}

main();
