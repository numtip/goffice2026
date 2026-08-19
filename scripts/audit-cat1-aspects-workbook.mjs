#!/usr/bin/env node
/**
 * audit-cat1-aspects-workbook.mjs — Phase A source audit (READ-ONLY)
 * ==================================================================
 * Structural audit of docs/ผลประเมินปัญหา2568.xlsx (FY2568 environmental
 * aspect assessment workbook). Never writes the workbook.
 *
 * Reports per sheet:
 *   - sheet name, dimensions (range), row/col counts
 *   - merged-cell count + top-left coordinates
 *   - header row (first non-empty row) with column letters
 *   - sample data rows
 *   - any cells that contain formulas (raw string starting with '=')
 *   - column-wise value inventory for key classification columns
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as XLSX from 'xlsx';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const WORKBOOK = process.argv[2] || 'ผลประเมินปัญหา2568.xlsx';
const absPath = join(ROOT, 'docs', WORKBOOK);

console.log('='.repeat(78));
console.log('CAT1 — ENVIRONMENTAL ASPECT WORKBOOK AUDIT (READ-ONLY)');
console.log('Source:', absPath);
console.log('='.repeat(78));

let wb;
try {
  const buf = readFileSync(absPath);
  wb = XLSX.read(buf, { type: 'buffer', cellDates: false, dense: false });
} catch (e) {
  console.error('FATAL: cannot open workbook:', e.message);
  process.exit(1);
}

const colLetter = (i) => XLSX.utils.encode_col(i);
const nonEmpty = (v) => v !== undefined && v !== null && String(v).trim() !== '';

console.log(`\nSheets (${wb.SheetNames.length}): ${wb.SheetNames.map((s) => `"${s}"`).join(', ')}`);

for (const sheetName of wb.SheetNames) {
  const ws = wb.Sheets[sheetName];
  console.log(`\n${'─'.repeat(78)}`);
  console.log(`SHEET: "${sheetName}"`);
  if (!ws || !ws['!ref']) {
    console.log('  (empty — no range)');
    continue;
  }
  const range = XLSX.utils.decode_range(ws['!ref']);
  console.log(`  Range : ${ws['!ref']}  (rows ${range.s.r + 1}–${range.e.r + 1}, cols ${colLetter(range.s.c)}–${colLetter(range.e.c)})`);
  const merges = (ws['!merges'] || []).map((m) => `${colLetter(m.s.c)}${m.s.r + 1}:${colLetter(m.e.c)}${m.e.r + 1}`);
  console.log(`  Merged: ${merges.length} → ${merges.slice(0, 20).join(', ')}${merges.length > 20 ? ', …' : ''}`);

  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: true, range: 0 });

  // Header row = first row with any non-empty cell
  let headerIdx = -1;
  for (let r = 0; r < Math.min(rows.length, 15); r++) {
    if (rows[r] && rows[r].some(nonEmpty)) { headerIdx = r; break; }
  }
  const maxCol = rows.reduce((m, row) => Math.max(m, row ? row.length : 0), 0);

  const headerRow = headerIdx >= 0 ? rows[headerIdx] : [];
  console.log(`  Header row ${headerIdx + 1}:`);
  for (let c = 0; c < maxCol; c++) {
    const v = headerRow[c];
    if (nonEmpty(v)) console.log(`    ${colLetter(c)}: ${String(v)}`);
  }

  // Formula scan
  let formulaCount = 0;
  const formulaCells = [];
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    if (!row) continue;
    for (let c = 0; c < row.length; c++) {
      const v = row[c];
      if (typeof v === 'string' && v.startsWith('=')) {
        formulaCount++;
        if (formulaCells.length < 12) formulaCells.push(`${colLetter(c)}${r + 1}=${v.slice(0, 60)}`);
      }
    }
  }
  console.log(`  Formulas: ${formulaCount}${formulaCount ? ' → ' + formulaCells.join(' | ') : ''}`);

  // Data rows (after header) sample
  const dataRows = [];
  for (let r = headerIdx + 1; r < rows.length; r++) {
    if (rows[r] && rows[r].some(nonEmpty)) dataRows.push({ r, row: rows[r] });
  }
  console.log(`  Data rows: ${dataRows.length}  (of ${rows.length} physical rows)`);

  const sample = dataRows.slice(0, 8);
  for (const { r, row } of sample) {
    const cells = [];
    for (let c = 0; c < maxCol; c++) {
      const v = row[c];
      if (nonEmpty(v)) cells.push(`${colLetter(c)}=${String(v).slice(0, 42)}`);
    }
    console.log(`    R${r + 1}: ${cells.join(' | ') || '(blank)'}`);
  }
  if (dataRows.length > 8) {
    console.log(`    … (${dataRows.length - 8} more data rows)`);
    const tail = dataRows.slice(-3);
    for (const { r, row } of tail) {
      const cells = [];
      for (let c = 0; c < maxCol; c++) {
        const v = row[c];
        if (nonEmpty(v)) cells.push(`${colLetter(c)}=${String(v).slice(0, 42)}`);
      }
      console.log(`    R${r + 1}: ${cells.join(' | ') || '(blank)'}`);
    }
  }

  // Column inventory for up to 14 leading columns (value -> count)
  console.log('  Column inventories (value ⇒ count):');
  for (let c = 0; c < Math.min(maxCol, 14); c++) {
    const counts = new Map();
    for (let r = headerIdx + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row) continue;
      const v = row[c];
      if (nonEmpty(v)) {
        const key = String(v).slice(0, 50);
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    }
    if (counts.size > 0 && counts.size <= 40) {
      console.log(`    ${colLetter(c)} (${headerRow[c] ? String(headerRow[c]).slice(0, 30) : '?'}): ${[...counts.entries()].map(([k, n]) => `"${k}"×${n}`).join(', ')}`);
    } else if (counts.size > 40) {
      console.log(`    ${colLetter(c)} (${headerRow[c] ? String(headerRow[c]).slice(0, 30) : '?'}): ${counts.size} distinct values (too many to list)`);
    }
  }
}

// Year-leak scan across all sheets
console.log(`\n${'='.repeat(78)}`);
console.log('YEAR-LEAK SCAN (FY2567 / FY2569 / other years)');
const yearPattern = /(256[0-9])/g;
const yearHits = new Map(); // year -> count
const yearCellExamples = new Map();
for (const sheetName of wb.SheetNames) {
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: false });
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    if (!row) continue;
    for (let c = 0; c < row.length; c++) {
      const v = row[c];
      if (typeof v !== 'string') continue;
      const m = v.match(yearPattern);
      if (m) {
        for (const yr of m) {
          yearHits.set(yr, (yearHits.get(yr) || 0) + 1);
          if (!yearCellExamples.has(yr)) {
            yearCellExamples.set(yr, `${sheetName}!${colLetter(c)}${r + 1} = "${String(v).slice(0, 60)}"`);
          }
        }
      }
    }
  }
}
if (yearHits.size === 0) {
  console.log('  No 4-digit Buddhist-era years found anywhere.');
} else {
  for (const [yr, n] of [...yearHits.entries()].sort()) {
    console.log(`  ${yr}: ${n} hit(s) — first: ${yearCellExamples.get(yr)}`);
  }
}
console.log('\nAUDIT COMPLETE');
