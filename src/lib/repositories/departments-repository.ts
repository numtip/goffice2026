import { getSupabaseClient } from '../supabase/client';

export interface Department {
  id: string;
  code: string;
  name_th: string;
  name_en: string | null;
  parent_id: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DepartmentsRepository {
  listActive(): Promise<Department[]>;
  getByCode(code: string): Promise<Department | null>;
  getById(id: string): Promise<Department | null>;
}

function mapDepartment(row: Record<string, unknown>): Department {
  return row as unknown as Department;
}

export function createDepartmentsRepository(): DepartmentsRepository {
  return {
    async listActive() {
      const client = getSupabaseClient();
      if (!client) {
        return [];
      }

      const { data, error } = await client
        .from('departments')
        .select('*')
        .eq('is_active', true)
        .order('code');

      if (error) {
        throw error;
      }

      return (data ?? []).map(mapDepartment);
    },

    async getByCode(code) {
      const client = getSupabaseClient();
      if (!client) {
        return null;
      }

      const { data, error } = await client
        .from('departments')
        .select('*')
        .eq('code', code)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? mapDepartment(data) : null;
    },

    async getById(id) {
      const client = getSupabaseClient();
      if (!client) {
        return null;
      }

      const { data, error } = await client
        .from('departments')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? mapDepartment(data) : null;
    },
  };
}
