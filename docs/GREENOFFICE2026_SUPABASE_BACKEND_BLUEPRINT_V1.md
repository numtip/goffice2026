# GREEN OFFICE 2026 - SUPABASE BACKEND BLUEPRINT V1.0

**Project:** Green Office 2026 - Environmental Performance Backend Extension  
**Repository:** `numtip/goffice2026`  
**Status:** PLANNED REFERENCE - PO scope direction captured  
**Version:** 1.0  
**Updated:** 2026-07-26  
**Parent Blueprint:** `docs/GREENOFFICE2026_PLATFORM_BLUEPRINT_V3.md`

---

## 1. Purpose

This document defines the approved direction for adding Supabase to Green Office 2026.

Supabase is not intended to replace the current Astro static-first platform. It is introduced only for operational backend capabilities that must change monthly or require authenticated staff workflow.

Primary goals:

1. Allow staff to enter monthly environmental performance data directly.
2. Store 2569+ operational data in a controlled database.
3. Let dashboards update from approved data without rebuilding the public website.

Non-goals:

1. Do not move the whole public site into Supabase.
2. Do not build the Document Center inside goffice2026.
3. Do not add file upload or evidence document management to Supabase in this phase.
4. Do not expose draft or unapproved data on the public dashboard.

---

## 2. Architecture Decision

Use Supabase as a limited backend for:

- authentication
- staff data entry
- monthly environmental metrics
- submission and approval workflow
- public-safe dashboard data views
- audit history for operational data changes

Keep Astro as the public portal:

- landing page
- dashboard UI
- categories and indicators
- evidence discovery pages
- public documents entry
- static fallback data

Keep Document Center separate:

- document upload
- evidence files
- versioning
- permissions
- file metadata
- Microsoft 365 / SharePoint / OneDrive integration

```text
Staff / Reviewer
  -> /admin/data-entry
  -> Supabase Auth
  -> monthly_metric_entries
  -> submitted / approved workflow

Public Visitor
  -> /dashboard
  -> public approved metrics view
  -> live data from Supabase where required
  -> static JSON fallback when unavailable

Document Center
  -> separate M365-backed project
  -> linked from goffice2026 only
```

---

## 3. System Boundary

### In Scope For Supabase

| Capability | Reason |
|------------|--------|
| Staff login | Required for controlled monthly data updates |
| Monthly data entry | 2569 data must be updated every month |
| Data validation metadata | Each value needs year, month, metric, department, status, and owner |
| Submission workflow | Staff entries should not publish immediately |
| Approval workflow | Dashboard should show approved values only |
| Audit log | Operational performance data must be traceable |
| Public dashboard views | Dashboard needs current approved data without rebuild |

### Out Of Scope For Supabase In This Phase

| Capability | Reason |
|------------|--------|
| Evidence file upload | Managed by separate Document Center |
| Document versioning | Managed by separate Document Center |
| SharePoint / OneDrive storage | Separate M365-backed project |
| Full CMS | Current content model remains static-first |
| Public page editing | Astro content remains file-based |
| Real-time collaboration | Not required for monthly data entry |

---

## 4. Target User Roles

| Role | Purpose | Initial Permissions |
|------|---------|---------------------|
| `admin` | System owner | Manage users, departments, metrics, all entries |
| `staff` | Data owner | Create and edit own department draft entries |
| `reviewer` | Quality control | Review submitted entries, approve, request revision |
| `viewer` | Internal read-only user | View approved and submitted data where allowed |
| `public` | Anonymous website visitor | Read approved dashboard data only |

Role rules:

1. Staff can create monthly entries for assigned departments.
2. Staff can edit `draft` and `needs_revision` entries before approval.
3. Reviewer can move entries from `submitted` to `approved` or `needs_revision`.
4. Public users can read approved dashboard views only.
5. No public user can read profiles, internal notes, draft values, or audit logs.

---

## 5. Data Workflow

```text
draft
  -> submitted
  -> approved
  -> published on dashboard

submitted
  -> needs_revision
  -> draft
  -> submitted

approved
  -> correction_requested
  -> corrected replacement entry
  -> approved
```

