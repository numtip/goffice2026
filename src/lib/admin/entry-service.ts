import {
  createMetricsRepository,
  type CreateMetricEntryInput,
  type UpdateMetricEntryInput,
} from '../repositories/metrics-repository';
import { createDepartmentsRepository } from '../repositories/departments-repository';
import type { MetricType, MonthlyMetricEntry } from '../supabase/types';
import type { UserProfile } from '../repositories/profile-repository';

export interface AssignableMetric extends MetricType {
  ownerDepartmentCode: string;
}

export interface EntryService {
  listAssignableMetrics(profile: UserProfile): Promise<AssignableMetric[]>;
  listMyEntries(profile: UserProfile): Promise<MonthlyMetricEntry[]>;
  createDraft(
    profile: UserProfile,
    input: Omit<CreateMetricEntryInput, 'created_by' | 'department_id' | 'status'>,
  ): Promise<MonthlyMetricEntry>;
  updateDraft(
    profile: UserProfile,
    entryId: string,
    input: UpdateMetricEntryInput,
  ): Promise<MonthlyMetricEntry>;
  submitDraft(profile: UserProfile, entryId: string): Promise<MonthlyMetricEntry>;
}

function ownerDepartmentCode(metric: MetricType): string | undefined {
  return metric.config_metadata?.owner_department_code;
}

export function createEntryService(): EntryService {
  const metrics = createMetricsRepository();
  const departments = createDepartmentsRepository();

  return {
    async listAssignableMetrics(profile) {
      if (!profile.department_id) {
        return [];
      }

      const [dept, metricTypes] = await Promise.all([
        departments.getById(profile.department_id),
        metrics.listMetricTypes(),
      ]);

      if (!dept) {
        return [];
      }

      return metricTypes
        .filter((metric) => ownerDepartmentCode(metric) === dept.code)
        .map((metric) => ({
          ...metric,
          ownerDepartmentCode: ownerDepartmentCode(metric) ?? dept.code,
        }));
    },

    async listMyEntries(profile) {
      if (!profile.department_id) {
        return [];
      }

      return metrics.listEntries({ departmentId: profile.department_id });
    },

    async createDraft(profile, input) {
      if (!profile.department_id) {
        throw new Error('Staff profile has no department');
      }

      const [dept, metricTypes] = await Promise.all([
        departments.getById(profile.department_id),
        metrics.listMetricTypes(),
      ]);

      const metric = metricTypes.find((m) => m.id === input.metric_type_id) ?? null;

      if (!dept || !metric) {
        throw new Error('Invalid metric or department');
      }

      if (ownerDepartmentCode(metric) !== dept.code) {
        throw new Error('Not authorized for this metric');
      }

      const existing = await metrics.listEntries({
        metricTypeId: input.metric_type_id,
        departmentId: profile.department_id,
        year: input.year,
        month: input.month,
      });

      if (existing.length > 0) {
        throw new Error(
          'An entry for this metric, year, and month already exists.',
        );
      }

      return metrics.createEntry({
        ...input,
        department_id: profile.department_id,
        status: 'draft',
        created_by: profile.id,
      });
    },

    async updateDraft(profile, entryId, input) {
      const entry = await metrics.getEntry(entryId);
      if (!entry) {
        throw new Error('Entry not found');
      }
      if (entry.status === 'approved') {
        throw new Error('Approved entries cannot be edited');
      }
      if (entry.department_id !== profile.department_id) {
        throw new Error('Not authorized for this entry');
      }
      if (!['draft', 'needs_revision'].includes(entry.status)) {
        throw new Error('Only draft or needs_revision entries can be edited');
      }

      return metrics.updateEntry(entryId, {
        ...input,
        updated_by: profile.id,
      });
    },

    async submitDraft(profile, entryId) {
      const entry = await metrics.getEntry(entryId);
      if (!entry) {
        throw new Error('Entry not found');
      }
      if (entry.department_id !== profile.department_id) {
        throw new Error('Not authorized for this entry');
      }
      if (!['draft', 'needs_revision'].includes(entry.status)) {
        throw new Error('Only draft or needs_revision entries can be submitted');
      }

      return metrics.updateEntry(entryId, {
        status: 'submitted',
        updated_by: profile.id,
        submitted_at: new Date().toISOString(),
        submitted_by: profile.id,
      });
    },
  };
}
