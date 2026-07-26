# Reviewer Assignment Runbook

**Task:** GO-BE-2D  
**Date:** 2026-07-26  
**Scope:** One reviewer per metric — configuration procedure before Supabase Dev activation

---

## Model (frozen Baseline v1)

| Rule | Detail |
|------|--------|
| One reviewer per metric | `organization_settings.workflow.metric_reviewer_map` — JSONB `{ metric_code → profile_uuid }` |
| No cross-metric review | RLS uses `is_assigned_reviewer(metric_type_id)` (migration 008) |
| Staff cannot approve | Staff policies exclude `status = approved` transitions |
| Admin fallback | `mme_select_admin` / `mme_update_admin` bypass per-metric routing; use for break-glass and archive |
| Null map entry | No reviewer can approve that metric until a valid UUID is set |

---

## Prerequisites

1. Supabase Auth accounts exist for each assigned reviewer (created outside this repo).
2. Each reviewer has a `profiles` row with `role = 'reviewer'`, `is_active = true`, and correct `department_id` if staff-context is needed.
3. PO has approved owner departments ([PO Sign-off Checklist](./PO_SIGNOFF_CHECKLIST.md)).
4. **Do not** commit real UUIDs or emails to git until PO explicitly approves a sanitized config pattern.

---

## Assignment procedure

### Step 1 — Collect profile UUIDs (secure channel)

For each metric, PO designates one reviewer. Record UUIDs from Supabase Dashboard → Authentication → Users, or:

```sql
-- Run in Supabase SQL editor (Dev only) — returns reviewer profile IDs
SELECT id, email, full_name, role, department_id
FROM public.profiles
WHERE role = 'reviewer'
  AND is_active = true
ORDER BY email;
```

### Step 2 — Build the map (template)

Replace `<UUID_*>` with real values. **Never use placeholder/fake UUIDs in production.**

```json
{
  "metric_reviewer_map": {
    "energy": "<UUID_ENERGY_REVIEWER>",
    "water": "<UUID_WATER_REVIEWER>",
    "fuel": "<UUID_FUEL_REVIEWER>",
    "paper": "<UUID_PAPER_REVIEWER>",
    "waste": "<UUID_WASTE_REVIEWER>",
    "recycling_rate": "<UUID_RECYCLING_RATE_REVIEWER>",
    "ghg": "<UUID_GHG_REVIEWER>"
  }
}
```

Same person may hold multiple metrics only if PO explicitly accepts concentration of duty (document in PO notes).

### Step 3 — Apply via SQL (Dev / staging)

```sql
-- Template: assign reviewer UUIDs (admin session required)
-- Replace every <UUID_*> before running.

UPDATE public.organization_settings
SET
  value = jsonb_set(
    value,
    '{metric_reviewer_map}',
    jsonb_build_object(
      'energy',         '<UUID_ENERGY_REVIEWER>'::text,
      'water',          '<UUID_WATER_REVIEWER>'::text,
      'fuel',           '<UUID_FUEL_REVIEWER>'::text,
      'paper',          '<UUID_PAPER_REVIEWER>'::text,
      'waste',          '<UUID_WASTE_REVIEWER>'::text,
      'recycling_rate', '<UUID_RECYCLING_RATE_REVIEWER>'::text,
      'ghg',            '<UUID_GHG_REVIEWER>'::text
    ),
    true
  ),
  description = 'Production reviewer map — assigned YYYY-MM-DD by PO',
  updated_at = now()
WHERE setting_key = 'workflow';
```

Optional single-metric update:

```sql
UPDATE public.organization_settings
SET value = jsonb_set(
  value,
  '{metric_reviewer_map,fuel}',
  to_jsonb('<UUID_FUEL_REVIEWER>'::text),
  true
)
WHERE setting_key = 'workflow';
```

### Step 4 — Verify RLS behavior

```sql
-- As assigned fuel reviewer (authenticated JWT): should return submitted fuel rows only
SELECT mme.id, mt.code, mme.status
FROM public.monthly_metric_entries mme
JOIN public.metric_types mt ON mt.id = mme.metric_type_id
WHERE mt.code = 'fuel'
  AND mme.status = 'submitted';

-- As same reviewer: energy submitted rows should NOT appear (unless also mapped)
SELECT mt.code, count(*)
FROM public.monthly_metric_entries mme
JOIN public.metric_types mt ON mt.id = mme.metric_type_id
WHERE mme.status = 'submitted'
GROUP BY mt.code;
```

Expected:

- Reviewer sees/updates **only** metrics where `metric_reviewer_map[code] = auth.uid()`.
- Admin sees all rows via admin policies.
- Public/anon still reads approved rows from views only.

---

## RLS compatibility (migration 008)

| Policy | Scoped by `is_assigned_reviewer` |
|--------|----------------------------------|
| `mme_select_reviewer_workflow` | Yes |
| `mme_update_reviewer` | Yes |
| `review_comments_select_reviewer` | Yes (via entry join) |
| `review_comments_insert_reviewer` | Yes (via entry join) |
| `mme_select_admin` / `mme_update_admin` | No — admin break-glass |
| `mme_select_staff_*` | Department-scoped; unrelated to reviewer map |

Helper validates UUID format and `profiles.role = reviewer` indirectly via map match to `auth.uid()`. Invalid or null map entries deny reviewer workflow access for that metric.

---

## Current seed state

All seven metrics have `null` in `workflow.metric_reviewer_map` (`supabase/seed.sql`). **Expected until PO assigns real UUIDs.**

---

## Readiness checklist

| Step | Status |
|------|--------|
| Reviewer Auth accounts created | ☐ Pending PO |
| Profile rows `role = reviewer` | ☐ Pending PO |
| UUID map applied in Dev | ☐ Pending GO-BE-3 |
| RLS verification queries passed | ☐ Pending GO-BE-3 |
| Owner sign-off complete | ☐ 4 APPROVED / 3 NEEDS_CONFIRMATION |

---

## Related documents

- [PO Sign-off Checklist](./PO_SIGNOFF_CHECKLIST.md)
- [RLS Policy Reference](./RLS_POLICY.md)
- [Production Config Readiness](./PRODUCTION_CONFIG_READINESS.md)
