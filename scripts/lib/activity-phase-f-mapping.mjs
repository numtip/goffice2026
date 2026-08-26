/**
 * Phase F — historical activity → indicator mapping (metadata only).
 * Evidence links require SCHEMA_EXTENSION (no activity.evidenceIds field).
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

/** @typedef {'CONFIRMED'|'SUPPORTED'|'UNRESOLVED'} Confidence */

/**
 * Candidate evidence IDs for audit/documentation — NOT written to activities.json.
 * @type {Record<string, { ids: string[], confidence: Confidence, basis: string }>}
 */
export const CANDIDATE_EVIDENCE_BY_ACTIVITY_ID = {
  'ACT-2568-004': {
    ids: ['ev-cat5-emergency-drill-fy2568'],
    confidence: 'CONFIRMED',
    basis:
      'Activity publishDate 2025-05-30 matches evidence description “Drill 30 May 2568”; indicator 5.5.1.',
  },
  'ACT-2567-003': {
    ids: ['ev-cat5-emergency-drill-fy2568'],
    confidence: 'SUPPORTED',
    basis:
      'FY2567 fire drill activity; FY2568 drill evidence is same indicator family — no FY2567-specific evidence id verified.',
  },
  'ACT-2568-005': {
    ids: ['ev-cat2-campaign-candidate-bigcleaning'],
    confidence: 'SUPPORTED',
    basis:
      'Evidence filename references BigCleaningDay2025; candidate-only, not promoted per evidence-index.',
  },
  'ACT-2567-009': {
    ids: ['ev-cat2-tr-delivery-fy2568'],
    confidence: 'SUPPORTED',
    basis:
      'Training narrative 2.1.1 covers FY2568 sessions; activity is FY2567 — same indicator, different fiscal year.',
  },
};

/**
 * Phase F indicator mappings applied to relatedIndicators[] only.
 * Category facets unchanged (already set at migration).
 * @type {Array<{
 *   id: string,
 *   slug: string,
 *   fiscalYear: number,
 *   categoryId: string,
 *   relatedIndicators: string[],
 *   confidence: Confidence,
 *   basis: string,
 *   unresolvedNote?: string,
 *   candidateEvidenceIds?: string[],
 * }>}
 */
