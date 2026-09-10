/** Regression tests for static Category 1 canonical data contracts. */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTRACT_DIR = join(ROOT, 'src', 'data', 'category1');
const DOMAINS = ['activities-aspects','laws','compliance','targets','ghg','projects','management-review','environmental-aspects-2568','environmental-committee'];
const readContract = (domain) => JSON.parse(readFileSync(join(CONTRACT_DIR, `${domain}.json`), 'utf8'));

describe('category1 contracts — presence and shape', () => {
  it('manifest exists with 9 contracts and declares missing indicators', () => {
    const m = JSON.parse(readFileSync(join(CONTRACT_DIR, 'category1-manifest.json'), 'utf8'));
    assert.equal(m.schemaVersion, '1.0.0');
    assert.equal(m.contracts.length, 9);
    assert.deepEqual(m.missingIndicators.map((x) => x.indicator).sort(), ['1.2.2', '1.5.3']);
  });
  for (const domain of DOMAINS) {
    it(`${domain}.json is a valid FY2568 contract`, () => {
      const c = readContract(domain);
      assert.equal(c.schemaVersion, '1.0.0');
      assert.equal(c.domain, domain);
      assert.equal(c.year, 2568);
      assert.ok(Array.isArray(c.records));
      assert.ok(Array.isArray(c.gaps));
      const gapInds = c.gaps.map((g) => g.indicator);
      assert.ok(gapInds.includes('1.2.2'));
      assert.ok(gapInds.includes('1.5.3'));
    });
  }
});

describe('category1 contracts — reference integrity', () => {
  const indicators = JSON.parse(readFileSync(join(ROOT, 'src/data/criteria/indicators.json'), 'utf8')).indicators;
  const issues = JSON.parse(readFileSync(join(ROOT, 'src/data/criteria/issues.json'), 'utf8')).issues;
  const evidenceIds = new Set(JSON.parse(readFileSync(join(ROOT, 'src/data/evidence-index.json'), 'utf8')).items.map((e) => e.id));
  const validIndicators = new Set(indicators.map((i) => i.code));
  const indToIssue = new Map(indicators.map((i) => [i.code, i.issueCode]));
  const issueToCat = new Map(issues.map((i) => [i.id, i.categoryCode]));

  it('all records reference valid indicator/issue/category/evidence IDs', () => {
    for (const domain of DOMAINS) {
      for (const rec of readContract(domain).records) {
        assert.ok(rec.indicatorCodes.length > 0, `${domain}/${rec.id}`);
        for (const code of rec.indicatorCodes) {
          assert.ok(validIndicators.has(code), `${domain}/${rec.id} unknown ${code}`);
          const issue = indToIssue.get(code);
          assert.ok(rec.issueCodes.includes(issue), `${domain}/${rec.id} issue mismatch`);
          assert.equal(rec.categoryCode, issueToCat.get(issue), `${domain}/${rec.id} category mismatch`);
          assert.ok(!['1.2.2','1.5.3'].includes(code), `${domain}/${rec.id} claims missing indicator`);
        }
        for (const evId of rec.evidenceIds || []) assert.ok(evidenceIds.has(evId), `${domain}/${rec.id} evidence ${evId}`);
      }
    }
  });

  it('no contract leaks local filesystem paths', () => {
    for (const domain of DOMAINS) {
      const raw = readFileSync(join(CONTRACT_DIR, `${domain}.json`), 'utf8');
      assert.ok(!/F:\\/i.test(raw));
      assert.ok(!/projectAi/i.test(raw));
      assert.ok(!/OneDrive - Maejo/i.test(raw));
    }
  });
});

