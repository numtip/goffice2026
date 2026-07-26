import { getSupabaseClient } from '../supabase/client';
import type { UserRole } from '../supabase/types';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  department_id: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileRepository {
  getCurrentProfile(): Promise<UserProfile | null>;
  getProfileById(id: string): Promise<UserProfile | null>;
}

function mapProfile(row: Record<string, unknown>): UserProfile {
  return row as unknown as UserProfile;
}

export function createProfileRepository(): ProfileRepository {
  return {
    async getCurrentProfile() {
      const client = getSupabaseClient();
      if (!client) {
        return null;
      }

      const { data: authData, error: authError } = await client.auth.getUser();
      if (authError || !authData.user) {
        return null;
      }

      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? mapProfile(data) : null;
    },

    async getProfileById(id) {
      const client = getSupabaseClient();
      if (!client) {
        return null;
      }

      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? mapProfile(data) : null;
    },
  };
}
