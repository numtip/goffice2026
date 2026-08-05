# SharePoint Evidence Registry and Access Audit Summary

Generated: 2026-07-20T13:49:13.092364+07:00

## Verdict
**READY_WITH_ACCESS_REVIEW**

## Phase 1 — Input Validation

| Check | Result |
|-------|--------|
| Joomla link records | 143 (expected 143) ✓ |
| External link records | 134 (expected 134) ✓ |
| Unique cloud URLs | 134 (expected 134) ✓ |
| Unique normalized URLs | 125 |
| Required fields present | ✓ |
| Previous audit files modified | No |

## Phase 2 — URL Normalization

- **Storage provider:** microsoft_sharepoint_onedrive (100%)
- **Tenant:** maejo365-my.sharepoint.com
- **Scope:** personal_onedrive (`prinya_mju_ac_th`)
- **Link kinds:** `:b:` binary/document, `:x:` spreadsheet
- Tracking params (`?e=`) stripped; item IDs preserved

## Phase 3 — Access Audit

| Access status | Unique URLs |
|---------------|------------:|
| ACCESS_DENIED | 120 |
| AUTHENTICATED_REACHABLE | 14 |

**Note:** SharePoint sharing links often return HTTP 200 with `text/html` (login/gateway page) without file metadata. True public anonymous download was not confirmed for any URL.

## Phase 4 — Ownership and Continuity Risk

| Risk level | Records |
|------------|--------:|
| critical | 129 |
| high | 14 |

All evidence resides in **personal OneDrive** (`prinya_mju_ac_th@maejo365`) — **critical/high continuity risk** unless migrated to organizational storage.

## Phase 5 — Taxonomy Mapping

| Mapping status | Records |
|----------------|--------:|
| confirmed | 7 |
| needs_review | 2 |
| probable | 134 |

Article title context used as primary mapping signal; anchor text from Joomla HTML used for indicator refinement (e.g. `3.1.(1)` → 3.1.2).

## Phase 6 — Duplicate Analysis

- Identical normalized URL groups: **15**
- Multi-page references to same file: **15** groups
- Duplicate Joomla rows (same URL, different articles): **9**

## Phase 7 — Migration Priority

| Priority | Records |
|----------|--------:|
| P0_CRITICAL | 143 |

## Phase 8 — Pilot Candidates

Selected **30** records covering water/energy/fuel/paper/waste/GHG indicators, owner-risk, access-denied, duplicate, and unresolved mapping cases. **No files downloaded.**

## Validation

- Input reconciliation: ✓
- Unique URL reconciliation: ✓ (134 URLs, 125 normalized)
- No SharePoint writes: ✓
- No sharing-permission changes: ✓
- No bulk downloads: ✓
- No secrets in outputs: ✓
- JSON/CSV valid: ✓
- Previous audit files unchanged: ✓
- Outputs in `docs/migration/sharepoint-evidence-registry/` only: ✓

## Risks and Blockers

1. **Personal OneDrive dependency** — all 134 URLs under one personal account
2. **No M365 authenticated session** on audit host — access classification based on HTTP HEAD only
3. **Filenames unavailable** from SharePoint without authenticated Graph API or download
4. **ACCESS_DENIED** URLs require PO-authorized M365 access for export pilot
5. Local dashboard data (`images/data/*.csv`) complements but does not replace SharePoint forms

## Recommended Next Steps

1. Product Owner authorize M365 export from `prinya_mju_ac_th` personal OneDrive
2. Establish `central_sharepoint_evidence_library` on organizational tenant
3. Begin authorized export pilot with 30 candidate URLs
4. Map exported `.xlsx` forms to canonical indicator codes during import
