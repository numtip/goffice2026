/**
 * data-validator.mjs
 * ==================
 * Validation rules for dashboard import data.
 * Zero dependencies — uses only Node.js built-ins.
 *
 * Usage:
 *   import { validateMonthData } from './data-validator.mjs';
 *   const errors = validateMonthData(rows, { year: 2569, maxMonths: 12 });
 */

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Validate an array of { month, value } objects.
 * Returns array of error strings (empty = valid).
 */
export function validateMonthData(rows, options = {}) {
  const { maxMonths = 12, allowIncomplete = true } = options;
  const errors = [];

  if (!Array.isArray(rows)) {
    return ['Input is not an array'];
  }

  if (rows.length === 0) {
    return ['No data rows provided'];
  }

  if (rows.length > maxMonths) {
    errors.push(`Too many rows: got ${rows.length}, expected ≤ ${maxMonths}`);
  }

  const seenMonths = new Set();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const idx = i + 1;

    // Validate month field
    if (row.month === undefined || row.month === null) {
      errors.push(`Row ${idx}: missing 'month'`);
      continue;
    }
    const monthNum = Number(row.month);
    if (!Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12) {
      errors.push(`Row ${idx}: month must be integer 1-12, got '${row.month}'`);
      continue;
    }

    // Check duplicate
    if (seenMonths.has(monthNum)) {
      errors.push(`Row ${idx}: duplicate month ${monthNum} (${MONTH_NAMES[monthNum]})`);
    }
    seenMonths.add(monthNum);

    // Validate value field
    if (row.value === undefined || row.value === null || row.value === '') {
      errors.push(`Row ${idx}, month ${monthNum}: missing 'value'`);
      continue;
    }
    const val = Number(row.value);
    if (isNaN(val)) {
      errors.push(`Row ${idx}, month ${monthNum}: value '${row.value}' is not a valid number`);
      continue;
    }
    if (val < 0) {
      errors.push(`Row ${idx}, month ${monthNum}: value cannot be negative (got ${val})`);
    }
  }

  // Check for missing months (only if all months are expected)
  if (!allowIncomplete && seenMonths.size < maxMonths) {
    const missing = [];
    for (let m = 1; m <= maxMonths; m++) {
      if (!seenMonths.has(m)) missing.push(`${m} (${MONTH_NAMES[m]})`);
    }
    errors.push(`Missing months: ${missing.join(', ')}`);
  }

  return errors;
}

/**
 * Validate a CSV header row matches expected columns.
 */
export function validateCsvHeaders(headers, expectedHeaders) {
  const errors = [];
  if (!headers || headers.length === 0) {
    return ['CSV has no header row'];
  }
  for (const expected of expectedHeaders) {
    if (!headers.includes(expected)) {
      errors.push(`Missing expected column: '${expected}'`);
    }
  }
  return errors;
}

/**
 * Validate that a number is a valid positive number (or zero).
 */
export function isValidMetricValue(val) {
  if (val === undefined || val === null || val === '') return false;
  const n = Number(val);
  return !isNaN(n) && isFinite(n) && n >= 0;
}

/**
 * Get expected label for a month number.
 */
export function monthLabel(m) {
  return MONTH_NAMES[m] || `Month ${m}`;
}

/**
 * Build a summary string for validation results.
 */
export function formatValidationReport(errors) {
  if (errors.length === 0) {
    return '✅ Validation passed — 0 errors.';
  }
  const lines = [`❌ Validation failed — ${errors.length} error(s):`];
  errors.forEach((e, i) => lines.push(`  ${i + 1}. ${e}`));
  return lines.join('\n');
}
