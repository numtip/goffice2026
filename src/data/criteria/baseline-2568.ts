/**
 * FY2568 baseline evidence coverage — frozen data layer (GO-DATA-4).
 *
 * PO decision (2026-08-15): freeze all currently published FY2568 baseline
 * values and the published FY2569 snapshot. Category-level baseline coverage
 * is recorded per category; indicator-level mapping is NOT verified.
 *
 * FY2568 is a frozen PUBLIC baseline. Source documents are publicly
 * accessible from this site (Document Center) — no sign-in is required.
 * No local paths, filenames, URLs, or personal data are exposed here.
 *
 * Reference: docs/GREENOFFICE2026_PLATFORM_BLUEPRINT_V5.md
 *   §2 Operating Architecture (resource pipeline)
 *   §5 Data and Evidence Truthfulness Rules (frozen baseline rule)
 */

export const FY2568_BASELINE_YEAR = 2568 as const;

export type CoverageState = 'CATEGORY_LEVEL_RECORDED';

/**
 * Source-document access mode for the FY2568 baseline. Always `'public'`:
 * baseline source documents are published openly on this site.
 */
export type SourceAccess = 'public';

/**
 * Safe aggregate-only source-type totals for a category. Keys are lowercased
 * file extensions; values are counts. Never contains paths, filenames, URLs,
 * or personal data.
 */
export type SourceTypeTotals = Readonly<Record<string, number>>;

export interface BaselineCategoryCoverage {
  categoryCode: string;
  categoryId: string;
  recordedBaselineCount: number;
  coverageState: CoverageState;
  sourceAccess: SourceAccess;
  sourceTypeTotals: SourceTypeTotals;
}

export interface SourceTypeCount {
  ext: string;
  count: number;
}

export const BASELINE_2568_CATEGORY_COUNTS: readonly BaselineCategoryCoverage[] = [
  { categoryCode: 'cat1', categoryId: '1', recordedBaselineCount: 38, coverageState: 'CATEGORY_LEVEL_RECORDED', sourceAccess: 'public', sourceTypeTotals: { pdf: 28, xlsx: 3, docx: 7 } },
  { categoryCode: 'cat2', categoryId: '2', recordedBaselineCount: 29, coverageState: 'CATEGORY_LEVEL_RECORDED', sourceAccess: 'public', sourceTypeTotals: { pdf: 24, xlsx: 2, docx: 2, xls: 1 } },
  { categoryCode: 'cat3', categoryId: '3', recordedBaselineCount: 32, coverageState: 'CATEGORY_LEVEL_RECORDED', sourceAccess: 'public', sourceTypeTotals: { pdf: 26, docx: 6 } },
  { categoryCode: 'cat4', categoryId: '4', recordedBaselineCount: 28, coverageState: 'CATEGORY_LEVEL_RECORDED', sourceAccess: 'public', sourceTypeTotals: { xlsx: 1, pdf: 10, txt: 15, docx: 2 } },
  { categoryCode: 'cat5', categoryId: '5', recordedBaselineCount: 47, coverageState: 'CATEGORY_LEVEL_RECORDED', sourceAccess: 'public', sourceTypeTotals: { pdf: 46, docx: 1 } },
  { categoryCode: 'cat6', categoryId: '6', recordedBaselineCount: 32, coverageState: 'CATEGORY_LEVEL_RECORDED', sourceAccess: 'public', sourceTypeTotals: { pdf: 31, docx: 1 } },
  { categoryCode: 'cat7', categoryId: '7', recordedBaselineCount: 3, coverageState: 'CATEGORY_LEVEL_RECORDED', sourceAccess: 'public', sourceTypeTotals: { pdf: 3 } },
] as const;

export const BASELINE_2568_TOTAL = BASELINE_2568_CATEGORY_COUNTS.reduce(
  (sum, entry) => sum + entry.recordedBaselineCount,
  0,
);

export function getBaselineCategoryCoverage(
  categoryCode: string,
): BaselineCategoryCoverage | undefined {
  return BASELINE_2568_CATEGORY_COUNTS.find((entry) => entry.categoryCode === categoryCode);
}

/**
 * Returns the category's source-type totals as a sorted list (highest count
 * first). Always safe: extension names only, no paths or filenames.
 */
export function getSourceTypeCounts(categoryCode: string): SourceTypeCount[] {
  const entry = getBaselineCategoryCoverage(categoryCode);
  if (!entry) return [];
  return Object.entries(entry.sourceTypeTotals)
    .map(([ext, count]) => ({ ext, count }))
    .sort((a, b) => b.count - a.count);
}
