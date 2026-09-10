// ── Pipeline Status ────────────────────────────────────────────────────────
// Explicit pipeline states for data lifecycle tracking.
export type DataStatus =
  | 'VERIFIED_BASELINE'        // 2568 baseline — extracted from real XLSX, validated, frozen
  | 'TARGET_PENDING_APPROVAL'  // 2569 target — not yet approved by authorized staff
  | 'CURRENT_DATA_PENDING'     // 2569 actual — source data not yet available
  | 'complete'                 // All 12 months of data present
  | 'in_progress'              // Partial monthly data available
  | 'missing';                 // No data at all

// ── Target Status — criteria-aligned progress tracking ────────────────────
export type MetricTargetStatus = 'on-track' | 'off-track' | 'no-target' | 'insufficient-data';

// ── Data Classification — provenance-based confidence tier ────────────────
// Explicit classification of how a year's data was obtained, replacing
// fragile string-matching (e.g. checking for the word "placeholder").
export type DataClassification =
  | 'CONFIRMED_XLSX'      // Verified directly against a source XLSX present in the repo
  | 'DERIVED_FROM_CSV'    // Imported from CSV only, no XLSX available for reconciliation (unverified)
  | 'PRESERVED_LEGACY'    // Carried over from an earlier extraction; source XLSX is missing and cannot be re-verified
  | 'PLACEHOLDER'         // Known placeholder/demo values, not real measurements
  | 'MANUAL_ENTRY'        // Entered directly by staff, not derived from a workbook
  | 'WAITING_FOR_INPUT'   // FY2569 workbook staged but canonical ranges hold no observations yet (template copy)
  | 'INVALID_SOURCE_DATA' // Canonical range contains unparseable/inconsistent source values
  | 'UNKNOWN';            // Origin cannot be determined

// ── Dataset State — Phase 2 sync lifecycle (GO-DATA-3) ────────────────────
// Derived from canonical FY2569 input ranges. Missing months are never zero.
export type DatasetState =
  | 'WAITING_FOR_INPUT'      // 0 observations in canonical ranges
  | 'PUBLISHABLE_PARTIAL'    // 1–11 valid months observed
  | 'COMPLETE'               // 12/12 valid months observed + reconciled
  | 'INVALID_SOURCE_DATA';   // unparseable/inconsistent source values

// ── Monthly Value ─────────────────────────────────────────────────────────
export interface MonthlyValue {
  month: number;
  value: number;
  label: string;
}

// ── Data Quality ──────────────────────────────────────────────────────────
// Tracks validation state, warnings, and reconciliation accuracy.
export interface DataQuality {
  valid: boolean;
  warnings: string[];
  reconciliationDifference: number | null;
}

// ── Source Reference ──────────────────────────────────────────────────────
// Safe repository-relative source reference (no absolute paths).
export interface SourceRef {
  file: string;
  sheet: string;
  importedAt: string | null;
  sourceType: 'xlsx' | 'csv' | 'manual';
}

// ── Provenance metadata for each year entry ───────────────────────────────
export interface Provenance {
  sourceWorkbook: string;
  /** Present when sheet is known (e.g. FY2568 baseline); omitted for pending FY2569 rows. */
  sourceSheet?: string;
  sourceColumn?: string;
  sourceRowRange?: string;
  extractionScript?: string;
  extractionTimestamp?: string;
  normalizationScript?: string;
  normalizationTimestamp?: string;
  extractionStatus?: string;
  /** Day-1 reconciliation stamp from reconcile-resource-data-day1.mjs */
  reconciliationDay1?: string;
  validationStatus: DataStatus;
}

// ── Target definition ─────────────────────────────────────────────────────
// Defines what "success" looks like for the measurement year.
export interface Target {
  year: number;
  status: DataStatus;
  targetType: 'reduction' | 'increase' | 'stable' | 'compliance';
  targetUnit: string;
  targetValue: number | null;
  targetBasis: string;
  targetSetBy: string | null;
  targetSetDate: string | null;
  months: MonthlyValue[];
}

