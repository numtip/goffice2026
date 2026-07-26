-- GO-INFRA-2: Fix audit_row_change for multi-table triggers (seed compat)
-- audit_row_change is shared by monthly_metric_entries and organization_settings.
-- CASE branches referencing NEW.created_by failed on organization_settings INSERT during seed.

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
  v_row jsonb;
BEGIN
  IF TG_TABLE_NAME = 'audit_logs' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF TG_OP = 'INSERT' THEN
    v_action := 'insert';
    v_before := NULL;
    v_after := to_jsonb(NEW);
    v_row := v_after;
    v_entity_id := (v_row ->> 'id')::uuid;
    v_actor_id := COALESCE(
      NULLIF(v_row ->> 'updated_by', '')::uuid,
      NULLIF(v_row ->> 'created_by', '')::uuid,
      auth.uid()
    );
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    v_before := to_jsonb(OLD);
    v_after := to_jsonb(NEW);
    v_row := v_after;
    v_entity_id := (v_row ->> 'id')::uuid;
    v_actor_id := COALESCE(
      NULLIF(v_row ->> 'updated_by', '')::uuid,
      NULLIF(v_row ->> 'created_by', '')::uuid,
      auth.uid()
    );

    IF TG_TABLE_NAME = 'monthly_metric_entries'
       AND (v_before ->> 'status') IS DISTINCT FROM (v_after ->> 'status') THEN
      v_action := CASE
        WHEN v_after ->> 'status' = 'archived' THEN 'archive'
        ELSE 'status_change'
      END;
      v_metadata := jsonb_build_object(
        'previous_status', v_before ->> 'status',
        'new_status', v_after ->> 'status'
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

COMMENT ON FUNCTION public.audit_row_change() IS
  'Generic INSERT/UPDATE audit trigger. Uses jsonb row projection for multi-table safety.';
