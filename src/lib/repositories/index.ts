export {
  createMetricsRepository,
  type MetricsRepository,
  type MetricEntryFilters,
  type CreateMetricEntryInput,
  type UpdateMetricEntryInput,
} from './metrics-repository';

export {
  createDashboardRepository,
  type DashboardRepository,
  type DashboardQueryOptions,
} from './dashboard-repository';

export {
  createDepartmentsRepository,
  type DepartmentsRepository,
  type Department,
} from './departments-repository';

export {
  createReviewRepository,
  type ReviewRepository,
  type ReviewComment,
  type ReviewQueueFilters,
} from './review-repository';

export {
  createAuditRepository,
  type AuditRepository,
  type AuditLogEntry,
  type AuditLogFilters,
} from './audit-repository';

export type {
  UserRole,
  PublicRole,
  EntryStatus,
  MetricType,
  MonthlyMetricEntry,
  PublicDashboardMetric,
  DashboardDataEnvelope,
  DashboardDataMode,
  DashboardDataSource,
  SupabaseAvailability,
} from '../supabase/types';

export {
  getSupabaseConfig,
  getSupabaseClient,
  getSupabaseAvailability,
  type SupabaseConfig,
} from '../supabase';
