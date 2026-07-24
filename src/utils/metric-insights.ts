/**
 * Metric-specific insight calculations.
 *
 * All computations derive from verified/available fields in the canonical
 * data. No new data is ever fabricated. If a field is missing or unverified,
 * the insight is suppressed rather than showing a fabricated value.
 */

import type { MultiYearMetric, YearData } from './multi-year-schema';

/** Insight card data — mirrors MetricInsightGrid.astro's InsightItem */
export interface InsightItem {
  id: string;
  label: string;
  value: string;
  unit?: string;
  context?: string;
  /** warning | info | positive | neutral */
  tone?: 'warning' | 'info' | 'positive' | 'neutral';
}

export interface MetricInsightContext {
  metric: MultiYearMetric;
  baselineYear: YearData | undefined;
  currentYear: YearData | undefined;
  locale: 'th' | 'en';
}

const fmt = (v: number, locale: string) =>
  Intl.NumberFormat(locale === 'th' ? 'th' : 'en').format(Math.round(v));

/**
 * Compute metric-specific insight cards.
 * Only returns insights from verified/available data.
 */
export function computeMetricInsights(ctx: MetricInsightContext): InsightItem[] {
  const { metric, baselineYear, currentYear, locale } = ctx;
  const th = locale === 'th';
  const insights: InsightItem[] = [];

  if (!baselineYear || baselineYear.months.length === 0) return insights;

  const baselineVerified = baselineYear.quality?.valid !== false;
  const currentVerified = currentYear?.quality?.valid !== false && (currentYear?.months.length ?? 0) > 0;

  // Use verified year for primary stats (prefer baseline if current unverified)
  const primaryYear = currentVerified && currentYear ? currentYear : baselineYear;
  const primaryVerified = currentVerified && currentYear ? currentVerified : baselineVerified;

  switch (metric.metric) {
    case 'energy': {
      // monthly peak, average/month, completeness
      const values = primaryYear.months.map((m) => m.value);
      const peak = Math.max(...values);
      const avg = primaryYear.average;
      const completeness = Math.round((primaryYear.months.length / 12) * 100);

      insights.push({
        id: 'peak',
        label: th ? 'การใช้สูงสุด' : 'Monthly Peak',
        value: fmt(peak, locale),
        unit: metric.unit,
        context: th
          ? `เดือน ${primaryYear.months.find((m) => m.value === peak)?.label ?? '-'}`
          : `Month ${primaryYear.months.find((m) => m.value === peak)?.label ?? '-'}`,
        tone: 'warning',
      });
      insights.push({
        id: 'avg',
        label: th ? 'เฉลี่ย/เดือน' : 'Average / Month',
        value: fmt(avg, locale),
        unit: metric.unit,
        context: th ? `จากข้อมูล ${primaryYear.months.length} เดือน` : `From ${primaryYear.months.length} months`,
        tone: 'info',
      });
      insights.push({
        id: 'completeness',
        label: th ? 'ความครบถ้วน' : 'Completeness',
        value: `${completeness}%`,
        context: th ? `${primaryYear.months.length} จาก 12 เดือน` : `${primaryYear.months.length} of 12 months`,
        tone: completeness >= 100 ? 'positive' : 'neutral',
      });
      break;
    }

    case 'water': {
      const values = primaryYear.months.map((m) => m.value);
      const peak = Math.max(...values);
      const avg = primaryYear.average;

      // Outlier detection: any month > 2x average
      const outliers = primaryYear.months.filter((m) => m.value > avg * 2);
      const hasOutlier = outliers.length > 0;

      insights.push({
        id: 'peak',
        label: th ? 'การใช้สูงสุด' : 'Monthly Peak',
        value: fmt(peak, locale),
        unit: metric.unit,
        context: th
          ? `เดือน ${primaryYear.months.find((m) => m.value === peak)?.label ?? '-'}`
          : `Month ${primaryYear.months.find((m) => m.value === peak)?.label ?? '-'}`,
        tone: 'warning',
      });
      insights.push({
        id: 'avg',
        label: th ? 'เฉลี่ย/เดือน' : 'Average / Month',
        value: fmt(avg, locale),
        unit: metric.unit,
        context: th ? `จากข้อมูล ${primaryYear.months.length} เดือน` : `From ${primaryYear.months.length} months`,
        tone: 'info',
      });
      if (hasOutlier) {
        insights.push({
          id: 'outlier',
          label: th ? 'ค่าผิดปกติ' : 'Outlier Warning',
          value: outliers.length.toString(),
          unit: th ? 'เดือน' : 'month(s)',
          context: th
            ? `พบเดือนที่ใช้น้ำสูงกว่า 2 เท่าของค่าเฉลี่ย`
            : `Month(s) with usage > 2× average detected`,
          tone: 'warning',
        });
      } else {
        insights.push({
          id: 'outlier',
          label: th ? 'ค่าผิดปกติ' : 'Outlier Check',
          value: th ? 'ไม่พบ' : 'None',
          context: th ? 'ไม่พบเดือนที่ใช้สูงผิดปกติ' : 'No months with abnormal usage',
          tone: 'positive',
        });
      }
      break;
    }

    case 'fuel': {
      const allMonths = primaryYear.months;
      const zeroMonths = allMonths.filter((m) => m.value === 0);
      const recordedMonths = allMonths.filter((m) => m.value > 0);
      const avg = recordedMonths.length > 0
        ? Math.round(recordedMonths.reduce((s, m) => s + m.value, 0) / recordedMonths.length)
        : 0;

      insights.push({
        id: 'zero-months',
        label: th ? 'เดือนที่ไม่มีการใช้' : 'Zero-Use Months',
        value: zeroMonths.length.toString(),
        unit: th ? 'เดือน' : 'month(s)',
        context: zeroMonths.length > 0
          ? (th ? `เดือนที่บันทึกการใช้เป็น 0 ${metric.unit}` : `Months with 0 ${metric.unit} recorded`)
          : (th ? 'ไม่มีเดือนที่ใช้เป็น 0' : 'No zero-use months'),
        tone: zeroMonths.length > 0 ? 'neutral' : 'positive',
      });
      insights.push({
        id: 'avg',
        label: th ? 'เฉลี่ย/เดือนที่บันทึก' : 'Avg / Recorded Month',
        value: fmt(avg, locale),
        unit: metric.unit,
        context: th
          ? `คำนวณจาก ${recordedMonths.length} เดือนที่มีการใช้`
          : `From ${recordedMonths.length} active month(s)`,
        tone: 'info',
      });
      insights.push({
        id: 'completeness',
        label: th ? 'ความครบถ้วน' : 'Completeness',
        value: `${Math.round((allMonths.length / 12) * 100)}%`,
        context: th ? `${allMonths.length} จาก 12 เดือน` : `${allMonths.length} of 12 months`,
        tone: allMonths.length >= 12 ? 'positive' : 'neutral',
      });
      break;
    }

    case 'paper': {
      const avg = primaryYear.average;
      const completeness = Math.round((primaryYear.months.length / 12) * 100);

      insights.push({
        id: 'avg',
        label: th ? 'เฉลี่ย/เดือน' : 'Average / Month',
        value: fmt(avg, locale),
        unit: metric.unit,
        context: th ? `จากข้อมูล ${primaryYear.months.length} เดือน` : `From ${primaryYear.months.length} months`,
        tone: 'info',
      });

      // Reduction status — only when target is valid AND current is verified
      const target = metric.target;
      if (target?.targetValue !== null && target?.targetValue !== undefined && currentVerified && currentYear) {
        const isOnTrack = currentYear.total <= (target.targetValue as number);
        insights.push({
          id: 'reduction',
          label: th ? 'สถานะการลด' : 'Reduction Status',
          value: isOnTrack ? (th ? 'ตามเป้า' : 'On Track') : (th ? 'เกินเป้า' : 'Off Track'),
          context: th
            ? `เป้าหมาย ${fmt(target.targetValue, locale)}${metric.unit} · ปัจจุบัน ${fmt(currentYear.total, locale)}${metric.unit}`
            : `Target ${fmt(target.targetValue, locale)}${metric.unit} · Current ${fmt(currentYear.total, locale)}${metric.unit}`,
          tone: isOnTrack ? 'positive' : 'warning',
        });
      } else {
        insights.push({
          id: 'reduction',
          label: th ? 'สถานะการลด' : 'Reduction Status',
          value: th ? 'ยังไม่ประเมิน' : 'Not Assessed',
          context: th
            ? 'ยังไม่กำหนดเป้าหมาย หรือข้อมูลยังไม่ยืนยัน'
            : 'Target not set or data unverified',
          tone: 'neutral',
        });
      }

      insights.push({
        id: 'completeness',
        label: th ? 'ความครบถ้วน' : 'Completeness',
        value: `${completeness}%`,
        context: th ? `${primaryYear.months.length} จาก 12 เดือน` : `${primaryYear.months.length} of 12 months`,
        tone: completeness >= 100 ? 'positive' : 'neutral',
      });
      break;
    }

    case 'waste': {
      // Waste uses average aggregation — NEVER sum percentages
      const avg = primaryYear.average; // This is the monthly average %
      const completeness = Math.round((primaryYear.months.length / 12) * 100);

      insights.push({
        id: 'avg',
        label: th ? 'เฉลี่ยรีไซเคิล/เดือน' : 'Monthly Recycling Avg',
        value: fmt(avg, locale),
        unit: metric.unit,
        context: th
          ? `ค่าเฉลี่ยรายเดือนจาก ${primaryYear.months.length} เดือน (ไม่ใช่ผลรวม)`
          : `Monthly average from ${primaryYear.months.length} months (not a sum)`,
        tone: 'info',
      });
      insights.push({
        id: 'completeness',
        label: th ? 'ความครบถ้วน' : 'Completeness',
        value: `${completeness}%`,
        context: th ? `${primaryYear.months.length} จาก 12 เดือน` : `${primaryYear.months.length} of 12 months`,
        tone: completeness >= 100 ? 'positive' : 'neutral',
      });
      // Explicit note about aggregation method
      insights.push({
        id: 'method',
        label: th ? 'วิธีคำนวณ' : 'Aggregation Method',
        value: th ? 'ค่าเฉลี่ย' : 'Average',
        context: th
          ? 'หน่วยเป็นเปอร์เซ็นต์ ใช้ค่าเฉลี่ยรายเดือน ไม่รวมค่าเปอร์เซ็นต์'
          : 'Percentage metric — monthly average, percentages are not summed',
        tone: 'neutral',
      });
      break;
    }

    case 'ghg': {
      // Total tCO2e, scope breakdown placeholder, no scope chart without real data
      const total = primaryYear.aggregation === 'average' ? primaryYear.average : primaryYear.total;
      const completeness = Math.round((primaryYear.months.length / 12) * 100);

      insights.push({
        id: 'total',
        label: th ? 'ปริมาณรวม' : 'Total Emissions',
        value: fmt(total, locale),
        unit: metric.unit,
        context: th
          ? `${primaryYear.year} · ${primaryYear.aggregation === 'average' ? 'ค่าเฉลี่ย' : 'ผลรวม'}จาก ${primaryYear.months.length} เดือน`
          : `${primaryYear.year} · ${primaryYear.aggregation === 'average' ? 'Averaged' : 'Summed'} from ${primaryYear.months.length} months`,
        tone: primaryVerified ? 'info' : 'neutral',
      });
      insights.push({
        id: 'completeness',
        label: th ? 'ความครบถ้วน' : 'Completeness',
        value: `${completeness}%`,
        context: th ? `${primaryYear.months.length} จาก 12 เดือน` : `${primaryYear.months.length} of 12 months`,
        tone: completeness >= 100 ? 'positive' : 'neutral',
      });
      // Scope breakdown placeholder — explicitly state data not available
      insights.push({
        id: 'scope',
        label: th ? 'แยกตามขอบเขต' : 'Scope Breakdown',
        value: th ? 'ยังไม่มีข้อมูล' : 'Not Available',
        context: th
          ? 'ข้อมูลแยก Scope 1, 2, 3 ยังไม่พร้อม ไม่แสดงกราฟขอบเขตจนกว่าจะมีข้อมูลจริง'
          : 'Scope 1, 2, 3 breakdown not yet available — no scope chart shown until real data exists',
        tone: 'neutral',
      });
      break;
    }
  }

  return insights;
}

