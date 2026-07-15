#!/usr/bin/env node
/**
 * inspect-xlsx.mjs
 * ================
 * Inspect all 6 operational XLSX files to understand structure.
 * Reports: sheet names, column headers, data range, sample rows.
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as XLSX from 'xlsx';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DOCS = join(ROOT, 'docs');

const FILES = [
  { file: '1.1-Water.xlsx',       metric: 'water' },
  { file: '1.2-elect.xlsx',       metric: 'energy' },
  { file: '1.3_Gassolene.xlsx',   metric: 'fuel' },
  { file: '1.4_Paper.xlsx',       metric: 'paper' },
  { file: '1.5_Waste.xlsx',       metric: 'waste' },
  { file: '1.6_GreenhouseGas.xlsx', metric: 'ghg' },
];

for (const { file, metric } of FILES) {
  const absPath = join(DOCS, file);
  console.log(`\n${'='.repeat(70)}`);
  console.log('📊 ' + metric + ' — ' + file);
  console.log('📁 ' + absPath);
  console.log('='.repeat(70));

  try {
    const buf = readFileSync(absPath);
    const wb = XLSX.read(buf, { type: 'buffer', cellDates: false });
    console.log('Sheets: ' + wb.SheetNames.join(', '));

    for (const sheetName of wb.SheetNames) {
      const ws = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

      if (rows.length === 0) {
        console.log('  [' + sheetName + '] — empty');
        continue;
      }

      const headerRow = rows[0];
      const headerInfo = headerRow.map(function(h, i) { return '[' + i + '] ' + h; }).join(', ');
      console.log('\n  Sheet: [' + sheetName + ']');
      console.log('  Header: ' + headerInfo);
      console.log('  Rows: ' + (rows.length - 1) + ' data rows');

      // Show first 6 data rows
      const maxData = Math.min(6, rows.length - 1);
      for (let r = 1; r <= maxData; r++) {
        const row = rows[r];
        const vals = row.map(function(v, i) {
          return (headerRow[i] || 'col' + i) + '=' + v;
        }).join(', ');
        console.log('  Row ' + r + ': ' + vals);
      }

      // Show last 2 rows if different
      if (rows.length - 1 > maxData + 2) {
        const lastStart = Math.max(rows.length - 3, maxData + 1);
        console.log('  ... (' + (rows.length - 1 - maxData - 2) + ' rows hidden)');
        for (let r = lastStart; r < rows.length; r++) {
          const row = rows[r];
          const vals = row.map(function(v, i) {
            return (headerRow[i] || 'col' + i) + '=' + v;
          }).join(', ');
          console.log('  Row ' + r + ': ' + vals);
        }
      }
    }
  } catch (err) {
    console.error('  ❌ Error: ' + err.message);
  }
}
