-- GO-BE-1.1: Corrective hardening — profile privilege fields, audit insert path, reviewer audit scope

-- =============================================================================
-- Profile self-service: freeze role, department_id, is_active for non-admin
-- =============================================================================

CREATE OR REPLACE FUNCTION public.enforce_profile_self_service_limits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.id = auth.uid() AND NOT public.is_admin() THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'profiles: non-admin cannot change own role';
    END IF;
    IF NEW.department_id IS DISTINCT FROM OLD.department_id THEN
      RAISE EXCEPTION 'profiles: non-admin cannot change own department';
    END IF;
    IF NEW.is_active IS DISTINCT FROM OLD.is_active THEN
      RAISE EXCEPTION 'profiles: non-admin cannot change own active status';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_enforce_self_service_limits ON public.profiles;

CREATE TRIGGER profiles_enforce_self_service_limits
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_profile_self_service_limits();

-- =============================================================================
-- Audit logs: trigger-only inserts; scope reviewer read to workflow entities
-- =============================================================================

DROP POLICY IF EXISTS audit_logs_insert_admin ON public.audit_logs;

DROP POLICY IF EXISTS audit_logs_select_reviewer ON public.audit_logs;

CREATE POLICY audit_logs_select_reviewer
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    public.is_reviewer()
    AND entity_type IN ('monthly_metric_entries', 'review_comments')
  );

REVOKE EXECUTE ON FUNCTION public.audit_log_write(uuid, text, uuid, text, jsonb, jsonb, uuid, text, jsonb)
  FROM PUBLIC, anon, authenticated;
