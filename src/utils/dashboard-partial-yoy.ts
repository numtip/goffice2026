/**
 * dashboard-partial-yoy.ts
 * ========================
 * Pure overlap year-over-year for GO-DASH-V2 Phase C.
 *
 * Rules:
 *   - Missing months stay null — never coerced to 0. Present eligible 0 stays 0.
 *   - Comparable months = analytically eligible months present in BOTH years.
 *   - A raw month with analyticsEligible=false remains visible in the raw series
 *     but is deliberately excluded from the comparison until its quality hold clears.
 *   - pending when no analytically eligible current month exists.
 *   - Totals: sum of comparable values, or mean when aggregation === 'average'.
 */
import type { MultiYearMetric, MonthlyValue } from './multi-year-schema';

export type PartialYoyStatus = 'pending' | 'partial' | 'complete';

export interface OverlapMonthPoint {
  month: number;
  baseline: number | null;
  current: number | null;
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
  baselineSeries: (number | null)[];
  currentSeries: (number | null)[];
  points: OverlapMonthPoint[];
}

function analyticalMonthMap(months: MonthlyValue[] | undefined): Map<number, number> {
  const map = new Map<number, number>();
  for (const m of months ?? []) {
    if (m.analyticsEligible === false) continue;
    if (typeof m.month === 'number' && typeof m.value === 'number' && Number.isFinite(m.value)) {
      map.set(m.month, m.value);
    }
  }
  return map;
}

/** Raw series intentionally keeps flagged observations visible to the user. */
function rawMonthMap(months: MonthlyValue[] | undefined): Map<number, number> {
  return new Map((months ?? []).map((m) => [m.month, m.value]));
}

function seriesFromMap(map: Map<number, number>): (number | null)[] {
  const out: (number | null)[] = [];
  for (let m = 1; m <= 12; m++) out.push(map.has(m) ? (map.get(m) as number) : null);
  return out;
}

function aggregateComparable(values: number[], aggregation: 'sum' | 'average' | undefined): number | null {
  if (values.length === 0) return null;
  const sum = values.reduce((a, b) => a + b, 0);
  return aggregation === 'average' ? sum / values.length : sum;
}

function resolveDirection(percent: number | null): 'up' | 'down' | 'stable' | null {
  if (percent == null) return null;
  if (percent > 0) return 'up';
  if (percent < 0) return 'down';
  return 'stable';
}

/** Compute overlap YoY from a canonical MultiYearMetric. Never reads metric.yoyChange. */
export function computePartialYoy(metric: MultiYearMetric, opts?: { id?: string }): PartialYoyResult {
  const id = opts?.id ?? metric.metric;
  const baselineYear = metric.baselineYear;
  const currentYear = metric.currentYear;
  const baseline = metric.years[String(baselineYear)];
  const current = metric.years[String(currentYear)];

  const baselineMap = analyticalMonthMap(baseline?.months);
  const currentMap = analyticalMonthMap(current?.months);
  const baselineSeries = seriesFromMap(rawMonthMap(baseline?.months));
  const currentSeries = seriesFromMap(rawMonthMap(current?.months));

  if (currentMap.size === 0) {
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
    points.push({ month: m, baseline: b, current: c, delta: comparable ? (c as number) - (b as number) : null, comparable });
  }

  const aggregation = current?.aggregation ?? baseline?.aggregation;
  const baselineOverlapTotal = aggregateComparable(baselineVals, aggregation);
  const currentOverlapTotal = aggregateComparable(currentVals, aggregation);

  let percent: number | null = null;
  let absolute: number | null = null;
  if (baselineOverlapTotal !== null && currentOverlapTotal !== null) {
    absolute = currentOverlapTotal - baselineOverlapTotal;
    if (baselineOverlapTotal !== 0) percent = Math.round((absolute / baselineOverlapTotal) * 1000) / 10;
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

export function formatNullableCell(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return String(value);
}
