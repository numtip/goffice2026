#!/usr/bin/env node

/**
 * import-dashboard-data.mjs
 * =========================
 * Excel → JSON import pipeline for Green Office multi-year dashboards.
 *
 * Staff workflow:
 *   1. Export Excel data to CSV using the template format (month,value per row).
 *   2. Drop the CSV into data/import/{metric}-{year}.csv
 *   3. Run: node scripts/import-dashboard-data.mjs --metric=water --year=2569
 *
 * The script validates, normalizes, and writes generated JSON to
 * src/data/generated/{metric}.json.
 *
 * Zero dependencies — uses only Node.js built-ins (fs, path).
 *
 * Usage:
 *   node scripts/import-dashboard-data.mjs --help
 *   node scripts/import-dashboard-data.mjs --metric=water --year=2569 --input=data/import/water-2569.csv --source="1.1-Water.xlsx"
 *   node scripts/import-dashboard-data.mjs --metric=energy --year=2569 --input=data/import/energy-2569.csv
 *   node scripts/import-dashboard-data.mjs --all   (imports all available CSVs from data/import/)
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateMonthData, monthLabel, formatValidationReport } from './data-validator.mjs';

// ── Config ───────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const GENERATED_DIR = join(PROJECT_ROOT, 'src', 'data', 'generated');
const IMPORT_DIR = join(PROJECT_ROOT, 'data', 'import');

const METRIC_CONFIG = {
  energy: {
    label: 'Electricity Consumption',
    unit: 'kWh',
    kpiField: 'kwh',
    csvField: 'kwh',
    description: 'Electricity consumption in kilowatt-hours',
    excelSource: '12-elect.xlsx',
  },
  water: {
    label: 'Water Consumption',
    unit: 'm³',
    kpiField: 'cubic_meters',
    csvField: 'cubic_meters',
    description: 'Water consumption in cubic meters',
    excelSource: '1.1-Water.xlsx',
  },
  fuel: {
    label: 'Fuel Consumption',
    unit: 'L',
    kpiField: 'liters',
    csvField: 'liters',
    description: 'Fuel consumption in liters',
    excelSource: '1.3_Gassolene.xlsx',
  },
  paper: {
    label: 'Paper Consumption',
    unit: 'kg',
    kpiField: 'kg_estimated',
    csvField: 'kg_estimated',
    description: 'Paper consumption in kg',
    excelSource: '1.4_Paper.xlsx',
  },
  waste: {
    label: 'Waste Management',
    unit: '%',
    kpiField: 'recycle_pct',
    csvField: 'recycle_pct',
    description: 'Waste recycling rate percentage',
    excelSource: '1.5_Waste.xlsx',
  },
  ghg: {
    label: 'GHG Emissions',
    unit: 'tCO₂e',
    kpiField: 'total_tco2e',
    csvField: 'total_tco2e',
    description: 'Greenhouse gas emissions in tCO₂e',
    excelSource: '1.5_GreenhouseGas.xlsx',
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Excel Import Workflow — Green Office Dashboard Data Pipeline

Usage:
  node scripts/import-dashboard-data.mjs [options]

Options:
  --metric=<name>    Metric to import (energy|water|fuel|paper|waste|ghg)
  --year=<number>    Year for this data (e.g. 2569)
  --input=<path>     Path to input CSV file
  --source=<string>  Description of source file (e.g. "1.1-Water.xlsx")
  --all              Import all CSV files found in data/import/
  --dry-run          Validate but do not write
  --force            Overwrite existing data without prompt
  --help             Show this help message

Examples:
  node scripts/import-dashboard-data.mjs --metric=water --year=2569 --input=data/import/water-2569.csv
  node scripts/import-dashboard-data.mjs --all --dry-run
    `.trim());
    process.exit(0);
  }

  const parsed = {};
  for (const arg of args) {
    if (arg.startsWith('--')) {
      const eqIdx = arg.indexOf('=');
      if (eqIdx === -1) {
        parsed[arg.slice(2)] = true;
      } else {
        parsed[arg.slice(2, eqIdx)] = arg.slice(eqIdx + 1);
      }
    }
  }
  return parsed;
}

function parseMonthCsv(csvPath) {
  const raw = readFileSync(csvPath, 'utf-8').trim();
  const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  if (lines.length < 2) {
    return { rows: [], errors: ['CSV file is empty or has no data rows'] };
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  if (!headers.includes('month') || !headers.includes('value')) {
    return { rows: [], errors: [
      `CSV must have 'month' and 'value' columns. Found: ${headers.join(', ')}`
    ]};
  }

  const monthIdx = headers.indexOf('month');
  const valueIdx = headers.indexOf('value');
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    rows.push({
      month: vals[monthIdx] || '',
      value: vals[valueIdx] || '',
    });
  }

  return { rows, errors: [] };
}

function readExistingJson(metric) {
  const filePath = join(GENERATED_DIR, `${metric}.json`);
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function writeGeneratedJson(metric, data) {
  const filePath = join(GENERATED_DIR, `${metric}.json`);
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  return filePath;
}

function computeYearData(year, isBaseline, months, source) {
  const total = months.reduce((s, m) => s + m.value, 0);
  const avg = months.length > 0 ? Math.round((total / months.length) * 100) / 100 : 0;
  const dataStatus = months.length >= 12 ? 'complete' : 'in_progress';
  return {
    year,
    isBaseline,
    months: months.map(m => ({
      month: m.month,
      value: m.value,
      label: monthLabel(m.month),
    })),
    total,
    average: avg,
    dataStatus,
    source,
    updated: new Date().toISOString().slice(0, 10),
  };
}

function computeYoy(baselineTotal, currentTotal) {
  if (!baselineTotal || baselineTotal === 0) {
    return { absolute: 0, percent: 0, direction: 'stable' };
  }
  const absolute = currentTotal - baselineTotal;
  const percent = Math.round((absolute / baselineTotal) * 100);
  const direction = percent > 0 ? 'up' : percent < 0 ? 'down' : 'stable';
  return { absolute, percent, direction };
}

// ── Main Import Logic ─────────────────────────────────────────────────────────

function importMetric(metric, year, csvPath, sourceDesc, dryRun) {
  const cfg = METRIC_CONFIG[metric];
  if (!cfg) {
    console.error(`❌ Unknown metric: '${metric}'. Valid: ${Object.keys(METRIC_CONFIG).join(', ')}`);
    return false;
  }

  if (!existsSync(csvPath)) {
    console.error(`❌ Input file not found: ${csvPath}`);
    return false;
  }

  // 1. Parse CSV
  const { rows, errors: parseErrors } = parseMonthCsv(csvPath);
  if (parseErrors.length > 0) {
    console.error(`❌ Parse error: ${parseErrors.join('; ')}`);
    return false;
  }

  // 2. Validate
  const isComplete = (year === 2568); // Baseline must be complete
  const validationErrors = validateMonthData(rows, {
    year,
    allowIncomplete: !isComplete,
  });

  if (validationErrors.length > 0) {
    console.error(formatValidationReport(validationErrors));
    if (isComplete) {
      console.error(`   Baseline data (${year}) must have all 12 months.`);
    }
    return false;
  }

  // 3. Normalize — convert string values to numbers
  const normalizedMonths = rows.map(r => ({
    month: Number(r.month),
    value: Number(r.value),
  })).sort((a, b) => a.month - b.month);

  const monthCount = normalizedMonths.length;
  const totalValue = normalizedMonths.reduce((s, m) => s + m.value, 0);

  // 4. Determine if this is the current year (2569) or baseline (2568)
  const isBaseline = (year <= 2568);

  // 5. Build source description
  const monthStatus = monthCount >= 12 ? 'complete' : `partial, ${monthCount} of 12 months`;
  const source = sourceDesc
    ? `${cfg.excelSource} (${sourceDesc}) — ${monthStatus}`
    : `${cfg.excelSource} converted — ${monthStatus}`;

  // 6. Build the new year data
  const newYearData = computeYearData(Number(year), isBaseline, normalizedMonths, source);

  // 7. Read existing JSON and merge
  const existing = readExistingJson(metric);
  let metricJson;

  if (existing) {
    metricJson = { ...existing };
    // Update or add the year
    metricJson.years = { ...existing.years, [String(year)]: newYearData };

    // Recompute YoY if both years present
    const baselineYearData = metricJson.years[String(metricJson.baselineYear)];
    const currentYearData = metricJson.years[String(metricJson.currentYear)];
    if (baselineYearData && currentYearData) {
      metricJson.yoyChange = computeYoy(baselineYearData.total, currentYearData.total);
    }
  } else {
    // Create new metric JSON
    const baselineYr = Number(year) === 2568 ? 2568 : 2568;
    const currentYr = Number(year) === 2569 ? 2569 : 2569;
    metricJson = {
      metric,
      label: cfg.label,
      unit: cfg.unit,
      kpiField: cfg.kpiField,
      baselineYear: baselineYr,
      currentYear: currentYr,
      years: {
        [String(year)]: newYearData,
      },
      yoyChange: { absolute: 0, percent: 0, direction: 'stable' },
    };
  }

  // Ensure baseline/current year references are correct
  metricJson.baselineYear = 2568;
  metricJson.currentYear = 2569;

  // 8. Report
  const report = [
    `\n📊 Import Report: ${cfg.label}`,
    `   Metric:        ${metric}`,
    `   Year:          ${year}${isBaseline ? ' (Baseline)' : ' (Current)'}`,
    `   Months:        ${monthCount}/12`,
    `   Total:         ${totalValue.toLocaleString()} ${cfg.unit}`,
    `   Status:        ${newYearData.dataStatus}`,
    `   Source:        ${source}`,
    `   Input file:    ${csvPath}`,
    `   Output:        ${join(GENERATED_DIR, `${metric}.json`)}`,
  ];
  console.log(report.join('\n'));

  // 9. Write
  if (dryRun) {
    console.log('   🏁 Dry run — no files written.');
  } else {
    const outPath = writeGeneratedJson(metric, metricJson);
    console.log(`   ✅ Wrote ${outPath}`);
  }

  return true;
}

// ── CLI Entry ─────────────────────────────────────────────────────────────────

function main() {
  const args = parseArgs();

  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  Green Office Dashboard Data Import Pipeline ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log();

  if (args.all) {
    // Import all CSVs found in data/import/
    if (!existsSync(IMPORT_DIR)) {
      console.error(`❌ Import directory not found: ${IMPORT_DIR}`);
      process.exit(1);
    }

    const files = readdirSync(IMPORT_DIR).filter(f => f.endsWith('.csv'));
    if (files.length === 0) {
      console.log('No CSV files found in data/import/.');
      console.log('Place your CSV files there and re-run.');
      process.exit(0);
    }

    let successCount = 0;
    let failCount = 0;

    for (const file of files) {
      // Parse metric and year from filename: {metric}-{year}.csv
      const baseName = file.replace('.csv', '');
      const parts = baseName.split('-');
      const year = parts.pop();
      const metric = parts.join('-');

      if (!METRIC_CONFIG[metric]) {
        console.warn(`⚠️  Skipping ${file}: unknown metric '${metric}'`);
        failCount++;
        continue;
      }

      const csvPath = join(IMPORT_DIR, file);
      console.log(`\n── Processing: ${file} ──`);
      const ok = importMetric(metric, year, csvPath, file, args['dry-run']);
      if (ok) successCount++; else failCount++;
    }

    console.log(`\n── Batch complete: ${successCount} succeeded, ${failCount} failed ──`);

  } else if (args.metric && args.year) {
    const metric = args.metric;
    const year = args.year;
    const csvPath = args.input || join(IMPORT_DIR, `${metric}-${year}.csv`);
    const source = args.source || '';

    const ok = importMetric(metric, year, csvPath, source, args['dry-run']);
    process.exit(ok ? 0 : 1);

  } else {
    console.error('❌ Missing required arguments.');
    console.error('   Use --help for usage information.');
    process.exit(1);
  }
}

main();
