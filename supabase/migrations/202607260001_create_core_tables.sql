-- GO-BE-1 Worker A — Core tables (001)
-- PostgreSQL / Supabase compatible. No RLS, views, or seed data in this migration.

-- ---------------------------------------------------------------------------
-- Shared trigger helper: maintain updated_at on mutable rows
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.set_updated_at() IS
  'Sets updated_at to now() on row UPDATE; attach via trg_*_updated_at triggers.';

-- ---------------------------------------------------------------------------
-- departments — organizational units (optional hierarchy via parent_id)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name_th text NOT NULL,
  name_en text,
  parent_id uuid,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT departments_code_unique UNIQUE (code),
  CONSTRAINT departments_parent_not_self CHECK (
    parent_id IS NULL OR parent_id <> id
  )
);

COMMENT ON TABLE public.departments IS
  'Organizational units responsible for monthly environmental metric entry.';

ALTER TABLE public.departments
  DROP CONSTRAINT IF EXISTS departments_parent_id_fkey;

ALTER TABLE public.departments
  ADD CONSTRAINT departments_parent_id_fkey
  FOREIGN KEY (parent_id)
  REFERENCES public.departments (id)
  ON DELETE SET NULL;

CREATE TRIGGER trg_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- metric_types — supported environmental performance metrics
-- Canonical units (see 003 for code/unit CHECK):
--   energy=kWh, water=m³, fuel=L, paper=kg, waste=% (REVIEW_REQUIRED), ghg=tCO2e (REVIEW_REQUIRED)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.metric_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  label_th text NOT NULL,
  label_en text,
  unit text NOT NULL,
  sort_order integer NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  config_metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT metric_types_code_unique UNIQUE (code)
);

COMMENT ON TABLE public.metric_types IS
  'Environmental metric definitions. config_metadata holds optional JSON validation/display hints.';
COMMENT ON COLUMN public.metric_types.config_metadata IS
  'Optional JSONB metadata for metric-specific validation or display configuration.';

CREATE TRIGGER trg_metric_types_updated_at
  BEFORE UPDATE ON public.metric_types
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- profiles — application user metadata linked to Supabase Auth
-- Roles: admin, staff, reviewer, viewer
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  role text NOT NULL,
  department_id uuid,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_role_check CHECK (
    role IN ('admin', 'staff', 'reviewer', 'viewer')
  )
);

COMMENT ON TABLE public.profiles IS
  'Staff/reviewer/admin profiles linked 1:1 to auth.users.';

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id)
  REFERENCES auth.users (id)
  ON DELETE CASCADE;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_department_id_fkey;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_department_id_fkey
  FOREIGN KEY (department_id)
  REFERENCES public.departments (id)
  ON DELETE SET NULL;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- monthly_metric_entries — monthly values with submission/approval workflow
-- Statuses: draft, submitted, needs_revision, approved, archived
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.monthly_metric_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type_id uuid NOT NULL,
  department_id uuid NOT NULL,
  year integer NOT NULL,
  month integer NOT NULL,
  value numeric NOT NULL,
  note text,
  status text NOT NULL DEFAULT 'draft',
  submitted_at timestamptz,
  submitted_by uuid,
  approved_at timestamptz,
  approved_by uuid,
  created_by uuid NOT NULL,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT monthly_metric_entries_month_check CHECK (month BETWEEN 1 AND 12),
  CONSTRAINT monthly_metric_entries_value_check CHECK (value >= 0),
  CONSTRAINT monthly_metric_entries_status_check CHECK (
    status IN ('draft', 'submitted', 'needs_revision', 'approved', 'archived')
  ),
  CONSTRAINT monthly_metric_entries_monthly_unique UNIQUE (
    metric_type_id,
    department_id,
    year,
    month
  )
);

COMMENT ON TABLE public.monthly_metric_entries IS
  'Monthly environmental metric values with draft → submit → review → approve workflow.';

ALTER TABLE public.monthly_metric_entries
  DROP CONSTRAINT IF EXISTS monthly_metric_entries_metric_type_id_fkey;

ALTER TABLE public.monthly_metric_entries
  ADD CONSTRAINT monthly_metric_entries_metric_type_id_fkey
  FOREIGN KEY (metric_type_id)
  REFERENCES public.metric_types (id)
  ON DELETE RESTRICT;

ALTER TABLE public.monthly_metric_entries
  DROP CONSTRAINT IF EXISTS monthly_metric_entries_department_id_fkey;

ALTER TABLE public.monthly_metric_entries
  ADD CONSTRAINT monthly_metric_entries_department_id_fkey
  FOREIGN KEY (department_id)
  REFERENCES public.departments (id)
  ON DELETE RESTRICT;

ALTER TABLE public.monthly_metric_entries
  DROP CONSTRAINT IF EXISTS monthly_metric_entries_submitted_by_fkey;

ALTER TABLE public.monthly_metric_entries
  ADD CONSTRAINT monthly_metric_entries_submitted_by_fkey
  FOREIGN KEY (submitted_by)
  REFERENCES public.profiles (id)
  ON DELETE SET NULL;

ALTER TABLE public.monthly_metric_entries
  DROP CONSTRAINT IF EXISTS monthly_metric_entries_approved_by_fkey;

ALTER TABLE public.monthly_metric_entries
  ADD CONSTRAINT monthly_metric_entries_approved_by_fkey
  FOREIGN KEY (approved_by)
  REFERENCES public.profiles (id)
  ON DELETE SET NULL;

ALTER TABLE public.monthly_metric_entries
  DROP CONSTRAINT IF EXISTS monthly_metric_entries_created_by_fkey;

ALTER TABLE public.monthly_metric_entries
  ADD CONSTRAINT monthly_metric_entries_created_by_fkey
  FOREIGN KEY (created_by)
  REFERENCES public.profiles (id)
  ON DELETE RESTRICT;

ALTER TABLE public.monthly_metric_entries
  DROP CONSTRAINT IF EXISTS monthly_metric_entries_updated_by_fkey;

ALTER TABLE public.monthly_metric_entries
  ADD CONSTRAINT monthly_metric_entries_updated_by_fkey
  FOREIGN KEY (updated_by)
  REFERENCES public.profiles (id)
  ON DELETE SET NULL;

CREATE TRIGGER trg_monthly_metric_entries_updated_at
  BEFORE UPDATE ON public.monthly_metric_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- review_comments — reviewer feedback on entries (immutable after insert)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.review_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL,
  comment text NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.review_comments IS
  'Reviewer comments on monthly metric entries; kept separate from numeric data.';

ALTER TABLE public.review_comments
  DROP CONSTRAINT IF EXISTS review_comments_entry_id_fkey;

ALTER TABLE public.review_comments
  ADD CONSTRAINT review_comments_entry_id_fkey
  FOREIGN KEY (entry_id)
  REFERENCES public.monthly_metric_entries (id)
  ON DELETE CASCADE;

ALTER TABLE public.review_comments
  DROP CONSTRAINT IF EXISTS review_comments_created_by_fkey;

ALTER TABLE public.review_comments
  ADD CONSTRAINT review_comments_created_by_fkey
  FOREIGN KEY (created_by)
  REFERENCES public.profiles (id)
  ON DELETE RESTRICT;
