// ── Pipeline Status ────────────────────────────────────────────────────────
export type DataStatus =
  | 'VERIFIED_BASELINE'
  | 'TARGET_PENDING_APPROVAL'
  | 'CURRENT_DATA_PENDING'
  | 'complete'
  | 'in_progress'
  | 'missing';

export type MetricTargetStatus = 'on-track' | 'off-track' | 'no-target' | 'insufficient-data';

export type DataClassification =
  | 'CONFIRMED_XLSX'
  | 'DERIVED_FROM_CSV'
  | 'PRESERVED_LEGACY'
  | 'PLACEHOLDER'
  | 'MANUAL_ENTRY'
  | 'WAITING_FOR_INPUT'
  | 'INVALID_SOURCE_DATA'
  | 'UNKNOWN';

export type DatasetState =
  | 'WAITING_FOR_INPUT'
  | 'PUBLISHABLE_PARTIAL'
  | 'COMPLETE'
  | 'INVALID_SOURCE_DATA';

// ── Monthly Value ─────────────────────────────────────────────────────────
export interface MonthlyValue {
  month: number;
  value: number;
  label: string;
  /** False keeps the raw observation visible but excludes it from trend/YoY analytics. */
  analyticsEligible?: boolean;
  /** Machine-readable data-quality code explaining an analytical exclusion. */
  analyticsExclusionCode?: string;
}

export interface DataQuality {
  valid: boolean;
  warnings: string[];
  reconciliationDifference: number | null;
}

export interface SourceRef {
  file: string;
  sheet: string;
  importedAt: string | null;
  sourceType: 'xlsx' | 'csv' | 'manual';
}

export interface Provenance {
  sourceWorkbook: string;
  sourceSheet?: string;
  sourceColumn?: string;
  sourceRowRange?: string;
  extractionScript?: string;
  extractionTimestamp?: string;
  normalizationScript?: string;
  normalizationTimestamp?: string;
  extractionStatus?: string;
  reconciliationDay1?: string;
  validationStatus: DataStatus;
}

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

export interface YearData {
  year: number;
  isBaseline: boolean;
  months: MonthlyValue[];
  total: number;
  average: number;
  aggregation?: 'sum' | 'average';
  dataStatus: DataStatus;
  source: string;
  sourceRef?: SourceRef;
  quality?: DataQuality;
  dataClassification?: DataClassification;
  datasetState?: DatasetState;
  latestDataMonth?: number | null;
  wasteBreakdown?: {
    categories: {
      key: string;
      labelTh: string;
      labelEn: string;
      months: MonthlyValue[];
      total: number;
    }[];
  };
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

/** Matched-month YoY (PO contract 2026-09-10). */
export interface YoyChange {
  basis: 'matched-months';
  baselineYear: number | null;
  currentYear: number | null;
  months: number[];
  count: number;
  /** Counts of analytically eligible observations, not necessarily raw observations. */
  baselineMonths: number;
  currentMonths: number;
  valid: boolean;
  reason:
    | 'baseline-missing'
    | 'current-missing'
    | 'no-overlapping-months'
    | 'baseline-zero'
    | 'not-comparable'
    | null;
  baselineMatched: number | null;
  currentMatched: number | null;
  absolute: number | null;
  percent: number | null;
  direction: 'up' | 'down' | 'stable' | null;
}

export interface IndicatorMapping {
  indicatorId: string;
  label: string;
  labelTh?: string;
  relevance: 'primary' | 'supporting' | 'related';
  note?: string;
}

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
  verified?: boolean;
}

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

/**
 * Matched-month YoY between two year records (TS mirror of scripts/lib/matched-yoy.mjs).
 * Raw months marked analyticsEligible=false are deliberately ignored by analytics.
 */
export function computeYoy(
  baseline: YearData,
  current: YearData,
  meta: { baselineYear?: number | null; currentYear?: number | null } = {},
): YoyChange {
  const baselineMap = new Map<number, number>();
  for (const m of baseline?.months ?? []) {
    if (m?.analyticsEligible === false) continue;
    if (m && typeof m.month === 'number' && Number.isFinite(m.value)) baselineMap.set(m.month, m.value);
  }
  const currentMap = new Map<number, number>();
  for (const m of current?.months ?? []) {
    if (m?.analyticsEligible === false) continue;
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
  const divisor = (current?.aggregation ?? baseline?.aggregation) === 'average' ? count : 1;
  const baselineMatched = count > 0 ? round2(bSum / divisor) : null;
  const currentMatched = count > 0 ? round2(cSum / divisor) : null;

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

export function reconcileTotal(calculated: number, workbookTotal: number | null, unit: string): DataQuality {
  if (workbookTotal === null || workbookTotal === undefined) {
    return { valid: true, warnings: ['No workbook total available for reconciliation'], reconciliationDifference: null };
  }
  const diff = Math.abs(calculated - workbookTotal);
  const tolerance = ['L', 'kg', '%', 'tCO₂e'].includes(unit) ? 0.5 : 5;
  const valid = diff <= tolerance;
  const warnings: string[] = [];
  if (!valid) warnings.push(`Reconciliation difference: ${(calculated - workbookTotal).toFixed(2)} ${unit} (tolerance: ±${tolerance})`);
  return { valid, warnings, reconciliationDifference: Math.round((calculated - workbookTotal) * 100) / 100 };
}

export function resolveTargetStatus(target: Target | undefined, yearData: YearData | undefined): MetricTargetStatus {
  if (!target || target.targetValue === null) return 'no-target';
  if (!yearData || yearData.months.length < 12) return 'insufficient-data';
  if (target.targetType === 'reduction') return yearData.total <= target.targetValue ? 'on-track' : 'off-track';
  return 'insufficient-data';
}
