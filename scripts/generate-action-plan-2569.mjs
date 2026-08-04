#!/usr/bin/env node
/**
 * generate-action-plan-2569.mjs
 * Parse FY2569 Green Office action plan workbook → src/data/generated/action-plan-2569.json
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as XLSX from 'xlsx';
import { writeJsonFile } from './lib/serialize-json.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Canonical category titles (authoritative — เกณฑ์การประเมินสำนักงานสีเขียว-ปี-2569.pdf)
// sourced from src/data/criteria/categories.json so the generator never drifts.
const criteriaCategories = JSON.parse(
  readFileSync(join(ROOT, 'src/data/criteria/categories.json'), 'utf8'),
).categories;
const CANONICAL_CATEGORY_TITLES = new Map(
  criteriaCategories.map((c) => [String(c.id), c.title.th]),
);

const SOURCE_INCOMING = join(
  ROOT,
  'incoming/about-2569/1.1.4 แผนการดำเนินงานสำนักงานสีเขียว 2569_6-5-69.xlsx',
);
const SOURCE_PUBLIC = join(ROOT, 'public/documents/about/2569/green-office-action-plan-2569.xlsx');
const OUT = join(ROOT, 'src/data/generated/action-plan-2569.json');

const MONTHS = [
  { id: 'jan', labelTh: 'ม.ค.' },
  { id: 'feb', labelTh: 'ก.พ.' },
  { id: 'mar', labelTh: 'มี.ค.' },
  { id: 'apr', labelTh: 'เม.ย.' },
  { id: 'may', labelTh: 'พ.ค.' },
  { id: 'jun', labelTh: 'มิ.ย.' },
  { id: 'jul', labelTh: 'ก.ค.' },
  { id: 'aug', labelTh: 'ส.ค.' },
  { id: 'sep', labelTh: 'ก.ย.' },
  { id: 'oct', labelTh: 'ต.ค.' },
  { id: 'nov', labelTh: 'พ.ย.' },
  { id: 'dec', labelTh: 'ธ.ค.' },
];

const MONTH_LABELS = new Set(MONTHS.map((m) => m.labelTh));

function cell(v) {
  return String(v ?? '')
    .replace(/\r\n/g, '\n')
    .trim();
}

function isPlanKind(v) {
  return cell(v).startsWith('แผน');
}

function isResultKind(v) {
  return cell(v).startsWith('ผล');
}

function parseMonthCells(row) {
  const planned = [];
  const actual = [];
  for (let i = 0; i < 12; i++) {
    const raw = cell(row[4 + i]);
    if (!raw || MONTH_LABELS.has(raw) || raw === '2569') continue;
    if (raw === '/') planned.push(MONTHS[i].id);
    else actual.push({ monthId: MONTHS[i].id, value: raw });
  }
  return { planned, actual };
}

function slugPart(s) {
  return cell(s).replace(/[^\w\d.-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function parseWorkbook(rows) {
  const categories = [];
  let currentCategory = null;
  let currentIndicator = '';
  let activitySeq = 0;
  const consumed = new Set();

  for (let i = 0; i < rows.length; i++) {
    if (consumed.has(i)) continue;
    const row = rows[i];
    const c0 = cell(row[0]);
    const c1 = cell(row[1]);

    const catMatch = /^หมวด\s*(\d+)/.exec(c0);
    if (catMatch) {
      currentCategory = {
        id: `cat-${catMatch[1]}`,
        number: catMatch[1],
        titleTh: c1 || c0.replace(/^หมวด\s*\d+\s*/, '').trim() || c0,
        activities: [],
      };
      categories.push(currentCategory);
      currentIndicator = '';
      activitySeq = 0;
      continue;
    }

    if (/^\d+\.\d+(\.\d+)?$/.test(c0) && !isPlanKind(row[2])) {
      currentIndicator = c0;
      continue;
    }

    if (!isPlanKind(row[2]) || !currentCategory) continue;

    let taskNumber = null;
    const titleParts = [];

    if (/^\d+(\.\d+)?\)$/.test(c0)) {
      taskNumber = c0;
      if (c1) titleParts.push(c1);
    } else if (/^\d+\.\d+(\.\d+)?$/.test(c0)) {
      taskNumber = c0;
      currentIndicator = c0;
      if (c1) titleParts.push(c1);
    } else {
      const prev = rows[i - 1];
      const p0 = cell(prev?.[0]);
      if (/^\d+(\.\d+)?\)$/.test(p0) && !isPlanKind(prev?.[2])) {
        taskNumber = p0;
        const pt = cell(prev[1]);
        if (pt) titleParts.push(pt);
      }
      if (c1) titleParts.push(c1);
    }

    if (titleParts.length === 0) continue;

    let resultRow = null;
    if (i + 1 < rows.length && isResultKind(rows[i + 1][2]) && !cell(rows[i + 1][0])) {
      resultRow = rows[i + 1];
      consumed.add(i + 1);
    }

    activitySeq += 1;
    const { planned } = parseMonthCells(row);
    let actualFromResult = [];
    if (resultRow) actualFromResult = parseMonthCells(resultRow).actual;

    const indicatorCode =
      /^\d+\.\d+(\.\d+)?$/.test(taskNumber ?? '') ? taskNumber : currentIndicator || null;

    currentCategory.activities.push({
      id: `${currentCategory.id}-${slugPart(indicatorCode || 'item')}-${slugPart(taskNumber || String(activitySeq))}-${activitySeq}`,
      indicatorCode: indicatorCode || null,
      taskNumber,
      activityTh: titleParts.map((p) => p.trim()).filter(Boolean).join('\n'),
      frequency: cell(row[3]) || null,
      responsible: cell(row[16]) || null,
      plannedMonths: planned,
      actualMonths: actualFromResult,
    });
  }

  return categories;
}

