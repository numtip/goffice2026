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
  sourceSheet: string;
  sourceColumn?: string;
  sourceRowRange?: string;
  extractionScript?: string;
  extractionTimestamp?: string;
  normalizationScript?: string;
  normalizationTimestamp?: string;
  extractionStatus?: string;
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
  dataStatus: DataStatus;
  source: string;
  sourceRef?: SourceRef;
  quality?: DataQuality;
  updated: string;
  provenance?: Provenance;
}

// ── Year-over-Year Change ─────────────────────────────────────────────────
export interface YoyChange {
  absolute: number;
  percent: number;
  direction: 'up' | 'down' | 'stable';
}

// ── Criteria/Indicator Mapping ────────────────────────────────────────────
export interface IndicatorMapping {
  indicatorId: string;
  label: string;
  relevance: 'primary' | 'supporting' | 'related';
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

/** Compute YoY change from two year data objects */
export function computeYoy(baseline: YearData, current: YearData): YoyChange {
  const absolute = current.total - baseline.total;
  const percent = baseline.total !== 0 ? Math.round((absolute / baseline.total) * 100) : 0;
  const direction: 'up' | 'down' | 'stable' = percent > 0 ? 'up' : percent < 0 ? 'down' : 'stable';
  return { absolute, percent, direction };
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
