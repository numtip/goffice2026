/**
 * apply-cat1-fy2569-owner-status.mjs
 * ===================================
 * Applies owner-approved FY2569 Cat1 status + Cat3 plan evidence decisions.
 * 
 * Changes:
 *   1.1.4: ready/verified → in_progress/available_unverified (plan exists, internals in progress)
 *   1.5.1: unavailable → in_progress citing canonical GHG workbook
 *   1.5.2: unavailable → in_progress citing canonical GHG workbook  
 *   1.6.1: ready/verified → unavailable (not in owner-approved set)
 *   Update note with timestamp and summary
 */
import { readFileSync, writeFileSync } from 'node:fs';

const PROGRESS_JSON = new URL('../src/data/progress/indicator-progress-2569.json', import.meta.url);
const DATA = JSON.parse(readFileSync(PROGRESS_JSON, 'utf8'));

function find(code) {
  return DATA.items.find(i => i.indicator === code);
}

// 1.1.4: Plan exists but internal details are in progress → partial
{
  const item = find('1.1.4');
  if (!item) throw new Error('Missing 1.1.4');
  item.progressStatus = 'in_progress';
  item.evidenceStatus = 'available_unverified';
  item.updatedAt = '2026-08-31';
  item.notes = 'Annual plan exists (147 activities); internal details in progress → partial. Plan evidence is not implementation/result/pass.';
  console.log('✓ 1.1.4 → in_progress / available_unverified');
}

// 1.5.1: Cite authoritative FY2569 GHG workbook (same as dashboard /dashboard/ghg/)
{
  const item = find('1.5.1');
  if (!item) throw new Error('Missing 1.5.1');
  item.progressStatus = 'in_progress';
  item.evidenceStatus = 'available_unverified';
  item.updatedAt = '2026-08-31';
  item.source = { type: 'repository', ref: 'src/data/generated/ghg.json' };
  item.notes = 'FY2569 GHG data sourced from canonical workbook 1.6GreenHouseGas2026_New.xlsx (same as dashboard /dashboard/ghg/). Coverage: 7 of 12 months (Jan-Jul), total 144.8 tCO₂e, sourceSha256 d0a75e4c... Validation: in_progress.';
  console.log('✓ 1.5.1 → in_progress / available_unverified (GHG workbook)');
}

// 1.5.2: Same canonical GHG data as 1.5.1
{
  const item = find('1.5.2');
  if (!item) throw new Error('Missing 1.5.2');
  item.progressStatus = 'in_progress';
  item.evidenceStatus = 'available_unverified';
  item.updatedAt = '2026-08-31';
  item.source = { type: 'repository', ref: 'src/data/generated/ghg.json' };
  item.notes = 'FY2569 GHG analysis vs target uses the same canonical workbook as 1.5.1: 1.6GreenHouseGas2026_New.xlsx. Coverage: 7 of 12 months (Jan-Jul), total 144.8 tCO₂e, sourceSha256 d0a75e4c... Validation: in_progress.';
  console.log('✓ 1.5.2 → in_progress / available_unverified (GHG workbook)');
}

// 1.6.1: Not in owner-approved set → unavailable
{
  const item = find('1.6.1');
  if (!item) throw new Error('Missing 1.6.1');
  item.progressStatus = 'unavailable';
  item.evidenceStatus = 'unavailable';
  item.updatedAt = '2026-08-31';
  item.source = { type: 'unavailable', ref: null };
  item.notes = 'Not in the owner-approved set. Annual plan record alone does not constitute implementation/result/pass. Keep FY2569 unavailable.';
  console.log('✓ 1.6.1 → unavailable');
}

// Update metadata
DATA.note += ' [2026-08-31 Cat1 status sync: 1.1.1/1.1.2/1.1.3/1.2.1 source-approved kept. 1.1.4→in_progress/partial. 1.5.1/1.5.2→in_progress citing canonical GHG workbook. 1.6.1→unavailable (not owner-approved). All other Cat1 unchanged.]';
DATA.updated = '2026-08-31';

writeFileSync(PROGRESS_JSON, JSON.stringify(DATA, null, 2) + '\n', 'utf8');
console.log('\n✓ indicator-progress-2569.json updated successfully');
console.log('Updated note length:', DATA.note.length, 'chars');