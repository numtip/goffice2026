-- GO-BE-2B — Decision Baseline v1 implementation
-- Depends on: 001–007
--
-- Worker A: 7-metric catalog, partial unique index (archive + replacement)
-- Worker B: owner-department helpers + office-wide public views
-- Worker C: per-metric reviewer routing helpers + scoped RLS

-- =============================================================================
-- Worker A — Partial unique index (preserve archive + replacement flow)
-- =============================================================================

ALTER TABLE public.monthly_metric_entries
  DROP CONSTRAINT IF EXISTS monthly_metric_entries_monthly_unique;

CREATE UNIQUE INDEX IF NOT EXISTS monthly_metric_entries_active_monthly_unique
  ON public.monthly_metric_entries (metric_type_id, department_id, year, month)
  WHERE status <> 'archived';

COMMENT ON INDEX public.monthly_metric_entries_active_monthly_unique IS
  'One active row per metric/department/year/month. Archived rows excluded so '
  'correction workflow can insert a replacement draft.';

-- =============================================================================
-- Worker A — Seven-metric catalog (waste = kg, recycling_rate = %, ghg = tCO2e)
-- =============================================================================

ALTER TABLE public.metric_types
  DROP CONSTRAINT IF EXISTS metric_types_canonical_code_check;

ALTER TABLE public.metric_types
  ADD CONSTRAINT metric_types_canonical_code_check CHECK (
    code IN (
      'energy',
      'water',
      'fuel',
      'paper',
      'waste',
      'recycling_rate',
      'ghg'
    )
  );

ALTER TABLE public.metric_types
  DROP CONSTRAINT IF EXISTS metric_types_canonical_unit_check;

ALTER TABLE public.metric_types
  ADD CONSTRAINT metric_types_canonical_unit_check CHECK (
    (code = 'energy' AND unit = 'kWh')
    OR (code = 'water' AND unit = 'm³')
    OR (code = 'fuel' AND unit = 'L')
    OR (code = 'paper' AND unit = 'kg')
    OR (code = 'waste' AND unit = 'kg')
    OR (code = 'recycling_rate' AND unit = '%')
    OR (code = 'ghg' AND unit = 'tCO2e')
  );

COMMENT ON CONSTRAINT metric_types_canonical_unit_check ON public.metric_types IS
  'Decision Baseline v1: waste mass (kg), recycling_rate (%), ghg (tCO2e derived).';

UPDATE public.metric_types
SET
  unit = 'kg',
  label_en = 'Waste Mass',
  sort_order = 5,
  config_metadata = jsonb_build_object(
    'publication_scope', 'office_wide',
    'owner_department_code', 'DEV-HQ',
    'entry_mode', 'manual',
    'aggregation_rule', 'sum'
  ),
  updated_at = now()
WHERE code = 'waste';

INSERT INTO public.metric_types (
  code,
  label_th,
  label_en,
  unit,
  sort_order,
  is_active,
  config_metadata
)
VALUES (
  'recycling_rate',
  'อัตราการรีไซcle',
  'Recycling Rate',
  '%',
  6,
  true,
  jsonb_build_object(
    'publication_scope', 'office_wide',
    'owner_department_code', 'DEV-HQ',
    'entry_mode', 'manual',
    'aggregation_rule', 'average'
  )
)
ON CONFLICT (code) DO UPDATE
SET
  label_th = EXCLUDED.label_th,
  label_en = EXCLUDED.label_en,
  unit = EXCLUDED.unit,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  config_metadata = EXCLUDED.config_metadata,
  updated_at = now();

UPDATE public.metric_types
SET
  sort_order = 7,
  config_metadata = jsonb_build_object(
    'publication_scope', 'office_wide',
    'owner_department_code', 'DEV-HQ',
    'entry_mode', 'derived',
    'aggregation_rule', 'sum'
  ),
  updated_at = now()
WHERE code = 'ghg';

UPDATE public.metric_types
SET
  config_metadata = jsonb_build_object(
    'publication_scope', 'office_wide',
    'owner_department_code', 'DEV-HQ',
    'entry_mode', 'manual',
    'aggregation_rule', 'sum'
  ),
  updated_at = now()
