#!/usr/bin/env node
/**
 * extract-xlsx-to-csv.mjs
 * ========================
 * Extract real 2568 baseline data from XLSX source files → CSV import files.
 *
 * Handles varying spreadsheet layouts by detecting month-labeled rows
 * instead of assuming fixed row indices.
 *
 * Usage:
 *   node scripts/extract-xlsx-to-csv.mjs
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as XLSX from 'xlsx';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DOCS = join(ROOT, 'docs');
const IMPORT_DIR = join(ROOT, 'data', 'import');

// Thai month name → month number (both abbreviated and full)
const THAI_MONTHS = {
  'ม.ค.': 1, 'มกราคม': 1,
  'ก.พ.': 2, 'กุมภาพันธ์': 2,
  'มี.ค.': 3, 'มีนาคม': 3,
  'เม.ย.': 4, 'เมษายน': 4,
  'พ.ค.': 5, 'พฤษภาคม': 5,
  'มิ.ย.': 6, 'มิถุนายน': 6,
  'ก.ค.': 7, 'กรกฎาคม': 7,
  'ส.ค.': 8, 'สิงหาคม': 8,
  'ก.ย.': 9, 'กันยายน': 9,
  'ต.ค.': 10, 'ตุลาคม': 10,
  'พ.ย.': 11, 'พฤศจิกายน': 11,
  'ธ.ค.': 12, 'ธันวาคม': 12,
};

function monthFromThai(name) {
  if (!name) return null;
  const trimmed = String(name).trim();
  return THAI_MONTHS[trimmed] || null;
}

function readXlsx(path) {
  const buf = readFileSync(path);
  return XLSX.read(buf, { type: 'buffer', cellDates: false });
}

function sheetToRows(wb, sheetName) {
  const ws = wb.Sheets[sheetName];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
}

/**
 * Extract column-[6] metrics (water, energy, fuel, paper).
 * These all use the same form template: Sheet "2568", data starts at
 * rows with Thai month names in column[0], value in column[6].
 */
function extractColumn6Metric(filepath, sheetName, _year, metric) {
  const wb = readXlsx(filepath);
  const rows = sheetToRows(wb, sheetName);
  if (rows.length === 0) {
    console.error('  ⚠ Sheet "' + sheetName + '" not found or empty');
    return null;
  }

  // Debug: print first few rows
  for (let r = 0; r < Math.min(rows.length, 5); r++) {
    const row = rows[r];
    if (row[0]) console.log('  Debug row ' + r + ': col0="' + row[0] + '" col6="' + (row[6] || '') + '"');
  }

  // Find rows with Thai month names
  const months = [];
  const errors = [];
  let dataRowCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cell0 = String(row[0] || '').trim();
    const m = monthFromThai(cell0);
    if (m === null) continue;

    dataRowCount++;
    const rawValue = row[6];
    if (rawValue === undefined || rawValue === '' || rawValue === null) {
      errors.push('Row ' + i + ' (month ' + m + '): empty value');
      continue;
    }
    const v = parseFloat(String(rawValue));
    if (isNaN(v)) {
      errors.push('Row ' + i + ' (month ' + m + '): invalid value "' + rawValue + '"');
      continue;
    }

    months.push({ month: m, value: Math.round(v * 100) / 100 });
  }

  if (errors.length > 0) {
    console.error('  ⚠ ' + errors.length + ' warnings (' + metric + '):');
    errors.forEach(function(e) { console.error('    ' + e); });
  }

  if (months.length === 0) {
    console.error('  ✗ No valid data extracted for ' + metric);
    return null;
  }

  months.sort(function(a, b) { return a.month - b.month; });
  console.log('  Found ' + dataRowCount + ' data rows, ' + months.length + ' valid months');
  return months;
}

