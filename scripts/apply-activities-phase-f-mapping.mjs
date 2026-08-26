#!/usr/bin/env node
/**
 * Apply Phase F historical indicator mappings to activities.json (relatedIndicators only).
 * Dry-run by default mindset: use --write to persist.
 */

import { writeJsonFile } from './lib/serialize-json.mjs';
import {
  applyPhaseFIndicatorMappings,
  loadActivitiesCollection,
  PHASE_F_MAPPINGS,
  summarizePhaseFCoverage,
} from './lib/activity-phase-f-mapping.mjs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ACTIVITIES_PATH = join(ROOT, 'src/data/content/activities.json');

const write = process.argv.includes('--write');

const collection = loadActivitiesCollection();
const before = JSON.stringify(collection.items.map((i) => ({ id: i.id, relatedIndicators: i.relatedIndicators })));

applyPhaseFIndicatorMappings(collection);

if (write) {
  writeJsonFile(ACTIVITIES_PATH, collection);
  console.log('Phase F indicator mappings written to activities.json');
} else {
  console.log('Dry-run — pass --write to persist');
}

const summary = summarizePhaseFCoverage();
console.log(JSON.stringify(summary, null, 2));

const changed = collection.items.filter((item) => {
  const row = PHASE_F_MAPPINGS.find((m) => m.id === item.id);
  return row && row.relatedIndicators.length > 0;
});
console.log(`Updated relatedIndicators on ${changed.length} activities`);

if (!write) {
  process.exit(0);
}

const after = JSON.stringify(collection.items.map((i) => ({ id: i.id, relatedIndicators: i.relatedIndicators })));
if (before === after && changed.length > 0) {
  console.error('Expected mutations but collection unchanged');
  process.exit(1);
}
