#!/usr/bin/env node
/**
 * Phase 3B B3: append PO-approved Joomla #30 + #56 to activities.json.
 * READ-ONLY on Joomla/OneDrive raw cache; writes repo only.
 *
 * Usage: node scripts/migrate-joomla-activities-b3.mjs [--skip-download]
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeJsonFile } from './lib/serialize-json.mjs';
import { resolveCanonicalEventDate } from './lib/joomla-activity-dates.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FETCH_DIR = join(ROOT, 'src/data/migration/joomla-article-fetch');
const OUT_JSON = join(ROOT, 'src/data/content/activities.json');
const MEDIA_ROOT = join(ROOT, 'public/images/activities/migrated');
const JOOMLA_BASE = 'https://researchex.mju.ac.th/goffice';

/** PO-approved B3 cohort (Phase 3A source-resolved). */
const COHORT = [
  { id: 30, actId: 'ACT-2567-008', category: 'meeting', type: 'committee' },
  { id: 56, actId: 'ACT-2567-009', category: 'training', type: 'workshop' },
];

const LISTING_TITLES = {
  30: 'ประชุมคณะกรรมการดำเนินงาน  หมวด1',
  56: 'อบรม การเสริมสร้างความรู้ ความเข้าใจด้านสิ่งแวดล้อม ตามเกณฑ์การประเมินสำนักงานสีเขียว',
};

const CATEGORIES = JSON.parse(
  readFileSync(join(ROOT, 'src/data/content/activity-categories.json'), 'utf8'),
);

function loadFetch(id) {
  const path = join(FETCH_DIR, `${id}.json`);
  if (!existsSync(path)) throw new Error(`Missing fetch file for ${id}`);
  return JSON.parse(readFileSync(path, 'utf8'));
}

