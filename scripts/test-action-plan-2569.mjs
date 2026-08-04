import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateActionPlan2569, validateActionPlanScope } from './validate-action-plan-2569.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'src/data/generated/action-plan-2569.json');
const PAGES = join(ROOT, 'src/data/about/pages.json');
const CRITERIA = join(ROOT, 'src/data/criteria/categories.json');
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
    assert.equal(data.categories.length, 7);
    const errors = validateActionPlanScope(data, pages, criteria);
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
    const errors = validateActionPlanScope(data, badPages, criteria);
    assert.ok(errors.some((e) => /new-certification/i.test(e)));
    assert.ok(errors.some((e) => /category 7/.test(e)));
  });

  test('category titles match canonical criteria titles', () => {
    const data = JSON.parse(readFileSync(DATA, 'utf8'));
    const pages = JSON.parse(readFileSync(PAGES, 'utf8'));
    const criteria = JSON.parse(readFileSync(CRITERIA, 'utf8'));
    const canonicalById = new Map(criteria.categories.map((c) => [String(c.id), c.title.th]));
    for (const cat of data.categories) {
      assert.equal(cat.titleTh, canonicalById.get(String(cat.number)), `cat ${cat.number} must be canonical`);
    }
  });
});
