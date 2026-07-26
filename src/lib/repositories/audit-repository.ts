import { getSupabaseClient } from '../supabase/client';

export interface AuditLogEntry {
  id: string;
  actor_id: string | null;
  entity_type: string;
  entity_id: string;
  action: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  request_id: string | null;
  source: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface AuditLogFilters {
  entityType?: string;
  entityId?: string;
  actorId?: string;
  limit?: number;
}

export interface AuditRepository {
  listLogs(filters?: AuditLogFilters): Promise<AuditLogEntry[]>;
  getLog(id: string): Promise<AuditLogEntry | null>;
}

function mapAuditLog(row: Record<string, unknown>): AuditLogEntry {
  return row as unknown as AuditLogEntry;
}

export function createAuditRepository(): AuditRepository {
  return {
    async listLogs(filters = {}) {
      const client = getSupabaseClient();
      if (!client) {
        return [];
      }

      let query = client.from('audit_logs').select('*');

      if (filters.entityType) {
        query = query.eq('entity_type', filters.entityType);
      }
      if (filters.entityId) {
        query = query.eq('entity_id', filters.entityId);
      }
      if (filters.actorId) {
        query = query.eq('actor_id', filters.actorId);
      }

      query = query.order('created_at', { ascending: false });

      if (filters.limit !== undefined) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data ?? []).map(mapAuditLog);
    },

    async getLog(id) {
      const client = getSupabaseClient();
      if (!client) {
        return null;
      }

      const { data, error } = await client
        .from('audit_logs')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? mapAuditLog(data) : null;
    },
  };
}
