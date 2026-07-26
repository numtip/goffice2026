-- GO-BE-1 Worker C — RLS helper functions and row-level security policies
-- Depends on: 001–004 (core schema, supporting tables, public views)
-- Migration order: 005 (before 006 audit functions; audit triggers respect RLS on direct API access)

-- =============================================================================
-- HELPER FUNCTIONS (SECURITY DEFINER, fixed search_path — no recursive RLS)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.role
  FROM public.profiles AS p
  WHERE p.id = auth.uid()
    AND p.is_active = true;
$$;

COMMENT ON FUNCTION public.current_user_role() IS
  'Returns the active application role for the authenticated user, or NULL.';

CREATE OR REPLACE FUNCTION public.current_user_department_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.department_id
  FROM public.profiles AS p
  WHERE p.id = auth.uid()
    AND p.is_active = true;
$$;

COMMENT ON FUNCTION public.current_user_department_id() IS
  'Returns the assigned department UUID for the authenticated user, or NULL.';

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles AS p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND p.is_active = true
  );
$$;

COMMENT ON FUNCTION public.is_admin() IS
  'True when the authenticated user has an active admin profile.';

CREATE OR REPLACE FUNCTION public.is_reviewer()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles AS p
    WHERE p.id = auth.uid()
      AND p.role = 'reviewer'
      AND p.is_active = true
  );
$$;

COMMENT ON FUNCTION public.is_reviewer() IS
  'True when the authenticated user has an active reviewer profile (excludes admin).';

-- Grant execute to authenticated roles only (helpers are not needed for anon view reads)
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_department_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_reviewer() TO authenticated;

-- =============================================================================
-- ENABLE RLS ON ALL OPERATIONAL TABLES
-- =============================================================================

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metric_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_metric_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metric_formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_evidence_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- departments
-- =============================================================================

CREATE POLICY departments_select_authenticated
  ON public.departments
  FOR SELECT
  TO authenticated
  USING (is_active = true OR public.is_admin());

CREATE POLICY departments_insert_admin
  ON public.departments
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY departments_update_admin
  ON public.departments
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY departments_delete_admin
  ON public.departments
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =============================================================================
-- profiles (not publicly readable; users see own row; admin manages all)
-- =============================================================================

CREATE POLICY profiles_select_own_or_admin
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY profiles_insert_admin
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY profiles_update_own_or_admin
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (
    public.is_admin()
    OR (
      id = auth.uid()
      AND role = public.current_user_role()
    )
  );

CREATE POLICY profiles_delete_admin
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =============================================================================
-- metric_types (reference data — read for authenticated; manage admin)
-- =============================================================================

CREATE POLICY metric_types_select_authenticated
  ON public.metric_types
  FOR SELECT
  TO authenticated
  USING (is_active = true OR public.is_admin());

CREATE POLICY metric_types_insert_admin
  ON public.metric_types
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY metric_types_update_admin
  ON public.metric_types
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY metric_types_delete_admin
  ON public.metric_types
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =============================================================================
-- monthly_metric_entries
-- =============================================================================

-- Viewer: approved entries only (internal read-only)
CREATE POLICY mme_select_viewer_approved
  ON public.monthly_metric_entries
  FOR SELECT
  TO authenticated
  USING (
    public.current_user_role() = 'viewer'
    AND status = 'approved'
  );

-- Staff: read all entries for assigned department
CREATE POLICY mme_select_staff_own_dept
  ON public.monthly_metric_entries
  FOR SELECT
  TO authenticated
  USING (
    public.current_user_role() = 'staff'
    AND department_id = public.current_user_department_id()
  );

-- Reviewer: read submitted workflow rows (traceability preserved)
CREATE POLICY mme_select_reviewer_workflow
  ON public.monthly_metric_entries
  FOR SELECT
  TO authenticated
  USING (
    public.is_reviewer()
    AND status IN ('submitted', 'approved', 'needs_revision', 'archived')
  );

