#!/usr/bin/env node

/**
 * validate-category2-contracts.mjs
 * =================================
 * Quality gate for the static Category 2 canonical data contracts
 * (src/data/category2/*.json), introduced by GOFFICE2026 Phase C (C2).
 *
 * Checks:
 *   1. manifest + all 3 contract files parse and have required top-level keys
 *   2. every contract is year 2568 (frozen FY2568 historical baseline; no FY2569 leakage)
 *   3. per-record reference integrity: indicator/issue/category codes exist in the
 *      canonical taxonomy and match the indicator→issue→category hierarchy;
 *      record indicatorCodes are a subset of the domain's declared indicators
 *   4. verification.status in allowed set; availability in allowed set
 *   5. evidenceIds must non-empty and reference existing evidence-index entries whose
 *      categoryCodes/indicatorCodes/manifestPath/manifestSha256/availability/status
 *      exactly match the contract record (C3 gate; no invented evidence)
 *   6. sourceRef is relative, exists in fy2568-publication.json cat2 manifest, and
 *      manifestSha256 matches the manifest entry (no local paths, no fictional files)
 *   7. Cat2 guardrail invariants:
 *      - 2.2.3 appears ONLY as MISSING_DEDICATED_EVIDENCE in manifest/gaps (never a record,
 *        never an evidence-index entry)
 *      - 2.2.2 stays THIN: single promoted narrative; scan candidates pending, NOT promoted
 *      - 2.1.2 FY2569 minutes requirement is a labelled forward requirement, not a claim
 *      - D1 duplicate root คณะกรรมการGreen2025.pdf excluded from records
 *      - misplaced 1.3(4) form and blank form templates excluded from records
 *   8. annualReport integrity: canonical/export/superseded sha256 match manifest entries
 *
 * Usage: node scripts/validate-category2-contracts.mjs
 * Exit code: 0 on pass, 1 on failure.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const CONTRACT_DIR = resolve(ROOT, 'src', 'data', 'category2');
const MANIFEST_PATH = resolve(CONTRACT_DIR, 'category2-manifest.json');
const ALLOWED_DOMAINS = new Set(['training', 'communication', 'feedback']);
const DOMAIN_INDICATORS = {
  training: ['2.1.1', '2.1.2'],
  communication: ['2.2.1', '2.2.2'],
  feedback: ['2.2.4'],
};
const VALID_VERIFICATION = new Set(['verified', 'reviewed', 'pending', 'unavailable']);
const VALID_AVAILABILITY = new Set([
  'content-verified',
  'metadata-verified',
  'filename_folder_only',
  'structural-only',
  'source-available',
]);
const MISSING_INDICATOR = '2.2.3';
const MISSING_STATUS = 'MISSING_DEDICATED_EVIDENCE';
const FORWARD_INDICATOR = '2.1.2';
const LOCAL_PATH_PATTERNS = [/F:\\/i, /G:\\/i, /projectAi/i, /OneDrive - Maejo/i];

// Exclusion invariants from GO-CAT2-PHASE-A-SOURCE-DISPOSITION
const EXCLUDED_SOURCE_REFS = [
  'คณะกรรมการGreen2025.pdf', // D1 duplicate (byte-identical to 2.2.1 (4))
  '2.2/2.2.2/1.3(4) ทะเบียนจัดลำดับปัญหาสิ่งแวดล้อมด้านทร.pdf', // misplaced Cat1 form
  'หมวด 2 ข้อ 2.1(1-3) การฝึกอบรม.xlsx', // blank form template
  '2.2/2.2.4/ef-ep.xlsx', // blank form template
  'หมวด 2 ข้อ 2.2(2) ใบรับข้อเสนอแนะด้านสิ่งแวดล้อม.xls', // blank form template
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

  const cat2ManifestEntries = publication.categories?.cat2?.documents;
  if (!Array.isArray(cat2ManifestEntries) || cat2ManifestEntries.length !== 29) {
    console.error(`FATAL: fy2568-publication.json categories.cat2.documents must be 29 entries, got ${cat2ManifestEntries?.length}`);
    process.exit(1);
  }
  const manifestPathToEntry = new Map(cat2ManifestEntries.map((d) => [d.path, d]));

  // ── Manifest ─────────────────────────────────────────────────
  let manifest;
  try {
    manifest = readJSON(MANIFEST_PATH);
  } catch (e) {
    console.error(`FATAL: manifest unreadable: ${e.message}`);
    process.exit(1);
  }
  for (const key of ['schemaVersion', 'updated', 'titleTh', 'titleEn', 'governance', 'year', 'status', 'freeze', 'note', 'contracts', 'missingIndicators', 'forwardRequirements', 'annualReport', 'validation']) {
    if (!(key in manifest)) errors.push(`manifest: missing top-level key "${key}"`);
  }
  if (manifest.schemaVersion !== '1.0.0') errors.push('manifest: schemaVersion must be 1.0.0');
  if (manifest.year !== 2568) errors.push(`manifest: year must be 2568, got ${manifest.year}`);
  if (!Array.isArray(manifest.contracts) || manifest.contracts.length !== ALLOWED_DOMAINS.size) {
    errors.push(`manifest: contracts must list exactly ${ALLOWED_DOMAINS.size} domains`);
  }
  const manifestDomains = new Set((manifest.contracts || []).map((c) => c.domain));
  for (const domain of ALLOWED_DOMAINS) {
    if (!manifestDomains.has(domain)) errors.push(`manifest: missing domain "${domain}"`);
  }

  // ── 2.2.3 gap invariant in manifest ─────────────────────────
  const mi223 = (manifest.missingIndicators || []).find((g) => g.indicator === MISSING_INDICATOR);
  if (!mi223 || mi223.status !== MISSING_STATUS) {
    errors.push(`manifest: missingIndicators must declare ${MISSING_INDICATOR} as ${MISSING_STATUS}`);
  }
  // ── 2.1.2 forward requirement in manifest ───────────────────
  const fr212 = (manifest.forwardRequirements || []).find((g) => g.indicator === FORWARD_INDICATOR);
  if (!fr212 || fr212.year !== 2569 || fr212.status !== 'FORWARD_REQUIREMENT') {
    errors.push('manifest: forwardRequirements must declare 2.1.2 as year 2569 FORWARD_REQUIREMENT');
  }

  // ── annualReport integrity ──────────────────────────────────
  const ar = manifest.annualReport || {};
  for (const role of ['canonical', 'export', 'superseded']) {
    const entry = ar[role];
    if (!entry || !entry.path || !entry.sha256) {
      errors.push(`annualReport: missing ${role} entry`);
      continue;
    }
    const man = manifestPathToEntry.get(entry.path);
    if (!man) {
      errors.push(`annualReport.${role}: path "${entry.path}" not in fy2568-publication cat2 manifest`);
    } else if (man.sha256 !== entry.sha256) {
      errors.push(`annualReport.${role}: sha256 ${entry.sha256} does not match manifest ${man.sha256}`);
    }
  }

  // ── Per-contract validation ──────────────────────────────────
  const recordCountByIndicator = {};
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

    // Local-path scan over the raw text
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

      if (!Array.isArray(rec.indicatorCodes) || rec.indicatorCodes.length === 0) {
        errors.push(`${at}: indicatorCodes must be non-empty`);
      } else {
        for (const code of rec.indicatorCodes) {
          if (!indicatorToIssue.has(code)) errors.push(`${at}: unknown indicator "${code}"`);
          if (code === MISSING_INDICATOR) errors.push(`${at}: ${MISSING_INDICATOR} must never appear as a record`);
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
      if (rec.categoryCode !== 'cat2') errors.push(`${at}: categoryCode must be "cat2"`);

      // evidenceIds: C3 gate — must reference exactly existing Cat2 evidence entries
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
          if (!(ev.categoryCodes || []).includes('cat2')) {
            errors.push(`${at}: evidenceId "${evId}" must include categoryCodes cat2`);
          }
          if (ev.traceabilityLevel !== 'indicator') {
            errors.push(`${at}: evidenceId "${evId}" must be traceabilityLevel indicator`);
          }
          const recCodes = [...(rec.indicatorCodes || [])].sort();
          const evCodes = [...(ev.indicatorCodes || [])].sort();
          if (JSON.stringify(recCodes) !== JSON.stringify(evCodes)) {
            errors.push(`${at}: evidenceId "${evId}" indicatorCodes must equal record ${JSON.stringify(recCodes)}, got ${JSON.stringify(evCodes)}`);
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
          if (rec.kind === 'campaignCandidate' && ev.promoted !== false) {
            errors.push(`${at}: evidenceId "${evId}" must have promoted:false for campaignCandidate`);
          }
        }
      }

      // verification / availability truth
      const v = rec.verification || {};
      if (!VALID_VERIFICATION.has(v.status)) {
        errors.push(`${at}: invalid verification.status "${v.status}"`);
      }
      if (!rec.availability || !VALID_AVAILABILITY.has(rec.availability)) {
        errors.push(`${at}: invalid availability "${rec.availability}"`);
      }

      // sourceRef integrity against the FY2568 publication manifest
      if (!rec.sourceRef) {
        errors.push(`${at}: sourceRef missing`);
      } else {
        if (/[\\/]/.test(rec.sourceRef.split('/').slice(0, 1).join('/'))) { /* noop — relative check below */ }
        if (rec.sourceRef.startsWith('/') || /^[a-zA-Z]:/.test(rec.sourceRef)) {
          errors.push(`${at}: sourceRef must be relative to cat2 document root`);
        }
        if (EXCLUDED_SOURCE_REFS.includes(rec.sourceRef)) {
          errors.push(`${at}: sourceRef "${rec.sourceRef}" is excluded from cat2 mapping (duplicate/misplaced/blank form)`);
        }
        const man = manifestPathToEntry.get(rec.sourceRef);
        if (!man) {
          errors.push(`${at}: sourceRef "${rec.sourceRef}" not in fy2568-publication cat2 manifest`);
        } else if (rec.manifestSha256 && man.sha256 !== rec.manifestSha256) {
          errors.push(`${at}: manifestSha256 does not match manifest for "${rec.sourceRef}"`);
        }
      }

      // relatedSources must also be valid manifest paths (if present)
      for (const rs of rec.relatedSources || []) {
        if (!manifestPathToEntry.has(rs)) {
          errors.push(`${at}: relatedSources "${rs}" not in fy2568-publication cat2 manifest`);
        }
      }

      for (const code of rec.indicatorCodes || []) {
        recordCountByIndicator[code] = (recordCountByIndicator[code] || 0) + 1;
      }
    }

    // Gaps: 2.2.3 declared as MISSING_DEDICATED_EVIDENCE in every contract
    const gap223 = (contract.gaps || []).find((g) => g.indicator === MISSING_INDICATOR);
    if (!gap223 || gap223.status !== MISSING_STATUS) {
      errors.push(`${domain}: gaps must declare ${MISSING_INDICATOR} as ${MISSING_STATUS}`);
    }
    for (const g of contract.gaps || []) {
      if (g.indicator === MISSING_INDICATOR && g.status !== MISSING_STATUS) {
        errors.push(`${domain}: 2.2.3 gap must use status ${MISSING_STATUS}, got "${g.status}"`);
      }
    }

    // forwardRequirements in training contract (2.1.2)
    if (domain === 'training') {
      const fr = (contract.forwardRequirements || []).find((g) => g.indicator === FORWARD_INDICATOR);
      if (!fr || fr.year !== 2569 || fr.status !== 'FORWARD_REQUIREMENT') {
        errors.push('training: forwardRequirements must declare 2.1.2 as year 2569 FORWARD_REQUIREMENT');
      }
      for (const f of contract.forwardRequirements || []) {
        if (f.year !== 2569) errors.push(`training: forwardRequirement ${f.indicator} must be year 2569`);
      }
    }

    // ── 2.2.2 THIN invariant (communication) ───────────────────
    if (domain === 'communication') {
      const records222 = (contract.records || []).filter((r) => (r.indicatorCodes || []).includes('2.2.2'));
      const narrative = records222.filter((r) => r.kind === 'campaignNarrative');
      const candidates = records222.filter((r) => r.kind === 'campaignCandidate');
      if (narrative.length !== 1) {
        errors.push(`communication: 2.2.2 must have exactly 1 campaignNarrative record, got ${narrative.length}`);
      } else if (narrative[0].availability !== 'content-verified' || narrative[0].evidenceStrength !== 'THIN') {
        errors.push('communication: 2.2.2 narrative must be availability content-verified and evidenceStrength THIN');
      }
      if (records222.length !== 1 + candidates.length) {
        errors.push('communication: only campaignNarrative + campaignCandidate kinds allowed for 2.2.2');
      }
      for (const c of candidates) {
        if (c.promoted !== false) errors.push(`communication: ${c.id} campaignCandidate must have promoted:false`);
        if (c.verification?.status !== 'pending') errors.push(`communication: ${c.id} campaignCandidate must be verification pending`);
        if (c.availability !== 'filename_folder_only') errors.push(`communication: ${c.id} campaignCandidate must be availability filename_folder_only`);
      }
    }
  }

  // ── C3 global evidence invariants ─────────────────────────────
  // 1. No evidence entry may claim 2.2.3
  for (const ev of evidence) {
    if ((ev.indicatorCodes || []).includes('2.2.3')) {
      errors.push(`evidence-index: ${ev.id} must not reference MISSING indicator 2.2.3`);
    }
  }
  // 2. Every FY2568 indicator-level cat2 evidence entry must be referenced by exactly one frozen contract record
  //    (FY2569 overlay entries are validated by validate-category2-fy2569.mjs)
  const referencedCat2Evidence = new Set();
  for (const domain of ALLOWED_DOMAINS) {
    let contract;
    try {
      contract = readJSON(resolve(CONTRACT_DIR, `${domain}.json`));
    } catch {
      continue;
    }
    for (const rec of contract.records || []) {
      for (const evId of rec.evidenceIds || []) referencedCat2Evidence.add(evId);
    }
  }
  for (const ev of evidence) {
    if (!(ev.categoryCodes || []).includes('cat2')) continue;
    if (ev.traceabilityLevel !== 'indicator') continue;
    if (ev.year === 2569) continue;
    if (!referencedCat2Evidence.has(ev.id)) {
      errors.push(`evidence-index: cat2 indicator-level entry "${ev.id}" is not referenced by any C2 contract record`);
    }
  }

  // ── Report ───────────────────────────────────────────────────
  console.log('=== CATEGORY 2 DATA CONTRACTS VALIDATION ===');
  console.log(`Domains checked : ${[...ALLOWED_DOMAINS].length}`);
  console.log('Record counts   : ' + Object.entries(recordCountByIndicator)
    .map(([code, n]) => `${code}=${n}`).join(' · '));
  console.log(`Gap invariant   : ${MISSING_INDICATOR} = ${MISSING_STATUS} (manifest + all gaps)`);
  if (errors.length > 0) {
    console.log(`--- ${errors.length} ERROR(S) ---`);
    errors.forEach((e) => console.log(`  ✗  ${e}`));
    console.log('\nRESULT: FAIL (exit code 1)');
    process.exit(1);
  }
  console.log('RESULT: PASS ✓ (exit code 0)');
}

main();
