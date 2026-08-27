/**
 * chart-option.ts
 * ===============
 * Deterministic builders that turn canonical MultiYearMetric data into
 * serializable ECharts options (JSON-only — no functions, so options are
 * embeddable as data attributes and unit-testable in node).
 *
 * Data contract rules enforced here:
 *   - Missing months are ALWAYS `null` — never converted to 0.
 *   - Values come from generated JSON only; nothing is hardcoded in the UI.
 *   - Unit + year labels are propagated from the metric schema.
 */
import type { MultiYearMetric } from './multi-year-schema';

// ── Shared option helpers ────────────────────────────────────────────────────

/** Month labels (index 1..12), matching the labels used in generated JSON. */
const MONTH_LABELS: Record<'th' | 'en', string[]> = {
  th: ['', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
  en: ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

export function monthLabel(month: number, locale: 'th' | 'en'): string {
  return MONTH_LABELS[locale][month] ?? String(month);
}

export function round1(v: number): number {
  return Math.round(v * 10) / 10;
}

// ── Monthly trend chart ──────────────────────────────────────────────────────

export interface MonthlyChartTheme {
  /** Baseline bar color */
  baseline: string;
  /** Current bar color (gray already applied upstream when unverified) */
  current: string;
  /** Target bar color */
  target: string;
  /** Rolling-average line color (defaults to current) */
  line?: string;
}

export interface MonthlyChartSeries {
  labels: string[];
  baseline: (number | null)[];
  current: (number | null)[];
  target: (number | null)[];
  unit: string;
  baselineYear: number;
  currentYear: number;
  targetYear?: number;
  currentUnverified: boolean;
}

/**
 * Build the monthly series arrays from a canonical metric.
 * Missing months stay `null` — never 0.
 */
export function buildMonthlySeries(
  metric: MultiYearMetric,
  locale: 'th' | 'en',
  opts: { showTarget?: boolean } = {},
): MonthlyChartSeries {
  const { showTarget = false } = opts;
  const baselineYear = metric.years[String(metric.baselineYear)];
  const currentYear = metric.years[String(metric.currentYear)];
  const baselineMap = new Map((baselineYear?.months ?? []).map((m) => [m.month, m.value]));
  const currentMap = new Map((currentYear?.months ?? []).map((m) => [m.month, m.value]));
  const targetMap = new Map((metric.target?.months ?? []).map((m) => [m.month, m.value]));

  const labels: string[] = [];
  const baseline: (number | null)[] = [];
  const current: (number | null)[] = [];
  const target: (number | null)[] = [];

  for (let m = 1; m <= 12; m++) {
    labels.push(monthLabel(m, locale));
    baseline.push(baselineMap.has(m) ? (baselineMap.get(m) ?? null) : null);
    current.push(currentMap.has(m) ? (currentMap.get(m) ?? null) : null);
    target.push(showTarget && targetMap.has(m) ? (targetMap.get(m) ?? null) : null);
  }

  return {
    labels,
    baseline,
    current,
    target,
    unit: metric.unit,
    baselineYear: metric.baselineYear,
    currentYear: metric.currentYear,
    targetYear: metric.targetYear,
    currentUnverified: currentYear?.quality?.valid !== true,
  };
}

/** 3-month rolling average of a (possibly null-padded) series; nulls preserved. */
export function rollingAverage(values: (number | null)[], windowSize = 3): (number | null)[] {
  const out: (number | null)[] = [];
  for (let i = 0; i < values.length; i++) {
    const window = values.slice(Math.max(0, i - windowSize + 1), i + 1);
    const valid = window.filter((v): v is number => typeof v === 'number' && !Number.isNaN(v));
    if (valid.length === windowSize) {
      out.push(round1(valid.reduce((a, b) => a + b, 0) / windowSize));
    } else {
      out.push(null);
    }
  }
  return out;
}

/** Dashed reference line at the average of the non-null baseline values. */
function buildBaselineAverageMarkLine(
  series: MonthlyChartSeries,
  locale: 'th' | 'en',
): Record<string, unknown> | undefined {
  const values = series.baseline.filter((v): v is number => v !== null);
  if (values.length === 0) return undefined;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const label =
    locale === 'th'
      ? `ค่าเฉลี่ย ${Math.round(avg).toLocaleString('th-TH')}`
      : `Avg ${Math.round(avg).toLocaleString('en-US')}`;
  return {
    symbol: 'none',
    silent: true,
    lineStyle: { color: '#6b7280', type: 'dashed', opacity: 0.35 },
    label: { show: true, position: 'insideEndTop', fontSize: 10, formatter: label },
    data: [{ yAxis: round1(avg) }],
  };
}

export interface MonthlyChartOptionInput {
  series: MonthlyChartSeries;
  theme: MonthlyChartTheme;
  locale: 'th' | 'en';
  /** Display names for the three series. */
  names: { baseline: string; current: string; target?: string };
  /** Accessible description for screen readers. */
  ariaDescription: string;
  /** Show the 3-month rolling average line (default true when data allows). */
  showRollingAvg?: boolean;
  /** Show highest/lowest markers on the current series (default true). */
  showExtremes?: boolean;
}

/**
 * Build the full ECharts option for the monthly trend card.
 * Returns plain JSON-serializable objects (no functions).
 */
export function buildMonthlyOption(input: MonthlyChartOptionInput): Record<string, unknown> {
  const { series, theme, locale, names, ariaDescription } = input;
  const showTarget = series.target.some((v) => v !== null);
  const showRollingAvg = input.showRollingAvg !== false && series.current.some((v) => v !== null);
  const showExtremes = input.showExtremes !== false;

  const currentValues = series.current.filter((v): v is number => v !== null);
  let extremes: unknown[] = [];
  if (showExtremes && currentValues.length > 1) {
    const max = Math.max(...currentValues);
    const min = Math.min(...currentValues);
    if (max !== min) {
      extremes = [
        {
          type: 'max',
          name: locale === 'th' ? 'สูงสุด' : 'Highest',
          symbol: 'triangle',
          symbolSize: 10,
          itemStyle: { color: theme.current },
          label: { show: true, position: 'top', fontSize: 10, formatter: '{b}' },
        },
        {
          type: 'min',
          name: locale === 'th' ? 'ต่ำสุด' : 'Lowest',
          symbol: 'circle',
          symbolSize: 7,
          itemStyle: { color: theme.current },
          label: { show: true, position: 'bottom', fontSize: 10, formatter: '{b}' },
        },
      ];
    }
  }

  const seriesDefs: Record<string, unknown>[] = [
    {
      name: names.baseline,
      type: 'bar',
      data: series.baseline,
      barMaxWidth: 26,
      itemStyle: { color: theme.baseline, opacity: 0.45, borderRadius: [2, 2, 0, 0] },
      markLine: buildBaselineAverageMarkLine(series, locale),
    },
    {
      name: names.current,
      type: 'bar',
      data: series.current,
      barMaxWidth: 26,
      itemStyle: { color: theme.current, opacity: series.currentUnverified ? 0.5 : 0.9, borderRadius: [2, 2, 0, 0] },
      ...(extremes.length > 0 ? { markPoint: { data: extremes } } : {}),
    },
  ];

  if (showTarget) {
    seriesDefs.push({
      name: names.target ?? 'Target',
      type: 'bar',
      data: series.target,
      barMaxWidth: 26,
      itemStyle: { color: theme.target, opacity: 0.9, borderRadius: [2, 2, 0, 0] },
    });
  }

  if (showRollingAvg) {
    const rolling = rollingAverage(series.current);
    if (rolling.some((v) => v !== null)) {
      seriesDefs.push({
        name: locale === 'th' ? 'ค่าเฉลี่ยเคลื่อนที่ 3 เดือน' : '3-mo rolling avg',
        type: 'line',
        data: rolling,
        smooth: false,
        symbol: 'circle',
        symbolSize: 4,
        connectNulls: false,
        lineStyle: { width: 2, type: 'dashed', color: theme.line ?? theme.current, opacity: 0.6 },
        itemStyle: { color: theme.line ?? theme.current },
        emphasis: { disabled: true },
        z: 3,
      });
    }
  }

  const legendNames = seriesDefs.map((s) => s.name);

  return {
    grid: { left: 16, right: 16, top: 36, bottom: 8, containLabel: true },
    legend: { top: 0, type: 'scroll', data: legendNames, textStyle: { fontSize: 11 } },
    xAxis: {
      type: 'category',
      data: series.labels,
      axisTick: { alignWithLabel: true },
      axisLabel: { fontSize: 11, interval: 0, rotate: series.labels.length > 9 ? 30 : 0 },
    },
    yAxis: {
      type: 'value',
      name: series.unit,
      nameTextStyle: { fontSize: 11 },
      splitLine: { lineStyle: { color: '#e5e7eb', width: 0.5 } },
      axisLabel: { fontSize: 11 },
    },
    tooltip: { trigger: 'axis', confine: true },
    aria: {
      enabled: true,
      decal: { show: false },
      label: { description: ariaDescription },
    },
    series: seriesDefs,
  };
}

// ── Normalized baseline-vs-current chart ─────────────────────────────────────

export interface NormalizedResource {
  id: string;
  label: string;
  color: string;
  baselineTotal: number;
  currentTotal: number;
}

export interface NormalizedSeries {
  labels: string[];
  values: number[];
  colors: string[];
}

/** Index = (current / baseline) × 100; 0 when baseline is absent. */
export function buildNormalizedSeries(resources: NormalizedResource[]): NormalizedSeries {
  return {
    labels: resources.map((r) => r.label),
    values: resources.map((r) => (r.baselineTotal > 0 ? Math.round((r.currentTotal / r.baselineTotal) * 100) : 0)),
    colors: resources.map((r) => r.color),
  };
}

export interface NormalizedOptionInput {
  series: NormalizedSeries;
  locale: 'th' | 'en';
  baselineLabel: string;
  currentLabel: string;
  ariaDescription: string;
}

/** Horizontal bar chart of normalized index with a baseline = 100 reference line. */
export function buildNormalizedOption(input: NormalizedOptionInput): Record<string, unknown> {
  const { series, baselineLabel, ariaDescription } = input;
  const values = series.values;
  const maxVal = Math.max(100, ...values);
  const minVal = Math.min(100, ...values);
  const lo = Math.min(80, minVal - 5);
  const hi = Math.max(120, maxVal + 5);

  return {
    grid: { left: 16, right: 40, top: 12, bottom: 16, containLabel: true },
    xAxis: {
      type: 'value',
      min: lo,
      max: hi,
      axisLabel: { fontSize: 10 },
      splitLine: { lineStyle: { color: '#e5e7eb', width: 0.5 } },
    },
    yAxis: {
      type: 'category',
      data: series.labels,
      inverse: true,
      axisLabel: { fontSize: 11, width: 100, overflow: 'truncate' },
      axisTick: { show: false },
    },
    tooltip: { trigger: 'axis', confine: true },
    aria: {
      enabled: true,
      decal: { show: false },
      label: { description: ariaDescription },
    },
    series: [
      {
        name: input.currentLabel,
        type: 'bar',
        data: series.values.map((v, i) => ({ value: v, itemStyle: { color: series.colors[i] ?? '#006c49', opacity: v < 100 ? 0.75 : 0.9 } })),
        barWidth: 18,
        label: { show: true, position: 'right', fontSize: 11, formatter: '{c}' },
        markLine: {
          symbol: 'none',
          silent: true,
          lineStyle: { color: '#707974', type: 'dashed', width: 1 },
          label: {
            show: true,
            position: 'insideEndTop',
            fontSize: 10,
            formatter: `${baselineLabel} = 100`,
          },
          data: [{ xAxis: 100 }],
        },
      },
    ],
  };
}

// ── Category score chart ─────────────────────────────────────────────────────

export interface CategoryScoreItem {
  code: string;
  label: string;
  score: number;
  maxScore?: number;
  trend?: 'up' | 'down' | 'stable';
  href: string;
  statusText?: string;
}

export interface CategoryScoreOptionInput {
  categories: CategoryScoreItem[];
  locale: 'th' | 'en';
  ariaDescription: string;
}

const TREND_ARROW: Record<string, string> = { up: '\u2191', down: '\u2193', stable: '\u2192' };

/** Horizontal bar chart of certification category scores (0..max). */
export function buildCategoryScoreOption(input: CategoryScoreOptionInput): Record<string, unknown> {
  const { categories, locale, ariaDescription } = input;
  const maxScore = Math.max(...categories.map((c) => c.maxScore ?? c.score), 100);
  const labels = categories.map((c) => (c.trend ? `${c.label} ${TREND_ARROW[c.trend] ?? ''}` : c.label));

  return {
    grid: { left: 16, right: 32, top: 12, bottom: 12, containLabel: true },
    xAxis: {
      type: 'value',
      max: maxScore,
      axisLabel: { fontSize: 10 },
      splitLine: { lineStyle: { color: '#e5e7eb', width: 0.5 } },
    },
    yAxis: {
      type: 'category',
      data: labels,
      inverse: true,
      axisLabel: { fontSize: 11, width: 140, overflow: 'truncate' },
      axisTick: { show: false },
    },
    tooltip: { trigger: 'axis', confine: true },
    aria: {
      enabled: true,
      decal: { show: false },
      label: { description: ariaDescription },
    },
    series: [
      {
        name: locale === 'th' ? 'คะแนน' : 'Score',
        type: 'bar',
        data: categories.map((c) => c.score),
        barWidth: 18,
        itemStyle: { color: '#006c49', opacity: 0.85, borderRadius: [0, 3, 3, 0] },
        label: { show: true, position: 'right', fontSize: 11, formatter: '{c}' },
      },
    ],
  };
}

/** Per-category status text for tooltips (kept out of the option object). */
export function categoryStatusTexts(categories: CategoryScoreItem[]): string[] {
  return categories.map((c) => c.statusText ?? '');
}

// ── Coverage radial (Command Hero donut) ────────────────────────────────────

export interface CoverageRadialInput {
  /** Covered month slots (0..total). */
  covered: number;
  /** Total month slots (resources × 12). */
  total: number;
  /** Rounded percent = round(covered / total × 100) — coverage, never a score. */
  percent: number;
  locale: 'th' | 'en';
}

/**
 * Donut option for the Command Hero monthly-coverage radial.
 *
 * The covered segment renders emerald (#10b981), the remainder a muted dark
 * ring; the center `title` shows percent + covered/total (locale-neutral
 * numbers). The aria description is derived from the numbers only, so the
 * builder stays pure, JSON-serializable and locale-driven.
 *
 * NOTE: tooltip is disabled (`show: false`) — the shared echarts-init tooltip
 * formatter is axis-oriented (`trigger: 'axis'`) and not compatible with pie
 * `trigger: 'item'` params; the center title already carries the key figures
 * and the accessible table fallback covers the underlying data.
 */
export function buildCoverageRadialOption(input: CoverageRadialInput): Record<string, unknown> {
  const { covered, total, locale } = input;
  const remaining = Math.max(0, total - covered);
  const description =
    locale === 'th'
      ? `ความครอบคลุมข้อมูลรายเดือน: ${covered} จาก ${total} เดือน, ${input.percent} เปอร์เซ็นต์`
      : `Monthly data coverage: ${covered} of ${total} months, ${input.percent} percent`;

  return {
    tooltip: { show: false },
    aria: {
      enabled: true,
      decal: { show: false },
      label: { description },
    },
    title: {
      text: `${input.percent}%`,
      subtext: `${covered}/${total}`,
      left: 'center',
      top: 'center',
      textStyle: { fontSize: 30, fontWeight: 700, color: '#ffffff', lineHeight: 34 },
      subtextStyle: { fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 18 },
    },
    series: [
      {
        name: locale === 'th' ? 'ความครอบคลุมข้อมูลรายเดือน' : 'Monthly data coverage',
        type: 'pie',
        radius: ['62%', '84%'],
        center: ['50%', '50%'],
        startAngle: 90,
        silent: true,
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 11, borderColor: 'transparent', borderWidth: 0 },
        label: { show: false },
        labelLine: { show: false },
        emphasis: { scale: false },
        data: [
          { value: covered, name: locale === 'th' ? 'ครอบคลุม' : 'Covered', itemStyle: { color: '#10b981' } },
          { value: remaining, name: locale === 'th' ? 'คงเหลือ' : 'Remaining', itemStyle: { color: '#1d4a3b' } },
        ],
      },
    ],
  };
}

// ── Performance Explorer (GO-DASH-V2-B-A) ────────────────────────────────────
// Additive multi-metric monthly explorer. Each resource contributes a line
// series of its genuine FY-current monthly values (nulls preserved — never 0).
// Missing months stay null so the line simply gaps; the accessible table
// fallback carries the raw values. No invented scores — raw consumption only.

export interface ExplorerResource {
  id: string;
  label: string;
  color: string;
  /** Genuine monthly values (index 0..11 = Jan..Dec); null = missing month. */
  months: (number | null)[];
  unit: string;
}

export interface ExplorerOptionInput {
  resources: ExplorerResource[];
  locale: 'th' | 'en';
  /** e.g. '2569' or 'FY2569' — shown in the legend/axis title. */
  yearLabel: string;
  ariaDescription: string;
}

/**
 * Multi-line option comparing genuine monthly consumption across resources.
 * Values are raw (not normalized) so each resource keeps its own unit; the
 * tooltip shows the resource label + month + value + unit.
 */
export function buildExplorerOption(input: ExplorerOptionInput): Record<string, unknown> {
  const { resources, locale, yearLabel, ariaDescription } = input;
  const monthNames = MONTH_LABELS[locale].slice(1); // Jan..Dec (12)

  const series = resources.map((r) => ({
    name: r.label,
    type: 'line' as const,
    data: r.months,
    smooth: false,
    connectNulls: false,
    symbol: 'circle',
    symbolSize: 5,
    lineStyle: { width: 2, color: r.color },
    itemStyle: { color: r.color },
    emphasis: { focus: 'series' as const },
  }));

  return {
    grid: { left: 16, right: 24, top: 24, bottom: 16, containLabel: true },
    legend: {
      type: 'scroll',
      top: 0,
      left: 'center',
      textStyle: { fontSize: 10 },
      itemWidth: 14,
      itemHeight: 8,
    },
    tooltip: {
      trigger: 'axis',
      confine: true,
      axisPointer: { type: 'line' },
    },
    xAxis: {
      type: 'category',
      data: monthNames,
      boundaryGap: false,
      axisLabel: { fontSize: 10 },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#d1d5db' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: 10 },
      splitLine: { lineStyle: { color: '#e5e7eb', width: 0.5 } },
    },
    aria: {
      enabled: true,
      decal: { show: false },
      label: { description: ariaDescription },
    },
    series,
  };
}

// ── Partial YoY dual-line chart (GO-DASH-V2 Phase C) ─────────────────────────
// Additive only. Overlap YoY series from computePartialYoy — never metric.yoyChange.
// 12 month slots; connectNulls:false so missing months gap (null ≠ 0).
// Structural input type (no runtime import from dashboard-partial-yoy) so Node
// --test can load this module via type-stripping without extension resolution.

export interface PartialYoyOptionResult {
  unit: string;
  status: 'pending' | 'partial' | 'complete';
  baselineSeries: (number | null)[];
  currentSeries: (number | null)[];
}

export interface PartialYoyOptionInput {
  result: PartialYoyOptionResult;
  locale: 'th' | 'en';
  /** Series display names, e.g. { baseline: 'FY2568', current: 'FY2569' }. */
  label: { baseline: string; current: string };
  colors: { baseline: string; current: string };
  ariaDescription: string;
}

/** Dual-line baseline vs current option; pending still returns a valid empty/null series. */
export function buildPartialYoyOption(input: PartialYoyOptionInput): Record<string, unknown> {
  const { result, locale, label, colors, ariaDescription } = input;
  const labels = Array.from({ length: 12 }, (_, i) => monthLabel(i + 1, locale));

  const baselineData = result.baselineSeries;
  const currentData =
    result.status === 'pending'
      ? Array.from({ length: 12 }, () => null as number | null)
      : result.currentSeries;

  return {
    grid: { left: 16, right: 24, top: 36, bottom: 16, containLabel: true },
    legend: {
      top: 0,
      left: 'center',
      textStyle: { fontSize: 11 },
      data: [label.baseline, label.current],
    },
    tooltip: {
      trigger: 'axis',
      confine: true,
      axisPointer: { type: 'line' },
    },
    xAxis: {
      type: 'category',
      data: labels,
      boundaryGap: false,
      axisLabel: { fontSize: 10, interval: 0, rotate: 35 },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#d1d5db' } },
    },
    yAxis: {
      type: 'value',
      name: result.unit,
      nameTextStyle: { fontSize: 11 },
      axisLabel: { fontSize: 10 },
      splitLine: { lineStyle: { color: '#e5e7eb', width: 0.5 } },
    },
    aria: {
      enabled: true,
      decal: { show: false },
      label: { description: ariaDescription },
    },
    series: [
      {
        name: label.baseline,
        type: 'line',
        data: baselineData,
        smooth: false,
        connectNulls: false,
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: { width: 2, color: colors.baseline, opacity: 0.55 },
        itemStyle: { color: colors.baseline },
        emphasis: { focus: 'series' },
      },
      {
        name: label.current,
        type: 'line',
        data: currentData,
        smooth: false,
        connectNulls: false,
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: { width: 2.5, color: colors.current },
        itemStyle: { color: colors.current },
        emphasis: { focus: 'series' },
      },
    ],
  };
}

// ── Criteria progress (D3) ────────────────────────────────────────────────
// FY2569 criteria-progress visualizations (dashboard progress blueprint V1
// §10). Progress ≠ Evidence ≠ Official Score. Percentages always derive from
// counts in the generated dataset — never hardcoded.

export const PROGRESS_STATUS_COLORS: Record<string, string> = {
  ready: '#10b981',
  inProgress: '#f59e0b',
  notStarted: '#64748b',
  unavailable: '#e2e8f0',
} as const;

export interface CategoryProgressDonutInput {
  /** Count of ready indicators (numerator). */
  ready: number;
  /** Applicable indicator count (denominator, excludes not-applicable). */
  applicable: number;
  /** Rounded ready rate = round(ready / applicable × 100) — never a score. */
  percent: number;
  locale: 'th' | 'en';
  ariaDescription: string;
}

/**
 * Light-theme donut for criteria progress: ready segment (emerald) vs
 * remaining applicable (light slate). The center title leads with the
 * COUNTS (`ready/applicable`); the percentage is secondary subtext —
 * counts-first per D4 (blueprint §7.2 shows counts alongside %).
 * Tooltip disabled (shared client formatter is axis-oriented) — the visible
 * title and the accessible table fallback carry the data.
 */
export function buildCategoryProgressDonutOption(input: CategoryProgressDonutInput): Record<string, unknown> {
  const { ready, applicable, locale } = input;
  const remaining = Math.max(0, applicable - ready);
  const description = input.ariaDescription;

  return {
    tooltip: { show: false },
    aria: {
      enabled: true,
      decal: { show: false },
      label: { description },
    },
    title: {
      text: `${ready}/${applicable}`,
      subtext: `${input.percent}%`,
      left: 'center',
      top: 'center',
      textStyle: { fontSize: 30, fontWeight: 800, color: '#111827', lineHeight: 36 },
      subtextStyle: { fontSize: 15, fontWeight: 600, color: '#047857', lineHeight: 20 },
    },
    series: [
      {
        name: locale === 'th' ? 'ความคืบหน้าการดำเนินงาน' : 'Operational progress',
        type: 'pie',
        radius: ['60%', '84%'],
        center: ['50%', '50%'],
        startAngle: 90,
        silent: true,
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 11, borderColor: 'transparent', borderWidth: 0 },
        label: { show: false },
        data: [
          {
            value: ready,
            name: locale === 'th' ? 'พร้อม' : 'Ready',
            itemStyle: { color: PROGRESS_STATUS_COLORS.ready },
          },
          {
            value: remaining,
            name: locale === 'th' ? 'คงเหลือ' : 'Remaining',
            itemStyle: { color: PROGRESS_STATUS_COLORS.unavailable },
          },
        ],
      },
    ],
  };
}

