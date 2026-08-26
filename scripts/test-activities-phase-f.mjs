import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PHASE_F_MAPPINGS,
  applyPhaseFIndicatorMappings,
  loadIndicatorCodes,
  loadEvidenceIds,
  summarizePhaseFCoverage,
  CANDIDATE_EVIDENCE_BY_ACTIVITY_ID,
} from './lib/activity-phase-f-mapping.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const PROTECTED_FIELDS = [
  'titleTh',
  'titleEn',
  'summaryTh',
  'summaryEn',
  'bodyTh',
  'bodyEn',
  'publishDate',
  'fiscalYear',
  'slug',
  'media',
  'source',
  'translationPending',
];

describe('Phase F — historical activity mapping', () => {
  it('covers all 19 published activities', () => {
    const data = JSON.parse(readFileSync(join(ROOT, 'src/data/content/activities.json'), 'utf8'));
    const published = data.items.filter((i) => i.status === 'published');
    assert.equal(published.length, 19);
    assert.equal(PHASE_F_MAPPINGS.length, 19);
    for (const item of published) {
      assert.ok(PHASE_F_MAPPINGS.some((m) => m.id === item.id), `missing mapping row ${item.id}`);
    }
  });

  it('category mapped 19/19 (migration facets preserved)', () => {
    const data = JSON.parse(readFileSync(join(ROOT, 'src/data/content/activities.json'), 'utf8'));
    for (const row of PHASE_F_MAPPINGS) {
      const item = data.items.find((i) => i.id === row.id);
      assert.ok(item?.category?.id, row.id);
      assert.equal(item.category.id, row.categoryId, `${row.id} category unchanged`);
    }
    assert.equal(summarizePhaseFCoverage().categoryMapped, 19);
  });

  it('indicator codes are canonical and validator-safe (3-part)', () => {
    const codes = loadIndicatorCodes();
    const re = /^\d+\.\d+\.\d+$/;
    for (const row of PHASE_F_MAPPINGS) {
      for (const code of row.relatedIndicators) {
        assert.match(code, re, `${row.id} invalid relatedIndicator format ${code}`);
        assert.ok(codes.has(code), `${row.id} unknown indicator ${code}`);
      }
    }
  });

  it('candidate evidence IDs exist in evidence-index when listed', () => {
    const evidenceIds = loadEvidenceIds();
    for (const [actId, meta] of Object.entries(CANDIDATE_EVIDENCE_BY_ACTIVITY_ID)) {
      for (const evId of meta.ids) {
        assert.ok(evidenceIds.has(evId), `${actId} orphan evidence ${evId}`);
      }
    }
  });

  it('applyPhaseFIndicatorMappings mutates relatedIndicators only', () => {
    const data = JSON.parse(readFileSync(join(ROOT, 'src/data/content/activities.json'), 'utf8'));
    const snapshots = data.items.map((item) => {
      const snap = {};
      for (const key of Object.keys(item)) snap[key] = structuredClone(item[key]);
      return { id: item.id, snap };
    });

    applyPhaseFIndicatorMappings(data);

    for (const { id, snap } of snapshots) {
      const item = data.items.find((i) => i.id === id);
      for (const field of PROTECTED_FIELDS) {
        assert.deepEqual(item[field], snap[field], `${id}.${field} must not change`);
      }
    }

    const mapped = summarizePhaseFCoverage();
    assert.equal(mapped.indicatorMapped, 11);
    assert.equal(mapped.total, 19);
  });

  it('SCHEMA_EXTENSION_REQUIRED — no evidenceIds field on activity records', () => {
    const data = JSON.parse(readFileSync(join(ROOT, 'src/data/content/activities.json'), 'utf8'));
    for (const item of data.items) {
      assert.equal(item.evidenceIds, undefined);
      assert.equal(item.linkedEvidence, undefined);
    }
    assert.ok(Object.keys(CANDIDATE_EVIDENCE_BY_ACTIVITY_ID).length >= 1);
  });

  it('published count remains 19 after mapping apply (in-memory)', () => {
    const data = JSON.parse(readFileSync(join(ROOT, 'src/data/content/activities.json'), 'utf8'));
    applyPhaseFIndicatorMappings(data);
    assert.equal(data.items.filter((i) => i.status === 'published').length, 19);
  });
});
