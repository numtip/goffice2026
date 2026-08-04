import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateActionPlan2569 } from './validate-action-plan-2569.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'src/data/generated/action-plan-2569.json');
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
});
