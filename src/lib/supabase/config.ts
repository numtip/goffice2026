import type { DashboardDataMode } from './types';

export interface SupabaseConfig {
  url: string | null;
  anonKey: string | null;
  dashboardDataMode: DashboardDataMode;
  /** True when both URL and anon key are non-empty. */
  isConfigured: boolean;
}

function readEnv(key: string): string | undefined {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const env = import.meta.env as Record<string, string | boolean | undefined>;
    const value = env[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  if (typeof process !== 'undefined' && process.env) {
    const value = process.env[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
}

function parseDashboardDataMode(raw: string | undefined): DashboardDataMode {
  if (raw === 'live' || raw === 'hybrid') {
    return raw;
  }
  return 'static';
}

/** Reads env at call time; safe to import during static builds without credentials. */
export function getSupabaseConfig(): SupabaseConfig {
  const url = readEnv('PUBLIC_SUPABASE_URL') ?? null;
  const anonKey = readEnv('PUBLIC_SUPABASE_ANON_KEY') ?? null;
  const dashboardDataMode = parseDashboardDataMode(readEnv('PUBLIC_DASHBOARD_DATA_MODE'));

  return {
    url,
    anonKey,
    dashboardDataMode,
    isConfigured: Boolean(url && anonKey),
  };
}
