export { getSupabaseConfig, type SupabaseConfig } from './config';
export { getSupabaseClient, getSupabaseAvailability } from './client';
export {
  signInWithPassword,
  signOut,
  getAuthSession,
  onAuthStateChange,
  type AuthSession,
} from './auth';
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
} from './types';