// ── Year Data ─────────────────────────────────────────────────────────────
// One year of monthly metric values with computed totals and metadata.
export interface YearData {
  year: number;
  isBaseline: boolean;
  months: MonthlyValue[];
  total: number;
  average: number;
  /** How the annual total is derived from monthly values. 'average' is required for percentage-unit metrics. */
  aggregation?: 'sum' | 'average';
  dataStatus: DataStatus;
  source: string;
  sourceRef?: SourceRef;
  quality?: DataQuality;
  /** Explicit provenance classification — see DataClassification. */
  dataClassification?: DataClassification;
  /** Phase 2 sync lifecycle state (GO-DATA-3). */
  datasetState?: DatasetState;
  /** Highest month with an observation (1–12), or null when none. Missing months are never zero. */
  latestDataMonth?: number | null;
  /** Waste category breakdown (Phase 2, additive) — observed months only, no zeros. */
  wasteBreakdown?: {
    categories: {
      key: string;            // 'general' | 'hazardous' | 'recyclable' (+ sub-rows preserved by key)
      labelTh: string;
      labelEn: string;
      months: MonthlyValue[];
      total: number;
    }[];
  };
  /** GHG activity × EF traceability (Phase 2, additive) — preserved from source. */
  ghgActivities?: {
    items: {
      key: string;
      labelTh: string;
      scope: 1 | 2 | 3;
      activityUnit: string;
      ef: number;
      efUnit: string;
      months: { month: number; activity: number; emissionKgCO2e: number }[];
      annualEmissionKgCO2e: number;
    }[];
  };
  updated: string;
  provenance?: Provenance;
}

// ── Year-over-Year Change ─────────────────────────────────────────────────
/**
 * Matched-month year-over-year (PO contract 2026-09-10).
 *
 * A partial current year is NEVER compared against a full baseline year: the
 * comparison window is the months present in BOTH years. When that window is not
 * valid every numeric field is null (never 0) and `reason` explains why, so the
 * UI renders "—" plus coverage text instead of a fabricated trend.
 */
export interface YoyChange {
  /** Comparison basis — always matched months. */
  basis: 'matched-months';
  baselineYear: number | null;
  currentYear: number | null;
  /** Matched month numbers (1–12) present in both years. */
  months: number[];
  /** Number of matched months = months.length. */
  count: number;
  /** Observed months in each year (for coverage text). */
  baselineMonths: number;
  currentMonths: number;
  /** True only when a percent could be computed from a valid window. */
  valid: boolean;
  reason:
    | 'baseline-missing'
    | 'current-missing'
    | 'no-overlapping-months'
    | 'baseline-zero'
    | 'not-comparable'
    | null;
  /** Matched-month subtotals used as the comparison basis. */
  baselineMatched: number | null;
  currentMatched: number | null;
  absolute: number | null;
  percent: number | null;
  direction: 'up' | 'down' | 'stable' | null;
}

// ── Criteria/Indicator Mapping ────────────────────────────────────────────
export interface IndicatorMapping {
  indicatorId: string;
  label: string;
  /** Optional Thai label, present in generated JSON but not required by schema. */
  labelTh?: string;
  relevance: 'primary' | 'supporting' | 'related';
  /** Optional note, e.g. flagging that detailed sub-indicator mapping is still pending confirmation. */
  note?: string;
}

// ── Multi-Year Metric (Canonical Schema) ──────────────────────────────────
// Top-level container for one environmental metric across all years.
// This is the canonical data contract for the Green Office dashboard.
export interface MultiYearMetric {
  metric: string;
  label: string;
  unit: string;
  kpiField: string;
  status: DataStatus;
  baselineYear: number;
  currentYear: number;
  targetYear?: number;
  years: Record<string, YearData>;
  target?: Target;
  targetStatus?: MetricTargetStatus;
  yoyChange: YoyChange;
  relatedIndicators: IndicatorMapping[];
  sourceEvidence: string[];
}

// ── Executive KPI Entry ───────────────────────────────────────────────────
// Generated from canonical metric data, not maintained manually.
export interface ExecutiveKpiEntry {
  metric: string;
  label: string;
  unit: string;
  yearBE: number;
  value: number;
  target: number | null;
  targetStatus: MetricTargetStatus;
  baselineValue: number | null;
  yoyChange: YoyChange | null;
  dataQuality: DataQuality | null;
  sourceFile: string;
  /** Whether the current-year value is confirmed valid (quality.valid !== false). */
  verified?: boolean;
}

// ── Data Quality Summary ──────────────────────────────────────────────────
export interface DataQualitySummary {
  generatedAt: string;
  totalMetrics: number;
  metricsWithWarnings: number;
  metricsWithErrors: number;
  entries: {
    metric: string;
    yearBE: number;
    valid: boolean;
    warnings: string[];
    reconciliationDifference: number | null;
  }[];
}

// ── Computed helpers ──────────────────────────────────────────────────────

/**
 * Matched-month YoY between two year records (TS mirror of
 * scripts/lib/matched-yoy.mjs — keep both in sync; scripts/test-yoy-matched-months.mjs
 * asserts parity on every generated metric).
 *
 * Months present in BOTH years only. No overlapping window ⇒ every numeric field
 * is null (never 0) plus a machine-readable `reason`.
 */
