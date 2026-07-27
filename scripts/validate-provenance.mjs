/**
 * validate-provenance.mjs
 * =======================
 * RC-1 provenance shape validation for src/data/generated/*.json metric files.
 *
 * Canonical contract:
 *   - VERIFIED_BASELINE + CONFIRMED_XLSX → provenance.sourceSheet REQUIRED (non-empty)
 *   - CURRENT_DATA_PENDING → sourceSheet MAY be absent (do not fabricate sheet names)
 *   - sourceWorkbook MAY be present on pending rows as the expected future path
 *
 * Usage:
 *   node scripts/validate-provenance.mjs
 *   import { validateMetricProvenance, validateAllProvenance } from './validate-provenance.mjs';
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const DEFAULT_GENERATED_DIR = join(PROJECT_ROOT, 'src', 'data', 'generated');

const METRIC_FILES = [
  'energy.json',
  'water.json',
  'fuel.json',
  'paper.json',
  'waste.json',
  'recycling_rate.json',
  'ghg.json',
];

const PIPELINE_STATUSES = new Set(['VERIFIED_BASELINE', 'CURRENT_DATA_PENDING']);

function readJSON(filePath) {
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validate provenance for one year entry inside a metric file.
 * Returns { errors: string[], warnings: string[] }.
 */
export function validateYearProvenance(metricName, yearStr, yearData) {
  const errors = [];
  const warnings = [];

  if (!yearData || typeof yearData !== 'object') {
    errors.push(`Year ${yearStr}: missing year data object`);
    return { errors, warnings };
  }

  const { dataStatus, dataClassification, provenance: prov } = yearData;

  if (dataStatus === 'VERIFIED_BASELINE' && !prov) {
    errors.push(`Year ${yearStr}: VERIFIED_BASELINE requires provenance metadata`);
    return { errors, warnings };
  }

  if (!prov) {
    if (Array.isArray(yearData.months) && yearData.months.length > 0) {
      warnings.push(`Year ${yearStr}: months present but no provenance block`);
    }
    return { errors, warnings };
  }

  if (
    prov.validationStatus &&
    dataStatus &&
    PIPELINE_STATUSES.has(dataStatus) &&
    PIPELINE_STATUSES.has(prov.validationStatus) &&
    prov.validationStatus !== dataStatus
  ) {
    errors.push(
      `Year ${yearStr}: provenance.validationStatus (${prov.validationStatus}) ≠ dataStatus (${dataStatus})`,
    );
  }

  if (dataStatus === 'VERIFIED_BASELINE' && dataClassification === 'CONFIRMED_XLSX') {
    if (!isNonEmptyString(prov.sourceSheet)) {
      errors.push(
        `Year ${yearStr}: CONFIRMED_XLSX baseline requires non-empty provenance.sourceSheet`,
      );
    }
    if (!isNonEmptyString(prov.sourceWorkbook)) {
      warnings.push(`Year ${yearStr}: CONFIRMED_XLSX baseline missing provenance.sourceWorkbook`);
    }
  }

  if (dataStatus === 'CURRENT_DATA_PENDING') {
    if (prov.sourceSheet !== undefined && !isNonEmptyString(prov.sourceSheet)) {
      errors.push(
        `Year ${yearStr}: provenance.sourceSheet must be omitted or non-empty for CURRENT_DATA_PENDING`,
      );
    }
  } else if (prov.sourceSheet !== undefined && !isNonEmptyString(prov.sourceSheet)) {
    errors.push(`Year ${yearStr}: provenance.sourceSheet must be a non-empty string when present`);
  }

  if (prov.sourceWorkbook !== undefined) {
    if (!isNonEmptyString(prov.sourceWorkbook)) {
      errors.push(`Year ${yearStr}: provenance.sourceWorkbook must be non-empty when present`);
    } else if (/^[A-Za-z]:[\\/]/.test(prov.sourceWorkbook)) {
      errors.push(
        `Year ${yearStr}: provenance.sourceWorkbook must be repo-relative, not absolute (${prov.sourceWorkbook})`,
      );
    }
  }

  if (
    dataStatus === 'CURRENT_DATA_PENDING' &&
    prov.extractionStatus === 'NO_2569_DATA' &&
    isNonEmptyString(prov.sourceSheet)
  ) {
    warnings.push(
      `Year ${yearStr}: sourceSheet present while extractionStatus is NO_2569_DATA — verify sheet name is not fabricated`,
    );
  }

  if (errors.length === 0 && warnings.length === 0 && metricName) {
    // no-op: keeps metricName referenced for future context in callers
  }

  return { errors, warnings };
}

