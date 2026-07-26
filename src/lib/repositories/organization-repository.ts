import { getSupabaseClient } from '../supabase/client';
import type { MetricCode } from '../supabase/types';

export interface OrganizationRepository {
  getOwnerDepartmentMap(): Promise<Partial<Record<MetricCode, string>>>;
  getReviewerMap(): Promise<Partial<Record<MetricCode, string | null>>>;
}

export function createOrganizationRepository(): OrganizationRepository {
  return {
    async getOwnerDepartmentMap() {
      const client = getSupabaseClient();
      if (!client) {
        return {};
      }

      const { data, error } = await client
        .from('organization_settings')
        .select('value')
        .eq('setting_key', 'metrics')
        .maybeSingle();

      if (error) {
        throw error;
      }

      const map = (data?.value as { owner_department_map?: Record<string, string> } | null)
        ?.owner_department_map;

      return (map ?? {}) as Partial<Record<MetricCode, string>>;
    },

    async getReviewerMap() {
      const client = getSupabaseClient();
      if (!client) {
        return {};
      }

      const { data, error } = await client
        .from('organization_settings')
        .select('value')
        .eq('setting_key', 'workflow')
        .maybeSingle();

      if (error) {
        throw error;
      }

      const map = (data?.value as { metric_reviewer_map?: Record<string, string | null> } | null)
        ?.metric_reviewer_map;

      return (map ?? {}) as Partial<Record<MetricCode, string | null>>;
    },
  };
}
