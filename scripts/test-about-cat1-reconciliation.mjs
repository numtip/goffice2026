/**
 * test-about-cat1-reconciliation.mjs
 * About hub ↔ CAT1 canonical mapping, year separation, stale indicator fixes.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const content = JSON.parse(readFileSync(join(ROOT, 'src/data/about/content.json'), 'utf8'));
const pages = JSON.parse(readFileSync(join(ROOT, 'src/data/about/pages.json'), 'utf8'));
const facts = readFileSync(join(ROOT, 'src/components/about/AboutCanonicalFacts.astro'), 'utf8');

const PAGE_INDICATOR_MAP = {
  'about-scope': ['1.1.1'],
  'about-policy': ['1.1.2'],
  'about-goals': ['1.1.3'],
  'about-action-plan': ['1.1.4', '1.6.1'],
  'about-committee': ['1.2.1', '1.2.2'],
};

describe('About hub — canonical CAT1 mapping', () => {
  for (const [pageId, indicators] of Object.entries(PAGE_INDICATOR_MAP)) {
    it(`${pageId} relatedIndicators match CAT1 foundation mapping`, () => {
      const c = content.pages[pageId];
      const p = pages.pages.find((x) => x.id === pageId);
      assert.deepEqual(c.relatedIndicators, indicators);
      assert.deepEqual(p.relatedIndicators, indicators);
    });
  }

  it('about-index explains foundation hub flow', () => {
    const idx = content.pages['about-index'];
    assert.match(idx.noticeEn, /foundation hub/i);
    assert.match(idx.sections[0].bodyEn, /1\.1\.1.*1\.1\.2.*1\.1\.3.*1\.1\.4.*1\.2\.1/);
    assert.match(facts, /data-about-foundation-hub/);
  });

  it('AboutCanonicalFacts wired for all foundation pages', () => {
    for (const pageId of Object.keys(PAGE_INDICATOR_MAP)) {
      assert.match(facts, new RegExp(`pageId === '${pageId}'`));
    }
    assert.match(facts, /pageId === 'about-index'/);
  });
});

describe('About hub — stale wording removed', () => {
  it('scope no longer says OCR unverified as primary notice', () => {
    assert.doesNotMatch(content.pages['about-scope'].noticeEn, /OCR-derived document — area figures require verification/i);
    assert.match(content.pages['about-scope'].noticeEn, /9,873/);
  });

  it('policy notice reflects verified CAT1 dates', () => {
    assert.match(content.pages['about-policy'].noticeEn, /7 Mar 2568/);
    assert.match(content.pages['about-policy'].noticeEn, /25 Mar 2568/);
    assert.doesNotMatch(content.pages['about-policy'].noticeEn, /OCR-derived documents — dates and figures require verification/i);
  });

  it('goals notice uses domain targets not per-person for all domains', () => {
    assert.match(content.pages['about-goals'].noticeEn, /−1\/−3/);
    assert.doesNotMatch(content.pages['about-goals'].noticeEn, /Per-person targets reference/i);
  });

  it('committee no longer waits for PO on 1.2.2 when conclusively MISSING', () => {
    assert.doesNotMatch(content.pages['about-committee'].noticeEn, /Product Owner confirmation needed/i);
    assert.match(content.pages['about-committee'].sections[1].pendingNoteEn, /MISSING/);
  });
});

describe('About hub — FY2568 / FY2569 year separation', () => {
  it('action-plan notice separates FY2568 baseline from FY2569 Excel', () => {
    assert.match(content.pages['about-action-plan'].noticeEn, /FY2568 Historical Baseline/);
    assert.match(content.pages['about-action-plan'].noticeEn, /FY2569/);
  });

  it('action-plan page templates include FY2569 section marker', () => {
    const th = readFileSync(join(ROOT, 'src/pages/about/action-plan.astro'), 'utf8');
    const en = readFileSync(join(ROOT, 'src/pages/en/about/action-plan.astro'), 'utf8');
    assert.match(th, /data-about-fy2569-section/);
    assert.match(en, /data-about-fy2569-section/);
    assert.match(th, /AboutCanonicalFacts/);
  });

  it('does not map action-plan to stale 1.5.1/1.5.2 indicators', () => {
    const inds = content.pages['about-action-plan'].relatedIndicators;
    assert.ok(!inds.includes('1.5.1'));
    assert.ok(!inds.includes('1.5.2'));
  });
});

describe('About hub — no duplicate committee registry', () => {
  it('committee facts and 1.2.1 journey share same presentation module', () => {
    const journey = readFileSync(join(ROOT, 'src/components/indicators/Cat1CommitteeGovernanceJourney.astro'), 'utf8');
    assert.match(facts, /category1-committee-presentation/);
    assert.match(journey, /category1-committee-presentation/);
    assert.match(journey, /\/about\/committee\//);
  });
});
