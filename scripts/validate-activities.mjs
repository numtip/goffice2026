#!/usr/bin/env node
/**
 * validate-activities.mjs
 * Schema validation for src/data/content/activities.json and news.json
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VALID_STATUSES = new Set(['published', 'draft', 'archived']);
const VALID_KINDS = new Set(['activity', 'news']);

function load(rel) {
  return JSON.parse(readFileSync(join(ROOT, rel), 'utf8'));
}

function validateCollection(file, expectedKind, errors) {
  const data = load(file);
  if (!Array.isArray(data.items)) {
    errors.push(`${file}: items must be an array`);
    return;
  }
  const slugs = new Set();
  const ids = new Set();
  for (const item of data.items) {
    const p = `${file} ${item.id ?? '(no id)'}`;
    if (!item.id) errors.push(`${p}: missing id`);
    if (ids.has(item.id)) errors.push(`${p}: duplicate id`);
    ids.add(item.id);
    if (!SLUG.test(item.slug ?? '')) errors.push(`${p}: invalid slug`);
    if (slugs.has(item.slug)) errors.push(`${p}: duplicate slug`);
    slugs.add(item.slug);
    if (item.kind !== expectedKind) errors.push(`${p}: kind must be ${expectedKind}`);
    if (!VALID_KINDS.has(item.kind)) errors.push(`${p}: invalid kind`);
    if (!VALID_STATUSES.has(item.status)) errors.push(`${p}: invalid status`);
    if (!item.titleTh) errors.push(`${p}: missing titleTh`);
    if (!item.summaryTh) errors.push(`${p}: missing summaryTh`);
    if (!ISO_DATE.test(item.publishDate ?? '')) errors.push(`${p}: publishDate must be YYYY-MM-DD`);
    if (typeof item.fiscalYear !== 'number') errors.push(`${p}: fiscalYear must be number`);
    if (!item.source?.system) errors.push(`${p}: source.system required`);
    if (item.status === 'published') {
      if (!item.translationPending) {
        if (!item.titleEn) errors.push(`${p}: published items require titleEn`);
        if (!item.summaryEn) errors.push(`${p}: published items require summaryEn`);
      }
    }
    if (item.relatedIndicators?.length) {
      for (const code of item.relatedIndicators) {
        if (!/^\d+\.\d+\.\d+$/.test(code)) {
          errors.push(`${p}: invalid relatedIndicator ${code}`);
        }
      }
    }
  }
}

function validateSortOrder(file, errors) {
  const data = load(file);
  const published = data.items.filter((i) => i.status === 'published');
  for (let i = 1; i < published.length; i += 1) {
    const prev = published[i - 1].publishDate;
    const cur = published[i].publishDate;
    if (cur > prev) {
      errors.push(`${file}: items should be stored latest-first (found ${cur} before ${prev})`);
      break;
    }
  }
}

const errors = [];
validateCollection('src/data/content/activities.json', 'activity', errors);
validateCollection('src/data/content/news.json', 'news', errors);
validateSortOrder('src/data/content/activities.json', errors);
validateSortOrder('src/data/content/news.json', errors);

if (errors.length) {
  console.error('validate-activities FAILED:');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log('validate-activities PASSED');
