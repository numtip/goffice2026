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
 * Cat2 canonical-indicator mapping checks (GO-CAT2 C4).
 * Every cat2 activity must carry a canonicalIndicatorCode; the frozen mapping
 * counts must hold exactly: 2.1.1=8 · 2.2.1=1 · 2.2.2=9 · 2.2.4=2 · 2.1.2=0 · 2.2.3=0.
 * Legacy indicatorCode is retained. No activity may map to MISSING 2.2.3 or the
 * zero-activity 2.1.2 (2.1.2 is a forward committee-minutes requirement, not a plan activity).
 */
const CAT2_FROZEN_CANONICAL_COUNTS = {
  '2.1.1': 8,
  '2.1.2': 0,
  '2.2.1': 1,
  '2.2.2': 9,
  '2.2.3': 0,
  '2.2.4': 2,
};
const VALID_CAT2_CANONICAL = new Set(Object.keys(CAT2_FROZEN_CANONICAL_COUNTS));

export function validateActionPlanCat2Canonical(data) {
  const errors = [];
  const cat2 = (data?.categories ?? []).find((c) => c.id === 'cat-2');
  if (!cat2) return ['action-plan must contain cat-2'];
  if (!Array.isArray(cat2.activities)) return ['cat-2 activities must be array'];

  const counts = {};
  for (const act of cat2.activities) {
    const code = act.canonicalIndicatorCode;
    if (!code || typeof code !== 'string') {
      errors.push(`${act.id}: missing canonicalIndicatorCode`);
      continue;
    }
    if (!VALID_CAT2_CANONICAL.has(code)) {
      errors.push(`${act.id}: invalid canonicalIndicatorCode "${code}"`);
      continue;
    }
    if (code === '2.2.3') errors.push(`${act.id}: must never map to MISSING 2.2.3`);
    if (code === '2.1.2') errors.push(`${act.id}: 2.1.2 has 0 plan activities (forward committee-minutes requirement only)`);
    if (!act.indicatorCode) errors.push(`${act.id}: legacy indicatorCode must be retained`);
    counts[code] = (counts[code] ?? 0) + 1;
  }

  for (const [code, expected] of Object.entries(CAT2_FROZEN_CANONICAL_COUNTS)) {
    const actual = counts[code] ?? 0;
    if (actual !== expected) {
      errors.push(`cat2 canonicalIndicatorCode count for ${code} must be ${expected}, got ${actual}`);
    }
  }
  const total = Object.values(counts).reduce((s, n) => s + n, 0);
  if (total !== cat2.activities.length) {
    errors.push(`cat2 canonical mapping total must equal activity count ${cat2.activities.length}, got ${total}`);
  }
  return errors;
}

/**
 * Cat3 canonical-indicator mapping checks (GO-CAT3 C4).
 * Every cat3 activity must carry a canonicalIndicatorCode; the frozen mapping
 * counts must hold exactly: 3.1.1=2 · 3.2.1=1 · 3.2.2=1 · 3.1.2=1 · 3.4.1=1.
 * Legacy indicatorCode (3.1–3.6) is retained. Codes must be canonical 3.x.x
 * codes; no new activities and no FY2569 facts are introduced.
 */
const CAT3_FROZEN_CANONICAL_COUNTS = {
  '3.1.1': 2,
  '3.1.2': 1,
  '3.2.1': 1,
  '3.2.2': 1,
  '3.2.5': 0,
  '3.2.4': 0,
  '3.3.1': 0,
  '3.3.2': 0,
  '3.3.3': 0,
  '3.3.4': 0,
  '3.3.5': 0,
  '3.4.1': 1,
  '3.4.2': 0,
};
const VALID_CAT3_CANONICAL = new Set([
  '3.1.1', '3.1.2', '3.1.3',
  '3.2.1', '3.2.2', '3.2.3', '3.2.4', '3.2.5',
  '3.3.1', '3.3.2', '3.3.3', '3.3.4', '3.3.5',
  '3.4.1', '3.4.2',
]);

