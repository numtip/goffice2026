import { getSupabaseClient } from '../supabase/client';
import type { EntryStatus, MetricType, MonthlyMetricEntry } from '../supabase/types';

export interface MetricEntryFilters {
  metricTypeId?: string;
  departmentId?: string;
  year?: number;
  month?: number;
  status?: EntryStatus | EntryStatus[];
}

export interface CreateMetricEntryInput {
  metric_type_id: string;
  department_id: string;
  year: number;
  month: number;
  value: number;
  note?: string | null;
  status?: EntryStatus;
  created_by: string;
}

export interface UpdateMetricEntryInput {
  value?: number;
  note?: string | null;
  status?: EntryStatus;
  updated_by?: string | null;
}

export interface MetricsRepository {
  listMetricTypes(): Promise<MetricType[]>;
  getMetricTypeByCode(code: string): Promise<MetricType | null>;
  listEntries(filters?: MetricEntryFilters): Promise<MonthlyMetricEntry[]>;
  getEntry(id: string): Promise<MonthlyMetricEntry | null>;
  createEntry(input: CreateMetricEntryInput): Promise<MonthlyMetricEntry>;
  updateEntry(id: string, input: UpdateMetricEntryInput): Promise<MonthlyMetricEntry>;
}

function mapEntry(row: Record<string, unknown>): MonthlyMetricEntry {
  return row as unknown as MonthlyMetricEntry;
}

function mapMetricType(row: Record<string, unknown>): MetricType {
  return row as unknown as MetricType;
}

export function createMetricsRepository(): MetricsRepository {
  return {
    async listMetricTypes() {
      const client = getSupabaseClient();
      if (!client) {
        return [];
      }

      const { data, error } = await client
        .from('metric_types')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) {
        throw error;
      }

      return (data ?? []).map(mapMetricType);
    },

    async getMetricTypeByCode(code) {
      const client = getSupabaseClient();
      if (!client) {
        return null;
      }

      const { data, error } = await client
        .from('metric_types')
        .select('*')
        .eq('code', code)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? mapMetricType(data) : null;
    },

    async listEntries(filters = {}) {
      const client = getSupabaseClient();
      if (!client) {
        return [];
      }

      let query = client.from('monthly_metric_entries').select('*');

      if (filters.metricTypeId) {
        query = query.eq('metric_type_id', filters.metricTypeId);
      }
      if (filters.departmentId) {
        query = query.eq('department_id', filters.departmentId);
      }
      if (filters.year !== undefined) {
        query = query.eq('year', filters.year);
      }
      if (filters.month !== undefined) {
        query = query.eq('month', filters.month);
      }
      if (filters.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        query = query.in('status', statuses);
      }

      const { data, error } = await query.order('year', { ascending: false }).order('month');

      if (error) {
        throw error;
      }

      return (data ?? []).map(mapEntry);
    },

    async getEntry(id) {
      const client = getSupabaseClient();
      if (!client) {
        return null;
      }

      const { data, error } = await client
        .from('monthly_metric_entries')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? mapEntry(data) : null;
    },

    async createEntry(input) {
      const client = getSupabaseClient();
      if (!client) {
        throw new Error('Supabase client is not available');
      }

      const { data, error } = await client
        .from('monthly_metric_entries')
        .insert({
          metric_type_id: input.metric_type_id,
          department_id: input.department_id,
          year: input.year,
          month: input.month,
          value: input.value,
          note: input.note ?? null,
          status: input.status ?? 'draft',
          created_by: input.created_by,
        })
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return mapEntry(data);
    },

    async updateEntry(id, input) {
      const client = getSupabaseClient();
      if (!client) {
        throw new Error('Supabase client is not available');
      }

      const { data, error } = await client
        .from('monthly_metric_entries')
        .update({
          ...(input.value !== undefined ? { value: input.value } : {}),
          ...(input.note !== undefined ? { note: input.note } : {}),
          ...(input.status !== undefined ? { status: input.status } : {}),
          ...(input.updated_by !== undefined ? { updated_by: input.updated_by } : {}),
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return mapEntry(data);
    },
  };
}
