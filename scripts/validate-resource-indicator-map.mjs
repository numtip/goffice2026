#!/usr/bin/env node

/**
 * validate-resource-indicator-map.mjs
 * ====================================
 * Validates src/data/resource-indicator-map.json against:
 *   - Canonical indicators (src/data/criteria/indicators.json)
 *   - Dashboard configuration (hardcoded valid IDs matched to dashboard-config.ts)
 *   - Hierarchical integrity (indicator → issue → category)
 *   - Duplicate detection
 *
 * Usage: node scripts/validate-resource-indicator-map.mjs
 * Exit code: 0 on pass, 1 on any failure.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── Valid dashboard IDs (must match dashboard-config.ts) ────
const VALID_DASHBOARD_IDS = ['energy', 'water', 'fuel', 'paper', 'waste', 'ghg'];

// ── Load data ────────────────────────────────────────────────

function loadJSON(filepath) {
  return JSON.parse(readFileSync(filepath, 'utf-8'));
}

const resourceMap = loadJSON(resolve(ROOT, 'src/data/resource-indicator-map.json'));
const indicatorsData = loadJSON(resolve(ROOT, 'src/data/criteria/indicators.json'));

// Build lookup
const indicatorMap = new Map();
for (const ind of indicatorsData.indicators) {
  indicatorMap.set(ind.code, ind);
}

// ── Track results ────────────────────────────────────────────

const errors = [];
const warnings = [];

function fail(msg) { errors.push(msg); }
function warn(msg) { warnings.push(msg); }

// ── Phase 1: Structural validity ─────────────────────────────

function phaseStructure() {
  console.log('\nPhase 1: Structural validity');
  if (!resourceMap.mappings || !Array.isArray(resourceMap.mappings)) {
    fail('resource-indicator-map.json: missing or invalid "mappings" array');
    return;
  }
  if (resourceMap.mappings.length === 0) {
    fail('resource-indicator-map.json: empty "mappings" array');
    return;
  }
  if (typeof resourceMap.version !== 'string') {
    warn('resource-indicator-map.json: missing "version" field');
  }
  if (typeof resourceMap.totalResourceDomains !== 'number') {
    warn('resource-indicator-map.json: missing "totalResourceDomains" field');
  } else if (resourceMap.totalResourceDomains !== resourceMap.mappings.length) {
    fail(`totalResourceDomains (${resourceMap.totalResourceDomains}) does not match mappings array length (${resourceMap.mappings.length})`);
  }

  // Check for duplicate resourceDomain
  const domainSet = new Set();
  for (const m of resourceMap.mappings) {
    if (domainSet.has(m.resourceDomain)) {
      fail(`Duplicate resourceDomain: "${m.resourceDomain}"`);
    }
    domainSet.add(m.resourceDomain);
  }

  // Check for duplicate dashboardId
  const dashSet = new Set();
  for (const m of resourceMap.mappings) {
    if (dashSet.has(m.dashboardId)) {
      fail(`Duplicate dashboardId: "${m.dashboardId}"`);
    }
    dashSet.add(m.dashboardId);
  }

  console.log('  PASS ✓');
}

// ── Phase 2: Resource → dashboardId validity ─────────────────

function phaseDashboards() {
  console.log('\nPhase 2: Dashboard ID validity');
  let allOk = true;
  for (const m of resourceMap.mappings) {
    if (!m.dashboardId) {
      fail(`resourceDomain "${m.resourceDomain}": missing dashboardId`);
      allOk = false;
      continue;
    }
    if (!VALID_DASHBOARD_IDS.includes(m.dashboardId)) {
      fail(`resourceDomain "${m.resourceDomain}": dashboardId "${m.dashboardId}" is not a valid dashboard ID. Valid IDs: ${VALID_DASHBOARD_IDS.join(', ')}`);
      allOk = false;
    }
    if (!m.primaryCategory) {
      fail(`resourceDomain "${m.resourceDomain}": missing primaryCategory`);
      allOk = false;
    }
  }
  if (allOk) {
    console.log('  PASS ✓');
  }
}

// ── Phase 3: Indicator-level validation ──────────────────────

function phaseIndicators() {
  console.log('\nPhase 3: Indicator code and hierarchy validation');
  let allOk = true;

  for (const m of resourceMap.mappings) {
    if (!m.mappedIndicators || !Array.isArray(m.mappedIndicators) || m.mappedIndicators.length === 0) {
      fail(`resourceDomain "${m.resourceDomain}": no mapped indicators`);
      allOk = false;
      continue;
    }

    const domainCodes = new Set();
    for (const mi of m.mappedIndicators) {
      if (!mi.code) {
        fail(`resourceDomain "${m.resourceDomain}": mapped indicator missing "code"`);
        allOk = false;
        continue;
      }

      // Check for duplicate indicator codes within the same domain
      if (domainCodes.has(mi.code)) {
        fail(`resourceDomain "${m.resourceDomain}": duplicate mapped indicator code "${mi.code}"`);
        allOk = false;
      }
      domainCodes.add(mi.code);

      // Does the indicator exist?
      const canonical = indicatorMap.get(mi.code);
      if (!canonical) {
        fail(`resourceDomain "${m.resourceDomain}" → indicator "${mi.code}": INVALID — does not exist in canonical indicators.json`);
        allOk = false;
        continue;
      }

      // Does the category match?
      if (m.primaryCategory && canonical.categoryCode !== m.primaryCategory) {
        fail(`resourceDomain "${m.resourceDomain}" → indicator "${mi.code}": category mismatch. Resource says "cat${m.primaryCategory}", indicator actually belongs to "${canonical.categoryCode}" (category ${canonical.categoryId})`);
        allOk = false;
      }

      // Does the issue match (if provided)?
      if (mi.issueCode && canonical.issueCode !== mi.issueCode) {
        fail(`resourceDomain "${m.resourceDomain}" → indicator "${mi.code}": issue mismatch. Mapping says "${mi.issueCode}", indicator actually belongs to "${canonical.issueCode}"`);
        allOk = false;
      }

      // Does the canonical title match the mapping title?
      if (mi.canonicalTitle && mi.canonicalTitle !== canonical.title.th) {
        warn(`resourceDomain "${m.resourceDomain}" → indicator "${mi.code}": canonicalTitle does not match indicators.json. Mapping: "${mi.canonicalTitle.substring(0, 60)}..." vs canonical: "${canonical.title.th.substring(0, 60)}..."`);
      }

      // Does relatedDashboard match?
      const hasDashboard = (canonical.relatedDashboards || []).includes(m.dashboardId);
      if (mi.relatedDashboardMatch !== undefined) {
        if (mi.relatedDashboardMatch !== hasDashboard) {
          fail(`resourceDomain "${m.resourceDomain}" → indicator "${mi.code}": relatedDashboardMatch claims ${mi.relatedDashboardMatch} but canonical relatedDashboards ${hasDashboard ? 'includes' : 'does not include'} "${m.dashboardId}". Canonical: [${(canonical.relatedDashboards || []).join(', ')}]`);
          allOk = false;
        }
      }

      console.log(`  ${mi.code} → EXISTS ✓ (cat: ${canonical.categoryCode}, issue: ${canonical.issueCode}, rd: [${(canonical.relatedDashboards || []).join(', ')}])`);
    }
  }

  if (allOk) {
    console.log('  PASS ✓');
  }
}

// ── Phase 4: Count integrity ─────────────────────────────────

function phaseCounts() {
  console.log('\nPhase 4: Count integrity');
  let totalMapped = 0;
  for (const m of resourceMap.mappings) {
    totalMapped += (m.mappedIndicators || []).length;
  }
  if (resourceMap.totalMappedIndicators !== totalMapped) {
    fail(`totalMappedIndicators (${resourceMap.totalMappedIndicators}) does not match actual count (${totalMapped})`);
  }
  console.log(`  Resource domains: ${resourceMap.mappings.length}`);
  console.log(`  Total mapped indicators: ${totalMapped}`);
  console.log('  PASS ✓');
}

// ── Main ─────────────────────────────────────────────────────

function main() {
  console.log('========================================');
  console.log('  RESOURCE-INDICATOR MAP VALIDATOR');
  console.log('========================================');

  phaseStructure();
  phaseDashboards();
  phaseIndicators();
  phaseCounts();

  // ── Summary ─────────────────────────────────────────────
  console.log('\n========================================');
  console.log('  SUMMARY');
  console.log('========================================\n');

  if (warnings.length > 0) {
    console.log(`Warnings (${warnings.length}):`);
    warnings.forEach(w => console.log(`  ⚠  ${w}`));
  }

  if (errors.length > 0) {
    console.log(`\nErrors (${errors.length}):`);
    errors.forEach(e => console.log(`  ✗  ${e}`));
    console.log('\nVALIDATION: FAIL ✗');
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.log('\nVALIDATION: PASS WITH WARNINGS ⚠');
  } else {
    console.log('\nVALIDATION: PASS ✓');
  }
  process.exit(0);
}

main();
