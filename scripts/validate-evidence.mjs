#!/usr/bin/env node

/**
 * validate-evidence.mjs
 * =====================
 * Validates evidence-index.json structural integrity against:
 *   - Unique IDs
 *   - Valid traceabilityLevel values
 *   - Valid verification.status values
 *   - Canonical taxonomy references (categories, issues, indicators)
 *   - Hierarchy consistency rules
 *   - unmapped record constraints
 *
 * Usage: node scripts/validate-evidence.mjs
 * Exit code: 0 on structural pass, 1 on structural inconsistencies.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const VALID_TRACEABILITY = new Set(['indicator', 'issue', 'category', 'unmapped']);
const VALID_VERIFICATION = new Set(['verified', 'reviewed', 'pending', 'unresolved']);

function readJSON(relativePath) {
  const raw = readFileSync(resolve(ROOT, relativePath), 'utf-8');
  return JSON.parse(raw);
}

function findDuplicates(arr) {
  const seen = new Set();
  const dups = new Set();
  for (const item of arr) {
    if (seen.has(item)) dups.add(item);
    seen.add(item);
  }
  return [...dups];
}

function main() {
  const errors = [];
  const counts = {
    total: 0,
    byTraceability: {},
    byVerification: {},
    byFileType: {},
  };

  // ── 1. Load data ──────────────────────────────────────────
  let evidence, categoriesData, issuesData, indicatorsData;

  try {
    evidence = readJSON('src/data/evidence-index.json');
  } catch (e) {
    errors.push(`Cannot read evidence-index.json: ${e.message}`);
  }
  try {
    categoriesData = readJSON('src/data/criteria/categories.json');
  } catch (e) {
    errors.push(`Cannot read categories.json: ${e.message}`);
  }
  try {
    issuesData = readJSON('src/data/criteria/issues.json');
  } catch (e) {
    errors.push(`Cannot read issues.json: ${e.message}`);
  }
  try {
    indicatorsData = readJSON('src/data/criteria/indicators.json');
  } catch (e) {
    errors.push(`Cannot read indicators.json: ${e.message}`);
  }

  if (errors.length > 0) {
    console.log('FATAL: Could not load one or more JSON files.');
    errors.forEach(e => console.log(`  FAIL: ${e}`));
    process.exit(1);
  }

  const items = evidence.items || [];
  const catCodes = new Set((categoriesData.categories || []).map(c => c.code));
  const issueCodes = new Set((issuesData.issues || []).map(i => i.id));
  const indicatorCodes = new Set((indicatorsData.indicators || []).map(ind => ind.code));

  // Build lookup maps for hierarchy validation
  const indicatorToIssue = new Map();
  for (const ind of indicatorsData.indicators || []) {
    indicatorToIssue.set(ind.code, ind.issueCode);
  }
  const issueToCategory = new Map();
  for (const iss of issuesData.issues || []) {
    issueToCategory.set(iss.id, iss.categoryCode);
  }

  counts.total = items.length;

  // ── 2. Unique IDs ─────────────────────────────────────────
  const ids = items.map(r => r.id).filter(id => id !== undefined && id !== null);
  const dups = findDuplicates(ids);
  if (dups.length > 0) {
    errors.push(`Rule 1 — Duplicate IDs: ${dups.join(', ')}`);
  }

  // ── 3. Per-record validation ─────────────────────────────
  for (let i = 0; i < items.length; i++) {
    const rec = items[i];
    const idx = i + 1;
    const label = rec.id ? `"${rec.id}"` : `record ${idx}`;

    // 3a. traceabilityLevel validation
    if (!rec.traceabilityLevel) {
      errors.push(`Rule 2 — ${label}: missing traceabilityLevel`);
    } else if (!VALID_TRACEABILITY.has(rec.traceabilityLevel)) {
      errors.push(`Rule 2 — ${label}: invalid traceabilityLevel "${rec.traceabilityLevel}". Valid: ${[...VALID_TRACEABILITY].join(', ')}`);
    } else {
      counts.byTraceability[rec.traceabilityLevel] = (counts.byTraceability[rec.traceabilityLevel] || 0) + 1;
    }

    // 3b. verification.status validation
    const v = rec.verification;
    if (!v) {
      errors.push(`Rule 3 — ${label}: missing verification object`);
    } else if (!v.status) {
      errors.push(`Rule 3 — ${label}: missing verification.status`);
    } else if (!VALID_VERIFICATION.has(v.status)) {
      errors.push(`Rule 3 — ${label}: invalid verification.status "${v.status}". Valid: ${[...VALID_VERIFICATION].join(', ')}`);
    } else {
      counts.byVerification[v.status] = (counts.byVerification[v.status] || 0) + 1;
    }

    // 3c. categoryCodes validation
    if (!Array.isArray(rec.categoryCodes)) {
      errors.push(`Rule 4 — ${label}: categoryCodes is not an array`);
    } else {
      for (const code of rec.categoryCodes) {
        if (!catCodes.has(code)) {
          errors.push(`Rule 4 — ${label}: categoryCode "${code}" not found in canonical categories`);
        }
      }
    }

    // 3d. issueCodes validation
    if (!Array.isArray(rec.issueCodes)) {
      errors.push(`Rule 5 — ${label}: issueCodes is not an array`);
    } else {
      for (const code of rec.issueCodes) {
        if (!issueCodes.has(code)) {
          errors.push(`Rule 5 — ${label}: issueCode "${code}" not found in canonical issues`);
        }
      }
    }

    // 3e. indicatorCodes validation
    if (!Array.isArray(rec.indicatorCodes)) {
      errors.push(`Rule 6 — ${label}: indicatorCodes is not an array`);
    } else {
      for (const code of rec.indicatorCodes) {
        if (!indicatorCodes.has(code)) {
          errors.push(`Rule 6 — ${label}: indicatorCode "${code}" not found in canonical indicators`);
        }
      }
    }

    // 3f. Hierarchy consistency rules
    const level = rec.traceabilityLevel || 'unknown';

    // Rule 7: indicator-level must have non-empty indicatorCodes
    if (level === 'indicator' && (!rec.indicatorCodes || rec.indicatorCodes.length === 0)) {
      errors.push(`Rule 7 — ${label}: traceabilityLevel is "indicator" but indicatorCodes is empty`);
    }

    // Rule 8: issue-level must have non-empty issueCodes
    if (level === 'issue' && (!rec.issueCodes || rec.issueCodes.length === 0)) {
      errors.push(`Rule 8 — ${label}: traceabilityLevel is "issue" but issueCodes is empty`);
    }

    // Rule 9: category-level must have non-empty categoryCodes
    if (level === 'category' && (!rec.categoryCodes || rec.categoryCodes.length === 0)) {
      errors.push(`Rule 9 — ${label}: traceabilityLevel is "category" but categoryCodes is empty`);
    }

    // Rule 10: No impossible hierarchy — indicator must belong to referenced issue,
    // issue must belong to referenced category
    if (level === 'indicator' && rec.indicatorCodes && rec.issueCodes) {
      for (const indCode of rec.indicatorCodes) {
        const expectedIssue = indicatorToIssue.get(indCode);
        if (expectedIssue && !rec.issueCodes.includes(expectedIssue)) {
          errors.push(`Rule 10 — ${label}: indicator "${indCode}" belongs to issue "${expectedIssue}" but issueCodes does not include it`);
        }
      }
    }
    if (level !== 'category' && rec.issueCodes && rec.categoryCodes) {
      for (const issCode of rec.issueCodes) {
        const expectedCat = issueToCategory.get(issCode);
        if (expectedCat && !rec.categoryCodes.includes(expectedCat)) {
          errors.push(`Rule 10 — ${label}: issue "${issCode}" belongs to category "${expectedCat}" but categoryCodes does not include it`);
        }
      }
    }

    // Rule 11: unmapped records have empty indicatorCodes, issueCodes, categoryCodes
    if (level === 'unmapped') {
      if (rec.indicatorCodes && rec.indicatorCodes.length > 0) {
        errors.push(`Rule 11 — ${label}: traceabilityLevel is "unmapped" but indicatorCodes is non-empty`);
      }
      if (rec.issueCodes && rec.issueCodes.length > 0) {
        errors.push(`Rule 11 — ${label}: traceabilityLevel is "unmapped" but issueCodes is non-empty`);
      }
      if (rec.categoryCodes && rec.categoryCodes.length > 0) {
        errors.push(`Rule 11 — ${label}: traceabilityLevel is "unmapped" but categoryCodes is non-empty`);
      }
    }

    // Count by fileType
    const ft = rec.fileType || 'unknown';
    counts.byFileType[ft] = (counts.byFileType[ft] || 0) + 1;
  }

  // ── 4. Report ─────────────────────────────────────────────
  console.log('=== EVIDENCE VALIDATION REPORT ===\n');
  console.log(`Total records: ${counts.total}\n`);

  console.log('Traceability Levels:');
  for (const level of ['indicator', 'issue', 'category', 'unmapped']) {
    const c = counts.byTraceability[level] || 0;
    console.log(`  ${level}: ${c}`);
  }
  console.log('');

  console.log('Verification Statuses:');
  for (const status of ['verified', 'reviewed', 'pending', 'unresolved']) {
    const c = counts.byVerification[status] || 0;
    console.log(`  ${status}: ${c}`);
  }
  console.log('');

  console.log('Source Types (by fileType):');
  for (const [type, c] of Object.entries(counts.byFileType).sort()) {
    console.log(`  ${type}: ${c}`);
  }
  console.log('');

  if (errors.length > 0) {
    console.log(`--- ${errors.length} STRUCTURAL ERROR(S) ---`);
    errors.forEach(e => console.log(`  ✗  ${e}`));
    console.log('\nRESULT: FAIL (exit code 1)');
    process.exit(1);
  } else {
    console.log('RESULT: PASS ✓ (exit code 0)');
    process.exit(0);
  }
}

main();
