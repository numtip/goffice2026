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
 * Parser C (waste) & D (ghg): FY2569 currently WAITING_FOR_INPUT → no CSV.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
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

/** Parser A: col[6] values for Thai-month rows 4–15 in sheet "2569". */
function extractCol6(ws) {
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: true });
  const out = [];
  for (let r = 4; r <= 15; r++) {
    const m = THAI_MONTHS[String(rows[r]?.[0] ?? '').trim()];
    if (!m) continue;
    const disp = displayOf(ws[XLSX.utils.encode_cell({ r, c: 6 })]);
    const v = numOrNull(disp);
    if (v !== null) out.push({ month: m, value: Math.round(v * 100) / 100 });
  }
  return out.sort((a, b) => a.month - b.month);
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

    if (t.metric === 'waste' || t.metric === 'ghg') {
      // Parser C/D — FY2569 canonical ranges are template copies today (WAITING_FOR_INPUT).
      // When observations arrive, a future extractor stage writes breakdown CSVs.
      console.log(`  ℹ ${t.fileName}: ${t.metric} FY2569 = WAITING_FOR_INPUT (no CSV emitted; missing months are never zero)`);
      skipped++;
      continue;
    }

    const ws = wb.Sheets['2569'];
    if (!ws) {
      console.log(`  ⚠ ${t.fileName}: sheet '2569' not found`);
      skipped++;
      continue;
    }
    const months = extractCol6(ws);
    if (months.length === 0) {
      console.log(`  ℹ ${t.fileName}: 0 observations → WAITING_FOR_INPUT (no CSV emitted)`);
      skipped++;
      continue;
    }

    // Workbook total from the 2569 sheet `รวม` row (row 17), display-aware — used
    // by the pipeline for reconciliation of the verified (CONFIRMED_XLSX) import.
    const totalDisp = displayOf(ws[XLSX.utils.encode_cell({ r: 17, c: 6 })]);
    const workbookTotal = numOrNull(totalDisp);

    const csvPath = join(IMPORT_DIR, `${t.metric}-${t.year}.csv`);
    const lines = ['month,value', ...months.map((m) => `${m.month},${m.value}`)];
    writeFileSync(csvPath, lines.join('\n') + '\n', 'utf-8');
    const total = months.reduce((s, m) => s + m.value, 0);
    registry[`${t.metric}-${t.year}`] = {
      workbookTotal,
      sourceWorkbook: t.workbookName,
      sourceSheet: '2569',
      classification: 'CONFIRMED_XLSX',
      extractionScript: 'scripts/extract-workbook.mjs',
    };
    console.log(`  ✅ ${t.fileName} → ${csvPath}: ${months.length}/12 months (Jan–month ${months[months.length - 1].month}), total=${total.toLocaleString()}${workbookTotal !== null ? `, workbook total=${workbookTotal.toLocaleString()}` : ''}`);
    written++;
  }

  writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2) + '\n', 'utf-8');
  console.log(`\n📦 CSVs written: ${written} | skipped: ${skipped}`);
  console.log(`📋 Source registry: ${REGISTRY_PATH}`);
  if (written === 0) console.log('ℹ No FY2569 observations to import — pipeline stays WAITING_FOR_INPUT.');
}

main();
