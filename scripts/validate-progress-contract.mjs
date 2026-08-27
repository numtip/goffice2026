#!/usr/bin/env node
/**
 * validate-progress-contract.mjs — GOFFICE2026 D1 progress contract validation
 * ===========================================================================
 * Validates the canonical FY2569 indicator-progress registry and the generated
 * category-progress dataset against:
 *
 *   - exactly 65 canonical indicators (one record each, no extras, no orphans)
 *   - year-scoped FY2569 only (no FY2568 leakage)
 *   - blueprint §5.1/§5.2 enums (progressStatus / evidenceStatus are separate)
 *   - source traceability (non-unavailable status ⇒ non-null source.ref)
 *   - generated aggregation reproducible from the registry (blueprint §17.7)
 *
 * Authority: docs/blueprint/GOFFICE2026_DASHBOARD_PROGRESS_BLUEPRINT_V1.md
 * Usage:     node scripts/validate-progress-contract.mjs
 * Exit code: 0 on full pass, 1 on any failure.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const REGISTRY_PATH = join(ROOT, 'src/data/progress/indicator-progress-2569.json');
const GENERATED_PATH = join(ROOT, 'src/data/generated/category-progress-2569.json');
const INDICATORS_PATH = join(ROOT, 'src/data/criteria/indicators.json');
const CATEGORIES_PATH = join(ROOT, 'src/data/criteria/categories.json');
const ISSUES_PATH = join(ROOT, 'src/data/criteria/issues.json');

// ── Canonical enums (blueprint §5.1 / §5.2) ─────────────────────
// Keep in sync with src/utils/progress-model.ts (TS mirror).
export const PROGRESS_STATUSES = [
  'ready',
  'in_progress',
  'not_started',
  'unavailable',
  'not_applicable',
];

export const EVIDENCE_STATUSES = [
  'verified',
  'available_unverified',
  'pending',
  'unavailable',
  'not_applicable',
];

export const EXPECTED_YEAR = 2569;
export const SCHEMA_VERSION = '1.0.0';
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TODAY = new Date().toISOString().slice(0, 10);

// ── Helpers ─────────────────────────────────────────────────────

function round1(value) {
  return Math.round(value * 10) / 10;
}

function countByStatus(items) {
  const counts = { ready: 0, inProgress: 0, notStarted: 0, unavailable: 0, notApplicable: 0 };
  for (const item of items) {
    if (item.progressStatus === 'ready') counts.ready += 1;
    else if (item.progressStatus === 'in_progress') counts.inProgress += 1;
    else if (item.progressStatus === 'not_started') counts.notStarted += 1;
    else if (item.progressStatus === 'not_applicable') counts.notApplicable += 1;
    else counts.unavailable += 1;
  }
  return counts;
}

function buildSummary(items) {
  const total = items.length;
  const counts = countByStatus(items);
  const applicable = total - counts.notApplicable;
  const readyRate = applicable > 0 ? round1((counts.ready / applicable) * 100) : 0;
  return {
    total,
    applicable,
    ready: counts.ready,
    inProgress: counts.inProgress,
    notStarted: counts.notStarted,
    unavailable: counts.unavailable,
    notApplicable: counts.notApplicable,
    readyRate,
  };
}

/** Evidence-status counts (blueprint §5.2) — separate semantics from progress. */
function buildEvidenceCounts(items) {
  const counts = { verified: 0, availableUnverified: 0, pending: 0, unavailable: 0, notApplicable: 0 };
  for (const item of items) {
    if (item.evidenceStatus === 'verified') counts.verified += 1;
    else if (item.evidenceStatus === 'available_unverified') counts.availableUnverified += 1;
    else if (item.evidenceStatus === 'pending') counts.pending += 1;
    else if (item.evidenceStatus === 'not_applicable') counts.notApplicable += 1;
    else counts.unavailable += 1;
  }
  return counts;
}

/** Issue-level progress summaries from records grouped by canonical issue id. */
function buildIssueSummaries(records, codeToIssue) {
  const byIssue = new Map();
  for (const r of records) {
    const issueId = codeToIssue.get(String(r.indicator));
    if (!issueId) continue;
    if (!byIssue.has(issueId)) byIssue.set(issueId, []);
    byIssue.get(issueId).push(r);
  }
  return Array.from(byIssue.entries())
    .map(([id, recs]) => ({ id, ...buildSummary(recs) }))
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
}

/**
 * Aggregates the registry bottom-up (Indicator → Issue → Category → Overall,
 * blueprint §7.3) using the canonical criteria taxonomy.
 * Shared with scripts/generate-category-progress-2569.mjs.
 */
