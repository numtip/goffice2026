/**
 * dashboard-normalized-vm.ts
 * ==========================
 * Common-period normalized index (baseline = 100) for dashboard section 4.
 *
 * Rules:
 *   - One shared comparable month range across all six resources.
 *   - Index = (FY2569 common-period sum / FY2568 same-period sum) × 100.
 *   - Never compare partial FY2569 annual total vs full-year FY2568 total.
 *   - Missing or zero baseline denominator → unavailable (null), never index 0.
 */
import { dashboards } from '../data/dashboard-config';
import { generatedMetricMap } from './dashboard-generated-metrics';
import type { MultiYearMetric } from './multi-year-schema';
import { monthLabel, round1 } from './chart-option';

const DASHBOARD_RESOURCE_IDS = ['energy', 'water', 'fuel', 'paper', 'waste', 'ghg'] as const;

export interface NormalizedResourceVM {
  id: string;
  label: string;
  color: string;
  /** Sum over common months in baseline year; null when unavailable. */
  baselineTotal: number | null;
  /** Sum over common months in current year; null when unavailable. */
  currentTotal: number | null;
  /** Rounded index; null when baseline sum is missing or zero. */
  index: number | null;
}

export interface NormalizedVM {
  locale: 'th' | 'en';
  commonMonths: number[];
  commonCount: number;
  periodCaption: string;
  periodDescription: string;
  resources: NormalizedResourceVM[];
}

const RESOURCE_LABELS: Record<string, { th: string; en: string }> = {
  energy: { th: 'ไฟฟ้า', en: 'Energy' },
  water: { th: 'น้ำ', en: 'Water' },
  fuel: { th: 'เชื้อเพลิง', en: 'Fuel' },
  paper: { th: 'กระดาษ', en: 'Paper' },
  waste: { th: 'ของเสีย', en: 'Waste' },
  ghg: { th: 'ก๊าซเรือนกระจก', en: 'GHG' },
};

function monthMap(months: { month: number; value: number }[] | undefined): Map<number, number> {
  return new Map((months ?? []).map((m) => [m.month, m.value]));
}

/** Months present in BOTH baseline and current for a metric (0 stays 0). */
function comparableMonthsForMetric(metric: MultiYearMetric): number[] {
  const baseline = monthMap(metric.years[String(metric.baselineYear)]?.months);
  const current = monthMap(metric.years[String(metric.currentYear)]?.months);
  const out: number[] = [];
  for (let m = 1; m <= 12; m++) {
    if (baseline.has(m) && current.has(m)) out.push(m);
  }
  return out;
}

/**
 * Intersection of comparable months across all six dashboard resources.
 * Canonical data currently yields Jan–Jul when fuel/paper/waste/ghg stop at Jul.
 */
export function resolveCommonComparableMonths(
  metrics: MultiYearMetric[] = DASHBOARD_RESOURCE_IDS.map((id) => generatedMetricMap[id]).filter(Boolean),
): number[] {
  if (metrics.length === 0) return [];
  let common = new Set<number>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  for (const metric of metrics) {
    const months = new Set(comparableMonthsForMetric(metric));
    common = new Set([...common].filter((m) => months.has(m)));
  }
  return [...common].sort((a, b) => a - b);
}

function sumCommonMonths(
  metric: MultiYearMetric,
  year: number,
  commonMonths: number[],
): number | null {
  const map = monthMap(metric.years[String(year)]?.months);
  if (commonMonths.length === 0) return null;
  let sum = 0;
  for (const m of commonMonths) {
    if (!map.has(m)) return null;
    sum += map.get(m) as number;
  }
  return round1(sum);
}

function buildPeriodCaption(commonMonths: number[], locale: 'th' | 'en'): string {
  if (commonMonths.length === 0) return '';
  const first = monthLabel(commonMonths[0], locale);
  const last = monthLabel(commonMonths[commonMonths.length - 1], locale);
  const n = commonMonths.length;
  return locale === 'th'
    ? `ช่วงเทียบเคียง ${first}–${last} 2569 กับ ${first}–${last} 2568 (${n} เดือน)`
    : `${first}–${last} FY2569 vs ${first}–${last} FY2568 (${n} months)`;
}

function buildPeriodDescription(commonMonths: number[], locale: 'th' | 'en'): string {
  if (commonMonths.length === 0) {
    return locale === 'th'
      ? 'ยังไม่มีช่วงเดือนที่ครบทั้งหกทรัพยากร — ดัชนีไม่พร้อม'
      : 'No month range is common to all six resources yet — index unavailable.';
  }
  return locale === 'th'
    ? 'ดัชนี = (รวม 2569 ÷ รวม 2568) × 100 สำหรับช่วงเดียวกันเท่านั้น · ค่าที่ต่ำกว่า 100 = การใช้ทรัพยากรลดลง (ดีขึ้น)'
    : 'Index = (FY2569 sum ÷ FY2568 sum) × 100 for the same months only · Below 100 = reduced consumption (improvement)';
}

export function buildNormalizedVM(locale: 'th' | 'en'): NormalizedVM {
  const th = locale === 'th';
  const metrics = DASHBOARD_RESOURCE_IDS.map((id) => generatedMetricMap[id]).filter(Boolean);
  const commonMonths = resolveCommonComparableMonths(metrics);

  const resources: NormalizedResourceVM[] = dashboards
    .filter((d) => DASHBOARD_RESOURCE_IDS.includes(d.id as (typeof DASHBOARD_RESOURCE_IDS)[number]))
    .map((d) => {
      const metric = generatedMetricMap[d.id];
      const labels = RESOURCE_LABELS[d.id];
      const label = th ? (labels?.th ?? d.titleTh ?? d.title) : (labels?.en ?? d.title);

      if (!metric || commonMonths.length === 0) {
        return { id: d.id, label, color: d.color, baselineTotal: null, currentTotal: null, index: null };
      }

      const baselineTotal = sumCommonMonths(metric, metric.baselineYear, commonMonths);
      const currentTotal = sumCommonMonths(metric, metric.currentYear, commonMonths);
      let index: number | null = null;
      if (baselineTotal != null && currentTotal != null && baselineTotal !== 0) {
        index = Math.round((currentTotal / baselineTotal) * 100);
      }

      return { id: d.id, label, color: d.color, baselineTotal, currentTotal, index };
    });

  return {
    locale,
    commonMonths,
    commonCount: commonMonths.length,
    periodCaption: buildPeriodCaption(commonMonths, locale),
    periodDescription: buildPeriodDescription(commonMonths, locale),
    resources,
  };
}
