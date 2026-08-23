/**
 * test-category4-fy2568.mjs
 * ===========================
 * Regression tests for the Category 4 FY2568 baseline integration (C2–C5).
 * Read-only over src/data/category4/*.json, the C3 evidence index, the C4
 * action-plan canonical mapping, and the Cat4 presentation wiring.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTRACT_DIR = join(ROOT, 'src', 'data', 'category4');
const DOMAINS = ['targets', 'measures', 'sorting', 'data', 'wastewater', 'treatment-care'];
const CAT4_CODES = ['4.1.1', '4.1.2', '4.1.3', '4.2.1', '4.2.2'];

function readContract(domain) {
  return JSON.parse(readFileSync(join(CONTRACT_DIR, `${domain}.json`), 'utf8'));
}

describe('category4 contracts — presence and shape', () => {
  it('manifest exists with 6 contracts, empty missingIndicators, foam-free forward requirement and declared source limitations', () => {
    const m = JSON.parse(readFileSync(join(CONTRACT_DIR, 'category4-manifest.json'), 'utf8'));
    assert.equal(m.schemaVersion, '1.0.0');
    assert.equal(m.contracts.length, 6);
    assert.equal(m.year, 2568);
    assert.deepEqual(m.missingIndicators, [], 'all 5 Cat4 indicators have dedicated evidence');
    assert.ok(
      (m.forwardRequirements || []).some((f) => f.code === 'FOAM_FREE_FY2569_PLAN'),
      'forwardRequirements must declare FOAM_FREE_FY2569_PLAN (4.1.1(3) forward plan, not a verified FY2569 fact)',
    );
    const codes = new Set((m.sourceLimitations || []).map((l) => l.code));
    for (const code of ['SCAN_TARGET_ANNOUNCE', 'SCAN_CONTEXT_ANNOUNCE', 'SCAN_RANDOM_CHECK_FORM', 'SCAN_CONTRACT', 'SCAN_WASTE_LOG', 'SCAN_SKIMMING_RECORD', 'GARBLED_MEASURES_PDF', 'NO_SIGNED_COPY', 'REUSE_NUMERIC_NOT_MET', 'GENERAL_WASTE_TARGET_NOT_MET', 'MONTHLY_VS_ANNUAL_SCOPE', 'WTMS_EXTERNAL_RECORDS']) {
      assert.ok(codes.has(code), `sourceLimitations must declare ${code}`);
    }
    assert.equal(m.annualReport.canonical.path, 'หมวดที่ 4 รายงานผลการจัดการของเสีย  (10-03-69).docx', 'canonical must be the 10-03-69 DOCX');
    assert.equal(m.annualReport.superseded.path, 'หมวดที่ 4 รายงานผลการจัดการของเสีย  (02-03-69).docx', 'superseded must be the 02-03-69 DOCX');
    assert.equal(m.annualReport.export.path, 'หมวดที่ 4 รายงานผลการจัดการของเสีย  (10-03-69).pdf', 'export must be the 10-03-69 PDF');
    assert.ok(
      JSON.stringify(m.annualReport).includes('no signed'),
      'manifest must disclaim a signed/approved submission copy',
    );
  });

  for (const domain of DOMAINS) {
    it(`${domain}.json is a valid 2568 contract with records and no MISSING gaps`, () => {
      const c = readContract(domain);
      assert.equal(c.schemaVersion, '1.0.0');
      assert.equal(c.domain, domain);
      assert.equal(c.year, 2568);
      assert.ok(Array.isArray(c.records));
      assert.ok(Array.isArray(c.gaps));
      for (const g of c.gaps) {
        assert.notEqual(g.status, 'MISSING_DEDICATED_EVIDENCE', `${domain}: no MISSING_DEDICATED_EVIDENCE allowed`);
      }
    });
  }

  it('every one of the 5 cat4 indicators appears in exactly one non-target contract domain', () => {
    const domainsByCode = {};
    for (const domain of ['measures', 'sorting', 'data', 'wastewater', 'treatment-care']) {
      for (const rec of readContract(domain).records) {
        for (const code of rec.indicatorCodes || []) {
          if (domainsByCode[code] && domainsByCode[code] !== domain) {
            throw new Error(`duplicate registry: ${code} in ${domainsByCode[code]} and ${domain}`);
          }
          domainsByCode[code] = domain;
        }
      }
    }
    for (const code of CAT4_CODES) {
      assert.ok(domainsByCode[code], `${code} must be in exactly one contract domain`);
    }
  });

  it('4.1.1(3) foam-free gap is disclosed in measures', () => {
    const m = readContract('measures');
    assert.ok(m.records.some((r) => r.kind === 'disclosedGap'), 'measures must contain the disclosed-gap record');
    assert.ok(
      (m.forwardRequirements || []).some((f) => f.code === 'FOAM_FREE_FY2569_PLAN'),
      'measures must declare the FOAM_FREE_FY2569_PLAN forward requirement',
    );
  });

  it('annual waste facts are truthful and the two scopes are never conflated', () => {
    const data = readContract('data');
    const annual = data.records.find((r) => r.id === 'data-waste-annual-fy2568');
    assert.ok(annual, 'data must contain data-waste-annual-fy2568');
    assert.equal(annual.generalWasteTotal, 4380.1, 'general waste sent for disposal must be 4,380.10 kg');
    assert.equal(annual.totalAllWaste, 6434.7, 'total all waste must be 6,434.70 kg');
    assert.equal(annual.reusePercent, 31.93, 'reuse must be 31.93%');
    assert.equal(annual.reuseNumericThresholdMet, false, 'numeric >50% reuse must NOT be met');
    assert.equal(annual.targetOutcome, 'NOT_MET', 'general-waste −3% target must NOT be met');
    assert.equal(annual.monthlyFormScopeTotal, 5625.7, 'monthly-form scope must be 5,625.7 kg (recorded separately)');
    const analysis = data.records.find((r) => r.id === 'data-waste-analysis-fy2568');
    assert.equal(analysis.diffVsPrevYear, -72.4, 'analysis diff must be −72.40 kg');
    assert.equal(analysis.diffPercentVsPrevYear, -1.68, 'analysis diff % must be −1.68%');
  });
});

describe('category4 contracts — C3 evidence integrity', () => {
  const evidence = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'evidence-index.json'), 'utf8')).items;
  const evidenceById = new Map(evidence.map((e) => [e.id, e]));
  const publication = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'fy2568-publication.json'), 'utf8'));
  const cat4Manifest = new Map(
    (publication.categories.cat4?.documents ?? []).map((d) => [d.path, d]),
  );

  it('every contract record evidenceIds resolves and matches path/hash/indicator', () => {
    for (const domain of DOMAINS) {
      for (const rec of readContract(domain).records) {
        assert.ok(rec.evidenceIds.length > 0, `${domain}/${rec.id} must reference evidence after C3`);
        for (const evId of rec.evidenceIds) {
          const ev = evidenceById.get(evId);
          assert.ok(ev, `${domain}/${rec.id} evidence ${evId} not in evidence-index`);
          assert.ok(ev.categoryCodes.includes('cat4'), `${evId} must be cat4`);
          assert.equal(ev.manifestPath, rec.sourceRef, `${evId} manifestPath === sourceRef`);
          assert.equal(ev.manifestSha256, rec.manifestSha256, `${evId} hash match`);
          assert.equal(ev.availability, rec.availability, `${evId} availability match`);
          const man = cat4Manifest.get(rec.sourceRef);
          assert.ok(man, `${domain}/${rec.id} sourceRef in cat4 manifest`);
          assert.equal(man.sha256, rec.manifestSha256, `${domain}/${rec.id} hash matches manifest`);
          if (domain === 'targets') {
            assert.equal(ev.traceabilityLevel, 'category', `${evId} must be category-level (cross-indicator target)`);
          } else {
            assert.equal(ev.traceabilityLevel, 'indicator', `${evId} must be indicator-level`);
            assert.deepEqual([...ev.indicatorCodes].sort(), [...rec.indicatorCodes].sort(), `${evId} indicator match`);
          }
        }
      }
    }
  });

  it('all 5 cat4 codes have indicator-level evidence; scans stay unpromoted; superseded/export excluded', () => {
    const byCode = {};
    for (const e of evidence.filter((x) => x.categoryCodes?.includes('cat4') && x.traceabilityLevel === 'indicator')) {
      for (const c of e.indicatorCodes || []) byCode[c] = (byCode[c] || 0) + 1;
    }
    for (const code of CAT4_CODES) {
      assert.ok(byCode[code] > 0, `${code} must have indicator-level evidence`);
    }
    // Scan records stay unpromoted + filename_folder_only
    for (const domain of ['measures', 'sorting', 'data', 'wastewater', 'treatment-care']) {
      for (const rec of readContract(domain).records) {
        if (/Scan$/.test(rec.kind || '')) {
          assert.equal(rec.promoted, false, `${rec.id} must be promoted:false`);
          assert.equal(rec.availability, 'filename_folder_only', `${rec.id} must be filename_folder_only`);
        }
      }
    }
    // Garbled measures cross-reference only
    const garbled = readContract('measures').records.find((r) => r.id === 'measure-waste-plan-crossref-fy2568');
    assert.equal(garbled.promoted, false);
    assert.equal(garbled.availability, 'filename_folder_only');
    assert.match(garbled.verification.basis, /cross-reference/i, 'garbled measures basis must state cross-reference-only');
    // Superseded + export are NOT record sourceRefs anywhere
    for (const domain of DOMAINS) {
      for (const rec of readContract(domain).records) {
        assert.notEqual(rec.sourceRef, 'หมวดที่ 4 รายงานผลการจัดการของเสีย  (02-03-69).docx', `${rec.id} must not use the superseded report`);
        assert.notEqual(rec.sourceRef, 'หมวดที่ 4 รายงานผลการจัดการของเสีย  (10-03-69).pdf', `${rec.id} must not use the PDF export`);
      }
    }
    // G2 skimming duplicate disclosed exactly once
    const dupRec = readContract('treatment-care').records.find((r) => r.duplicateOf);
    assert.ok(dupRec, 'treatment-care must disclose the G2 skimming duplicate');
    assert.equal(dupRec.duplicateOf, 'wastewater-skim-scan-fy2568');
    const skimRecords = [
      ...readContract('wastewater').records.filter((r) => r.kind === 'skimRecordScan'),
      ...readContract('treatment-care').records.filter((r) => r.kind === 'skimRecordScan'),
    ];
    assert.equal(new Set(skimRecords.map((r) => r.manifestSha256)).size, 1, 'G2 skimming records must be byte-identical');
    // Legacy off-manifest cat4 placeholders downgraded + superseded
    for (const id of ['ev-waste-recycling-2025', 'ev-waste-monthly-2025']) {
      const ev = evidenceById.get(id);
      assert.ok(ev, `${id} must still exist`);
      assert.equal(ev.superseded, true, `${id} must be marked superseded`);
      assert.equal(ev.traceabilityLevel, 'category', `${id} must be category-level (no false indicator claim)`);
      assert.deepEqual(ev.indicatorCodes, [], `${id} must not claim an indicator`);
      assert.equal(ev.realSourceAvailable, false, `${id} must not resolve a public document`);
    }
  });
});

describe('category4 presentation util', () => {
  it('management cycle + domain snapshot util file exists on disk', () => {
    const utilPath = join(ROOT, 'src/utils/category4-presentation.ts');
    const src = readFileSync(utilPath, 'utf8');
    assert.ok(src.includes('CAT4_MANAGEMENT_CYCLE'));
    assert.ok(src.includes('buildCat4DomainSnapshot'));
    assert.ok(src.includes('CAT4_JOURNEYS'));
  });
});

describe('category4 runtime wiring', () => {
  const thCat = readFileSync(join(ROOT, 'src/pages/categories/[id].astro'), 'utf8');
  const enCat = readFileSync(join(ROOT, 'src/pages/en/categories/[id].astro'), 'utf8');
  const trace = readFileSync(join(ROOT, 'src/components/indicators/IndicatorTraceabilityExperience.astro'), 'utf8');

  it('TH and EN category pages wire Cat4ManagementCycle + Cat4DomainSnapshot', () => {
    assert.ok(thCat.includes("category.code === 'cat4'"));
    assert.ok(thCat.includes('<Cat4ManagementCycle'));
    assert.ok(thCat.includes('<Cat4DomainSnapshot'));
    assert.ok(enCat.includes("category.code === 'cat4'"));
    assert.ok(enCat.includes('<Cat4ManagementCycle'));
    assert.ok(enCat.includes('<Cat4DomainSnapshot'));
  });

  it('indicator traceability wires Cat4ContractContext + Cat4SourceDocuments and excludes cat4 from the legacy fallback', () => {
    assert.ok(trace.includes('import Cat4ContractContext'));
    assert.ok(trace.includes('import Cat4SourceDocuments'));
    assert.ok(trace.includes("indicator.categoryCode === 'cat4'"));
  });

  it('cat4 category note reflects the reconciled state (TH/EN)', () => {
    assert.ok(thCat.includes('ปลอดโฟม 4.1.1(3) ยังไม่ได้ดำเนินการ'), 'TH note states the foam-free gap');
    assert.ok(thCat.includes('31.93%'), 'TH note states reuse 31.93%');
    assert.ok(thCat.includes('ฉบับ 10-03-69'), 'TH note states the 10-03-69 canonical report');
    assert.ok(enCat.includes('foam-free 4.1.1(3) was not implemented'), 'EN note states the foam-free gap');
    assert.ok(enCat.includes('31.93%'), 'EN note states reuse 31.93%');
    assert.ok(enCat.includes('10-03-69 DOCX'), 'EN note states the 10-03-69 canonical report');
  });
});
