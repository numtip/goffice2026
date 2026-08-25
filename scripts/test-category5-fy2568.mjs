/**
 * test-category5-fy2568.mjs
 * ===========================
 * Regression tests for the Category 5 FY2568 baseline integration (Phase B).
 * Read-only over src/data/category5/*.json, the evidence index, the action-plan
 * canonical mapping, and the Cat5 presentation wiring.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTRACT_DIR = join(ROOT, 'src', 'data', 'category5');
const DOMAINS = ['air', 'lighting', 'noise', 'livability', 'emergency'];
const CAT5_CODES = [
  '5.1.1', '5.1.2', '5.1.3',
  '5.2.1',
  '5.3.1', '5.3.2',
  '5.4.1', '5.4.2', '5.4.3', '5.4.4',
  '5.5.1', '5.5.2', '5.5.3',
];

function readContract(domain) {
  return JSON.parse(readFileSync(join(CONTRACT_DIR, `${domain}.json`), 'utf8'));
}

describe('category5 contracts — presence and shape', () => {
  it('manifest exists with 5 contracts, empty missingIndicators, and locked disclosures', () => {
    const m = JSON.parse(readFileSync(join(CONTRACT_DIR, 'category5-manifest.json'), 'utf8'));
    assert.equal(m.schemaVersion, '1.0.0');
    assert.equal(m.contracts.length, 5);
    assert.equal(m.year, 2568);
    assert.deepEqual(m.missingIndicators, [], 'all 13 Cat5 indicators have dedicated evidence');
    const fwd = new Set((m.forwardRequirements || []).map((f) => f.code));
    for (const code of ['FY2569_RECURRING_EVIDENCE_COLLECTION', 'OCR_DECISION_FOR_SCANS']) {
      assert.ok(fwd.has(code), `forwardRequirements must declare ${code}`);
    }
    const limits = new Set((m.sourceLimitations || []).map((l) => l.code));
    for (const code of ['SCAN_ONLY_FILES', 'FY2569_CONTAMINATION_EXCLUDED', 'NOISE_MEASUREMENT_CONTEXTUAL_NA', 'LIVABILITY_PERCENT_NOT_EVIDENCED', 'EMERGENCY_UNDERSTANDING_PERCENT_NOT_EVIDENCED', 'HOSE_CABINET_REPORT_3_UNCONFIRMED', 'NO_OCR_IN_THIS_PHASE']) {
      assert.ok(limits.has(code), `sourceLimitations must declare ${code}`);
    }
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

  it('every one of the 13 cat5 indicators appears in exactly one contract domain', () => {
    const domainsByCode = {};
    for (const domain of DOMAINS) {
      for (const rec of readContract(domain).records) {
        for (const code of rec.indicatorCodes || []) {
          if (domainsByCode[code] && domainsByCode[code] !== domain) {
            throw new Error(`duplicate registry: ${code} in ${domainsByCode[code]} and ${domain}`);
          }
          domainsByCode[code] = domain;
        }
      }
    }
    for (const code of CAT5_CODES) {
      assert.ok(domainsByCode[code], `${code} must be in exactly one contract domain`);
    }
  });

  it('locked disclosures are present on the right records', () => {
    const noise = readContract('noise');
    const noiseRec = noise.records.find((r) => r.indicatorCodes.includes('5.3.1'));
    assert.equal(noiseRec.noiseMeasurementStatus, 'CONTEXTUAL_NA_PENDING_ASSESSOR');

    const livability = readContract('livability');
    for (const code of ['5.4.2', '5.4.3']) {
      const rec = livability.records.find((r) => r.indicatorCodes.includes(code));
      assert.equal(rec.percentNotEvidenced, true, `${code} must declare percentNotEvidenced`);
    }

    const emergency = readContract('emergency');
    const planRec = emergency.records.find((r) => r.indicatorCodes.includes('5.5.2'));
    assert.equal(planRec.percentNotEvidenced, true);
    const equipRec = emergency.records.find((r) => r.indicatorCodes.includes('5.5.3'));
    assert.match(equipRec.expectedSourceUnconfirmed.ref, /5\.5\.3-3/);
  });

  it('the FY2569-contamination file never appears as a record sourceRef anywhere', () => {
    for (const domain of DOMAINS) {
      const raw = readFileSync(join(CONTRACT_DIR, `${domain}.json`), 'utf8');
      for (const rec of readContract(domain).records) {
        assert.ok(!rec.sourceRef.includes('งบ 69'), `${rec.id} must not use the excluded FY2569 contract`);
      }
    }
    // The exclusion is disclosed in the manifest + livability gaps.
    const m = JSON.parse(readFileSync(join(CONTRACT_DIR, 'category5-manifest.json'), 'utf8'));
    assert.ok(JSON.stringify(m.sourceLimitations).includes('งบ 69'));
  });

  it('no FY2569 facts leak into any contract record', () => {
    for (const domain of DOMAINS) {
      for (const rec of readContract(domain).records) {
        assert.equal(rec.year, 2568, `${rec.id} year must be 2568`);
        assert.equal(rec.fy2569Status, 'awaiting-update', `${rec.id} must be awaiting-update`);
      }
    }
  });
});

describe('category5 contracts — evidence integrity', () => {
  const evidence = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'evidence-index.json'), 'utf8')).items;
  const evidenceById = new Map(evidence.map((e) => [e.id, e]));
  const publication = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'fy2568-publication.json'), 'utf8'));
  const cat5Manifest = new Map(
    (publication.categories.cat5?.documents ?? []).map((d) => [d.path, d]),
  );

  it('every contract record evidenceIds resolves and matches path/hash/indicator', () => {
    for (const domain of DOMAINS) {
      for (const rec of readContract(domain).records) {
        assert.ok(rec.evidenceIds.length > 0, `${domain}/${rec.id} must reference evidence`);
        for (const evId of rec.evidenceIds) {
          const ev = evidenceById.get(evId);
          assert.ok(ev, `${domain}/${rec.id} evidence ${evId} not in evidence-index`);
          assert.ok(ev.categoryCodes.includes('cat5'), `${evId} must be cat5`);
          assert.equal(ev.manifestPath, rec.sourceRef, `${evId} manifestPath === sourceRef`);
          assert.equal(ev.manifestSha256, rec.manifestSha256, `${evId} hash match`);
          assert.equal(ev.availability, rec.availability, `${evId} availability match`);
          assert.equal(ev.traceabilityLevel, 'indicator', `${evId} must be indicator-level`);
          assert.deepEqual([...ev.indicatorCodes].sort(), [...rec.indicatorCodes].sort(), `${evId} indicator match`);
        }
      }
    }
  });

  it('all 13 cat5 codes have indicator-level evidence; scans stay unpromoted; excluded file unused', () => {
    const byCode = {};
    for (const e of evidence.filter((x) => x.categoryCodes?.includes('cat5') && x.traceabilityLevel === 'indicator')) {
      for (const c of e.indicatorCodes || []) byCode[c] = (byCode[c] || 0) + 1;
    }
    for (const code of CAT5_CODES) {
      assert.ok(byCode[code] > 0, `${code} must have indicator-level evidence`);
    }
    for (const domain of DOMAINS) {
      for (const rec of readContract(domain).records) {
        if (/Scan$/.test(rec.kind || '')) {
          assert.equal(rec.promoted, false, `${rec.id} must be promoted:false`);
          assert.equal(rec.availability, 'filename_folder_only', `${rec.id} must be filename_folder_only`);
        }
        const man = cat5Manifest.get(rec.sourceRef);
        assert.ok(man, `${rec.id} sourceRef in cat5 manifest`);
        assert.equal(man.sha256, rec.manifestSha256, `${rec.id} hash matches manifest`);
      }
    }
  });
});

describe('category5 presentation util', () => {
  it('management cycle + domain snapshot util file exists on disk', () => {
    const utilPath = join(ROOT, 'src/utils/category5-presentation.ts');
    const src = readFileSync(utilPath, 'utf8');
    assert.ok(src.includes('CAT5_MANAGEMENT_CYCLE'));
    assert.ok(src.includes('buildCat5DomainSnapshot'));
    assert.ok(src.includes('CAT5_JOURNEYS'));
  });
});

describe('category5 runtime wiring', () => {
  const thCat = readFileSync(join(ROOT, 'src/pages/categories/[id].astro'), 'utf8');
  const enCat = readFileSync(join(ROOT, 'src/pages/en/categories/[id].astro'), 'utf8');
  const trace = readFileSync(join(ROOT, 'src/components/indicators/IndicatorTraceabilityExperience.astro'), 'utf8');

  it('TH and EN category pages wire Cat5ManagementCycle + Cat5DomainSnapshot', () => {
    assert.ok(thCat.includes("category.code === 'cat5'"));
    assert.ok(thCat.includes('<Cat5ManagementCycle'));
    assert.ok(thCat.includes('<Cat5DomainSnapshot'));
    assert.ok(enCat.includes("category.code === 'cat5'"));
    assert.ok(enCat.includes('<Cat5ManagementCycle'));
    assert.ok(enCat.includes('<Cat5DomainSnapshot'));
  });

  it('indicator traceability wires Cat5ContractContext + Cat5SourceDocuments and excludes cat5 from the legacy fallback', () => {
    assert.ok(trace.includes('import Cat5ContractContext'));
    assert.ok(trace.includes('import Cat5SourceDocuments'));
    assert.ok(trace.includes("indicator.categoryCode === 'cat5'"));
  });

  it('cat5 category note reflects the reconciled state (TH/EN)', () => {
    assert.ok(thCat.includes('13 ตัวชี้วัดมีหลักฐานเฉพาะปี 2568'), 'TH note states 13/13 coverage');
    assert.ok(thCat.includes('งบ 69'), 'TH note states the excluded FY2569 contract');
    assert.ok(enCat.includes('all 13 indicators have dedicated FY2568 evidence'), 'EN note states 13/13 coverage');
    assert.ok(enCat.includes('unconfirmed'), 'EN note states the 5.5.3-3 gap');
  });
});
