/**
 * category1-ghg-presentation.ts
 * Read-only FY2568 CAT1-1.5 GHG view-model — inventory, performance, anomalies.
 * Monthly values from generated/ghg.json (dashboard canonical); annual/scopes from category1/ghg.json.
 */
import ghgContract from '../data/category1/ghg.json';
import { generatedMetricMap } from './dashboard-generated-metrics';
import { CAT1_YEAR } from './category1-presentation';

export { CAT1_YEAR };

type GhgRecord = Record<string, unknown> & { kind: string; id: string };

const PREVIOUS_YEAR = 2567;

export interface GhgInventoryView {
  totalTCO2e: number;
  scope1TCO2e: number;
  scope2TCO2e: number;
  scope3TCO2e: number;
  perCapitaKgCO2e: number;
  methodology: string;
  septicAnomalyExcluded: boolean;
}

export interface GhgMonthlyView {
  month: number;
  tCO2e: number;
  labelTh: string;
  labelEn: string;
  sourceKind: 'workbook-row-68' | 'derived-dec';
  sourceNote: string;
}

export interface GhgPerformanceView {
  targetReductionPct: number;
  actualChangePct: number;
  met: boolean;
  previousYearTotalTCO2e: number;
  currentYearTotalTCO2e: number;
  absoluteChangeTCO2e: number;
  note: string;
}

export interface GhgAnomalyView {
  code: string;
  reason: string;
  status?: string;
}

export interface GhgDashboardReconcileView {
  dashboardTotalTCO2e: number;
  inventoryTotalTCO2e: number;
  monthlySumTCO2e: number;
  deltaTCO2e: number;
}

export interface GhgProvenanceView {
  sourceWorkbook: string;
  sourceSheet: string;
  sourceRow: string;
  reconciliationRef: string;
  datasetStatus: string;
  evidenceVerification: string;
}

const MONTH_LABELS: { th: string; en: string }[] = [
  { th: 'ม.ค.', en: 'Jan' },
  { th: 'ก.พ.', en: 'Feb' },
  { th: 'มี.ค.', en: 'Mar' },
  { th: 'เม.ย.', en: 'Apr' },
  { th: 'พ.ค.', en: 'May' },
  { th: 'มิ.ย.', en: 'Jun' },
  { th: 'ก.ค.', en: 'Jul' },
  { th: 'ส.ค.', en: 'Aug' },
  { th: 'ก.ย.', en: 'Sep' },
  { th: 'ต.ค.', en: 'Oct' },
  { th: 'พ.ย.', en: 'Nov' },
  { th: 'ธ.ค.', en: 'Dec' },
];

function records(): GhgRecord[] {
  return ghgContract.records as GhgRecord[];
}

export function buildGhgInventory(): GhgInventoryView {
  const inv = records().find((r) => r.kind === 'inventory');
  if (!inv) throw new Error('ghg inventory record missing');
  return {
    totalTCO2e: inv.totalTCO2e as number,
    scope1TCO2e: inv.scope1TCO2e as number,
    scope2TCO2e: inv.scope2TCO2e as number,
    scope3TCO2e: inv.scope3TCO2e as number,
    perCapitaKgCO2e: inv.perCapitaKgCO2e as number,
    methodology: inv.methodology as string,
    septicAnomalyExcluded: inv.septicAnomalyExcluded === true,
  };
}

export function buildGhgMonthlySeries(): GhgMonthlyView[] {
  const decAnomaly = records().find((r) => r.kind === 'anomaly' && r.code === 'ANOM-DEC-O68');
  const decNote = (decAnomaly?.reason as string) || '';
  const contractMonths = records()
    .filter((r) => r.kind === 'monthly')
    .sort((a, b) => (a.month as number) - (b.month as number));

  const dashMonths = generatedMetricMap.ghg.years[String(CAT1_YEAR)]?.months ?? [];

  return contractMonths.map((cm, idx) => {
    const month = cm.month as number;
    const dash = dashMonths.find((m) => m.month === month);
    const tCO2e = dash?.value ?? (cm.tCO2e as number);
    const isDec = month === 12;
    return {
      month,
      tCO2e,
      labelTh: MONTH_LABELS[idx]?.th ?? String(month),
      labelEn: MONTH_LABELS[idx]?.en ?? String(month),
      sourceKind: isDec ? 'derived-dec' : 'workbook-row-68',
      sourceNote: isDec ? decNote : `สรุปการคำนวณ ปี ${CAT1_YEAR} row 68 col ${String.fromCharCode(68 + idx)}68`,
    };
  });
}

export function buildGhgPerformance(): GhgPerformanceView {
  const perf = records().find((r) => r.kind === 'performance');
  const inv = buildGhgInventory();
  if (!perf) throw new Error('ghg performance record missing');
  const current = inv.totalTCO2e;
  const pct = perf.actualChangePct as number;
  const previous = Math.round((current / (1 + pct / 100)) * 100) / 100;
  const absolute = Math.round((current - previous) * 100) / 100;
  return {
    targetReductionPct: perf.targetReductionPct as number,
    actualChangePct: pct,
    met: perf.met === true,
    previousYearTotalTCO2e: previous,
    currentYearTotalTCO2e: current,
    absoluteChangeTCO2e: absolute,
    note: (perf.note as string) || '',
  };
}

export function buildGhgAnomalies(): GhgAnomalyView[] {
  return records()
    .filter((r) => r.kind === 'anomaly' || r.kind === 'exclusion')
    .map((r) => ({
      code: (r.code as string) || (r.item as string) || r.id,
      reason: (r.reason as string) || '',
      status: r.status as string | undefined,
    }));
}

export function buildGhgDashboardReconcile(): GhgDashboardReconcileView {
  const inv = buildGhgInventory();
  const months = buildGhgMonthlySeries();
  const monthlySum = Math.round(months.reduce((s, m) => s + m.tCO2e, 0) * 100) / 100;
  const dashTotal = generatedMetricMap.ghg.years[String(CAT1_YEAR)]?.total ?? monthlySum;
  return {
    dashboardTotalTCO2e: dashTotal,
    inventoryTotalTCO2e: inv.totalTCO2e,
    monthlySumTCO2e: monthlySum,
    deltaTCO2e: Math.round((inv.totalTCO2e - monthlySum) * 100) / 100,
  };
}

export function buildGhgProvenance(): GhgProvenanceView {
  const yearBlock = generatedMetricMap.ghg.years[String(CAT1_YEAR)];
  const prov = (yearBlock?.provenance ?? {}) as Record<string, string | undefined>;
  return {
    sourceWorkbook: (prov.sourceWorkbook as string) || '1.5_GreenhouseGas2568.xlsx',
    sourceSheet: (prov.sourceSheet as string) || `สรุปการคำนวณ ปี ${CAT1_YEAR}`,
    sourceRow: (prov.sourceRowRange as string) || 'row 68',
    reconciliationRef: 'docs/data/GO-CAT1-1.5-FY2568-GHG-RECONCILIATION.md',
    datasetStatus: yearBlock?.dataStatus || 'VERIFIED_BASELINE',
    evidenceVerification: 'pending human sign-off (ev-ghg-inventory-2025)',
  };
}

export function ghgContractSources(): string[] {
  return [...new Set(ghgContract.sources.map((s) => s.ref))];
}

export const GHG_PREVIOUS_YEAR = PREVIOUS_YEAR;

export function formatTco2e(value: number, decimals = 2): string {
  return value.toFixed(decimals);
}
