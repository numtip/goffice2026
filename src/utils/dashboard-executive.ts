/**
 * Executive Dashboard Intelligence Utilities
 * 
 * Deterministic algorithms for confidence scoring and insight generation.
 * No AI API calls — all logic based on canonical data.
 */

import type { MultiYearMetric, YearData } from './multi-year-schema';

/**
 * Indicator direction configuration
 * Determines whether "improvement" means increase or decrease
 * Based on actual indicator, not metric slug
 */
export type IndicatorDirection = 'lower-is-better' | 'higher-is-better' | 'neutral';

/**
 * Resolve indicator direction based on actual indicator ID/name/type
 * Never infers from metric slug alone
 */
export function resolveIndicatorDirection(metric: MultiYearMetric): IndicatorDirection {
  // Check related indicators for direction context
  const primaryIndicator = metric.relatedIndicators?.[0];
  if (!primaryIndicator) {
    return 'neutral';
  }

  const indicatorId = primaryIndicator.indicatorId.toLowerCase();
  const indicatorLabel = primaryIndicator.label?.toLowerCase() || '';

  // Explicit direction rules based on indicator semantics
  if (indicatorId.includes('consumption') || indicatorLabel.includes('consumption')) {
    return 'lower-is-better';
  }
  if (indicatorId.includes('emission') || indicatorLabel.includes('emission')) {
    return 'lower-is-better';
  }
  if (indicatorId.includes('ghg') || indicatorLabel.includes('ghg')) {
    return 'lower-is-better';
  }
  if (indicatorId.includes('total-waste') || indicatorId.includes('waste-total') || indicatorLabel.includes('total waste')) {
    return 'lower-is-better';
  }
  if (indicatorId.includes('recycling') || indicatorId.includes('recovery') || indicatorLabel.includes('recycling') || indicatorLabel.includes('recovery')) {
    return 'higher-is-better';
  }

  // Default to neutral if direction cannot be determined
  return 'neutral';
}

/**
 * Provenance quality scores based on dataClassification
 */
const PROVENANCE_SCORES: Record<string, number> = {
  CONFIRMED_XLSX: 1.0,
  DERIVED_FROM_CSV: 0.6,
  PLACEHOLDER: 0.0,
  UNKNOWN: 0.0,
  PRESERVED_LEGACY: 0.5,
  MANUAL_ENTRY: 0.3,
};

/**
 * Calculate recency score based on trustworthy date
 * 
 * Thresholds:
 * - 0–90 days: 10 points
 * - 91–180 days: 7 points
 * - 181–365 days: 4 points
 * - over 365 days: 1 point
 * - missing: 0 points
 * - invalid: 0 points
 * - future date: 0 points
 * - untrusted source: 0 points
 * 
 * @param dateValue - The date to evaluate (ISO string or timestamp)
 * @param now - Current timestamp for testing (defaults to Date.now())
 */
export function calculateRecencyScore(dateValue: string | number | null | undefined, now: number = Date.now()): number {
  if (!dateValue) {
    return 0;
  }

  const date = typeof dateValue === 'number' ? dateValue : Date.parse(dateValue);
  
  // Invalid date
  if (isNaN(date)) {
    return 0;
  }

  // Future date
  if (date > now) {
    return 0;
  }

  const daysOld = (now - date) / (1000 * 60 * 60 * 24);

  if (daysOld <= 90) return 10;
  if (daysOld <= 180) return 7;
  if (daysOld <= 365) return 4;
  return 1;
}

/**
 * Find comparable months between two year data objects
 * Returns months present and valid in BOTH periods
 * Requires at least 3 comparable months
 */
export function getComparableMonths(
  baseline: YearData,
  current: YearData
): { baselineValues: number[]; currentValues: number[]; monthCount: number } | null {
  // Create month lookup from baseline
  const baselineMap = new Map<number, number>();
  for (const m of baseline.months) {
    if (m.value !== null && m.value !== undefined && !isNaN(m.value)) {
      baselineMap.set(m.month, m.value);
    }
  }

  // Find matching months in current
  const baselineValues: number[] = [];
  const currentValues: number[] = [];

  for (const m of current.months) {
    if (m.value !== null && m.value !== undefined && !isNaN(m.value)) {
      const baselineValue = baselineMap.get(m.month);
      if (baselineValue !== undefined) {
        baselineValues.push(baselineValue);
        currentValues.push(m.value);
      }
    }
  }

  // Require at least 3 comparable months
  if (baselineValues.length < 3) {
    return null;
  }

  return { baselineValues, currentValues, monthCount: baselineValues.length };
}

