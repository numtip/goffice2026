import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseBodyEventDate,
  parseThaiDate,
  resolveCanonicalEventDate,
} from './lib/joomla-activity-dates.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function loadFetch(id) {
  return JSON.parse(
    readFileSync(join(ROOT, 'src/data/migration/joomla-article-fetch', `${id}.json`), 'utf8'),
  );
}

describe('joomla-activity-dates', () => {
  it('parseThaiDate converts BE date to ISO', () => {
    const parsed = parseThaiDate('9 มกราคม 2567');
    assert.equal(parsed.iso, '2024-01-09');
    assert.equal(parsed.fiscalYear, 2567);
  });

  it('parseBodyEventDate reads narrative date', () => {
    const parsed = parseBodyEventDate('เมื่อวันที่ 9 กรกฎาคม 2567');
    assert.equal(parsed.iso, '2024-07-09');
  });

  it('#30 — header and body agree; no conflict metadata', () => {
    const resolved = resolveCanonicalEventDate(loadFetch(30));
    assert.equal(resolved.publishDate, '2024-01-09');
    assert.equal(resolved.dateResolution, undefined);
  });

  it('#56 — body date wins over header; conflict preserved', () => {
    const fetch = loadFetch(56);
    assert.equal(fetch.publishDate, '2024-07-11');
    const resolved = resolveCanonicalEventDate(fetch);
    assert.equal(resolved.publishDate, '2024-07-09');
    assert.equal(resolved.dateResolution.conflict, true);
    assert.equal(resolved.dateResolution.headerPublishDate, '2024-07-11');
    assert.equal(resolved.dateResolution.bodyPublishDate, '2024-07-09');
  });

  it('#55 — aligned header/body stays unchanged', () => {
    const resolved = resolveCanonicalEventDate(loadFetch(55));
    assert.equal(resolved.publishDate, '2024-07-05');
    assert.equal(resolved.dateResolution, undefined);
  });
});
