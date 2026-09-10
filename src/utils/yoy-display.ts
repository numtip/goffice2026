/**
 * Localized rendering helpers for the matched-month YoY contract.
 * Counts describe analytically eligible months; raw observations can be higher
 * when a data-quality hold excludes a month from trend calculations.
 */
import type { YoyChange } from './multi-year-schema';

const MONTH_ABBR: Record<'th' | 'en', string[]> = {
  th: ['', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
  en: ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

export function formatMonthWindow(months: number[], locale: 'th' | 'en'): string {
  if (!months || months.length === 0) return '';
  const abbr = MONTH_ABBR[locale];
  const sorted = [...months].sort((a, b) => a - b);
  const contiguous = sorted.every((m, i) => i === 0 || m === sorted[i - 1] + 1);
  if (contiguous) return sorted.length === 1 ? abbr[sorted[0]] : `${abbr[sorted[0]]}–${abbr[sorted[sorted.length - 1]]}`;
  return sorted.map((m) => abbr[m]).join(', ');
}

export function formatYoyCoverage(yoy: YoyChange | null | undefined, locale: 'th' | 'en'): string | null {
  if (!yoy || yoy.count === 0) return null;
  const window = formatMonthWindow(yoy.months, locale);
  const th = locale === 'th';
  const partialCurrent = yoy.currentMonths < 12;
  const partialBaseline = yoy.baselineMonths < 12;

  if (th) {
    if (partialCurrent || partialBaseline) {
      return `เทียบเดือนเดียวกัน ${window} · ใช้วิเคราะห์ปี ${yoy.currentYear} ${yoy.currentMonths}/12 เดือน · ปีฐาน ${yoy.baselineYear} ${yoy.baselineMonths}/12 เดือน`;
    }
    return `เทียบปี ${yoy.currentYear} กับปีฐาน ${yoy.baselineYear} (ครบ 12 เดือน)`;
  }
  if (partialCurrent || partialBaseline) {
    return `Matched months ${window} · FY${yoy.currentYear} uses ${yoy.currentMonths}/12 analytically eligible months · baseline FY${yoy.baselineYear} ${yoy.baselineMonths}/12 months`;
  }
  return `FY${yoy.currentYear} vs FY${yoy.baselineYear} baseline (full 12 months)`;
}

export function formatYoyTrend(yoy: YoyChange | null | undefined): string {
  if (!yoy || yoy.percent === null || yoy.direction === null) return '—';
  const arrow = yoy.direction === 'up' ? '↑' : yoy.direction === 'down' ? '↓' : '→';
  return `${yoy.percent > 0 ? '+' : ''}${yoy.percent}% ${arrow}`;
}

export function isYoyComparable(yoy: YoyChange | null | undefined): boolean {
  return Boolean(yoy && yoy.valid && yoy.percent !== null);
}

export function yoyDirectionOf(yoy: YoyChange | null | undefined): 'up' | 'down' | 'stable' {
  return yoy?.direction ?? 'stable';
}

export function yoyPercentOf(yoy: YoyChange | null | undefined): number | null {
  return isYoyComparable(yoy) ? (yoy as YoyChange).percent : null;
}

export function formatYoyReason(yoy: YoyChange | null | undefined, locale: 'th' | 'en'): string | null {
  if (!yoy || yoy.valid) return null;
  const th = locale === 'th';
  switch (yoy.reason) {
    case 'current-missing':
      return th ? 'ยังไม่มีข้อมูลปีปัจจุบันที่ใช้วิเคราะห์ได้ — ไม่แสดงค่าเทียบปี' : 'No analytically eligible current-year data — year-on-year not shown';
    case 'baseline-missing':
      return th ? 'ยังไม่มีข้อมูลปีฐานสำหรับช่วงนี้' : 'No baseline data for this window';
    case 'no-overlapping-months':
      return th ? 'ไม่มีเดือนที่ข้อมูลทั้งสองปีตรงกัน — เทียบไม่ได้' : 'No overlapping months — comparison not available';
    case 'baseline-zero':
      return th ? 'ค่าปีฐานเป็นศูนย์ — ไม่สามารถคิดเป็นร้อยละได้' : 'Baseline is zero — percent not defined';
    default:
      return th ? 'การเทียบปีนี้ยังไม่สมบูรณ์' : 'Comparison window not valid';
  }
}
