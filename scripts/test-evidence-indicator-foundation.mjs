/**
 * GO-EVIDENCE-1 — indicator & evidence traceability foundation tests
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { searchItems, normalizeQuery } from '../src/utils/search-engine.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CATEGORIES = join(ROOT, 'src/data/criteria/categories.json');
const ISSUES = join(ROOT, 'src/data/criteria/issues.json');
const INDICATORS = join(ROOT, 'src/data/criteria/indicators.json');
const EVIDENCE = join(ROOT, 'src/data/evidence-index.json');
const SEARCH = join(ROOT, 'src/data/search-index.json');

function resolvePublicDocumentHref(item) {
  if (item.status === 'placeholder') return null;
  if (item.realSourceAvailable === false) return null;
  if (!item.path) return null;
  return item.path;
}

function describeEvidencePublicationKind(item) {
  const isPlaceholder = item.status === 'placeholder';
  const sourceOffline = !isPlaceholder && item.realSourceAvailable === false;
  const documentHref = resolvePublicDocumentHref(item);
  if (isPlaceholder) return 'placeholder';
  if (sourceOffline) return 'source-offline';
  if (documentHref) return 'public-static';
  if (item.sharePointUrl) return 'sharepoint';
  return 'metadata-internal';
}

function getEvidenceForIndicator(indicatorCode, items) {
  return items.filter(
    (item) =>
      item.traceabilityLevel === 'indicator' &&
      Array.isArray(item.indicatorCodes) &&
      item.indicatorCodes.includes(indicatorCode),
  );
}

describe('canonical taxonomy counts', () => {
  it('matches 7 / 24 / 65', () => {
    const categories = JSON.parse(readFileSync(CATEGORIES, 'utf8')).categories;
    const issues = JSON.parse(readFileSync(ISSUES, 'utf8')).issues;
    const indicators = JSON.parse(readFileSync(INDICATORS, 'utf8')).indicators;
    assert.equal(categories.length, 7);
    assert.equal(issues.length, 24);
    assert.equal(indicators.length, 65);
  });
});

describe('indicator static routes', () => {
  const indicators = JSON.parse(readFileSync(INDICATORS, 'utf8')).indicators;

  it('TH and EN indicator pages use shared traceability marker', () => {
    const thPage = join(ROOT, 'src/pages/indicators/[code].astro');
    const enPage = join(ROOT, 'src/pages/en/indicators/[code].astro');
    assert.ok(existsSync(thPage));
    assert.ok(existsSync(enPage));
    assert.match(readFileSync(thPage, 'utf8'), /IndicatorTraceabilityExperience/);
    assert.match(readFileSync(enPage, 'utf8'), /IndicatorTraceabilityExperience/);
  });

  it('indicator hub pages exist TH/EN', () => {
    assert.ok(existsSync(join(ROOT, 'src/pages/indicators/index.astro')));
    assert.ok(existsSync(join(ROOT, 'src/pages/en/indicators/index.astro')));
  });

  it('one static path per indicator code', () => {
    assert.equal(indicators.length, 65);
    const codes = new Set(indicators.map((i) => i.code));
    assert.equal(codes.size, 65);
  });
});

describe('evidence link contract', () => {
  const items = JSON.parse(readFileSync(EVIDENCE, 'utf8')).items;

  it('placeholder never resolves public document href', () => {
    const placeholder = items.find((i) => i.status === 'placeholder');
    assert.ok(placeholder);
    assert.equal(resolvePublicDocumentHref(placeholder), null);
  });

  it('realSourceAvailable false never resolves public document href', () => {
    const offline = items.find((i) => i.realSourceAvailable === false && i.status !== 'placeholder');
    assert.ok(offline);
    assert.equal(resolvePublicDocumentHref(offline), null);
    assert.equal(describeEvidencePublicationKind(offline), 'source-offline');
  });

  it('getEvidenceForIndicator returns only indicator-level rows', () => {
    const linked = getEvidenceForIndicator('3.2.2', items);
    assert.ok(linked.length > 0);
    for (const row of linked) {
      assert.equal(row.traceabilityLevel, 'indicator');
      assert.ok(row.indicatorCodes?.includes('3.2.2'));
    }
  });

  it('implementation notes derive from registry verification only', () => {
    const linked = getEvidenceForIndicator('3.2.2', items);
    const notes = linked
      .map((i) => (i.verification?.basis || '').trim())
      .filter(Boolean);
    assert.ok(notes.length > 0);
    assert.match(notes[0], /3\.2\.2/);
  });
});

describe('search — indicator code boost', () => {
  const searchIndex = JSON.parse(readFileSync(SEARCH, 'utf8'));

  it('exact indicator code ranks assessment indicator first', () => {
    const terms = normalizeQuery('3.2.2');
    const hits = searchItems(searchIndex.items, terms, 'en');
    assert.ok(hits.length > 0);
    assert.equal(hits[0].item.section, 'assessment');
    assert.equal(hits[0].item.type, 'indicator');
    assert.equal(hits[0].item.id, '3.2.2');
  });
});

describe('traceability utility module exports', () => {
  it('evidence-traceability.ts exposes publication helpers', () => {
    const src = readFileSync(join(ROOT, 'src/utils/evidence-traceability.ts'), 'utf8');
    assert.match(src, /resolvePublicDocumentHref/);
    assert.match(src, /implementationNotesForIndicator/);
    assert.match(src, /countCanonicalTaxonomy/);
  });
});
