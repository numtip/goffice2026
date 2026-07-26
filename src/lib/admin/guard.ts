import { getAuthSession } from '../supabase/auth';
import { getSupabaseAvailability } from '../supabase/client';
import { createProfileRepository } from '../repositories/profile-repository';
import type { UserProfile } from '../repositories/profile-repository';
import type { UserRole } from '../supabase/types';

export interface AdminGuardResult {
  ok: boolean;
  redirectTo?: string;
  profile?: UserProfile;
  reason?: string;
}

function loginPath(): string {
  const base = import.meta.env.BASE_URL ?? '/';
  return `${base}admin/login/`.replace(/\/{2,}/g, '/');
}

function adminPath(): string {
  const base = import.meta.env.BASE_URL ?? '/';
  return `${base}admin/`.replace(/\/{2,}/g, '/');
}

/** Client-side guard: redirects to login when unauthenticated or inactive. */
export async function requireAdminSession(): Promise<AdminGuardResult> {
  const availability = getSupabaseAvailability();
  if (!availability.configured || !availability.clientReady) {
    return { ok: false, reason: 'not_configured' };
  }

  const session = await getAuthSession();
  if (!session) {
    return { ok: false, redirectTo: loginPath() };
  }

  const profileRepo = createProfileRepository();
  const profile = await profileRepo.getCurrentProfile();
  if (!profile || !profile.is_active) {
    return { ok: false, redirectTo: loginPath(), reason: 'inactive_or_missing_profile' };
  }

  return { ok: true, profile };
}

/** Role gate for admin sub-routes. */
export function requireRole(profile: UserProfile, allowed: UserRole[]): boolean {
  return allowed.includes(profile.role);
}

export function redirectIfNeeded(result: AdminGuardResult): void {
  if (!result.ok && result.redirectTo) {
    window.location.href = result.redirectTo;
  }
}

export function redirectFromLoginIfAuthenticated(): void {
  void getAuthSession().then((session) => {
    if (session) {
      window.location.href = adminPath();
    }
  });
}
