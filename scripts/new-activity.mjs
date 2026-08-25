#!/usr/bin/env node
/**
 * news:new — create a draft activity or news stub (ACTIVITY_CONTENT_CONTRACT_V1).
 *
 * Usage:
 *   npm run news:new -- --kind activity --title "ชื่อกิจกรรม" --year 2569
 *   npm run news:new -- --kind news --title "หัวข้อข่าว" --year 2569
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeJsonFile } from './lib/serialize-json.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : null;
}

function slugify(text) {
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || `draft-${Date.now()}`;
}

function nextId(items, prefix) {
  let max = 0;
  for (const item of items) {
    const m = item.id?.match(new RegExp(`^${prefix}-(\\d{3})$`));
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
}

function main() {
  const kind = arg('kind') ?? 'activity';
  const title = arg('title');
  const year = Number(arg('year') ?? '2569');
  const today = new Date().toISOString().slice(0, 10);

  if (!title) {
    console.error('Usage: npm run news:new -- --kind activity|news --title "..." [--year 2569]');
    process.exit(1);
  }
  if (kind !== 'activity' && kind !== 'news') {
    console.error('--kind must be activity or news');
    process.exit(1);
  }

  const rel = kind === 'activity' ? 'src/data/content/activities.json' : 'src/data/content/news.json';
  const path = join(ROOT, rel);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  const prefix = kind === 'activity' ? `ACT-${year}` : `NEWS-${year}`;
  const id = nextId(data.items, prefix);
  let slug = slugify(title);
  const existing = new Set(data.items.map((i) => i.slug));
  if (existing.has(slug)) slug = `${slug}-${id.split('-').pop()}`;

  const stub = {
    id,
    slug,
    kind,
    status: 'draft',
    titleTh: title,
    titleEn: '',
    summaryTh: '',
    summaryEn: '',
    bodyTh: '',
    bodyEn: '',
    publishDate: today,
    fiscalYear: year,
    media: [],
    relatedIndicators: [],
    relatedLinks: [],
    source: { system: 'manual' },
    contentOwner: '',
    updatedAt: today,
  };

  data.items.unshift(stub);
  data.updated = today;
  writeJsonFile(path, data);
  console.log(`Created draft ${kind}: ${id} (${slug}) in ${rel}`);
  console.log('Edit the stub, add EN fields, set status=published, then run: node scripts/validate-activities.mjs');
}

main();
