-- GO-BE-1 Worker B: Supporting tables
-- Depends on Worker A (001): departments, profiles, metric_types, monthly_metric_entries

-- ---------------------------------------------------------------------------
-- organization_settings
-- ---------------------------------------------------------------------------
CREATE TABLE public.organization_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  is_public boolean NOT NULL DEFAULT false,
  updated_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT organization_settings_setting_key_unique UNIQUE (setting_key)
);

COMMENT ON TABLE public.organization_settings IS
  'Key/value configuration for Green Office operational settings.';

CREATE INDEX organization_settings_is_public_idx
  ON public.organization_settings (is_public)
  WHERE is_public = true;

-- ---------------------------------------------------------------------------
-- metric_formulas
-- ---------------------------------------------------------------------------
CREATE TABLE public.metric_formulas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type_id uuid NOT NULL REFERENCES public.metric_types (id) ON DELETE RESTRICT,
  formula_code text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  result_unit text NOT NULL,
  effective_from date NOT NULL DEFAULT CURRENT_DATE,
  effective_to date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT metric_formulas_effective_range_check CHECK (
    effective_to IS NULL OR effective_to >= effective_from
  ),
  CONSTRAINT metric_formulas_metric_code_effective_unique UNIQUE (
    metric_type_id,
    formula_code,
    effective_from
  )
);

COMMENT ON TABLE public.metric_formulas IS
  'Versioned calculation rules for derived metrics (e.g. GHG from activity data).';

CREATE INDEX metric_formulas_metric_type_active_idx
  ON public.metric_formulas (metric_type_id, is_active)
  WHERE is_active = true;

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  notification_type text NOT NULL,
  title text NOT NULL,
  body text,
  entity_type text,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.notifications IS
  'In-app notifications for staff workflow events (submission, review, approval).';

CREATE INDEX notifications_recipient_unread_idx
  ON public.notifications (recipient_id, created_at DESC)
  WHERE read_at IS NULL;

CREATE INDEX notifications_entity_idx
  ON public.notifications (entity_type, entity_id)
  WHERE entity_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- dashboard_cache
-- ---------------------------------------------------------------------------
CREATE TABLE public.dashboard_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text NOT NULL,
  payload jsonb NOT NULL,
  source_updated_at timestamptz,
  generated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  CONSTRAINT dashboard_cache_cache_key_unique UNIQUE (cache_key)
);

COMMENT ON TABLE public.dashboard_cache IS
  'Precomputed dashboard payloads keyed for static fallback and live merge.';

CREATE INDEX dashboard_cache_expires_at_idx
  ON public.dashboard_cache (expires_at)
  WHERE expires_at IS NOT NULL;

-- ---------------------------------------------------------------------------
-- external_evidence_links (URL references only — no file storage)
-- ---------------------------------------------------------------------------
CREATE TABLE public.external_evidence_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  monthly_metric_entry_id uuid NOT NULL
    REFERENCES public.monthly_metric_entries (id) ON DELETE CASCADE,
  document_id text,
  document_url text NOT NULL,
  label text NOT NULL,
  source_system text NOT NULL DEFAULT 'm365',
  created_by uuid NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.external_evidence_links IS
  'External document links (M365/SharePoint) tied to monthly entries. Links only — no uploads.';

CREATE INDEX external_evidence_links_entry_idx
  ON public.external_evidence_links (monthly_metric_entry_id);

-- ---------------------------------------------------------------------------
-- audit_logs
-- ---------------------------------------------------------------------------
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL,
  before jsonb,
  after jsonb,
  request_id uuid,
  source text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.audit_logs IS
  'Operational audit trail. No IP, device fingerprint, or raw client identifiers stored.';

CREATE INDEX audit_logs_entity_idx
  ON public.audit_logs (entity_type, entity_id);

CREATE INDEX audit_logs_actor_created_idx
  ON public.audit_logs (actor_id, created_at DESC);

CREATE INDEX audit_logs_created_at_idx
  ON public.audit_logs (created_at DESC);
