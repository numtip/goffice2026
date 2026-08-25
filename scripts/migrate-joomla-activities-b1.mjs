#!/usr/bin/env node
/**
 * Phase 2 B1: migrate PO-approved Joomla cohort into activities.json + public media.
 * READ-ONLY on Joomla/OneDrive; writes repo only.
 *
 * Usage: node scripts/migrate-joomla-activities-b1.mjs [--skip-download]
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeJsonFile } from './lib/serialize-json.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FETCH_DIR = join(ROOT, 'src/data/migration/joomla-article-fetch');
const INVENTORY = join(ROOT, 'src/data/migration/joomla-activities-inventory.json');
const OUT_JSON = join(ROOT, 'src/data/content/activities.json');
const MEDIA_ROOT = join(ROOT, 'public/images/activities/migrated');
const JOOMLA_BASE = 'https://researchex.mju.ac.th/goffice';

/** PO-approved primary IDs (62 merged into 63). */
const COHORT = [
  { id: 68, actId: 'ACT-2568-001', category: 'meeting', type: 'committee' },
  { id: 67, actId: 'ACT-2568-002', category: 'campaign', type: 'eco-event' },
  { id: 66, actId: 'ACT-2568-003', category: 'campaign', type: 'community' },
  { id: 65, actId: 'ACT-2568-004', category: 'preparedness', type: 'workshop' },
  { id: 64, actId: 'ACT-2568-005', category: 'campaign', type: 'cleaning' },
  { id: 63, actId: 'ACT-2568-006', category: 'award', type: null, mergeIds: [62] },
  { id: 60, actId: 'ACT-2568-007', category: 'meeting', type: 'committee' },
  { id: 59, actId: 'ACT-2568-008', category: 'meeting', type: 'committee' },
  { id: 57, actId: 'ACT-2567-001', category: 'assessment', type: null },
];

const LISTING_TITLES = {
  56: 'อบรม การเสริมสร้างความรู้ ความเข้าใจด้านสิ่งแวดล้อม ตามเกณฑ์การประเมินสำนักงานสีเขียว',
  55: 'กิจกรรมสร้างความเป็นระเบียบเรียบร้อยในสำนักงาน 5ส',
  43: 'กิจกรรม การเตรียมความพร้อมการอพยพหนีภัย กรณีเกิดเหตุเพลิงไหม้และแผ่นดินไหว',
  40: 'ประชุมเตรียมความพร้อมในการเข้ารับการตรวจประเมิน สำนักงานสีเขียว (Green Office)',
  39: 'อบรมเตรียมความพร้อมก่อนเข้ารับการประเมินสำนักงานสีเขียว (Green Office)',
  36: 'บุคลากร เข้าร่วมฝึกตรวจประเมินการจัดการสิ่งแวดล้อม Green Office (ประเมินภายใน) ประจำปี 2567',
  32: 'ประชุมหารือการระบุประเด็นปัญหาสิ่งแวดล้อมภายในอาคารและนอกอาคารฯ',
  31: 'ประชุมมคณะกรรมการอำนวยการ สำนักงานสีเขียว (Green Office)',
  30: 'ประชุมคณะกรรมการดำเนินงาน  หมวด1',
  29: 'กิจกรรมอบรมให้ความรู้สำนักงานสีเขียว(Green Office)',
  28: 'กิจกรรม Big cleaning day 2023',
  21: 'กิจกรรมปลุกจิตสำนึกการอนุรักษ์พลังงานของสำนักวิจัยฯ',
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
  const fetches = {};
  const mediaById = {};

  for (const spec of COHORT) {
    const ids = [spec.id, ...(spec.mergeIds ?? [])];
    for (const id of ids) {
      if (!fetches[id]) fetches[id] = loadFetch(id);
    }
  }

  for (const spec of COHORT) {
    const ids = [spec.id, ...(spec.mergeIds ?? [])];
    for (const id of ids) {
      if (mediaById[id]) continue;
      const imgs = imagePaths(fetches[id]);
      const folder = `${id}-${fetches[id].joomlaSlug}`;
      console.log(`Media #${id}: ${imgs.length} images`);
      mediaById[id] = await downloadImages(imgs, join(MEDIA_ROOT, folder), skipDownload);
    }
  }

  const items = COHORT.map((spec) => buildRecord(spec, fetches, mediaById, today));
  items.sort((a, b) => b.publishDate.localeCompare(a.publishDate) || b.id.localeCompare(a.id));

  writeJsonFile(OUT_JSON, {
    version: '1.1.0',
    updated: today,
    note: 'Phase 2 B1 — PO-approved Joomla cohort (9 publish-ready records, migrated locally). EN translation pending. Merged Joomla #62 into #63.',
    items,
  });

  console.log(`Wrote ${items.length} activities → ${OUT_JSON}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
