#!/usr/bin/env node
/**
 * READ-ONLY fetch + parse Joomla project2 article pages.
 * Usage: node scripts/fetch-joomla-article.mjs [id...]
 *        node scripts/fetch-joomla-article.mjs --all-review
 *        node scripts/fetch-joomla-article.mjs --cohort
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const INVENTORY = join(ROOT, 'src/data/migration/joomla-activities-inventory.json');
const OUT_DIR = join(ROOT, 'src/data/migration/joomla-article-fetch');
const BASE = 'https://researchex.mju.ac.th/goffice';

const THAI_MONTHS = {
  มกราคม: 1,
  กุมภาพันธ์: 2,
  มีนาคม: 3,
  เมษายน: 4,
  พฤษภาคม: 5,
  มิถุนายน: 6,
  กรกฎาคม: 7,
  สิงหาคม: 8,
  กันยายน: 9,
  ตุลาคม: 10,
  พฤศจิกายน: 11,
  ธันวาคม: 12,
};

const COHORT = [68, 67, 66, 65, 64, 63, 62, 60, 59, 57];
const REVIEW = [56, 55, 43, 40, 39, 36, 32, 31, 30, 29, 28, 21];

function decodeHtml(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function stripTags(html) {
  let t = decodeHtml(html);
  const openIdx = t.lastIndexOf('<');
  if (openIdx >= 0 && !t.slice(openIdx).includes('>')) {
    t = t.slice(0, openIdx);
  }
  return t.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseThaiDate(text) {
  if (!text) return null;
  const cleaned = decodeHtml(text).replace(/\s+/g, ' ');
  const be = cleaned.match(/(\d{1,2})\s+([^\d\s]+)\s+(25\d{2})/);
  if (be) {
    const day = Number(be[1]);
    const month = THAI_MONTHS[be[2]];
    const yearBe = Number(be[3]);
    if (!month) return { raw: cleaned, iso: null, fiscalYear: yearBe };
    const yearCe = yearBe - 543;
    const iso = `${yearCe}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return { raw: cleaned, iso, fiscalYear: yearBe };
  }
  const ce = cleaned.match(/(\d{1,2})\s+([^\d\s]+)\s+(20\d{2})/);
  if (ce) {
    const day = Number(ce[1]);
    const month = THAI_MONTHS[ce[2]];
    const yearCe = Number(ce[3]);
    if (!month) return { raw: cleaned, iso: null, fiscalYear: yearCe + 543 };
    const iso = `${yearCe}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return { raw: cleaned, iso, fiscalYear: yearCe + 543 };
  }
  return { raw: cleaned, iso: null, fiscalYear: null };
}

function parseArticleHtml(html, meta) {
  const titleMatch =
    html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
    html.match(/class="item-title"[^>]*>([\s\S]*?)<\//i);
  const titleTh = titleMatch ? stripTags(titleMatch[1]) : meta.titleTh ?? null;

  let eventDateRaw = null;
  let eventDate = null;
  const datePatterns = [
    /วันที่\s*:?\s*<\/h5>\s*([\s\S]*?)<\//i,
    /วันที่\s*:?\s*([^<\n]+)/i,
    /<h5>\s*วันที่\s*:?\s*([^<]+)<\/h5>/i,
  ];
  for (const re of datePatterns) {
    const m = html.match(re);
    if (m) {
      eventDateRaw = stripTags(m[1]);
      eventDate = parseThaiDate(eventDateRaw);
      break;
    }
  }

  let bodyTh = '';
  const contentMatch = html.match(/เนื้อหา\s*:?\s*<\/h6>\s*([\s\S]*?)(?:<\/div>\s*<\/div>|กลุ่มสำนักงาน|Posted in|<footer)/i);
  if (contentMatch) {
    bodyTh = stripTags(contentMatch[1]);
  } else {
    const alt = html.match(/<div class="item-page[\s\S]*?<\/h[1-6][^>]*>[\s\S]*?<p>([\s\S]*?)<\/div>/i);
    if (alt) bodyTh = stripTags(alt[1]);
  }

  const mediaPaths = new Set();
  for (const m of html.matchAll(/images\/activity\/[a-zA-Z0-9_\-./]+/g)) {
    mediaPaths.add(m[0].replace(/\/+$/, ''));
  }
  for (const m of html.matchAll(/\{lightgallery[^}]*path=([^}\s]+)/g)) {
    mediaPaths.add(m[1].replace(/\/+$/, ''));
  }
  for (const m of html.matchAll(/media\/widgetkit\/[a-zA-Z0-9_\-./]+/g)) {
    mediaPaths.add(m[0]);
  }

  const lightGalleryFolders = [...mediaPaths].filter((p) => !p.includes('.'));

  return {
    joomlaArticleId: meta.joomlaArticleId,
    joomlaSlug: meta.joomlaSlug,
    joomlaUrl: meta.joomlaUrl,
    titleTh,
    eventDateRaw: eventDate?.raw ?? eventDateRaw,
    publishDate: eventDate?.iso ?? null,
    fiscalYear: eventDate?.fiscalYear ?? null,
    bodyTh: bodyTh.slice(0, 8000),
    mediaPaths: [...mediaPaths],
    lightGalleryFolders,
    fetchedAt: new Date().toISOString().slice(0, 10),
  };
}

async function fetchArticle(item) {
  const url = item.joomlaUrl;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  const html = await res.text();
  return parseArticleHtml(html, item);
}

async function main() {
  const inventory = JSON.parse(readFileSync(INVENTORY, 'utf8'));
  const byId = new Map(inventory.items.map((i) => [i.joomlaArticleId, i]));

  let ids = process.argv.slice(2).map(Number).filter(Boolean);
  if (process.argv.includes('--all-review')) ids = REVIEW;
  if (process.argv.includes('--cohort')) ids = COHORT;
  if (process.argv.includes('--all')) ids = [...COHORT, ...REVIEW.filter((id) => !COHORT.includes(id))];

  mkdirSync(OUT_DIR, { recursive: true });
  const results = [];

  for (const id of ids) {
    const meta = byId.get(id);
    if (!meta) {
      console.error(`Unknown id ${id}`);
      continue;
    }
    try {
      const parsed = await fetchArticle(meta);
      const outPath = join(OUT_DIR, `${id}.json`);
      writeFileSync(outPath, `${JSON.stringify(parsed, null, 2)}\n`, 'utf8');
      results.push(parsed);
      console.log(`OK ${id} ${parsed.publishDate ?? 'no-date'} ${parsed.titleTh?.slice(0, 50)}`);
    } catch (err) {
      console.error(`FAIL ${id}: ${err.message}`);
    }
  }

  const summaryPath = join(OUT_DIR, '_summary.json');
  writeFileSync(summaryPath, `${JSON.stringify(results, null, 2)}\n`, 'utf8');
}

main();
