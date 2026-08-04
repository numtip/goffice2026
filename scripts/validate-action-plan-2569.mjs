#!/usr/bin/env node
/**
 * validate-action-plan-2569.mjs — schema checks for generated action plan JSON
 * plus canonical-scope regression checks (GO-UX-5 follow-up):
 *   - a 7-category plan page must use the RENEWAL/UPGRADE scope wording
 *     (7 หมวด 24 ประเด็น 65 ตัวชี้วัด) and never the NEW-CERTIFICATION scope
 *     (6 หมวด 22 ประเด็น 63 ตัวชี้วัด);
 *   - category 7 must not be present under a new-certification description;
 *   - category titles must match the canonical titles in criteria/categories.json.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_PATH = join(ROOT, 'src/data/generated/action-plan-2569.json');
const PAGES_PATH = join(ROOT, 'src/data/about/pages.json');
const CRITERIA_PATH = join(ROOT, 'src/data/criteria/categories.json');
const INDICATORS_PATH = join(ROOT, 'src/data/criteria/indicators.json');

const VALID_CATEGORY_IDS = new Set(['cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5', 'cat-6', 'cat-7']);
const VALID_MONTH_IDS = new Set([
  'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
]);

// Canonical scope wording (authoritative — เกณฑ์การประเมินสำนักงานสีเขียว-ปี-2569.pdf)
const RENEWAL_TH = '7 หมวด 24 ประเด็น 65 ตัวชี้วัด';
const RENEWAL_EN = '7 categories, 24 issues and 65 indicators';
const NEW_CERT_RE = {
  th: /6\s*หมวด\s*22\s*ประเด็น\s*63\s*ตัวชี้วัด/,
  en: /6\s*categories\s*22\s*issues\s*63\s*indicators/i,
};

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

/**
 * Canonical-scope regression checks.
 * planData            — parsed action-plan-2569.json
 * pageMeta            — about/pages.json (must have about-action-plan entry)
 * criteria            — criteria/categories.json (canonical titles)
 * criteriaIndicators  — criteria/indicators.json .indicators (canonical counts)
 */
export function validateActionPlanScope(planData, pageMeta, criteria, criteriaIndicators) {
  const errors = [];
  const categories = planData?.categories ?? [];
  const page = pageMeta?.pages?.find((p) => p.id === 'about-action-plan');
  const descTh = page?.descriptionTh ?? '';
  const descEn = page?.descriptionEn ?? '';

  // A 7-category plan implies the renewal/upgrade assessment structure.
  if (categories.length === 7) {
    const hasRenewalTh = descTh.includes(RENEWAL_TH);
    const hasRenewalEn = descEn.includes(RENEWAL_EN);
    if (!hasRenewalTh || !hasRenewalEn) {
      errors.push(
        `about-action-plan description must state renewal/upgrade scope ` +
          `(${RENEWAL_TH} / ${RENEWAL_EN}). Got TH: "${descTh}" EN: "${descEn}"`,
      );
    }
  }

  // Never allow new-certification wording (6/22/63) on the action-plan page.
  if (NEW_CERT_RE.th.test(descTh) || NEW_CERT_RE.en.test(descEn)) {
    errors.push(
      `about-action-plan must NOT use new-certification wording (6 หมวด 22 ประเด็น 63 ตัวชี้วัด). ` +
        `TH: "${descTh}" EN: "${descEn}"`,
    );
  }

  // Category 7 must not appear under a new-certification (6-category) description.
  const hasCat7 = categories.some((c) => c.id === 'cat-7' || String(c.number) === '7');
  const descIsNewCert = NEW_CERT_RE.th.test(descTh) || NEW_CERT_RE.en.test(descEn);
  if (hasCat7 && descIsNewCert) {
    errors.push('category 7 present in action plan but page description claims new-certification scope (6/22/63)');
  }

  // Category titles must match canonical titles from criteria/categories.json.
  const canonicalById = new Map(criteria?.categories?.map((c) => [String(c.id), c.title?.th]) ?? []);
  for (const cat of categories) {
    const canonical = canonicalById.get(String(cat.number));
    if (canonical && cat.titleTh !== canonical) {
      errors.push(`category ${cat.id} title must be canonical "${canonical}", got "${cat.titleTh}"`);
    }
  }

  // indicatorCount per category must match canonical counts (65 total across 7).
  const canonicalIndicatorByCat = new Map(criteria?.categories?.map((c) => [String(c.id), 0]) ?? []);
  for (const ind of criteriaIndicators ?? []) {
    if (canonicalIndicatorByCat.has(String(ind.categoryId))) {
      canonicalIndicatorByCat.set(String(ind.categoryId), canonicalIndicatorByCat.get(String(ind.categoryId)) + 1);
    }
  }
  for (const cat of categories) {
    const canonical = canonicalIndicatorByCat.get(String(cat.number));
    if (canonical !== undefined && cat.indicatorCount !== canonical) {
      errors.push(
        `category ${cat.id} indicatorCount must be canonical ${canonical} (from criteria/indicators.json), got ${cat.indicatorCount}`,
      );
    }
  }
  const sumIndicators = categories.reduce((s, c) => s + (c.indicatorCount ?? 0), 0);
  if (sumIndicators !== 65) {
    errors.push(`sum of indicatorCount across 7 categories must be 65, got ${sumIndicators}`);
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
  const pageMeta = JSON.parse(readFileSync(PAGES_PATH, 'utf8'));
  const criteria = JSON.parse(readFileSync(CRITERIA_PATH, 'utf8'));
  const indicators = JSON.parse(readFileSync(INDICATORS_PATH, 'utf8')).indicators;
  const scopeErrors = validateActionPlanScope(data, pageMeta, criteria, indicators);
  if (scopeErrors.length) {
    console.error('action-plan-2569 canonical-scope validation FAIL');
    scopeErrors.forEach((e) => console.error('  ✗', e));
    process.exit(1);
  }
  console.log(
    `action-plan-2569 validation PASS (${data.summary.activityCount} activities, ${data.categories.length} categories, renewal scope 7/24/65)`,
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
