# RC-1 Gate — Subagent A: Architecture Audit

**Date:** 2026-07-27  
**Branch:** `rapid/rc-architecture`  
**Commit:** `61b5fa95d8664cf3a3deca8aa2fb1d73c3fbabbe` (`test(qa): validate content and evidence completion`)  
**Auditor:** Subagent A (Architecture RC Audit)  
**Scope:** Blueprint V4 compliance, ADR consistency, forbidden runtime patterns, constitution alignment, architecture doc coherence  
**Mode:** Audit only — no application behavior changes

---

## Verdict: **FAIL**

Runtime architecture aligns with Blueprint V4 and ADR-0001 (no M365 Approval Engine or transaction system in `src/`). The gate fails on **documented IA gaps**, **constitution–ADR drift**, and **architecture documentation inconsistencies** that must be reconciled before RC-1.

---

## Audit Matrix

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 1 | Blueprint V4 compliance | **PARTIAL** | Stack, scope, and most IA routes match; Contact/Feedback route missing |
| 2 | ADR-0001 Approval Engine removal | **PASS** | Accepted; referenced from V4, Master Reference, Content Architecture V2 |
| 3 | No V3 canonical refs in active code/config | **PASS** | Only historical catalog entry in `src/data/about/documents.json` |
| 4 | No Approval Engine / Transaction System in `src/` | **PASS** | No Power Automate, BPM, ERP, or transaction modules in runtime |
| 5 | Repository structure vs constitution | **PARTIAL** | Expected dirs present; constitution MVP §11–12 not updated for Supabase |
| 6 | Architecture doc consistency | **FAIL** | Stub overview, dual ADR numbering, phantom `src/lib/supabase/` reference |

---

## Major Risks

### R1 — Blueprint IA gap: Contact / Feedback route not implemented

Blueprint V4 §6 canonical IA includes `CONTACT / FEEDBACK`. Content Architecture V2 defines `/feedback`. Content model declares the route:

- `G:/ProjectAI/goffice2026/src/data/about/pages.json` — `about-feedback` → `/about/feedback/` (TH/EN)

No corresponding Astro pages exist under `src/pages/about/` or `src/pages/en/about/` (six About pages present; feedback absent).

**Impact:** IA non-compliance; broken navigation if linked from content inventory.

### R2 — Constitution vs accepted ADR-003 (Supabase / PostgreSQL)

Constitution §11 MVP explicitly excludes Database, Authentication, RBAC, and Workflow Engine. §12 forbids PostgreSQL unless a written architectural decision is approved.

ADR-003 (`G:/ProjectAI/goffice2026/docs/architecture/adr/ADR-003-SUPABASE-OPERATIONAL-BACKEND.md`) is **ACCEPTED** and introduces Supabase (PostgreSQL) with submit/approve review workflow for monthly metrics.

**Impact:** Governance ambiguity — agents reading constitution alone may reject valid Supabase work or re-introduce forbidden patterns.

### R3 — Dual ADR numbering and incomplete architecture index

Two independent ADR namespaces coexist without cross-index:

| ID | Location | Subject |
|----|----------|---------|
| ADR-0001 | `G:/ProjectAI/goffice2026/docs/sharepoint/ADR-0001-remove-approval-engine.md` | Remove M365 Approval Engine |
| ADR-001 | `G:/ProjectAI/goffice2026/docs/architecture/adr/ADR-001-ASTRO-STATIC-FIRST.md` | Astro static-first public platform |

`G:/ProjectAI/goffice2026/docs/architecture/adr/README.md` indexes ADR-001–004 only; does not link ADR-0001.

**Impact:** Scope-decision ADR-0001 may be missed during architecture reviews; "ADR-001" ambiguous across docs.

---

## Required Fixes (before RC-1 architecture sign-off)

