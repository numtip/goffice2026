-- GO-BE-1 Worker C — Public dashboard views (approved data only)
-- Depends on: 202607260001 (core tables), 202607260003 (indexes)
-- Migration order: 004 (after core schema, before RLS policies in 005)

-- ---------------------------------------------------------------------------
-- Security model (Supabase-safe public view pattern)
-- ---------------------------------------------------------------------------
-- PostgreSQL 15+ supports security_invoker on views. With security_invoker=true,
-- the caller's RLS policies apply to underlying tables. That would force either:
--   (a) anon SELECT policies on operational tables (exposes note, actor UUIDs), or
--   (b) broken public reads (permission denied for anon).
--
-- Approved pattern for public-safe projections:
--   • security_invoker=false (view runs as owner, bypasses RLS on base tables)
--   • View definition filters status='approved' and projects only public columns
--   • GRANT SELECT on views to anon, authenticated (see 005)
--   • Operational tables: RLS enabled, no anon policies (direct access denied)
--
-- Sensitive fields intentionally excluded: email, profile UUIDs, note, audit data,
-- review comments, submitted_by, approved_by, created_by, updated_by.

-- ---------------------------------------------------------------------------
-- 1. public_dashboard_monthly_metrics
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.public_dashboard_monthly_metrics
WITH (security_invoker = false)
AS
SELECT
  mt.code                    AS metric_code,
  mt.label_th                AS metric_label_th,
  mt.label_en                AS metric_label_en,
  mt.unit                    AS unit,
  d.code                     AS department_code,
  d.name_th                  AS department_name_th,
  mme.year                   AS year,
  mme.month                  AS month,
  mme.value                  AS value,
  mme.approved_at            AS approved_at,
  mme.updated_at             AS updated_at
FROM public.monthly_metric_entries AS mme
INNER JOIN public.metric_types AS mt
  ON mt.id = mme.metric_type_id
  AND mt.is_active = true
INNER JOIN public.departments AS d
  ON d.id = mme.department_id
  AND d.is_active = true
WHERE mme.status = 'approved';

COMMENT ON VIEW public.public_dashboard_monthly_metrics IS
  'Public-safe approved monthly metrics. Excludes staff notes, user IDs, and draft/submitted rows.';

-- ---------------------------------------------------------------------------
-- 2. public_dashboard_executive_summary
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.public_dashboard_executive_summary
WITH (security_invoker = false)
AS
SELECT
  mt.code                              AS metric_code,
  mme.year                             AS year,
  SUM(mme.value)                       AS total_value,
  COUNT(DISTINCT mme.month)::integer   AS month_count,
  MAX(mme.approved_at)                 AS last_approved_at
FROM public.monthly_metric_entries AS mme
INNER JOIN public.metric_types AS mt
  ON mt.id = mme.metric_type_id
  AND mt.is_active = true
INNER JOIN public.departments AS d
  ON d.id = mme.department_id
  AND d.is_active = true
WHERE mme.status = 'approved'
GROUP BY mt.code, mme.year;

COMMENT ON VIEW public.public_dashboard_executive_summary IS
  'Aggregated approved metrics by metric_code and year for executive dashboard.';

-- ---------------------------------------------------------------------------
-- 3. public_dashboard_metadata
-- ---------------------------------------------------------------------------
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
  (SELECT COUNT(DISTINCT metric_code) FROM approved_entries)  AS metric_count,
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
  'Dashboard freshness and completeness hints derived from approved entries only.';
