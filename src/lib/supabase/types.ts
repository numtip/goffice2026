/** Application roles aligned with Supabase profiles.role CHECK constraint. */
export type UserRole = 'admin' | 'staff' | 'reviewer' | 'viewer';

/** Anonymous public dashboard consumers (not stored in profiles). */
export type PublicRole = 'public';

/** Workflow statuses for monthly_metric_entries.status. */
export type EntryStatus =
  | 'draft'
  | 'submitted'
  | 'needs_revision'
  | 'approved'
  | 'archived';

/** Dashboard data sourcing mode (PUBLIC_DASHBOARD_DATA_MODE). */
export type DashboardDataMode = 'static' | 'live' | 'hybrid';

/** Canonical metric codes (Decision Baseline v1). */
export type MetricCode =
  | 'energy'
  | 'water'
  | 'fuel'
  | 'paper'
  | 'waste'
  | 'recycling_rate'
  | 'ghg';

/** Reference row from metric_types. */
export interface MetricType {
  id: string;
  code: MetricCode;
  label_th: string;
  label_en: string | null;
  unit: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

/** Operational row from monthly_metric_entries. */
export interface MonthlyMetricEntry {
  id: string;
  metric_type_id: string;
  department_id: string;
  year: number;
  month: number;
  value: number;
  note: string | null;
  status: EntryStatus;
  submitted_at: string | null;
  submitted_by: string | null;
  approved_at: string | null;
  approved_by: string | null;
  created_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Public-safe row from public_dashboard_monthly_metrics view. */
export interface PublicDashboardMetric {
  metric_code: MetricCode;
  metric_label_th: string;
  metric_label_en: string | null;
  unit: string;
  department_code: string;
  department_name_th: string;
  year: number;
  month: number;
  value: number;
  approved_at: string | null;
  updated_at: string;
}

/** API contract v1 data source discriminator. */
export type DashboardDataSource = 'supabase' | 'static-json';

/**
 * API contract v1 envelope for dashboard metric payloads.
 * @see docs/backend/API_CONTRACT.md (Worker D)
 */
export interface DashboardDataEnvelope {
  contractVersion: 'v1';
  source: DashboardDataSource;
  generatedAt: string;
  dataUpdatedAt?: string;
  fallback: boolean;
  metrics: PublicDashboardMetric[];
  /** Present when live/hybrid mode cannot reach Supabase. */
  unavailable?: boolean;
  message?: string;
}

/** Runtime Supabase client availability (no secrets). */
export interface SupabaseAvailability {
  configured: boolean;
  clientReady: boolean;
  mode: DashboardDataMode;
  reason?: string;
}
