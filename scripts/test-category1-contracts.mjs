/**
 * test-category1-contracts.mjs
 * =============================
 * Regression tests for the static Category 1 canonical data contracts
 * (GOFFICE2026 Phase C/D). Read-only over src/data/category1/*.json.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTRACT_DIR = join(ROOT, 'src', 'data', 'category1');
const DOMAINS = [
  'activities-aspects',
  'laws',
  'compliance',
  'targets',
  'ghg',
  'projects',
  'management-review',
  'environmental-aspects-2568',
  'environmental-committee',
];

function readContract(domain) {
  return JSON.parse(readFileSync(join(CONTRACT_DIR, `${domain}.json`), 'utf8'));
}

describe('category1 contracts — presence and shape', () => {
  it('manifest exists with 9 contracts and declares the missing indicators', () => {
    const m = JSON.parse(readFileSync(join(CONTRACT_DIR, 'category1-manifest.json'), 'utf8'));
    assert.equal(m.schemaVersion, '1.0.0');
    assert.equal(m.contracts.length, 9);
    const missing = m.missingIndicators.map((x) => x.indicator).sort();
    assert.deepEqual(missing, ['1.2.2', '1.5.3']);
  });

  for (const domain of DOMAINS) {
    it(`${domain}.json is a valid 2568 contract with records and gaps`, () => {
      const c = readContract(domain);
      assert.equal(c.schemaVersion, '1.0.0');
      assert.equal(c.domain, domain);
      assert.equal(c.year, 2568);
      assert.ok(Array.isArray(c.records));
      assert.ok(Array.isArray(c.gaps));
      const gapInds = c.gaps.map((g) => g.indicator);
      assert.ok(gapInds.includes('1.2.2'), `${domain} gaps must declare 1.2.2 MISSING`);
      assert.ok(gapInds.includes('1.5.3'), `${domain} gaps must declare 1.5.3 MISSING`);
    });
  }
});

describe('category1 contracts — reference integrity', () => {
  const indicators = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'criteria', 'indicators.json'), 'utf8')).indicators;
  const issues = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'criteria', 'issues.json'), 'utf8')).issues;
  const evidenceIds = new Set(
    JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'evidence-index.json'), 'utf8')).items.map((e) => e.id),
  );
  const validIndicators = new Set(indicators.map((i) => i.code));
  const indToIssue = new Map(indicators.map((i) => [i.code, i.issueCode]));
  const issueToCat = new Map(issues.map((i) => [i.id, i.categoryCode]));

  it('all records reference valid indicator/issue/category codes with matching hierarchy', () => {
    for (const domain of DOMAINS) {
      const c = readContract(domain);
      for (const rec of c.records) {
        assert.ok(rec.indicatorCodes.length > 0, `${domain}/${rec.id} needs indicatorCodes`);
        for (const code of rec.indicatorCodes) {
          assert.ok(validIndicators.has(code), `${domain}/${rec.id} unknown indicator ${code}`);
          const expectedIssue = indToIssue.get(code);
          assert.ok(rec.issueCodes.includes(expectedIssue), `${domain}/${rec.id} issue mismatch for ${code}`);
          assert.equal(rec.categoryCode, issueToCat.get(expectedIssue), `${domain}/${rec.id} category mismatch for ${code}`);
        }
      }
    }
  });

  it('evidenceIds always resolve to existing evidence-index records', () => {
    for (const domain of DOMAINS) {
      for (const rec of readContract(domain).records) {
        for (const evId of rec.evidenceIds || []) {
          assert.ok(evidenceIds.has(evId), `${domain}/${rec.id} evidence ${evId} not in evidence-index`);
        }
      }
    }
  });

  it('no record claims the MISSING indicators 1.2.2 / 1.5.3', () => {
    for (const domain of DOMAINS) {
      for (const rec of readContract(domain).records) {
        assert.ok(!rec.indicatorCodes.includes('1.2.2'), `${domain}/${rec.id} must not claim 1.2.2`);
        assert.ok(!rec.indicatorCodes.includes('1.5.3'), `${domain}/${rec.id} must not claim 1.5.3`);
      }
    }
  });
});

describe('category1 contracts — truthfulness guards', () => {
  it('no contract leaks local filesystem paths', () => {
    for (const domain of DOMAINS) {
      const raw = readFileSync(join(CONTRACT_DIR, `${domain}.json`), 'utf8');
      assert.ok(!/F:\\/i.test(raw), `${domain} leaks F:\\ path`);
      assert.ok(!/projectAi/i.test(raw), `${domain} leaks projectAi path`);
      assert.ok(!/OneDrive - Maejo/i.test(raw), `${domain} leaks OneDrive path`);
    }
  });

  it('ghg inventory uses the authoritative 222.68 tCO2e (1.5_greenhousegass_update2.xlsx) and discloses stale narrative', () => {
    const ghg = readContract('ghg');
    const inv = ghg.records.find((r) => r.kind === 'inventory');
    assert.ok(inv, 'ghg inventory record exists');
    assert.equal(inv.totalTCO2e, 222.68);
    assert.equal(inv.scope1TCO2e, 78.96);
    assert.equal(inv.scope2TCO2e, 132.27);
    assert.equal(inv.scope3TCO2e, 11.45);
    assert.equal(inv.septicAnomalyExcluded, false);
    // The new workbook's septic sheet uses the normal 95-personnel figures, so
    // no septic exclusion remains; the stale narrative (231.62) is disclosed.
    assert.ok(!ghg.records.some((r) => r.kind === 'exclusion'), 'no septic exclusion in the new authoritative set');
    assert.ok(ghg.records.some((r) => r.kind === 'anomaly' && r.code === 'ANOM-NARRATIVE-STALE'), 'stale-narrative conflict disclosed');
    assert.equal(ghg.sources[0].ref, '1.5Green house gass/1.5_greenhousegass_update2.xlsx');
    const raw = readFileSync(join(CONTRACT_DIR, 'ghg.json'), 'utf8');
    assert.ok(!raw.includes('7548513'), 'inflated septic value must not appear as a reported value');
  });

  it('ghg monthly series has 12 entries for year 2568', () => {
    const ghg = readContract('ghg');
    const months = ghg.records.filter((r) => r.kind === 'monthly');
    assert.equal(months.length, 12);
    assert.deepEqual(months.map((m) => m.month).sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('ghg dashboard baseline months match category1 monthly records', () => {
    const ghg = readContract('ghg');
    const metric = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'generated', 'ghg.json'), 'utf8'));
    const contractMonths = ghg.records
      .filter((r) => r.kind === 'monthly')
      .sort((a, b) => a.month - b.month);
    const dashMonths = metric.years['2568'].months.sort((a, b) => a.month - b.month);
    assert.equal(contractMonths.length, dashMonths.length);
    for (let i = 0; i < contractMonths.length; i++) {
      assert.equal(contractMonths[i].month, dashMonths[i].month, `month index ${i}`);
      assert.equal(contractMonths[i].tCO2e, dashMonths[i].value, `month ${contractMonths[i].month} tCO2e`);
    }
    const inv = ghg.records.find((r) => r.kind === 'inventory');
    const dashTotal = metric.years['2568'].total;
    const monthSum = dashMonths.reduce((s, m) => s + m.value, 0);
    assert.ok(Math.abs(monthSum - dashTotal) < 0.01, 'dashboard total equals monthly sum');
    assert.ok(
      Math.abs(inv.totalTCO2e - dashTotal) <= 0.021,
      'inventory vs dashboard within documented 0.02 tCO2e narrative delta',
    );
  });

  it('targets contract covers the six official domains', () => {
    const t = readContract('targets');
    const domains = t.records.map((r) => r.domain).sort();
    assert.deepEqual(domains, ['electricity', 'fuel', 'general_waste', 'ghg', 'paper', 'water']);
  });

  it('laws contract has 9 topics, 47 requirements, and 1 explicit aspect mapping', () => {
    const laws = readContract('laws');
    assert.equal(laws.status, 'historical-baseline');
    assert.equal(laws.records.filter((r) => r.kind === 'legal-item').length, 9);
    assert.equal(laws.records.filter((r) => r.kind === 'legal-requirement').length, 47);
    assert.equal(laws.records.filter((r) => r.kind === 'aspect-legal-mapping').length, 1);
    const mapping = laws.records.find((r) => r.id === 'alm-ea79-lr32');
    assert.equal(mapping.aspectId, 'ea-79');
    assert.equal(mapping.legalRequirementId, 'lr-3.2');
  });

  it('compliance contract has narrative evaluation and 47 register assessments', () => {
    const c = readContract('compliance');
    assert.equal(c.status, 'historical-baseline');
    assert.equal(c.records.filter((r) => r.kind === 'evaluation').length, 1);
    assert.equal(c.records.filter((r) => r.kind === 'legal-compliance-assessment').length, 47);
    const tds = c.records.find((r) => r.id === 'lca-1.3');
    assert.equal(tds.status, 'needs_review');
  });

  it('management-review quorum is documented at 20/23 = 86.96% for Meeting #1 only', () => {
    const mr = readContract('management-review');
    assert.equal(mr.status, 'historical-baseline');
    const quorum = mr.records.find((r) => r.kind === 'quorum');
    assert.ok(quorum);
    assert.equal(quorum.documented, true);
    assert.equal(quorum.meetingId, 'mr-meeting-1');
    assert.equal(quorum.attendancePct, 86.96);
    const meetings = mr.records.filter((r) => r.kind === 'meeting');
    assert.equal(meetings.length, 2);
    assert.equal(meetings.find((m) => m.id === 'mr-meeting-2').reviewStatus, 'occurrence_supported');
  });
});