WHERE code IN ('energy', 'water', 'fuel', 'paper')
  AND (config_metadata IS NULL OR config_metadata = '{}'::jsonb);

-- =============================================================================
-- Worker B — Owner department resolution (internal; not exposed on public views)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.metric_owner_department_id(p_metric_type_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT d.id
      FROM public.metric_types AS mt
      INNER JOIN public.departments AS d
        ON d.code = mt.config_metadata ->> 'owner_department_code'
        AND d.is_active = true
      WHERE mt.id = p_metric_type_id
    ),
    (
      SELECT d.id
      FROM public.metric_types AS mt
      INNER JOIN public.organization_settings AS os
        ON os.setting_key = 'metrics'
      INNER JOIN public.departments AS d
        ON d.code = os.value -> 'owner_department_map' ->> mt.code
        AND d.is_active = true
      WHERE mt.id = p_metric_type_id
    )
  );
$$;

COMMENT ON FUNCTION public.metric_owner_department_id(uuid) IS
  'Resolves the internal data-owner department for a metric from config_metadata '
  'or organization_settings.metrics.owner_department_map. Not a public dimension.';

GRANT EXECUTE ON FUNCTION public.metric_owner_department_id(uuid) TO authenticated;

-- =============================================================================
-- Worker C — Per-metric reviewer assignment (one reviewer per metric)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.is_assigned_reviewer(p_metric_type_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.metric_types AS mt
    INNER JOIN public.organization_settings AS os
      ON os.setting_key = 'workflow'
    WHERE mt.id = p_metric_type_id
      AND public.is_reviewer()
      AND (os.value -> 'metric_reviewer_map' ->> mt.code) IS NOT NULL
      AND (os.value -> 'metric_reviewer_map' ->> mt.code) ~* '^[0-9a-f-]{36}$'
      AND (os.value -> 'metric_reviewer_map' ->> mt.code)::uuid = auth.uid()
  );
$$;

COMMENT ON FUNCTION public.is_assigned_reviewer(uuid) IS
  'True when the current reviewer is mapped to the metric in '
  'organization_settings.workflow.metric_reviewer_map. Admins use admin policies.';

GRANT EXECUTE ON FUNCTION public.is_assigned_reviewer(uuid) TO authenticated;

-- =============================================================================
-- Worker B — Public views: owner-department approved rows only, fixed OFFICE label
-- =============================================================================

CREATE OR REPLACE VIEW public.public_dashboard_monthly_metrics
WITH (security_invoker = false)
AS
SELECT
  mt.code                    AS metric_code,
  mt.label_th                AS metric_label_th,
  mt.label_en                AS metric_label_en,
  mt.unit                    AS unit,
  'OFFICE'                   AS department_code,
  'สำนักงานกลาง'             AS department_name_th,
  mme.year                   AS year,
  mme.month                  AS month,
  mme.value                  AS value,
  mme.approved_at            AS approved_at,
  mme.updated_at             AS updated_at
FROM public.monthly_metric_entries AS mme
INNER JOIN public.metric_types AS mt
  ON mt.id = mme.metric_type_id
  AND mt.is_active = true
WHERE mme.status = 'approved'
  AND mme.department_id = public.metric_owner_department_id(mme.metric_type_id);

COMMENT ON VIEW public.public_dashboard_monthly_metrics IS
  'Public-safe approved monthly metrics. One office-wide value per metric/month '
  '(owner-department filter). Department is not a public reporting dimension.';

CREATE OR REPLACE VIEW public.public_dashboard_executive_summary
WITH (security_invoker = false)
AS
SELECT
  mt.code                              AS metric_code,
  mme.year                             AS year,
  CASE
    WHEN mt.code = 'recycling_rate' THEN AVG(mme.value)
    ELSE SUM(mme.value)
  END                                  AS total_value,
  COUNT(DISTINCT mme.month)::integer   AS month_count,
  MAX(mme.approved_at)                 AS last_approved_at
FROM public.monthly_metric_entries AS mme
INNER JOIN public.metric_types AS mt
  ON mt.id = mme.metric_type_id
  AND mt.is_active = true
