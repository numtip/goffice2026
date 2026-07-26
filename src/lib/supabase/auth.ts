import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

import { getSupabaseClient } from './client';

export interface AuthSession {
  user: User;
  session: Session;
}

/** Sign in with email/password (browser only, anon key + RLS). */
export async function signInWithPassword(
  email: string,
  password: string,
): Promise<AuthSession> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }
  if (!data.session || !data.user) {
    throw new Error('Sign-in succeeded but no session was returned');
  }

  return { user: data.user, session: data.session };
}

/** Sign out the current session. */
export async function signOut(): Promise<void> {
  const client = getSupabaseClient();
  if (!client) {
    return;
  }

  const { error } = await client.auth.signOut();
  if (error) {
    throw error;
  }
}

/** Current session or null when unauthenticated. */
export async function getAuthSession(): Promise<AuthSession | null> {
  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  const { data, error } = await client.auth.getSession();
  if (error) {
    throw error;
  }

  if (!data.session?.user) {
    return null;
  }

  return { user: data.session.user, session: data.session };
}

/** Subscribe to auth state changes (browser only). */
export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
): { unsubscribe: () => void } {
  const client = getSupabaseClient();
  if (!client) {
    return { unsubscribe: () => undefined };
  }

  const { data } = client.auth.onAuthStateChange(callback);
  return { unsubscribe: () => data.subscription.unsubscribe() };
}