/**
 * Validate provenance blocks for all years in one metric JSON object.
 */
export function validateMetricProvenance(data, fileLabel = 'metric') {
  const errors = [];
  const warnings = [];
  const metricName = data?.metric || fileLabel;

  if (!data?.years || typeof data.years !== 'object') {
    errors.push(`${fileLabel}: missing years object`);
    return { errors, warnings, success: false };
  }

  for (const [yearStr, yearData] of Object.entries(data.years)) {
    const result = validateYearProvenance(metricName, yearStr, yearData);
    errors.push(...result.errors.map((e) => `${fileLabel}: ${e}`));
    warnings.push(...result.warnings.map((w) => `${fileLabel}: ${w}`));
  }

  return { errors, warnings, success: errors.length === 0 };
}

/**
 * Validate provenance for all canonical metric JSON files in generated dir.
 */
export function validateAllProvenance(options = {}) {
  const generatedDir = options.generatedDir || DEFAULT_GENERATED_DIR;
  const files = options.files || METRIC_FILES;
  const verbose = !!options.verbose;

  const allErrors = [];
  const allWarnings = [];
  let filesChecked = 0;
  let yearsChecked = 0;

  if (!existsSync(generatedDir)) {
    return {
      success: false,
      errors: [`Generated directory not found: ${generatedDir}`],
      warnings: [],
      filesChecked: 0,
      yearsChecked: 0,
    };
  }

  for (const file of files) {
    const filePath = join(generatedDir, file);
    const data = readJSON(filePath);
    if (!data) {
      allErrors.push(`${file}: could not parse JSON`);
      continue;
    }

    filesChecked++;
    yearsChecked += Object.keys(data.years || {}).length;

    const result = validateMetricProvenance(data, file);
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);

    if (verbose) {
      const label = data.label || file;
      if (result.errors.length === 0 && result.warnings.length === 0) {
        console.log(`   ✅ ${label} — provenance valid`);
      } else {
        console.log(`📄 ${label}:`);
        result.errors.forEach((e) => console.log(`   ❌ ${e}`));
        result.warnings.forEach((w) => console.log(`   ⚠ ${w}`));
      }
    }
  }

  return {
    success: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    filesChecked,
    yearsChecked,
  };
}

function main() {
  const verbose = process.argv.includes('--verbose');

  console.log('🔍 Validating metric provenance shape...\n');
  const result = validateAllProvenance({ verbose });

  if (!verbose) {
    for (const file of METRIC_FILES) {
      const filePath = join(DEFAULT_GENERATED_DIR, file);
      const data = readJSON(filePath);
      if (!data) continue;
      const { errors, warnings } = validateMetricProvenance(data, file);
      const label = data.label || file;
      if (errors.length === 0) {
        console.log(`   ✅ ${label} — provenance valid${warnings.length ? ` (${warnings.length} warning(s))` : ''}`);
      }
    }
  }

  console.log(`\n── Provenance validation complete ──`);
  console.log(`   Files:    ${result.filesChecked}`);
  console.log(`   Years:    ${result.yearsChecked}`);
  console.log(`   Errors:   ${result.errors.length}`);
  console.log(`   Warnings: ${result.warnings.length}`);
  console.log(`   Result:   ${result.success ? '✅ PASS' : '❌ FAIL'}`);

  if (!result.success) {
    result.errors.forEach((e, i) => console.log(`   ${i + 1}. ${e}`));
    process.exit(1);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