WHERE mme.status = 'approved'
  AND mme.department_id = public.metric_owner_department_id(mme.metric_type_id)
GROUP BY mt.code, mme.year;

COMMENT ON VIEW public.public_dashboard_executive_summary IS
  'Aggregated approved metrics by metric_code and year. recycling_rate uses AVG; '
  'mass metrics use SUM. Owner-department rows only.';

CREATE OR REPLACE VIEW public.public_dashboard_metadata
WITH (security_invoker = false)
AS
WITH approved_entries AS (
  SELECT
    mme.id,
    mme.metric_type_id,
    mme.year,
    mme.month,
    mme.updated_at,
    mt.code AS metric_code
  FROM public.monthly_metric_entries AS mme
  INNER JOIN public.metric_types AS mt
    ON mt.id = mme.metric_type_id
    AND mt.is_active = true
  WHERE mme.status = 'approved'
    AND mme.department_id = public.metric_owner_department_id(mme.metric_type_id)
),
metric_year_completeness AS (
  SELECT
    metric_code,
    year,
    COUNT(DISTINCT month)::integer AS months_filled
  FROM approved_entries
  GROUP BY metric_code, year
)
SELECT
  (SELECT MAX(updated_at) FROM approved_entries)              AS last_updated,
  (SELECT COUNT(DISTINCT metric_code) FROM approved_entries)    AS metric_count,
  (SELECT COUNT(*) FROM approved_entries)                     AS approved_entry_count,
  COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'metric_code',     metric_code,
          'year',            year,
          'months_filled',   months_filled,
          'months_expected', 12,
          'is_complete',     (months_filled = 12)
        )
        ORDER BY year DESC, metric_code
      )
      FROM metric_year_completeness
    ),
    '[]'::jsonb
  )                                                           AS completeness_hints;

COMMENT ON VIEW public.public_dashboard_metadata IS
  'Dashboard freshness and completeness hints from owner-department approved rows.';

-- =============================================================================
-- Worker C — Reviewer RLS scoped by assigned metric (no cross-metric review)
-- =============================================================================

DROP POLICY IF EXISTS mme_select_reviewer_workflow ON public.monthly_metric_entries;

CREATE POLICY mme_select_reviewer_workflow
  ON public.monthly_metric_entries
  FOR SELECT
  TO authenticated
  USING (
    public.is_reviewer()
    AND public.is_assigned_reviewer(metric_type_id)
    AND status IN ('submitted', 'approved', 'needs_revision', 'archived')
  );

DROP POLICY IF EXISTS mme_update_reviewer ON public.monthly_metric_entries;

CREATE POLICY mme_update_reviewer
  ON public.monthly_metric_entries
  FOR UPDATE
  TO authenticated
  USING (
    public.is_assigned_reviewer(metric_type_id)
    AND status = 'submitted'
  )
  WITH CHECK (
    public.is_assigned_reviewer(metric_type_id)
    AND status IN ('approved', 'needs_revision')
  );

DROP POLICY IF EXISTS review_comments_select_reviewer ON public.review_comments;

CREATE POLICY review_comments_select_reviewer
  ON public.review_comments
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR (
      public.is_reviewer()
      AND EXISTS (
        SELECT 1
        FROM public.monthly_metric_entries AS mme
        WHERE mme.id = review_comments.entry_id
          AND public.is_assigned_reviewer(mme.metric_type_id)
      )
    )
  );

DROP POLICY IF EXISTS review_comments_insert_reviewer ON public.review_comments;

CREATE POLICY review_comments_insert_reviewer
  ON public.review_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      public.is_admin()
      OR (
        public.is_reviewer()
        AND EXISTS (
          SELECT 1
          FROM public.monthly_metric_entries AS mme
          WHERE mme.id = review_comments.entry_id
            AND public.is_assigned_reviewer(mme.metric_type_id)
        )
      )
    )
    AND created_by = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.monthly_metric_entries AS mme
      WHERE mme.id = review_comments.entry_id
        AND mme.status IN ('submitted', 'needs_revision', 'approved')
    )
  );
