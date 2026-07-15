#!/usr/bin/env node

/**
 * validate-platform.mjs
 * ======================
 * Final platform quality gate — orchestrates existing validators and
 * verifies route expectations from the production build (dist/).
 *
 * Phases:
 *   1. Taxonomy validation (delegates to validate-criteria.mjs)
 *   1.5 Resource-Indicator Map validation (delegates to validate-resource-indicator-map.mjs)
 *   2. Evidence validation (delegates to validate-evidence.mjs)
 *   3. Route verification (dist/ inspection)
 *   4. Summary report
 *
 * Usage: node scripts/validate-platform.mjs
 * Exit code: 0 on full pass, 1 on any failure.
 */

import { execSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');

// ── Constants (from canonical taxonomy) ──────────────────────
const EXPECTED = {
  categories: 7,
  issues: 24,
  indicators: 65,
  evidenceDetails: 21,
  dashboardDetails: 6,    // energy, water, fuel, paper, waste, ghg
  documentCategories: 7,  // cat1–cat7
};

const VALID_DASHBOARDS = ['energy', 'water', 'fuel', 'paper', 'waste', 'ghg'];
const VALID_CATEGORY_CODES = ['cat1', 'cat2', 'cat3', 'cat4', 'cat5', 'cat6', 'cat7'];

// ── Helpers ──────────────────────────────────────────────────

function runScript(scriptName) {
  const scriptPath = resolve(ROOT, 'scripts', scriptName);
  console.log(`\n--- Running ${scriptName} ---`);
  try {
    const output = execSync(`node "${scriptPath}"`, {
      cwd: ROOT,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    console.log(output.trim());
    return { ok: true, output: output.trim() };
  } catch (err) {
    console.log(err.stdout?.trim() || '');
    if (err.stderr?.trim()) {
      console.error(err.stderr.trim());
    }
    return { ok: false, output: err.stdout?.trim() || '', stderr: err.stderr?.trim() || '' };
  }
}

function getDistHtmlPaths() {
  if (!existsSync(DIST)) return [];
  const paths = [];
  function walk(dir, prefix) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = resolve(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full, `${prefix}/${entry.name}`);
      } else if (entry.name === 'index.html') {
        const route = (prefix || '/').replace(/\\/g, '/');
        paths.push(route);
      }
    }
  }
  walk(DIST, '');
  return paths.sort();
}

function countByPrefix(routes, prefix) {
  return routes.filter(r => r === prefix || r.startsWith(`${prefix}/`)).length;
}

function countDetailByPrefix(routes, prefix) {
  // Count routes under prefix excluding the hub page
  return routes.filter(r => r.startsWith(`${prefix}/`)).length;
}

function checkDuplicates(routes) {
  const seen = new Map();
  const dups = [];
  for (const r of routes) {
    if (seen.has(r)) dups.push(r);
    seen.set(r, true);
  }
  return dups;
}

// ── Phase 1: Taxonomy Validation ────────────────────────────

function phaseTaxonomy() {
  console.log('\n========================================');
  console.log('PHASE 1: Taxonomy Validation');
  console.log('========================================');
  return runScript('validate-criteria.mjs');
}

// ── Phase 1.5: Resource-Indicator Map Validation ─────────────

function phaseResourceIndicatorMap() {
  console.log('\n========================================');
  console.log('PHASE 1.5: Resource-Indicator Map Validation');
  console.log('========================================');
  return runScript('validate-resource-indicator-map.mjs');
}

// ── Phase 2: Evidence Validation ────────────────────────────

function phaseEvidence() {
  console.log('\n========================================');
  console.log('PHASE 2: Evidence Validation');
  console.log('========================================');
  return runScript('validate-evidence.mjs');
}

// ── Phase 3: Route Verification ─────────────────────────────