export const PHASE_F_MAPPINGS = [
  {
    id: 'ACT-2568-001',
    slug: 'simina3',
    fiscalYear: 2568,
    categoryId: 'meeting',
    relatedIndicators: [],
    confidence: 'UNRESOLVED',
    basis: 'Steering committee meeting — no explicit 2569 indicator code in body/title beyond committee ops.',
    unresolvedNote: 'Generic committee meeting; not management review (1.7.2) or appointment (1.2.1).',
  },
  {
    id: 'ACT-2568-003',
    slug: 'realy2025',
    fiscalYear: 2568,
    categoryId: 'campaign',
    relatedIndicators: ['2.2.2'],
    confidence: 'SUPPORTED',
    basis: 'Community rally campaign; body describes public environmental awareness event.',
  },
  {
    id: 'ACT-2568-002',
    slug: 'mjuecoday2025',
    fiscalYear: 2568,
    categoryId: 'campaign',
    relatedIndicators: ['2.2.2'],
    confidence: 'SUPPORTED',
    basis: 'Body narrative: eco-day campaign to build conservation awareness (MJU ECO DAY).',
  },
  {
    id: 'ACT-2568-004',
    slug: 'fire2028',
    fiscalYear: 2568,
    categoryId: 'preparedness',
    relatedIndicators: ['5.5.1'],
    confidence: 'CONFIRMED',
    basis: 'Title/body: evacuation preparedness; matches ev-cat5-emergency-drill-fy2568 (30 May 2568).',
    candidateEvidenceIds: ['ev-cat5-emergency-drill-fy2568'],
  },
  {
    id: 'ACT-2568-005',
    slug: 'bigcleaning2025-1',
    fiscalYear: 2568,
    categoryId: 'campaign',
    relatedIndicators: ['2.2.2'],
    confidence: 'SUPPORTED',
    basis: 'Big Cleaning Day campaign; cross-ref ev-cat2-campaign-candidate-bigcleaning filename.',
    candidateEvidenceIds: ['ev-cat2-campaign-candidate-bigcleaning'],
  },
  {
    id: 'ACT-2568-006',
    slug: 'g-green2025mju',
    fiscalYear: 2568,
    categoryId: 'award',
    relatedIndicators: [],
    confidence: 'UNRESOLVED',
    basis: 'External G-Green award ceremony — no 3-part indicator code confidently supported.',
    unresolvedNote: 'Registry 7.2 (advancement) is 2-part and invalid for relatedIndicators validator.',
  },
  {
    id: 'ACT-2568-007',
    slug: 'simina7mar2025',
    fiscalYear: 2568,
    categoryId: 'meeting',
    relatedIndicators: [],
    confidence: 'UNRESOLVED',
    basis: 'Steering committee meeting without explicit management-review or indicator narrative.',
    unresolvedNote: 'Await body narrative linking to 1.7.2 or 1.2.2.',
  },
  {
    id: 'ACT-2568-008',
    slug: 'simina1-2025',
    fiscalYear: 2568,
    categoryId: 'meeting',
    relatedIndicators: ['1.7.2'],
    confidence: 'CONFIRMED',
    basis: 'Body explicitly: ทบทวนนโยบายและขอบเขตการจัดการสิ่งแวดล้อม (management review meeting).',
  },
  {
    id: 'ACT-2567-001',
    slug: 'qa2024',
    fiscalYear: 2567,
    categoryId: 'assessment',
    relatedIndicators: [],
    confidence: 'UNRESOLVED',
    basis: 'External Green Office assessment visit — taxonomy codes 7.1/7.2 are 2-part (invalid in relatedIndicators).',
    unresolvedNote: 'Needs PO schema decision for cat7 assessment indicators or relatedIndicators format widen.',
  },
  {
    id: 'ACT-2567-009',
    slug: 'traininggreen',
    fiscalYear: 2567,
    categoryId: 'training',
    relatedIndicators: ['2.1.1'],
    confidence: 'CONFIRMED',
    basis: 'Title: อบรม...ตามเกณฑ์การประเมินสำนักงานสีเขียว (training delivery per criteria).',
    candidateEvidenceIds: ['ev-cat2-tr-delivery-fy2568'],
  },
  {
    id: 'ACT-2567-002',
    slug: '5s',
    fiscalYear: 2567,
    categoryId: 'campaign',
    relatedIndicators: ['2.2.2'],
    confidence: 'SUPPORTED',
    basis: 'Body: 5ส workplace order campaign as part of Green Office project.',
  },
  {
    id: 'ACT-2567-003',
    slug: 'emergency2024',
    fiscalYear: 2567,
    categoryId: 'preparedness',
    relatedIndicators: ['5.5.1'],
    confidence: 'CONFIRMED',
    basis: 'Title: อพยพหนีภัย เพลิงไหม้และแผ่นดินไหว; disposition FY2567 fire drill.',
    candidateEvidenceIds: ['ev-cat5-emergency-drill-fy2568'],
  },
  {
    id: 'ACT-2567-004',
    slug: 'green-office2',
    fiscalYear: 2567,
    categoryId: 'training',
    relatedIndicators: ['2.1.1'],
    confidence: 'SUPPORTED',
    basis: 'Merged #39+#40 assessment-prep training/meeting; disposition training/workshop.',
  },
  {
    id: 'ACT-2567-005',
    slug: 'green-office-2567',
    fiscalYear: 2567,
    categoryId: 'training',
    relatedIndicators: ['2.1.1'],
    confidence: 'SUPPORTED',
    basis: 'Disposition: Internal audit training FY2567; body describes ฝึกตรวจประเมินภายใน.',
  },
  {
    id: 'ACT-2567-006',
    slug: 'problem',
    fiscalYear: 2567,
    categoryId: 'meeting',
    relatedIndicators: ['1.3.1'],
    confidence: 'CONFIRMED',
    basis: 'Title/body: ประชุมหารือการระบุประเด็นปัญหาสิ่งแวดล้อม (environmental aspects identification).',
  },
  {
    id: 'ACT-2567-007',
    slug: 'activity1-2',
    fiscalYear: 2567,
    categoryId: 'meeting',
    relatedIndicators: [],
    confidence: 'UNRESOLVED',
    basis: 'Steering committee meeting — insufficient explicit indicator narrative.',
    unresolvedNote: 'Generic committee ops meeting.',
  },
  {
    id: 'ACT-2567-008',
    slug: 'activity1',
    fiscalYear: 2567,
    categoryId: 'meeting',
    relatedIndicators: [],
    confidence: 'UNRESOLVED',
    basis: 'Cat1 committee meeting — no explicit management-review or aspects narrative in retained body.',
    unresolvedNote: 'Distinct from ACT-2568-008 which has ทบทวน narrative.',
  },
  {
    id: 'ACT-2566-001',
    slug: 'activity1-6',
    fiscalYear: 2566,
    categoryId: 'training',
    relatedIndicators: ['2.1.1'],
    confidence: 'CONFIRMED',
    basis: 'Title: กิจกรรมอบรมให้ความรู้สำนักงานสีเขียว.',
  },
  {
    id: 'ACT-2566-002',
    slug: 'big',
    fiscalYear: 2566,
    categoryId: 'campaign',
    relatedIndicators: ['2.2.2'],
    confidence: 'SUPPORTED',
    basis: 'Big Cleaning Day 2023 campaign; historical predecessor to FY2568 cleaning events.',
  },
];

export function loadIndicatorCodes() {
  const data = JSON.parse(readFileSync(join(ROOT, 'src/data/criteria/indicators.json'), 'utf8'));
  return new Set(data.indicators.map((i) => i.code));
}

export function loadEvidenceIds() {
  const data = JSON.parse(readFileSync(join(ROOT, 'src/data/evidence-index.json'), 'utf8'));
  return new Set(data.items.map((i) => i.id));
}

export function loadActivitiesCollection() {
  return JSON.parse(readFileSync(join(ROOT, 'src/data/content/activities.json'), 'utf8'));
}

/** Apply relatedIndicators only — never mutates content/media/source fields. */
export function applyPhaseFIndicatorMappings(collection, mappings = PHASE_F_MAPPINGS) {
  const byId = new Map(collection.items.map((item) => [item.id, item]));
  for (const row of mappings) {
    const item = byId.get(row.id);
    if (!item) throw new Error(`Missing activity ${row.id}`);
    item.relatedIndicators = [...row.relatedIndicators];
  }
  return collection;
}

export function summarizePhaseFCoverage(mappings = PHASE_F_MAPPINGS) {
  const categoryMapped = mappings.length; // all 19 have category from migration
  const indicatorMapped = mappings.filter((m) => m.relatedIndicators.length > 0).length;
  const evidenceCandidate = mappings.filter((m) => (m.candidateEvidenceIds?.length ?? 0) > 0).length;
  return { categoryMapped, indicatorMapped, evidenceCandidate, total: mappings.length };
}
