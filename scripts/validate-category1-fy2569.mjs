#!/usr/bin/env node

/**
 * validate-category1-fy2569.mjs
 * =================================
 * Quality gate for the FY2569 CAT1 overlay contracts (src/data/category1/*-2569.json).
 * These are SEPARATE year-qualified records — the frozen FY2568 contracts are
 * validated by validate-category1-contracts.mjs and must not be mutated.
 *
 * Checks:
 *   1. all 4 FY2569 overlay contracts parse and have required top-level keys
 *   2. every contract/record is year 2569
 *   3. indicator/issue/category codes resolve against the canonical taxonomy
 *   4. MISSING indicators (1.2.2, 1.5.3) appear only in gaps arrays
 *   5. no local filesystem paths (no F:\ , projectAi, full OneDrive paths)
 *   6. invariant facts: scope 9,873 m²; 10 policy commitments; 6 targets vs FY2568
 *      base; committee order 2026-03-31; plan workbook-linked
 *
 * Usage: node scripts/validate-category1-fy2569.mjs
 * Exit code: 0 on pass, 1 on failure.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const CONTRACT_DIR = resolve(ROOT, 'src', 'data', 'category1');
const FY2569_DOMAINS = [
  'activities-aspects-2569',
  'targets-2569',
  'projects-2569',
  'environmental-committee-2569',
];
const MISSING_INDICATORS = ['1.2.2', '1.5.3'];
const LOCAL_PATH_PATTERNS = [/F:\\/i, /projectAi/i, /OneDrive - Maejo/i];

function readJSON(p) {
  return JSON.parse(readFileSync(p, 'utf8'));
}

function main() {
  const errors = [];

  let criteria, issues;
  try {
    criteria = readJSON(resolve(ROOT, 'src/data/criteria/indicators.json')).indicators;
    issues = readJSON(resolve(ROOT, 'src/data/criteria/issues.json')).issues;
  } catch (e) {
    console.error(`FATAL: cannot load canonical references: ${e.message}`);
    process.exit(1);
  }
  const indicatorToIssue = new Map(criteria.map((i) => [i.code, i.issueCode]));
  const issueToCategory = new Map(issues.map((i) => [i.id, i.categoryCode]));

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
      if (!Array.isArray(rec.indicatorCodes) || rec.indicatorCodes.length === 0) {
        errors.push(`${at}: indicatorCodes must be non-empty`);
      } else {
        for (const code of rec.indicatorCodes) {
          if (!indicatorToIssue.has(code)) errors.push(`${at}: unknown indicator "${code}"`);
          if (MISSING_INDICATORS.includes(code)) errors.push(`${at}: MISSING indicator "${code}" must not appear as a record`);
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
      if (!Array.isArray(rec.issueCodes)) errors.push(`${at}: issueCodes must be an array`);
      if (rec.categoryCode !== 'cat1') errors.push(`${at}: categoryCode must be "cat1"`);
      if (!rec.sourceRef) errors.push(`${at}: sourceRef missing`);
    }

    const gapIndicators = (contract.gaps || []).map((g) => g.indicator);
    for (const mi of MISSING_INDICATORS) {
      if (!gapIndicators.includes(mi)) errors.push(`${domain}: gaps must declare MISSING indicator "${mi}"`);
    }
  }

  // ── Invariant facts (source-derived) ──────────────────────────
  let aa;
  try {
    aa = readJSON(resolve(CONTRACT_DIR, 'activities-aspects-2569.json'));
  } catch (e) {
    errors.push(`activities-aspects-2569.json unreadable: ${e.message}`);
  }
  if (aa) {
    const scope = (aa.records || []).find((r) => r.id === 'scope-2569-1');
    const policies = (aa.records || []).filter((r) => r.kind === 'policyCommitment');
    const approval = (aa.records || []).find((r) => r.id === 'policy-2569-approval-1');
    if (!scope || scope.officeAreaSqm !== 9873) {
      errors.push('activities-aspects-2569: scope-2569-1 officeAreaSqm must be 9873');
    }
    if (!scope || scope.personnelCount !== 97) {
      errors.push('activities-aspects-2569: scope-2569-1 personnelCount must be 97');
    }
    if (policies.length !== 10) {
      errors.push(`activities-aspects-2569: expected 10 policyCommitment records, got ${policies.length}`);
    }
    if (!approval || approval.announcementDateISO !== '2026-04-01') {
      errors.push('activities-aspects-2569: policy-2569-approval-1 announcementDateISO must be 2026-04-01');
    }
    if (scope && scope.announcementDateISO !== '2026-04-05') {
      errors.push('activities-aspects-2569: scope-2569-1 announcementDateISO must be 2026-04-05');
    }
  }

  let targets;
  try {
    targets = readJSON(resolve(CONTRACT_DIR, 'targets-2569.json'));
  } catch (e) {
    errors.push(`targets-2569.json unreadable: ${e.message}`);
  }
  if (targets) {
    const targetRecs = (targets.records || []).filter((r) => r.kind === 'target');
    const expectedPct = { electricity: -1, fuel: -3, water: -1, paper: -3, general_waste: -1, ghg: -1 };
    if (targetRecs.length !== 6) errors.push(`targets-2569: expected 6 target records, got ${targetRecs.length}`);
    for (const t of targetRecs) {
      if (expectedPct[t.domain] !== t.targetPercent) {
        errors.push(`targets-2569: ${t.id} targetPercent must be ${expectedPct[t.domain]}, got ${t.targetPercent}`);
      }
      if (t.baselineYear !== 2568 || t.targetYear !== 2569) {
        errors.push(`targets-2569: ${t.id} must be baseline 2568 → target 2569`);
      }
    }
  }

  let projects;
  try {
    projects = readJSON(resolve(CONTRACT_DIR, 'projects-2569.json'));
  } catch (e) {
    errors.push(`projects-2569.json unreadable: ${e.message}`);
  }
  if (projects) {
    const plan = (projects.records || []).find((r) => r.kind === 'plan');
    if (!plan || !plan.indicatorCodes.includes('1.1.4')) {
      errors.push('projects-2569: plan must include indicator 1.1.4');
    }
    if (!plan || plan.activityCount !== 147) {
      errors.push(`projects-2569: plan activityCount must be 147, got ${plan?.activityCount}`);
    }
    if (!plan || plan.approvalDateISO !== '2026-04-20') {
      errors.push('projects-2569: plan approvalDateISO must be 2026-04-20');
    }
  }

  let ec;
  try {
    ec = readJSON(resolve(CONTRACT_DIR, 'environmental-committee-2569.json'));
  } catch (e) {
    errors.push(`environmental-committee-2569.json unreadable: ${e.message}`);
  }
  if (ec) {
    const auth = (ec.records || []).find((r) => r.kind === 'appointmentAuthority');
    const groups = (ec.records || []).filter((r) => r.kind === 'committeeGroup');
    const orgCov = (ec.records || []).filter((r) => r.kind === 'organizationCoverage');
    if (!auth || auth.dateISO !== '2026-03-31') {
      errors.push('environmental-committee-2569: appointment must be signed 2026-03-31');
    }
    if (orgCov.length !== 4) {
      errors.push(`environmental-committee-2569: expected 4 organizationCoverage records, got ${orgCov.length}`);
    } else {
      const sum = orgCov.reduce((s, r) => s + (r.personnelCount || 0), 0);
      if (sum !== 97) errors.push(`environmental-committee-2569: org personnel sum must be 97, got ${sum}`);
    }
    const combined = groups.find((g) => g.combinedGroup === true && g.categoryCodes?.includes('cat1') && g.categoryCodes?.includes('cat7'));
    if (!combined) errors.push('environmental-committee-2569: must preserve combined Cat1+Cat7 working group');
    const gap122 = (ec.gaps || []).find((g) => g.indicator === '1.2.2' && g.status === 'MISSING');
    if (!gap122) errors.push('environmental-committee-2569: gaps must declare 1.2.2 MISSING');
  }

  // ── Report ───────────────────────────────────────────────────
  console.log('=== CATEGORY 1 FY2569 OVERLAY CONTRACTS VALIDATION ===');
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