describe('category1 GHG — official annual vs workbook monthly contract', () => {
  const ghg = readContract('ghg');
  const inv = ghg.records.find((r) => r.kind === 'inventory');

  it('uses official signed-form scopes, annual total and per-capita KPI', () => {
    assert.equal(inv.totalTCO2e, 231.62);
    assert.equal(inv.scope1TCO2e, 10.85);
    assert.equal(inv.scope2TCO2e, 201.48);
    assert.equal(inv.scope3TCO2e, 19.29);
    assert.equal(Math.round((inv.scope1TCO2e + inv.scope2TCO2e + inv.scope3TCO2e) * 100) / 100, 231.62);
    assert.equal(inv.perCapitaTCO2e, 2.44);
    assert.equal(inv.perCapitaKgCO2e, 2438);
    assert.equal(inv.perCapitaKgApproximate, true);
    assert.equal(inv.sourceRef, '1.5Green house gass/1.5.2 (9-3-69).pdf');
  });

  it('keeps 12 workbook months and the documented 0.39 annual delta', () => {
    const months = ghg.records.filter((r) => r.kind === 'monthly').sort((a,b) => a.month-b.month);
    assert.equal(months.length, 12);
    assert.equal(months[11].month, 12);
    assert.equal(months[11].tCO2e, 13.997);
    assert.match(months[11].verification.basis, /13\.997/);
    const metric = JSON.parse(readFileSync(join(ROOT, 'src/data/generated/ghg.json'), 'utf8'));
    const dashMonths = metric.years['2568'].months.sort((a,b) => a.month-b.month);
    for (let i = 0; i < months.length; i++) {
      assert.equal(months[i].month, dashMonths[i].month);
      assert.equal(months[i].tCO2e, dashMonths[i].value);
    }
    assert.equal(metric.years['2568'].total, 231.23);
    assert.equal(Math.round((inv.totalTCO2e - metric.years['2568'].total) * 100) / 100, 0.39);
  });

  it('publishes no stale FY2567 performance verdict while the comparison basis is pending', () => {
    const perf = ghg.records.find((r) => r.kind === 'performance');
    assert.equal(perf.verification.status, 'pending');
    assert.equal(perf.status, 'pending-verification');
    assert.equal(perf.actualChangePct, null);
    assert.equal(perf.met, null);
    assert.doesNotMatch(JSON.stringify(perf), /4\.82/);
  });

  it('keeps every reconciliation disclosure explicit', () => {
    for (const code of ['ANOM-SUPERSEDED-UPDATE2','ANOM-OFFICIAL-VS-WORKBOOK-0.39','ANOM-NARRATIVE-221-65','ANOM-PER-CAPITA-BASIS']) {
      assert.ok(ghg.records.some((r) => r.kind === 'anomaly' && r.code === code), code);
    }
    const raw = JSON.stringify(ghg);
    for (const value of ['221.65','231.23','231.62','0.39','2.44','2438','2434']) assert.ok(raw.includes(value), `disclosure ${value}`);
    assert.ok(!raw.includes('undefined tCO2e/person'));
  });
});

describe('category1 selected historical invariants', () => {
  it('targets cover six official domains', () => assert.deepEqual(readContract('targets').records.map((r) => r.domain).sort(), ['electricity','fuel','general_waste','ghg','paper','water']));
  it('laws has 9 topics, 47 requirements and the explicit aspect mapping', () => {
    const laws = readContract('laws');
    assert.equal(laws.records.filter((r) => r.kind === 'legal-item').length, 9);
    assert.equal(laws.records.filter((r) => r.kind === 'legal-requirement').length, 47);
    const mapping = laws.records.find((r) => r.id === 'alm-ea79-lr32');
    assert.equal(mapping.aspectId, 'ea-79'); assert.equal(mapping.legalRequirementId, 'lr-3.2');
  });
  it('compliance has narrative evaluation and 47 register assessments', () => assert.equal(readContract('compliance').records.filter((r) => r.kind === 'legal-compliance-assessment').length, 47));
  it('management-review retains Meeting #1 quorum 20/23 = 86.96%', () => {
    const mr = readContract('management-review'); const q = mr.records.find((r) => r.kind === 'quorum');
    assert.equal(q.documented, true); assert.equal(q.meetingId, 'mr-meeting-1'); assert.equal(q.attendancePct, 86.96);
  });
});
