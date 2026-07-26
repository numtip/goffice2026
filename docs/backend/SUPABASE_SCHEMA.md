# Supabase Schema Reference

**Version:** GO-BE-1 foundation  
**Updated:** 2026-07-26  
**Source migrations:** `supabase/migrations/202607260001`–`202607260006`

This document describes the operational PostgreSQL schema for Green Office 2026. It complements the [Supabase Backend Blueprint V1](../GREENOFFICE2026_SUPABASE_BACKEND_BLUEPRINT_V1.md) and must stay consistent with SQL migrations.

---

## Overview

| Layer | Tables / views | Responsibility |
|-------|------------------|----------------|
| Identity & org | `profiles`, `departments` | Auth-linked users, roles, department assignment |
| Metrics core | `metric_types`, `monthly_metric_entries`, `review_comments` | Monthly values and review workflow |
| Configuration | `organization_settings`, `metric_formulas` | Office-wide settings and derived-metric rules |
| Operations | `notifications`, `dashboard_cache`, `audit_logs` | Staff alerts, optional cache, traceability |
| Evidence bridge | `external_evidence_links` | Reference-only links to Document Center |
| Public read | `public_dashboard_*` views | Approved, privacy-safe dashboard projections |

---

## Roles

Stored on `profiles.role`. Enforced by CHECK constraint and RLS.

| Role | Purpose |
|------|---------|
| `admin` | User/department/metric management; full operational access |
| `staff` | Create and edit draft entries for assigned department |
| `reviewer` | Review submitted entries; approve or request revision |
| `viewer` | Internal read-only access where explicitly allowed |

Anonymous website visitors are **not** a database role. They access **public views only** via the anon key under RLS.

---

## Entry Status Model

`monthly_metric_entries.status` values (CHECK-constrained):

| Status | Meaning | Who acts next |
|--------|---------|---------------|
| `draft` | Work in progress, not visible publicly | Staff edits or submits |
| `submitted` | Awaiting review | Reviewer approves or requests revision |
| `needs_revision` | Returned to staff with comments | Staff edits and re-submits |
| `approved` | Published to public dashboard views | Immutable except admin archive/correction |
| `archived` | Superseded or withdrawn; excluded from public views | Admin only |

### Workflow transitions

```text
draft ──submit──► submitted ──approve──► approved
                     │
                     └──request revision──► needs_revision ──edit──► draft ──submit──► submitted

approved ──admin archive──► archived
```

**Publishing rule:** Public dashboard views include `status = approved` only.

**Staff constraint:** Staff cannot transition directly to `approved`.

---

## Correction Model

Approved values **must not be silently overwritten**.

### Rules

1. **Immutability:** Once `approved`, numeric `value`, `metric_type_id`, `department_id`, `year`, and `month` cannot be changed by staff or reviewers. A database trigger enforces this; only `admin` may archive an approved row.
2. **Replacement workflow:** To correct an approved value:
   - Admin sets the original entry to `archived` (preserves audit history).
   - Staff creates a **new** entry for the same `(metric_type_id, department_id, year, month)` in `draft`.
   - Entry follows normal submit → review → approve path.
3. **Uniqueness:** Active rows are unique on `(metric_type_id, department_id, year, month)` among non-archived entries. Archiving releases the slot for the replacement row.
4. **Audit trail:** All status transitions and value changes are recorded in `audit_logs` with `before` / `after` JSON snapshots. Corrections are traceable, not destructive edits.
5. **Review comments:** Reviewer feedback stays in `review_comments`, never embedded in numeric fields.

```text
approved (original) ──admin archive──► archived
       │
       └── new draft entry ──workflow──► approved (replacement)
```

---

## Metric Units

Canonical units align with `src/data/generated/*.json` and GO-DATA-1.

| Code | Metric | Unit | Notes |
|------|--------|------|-------|
| `energy` | Electricity | `kWh` | Confirmed |
| `water` | Water | `m³` | Confirmed |
| `fuel` | Fuel | `L` | Confirmed |
| `paper` | Paper | `kg` | Confirmed |
| `waste` | Waste / recycling | `%` | **REVIEW_REQUIRED** — aggregation is average, not sum |
| `ghg` | Greenhouse gas | `tCO2e` | **REVIEW_REQUIRED** — direct entry vs formula-derived TBD |

Unresolved units are seeded with review flags; do not treat as final production policy until PO confirms.

---

## Privacy & Data Minimization

| Decision | Rationale |
|----------|-----------|
| Public views exclude email, user IDs, staff notes, review comments, audit metadata | Prevent PII and internal commentary on anonymous dashboard |
| `audit_logs` omit raw IP addresses, browser fingerprints, persistent device IDs | Operational traceability without surveillance data |
| `profiles` not exposed to anon or public views | Auth metadata stays internal |
| `note` on entries excluded from public views | Staff context may contain internal detail |
| `external_evidence_links` store URLs/IDs only | No file bytes in Supabase |

