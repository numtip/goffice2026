import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateActionPlan2569, validateActionPlanScope, validateActionPlanCat2Canonical, validateActionPlanCat3Canonical, validateActionPlanCat4Canonical, validateActionPlanCat5Canonical } from './validate-action-plan-2569.mjs';

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

  test('cat3 canonical indicator mapping matches the frozen C4 counts (6 activities)', () => {
    const data = JSON.parse(readFileSync(DATA, 'utf8'));
    const errors = validateActionPlanCat3Canonical(data);
    assert.deepEqual(errors, []);
    const cat3 = data.categories.find((c) => c.id === 'cat-3');
    assert.equal(cat3.activities.length, 6);
    const counts = {};
    for (const act of cat3.activities) {
      assert.ok(act.canonicalIndicatorCode, `${act.id} must carry canonicalIndicatorCode`);
      assert.ok(act.indicatorCode, `${act.id} must retain legacy indicatorCode`);
      assert.match(act.canonicalIndicatorCode, /^3\.\d+\.\d+$/, `${act.id} must map to a canonical 3.x.x code`);
      assert.deepEqual(act.actualMonths, [], `${act.id} must have no executed FY2569 actualMonths`);
      counts[act.canonicalIndicatorCode] = (counts[act.canonicalIndicatorCode] || 0) + 1;
    }
    assert.deepEqual(counts, { '3.1.1': 2, '3.1.2': 1, '3.2.1': 1, '3.2.2': 1, '3.4.1': 1 });
    // No activity may claim a data/compliance indicator with 0 activities.
    assert.equal(counts['3.2.5'], undefined, '3.2.5 must have 0 plan activities');
    assert.equal(counts['3.4.2'], undefined, '3.4.2 must have 0 plan activities');
  });

  test('cat3 canonical mapping guard trips when a mapping drifts', () => {
    const data = JSON.parse(readFileSync(DATA, 'utf8'));
    const clone = structuredClone(data);
    const cat3 = clone.categories.find((c) => c.id === 'cat-3');
    cat3.activities[0].canonicalIndicatorCode = '3.2.1'; // would make 3.2.1=2 / 3.1.1=1
    const errors = validateActionPlanCat3Canonical(clone);
    assert.ok(errors.some((e) => /3\.1\.1/.test(e)), 'must flag 3.1.1 count drift');
    assert.ok(errors.some((e) => /3\.2\.1/.test(e)), 'must flag 3.2.1 count drift');
  });

  test('cat4 canonical indicator mapping matches the frozen C4 counts (25 activities, 1 disclosed)', () => {
    const data = JSON.parse(readFileSync(DATA, 'utf8'));
    const errors = validateActionPlanCat4Canonical(data);
    assert.deepEqual(errors, []);
    const cat4 = data.categories.find((c) => c.id === 'cat-4');
    assert.equal(cat4.activities.length, 25);
    const counts = {};
    let disclosed = 0;
    for (const act of cat4.activities) {
      assert.ok(act.indicatorCode, `${act.id} must retain legacy indicatorCode`);
      assert.deepEqual(act.actualMonths, [], `${act.id} must have no executed FY2569 actualMonths`);
      if (act.canonicalIndicatorCode) {
        assert.match(act.canonicalIndicatorCode, /^4\.\d+\.\d+$/, `${act.id} must map to a canonical 4.x.x code`);
        counts[act.canonicalIndicatorCode] = (counts[act.canonicalIndicatorCode] || 0) + 1;
      } else {
        disclosed += 1;
        assert.equal(act.id, 'cat-4-4.1.3-16-16', 'only the 5S activity may be unmapped');
        assert.ok(/DISCLOSED/i.test(act.canonicalMappingNote || ''), 'disclosed activity must carry a DISCLOSED note');
      }
    }
    assert.deepEqual(counts, { '4.1.1': 5, '4.1.2': 8, '4.1.3': 3, '4.2.1': 4, '4.2.2': 4 });
    assert.equal(disclosed, 1, 'exactly one disclosed (unmapped) activity');
  });

  test('cat4 canonical mapping guard trips when a count drifts or the disclosure is removed', () => {
    const data = JSON.parse(readFileSync(DATA, 'utf8'));
    const clone = structuredClone(data);
    const cat4 = clone.categories.find((c) => c.id === 'cat-4');
    const bigClean = cat4.activities.find((a) => a.id === 'cat-4-4.1.3-17-17');
    bigClean.canonicalIndicatorCode = '4.1.3'; // would make 4.1.3=4 / 4.1.2=7
    const errors = validateActionPlanCat4Canonical(clone);
    assert.ok(errors.some((e) => /4\.1\.3/.test(e)), 'must flag 4.1.3 count drift');
    assert.ok(errors.some((e) => /4\.1\.2/.test(e)), 'must flag 4.1.2 count drift');

    const clone2 = structuredClone(data);
    const fiveS = clone2.categories.find((c) => c.id === 'cat-4').activities.find((a) => a.id === 'cat-4-4.1.3-16-16');
    delete fiveS.canonicalMappingNote;
    const errors2 = validateActionPlanCat4Canonical(clone2);
    assert.ok(errors2.some((e) => /DISCLOSED/i.test(e)), 'must flag a missing disclosure note');
  });

  test('cat5 canonical indicator mapping matches the frozen C4 counts (17 activities, 14 mapped, 3 disclosed)', () => {
    const data = JSON.parse(readFileSync(DATA, 'utf8'));
    const errors = validateActionPlanCat5Canonical(data);
    assert.deepEqual(errors, []);
    const cat5 = data.categories.find((c) => c.id === 'cat-5');
    assert.equal(cat5.activities.length, 17);
    const counts = {};
    const unmapped = [];
    for (const act of cat5.activities) {
      assert.ok(act.indicatorCode, `${act.id} must retain legacy indicatorCode`);
      assert.deepEqual(act.actualMonths, [], `${act.id} must have no executed FY2569 actualMonths`);
      if (act.canonicalIndicatorCode) {
        assert.match(act.canonicalIndicatorCode, /^5\.\d+\.\d+$/, `${act.id} must map to a canonical 5.x.x code`);
        counts[act.canonicalIndicatorCode] = (counts[act.canonicalIndicatorCode] || 0) + 1;
      } else {
        unmapped.push(act.id);
      }
    }
    // Criteria-based semantic mapping (GO-CAT5 Phase B correction).
    assert.deepEqual(counts, { '5.1.1': 5, '5.2.1': 1, '5.4.1': 1, '5.4.3': 4, '5.4.4': 1, '5.5.1': 1, '5.5.3': 1 });
    assert.equal(counts['5.4.2'], undefined, '5.4.2 must be disclosed at 0, never backfilled');
    assert.equal(counts['5.5.2'], undefined, '5.5.2 must be disclosed at 0, never backfilled');
    assert.deepEqual(
      [...unmapped].sort(),
      ['cat-5-5.15-5.15-16', 'cat-5-5.16-5.16-17', 'cat-5-5.5-5.5-6'],
      'only bookshelf/journal cleaning, work-result reporting and the Cat5 committee meeting may be unmapped',
    );
  });

  test('cat5 canonical mapping guard trips when a count drifts or a zero-disclosed indicator is backfilled', () => {
    const data = JSON.parse(readFileSync(DATA, 'utf8'));
    const clone = structuredClone(data);
    const cat5 = clone.categories.find((c) => c.id === 'cat-5');
    const carpet = cat5.activities.find((a) => a.id === 'cat-5-5.4-5.4-5');
    delete carpet.canonicalIndicatorCode; // would make 5.1.1=4
    const errors = validateActionPlanCat5Canonical(clone);
    assert.ok(errors.some((e) => /5\.1\.1/.test(e)), 'must flag 5.1.1 count drift');

    const clone2 = structuredClone(data);
    const clone2Cat5 = clone2.categories.find((c) => c.id === 'cat-5');
    const committee = clone2Cat5.activities.find((a) => a.id === 'cat-5-5.16-5.16-17');
    committee.canonicalIndicatorCode = '5.5.2'; // would backfill the disclosed zero-count 5.5.2
    const errors2 = validateActionPlanCat5Canonical(clone2);
    assert.ok(errors2.some((e) => /5\.5\.2/.test(e)), 'must flag 5.5.2 as invalid/zero-disclosed');
  });
});