export function validateActionPlanCat3Canonical(data) {
  const errors = [];
  const cat3 = (data?.categories ?? []).find((c) => c.id === 'cat-3');
  if (!cat3) return ['action-plan must contain cat-3'];
  if (!Array.isArray(cat3.activities)) return ['cat-3 activities must be array'];
  if (cat3.activities.length !== 6) {
    errors.push(`cat-3 must have exactly 6 activities (no new activities added), got ${cat3.activities.length}`);
  }

  const counts = {};
  for (const act of cat3.activities) {
    const code = act.canonicalIndicatorCode;
    if (!code || typeof code !== 'string') {
      errors.push(`${act.id}: missing canonicalIndicatorCode`);
      continue;
    }
    if (!VALID_CAT3_CANONICAL.has(code)) {
      errors.push(`${act.id}: invalid canonicalIndicatorCode "${code}"`);
      continue;
    }
    if (!/^3\.\d+\.\d+$/.test(code)) {
      errors.push(`${act.id}: canonicalIndicatorCode must be a canonical 3.x.x code, got "${code}"`);
    }
    if (!act.indicatorCode) errors.push(`${act.id}: legacy indicatorCode must be retained`);
    if (act.actualMonths && act.actualMonths.length > 0) {
      errors.push(`${act.id}: FY2569 activity must not carry executed actualMonths (no FY2569 facts)`);
    }
    counts[code] = (counts[code] ?? 0) + 1;
  }

  for (const [code, expected] of Object.entries(CAT3_FROZEN_CANONICAL_COUNTS)) {
    const actual = counts[code] ?? 0;
    if (actual !== expected) {
      errors.push(`cat3 canonicalIndicatorCode count for ${code} must be ${expected}, got ${actual}`);
    }
  }
  const total = Object.values(counts).reduce((s, n) => s + n, 0);
  if (total !== cat3.activities.length) {
    errors.push(`cat3 canonical mapping total must equal activity count ${cat3.activities.length}, got ${total}`);
  }
  return errors;
}

/**
 * Cat4 canonical-indicator mapping checks (GO-CAT4 C4).
 * Every cat4 activity must either carry a canonicalIndicatorCode or be
 * explicitly disclosed as unmapped (5S). Frozen counts: 4.1.1=5 · 4.1.2=8 ·
 * 4.1.3=3 · 4.2.1=4 · 4.2.2=4 · disclosed=1 (total 25).
 * Legacy indicatorCode is retained. No activity may carry executed FY2569
 * actualMonths; the disclosed 5S activity must carry canonicalMappingNote.
 */
const CAT4_FROZEN_CANONICAL_COUNTS = {
  '4.1.1': 5,
  '4.1.2': 8,
  '4.1.3': 3,
  '4.2.1': 4,
  '4.2.2': 4,
};
const VALID_CAT4_CANONICAL = new Set([
  '4.1.1', '4.1.2', '4.1.3', '4.2.1', '4.2.2',
]);
const CAT4_DISCLOSED_ACTIVITY = 'cat-4-4.1.3-16-16';

