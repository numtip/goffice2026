-- GO-BE-1 Worker B: Audit trigger functions
-- Depends on 001 (core tables) and 002 (audit_logs)

-- ---------------------------------------------------------------------------
-- Shared insert helper (SECURITY DEFINER, fixed search_path)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.audit_log_write(
  p_actor_id uuid,
  p_entity_type text,
  p_entity_id uuid,
  p_action text,
  p_before jsonb,
  p_after jsonb,
  p_request_id uuid DEFAULT NULL,
  p_source text DEFAULT 'db_trigger',
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    actor_id,
    entity_type,
    entity_id,
    action,
    before,
    after,
    request_id,
    source,
    metadata
  )
  VALUES (
    p_actor_id,
    p_entity_type,
    p_entity_id,
    p_action,
    p_before,
    p_after,
    p_request_id,
    p_source,
    p_metadata
  );
END;
$$;

COMMENT ON FUNCTION public.audit_log_write IS
  'Internal audit writer. Called only from audit triggers — not audit_logs itself.';

REVOKE ALL ON FUNCTION public.audit_log_write FROM PUBLIC;

-- ---------------------------------------------------------------------------
-- Generic row audit (monthly_metric_entries, organization_settings)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.audit_row_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid;
  v_before jsonb;
  v_after jsonb;
  v_action text;
  v_entity_id uuid;
  v_metadata jsonb := '{}'::jsonb;
BEGIN
  IF TG_TABLE_NAME = 'audit_logs' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF TG_OP = 'INSERT' THEN
    v_action := 'insert';
    v_before := NULL;
    v_after := to_jsonb(NEW);
    v_entity_id := NEW.id;
    v_actor_id := CASE TG_TABLE_NAME
      WHEN 'monthly_metric_entries' THEN COALESCE(NEW.created_by, auth.uid())
      WHEN 'organization_settings' THEN COALESCE(NEW.updated_by, auth.uid())
      ELSE auth.uid()
    END;
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    v_before := to_jsonb(OLD);
    v_after := to_jsonb(NEW);
    v_entity_id := NEW.id;
    v_actor_id := CASE TG_TABLE_NAME
      WHEN 'monthly_metric_entries' THEN COALESCE(NEW.updated_by, auth.uid())
      WHEN 'organization_settings' THEN COALESCE(NEW.updated_by, auth.uid())
      ELSE auth.uid()
    END;

    IF TG_TABLE_NAME = 'monthly_metric_entries'
       AND OLD.status IS DISTINCT FROM NEW.status THEN
      v_action := CASE
        WHEN NEW.status = 'archived' THEN 'archive'
        ELSE 'status_change'
      END;
      v_metadata := jsonb_build_object(
        'previous_status', OLD.status,
        'new_status', NEW.status
      );
    END IF;
  ELSE
    RETURN COALESCE(NEW, OLD);
  END IF;

  PERFORM public.audit_log_write(
    v_actor_id,
    TG_TABLE_NAME,
    v_entity_id,
    v_action,
    v_before,
    v_after,
    NULL,
    'db_trigger',
    v_metadata
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION public.audit_row_change IS
  'Generic INSERT/UPDATE audit trigger for operational tables.';

-- ---------------------------------------------------------------------------
-- Limited profile audit (role, department, active flag only)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.audit_profiles_limited()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid;
  v_before jsonb;
  v_after jsonb;
  v_action text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'insert';
    v_before := NULL;
    v_after := jsonb_build_object(
      'role', NEW.role,
      'department_id', NEW.department_id,
      'is_active', NEW.is_active
    );
    v_actor_id := auth.uid();
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.role IS NOT DISTINCT FROM NEW.role
       AND OLD.department_id IS NOT DISTINCT FROM NEW.department_id
       AND OLD.is_active IS NOT DISTINCT FROM NEW.is_active THEN
      RETURN NEW;
    END IF;

    v_action := 'update';
    v_before := jsonb_build_object(
      'role', OLD.role,
      'department_id', OLD.department_id,
      'is_active', OLD.is_active
    );
    v_after := jsonb_build_object(
      'role', NEW.role,
      'department_id', NEW.department_id,
      'is_active', NEW.is_active
    );
    v_actor_id := auth.uid();
  ELSE
    RETURN COALESCE(NEW, OLD);
  END IF;

  PERFORM public.audit_log_write(
    v_actor_id,
    'profiles',
    NEW.id,
    v_action,
    v_before,
    v_after,
    NULL,
    'db_trigger',
    '{}'::jsonb
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION public.audit_profiles_limited IS
  'Audits profile permission-related fields only; skips name/email cosmetic updates.';

-- ---------------------------------------------------------------------------
-- Triggers (no trigger on audit_logs — avoids recursion)
-- ---------------------------------------------------------------------------
CREATE TRIGGER audit_monthly_metric_entries
  AFTER INSERT OR UPDATE ON public.monthly_metric_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_row_change();

CREATE TRIGGER audit_organization_settings
  AFTER INSERT OR UPDATE ON public.organization_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_row_change();

CREATE TRIGGER audit_profiles_limited
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_profiles_limited();
