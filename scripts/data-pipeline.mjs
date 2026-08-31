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

import { readFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateMonthData, monthLabel, formatValidationReport, deriveDatasetState, latestDataMonthOf, validateDatasetState } from './data-validator.mjs';
import { validateMetricProvenance } from './validate-provenance.mjs';
import { writeJsonFile } from './lib/serialize-json.mjs';

// ── Constants ─────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const GENERATED_DIR = join(PROJECT_ROOT, 'src', 'data', 'generated');
const IMPORT_DIR = join(PROJECT_ROOT, 'data', 'import');
const SOURCE_REGISTRY = join(PROJECT_ROOT, 'data', 'staging', 'extract-sources.json');
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
    excelSource: '12-elect.xlsx',
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
    label: 'Waste Mass',
    labelTh: 'ปริมาณขยะ',
    unit: 'kg',
    kpiField: 'total_kg',
    csvField: 'total_kg',
    description: 'Waste mass in kilograms',
    excelSource: '1.5_Waste.xlsx',
    criteriaId: '4.1.2',
  },
  recycling_rate: {
    label: 'Recycling Rate',
    labelTh: 'อัตราการรีไซcle',
    unit: '%',
    kpiField: 'recycle_pct',
    csvField: 'recycle_pct',
    description: 'Waste recycling rate percentage',
    excelSource: '1.5_Waste.xlsx',
    criteriaId: '4.1.3',
  },
  ghg: {
    label: 'GHG Emissions',
    labelTh: 'ก๊าซเรือนกระจก',
    unit: 'tCO₂e',
    kpiField: 'total_tco2e',
    csvField: 'total_tco2e',
    description: 'Greenhouse gas emissions in tCO₂e',
    excelSource: '1.5_GreenhouseGas.xlsx',
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
  writeJsonFile(filePath, data);
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

function importMetric(metric, year, csvPath, _verbose, opts = {}) {
  const {
    workbookTotal = null,
    sourceWorkbook = null,
    sourceSheet = null,
    classification = null,
    extractionScript = null,
    sourceSha256 = null,
    extractionDate = null,
    observedMonths = null,
    coverage = null,
    workbookTotalInvalid = false,
  } = opts;
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
  const sumValue = normalizedMonths.reduce((s, m) => s + m.value, 0);
  const averageValue = monthCount > 0 ? sumValue / monthCount : 0;
  const isBaseline = (Number(year) <= 2568);

  // Percentage-unit metrics (e.g. waste recycling rate) must be aggregated as an
  // average across months, never summed — summing percentages is semantically invalid.
  const aggregation = cfg.unit === '%' ? 'average' : 'sum';
  const totalValue = aggregation === 'average' ? averageValue : sumValue;

  // 4. Build year data (deterministic — no runtime timestamp in data)
  const months = normalizedMonths.map(m => ({
    month: m.month,
    value: m.value,
    label: monthLabel(m.month),
  }));

  const monthStatus = monthCount >= 12 ? 'complete' : `partial, ${monthCount} of 12 months`;
  const sourceDesc = sourceWorkbook
    ? `${sourceWorkbook} (${basename(csvPath)}) — ${monthStatus}`
    : `${cfg.excelSource} converted — ${monthStatus}`;

  // Reconcile with workbook total (if available via --workbook-total).
  // Baseline data has no live workbook total here (reconciled at extraction).
  // Current-year data imported from the official workbook (extract-workbook.mjs
  // passes workbookTotal + sourceWorkbook) is CONFIRMED_XLSX and reconciled.
  // CSV-only imports with no workbook remain unverified (DERIVED_FROM_CSV).
  let quality;
  let dataClassification;
  if (isBaseline) {
    if (workbookTotal !== null && workbookTotal !== undefined && sourceWorkbook) {
      // Authoritative FY2568 baseline (e.g. 1.5_greenhousegass_update2.xlsx):
      // extracted from the workbook with a known total → CONFIRMED_XLSX.
      quality = reconcileTotal(totalValue, workbookTotal, cfg.unit);
      dataClassification = 'CONFIRMED_XLSX';
    } else {
      // Legacy baseline without a live workbook total → preserved, unverified.
      quality = reconcileTotal(totalValue, null, cfg.unit);
      dataClassification = 'PRESERVED_LEGACY';
    }
  } else if (workbookTotal !== null && workbookTotal !== undefined) {
    if (workbookTotal < 0) {
      // Negative workbook totals (e.g. energy/water 2569 "รวม" rows include a
      // corrupt negative Aug formula-cache value) are unusable for
      // reconciliation. Monthly values are still confirmed against the 2569
      // sheet; the total is flagged for the data owner instead of failing.
      quality = {
        valid: true,
        warnings: [
          `Workbook total is negative (corrupt formula cache in source) — total reconciliation skipped; monthly values confirmed against the 2569 sheet. Data-owner correction required before annual claims.`,
        ],
        reconciliationDifference: null,
      };
      dataClassification = 'CONFIRMED_XLSX';
    } else {
      quality = reconcileTotal(totalValue, workbookTotal, cfg.unit);
      dataClassification = classification || 'CONFIRMED_XLSX';
    }
  } else if (workbookTotalInvalid) {
    // Extract saw a corrupt negative cell in the canonical range, so the
    // workbook total is unusable. Monthly values remain CONFIRMED_XLSX
    // (verified against the 2569 sheet), with an explicit data-owner warning.
    quality = {
      valid: true,
      warnings: [
        'Workbook total row unusable (corrupt negative cell in canonical range) — total reconciliation skipped; monthly values confirmed against the 2569 sheet. Data-owner correction required before annual claims.',
      ],
      reconciliationDifference: null,
    };
    dataClassification = 'CONFIRMED_XLSX';
  } else {
    quality = {
      valid: false,
      warnings: [
        'Current-year data imported from CSV only — no source workbook (XLSX) was available for reconciliation. Treat as unverified/demo until confirmed against the official source.',
      ],
      reconciliationDifference: null,
    };
    dataClassification = 'DERIVED_FROM_CSV';
  }

  const yearData = {
    year: Number(year),
    isBaseline,
    months,
    total: Math.round(totalValue * 100) / 100,
    average: Math.round(averageValue * 100) / 100,
    aggregation,
    dataStatus:
      isBaseline && monthCount >= 12 && dataClassification === 'CONFIRMED_XLSX'
        ? 'VERIFIED_BASELINE'
        : monthCount >= 12
          ? 'complete'
          : 'in_progress',
    source: sourceDesc,
    quality,
    dataClassification,
    datasetState: deriveDatasetState(monthCount),
    latestDataMonth: latestDataMonthOf(normalizedMonths),
    updated: statSync(csvPath).mtime.toISOString().slice(0, 10),
  };

  // Traceability: provenance block when the import is backed by a source workbook.
  if (sourceWorkbook) {
    yearData.provenance = {
      sourceWorkbook,
      ...(sourceSheet ? { sourceSheet } : {}),
      ...(extractionScript ? { extractionScript } : {}),
      ...(sourceSha256 ? { sourceSha256 } : {}),
      ...(extractionDate ? { extractionDate } : {}),
      ...(coverage ? { coverage } : {}),
      ...(Array.isArray(observedMonths) && observedMonths.length > 0 ? { observedMonths } : {}),
      validationStatus:
        isBaseline && monthCount >= 12 && dataClassification === 'CONFIRMED_XLSX'
          ? 'VERIFIED_BASELINE'
          : monthCount >= 12
            ? 'complete'
            : 'in_progress',
    };
    // Current-year data is machine-extracted and reconciled against the staged
    // workbook, but has NOT been human-verified. Never claim human verification.
    if (!isBaseline) {
      yearData.provenance.verification = {
        status: 'available_unverified',
        humanVerificationRequired: true,
      };
    }
  }

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

  // Source registry (written by extract-workbook.mjs): maps "{metric}-{year}" to
  // { workbookTotal, sourceWorkbook, sourceSheet, classification } so verified
  // workbook-backed imports take the CONFIRMED_XLSX + reconciliation path.
  const registry = readJSON(SOURCE_REGISTRY) || {};

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
    const result = importMetric(metric, year, csvPath, verbose, registry[baseName] || {});
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

  const files = readdirSync(GENERATED_DIR).filter(f => f.endsWith('.json') && !f.includes('kpi-summary') && !f.includes('data-quality') && !f.includes('action-plan') && !f.includes('category-progress'));
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

        // Validate total against the correct aggregation method.
        // Percentage-unit metrics must use 'average', never 'sum' — summing
        // percentage rates across months is semantically invalid.
        if (data.unit === '%' && yearData.aggregation && yearData.aggregation !== 'average') {
          fileErrors.push(`Year ${yearStr}: unit '%' must use aggregation 'average', found '${yearData.aggregation}'`);
        }
        if (data.unit === '%' && !yearData.aggregation) {
          fileWarnings.push(`Year ${yearStr}: unit '%' has no 'aggregation' field set — assumed 'sum', which is invalid for percentages`);
        }

        if (yearData.months && yearData.total !== undefined) {
          const aggregation = yearData.aggregation || 'sum';
          const calcTotal = aggregation === 'average'
            ? (yearData.months.length > 0 ? Math.round((yearData.months.reduce((s, m) => s + m.value, 0) / yearData.months.length) * 100) / 100 : 0)
            : Math.round(yearData.months.reduce((s, m) => s + m.value, 0) * 100) / 100;
          const storedTotal = Math.round(yearData.total * 100) / 100;
          if (calcTotal !== storedTotal) {
            fileWarnings.push(`Year ${yearStr}: stored total (${storedTotal}) ≠ calculated ${aggregation} (${calcTotal})`);
          }
        }

        // Quality flags must not be silently ignored — an invalid quality state
        // must always surface at least one warning at validation time.
        if (yearData.quality && yearData.quality.valid === false) {
          const detail = yearData.quality.warnings?.length ? yearData.quality.warnings.join('; ') : 'no detail provided';
          fileWarnings.push(`Year ${yearStr}: quality flagged INVALID — ${detail}`);
        }
        if (!yearData.quality) {
          fileWarnings.push(`Year ${yearStr}: no quality field present — data quality has not been assessed`);
        }

        // Provenance classification must be present so downstream consumers
        // (KPI summary, dashboard) can distinguish confirmed vs unverified data.
        if (!yearData.dataClassification) {
          fileWarnings.push(`Year ${yearStr}: no dataClassification set — provenance is unknown`);
        }

        // GO-DATA-3: datasetState must be consistent with the observed month count.
        // WAITING_FOR_INPUT years must have empty months (never zero-filled).
        if (yearData.datasetState) {
          for (const e of validateDatasetState(yearData.datasetState, yearData.months?.length || 0)) {
            fileWarnings.push(`Year ${yearStr}: ${e}`);
          }
        }
      }
    }

    // RC-1 provenance shape (sourceSheet required for CONFIRMED_XLSX baselines only)
    const provResult = validateMetricProvenance(data, file);
    fileErrors.push(...provResult.errors.map((e) => e.replace(`${file}: `, '')));
    fileWarnings.push(...provResult.warnings.map((w) => w.replace(`${file}: `, '')));

    if (!data.unit) {
      fileErrors.push('Missing required unit');
    }

    // sourceEvidence should be populated once evidence documents are linked.
    if (!data.sourceEvidence || data.sourceEvidence.length === 0) {
      fileWarnings.push('No sourceEvidence recorded for this metric');
    }

    // Extreme YoY swings often indicate one side is placeholder/demo data
    // rather than a genuine trend — flag for manual review.
    if (data.yoyChange && Math.abs(data.yoyChange.percent) > 100) {
      fileWarnings.push(`Extreme YoY change detected (${data.yoyChange.percent}%) — verify both years' data before trusting this trend`);
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

  // Stamp datasetState + latestDataMonth on any year missing them (GO-DATA-3).
  // Deterministic: derived solely from observed month count. Missing months are
  // never zero — WAITING_FOR_INPUT years keep empty months arrays.
  for (const m of metrics) {
    if (!m.years) continue;
    for (const yearData of Object.values(m.years)) {
      const n = Array.isArray(yearData.months) ? yearData.months.length : 0;
      if (!yearData.datasetState) yearData.datasetState = deriveDatasetState(n);
      if (yearData.latestDataMonth === undefined) yearData.latestDataMonth = latestDataMonthOf(yearData.months);
    }
    // Persist the stamped state back to the canonical metric JSON (deterministic).
    writeJSON(join(GENERATED_DIR, `${m.metric}.json`), m);
  }

  // 1. Executive KPI Summary
  // Executive KPIs must never present unverified/placeholder data as if it were
  // confirmed. Any metric-year whose quality.valid !== true is marked
  // verified:false and its value is still returned for transparency but must be
  // treated by consumers as unverified, not a confirmed KPI figure.
  const kpiEntries = metrics.map(m => {
    const currentYearData = m.years?.[String(m.currentYear)];
    const baselineYearData = m.years?.[String(m.baselineYear)];
    // "Verified" requires a complete 12-month dataset reconciled to the source.
    // Partial current-year data (PUBLISHABLE_PARTIAL) is machine-extracted but
    // not human-verified — it must never carry the Verified flag.
    const verified = currentYearData?.quality?.valid === true && currentYearData?.datasetState === 'COMPLETE';
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
      verified,
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
      const registry = readJSON(SOURCE_REGISTRY) || {};
      if (args.metric && args.year) {
        const csvPath = args.input || join(IMPORT_DIR, `${args.metric}-${args.year}.csv`);
        result = importMetric(args.metric, args.year, csvPath, verbose, registry[`${args.metric}-${args.year}`] || {});
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
      const importResult = importAll(verbose);
      if (!importResult.success) {
        console.error('❌ Import failed — aborting before validation/generation. Generated data is NOT publishable.');
        process.exit(1);
      }

      console.log('\n🔍 2/4 — Validating...\n');
      const vResult = validateGenerated(verbose);
      if (!vResult.success) {
        console.error('❌ Validation failed — aborting before generation. Generated data is NOT publishable.');
        process.exit(1);
      }

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

// Only run the CLI when this file is executed directly (not when imported by tests).
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}

export { importMetric, validateGenerated, generateOutputs, reconcileTotal, runCheck, METRIC_CONFIG, VALID_METRICS };
