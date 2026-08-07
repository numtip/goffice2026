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
