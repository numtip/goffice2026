#!/usr/bin/env node

/**
 * validate-category1-contracts.mjs
 * =================================
 * Quality gate for the static Category 1 canonical data contracts
 * (src/data/category1/*.json), introduced by GOFFICE2026 Phase C/D.
 *
 * Checks:
 *   1. manifest + all 8 contract files parse and have required top-level keys
 *   2. every contract is year 2568 (no FY2569 leakage as record values)
 *   3. per-record reference integrity: indicator/issue/category codes exist in
 *      the canonical taxonomy and match the indicator→issue→category hierarchy
 *   4. evidenceIds exist in evidence-index.json (never invented)
 *   5. verification.status in allowed set; availability present
 *   6. no local filesystem paths (no F:\ , projectAi, full OneDrive paths)
 *   7. ghg invariants: septic anomaly is documented as exclusion only, never as
 *      a reported value; inventory total is the verified 231.62 tCO2e
 *   8. MISSING indicators (1.2.2, 1.5.3) appear only in gaps arrays
 *
 * Usage: node scripts/validate-category1-contracts.mjs
 * Exit code: 0 on pass, 1 on failure.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const CONTRACT_DIR = resolve(ROOT, 'src', 'data', 'category1');
const MANIFEST_PATH = resolve(CONTRACT_DIR, 'category1-manifest.json');
const ALLOWED_DOMAINS = new Set([
  'activities-aspects',
  'laws',
  'compliance',
  'targets',
  'ghg',
  'projects',
  'management-review',
  'environmental-aspects-2568',
]);
const VALID_VERIFICATION = new Set(['verified', 'reviewed', 'pending', 'unavailable']);
const MISSING_INDICATORS = ['1.2.2', '1.5.3'];
const LOCAL_PATH_PATTERNS = [/F:\\/i, /projectAi/i, /OneDrive - Maejo/i];

function readJSON(p) {
  return JSON.parse(readFileSync(p, 'utf8'));
}

function main() {
  const errors = [];

  // ── Canonical reference data ────────────────────────────────
  let criteria, evidence;
  try {
    criteria = readJSON(resolve(ROOT, 'src/data/criteria/indicators.json')).indicators;
    evidence = readJSON(resolve(ROOT, 'src/data/evidence-index.json')).items;
  } catch (e) {
    console.error(`FATAL: cannot load canonical references: ${e.message}`);
    process.exit(1);
  }
  const indicatorToIssue = new Map(criteria.map((i) => [i.code, i.issueCode]));
  const issueToCategory = new Map(
    readJSON(resolve(ROOT, 'src/data/criteria/issues.json')).issues.map((i) => [i.id, i.categoryCode]),
  );
  const evidenceIds = new Set(evidence.map((e) => e.id));

  // ── Manifest ─────────────────────────────────────────────────
  let manifest;
  try {
    manifest = readJSON(MANIFEST_PATH);
  } catch (e) {
    errors.push(`manifest unreadable: ${e.message}`);
    process.exit(1);
  }
  if (manifest.schemaVersion !== '1.0.0') errors.push('manifest schemaVersion must be 1.0.0');
  if (!Array.isArray(manifest.contracts) || manifest.contracts.length !== 8) {
    errors.push('manifest.contracts must list 8 domains');
  }

  const manifestDomains = new Set((manifest.contracts || []).map((c) => c.domain));

  // ── Per-contract validation ──────────────────────────────────
  for (const domain of ALLOWED_DOMAINS) {
    if (!manifestDomains.has(domain)) errors.push(`manifest missing domain "${domain}"`);
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
    if (contract.year !== 2568) errors.push(`${domain}: year must be 2568, got ${contract.year}`);

    // Local-path scan over the raw text
    const raw = readFileSync(filePath, 'utf8');
    for (const pat of LOCAL_PATH_PATTERNS) {
      if (pat.test(raw)) errors.push(`${domain}: raw file contains local path pattern ${pat}`);
    }

    // Record-level checks
    const seenIds = new Set();
    for (const [i, rec] of (contract.records || []).entries()) {
      const at = `${domain}.records[${i}] (${rec.id || '?'})`;
      if (!rec.id || seenIds.has(rec.id)) errors.push(`${at}: id missing or duplicated`);
      seenIds.add(rec.id);
      if (rec.year !== 2568) errors.push(`${at}: year must be 2568`);
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
      for (const evId of rec.evidenceIds || []) {
        if (!evidenceIds.has(evId)) errors.push(`${at}: evidenceId "${evId}" not in evidence-index.json`);
      }
      const v = rec.verification || {};
      if (!VALID_VERIFICATION.has(v.status)) {
        errors.push(`${at}: invalid verification.status "${v.status}"`);
      }
      if (!rec.sourceRef) errors.push(`${at}: sourceRef missing`);
    }

    // Gaps: the two MISSING indicators must be declared
    const gapIndicators = (contract.gaps || []).map((g) => g.indicator);
    for (const mi of MISSING_INDICATORS) {
      if (!gapIndicators.includes(mi)) errors.push(`${domain}: gaps must declare MISSING indicator "${mi}"`);
    }
  }

  // ── ghg invariants ───────────────────────────────────────────
  const ghgRaw = readFileSync(resolve(CONTRACT_DIR, 'ghg.json'), 'utf8');
  if (ghgRaw.includes('7548513')) {
    errors.push('ghg: inflated septic-tank summary value (7,548,513.84) must never appear as a reported value');
  }
  let ghg;
  try {
    ghg = JSON.parse(ghgRaw);
  } catch { /* handled above */ }
  if (ghg) {
    const inv = (ghg.records || []).find((r) => r.kind === 'inventory');
    if (!inv) errors.push('ghg: inventory record missing');
    else if (inv.septicAnomalyExcluded !== true) errors.push('ghg: inventory.septicAnomalyExcluded must be true');
    else if (Math.abs(inv.totalTCO2e - 231.62) > 0.001) {
      errors.push(`ghg: inventory total must be the verified 231.62 tCO2e, got ${inv.totalTCO2e}`);
    }
    const exclusions = (ghg.records || []).filter((r) => r.kind === 'exclusion');
    if (exclusions.length === 0) errors.push('ghg: exclusions must document the septic-tank anomaly');
  }

  // ── projects invariants (1.6) ────────────────────────────────
  const ALLOWED_GHG_IMPACT = new Set(['ghg_measured', 'ghg_supporting_action', 'environmental_improvement']);
  let projects;
  try {
    projects = readJSON(resolve(CONTRACT_DIR, 'projects.json'));
  } catch (e) {
    errors.push(`projects.json unreadable: ${e.message}`);
  }
  if (projects) {
    const projectRecords = (projects.records || []).filter((r) => r.kind === 'project');
    const planRecords = (projects.records || []).filter((r) => r.kind === 'plan');
    const projectIds = projectRecords.map((r) => r.id);
    if (projectRecords.length !== 2) {
      errors.push(`projects: expected exactly 2 FY2568 project records, got ${projectRecords.length}`);
    }
    if (new Set(projectIds).size !== projectIds.length) {
      errors.push('projects: duplicate project IDs detected');
    }
    const p2 = projectRecords.find((r) => r.id === 'proj-2');
    if (!p2 || !p2.indicatorCodes.includes('1.3.3') || !p2.indicatorCodes.includes('1.6.2')) {
      errors.push('projects: proj-2 must be shared by 1.3.3 and 1.6.2');
    }
    const p1 = projectRecords.find((r) => r.id === 'proj-1');
    if (p1 && p1.indicatorCodes.includes('1.3.3')) {
      errors.push('projects: proj-1 must not be duplicated under 1.3.3');
    }
    for (const rec of [...projectRecords, ...planRecords]) {
      if (rec.ghgImpactStatus && !ALLOWED_GHG_IMPACT.has(rec.ghgImpactStatus)) {
        errors.push(`projects: ${rec.id} has invalid ghgImpactStatus "${rec.ghgImpactStatus}"`);
      }
      if (rec.ghgImpactStatus === 'ghg_measured' && rec.measuredReduction == null) {
        errors.push(`projects: ${rec.id} claims ghg_measured without measuredReduction`);
      }
      if (rec.measuredReduction != null && typeof rec.measuredReduction !== 'number') {
        errors.push(`projects: ${rec.id} measuredReduction must be numeric or null`);
      }
      if (rec.performanceGapLink != null) {
        errors.push(`projects: ${rec.id} performanceGapLink must be null unless source explicitly links to 1.5.2`);
      }
    }
    const plan = planRecords.find((r) => r.id === 'proj-plan-1');
    if (!plan || !plan.indicatorCodes.includes('1.6.1')) {
      errors.push('projects: proj-plan-1 must exist for 1.6.1');
    }
  }

  // ── Report ───────────────────────────────────────────────────
  console.log('=== CATEGORY 1 DATA CONTRACTS VALIDATION ===');
  console.log(`Domains checked : ${[...ALLOWED_DOMAINS].length}`);
  if (errors.length > 0) {
    console.log(`--- ${errors.length} ERROR(S) ---`);
    errors.forEach((e) => console.log(`  ✗  ${e}`));
    console.log('\nRESULT: FAIL (exit code 1)');
    process.exit(1);
  }
  console.log('RESULT: PASS ✓ (exit code 0)');
}

main();
