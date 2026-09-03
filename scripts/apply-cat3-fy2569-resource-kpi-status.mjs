/**
 * apply-cat3-fy2569-resource-kpi-status.mjs
 * =========================================
 * Align Cat3 resource-KPI indicators with already-published dashboard
 * generated JSON (same pattern as 1.5.1/1.5.2 → ghg.json).
 *
 * Not ready. Not official scores. Fuel values are not modified.
 * Cat4–Cat7 stay unavailable (no FY2569 category evidence files).
 *
 * Changes:
 *   3.1.2 water  → in_progress / available_unverified (8/12 months)
 *   3.2.2 energy → in_progress / available_unverified (8/12 months)
 *   3.2.5 fuel   → in_progress / available_unverified (7/12; unverified)
 *   3.3.2 paper  → in_progress / available_unverified (7/12 months)
 */
import { readFileSync, writeFileSync } from 'node:fs';

const PROGRESS_JSON = new URL('../src/data/progress/indicator-progress-2569.json', import.meta.url);
const DATA = JSON.parse(readFileSync(PROGRESS_JSON, 'utf8'));

function find(code) {
  const item = DATA.items.find((i) => i.indicator === code);
  if (!item) throw new Error(`Missing ${code}`);
  return item;
}

function applyKpi(code, { ref, notes }) {
  const item = find(code);
  item.progressStatus = 'in_progress';
  item.evidenceStatus = 'available_unverified';
  item.updatedAt = '2026-09-03';
  item.owner = 'หมวด 3';
  item.source = { type: 'repository', ref };
  item.notes = notes;
  console.log(`✓ ${code} → in_progress / available_unverified (${ref})`);
}

applyKpi('3.1.2', {
  ref: 'src/data/generated/water.json',
  notes:
    'FY2569 water KPI sourced from canonical workbook 1.1Water.xlsx (same as dashboard /dashboard/water/). Coverage: 8 of 12 months (Jan–Aug), datasetState PUBLISHABLE_PARTIAL, verification available_unverified. Partial consumption series only — not per-unit vs target completion, not an official score.',
});

applyKpi('3.2.2', {
  ref: 'src/data/generated/energy.json',
  notes:
    'FY2569 electricity KPI sourced from canonical workbook 1.2electric.xlsx (same as dashboard /dashboard/energy/). Coverage: 8 of 12 months (Jan–Aug), datasetState PUBLISHABLE_PARTIAL, verification available_unverified. Partial consumption series only — not per-unit vs target completion, not an official score.',
});

applyKpi('3.2.5', {
  ref: 'src/data/generated/fuel.json',
  notes:
    'FY2569 fuel KPI sourced from canonical workbook 1.3Gassolene.xlsx (same as dashboard /dashboard/fuel/). Coverage: 7 of 12 months (Jan–Jul), datasetState PUBLISHABLE_PARTIAL. Fuel values UNCHANGED. FUEL_SOURCE_RECONCILIATION_REQUIRED — available_unverified; do not treat as verified. Not per-distance vs target completion, not an official score.',
});

applyKpi('3.3.2', {
  ref: 'src/data/generated/paper.json',
  notes:
    'FY2569 paper KPI sourced from canonical workbook 1.4paper.xlsx (same as dashboard /dashboard/paper/). Coverage: 7 of 12 months (Jan–Jul), datasetState PUBLISHABLE_PARTIAL, verification available_unverified. Partial consumption series only — not per-unit vs target completion, not an official score.',
});

DATA.updated = '2026-09-03';
DATA.note +=
  ' [2026-09-03 Cat3 resource KPI sync: 3.1.2/3.2.2/3.2.5/3.3.2 → in_progress citing generated water/energy/fuel/paper JSON already on the dashboard. Not ready. Fuel values unchanged (FUEL_SOURCE_RECONCILIATION_REQUIRED). Cat4–Cat7 remain unavailable.]';

writeFileSync(PROGRESS_JSON, JSON.stringify(DATA, null, 2) + '\n', 'utf8');
console.log('\n✓ indicator-progress-2569.json updated successfully');
