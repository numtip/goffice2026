# GREEN OFFICE 2026 — PLATFORM BLUEPRINT V5.0

**Project:** Green Office 2026 — Environmental Communication & Assessment Evidence Platform  
**Repository:** `numtip/goffice2026`  
**Status:** ACTIVE — CANONICAL OPERATIONAL BASELINE  
**Updated:** 2026-08-10 (Asia/Bangkok)  
**Supersedes:** Blueprint V4.0 where inconsistent  
**Production baseline:** v1.5.0 / `c7966115c4540bf060e19800b3016119d2fa03f4`

---

## 1. Product Boundary

> Green Office 2026 is a public environmental communication, performance-visualisation, and assessment-evidence navigation platform. It is not an organisational transaction, approval, or document-management system.

The platform presents approved public information, helps users navigate from a Green Office criterion to supporting evidence, and directs authenticated documents to Microsoft 365. Document Center remains the document registry and document-management boundary.

**Out of scope:** approval workflows, custom CMS/admin backend, ERP-like processes, custom DMS features, runtime database on the VPS, microservices, queues, GraphQL, Redis, and Kubernetes. Any exception requires an ADR and Product Owner approval.

## 2. Operating Architecture

| Concern | Canonical implementation |
|---|---|
| Public frontend | Astro static site, Tailwind CSS, minimal client JavaScript |
| Public data | Markdown/MDX, JSON/CSV, generated JSON from validated Excel |
| Resource pipeline | Excel → normalize → validate → generated JSON → dashboard |
| Evidence files | SharePoint / OneDrive; access controlled there |
| Evidence navigation | Static metadata, canonical IDs, public-safe links and availability states |
| Preview | GitHub Pages — `https://numtip.github.io/goffice2026/` |
| Production | Linux VPS + Nginx — `https://goffice.mju.ac.th/` |
| Release model | Immutable release directory plus atomic `current` symlink cutover |

No public page may expose an unavailable local/spreadsheet path as a working file link. A missing file must render as unavailable, with truthful metadata retained where appropriate.

## 3. Information Model and User Journeys

The official taxonomy is **7 categories / 24 issues / 65 indicators**. The public evidence path is:

```text
Category → Indicator → Evidence metadata → authorised document access
```

Required journeys:

1. **Executive:** Dashboard → KPI/trend → interpretation → related evidence.
2. **Auditor:** Category or indicator → requirement/implementation summary → evidence status → authorised document access.
3. **Staff/public:** Landing/news/knowledge → action or outcome → relevant category/evidence.

Thai is the default public experience and English lives under `/en/`. Any feature that changes data interpretation, navigation, evidence status, or filtering must preserve TH/EN parity.

## 4. Production Capabilities at v1.5.0

| Capability | Operational state |
|---|---|
| Bilingual landing, about, communication and knowledge routes | Deployed |
| Executive and resource dashboards | Deployed; ECharts 6 experience and dashboard V2 work included |
| Taxonomy navigation | 7 / 24 / 65 structure deployed |
| Indicator and evidence hubs | Deployed with traceability markers and source-availability states |
| Evidence filters | Client-side query filters for category/indicator, including `?indicator=3.2.2` |
| Public-link safety | Deployed; unavailable sources do not render bogus `.xlsx` links |
| GitHub Pages preview and VPS production | Deployed from the v1.5.0 source baseline |
| Data sync | Separate controlled pipeline; not part of a release cutover |

## 5. Data and Evidence Truthfulness Rules

1. Resource KPIs come only from the validated generated dataset; components must not duplicate or invent KPI values.
2. Partial-year data must be labelled as partial, pending, or requiring verification; it must not be presented as a conclusive full-year outcome.
3. FY2569 water and electricity are publishable partial data through July; fuel and paper have no FY2569 input at this baseline. Waste/GHG FY2569 forms may be templates and are not evidence of completed data.
4. An evidence record is not verified merely because it belongs to a category. Indicator-level mapping must be explicit.
5. Only **10 of 65** indicators currently have direct indicator-level mapping. This is a completion gap, not a reason to hide or overstate the evidence centre.
6. SharePoint permission, version history, and document access remain governed by Microsoft 365, not the public site.

## 6. Quality and Release Gates

Every production promotion must have a known commit SHA, a clean tracked tree, and a documented rollback target. The required gates are:

- dependency install consistent with the supported runtime (Node 22 for the current TypeScript toolchain);
- unit tests, build, repository validation, and `git diff --check` pass;
- GitHub Pages preview successfully deploys from the same source lineage;
- smoke tests cover home, dashboard, evidence, indicators, core about/documents routes, and both locales where a changed feature applies;
- evidence links and unavailable-state behaviour are checked;
- production cutover is atomic and the previous release remains available for rollback;
- a closeout records source SHA, validation, live release path, rollback path, and known limitations.

## 7. Current Completion Status and Priorities

The platform is **production-operational**, not evidence-complete. The next work must prioritise operational data and documentary quality over new UI surface area.

| Priority | Outcome | Completion evidence |
|---|---|---|
| P0 | Expand verified indicator-level evidence mapping from 10/65 | Explicit indicator IDs, ownership, year, visibility, and verified source state |
| P0 | Maintain monthly FY2569 data integrity | Validate updated source files; clearly distinguish partial, missing, and published data |
| P1 | Continue dashboard/evidence UX refinement | Preserve ECharts fallback tables, mobile accessibility, and TH/EN parity |
| P1 | Release hygiene | Release notes, rollback evidence, reproducible Node 22 quality gates |
| P2 | Add content and awareness materials | Public-safe, bilingual, linked to relevant categories/indicators |

## 8. Governance

- **Product Owner:** prioritises scope and approves releases.
- **Chief Architect / Head Agent:** protects platform boundaries, verifies evidence claims, integrates bounded work, and maintains release records.
- **Content/data owners:** supply and verify source data and evidence; own whether an item is public, authenticated, or unavailable.
- **Microsoft 365 owners:** manage file permissions and lifecycle.

## 9. Definition of Done

For an incremental release, “done” means the release scope is built, validated, previewed, deployed with rollback, and documented without false claims about data or evidence completeness.

For programme completion, the platform additionally needs verified direct evidence coverage for all required indicators, current approved resource data, maintained TH/EN parity, and an operational content/update handoff.

## 10. Architecture Statement

```text
Green Office 2026
= public environmental communication
+ data presentation
+ assessment-evidence navigation

Microsoft 365 / Document Center
= authorised documents, metadata operations, permissions, and lifecycle
```
