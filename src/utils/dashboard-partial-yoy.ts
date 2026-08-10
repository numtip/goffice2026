/**
 * dashboard-partial-yoy.ts
 * ========================
 * Pure overlap year-over-year for GO-DASH-V2 Phase C.
 *
 * Rules (must never use metric.yoyChange):
 *   - Missing months stay null — never coerced to 0. Present 0 stays 0.
 *   - Comparable months = present in BOTH baseline and current years.
 *   - pending when current.months.length === 0.
 *   - Totals: sum of comparable values, or mean when aggregation === 'average'.
 *   - percent = round((cur − base) / base × 100) when base !== 0, else null.
 */
import type { MultiYearMetric } from './multi-year-schema';

export type PartialYoyStatus = 'pending' | 'partial' | 'complete';

export interface OverlapMonthPoint {
  month: number;
  baseline: number | null;
  current: number | null;
  /** current − baseline when both present; otherwise null. */
  delta: number | null;
  comparable: boolean;
}

export interface PartialYoyResult {
  id: string;
  unit: string;
  baselineYear: number;
  currentYear: number;
  status: PartialYoyStatus;
  comparableMonths: number[];
  comparableCount: number;
  baselineOverlapTotal: number | null;
  currentOverlapTotal: number | null;
  percent: number | null;
  absolute: number | null;
  direction: 'up' | 'down' | 'stable' | null;
  /** Length-12 series (index 0 = Jan); missing months are null. */
  baselineSeries: (number | null)[];
  currentSeries: (number | null)[];
  points: OverlapMonthPoint[];
}

function monthMap(months: { month: number; value: number }[] | undefined): Map<number, number> {
  return new Map((months ?? []).map((m) => [m.month, m.value]));
}

function seriesFromMap(map: Map<number, number>): (number | null)[] {
  const out: (number | null)[] = [];
  for (let m = 1; m <= 12; m++) {
    out.push(map.has(m) ? (map.get(m) as number) : null);
  }
  return out;
}

function aggregateComparable(
  values: number[],
  aggregation: 'sum' | 'average' | undefined,
): number | null {
  if (values.length === 0) return null;
  const sum = values.reduce((a, b) => a + b, 0);
  if (aggregation === 'average') {
    return sum / values.length;
  }
  return sum;
}

function resolveDirection(percent: number | null): 'up' | 'down' | 'stable' | null {
  if (percent == null) return null;
  if (percent > 0) return 'up';
  if (percent < 0) return 'down';
  return 'stable';
}

/**
 * Compute overlap YoY from a canonical MultiYearMetric.
 * Never reads or copies metric.yoyChange.
 */
export function computePartialYoy(
  metric: MultiYearMetric,
  opts?: { id?: string },
): PartialYoyResult {
  const id = opts?.id ?? metric.metric;
  const baselineYear = metric.baselineYear;
  const currentYear = metric.currentYear;
  const baseline = metric.years[String(baselineYear)];
  const current = metric.years[String(currentYear)];

  const baselineMap = monthMap(baseline?.months);
  const currentMap = monthMap(current?.months);
  const baselineSeries = seriesFromMap(baselineMap);
  const currentSeries = seriesFromMap(currentMap);

  const currentMonthCount = current?.months?.length ?? 0;
  if (currentMonthCount === 0) {
    const points: OverlapMonthPoint[] = [];
    for (let m = 1; m <= 12; m++) {
      points.push({
        month: m,
        baseline: baselineMap.has(m) ? (baselineMap.get(m) as number) : null,
        current: null,
        delta: null,
        comparable: false,
      });
    }
    return {
      id,
      unit: metric.unit,
      baselineYear,
      currentYear,
      status: 'pending',
      comparableMonths: [],
      comparableCount: 0,
      baselineOverlapTotal: null,
      currentOverlapTotal: null,
      percent: null,
      absolute: null,
      direction: null,
      baselineSeries,
      currentSeries,
      points,
    };
  }

  const comparableMonths: number[] = [];
  const baselineVals: number[] = [];
  const currentVals: number[] = [];
  const points: OverlapMonthPoint[] = [];

  for (let m = 1; m <= 12; m++) {
    const b = baselineMap.has(m) ? (baselineMap.get(m) as number) : null;
    const c = currentMap.has(m) ? (currentMap.get(m) as number) : null;
    const comparable = b !== null && c !== null;
    if (comparable) {
      comparableMonths.push(m);
      baselineVals.push(b as number);
      currentVals.push(c as number);
    }
    points.push({
      month: m,
      baseline: b,
      current: c,
      delta: comparable ? (c as number) - (b as number) : null,
      comparable,
    });
  }

  const aggregation = current?.aggregation ?? baseline?.aggregation;
  const baselineOverlapTotal = aggregateComparable(baselineVals, aggregation);
  const currentOverlapTotal = aggregateComparable(currentVals, aggregation);

  let percent: number | null = null;
  let absolute: number | null = null;
  if (baselineOverlapTotal !== null && currentOverlapTotal !== null) {
    absolute = currentOverlapTotal - baselineOverlapTotal;
    if (baselineOverlapTotal !== 0) {
      percent = Math.round((absolute / baselineOverlapTotal) * 100);
    }
  }

  const comparableCount = comparableMonths.length;
  const status: PartialYoyStatus = comparableCount === 12 ? 'complete' : 'partial';

  return {
    id,
    unit: metric.unit,
    baselineYear,
    currentYear,
    status,
    comparableMonths,
    comparableCount,
    baselineOverlapTotal,
    currentOverlapTotal,
    percent,
    absolute,
    direction: resolveDirection(percent),
    baselineSeries,
    currentSeries,
    points,
  };
}

/** Format a numeric cell; null/undefined → em dash (never "0" for missing). */
export function formatNullableCell(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return String(value);
}
