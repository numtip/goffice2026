import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseConfig } from './config';
import type { SupabaseAvailability } from './types';

let cachedClient: SupabaseClient | null = null;
let initAttempted = false;

let availabilityState: SupabaseAvailability = {
  configured: false,
  clientReady: false,
  mode: 'static',
};

function buildUnavailableReason(configured: boolean): string | undefined {
  if (configured) {
    return undefined;
  }
  return 'Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY';
}

/** Current availability snapshot (no secrets). */
export function getSupabaseAvailability(): SupabaseAvailability {
  const config = getSupabaseConfig();
  availabilityState = {
    ...availabilityState,
    configured: config.isConfigured,
    mode: config.dashboardDataMode,
    reason: availabilityState.clientReady
      ? undefined
      : buildUnavailableReason(config.isConfigured),
  };
  return availabilityState;
}

/**
 * Lazy, browser-safe Supabase client (anon key only).
 * Returns null when configuration is missing or initialization fails.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (initAttempted) {
    return cachedClient;
  }

  initAttempted = true;
  const config = getSupabaseConfig();

  availabilityState = {
    configured: config.isConfigured,
    clientReady: false,
    mode: config.dashboardDataMode,
    reason: buildUnavailableReason(config.isConfigured),
  };

  if (!config.isConfigured || !config.url || !config.anonKey) {
    return null;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: typeof window !== 'undefined',
        autoRefreshToken: typeof window !== 'undefined',
      },
    });
    availabilityState = {
      configured: true,
      clientReady: true,
      mode: config.dashboardDataMode,
    };
    return cachedClient;
  } catch {
    cachedClient = null;
    availabilityState = {
      configured: true,
      clientReady: false,
      mode: config.dashboardDataMode,
      reason: 'Supabase client initialization failed',
    };
    return null;
  }
}
