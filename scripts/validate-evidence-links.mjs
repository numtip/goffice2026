#!/usr/bin/env node

/**
 * validate-evidence-links.mjs
 * ============================
 * Metadata consistency check for the canonical cross-module link registry
 * (src/data/evidence-links.json), introduced by GO-EVIDENCE-1.
 *
 * Verifies every referenced id exists in its canonical source and that
 * reverse maps are bidirectional:
 *   - aboutPages.*            → must exist in src/data/about/pages.json
 *   - aboutPages.*.evidenceIds → must exist in src/data/evidence-index.json
 *   - aboutPages.*.dashboardIds → must be a known dashboard id
 *   - dashboards.*            → must be a known dashboard id
 *   - dashboards.*.aboutPageIds → must exist in src/data/about/pages.json
 *   - evidenceToAbout.*       → must exist in evidence-index.json and be
 *                               the exact reverse of aboutPages evidenceIds
 *
 * Usage: node scripts/validate-evidence-links.mjs
 * Exit code: 0 on full pass, 1 on any failure.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function readJson(rel) {
  return JSON.parse(readFileSync(resolve(ROOT, rel), 'utf8'));
}

const links = readJson('src/data/evidence-links.json');
const pages = readJson('src/data/about/pages.json').pages;
const evidence = readJson('src/data/evidence-index.json').items;
const VALID_DASHBOARDS = ['energy', 'water', 'fuel', 'paper', 'waste', 'ghg'];

const pageIds = new Set(pages.map((p) => p.id));
const evidenceIds = new Set(evidence.map((e) => e.id));
const dashIds = new Set(VALID_DASHBOARDS);

const errors = [];
const push = (msg) => errors.push(msg);

if (!links.aboutPages || !links.dashboards || !links.evidenceToAbout) {
  console.error('FATAL: evidence-links.json missing required sections (aboutPages / dashboards / evidenceToAbout)');
  process.exit(1);
}

// ── aboutPages ────────────────────────────────────────────────
const expectedReverse = {};
for (const [pageId, entry] of Object.entries(links.aboutPages)) {
  if (!pageIds.has(pageId)) {
    push(`aboutPages key "${pageId}" is not a known about page (pages.json)`);
    continue;
  }
  for (const evId of entry.evidenceIds || []) {
    if (!evidenceIds.has(evId)) push(`aboutPages.${pageId}.evidenceIds: "${evId}" not in evidence-index.json`);
    (expectedReverse[evId] = expectedReverse[evId] || []).push(pageId);
  }
  for (const dashId of entry.dashboardIds || []) {
    if (!dashIds.has(dashId)) push(`aboutPages.${pageId}.dashboardIds: "${dashId}" is not a known dashboard`);
  }
}

// ── dashboards ────────────────────────────────────────────────
for (const [dashId, entry] of Object.entries(links.dashboards)) {
  if (!dashIds.has(dashId)) push(`dashboards key "${dashId}" is not a known dashboard`);
  for (const pid of entry.aboutPageIds || []) {
    if (!pageIds.has(pid)) push(`dashboards.${dashId}.aboutPageIds: "${pid}" not in pages.json`);
  }
}

// ── evidenceToAbout (reverse-map symmetry) ────────────────────
for (const [evId, pageList] of Object.entries(links.evidenceToAbout)) {
  if (!evidenceIds.has(evId)) push(`evidenceToAbout key "${evId}" not in evidence-index.json`);
  const expected = (expectedReverse[evId] || []).slice().sort();
  const actual = pageList.slice().sort();
  const isSym =
    expected.length === actual.length &&
    expected.every((v, i) => v === actual[i]);
  if (!isSym) {
    push(
      `evidenceToAbout["${evId}"] = [${actual}] is not the exact reverse of aboutPages evidenceIds [${expected}]`,
    );
  }
}

// ── Report ────────────────────────────────────────────────────
console.log('========================================');
console.log('  EVIDENCE-LINKS METADATA VALIDATOR');
console.log('========================================');
console.log(`About pages referenced : ${Object.keys(links.aboutPages).length}`);
console.log(`Dashboards referenced  : ${Object.keys(links.dashboards).length}`);
console.log(`Evidence reverse links : ${Object.keys(links.evidenceToAbout).length}`);
if (errors.length > 0) {
  console.log('\nFAILURES:');
  for (const e of errors) console.log(`  ✗ ${e}`);
  console.log(`\nVALIDATION: FAIL (${errors.length} issue(s))`);
  process.exit(1);
}
console.log('\nVALIDATION: PASS ✓');
