/**
 * progress-model.ts — canonical FY2569 criteria-progress model (D1).
 *
 * Authority: docs/blueprint/GOFFICE2026_DASHBOARD_PROGRESS_BLUEPRINT_V1.md
 *   §5.1 progressStatus enums · §5.2 evidenceStatus enums · §8 canonical contract
 *   §9 generated dataset · §17 source truthfulness rules.
 *
 * Semantics are intentionally separate:
 *   progressStatus  → ความคืบหน้าการดำเนินงาน (where work stands)
 *   evidenceStatus  → ความพร้อมหลักฐาน (what can be proven)
 *   Official 0–4 score belongs to the formal assessment process only.
 *
 * Guardrails: never auto-derive progress from evidence/file presence; never
 * copy FY2568 status forward to FY2569; unknown values remain `unavailable`.
 *
 * Keep the enum arrays in sync with scripts/validate-progress-contract.mjs
 * (plain-Node validator cannot import this TS module).
 */

export const PROGRESS_STATUSES = [
  'ready',
  'in_progress',
  'not_started',
  'unavailable',
  'not_applicable',
] as const;

export type ProgressStatus = (typeof PROGRESS_STATUSES)[number];

export const EVIDENCE_STATUSES = [
  'verified',
  'available_unverified',
  'pending',
  'unavailable',
  'not_applicable',
] as const;

export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number];

/** FY2569 is the only year-scoped progress layer; FY2568 stays a frozen baseline. */
export const PROGRESS_YEAR = 2569 as const;

export interface IndicatorProgressSource {
  /** Where the status came from, e.g. 'repository', 'po-decision', 'unavailable'. */
  type: string;
  /** Exact file path / document reference, or null when unavailable. */
  ref: string | null;
}

export interface IndicatorProgressRecord {
  /** Canonical indicator code from src/data/criteria/indicators.json, e.g. '1.1.1'. */
  indicator: string;
  year: number;
  progressStatus: ProgressStatus;
  evidenceStatus: EvidenceStatus;
  source: IndicatorProgressSource;
  /** ISO date (YYYY-MM-DD) of the last verified update. */
  updatedAt: string;
  owner?: string;
  notes?: string;
}

export interface IndicatorProgressRegistry {
  schemaVersion: string;
  year: number;
  updated: string;
  items: IndicatorProgressRecord[];
}

export interface ProgressCounts {
  total: number;
  applicable: number;
  ready: number;
  inProgress: number;
  notStarted: number;
  unavailable: number;
  notApplicable: number;
  /** ready / applicable × 100 (one decimal); 0 when applicable is 0. */
  readyRate: number;
}

export interface CategoryProgressCounts extends ProgressCounts {
  /** Category id from criteria/categories.json, e.g. '1'. */
  id: string;
  /** Category code from criteria/categories.json, e.g. 'cat1'. */
  code: string;
}

export interface CategoryProgressDataset {
  schemaVersion: string;
  year: number;
  generatedAt: string;
  overall: ProgressCounts;
  categories: CategoryProgressCounts[];
}