export interface ProgressStackedItem {
  label: string;
  ready: number;
  inProgress: number;
  notStarted: number;
  unavailable: number;
}

export interface ProgressStackedBarInput {
  items: ProgressStackedItem[];
  locale: 'th' | 'en';
  ariaDescription: string;
}

/**
 * Horizontal stacked bar of progress statuses (Ready / In Progress /
 * Not Started / Unavailable) — one row per item (category or issue).
 * Count labels render via ECharts template '{c}' (JSON-serializable);
 * legend at the bottom; accessible table fallback supplied by the caller.
 */
export function buildProgressStackedBarOption(input: ProgressStackedBarInput): Record<string, unknown> {
  const { items, locale, ariaDescription } = input;
  const t = {
    ready: locale === 'th' ? 'พร้อม' : 'Ready',
    inProgress: locale === 'th' ? 'กำลังดำเนินการ' : 'In Progress',
    notStarted: locale === 'th' ? 'ยังไม่เริ่ม' : 'Not Started',
    unavailable: locale === 'th' ? 'ไม่มีข้อมูล' : 'Unavailable',
  };

  return {
    grid: { left: 16, right: 28, top: 8, bottom: 8, containLabel: true },
    xAxis: {
      type: 'value',
      min: 0,
      axisLabel: { fontSize: 10 },
      splitLine: { lineStyle: { color: '#e5e7eb', width: 0.5 } },
    },
    yAxis: {
      type: 'category',
      data: items.map((i) => i.label),
      inverse: true,
      axisLabel: { fontSize: 12, fontWeight: 600, width: 150, overflow: 'truncate' },
      axisTick: { show: false },
    },
    tooltip: { trigger: 'axis', confine: true, axisPointer: { type: 'shadow' } },
    legend: {
      bottom: 0,
      itemWidth: 14,
      itemHeight: 9,
      textStyle: { fontSize: 11 },
      selectedMode: false,
    },
    aria: {
      enabled: true,
      decal: { show: false },
      label: { description: ariaDescription },
    },
    series: [
      {
        name: t.ready,
        type: 'bar',
        stack: 'progress',
        data: items.map((i) => i.ready),
        barWidth: 22,
        itemStyle: { color: PROGRESS_STATUS_COLORS.ready, borderRadius: [0, 0, 0, 0] },
        label: { show: true, position: 'inside', fontSize: 11, fontWeight: 700, color: '#ffffff', formatter: '{c}' },
      },
      {
        name: t.inProgress,
        type: 'bar',
        stack: 'progress',
        data: items.map((i) => i.inProgress),
        barWidth: 22,
        itemStyle: { color: PROGRESS_STATUS_COLORS.inProgress },
        label: { show: true, position: 'inside', fontSize: 11, fontWeight: 700, color: '#ffffff', formatter: '{c}' },
      },
      {
        name: t.notStarted,
        type: 'bar',
        stack: 'progress',
        data: items.map((i) => i.notStarted),
        barWidth: 22,
        itemStyle: { color: PROGRESS_STATUS_COLORS.notStarted },
        label: { show: true, position: 'inside', fontSize: 11, fontWeight: 700, color: '#ffffff', formatter: '{c}' },
      },
      {
        name: t.unavailable,
        type: 'bar',
        stack: 'progress',
        data: items.map((i) => i.unavailable),
        barWidth: 22,
        itemStyle: { color: PROGRESS_STATUS_COLORS.unavailable },
        label: { show: true, position: 'inside', fontSize: 11, fontWeight: 700, color: '#475569', formatter: '{c}' },
      },
    ],
  };
}