/**
 * Build the executive insight strip text from data status.
 * Never hardcodes numbers — all values come from the data.
 */
export function buildExecutiveInsight(
  metric: MultiYearMetric,
  baselineYear: YearData | undefined,
  currentYear: YearData | undefined,
  locale: 'th' | 'en',
): {
  summary: string;
  monthsLine: string;
  interpretation: string;
  type: 'warning' | 'info' | 'positive';
} {
  const th = locale === 'th';

  if (!baselineYear || !currentYear) {
    return {
      summary: th ? 'ยังไม่มีข้อมูลเพียงพอสำหรับการสรุป' : 'Insufficient data for summary',
      monthsLine: th ? 'ข้อมูลยังไม่ครบ' : 'Data incomplete',
      interpretation: th ? 'รอการบันทึกข้อมูลเพิ่มเติม' : 'Awaiting additional data entry',
      type: 'info',
    };
  }

  const currentVerified = currentYear.quality?.valid !== false;
  const monthCount = currentYear.months.length;
  const hasFullYear = monthCount >= 12;

  if (!currentVerified) {
    return {
      summary: th
        ? `ข้อมูลปี ${metric.currentYear} ยังไม่ผ่านการยืนยัน`
        : `${metric.currentYear} data is unverified`,
      monthsLine: th
        ? `มีข้อมูล ${monthCount} จาก 12 เดือน แต่ชุดข้อมูลยังไม่ผ่านการยืนยัน`
        : `Data available for ${monthCount} of 12 months, but the dataset is unverified`,
      interpretation: th
        ? 'จึงยังไม่ควรใช้สรุปแนวโน้มทั้งปี — ตัวเลขปีปัจจุบันเป็นข้อมูลตัวอย่าง/รอตรวจสอบ'
        : 'Full-year trend conclusions should not be drawn — current-year figures are sample/pending verification',
      type: 'warning',
    };
  }

  if (!hasFullYear) {
    return {
      summary: th
        ? `ข้อมูลปี ${metric.currentYear} ยังไม่ครบปี`
        : `${metric.currentYear} data is partial`,
      monthsLine: th
        ? `มีข้อมูล ${monthCount} จาก 12 เดือน (ยืนยันแล้ว)`
        : `Data available for ${monthCount} of 12 months (verified)`,
      interpretation: th
        ? 'ตัวเลขเทียบปีฐานเป็นการเทียบแบบยังไม่ครบปี อาจไม่สะท้อนแนวโน้มทั้งปี'
        : 'Comparison against baseline is partial-year and may not represent the full annual trend',
      type: 'info',
    };
  }

  // Full year + verified
  const yoy = metric.yoyChange;
  const direction = yoy.direction;
  const isReduction = direction === 'down';

  return {
    summary: th
      ? `ข้อมูลปี ${metric.currentYear} ครบ 12 เดือนและยืนยันแล้ว`
      : `${metric.currentYear} data is complete (12 months) and verified`,
    monthsLine: th
      ? `เทียบกับปีฐาน ${metric.baselineYear}: ${direction === 'down' ? 'ลดลง' : direction === 'up' ? 'เพิ่มขึ้น' : 'คงที่'} ${yoy.percent > 0 ? '+' : ''}${yoy.percent}%`
      : `vs ${metric.baselineYear} baseline: ${direction === 'down' ? 'decreased' : direction === 'up' ? 'increased' : 'stable'} ${yoy.percent > 0 ? '+' : ''}${yoy.percent}%`,
    interpretation: isReduction
      ? (th ? 'แนวโน้มเป็นไปในทิศทางที่ดีตามเป้าหมายการลดการใช้' : 'Trend is favorable toward reduction targets')
      : (th ? 'ควรติดตามแนวโน้มต่อเนื่องและพิจารณามาตรการเพิ่มเติม' : 'Monitor trend and consider additional measures'),
    type: isReduction ? 'positive' : 'warning',
  };
}