Publishing rule:

```text
Public dashboard reads status = approved only.
```

Operational rule:

```text
2568 baseline data may remain static JSON.
2569+ current-year data should come from Supabase after approval.
```

Fallback rule:

```text
If Supabase is unavailable, dashboard may display the latest generated JSON snapshot with a visible "last updated" timestamp.
```

---

## 6. Initial Database Model

Supabase uses PostgreSQL. The canonical database structure should be kept as SQL migration files in:

```text
supabase/migrations/
```

### 6.1 profiles

Stores application user metadata linked to Supabase Auth.

```text
profiles
- id uuid primary key references auth.users(id)
- email text not null
- full_name text
- role text not null
- department_id uuid references departments(id)
- is_active boolean not null default true
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()
```

### 6.2 departments

Stores organizational units responsible for monthly data.

```text
departments
- id uuid primary key
- code text unique not null
- name_th text not null
- name_en text
- is_active boolean not null default true
- created_at timestamptz not null default now()
```

### 6.3 metric_types

Stores supported environmental metrics.

```text
metric_types
- id uuid primary key
- code text unique not null
- label_th text not null
- label_en text
- unit text not null
- sort_order integer not null
- is_active boolean not null default true
```

Initial metric codes:

| Code | Metric | Unit |
|------|--------|------|
| `energy` | Electricity | `kWh` |
| `water` | Water | `m3` |
| `fuel` | Fuel | `L` |
| `paper` | Paper | `kg` |
| `waste` | Waste / recycling | `kg` or `%` depending on confirmed metric |
| `ghg` | Greenhouse gas | `kgCO2e` or `tCO2e` depending on confirmed dashboard unit |

### 6.4 monthly_metric_entries

Stores monthly submitted values.

```text
monthly_metric_entries
- id uuid primary key
- metric_type_id uuid not null references metric_types(id)
- department_id uuid not null references departments(id)
- year integer not null
- month integer not null check (month between 1 and 12)
- value numeric not null check (value >= 0)
- note text
- status text not null default 'draft'
- submitted_at timestamptz
- submitted_by uuid references profiles(id)
- approved_at timestamptz
- approved_by uuid references profiles(id)
- created_by uuid not null references profiles(id)
- updated_by uuid references profiles(id)
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()
```

Recommended uniqueness:

```text
unique(metric_type_id, department_id, year, month)
```

Recommended statuses:

```text
draft
submitted
needs_revision
approved
archived
```

### 6.5 review_comments

Stores reviewer feedback without mixing comments into numeric data.

```text
review_comments
- id uuid primary key
- monthly_metric_entry_id uuid not null references monthly_metric_entries(id)
- comment text not null
- created_by uuid not null references profiles(id)
- created_at timestamptz not null default now()
```

### 6.6 audit_logs

Stores traceability events for data changes and workflow transitions.

```text
audit_logs
- id uuid primary key
- actor_id uuid references profiles(id)
- entity_type text not null
- entity_id uuid not null
- action text not null
- before jsonb
- after jsonb
- created_at timestamptz not null default now()
```

---

## 7. Public Dashboard Data Contract

The public dashboard should not query internal tables directly. Create a public-safe view for approved metrics.

Recommended view:

```text
public_dashboard_monthly_metrics
- metric_code
- metric_label_th
- metric_label_en
- unit
- department_code
- department_name_th
- year
- month
- value
- approved_at
- updated_at
```

Rules:

1. Include approved rows only.
2. Exclude staff notes unless explicitly approved for public display.
3. Exclude user email and profile data.
4. Keep field names close to the existing dashboard JSON model where practical.
5. Preserve `src/data/generated/*.json` as baseline and fallback.

---

## 8. Astro Integration Plan

### Phase 1 - Backend Foundation

1. Add `supabase/` folder.
2. Create SQL migrations for tables, views, indexes, and RLS.
3. Configure Supabase project URL and anon key in environment variables.
4. Keep service-role keys out of the frontend and out of git.

### Phase 2 - Admin Data Entry

