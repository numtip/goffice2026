#!/usr/bin/env node

/**
 * validate-category3-contracts.mjs
 * =================================
 * Quality gate for the static Category 3 canonical data contracts
 * (src/data/category3/*.json), introduced by GOFFICE2026 Phase C (C2).
 *
 * Checks:
 *   1. manifest + all 5 contract files parse and have required top-level keys
 *   2. every contract is year 2568 (frozen FY2568 historical baseline; no FY2569 leakage)
 *   3. per-record reference integrity: indicator/issue/category codes exist in the
 *      canonical taxonomy and match the indicator→issue→category hierarchy;
 *      record indicatorCodes are a subset of the domain's declared indicators
 *   4. verification.status in allowed set; availability in allowed set
 *   5. evidenceIds must non-empty and reference existing evidence-index entries whose
 *      categoryCodes/indicatorCodes/manifestPath/manifestSha256/availability/status
 *      exactly match the contract record (C3 gate; no invented evidence). The targets
 *      contract references category-level evidence by design (cross-indicator clauses).
 *   6. sourceRef is relative, exists in fy2568-publication.json cat3 manifest, and
 *      manifestSha256 matches the manifest entry (no local paths, no fictional files)
 *   7. Cat3 guardrail invariants:
 *      - missingIndicators is EMPTY (all 15 indicators have dedicated evidence)
 *      - no 2.2.3-style MISSING indicator anywhere
 *      - 3.2.2 stays MEDIUM: per-unit electricity values unavailable (image-only tables)
 *      - scan records (measurePhotoScan / measureScan) stay promoted:false,
 *        availability filename_folder_only, verification pending
 *      - source limitations (2 scans, garbled measures PDF, misbounded #19,
 *        incomplete #21, partial #32, no signed copy) are declared in the manifest
 *      - near-duplicates (G1/G2/G3) and DOCX→PDF exports excluded from records
 *   8. annualReport integrity: canonical/export sha256 match manifest entries
 *
 * Usage: node scripts/validate-category3-contracts.mjs
 * Exit code: 0 on pass, 1 on failure.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const CONTRACT_DIR = resolve(ROOT, 'src', 'data', 'category3');
const MANIFEST_PATH = resolve(CONTRACT_DIR, 'category3-manifest.json');
const ALLOWED_DOMAINS = ['targets', 'measures', 'data', 'compliance', 'meetings'];
const DOMAIN_INDICATORS = {
  targets: [],
  measures: ['3.1.1', '3.2.1', '3.2.4', '3.3.1', '3.3.4'],
  data: ['3.1.2', '3.2.2', '3.2.5', '3.3.2'],
  compliance: ['3.1.3', '3.2.3', '3.3.3', '3.3.5'],
  meetings: ['3.4.1', '3.4.2'],
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

// Exclusion invariants from GO-CAT3-PHASE-A-SOURCE-DISPOSITION §2/§5:
// G1/G2/G3 near-duplicate re-exports (canonical = folder-level #5/#6/#7) and the
// DOCX→PDF exports of the category reports must never appear as record sourceRefs.
const EXCLUDED_SOURCE_REFS = [
  '3.1 การใช้น้ำ/3.1.1 มาตรการหรือแนวทางใช้น้ำ/3.1.1 มาตรการหรือแนวทางใช้น้ำ.pdf', // G3 near-duplicate
  '3.1 การใช้น้ำ/3.1.2 มีการจัดทำข้อมูลการใช้น้ำต่อหน่วย/3.1.2 มีการจัดทำข้อมูลการใช้น้ำต่อหน่วย.pdf', // G2 near-duplicate
  '3.1 การใช้น้ำ/3.1.3 การปฏิบัติตามมาตรการประหยัดน้ำในพื้นที่ทำงาน (ประเมินจากพฤติกรรมของบุคลากรในพื้นที่)/3.1.3.pdf', // G1 duplicate
  '3.1 การใช้น้ำ/การใช้น้ำ.pdf', // PDF export of the 3.1 report
  '3.2 การใช้พลังงาน/การใช้พลังงาน.pdf', // PDF export of the 3.2 report
  '3.3 การทรัพยากรอื่นๆ/การใช้ทรัพยากรอื่นๆ.pdf', // PDF export of the 3.3 report
  '3.4 การประชุมและการจัดนิทรรศการ/การประชุมและการจัดนิทรรศการ.pdf', // PDF export of the 3.4 report
  'การประเมินสานักงานสีเขียว (Green Office) หมวด 3.pdf', // PDF export of the GO หมวด 3 master
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

  const cat3ManifestEntries = publication.categories?.cat3?.documents;
  if (!Array.isArray(cat3ManifestEntries) || cat3ManifestEntries.length !== 32) {
    console.error(`FATAL: fy2568-publication.json categories.cat3.documents must be 32 entries, got ${cat3ManifestEntries?.length}`);
    process.exit(1);
  }
  const manifestPathToEntry = new Map(cat3ManifestEntries.map((d) => [d.path, d]));

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

  // ── All 15 indicators covered — no MISSING indicator ────────
  if (!Array.isArray(manifest.missingIndicators) || manifest.missingIndicators.length !== 0) {
    errors.push('manifest: missingIndicators must be EMPTY (all 15 Cat3 indicators have dedicated evidence)');
  }
  if (!Array.isArray(manifest.forwardRequirements) || manifest.forwardRequirements.length !== 0) {
    errors.push('manifest: forwardRequirements must be EMPTY (no FY2569 facts)');
  }

  // ── Source limitations declared (honesty gate) ───────────────
  const limitationCodes = new Set((manifest.sourceLimitations || []).map((l) => l.code));
  for (const code of ['SCAN_AC_CONDENSATE', 'SCAN_VEHICLE_LOG', 'GARBLED_MEASURES_PDF', 'IMAGE_ONLY_PER_UNIT', 'MISBOUNDED_19', 'INCOMPLETE_21', 'PARTIAL_32', 'NO_SIGNED_COPY']) {
    if (!limitationCodes.has(code)) errors.push(`manifest: sourceLimitations must declare "${code}"`);
  }

  // ── annualReport integrity ──────────────────────────────────
  const ar = manifest.annualReport || {};
  for (const role of ['canonical', 'export']) {
    const entry = ar[role];
    if (!entry || !entry.path || !entry.sha256) {
      errors.push(`annualReport: missing ${role} entry`);
      continue;
    }
    const man = manifestPathToEntry.get(entry.path);
    if (!man) {
      errors.push(`annualReport.${role}: path "${entry.path}" not in fy2568-publication cat3 manifest`);
    } else if (man.sha256 !== entry.sha256) {
      errors.push(`annualReport.${role}: sha256 ${entry.sha256} does not match manifest ${man.sha256}`);
    }
  }
  if (!JSON.stringify(ar).includes('no signed') && !JSON.stringify(ar).includes('No signed')) {
    errors.push('annualReport: must disclaim a signed/approved submission copy');
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
      // Cross-indicator targets contract: issueCodes/categoryCode still required
      if (!Array.isArray(rec.issueCodes)) errors.push(`${at}: issueCodes must be an array`);
      if (rec.categoryCode !== 'cat3') errors.push(`${at}: categoryCode must be "cat3"`);

      // evidenceIds: C3 gate — must reference existing Cat3 evidence entries
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
          if (!(ev.categoryCodes || []).includes('cat3')) {
            errors.push(`${at}: evidenceId "${evId}" must include categoryCodes cat3`);
          }
          if (domain === 'targets') {
            // Cross-indicator target clauses reference the category-level targets
            // evidence entry by design (spans all 15 indicators).
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
        if (rec.sourceRef.startsWith('/') || /^[a-zA-Z]:/.test(rec.sourceRef)) {
          errors.push(`${at}: sourceRef must be relative to cat3 document root`);
        }
        if (EXCLUDED_SOURCE_REFS.includes(rec.sourceRef)) {
          errors.push(`${at}: sourceRef "${rec.sourceRef}" is excluded from cat3 mapping (near-duplicate/export)`);
        }
        const man = manifestPathToEntry.get(rec.sourceRef);
        if (!man) {
          errors.push(`${at}: sourceRef "${rec.sourceRef}" not in fy2568-publication cat3 manifest`);
        } else if (rec.manifestSha256 && man.sha256 !== rec.manifestSha256) {
          errors.push(`${at}: manifestSha256 does not match manifest for "${rec.sourceRef}"`);
        }
      }

      // relatedSources must also be valid manifest paths (if present)
      for (const rs of rec.relatedSources || []) {
        if (!manifestPathToEntry.has(rs)) {
          errors.push(`${at}: relatedSources "${rs}" not in fy2568-publication cat3 manifest`);
        }
      }

      for (const code of rec.indicatorCodes || []) {
        recordCountByIndicator[code] = (recordCountByIndicator[code] || 0) + 1;
      }
    }

    // Gaps: only PARTIAL allowed (never MISSING_DEDICATED_EVIDENCE)
    for (const g of contract.gaps || []) {
      if (g.status === 'MISSING_DEDICATED_EVIDENCE') {
        errors.push(`${domain}: no Cat3 indicator may be MISSING_DEDICATED_EVIDENCE (${g.indicator})`);
      }
    }

    // ── 3.2.2 MEDIUM invariant (data) ─────────────────────────
    if (domain === 'data') {
      const elec = (contract.records || []).find((r) => (r.indicatorCodes || []).includes('3.2.2'));
      if (!elec) {
        errors.push('data: must contain a 3.2.2 record');
      } else {
        if (elec.evidenceStrength !== 'MEDIUM') errors.push('data/3.2.2: evidenceStrength must be MEDIUM (image-only per-unit tables)');
        if (elec.perUnit !== null) errors.push('data/3.2.2: perUnit must be null (value unavailable, not invented)');
        if (elec.perUnitChangePercentVs2024 !== null) errors.push('data/3.2.2: perUnitChangePercentVs2024 must be null (unavailable)');
      }
      // 3.2.5 fuel total from C1 must be the report value 695.82 L
      const fuel = (contract.records || []).find((r) => (r.indicatorCodes || []).includes('3.2.5'));
      if (fuel && fuel.total !== 695.82) errors.push(`data/3.2.5: total must be the C1 report value 695.82, got ${fuel.total}`);
    }

    // ── Scan invariant (measures) ──────────────────────────────
    if (domain === 'measures') {
      for (const rec of (contract.records || []).filter((r) => r.kind === 'measurePhotoScan' || r.kind === 'measureScan')) {
        if (rec.promoted !== false) errors.push(`${domain}/${rec.id}: scan record must have promoted:false`);
        if (rec.verification?.status !== 'pending') errors.push(`${domain}/${rec.id}: scan record must be verification pending`);
        if (rec.availability !== 'filename_folder_only') errors.push(`${domain}/${rec.id}: scan record must be availability filename_folder_only`);
      }
      // Near-duplicate/excluded sources must not be mapped as record sourceRefs
      for (const rec of contract.records || []) {
        if (EXCLUDED_SOURCE_REFS.includes(rec.sourceRef)) {
          errors.push(`measures/${rec.id}: near-duplicate/export source "${rec.sourceRef}" must not be a record source`);
        }
      }
    }
  }

  // ── C3 global evidence invariants ─────────────────────────────
  // 1. Every indicator-level cat3 evidence entry must be referenced by a contract record
  const referencedCat3Evidence = new Set();
  for (const domain of ALLOWED_DOMAINS) {
    let contract;
    try {
      contract = readJSON(resolve(CONTRACT_DIR, `${domain}.json`));
    } catch {
      continue;
    }
    for (const rec of contract.records || []) {
      for (const evId of rec.evidenceIds || []) referencedCat3Evidence.add(evId);
    }
  }
  for (const ev of evidence) {
    if (!(ev.categoryCodes || []).includes('cat3')) continue;
    if (ev.traceabilityLevel !== 'indicator') continue;
    if (!referencedCat3Evidence.has(ev.id)) {
      errors.push(`evidence-index: cat3 indicator-level entry "${ev.id}" is not referenced by any C3 contract record`);
    }
  }
  // 2. All 15 canonical cat3 indicators must have at least one indicator-level evidence entry
  const cat3Codes = criteria.filter((i) => i.categoryCode === 'cat3').map((i) => i.code);
  for (const code of cat3Codes) {
    const hasEvidence = evidence.some(
      (e) => (e.categoryCodes || []).includes('cat3') && e.traceabilityLevel === 'indicator' && (e.indicatorCodes || []).includes(code),
    );
    if (!hasEvidence) errors.push(`evidence-index: cat3 indicator "${code}" must have an indicator-level evidence entry`);
  }
  // 3. No evidence entry may claim a code that isn't a canonical cat3 code with a cat3 entry
  for (const ev of evidence) {
    if ((ev.categoryCodes || []).includes('cat3') && ev.traceabilityLevel === 'indicator') {
      for (const code of ev.indicatorCodes || []) {
        if (!cat3Codes.includes(code)) {
          errors.push(`evidence-index: cat3 indicator-level entry "${ev.id}" uses non-cat3 indicator "${code}"`);
        }
      }
    }
  }

  // ── Report ───────────────────────────────────────────────────
  console.log('=== CATEGORY 3 DATA CONTRACTS VALIDATION ===');
  console.log(`Domains checked : ${ALLOWED_DOMAINS.length} (${ALLOWED_DOMAINS.join(', ')})`);
  console.log('Record counts   : ' + Object.entries(recordCountByIndicator)
    .map(([code, n]) => `${code}=${n}`).join(' · '));
  console.log('Indicator coverage: ' + cat3Codes.filter((c) => recordCountByIndicator[c]).length + '/15 in contracts');
  if (errors.length > 0) {
    console.log(`--- ${errors.length} ERROR(S) ---`);
    errors.forEach((e) => console.log(`  ✗  ${e}`));
    console.log('\nRESULT: FAIL (exit code 1)');
    process.exit(1);
  }
  console.log('RESULT: PASS ✓ (exit code 0)');
}

main();
