import energyData from '../../data/generated/energy.json';
import fuelData from '../../data/generated/fuel.json';
import ghgData from '../../data/generated/ghg.json';
import paperData from '../../data/generated/paper.json';
import recyclingRateData from '../../data/generated/recycling_rate.json';
import wasteData from '../../data/generated/waste.json';
import waterData from '../../data/generated/water.json';

import { getSupabaseClient, getSupabaseAvailability } from '../supabase/client';
import { getSupabaseConfig } from '../supabase/config';
import type {
  DashboardDataEnvelope,
  MetricCode,
  PublicDashboardMetric,
  SupabaseAvailability,
} from '../supabase/types';

export interface DashboardQueryOptions {
  metricCode?: string;
  year?: number;
}

export interface DashboardRepository {
  getAvailability(): SupabaseAvailability;
  loadStaticMetrics(options?: DashboardQueryOptions): DashboardDataEnvelope;
  fetchLiveMetrics(options?: DashboardQueryOptions): Promise<DashboardDataEnvelope>;
  getMonthlyMetrics(options?: DashboardQueryOptions): Promise<DashboardDataEnvelope>;
}

interface StaticYearSlice {
  year: number;
  months: Array<{ month: number; value: number }>;
  updated?: string;
}

interface StaticMetricSnapshot {
  metric: MetricCode;
  label: string;
  labelTh?: string;
  unit: string;
  years: Record<string, StaticYearSlice>;
}

const STATIC_OFFICE_DEPARTMENT = {
  code: 'OFFICE',
  name_th: 'สำนักงานกลาง',
} as const;

const STATIC_METRIC_SNAPSHOTS: StaticMetricSnapshot[] = [
  energyData as StaticMetricSnapshot,
  waterData as StaticMetricSnapshot,
  fuelData as StaticMetricSnapshot,
  paperData as StaticMetricSnapshot,
  wasteData as StaticMetricSnapshot,
  recyclingRateData as StaticMetricSnapshot,
  ghgData as StaticMetricSnapshot,
];

const PUBLIC_DASHBOARD_VIEW = 'public_dashboard_monthly_metrics';

function isoNow(): string {
  return new Date().toISOString();
}

function flattenStaticSnapshot(
  snapshot: StaticMetricSnapshot,
  options: DashboardQueryOptions = {},
): PublicDashboardMetric[] {
  if (options.metricCode && snapshot.metric !== options.metricCode) {
    return [];
  }

  const rows: PublicDashboardMetric[] = [];

  for (const yearKey of Object.keys(snapshot.years)) {
    const yearData = snapshot.years[yearKey];
    if (!yearData) {
      continue;
    }
    if (options.year !== undefined && yearData.year !== options.year) {
      continue;
    }

    const updatedAt = yearData.updated ? `${yearData.updated}T00:00:00.000Z` : isoNow();

    for (const monthRow of yearData.months) {
      rows.push({
        metric_code: snapshot.metric,
        metric_label_th: snapshot.labelTh ?? snapshot.label,
        metric_label_en: snapshot.label,
        unit: snapshot.unit,
        department_code: STATIC_OFFICE_DEPARTMENT.code,
        department_name_th: STATIC_OFFICE_DEPARTMENT.name_th,
        year: yearData.year,
        month: monthRow.month,
        value: monthRow.value,
        approved_at: null,
        updated_at: updatedAt,
      });
    }
  }

  return rows;
}

function buildStaticEnvelope(
  metrics: PublicDashboardMetric[],
  dataUpdatedAt?: string,
): DashboardDataEnvelope {
  return {
    contractVersion: 'v1',
    source: 'static-json',
    generatedAt: isoNow(),
    dataUpdatedAt,
    fallback: true,
    metrics,
  };
}

function latestStaticUpdatedAt(metrics: PublicDashboardMetric[]): string | undefined {
  if (metrics.length === 0) {
    return undefined;
  }

  return metrics.reduce((latest, row) => {
    return row.updated_at > latest ? row.updated_at : latest;
  }, metrics[0].updated_at);
}

function mapPublicMetric(row: Record<string, unknown>): PublicDashboardMetric {
  return row as unknown as PublicDashboardMetric;
}

export function createDashboardRepository(): DashboardRepository {
  return {
    getAvailability() {
      return getSupabaseAvailability();
    },

    loadStaticMetrics(options = {}) {
      const metrics = STATIC_METRIC_SNAPSHOTS.flatMap((snapshot) =>
        flattenStaticSnapshot(snapshot, options),
      );
      return buildStaticEnvelope(metrics, latestStaticUpdatedAt(metrics));
    },

    async fetchLiveMetrics(options = {}) {
      const client = getSupabaseClient();
      if (!client) {
        return {
          contractVersion: 'v1',
          source: 'supabase',
          generatedAt: isoNow(),
          fallback: false,
          metrics: [],
          unavailable: true,
          message: 'Supabase client is not available',
        };
      }

      let query = client.from(PUBLIC_DASHBOARD_VIEW).select('*');

      if (options.metricCode) {
        query = query.eq('metric_code', options.metricCode);
      }
      if (options.year !== undefined) {
        query = query.eq('year', options.year);
      }

      const { data, error } = await query
        .order('metric_code')
        .order('year', { ascending: false })
        .order('month');

      if (error) {
        return {
          contractVersion: 'v1',
          source: 'supabase',
          generatedAt: isoNow(),
          fallback: false,
          metrics: [],
          unavailable: true,
          message: error.message,
        };
      }

      const metrics = (data ?? []).map(mapPublicMetric);
      const dataUpdatedAt = latestStaticUpdatedAt(metrics);

      return {
        contractVersion: 'v1',
        source: 'supabase',
        generatedAt: isoNow(),
        dataUpdatedAt,
        fallback: false,
        metrics,
      };
    },

    async getMonthlyMetrics(options = {}) {
      const { dashboardDataMode } = getSupabaseConfig();
      const staticEnvelope = this.loadStaticMetrics(options);

      if (dashboardDataMode === 'static') {
        return staticEnvelope;
      }

      const liveEnvelope = await this.fetchLiveMetrics(options);

      if (dashboardDataMode === 'live') {
        if (liveEnvelope.unavailable || liveEnvelope.metrics.length === 0) {
          return {
            ...staticEnvelope,
            message: liveEnvelope.message ?? 'Live dashboard data unavailable; using static fallback',
          };
        }
        return liveEnvelope;
      }

      // hybrid: prefer live approved rows, retain static baseline via caller merge later
      if (liveEnvelope.unavailable || liveEnvelope.metrics.length === 0) {
        return staticEnvelope;
      }

      return liveEnvelope;
    },
  };
}