function writeCsv(metric, year, months) {
  if (!existsSync(IMPORT_DIR)) {
    mkdirSync(IMPORT_DIR, { recursive: true });
  }
  const filepath = join(IMPORT_DIR, metric + '-' + year + '.csv');
  const lines = ['month,value'];
  for (const m of months) {
    lines.push(m.month + ',' + m.value);
  }
  writeFileSync(filepath, lines.join('\n') + '\n', 'utf-8');
  const total = months.reduce(function(s, m) { return s + m.value; }, 0);
  console.log('  ✓ Wrote ' + filepath + ' (' + months.length + ' months, total=' + total.toLocaleString() + ')');
  return filepath;
}

function extractWater() {
  console.log('\n📊 Water — 1.1-Water.xlsx');
  const path = join(DOCS, '1.1-Water.xlsx');
  const months = extractColumn6Metric(path, '2568', 2568, 'water');
  if (months) writeCsv('water', 2568, months);
}

function extractEnergy() {
  console.log('\n📊 Energy — 12-elect.xlsx');
  const path = join(DOCS, '12-elect.xlsx');
  const months = extractColumn6Metric(path, '2568', 2568, 'energy');
  if (months) writeCsv('energy', 2568, months);
}

function extractFuel() {
  console.log('\n📊 Fuel — 1.3_Gassolene.xlsx');
  const path = join(DOCS, '1.3_Gassolene.xlsx');
  const months = extractColumn6Metric(path, '2568', 2568, 'fuel');
  if (months) writeCsv('fuel', 2568, months);
}

function extractPaper() {
  console.log('\n📊 Paper — 1.4_Paper.xlsx');
  const path = join(DOCS, '1.4_Paper.xlsx');
  const months = extractColumn6Metric(path, '2568', 2568, 'paper');
  if (months) writeCsv('paper', 2568, months);
}

function extractWaste() {
  console.log('\n📊 Waste — 1.5_Waste.xlsx');
  const path = join(DOCS, '1.5_Waste.xlsx');
  const wb = readXlsx(path);
  const rows = sheetToRows(wb, 'คำนวณ%');

  if (rows.length === 0) {
    console.error('  ⚠ Sheet "คำนวณ%" not found');
    return;
  }

  // Debug: print first 8 row labels
  for (let r = 0; r < Math.min(rows.length, 8); r++) {
    console.log('  Debug row ' + r + ': "' + rows[r][0] + '"');
    if (r === 0) {
      // Print month headers
      var headers = [];
      for (let c = 1; c <= 12; c++) headers.push(rows[r][c] || '');
      console.log('    Months: ' + headers.join(', '));
    }
  }

  // Find the recycling % row (starts with "%")
  let pctRow = null;
  for (let i = 0; i < rows.length; i++) {
    const label = String(rows[i][0] || '').trim();
    if (label.startsWith('%') && (label.includes('ขยะรีไซเคิล') || label.includes('นำกลับมาใช้ใหม่') || label.includes('Recycle'))) {
      pctRow = rows[i];
      console.log('  Found % row at index ' + i + ': "' + label + '"');
      break;
    }
  }

  if (!pctRow) {
    console.error('  ⚠ Recycling % row not found');
    return;
  }

  const months = [];
  for (let col = 1; col <= 12; col++) {
    const rawVal = pctRow[col];
    if (rawVal === undefined || rawVal === '' || rawVal === '-') continue;
    const v = parseFloat(String(rawVal));
    if (isNaN(v)) continue;
    // Value is decimal (0.2083), convert to percentage (20.83)
    const pct = Math.round(v * 10000) / 100;
    months.push({ month: col, value: pct });
  }

  if (months.length === 0) {
    console.error('  ✗ No recycling data extracted');
    return;
  }

  months.sort(function(a, b) { return a.month - b.month; });
  console.log('  Extracted ' + months.length + ' months of recycling data');
  for (const m of months) {
    console.log('    Month ' + m.month + ': ' + m.value + '%');
  }
  writeCsv('waste', 2568, months);
}

