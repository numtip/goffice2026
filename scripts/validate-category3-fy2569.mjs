#!/usr/bin/env node

/**
 * validate-category3-fy2569.mjs
 * =================================
 * Quality gate for FY2569 Cat3 overlay contracts (src/data/category3/*-2569.json).
 * Frozen FY2568 contracts are validated by validate-category3-contracts.mjs.
 *
 * Usage: node scripts/validate-category3-fy2569.mjs
 * Exit code: 0 on pass, 1 on failure.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const CONTRACT_DIR = resolve(ROOT, 'src', 'data', 'category3');
const FY2569_DOMAINS = ['measures-2569'];
const EXPECTED_RECORD_INDICATORS = ['3.1.1', '3.2.1', '3.2.4', '3.3.1', '3.3.4', '3.4.1'];
const OUT_OF_SCOPE_SECTIONS = ['6', '7', '8', '9'];
const EXCLUDED_DATA_INDICATORS = ['3.1.2', '3.2.2', '3.2.5', '3.3.2'];
const LOCAL_PATH_PATTERNS = [/F:\\/i, /G:\\/i, /projectAi/i, /OneDrive - Maejo/i];
const PRIMARY_SOURCE = '3.1-มาตรการควบคุมการใช้พลังงานและทรัพยากร2569.docx';
const PRIMARY_SHA256 = '5f3a72e532041d46b6c994db3c9f58e1dc2daff54665b33ba47e1919b0b45b12';

function readJSON(p) {
  return JSON.parse(readFileSync(p, 'utf8'));
}

function main() {
  const errors = [];
  const allReferencedEvidence = new Set();
  const mappedIndicators = new Set();

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

    for (const key of ['schemaVersion', 'domain', 'updated', 'year', 'governance', 'records', 'gaps', 'outOfScopeSections']) {
      if (!(key in contract)) errors.push(`${domain}: missing top-level key "${key}"`);
    }
    if (contract.schemaVersion !== '1.0.0') errors.push(`${domain}: schemaVersion must be 1.0.0`);
    if (contract.domain !== domain) errors.push(`${domain}: domain mismatch "${contract.domain}"`);
    if (contract.year !== 2569) errors.push(`${domain}: year must be 2569, got ${contract.year}`);

    const raw = readFileSync(filePath, 'utf8');
    for (const pat of LOCAL_PATH_PATTERNS) {
      if (pat.test(raw)) errors.push(`${domain}: raw file contains local path pattern ${pat}`);
    }

    const declaredOut = (contract.outOfScopeSections || []).map((s) => String(s.section));
    for (const sec of OUT_OF_SCOPE_SECTIONS) {
      if (!declaredOut.includes(sec)) {
        errors.push(`${domain}: outOfScopeSections must declare section ${sec} as OUT OF CAT3 scope`);
      }
    }

    const primarySource = (contract.sources || []).find((s) => s.role === 'primary-measures-plan');
    if (!primarySource || primarySource.ref !== PRIMARY_SOURCE) {
      errors.push(`${domain}: sources must declare primary-measures-plan ref "${PRIMARY_SOURCE}"`);
    }

    const seenIds = new Set();
    for (const [i, rec] of (contract.records || []).entries()) {
      const at = `${domain}.records[${i}] (${rec.id || '?'})`;
      if (!rec.id || seenIds.has(rec.id)) errors.push(`${at}: id missing or duplicated`);
      seenIds.add(rec.id);
      if (rec.year !== 2569) errors.push(`${at}: year must be 2569`);
      if (rec.categoryCode !== 'cat3') errors.push(`${at}: categoryCode must be "cat3"`);
      if (!rec.sourceSection?.section || !rec.sourceSection?.basis) {
        errors.push(`${at}: sourceSection.section and sourceSection.basis required`);
      }
      if (rec.sourceRef !== PRIMARY_SOURCE) {
        errors.push(`${at}: sourceRef must be primary DOCX "${PRIMARY_SOURCE}" (one physical source)`);
      }
      if ((rec.manifestSha256 || '').toLowerCase() !== PRIMARY_SHA256) {
        errors.push(`${at}: manifestSha256 must match primary DOCX hash`);
      }
      if (!Array.isArray(rec.indicatorCodes) || rec.indicatorCodes.length !== 1) {
        errors.push(`${at}: indicatorCodes must contain exactly one indicator`);
      } else {
        for (const code of rec.indicatorCodes) {
          mappedIndicators.add(code);
          if (EXCLUDED_DATA_INDICATORS.includes(code)) {
            errors.push(`${at}: must not map Track B data indicator "${code}"`);
          }
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
      if (rec.sourceRef) {
        const pubPath = join(ROOT, 'public', 'documents', 'fy2569', 'cat3', rec.sourceRef);
        if (!existsSync(pubPath)) {
          errors.push(`${at}: sourceRef file missing at public/documents/fy2569/cat3/${rec.sourceRef}`);
        }
      }
      for (const evId of rec.evidenceIds || []) {
        allReferencedEvidence.add(evId);
        const ev = evidenceById.get(evId);
        if (!ev) {
          errors.push(`${at}: evidenceId "${evId}" not in evidence-index.json`);
          continue;
        }
        if (ev.year !== 2569) errors.push(`${at}: evidenceId "${evId}" must be year 2569`);
        if (ev.superseded) errors.push(`${at}: evidenceId "${evId}" is superseded`);
        if (!(ev.categoryCodes || []).includes('cat3')) {
          errors.push(`${at}: evidenceId "${evId}" must include categoryCodes cat3`);
        }
        if (ev.intakeVerification !== 'available_unverified') {
          errors.push(`${at}: evidenceId "${evId}" intakeVerification must be available_unverified`);
        }
        if (ev.traceabilityLevel === 'indicator') {
          const recCodes = [...(rec.indicatorCodes || [])].sort();
          const evCodes = [...(ev.indicatorCodes || [])].sort();
          if (JSON.stringify(recCodes) !== JSON.stringify(evCodes)) {
            errors.push(`${at}: evidenceId "${evId}" indicatorCodes must equal record ${JSON.stringify(recCodes)}`);
          }
        }
        if ((ev.manifestSha256 || '').toLowerCase() !== PRIMARY_SHA256) {
          errors.push(`${at}: evidenceId "${evId}" manifestSha256 must match primary DOCX`);
        }
        if (ev.manifestPath !== PRIMARY_SOURCE) {
          errors.push(`${at}: evidenceId "${evId}" manifestPath must be primary DOCX only (no PDF duplicate semantics)`);
        }
      }
    }
  }

  for (const code of EXPECTED_RECORD_INDICATORS) {
    if (!mappedIndicators.has(code)) {
      errors.push(`measures-2569: missing required indicator record for ${code}`);
    }
  }

  for (const ev of evidence) {
    if (ev.year !== 2569) continue;
    if (!(ev.categoryCodes || []).includes('cat3')) continue;
    if (ev.traceabilityLevel !== 'indicator') continue;
    if (ev.superseded) continue;
    if (!allReferencedEvidence.has(ev.id)) {
      errors.push(`evidence-index: FY2569 cat3 entry "${ev.id}" is not referenced by any FY2569 overlay record`);
    }
  }

  console.log('=== CATEGORY 3 FY2569 OVERLAY CONTRACTS VALIDATION ===');
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