export function computeAggregation(registry, indicators, categories) {
  const records = registry.items ?? [];
  const codeToCat = new Map();
  const codeToIssue = new Map();
  for (const ind of indicators) {
    codeToCat.set(String(ind.code), {
      categoryId: String(ind.categoryId),
      categoryCode: String(ind.categoryCode),
    });
    codeToIssue.set(String(ind.code), String(ind.issueCode));
  }
  const byCategory = new Map(); // categoryId -> records[]
  for (const record of records) {
    const cat = codeToCat.get(String(record.indicator));
    if (!cat) continue;
    if (!byCategory.has(cat.categoryId)) byCategory.set(cat.categoryId, []);
    byCategory.get(cat.categoryId).push(record);
  }
  const overall = { ...buildSummary(records), evidence: buildEvidenceCounts(records) };
  const categorySummaries = (categories ?? [])
    .slice()
    .sort((a, b) => Number(a.id) - Number(b.id))
    .map((cat) => {
      const catRecords = byCategory.get(String(cat.id)) ?? [];
      return {
        id: String(cat.id),
        code: String(cat.code),
        ...buildSummary(catRecords),
        evidence: buildEvidenceCounts(catRecords),
        issues: buildIssueSummaries(catRecords, codeToIssue),
      };
    });
  return { overall, categories: categorySummaries };
}

// ── Validation ──────────────────────────────────────────────────

export function validateProgressContract(registry, generated, indicators, categories, issues) {
  const errors = [];
  const canonicalCodes = indicators.map((ind) => String(ind.code));
  const canonicalSet = new Set(canonicalCodes);

  if (!registry || typeof registry !== 'object') {
    return ['registry root must be an object'];
  }
  if (registry.schemaVersion !== SCHEMA_VERSION) {
    errors.push(`registry schemaVersion must be ${SCHEMA_VERSION}, got ${registry.schemaVersion}`);
  }
  if (registry.year !== EXPECTED_YEAR) {
    errors.push(`registry year must be ${EXPECTED_YEAR}, got ${registry.year}`);
  }
  if (!Array.isArray(registry.items)) {
    return [...errors, 'registry items must be an array'];
  }

  const items = registry.items;
  if (items.length !== canonicalCodes.length) {
    errors.push(`registry must contain exactly ${canonicalCodes.length} indicator records, got ${items.length}`);
  }

  const seen = new Set();
  for (const record of items) {
    const code = record && String(record.indicator);
    if (!code) {
      errors.push('record missing indicator code');
      continue;
    }
    if (!canonicalSet.has(code)) {
      errors.push(`indicator "${code}" is not a canonical criteria indicator`);
    }
    if (seen.has(code)) {
      errors.push(`duplicate indicator record: ${code}`);
    }
    seen.add(code);

    if (record.year !== EXPECTED_YEAR) {
      errors.push(`${code}: year must be ${EXPECTED_YEAR} (no FY2568 leakage), got ${record.year}`);
    }
    if (!PROGRESS_STATUSES.includes(record.progressStatus)) {
      errors.push(`${code}: invalid progressStatus "${record.progressStatus}" (expected ${PROGRESS_STATUSES.join('|')})`);
    }
    if (!EVIDENCE_STATUSES.includes(record.evidenceStatus)) {
      errors.push(`${code}: invalid evidenceStatus "${record.evidenceStatus}" (expected ${EVIDENCE_STATUSES.join('|')})`);
    }
    const src = record.source;
    if (!src || typeof src !== 'object' || typeof src.type !== 'string' || !src.type) {
      errors.push(`${code}: source.type must be a non-empty string`);
    }
    if (src && src.ref !== null && typeof src.ref !== 'string') {
      errors.push(`${code}: source.ref must be a string or null`);
    }
    if (typeof record.updatedAt !== 'string' || !ISO_DATE_RE.test(record.updatedAt)) {
      errors.push(`${code}: updatedAt must be ISO date YYYY-MM-DD, got "${record.updatedAt}"`);
    } else if (record.updatedAt > TODAY) {
      errors.push(`${code}: updatedAt "${record.updatedAt}" is in the future`);
    }
    // Traceability invariant (blueprint §17): any non-unavailable status must
    // point at a real source; unavailable must not carry a fabricated ref.
    const nonDefault = record.progressStatus !== 'unavailable' || record.evidenceStatus !== 'unavailable';
    if (nonDefault && (!src || src.type === 'unavailable' || !src.ref)) {
      errors.push(`${code}: non-unavailable status requires a traceable source (source.ref)`);
    }
    if (!nonDefault && src && src.type !== 'unavailable') {
      errors.push(`${code}: unavailable status must keep source.type === "unavailable" (do not attach unverified refs)`);
    }
  }

  // Coverage: every canonical indicator must have exactly one record.
  const missing = canonicalCodes.filter((code) => !seen.has(code));
  if (missing.length > 0) {
    errors.push(`canonical indicators missing from registry: ${missing.join(', ')}`);
  }

  // Generated dataset must exist and match a fresh aggregation (reproducible).
  if (!generated || typeof generated !== 'object') {
    return [...errors, 'generated category-progress dataset missing or invalid'];
  }
  if (generated.schemaVersion !== SCHEMA_VERSION) {
    errors.push(`generated schemaVersion must be ${SCHEMA_VERSION}, got ${generated.schemaVersion}`);
  }
  if (generated.year !== EXPECTED_YEAR) {
    errors.push(`generated year must be ${EXPECTED_YEAR}, got ${generated.year}`);
  }
  if (!Array.isArray(generated.categories) || generated.categories.length !== categories.length) {
    errors.push(`generated must contain ${categories.length} categories, got ${generated.categories?.length ?? 0}`);
  }

  const expected = computeAggregation(registry, indicators, categories);
  if (JSON.stringify(generated.overall) !== JSON.stringify(expected.overall)) {
    errors.push(
      `generated.overall is stale — expected ${JSON.stringify(expected.overall)}, got ${JSON.stringify(generated.overall)}`,
    );
  }
  if (JSON.stringify(generated.categories) !== JSON.stringify(expected.categories)) {
    errors.push('generated.categories is stale — run node scripts/generate-category-progress-2569.mjs');
  }

  // Per-category totals must match the canonical taxonomy (18/6/15/5/13/6/2).
  const expectedTotals = computeAggregation(registry, indicators, categories).categories;
  for (const cat of expectedTotals) {
    const genCat = (generated.categories ?? []).find((c) => String(c.id) === cat.id);
    if (!genCat || genCat.total !== cat.total) {
      errors.push(`generated category ${cat.id} total must be ${cat.total} (canonical)`);
    }
  }

  // Evidence counts must be internally consistent (separate semantics, §5.2).
  const evidenceKeys = ['verified', 'availableUnverified', 'pending', 'unavailable', 'notApplicable'];
  const sumEvidence = (e) => evidenceKeys.reduce((s, k) => s + (e?.[k] ?? 0), 0);
  if (sumEvidence(generated?.overall?.evidence) !== (generated?.overall?.total ?? -1)) {
    errors.push('generated.overall.evidence counts must sum to overall.total');
  }
  for (const cat of generated?.categories ?? []) {
    if (sumEvidence(cat.evidence) !== cat.total) {
      errors.push(`generated category ${cat.id} evidence counts must sum to its total`);
    }
  }

  // Issue-level breakdowns must reconcile with category totals and the taxonomy.
  const canonicalIssueIds = new Set((issues ?? []).map((i) => String(i.id)));
  const issueIdsByCategory = new Map();
  for (const iss of issues ?? []) {
    if (!issueIdsByCategory.has(String(iss.categoryId))) issueIdsByCategory.set(String(iss.categoryId), new Set());
    issueIdsByCategory.get(String(iss.categoryId)).add(String(iss.id));
  }
  for (const cat of generated?.categories ?? []) {
    const issuesArr = cat.issues ?? [];
    if (!Array.isArray(issuesArr)) {
      errors.push(`generated category ${cat.id} issues must be an array`);
      continue;
    }
    const issueTotal = issuesArr.reduce((s, iss) => s + (iss.total ?? 0), 0);
    if (issueTotal !== cat.total) {
      errors.push(`generated category ${cat.id} issue totals must sum to ${cat.total}, got ${issueTotal}`);
    }
    const allowed = issueIdsByCategory.get(String(cat.id)) ?? new Set();
    for (const iss of issuesArr) {
      if (!canonicalIssueIds.has(String(iss.id)) || !allowed.has(String(iss.id))) {
        errors.push(`generated category ${cat.id} has invalid issue id "${iss.id}"`);
      }
      const s = ['ready', 'inProgress', 'notStarted', 'unavailable', 'notApplicable']
        .reduce((acc, k) => acc + (iss[k] ?? 0), 0);
      if (s !== iss.total) {
        errors.push(`generated issue ${iss.id} status counts must sum to its total ${iss.total}`);
      }
    }
  }

  return errors;
}