function buildSummary(categories) {
  const timelinePlanned = Object.fromEntries(MONTHS.map((m) => [m.id, 0]));
  let activityCount = 0;
  let withActual = 0;
  let plannedMarks = 0;

  for (const cat of categories) {
    for (const act of cat.activities) {
      activityCount += 1;
      if (act.actualMonths.length > 0) withActual += 1;
      for (const m of act.plannedMonths) {
        timelinePlanned[m] = (timelinePlanned[m] ?? 0) + 1;
        plannedMarks += 1;
      }
    }
  }

  return {
    fiscalYear: 2569,
    categoryCount: categories.length,
    activityCount,
    activitiesWithActualMonths: withActual,
    plannedMonthMarks: plannedMarks,
    timelinePlanned,
  };
}

function main() {
  const sourcePath = existsSync(SOURCE_INCOMING) ? SOURCE_INCOMING : SOURCE_PUBLIC;
  if (!existsSync(sourcePath)) {
    console.error('Action plan workbook not found:', SOURCE_INCOMING);
    process.exit(1);
  }

  const wb = XLSX.read(readFileSync(sourcePath), { type: 'buffer' });
  const sheetName = wb.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: '' });

  const categories = parseWorkbook(rows);
  const summary = buildSummary(categories);

  const payload = {
    schemaVersion: 1,
    fiscalYear: 2569,
    titleTh: cell(rows[0]?.[0]) || 'แผน/ผลการดำเนินโครงการสำนักงานสีเขียว (Green Office)',
    source: {
      workbookSheet: sheetName,
      workbookSheets: wb.SheetNames,
      sourcePathIncoming: 'incoming/about-2569/1.1.4 แผนการดำเนินงานสำนักงานสีเขียว 2569_6-5-69.xlsx',
      publicDownloadPath: '/documents/about/2569/green-office-action-plan-2569.xlsx',
      extractionScript: 'scripts/generate-action-plan-2569.mjs',
    },
    months: MONTHS,
    summary,
    categories: categories.map(({ activities, ...cat }) => ({
      ...cat,
      titleTh: CANONICAL_CATEGORY_TITLES.get(String(cat.number)) ?? cat.titleTh,
      activityCount: activities.length,
      activities,
    })),
  };

  writeJsonFile(OUT, payload);
  console.log(
    `action-plan-2569: sheets=${wb.SheetNames.length} categories=${categories.length} activities=${summary.activityCount} → ${OUT}`,
  );
}

main();
