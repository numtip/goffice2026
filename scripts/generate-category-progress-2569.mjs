#!/usr/bin/env node
/**
 * generate-category-progress-2569.mjs — GOFFICE2026 D1/D2 progress generator
 * ==========================================================================
 * Aggregates the canonical FY2569 indicator-progress registry
 * (src/data/progress/indicator-progress-2569.json) into the read-only runtime
 * dataset src/data/generated/category-progress-2569.json (blueprint §9).
 *
 * Deterministic + idempotent: the output depends only on the registry and the
 * canonical criteria taxonomy, so regenerating with unchanged input is a no-op
 * (git-clean). Counts always derive from indicator records — never averaged
 * from category percentages (blueprint §7.3).
 *
 * Usage: node scripts/generate-category-progress-2569.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  computeAggregation,
  SCHEMA_VERSION,
  EXPECTED_YEAR,
} from './validate-progress-contract.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const REGISTRY_PATH = join(ROOT, 'src/data/progress/indicator-progress-2569.json');
const GENERATED_PATH = join(ROOT, 'src/data/generated/category-progress-2569.json');
const INDICATORS_PATH = join(ROOT, 'src/data/criteria/indicators.json');
const CATEGORIES_PATH = join(ROOT, 'src/data/criteria/categories.json');

function main() {
  if (!existsSync(REGISTRY_PATH)) {
    console.error('Missing registry:', REGISTRY_PATH);
    console.error('Expected: src/data/progress/indicator-progress-2569.json (canonical source, D1 baseline).');
    process.exit(1);
  }
  const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8'));
  const indicators = JSON.parse(readFileSync(INDICATORS_PATH, 'utf8')).indicators;
  const categories = JSON.parse(readFileSync(CATEGORIES_PATH, 'utf8')).categories;

  const { overall, categories: cats } = computeAggregation(registry, indicators, categories);
  const output = {
    schemaVersion: SCHEMA_VERSION,
    year: EXPECTED_YEAR,
    // Stable: mirrors the registry's data date so output is reproducible.
    generatedAt: registry.updated ?? new Date().toISOString().slice(0, 10),
    overall,
    categories: cats,
  };

  writeFileSync(GENERATED_PATH, JSON.stringify(output, null, 2) + '\n', 'utf8');

  console.log(`category-progress-2569 generated: ${registry.items.length} indicators → 7 categories`);
  console.log(
    `overall: ready=${overall.ready} inProgress=${overall.inProgress} notStarted=${overall.notStarted} ` +
      `unavailable=${overall.unavailable} notApplicable=${overall.notApplicable} readyRate=${overall.readyRate}%`,
  );
  for (const c of cats) {
    console.log(
      `  cat ${c.id} (${c.code}): total=${c.total} ready=${c.ready} inProgress=${c.inProgress} ` +
        `notStarted=${c.notStarted} unavailable=${c.unavailable} notApplicable=${c.notApplicable} readyRate=${c.readyRate}%`,
    );
  }
}

main();