---

## Document Center Boundary

`external_evidence_links` is a **reference-only bridge** to the separate M365-backed Document Center.

| In scope | Out of scope |
|----------|--------------|
| URL, external `document_id`, label, `source_system` | File upload, blob storage, versioning |
| Link from approved metric entry to evidence record | Permission model for documents |
| Created-by audit on link row | SharePoint/OneDrive integration |

Evidence files, permissions, and versioning remain in Document Center (ADR-002). Supabase stores pointers only.

---

## Tables

### `departments`

Organizational units responsible for monthly data entry.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `code` | `text` UNIQUE NOT NULL | Stable key, e.g. `FAC-ENG` |
| `name_th` | `text` NOT NULL | Thai display name |
| `name_en` | `text` | English display name |
| `parent_id` | `uuid` FK → `departments(id)` | Nullable hierarchy |
| `is_active` | `boolean` DEFAULT `true` | Inactive excluded from new entries |
| `created_at`, `updated_at` | `timestamptz` | Auto-maintained |

**Relationships:** Parent/child hierarchy. Referenced by `profiles.department_id`, `monthly_metric_entries.department_id`.

**Uniqueness:** `code` globally unique.

---

### `profiles`

Application user metadata linked to Supabase Auth (`auth.users`).

| Field | Type | Notes |
|-------|------|-------|
| `id` | `uuid` PK | FK → `auth.users(id)` |
| `email` | `text` NOT NULL | From auth; not public |
| `full_name` | `text` | Optional display name |
| `role` | `text` NOT NULL | `admin`, `staff`, `reviewer`, `viewer` |
| `department_id` | `uuid` FK → `departments(id)` | Staff assignment |
| `is_active` | `boolean` DEFAULT `true` | Deactivated users blocked by RLS |
| `created_at`, `updated_at` | `timestamptz` | Auto-maintained |

**Relationships:** One profile per auth user. Workflow actor columns on entries reference `profiles(id)`.

**Uniqueness:** `id` matches auth user (1:1).

---

### `metric_types`

Environmental metric catalog.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `uuid` PK | |
| `code` | `text` UNIQUE NOT NULL | `energy`, `water`, `fuel`, `paper`, `waste`, `ghg` |
| `label_th`, `label_en` | `text` | Bilingual labels |
| `unit` | `text` NOT NULL | See metric units table |
| `sort_order` | `integer` NOT NULL | Dashboard ordering |
| `is_active` | `boolean` DEFAULT `true` | |
| `config_metadata` | `jsonb` | Optional display/aggregation hints |
| `created_at`, `updated_at` | `timestamptz` | |

**Relationships:** Referenced by `monthly_metric_entries`, `metric_formulas`.

**Uniqueness:** `code` globally unique.

---

### `monthly_metric_entries`

Monthly submitted environmental values and workflow state.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `uuid` PK | |
| `metric_type_id` | `uuid` FK NOT NULL | RESTRICT on delete |
| `department_id` | `uuid` FK NOT NULL | RESTRICT on delete |
| `year` | `integer` NOT NULL | Buddhist era year |
| `month` | `integer` NOT NULL | 1–12 |
| `value` | `numeric` NOT NULL | `>= 0` |
| `note` | `text` | Internal; not in public views |
| `status` | `text` NOT NULL DEFAULT `draft` | See status model |
| `submitted_at`, `submitted_by` | `timestamptz`, `uuid` | Set on submit |
| `approved_at`, `approved_by` | `timestamptz`, `uuid` | Set on approve |
| `created_by`, `updated_by` | `uuid` FK → `profiles` | Audit actors |
| `created_at`, `updated_at` | `timestamptz` | |

**Relationships:** Belongs to `metric_types`, `departments`. Has many `review_comments`, `external_evidence_links`.

**Uniqueness:** `(metric_type_id, department_id, year, month)` among active (non-archived) rows.

**Indexes:** `metric_type_id`, `department_id`, `(year, month)`, `status`, `approved_at`.

**FK deletion:** RESTRICT on metric/department; prevents orphaning active entries.

---

### `review_comments`

Reviewer feedback separated from numeric data.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `uuid` PK | |
| `monthly_metric_entry_id` | `uuid` FK NOT NULL | CASCADE on entry delete |
| `comment` | `text` NOT NULL | |
| `created_by` | `uuid` FK → `profiles` NOT NULL | |
| `created_at` | `timestamptz` DEFAULT `now()` | |

**Relationships:** Many comments per entry. Not exposed in public views.

---

### `audit_logs`

Traceability for data and workflow changes.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `uuid` PK | |
| `actor_id` | `uuid` FK → `profiles` | Nullable for system events |
| `entity_type` | `text` NOT NULL | e.g. `monthly_metric_entry` |
| `entity_id` | `uuid` NOT NULL | |
| `action` | `text` NOT NULL | e.g. `insert`, `update`, `status_change`, `archive` |
| `before`, `after` | `jsonb` | State snapshots |
| `request_id` | `text` | Nullable correlation ID |
| `source` | `text` | e.g. `admin_ui`, `trigger` |
| `metadata` | `jsonb` | Extra context; no IP/fingerprint |
| `created_at` | `timestamptz` DEFAULT `now()` | |

