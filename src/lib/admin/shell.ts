import { onAuthStateChange, signOut } from '../supabase/auth';
import type { UserProfile } from '../repositories/profile-repository';
import type { UserRole } from '../supabase/types';

function loginPath(): string {
  const base = import.meta.env.BASE_URL ?? '/';
  return `${base}admin/login/`.replace(/\/{2,}/g, '/');
}

/** Hide nav links the current role cannot use. */
export function applyRoleNav(profile: UserProfile): void {
  const entriesLink = document.querySelector('[data-nav-entries]') as HTMLElement | null;
  const reviewLink = document.querySelector('[data-nav-review]') as HTMLElement | null;

  const canEntries = (['staff', 'admin'] as UserRole[]).includes(profile.role);
  const canReview = (['reviewer', 'admin'] as UserRole[]).includes(profile.role);

  if (entriesLink) {
    entriesLink.hidden = !canEntries;
  }
  if (reviewLink) {
    reviewLink.hidden = !canReview;
  }
}

/** Redirect to login when session ends (logout, expiry, invalid token). */
export function bindSessionWatcher(): () => void {
  const { unsubscribe } = onAuthStateChange((event, session) => {
    if (window.location.pathname.includes('/admin/login')) {
      return;
    }
    if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
      window.location.href = loginPath();
    }
  });

  return unsubscribe;
}

/** Force sign-out and redirect (used after permission failures). */
export async function forceAdminSignOut(): Promise<void> {
  await signOut();
  window.location.href = loginPath();
}
