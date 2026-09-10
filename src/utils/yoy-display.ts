/**
 * yoy-display.ts
 * ==============
 * Localized rendering helpers for the matched-month YoY contract.
 *
 * Contract (PO 2026-09-10):
 *   - A partial current year is NEVER compared against a full baseline year.
 *   - `yoyChange.percent === null` (invalid window) renders as an em dash "—",
 *     never "0%", together with coverage text explaining the comparison window.
 *   - Coverage text always names the matched months and the observed months of
 *     each year so a reader can tell a same-period comparison from a full-year one.
 */
import type { YoyChange } from './multi-year-schema';

const MONTH_ABBR: Record<'th' | 'en', string[]> = {
  th: ['', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
  en: ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

/** "ม.ค.–ส.ค." / "Jan–Aug" for a contiguous range, else comma list. */
export function formatMonthWindow(months: number[], locale: 'th' | 'en'): string {
  if (!months || months.length === 0) return '';
  const abbr = MONTH_ABBR[locale];
  const sorted = [...months].sort((a, b) => a - b);
  const contiguous = sorted.every((m, i) => i === 0 || m === sorted[i - 1] + 1);
  if (contiguous) {
    return sorted.length === 1 ? abbr[sorted[0]] : `${abbr[sorted[0]]}–${abbr[sorted[sorted.length - 1]]}`;
  }
  return sorted.map((m) => abbr[m]).join(', ');
}

/**
 * Coverage sentence for a matched-month YoY record — always rendered next to the
 * trend so the comparison basis is explicit. Returns null when there is no
 * comparison window at all.
 */
export function formatYoyCoverage(yoy: YoyChange | null | undefined, locale: 'th' | 'en'): string | null {
  if (!yoy || yoy.count === 0) return null;
  const window = formatMonthWindow(yoy.months, locale);
  const th = locale === 'th';
  const partialCurrent = yoy.currentMonths < 12;
  const partialBaseline = yoy.baselineMonths < 12;

  if (th) {
    if (partialCurrent || partialBaseline) {
      return `เทียบเดือนเดียวกัน ${window} · ปี ${yoy.currentYear} มีข้อมูล ${yoy.currentMonths}/12 เดือน · ปีฐาน ${yoy.baselineYear} ${yoy.baselineMonths}/12 เดือน`;
    }
    return `เทียบปี ${yoy.currentYear} กับปีฐาน ${yoy.baselineYear} (ครบ 12 เดือน)`;
  }
  if (partialCurrent || partialBaseline) {
    return `Matched months ${window} · FY${yoy.currentYear} has ${yoy.currentMonths}/12 months · baseline FY${yoy.baselineYear} ${yoy.baselineMonths}/12 months`;
  }
  return `FY${yoy.currentYear} vs FY${yoy.baselineYear} baseline (full 12 months)`;
}

/**
 * Trend text, or the em dash when the comparison window is not valid.
 * `formatYoyTrend(yoy, locale)` → "+7.7% ↑" | "-14.2% ↓" | "—"
 */
export function formatYoyTrend(yoy: YoyChange | null | undefined): string {
  if (!yoy || yoy.percent === null || yoy.direction === null) return '\u2014';
  const arrow = yoy.direction === 'up' ? '\u2191' : yoy.direction === 'down' ? '\u2193' : '\u2192';
  return `${yoy.percent > 0 ? '+' : ''}${yoy.percent}% ${arrow}`;
}

/** True when the matched-month window is valid and a percent may be shown. */
export function isYoyComparable(yoy: YoyChange | null | undefined): boolean {
  return Boolean(yoy && yoy.valid && yoy.percent !== null);
}

/** Direction safe for components that require a non-null trend direction. */
export function yoyDirectionOf(yoy: YoyChange | null | undefined): 'up' | 'down' | 'stable' {
  return yoy?.direction ?? 'stable';
}

/** Percent for cards that accept null (renders "—" downstream). */
export function yoyPercentOf(yoy: YoyChange | null | undefined): number | null {
  return isYoyComparable(yoy) ? (yoy as YoyChange).percent : null;
}

/** Human-readable reason an invalid window cannot be compared (never "0%"). */
export function formatYoyReason(yoy: YoyChange | null | undefined, locale: 'th' | 'en'): string | null {
  if (!yoy || yoy.valid) return null;
  const th = locale === 'th';
  switch (yoy.reason) {
    case 'current-missing':
      return th ? 'ยังไม่มีข้อมูลปีปัจจุบัน — ไม่แสดงค่าเทียบปี' : 'No current-year data — year-on-year not shown';
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
