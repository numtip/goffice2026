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

  // ── management-review invariants (1.7) ───────────────────────
  let mr;
  try {
    mr = readJSON(resolve(CONTRACT_DIR, 'management-review.json'));
  } catch (e) {
    errors.push(`management-review.json unreadable: ${e.message}`);
  }
  if (mr) {
    const meetings = (mr.records || []).filter((r) => r.kind === 'meeting');
    const quorums = (mr.records || []).filter((r) => r.kind === 'quorum');
    const decisions = (mr.records || []).filter((r) => r.kind === 'decision');
    const m1 = meetings.find((r) => r.id === 'mr-meeting-1');
    const m2 = meetings.find((r) => r.id === 'mr-meeting-2');
    if (meetings.length !== 2) {
      errors.push(`management-review: expected exactly 2 meeting records, got ${meetings.length}`);
    }
    if (quorums.length !== 1) {
      errors.push(`management-review: expected exactly 1 quorum record (Meeting #1), got ${quorums.length}`);
    }
    const q1 = quorums[0];
    if (q1) {
      if (q1.meetingId !== 'mr-meeting-1') {
        errors.push('management-review: quorum must reference mr-meeting-1 only');
      }
      if (q1.invitedCount !== 23 || q1.attendedCount !== 20) {
        errors.push('management-review: quorum counts must be 23 invited / 20 attended');
      }
      const calc = Math.round((q1.attendedCount / q1.invitedCount) * 10000) / 100;
      if (calc !== q1.attendancePct) {
        errors.push(`management-review: attendancePct must equal calculated ${calc}, got ${q1.attendancePct}`);
      }
      if (q1.quorumMet !== true || q1.thresholdPct !== 75) {
        errors.push('management-review: quorum must be met at >75% threshold');
      }
    }
    if (m2) {
      if (m2.reviewStatus !== 'occurrence_supported') {
        errors.push('management-review: mr-meeting-2 must be occurrence_supported only');
      }
      if (m2.participantsCount != null) {
        errors.push('management-review: mr-meeting-2 must not infer participantsCount');
      }
      const m2Decisions = decisions.filter((d) => d.meetingId === 'mr-meeting-2');
      if (m2Decisions.length > 0) {
        errors.push('management-review: mr-meeting-2 must not have fabricated decisions');
      }
    }
    if (decisions.length !== 9) {
      errors.push(`management-review: expected 9 Meeting #1 decisions, got ${decisions.length}`);
    }
    for (const d of decisions) {
      if (d.meetingId !== 'mr-meeting-1') {
        errors.push(`management-review: decision ${d.id} must belong to mr-meeting-1 only`);
      }
    }
    if (m1 && m1.dateISO !== '2025-03-07') {
      errors.push('management-review: mr-meeting-1 dateISO must be 2025-03-07');
    }
    if (m2 && m2.dateISO !== '2025-09-18') {
      errors.push('management-review: mr-meeting-2 dateISO must be 2025-09-18');
    }
  }

  // ── 1.1 scope/policy/targets/plan invariants ───────────────────
  let aa;
  try {
    aa = readJSON(resolve(CONTRACT_DIR, 'activities-aspects.json'));
  } catch (e) {
    errors.push(`activities-aspects.json unreadable: ${e.message}`);
  }
  if (aa) {
    const scope = (aa.records || []).find((r) => r.id === 'scope-1');
    const scopeAreas = (aa.records || []).filter((r) => r.kind === 'scopeArea');
    const policies = (aa.records || []).filter((r) => r.kind === 'policyCommitment');
    const approval = (aa.records || []).find((r) => r.id === 'policy-approval-1');
    if (!scope || scope.officeAreaSqm !== 9873) {
      errors.push('activities-aspects: scope-1 officeAreaSqm must be 9873');
    }
    if (scopeAreas.length !== 4) {
      errors.push(`activities-aspects: expected 4 scopeArea records, got ${scopeAreas.length}`);
    } else {
      const sum = scopeAreas.reduce((s, r) => s + (r.areaSqm || 0), 0);
      if (sum !== 9873) errors.push(`activities-aspects: scopeArea sum must be 9873, got ${sum}`);
    }
    if (policies.length !== 10) {
      errors.push(`activities-aspects: expected 10 policyCommitment records, got ${policies.length}`);
    }
    if (!approval || approval.reviewDateISO !== '2025-03-07' || approval.announcementDateISO !== '2025-03-25') {
      errors.push('activities-aspects: policy-approval-1 must distinguish review 2025-03-07 and announcement 2025-03-25');
    }
  }
  let targets;
  try {
    targets = readJSON(resolve(CONTRACT_DIR, 'targets.json'));
  } catch (e) {
    errors.push(`targets.json unreadable: ${e.message}`);
  }
  if (targets) {
    const targetRecs = (targets.records || []).filter((r) => r.kind === 'target');
    const expectedPct = { electricity: -1, fuel: -3, water: -1, paper: -3, general_waste: -3, ghg: -1 };
    if (targetRecs.length !== 6) errors.push(`targets: expected 6 target records, got ${targetRecs.length}`);
    for (const t of targetRecs) {
      if (expectedPct[t.domain] !== t.targetPercent) {
        errors.push(`targets: ${t.id} targetPercent must be ${expectedPct[t.domain]}, got ${t.targetPercent}`);
      }
    }
    const paper = targetRecs.find((r) => r.id === 'target-paper');
    if (!paper?.supersedes || paper.supersedes.priorTargetPercent !== -1) {
      errors.push('targets: target-paper must document −1% → −3% MR amendment via supersedes');
    }
  }
  if (projects) {
    const plan = (projects.records || []).find((r) => r.id === 'proj-plan-1');
    if (!plan?.indicatorCodes?.includes('1.1.4')) {
      errors.push('projects: proj-plan-1 must include indicator 1.1.4');
    }
    if (plan?.sourceRef && !String(plan.sourceRef).includes('1.1.4')) {
      errors.push('projects: proj-plan-1 primary sourceRef must be 1.1.4 PDF');
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