function main() {
  if (!existsSync(REGISTRY_PATH)) {
    console.error('Missing registry:', REGISTRY_PATH);
    console.error('Expected: src/data/progress/indicator-progress-2569.json (canonical D1 baseline).');
    process.exit(1);
  }
  if (!existsSync(GENERATED_PATH)) {
    console.error('Missing generated dataset:', GENERATED_PATH);
    console.error('Run: node scripts/generate-category-progress-2569.mjs');
    process.exit(1);
  }
  const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8'));
  const generated = JSON.parse(readFileSync(GENERATED_PATH, 'utf8'));
  const indicators = JSON.parse(readFileSync(INDICATORS_PATH, 'utf8')).indicators;
  const categories = JSON.parse(readFileSync(CATEGORIES_PATH, 'utf8')).categories;
  const issues = JSON.parse(readFileSync(ISSUES_PATH, 'utf8')).issues;

  const errors = validateProgressContract(registry, generated, indicators, categories, issues);
  if (errors.length > 0) {
    console.error('progress contract validation FAIL');
    errors.forEach((e) => console.error('  ✗', e));
    process.exit(1);
  }

  const agg = computeAggregation(registry, indicators, categories);
  console.log(
    `progress contract validation PASS (year ${EXPECTED_YEAR}, ${registry.items.length} indicators, ` +
      `overall ready=${agg.overall.ready} inProgress=${agg.overall.inProgress} notStarted=${agg.overall.notStarted} ` +
      `unavailable=${agg.overall.unavailable} notApplicable=${agg.overall.notApplicable}, readyRate=${agg.overall.readyRate}%)`,
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