**Relationships:** Polymorphic reference via `entity_type` + `entity_id`.

**Privacy:** No raw IP, browser fingerprint, or device identifier storage.

**Population:** Audit triggers on INSERT/UPDATE for protected tables; meaningful archive events.

---

### `organization_settings`

Office-wide configuration key-value store.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `uuid` PK | |
| `setting_key` | `text` UNIQUE NOT NULL | e.g. `dashboard.current_year` |
| `value` | `jsonb` NOT NULL | Structured value |
| `description` | `text` | Admin documentation |
| `is_public` | `boolean` DEFAULT `false` | When true, safe for public metadata views |
| `updated_by` | `uuid` FK → `profiles` | |
| `created_at`, `updated_at` | `timestamptz` | |

**Uniqueness:** `setting_key` globally unique.

**Examples:** Current reporting year, completeness thresholds, feature flags.

---

### `metric_formulas`

Optional derived-metric rules (e.g. GHG from activity data).

| Field | Type | Notes |
|-------|------|-------|
| `id` | `uuid` PK | |
| `metric_type_id` | `uuid` FK → `metric_types` | Target metric |
| `formula_code` | `text` NOT NULL | Stable identifier |
| `config` | `jsonb` NOT NULL | Formula parameters / expression metadata |
| `result_unit` | `text` NOT NULL | Expected output unit |
| `effective_from` | `date` NOT NULL | |
| `effective_to` | `date` | Nullable = open-ended |
| `is_active` | `boolean` DEFAULT `true` | |
| `created_at`, `updated_at` | `timestamptz` | |

**Relationships:** Optional many formulas per metric type over time.

**Note:** GHG direct entry vs calculation remains **REVIEW_REQUIRED**.

---

### `notifications`

In-app alerts for workflow events.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `uuid` PK | |
| `recipient_id` | `uuid` FK → `profiles` NOT NULL | |
| `notification_type` | `text` NOT NULL | e.g. `entry_submitted`, `revision_requested` |
| `title`, `body` | `text` NOT NULL | |
| `entity_type`, `entity_id` | `text`, `uuid` | Linked record |
| `read_at` | `timestamptz` | Null = unread |
| `created_at` | `timestamptz` DEFAULT `now()` | |

**Relationships:** Recipient reads/updates own notifications only (RLS).

---

### `dashboard_cache`

Optional precomputed dashboard payloads.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `uuid` PK | |
| `cache_key` | `text` UNIQUE NOT NULL | e.g. `executive_summary:2569` |
| `payload` | `jsonb` NOT NULL | Cached API-shaped data |
| `source_updated_at` | `timestamptz` | Max `updated_at` of source rows |
| `generated_at` | `timestamptz` NOT NULL | |
| `expires_at` | `timestamptz` | TTL |

**Usage:** Admin/system refresh only. Public clients prefer views or repository layer with static fallback.

---

### `external_evidence_links`

Reference-only links from metric entries to Document Center evidence.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `uuid` PK | |
| `monthly_metric_entry_id` | `uuid` FK NOT NULL | |
| `document_id` | `text` | Nullable external ID in Document Center |
| `document_url` | `text` NOT NULL | HTTPS URL to evidence |
| `label` | `text` | Display label |
| `source_system` | `text` NOT NULL | e.g. `document_center`, `sharepoint` |
| `created_by` | `uuid` FK → `profiles` | |
| `created_at` | `timestamptz` DEFAULT `now()` | |

**Boundary:** Links only — no upload, copy, version, or permission management in Supabase.

---

## Public Views

Defined in migration `202607260004`. All use `security_invoker = true` and filter `status = approved`.

| View | Purpose |
|------|---------|
| `public_dashboard_monthly_metrics` | Row-level approved metrics for dashboard charts |
| `public_dashboard_executive_summary` | Per-metric/year aggregates |
| `public_dashboard_metadata` | Last updated, counts, completeness hints |

See [API Contract v1](./API_CONTRACT.md) for consumer field mapping.

---

## Migration Order

```text
202607260001_create_core_tables.sql
202607260002_create_supporting_tables.sql
202607260003_create_indexes_and_constraints.sql
202607260004_create_public_dashboard_views.sql
202607260005_enable_rls_and_policies.sql
202607260006_create_audit_functions.sql
```

---

## Related Documents

- [RLS Policy Reference](./RLS_POLICY.md)
- [API Contract v1](./API_CONTRACT.md)
- [Supabase README](../../supabase/README.md)
- [GO-DATA-1 Data Contract](../data/GO-DATA-1-DATA-CONTRACT.md)