1. Add `/admin/login`.
2. Add `/admin/data-entry`.
3. Let staff select metric, year, month, department, value, and note.
4. Add submit action.
5. Validate duplicate month entries and invalid values.

### Phase 3 - Review Workflow

1. Add `/admin/review`.
2. Let reviewers filter submitted entries.
3. Support approve and request revision.
4. Capture review comments.
5. Record audit log events.

### Phase 4 - Live Dashboard

1. Add a Supabase dashboard data client.
2. Read approved values from `public_dashboard_monthly_metrics`.
3. Merge live 2569+ data with static 2568 baseline data.
4. Show last updated timestamp and data completeness.
5. Keep static JSON fallback.

### Phase 5 - Release Hardening

1. Add environment documentation.
2. Add smoke checks for dashboard data loading.
3. Verify GitHub Pages preview behavior.
4. Verify production VPS environment variables.
5. Confirm no draft data is visible publicly.

---

## 9. Environment Variables

Frontend-safe variables:

```text
PUBLIC_SUPABASE_URL
PUBLIC_SUPABASE_ANON_KEY
PUBLIC_DASHBOARD_DATA_MODE
```

Server-only variables, if later needed outside GitHub Pages:

```text
SUPABASE_SERVICE_ROLE_KEY
```

Rules:

1. `PUBLIC_SUPABASE_ANON_KEY` may be used in the browser, but RLS must protect data.
2. `SUPABASE_SERVICE_ROLE_KEY` must never be exposed to the browser.
3. GitHub Pages can use public environment variables at build time, but it cannot run backend code.
4. The public dashboard must still work when deployed as static files.

---

## 10. Security And RLS Principles

Row Level Security is mandatory.

Required policies:

1. Public can read approved dashboard view only.
2. Staff can read and write own assigned department entries.
3. Staff cannot approve entries.
4. Reviewer can read submitted entries and approve or request revision.
5. Admin can manage operational tables.
6. Audit logs are admin/reviewer readable only.
7. Profiles are not publicly readable.

Validation principles:

1. Validate year and month.
2. Validate metric code and unit.
3. Prevent duplicate approved values for the same metric, department, year, and month.
4. Prevent direct transition from draft to approved by staff.
5. Preserve audit history for corrections.

---

## 11. Deployment Model

```text
Local development
  -> F:\projectAi\goffice2026
  -> Supabase local or dev cloud project

Preview
  -> GitHub Pages
  -> Supabase dev/staging project

Production
  -> greenoffice.mju.ac.th
  -> Supabase production project
```

GitHub Pages remains preview-only unless a separate production decision changes that rule.

Production release remains:

```text
GitHub source of truth
  -> preview QA
  -> PO approval
  -> manual deploy to greenoffice.mju.ac.th
```

---

## 12. Migration And Source Control Rules

1. Store database schema changes in `supabase/migrations/`.
2. Commit migration files to git.
3. Do not make untracked production-only schema changes in Supabase Studio.
4. Use Supabase Studio for inspection and emergency review, not as the primary source of truth.
5. Keep seed data separate from production operational data.
6. Document each schema change in the migration filename and comments.

Recommended future structure:

```text
supabase/
  migrations/
  seed.sql
  README.md

src/
  lib/
    supabase/
  pages/
    admin/
```

---

## 13. Open Questions Before Implementation

