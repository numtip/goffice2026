#!/usr/bin/env node

/**
 * validate-category4-contracts.mjs
 * =================================
 * Quality gate for the static Category 4 canonical data contracts
 * (src/data/category4/*.json), introduced by GOFFICE2026 Phase C (C2).
 *
 * Checks:
 *   1. manifest + all 6 contract files parse and have required top-level keys
 *   2. every contract is year 2568 (frozen FY2568 historical baseline; no FY2569 leakage)
 *   3. per-record reference integrity: indicator/issue/category codes exist in the
 *      canonical taxonomy and match the indicator→issue→category hierarchy;
 *      record indicatorCodes are a subset of the domain's declared indicators
 *   4. verification.status in allowed set; availability in allowed set
 *   5. evidenceIds must non-empty and reference existing evidence-index entries whose
 *      categoryCodes/indicatorCodes/manifestPath/manifestSha256/availability/status
 *      exactly match the contract record (C3 gate; no invented evidence). The targets
 *      contract references category-level evidence by design (cross-indicator clause).
 *   6. sourceRef is relative, exists in fy2568-publication.json cat4 manifest (32 docs),
 *      and manifestSha256 matches the manifest entry (no local paths, no fictional files)
 *   7. Cat4 guardrail invariants:
 *      - missingIndicators is EMPTY (all 5 indicators have dedicated evidence)
 *      - forwardRequirements declares FOAM_FREE_FY2569_PLAN (4.1.1(3) gap, forward only)
 *      - source limitations (scans, garbled measures PDF, reuse-numeric-not-met,
 *        general-waste-target-not-met, monthly-vs-annual scope, WTMS external) declared
 *      - superseded (02-03-69 docx) and export (10-03-69 pdf) never appear as record sourceRefs
 *      - scan records stay promoted:false / filename_folder_only / pending
 *      - the garbled 4.1.1(1) measures record is cross-reference-only
 *      - the G2 skimming duplicate (4.2.2(3) ≡ 4.2.1(1)) is disclosed via duplicateOf, never double-counted
 *      - 4.1.3 data invariants: annual scope general 4,380.10 / total 6,434.70 / reuse 31.93% /
 *        numeric >50% NOT met / target −3% NOT met / monthly-form scope 5,625.7 recorded separately
 *   8. annualReport integrity: canonical/superseded/export sha256 match manifest entries
 *
 * Usage: node scripts/validate-category4-contracts.mjs
 * Exit code: 0 on pass, 1 on failure.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const CONTRACT_DIR = resolve(ROOT, 'src', 'data', 'category4');
const MANIFEST_PATH = resolve(CONTRACT_DIR, 'category4-manifest.json');
const ALLOWED_DOMAINS = ['targets', 'measures', 'sorting', 'data', 'wastewater', 'treatment-care'];
const DOMAIN_INDICATORS = {
  targets: [],
  measures: ['4.1.1'],
  sorting: ['4.1.2'],
  data: ['4.1.3'],
  wastewater: ['4.2.1'],
  'treatment-care': ['4.2.2'],
};
const VALID_VERIFICATION = new Set(['verified', 'reviewed', 'pending', 'unavailable']);
const VALID_AVAILABILITY = new Set([
  'content-verified',
  'metadata-verified',
  'filename_folder_only',
  'structural-only',
  'source-available',
]);
const LOCAL_PATH_PATTERNS = [/F:\\/i, /G:\\/i, /projectAi/i, /OneDrive - Maejo/i];

// Superseded / export files and the G2 skimming duplicate must never be the
// canonical sourceRef of a NEW evidence record (the G2 duplicate is disclosed
// separately via duplicateOf on the treatment-care scan record).
const EXCLUDED_SOURCE_REFS = [
  'หมวดที่ 4 รายงานผลการจัดการของเสีย  (02-03-69).docx', // superseded report revision
  'หมวดที่ 4 รายงานผลการจัดการของเสีย  (10-03-69).pdf', // reader-friendly export (not indicator-level)
];

const REQUIRED_LIMITATIONS = [
  'SCAN_TARGET_ANNOUNCE',
  'SCAN_CONTEXT_ANNOUNCE',
  'SCAN_RANDOM_CHECK_FORM',
  'SCAN_CONTRACT',
  'SCAN_WASTE_LOG',
  'SCAN_SKIMMING_RECORD',
  'GARBLED_MEASURES_PDF',
  'NO_SIGNED_COPY',
  'REUSE_NUMERIC_NOT_MET',
  'GENERAL_WASTE_TARGET_NOT_MET',
  'MONTHLY_VS_ANNUAL_SCOPE',
  'WTMS_EXTERNAL_RECORDS',
];

function readJSON(p) {
  return JSON.parse(readFileSync(p, 'utf8'));
}

function main() {
  const errors = [];

  // ── Canonical reference data ────────────────────────────────
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

  const cat4ManifestEntries = publication.categories?.cat4?.documents;
  if (!Array.isArray(cat4ManifestEntries) || cat4ManifestEntries.length !== 32) {
    console.error(`FATAL: fy2568-publication.json categories.cat4.documents must be 32 entries, got ${cat4ManifestEntries?.length}`);
    process.exit(1);
  }
  const manifestPathToEntry = new Map(cat4ManifestEntries.map((d) => [d.path, d]));

  // ── Manifest ─────────────────────────────────────────────────
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

  // ── All 5 indicators covered — no MISSING indicator ────────
  if (!Array.isArray(manifest.missingIndicators) || manifest.missingIndicators.length !== 0) {
    errors.push('manifest: missingIndicators must be EMPTY (all 5 Cat4 indicators have dedicated evidence)');
  }
  // The foam-free FY2569 plan is a forward requirement, not a verified FY2569 fact.
  const fwdCodes = new Set((manifest.forwardRequirements || []).map((f) => f.code));
  if (!fwdCodes.has('FOAM_FREE_FY2569_PLAN')) {
    errors.push('manifest: forwardRequirements must declare FOAM_FREE_FY2569_PLAN (4.1.1(3) forward plan)');
  }

  // ── Source limitations declared (honesty gate) ───────────────
  const limitationCodes = new Set((manifest.sourceLimitations || []).map((l) => l.code));
  for (const code of REQUIRED_LIMITATIONS) {
    if (!limitationCodes.has(code)) errors.push(`manifest: sourceLimitations must declare "${code}"`);
  }

  // ── annualReport integrity ──────────────────────────────────
  const ar = manifest.annualReport || {};
  for (const role of ['canonical', 'superseded', 'export']) {
    const entry = ar[role];
    if (!entry || !entry.path || !entry.sha256) {
      errors.push(`annualReport: missing ${role} entry`);
      continue;
    }
    const man = manifestPathToEntry.get(entry.path);
    if (!man) {
      errors.push(`annualReport.${role}: path "${entry.path}" not in fy2568-publication cat4 manifest`);
    } else if (man.sha256 !== entry.sha256) {
      errors.push(`annualReport.${role}: sha256 ${entry.sha256} does not match manifest ${man.sha256}`);
    }
  }
  if (ar.canonical?.path !== 'หมวดที่ 4 รายงานผลการจัดการของเสีย  (10-03-69).docx') {
    errors.push('annualReport.canonical must be the 10-03-69 DOCX (revision 129)');
  }
  if (ar.superseded?.path !== 'หมวดที่ 4 รายงานผลการจัดการของเสีย  (02-03-69).docx') {
    errors.push('annualReport.superseded must be the 02-03-69 DOCX (revision 106)');
  }
  if (!JSON.stringify(ar).includes('no signed') && !JSON.stringify(ar).includes('No signed')) {
    errors.push('annualReport: must disclaim a signed/approved submission copy');
  }

  // ── Per-contract validation ──────────────────────────────────
  const recordCountByIndicator = {};
  const skimScanRecords = [];
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
          if (!domainIndicatorSet.has(code)) errors.push(`${at}: indicator "${code}" not in domain ${domain} (${DOMAIN_INDICATORS[domain]})`);
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
      if (rec.categoryCode !== 'cat4') errors.push(`${at}: categoryCode must be "cat4"`);

      // evidenceIds: C3 gate
      if (!Array.isArray(rec.evidenceIds)) {
        errors.push(`${at}: evidenceIds must be an array`);
      } else if (rec.evidenceIds.length === 0) {
        errors.push(`${at}: evidenceIds must be non-empty after C3 evidence mapping`);
      } else {
        for (const evId of rec.evidenceIds) {
          const ev = evidenceById.get(evId);
          if (!ev) {
            errors.push(`${at}: evidenceId "${evId}" not in evidence-index.json`);
            continue;
          }
          if (!(ev.categoryCodes || []).includes('cat4')) {
            errors.push(`${at}: evidenceId "${evId}" must include categoryCodes cat4`);
          }
          if (domain === 'targets') {
            if (ev.traceabilityLevel !== 'category') {
              errors.push(`${at}: evidenceId "${evId}" must be category-level for the targets domain`);
            }
          } else if (ev.traceabilityLevel !== 'indicator') {
            errors.push(`${at}: evidenceId "${evId}" must be traceabilityLevel indicator`);
          } else {
            const recCodes = [...(rec.indicatorCodes || [])].sort();
            const evCodes = [...(ev.indicatorCodes || [])].sort();
            if (JSON.stringify(recCodes) !== JSON.stringify(evCodes)) {
              errors.push(`${at}: evidenceId "${evId}" indicatorCodes must equal record ${JSON.stringify(recCodes)}, got ${JSON.stringify(evCodes)}`);
            }
          }
          if (ev.manifestPath !== rec.sourceRef) {
            errors.push(`${at}: evidenceId "${evId}" manifestPath must equal record sourceRef "${rec.sourceRef}"`);
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
          errors.push(`${at}: sourceRef must be relative to cat4 document root`);
        }
        if (EXCLUDED_SOURCE_REFS.includes(rec.sourceRef)) {
          errors.push(`${at}: sourceRef "${rec.sourceRef}" is excluded from cat4 mapping (superseded/export)`);
        }
        const man = manifestPathToEntry.get(rec.sourceRef);
        if (!man) {
          errors.push(`${at}: sourceRef "${rec.sourceRef}" not in fy2568-publication cat4 manifest`);
        } else if (rec.manifestSha256 && man.sha256 !== rec.manifestSha256) {
          errors.push(`${at}: manifestSha256 does not match manifest for "${rec.sourceRef}"`);
        }
      }

      for (const rs of rec.relatedSources || []) {
        if (!manifestPathToEntry.has(rs)) {
          errors.push(`${at}: relatedSources "${rs}" not in fy2568-publication cat4 manifest`);
        }
      }

      // scan invariants
      if (/Scan$/.test(rec.kind || '')) {
        if (rec.promoted !== false) errors.push(`${at}: scan record must have promoted:false`);
        if (v.status !== 'pending') errors.push(`${at}: scan record must be verification pending`);
        if (rec.availability !== 'filename_folder_only') errors.push(`${at}: scan record must be availability filename_folder_only`);
        skimScanRecords.push(rec);
      }
      // garbled cross-reference invariant
      if (rec.id === 'measure-waste-plan-crossref-fy2568') {
        if (rec.promoted !== false) errors.push(`${at}: garbled measures record must have promoted:false`);
        if (rec.availability !== 'filename_folder_only') errors.push(`${at}: garbled measures record must be filename_folder_only`);
        if (!/cross-reference/i.test(v.basis || '') && !/garbled/i.test(v.basis || '')) {
          errors.push(`${at}: garbled measures basis must state cross-reference-only verification`);
        }
      }

      for (const code of rec.indicatorCodes || []) {
        recordCountByIndicator[code] = (recordCountByIndicator[code] || 0) + 1;
      }
    }

    for (const g of contract.gaps || []) {
      if (g.status === 'MISSING_DEDICATED_EVIDENCE') {
        errors.push(`${domain}: no Cat4 indicator may be MISSING_DEDICATED_EVIDENCE (${g.indicator})`);
      }
    }

    // ── 4.1.3 data invariants (annual scope, honest claims) ──
    if (domain === 'data') {
      const annual = (contract.records || []).find((r) => r.id === 'data-waste-annual-fy2568');
      if (!annual) {
        errors.push('data: must contain data-waste-annual-fy2568');
      } else {
        if (annual.generalWasteTotal !== 4380.1) errors.push(`data: generalWasteTotal must be 4380.1, got ${annual.generalWasteTotal}`);
        if (annual.totalAllWaste !== 6434.7) errors.push(`data: totalAllWaste must be 6434.7, got ${annual.totalAllWaste}`);
        if (annual.reusePercent !== 31.93) errors.push(`data: reusePercent must be 31.93, got ${annual.reusePercent}`);
        if (annual.reuseNumericThresholdMet !== false) errors.push('data: reuseNumericThresholdMet must be false (31.93% < 50%, claimed via innovation/compost branch)');
        if (annual.targetOutcome !== 'NOT_MET') errors.push('data: targetOutcome must be NOT_MET (−3% target vs +1.68% actual)');
        if (annual.monthlyFormScopeTotal !== 5625.7) errors.push(`data: monthlyFormScopeTotal must be 5625.7 (form scope, recorded separately), got ${annual.monthlyFormScopeTotal}`);
      }
      const analysis = (contract.records || []).find((r) => r.id === 'data-waste-analysis-fy2568');
      if (!analysis) {
        errors.push('data: must contain data-waste-analysis-fy2568');
      } else if (analysis.diffVsPrevYear !== -72.4 || analysis.diffPercentVsPrevYear !== -1.68) {
        errors.push('data: analysis diff values must be −72.40 kg / −1.68%');
      }
    }

    // ── 4.1.1 foam-free gap disclosure ──
    if (domain === 'measures') {
      const gap = (contract.records || []).find((r) => r.kind === 'disclosedGap');
      if (!gap) errors.push('measures: must contain the 4.1.1(3) foam-free disclosed-gap record');
      if (!(contract.forwardRequirements || []).some((f) => f.code === 'FOAM_FREE_FY2569_PLAN')) {
        errors.push('measures: must declare FOAM_FREE_FY2569_PLAN forward requirement');
      }
    }
  }

  // ── G2 skimming duplicate: exactly one duplicateOf pointer ──
  const dupOf = skimScanRecords.filter((r) => r.duplicateOf);
  if (dupOf.length !== 1) {
    errors.push(`treatment-care must disclose exactly one G2 skimming duplicate (duplicateOf), got ${dupOf.length}`);
  } else if (dupOf[0].id !== 'treatment-skim-scan-fy2568' || dupOf[0].duplicateOf !== 'wastewater-skim-scan-fy2568') {
    errors.push('G2 skimming duplicate must be treatment-skim-scan-fy2568 → duplicateOf wastewater-skim-scan-fy2568');
  }
  const skimShas = new Set(skimScanRecords.filter((r) => r.kind === 'skimRecordScan').map((r) => r.manifestSha256));
  if (skimShas.size !== 1) {
    errors.push(`G2 skimming records (4.2.1(1) and 4.2.2(3)) must be byte-identical (one sha), got ${skimShas.size}`);
  }

  // ── C3 global evidence invariants ─────────────────────────────
  const referencedCat4Evidence = new Set();
  for (const domain of ALLOWED_DOMAINS) {
    let contract;
    try {
      contract = readJSON(resolve(CONTRACT_DIR, `${domain}.json`));
    } catch {
      continue;
    }
    for (const rec of contract.records || []) {
      for (const evId of rec.evidenceIds || []) referencedCat4Evidence.add(evId);
    }
  }
  for (const ev of evidence) {
    if (!(ev.categoryCodes || []).includes('cat4')) continue;
    if (ev.traceabilityLevel !== 'indicator') continue;
    if (!referencedCat4Evidence.has(ev.id)) {
      errors.push(`evidence-index: cat4 indicator-level entry "${ev.id}" is not referenced by any C4 contract record`);
    }
  }
  const cat4Codes = criteria.filter((i) => i.categoryCode === 'cat4').map((i) => i.code);
  for (const code of cat4Codes) {
    const hasEvidence = evidence.some(
      (e) => (e.categoryCodes || []).includes('cat4') && e.traceabilityLevel === 'indicator' && (e.indicatorCodes || []).includes(code),
    );
    if (!hasEvidence) errors.push(`evidence-index: cat4 indicator "${code}" must have an indicator-level evidence entry`);
  }
  for (const ev of evidence) {
    if ((ev.categoryCodes || []).includes('cat4') && ev.traceabilityLevel === 'indicator') {
      for (const code of ev.indicatorCodes || []) {
        if (!cat4Codes.includes(code)) {
          errors.push(`evidence-index: cat4 indicator-level entry "${ev.id}" uses non-cat4 indicator "${code}"`);
        }
      }
    }
  }

  // ── Report ───────────────────────────────────────────────────
  console.log('=== CATEGORY 4 DATA CONTRACTS VALIDATION ===');
  console.log(`Domains checked : ${ALLOWED_DOMAINS.length} (${ALLOWED_DOMAINS.join(', ')})`);
  console.log('Record counts   : ' + Object.entries(recordCountByIndicator)
    .map(([code, n]) => `${code}=${n}`).join(' · '));
  console.log('Indicator coverage: ' + cat4Codes.filter((c) => recordCountByIndicator[c]).length + '/5 in contracts');
  if (errors.length > 0) {
    console.log(`--- ${errors.length} ERROR(S) ---`);
    errors.forEach((e) => console.log(`  ✗  ${e}`));
    console.log('\nRESULT: FAIL (exit code 1)');
    process.exit(1);
  }
  console.log('RESULT: PASS ✓ (exit code 0)');
}

main();