-- Admin: read all
CREATE POLICY mme_select_admin
  ON public.monthly_metric_entries
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Staff: create drafts for own department only
CREATE POLICY mme_insert_staff
  ON public.monthly_metric_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.current_user_role() = 'staff'
    AND department_id = public.current_user_department_id()
    AND status = 'draft'
    AND created_by = auth.uid()
  );

-- Admin: create any entry
CREATE POLICY mme_insert_admin
  ON public.monthly_metric_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Staff: update draft/needs_revision in own department; cannot approve
CREATE POLICY mme_update_staff
  ON public.monthly_metric_entries
  FOR UPDATE
  TO authenticated
  USING (
    public.current_user_role() = 'staff'
    AND department_id = public.current_user_department_id()
    AND status IN ('draft', 'needs_revision')
  )
  WITH CHECK (
    public.current_user_role() = 'staff'
    AND department_id = public.current_user_department_id()
    AND status IN ('draft', 'needs_revision', 'submitted')
    AND status <> 'approved'
  );

-- Reviewer: approve or request revision on submitted entries only
CREATE POLICY mme_update_reviewer
  ON public.monthly_metric_entries
  FOR UPDATE
  TO authenticated
  USING (
    public.is_reviewer()
    AND status = 'submitted'
  )
  WITH CHECK (
    public.is_reviewer()
    AND status IN ('approved', 'needs_revision')
  );

-- Admin: manage entries (approved-row trigger in 003 still limits silent overwrites)
CREATE POLICY mme_update_admin
  ON public.monthly_metric_entries
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Staff: delete own drafts only
CREATE POLICY mme_delete_staff_draft
  ON public.monthly_metric_entries
  FOR DELETE
  TO authenticated
  USING (
    public.current_user_role() = 'staff'
    AND department_id = public.current_user_department_id()
    AND status = 'draft'
  );

CREATE POLICY mme_delete_admin
  ON public.monthly_metric_entries
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =============================================================================
-- review_comments
-- =============================================================================

CREATE POLICY review_comments_select_staff_own_dept
  ON public.review_comments
  FOR SELECT
  TO authenticated
  USING (
    public.current_user_role() = 'staff'
    AND EXISTS (
      SELECT 1
      FROM public.monthly_metric_entries AS mme
      WHERE mme.id = review_comments.entry_id
        AND mme.department_id = public.current_user_department_id()
    )
  );

CREATE POLICY review_comments_select_reviewer
  ON public.review_comments
  FOR SELECT
  TO authenticated
  USING (public.is_reviewer() OR public.is_admin());

CREATE POLICY review_comments_insert_reviewer
  ON public.review_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (public.is_reviewer() OR public.is_admin())
    AND created_by = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.monthly_metric_entries AS mme
      WHERE mme.id = review_comments.entry_id
        AND mme.status IN ('submitted', 'needs_revision', 'approved')
    )
  );

CREATE POLICY review_comments_update_admin
  ON public.review_comments
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY review_comments_delete_admin
  ON public.review_comments
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =============================================================================
-- organization_settings
-- =============================================================================

CREATE POLICY org_settings_select_public_or_admin
  ON public.organization_settings
  FOR SELECT
  TO authenticated
  USING (is_public = true OR public.is_admin());

CREATE POLICY org_settings_insert_admin
  ON public.organization_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY org_settings_update_admin
  ON public.organization_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY org_settings_delete_admin
  ON public.organization_settings
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =============================================================================
-- metric_formulas
-- =============================================================================

CREATE POLICY metric_formulas_select_authenticated
  ON public.metric_formulas
  FOR SELECT
  TO authenticated
  USING (is_active = true OR public.is_admin());

CREATE POLICY metric_formulas_insert_admin
  ON public.metric_formulas
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY metric_formulas_update_admin
  ON public.metric_formulas
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY metric_formulas_delete_admin
  ON public.metric_formulas
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =============================================================================
-- notifications (recipient-scoped; admin oversight)
-- =============================================================================

CREATE POLICY notifications_select_own_or_admin
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid() OR public.is_admin());

CREATE POLICY notifications_insert_admin
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY notifications_update_own_or_admin
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid() OR public.is_admin())
  WITH CHECK (recipient_id = auth.uid() OR public.is_admin());