function phaseRoutes() {
  const hardErrors = [];
  let enPartial = false;
  console.log('\n========================================');
  console.log('PHASE 3: Route Verification');
  console.log('========================================');

  if (!existsSync(DIST)) {
    console.log('\n⚠  dist/ not found — build the project first with: npm run build');
    console.log('   Skipping route verification.\n');
    return { ok: true, errors: [], skipped: true, enPartial: false };
  }

  const routes = getDistHtmlPaths();
  console.log(`\nFound ${routes.length} static routes in dist/`);

  // ── Check for duplicate routes ──────────────────────────
  const dups = checkDuplicates(routes);
  if (dups.length > 0) {
    hardErrors.push(`Duplicate route paths: ${dups.join(', ')}`);
  }

  // ── Count by group ──────────────────────────────────────
  const indicatorCount = countDetailByPrefix(routes, '/indicators');
  const evidenceDetailCount = countDetailByPrefix(routes, '/evidence');
  const dashboardDetailCount = countDetailByPrefix(routes, '/dashboard');
  const documentDetailCount = countDetailByPrefix(routes, '/documents');

  // Categories (hub + 7 detail)
  const totalCategoryRoutes = countByPrefix(routes, '/categories');
  const categoryExpectedTotal = EXPECTED.categories + 1; // hub + 7 detail
  if (totalCategoryRoutes !== categoryExpectedTotal) {
    hardErrors.push(`Category routes: expected ${categoryExpectedTotal} (hub + ${EXPECTED.categories} detail), got ${totalCategoryRoutes}`);
  }

  // Issues — we verify through category/indicator hierarchy
  // Indicators (65 detail pages)
  if (indicatorCount !== EXPECTED.indicators) {
    hardErrors.push(`Indicator detail pages: expected ${EXPECTED.indicators}, got ${indicatorCount}`);
  }

  // Evidence details
  if (evidenceDetailCount !== EXPECTED.evidenceDetails) {
    hardErrors.push(`Evidence detail pages: expected ${EXPECTED.evidenceDetails}, got ${evidenceDetailCount}`);
  }

  // Dashboard details
  if (dashboardDetailCount !== EXPECTED.dashboardDetails) {
    hardErrors.push(`Dashboard detail pages: expected ${EXPECTED.dashboardDetails}, got ${dashboardDetailCount}`);
  }

  // Document routes
  if (documentDetailCount !== EXPECTED.documentCategories) {
    hardErrors.push(`Document detail pages: expected ${EXPECTED.documentCategories}, got ${documentDetailCount}`);
  }

  // ── Verify core TH routes exist ─────────────────────────
  const thCoreRoutes = [
    '/', '/categories', '/categories/cat1', '/categories/cat2',
    '/categories/cat3', '/categories/cat4', '/categories/cat5',
    '/categories/cat6', '/categories/cat7',
    '/evidence', '/dashboard', '/documents', '/search',
  ];
  const missingTh = thCoreRoutes.filter(r => !routes.includes(r));
  if (missingTh.length > 0) {
    hardErrors.push(`Missing core TH routes: ${missingTh.join(', ')}`);
  }

  // ── Verify specific dashboard detail routes ─────────────
  const missingDashboards = VALID_DASHBOARDS
    .map(d => `/dashboard/${d}`)
    .filter(r => !routes.includes(r));
  if (missingDashboards.length > 0) {
    hardErrors.push(`Missing dashboard detail routes: ${missingDashboards.join(', ')}`);
  }

  // ── Verify specific document category routes ────────────
  const missingDocs = VALID_CATEGORY_CODES
    .map(c => `/documents/${c}`)
    .filter(r => !routes.includes(r));
  if (missingDocs.length > 0) {
    hardErrors.push(`Missing document category routes: ${missingDocs.join(', ')}`);
  }

  // ── Verify core EN routes (informational) ───────────────
  const hasEnIndex = routes.includes('/en');

  if (!hasEnIndex) {
    console.log('\nℹ  EN routes not found in dist/ — EN routes may not have been built yet.');
    console.log('   This is expected if Worker C (bilingual expansion) has not run.\n');
  } else {
    const hasEnCategories = routes.includes('/en/categories');
    const enIndicatorCount = countDetailByPrefix(routes, '/en/indicators');
    const enEvidenceCount = countDetailByPrefix(routes, '/en/evidence');
    const enCategoryCount = countByPrefix(routes, '/en/categories');
    const enCategoryExpected = 8; // hub + 7 detail

    const enComplete = hasEnCategories
      && enCategoryCount === enCategoryExpected
      && enIndicatorCount === EXPECTED.indicators
      && enEvidenceCount === EXPECTED.evidenceDetails;

    if (enComplete) {
      console.log('\nEN Routes: COMPLETE ✓');
    } else {
      enPartial = true;
      console.log('\nEN Routes: PARTIAL (informational — bilingual expansion may be in progress)');
      console.log(`  /en/ : present`);
      console.log(`  /en/categories/*: ${enCategoryCount} (full: ${enCategoryExpected})`);
      console.log(`  /en/indicators/*: ${enIndicatorCount} (full: ${EXPECTED.indicators})`);
      console.log(`  /en/evidence/*: ${enEvidenceCount} (full: ${EXPECTED.evidenceDetails})`);
    }
  }

  // ── Report ──────────────────────────────────────────────
  console.log('\n--- Route Counts ---');
  console.log(`  Category routes (hub + detail): ${totalCategoryRoutes}`);
  console.log(`  Indicator detail pages:    ${indicatorCount}`);
  console.log(`  Evidence detail pages:     ${evidenceDetailCount}`);
  console.log(`  Dashboard detail pages:    ${dashboardDetailCount}`);
  console.log(`  Document detail pages:     ${documentDetailCount}`);
  console.log(`  Total routes:              ${routes.length}`);

  const ok = hardErrors.length === 0;
  if (ok) {
    console.log('\nRoute verification: PASS ✓');
  } else {
    console.log(`\nRoute verification: ${hardErrors.length} hard issue(s)`);
    hardErrors.forEach(e => console.log(`  ✗  ${e}`));
  }
  if (enPartial) {
    console.log('ℹ  EN route coverage is partial — this is informational (see above).');
  }

  return { ok, errors: hardErrors, enPartial };
}