| Priority | Fix | Evidence |
|----------|-----|----------|
| P0 | Implement `/about/feedback/` and `/en/about/feedback/` routes (or demote from canonical IA with PO-approved ADR/content-arch update) | `src/data/about/pages.json`; missing pages under `src/pages/about/` |
| P0 | Update constitution §11–12 to cross-reference ADR-003 and ADR-0001; clarify Supabase is approved operational backend, M365 approval engine remains de-scoped | `G:/ProjectAI/goffice2026/docs/00-GREENOFFICE_PROJECT_CONSTITUTION.MD` |
| P1 | Expand `docs/architecture/adr/README.md` to index ADR-0001 (scope) separately from ADR-001–004 (implementation) | `docs/architecture/adr/README.md` |
| P1 | Expand `docs/architecture/ARCHITECTURE_OVERVIEW.md` and `DATA_FLOW.md` to reflect V4 + ADR-003/004 (currently one-line stubs) | `docs/architecture/ARCHITECTURE_OVERVIEW.md`, `DATA_FLOW.md` |
| P2 | Fix `docs/backend/README.md` — remove or mark as planned the reference to non-existent `src/lib/supabase/` | `docs/backend/README.md` § TypeScript Boundary |

---

## Evidence by Audit Item

### 1. Blueprint V4 compliance

**Canonical reference:** `G:/ProjectAI/goffice2026/docs/GREENOFFICE2026_PLATFORM_BLUEPRINT_V4.md` (ACTIVE, updated 2026-07-27)

| Blueprint requirement | Status | Evidence |
|-----------------------|--------|----------|
| Astro + Tailwind static-first | ✅ | `package.json`, `src/pages/`, ADR-001 |
| 6 resource dashboards + executive | ✅ | `src/pages/dashboard.astro`, `src/pages/dashboard/[id].astro`, EN mirrors |
| 7 categories / indicators / evidence | ✅ | `src/pages/categories/`, `src/pages/indicators/`, `src/pages/evidence*` |
| Document Center | ✅ | `src/pages/documents.astro`, `src/pages/documents/[id].astro` |
| About section | ✅ Partial | `src/pages/about/{index,policy,goals,committee,scope,action-plan}.astro` |
| News & Activities | ✅ | `src/pages/news/`, `src/pages/activities/` |
| Knowledge & Awareness | ✅ | `src/pages/knowledge/` |
| Search TH/EN | ✅ | `src/pages/search.astro`, `src/pages/en/search.astro` |
| Contact / Feedback | ❌ | Defined in content model; no page implementation |
| M365: Entra ID + SharePoint only | ✅ Documented | V4 §4.2–4.3; no runtime M365 approval code |
| Explicitly out of scope: approval engine, transactions | ✅ Runtime | No matches in `src/` for Power Automate, BPM, ERP, transaction |

**Note:** `recycling_rate` metric exists alongside six blueprint resources (`src/data/generated/recycling_rate.json`) — additive KPI, not a forbidden pattern.

### 2. ADR-0001 Approval Engine removal

| Check | Result |
|-------|--------|
| ADR-0001 status Accepted | ✅ `docs/sharepoint/ADR-0001-remove-approval-engine.md` |
| Referenced from Blueprint V4 | ✅ Line 9 |
| Referenced from Master Reference | ✅ `docs/GOFFICE2026_NEW_PROJECT_MASTER_REFERENCE.md` § Authority Order |
| M365 EPIC docs marked superseded/de-scoped | ✅ e.g. `docs/sharepoint/GO-M365-5-DETAILED-DESIGN.md`, `GO-M365-5.6-REUSE-ASSESSMENT.md` |
| SharePoint EPIC-03 report archived | ✅ `docs/sharepoint/GO-M365-6-EPIC-03-APPROVAL-ENGINE-REPORT.md` — DE-SCOPED per ADR-0001 |

**Distinction (not a violation):** ADR-003 approves **operational metric review workflow** in Supabase (staff submit → reviewer approve). This is distinct from the de-scoped **Power Automate multi-stage approval engine** (ADR-0001). Supabase workflow exists in migrations and test scripts only; not in public `src/` runtime.

### 3. V3 canonical references in active code/config

