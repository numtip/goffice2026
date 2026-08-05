# Public Metadata Manifest Contract (PROPOSAL)

**Status:** PROPOSAL — no implementation
**Date:** 2026-08-02
**Canonical:** Document Center (source of truth) → **public export artifact** → Green Office (presentation)

---

## 1. Purpose

Specify a **versioned JSON manifest contract** that DC publishes and GO consumes —
metadata only, no master files, no auth URLs. Modeled on DC's existing PXP-1
`document-registry.public.json` (schema v1.0.0 + `.sha256`) and GO's
`evidence-index.json` (v0.7.0).

> This document defines the contract shape only. **No implementation.**

---

## 2. Proposed Manifest Shape (v0.1 proposal)

```jsonc
{
  "schemaVersion": "0.1.0",
  "generatedAt": "<ISO8601>",
  "source": "RAE Document Registry (SharePoint) — public export",
  "sourceExportSha256": "<sha256 of the DC public export consumed>",
  "recordCount": 0,
  "records": [
    {
      "documentId": "RAE-XXXXX",          // DC DocumentID (unchanged)
      "title": "<TH title>",
      "category": "<DC category>",         // raw DC category, not GO catId
      "status": "current",                 // DC Status
      "visibility": "public",              // DC Visibility
      "updatedDate": "<ISO8601>",          // DC UpdatedDate
      "downloadMode": "AUTHENTICATED_SHAREPOINT",
      "publicUrl": null,                   // ONLY when PUBLIC_* mode; else null
      "excludeFromPublic": true,           // derived from downloadMode
      "sha256": null                        // per-file, only after restore+verify
    }
  ]
}
```

**Rule:** `excludeFromPublic: true` whenever `downloadMode === AUTHENTICATED_SHAREPOINT`
or `publicUrl` is null. No private `StorageURL` is ever included.

---

## 3. Field-Level Policy

| Field | Source | Public? | Rule |
|---|---|---|---|
| `documentId` | DC | ✅ | stable, immutable |
| `title` | DC (TH) | ✅ | non-empty |
| `category` | DC | ✅ | raw taxonomy id/name |
| `status` | DC | ✅ | enum |
| `visibility` | DC | ✅ | enum |
| `updatedDate` | DC | ✅ | ISO8601 |
| `downloadMode` | DC | ✅ | enum (3 values) |
| `publicUrl` | derived | ⚠️ | only PUBLIC_* modes |
| `sha256` | GO-side post-restore | ⚠️ | per-file, after verification |
| `StorageURL` | DC | ❌ | **EXCLUDE_FROM_PUBLIC** |

---

## 4. Generation / Validation Contract

- **Producer (DC):** extend PXP-3 `export-live-registry.py` output (or a read-only
  adapter that post-processes `document-registry.public.json`). Frozen repo — the
  adapter must live **outside** DC (e.g. GO-side script) to respect READ-MOSTLY.
- **Validator:** reuse pattern of `validate-public-export.py` (offline, CI-ready,
  deterministic order, per-record errors) — new GO-side validator mirrors it.
- **Checksum:** manifest ships with `.sha256` (same pattern as DC).

---

## 5. Compatibility & Rollback

- Contract is **additive**: GO consumes only if the file exists; absence = current behavior.
- Schema bump `0.1.0 → 1.0.0` only via PO approval; backward-compatible reads.
- Rollback = delete/ignore manifest; no GO code change required.

**Verdict: PLANNING_READY**
