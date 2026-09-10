/**
 * matched-yoy.mjs
 * ===============
 * Matched-month (same-period) year-over-year — the ONLY accepted YoY basis for
 * generated metric data.
 *
 * Rules (PO contract, 2026-09-10):
 *   - Never compare a partial current year against a full baseline year.
 *   - Comparison is computed over months present in BOTH years ("matched months").
 *   - When no window is valid (no overlapping months, missing year, zero
 *     baseline) every numeric field is null — never 0 — and `reason` explains why
 *     so the UI can render "—" with coverage text.
 *   - Percent uses one decimal (round half away from zero at 1dp) and matches
 *     `src/utils/dashboard-partial-yoy.ts` computePartialYoy() exactly.
 *   - Missing months are never coerced to 0. A present 0 stays 0.
 *
 * Canonical record shape (written into src/data/generated/<metric>.json):
 * {
 *   basis: 'matched-months',
 *   baselineYear, currentYear,
 *   months: [1..8], count: 8,
 *   baselineMonths: 12, currentMonths: 8,
 *   valid: true, reason: null,
 *   baselineMatched: 2197.8, currentMatched: 1270.16,
 *   absolute: -927.64, percent: -42.2, direction: 'down'
 * }
 */

export const MATCHED_YOY_BASIS = 'matched-months';

/** @param {{month:number,value:number}[]|undefined} months */
function monthMap(months) {
  const map = new Map();
  for (const m of months ?? []) {
    if (m && typeof m.month === 'number' && typeof m.value === 'number' && Number.isFinite(m.value)) {
      map.set(m.month, m.value);
    }
  }
  return map;
}

function round1(value) {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Compute matched-month YoY between two generated year records.
 * @param {{months?:{month:number,value:number}[], aggregation?:'sum'|'average'}|undefined} baselineYearData
 * @param {{months?:{month:number,value:number}[], aggregation?:'sum'|'average'}|undefined} currentYearData
 * @param {{baselineYear?:number, currentYear?:number}} [meta]
 */
export function computeMatchedYoy(baselineYearData, currentYearData, meta = {}) {
  const baselineYear = meta.baselineYear ?? null;
  const currentYear = meta.currentYear ?? null;
  const baselineMonths = monthMap(baselineYearData?.months);
  const currentMonths = monthMap(currentYearData?.months);

  const months = [];
  let bSum = 0;
  let cSum = 0;
  for (let m = 1; m <= 12; m += 1) {
    if (baselineMonths.has(m) && currentMonths.has(m)) {
      months.push(m);
      bSum += baselineMonths.get(m);
      cSum += currentMonths.get(m);
    }
  }

  const aggregation = currentYearData?.aggregation ?? baselineYearData?.aggregation;
  const count = months.length;

  let reason = null;
  if (!baselineYearData || (baselineYearData.months ?? []).length === 0) reason = 'baseline-missing';
  else if (!currentYearData || (currentYearData.months ?? []).length === 0) reason = 'current-missing';
  else if (count === 0) reason = 'no-overlapping-months';

  const divisor = aggregation === 'average' ? count : 1;
  const baselineMatched = count > 0 ? round2(bSum / divisor) : null;
  const currentMatched = count > 0 ? round2(cSum / divisor) : null;

  let absolute = null;
  let percent = null;
  let direction = null;

  if (baselineMatched !== null && currentMatched !== null) {
    absolute = round2(currentMatched - baselineMatched);
    if (baselineMatched === 0) {
      reason = reason ?? 'baseline-zero';
    } else {
      percent = round1((absolute / baselineMatched) * 100);
    }
  }

  const valid = percent !== null;

  return {
    basis: MATCHED_YOY_BASIS,
    baselineYear,
    currentYear,
    months,
    count,
    baselineMonths: baselineMonths.size,
    currentMonths: currentMonths.size,
    valid,
    reason: valid ? null : (reason ?? 'not-comparable'),
    baselineMatched,
    currentMatched,
    absolute: valid ? absolute : (reason === 'baseline-zero' ? absolute : null),
    percent,
    direction: percent === null ? null : percent > 0 ? 'up' : percent < 0 ? 'down' : 'stable',
  };
}

/**
 * Placeholder record when a metric has no current-year data yet.
 * All numeric fields are null (never 0) so the UI renders "—".
 * @param {{baselineYear?:number, currentYear?:number, reason?:string, baselineCount?:number}} [meta]
 */
export function emptyMatchedYoy(meta = {}) {
  return {
    basis: MATCHED_YOY_BASIS,
    baselineYear: meta.baselineYear ?? null,
    currentYear: meta.currentYear ?? null,
    months: [],
    count: 0,
    baselineMonths: meta.baselineCount ?? 0,
    currentMonths: 0,
    valid: false,
    reason: meta.reason ?? 'current-missing',
    baselineMatched: null,
    currentMatched: null,
    absolute: null,
    percent: null,
    direction: null,
  };
}

/** True when `yoy` follows the matched-month contract (and is safe to render as a trend). */
export function isMatchedYoy(yoy) {
  return Boolean(
    yoy &&
      yoy.basis === MATCHED_YOY_BASIS &&
      Array.isArray(yoy.months) &&
      (yoy.percent === null || typeof yoy.percent === 'number') &&
      (yoy.absolute === null || typeof yoy.absolute === 'number') &&
      (yoy.direction === null || ['up', 'down', 'stable'].includes(yoy.direction)),
  );
}

/**
 * Recompute matched-month YoY for an already-parsed metric record.
 * @param {any} metric
 */
export function recomputeMatchedYoyForMetric(metric) {
  const baselineYear = metric?.baselineYear ?? 2568;
  const currentYear = metric?.currentYear ?? 2569;
  return computeMatchedYoy(
    metric?.years?.[String(baselineYear)],
    metric?.years?.[String(currentYear)],
    { baselineYear, currentYear },
  );
}