function cleanBody(text) {
  if (!text) return '';
  let t = text;
  const openIdx = t.lastIndexOf('<');
  if (openIdx >= 0 && !t.slice(openIdx).includes('>')) {
    t = t.slice(0, openIdx);
  }
  return t
    .replace(/<[^>]*>/gi, ' ')
    .replace(/https?:\/\/[^\s"]+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function summarize(body, title, max = 220) {
  const base = cleanBody(body) || title;
  if (base.length <= max) return base;
  return `${base.slice(0, max - 1)}…`;
}

function imagePaths(fetch) {
  return fetch.mediaPaths.filter((p) => /\.(jpe?g|png|webp)$/i.test(p));
}

async function downloadImages(paths, destSubdir, skipDownload) {
  mkdirSync(destSubdir, { recursive: true });
  const local = [];
  for (const rel of paths) {
    const fileName = basename(rel);
    const dest = join(destSubdir, fileName);
    const publicPath = `/images/activities/migrated/${basename(destSubdir)}/${fileName}`;
    if (!skipDownload && !existsSync(dest)) {
      const url = `${JOOMLA_BASE}/${rel}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`  skip media ${url} (${res.status})`);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      writeFileSync(dest, buf);
    }
    if (existsSync(dest) || skipDownload) {
      local.push({ rel, publicPath, dest });
    }
  }
  return local;
}

function facet(id, kind) {
  const list = kind === 'type' ? CATEGORIES.activityTypes : CATEGORIES.activityCategories;
  const row = list.find((x) => x.id === id);
  if (!row) return undefined;
  return { id: row.id, labelTh: row.labelTh, labelEn: row.labelEn };
}

function buildRecord(spec, fetch, media, today) {
  const titleTh = fetch.titleTh || LISTING_TITLES[spec.id];
  const canonical = resolveCanonicalEventDate(fetch);
  if (!canonical.publishDate) throw new Error(`${spec.id}: missing verified publishDate`);

  let bodyTh = cleanBody(fetch.bodyTh);
  if (!bodyTh) {
    bodyTh = `บันทึกกิจกรรมจากแหล่งที่มา Joomla หมายเลข ${spec.id} — วันที่ ${canonical.eventDateRaw ?? canonical.publishDate}`;
  }

  const record = {
    id: spec.actId,
    slug: fetch.joomlaSlug,
    kind: 'activity',
    status: 'published',
    translationPending: true,
    titleTh,
    titleEn: '',
    summaryTh: summarize(bodyTh, titleTh),
    summaryEn: '',
    bodyTh,
    bodyEn: '',
    publishDate: canonical.publishDate,
    fiscalYear: canonical.fiscalYear,
    category: facet(spec.category, 'category'),
    activityType: spec.type ? facet(spec.type, 'type') : undefined,
    media: media.map((img, idx) => ({
      type: 'image',
      src: img.publicPath,
      altTh: `${titleTh} — ภาพที่ ${idx + 1}`,
      altEn: '',
    })),
    relatedIndicators: [],
    relatedLinks: [],
    source: {
      system: 'joomla',
      joomlaArticleId: spec.id,
      joomlaUrl: fetch.joomlaUrl,
      joomlaCategory: 'project2',
      migratedAt: today,
      ...(canonical.dateResolution ? { dateResolution: canonical.dateResolution } : {}),
    },
    contentOwner: 'Green Office team',
    updatedAt: today,
  };
  if (!record.activityType) delete record.activityType;
  return record;
}

async function main() {
  const skipDownload = process.argv.includes('--skip-download');
  const today = new Date().toISOString().slice(0, 10);
  const existing = JSON.parse(readFileSync(OUT_JSON, 'utf8'));
  const existingIds = new Set((existing.items ?? []).map((i) => i.id));
  const existingSlugs = new Set((existing.items ?? []).map((i) => i.slug));
  const publishedBefore = (existing.items ?? []).filter((i) => i.status === 'published').length;

  if (publishedBefore !== 17) {
    throw new Error(`Expected 17 published activities before B3; found ${publishedBefore}`);
  }

  const activeCohort = COHORT.filter((spec) => !existingIds.has(spec.actId));
  if (activeCohort.length === 0) {
    console.log('B3 cohort already migrated — nothing to append.');
    return;
  }

  const fetches = {};
  const mediaById = {};

  for (const spec of activeCohort) {
    fetches[spec.id] = loadFetch(spec.id);
    const imgs = imagePaths(fetches[spec.id]);
    const folder = `${spec.id}-${fetches[spec.id].joomlaSlug}`;
    console.log(`Media #${spec.id}: ${imgs.length} images`);
    mediaById[spec.id] = await downloadImages(imgs, join(MEDIA_ROOT, folder), skipDownload);
  }

  const newItems = [];
  for (const spec of activeCohort) {
    const record = buildRecord(spec, fetches[spec.id], mediaById[spec.id], today);
    if (existingSlugs.has(record.slug)) {
      throw new Error(`Slug collision: ${record.slug} (Joomla #${spec.id})`);
    }
    newItems.push(record);
  }

  const items = [...(existing.items ?? []), ...newItems];
  items.sort((a, b) => b.publishDate.localeCompare(a.publishDate) || b.id.localeCompare(a.id));

  const publishedAfter = items.filter((i) => i.status === 'published').length;
  if (publishedAfter !== publishedBefore + newItems.length) {
    throw new Error(`Published count mismatch after B3: ${publishedAfter}`);
  }

  writeJsonFile(OUT_JSON, {
    version: '1.3.0',
    updated: today,
    note: 'Phase 2 B1+B2 + Phase 3B B3 — 19 publish-ready records migrated locally (B3: #30, #56). EN translation pending. Merged #62→#63, #40→#39. #56 canonical date from body narrative (header 2024-07-11 preserved in source.dateResolution).',
    items,
  });

  console.log(`Appended ${newItems.length} B3 activities (${publishedAfter} published) → ${OUT_JSON}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