export function computeYoy(baseline: YearData, current: YearData, meta: { baselineYear?: number | null; currentYear?: number | null } = {}): YoyChange {
  const baselineMap = new Map<number, number>();
  for (const m of baseline?.months ?? []) {
    if (m && typeof m.month === 'number' && Number.isFinite(m.value)) baselineMap.set(m.month, m.value);
  }
  const currentMap = new Map<number, number>();
  for (const m of current?.months ?? []) {
    if (m && typeof m.month === 'number' && Number.isFinite(m.value)) currentMap.set(m.month, m.value);
  }

  const months: number[] = [];
  let bSum = 0;
  let cSum = 0;
  for (let m = 1; m <= 12; m += 1) {
    if (baselineMap.has(m) && currentMap.has(m)) {
      months.push(m);
      bSum += baselineMap.get(m) as number;
      cSum += currentMap.get(m) as number;
    }
  }

  const count = months.length;
  let reason: YoyChange['reason'] = null;
  if (baselineMap.size === 0) reason = 'baseline-missing';
  else if (currentMap.size === 0) reason = 'current-missing';
  else if (count === 0) reason = 'no-overlapping-months';

  const round2 = (v: number) => Math.round((v + Number.EPSILON) * 100) / 100;
  const round1 = (v: number) => Math.round((v + Number.EPSILON) * 10) / 10;

  const baselineMatched = count > 0 ? round2(bSum) : null;
  const currentMatched = count > 0 ? round2(cSum) : null;

  let absolute: number | null = null;
  let percent: number | null = null;
  if (baselineMatched !== null && currentMatched !== null) {
    absolute = round2(currentMatched - baselineMatched);
    if (baselineMatched === 0) reason = reason ?? 'baseline-zero';
    else percent = round1((absolute / baselineMatched) * 100);
  }

  const valid = percent !== null;

  return {
    basis: 'matched-months',
    baselineYear: meta.baselineYear ?? baseline?.year ?? null,
    currentYear: meta.currentYear ?? current?.year ?? null,
    months,
    count,
    baselineMonths: baselineMap.size,
    currentMonths: currentMap.size,
    valid,
    reason: valid ? null : (reason ?? 'not-comparable'),
    baselineMatched,
    currentMatched,
    absolute: valid || reason === 'baseline-zero' ? absolute : null,
    percent,
    direction: percent === null ? null : percent > 0 ? 'up' : percent < 0 ? 'down' : 'stable',
  };
}

/** Compute derived fields (total, average) from monthly values */
export function computeYearData(
  year: number,
  isBaseline: boolean,
  months: MonthlyValue[],
  source: string,
  updated: string,
): YearData {
  const total = months.reduce((s, m) => s + m.value, 0);
  const average = months.length > 0 ? Math.round((total / months.length) * 100) / 100 : 0;
  const dataStatus: 'complete' | 'in_progress' = months.length >= 12 ? 'complete' : 'in_progress';
  return { year, isBaseline, months, total, average, dataStatus, source, updated };
}

/**
 * Reconcile calculated total with workbook total.
 * Tolerance: 0.5 for small units (fuel, paper), 5 for large units (energy, water).
 */
export function reconcileTotal(calculated: number, workbookTotal: number | null, unit: string): DataQuality {
  if (workbookTotal === null || workbookTotal === undefined) {
    return { valid: true, warnings: ['No workbook total available for reconciliation'], reconciliationDifference: null };
  }
  const diff = Math.abs(calculated - workbookTotal);
  const tolerance = ['L', 'kg', '%', 'tCO₂e'].includes(unit) ? 0.5 : 5;
  const valid = diff <= tolerance;
  const warnings: string[] = [];
  if (!valid) {
    warnings.push(`Reconciliation difference: ${(calculated - workbookTotal).toFixed(2)} ${unit} (tolerance: ±${tolerance})`);
  }
  return { valid, warnings, reconciliationDifference: Math.round((calculated - workbookTotal) * 100) / 100 };
}

/** Resolve target status based on available data */
export function resolveTargetStatus(target: Target | undefined, yearData: YearData | undefined): MetricTargetStatus {
  if (!target || target.targetValue === null) return 'no-target';
  if (!yearData || yearData.months.length < 12) return 'insufficient-data';
  if (target.targetType === 'reduction') {
    return yearData.total <= target.targetValue ? 'on-track' : 'off-track';
  }
  return 'insufficient-data';
}
