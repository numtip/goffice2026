/**
 * visit-dashboard-vm.ts — Executive Visit Dashboard orchestration VM.
 *
 * Single read-only import surface for /dashboard/visit/ pages.
 * Reuses canonical generated metrics, progress registry, evidence index,
 * resource-indicator map, and activities — never duplicates datasets.
 *
 * YoY insights use computePartialYoy (same-period overlap) only.
 * Month coverage is derived per resource from generated JSON — never hardcoded.
 */

import { dashboards, dashTitle } from '../data/dashboard-config';
import { generatedMetricMap } from './dashboard-generated-metrics';
import { buildPhaseAVM } from './dashboard-phase-a-vm';
import { buildProgressOverview } from './category-progress-vm';
import { computePartialYoy } from './dashboard-partial-yoy';
import {
  getEvidenceForDashboard,
  getEvidenceForIndicator,
  getEvidenceHubHrefForIndicator,
  getIndicatorCodesForDashboard,
} from './evidence-traceability';
import { getLocalizedPath } from '../i18n/utils';
import { activitiesCollection } from '../data/content/load-content';
import { getPublishedItems, type ContentRecord } from './content-presentation';

export type VisitLocale = 'th' | 'en';

export interface VisitInsightItem {
  label: string;
  yoyPct: number;
  monthsCount: number;
  color: string;
}

export interface VisitIncompleteItem {
  label: string;
  monthsCount: number;
  color: string;
}

export interface VisitExecutiveInsightsVM {
  improved: VisitInsightItem[];
  attention: VisitInsightItem[];
  incomplete: VisitIncompleteItem[];
  highestRisk: VisitInsightItem[];
  criteriaNeedsAttention: { label: string; count: number; detail: string }[];
}

export interface VisitExplorerResource {
  id: string;
  label: string;
  color: string;
  months: (number | null)[];
  unit: string;
  monthsCount: number;
}

export interface VisitEvidenceLink {
  indicatorCode: string;
  count: number;
  href: string;
}

export interface VisitTraceabilityRow {
  dashboardId: string;
  resourceLabel: string;
  color: string;
  indicatorCodes: string[];
  dashboardHref: string;
  primaryIndicatorHref: string | null;
  /** Per-indicator scoped links — count matches ?indicator= filter semantics. */
  evidenceLinks: VisitEvidenceLink[];
  /**
   * single: one indicator — use evidenceLinks[0] (scoped).
   * multi: several indicators — per-indicator links; aggregate links to hub unfiltered.
   * none: no indicator mapping — hub root only.
   */
  evidenceMode: 'single' | 'multi' | 'none';
  /** Union count across mapped indicators (multi mode aggregate link only). */
  aggregateEvidenceCount: number;
  aggregateEvidenceHref: string;
}

export interface VisitDashboardVM {
  locale: VisitLocale;
  phaseA: ReturnType<typeof buildPhaseAVM>;
  progress: ReturnType<typeof buildProgressOverview>;
  insights: VisitExecutiveInsightsVM;
  explorerResources: VisitExplorerResource[];
  traceability: VisitTraceabilityRow[];
  selectedActivities: ContentRecord[];
  links: {
    fullDashboard: string;
    actionPlan: string;
    evidence: string;
    categories: string;
    activities: string;
    visitPath: string;
  };
}

const RESOURCE_NAMES: Record<string, { th: string; en: string }> = {
  energy: { th: 'ไฟฟ้า', en: 'Energy' },
  water: { th: 'น้ำ', en: 'Water' },
  fuel: { th: 'เชื้อเพลิง', en: 'Fuel' },
  paper: { th: 'กระดาษ', en: 'Paper' },
  waste: { th: 'ของเสีย', en: 'Waste' },
  ghg: { th: 'ก๊าซเรือนกระจก', en: 'GHG' },
};

function resourceLabel(id: string, locale: VisitLocale): string {
  const names = RESOURCE_NAMES[id];
  if (names) return locale === 'th' ? names.th : names.en;
  const dash = dashboards.find((d) => d.id === id);
  return dash ? dashTitle(dash, locale) : id;
}

function buildExplorerResources(locale: VisitLocale): VisitExplorerResource[] {
  const resources: VisitExplorerResource[] = [];
  for (const d of dashboards) {
    const m = generatedMetricMap[d.id];
    if (!m) continue;
    const cy = m.years[m.currentYear.toString()];
    if (!cy) continue;
    const monthMap = new Map((cy.months ?? []).map((mo) => [mo.month, mo.value]));
    const months: (number | null)[] = Array.from({ length: 12 }, (_, i) =>
      monthMap.has(i + 1) ? (monthMap.get(i + 1) ?? null) : null,
    );
    const monthsCount = cy.months?.length ?? 0;
    resources.push({
      id: d.id,
      label: resourceLabel(d.id, locale),
      color: d.color,
      months,
      unit: m.unit,
      monthsCount,
    });
  }
  return resources;
}

