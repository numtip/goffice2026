#!/usr/bin/env node
/**
 * READ-ONLY audit: Joomla Green Office project2 (activities).
 * Merges HTML category listing (authoritative count) with RSS metadata where available.
 *
 * Usage: node scripts/audit-joomla-activities.mjs [--out path]
 */

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeJsonFile } from './lib/serialize-json.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DEFAULT_OUT = join(ROOT, 'src/data/migration/joomla-activities-inventory.json');
const BASE = 'https://researchex.mju.ac.th/goffice/index.php/project2';
const LISTING_URL = `${BASE}?limit=100`;
const RSS_URL = `${BASE}?limit=100&format=feed&type=rss`;

function decodeHtml(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .trim();
}

/** Authoritative article list from category HTML listing. */
function parseHtmlListing(html) {
  const seen = new Map();
  const linkRe = /project2\/(\d+)-([a-z0-9-]+)/gi;
  for (const m of html.matchAll(linkRe)) {
    const id = Number(m[1]);
    const slug = m[2].toLowerCase();
    if (!seen.has(id)) seen.set(id, slug);
  }
  return [...seen.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([id, slug]) => ({ id, slug }));
}

function parseRss(xml) {
  const byId = new Map();
  for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const block = match[1];
    const field = (tag) => {
      const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
      if (!m) return '';
      return decodeHtml(m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1'));
    };
    const link = field('link');
    const id = Number(link.match(/project2\/(\d+)-/)?.[1] ?? 0);
    if (!id) continue;
    const description = field('description');
    const eventDateMatch = description.match(/วันที่[:\s]*([^<]+)/i);
    byId.set(id, {
      titleTh: field('title'),
      rssPubDate: field('pubDate'),
      eventDateHint: eventDateMatch?.[1]?.trim() ?? null,
      hasEmbeddedGallery: /lightgallery|images\/activity/i.test(description),
    });
  }
  return byId;
}

function inferThematicType(title) {
  if (/ประชุม|คณะกรรมการ/.test(title)) return 'committee-meeting';
  if (/อบรม|สัมมนา/.test(title)) return 'training';
  if (/Big [Cc]lean|5ส|Big cleaning/.test(title)) return 'cleaning-5s';
  if (/ECO DAY|Rally|รณรงค์/.test(title)) return 'campaign';
  if (/G-Green|รางวัล|เกียรติ/.test(title)) return 'award';
  if (/ตรวจประเมิน|QA/.test(title)) return 'assessment';
  if (/อพยพ|ไฟไหม้|เพลิง/.test(title)) return 'preparedness';
  if (/พลังงาน|energy/i.test(title)) return 'energy-awareness';
  return 'general';
}

async function main() {
  const outArg = process.argv.indexOf('--out');
  const outPath = outArg !== -1 && process.argv[outArg + 1] ? process.argv[outArg + 1] : DEFAULT_OUT;

  const [htmlRes, rssRes] = await Promise.all([fetch(LISTING_URL), fetch(RSS_URL)]);
  if (!htmlRes.ok) {
    console.error(`HTML listing fetch failed: ${htmlRes.status}`);
    process.exit(1);
  }
  if (!rssRes.ok) {
    console.error(`RSS fetch failed: ${rssRes.status}`);
    process.exit(1);
  }

  const listing = parseHtmlListing(await htmlRes.text());
  const rssById = parseRss(await rssRes.text());

  const items = listing.map(({ id, slug }) => {
    const rss = rssById.get(id);
    const titleTh = rss?.titleTh ?? null;
    return {
      joomlaArticleId: id,
      joomlaSlug: slug,
      joomlaUrl: `${BASE}/${id}-${slug}`,
      joomlaCategory: 'project2',
      titleTh,
      titleSource: titleTh ? 'rss' : 'html-listing-only',
      rssPubDate: rss?.rssPubDate ?? null,
      eventDateHint: rss?.eventDateHint ?? null,
      hasEmbeddedGallery: rss?.hasEmbeddedGallery ?? null,
      thematicTypeHint: titleTh ? inferThematicType(titleTh) : null,
      disposition: 'REVIEW',
      notes: !rss
        ? 'Not in RSS feed — fetch article HTML for title, event date, and media before migration'
        : rss.hasEmbeddedGallery
          ? 'Has lightgallery/images/activity media refs'
          : '',
    };
  });

  const fiscalYears = new Set();
  for (const item of items) {
    const fromTitle = item.titleTh?.match(/25\d{2}/g);
    if (fromTitle) fromTitle.forEach((y) => fiscalYears.add(Number(y)));
    const fromEvent = item.eventDateHint?.match(/25\d{2}/);
    if (fromEvent) fiscalYears.add(Number(fromEvent[1]));
    if (item.joomlaSlug.includes('2023')) fiscalYears.add(2566);
  }

  const articleIds = items.map((i) => i.joomlaArticleId).sort((a, b) => a - b);
  const payload = {
    version: '1.1.0',
    auditedAt: new Date().toISOString().slice(0, 10),
    source: {
      system: 'joomla',
      baseUrl: BASE,
      listingUrl: LISTING_URL,
      rssUrl: RSS_URL,
      readOnly: true,
    },
    relatedSections: [
      {
        id: 'content1',
        label: 'แหล่งเรียนรู้สำนักงานสีเขียว',
        url: 'https://researchex.mju.ac.th/goffice/index.php/content1',
        estimatedArticles: 10,
        note: 'Knowledge articles — separate migration bucket from project2 activities',
      },
    ],
    summary: {
      totalArticlesHtmlListing: listing.length,
      totalArticlesRss: rssById.size,
      articleIdRange: { min: articleIds[0], max: articleIds[articleIds.length - 1] },
      articleIdsPresent: articleIds,
      fiscalYearsRepresented: [...fiscalYears].filter(Boolean).sort((a, b) => b - a),
      joomlaCategoryLabel: 'กิจกรรม',
      urlPattern: '/index.php/project2/{articleId}-{slug}',
      duplicatePubDateObserved: rssById.size > 0 && new Set([...rssById.values()].map((v) => v.rssPubDate)).size === 1,
      missingEnContent: true,
      rssIncomplete: listing.length > rssById.size,
      legacyImageAudit: 'docs/migration/legacy-content/legacy-audit-summary.md (746 activity_image files)',
    },
    dispositionLegend: {
      KEEP: 'Migrate as standalone activity record',
      MERGE: 'Combine with related record(s)',
      EXCLUDE: 'Do not migrate (duplicate, low value, or non-public)',
      REVIEW: 'Requires PO/content-owner review before migration',
    },
    items,
  };

  writeJsonFile(outPath, payload);
  console.log(
    `Joomla activities inventory: ${listing.length} HTML articles (${rssById.size} with RSS metadata) → ${outPath}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
