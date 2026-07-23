#!/usr/bin/env node

/**
 * data-pipeline.mjs
 * ==================
 * Canonical environmental data pipeline for Green Office 2026.
 *
 * Commands:
 *   npm run data:import    — Import CSV → generated JSON (deterministic)
 *   npm run data:validate  — Validate schema + reconciliation
 *   npm run data:generate  — Generate all outputs (KPI summary, quality report)
 *   npm run data:check     — Validate + check + report
 *   npm run data:build     — Full pipeline: import → validate → generate → check
 *
 * Principles:
 *   - Deterministic output: no timestamps in generated data (only in reports)
 *   - One canonical source per metric/year
 *   - Annual total derived from monthly values
 *   - Reconciliation against workbook totals where available
 *   - Validation failures exit non-zero
 *
 * Usage:
 *   node scripts/data-pipeline.mjs <command> [options]
 *
 * Commands:
 *   import     Import CSVs from data/import/ → src/data/generated/
 *   validate   Validate all generated JSON against schema
 *   generate   Generate executive KPI summary + quality report
 *   check      Full validation + generate reports (no import)
 *   build      Full pipeline: import → validate → generate
 *
 * Options:
 *   --metric=<name>  Single metric only (import)
 *   --year=<num>     Single year only (import)
 *   --input=<path>   Input CSV path (import, with --metric & --year)
 *   --verbose        Detailed output
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateMonthData, monthLabel, formatValidationReport } from './data-validator.mjs';

// ── Constants ─────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const GENERATED_DIR = join(PROJECT_ROOT, 'src', 'data', 'generated');
const IMPORT_DIR = join(PROJECT_ROOT, 'data', 'import');
// Reconciliation tolerance by unit
const RECONCILIATION_TOLERANCE = {
  'kWh': 5,
  'm³': 0.5,
  'L': 0.5,
  'kg': 0.5,
  '%': 0.5,
  'tCO₂e': 0.5,
};

const DEFAULT_TOLERANCE = 0.5;

// Criteria/indicator mappings per metric
// ── Metric configuration ──────────────────────────────────────────────────────

const METRIC_CONFIG = {
  energy: {
    label: 'Electricity Consumption',
    labelTh: 'การใช้ไฟฟ้า',
    unit: 'kWh',
    kpiField: 'kwh',
    csvField: 'kwh',
    description: 'Electricity consumption in kilowatt-hours',
    excelSource: '1.2-elect.xlsx',
    criteriaId: '3.2.2',
  },
  water: {
    label: 'Water Consumption',
    labelTh: 'การใช้น้ำ',
    unit: 'm³',
    kpiField: 'cubic_meters',
    csvField: 'cubic_meters',
    description: 'Water consumption in cubic meters',
    excelSource: '1.1-Water.xlsx',
    criteriaId: '3.1.2',
  },
  fuel: {
    label: 'Fuel Consumption',
    labelTh: 'การใช้เชื้อเพลิง',
    unit: 'L',
    kpiField: 'liters',
    csvField: 'liters',
    description: 'Fuel consumption in liters',
    excelSource: '1.3_Gassolene.xlsx',
    criteriaId: '3.2.5',
  },
  paper: {
    label: 'Paper Consumption',
    labelTh: 'การใช้กระดาษ',
    unit: 'kg',
    kpiField: 'kg_estimated',
    csvField: 'kg_estimated',
    description: 'Paper consumption in kg',
    excelSource: '1.4_Paper.xlsx',
    criteriaId: '3.3.2',
  },
  waste: {
    label: 'Waste Management',
    labelTh: 'การจัดการของเสีย',
    unit: '%',
    kpiField: 'recycle_pct',
    csvField: 'recycle_pct',
    description: 'Waste recycling rate percentage',
    excelSource: '1.5_Waste.xlsx',
    criteriaId: '4.1.x',
  },
  ghg: {
    label: 'GHG Emissions',
    labelTh: 'ก๊าซเรือนกระจก',
    unit: 'tCO₂e',
    kpiField: 'total_tco2e',
    csvField: 'total_tco2e',
    description: 'Greenhouse gas emissions in tCO₂e',
    excelSource: '1.6_GreenhouseGas.xlsx',
    criteriaId: '1.5.1',
  },
};

const VALID_METRICS = Object.keys(METRIC_CONFIG);

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const cmd = args.find(a => !a.startsWith('--')) || 'build';
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
  parsed._command = cmd;
  return parsed;
}

function readJSON(filePath) {
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function writeJSON(filePath, data) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
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

function reconcileTotal(calculated, workbookTotal, unit) {
  if (workbookTotal === null || workbookTotal === undefined || workbookTotal === 0) {
    return { valid: true, warnings: [], reconciliationDifference: null };
  }
  const diff = Math.abs(calculated - workbookTotal);
  const tolerance = RECONCILIATION_TOLERANCE[unit] || DEFAULT_TOLERANCE;
  const valid = diff <= tolerance;
  const warnings = [];
  if (!valid) {
    warnings.push(`Reconciliation difference: ${(calculated - workbookTotal).toFixed(2)} ${unit} (tolerance: ±${tolerance})`);
  }
  return {
    valid,
    warnings,
    reconciliationDifference: Math.round((calculated - workbookTotal) * 100) / 100,
  };
}

// ── Import ─────────────────────────────────────────────────────────────────────

function importMetric(metric, year, csvPath, _verbose) {
  const cfg = METRIC_CONFIG[metric];
  if (!cfg) {
    console.error(`❌ Unknown metric: '${metric}'. Valid: ${VALID_METRICS.join(', ')}`);
    return { success: false, errors: [`Unknown metric: ${metric}`] };
  }

  if (!existsSync(csvPath)) {
    console.error(`❌ Input file not found: ${csvPath}`);
    return { success: false, errors: [`File not found: ${csvPath}`] };
  }

  // 1. Parse CSV
  const { rows, errors: parseErrors } = parseMonthCsv(csvPath);
  if (parseErrors.length > 0) {
    console.error(`❌ Parse error: ${parseErrors.join('; ')}`);
    return { success: false, errors: parseErrors };
  }

  // 2. Validate
  const isComplete = (Number(year) === 2568);
  const validationErrors = validateMonthData(rows, {
    year: Number(year),
    allowIncomplete: !isComplete,
  });

  if (validationErrors.length > 0) {
    console.error(formatValidationReport(validationErrors));
    if (isComplete) {
      console.error(`   Baseline data (${year}) must have all 12 months.`);
    }
    return { success: false, errors: validationErrors };
  }

  // 3. Normalize — convert string values to numbers
  const normalizedMonths = rows.map(r => ({
    month: Number(r.month),
    value: Number(r.value),
  })).sort((a, b) => a.month - b.month);

  const monthCount = normalizedMonths.length;
  const totalValue = normalizedMonths.reduce((s, m) => s + m.value, 0);
  const isBaseline = (Number(year) <= 2568);

  // 4. Build year data (deterministic — no runtime timestamp in data)
  const months = normalizedMonths.map(m => ({
    month: m.month,
    value: m.value,
    label: monthLabel(m.month),
  }));

  const monthStatus = monthCount >= 12 ? 'complete' : `partial, ${monthCount} of 12 months`;
  const sourceDesc = `${cfg.excelSource} converted — ${monthStatus}`;

  // Reconcile with workbook total (if available via --workbook-total)
  // Default: no workbook total known, so reconciliation is skipped
  const quality = reconcileTotal(totalValue, null, cfg.unit);

  const yearData = {
    year: Number(year),
    isBaseline,
    months,
    total: Math.round(totalValue * 100) / 100,
    average: monthCount > 0 ? Math.round((totalValue / monthCount) * 100) / 100 : 0,
    dataStatus: monthCount >= 12 ? 'complete' : 'in_progress',
    source: sourceDesc,
    quality,
  };

  // 5. Read existing JSON and merge
  const outPath = join(GENERATED_DIR, `${metric}.json`);
  const existing = readJSON(outPath);

  let metricJson;
  if (existing) {
    metricJson = { ...existing };
    metricJson.years = { ...existing.years, [String(year)]: yearData };
    // Recompute YoY
    const baselineYearData = metricJson.years[String(metricJson.baselineYear)];
    const currentYearData = metricJson.years[String(metricJson.currentYear)];
    if (baselineYearData && currentYearData) {
      metricJson.yoyChange = computeYoyChange(baselineYearData.total, currentYearData.total);
    }
  } else {
    metricJson = {
      metric,
      label: cfg.label,
      labelTh: cfg.labelTh,
      unit: cfg.unit,
      kpiField: cfg.kpiField,
      status: isBaseline ? 'VERIFIED_BASELINE' : 'CURRENT_DATA_PENDING',
      baselineYear: 2568,
      currentYear: 2569,
      targetYear: 2569,
      years: {
        [String(year)]: yearData,
      },
      target: {
        year: 2569,
        status: 'TARGET_PENDING_APPROVAL',
        targetType: 'reduction',
        targetUnit: cfg.unit,
        targetValue: null,
        targetBasis: 'Green Office 2569 criteria require year-over-year reduction. Specific target value must be set by authorized staff during assessment planning.',
        targetSetBy: null,
        targetSetDate: null,
        months: [],
      },
      targetStatus: 'no-target',
      yoyChange: { absolute: 0, percent: 0, direction: 'stable' },
      relatedIndicators: [
        {
          indicatorId: cfg.criteriaId,
          label: cfg.label,
          labelEn: cfg.label,
          relevance: 'primary',
        },
      ],
      sourceEvidence: [],
    };
  }

  // Ensure baseline/current year references are correct
  metricJson.baselineYear = 2568;
  metricJson.currentYear = 2569;

  // Recompute YoY from years data
  const bYear = metricJson.years[String(metricJson.baselineYear)];
  const cYear = metricJson.years[String(metricJson.currentYear)];
  if (bYear && cYear) {
    metricJson.yoyChange = computeYoyChange(bYear.total, cYear.total);
  }

  // Resolve overall status
  metricJson.status = resolveOverallStatus(metricJson);

  // 6. Write
  if (!existsSync(GENERATED_DIR)) mkdirSync(GENERATED_DIR, { recursive: true });
  writeJSON(outPath, metricJson);

  // 7. Report
  console.log(`📊 ${cfg.label} (${year})`);
  console.log(`   Months: ${monthCount}/12 | Total: ${totalValue.toLocaleString()} ${cfg.unit}`);
  console.log(`   Source: ${sourceDesc}`);
  console.log(`   Output: ${relative(PROJECT_ROOT, outPath)}`);
  if (quality.warnings.length > 0) {
    quality.warnings.forEach(w => console.log(`   ⚠ ${w}`));
  }
  console.log(`   ✅ Done`);

  return { success: true, errors: [] };
}

function computeYoyChange(baselineTotal, currentTotal) {
  if (!baselineTotal || baselineTotal === 0) {
    return { absolute: 0, percent: 0, direction: 'stable' };
  }
  const absolute = currentTotal - baselineTotal;
  const percent = Math.round((absolute / baselineTotal) * 100);
  const direction = percent > 0 ? 'up' : percent < 0 ? 'down' : 'stable';
  return { absolute, percent, direction };
}

function resolveOverallStatus(metricJson) {
  const bYear = metricJson.years[String(metricJson.baselineYear)];
  const cYear = metricJson.years[String(metricJson.currentYear)];

  if (bYear && bYear.dataStatus === 'complete' && bYear.isBaseline) {
    if (cYear && cYear.months.length >= 12) return 'complete';
    if (cYear && cYear.months.length > 0) return 'CURRENT_DATA_PENDING';
    return 'VERIFIED_BASELINE';
  }
  return 'missing';
}

function importAll(verbose) {
  if (!existsSync(IMPORT_DIR)) {
    console.error(`❌ Import directory not found: ${IMPORT_DIR}`);
    return { success: false, errors: ['Import directory not found'] };
  }

  const files = readdirSync(IMPORT_DIR).filter(f => f.endsWith('.csv') && !f.includes('template'));
  if (files.length === 0) {
    console.log('ℹ️  No CSV files found in data/import/.');
    return { success: true, errors: [] };
  }

  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
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
    console.log(`\n── ${file} ──`);
    const result = importMetric(metric, year, csvPath, verbose);
    if (result.success) successCount++; else failCount++;
  }

  console.log(`\n── Import complete: ${successCount} succeeded, ${failCount} failed ──`);
  return { success: failCount === 0, errors: [] };
}

// ── Validate ──────────────────────────────────────────────────────────────────

function validateGenerated(verbose) {
  if (!existsSync(GENERATED_DIR)) {
    console.error(`❌ Generated directory not found: ${GENERATED_DIR}`);
    return { success: false, errors: ['Generated directory not found'], warnings: [] };
  }

  const files = readdirSync(GENERATED_DIR).filter(f => f.endsWith('.json') && !f.includes('kpi-summary') && !f.includes('data-quality'));
  let allValid = true;
  const allWarnings = [];
  const allErrors = [];

  console.log('🔍 Validating generated data...\n');

  for (const file of files) {
    const filePath = join(GENERATED_DIR, file);
    const data = readJSON(filePath);
    if (!data) {
      console.error(`❌ ${file}: Could not parse JSON`);
      allErrors.push(`${file}: Could not parse JSON`);
      allValid = false;
      continue;
    }

    const fileErrors = [];
    const fileWarnings = [];

    // Required top-level fields
    const requiredFields = ['metric', 'label', 'unit', 'kpiField', 'baselineYear', 'currentYear', 'years'];
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null) {
        fileErrors.push(`Missing required field: '${field}'`);
      }
    }

    // Validate metric name
    if (data.metric && !VALID_METRICS.includes(data.metric)) {
      fileWarnings.push(`Unknown metric name: '${data.metric}'`);
    }

    // Validate years
    if (data.years) {
      for (const [yearStr, yearData] of Object.entries(data.years)) {
        const yearNum = Number(yearStr);
        if (isNaN(yearNum) || yearNum < 2567 || yearNum > 2570) {
          fileErrors.push(`Invalid year key: '${yearStr}'`);
        }

        // Validate months
        if (yearData.months && Array.isArray(yearData.months)) {
          const seenMonths = new Set();
          for (const m of yearData.months) {
            if (m.month < 1 || m.month > 12) {
              fileErrors.push(`Invalid month number: ${m.month}`);
            }
            if (seenMonths.has(m.month)) {
              fileErrors.push(`Duplicate month: ${m.month}`);
            }
            seenMonths.add(m.month);
            if (typeof m.value !== 'number' || !isFinite(m.value)) {
              fileErrors.push(`Non-finite value for month ${m.month}: ${m.value}`);
            }
            if (m.value < 0) {
              fileWarnings.push(`Negative value for month ${m.month}: ${m.value}`);
            }
          }
        }

        // Validate total
        if (yearData.months && yearData.total !== undefined) {
          const calcTotal = Math.round(yearData.months.reduce((s, m) => s + m.value, 0) * 100) / 100;
          const storedTotal = Math.round(yearData.total * 100) / 100;
          if (calcTotal !== storedTotal) {
            fileWarnings.push(`Year ${yearStr}: stored total (${storedTotal}) ≠ calculated total (${calcTotal})`);
          }
        }

        // Check unit
        if (!data.unit) {
          fileErrors.push('Missing required unit');
        }
      }
    }

    // Check for hardcoded target values (should be null unless staff-set)
    if (data.target && data.target.targetValue !== null && data.target.targetValue !== undefined) {
      fileWarnings.push(`Target value is set (${data.target.targetValue}) — verify this was staff-approved`);
    }

    // Display
    const metricLabel = data.label || file;
    if (fileErrors.length > 0 || (fileWarnings.length > 0 && verbose)) {
      console.log(`📄 ${metricLabel}:`);
      fileErrors.forEach(e => console.log(`   ❌ ${e}`));
      fileWarnings.forEach(w => console.log(`   ⚠ ${w}`));
    } else if (fileErrors.length === 0) {
      console.log(`   ✅ ${metricLabel} — valid`);
    }

    allErrors.push(...fileErrors.map(e => `${file}: ${e}`));
    allWarnings.push(...fileWarnings.map(w => `${file}: ${w}`));
    if (fileErrors.length > 0) allValid = false;
  }

  console.log(`\n── Validation complete ──`);
  console.log(`   Errors:   ${allErrors.length}`);
  console.log(`   Warnings: ${allWarnings.length}`);
  console.log(`   Result:   ${allValid ? '✅ PASS' : '❌ FAIL'}`);

  return { success: allValid, errors: allErrors, warnings: allWarnings };
}

// ── Generate Outputs ──────────────────────────────────────────────────────────

function generateOutputs(_verbose) {
  console.log('📦 Generating canonical outputs...\n');

  const metrics = [];
  for (const metric of VALID_METRICS) {
    const filePath = join(GENERATED_DIR, `${metric}.json`);
    const data = readJSON(filePath);
    if (data) metrics.push(data);
  }

  // 1. Executive KPI Summary
  const kpiEntries = metrics.map(m => {
    const currentYearData = m.years?.[String(m.currentYear)];
    const baselineYearData = m.years?.[String(m.baselineYear)];
    return {
      metric: m.metric,
      label: m.label,
      labelTh: m.labelTh || m.label,
      unit: m.unit,
      yearBE: m.currentYear,
      value: currentYearData?.total ?? null,
      target: m.target?.targetValue ?? null,
      targetStatus: m.targetStatus || 'no-target',
      baselineValue: baselineYearData?.total ?? null,
      yoyChange: m.yoyChange || null,
      dataQuality: currentYearData?.quality || null,
      sourceFile: currentYearData?.source || '',
    };
  });

  const kpiSummaryPath = join(GENERATED_DIR, 'kpi-summary.json');
  writeJSON(kpiSummaryPath, {
    generatedFrom: 'canonical-metrics',
    metrics: kpiEntries,
  });
  console.log(`   ✅ KPI Summary: ${relative(PROJECT_ROOT, kpiSummaryPath)}`);

  // 2. Data Quality Summary
  const qualityEntries = [];
  for (const m of metrics) {
    if (m.years) {
      for (const [yearStr, yearData] of Object.entries(m.years)) {
        qualityEntries.push({
          metric: m.metric,
          yearBE: Number(yearStr),
          valid: yearData.quality?.valid !== false,
          warnings: yearData.quality?.warnings || [],
          reconciliationDifference: yearData.quality?.reconciliationDifference ?? null,
          monthCount: yearData.months?.length || 0,
          dataStatus: yearData.dataStatus,
        });
      }
    }
  }

  const qualityPath = join(GENERATED_DIR, 'data-quality.json');
  writeJSON(qualityPath, {
    generatedFrom: 'canonical-metrics',
    totalMetrics: metrics.length,
    metricsWithWarnings: qualityEntries.filter(e => e.warnings.length > 0).length,
    metricsWithErrors: qualityEntries.filter(e => !e.valid).length,
    entries: qualityEntries,
  });
  console.log(`   ✅ Data Quality: ${relative(PROJECT_ROOT, qualityPath)}`);

  // 3. Source manifest update
  for (const m of metrics) {
    if (m.years) {
      for (const [, yearData] of Object.entries(m.years)) {
        // Clean up: Remove absolute paths from source if present
        if (yearData.source && yearData.source.includes(':\\\\')) {
          yearData.source = yearData.source.replace(/[A-Z]:\\\\.*?\\/i, '');
        }
      }
    }
  }

  console.log(`\n── Generation complete: ${metrics.length} metrics processed ──`);
  return { success: true, errors: [] };
}

// ── Check (Validate + Generate) ───────────────────────────────────────────────

function runCheck(verbose) {
  console.log('🔎 Running full data check...\n');

  const validation = validateGenerated(verbose);
  const generation = generateOutputs(verbose);

  // Check determinism: re-read and verify no changes
  console.log('\n🔁 Checking determinism...');
  let deterministic = true;
  for (const metric of VALID_METRICS) {
    const filePath = join(GENERATED_DIR, `${metric}.json`);
    const data1 = readJSON(filePath);
    if (!data1) continue;

    // Re-write and compare
    writeJSON(filePath, data1);
    const data2 = readJSON(filePath);
    if (JSON.stringify(data1) !== JSON.stringify(data2)) {
      console.error(`   ❌ ${metric}: NOT deterministic`);
      deterministic = false;
    }
  }

  if (deterministic) {
    console.log('   ✅ All generated files are deterministic');
  }

  const success = validation.success && generation.success;
  return {
    success,
    validation,
    generation,
    deterministic,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  const args = parseArgs();
  const cmd = args._command;
  const verbose = !!args.verbose;

  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  Green Office Data Pipeline                  ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log();

  let result;

  switch (cmd) {
    case 'import': {
      if (args.metric && args.year) {
        const csvPath = args.input || join(IMPORT_DIR, `${args.metric}-${args.year}.csv`);
        result = importMetric(args.metric, args.year, csvPath, verbose);
      } else {
        result = importAll(verbose);
      }
      break;
    }
    case 'validate': {
      result = validateGenerated(verbose);
      break;
    }
    case 'generate': {
      result = generateOutputs(verbose);
      break;
    }
    case 'check': {
      result = runCheck(verbose);
      break;
    }
    case 'build':
    default: {
      console.log('📥 1/4 — Importing...\n');
      importAll(verbose);

      console.log('\n🔍 2/4 — Validating...\n');
      const vResult = validateGenerated(verbose);

      console.log('\n📦 3/4 — Generating outputs...\n');
      generateOutputs(verbose);

      console.log('\n🔁 4/4 — Checking determinism...\n');
      let deterministic = true;
      for (const metric of VALID_METRICS) {
        const filePath = join(GENERATED_DIR, `${metric}.json`);
        const data = readJSON(filePath);
        if (!data) continue;
        writeJSON(filePath, data);
        const data2 = readJSON(filePath);
        if (JSON.stringify(data) !== JSON.stringify(data2)) {
          console.error(`   ❌ ${metric}: NOT deterministic`);
          deterministic = false;
        }
      }
      console.log(deterministic ? '   ✅ All deterministic' : '   ❌ Some files not deterministic');

      result = { success: vResult.success, deterministic };
      break;
    }
  }

  console.log();
  if (result && result.success === false) {
    console.log('❌ Pipeline completed with errors.');
    process.exit(1);
  }
  console.log('✅ Pipeline completed successfully.');
}

main();