export function validateActionPlanCat4Canonical(data) {
  const errors = [];
  const cat4 = (data?.categories ?? []).find((c) => c.id === 'cat-4');
  if (!cat4) return ['action-plan must contain cat-4'];
  if (!Array.isArray(cat4.activities)) return ['cat-4 activities must be array'];
  if (cat4.activities.length !== 25) {
    errors.push(`cat-4 must have exactly 25 activities (no new activities added), got ${cat4.activities.length}`);
  }

  const counts = {};
  let disclosedCount = 0;
  for (const act of cat4.activities) {
    if (!act.indicatorCode) errors.push(`${act.id}: legacy indicatorCode must be retained`);
    if (act.actualMonths && act.actualMonths.length > 0) {
      errors.push(`${act.id}: FY2569 activity must not carry executed actualMonths (no FY2569 facts)`);
    }
    const code = act.canonicalIndicatorCode;
    if (!code || typeof code !== 'string') {
      if (act.id === CAT4_DISCLOSED_ACTIVITY) {
        disclosedCount += 1;
        if (!act.canonicalMappingNote || !/DISCLOSED/i.test(act.canonicalMappingNote)) {
          errors.push(`${act.id}: disclosed activity must carry a canonicalMappingNote declaring the disclosure`);
        }
        continue;
      }
      errors.push(`${act.id}: missing canonicalIndicatorCode (only the disclosed 5S activity may be unmapped)`);
      continue;
    }
    if (!VALID_CAT4_CANONICAL.has(code)) {
      errors.push(`${act.id}: invalid canonicalIndicatorCode "${code}"`);
      continue;
    }
    if (!/^4\.\d+\.\d+$/.test(code)) {
      errors.push(`${act.id}: canonicalIndicatorCode must be a canonical 4.x.x code, got "${code}"`);
    }
    counts[code] = (counts[code] ?? 0) + 1;
  }

  for (const [code, expected] of Object.entries(CAT4_FROZEN_CANONICAL_COUNTS)) {
    const actual = counts[code] ?? 0;
    if (actual !== expected) {
      errors.push(`cat4 canonicalIndicatorCode count for ${code} must be ${expected}, got ${actual}`);
    }
  }
  if (disclosedCount !== 1) {
    errors.push(`cat4 must have exactly 1 disclosed (unmapped) activity (${CAT4_DISCLOSED_ACTIVITY}), got ${disclosedCount}`);
  }
  const total = Object.values(counts).reduce((s, n) => s + n, 0) + disclosedCount;
  if (total !== cat4.activities.length) {
    errors.push(`cat4 canonical mapping total must equal activity count ${cat4.activities.length}, got ${total}`);
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

/**
 * Cat5 canonical-indicator mapping checks (GO-CAT5 Phase B, semantic correction).
 * Every cat5 activity must either carry a canonicalIndicatorCode or be one of
 * the 3 disclosed unmapped activities. Frozen counts: 5.1.1=5 · 5.2.1=1 ·
 * 5.4.1=1 · 5.4.3=4 · 5.4.4=1 · 5.5.1=1 · 5.5.3=1 (14 mapped, 3 unmapped,
 * total 17). 5.4.2 and 5.5.2 are deliberately 0 — the space-utilization % and
 * the emergency-understanding % have no plan activity (disclosed FY2569 GAPs,
 * never backfilled). Legacy indicatorCode is retained. No activity may carry
 * executed FY2569 actualMonths.
 */
const CAT5_FROZEN_CANONICAL_COUNTS = {
  '5.1.1': 5,
  '5.2.1': 1,
  '5.4.1': 1,
  '5.4.3': 4,
  '5.4.4': 1,
  '5.5.1': 1,
  '5.5.3': 1,
};
// Disclosed zero-count indicators: no plan activity maps to these (FY2569
// measurement GAPs — never backfilled).
const CAT5_ZERO_DISCLOSED = ['5.4.2', '5.5.2'];
const VALID_CAT5_CANONICAL = new Set(Object.keys(CAT5_FROZEN_CANONICAL_COUNTS));
const CAT5_UNMAPPED_ACTIVITY_IDS = new Set([
  'cat-5-5.5-5.5-6', // bookshelf/journal cleaning — covered by 5.1.1 maintenance evidence; no single canonical indicator
  'cat-5-5.15-5.15-16', // work-result reporting — internal reporting, not a criteria activity
  'cat-5-5.16-5.16-17', // Cat5 committee meeting — governance, not a criteria activity
]);

export function validateActionPlanCat5Canonical(data) {
  const errors = [];
  const cat5 = (data?.categories ?? []).find((c) => c.id === 'cat-5');
  if (!cat5) return ['action-plan must contain cat-5'];
  if (!Array.isArray(cat5.activities)) return ['cat-5 activities must be array'];
  if (cat5.activities.length !== 17) {
    errors.push(`cat-5 must have exactly 17 activities (no new activities added), got ${cat5.activities.length}`);
  }

  const counts = {};
  let unmappedCount = 0;
  for (const act of cat5.activities) {
    if (!act.indicatorCode) errors.push(`${act.id}: legacy indicatorCode must be retained`);
    if (act.actualMonths && act.actualMonths.length > 0) {
      errors.push(`${act.id}: FY2569 activity must not carry executed actualMonths (no FY2569 facts)`);
    }
    const code = act.canonicalIndicatorCode;
    if (!code || typeof code !== 'string') {
      if (CAT5_UNMAPPED_ACTIVITY_IDS.has(act.id)) {
        unmappedCount += 1;
        continue;
      }
      errors.push(`${act.id}: missing canonicalIndicatorCode (only the 3 disclosed activities may be unmapped)`);
      continue;
    }
    if (!VALID_CAT5_CANONICAL.has(code)) {
      errors.push(`${act.id}: invalid canonicalIndicatorCode "${code}"`);
      continue;
    }
    if (!/^5\.\d+\.\d+$/.test(code)) {
      errors.push(`${act.id}: canonicalIndicatorCode must be a canonical 5.x.x code, got "${code}"`);
    }
    counts[code] = (counts[code] ?? 0) + 1;
  }

  for (const [code, expected] of Object.entries(CAT5_FROZEN_CANONICAL_COUNTS)) {
    const actual = counts[code] ?? 0;
    if (actual !== expected) {
      errors.push(`cat5 canonicalIndicatorCode count for ${code} must be ${expected}, got ${actual}`);
    }
  }
  for (const code of CAT5_ZERO_DISCLOSED) {
    if ((counts[code] ?? 0) !== 0) {
      errors.push(`cat5 canonicalIndicatorCode count for ${code} must be 0 (disclosed, never backfilled), got ${counts[code]}`);
    }
  }
  if (unmappedCount !== CAT5_UNMAPPED_ACTIVITY_IDS.size) {
    errors.push(`cat5 must have exactly ${CAT5_UNMAPPED_ACTIVITY_IDS.size} disclosed unmapped activities, got ${unmappedCount}`);
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
  const cat2Errors = validateActionPlanCat2Canonical(data);
  if (cat2Errors.length) {
    console.error('action-plan-2569 cat2 canonical mapping FAIL');
    cat2Errors.forEach((e) => console.error('  ✗', e));
    process.exit(1);
  }
  const cat3Errors = validateActionPlanCat3Canonical(data);
  if (cat3Errors.length) {
    console.error('action-plan-2569 cat3 canonical mapping FAIL');
    cat3Errors.forEach((e) => console.error('  ✗', e));
    process.exit(1);
  }
  const cat4Errors = validateActionPlanCat4Canonical(data);
  if (cat4Errors.length) {
    console.error('action-plan-2569 cat4 canonical mapping FAIL');
    cat4Errors.forEach((e) => console.error('  ✗', e));
    process.exit(1);
  }
  const cat5Errors = validateActionPlanCat5Canonical(data);
  if (cat5Errors.length) {
    console.error('action-plan-2569 cat5 canonical mapping FAIL');
    cat5Errors.forEach((e) => console.error('  ●', e));
    process.exit(1);
  }
  console.log(
    `action-plan-2569 validation PASS (${data.summary.activityCount} activities, ${data.categories.length} categories, renewal scope 7/24/65, cat2 canonical 2.1.1=8/2.2.1=1/2.2.2=9/2.2.4=2, cat3 canonical 3.1.1=2/3.1.2=1/3.2.1=1/3.2.2=1/3.4.1=1, cat4 canonical 4.1.1=5/4.1.2=8/4.1.3=3/4.2.1=4/4.2.2=4 + 1 disclosed, cat5 canonical 14 mapped + 3 disclosed)`,
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
