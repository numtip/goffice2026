#!/usr/bin/env node
/**
 * Phase 2 B2: append PO-approved FY2567/FY2566 Joomla records to activities.json.
 * READ-ONLY on Joomla/OneDrive; writes repo only.
 *
 * Usage: node scripts/migrate-joomla-activities-b2.mjs [--skip-download]
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeJsonFile } from './lib/serialize-json.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FETCH_DIR = join(ROOT, 'src/data/migration/joomla-article-fetch');
const OUT_JSON = join(ROOT, 'src/data/content/activities.json');
const MEDIA_ROOT = join(ROOT, 'public/images/activities/migrated');
const JOOMLA_BASE = 'https://researchex.mju.ac.th/goffice';

/** PO-approved B2 primary IDs (#40 merged into #39). */
const COHORT = [
  { id: 55, actId: 'ACT-2567-002', category: 'campaign', type: 'cleaning' },
  { id: 43, actId: 'ACT-2567-003', category: 'preparedness', type: 'workshop' },
  { id: 39, actId: 'ACT-2567-004', category: 'training', type: 'workshop', mergeIds: [40] },
  { id: 36, actId: 'ACT-2567-005', category: 'training', type: 'workshop' },
  { id: 32, actId: 'ACT-2567-006', category: 'meeting', type: 'committee' },
  { id: 31, actId: 'ACT-2567-007', category: 'meeting', type: 'committee' },
  { id: 29, actId: 'ACT-2566-001', category: 'training', type: 'workshop' },
  { id: 28, actId: 'ACT-2566-002', category: 'campaign', type: 'cleaning' },
];

const LISTING_TITLES = {
  55: 'กิจกรรมสร้างความเป็นระเบียบเรียบร้อยในสำนักงาน 5ส',
  43: 'กิจกรรม การเตรียมความพร้อมการอพยพหนีภัย กรณีเกิดเหตุเพลิงไหม้และแผ่นดินไหว',
  40: 'ประชุมเตรียมความพร้อมในการเข้ารับการตรวจประเมิน สำนักงานสีเขียว (Green Office)',
  39: 'อบรมเตรียมความพร้อมก่อนเข้ารับการประเมินสำนักงานสีเขียว (Green Office)',
  36: 'บุคลากร เข้าร่วมฝึกตรวจประเมินการจัดการสิ่งแวดล้อม Green Office (ประเมินภายใน) ประจำปี 2567',
  32: 'ประชุมหารือการระบุประเด็นปัญหาสิ่งแวดล้อมภายในอาคารและนอกอาคารฯ',
  31: 'ประชุมมคณะกรรมการอำนวยการ สำนักงานสีเขียว (Green Office)',
  29: 'กิจกรรมอบรมให้ความรู้สำนักงานสีเขียว(Green Office)',
  28: 'กิจกรรม Big cleaning day 2023',
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

function buildRecord(spec, fetches, mediaById, today) {
  const primary = fetches[spec.id];
  const titleTh = primary.titleTh || LISTING_TITLES[spec.id];
  if (!primary.publishDate) throw new Error(`${spec.id}: missing verified publishDate`);

  const mergeFetches = (spec.mergeIds ?? []).map((mid) => fetches[mid]);
  let bodyTh = cleanBody(primary.bodyTh);
  for (const mf of mergeFetches) {
    const extra = cleanBody(mf.bodyTh);
    if (extra) {
      bodyTh += `\n\n(${mf.eventDateRaw ?? mf.publishDate}) ${mf.titleTh ?? LISTING_TITLES[mf.joomlaArticleId]}\n${extra}`;
    }
  }
  if (!bodyTh) {
    bodyTh = `บันทึกกิจกรรมจากแหล่งที่มา Joomla หมายเลข ${spec.id}${spec.mergeIds?.length ? ` (รวม ${spec.mergeIds.join(', ')})` : ''} — วันที่ ${primary.eventDateRaw ?? primary.publishDate}`;
  }

  const allImages = [
    ...mediaById[spec.id],
    ...(spec.mergeIds ?? []).flatMap((mid) => mediaById[mid] ?? []),
  ];

  const media = allImages.map((img, idx) => ({
    type: 'image',
    src: img.publicPath,
    altTh: `${titleTh} — ภาพที่ ${idx + 1}`,
    altEn: '',
  }));

  const mergedSources = (spec.mergeIds ?? []).map((mid) => ({
    joomlaArticleId: mid,
    joomlaUrl: fetches[mid].joomlaUrl,
  }));

  const record = {
    id: spec.actId,
    slug: primary.joomlaSlug,
    kind: 'activity',
    status: 'published',
    translationPending: true,
    titleTh,
    titleEn: '',
    summaryTh: summarize(bodyTh, titleTh),
    summaryEn: '',
    bodyTh,
    bodyEn: '',
    publishDate: primary.publishDate,
    fiscalYear: primary.fiscalYear,
    category: facet(spec.category, 'category'),
    activityType: spec.type ? facet(spec.type, 'type') : undefined,
    media,
    relatedIndicators: [],
    relatedLinks: [],
    source: {
      system: 'joomla',
      joomlaArticleId: spec.id,
      joomlaUrl: primary.joomlaUrl,
      joomlaCategory: 'project2',
      mergedSources: mergedSources.length ? mergedSources : undefined,
      migratedAt: today,
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

  const fetches = {};
  const mediaById = {};

  for (const spec of COHORT) {
    if (existingIds.has(spec.actId)) {
      console.log(`Skip ${spec.actId} — already in activities.json`);
      continue;
    }
    const ids = [spec.id, ...(spec.mergeIds ?? [])];
    for (const id of ids) {
      if (!fetches[id]) fetches[id] = loadFetch(id);
    }
  }

  const activeCohort = COHORT.filter((spec) => !existingIds.has(spec.actId));

  for (const spec of activeCohort) {
    const ids = [spec.id, ...(spec.mergeIds ?? [])];
    for (const id of ids) {
      if (mediaById[id]) continue;
      const imgs = imagePaths(fetches[id]);
      const folder = `${id}-${fetches[id].joomlaSlug}`;
      console.log(`Media #${id}: ${imgs.length} images`);
      mediaById[id] = await downloadImages(imgs, join(MEDIA_ROOT, folder), skipDownload);
    }
  }

  const newItems = [];
  for (const spec of activeCohort) {
    const record = buildRecord(spec, fetches, mediaById, today);
    if (existingSlugs.has(record.slug)) {
      throw new Error(`Slug collision: ${record.slug} (Joomla #${spec.id})`);
    }
    newItems.push(record);
  }

  const items = [...(existing.items ?? []), ...newItems];
  items.sort((a, b) => b.publishDate.localeCompare(a.publishDate) || b.id.localeCompare(a.id));

  writeJsonFile(OUT_JSON, {
    version: '1.2.0',
    updated: today,
    note: 'Phase 2 B1+B2 — 17 publish-ready records migrated locally (B1: 9 FY2568/FY2567; B2: 8 FY2567/FY2566). EN translation pending. Merged #62→#63, #40→#39.',
    items,
  });

  console.log(`Appended ${newItems.length} B2 activities (${items.length} total) → ${OUT_JSON}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
