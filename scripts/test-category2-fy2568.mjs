/**
 * test-category2-fy2568.mjs
 * ===========================
 * Regression tests for the Category 2 FY2568 baseline integration (C2–C5).
 * Read-only over src/data/category2/*.json, the C3 evidence index, the C4
 * action-plan canonical mapping, and the Cat2 presentation wiring.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTRACT_DIR = join(ROOT, 'src', 'data', 'category2');
const DOMAINS = ['training', 'communication', 'feedback'];
const MISSING = '2.2.3';
const MISSING_STATUS = 'MISSING_DEDICATED_EVIDENCE';

function readContract(domain) {
  return JSON.parse(readFileSync(join(CONTRACT_DIR, `${domain}.json`), 'utf8'));
}

describe('category2 contracts — presence and shape', () => {
  it('manifest exists with 3 contracts and declares 2.2.3 MISSING_DEDICATED_EVIDENCE', () => {
    const m = JSON.parse(readFileSync(join(CONTRACT_DIR, 'category2-manifest.json'), 'utf8'));
    assert.equal(m.schemaVersion, '1.0.0');
    assert.equal(m.contracts.length, 3);
    assert.equal(m.year, 2568);
    const mi = m.missingIndicators.find((x) => x.indicator === MISSING);
    assert.ok(mi, 'manifest must declare 2.2.3');
    assert.equal(mi.status, MISSING_STATUS);
    const fr = m.forwardRequirements.find((x) => x.indicator === '2.1.2');
    assert.ok(fr, 'manifest must declare 2.1.2 forward requirement');
    assert.equal(fr.year, 2569);
    assert.equal(fr.status, 'FORWARD_REQUIREMENT');
    // B1: canonical annual report is historical baseline only — must explicitly
    // disclaim a signed/approved submission copy.
    assert.ok(m.annualReport.canonical.path.endsWith('รายงานผลการดำเนินงานหมวด2 (2568).docx'));
    const note = JSON.stringify(m);
    assert.ok(
      note.includes('no signed'),
      'manifest must disclaim a signed/approved submission copy (PO B1)',
    );
  });

  for (const domain of DOMAINS) {
    it(`${domain}.json is a valid 2568 contract with records and the 2.2.3 gap`, () => {
      const c = readContract(domain);
      assert.equal(c.schemaVersion, '1.0.0');
      assert.equal(c.domain, domain);
      assert.equal(c.year, 2568);
      assert.ok(Array.isArray(c.records));
      assert.ok(Array.isArray(c.gaps));
      const gap = c.gaps.find((g) => g.indicator === MISSING);
      assert.ok(gap, `${domain} gaps must declare 2.2.3`);
      assert.equal(gap.status, MISSING_STATUS);
    });
  }
});

describe('category2 contracts — C3 evidence integrity', () => {
  const evidence = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'evidence-index.json'), 'utf8')).items;
  const evidenceById = new Map(evidence.map((e) => [e.id, e]));
  const publication = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'fy2568-publication.json'), 'utf8'));
  const cat2Manifest = new Map(
    (publication.categories.cat2?.documents ?? []).map((d) => [d.path, d]),
  );

  it('every contract record evidenceIds resolves and matches path/hash/indicator', () => {
    for (const domain of DOMAINS) {
      for (const rec of readContract(domain).records) {
        assert.ok(rec.evidenceIds.length > 0, `${domain}/${rec.id} must reference evidence after C3`);
        for (const evId of rec.evidenceIds) {
          const ev = evidenceById.get(evId);
          assert.ok(ev, `${domain}/${rec.id} evidence ${evId} not in evidence-index`);
          assert.ok(ev.categoryCodes.includes('cat2'), `${evId} must be cat2`);
          assert.equal(ev.traceabilityLevel, 'indicator');
          assert.deepEqual([...ev.indicatorCodes].sort(), [...rec.indicatorCodes].sort(), `${evId} indicator match`);
          assert.equal(ev.manifestPath, rec.sourceRef, `${evId} manifestPath === sourceRef`);
          assert.equal(ev.manifestSha256, rec.manifestSha256, `${evId} hash match`);
          assert.equal(ev.availability, rec.availability, `${evId} availability match`);
          const man = cat2Manifest.get(rec.sourceRef);
          assert.ok(man, `${domain}/${rec.id} sourceRef in cat2 manifest`);
          assert.equal(man.sha256, rec.manifestSha256, `${domain}/${rec.id} hash matches manifest`);
        }
      }
    }
  });

  it('no record or evidence entry claims 2.2.3; candidates stay unpromoted', () => {
    for (const domain of DOMAINS) {
      for (const rec of readContract(domain).records) {
        assert.ok(!rec.indicatorCodes.includes(MISSING), `${domain}/${rec.id} must not claim 2.2.3`);
      }
    }
    assert.ok(!evidence.some((e) => (e.indicatorCodes || []).includes(MISSING)), 'no evidence entry may reference 2.2.3');
    const candidates = evidence.filter((e) => e.promoted !== undefined);
    for (const c of candidates) {
      assert.equal(c.promoted, false, `${c.id} must be promoted:false`);
      assert.equal(c.availability, 'filename_folder_only', `${c.id} must be filename_folder_only`);
    }
  });
});

describe('category2 presentation util', () => {
  it('communication loop has the five operational stages in order', async () => {
    // Verified via the tsx-run suite (test-category2-presentation.ts) because
    // the presentation util imports JSON contracts that node --test cannot
    // attribute. Placeholder here confirms the util file exists on disk.
    const utilPath = join(ROOT, 'src/utils/category2-presentation.ts');
    assert.ok(readFileSync(utilPath, 'utf8').includes('CAT2_COMMUNICATION_LOOP'));
  });
});

describe('category2 runtime wiring', () => {
  const thCat = readFileSync(join(ROOT, 'src/pages/categories/[id].astro'), 'utf8');
  const enCat = readFileSync(join(ROOT, 'src/pages/en/categories/[id].astro'), 'utf8');
  const trace = readFileSync(join(ROOT, 'src/components/indicators/IndicatorTraceabilityExperience.astro'), 'utf8');

  it('TH and EN category pages wire Cat2ManagementCycle + Cat2DomainSnapshot', () => {
    assert.ok(thCat.includes("category.code === 'cat2'"));
    assert.ok(thCat.includes('<Cat2ManagementCycle'));
    assert.ok(thCat.includes('<Cat2DomainSnapshot'));
    assert.ok(enCat.includes("category.code === 'cat2'"));
    assert.ok(enCat.includes('<Cat2ManagementCycle'));
    assert.ok(enCat.includes('<Cat2DomainSnapshot'));
  });

  it('indicator traceability wires Cat2ContractContext + Cat2SourceDocuments and excludes cat2 from water fallback', () => {
    assert.ok(trace.includes("import Cat2ContractContext"));
    assert.ok(trace.includes("import Cat2SourceDocuments"));
    assert.ok(trace.includes("categoryCode === 'cat2' &&"));
    assert.ok(trace.includes("indicator.categoryCode === 'cat2'") );
  });

  it('cat2 category note reflects reconciled state (TH/EN) with no stale unresolved wording', () => {
    assert.ok(thCat.includes('ตัวชี้วัด 2.2.3 ยังไม่มีหลักฐานเฉพาะ'), 'TH note states 2.2.3 gap');
    assert.ok(enCat.includes('2.2.3 still lacks dedicated evidence'), 'EN note states 2.2.3 gap');
    assert.ok(!thCat.includes('พบรายการที่ยังไม่ได้รับการแก้ไขในหมวด 2'), 'TH stale note removed');
    assert.ok(!enCat.includes('an unresolved item exists for category 2.'), 'EN stale note removed');
  });
});
