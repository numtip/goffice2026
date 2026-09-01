/**
 * test-cat1-fy2569-owner-status.mjs
 * ==================================
 * FY2569 Cat1 owner-approved status + Cat3 plan evidence regression suite.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { fy2569StatusView } from '../src/utils/fy2569-status-vm.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROGRESS_JSON = join(ROOT, 'src/data/progress/indicator-progress-2569.json');
const GENERATED_GHG_JSON = join(ROOT, 'src/data/generated/ghg.json');
const CATEGORY_PROGRESS_JSON = join(ROOT, 'src/data/generated/category-progress-2569.json');
const INDICATORS_JSON = join(ROOT, 'src/data/criteria/indicators.json');

const progress = JSON.parse(readFileSync(PROGRESS_JSON, 'utf8'));
const ghgData = JSON.parse(readFileSync(GENERATED_GHG_JSON, 'utf8'));
const catProgress = JSON.parse(readFileSync(CATEGORY_PROGRESS_JSON, 'utf8'));
const indicators = JSON.parse(readFileSync(INDICATORS_JSON, 'utf8')).indicators;

function find(code) {
  return progress.items.find(i => i.indicator === code);
}

const CAT1_CODES = indicators
  .map(i => i.code)
  .filter(c => c.startsWith('1.'));

describe('Cat1 source-approved indicators retain correct status', () => {
  it('1.1.1: ready / available_unverified (scope)', () => {
    const item = find('1.1.1');
    assert.ok(item, '1.1.1 exists in registry');
    assert.equal(item.progressStatus, 'ready');
    assert.equal(item.evidenceStatus, 'available_unverified');
  });

  it('1.1.2: in_progress / available_unverified (policy)', () => {
    const item = find('1.1.2');
    assert.ok(item);
    assert.equal(item.progressStatus, 'in_progress');
    assert.equal(item.evidenceStatus, 'available_unverified');
  });

  it('1.1.3: in_progress / available_unverified (targets)', () => {
    const item = find('1.1.3');
    assert.ok(item);
    assert.equal(item.progressStatus, 'in_progress');
    assert.equal(item.evidenceStatus, 'available_unverified');
  });

  it('1.2.1: ready / available_unverified (committee)', () => {
    const item = find('1.2.1');
    assert.ok(item);
    assert.equal(item.progressStatus, 'ready');
    assert.equal(item.evidenceStatus, 'available_unverified');
  });
});

describe('1.1.4: plan exists but internal details in progress → partial', () => {
  it('progressStatus changed to in_progress (was ready)', () => {
    const item = find('1.1.4');
    assert.ok(item);
    assert.equal(item.progressStatus, 'in_progress');
    assert.equal(item.evidenceStatus, 'available_unverified');
  });

  it('notes reflect partial status and plan-not-result disclaimer', () => {
    const item = find('1.1.4');
    assert.ok(item.notes.toLowerCase().includes('partial'));
  });

  it('TH badge renders "กำลังดำเนินการ (บางส่วน)" for 1.1.4', () => {
    const th = fy2569StatusView('1.1.4', 'th');
    assert.equal(th.kind, 'partial');
    assert.equal(th.badge, 'กำลังดำเนินการ (บางส่วน)');
    const en = fy2569StatusView('1.1.4', 'en');
    assert.equal(en.kind, 'partial');
    assert.ok(en.badge.toLowerCase().includes('progress'));
  });
});

describe('1.5.1/1.5.2: cite authoritative FY2569 GHG workbook', () => {
  it('1.5.1: in_progress citing generated/ghg.json', () => {
    const item = find('1.5.1');
    assert.ok(item);
    assert.equal(item.progressStatus, 'in_progress');
    assert.equal(item.evidenceStatus, 'available_unverified');
    assert.equal(item.source.type, 'repository');
    assert.equal(item.source.ref, 'src/data/generated/ghg.json');
  });

  it('1.5.2: in_progress citing same canonical GHG', () => {
    const item = find('1.5.2');
    assert.ok(item);
    assert.equal(item.progressStatus, 'in_progress');
    assert.equal(item.evidenceStatus, 'available_unverified');
    assert.equal(item.source.type, 'repository');
    assert.equal(item.source.ref, 'src/data/generated/ghg.json');
  });

  it('1.5.1 and 1.5.2 share same source ref', () => {
    const i151 = find('1.5.1');
    const i152 = find('1.5.2');
    assert.equal(i151.source.ref, i152.source.ref);
  });

  it('Dashboard GHG total matches 1.5.1 notes canonical value', () => {
    const year2569 = ghgData.years['2569'];
    assert.ok(year2569);
    const dashboardTotal = year2569.total;
    const i151 = find('1.5.1');
    assert.ok(i151.notes.includes(String(dashboardTotal)));
  });

  it('Dashboard GHG provenance SHA present in 1.5.1/1.5.2 notes', () => {
    const sha = ghgData.years['2569'].provenance.sourceSha256;
    const i151 = find('1.5.1');
    const i152 = find('1.5.2');
    // Notes include truncated SHA prefix (first 8 chars visible: "d0a75e4c...")
    assert.ok(i151.notes.includes(sha.substring(0, 8)));
    assert.ok(i152.notes.includes(sha.substring(0, 8)));
  });
});

describe('1.6.1: not in owner-approved set → unavailable', () => {
  it('1.6.1: unavailable/unavailable', () => {
    const item = find('1.6.1');
    assert.ok(item);
    assert.equal(item.progressStatus, 'unavailable');
    assert.equal(item.evidenceStatus, 'unavailable');
  });
});
