#!/usr/bin/env node

/**
 * validate-category5-contracts.mjs
 * =================================
 * Deterministic quality gate for the static Category 5 canonical data contracts
 * (src/data/category5/*.json), introduced by GOFFICE2026 Cat5 Phase B.
 *
 * Checks:
 *   1. manifest + all 5 contract files parse and have required top-level keys
 *   2. every contract is year 2568 (frozen FY2568 historical baseline; no FY2569 leakage)
 *   3. per-record reference integrity: indicator/issue/category codes exist in the
 *      canonical taxonomy and match the indicator-issue-category hierarchy;
 *      record indicatorCodes are a subset of the domain's declared indicators
 *   4. verification.status in allowed set; availability in allowed set
 *   5. evidenceIds non-empty and reference existing evidence-index entries whose
 *      categoryCodes/indicatorCodes/manifestPath/manifestSha256/availability/
 *      verification.status exactly match the contract record
 *   6. sourceRef/relatedSources exist in fy2568-publication.json cat5 manifest
 *      (47 docs) and manifestSha256 matches the manifest entry
 *   7. 13/13 indicator coverage: every 5.1.1-5.5.3 resolves to >=1 valid manifest
 *      document via an indicator-level evidence entry; missingIndicators empty
 *   8. locked disclosures:
 *      - FY2569-contamination file (งบ 69) never appears as a record sourceRef
 *      - scan records stay promoted:false / filename_folder_only / pending
 *      - 5.3.1 noiseMeasurementStatus === 'CONTEXTUAL_NA_PENDING_ASSESSOR'
 *      - PERCENT_NOT_EVIDENCED flags on 5.4.2/5.4.3/5.5.2 records
 *      - EXPECTED_SOURCE_UNCONFIRMED on the 5.5.3 record
 *      - no FY2569 facts: no record year other than 2568, no /2569 result claims
 *
 * Usage: node scripts/validate-category5-contracts.mjs
 * Exit code: 0 on pass, 1 on failure.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const CONTRACT_DIR = resolve(ROOT, 'src', 'data', 'category5');
const MANIFEST_PATH = resolve(CONTRACT_DIR, 'category5-manifest.json');
const ALLOWED_DOMAINS = ['air', 'lighting', 'noise', 'livability', 'emergency'];
const DOMAIN_INDICATORS = {
  air: ['5.1.1', '5.1.2', '5.1.3'],
  lighting: ['5.2.1'],
  noise: ['5.3.1', '5.3.2'],
  livability: ['5.4.1', '5.4.2', '5.4.3', '5.4.4'],
  emergency: ['5.5.1', '5.5.2', '5.5.3'],
};
const CAT5_CODES = Object.values(DOMAIN_INDICATORS).flat();
const VALID_VERIFICATION = new Set(['verified', 'reviewed', 'pending', 'unavailable']);
const VALID_AVAILABILITY = new Set([
  'content-verified',
  'metadata-verified',
  'filename_folder_only',
  'structural-only',
  'source-available',
]);
const LOCAL_PATH_PATTERNS = [/F:\\/i, /G:\\/i, /projectAi/i, /OneDrive - Maejo/i];

// FY2569-contamination file is excluded from every FY2568 record (locked disclosure).
const EXCLUDED_SOURCE_REF_FRAGMENT = 'งบ 69';

function readJSON(p) {
  return JSON.parse(readFileSync(p, 'utf8'));
}

function main() {
  const errors = [];

  // ---- Canonical reference data ----
  let criteria, issues, evidence, publication;
  try {
    criteria = readJSON(resolve(ROOT, 'src/data/criteria/indicators.json')).indicators;
    issues = readJSON(resolve(ROOT, 'src/data/criteria/issues.json')).issues;
    evidence = readJSON(resolve(ROOT, 'src/data/evidence-index.json')).items;
    publication = readJSON(resolve(ROOT, 'src/data/fy2568-publication.json'));
  } catch (e) {
    console.error(`FATAL: cannot load canonical references: ${e.message}`);
    process.exit(1);
  }
  const indicatorToIssue = new Map(criteria.map((i) => [i.code, i.issueCode]));
  const issueToCategory = new Map(issues.map((i) => [i.id, i.categoryCode]));
  const evidenceById = new Map(evidence.map((e) => [e.id, e]));

  const cat5ManifestEntries = publication.categories?.cat5?.documents;
  if (!Array.isArray(cat5ManifestEntries) || cat5ManifestEntries.length !== 47) {
    console.error(`FATAL: fy2568-publication.json categories.cat5.documents must be 47 entries, got ${cat5ManifestEntries?.length}`);
    process.exit(1);
  }
  const manifestPathToEntry = new Map(cat5ManifestEntries.map((d) => [d.path, d]));

  // ---- Manifest ----
  let manifest;
  try {
    manifest = readJSON(MANIFEST_PATH);
  } catch (e) {
    console.error(`FATAL: manifest unreadable: ${e.message}`);
    process.exit(1);
  }
  for (const key of ['schemaVersion', 'updated', 'titleTh', 'titleEn', 'governance', 'year', 'status', 'freeze', 'note', 'contracts', 'missingIndicators', 'forwardRequirements', 'sourceLimitations', 'annualReport', 'validation']) {
    if (!(key in manifest)) errors.push(`manifest: missing top-level key "${key}"`);
  }
  if (manifest.schemaVersion !== '1.0.0') errors.push('manifest: schemaVersion must be 1.0.0');
  if (manifest.year !== 2568) errors.push(`manifest: year must be 2568, got ${manifest.year}`);
  if (!Array.isArray(manifest.contracts) || manifest.contracts.length !== ALLOWED_DOMAINS.length) {
    errors.push(`manifest: contracts must list exactly ${ALLOWED_DOMAINS.length} domains`);
  }
  const manifestDomains = new Set((manifest.contracts || []).map((c) => c.domain));
  for (const domain of ALLOWED_DOMAINS) {
    if (!manifestDomains.has(domain)) errors.push(`manifest: missing domain "${domain}"`);
  }

  if (!Array.isArray(manifest.missingIndicators) || manifest.missingIndicators.length !== 0) {
    errors.push('manifest: missingIndicators must be EMPTY (all 13 Cat5 indicators resolve to dedicated evidence)');
  }
  const fwdCodes = new Set((manifest.forwardRequirements || []).map((f) => f.code));
  for (const code of ['FY2569_RECURRING_EVIDENCE_COLLECTION', 'OCR_DECISION_FOR_SCANS']) {
    if (!fwdCodes.has(code)) errors.push(`manifest: forwardRequirements must declare "${code}"`);
  }
  const limitationCodes = new Set((manifest.sourceLimitations || []).map((l) => l.code));
  for (const code of ['SCAN_ONLY_FILES', 'FY2569_CONTAMINATION_EXCLUDED', 'NOISE_MEASUREMENT_CONTEXTUAL_NA', 'LIVABILITY_PERCENT_NOT_EVIDENCED', 'EMERGENCY_UNDERSTANDING_PERCENT_NOT_EVIDENCED', 'HOSE_CABINET_REPORT_3_UNCONFIRMED', 'NO_OCR_IN_THIS_PHASE']) {
    if (!limitationCodes.has(code)) errors.push(`manifest: sourceLimitations must declare "${code}"`);
  }

  // annualReport integrity
  const ar = manifest.annualReport || {};
  for (const role of ['canonical', 'export']) {
    const entry = ar[role];
    if (!entry || !entry.path || !entry.sha256) {
      errors.push(`annualReport: missing ${role} entry`);
      continue;
    }
    const man = manifestPathToEntry.get(entry.path);
    if (!man) {
      errors.push(`annualReport.${role}: path not in fy2568-publication cat5 manifest`);
    } else if (man.sha256 !== entry.sha256) {
      errors.push(`annualReport.${role}: sha256 does not match manifest`);
    }
  }

  // ---- Per-contract validation ----
  const recordCountByIndicator = {};
  const domainByCode = {};
  for (const domain of ALLOWED_DOMAINS) {
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

    const raw = readFileSync(filePath, 'utf8');
    for (const pat of LOCAL_PATH_PATTERNS) {
      if (pat.test(raw)) errors.push(`${domain}: raw file contains local path pattern ${pat}`);
    }

    const domainIndicatorSet = new Set(DOMAIN_INDICATORS[domain]);
    const seenIds = new Set();
    for (const [i, rec] of (contract.records || []).entries()) {
      const at = `${domain}.records[${i}] (${rec.id || '?'})`;
      if (!rec.id || seenIds.has(rec.id)) errors.push(`${at}: id missing or duplicated`);
      seenIds.add(rec.id);
      if (rec.year !== 2568) errors.push(`${at}: year must be 2568 (frozen baseline)`);

      if (!Array.isArray(rec.indicatorCodes)) {
        errors.push(`${at}: indicatorCodes must be an array`);
      } else if (rec.indicatorCodes.length > 0) {
        for (const code of rec.indicatorCodes) {
          if (!indicatorToIssue.has(code)) errors.push(`${at}: unknown indicator "${code}"`);
          if (!domainIndicatorSet.has(code)) errors.push(`${at}: indicator "${code}" not in domain ${domain}`);
          const expectedIssue = indicatorToIssue.get(code);
          const expectedCat = expectedIssue ? issueToCategory.get(expectedIssue) : undefined;
          if (expectedIssue && !(rec.issueCodes || []).includes(expectedIssue)) {
            errors.push(`${at}: issueCodes must include "${expectedIssue}" for ${code}`);
          }
          if (expectedCat && rec.categoryCode !== expectedCat) {
            errors.push(`${at}: categoryCode must be "${expectedCat}" for ${code}`);
          }
          if (domainByCode[code] && domainByCode[code] !== domain) {
            errors.push(`${at}: indicator "${code}" already registered in domain ${domainByCode[code]}`);
          }
          domainByCode[code] = domain;
        }
      }
      if (!Array.isArray(rec.issueCodes)) errors.push(`${at}: issueCodes must be an array`);
      if (rec.categoryCode !== 'cat5') errors.push(`${at}: categoryCode must be "cat5"`);

      // evidenceIds gate
      if (!Array.isArray(rec.evidenceIds)) {
        errors.push(`${at}: evidenceIds must be an array`);
      } else if (rec.evidenceIds.length === 0) {
        errors.push(`${at}: evidenceIds must be non-empty`);
      } else {
        for (const evId of rec.evidenceIds) {
          const ev = evidenceById.get(evId);
          if (!ev) {
            errors.push(`${at}: evidenceId "${evId}" not in evidence-index.json`);
            continue;
          }
          if (!(ev.categoryCodes || []).includes('cat5')) {
            errors.push(`${at}: evidenceId "${evId}" must include categoryCodes cat5`);
          }
          if (ev.traceabilityLevel !== 'indicator') {
            errors.push(`${at}: evidenceId "${evId}" must be traceabilityLevel indicator`);
          } else {
            const recCodes = [...(rec.indicatorCodes || [])].sort();
            const evCodes = [...(ev.indicatorCodes || [])].sort();
            if (JSON.stringify(recCodes) !== JSON.stringify(evCodes)) {
              errors.push(`${at}: evidenceId "${evId}" indicatorCodes must equal record ${JSON.stringify(recCodes)}, got ${JSON.stringify(evCodes)}`);
            }
          }
          if (ev.manifestPath !== rec.sourceRef) {
            errors.push(`${at}: evidenceId "${evId}" manifestPath must equal record sourceRef`);
          }
          if (ev.manifestSha256 !== rec.manifestSha256) {
            errors.push(`${at}: evidenceId "${evId}" manifestSha256 must equal record manifestSha256`);
          }
          if (ev.availability !== rec.availability) {
            errors.push(`${at}: evidenceId "${evId}" availability must equal record availability "${rec.availability}"`);
          }
          if (ev.verification?.status !== rec.verification?.status) {
            errors.push(`${at}: evidenceId "${evId}" verification.status must equal record verification.status`);
          }
        }
      }

      const v = rec.verification || {};
      if (!VALID_VERIFICATION.has(v.status)) {
        errors.push(`${at}: invalid verification.status "${v.status}"`);
      }
      if (!rec.availability || !VALID_AVAILABILITY.has(rec.availability)) {
        errors.push(`${at}: invalid availability "${rec.availability}"`);
      }

      // sourceRef integrity
      if (!rec.sourceRef) {
        errors.push(`${at}: sourceRef missing`);
      } else {
        if (rec.sourceRef.startsWith('/') || /^[a-zA-Z]:/.test(rec.sourceRef)) {
          errors.push(`${at}: sourceRef must be relative to cat5 document root`);
        }
        if (rec.sourceRef.includes(EXCLUDED_SOURCE_REF_FRAGMENT)) {
          errors.push(`${at}: sourceRef is the excluded FY2569-contamination file (${EXCLUDED_SOURCE_REF_FRAGMENT})`);
        }
        const man = manifestPathToEntry.get(rec.sourceRef);
        if (!man) {
          errors.push(`${at}: sourceRef not in fy2568-publication cat5 manifest`);
        } else if (rec.manifestSha256 && man.sha256 !== rec.manifestSha256) {
          errors.push(`${at}: manifestSha256 does not match manifest for "${rec.sourceRef}"`);
        }
      }

      for (const rs of rec.relatedSources || []) {
        if (!manifestPathToEntry.has(rs)) {
          errors.push(`${at}: relatedSources entry not in fy2568-publication cat5 manifest`);
        }
      }

      // scan invariants
      if (/Scan$/.test(rec.kind || '')) {
        if (rec.promoted !== false) errors.push(`${at}: scan record must have promoted:false`);
        if (v.status !== 'pending') errors.push(`${at}: scan record must be verification pending`);
        if (rec.availability !== 'filename_folder_only') errors.push(`${at}: scan record must be availability filename_folder_only`);
      }

      for (const code of rec.indicatorCodes || []) {
        recordCountByIndicator[code] = (recordCountByIndicator[code] || 0) + 1;
      }
    }

    for (const g of contract.gaps || []) {
      if (g.status === 'MISSING_DEDICATED_EVIDENCE') {
        errors.push(`${domain}: no Cat5 indicator may be MISSING_DEDICATED_EVIDENCE (${g.indicator})`);
      }
    }
  }

  // ---- Locked disclosures ----
  const noise = readJSON(resolve(CONTRACT_DIR, 'noise.json'));
  const noiseRec = (noise.records || []).find((r) => r.indicatorCodes.includes('5.3.1'));
  if (!noiseRec || noiseRec.noiseMeasurementStatus !== 'CONTEXTUAL_NA_PENDING_ASSESSOR') {
    errors.push('noise: 5.3.1 record must declare noiseMeasurementStatus CONTEXTUAL_NA_PENDING_ASSESSOR');
  }

  const livability = readJSON(resolve(CONTRACT_DIR, 'livability.json'));
  for (const code of ['5.4.2', '5.4.3']) {
    const rec = (livability.records || []).find((r) => r.indicatorCodes.includes(code));
    if (!rec || rec.percentNotEvidenced !== true) {
      errors.push(`livability: ${code} record must declare percentNotEvidenced true`);
    }
  }
  const excludedInLivability = JSON.stringify(livability).includes(EXCLUDED_SOURCE_REF_FRAGMENT);
  if (!excludedInLivability) {
    errors.push('livability: must disclose the excluded FY2569-contamination file (งบ 69) in its gaps');
  }

  const emergency = readJSON(resolve(CONTRACT_DIR, 'emergency.json'));
  const planRec = (emergency.records || []).find((r) => r.indicatorCodes.includes('5.5.2'));
  if (!planRec || planRec.percentNotEvidenced !== true) {
    errors.push('emergency: 5.5.2 record must declare percentNotEvidenced true');
  }
  const equipRec = (emergency.records || []).find((r) => r.indicatorCodes.includes('5.5.3'));
  if (!equipRec || equipRec.expectedSourceUnconfirmed?.ref !== '5.5.3-3 (รายงานตู้สายดับเพลิง ชั้น 3)') {
    errors.push('emergency: 5.5.3 record must declare expectedSourceUnconfirmed for 5.5.3-3');
  }

  // ---- 13/13 coverage + evidence-side guard ----
  for (const code of CAT5_CODES) {
    if (!recordCountByIndicator[code]) {
      errors.push(`coverage: cat5 indicator "${code}" has no contract record`);
      continue;
    }
    const hasEvidence = evidence.some(
      (e) => (e.categoryCodes || []).includes('cat5') && e.traceabilityLevel === 'indicator' && (e.indicatorCodes || []).includes(code),
    );
    if (!hasEvidence) errors.push(`evidence-index: cat5 indicator "${code}" must have an indicator-level evidence entry`);
  }
  for (const ev of evidence) {
    if ((ev.categoryCodes || []).includes('cat5') && ev.traceabilityLevel === 'indicator') {
      for (const code of ev.indicatorCodes || []) {
        if (!CAT5_CODES.includes(code)) {
          errors.push(`evidence-index: cat5 indicator-level entry "${ev.id}" uses non-cat5 indicator "${code}"`);
        }
      }
    }
  }

  // ---- Report ----
  console.log('=== CATEGORY 5 DATA CONTRACTS VALIDATION ===');
  console.log(`Domains checked : ${ALLOWED_DOMAINS.length} (${ALLOWED_DOMAINS.join(', ')})`);
  console.log('Record counts   : ' + Object.entries(recordCountByIndicator)
    .map(([code, n]) => `${code}=${n}`).join(' · '));
  console.log('Indicator coverage: ' + CAT5_CODES.filter((c) => recordCountByIndicator[c]).length + '/13 in contracts');
  if (errors.length > 0) {
    console.log(`--- ${errors.length} ERROR(S) ---`);
    errors.forEach((e) => console.log(`  •  ${e}`));
    console.log('\nRESULT: FAIL (exit code 1)');
    process.exit(1);
  }
  console.log('RESULT: PASS — (exit code 0)');
}

main();
