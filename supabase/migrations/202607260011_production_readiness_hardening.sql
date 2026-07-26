-- GO-QA-1: Production readiness blockers
-- 1. Staff must not insert/update entries for metrics outside owner department
-- 2. Reviewer audit log read scoped to assigned metrics only

-- =============================================================================
-- Staff entry policies — enforce metric owner department
-- =============================================================================

DROP POLICY IF EXISTS mme_insert_staff ON public.monthly_metric_entries;

CREATE POLICY mme_insert_staff
  ON public.monthly_metric_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.current_user_role() = 'staff'
    AND department_id = public.current_user_department_id()
    AND department_id = public.metric_owner_department_id(metric_type_id)
    AND status = 'draft'
    AND created_by = auth.uid()
  );

DROP POLICY IF EXISTS mme_update_staff ON public.monthly_metric_entries;

CREATE POLICY mme_update_staff
  ON public.monthly_metric_entries
  FOR UPDATE
  TO authenticated
  USING (
    public.current_user_role() = 'staff'
    AND department_id = public.current_user_department_id()
    AND department_id = public.metric_owner_department_id(metric_type_id)
    AND status IN ('draft', 'needs_revision')
  )
  WITH CHECK (
    public.current_user_role() = 'staff'
    AND department_id = public.current_user_department_id()
    AND department_id = public.metric_owner_department_id(metric_type_id)
    AND status IN ('draft', 'needs_revision', 'submitted')
    AND status <> 'approved'
  );

DROP POLICY IF EXISTS mme_delete_staff_draft ON public.monthly_metric_entries;

CREATE POLICY mme_delete_staff_draft
  ON public.monthly_metric_entries
  FOR DELETE
  TO authenticated
  USING (
    public.current_user_role() = 'staff'
    AND department_id = public.current_user_department_id()
    AND department_id = public.metric_owner_department_id(metric_type_id)
    AND status = 'draft'
  );

-- =============================================================================
-- Reviewer audit read — assigned metric scope only
-- =============================================================================

DROP POLICY IF EXISTS audit_logs_select_reviewer ON public.audit_logs;

CREATE POLICY audit_logs_select_reviewer
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    public.is_reviewer()
    AND (
      (
        entity_type = 'monthly_metric_entries'
        AND EXISTS (
          SELECT 1
          FROM public.monthly_metric_entries AS mme
          WHERE mme.id = audit_logs.entity_id
            AND public.is_assigned_reviewer(mme.metric_type_id)
        )
      )
      OR (
        entity_type = 'review_comments'
        AND EXISTS (
          SELECT 1
          FROM public.review_comments AS rc
          INNER JOIN public.monthly_metric_entries AS mme
            ON mme.id = rc.entry_id
          WHERE rc.id = audit_logs.entity_id
            AND public.is_assigned_reviewer(mme.metric_type_id)
        )
      )
    )
  );

COMMENT ON POLICY mme_insert_staff ON public.monthly_metric_entries IS
  'Staff drafts must use owner department for the selected metric (Decision Baseline v1).';

COMMENT ON POLICY audit_logs_select_reviewer ON public.audit_logs IS
  'Reviewers read audit rows only for metrics assigned in workflow.metric_reviewer_map.';
