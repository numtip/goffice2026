/**
 * Phase D reconciliation — Joomla project2 historical migration coverage.
 * Compares audit inventory, Phase 2A disposition, fetch cache, and activities.json.
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');

const PATHS = {
  inventory: join(ROOT, 'src/data/migration/joomla-activities-inventory.json'),
  disposition: join(ROOT, 'src/data/migration/joomla-phase2-review-disposition.json'),
  activities: join(ROOT, 'src/data/content/activities.json'),
  fetchSummary: join(ROOT, 'src/data/migration/joomla-article-fetch/_summary.json'),
};

function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function getMigratedIds(activities) {
  const primary = new Set();
  const merged = new Set();
  for (const item of activities.items ?? []) {
    if (item.source?.joomlaArticleId) primary.add(item.source.joomlaArticleId);
    for (const m of item.source?.mergedSources ?? []) merged.add(m.joomlaArticleId);
  }
  return { primary, merged };
}

function resolveDisposition(id, inventory, disposition) {
  const d = disposition.items.find((i) => i.joomlaArticleId === id);
  if (d?.disposition) return d.disposition;
  const inv = inventory.items.find((i) => i.joomlaArticleId === id);
  if (inv?.disposition) return inv.disposition;
  return 'REVIEW';
}

function resolveFiscalYear(id, inventory, disposition, fetchById) {
  const d = disposition.items.find((i) => i.joomlaArticleId === id);
  if (d?.fiscalYear) return d.fiscalYear;
  const f = fetchById.get(id);
  if (f?.fiscalYear) return f.fiscalYear;
  const inv = inventory.items.find((i) => i.joomlaArticleId === id);
  const hint = inv?.eventDateHint?.match(/(\d{4})/);
  return hint ? Number(hint[1]) : null;
}

/**
 * @param {{ root?: string }} [opts]
 */
export function reconcileActivitiesPhaseD(opts = {}) {
  const root = opts.root ?? ROOT;
  const inventory = loadJson(join(root, 'src/data/migration/joomla-activities-inventory.json'));
  const disposition = existsSync(join(root, 'src/data/migration/joomla-phase2-review-disposition.json'))
    ? loadJson(join(root, 'src/data/migration/joomla-phase2-review-disposition.json'))
    : { items: [] };
  const activities = loadJson(join(root, 'src/data/content/activities.json'));
  const fetchSummary = existsSync(join(root, 'src/data/migration/joomla-article-fetch/_summary.json'))
    ? loadJson(join(root, 'src/data/migration/joomla-article-fetch/_summary.json'))
    : [];
  const fetchById = new Map(fetchSummary.map((f) => [f.joomlaArticleId, f]));
  const { primary, merged } = getMigratedIds(activities);

  const articleIds = inventory.summary?.articleIdsPresent ?? [];
  const articles = articleIds.map((id) => {
    const dispositionValue = resolveDisposition(id, inventory, disposition);
    const migratedAs = primary.has(id) ? 'primary' : merged.has(id) ? 'merged' : null;
    return {
      joomlaArticleId: id,
      fiscalYear: resolveFiscalYear(id, inventory, disposition, fetchById),
      disposition: dispositionValue,
      migratedAs,
    };
  });

  const yearMap = new Map();
  for (const row of articles) {
    const key = row.fiscalYear ?? 'unknown';
    if (!yearMap.has(key)) {
      yearMap.set(key, {
        year: key,
        sourceTotal: 0,
        keep: 0,
        merge: 0,
        exclude: 0,
        review: 0,
        alreadyMigrated: 0,
        remainingEligible: 0,
      });
    }
    const y = yearMap.get(key);
    y.sourceTotal++;
    if (row.disposition === 'KEEP') y.keep++;
    else if (row.disposition === 'MERGE') y.merge++;
    else if (row.disposition === 'EXCLUDE') y.exclude++;
    else y.review++;
    if (row.migratedAs) y.alreadyMigrated++;
    else if (row.disposition === 'KEEP' || row.disposition === 'MERGE') y.remainingEligible++;
  }

  const yearCoverage = [...yearMap.values()].sort((a, b) => {
    if (a.year === 'unknown') return 1;
    if (b.year === 'unknown') return -1;
    return Number(b.year) - Number(a.year);
  });

  const unmigratedEligible = articles.filter(
    (a) => (a.disposition === 'KEEP' || a.disposition === 'MERGE') && !a.migratedAs,
  );
  const excludedUnmigrated = articles.filter((a) => a.disposition === 'EXCLUDE' && !a.migratedAs);
  const publishedCount = (activities.items ?? []).filter((i) => i.status === 'published').length;

  const blockers = [];
  if (unmigratedEligible.length > 0) {
    blockers.push({
      kind: 'unmigrated_dispositioned',
      ids: unmigratedEligible.map((a) => a.joomlaArticleId),
    });
  }

  const legacyArchiveEligible = 0;
  if (unmigratedEligible.length === 0 && excludedUnmigrated.length > 0) {
    blockers.push({
      kind: 'joomla_project2_complete',
      note: 'All KEEP/MERGE Joomla project2 records migrated. Next historical intake requires Phase A audit + Phase B disposition on legacy archives (746 activity_image files) or explicit PO scope for B0 FY2569.',
      excludedIds: excludedUnmigrated.map((a) => a.joomlaArticleId),
      legacyArchiveImages: 746,
      legacyArchiveDisposition: 'none',
    });
  }

  return {
    publishedCount,
    inventoryTotal: articleIds.length,
    yearCoverage,
    articles,
    unmigratedEligible,
    excludedUnmigrated,
    blockers,
    verdict:
      unmigratedEligible.length === 0 && legacyArchiveEligible === 0
        ? 'PHASE_D_HISTORICAL_BLOCKED'
        : 'PHASE_D_NEXT_BATCH_READY_FOR_MERGE',
    nextBatch: unmigratedEligible.length
      ? {
          kind: 'joomla_project2_remainder',
          ids: unmigratedEligible.map((a) => a.joomlaArticleId),
        }
      : {
          kind: 'blocked_pending_audit',
          required: 'Phase A audit + Phase B disposition on legacy archives before migration',
        },
  };
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  const result = reconcileActivitiesPhaseD();
  console.log(JSON.stringify(result, null, 2));
  if (result.unmigratedEligible.length > 0) process.exit(1);
}
