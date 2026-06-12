export interface MonthlyValue {
  month: number;
  value: number;
  label: string;
}

export interface YearData {
  year: number;
  isBaseline: boolean;
  months: MonthlyValue[];
  total: number;
  average: number;
  dataStatus: 'complete' | 'in_progress' | 'missing';
  source: string;
  updated: string;
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
  baselineYear: number;
  currentYear: number;
  years: Record<string, YearData>;
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
