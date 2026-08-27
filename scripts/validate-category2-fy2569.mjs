#!/usr/bin/env node

/**
 * validate-category2-fy2569.mjs
 * =================================
 * Quality gate for FY2569 Cat2 overlay contracts (src/data/category2/*-2569.json).
 * Frozen FY2568 contracts are validated by validate-category2-contracts.mjs.
 *
 * Checks:
 *   1. FY2569 overlay contract parses with required top-level keys
 *   2. every contract/record is year 2569
 *   3. indicator/issue/category codes resolve against canonical taxonomy
 *   4. 2.2.3 appears only in gaps as MISSING_DEDICATED_EVIDENCE
 *   5. no local filesystem paths
 *   6. evidenceIds reference existing FY2569 cat2 evidence-index entries when present
 *   7. sourceRef files exist under public/documents/fy2569/cat2/
 *
 * Usage: node scripts/validate-category2-fy2569.mjs
 * Exit code: 0 on pass, 1 on failure.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const CONTRACT_DIR = resolve(ROOT, 'src', 'data', 'category2');
const FY2569_DOMAINS = ['training-2569'];
const MISSING_INDICATOR = '2.2.3';
const MISSING_STATUS = 'MISSING_DEDICATED_EVIDENCE';
const LOCAL_PATH_PATTERNS = [/F:\\/i, /G:\\/i, /projectAi/i, /OneDrive - Maejo/i];

function readJSON(p) {
  return JSON.parse(readFileSync(p, 'utf8'));
}

function main() {
  const errors = [];

  let criteria, issues, evidence;
  try {
    criteria = readJSON(resolve(ROOT, 'src/data/criteria/indicators.json')).indicators;
    issues = readJSON(resolve(ROOT, 'src/data/criteria/issues.json')).issues;
    evidence = readJSON(resolve(ROOT, 'src/data/evidence-index.json')).items;
  } catch (e) {
    console.error(`FATAL: cannot load canonical references: ${e.message}`);
    process.exit(1);
  }
  const indicatorToIssue = new Map(criteria.map((i) => [i.code, i.issueCode]));
  const issueToCategory = new Map(issues.map((i) => [i.id, i.categoryCode]));
  const evidenceById = new Map(evidence.map((e) => [e.id, e]));

  for (const domain of FY2569_DOMAINS) {
    const filePath = resolve(CONTRACT_DIR, `${domain}.json`);
    let contract;
    try {
      contract = readJSON(filePath);
    } catch (e) {
      errors.push(`${domain}.json unreadable or invalid JSON: ${e.message}`);
      continue;
    }

    for (const key of ['schemaVersion', 'domain', 'updated', 'year', 'governance', 'records', 'gaps']) {
      if (!(key in contract)) errors.push(`${domain}: missing top-level key "${key}"`);
    }
    if (contract.schemaVersion !== '1.0.0') errors.push(`${domain}: schemaVersion must be 1.0.0`);
    if (contract.domain !== domain) errors.push(`${domain}: domain mismatch "${contract.domain}"`);
    if (contract.year !== 2569) errors.push(`${domain}: year must be 2569, got ${contract.year}`);

    const raw = readFileSync(filePath, 'utf8');
    for (const pat of LOCAL_PATH_PATTERNS) {
      if (pat.test(raw)) errors.push(`${domain}: raw file contains local path pattern ${pat}`);
    }

    const seenIds = new Set();
    for (const [i, rec] of (contract.records || []).entries()) {
      const at = `${domain}.records[${i}] (${rec.id || '?'})`;
      if (!rec.id || seenIds.has(rec.id)) errors.push(`${at}: id missing or duplicated`);
      seenIds.add(rec.id);
      if (rec.year !== 2569) errors.push(`${at}: year must be 2569`);
      if (rec.categoryCode !== 'cat2') errors.push(`${at}: categoryCode must be "cat2"`);
      if (rec.indicatorCodes?.includes(MISSING_INDICATOR)) {
        errors.push(`${at}: ${MISSING_INDICATOR} must not appear as a record`);
      }
      if (!Array.isArray(rec.indicatorCodes) || rec.indicatorCodes.length === 0) {
        errors.push(`${at}: indicatorCodes must be non-empty`);
      } else {
        for (const code of rec.indicatorCodes) {
          if (!indicatorToIssue.has(code)) errors.push(`${at}: unknown indicator "${code}"`);
          const expectedIssue = indicatorToIssue.get(code);
          const expectedCat = expectedIssue ? issueToCategory.get(expectedIssue) : undefined;
          if (expectedIssue && !(rec.issueCodes || []).includes(expectedIssue)) {
            errors.push(`${at}: issueCodes must include "${expectedIssue}" for ${code}`);
          }
          if (expectedCat && rec.categoryCode !== expectedCat) {
            errors.push(`${at}: categoryCode must be "${expectedCat}" for ${code}`);
          }
        }
      }
      if (!rec.sourceRef) {
        errors.push(`${at}: sourceRef missing`);
      } else {
        const pubPath = join(ROOT, 'public', 'documents', 'fy2569', 'cat2', rec.sourceRef);
        if (!existsSync(pubPath)) {
          errors.push(`${at}: sourceRef file missing at public/documents/fy2569/cat2/${rec.sourceRef}`);
        }
      }
      for (const evId of rec.evidenceIds || []) {
        const ev = evidenceById.get(evId);
        if (!ev) {
          errors.push(`${at}: evidenceId "${evId}" not in evidence-index.json`);
          continue;
        }
        if (ev.year !== 2569) errors.push(`${at}: evidenceId "${evId}" must be year 2569`);
        if (!(ev.categoryCodes || []).includes('cat2')) {
          errors.push(`${at}: evidenceId "${evId}" must include categoryCodes cat2`);
        }
      }
    }

    const gap223 = (contract.gaps || []).find((g) => g.indicator === MISSING_INDICATOR);
    if (!gap223 || gap223.status !== MISSING_STATUS) {
      errors.push(`${domain}: gaps must declare ${MISSING_INDICATOR} as ${MISSING_STATUS}`);
    }

    const referencedEvidence = new Set();
    for (const rec of contract.records || []) {
      for (const evId of rec.evidenceIds || []) referencedEvidence.add(evId);
    }
    for (const ev of evidence) {
      if (ev.year !== 2569) continue;
      if (!(ev.categoryCodes || []).includes('cat2')) continue;
      if (ev.traceabilityLevel !== 'indicator') continue;
      if (!referencedEvidence.has(ev.id)) {
        errors.push(`evidence-index: FY2569 cat2 entry "${ev.id}" is not referenced by any FY2569 overlay record`);
      }
    }
  }

  console.log('=== CATEGORY 2 FY2569 OVERLAY CONTRACTS VALIDATION ===');
  console.log(`Domains checked : ${FY2569_DOMAINS.length}`);
  if (errors.length > 0) {
    console.log(`--- ${errors.length} ERROR(S) ---`);
    errors.forEach((e) => console.log(`  ✗  ${e}`));
    console.log('\nRESULT: FAIL (exit code 1)');
    process.exit(1);
  }
  console.log('RESULT: PASS ✓ (exit code 0)');
}

main();
