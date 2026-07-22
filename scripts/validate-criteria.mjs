import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function readJSON(relativePath) {
  const raw = readFileSync(resolve(ROOT, relativePath), 'utf-8');
  return JSON.parse(raw);
}

function main() {
  const errors = [];

  // ── 1. Load data ──────────────────────────────────────────
  let categories, issues, indicators;

  try {
    categories = readJSON('src/data/criteria/categories.json');
  } catch (e) {
    errors.push(`Cannot read categories.json: ${e.message}`);
  }
  try {
    issues = readJSON('src/data/criteria/issues.json');
  } catch (e) {
    errors.push(`Cannot read issues.json: ${e.message}`);
  }
  try {
    indicators = readJSON('src/data/criteria/indicators.json');
  } catch (e) {
    errors.push(`Cannot read indicators.json: ${e.message}`);
  }

  if (errors.length > 0) {
    console.log('FATAL: Could not load one or more JSON files.');
    errors.forEach(e => console.log(`  FAIL: ${e}`));
    process.exit(1);
  }

  const catList = categories.categories;
  const issueList = issues.issues;
  const indList = indicators.indicators;

  // ── 2. Count validation ───────────────────────────────────
  const expectedCats = 7;
  const expectedIssues = 24;
  // Canonical Green Office 2569: exactly 65 indicators (renewal/upgrade scope)
  const expectedInds = 65;

  if (catList.length !== expectedCats) {
    errors.push(`Category count: expected ${expectedCats}, got ${catList.length}`);
  }
  if (issueList.length !== expectedIssues) {
    errors.push(`Issue count: expected ${expectedIssues}, got ${issueList.length}`);
  }
  if (indList.length !== expectedInds) {
    errors.push(`Indicator count: expected ${expectedInds}, got ${indList.length}`);
  }

  // ── 3. Reference integrity ────────────────────────────────
  const catCodes = new Set(catList.map(c => c.code));
  const catIds = new Set(catList.map(c => c.id));
  const issueIds = new Set(issueList.map(i => i.id));

  // Validate every issue has valid categoryCode + categoryId
  for (const iss of issueList) {
    if (!catCodes.has(iss.categoryCode)) {
      errors.push(`Issue ${iss.id}: categoryCode "${iss.categoryCode}" not found in categories`);
    }
    if (!catIds.has(iss.categoryId)) {
      errors.push(`Issue ${iss.id}: categoryId "${iss.categoryId}" not found in categories`);
    }
  }

  // Validate every indicator has valid issueCode, categoryCode, categoryId
  for (const ind of indList) {
    if (!issueIds.has(ind.issueCode)) {
      errors.push(`Indicator ${ind.id}: issueCode "${ind.issueCode}" not found in issues`);
    }
    if (!catCodes.has(ind.categoryCode)) {
      errors.push(`Indicator ${ind.id}: categoryCode "${ind.categoryCode}" not found in categories`);
    }
    if (!catIds.has(ind.categoryId)) {
      errors.push(`Indicator ${ind.id}: categoryId "${ind.categoryId}" not found in categories`);
    }
  }

  // ── 4. Uniqueness ─────────────────────────────────────────
  const catCodeDups = findDuplicates(catList.map(c => c.code));
  const catIdDups = findDuplicates(catList.map(c => c.id));
  const issueCodeDups = findDuplicates(issueList.map(i => i.code));
  const issueIdDups = findDuplicates(issueList.map(i => i.id));
  const indCodeDups = findDuplicates(indList.map(i => i.code));
  const indIdDups = findDuplicates(indList.map(i => i.id));

  for (const [field, dups] of [
    ['Category code', catCodeDups],
    ['Category id', catIdDups],
    ['Issue code', issueCodeDups],
    ['Issue id', issueIdDups],
    ['Indicator code', indCodeDups],
    ['Indicator id', indIdDups],
  ]) {
    if (dups.length > 0) {
      errors.push(`${field} duplicates: ${dups.join(', ')}`);
    }
  }

  // ── 5. Required fields ────────────────────────────────────
  // Categories: th/en titles + summaries
  for (const cat of catList) {
    if (!cat.title?.th) errors.push(`Category ${cat.id}: missing title.th`);
    if (!cat.title?.en) errors.push(`Category ${cat.id}: missing title.en`);
    if (!cat.summary?.th) errors.push(`Category ${cat.id}: missing summary.th`);
    if (!cat.summary?.en) errors.push(`Category ${cat.id}: missing summary.en`);
    if (cat.id !== '7') {
      // Categories 1–6 must have numeric weight
      if (typeof cat.weight !== 'number') errors.push(`Category ${cat.id}: missing or invalid weight (must be a number)`);
    } else {
      // Category 7 uses separate assessment model
      if (cat.weight !== null) errors.push(`Category 7: weight must be null (separate assessment), got ${JSON.stringify(cat.weight)}`);
      if (!cat.scoringModel || cat.scoringModel.type !== 'separate') errors.push(`Category 7: missing or invalid scoringModel.type (expected "separate")`);
      if (!cat.scoringModel?.internalWeighting) errors.push(`Category 7: missing scoringModel.internalWeighting`);
      if (cat.scoringModel?.internalWeighting) {
        const iw = cat.scoringModel.internalWeighting;
        const expected = { '7.1': 40, '7.2': 60 };
        for (const [key, val] of Object.entries(expected)) {
          if (iw[key] !== val) errors.push(`Category 7 scoringModel: internalWeighting.${key} expected ${val}, got ${iw[key]}`);
        }
        const total = Object.values(iw).reduce((s, v) => s + v, 0);
        if (total !== 100) errors.push(`Category 7 scoringModel: internalWeighting sums to ${total}, expected 100`);
      }
    }
  }

  // Issues: th/en titles
  for (const iss of issueList) {
    if (!iss.title?.th) errors.push(`Issue ${iss.id}: missing title.th`);
    if (!iss.title?.en) errors.push(`Issue ${iss.id}: missing title.en`);
  }

  // Indicators: th/en titles + requirement summaries
  for (const ind of indList) {
    if (!ind.title?.th) errors.push(`Indicator ${ind.id}: missing title.th`);
    if (!ind.title?.en) errors.push(`Indicator ${ind.id}: missing title.en`);
    if (!ind.requirementSummary?.th) errors.push(`Indicator ${ind.id}: missing requirementSummary.th`);
    if (!ind.requirementSummary?.en) errors.push(`Indicator ${ind.id}: missing requirementSummary.en`);
    if (!Array.isArray(ind.relatedDashboards)) {
      errors.push(`Indicator ${ind.id}: relatedDashboards is not an array`);
    }
  }

  // ── 6. relatedDashboards valid values ─────────────────────
  const validDashboards = new Set(['energy', 'water', 'fuel', 'paper', 'waste', 'ghg']);
  for (const ind of indList) {
    for (const db of ind.relatedDashboards) {
      if (!validDashboards.has(db)) {
        errors.push(`Indicator ${ind.id}: invalid dashboard "${db}". Valid: ${[...validDashboards].join(', ')}`);
      }
    }
  }

  // ── 7. Verify specific dashboard tags ─────────────────────
  const expectedDashboardTags = {
    '1.5.1': ['ghg'],
    '1.5.2': ['ghg'],
    '1.5.3': ['ghg'],
    '1.6.1': ['ghg'],
    '1.6.2': ['ghg'],
    '3.1.2': ['water'],
    '3.2.2': ['energy'],
    '3.2.4': ['fuel'],
    '3.2.5': ['fuel'],
    '3.3.2': ['paper'],
    '4.1.2': ['waste'],
    '4.1.3': ['waste'],
  };

  for (const [id, expected] of Object.entries(expectedDashboardTags)) {
    const ind = indList.find(i => i.id === id);
    if (!ind) {
      errors.push(`Dashboard tag check: indicator ${id} not found`);
      continue;
    }
    const actual = JSON.stringify(ind.relatedDashboards.sort());
    const exp = JSON.stringify(expected.sort());
    if (actual !== exp) {
      errors.push(`Indicator ${id}: expected relatedDashboards ${exp}, got ${actual}`);
    }
  }

  // ── 8. Official scoring model ──────────────────────────────
  // Official Green Office 2569 weights for renewal/upgrade assessment.
  // Categories 1–6 have exact official weights. Category 7 is a separate
  // continuity assessment with its own internal 40/60 weighting.
  const officialWeights = {
    '1': 25, '2': 15, '3': 15,
    '4': 15, '5': 15, '6': 15,
  };

  const catWeights = {};
  const cat7entry = catList.find(c => c.id === '7');
  const weightPass = {};

  for (const cat of catList) {
    if (cat.id !== '7') {
      catWeights[cat.code] = cat.weight;
      const expected = officialWeights[cat.id];
      if (expected !== undefined) {
        if (cat.weight === expected) {
          weightPass[cat.code] = true;
        } else {
          weightPass[cat.code] = false;
          errors.push(`Category ${cat.id} (${cat.code}): official weight is ${expected}, got ${cat.weight}`);
        }
      }
    }
  }

  // Category 7 validation (separate assessment)
  if (cat7entry) {
    if (cat7entry.weight !== null) {
      errors.push(`Category 7: weight must be null (separate assessment), got ${JSON.stringify(cat7entry.weight)}`);
    }
    if (!cat7entry.scoringModel || cat7entry.scoringModel.type !== 'separate') {
      errors.push(`Category 7: must have scoringModel with type "separate"`);
    }
    if (cat7entry.scoringModel?.internalWeighting) {
      const iw = cat7entry.scoringModel.internalWeighting;
      if (iw['7.1'] !== 40) errors.push(`Category 7: internalWeighting.7.1 expected 40, got ${iw['7.1']}`);
      if (iw['7.2'] !== 60) errors.push(`Category 7: internalWeighting.7.2 expected 60, got ${iw['7.2']}`);
      const iwTotal = Object.values(iw).reduce((s, v) => s + v, 0);
      if (iwTotal !== 100) errors.push(`Category 7: internalWeighting sums to ${iwTotal}, expected 100`);
    }
  }

  // ── 9. Report ─────────────────────────────────────────────
  console.log('=== CRITERIA VALIDATION REPORT ===\n');
  console.log(`Categories: ${catList.length}`);
  console.log(`Issues: ${issueList.length}`);
  console.log(`Indicators: ${indList.length}\n`);

  console.log('Official Category Weights:');
  const weightOrder = ['cat1','cat2','cat3','cat4','cat5','cat6'];
  for (const code of weightOrder) {
    const status = weightPass[code] ? 'PASS' : 'FAIL';
    const cat = catList.find(c => c.code === code);
    console.log(`  ${code}: ${cat ? cat.weight : '?'} ${status}`);
  }

  console.log('');
  console.log('Category 7:');
  console.log('  separate assessment');
  if (cat7entry && cat7entry.scoringModel?.internalWeighting) {
    console.log(`  7.1: ${cat7entry.scoringModel.internalWeighting['7.1']}`);
    console.log(`  7.2: ${cat7entry.scoringModel.internalWeighting['7.2']}`);
  }
  console.log('');

  if (errors.length > 0) {
    console.log(`--- ${errors.length} FAILURE(S) ---`);
    errors.forEach(e => console.log(`  ✗  ${e}`));
    console.log('\nRESULT: FAIL');
    process.exit(1);
  } else {
    console.log('RESULT: PASS ✓');
    process.exit(0);
  }
}

function findDuplicates(arr) {
  const seen = new Set();
  const dups = new Set();
  for (const item of arr) {
    if (seen.has(item)) dups.add(item);
    seen.add(item);
  }
  return [...dups];
}

main();
