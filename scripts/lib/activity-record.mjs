/**
 * Shared helpers for manual activity record creation (activity:new).
 * Read-only patterns extracted from migrators — does not modify B1/B2/B3.
 */

import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const VALID_STATUSES = new Set(['published', 'draft', 'archived']);
export const MIGRATION_ONLY_SOURCE_KEYS = new Set([
  'joomlaArticleId',
  'joomlaUrl',
  'joomlaCategory',
  'migratedAt',
  'mergedSources',
  'dateResolution',
]);

/** @param {string} text */
export function summarize(text, title, max = 220) {
  const base = (text ?? '').trim() || (title ?? '').trim();
  if (!base) return '';
  if (base.length <= max) return base;
  return `${base.slice(0, max - 1)}…`;
}

/** @param {string} text */
export function slugifyAscii(text) {
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** True when title has no ASCII letters/digits to derive a slug from. */
export function titleNeedsExplicitSlug(title) {
  return slugifyAscii(title).length === 0;
}

/** @param {string} id @param {'category'|'type'} kind @param {object} categories */
export function buildFacet(id, kind, categories) {
  const list = kind === 'type' ? categories.activityTypes : categories.activityCategories;
  const row = list.find((x) => x.id === id);
  if (!row) return null;
  return { id: row.id, labelTh: row.labelTh, labelEn: row.labelEn };
}

/** @param {object[]} items @param {number} fiscalYear */
export function nextActivityId(items, fiscalYear) {
  const prefix = `ACT-${fiscalYear}`;
  const re = new RegExp(`^${prefix}-(\\d{3})$`);
  let max = 0;
  for (const item of items) {
    const m = item.id?.match(re);
    if (m) max = Math.max(max, Number(m[1]));
  }
  const next = max + 1;
  if (next > 999) {
    throw new Error(`ID allocation exhausted for ${prefix} (max 999)`);
  }
  return `${prefix}-${String(next).padStart(3, '0')}`;
}

/** @param {Set<string>} existingSlugs @param {string} baseSlug @param {string} idSuffix */
export function resolveSlugCollision(existingSlugs, baseSlug, idSuffix) {
  if (!existingSlugs.has(baseSlug)) return baseSlug;
  const suffixed = `${baseSlug}-${idSuffix}`;
  if (!existingSlugs.has(suffixed)) return suffixed;
  throw new Error(`Slug collision: ${baseSlug} and ${suffixed} already exist`);
}

/**
 * Resolve slug from explicit flag or ASCII title.
 * @param {{ slug?: string, title: string, existingSlugs: Set<string>, idSuffix: string }} opts
 */
export function resolveSlug({ slug, title, existingSlugs, idSuffix }) {
  let base;
  if (slug) {
    if (!SLUG_PATTERN.test(slug)) {
      throw new Error(`Invalid slug "${slug}" — use lowercase ASCII [a-z0-9-] only`);
    }
    base = slug;
  } else if (titleNeedsExplicitSlug(title)) {
    throw new Error('Thai-only title requires explicit --slug (ASCII [a-z0-9-])');
  } else {
    base = slugifyAscii(title);
    if (!base || !SLUG_PATTERN.test(base)) {
      throw new Error('Could not derive slug from title — provide explicit --slug');
    }
  }
  return resolveSlugCollision(existingSlugs, base, idSuffix);
}

/** @param {object[]} items */
export function sortActivitiesByPublishDateDesc(items) {
  return [...items].sort((a, b) => {
    const da = a.publishDate ?? '';
    const db = b.publishDate ?? '';
    if (da !== db) return db.localeCompare(da);
    return (b.id ?? '').localeCompare(a.id ?? '');
  });
}

/** @param {string} publishDate @param {number} fiscalYear */
export function validateDateYear(publishDate, fiscalYear) {
  if (!ISO_DATE_PATTERN.test(publishDate)) {
    throw new Error(`publishDate must be YYYY-MM-DD, got "${publishDate}"`);
  }
  const [y] = publishDate.split('-').map(Number);
  const expectedFy = y + 543;
  const warning =
    fiscalYear !== expectedFy
      ? `fiscalYear ${fiscalYear} differs from publishDate CE year + 543 (${expectedFy})`
      : null;
  return { expectedFy, warning };
}

/** @param {object} source */
export function assertNoMigrationSourceFields(source) {
  for (const key of Object.keys(source ?? {})) {
    if (MIGRATION_ONLY_SOURCE_KEYS.has(key)) {
      throw new Error(`Manual records must not include source.${key}`);
    }
  }
}

/**
 * Build a draft activity record matching ACTIVITY_CONTENT_CONTRACT_V1.
 * @param {object} opts
 */
export function buildManualActivityRecord(opts) {
  const {
    id,
    slug,
    titleTh,
    summaryTh,
    publishDate,
    fiscalYear,
    category,
    activityType,
    status = 'draft',
    translationPending = true,
    contentOwner = 'Green Office team',
    updatedAt,
  } = opts;

  if (!VALID_STATUSES.has(status)) {
    throw new Error(`Invalid status "${status}"`);
  }
  if (status === 'archived') {
    throw new Error('activity:new does not create archived records in v1');
  }
  if (!titleTh?.trim()) throw new Error('titleTh is required');
  if (!summaryTh?.trim()) throw new Error('summaryTh is required');
  if (!category) throw new Error('category facet is required');

  const source = { system: 'manual' };
  assertNoMigrationSourceFields(source);

  const record = {
    id,
    slug,
    kind: 'activity',
    status,
    translationPending,
    titleTh: titleTh.trim(),
    titleEn: '',
    summaryTh: summaryTh.trim(),
    summaryEn: '',
    bodyTh: '',
    bodyEn: '',
    publishDate,
    fiscalYear,
    category,
    media: [],
    relatedIndicators: [],
    relatedLinks: [],
    source,
    contentOwner,
    updatedAt,
  };

  if (activityType) {
    record.activityType = activityType;
  }

  if (status === 'published' && !translationPending) {
    throw new Error('Published records require translationPending or non-empty EN fields');
  }

  return record;
}

/** @param {string} root @param {number} fiscalYear @param {string} slug @param {{ dryRun?: boolean }} opts */
export function ensureActivityMediaDir(root, fiscalYear, slug, { dryRun = false } = {}) {
  const rel = join('public', 'images', 'activities', String(fiscalYear), slug);
  const abs = join(root, rel);
  if (dryRun) return { rel, abs, created: false };
  if (existsSync(abs)) return { rel, abs, created: false };
  mkdirSync(abs, { recursive: true });
  return { rel, abs, created: true };
}

/** @param {object} record @param {object} collection */
export function validateRecordAgainstCollection(record, collection) {
  const ids = new Set(collection.items.map((i) => i.id));
  const slugs = new Set(collection.items.map((i) => i.slug));
  if (ids.has(record.id)) throw new Error(`Duplicate id: ${record.id}`);
  if (slugs.has(record.slug)) throw new Error(`Duplicate slug: ${record.slug}`);
}