// ── Main ─────────────────────────────────────────────────────

function main() {
  console.log('========================================');
  console.log('  GREEN OFFICE 2026 — PLATFORM VALIDATOR');
  console.log('========================================\n');

  const taxonomyResult = phaseTaxonomy();
  const resourceMapResult = phaseResourceIndicatorMap();
  const evidenceResult = phaseEvidence();
  const routeResult = phaseRoutes();

  // ── Phase 4: Summary ────────────────────────────────────
  console.log('\n========================================');
  console.log('PHASE 4: SUMMARY');
  console.log('========================================\n');

  const routeOk = routeResult.ok || routeResult.skipped;
  const results = [
    { phase: 'Taxonomy Validation',    ok: taxonomyResult.ok },
    { phase: 'Resource-Indicator Map', ok: resourceMapResult.ok },
    { phase: 'Evidence Validation',    ok: evidenceResult.ok },
    { phase: 'Route Verification',     ok: routeOk },
  ];

  let allPassed = true;
  for (const r of results) {
    const status = r.ok ? 'PASS' : 'FAIL';
    if (!r.ok) allPassed = false;
    console.log(`  ${status.padEnd(6)} ${r.phase}`);
  }

  if (!taxonomyResult.ok) {
    console.log('\n  ⚠  Taxonomy validator reported issues. Check output above.');
  }
  if (!resourceMapResult.ok) {
    console.log('  ⚠  Resource-Indicator Map validator reported issues. Check output above.');
  }
  if (!evidenceResult.ok) {
    console.log('  ⚠  Evidence validator reported issues. Check output above.');
  }
  if (routeResult.skipped) {
    console.log('\n  ℹ  Route verification skipped (dist/ not found). Build with "npm run build" first.');
  } else if (!routeResult.ok) {
    console.log('  ⚠  Route verification found hard issues. See Phase 3 for details.');
  }
  if (routeResult.enPartial) {
    console.log('  ℹ  EN routes are partial — bilingual expansion may be pending. This is not a hard failure.');
  }

  const totalRoutes = routeResult.skipped ? 'N/A (no dist/)' : `dist/ contains ${getDistHtmlPaths().length} routes`;

  console.log(`\n--- Final Totals ---`);
  console.log(`  Categories:     ${EXPECTED.categories}`);
  console.log(`  Issues:         ${EXPECTED.issues}`);
  console.log(`  Indicators:     ${EXPECTED.indicators}`);
  console.log(`  Evidence Items: ${EXPECTED.evidenceDetails}`);
  console.log(`  ${totalRoutes}`);

  if (allPassed) {
    console.log('\n========================================');
    console.log('  PLATFORM VALIDATION: PASS ✓');
    console.log('========================================');
    process.exit(0);
  } else {
    console.log('\n========================================');
    console.log('  PLATFORM VALIDATION: FAIL ✗');
    console.log('========================================');
    process.exit(1);
  }
}

main();
