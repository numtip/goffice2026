#!/usr/bin/env node
/**
 * activity:new — create a draft activity record (ACTIVITY_CONTENT_CONTRACT_V1).
 *
 * Usage:
 *   npm run activity:new -- \
 *     --title "ชื่อกิจกรรม" \
 *     --date 2026-03-17 \
 *     --year 2569 \
 *     --slug management-review-mar2569 \
 *     --category meeting \
 *     [--type committee] \
 *     [--summary "สรุปสั้น"] \
 *     [--dry-run]
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeJsonFile } from './lib/serialize-json.mjs';
import { parseThaiDate } from './lib/joomla-activity-dates.mjs';
import {
  buildFacet,
  buildManualActivityRecord,
  ensureActivityMediaDir,
  nextActivityId,
  resolveSlug,
  sortActivitiesByPublishDateDesc,
  summarize,
  titleNeedsExplicitSlug,
  validateDateYear,
  validateRecordAgainstCollection,
  ISO_DATE_PATTERN,
} from './lib/activity-record.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ACTIVITIES_PATH = join(ROOT, 'src/data/content/activities.json');
const CATEGORIES_PATH = join(ROOT, 'src/data/content/activity-categories.json');

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : null;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function parsePublishDate(raw) {
  if (!raw) return todayIso();
  if (ISO_DATE_PATTERN.test(raw)) return raw;
  const parsed = parseThaiDate(raw);
  if (parsed?.iso) return parsed.iso;
  throw new Error(`Invalid --date "${raw}" — use YYYY-MM-DD or Thai date (e.g. "17 มีนาคม 2569")`);
}

function loadActivities() {
  if (!existsSync(ACTIVITIES_PATH)) {
    throw new Error(`Missing ${ACTIVITIES_PATH}`);
  }
  return JSON.parse(readFileSync(ACTIVITIES_PATH, 'utf8'));
}

function loadCategories() {
  return JSON.parse(readFileSync(CATEGORIES_PATH, 'utf8'));
}

function printUsage() {
  console.error(`Usage:
  npm run activity:new -- \\
    --title "<TH title>" \\
    --date YYYY-MM-DD \\
    --year <BE fiscal year> \\
    --slug <ascii-slug> \\
    --category <category-id> \\
    [--type <type-id>] \\
    [--summary "<TH summary>"] \\
    [--translation-pending] [--no-translation-pending] \\
    [--allow-publish] [--dry-run]

Publish sequence (manual):
  draft → edit activities.json + media → status published →
  node scripts/generate-search-index.mjs → npm run validate → npm run build → PR/CI`);
}

export function createActivityDraft(options) {
  const {
    title,
    date,
    year,
    slug: slugArg,
    categoryId,
    typeId,
    summary,
    status = 'draft',
    translationPending = true,
    contentOwner = 'Green Office team',
    allowPublish = false,
    dryRun = false,
    activitiesPath = ACTIVITIES_PATH,
    categoriesPath = CATEGORIES_PATH,
    root = ROOT,
  } = options;

  if (!title?.trim()) throw new Error('--title is required');
  if (!year || Number.isNaN(Number(year))) throw new Error('--year (BE fiscal) is required');
  if (!categoryId) throw new Error('--category is required');

  const fiscalYear = Number(year);
  const publishDate = parsePublishDate(date);
  validateDateYear(publishDate, fiscalYear);

  if (status === 'published' && !allowPublish) {
    throw new Error('Refusing status=published without --allow-publish (use draft default)');
  }
  if (status !== 'draft' && status !== 'published') {
    throw new Error(`Invalid --status "${status}" — use draft or published with --allow-publish`);
  }

  const categories = JSON.parse(readFileSync(categoriesPath, 'utf8'));
  const category = buildFacet(categoryId, 'category', categories);
  if (!category) {
    const ids = categories.activityCategories.map((c) => c.id).join(', ');
    throw new Error(`Invalid --category "${categoryId}". Valid: ${ids}`);
  }

  let activityType;
  if (typeId) {
    activityType = buildFacet(typeId, 'type', categories);
    if (!activityType) {
      const ids = categories.activityTypes.map((t) => t.id).join(', ');
      throw new Error(`Invalid --type "${typeId}". Valid: ${ids}`);
    }
  }

  const collection = JSON.parse(readFileSync(activitiesPath, 'utf8'));
  if (!Array.isArray(collection.items)) {
    throw new Error('activities.json items must be an array');
  }

  const id = nextActivityId(collection.items, fiscalYear);
  const idSuffix = id.split('-').pop();
  const existingSlugs = new Set(collection.items.map((i) => i.slug));
  const slug = resolveSlug({
    slug: slugArg,
    title,
    existingSlugs,
    idSuffix,
  });

  const summaryTh = summary?.trim() || summarize('', title);
  const updatedAt = todayIso();

  const record = buildManualActivityRecord({
    id,
    slug,
    titleTh: title,
    summaryTh,
    publishDate,
    fiscalYear,
    category,
    activityType,
    status,
    translationPending,
    contentOwner,
    updatedAt,
  });

  validateRecordAgainstCollection(record, collection);

  const mediaDir = ensureActivityMediaDir(root, fiscalYear, slug, { dryRun });

  const result = {
    record,
    mediaDir: mediaDir.rel,
    mediaDirCreated: mediaDir.created,
    id,
    slug,
    dryRun,
  };

  if (dryRun) {
    return result;
  }

  collection.items = sortActivitiesByPublishDateDesc([...collection.items, record]);
  collection.updated = updatedAt;
  writeJsonFile(activitiesPath, collection);

  return result;
}

function main() {
  if (hasFlag('help') || hasFlag('h')) {
    printUsage();
    process.exit(0);
  }

  const title = arg('title');
  const year = arg('year');
  const date = arg('date');
  const slug = arg('slug');
  const categoryId = arg('category');
  const typeId = arg('type');
  const summary = arg('summary');
  const status = arg('status') ?? 'draft';
  const dryRun = hasFlag('dry-run');
  const allowPublish = hasFlag('allow-publish');
  const translationPending = hasFlag('no-translation-pending') ? false : true;

  if (!title) {
    printUsage();
    process.exit(1);
  }

  try {
    const { record, mediaDir, mediaDirCreated, id, slug: resolvedSlug } = createActivityDraft({
      title,
      date,
      year,
      slug,
      categoryId,
      typeId,
      summary,
      status,
      translationPending,
      allowPublish,
      dryRun,
    });

    if (dryRun) {
      console.log(JSON.stringify({ id, slug: resolvedSlug, record, mediaDir }, null, 2));
      process.exit(0);
    }

    console.log(`Created draft activity: ${id} (${resolvedSlug})`);
    console.log(`Collection: src/data/content/activities.json`);
    console.log(`Media folder: ${mediaDir}${mediaDirCreated ? ' (created)' : ' (exists)'}`);
    console.log('');
    console.log('Next steps:');
    console.log('  1. Edit summary/body and add images under the media folder');
    console.log('  2. node scripts/validate-activities.mjs');
    console.log('  3. When ready: set status=published, then:');
    console.log('     node scripts/generate-search-index.mjs');
    console.log('     DEPLOY_TARGET=github-pages npm run validate');
    console.log('     npm run build');
  } catch (err) {
    console.error(`activity:new FAILED: ${err.message}`);
    if (title && !slug && titleNeedsExplicitSlug(title)) {
      console.error('Hint: provide --slug with ASCII [a-z0-9-] for Thai-only titles');
    }
    process.exit(1);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
