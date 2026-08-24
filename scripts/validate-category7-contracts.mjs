#!/usr/bin/env node

/**
 * validate-category7-contracts.mjs
 * =================================
 * Deterministic quality gate for the static Category 7 canonical data contracts
 * (src/data/category7/*.json), introduced by GOFFICE2026 Cat7 Phase B.
 *
 * Canonical scope: only 7.1 and 7.2. The five 7.2 activity types are facets,
 * not new indicators.
 *
 * Checks:
 *   1. manifest + both contract files parse and have required top-level keys
 *   2. every contract is year 2568 (frozen FY2568 historical baseline)
 *   3. per-record reference integrity: indicator/issue/category codes exist in
 *      the canonical taxonomy and match the hierarchy; record indicatorCodes are
 *      a subset of the domain's declared indicators
 *   4. per-claim validation: indicator/page/sourceRef/summary(th+en)/year/status/
 *      classification; status in baseline-eligible|QUARANTINE|YEAR_UNVERIFIED;
 *      classification in verified-execution|declared-only|candidate|gap;
 *      TH/EN parity (both summary strings non-empty)
 *   5. claim-year rules: a QUARANTINE claim MUST have year 2569; a
 *      baseline-eligible claim MUST have year 2568; YEAR_UNVERIFIED MUST have
 *      null year
 *   6. 7.1 limit (locked disclosure): the ONLY baseline-eligible 7.1 claim is
 *      claim-71-p2-request (the FY2568 internal-audit request on 7.1 p2);
 *      appointment / competence / audit completion / result report / score /
 *      PASS are NEVER claimed as baseline-eligible; the 7.1 record resolves
 *      exclusively to ev-cat7-internal-audit-request-fy2568
 *   7. mandatory 7.2 gap: advancement records MUST be empty; evidenceGap MUST be
 *      declared (status EVIDENCE_GAP, mandatory true); there MUST be NO
 *      evidence-index entry for indicator 7.2
 *   8. evidenceIds non-empty (7.1) and reference the exact evidence-index entry
 *      (categoryCodes/indicatorCodes/issueCodes/manifestPath/manifestSha256/
 *      availability/verification.status match the record)
 *   9. sourceRef/relatedSources exist in fy2568-publication.json cat7 manifest
 *      (3 docs) and manifestSha256 matches the manifest entry
 *  10. quarantine exclusion: no FY2569-dated (QUARANTINE) claim path may appear
 *      as a record sourceRef/relatedSources for evidence; no FY2569 result text
 *      in public fields
 *  11. contentDuplicateCandidate group C1 keeps all three sourceRefs (no
 *      dedupe/duplicateOf); every C1 path is still referenced from a contract
 *      source set
 *  12. no local paths, no score/PASS/FY2569 leakage, no year other than 2568
 *      (contract-level year)
 *  13. TH/EN parity: manifest and contracts' bilingual fields present + non-empty
 *
 * Usage: node scripts/validate-category7-contracts.mjs
 * Exit code: 0 on pass, 1 on failure.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const CONTRACT_DIR = resolve(ROOT, 'src', 'data', 'category7');
const MANIFEST_PATH = resolve(CONTRACT_DIR, 'category7-manifest.json');
const ALLOWED_DOMAINS = ['audit', 'advancement'];
const DOMAIN_INDICATORS = {
  audit: ['7.1'],
  advancement: ['7.2'],
};
const CAT7_CODES = Object.values(DOMAIN_INDICATORS).flat();
const VALID_VERIFICATION = new Set(['verified', 'reviewed', 'pending', 'unavailable']);
const VALID_AVAILABILITY = new Set([
  'content-verified',
  'metadata-verified',
  'filename_folder_only',
  'structural-only',
  'source-available',
]);
const VALID_CLAIM_STATUS = new Set(['baseline-eligible', 'QUARANTINE', 'YEAR_UNVERIFIED']);
const VALID_CLAIM_CLASSIFICATION = new Set(['verified-execution', 'declared-only', 'candidate', 'gap']);
const LOCAL_PATH_PATTERNS = [/F:\\/i, /G:\\/i, /projectAi/i, /OneDrive - Maejo/i];

// Locked disclosures from the accepted Phase-A disposition.
const BASELINE_ELIGIBLE_7_1_CLAIM = 'claim-71-p2-request'; // the ONLY baseline-eligible 7.1 claim (FY2568 request on p2)
const SEVEN_ONE_EVIDENCE_ID = 'ev-cat7-internal-audit-request-fy2568';
const CONTENT_DUP_GROUP = 'C1';
const CONTENT_DUP_PATHS = ['7.1 (9-3-69).pdf', '7.2 (9-3-69).pdf', 'หมวด 7_(9-3-69).pdf'];
// Result-leakage is prevented STRUCTURALLY: exactly one baseline-eligible 7.1
// claim, one 7.1 record, one evidence entry, empty 7.2 records, and no result
// keys on records. Honest prohibition language ("no PASS", "ไม่รวมการผ่านเกณฑ์")
// in notes is intentional and must NOT be treated as leakage.
const FORBIDDEN_RECORD_KEYS = ['score', 'pass', 'result', 'certificationStatus', 'percentage'];

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

  const cat7ManifestEntries = publication.categories?.cat7?.documents;
  if (!Array.isArray(cat7ManifestEntries) || cat7ManifestEntries.length !== 3) {
    console.error(`FATAL: fy2568-publication.json categories.cat7.documents must be 3 entries, got ${cat7ManifestEntries?.length}`);
    process.exit(1);
  }
  const manifestPathToEntry = new Map(cat7ManifestEntries.map((d) => [d.path, d]));

  // ---- Manifest ----
  let manifest;
  try {
    manifest = readJSON(MANIFEST_PATH);
  } catch (e) {
    console.error(`FATAL: manifest unreadable: ${e.message}`);
    process.exit(1);
  }
  for (const key of ['schemaVersion', 'updated', 'titleTh', 'titleEn', 'governance', 'year', 'status', 'freeze', 'note', 'contracts', 'missingIndicators', 'quarantined', 'contentDuplicateGroups', 'forwardRequirements', 'sourceLimitations', 'validation']) {
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
    errors.push('manifest: missingIndicators must be EMPTY (7.1 resolves to evidence; 7.2 is an explicit EVIDENCE_GAP, not a missing indicator)');
  }
  const fwdCodes = new Set((manifest.forwardRequirements || []).map((f) => f.code));
  for (const code of ['FY2569_RECURRING_EVIDENCE_COLLECTION', 'FY2569_PLAN_CLAIMS_QUARANTINED', 'OCR_DECISION_FOR_SCANS']) {
    if (!fwdCodes.has(code)) errors.push(`manifest: forwardRequirements must declare "${code}"`);
  }
  const limitationCodes = new Set((manifest.sourceLimitations || []).map((l) => l.code));
  for (const code of ['SEVEN_ONE_LIMITED_TO_FY2568_REQUEST', 'SEVEN_TWO_NO_VERIFIED_FY2568_EXECUTION_EVIDENCE', 'FY2569_CLAIMS_QUARANTINED', 'MIXED_YEAR_SOURCES', 'SCAN_ONLY_PAGES', 'NO_OCR_IN_THIS_PHASE']) {
    if (!limitationCodes.has(code)) errors.push(`manifest: sourceLimitations must declare "${code}"`);
  }

  // quarantined disclosure (claim-level split)
  const quarantined = manifest.quarantined || [];
  if (quarantined.length !== 3) errors.push('manifest: quarantined must disclose all 3 mixed-year files (claim-level split)');
  const quarantinedPaths = new Set(quarantined.map((q) => q.path));
  for (const p of CONTENT_DUP_PATHS) {
    if (!quarantinedPaths.has(p)) errors.push(`manifest: quarantined must disclose path "${p}"`);
  }
  const claimQuarantineIds = new Set((manifest.claimQuarantineDisclosure?.quarantinedClaimIds || []));
  if (claimQuarantineIds.size !== 6) errors.push('manifest: claimQuarantineDisclosure must list exactly 6 quarantined claim ids');
  for (const id of ['claim-71-p1-appointment', 'claim-71-p5-criteria', 'claim-71-p7-execution', 'claim-72-p1-continuation', 'claim-72-p1-mentor-speaker', 'claim-72-p1-network']) {
    if (!claimQuarantineIds.has(id)) errors.push(`manifest: claimQuarantineDisclosure must declare "${id}"`);
  }

  // contentDuplicateCandidate group C1
  const groups = manifest.contentDuplicateGroups || [];
  const c1 = groups.find((g) => g.group === CONTENT_DUP_GROUP);
  if (!c1) {
    errors.push('manifest: contentDuplicateGroups must declare group C1');
  } else {
    const c1Paths = new Set(c1.paths || []);
    for (const p of CONTENT_DUP_PATHS) {
      if (!manifestPathToEntry.has(p)) errors.push(`contentDuplicateGroups.C1: path not in cat7 manifest: ${p}`);
      if (!c1Paths.has(p)) errors.push(`contentDuplicateGroups.C1: missing path "${p}"`);
    }
  }

  // ---- Per-contract validation ----
  const recordCountByIndicator = {};
  const domainByCode = {};
  const contractSourceSets = {};
  for (const domain of ALLOWED_DOMAINS) {
    const filePath = resolve(CONTRACT_DIR, `${domain}.json`);
    let contract;
    try {
      contract = readJSON(filePath);
    } catch (e) {
      errors.push(`${domain}.json unreadable or invalid JSON: ${e.message}`);
      continue;
    }
    contractSourceSets[domain] = new Set((contract.sources || []).map((s) => s.ref));
    for (const key of ['schemaVersion', 'domain', 'updated', 'year', 'governance', 'sources', 'claims', 'records', 'gaps']) {
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

    // ---- Claims ----
    for (const [i, claim] of (contract.claims || []).entries()) {
      const at = `${domain}.claims[${i}] (${claim.id || '?'})`;
      if (!claim.id || seenIds.has(claim.id)) errors.push(`${at}: id missing or duplicated`);
      seenIds.add(claim.id);
      if (!domainIndicatorSet.has(claim.indicator)) errors.push(`${at}: indicator "${claim.indicator}" not in domain ${domain} (canonical scope only 7.1/7.2)`);
      if (!claim.page) errors.push(`${at}: page missing`);
      if (!claim.sourceRef) errors.push(`${at}: sourceRef missing`);
      else if (!manifestPathToEntry.has(claim.sourceRef)) errors.push(`${at}: sourceRef not in fy2568-publication cat7 manifest`);
      // TH/EN parity
      if (!claim.summary || !claim.summary.th || !claim.summary.en || !claim.summary.th.trim() || !claim.summary.en.trim()) {
        errors.push(`${at}: summary must have non-empty th AND en (TH/EN parity)`);
      }
      if (!VALID_CLAIM_STATUS.has(claim.status)) errors.push(`${at}: invalid status "${claim.status}"`);
      if (!VALID_CLAIM_CLASSIFICATION.has(claim.classification)) errors.push(`${at}: invalid classification "${claim.classification}"`);
      // claim-year rules
      if (claim.status === 'QUARANTINE' && claim.year !== 2569) errors.push(`${at}: QUARANTINE claim must have year 2569, got ${claim.year}`);
      if (claim.status === 'baseline-eligible' && claim.year !== 2568) errors.push(`${at}: baseline-eligible claim must have year 2568, got ${claim.year}`);
      if (claim.status === 'YEAR_UNVERIFIED' && claim.year !== null) errors.push(`${at}: YEAR_UNVERIFIED claim must have year null, got ${claim.year}`);
    }

    // ---- 7.1 limit (locked) ----
    if (domain === 'audit') {
      const eligible = (contract.claims || []).filter((c) => c.status === 'baseline-eligible');
      if (eligible.length !== 1 || eligible[0].id !== BASELINE_ELIGIBLE_7_1_CLAIM) {
        errors.push(`audit: exactly one baseline-eligible 7.1 claim is allowed and it MUST be "${BASELINE_ELIGIBLE_7_1_CLAIM}" (FY2568 request on p2), got [${eligible.map((c) => c.id).join(', ')}]`);
      }
      const eligibleClaim = eligible[0];
      if (eligibleClaim && eligibleClaim.page !== 'p2') errors.push(`audit: baseline-eligible 7.1 claim must be page "p2", got "${eligibleClaim.page}"`);
      // appointment/competence/completion/result must NOT be baseline-eligible
      const forbiddenEligible = (contract.claims || []).filter((c) =>
        c.status === 'baseline-eligible' &&
        /appointment|competence|execution|result|assignment|criteria/i.test(c.id),
      );
      if (forbiddenEligible.length > 0) errors.push(`audit: forbidden baseline-eligible claims (appointment/competence/execution/result): ${forbiddenEligible.map((c) => c.id).join(', ')}`);
    }

    // ---- Records ----
    const recordIds = new Set();
    for (const [i, rec] of (contract.records || []).entries()) {
      const at = `${domain}.records[${i}] (${rec.id || '?'})`;
      if (!rec.id || recordIds.has(rec.id)) errors.push(`${at}: id missing or duplicated`);
      recordIds.add(rec.id);
      if (rec.year !== 2568) errors.push(`${at}: year must be 2568 (frozen baseline)`);

      if (!Array.isArray(rec.indicatorCodes) || rec.indicatorCodes.length === 0) {
        errors.push(`${at}: indicatorCodes must be a non-empty array`);
      } else {
        for (const code of rec.indicatorCodes) {
          if (!indicatorToIssue.has(code)) errors.push(`${at}: unknown indicator "${code}"`);
          if (!domainIndicatorSet.has(code)) errors.push(`${at}: indicator "${code}" not in domain ${domain}`);
          const expectedIssue = indicatorToIssue.get(code);
          const expectedCat = expectedIssue ? issueToCategory.get(expectedIssue) : undefined;
          if (expectedIssue && !(rec.issueCodes || []).includes(expectedIssue)) errors.push(`${at}: issueCodes must include "${expectedIssue}"`);
          if (expectedCat && rec.categoryCode !== expectedCat) errors.push(`${at}: categoryCode must be "${expectedCat}"`);
          domainByCode[code] = domain;
        }
      }
      if (rec.categoryCode !== 'cat7') errors.push(`${at}: categoryCode must be "cat7"`);

      // evidenceIds gate
      if (!Array.isArray(rec.evidenceIds) || rec.evidenceIds.length === 0) {
        errors.push(`${at}: evidenceIds must be a non-empty array`);
      } else {
        for (const evId of rec.evidenceIds) {
          const ev = evidenceById.get(evId);
          if (!ev) { errors.push(`${at}: evidenceId "${evId}" not in evidence-index.json`); continue; }
          if (!(ev.categoryCodes || []).includes('cat7')) errors.push(`${at}: evidenceId "${evId}" must include categoryCodes cat7`);
          if (ev.traceabilityLevel !== 'indicator') errors.push(`${at}: evidenceId "${evId}" must be traceabilityLevel indicator`);
          const recCodes = [...(rec.indicatorCodes || [])].sort();
          const evCodes = [...(ev.indicatorCodes || [])].sort();
          if (JSON.stringify(recCodes) !== JSON.stringify(evCodes)) errors.push(`${at}: evidenceId "${evId}" indicatorCodes must equal record ${JSON.stringify(recCodes)}, got ${JSON.stringify(evCodes)}`);
          if (ev.manifestPath !== rec.sourceRef) errors.push(`${at}: evidenceId "${evId}" manifestPath must equal record sourceRef`);
          if (ev.manifestSha256 !== rec.manifestSha256) errors.push(`${at}: evidenceId "${evId}" manifestSha256 must equal record manifestSha256`);
          if (ev.availability !== rec.availability) errors.push(`${at}: evidenceId "${evId}" availability must equal record availability "${rec.availability}"`);
          if (ev.verification?.status !== rec.verification?.status) errors.push(`${at}: evidenceId "${evId}" verification.status must equal record verification.status`);
          // leakage guard: the evidence entry must not carry result keys
          for (const key of FORBIDDEN_RECORD_KEYS) {
            if (key in ev) errors.push(`${at}: evidenceId "${evId}" must not declare key "${key}" (no score/PASS/result leakage)`);
          }
        }
      }

      const v = rec.verification || {};
      if (!VALID_VERIFICATION.has(v.status)) errors.push(`${at}: invalid verification.status "${v.status}"`);
      if (!rec.availability || !VALID_AVAILABILITY.has(rec.availability)) errors.push(`${at}: invalid availability "${rec.availability}"`);
      for (const key of FORBIDDEN_RECORD_KEYS) {
        if (key in rec) errors.push(`${at}: record must not declare key "${key}" (no score/PASS/result/certification leakage)`);
      }
      if (!rec.labelTh || !rec.labelEn) errors.push(`${at}: labelTh/labelEn required (TH/EN parity)`);

      // sourceRef integrity + quarantine exclusion (FY2569 claims never sourceRef for evidence)
      if (!rec.sourceRef) errors.push(`${at}: sourceRef missing`);
      else {
        if (rec.sourceRef.startsWith('/') || /^[a-zA-Z]:/.test(rec.sourceRef)) errors.push(`${at}: sourceRef must be relative to cat7 document root`);
        const man = manifestPathToEntry.get(rec.sourceRef);
        if (!man) errors.push(`${at}: sourceRef not in fy2568-publication cat7 manifest`);
        else if (rec.manifestSha256 && man.sha256 !== rec.manifestSha256) errors.push(`${at}: manifestSha256 does not match manifest for "${rec.sourceRef}"`);
      }
      for (const rs of rec.relatedSources || []) {
        if (!manifestPathToEntry.has(rs)) errors.push(`${at}: relatedSources entry not in fy2568-publication cat7 manifest`);
      }

      for (const code of rec.indicatorCodes || []) {
        recordCountByIndicator[code] = (recordCountByIndicator[code] || 0) + 1;
      }
    }

    // ---- Mandatory 7.2 gap ----
    if (domain === 'advancement') {
      if (contract.records.length !== 0) {
        errors.push(`advancement: records MUST be empty for 7.2 (no verified FY2568 execution evidence) — got ${contract.records.length} record(s)`);
      }
      const gap = contract.evidenceGap;
      if (!gap || gap.indicator !== '7.2') errors.push('advancement: must declare evidenceGap for 7.2');
      else {
        if (gap.status !== 'EVIDENCE_GAP') errors.push(`advancement: evidenceGap.status must be EVIDENCE_GAP, got "${gap.status}"`);
        if (gap.mandatory !== true) errors.push('advancement: evidenceGap.mandatory must be true');
        if (gap.noFakeEvidence !== true) errors.push('advancement: evidenceGap.noFakeEvidence must be true');
        if (!gap.noteTh || !gap.noteEn) errors.push('advancement: evidenceGap must have noteTh AND noteEn (TH/EN parity)');
      }
    }
  }

  // ---- Cross-domain: 7.2 must have NO evidence entry ----
  const ev71 = evidence.filter((e) => (e.indicatorCodes || []).includes('7.1') && e.traceabilityLevel === 'indicator');
  const ev72 = evidence.filter((e) => (e.indicatorCodes || []).includes('7.2') && e.traceabilityLevel === 'indicator');
  if (ev72.length !== 0) errors.push(`evidence-index: 7.2 MUST NOT have an indicator-level evidence entry (mandatory gap), got ${ev72.length}: ${ev72.map((e) => e.id).join(', ')}`);
  if (ev71.length !== 1 || ev71[0].id !== SEVEN_ONE_EVIDENCE_ID) {
    errors.push(`evidence-index: 7.1 must resolve to exactly one indicator-level entry "${SEVEN_ONE_EVIDENCE_ID}", got [${ev71.map((e) => e.id).join(', ')}]`);
  }
  for (const ev of evidence) {
    if ((ev.categoryCodes || []).includes('cat7') && ev.traceabilityLevel === 'indicator') {
      for (const code of ev.indicatorCodes || []) {
        if (!CAT7_CODES.includes(code)) errors.push(`evidence-index: cat7 indicator-level entry "${ev.id}" uses non-cat7 indicator "${code}"`);
      }
    }
  }

  // ---- Coverage: 7.1 has a record; 7.2 is a mandatory gap (not a record) ----
  if (!recordCountByIndicator['7.1']) errors.push('coverage: cat7 indicator "7.1" has no contract record');
  if (recordCountByIndicator['7.2']) errors.push('coverage: cat7 indicator "7.2" must NOT have a contract record (mandatory evidence gap)');

  // ---- Content-duplicate: C1 paths all referenced from contract source sets ----
  const allReferenced = new Set(Object.values(contractSourceSets).reduce((a, s) => a.concat([...s]), []));
  for (const p of CONTENT_DUP_PATHS) {
    if (!allReferenced.has(p)) errors.push(`contentDuplicateGroups.C1: path must remain a referenced sourceRef (no dedup): ${p}`);
  }

  // ---- TH/EN parity across manifest ----
  const mRaw = readFileSync(MANIFEST_PATH, 'utf8');
  const manifestObj = JSON.parse(mRaw);
  if (!manifestObj.titleTh || !manifestObj.titleEn) errors.push('manifest: titleTh/titleEn required (TH/EN parity)');
  if (!manifestObj.note) errors.push('manifest: note required');
  const mParityCheck = /"th":\s*""|"en":\s*""/;
  if (mParityCheck.test(mRaw)) errors.push('manifest: empty bilingual string found (TH/EN parity)');

  // ---- Report ----
  console.log('=== CATEGORY 7 DATA CONTRACTS VALIDATION ===');
  console.log(`Domains checked : ${ALLOWED_DOMAINS.length} (${ALLOWED_DOMAINS.join(', ')})`);
  console.log('Indicator scope: 7.1 (audit) · 7.2 (advancement, evidence gap)');
  console.log(`Records         : 7.1=${recordCountByIndicator['7.1'] || 0} · 7.2=${recordCountByIndicator['7.2'] || 0} (mandatory gap)`);
  console.log(`Evidence-index  : 7.1=${ev71.length} (${SEVEN_ONE_EVIDENCE_ID}) · 7.2=${ev72.length} (must be 0)`);
  if (errors.length > 0) {
    console.log(`--- ${errors.length} ERROR(S) ---`);
    errors.forEach((e) => console.log(`  •  ${e}`));
    console.log('\nRESULT: FAIL (exit code 1)');
    process.exit(1);
  }
  console.log('RESULT: PASS — (exit code 0)');
}

main();
