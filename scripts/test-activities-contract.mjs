import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  applyContentFilters,
  getLatestPublished,
  getPublishedItems,
  sortByPublishDateDesc,
} from '../src/utils/content-presentation.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function loadJson(rel) {
  return JSON.parse(readFileSync(join(ROOT, rel), 'utf8'));
}

describe('content-presentation', () => {
  it('sorts by publishDate DESC', () => {
    const items = [
      { id: 'a', publishDate: '2024-01-01' },
      { id: 'b', publishDate: '2025-06-01' },
      { id: 'c', publishDate: '2024-12-01' },
    ];
    const sorted = sortByPublishDateDesc(items);
    assert.equal(sorted[0].id, 'b');
    assert.equal(sorted[1].id, 'c');
    assert.equal(sorted[2].id, 'a');
  });

  it('filters by year and category', () => {
    const items = [
      { fiscalYear: 2568, category: { id: 'campaign' } },
      { fiscalYear: 2569, category: { id: 'meeting' } },
    ];
    const filtered = applyContentFilters(items, { year: 2568, category: 'campaign' });
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].fiscalYear, 2568);
  });

  it('activities.json and news.json are valid collections', () => {
    for (const file of ['src/data/content/activities.json', 'src/data/content/news.json']) {
      const data = loadJson(file);
      assert.ok(Array.isArray(data.items));
    }
  });

  it('getLatestPublished returns at most 3 published', () => {
    const collection = {
      version: '1',
      updated: '2026-08-25',
      items: [
        { id: '1', status: 'published', publishDate: '2026-01-01' },
        { id: '2', status: 'draft', publishDate: '2026-02-01' },
        { id: '3', status: 'published', publishDate: '2026-03-01' },
        { id: '4', status: 'published', publishDate: '2026-04-01' },
        { id: '5', status: 'published', publishDate: '2026-05-01' },
      ],
    };
    const latest = getLatestPublished(collection, 3);
    assert.equal(latest.length, 3);
    assert.equal(latest[0].id, '5');
  });

  it('getPublishedItems excludes drafts', () => {
    const collection = {
      version: '1',
      updated: '2026-08-25',
      items: [
        { id: '1', status: 'draft', publishDate: '2026-01-01' },
        { id: '2', status: 'published', publishDate: '2026-02-01' },
      ],
    };
    assert.equal(getPublishedItems(collection).length, 1);
  });

  it('Phase 3B B3 — 25 published (19 historical Joomla + 6 FY2569)', () => {
    const data = loadJson('src/data/content/activities.json');
    const published = getPublishedItems(data);
    assert.equal(published.length, 25);

    const historical = published.filter((i) => !String(i.id).startsWith('ACT-2569-'));
    assert.equal(historical.length, 19);

    const act30 = historical.find((i) => i.source?.joomlaArticleId === 30);
    const act56 = historical.find((i) => i.source?.joomlaArticleId === 56);
    const act59 = historical.find((i) => i.source?.joomlaArticleId === 59);

    assert.ok(act30, 'Joomla #30 migrated');
    assert.equal(act30.slug, 'activity1');
    assert.equal(act30.publishDate, '2024-01-09');
    assert.notEqual(act30.id, act59?.id);

    assert.ok(act56, 'Joomla #56 migrated');
    assert.equal(act56.slug, 'traininggreen');
    assert.equal(act56.publishDate, '2024-07-09');
    assert.equal(act56.source.dateResolution.headerPublishDate, '2024-07-11');
    assert.equal(act56.media.length, 10);
    assert.equal(act30.media.length, 5);
  });
});
