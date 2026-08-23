import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateActionPlan2569, validateActionPlanScope, validateActionPlanCat2Canonical } from './validate-action-plan-2569.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'src/data/generated/action-plan-2569.json');
const PAGES = join(ROOT, 'src/data/about/pages.json');
const CRITERIA = join(ROOT, 'src/data/criteria/categories.json');
const INDICATORS = join(ROOT, 'src/data/criteria/indicators.json');
const PUBLIC_XLSX = join(ROOT, 'public/documents/about/2569/green-office-action-plan-2569.xlsx');

describe('action-plan-2569 generated data', () => {
  test('JSON exists and validates', () => {
    assert.ok(existsSync(DATA));
    const data = JSON.parse(readFileSync(DATA, 'utf8'));
    const errors = validateActionPlan2569(data);
    assert.deepEqual(errors, []);
    assert.equal(data.categories.length, 7);
    assert.ok(data.summary.activityCount > 0);
  });

  test('public workbook copy exists', () => {
    assert.ok(existsSync(PUBLIC_XLSX));
  });

  test('7-category plan page uses RENEWAL scope, never new-certification 6/22/63', () => {
    const data = JSON.parse(readFileSync(DATA, 'utf8'));
    const pages = JSON.parse(readFileSync(PAGES, 'utf8'));
    const criteria = JSON.parse(readFileSync(CRITERIA, 'utf8'));
    const indicators = JSON.parse(readFileSync(INDICATORS, 'utf8')).indicators;
    assert.equal(data.categories.length, 7);
    const errors = validateActionPlanScope(data, pages, criteria, indicators);
    assert.deepEqual(errors, []);

    const page = pages.pages.find((p) => p.id === 'about-action-plan');
    assert.ok(page.descriptionTh.includes('7 หมวด 24 ประเด็น 65 ตัวชี้วัด'));
    assert.ok(page.descriptionEn.includes('7 categories, 24 issues and 65 indicators'));
    assert.doesNotMatch(page.descriptionTh, /6\s*หมวด\s*22\s*ประเด็น\s*63\s*ตัวชี้วัด/);
    assert.doesNotMatch(page.descriptionEn, /6\s*categories\s*22\s*issues\s*63\s*indicators/i);
  });

  test('category 7 present but description must not claim new certification', () => {
    const data = JSON.parse(readFileSync(DATA, 'utf8'));
    const pages = JSON.parse(readFileSync(PAGES, 'utf8'));
    const criteria = JSON.parse(readFileSync(CRITERIA, 'utf8'));
    const indicators = JSON.parse(readFileSync(INDICATORS, 'utf8')).indicators;
    const hasCat7 = data.categories.some((c) => String(c.number) === '7');
    assert.ok(hasCat7);
    // Inject a new-certification description and confirm the guard trips.
    const badPages = {
      ...pages,
      pages: pages.pages.map((p) =>
        p.id === 'about-action-plan'
          ? { ...p, descriptionTh: '6 หมวด 22 ประเด็น 63 ตัวชี้วัด', descriptionEn: '6 categories, 22 issues and 63 indicators' }
          : p,
      ),
    };
    const errors = validateActionPlanScope(data, badPages, criteria, indicators);
    assert.ok(errors.some((e) => /new-certification/i.test(e)));
    assert.ok(errors.some((e) => /category 7/.test(e)));
  });

  test('category titles match canonical criteria titles', () => {
    const data = JSON.parse(readFileSync(DATA, 'utf8'));
    const criteria = JSON.parse(readFileSync(CRITERIA, 'utf8'));
    const canonicalById = new Map(criteria.categories.map((c) => [String(c.id), c.title.th]));
    for (const cat of data.categories) {
      assert.equal(cat.titleTh, canonicalById.get(String(cat.number)), `cat ${cat.number} must be canonical`);
    }
  });

  test('category indicatorCount matches canonical criteria (sum 65)', () => {
    const data = JSON.parse(readFileSync(DATA, 'utf8'));
    const pages = JSON.parse(readFileSync(PAGES, 'utf8'));
    const criteria = JSON.parse(readFileSync(CRITERIA, 'utf8'));
    const indicators = JSON.parse(readFileSync(INDICATORS, 'utf8')).indicators;
    const canonicalByCat = new Map(criteria.categories.map((c) => [String(c.id), 0]));
    for (const ind of indicators) {
      canonicalByCat.set(String(ind.categoryId), canonicalByCat.get(String(ind.categoryId)) + 1);
    }
    let sum = 0;
    for (const cat of data.categories) {
      assert.equal(cat.indicatorCount, canonicalByCat.get(String(cat.number)), `cat ${cat.number} indicatorCount`);
      sum += cat.indicatorCount;
    }
    assert.equal(sum, 65, 'total indicators across 7 categories must be 65');
    // Full scope validation must still pass with the canonical counts.
    const errors = validateActionPlanScope(data, pages, criteria, indicators);
    assert.deepEqual(errors, []);
  });

  test('cat2 canonical indicator mapping matches the frozen C4 counts', () => {
    const data = JSON.parse(readFileSync(DATA, 'utf8'));
    const errors = validateActionPlanCat2Canonical(data);
    assert.deepEqual(errors, []);
    const cat2 = data.categories.find((c) => c.id === 'cat-2');
    assert.equal(cat2.activities.length, 20);
    const counts = {};
    for (const act of cat2.activities) {
      assert.ok(act.canonicalIndicatorCode, `${act.id} must carry canonicalIndicatorCode`);
      assert.ok(act.indicatorCode, `${act.id} must retain legacy indicatorCode`);
      counts[act.canonicalIndicatorCode] = (counts[act.canonicalIndicatorCode] || 0) + 1;
    }
    assert.deepEqual(counts, { '2.1.1': 8, '2.2.1': 1, '2.2.2': 9, '2.2.4': 2 });
    assert.equal(counts['2.1.2'], undefined, '2.1.2 must have 0 plan activities');
    assert.equal(counts['2.2.3'], undefined, '2.2.3 must have 0 plan activities');
    // Legacy codes must not be canonical codes for the 2.3–2.7 series.
    const legacy223 = cat2.activities.filter((a) => a.canonicalIndicatorCode === '2.2.3');
    assert.equal(legacy223.length, 0);
  });

  test('cat2 canonical mapping guard trips when a count drifts', () => {
    const data = JSON.parse(readFileSync(DATA, 'utf8'));
    const clone = structuredClone(data);
    const cat2 = clone.categories.find((c) => c.id === 'cat-2');
    const act = cat2.activities.find((a) => a.id === 'cat-2-2.1-2.1-1');
    act.canonicalIndicatorCode = '2.1.1'; // would make 2.1.1=9 / 2.2.1=0
    const errors = validateActionPlanCat2Canonical(clone);
    assert.ok(errors.some((e) => /2\.2\.1/.test(e)), 'must flag 2.2.1 count drift');
    assert.ok(errors.some((e) => /2\.1\.1/.test(e)), 'must flag 2.1.1 count drift');
  });
});