function buildInsights(locale: VisitLocale): VisitExecutiveInsightsVM {
  const improved: VisitInsightItem[] = [];
  const attention: VisitInsightItem[] = [];
  const incomplete: VisitIncompleteItem[] = [];

  for (const d of dashboards) {
    const m = generatedMetricMap[d.id];
    if (!m) continue;
    const current = m.years[m.currentYear.toString()];
    const monthsCount = current?.months.length ?? 0;
    const label = resourceLabel(d.id, locale);

    const overlap = computePartialYoy(m, { id: d.id });
    const yoyPct = overlap.percent;
    const yoyDir = overlap.direction;

    if (yoyPct !== null && monthsCount > 0 && yoyDir && yoyDir !== 'stable') {
      const isImprovement = yoyDir === 'down';
      const item = { label, yoyPct, monthsCount, color: d.color };
      if (isImprovement) improved.push(item);
      else attention.push(item);
    }

    if (monthsCount < 12) {
      incomplete.push({ label, monthsCount, color: d.color });
    }
  }

  const riskCandidates = attention.filter((item) => item.monthsCount >= 3);
  const highestRisk =
    riskCandidates.length > 0
      ? [riskCandidates.reduce((prev, curr) => (curr.yoyPct > prev.yoyPct ? curr : prev))]
      : [];

  const progress = buildProgressOverview(locale);

  return {
    improved,
    attention,
    incomplete,
    highestRisk,
    criteriaNeedsAttention: progress.needsAttention,
  };
}

function buildTraceability(locale: VisitLocale): VisitTraceabilityRow[] {
  const evidenceHub = getLocalizedPath(locale, '/evidence');

  return dashboards.map((d) => {
    const indicatorCodes = getIndicatorCodesForDashboard(d.id);
    const primaryCode = indicatorCodes[0] ?? null;
    const evidenceLinks: VisitEvidenceLink[] = indicatorCodes.map((code) => ({
      indicatorCode: code,
      count: getEvidenceForIndicator(code).length,
      href: getEvidenceHubHrefForIndicator(code, locale),
    }));
    const aggregateEvidenceCount = getEvidenceForDashboard(d.id).length;
    const evidenceMode: VisitTraceabilityRow['evidenceMode'] =
      indicatorCodes.length === 0
        ? 'none'
        : indicatorCodes.length === 1
          ? 'single'
          : 'multi';

    return {
      dashboardId: d.id,
      resourceLabel: resourceLabel(d.id, locale),
      color: d.color,
      indicatorCodes,
      dashboardHref: getLocalizedPath(locale, `/dashboard/${d.id}`),
      primaryIndicatorHref: primaryCode
        ? getLocalizedPath(locale, `/indicators/${primaryCode}`)
        : null,
      evidenceLinks,
      evidenceMode,
      aggregateEvidenceCount,
      aggregateEvidenceHref: evidenceHub,
    };
  });
}

/** Prefer FY2569 activities with indicator links; fall back to latest published. */
export function selectVisitActivities(limit = 6): ContentRecord[] {
  const published = getPublishedItems(activitiesCollection);
  const fy2569 = published.filter((a) => a.fiscalYear === 2569);
  const withIndicators = fy2569.filter(
    (a) => Array.isArray(a.relatedIndicators) && a.relatedIndicators.length > 0,
  );
  const pool =
    withIndicators.length >= limit
      ? withIndicators
      : fy2569.length >= limit
        ? fy2569
        : published;
  return pool.slice(0, limit);
}

export function buildVisitDashboardVM(locale: VisitLocale): VisitDashboardVM {
  const phaseA = buildPhaseAVM(locale);
  const progress = buildProgressOverview(locale);
  const visitPath = getLocalizedPath(locale, '/dashboard/visit');

  return {
    locale,
    phaseA,
    progress,
    insights: buildInsights(locale),
    explorerResources: buildExplorerResources(locale),
    traceability: buildTraceability(locale),
    selectedActivities: selectVisitActivities(6),
    links: {
      fullDashboard: getLocalizedPath(locale, '/dashboard'),
      actionPlan: getLocalizedPath(locale, '/about/action-plan'),
      evidence: getLocalizedPath(locale, '/evidence'),
      categories: getLocalizedPath(locale, '/categories'),
      activities: getLocalizedPath(locale, '/activities'),
      visitPath,
    },
  };
}
