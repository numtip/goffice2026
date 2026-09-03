/**
 * dashboard-explorer-vm.ts
 * ========================
 * GO-DASH-V2 Phase C — Partial YoY Explorer view-model.
 *
 * Builds localized copy + per-resource overlap YoY from generatedMetricMap
 * and dashboards config. Never uses metric.yoyChange.
 */
import { dashboards } from '../data/dashboard-config';
import { getLocalizedPath } from '../i18n/utils';
import { generatedMetricMap } from './dashboard-generated-metrics';
import {
  computePartialYoy,
  formatNullableCell,
  type PartialYoyResult,
} from './dashboard-partial-yoy';
import { monthLabel, round1 } from './chart-option';

export interface ExplorerResourceVM {
  id: string;
  label: string;
  color: string;
  unit: string;
  ctaHref: string;
  yoy: PartialYoyResult;
}

export interface ExplorerCopy {
  sectionTitle: string;
  sectionDescription: string;
  pendingNote: string;
  /** Localized caption for partial overlap, e.g. "Compared months: Jan–Jul (7)". */
  overlapCaption: (n: number, firstMonth: string, lastMonth: string) => string;
  baselineLabel: string;
  currentLabel: string;
  viewFullDashboard: string;
  deltaLabel: string;
  monthHeader: string;
  /** Column headers for the drill table (Month | FY2568 | FY2569 | Δ). */
  tableHeaders: [string, string, string, string];
  /** Footer labels for overlap totals row. */
  totalsRowLabel: string;
  baselineTotalLabel: string;
  currentTotalLabel: string;
  pendingTitle: string;
  pendingBody: string;
  resourceTablistLabel: string;
  deltaUp: string;
  deltaDown: string;
  deltaStable: string;
}

export interface ExplorerVM {
  locale: 'th' | 'en';
  defaultResourceId: string;
  resources: ExplorerResourceVM[];
  copy: ExplorerCopy;
  /** Per-resource drill rows: [monthLabel, baseline|'—', current|'—', delta|'—']. */
  drillRows: Record<string, string[][]>;
}

const RESOURCE_LABELS: Record<string, { th: string; en: string }> = {
  energy: { th: 'ไฟฟ้า', en: 'Energy' },
  water: { th: 'น้ำ', en: 'Water' },
  fuel: { th: 'เชื้อเพลิง', en: 'Fuel' },
  paper: { th: 'กระดาษ', en: 'Paper' },
  waste: { th: 'ของเสีย', en: 'Waste' },
  ghg: { th: 'ก๊าซเรือนกระจก', en: 'GHG' },
};

function buildCopy(locale: 'th' | 'en'): ExplorerCopy {
  const th = locale === 'th';
  return {
    sectionTitle: th ? 'เปรียบเทียบปีต่อปี (ช่วงเวลาเดียวกัน)' : 'Year-over-Year (Comparable Months)',
    sectionDescription: th
      ? 'เปรียบเทียบเฉพาะเดือนที่มีข้อมูลทั้งปีฐานและปีปัจจุบัน เดือนที่ยังไม่มีข้อมูลแสดงเป็นช่องว่าง (ไม่นับเป็น 0)'
      : 'Compare only months present in both baseline and current years. Missing months stay blank (never treated as 0).',
    pendingNote: th
      ? 'ยังไม่มีข้อมูลปีปัจจุบัน — ไม่สามารถคำนวณ YoY ได้'
      : 'No current-year data yet — YoY cannot be calculated.',
    overlapCaption: (n, firstMonth, lastMonth) =>
      th
        ? `เปรียบเทียบ ${firstMonth}–${lastMonth} 2569 กับ ${firstMonth}–${lastMonth} 2568 (${n} เดือน)`
        : `${firstMonth}–${lastMonth} FY2569 vs ${firstMonth}–${lastMonth} FY2568 (${n} months)`,
    baselineLabel: th ? 'ปีฐาน 2568' : 'FY2568',
    currentLabel: th ? 'ปีปัจจุบัน 2569' : 'FY2569',
    viewFullDashboard: th ? 'ดูแดชบอร์ดเต็ม' : 'View full dashboard',
    deltaLabel: th ? 'ผลต่าง' : 'Δ',
    monthHeader: th ? 'เดือน' : 'Month',
    tableHeaders: th
      ? ['เดือน', 'ปี 2568', 'ปี 2569', 'Δ']
      : ['Month', 'FY2568', 'FY2569', 'Δ'],
    totalsRowLabel: th ? 'รวมช่วงที่เทียบได้' : 'Matched-period total',
    baselineTotalLabel: th ? 'รวม 2568' : 'FY2568 total',
    currentTotalLabel: th ? 'รวม 2569' : 'FY2569 total',
    pendingTitle: th ? 'รอข้อมูลปี 2569' : 'Waiting for FY2569 data',
    pendingBody: th
      ? 'เมื่อมีข้อมูลรายเดือน จะคำนวณ YoY จากเดือนที่ทับซ้อนกับปีฐานโดยอัตโนมัติ'
      : 'When monthly data arrives, overlap YoY will be calculated automatically against the baseline year.',
    resourceTablistLabel: th ? 'เลือกทรัพยากร' : 'Select resource',
    deltaUp: th ? 'เพิ่มขึ้น' : 'Up',
    deltaDown: th ? 'ลดลง' : 'Down',
    deltaStable: th ? 'คงที่' : 'Stable',
  };
}

