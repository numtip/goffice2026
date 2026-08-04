#!/usr/bin/env node
/**
 * validate-action-plan-2569.mjs — schema checks for generated action plan JSON
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_PATH = join(ROOT, 'src/data/generated/action-plan-2569.json');

const VALID_CATEGORY_IDS = new Set(['cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5', 'cat-6', 'cat-7']);
const VALID_MONTH_IDS = new Set([
  'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
]);

export function validateActionPlan2569(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return ['Root must be an object'];
  }
  if (data.fiscalYear !== 2569) {
    errors.push(`fiscalYear must be 2569, got ${data.fiscalYear}`);
  }
  if (!Array.isArray(data.categories) || data.categories.length !== 7) {
    errors.push(`expected 7 categories, got ${data.categories?.length ?? 0}`);
  }

  const seenActivityIds = new Set();

  for (const cat of data.categories ?? []) {
    if (!VALID_CATEGORY_IDS.has(cat.id)) {
      errors.push(`invalid category id: ${cat.id}`);
    }
    if (!cat.titleTh || typeof cat.titleTh !== 'string') {
      errors.push(`category ${cat.id} missing titleTh`);
    }
    if (!Array.isArray(cat.activities)) {
      errors.push(`category ${cat.id} activities must be array`);
      continue;
    }
    for (const act of cat.activities) {
      if (!act.id) errors.push(`activity missing id in ${cat.id}`);
      if (seenActivityIds.has(act.id)) errors.push(`duplicate activity id: ${act.id}`);
      seenActivityIds.add(act.id);
      if (!act.activityTh) errors.push(`${act.id}: missing activityTh`);
      if (act.taskNumber != null && typeof act.taskNumber !== 'string') {
        errors.push(`${act.id}: taskNumber must be string when present`);
      }
      for (const m of act.plannedMonths ?? []) {
        if (!VALID_MONTH_IDS.has(m)) errors.push(`${act.id}: invalid planned month ${m}`);
      }
      for (const entry of act.actualMonths ?? []) {
        if (!entry.monthId || !VALID_MONTH_IDS.has(entry.monthId)) {
          errors.push(`${act.id}: invalid actual month ${entry.monthId}`);
        }
        if (!entry.value) errors.push(`${act.id}: actual month missing value`);
      }
    }
  }

  return errors;
}

function main() {
  if (!existsSync(DATA_PATH)) {
    console.error('Missing generated data:', DATA_PATH);
    console.error('Run: node scripts/generate-action-plan-2569.mjs');
    process.exit(1);
  }
  const data = JSON.parse(readFileSync(DATA_PATH, 'utf8'));
  const errors = validateActionPlan2569(data);
  if (errors.length) {
    console.error('action-plan-2569 validation FAIL');
    errors.forEach((e) => console.error('  ✗', e));
    process.exit(1);
  }
  console.log(
    `action-plan-2569 validation PASS (${data.summary.activityCount} activities, ${data.categories.length} categories)`,
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
