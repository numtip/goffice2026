import { getSupabaseClient } from '../supabase/client';
import type { EntryStatus, MonthlyMetricEntry } from '../supabase/types';

export interface ReviewComment {
  id: string;
  entry_id: string;
  comment: string;
  created_by: string;
  created_at: string;
}

export interface ReviewQueueFilters {
  departmentId?: string;
  metricTypeId?: string;
  year?: number;
  month?: number;
}

export interface ReviewRepository {
  listSubmittedEntries(filters?: ReviewQueueFilters): Promise<MonthlyMetricEntry[]>;
  listComments(entryId: string): Promise<ReviewComment[]>;
  addComment(entryId: string, comment: string, createdBy: string): Promise<ReviewComment>;
  transitionEntryStatus(
    entryId: string,
    status: EntryStatus,
    actorId: string,
  ): Promise<MonthlyMetricEntry>;
}

function mapEntry(row: Record<string, unknown>): MonthlyMetricEntry {
  return row as unknown as MonthlyMetricEntry;
}

function mapComment(row: Record<string, unknown>): ReviewComment {
  return row as unknown as ReviewComment;
}

export function createReviewRepository(): ReviewRepository {
  return {
    async listSubmittedEntries(filters = {}) {
      const client = getSupabaseClient();
      if (!client) {
        return [];
      }

      let query = client
        .from('monthly_metric_entries')
        .select('*')
        .eq('status', 'submitted');

      if (filters.departmentId) {
        query = query.eq('department_id', filters.departmentId);
      }
      if (filters.metricTypeId) {
        query = query.eq('metric_type_id', filters.metricTypeId);
      }
      if (filters.year !== undefined) {
        query = query.eq('year', filters.year);
      }
      if (filters.month !== undefined) {
        query = query.eq('month', filters.month);
      }

      const { data, error } = await query.order('submitted_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []).map(mapEntry);
    },

    async listComments(entryId) {
      const client = getSupabaseClient();
      if (!client) {
        return [];
      }

      const { data, error } = await client
        .from('review_comments')
        .select('*')
        .eq('entry_id', entryId)
        .order('created_at');

      if (error) {
        throw error;
      }

      return (data ?? []).map(mapComment);
    },

    async addComment(entryId, comment, createdBy) {
      const client = getSupabaseClient();
      if (!client) {
        throw new Error('Supabase client is not available');
      }

      const { data, error } = await client
        .from('review_comments')
        .insert({
          entry_id: entryId,
          comment,
          created_by: createdBy,
        })
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return mapComment(data);
    },

    async transitionEntryStatus(entryId, status, actorId) {
      const client = getSupabaseClient();
      if (!client) {
        throw new Error('Supabase client is not available');
      }

      const patch: Record<string, unknown> = {
        status,
        updated_by: actorId,
      };

      if (status === 'submitted') {
        patch.submitted_at = new Date().toISOString();
        patch.submitted_by = actorId;
      }

      if (status === 'approved') {
        patch.approved_at = new Date().toISOString();
        patch.approved_by = actorId;
      }

      const { data, error } = await client
        .from('monthly_metric_entries')
        .update(patch)
        .eq('id', entryId)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return mapEntry(data);
    },
  };
}
