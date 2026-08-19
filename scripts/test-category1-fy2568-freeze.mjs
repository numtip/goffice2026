/**
 * test-category1-fy2568-freeze.mjs
 * Lightweight regression guard for CAT1 FY2568 frozen baseline authority.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FREEZE_DOC = join(ROOT, 'docs/releases/GOFFICE2026_CAT1_FY2568_FREEZE.md');
const MANIFEST_PATH = join(ROOT, 'src/data/category1/category1-manifest.json');
const CONTRACT_DIR = join(ROOT, 'src/data/category1');
const DOMAINS = [
  'activities-aspects',
  'laws',
  'compliance',
  'targets',
  'ghg',
  'projects',
  'management-review',
  'environmental-committee',
  'environmental-aspects-2568',
];

describe('CAT1 FY2568 freeze — authority document', () => {
  it('freeze contract exists with frozen baseline wording', () => {
    assert.ok(existsSync(FREEZE_DOC));
    const doc = readFileSync(FREEZE_DOC, 'utf8');
    assert.match(doc, /CAT1 FY2568 = FROZEN READ-ONLY BASELINE/);
    assert.match(doc, /18 \/ 18/);
    assert.match(doc, /16 \/ 18/);
    assert.match(doc, /1\.2\.2/);
    assert.match(doc, /1\.5\.3/);
    assert.match(doc, /ac1ecac/);
    assert.match(doc, /32273509983/);
    assert.match(doc, /Mutation policy/);
  });
});

describe('CAT1 FY2568 freeze — manifest authority', () => {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));

  it('manifest lists 9 frozen domains and freeze metadata', () => {
    assert.equal(manifest.contracts.length, 9);
    assert.equal(manifest.freeze?.status, 'FROZEN_READ_ONLY_BASELINE');
    assert.equal(manifest.freeze?.date, '2026-08-19');
    assert.match(manifest.freeze?.authorityDoc || '', /GOFFICE2026_CAT1_FY2568_FREEZE\.md/);
  });

  it('missingIndicators remain 1.2.2 and 1.5.3 as MISSING', () => {
    const missing = manifest.missingIndicators.map((x) => x.indicator).sort();
    assert.deepEqual(missing, ['1.2.2', '1.5.3']);
    for (const entry of manifest.missingIndicators) {
      assert.equal(entry.status, 'MISSING');
    }
  });

  it('all contract files are year 2568 with no FY2569 record year', () => {
    for (const domain of DOMAINS) {
      const c = JSON.parse(readFileSync(join(CONTRACT_DIR, `${domain}.json`), 'utf8'));
      assert.equal(c.year, 2568, `${domain} contract year must be 2568`);
      for (const rec of c.records) {
        assert.equal(rec.year, 2568, `${domain}/${rec.id} record year must be 2568`);
        assert.notEqual(rec.year, 2569, `${domain}/${rec.id} must not be FY2569`);
      }
    }
  });

  it('1.2.2 and 1.5.3 do not appear as completed records', () => {
    for (const domain of DOMAINS) {
      for (const rec of JSON.parse(readFileSync(join(CONTRACT_DIR, `${domain}.json`), 'utf8')).records) {
        assert.ok(!rec.indicatorCodes.includes('1.2.2'), `${domain}/${rec.id} must not claim 1.2.2`);
        assert.ok(!rec.indicatorCodes.includes('1.5.3'), `${domain}/${rec.id} must not claim 1.5.3`);
      }
    }
  });
});