**Resolved by [§17 Decision Baseline v1](#17-decision-baseline-v1)** (2026-07-26). Summary:

| # | Question | Frozen answer |
|---|----------|---------------|
| 1 | Which departments enter each metric? | One **owner department** per metric via `metrics.owner_department_map` |
| 2 | Whole office or department value? | **Office-wide** published value; department = data owner only |
| 3 | Waste kg vs recycling %? | **`waste` = kg**, **`recycling_rate` = %** (separate codes) |
| 4 | GHG direct or calculated? | **Calculated** from activity data via `metric_formulas` |
| 5 | Reviewer per metric? | **One reviewer per metric** via `workflow.metric_reviewer_map` |
| 6 | Edit approved values? | **No** — archive + replacement workflow only |
| 7 | First live dashboard route? | Deferred to GO-BE-2 (default remains static mode) |

---

## 14. Implementation Readiness Checklist

- [ ] Supabase project selected: dev/staging/production
- [ ] Admin owner account defined
- [ ] Staff role and department list confirmed
- [ ] Metric units confirmed
- [ ] Approval workflow confirmed
- [ ] Public dashboard data contract confirmed
- [ ] Environment variable names confirmed
- [ ] Migration files created
- [ ] RLS policies tested
- [ ] Dashboard fallback behavior tested
- [ ] No Document Center upload scope added to this phase

---

## 15. Summary Decision

Use Supabase as the operational backend for monthly environmental data only.

Greenoffice2026 remains an Astro public platform. Supabase adds the minimum backend needed for staff data entry, approval workflow, and live approved dashboard values. Document management remains a separate system.

Canonical phrase:

> Supabase powers the back office workflow; Astro remains the public Green Office platform.

---

## 16. Implementation Foundation Amendment

**Date:** 2026-07-26  
**Status:** foundation-ready / planned — **NOT live**  
**Supersedes:** none (extends §1–§15; all prior non-goals remain in force)

This amendment records the implementation foundation agreed for Worker E and downstream build phases. No Supabase project, migrations, or live dashboard mode are deployed by this document alone.

### 16.1 Architecture Decision Records

Canonical ADRs live in `docs/architecture/adr/`:

| ADR | Decision |
|-----|----------|
| [ADR-001](./architecture/adr/ADR-001-ASTRO-STATIC-FIRST.md) | Astro remains the static-first public platform |
| [ADR-002](./architecture/adr/ADR-002-DOCUMENT-CENTER-BOUNDARY.md) | Document Center is M365-backed; evidence stays separate |
| [ADR-003](./architecture/adr/ADR-003-SUPABASE-OPERATIONAL-BACKEND.md) | Supabase is operational backend only |
| [ADR-004](./architecture/adr/ADR-004-LIVE-DASHBOARD-WITH-STATIC-FALLBACK.md) | Live approved metrics with static JSON fallback; default static mode |

Implementation must align with ADR decisions before enabling live dashboard mode or production Supabase.

### 16.2 Repository Layer

```text
supabase/
  migrations/          # timestamped SQL; schema source of truth
  seed.sql             # dev/staging seed only
  README.md

src/
  lib/
    supabase/          # client, types, dashboard data helpers
  pages/
    admin/             # login, data-entry, review (authenticated)
  data/
    generated/         # static JSON snapshots and 2568 baseline

docs/
  architecture/
    adr/               # accepted decisions (this amendment's ADR set)
```

Rules:

1. Commit all schema changes as timestamped migration files; no untracked production-only DDL.
2. Keep service-role keys and secrets out of git and out of browser bundles.
3. Admin routes are authenticated surfaces; public Astro pages remain static-first per ADR-001.

### 16.3 Department Hierarchy

Extend the flat `departments` model (§6.2) with optional hierarchy for reporting roll-up:

```text
departments
- parent_department_id uuid references departments(id) nullable
- level integer not null default 0
- path text                    # materialized path for tree queries, e.g. /root/dept-a/
```

Initial rollout may use a flat list; hierarchy columns are foundation-ready for executive roll-up and scoped staff assignment. Staff entries remain tied to a single `department_id`; reviewers may span parent units when configured.

### 16.4 Organization Settings

Single-row or keyed settings table for operational configuration without code deploy:

```text
org_settings
- key text primary key
- value jsonb not null
- updated_at timestamptz not null default now()
- updated_by uuid references profiles(id)
```

Planned keys (examples):

| Key | Purpose |
|-----|---------|
| `fiscal_year_start_month` | Align monthly entry windows with institutional FY |
| `default_reviewer_department_map` | Metric or department → reviewer routing |
| `dashboard_data_mode_default` | Org default: `static` until PO enables live |
| `notification_channels` | Email or webhook targets for workflow events |
| `external_evidence_base_url` | Document Center base URL for link resolution |

Public visitors do not read `org_settings`; RLS restricts to admin (and selected keys to reviewer where needed).

### 16.5 Metric Formulas

Derived metrics (especially GHG) may be calculated rather than manually entered when PO confirms formulas:

```text
metric_formulas
- id uuid primary key
- output_metric_type_id uuid references metric_types(id)
- formula_expression text not null    # documented DSL or SQL view name
- input_metric_codes text[] not null
- effective_from date not null
- is_active boolean not null default true
```

Rules:

1. Manual entry remains primary for phase 1; formulas are opt-in per metric after unit confirmation (§13 open questions).
2. Calculated values follow the same draft → submitted → approved workflow; store provenance in audit metadata.
3. Dashboard merge logic treats approved calculated rows identically to manual approved rows.

### 16.6 Notifications

Lightweight workflow notifications — not a full messaging product:

| Event | Recipients | Channel (planned) |
|-------|------------|-------------------|
| Entry submitted | Assigned reviewer(s) | Email or institutional webhook |
| Revision requested | Entry author (staff) | Email or webhook |
| Entry approved | Optional staff copy; triggers cache invalidation signal | Email / internal hook |
| Correction requested on approved row | Reviewer + admin | Email / webhook |

Implementation options (foundation-ready, not live):

- Supabase Database Webhooks or Edge Functions calling institutional SMTP/API
- No in-app chat; no public notification feed
- Notification preferences stored under `org_settings` or per-profile flags (admin-managed)

### 16.7 Dashboard Cache

Reduce repeated Supabase reads and support static hosting:

1. **Browser cache** — short TTL on live approved-metrics fetch; respect `approved_at` / `updated_at` for staleness display.
2. **Generated snapshot** — optional build or scheduled job writes `src/data/generated/dashboard-live-snapshot.json` from approved view for fallback and GitHub Pages parity.
3. **Mode switch** — `PUBLIC_DASHBOARD_DATA_MODE`: `static` (default) | `live` | `auto` (live with fallback per ADR-004).

Cache invalidation trigger: on approval, bump snapshot version or enqueue snapshot regeneration; public site must not serve draft cache entries.

### 16.8 External Evidence Links

Per ADR-002, evidence files stay in Document Center (M365). Goffice2026 stores links only:

```text
external_evidence_links
- id uuid primary key
- indicator_code text
- title_th text not null
- title_en text
- document_center_url text not null
- sort_order integer not null default 0
- is_active boolean not null default true
```

Astro evidence discovery pages consume static Markdown/JSON at build time; optional Supabase-backed link registry is admin-maintained and exported to static JSON for public render. No file upload in this repo.

### 16.9 API v1 (Operational, Authenticated)

Minimal REST/RPC surface for admin clients and future automation — **not** a public CMS API:

| Area | Methods | Auth |
|------|---------|------|
| `/api/v1/entries` | CRUD draft/submit for staff scope | JWT (staff+) |
| `/api/v1/review` | List submitted, approve, request revision | JWT (reviewer+) |
| `/api/v1/metrics/approved` | Read approved aggregates | anon + RLS (public view) |
| `/api/v1/departments` | Read tree; admin write | role-scoped |
| `/api/v1/org-settings` | Admin read/write | JWT (admin) |

Prefer Supabase PostgREST + RLS for v1 where sufficient; add Edge Functions only for notifications or snapshot export. Version prefix `/api/v1/` reserved for breaking-change discipline.

### 16.10 Audit Minimization

Audit everything required for accountability; avoid logging noise:

**Log (required):**

- Status transitions (`draft` → `submitted` → `approved`, etc.)
- Value changes on entries while in editable states
- Approval and correction-request actions with actor and timestamp
- Admin changes to departments, metric types, org settings, formulas

**Do not log:**

- Public dashboard read queries
- Failed login attempts beyond Supabase Auth defaults (no duplicate PII store)
- Document Center link clicks
- Full row snapshots on no-op updates

Store `before` / `after` jsonb selectively: changed fields only when practical. Retention policy TBD with PO; foundation assumes indefinite operational retention unless superseded.

### 16.11 Timestamped Migrations

All schema changes use Supabase CLI naming:

```text
supabase/migrations/YYYYMMDDHHMMSS_description.sql
```

Each migration file must include:

1. Up DDL (tables, views, indexes, RLS policies, grants)
2. Comment header: author, date, ADR/blueprint section reference
3. Idempotent guards where safe (`if not exists`)

Apply order: local → dev/staging → production after RLS smoke tests. Rollback via forward-fix migration, not untracked Studio edits.

### 16.12 Non-Goals Preserved

This amendment does **not** change §1 non-goals:

1. Do not move the whole public site into Supabase.
2. Do not build the Document Center inside goffice2026.
3. Do not add file upload or evidence document management to Supabase in this phase.
4. Do not expose draft or unapproved data on the public dashboard.

### 16.13 Foundation Readiness Statement

| Item | State |
|------|-------|
| ADR set | Accepted (docs only) |
| Repository layout | Defined |
| Extended schema concepts | Planned (migrations not applied) |
| Live dashboard | Disabled by default (`static` mode) |
| Supabase project | Not required for this amendment |
| Production deploy | Unchanged — manual VPS after PO approval |

**Next gate before live:** Migrations applied and RLS tested; dashboard fallback smoke-tested per §14 checklist. Business decisions frozen in §17.

---

## 17. Decision Baseline v1

**Date:** 2026-07-26  
**Status:** ACCEPTED — frozen for GO-BE-2 implementation  
**Scope:** Documentation only; no SQL changes in GO-BE-2A

Canonical phrase unchanged:

> Supabase powers the back-office workflow; Astro remains the public Green Office platform.

### 17.1 Metric ownership

| Decision | Detail |
|----------|--------|
| Publication | **Office-wide** — one approved dashboard value per metric, year, and month |
| Department role | **`department_id` = data owner only** — entry accountability and RLS scope, not a public split dimension |
| Configuration | `organization_settings.metrics.owner_department_map`, `metric_types.config_metadata.publication_scope = "office_wide"`, `owner_department_code` per metric |

### 17.2 Metric definitions

| Code | Unit | Entry mode |
|------|------|------------|
| `energy`, `water`, `fuel`, `paper` | kWh, m³, L, kg | Staff manual monthly entry |
| `waste` | **kg** (mass) | Staff manual monthly entry |
| `recycling_rate` | **%** | Staff manual monthly entry (separate from waste mass) |
| `ghg` | **tCO2e** | **Derived** from activity metrics via `metric_formulas`; manual entry disallowed |

Current seed CHECK constraints still reflect the 6-metric GO-BE-1 catalog; GO-BE-2 will update constraints and seed without new tables.

### 17.3 Workflow

| Decision | Detail |
|----------|--------|
| States | `draft` → `submitted` → `approved` (or `needs_revision` loop) |
| Immutability | Approved values cannot be edited by staff or reviewers |
| Correction | Admin **archives** original; staff creates **replacement** draft; full review repeats |
| Reviewers | **One reviewer per metric** — `organization_settings.workflow.metric_reviewer_map` |

RLS and triggers from migrations 003/005/007 support this model. Partial unique index and per-metric reviewer enforcement are GO-BE-2 migration tasks.

### 17.4 Implementation status (GO-BE-2B)

Implemented in migration `202607260008`:

1. Partial unique index for archive + replacement
2. Seven-metric CHECK constraints and seed update
3. `is_assigned_reviewer()` + scoped reviewer policies
4. Owner-department filter on public views (fixed `OFFICE` public label)
5. Static JSON split (`waste.json` kg + `recycling_rate.json` %)

**Still PO-assigned:** reviewer profile UUIDs, SAMNG office-wide owner confirmation for energy/water/paper, live GHG formula activation (GO-BE-2D).

### 17.5 Related documents

- [Schema — Decision Baseline v1](./backend/SUPABASE_SCHEMA.md#decision-baseline-v1)
- [API Contract — Decision Baseline v1](./backend/API_CONTRACT.md#decision-baseline-v1)
- [RLS Policy](./backend/RLS_POLICY.md)
- ADR-003, ADR-004
