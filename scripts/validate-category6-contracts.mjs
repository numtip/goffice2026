#!/usr/bin/env node

/**
 * validate-category6-contracts.mjs
 * =================================
 * Deterministic quality gate for the static Category 6 canonical data contracts
 * (src/data/category6/*.json), introduced by GOFFICE2026 Cat6 Phase B.
 *
 * Checks:
 *   1. manifest + all 3 contract files parse and have required top-level keys
 *   2. every contract is year 2568 (frozen FY2568 historical baseline; no FY2569 leakage)
 *   3. per-record reference integrity: indicator/issue/category codes exist in the
 *      canonical taxonomy and match the indicator-issue-category hierarchy;
 *      record indicatorCodes are a subset of the domain's declared indicators
 *   4. verification.status in allowed set; availability in allowed set
 *   5. evidenceIds non-empty and reference existing evidence-index entries whose
 *      categoryCodes/indicatorCodes/manifestPath/manifestSha256/availability/
 *      verification.status exactly match the contract record
 *   6. sourceRef/relatedSources exist in fy2568-publication.json cat6 manifest
 *      (32 docs) and manifestSha256 matches the manifest entry
 *   7. 6/6 indicator coverage: every 6.1.1-6.2.3 resolves to >=1 valid manifest
 *      document via an indicator-level evidence entry; missingIndicators empty
 *   8. locked disclosures:
 *      - the FY2569-budget cleaning contract (สัญญาจ้างทำความสะอาด 69.pdf) is
 *        QUARANTINED (candidateFy2569Only) and never appears as a record
 *        sourceRef/relatedSources
 *      - contentDuplicateCandidate pairs P1/P2 keep both sourceRefs (no dedup)
 *      - scan records stay promoted:false / filename_folder_only / pending
 *      - 6.1.2 percentage is source-declared with basis/unit (92.33 volume /
 *        89.80 value) and never recomputed
 *      - 6.1.3 record declares percentNotEvidenced true (PERCENT_NOT_EVIDENCED)
 *      - annualReport baselineDataYear 2568 / revisionDate 2569-03-17 with a
 *        manifest-matching sha256
 *      - no local paths, no FY2569 results, no year other than 2568
 *
 * Usage: node scripts/validate-category6-contracts.mjs
 * Exit code: 0 on pass, 1 on failure.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const CONTRACT_DIR = resolve(ROOT, 'src', 'data', 'category6');
const MANIFEST_PATH = resolve(CONTRACT_DIR, 'category6-manifest.json');
const ALLOWED_DOMAINS = ['products', 'contractors', 'services'];
const DOMAIN_INDICATORS = {
  products: ['6.1.1', '6.1.2', '6.1.3'],
  contractors: ['6.2.1', '6.2.2'],
  services: ['6.2.3'],
};
const CAT6_CODES = Object.values(DOMAIN_INDICATORS).flat();
const VALID_VERIFICATION = new Set(['verified', 'reviewed', 'pending', 'unavailable']);
const VALID_AVAILABILITY = new Set([
  'content-verified',
  'metadata-verified',
  'filename_folder_only',
  'structural-only',
  'source-available',
]);
const LOCAL_PATH_PATTERNS = [/F:\\/i, /G:\\/i, /projectAi/i, /OneDrive - Maejo/i];

// FY2569-budget cleaning contract is QUARANTINED from every FY2568 record (locked disclosure).
const QUARANTINE_PATH = '6.2 การจัดจ้าง/6.2.1(3) 1 สัญญาจ้างทำความสะอาด 69.pdf';
const QUARANTINE_FRAGMENT = 'สัญญาจ้างทำความสะอาด 69';

// Source-declared FY2568 percentages (from the content-verified annual report + Form 6.1(2)).
const DECLARED_VOLUME = '92.33';
const DECLARED_VALUE = '89.80';

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

  const cat6ManifestEntries = publication.categories?.cat6?.documents;
  if (!Array.isArray(cat6ManifestEntries) || cat6ManifestEntries.length !== 32) {
    console.error(`FATAL: fy2568-publication.json categories.cat6.documents must be 32 entries, got ${cat6ManifestEntries?.length}`);
    process.exit(1);
  }
  const manifestPathToEntry = new Map(cat6ManifestEntries.map((d) => [d.path, d]));

  // ---- Manifest ----
  let manifest;
  try {
    manifest = readJSON(MANIFEST_PATH);
  } catch (e) {
    console.error(`FATAL: manifest unreadable: ${e.message}`);
    process.exit(1);
  }
  for (const key of ['schemaVersion', 'updated', 'titleTh', 'titleEn', 'governance', 'year', 'status', 'freeze', 'note', 'contracts', 'missingIndicators', 'quarantined', 'contentDuplicateGroups', 'forwardRequirements', 'sourceLimitations', 'annualReport', 'validation']) {
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
    errors.push('manifest: missingIndicators must be EMPTY (all 6 Cat6 indicators resolve to dedicated evidence)');
  }
  const fwdCodes = new Set((manifest.forwardRequirements || []).map((f) => f.code));
  for (const code of ['FY2569_RECURRING_EVIDENCE_COLLECTION', 'FY2569_CONTRACT_CANDIDATE', 'OCR_DECISION_FOR_SCANS']) {
    if (!fwdCodes.has(code)) errors.push(`manifest: forwardRequirements must declare "${code}"`);
  }
  const limitationCodes = new Set((manifest.sourceLimitations || []).map((l) => l.code));
  for (const code of ['SCAN_ONLY_FILES', 'FY2569_CONTRACT_QUARANTINED', 'CAT613_PERCENT_NOT_EVIDENCED', 'EVAL_FORM_CONTENT_DUPLICATES', 'DOCX_TITLE_METADATA_QUIRK', 'NO_OCR_IN_THIS_PHASE']) {
    if (!limitationCodes.has(code)) errors.push(`manifest: sourceLimitations must declare "${code}"`);
  }

  // quarantined disclosure
  const quarantined = manifest.quarantined || [];
  const q = quarantined.find((x) => x.path === QUARANTINE_PATH);
  if (!q) {
    errors.push(`manifest: quarantined must disclose ${QUARANTINE_PATH}`);
  } else {
    if (q.status !== 'QUARANTINE') errors.push('manifest: quarantined entry status must be QUARANTINE');
    if (q.fy2569Candidate !== 'candidateFy2569Only') errors.push('manifest: quarantined entry fy2569Candidate must be candidateFy2569Only');
    if (!manifestPathToEntry.has(q.path)) errors.push('manifest: quarantined path must exist in fy2568-publication cat6 manifest');
  }

  // contentDuplicateCandidate groups
  const groups = manifest.contentDuplicateGroups || [];
  if (groups.length !== 2) errors.push('manifest: contentDuplicateGroups must list exactly 2 groups (P1, P2)');
  const recordReferenced = new Set();
  for (const rec of [].concat(
    ...ALLOWED_DOMAINS.map((d) => (readJSONSafe(resolve(CONTRACT_DIR, `${d}.json`)) || {}).records || []),
  )) {
    if (rec.sourceRef) recordReferenced.add(rec.sourceRef);
    for (const rs of rec.relatedSources || []) recordReferenced.add(rs);
  }
  for (const g of groups) {
    if (!['P1', 'P2'].includes(g.group)) errors.push(`contentDuplicateGroups: unknown group "${g.group}"`);
    if (!Array.isArray(g.paths) || g.paths.length !== 2) {
      errors.push(`contentDuplicateGroups.${g.group}: must have exactly 2 paths`);
      continue;
    }
    for (const p of g.paths) {
      if (!manifestPathToEntry.has(p)) errors.push(`contentDuplicateGroups.${g.group}: path not in cat6 manifest: ${p}`);
      if (!recordReferenced.has(p)) errors.push(`contentDuplicateGroups.${g.group}: path must remain a referenced sourceRef (no dedup): ${p}`);
    }
  }

  // annualReport integrity (canonical only — no separate PDF export for Cat6)
  const ar = manifest.annualReport || {};
  const arCanon = ar.canonical;
  if (!arCanon || !arCanon.path || !arCanon.sha256) {
    errors.push('annualReport: missing canonical entry');
  } else {
    if (arCanon.baselineDataYear !== 2568) errors.push(`annualReport: baselineDataYear must be 2568, got ${arCanon.baselineDataYear}`);
    if (arCanon.revisionDate !== '2569-03-17') errors.push(`annualReport: revisionDate must be 2569-03-17, got ${arCanon.revisionDate}`);
    const man = manifestPathToEntry.get(arCanon.path);
    if (!man) {
      errors.push('annualReport.canonical: path not in fy2568-publication cat6 manifest');
    } else if (man.sha256 !== arCanon.sha256) {
      errors.push('annualReport.canonical: sha256 does not match manifest');
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
      if (rec.categoryCode !== 'cat6') errors.push(`${at}: categoryCode must be "cat6"`);

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
          if (!(ev.categoryCodes || []).includes('cat6')) {
            errors.push(`${at}: evidenceId "${evId}" must include categoryCodes cat6`);
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

      // sourceRef integrity + quarantine exclusion
      if (!rec.sourceRef) {
        errors.push(`${at}: sourceRef missing`);
      } else {
        if (rec.sourceRef.startsWith('/') || /^[a-zA-Z]:/.test(rec.sourceRef)) {
          errors.push(`${at}: sourceRef must be relative to cat6 document root`);
        }
        if (rec.sourceRef.includes(QUARANTINE_FRAGMENT) || rec.sourceRef === QUARANTINE_PATH) {
          errors.push(`${at}: sourceRef is the quarantined FY2569-budget contract`);
        }
        const man = manifestPathToEntry.get(rec.sourceRef);
        if (!man) {
          errors.push(`${at}: sourceRef not in fy2568-publication cat6 manifest`);
        } else if (rec.manifestSha256 && man.sha256 !== rec.manifestSha256) {
          errors.push(`${at}: manifestSha256 does not match manifest for "${rec.sourceRef}"`);
        }
      }

      for (const rs of rec.relatedSources || []) {
        if (rs.includes(QUARANTINE_FRAGMENT) || rs === QUARANTINE_PATH) {
          errors.push(`${at}: relatedSources contains the quarantined FY2569-budget contract`);
        }
        if (!manifestPathToEntry.has(rs)) {
          errors.push(`${at}: relatedSources entry not in fy2568-publication cat6 manifest`);
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
        errors.push(`${domain}: no Cat6 indicator may be MISSING_DEDICATED_EVIDENCE (${g.indicator})`);
      }
    }
  }

  // ---- Locked disclosures ----
  const products = readJSONSafe(resolve(CONTRACT_DIR, 'products.json'));
  const reportRec = (products.records || []).find((r) => r.indicatorCodes.includes('6.1.2'));
  if (!reportRec || !reportRec.percentageBasis) {
    errors.push('products: 6.1.2 record must declare percentageBasis');
  } else {
    const pb = reportRec.percentageBasis;
    const declared = pb.declared || {};
    if (declared.volume !== DECLARED_VOLUME) errors.push(`products: 6.1.2 percentageBasis.declared.volume must be ${DECLARED_VOLUME} (source-declared), got "${declared.volume}"`);
    if (declared.value !== DECLARED_VALUE) errors.push(`products: 6.1.2 percentageBasis.declared.value must be ${DECLARED_VALUE} (source-declared), got "${declared.value}"`);
    if (!pb.unit || !/percent/i.test(pb.unit)) errors.push('products: 6.1.2 percentageBasis.unit must be "percent"');
    if (!pb.basis || !/not recomputed|source-declared/i.test(pb.basis)) errors.push('products: 6.1.2 percentageBasis.basis must declare the figures are source-declared and not recomputed');
  }
  const surveyRec = (products.records || []).find((r) => r.indicatorCodes.includes('6.1.3'));
  if (!surveyRec || surveyRec.percentNotEvidenced !== true) {
    errors.push('products: 6.1.3 record must declare percentNotEvidenced true (PERCENT_NOT_EVIDENCED)');
  }
  const productsHasQuarantineDisclosure = JSON.stringify(products).includes(QUARANTINE_FRAGMENT);
  if (productsHasQuarantineDisclosure) {
    errors.push('products: must NOT reference the quarantined FY2569-budget contract anywhere');
  }

  const contractors = readJSONSafe(resolve(CONTRACT_DIR, 'contractors.json'));
  const contractorsHasQuarantineDisclosure = JSON.stringify(contractors).includes(QUARANTINE_FRAGMENT);
  if (!contractorsHasQuarantineDisclosure) {
    errors.push('contractors: must disclose the quarantined FY2569-budget contract (งบ 69) in its gaps (as excluded)');
  }

  // ---- 6/6 coverage + evidence-side guard ----
  for (const code of CAT6_CODES) {
    if (!recordCountByIndicator[code]) {
      errors.push(`coverage: cat6 indicator "${code}" has no contract record`);
      continue;
    }
    const hasEvidence = evidence.some(
      (e) => (e.categoryCodes || []).includes('cat6') && e.traceabilityLevel === 'indicator' && (e.indicatorCodes || []).includes(code),
    );
    if (!hasEvidence) errors.push(`evidence-index: cat6 indicator "${code}" must have an indicator-level evidence entry`);
  }
  for (const ev of evidence) {
    if ((ev.categoryCodes || []).includes('cat6') && ev.traceabilityLevel === 'indicator') {
      for (const code of ev.indicatorCodes || []) {
        if (!CAT6_CODES.includes(code)) {
          errors.push(`evidence-index: cat6 indicator-level entry "${ev.id}" uses non-cat6 indicator "${code}"`);
        }
      }
    }
  }

  // ---- Report ----
  console.log('=== CATEGORY 6 DATA CONTRACTS VALIDATION ===');
  console.log(`Domains checked : ${ALLOWED_DOMAINS.length} (${ALLOWED_DOMAINS.join(', ')})`);
  console.log('Record counts   : ' + Object.entries(recordCountByIndicator)
    .map(([code, n]) => `${code}=${n}`).join(' · '));
  console.log('Indicator coverage: ' + CAT6_CODES.filter((c) => recordCountByIndicator[c]).length + '/6 in contracts');
  if (errors.length > 0) {
    console.log(`--- ${errors.length} ERROR(S) ---`);
    errors.forEach((e) => console.log(`  •  ${e}`));
    console.log('\nRESULT: FAIL (exit code 1)');
    process.exit(1);
  }
  console.log('RESULT: PASS — (exit code 0)');
}

function readJSONSafe(p) {
  try {
    return readJSON(p);
  } catch {
    return {};
  }
}

main();