/**
 * Calculate confidence score (0-100) based on data quality
 * 
 * Weighting:
 * - Coverage: 40% (months with data / 12)
 * - Verification: 30% (quality.valid ? 1 : 0.5)
 * - Provenance: 20% (based on dataClassification)
 * - Recency: 10% (based on calculated recency score)
 * 
 * Returns score 0-100
 */
export function calculateConfidence(
  metric: MultiYearMetric,
  year: number = metric.currentYear
): { score: number; level: 'High' | 'Medium' | 'Low'; reasons: string[] } {
  const yearData = metric.years[year.toString()];
  if (!yearData) {
    return {
      score: 0,
      level: 'Low',
      reasons: ['No data for this year'],
    };
  }

  const reasons: string[] = [];

  // 1. Coverage score (40%)
  const coverage = yearData.months.length / 12;
  let coverageScore = coverage * 40;
  if (coverage === 1) {
    reasons.push('Complete 12-month coverage');
  } else if (coverage >= 0.75) {
    reasons.push(`High coverage (${yearData.months.length}/12 months)`);
  } else {
    reasons.push(`Partial coverage (${yearData.months.length}/12 months)`);
  }

  // Rule: fewer than 6 months cannot exceed Low
  if (coverage < 0.5) {
    return {
      score: coverageScore,
      level: 'Low',
      reasons: [...reasons, 'Less than 6 months of data'],
    };
  }

  // 2. Verification score (30%)
  const isVerified = yearData.quality?.valid === true;
  let verificationScore = isVerified ? 30 : 15;
  if (isVerified) {
    reasons.push('Data verified and quality-checked');
  } else {
    reasons.push('Data not yet verified');
  }

  // Rule: unverified data cannot receive High
  if (!isVerified && coverageScore + verificationScore >= 60) {
    verificationScore = 15;
    reasons.push('Unverified data limits confidence level');
  }

  // 3. Provenance score (20%)
  const provenance = yearData.dataClassification ?? 'UNKNOWN';
  let provenanceScore = (PROVENANCE_SCORES[provenance] ?? 0) * 20;
  if (provenanceScore >= 15) {
    reasons.push('High-quality data source');
  } else if (provenanceScore === 0) {
    reasons.push('Provenance unknown or placeholder');
  }

  // Rule: placeholder or unknown provenance cannot receive High
  if ((provenance === 'PLACEHOLDER' || provenance === 'UNKNOWN') && coverageScore + verificationScore >= 60) {
    provenanceScore = 0;
  }

  // 4. Recency score (10%) - use trustworthy date
  const recencyDate = yearData.provenance?.extractionTimestamp || yearData.updated;
  const recencyScore = calculateRecencyScore(recencyDate);
  if (recencyScore === 10) {
    reasons.push('Recent data (within 90 days)');
  } else if (recencyScore === 7) {
    reasons.push('Data within 6 months');
  } else if (recencyScore === 4) {
    reasons.push('Data within 1 year');
  } else if (recencyScore === 1) {
    reasons.push('Data older than 1 year');
  } else if (recencyScore === 0) {
    reasons.push('Recency information missing or invalid');
  }

  const totalScore = coverageScore + verificationScore + provenanceScore + recencyScore;

  // Clamp score to 0-100
  const clampedScore = Math.max(0, Math.min(100, totalScore));

  // Determine confidence level
  let level: 'High' | 'Medium' | 'Low';
  if (clampedScore >= 80) {
    level = 'High';
  } else if (clampedScore >= 50) {
    level = 'Medium';
  } else {
    level = 'Low';
  }

  return {
    score: Math.round(clampedScore),
    level,
    reasons,
  };
}

/**
 * Generate executive summary insights
 */
export interface ExecutiveInsight {
  type: 'status' | 'positive' | 'attention' | 'recommendation';
  text: string;
  metricId?: string;
}