function buildDrillRows(
  yoy: PartialYoyResult,
  locale: 'th' | 'en',
  copy: ExplorerCopy,
): string[][] {
  const monthRows = yoy.points.map((p) => [
    monthLabel(p.month, locale),
    formatNullableCell(p.baseline),
    formatNullableCell(p.current),
    formatNullableCell(p.delta),
  ]);

  if (yoy.status === 'pending' || yoy.comparableCount === 0) {
    return monthRows;
  }

  const totalRow = [
    copy.totalsRowLabel,
    formatNullableCell(yoy.baselineOverlapTotal != null ? round1(yoy.baselineOverlapTotal) : null),
    formatNullableCell(yoy.currentOverlapTotal != null ? round1(yoy.currentOverlapTotal) : null),
    formatNullableCell(yoy.absolute != null ? round1(yoy.absolute) : null),
  ];

  return [...monthRows, totalRow];
}

export function buildExplorerVM(locale: 'th' | 'en'): ExplorerVM {
  const copy = buildCopy(locale);
  const th = locale === 'th';

  const resources: ExplorerResourceVM[] = dashboards.map((d) => {
    const metric = generatedMetricMap[d.id];
    const yoy = computePartialYoy(metric, { id: d.id });
    const labels = RESOURCE_LABELS[d.id];
    return {
      id: d.id,
      label: th ? (labels?.th ?? d.titleTh ?? d.title) : (labels?.en ?? d.title),
      color: d.color,
      unit: metric.unit,
      ctaHref: getLocalizedPath(locale, `/dashboard/${d.id}`),
      yoy,
    };
  });

  const firstNonPending = resources.find((r) => r.yoy.status !== 'pending');
  const defaultResourceId = firstNonPending?.id ?? 'energy';

  const drillRows: Record<string, string[][]> = {};
  for (const r of resources) {
    drillRows[r.id] = buildDrillRows(r.yoy, locale, copy);
  }

  return {
    locale,
    defaultResourceId,
    resources,
    copy,
    drillRows,
  };
}

/** Resolve overlap caption text for a resource (empty string when not partial/complete with months). */
export function resolveOverlapCaption(
  yoy: PartialYoyResult,
  copy: ExplorerCopy,
  locale: 'th' | 'en',
): string {
  if (yoy.status === 'pending' || yoy.comparableCount === 0) return '';
  const first = yoy.comparableMonths[0];
  const last = yoy.comparableMonths[yoy.comparableMonths.length - 1];
  if (first == null || last == null) return '';
  return copy.overlapCaption(yoy.comparableCount, monthLabel(first, locale), monthLabel(last, locale));
}
