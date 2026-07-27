#!/usr/bin/env node
/**
 * Day 1 resource data reconciliation.
 * Removes unverified 2569 placeholder/demo values and writes truthful status flags.
 * Does NOT invent targets or current-year values.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeJsonFile } from './lib/serialize-json.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const GENERATED = join(ROOT, 'src', 'data', 'generated');
const DATA_DIR = join(ROOT, 'data');

const DAY1 = '2026-07-27';

/** @type {Record<string, { workbook: string, baselineStatus: string, current2569: { reason: string, xlsxPresent: boolean, sheets?: string[] } }>} */
const RECONCILIATION = {
  energy: {
    workbook: 'docs/12-elect.xlsx',
    baselineStatus: 'VERIFIED_BASELINE',
    current2569: {
      reason: 'Workbook missing from repository. Previous CSV/demo values removed — no 2569 data available.',
      xlsxPresent: false,
    },
  },
  water: {
    workbook: 'docs/1.1-Water.xlsx',
    baselineStatus: 'VERIFIED_BASELINE',
    current2569: {
      reason: 'Source workbook present but has no 2569 sheet (only 2567, 2568). Demo placeholder values removed.',
      xlsxPresent: true,
      sheets: ['2567', '2568'],
    },
  },
  fuel: {
    workbook: 'docs/1.3_Gassolene.xlsx',
    baselineStatus: 'VERIFIED_BASELINE',
    current2569: {
      reason: 'Workbook missing from repository. Implausible placeholder values (4667% YoY) removed.',
      xlsxPresent: false,
    },
  },
  paper: {
    workbook: 'docs/1.4_Paper.xlsx',
    baselineStatus: 'VERIFIED_BASELINE',
    current2569: {
      reason: 'Workbook missing from repository. Placeholder current-year values removed.',
      xlsxPresent: false,
    },
  },
  waste: {
    workbook: 'docs/1.5_Waste.xlsx',
    baselineStatus: 'VERIFIED_BASELINE',
    current2569: {
      reason: 'No 2569 waste mass data in source workbook.',
      xlsxPresent: false,
    },
  },
  recycling_rate: {
    workbook: 'docs/1.5_Waste.xlsx',
    baselineStatus: 'VERIFIED_BASELINE',
    current2569: {
      reason: 'Workbook missing from repository. Placeholder recycling rate values removed.',
      xlsxPresent: false,
    },
  },
  ghg: {
    workbook: 'docs/1.5_GreenhouseGas.xlsx',
    baselineStatus: 'VERIFIED_BASELINE',
    current2569: {
      reason: 'Workbook missing from repository. Placeholder current-year values removed.',
      xlsxPresent: false,
    },
  },
};

function emptyYear2569(metric, config, aggregation = 'sum') {
  return {
    year: 2569,
    isBaseline: false,
    months: [],
    total: 0,
    average: 0,
    dataStatus: 'CURRENT_DATA_PENDING',
    source: config.current2569.reason,
    updated: DAY1,
    provenance: {
      sourceWorkbook: config.workbook,
      extractionStatus: 'NO_2569_DATA',
      validationStatus: 'CURRENT_DATA_PENDING',
      reconciliationDay1: DAY1,
      xlsxPresent: config.current2569.xlsxPresent,
      ...(config.current2569.sheets ? { availableSheets: config.current2569.sheets } : {}),
    },
    quality: {
      valid: false,
      warnings: [config.current2569.reason],
      reconciliationDifference: null,
    },
    aggregation,
    dataClassification: 'PLACEHOLDER',
  };
}

function reconcileMetric(metric, aggregation = 'sum') {
  const path = join(GENERATED, `${metric}.json`);
  if (!existsSync(path)) {
    console.warn(`  skip ${metric}: file not found`);
    return null;
  }

  const config = RECONCILIATION[metric];
  const data = JSON.parse(readFileSync(path, 'utf8'));
  const baseline = data.years?.[String(data.baselineYear)];

  data.years['2569'] = emptyYear2569(metric, config, aggregation);
  data.status = 'CURRENT_DATA_PENDING';
  data.yoyChange = {
    absolute: 0,
    percent: 0,
    direction: 'stable',
  };

  writeJsonFile(path, data);

  return {
    metric,
    unit: data.unit,
    baselineYear: data.baselineYear,
    baselineTotal: baseline?.total ?? null,
    baselineStatus: baseline?.dataStatus ?? config.baselineStatus,
    currentYear: 2569,
    currentTotal: 0,
    currentStatus: 'CURRENT_DATA_PENDING',
    dataClassification: 'PLACEHOLDER',
    workbook: config.workbook,
    xlsxPresent: config.current2569.xlsxPresent,
    verified: false,
    note: config.current2569.reason,
  };
}

const statusEntries = [];
for (const [metric, config] of Object.entries(RECONCILIATION)) {
  const aggregation = metric === 'recycling_rate' ? 'average' : 'sum';
  const entry = reconcileMetric(metric, aggregation);
  if (entry) {
    statusEntries.push(entry);
    console.log(`  ✓ ${metric}: cleared unverified 2569 data`);
  }
}

const statusReport = {
  version: '1.0.0',
  generated: DAY1,
  sprint: 'GOFFICE2026-RAPID-DAY1',
  summary: {
    totalResources: 6,
    metricsTracked: statusEntries.length,
    baselineVerified: statusEntries.filter((e) => e.baselineStatus === 'VERIFIED_BASELINE').length,
    currentYearVerified: 0,
    currentYearPending: statusEntries.length,
    xlsxOnDisk: statusEntries.filter((e) => e.xlsxPresent).length,
  },
  resources: statusEntries,
  actionRequired: [
    'Obtain missing XLSX workbooks from Green Office data owner (energy, fuel, paper, waste, GHG).',
    'Add 2569 sheet/data to source workbooks when available.',
    'Run extract-xlsx-to-csv.mjs → data:build after workbooks arrive.',
    'Do NOT populate dashboard targets until authorized staff sets them.',
  ],
};

writeJsonFile(join(DATA_DIR, 'reconciliation-status.json'), statusReport);
console.log(`\nWrote ${join(DATA_DIR, 'reconciliation-status.json')}`);