function extractGhg() {
  console.log('\n📊 GHG — 1.5_GreenhouseGas.xlsx');
  const path = join(DOCS, '1.5_GreenhouseGas.xlsx');
  const wb = readXlsx(path);
  const sheetName = 'สรุปการคำนวณ ปี 2568';
  const rows = sheetToRows(wb, sheetName);

  if (rows.length === 0) {
    console.error('  ⚠ Sheet "' + sheetName + '" not found');
    return;
  }

  // Find the GHG 2568 total row: label "GHG ปี 2568 (kgCO2e)" in col[2]
  // Data is in consecutive columns [3]=Jan, [4]=Feb, ..., [14]=Dec (kgCO2e)
  console.log('  Searching for "GHG ปี 2568" total row...');
  let ghgRow = null;

  for (let i = 0; i < rows.length; i++) {
    const label = String(rows[i][2] || '').trim();
    if (label.includes('GHG ปี 2568') || label.includes('ก๊าซเรือนกระจก ปี 2568')) {
      // Verify it has monthly values in cols 3-14
      let count = 0;
      for (let c = 3; c <= 14; c++) {
        const v = parseFloat(String(rows[i][c] || ''));
        if (!isNaN(v) && v > 0) count++;
      }
      if (count >= 10) {
        console.log('  Found row ' + i + ': "' + label + '" with ' + count + ' monthly values');
        ghgRow = { row: rows[i], colStart: 3, colStep: 1 };
        break;
      }
    }
  }

  if (!ghgRow) {
    console.error('  ✗ Could not find GHG 2568 total row');
    return;
  }

  if (!ghgRow) {
    // Try 2567 sheet as fallback
    console.log('  Trying 2567 sheet...');
    const rows67 = sheetToRows(wb, 'สรุปการคำนวณ ปี 2567');
    for (let i = 0; i < rows67.length; i++) {
      let numCount = 0;
      const vals = [];
      for (let c = 5; c <= 27; c += 2) {
        const v = parseFloat(String(rows67[i][c] || ''));
        if (!isNaN(v) && v > 0) {
          numCount++;
          vals.push(v);
        }
      }
      if (numCount >= 10) {
        console.log('  Row ' + i + ' has ' + numCount + ' positive values (2567 sheet)');
        console.log('    Values: ' + vals.map(function(v) { return v.toFixed(1); }).join(', '));
        ghgRow = { row: rows67[i], colStart: 5, colStep: 2 };
        break;
      }
    }
  }

  if (!ghgRow) {
    console.error('  ✗ Could not find GHG total row in either sheet');
    return;
  }

  const months = [];
  for (let offset = 0; offset < 12; offset++) {
    const colIdx = ghgRow.colStart + offset * ghgRow.colStep;
    const rawVal = ghgRow.row[colIdx];
    if (rawVal === undefined || rawVal === '' || rawVal === '-') continue;
    const v = parseFloat(String(rawVal));
    if (isNaN(v) || v <= 0) continue;
    // Convert kgCO2e → tCO2e
    const tco2e = Math.round((v / 1000) * 100) / 100;
    months.push({ month: offset + 1, value: tco2e });
  }

  if (months.length === 0) {
    console.error('  ✗ No GHG data extracted');
    // Try using the CH4 sheet data to compute total
    return;
  }

  months.sort(function(a, b) { return a.month - b.month; });
  console.log('  Extracted ' + months.length + ' months (tCO₂e):');
  for (const m of months) {
    console.log('    Month ' + m.month + ': ' + m.value + ' tCO₂e');
  }
  writeCsv('ghg', 2568, months);
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  XLSX → CSV Extraction Pipeline             ║');
  console.log('╚══════════════════════════════════════════════╝');

  extractWater();
  extractEnergy();
  extractFuel();
  extractPaper();
  extractWaste();
  extractGhg();

  console.log('\nDone.');
}

main();