| Path | Finding |
|------|---------|
| `src/` | One historical catalog entry: `src/data/about/documents.json` lists `GREENOFFICE2026_PLATFORM_BLUEPRINT_V3.md` as a document asset (superseded file path). Does **not** declare V3 canonical. |
| `scripts/` | No V3 / BLUEPRINT_V3 references |
| `package.json` | No V3 references |
| `config/` | No V3 references |

V3 blueprint file status correctly set: `G:/ProjectAI/goffice2026/docs/GREENOFFICE2026_PLATFORM_BLUEPRINT_V3.md` — `SUPERSEDED BY V4`.

### 4. Approval Engine / Transaction System in runtime (`src/`)

| Pattern | `src/` matches |
|---------|----------------|
| `ApprovalEngine`, `approval-engine`, Power Automate | None |
| `TransactionSystem`, `transaction`, ERP, BPM | None |
| `supabase` client imports | None |
| `src/lib/supabase/` | Does not exist |

**Incidental "approval" strings (acceptable):**

- `TARGET_PENDING_APPROVAL` — KPI target governance status in generated JSON and `MetricDashboard.astro`
- `approvalStatus` — document metadata in `src/data/about/documents.json`
- `humanApprovalRequired` — evidence review queue flags in `src/data/evidence-review-queue.json`

These are content/data governance labels, not an approval engine implementation.

**Out of `src/` scope (informational):**

- `G:/ProjectAI/goffice2026/scripts/test-admin-e2e.mjs` — E2E for Supabase metric review workflow (ADR-003)
- `G:/ProjectAI/goffice2026/supabase/migrations/` — operational tables with review status columns

### 5. Repository structure vs constitution

**Top-level directories at HEAD:**

```
.cursor  .github  config  data  doc  docs  public  scripts  src  supabase
```

| Constitution expectation | Status |
|--------------------------|--------|
| GitHub as source of truth | ✅ |
| Astro frontend in repo | ✅ `src/` |
| Markdown/JSON/CSV data | ✅ `src/data/`, `data/` |
| Evidence in `public/documents/` | ✅ `public/documents/` |
| KB under `/docs/KB/` | ✅ (constitution §7) |
| No database in MVP (§11) | ⚠️ Supabase added via ADR-003; constitution not updated |
| Forbidden PostgreSQL (§12) | ⚠️ Supabase uses PostgreSQL; ADR-003 is the approved exception |

### 6. Architecture doc consistency

| Document | Issue |
|----------|-------|
| `docs/architecture/ARCHITECTURE_OVERVIEW.md` | Single-line stub; does not describe V4 pillars, Supabase boundary, or M365 scope |
| `docs/architecture/DATA_FLOW.md` | Single-line stub; omits Excel→JSON pipeline and ADR-004 live/static fallback |
| `docs/architecture/adr/README.md` | Missing ADR-0001 cross-link |
| `docs/backend/README.md` | References `src/lib/supabase/` and `src/lib/repositories/` — directories absent at HEAD |
| `docs/GOFFICE2026_NEW_PROJECT_MASTER_REFERENCE.md` | ✅ Updated to V4 authority order (2026-07-27) |
| `docs/GOFFICE2026_CONTENT_ARCHITECTURE_V2.md` | ✅ Parent reparented to V4; references ADR-0001 |

---

## Positive Findings

- Blueprint V4 is committed and marked ACTIVE CANONICAL REFERENCE.
- ADR-0001 correctly de-scopes GO-M365 EPIC-03–08; historical M365 design docs marked SUPERSEDED.
- Public runtime (`src/`) is clean: Astro SSG, static JSON data, no forbidden workflow/transaction code.
- Master Reference Pack authority order lists V4 first; V3 explicitly superseded.
- Core route parity (dashboard, categories, indicators, evidence, documents, search, news, activities, knowledge, about subset) is implemented TH/EN.

---

## Commit

No commit created — required fixes exceed trivial doc correction scope.

---

## Related Audits

- Prior reconciliation audit: `G:/ProjectAI/goffice2026/docs/audit/GOFFICE2026_V4_REPOSITORY_AUDIT.md` (HEAD at `e8dedb0`; superseded by this RC-1 gate audit at `61b5fa9`)
