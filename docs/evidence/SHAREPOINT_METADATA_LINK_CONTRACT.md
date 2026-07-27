# SharePoint Metadata & Link Contract

**Version:** 1.0.0  
**Date:** 2026-07-27  
**Sprint:** GOFFICE2026 Rapid Completion Day 1  
**Scope:** Metadata export contract only — no Entra ID or workflow implementation

---

## 1. Purpose

Define how Green Office evidence files stored in SharePoint map to platform metadata (`evidence-index.json`, `document-registry.json`) without an approval engine dependency.

---

## 2. SharePoint Library Mapping

| Category | SharePoint Library (proposed) | Platform `categoryCode` | Visibility |
|----------|------------------------------|-------------------------|------------|
| Cat 1 — Policy & Planning | `GO-Evidence-Cat1` | `cat1` | Authenticated + public metadata |
| Cat 2 — Communication | `GO-Evidence-Cat2` | `cat2` | Public metadata |
| Cat 3 — Resources & Energy | `GO-Evidence-Cat3` | `cat3` | Internal operational data |
| Cat 4 — Waste | `GO-Evidence-Cat4` | `cat4` | Internal operational data |
| Cat 5 — Environment & Safety | `GO-Evidence-Cat5` | `cat5` | Authenticated |
| Cat 6 — GHG & Transport | `GO-Evidence-Cat6` | `cat6` | Internal operational data |
| Cat 7 — Continuity | `GO-Evidence-Cat7` | `cat7` | Public metadata |

---

## 3. Required SharePoint Column Schema

Each document library item MUST expose these columns for export:

| Column | Type | Required | Maps to |
|--------|------|----------|---------|
| `GO_EvidenceId` | Text | Yes | `evidence-index.items[].id` |
| `GO_IndicatorCodes` | Multi-line text (comma-separated) | No | `indicatorCodes[]` |
| `GO_CategoryCode` | Choice | Yes | `categoryCodes[]` |
| `GO_PublicationStatus` | Choice | Yes | `publicationStatus` |
| `GO_Classification` | Choice | Yes | `classification` |
| `GO_DocumentYear` | Number | No | `year` |
| `GO_SourceId` | Text | No | `sourceId` / registry `sourceId` |
| `GO_Sha256` | Text | Recommended | Registry integrity check |
| `GO_FileUrl` | URL (computed) | Yes | Secure link target |

### Publication status values

- `public` — metadata + public distribution copy on static site
- `internal` — metadata only; link requires authentication
- `pending` — not yet published

---

## 4. Link Contract

### Public site behavior

1. **Public distribution copy** (`publicAccessible: true`): serve from `public/documents/` static path; no SharePoint redirect.
2. **Internal operational data** (`publicAccessible: false`): show metadata on evidence page; link label = "Request access" or authenticated SharePoint URL when Entra is enabled.
3. **No approval gate**: publication is a metadata flag set by authorized staff, not a workflow state.

### URL fields in evidence-index

```json
{
  "path": "/documents/cat3/metering-data-2025.xlsx",
  "realSourcePath": "docs/1.2-elect.xlsx",
  "sharePointUrl": null,
  "sharePointUrlPending": true,
  "publicationMode": "internal-metadata-only"
}
```

When SharePoint URL is known:

```json
{
  "sharePointUrl": "https://tenant.sharepoint.com/sites/GreenOffice/...",
  "sharePointUrlPending": false,
  "publicationMode": "authenticated-link"
}
```

---

## 5. Export Pipeline (future)

```
SharePoint library (CSV/JSON export)
  → validate against this contract
  → merge into document-registry.json (by GO_EvidenceId / GO_SourceId)
  → update evidence-index.json paths and publicationMode
  → npm run validate:evidence
```

**Day 1 boundary:** contract defined; export pipeline NOT implemented.

---

## 6. Verification Rules

- `verification.status: verified` requires human reviewer — never set by export alone
- Export may set `verification.status: pending` when `GO_Sha256` matches registry
- Broken links: `realSourceAvailable: false` when file missing from git AND SharePoint URL null

---

## 7. Related Documents

- `docs/evidence/GOFFICE2026_EVIDENCE_ONBOARDING_CONTRACT.md` — provenance rules
- `src/data/document-registry.json` — canonical source file registry
- `docs/sharepoint/ADR-0001-remove-approval-engine.md` — no approval workflow
