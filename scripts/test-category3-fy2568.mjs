/**
 * test-category3-fy2568.mjs
 * ===========================
 * Regression tests for the Category 3 FY2568 baseline integration (C2–C5).
 * Read-only over src/data/category3/*.json, the C3 evidence index, the C4
 * action-plan canonical mapping, and the Cat3 presentation wiring.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTRACT_DIR = join(ROOT, 'src', 'data', 'category3');
const DOMAINS = ['targets', 'measures', 'data', 'compliance', 'meetings'];
const CAT3_CODES = [
  '3.1.1', '3.1.2', '3.1.3',
  '3.2.1', '3.2.2', '3.2.3', '3.2.4', '3.2.5',
  '3.3.1', '3.3.2', '3.3.3', '3.3.4', '3.3.5',
  '3.4.1', '3.4.2',
];

function readContract(domain) {
  return JSON.parse(readFileSync(join(CONTRACT_DIR, `${domain}.json`), 'utf8'));
}

describe('category3 contracts — presence and shape', () => {
  it('manifest exists with 5 contracts, empty missingIndicators and declared source limitations', () => {
    const m = JSON.parse(readFileSync(join(CONTRACT_DIR, 'category3-manifest.json'), 'utf8'));
    assert.equal(m.schemaVersion, '1.0.0');
    assert.equal(m.contracts.length, 5);
    assert.equal(m.year, 2568);
    assert.deepEqual(m.missingIndicators, [], 'all 15 Cat3 indicators have dedicated evidence');
    assert.deepEqual(m.forwardRequirements, [], 'no FY2569 facts');
    const codes = new Set((m.sourceLimitations || []).map((l) => l.code));
    for (const code of ['SCAN_AC_CONDENSATE', 'SCAN_VEHICLE_LOG', 'GARBLED_MEASURES_PDF', 'IMAGE_ONLY_PER_UNIT', 'MISBOUNDED_19', 'INCOMPLETE_21', 'PARTIAL_32', 'NO_SIGNED_COPY']) {
      assert.ok(codes.has(code), `sourceLimitations must declare ${code}`);
    }
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

  it('every one of the 15 cat3 indicators appears in exactly one non-target contract domain', () => {
    const domainsByCode = {};
    for (const domain of ['measures', 'data', 'compliance', 'meetings']) {
      for (const rec of readContract(domain).records) {
        for (const code of rec.indicatorCodes || []) {
          if (domainsByCode[code] && domainsByCode[code] !== domain) {
            throw new Error(`duplicate registry: ${code} in ${domainsByCode[code]} and ${domain}`);
          }
          domainsByCode[code] = domain;
        }
      }
    }
    for (const code of CAT3_CODES) {
      assert.ok(domainsByCode[code], `${code} must be in exactly one contract domain`);
    }
  });
});

describe('category3 contracts — C3 evidence integrity', () => {
  const evidence = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'evidence-index.json'), 'utf8')).items;
  const evidenceById = new Map(evidence.map((e) => [e.id, e]));
  const publication = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'fy2568-publication.json'), 'utf8'));
  const cat3Manifest = new Map(
    (publication.categories.cat3?.documents ?? []).map((d) => [d.path, d]),
  );

  it('every contract record evidenceIds resolves and matches path/hash/indicator', () => {
    for (const domain of DOMAINS) {
      for (const rec of readContract(domain).records) {
        assert.ok(rec.evidenceIds.length > 0, `${domain}/${rec.id} must reference evidence after C3`);
        for (const evId of rec.evidenceIds) {
          const ev = evidenceById.get(evId);
          assert.ok(ev, `${domain}/${rec.id} evidence ${evId} not in evidence-index`);
          assert.ok(ev.categoryCodes.includes('cat3'), `${evId} must be cat3`);
          assert.equal(ev.manifestPath, rec.sourceRef, `${evId} manifestPath === sourceRef`);
          assert.equal(ev.manifestSha256, rec.manifestSha256, `${evId} hash match`);
          assert.equal(ev.availability, rec.availability, `${evId} availability match`);
          const man = cat3Manifest.get(rec.sourceRef);
          assert.ok(man, `${domain}/${rec.id} sourceRef in cat3 manifest`);
          assert.equal(man.sha256, rec.manifestSha256, `${domain}/${rec.id} hash matches manifest`);
          if (domain === 'targets') {
            assert.equal(ev.traceabilityLevel, 'category', `${evId} must be category-level (cross-indicator targets)`);
          } else {
            assert.equal(ev.traceabilityLevel, 'indicator', `${evId} must be indicator-level`);
            assert.deepEqual([...ev.indicatorCodes].sort(), [...rec.indicatorCodes].sort(), `${evId} indicator match`);
          }
        }
      }
    }
  });

  it('all 15 cat3 codes have indicator-level evidence; scans stay unpromoted', () => {
    const byCode = {};
    for (const e of evidence.filter((x) => x.categoryCodes?.includes('cat3') && x.traceabilityLevel === 'indicator')) {
      for (const c of e.indicatorCodes || []) byCode[c] = (byCode[c] || 0) + 1;
    }
    for (const code of CAT3_CODES) {
      assert.ok(byCode[code] > 0, `${code} must have indicator-level evidence`);
    }
    // 3.2.2 MEDIUM: per-unit numbers unavailable
    const elec = readContract('data').records.find((r) => r.indicatorCodes.includes('3.2.2'));
    assert.equal(elec.evidenceStrength, 'MEDIUM');
    assert.equal(elec.perUnit, null, '3.2.2 per-unit must stay unavailable');
    // Scan records not promoted
    for (const rec of readContract('measures').records) {
      if (rec.kind === 'measurePhotoScan' || rec.kind === 'measureScan') {
        assert.equal(rec.promoted, false, `${rec.id} must be promoted:false`);
        assert.equal(rec.availability, 'filename_folder_only', `${rec.id} must be filename_folder_only`);
      }
    }
    // Legacy cat3 placeholders reconciled
    for (const id of ['ev-energy-audit-2025', 'ev-energy-metering-2025', 'ev-energy-led-project', 'ev-water-meter-q1', 'ev-waste-audit-2025', 'ev-transport-fleet-2025']) {
      const ev = evidenceById.get(id);
      assert.ok(ev, `${id} must still exist`);
      assert.equal(ev.superseded, true, `${id} must be marked superseded`);
    }
    // Off-manifest operational-workbook claims downgraded to category-level
    for (const id of ['ev-energy-metering-2025', 'ev-water-meter-q1', 'ev-transport-fleet-2025']) {
      const ev = evidenceById.get(id);
      assert.equal(ev.traceabilityLevel, 'category', `${id} must be category-level (no false indicator claim)`);
      assert.deepEqual(ev.indicatorCodes, [], `${id} must not claim an indicator`);
      assert.equal(ev.realSourceAvailable, false, `${id} must not resolve a public document`);
    }
  });
});

describe('category3 presentation util', () => {
  it('management cycle + domain snapshot util file exists on disk', () => {
    const utilPath = join(ROOT, 'src/utils/category3-presentation.ts');
    assert.ok(readFileSync(utilPath, 'utf8').includes('CAT3_MANAGEMENT_CYCLE'));
    assert.ok(readFileSync(utilPath, 'utf8').includes('buildCat3DomainSnapshot'));
  });
});

describe('category3 runtime wiring', () => {
  const thCat = readFileSync(join(ROOT, 'src/pages/categories/[id].astro'), 'utf8');
  const enCat = readFileSync(join(ROOT, 'src/pages/en/categories/[id].astro'), 'utf8');
  const trace = readFileSync(join(ROOT, 'src/components/indicators/IndicatorTraceabilityExperience.astro'), 'utf8');

  it('TH and EN category pages wire Cat3ManagementCycle + Cat3DomainSnapshot', () => {
    assert.ok(thCat.includes("category.code === 'cat3'"));
    assert.ok(thCat.includes('<Cat3ManagementCycle'));
    assert.ok(thCat.includes('<Cat3DomainSnapshot'));
    assert.ok(enCat.includes("category.code === 'cat3'"));
    assert.ok(enCat.includes('<Cat3ManagementCycle'));
    assert.ok(enCat.includes('<Cat3DomainSnapshot'));
  });

  it('indicator traceability wires Cat3ContractContext + Cat3SourceDocuments and excludes cat3 from the legacy fallback', () => {
    assert.ok(trace.includes('import Cat3ContractContext'));
    assert.ok(trace.includes('import Cat3SourceDocuments'));
    assert.ok(trace.includes("indicator.categoryCode === 'cat3'"));
  });

  it('cat3 category note reflects the reconciled state (TH/EN)', () => {
    assert.ok(thCat.includes('ทั้ง 15 ตัวชี้วัดมีหลักฐานเฉพาะปี 2568'), 'TH note states all-15 covered');
    assert.ok(thCat.includes('ไม่มีฉบับลงนาม'), 'TH note states no signed copy');
    assert.ok(enCat.includes('all 15 indicators have dedicated FY2568 evidence'), 'EN note states all-15 covered');
    assert.ok(enCat.includes('no signed copy exists'), 'EN note states no signed copy');
  });
});