CREATE POLICY notifications_delete_admin
  ON public.notifications
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =============================================================================
-- dashboard_cache (operational — admin only; not exposed to anon/public)
-- =============================================================================

CREATE POLICY dashboard_cache_select_admin
  ON public.dashboard_cache
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY dashboard_cache_insert_admin
  ON public.dashboard_cache
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY dashboard_cache_update_admin
  ON public.dashboard_cache
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY dashboard_cache_delete_admin
  ON public.dashboard_cache
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =============================================================================
-- external_evidence_links (reference-only Document Center URLs)
-- =============================================================================

CREATE POLICY evidence_links_select_staff_own_dept
  ON public.external_evidence_links
  FOR SELECT
  TO authenticated
  USING (
    public.current_user_role() = 'staff'
    AND EXISTS (
      SELECT 1
      FROM public.monthly_metric_entries AS mme
      WHERE mme.id = external_evidence_links.monthly_metric_entry_id
        AND mme.department_id = public.current_user_department_id()
    )
  );

CREATE POLICY evidence_links_select_reviewer_admin
  ON public.external_evidence_links
  FOR SELECT
  TO authenticated
  USING (public.is_reviewer() OR public.is_admin());

CREATE POLICY evidence_links_insert_staff
  ON public.external_evidence_links
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.current_user_role() = 'staff'
    AND created_by = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.monthly_metric_entries AS mme
      WHERE mme.id = external_evidence_links.monthly_metric_entry_id
        AND mme.department_id = public.current_user_department_id()
        AND mme.status IN ('draft', 'needs_revision')
    )
  );

CREATE POLICY evidence_links_insert_admin
  ON public.external_evidence_links
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY evidence_links_update_staff
  ON public.external_evidence_links
  FOR UPDATE
  TO authenticated
  USING (
    public.current_user_role() = 'staff'
    AND EXISTS (
      SELECT 1
      FROM public.monthly_metric_entries AS mme
      WHERE mme.id = external_evidence_links.monthly_metric_entry_id
        AND mme.department_id = public.current_user_department_id()
        AND mme.status IN ('draft', 'needs_revision')
    )
  )
  WITH CHECK (created_by = auth.uid());

CREATE POLICY evidence_links_update_admin
  ON public.external_evidence_links
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY evidence_links_delete_staff
  ON public.external_evidence_links
  FOR DELETE
  TO authenticated
  USING (
    public.current_user_role() = 'staff'
    AND created_by = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.monthly_metric_entries AS mme
      WHERE mme.id = external_evidence_links.monthly_metric_entry_id
        AND mme.department_id = public.current_user_department_id()
        AND mme.status IN ('draft', 'needs_revision')
    )
  );

CREATE POLICY evidence_links_delete_admin
  ON public.external_evidence_links
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =============================================================================
-- audit_logs (reviewer + admin read; no client INSERT — triggers/service only)
-- =============================================================================

CREATE POLICY audit_logs_select_reviewer
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (public.is_reviewer());

CREATE POLICY audit_logs_select_admin
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY audit_logs_insert_admin
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- =============================================================================
-- PUBLIC VIEW GRANTS (anon + authenticated — no operational table access for anon)
-- =============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON public.public_dashboard_monthly_metrics TO anon, authenticated;
GRANT SELECT ON public.public_dashboard_executive_summary TO anon, authenticated;
GRANT SELECT ON public.public_dashboard_metadata TO anon, authenticated;

-- Revoke direct table access from anon (defense in depth; RLS already denies without policies)
REVOKE ALL ON public.departments FROM anon;
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.metric_types FROM anon;
REVOKE ALL ON public.monthly_metric_entries FROM anon;
REVOKE ALL ON public.review_comments FROM anon;
REVOKE ALL ON public.organization_settings FROM anon;
REVOKE ALL ON public.metric_formulas FROM anon;
REVOKE ALL ON public.notifications FROM anon;
REVOKE ALL ON public.dashboard_cache FROM anon;
REVOKE ALL ON public.external_evidence_links FROM anon;
REVOKE ALL ON public.audit_logs FROM anon;
