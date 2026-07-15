// Data status enum — explicit pipeline states
export type DataStatus =
  | 'VERIFIED_BASELINE'        // 2568 baseline — extracted from real XLSX, validated, frozen
  | 'TARGET_PENDING_APPROVAL'  // 2569 target — not yet approved by authorized staff
  | 'CURRENT_DATA_PENDING'     // 2569 actual — source data not yet available
  | 'complete'                 // All 12 months of data present
  | 'in_progress'              // Partial monthly data available
  | 'missing';                 // No data at all

export interface MonthlyValue {
  month: number;
  value: number;
  label: string;
}

// Provenance metadata for each year entry
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

// Target definition — defines what "success" looks like for the measurement year
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
  dataStatus: DataStatus;
  source: string;
  updated: string;
  provenance?: Provenance;
}

export interface YoyChange {
  absolute: number;
  percent: number;
  direction: 'up' | 'down' | 'stable';
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
  yoyChange: YoyChange;
}

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
