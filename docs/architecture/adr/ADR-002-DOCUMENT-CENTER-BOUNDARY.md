# ADR-002: Document Center M365-Backed, Evidence Separate

## Status

ACCEPTED

## Context

Green Office assessment requires evidence documents: policies, audit reports, metering records, surveys, and supporting files tied to indicators. These assets need upload, versioning, permissions, and long-term storage aligned with institutional Microsoft 365 practices.

The goffice2026 repository is optimized for static content, dashboard metrics, and evidence *discovery* pages that link to documents. Building a document management system inside this repo would expand scope, duplicate M365 capabilities, and conflict with the static-first and no-backend-for-MVP principles.

Evidence pages in Astro describe what exists and where to find it; they are not a file store.

## Decision

Keep Document Center as a separate, M365-backed project (SharePoint / OneDrive integration). Goffice2026 provides discovery and navigation only:

- Evidence index and indicator-linked discovery pages in Astro
- External links to Document Center URLs or M365-hosted assets
- No file upload, versioning, or document metadata storage in Supabase for this phase

Supabase operational backend scope excludes evidence file management entirely. Document permissions, retention, and versioning remain in the Document Center boundary.

## Consequences

**Positive**

- Clear separation between environmental metrics workflow and document governance.
- M365 remains the institutional system of record for evidence files.
- Goffice2026 repo stays focused on public portal and monthly metric operations.
- Reduced security surface: no binary storage or upload endpoints in Supabase phase 1.

**Negative**

- Cross-system linking must be maintained manually or via agreed URL conventions.
- Evidence freshness on discovery pages depends on content updates or external link integrity, not automatic sync from M365.
- Staff may need two systems: Document Center for files, goffice admin for monthly metrics.

## Constraints

- Do not build the Document Center inside goffice2026.
- Do not add file upload or evidence document management to Supabase in this phase.
- Do not store evidence binaries or SharePoint/OneDrive credentials in the public Astro repo.
- Evidence discovery pages may link out; they must not impersonate a document repository.
- Preserve existing non-goals in the Supabase backend blueprint regarding Document Center scope.

## Related documents

- [Project Constitution](../../00-GREENOFFICE_PROJECT_CONSTITUTION.MD)
- [Supabase Backend Blueprint V1](../../GREENOFFICE2026_SUPABASE_BACKEND_BLUEPRINT_V1.md) — §1 Non-goals, §2 Document Center boundary, §3 Out of scope
- [ADR-001](./ADR-001-ASTRO-STATIC-FIRST.md)
- [ADR-003](./ADR-003-SUPABASE-OPERATIONAL-BACKEND.md)
