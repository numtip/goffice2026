-- GO-BE-1 Worker A — Indexes, canonical unit constraints, approved-entry guard (003)
-- Depends on: 202607260001_create_core_tables.sql

-- ---------------------------------------------------------------------------
-- Indexes on monthly_metric_entries (query patterns: filter, workflow, reporting)
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_monthly_metric_entries_metric_type_id
  ON public.monthly_metric_entries (metric_type_id);

CREATE INDEX IF NOT EXISTS idx_monthly_metric_entries_department_id
  ON public.monthly_metric_entries (department_id);

CREATE INDEX IF NOT EXISTS idx_monthly_metric_entries_year_month
  ON public.monthly_metric_entries (year, month);

CREATE INDEX IF NOT EXISTS idx_monthly_metric_entries_status
  ON public.monthly_metric_entries (status);

CREATE INDEX IF NOT EXISTS idx_monthly_metric_entries_approved_at
  ON public.monthly_metric_entries (approved_at)
  WHERE approved_at IS NOT NULL;

-- FK lookup index for review_comments → entries
CREATE INDEX IF NOT EXISTS idx_review_comments_entry_id
  ON public.review_comments (entry_id);

-- ---------------------------------------------------------------------------
-- Canonical metric code + unit pairs (aligned with dashboard taxonomy)
-- waste=% and ghg=tCO2e marked REVIEW_REQUIRED pending PO confirmation
-- ---------------------------------------------------------------------------
ALTER TABLE public.metric_types
  DROP CONSTRAINT IF EXISTS metric_types_canonical_code_check;

ALTER TABLE public.metric_types
  ADD CONSTRAINT metric_types_canonical_code_check CHECK (
    code IN ('energy', 'water', 'fuel', 'paper', 'waste', 'ghg')
  );

ALTER TABLE public.metric_types
  DROP CONSTRAINT IF EXISTS metric_types_canonical_unit_check;

ALTER TABLE public.metric_types
  ADD CONSTRAINT metric_types_canonical_unit_check CHECK (
    (code = 'energy' AND unit = 'kWh')
    OR (code = 'water' AND unit = 'm³')
    OR (code = 'fuel' AND unit = 'L')
    OR (code = 'paper' AND unit = 'kg')
    OR (code = 'waste' AND unit = '%')   -- REVIEW_REQUIRED: confirm % vs kg for recycling metric
    OR (code = 'ghg' AND unit = 'tCO2e') -- REVIEW_REQUIRED: confirm tCO2e vs kgCO2e
  );

COMMENT ON CONSTRAINT metric_types_canonical_unit_check ON public.metric_types IS
  'Canonical dashboard units. waste (%) and ghg (tCO2e) are REVIEW_REQUIRED pending PO sign-off.';

-- ---------------------------------------------------------------------------
-- Approved-entry immutability
-- Blocks value/status changes on approved rows; admin may transition to archived only.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_approved_entry_immutability()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_role text;
BEGIN
  IF OLD.status = 'approved' THEN
    IF NEW.value IS DISTINCT FROM OLD.value THEN
      RAISE EXCEPTION
        'Approved entries cannot change value (entry id: %)',
        OLD.id;
    END IF;

    -- Admin-only path: approved → archived (value must remain unchanged)
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      IF NEW.status = 'archived' THEN
        SELECT p.role INTO actor_role
        FROM public.profiles AS p
        WHERE p.id = auth.uid();

        IF actor_role = 'admin' THEN
          RETURN NEW;
        END IF;

        RAISE EXCEPTION
          'Only admin may archive approved entries (actor role: %)',
          COALESCE(actor_role, 'unknown');
      END IF;

      RAISE EXCEPTION
        'Approved entries cannot change status except admin transition to archived';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.enforce_approved_entry_immutability() IS
  'BEFORE UPDATE guard on monthly_metric_entries: approved rows are immutable '
  'except admin may set status to archived. Non-admin callers cannot mutate value or status.';

DROP TRIGGER IF EXISTS trg_monthly_metric_entries_approved_immutability
  ON public.monthly_metric_entries;

CREATE TRIGGER trg_monthly_metric_entries_approved_immutability
  BEFORE UPDATE ON public.monthly_metric_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_approved_entry_immutability();