export function generateExecutiveInsights(
  metric: MultiYearMetric,
  locale: 'th' | 'en'
): ExecutiveInsight[] {
  const insights: ExecutiveInsight[] = [];
  const th = locale === 'th';
  const direction = resolveIndicatorDirection(metric);

  const currentYear = metric.years[metric.currentYear.toString()];
  const baselineYear = metric.years[metric.baselineYear.toString()];

  // === Current Status ===
  const coverage = currentYear?.months.length ?? 0;
  const isVerified = currentYear?.quality?.valid === true;

  if (!currentYear || coverage === 0) {
    insights.push({
      type: 'status',
      text: th
        ? 'ยังไม่มีข้อมูลปีปัจจุบัน'
        : 'No current-year data available',
    });
    return insights;
  }

  if (coverage === 12) {
    insights.push({
      type: 'status',
      text: th
        ? `ข้อมูลครบถ้วน 12 เดือน ${isVerified ? 'และผ่านการยืนยัน' : 'แต่ยังไม่ผ่านการยืนยัน'}`
        : `Complete 12-month data ${isVerified ? 'and verified' : 'but unverified'}`,
    });
  } else {
    insights.push({
      type: 'status',
      text: th
        ? `มีข้อมูล ${coverage} เดือน ${isVerified ? '(ผ่านการยืนยัน)' : '(ยังไม่ผ่านการยืนยัน)'} แนวโน้มทั้งปีอาจยังไม่แสดงภาพเต็ม`
        : `${coverage} months of data ${isVerified ? '(verified)' : '(unverified)'}. Full-year trends not yet reliable.`,
    });
  }

  // === Comparable-month comparison ===
  const comparableMonths = baselineYear && currentYear
    ? getComparableMonths(baselineYear, currentYear)
    : null;

  // === Positive Findings ===
  if (metric.yoyChange && baselineYear && currentYear && comparableMonths && direction !== 'neutral') {
    const isImprovement = direction === 'lower-is-better'
      ? metric.yoyChange.direction === 'down'
      : metric.yoyChange.direction === 'up';

    if (isImprovement && metric.yoyChange.direction !== 'stable') {
      insights.push({
        type: 'positive',
        text: th
          ? `${metric.label} ${direction === 'lower-is-better' ? 'ลดลง' : 'เพิ่มขึ้น'} ${Math.abs(metric.yoyChange.percent)}% เทียบปีฐาน (ดีขึ้น)`
          : `${metric.label} ${direction === 'lower-is-better' ? 'decreased' : 'increased'} by ${Math.abs(metric.yoyChange.percent)}% vs baseline (improvement)`,
      });
    } else if (metric.yoyChange.direction === 'stable') {
      insights.push({
        type: 'positive',
        text: th
          ? `${metric.label} คงที่เทียบปีฐาน (เสถียร)`
          : `${metric.label} stable vs baseline (stable)`,
      });
    }
  } else if (metric.yoyChange && direction === 'neutral') {
    insights.push({
      type: 'status',
      text: th
        ? 'ไม่สามารถประเมินแนวโน้มได้ ไม่พบข้อมูลเกี่ยวกับทิศทางที่ดีขึ้นหรือแย่ลง'
        : 'Trend direction cannot be evaluated - indicator direction information unavailable',
    });
  }

  if (metric.target?.targetValue !== undefined && metric.target.targetValue !== null && currentYear.total !== undefined && coverage >= 9 && direction !== 'neutral') {
    const meetsTarget = direction === 'lower-is-better'
      ? currentYear.total <= metric.target.targetValue
      : currentYear.total >= metric.target.targetValue;

    if (meetsTarget) {
      insights.push({
        type: 'positive',
        text: th
          ? `บรรลุเป้าหมายปี (เป้าหมาย: ${metric.target.targetValue} ${metric.unit})`
          : `Meets annual target (target: ${metric.target.targetValue} ${metric.unit})`,
      });
    }
  }

  // === Attention Points ===
  if (metric.yoyChange && baselineYear && currentYear && comparableMonths && direction !== 'neutral') {
    const isConcern = direction === 'lower-is-better'
      ? metric.yoyChange.direction === 'up'
      : metric.yoyChange.direction === 'down';

    if (isConcern && metric.yoyChange.direction !== 'stable') {
      insights.push({
        type: 'attention',
        text: th
          ? `${metric.label} ${direction === 'lower-is-better' ? 'เพิ่มขึ้น' : 'ลดลง'} ${Math.abs(metric.yoyChange.percent)}% เทียบปีฐาน (ต้องติดตาม)`
          : `${metric.label} ${direction === 'lower-is-better' ? 'increased' : 'decreased'} by ${Math.abs(metric.yoyChange.percent)}% vs baseline (monitor)`,
      });
    }
  }

  if (!comparableMonths) {
    insights.push({
      type: 'attention',
      text: th
        ? 'การเปรียบเทียบกับปีฐานยังไม่พร้อม ต้องการข้อมูลอย่างน้อย 3 เดือนที่ตรงกัน'
        : 'Comparison to baseline not yet available. Requires at least 3 matching months of data.',
    });
  } else {
    insights.push({
      type: 'status',
      text: th
        ? `เปรียบเทียบจาก ${comparableMonths.monthCount} เดือนที่มีข้อมูลทั้งสองปี`
        : `Comparison based on ${comparableMonths.monthCount} months with data in both years`,
    });
  }

  if (coverage < 12) {
    insights.push({
      type: 'attention',
      text: th
        ? `ข้อมูลไม่ครบ (${coverage}/12 เดือน) การเปรียบเทียบ YoY อาจไม่สะท้อนแนวโน้มทั้งปี`
        : `Incomplete data (${coverage}/12 months). YoY comparison may not reflect full-year trends.`,
    });
  }

  if (!isVerified) {
    insights.push({
      type: 'attention',
      text: th
        ? 'ข้อมูลยังไม่ผ่านการยืนยัน ควรตรวจสอบก่อนใช้เป็นข้อสรุป'
        : 'Data not yet verified. Review before using for conclusions.',
    });
  }

  if (metric.target?.targetValue !== undefined && metric.target.targetValue !== null && currentYear.total !== undefined && coverage >= 9 && direction !== 'neutral') {
    const missesTarget = direction === 'lower-is-better'
      ? currentYear.total > metric.target.targetValue
      : currentYear.total < metric.target.targetValue;

    if (missesTarget) {
      insights.push({
        type: 'attention',
        text: th
          ? `ยังไม่บรรลุเป้าหมายปี (เป้าหมาย: ${metric.target.targetValue} ${metric.unit})`
          : `Below annual target (target: ${metric.target.targetValue} ${metric.unit})`,
      });
    }
  }

  // === Recommendations ===
  if (coverage < 12) {
    insights.push({
      type: 'recommendation',
      text: th
        ? 'บันทึกข้อมูลรายเดือนที่ขาดหายให้ครบ 12 เดือน'
        : 'Continue monthly data collection to complete the year.',
    });
  }

  if (!isVerified) {
    insights.push({
      type: 'recommendation',
      text: th
        ? 'ตรวจสอบคุณภาพและยืนยันข้อมูลปีปัจจุบัน'
        : 'Verify and quality-check current-year data.',
    });
  }

  if (!metric.target || metric.target.targetValue === undefined || metric.target.targetValue === null) {
    insights.push({
      type: 'recommendation',
      text: th
        ? 'กำหนดเป้าหมายประจำปีเพื่อติดตามความคืบหน้า'
        : 'Define annual target to track progress.',
    });
  }

  if (!comparableMonths) {
    insights.push({
      type: 'recommendation',
      text: th
        ? 'รอข้อมูลครบ 3 เดือนที่ตรงกับปีฐานก่อนวิเคราะห์แนวโน้ม'
        : 'Wait for at least 3 matching months of data before trend analysis.',
    });
  }

  return insights;
}

/**
 * Find highest and lowest months in a year
 */
export function findExtremeMonths(
  months: { month: number; value: number }[]
): { highest: { month: number; value: number } | null; lowest: { month: number; value: number } | null } {
  if (months.length === 0) {
    return { highest: null, lowest: null };
  }

  const sorted = [...months].sort((a, b) => a.value - b.value);
  return {
    highest: sorted[sorted.length - 1] ?? null,
    lowest: sorted[0] ?? null,
  };
}

/**
 * Calculate rolling average
 * Returns array of same length, with null for months without enough data
 */
export function calculateRollingAverage(
  months: (number | null | undefined)[],
  windowSize: number = 3
): (number | null)[] {
  const result: (number | null)[] = [];

  for (let i = 0; i < months.length; i++) {
    const window = months.slice(Math.max(0, i - windowSize + 1), i + 1);
    const validValues = window.filter((v): v is number => v !== null && v !== undefined);

    if (validValues.length === windowSize) {
      const sum = validValues.reduce((acc, v) => acc + v, 0);
      result.push(sum / validValues.length);
    } else {
      result.push(null);
    }
  }

  return result;
}