# WS-B Evidence Mapping Report v1

**Date:** 2026-07-27  
**Branch:** `rapid/ws-evidence`  
**Worker:** Subagent A — WS-B Evidence  
**Contract:** `docs/evidence/SHAREPOINT_METADATA_LINK_CONTRACT.md`

---

## Summary

| Metric | Count |
|--------|-------|
| Placeholder slots audited | 16 |
| Metadata promoted (registry match) | 2 |
| SharePoint metadata backfilled | 2 |
| Remaining placeholders | 14 |
| Registry orphans (no evidence slot) | 1 (`doc-paper-usage-2025`) |

**Note:** Task brief referenced 14 placeholders from pre–Day-1 baseline (21 original − 4 ET-1 + 3 About available). Current index has 16 placeholders before this sprint (24 total items).

---

## Promoted Items (registry match)

| ID | Old status | New status | Indicator | Source | Blockers |
|----|------------|------------|-----------|--------|----------|
| `ev-waste-recycling-2025` | placeholder | available | 4.1.3 | `src-xlsx-waste-data` / `docs/1.5_Waste.xlsx` | Partial scope — shared workbook with `ev-waste-monthly-2025`; source not on disk; SharePoint URL pending; PO sign-off |
| `ev-ghg-emission-factors` | placeholder | available | 1.5.1 | `src-xlsx-ghg-inventory` / `docs/1.6_GreenhouseGas.xlsx` | Partial — EF sheet within GHG workbook; 528KB file not in git; SharePoint URL pending; PO sign-off |

Both retain `verification.status: pending` (not verified).

---

## SharePoint Metadata Backfill (existing registry matches)

| ID | Fields added | Blockers |
|----|--------------|----------|
| `ev-energy-metering-2025` | `publicationMode`, `sharePointUrl`, `sharePointUrlPending` | Source workbook untracked/off-disk |
| `ev-waste-monthly-2025` | `publicationMode`, `sharePointUrl`, `sharePointUrlPending` | Source workbook untracked/off-disk |

---

## Unchanged Placeholders (no registry candidate)

| ID | Status | Blocker |
|----|--------|---------|
| `ev-energy-audit-2025` | placeholder | No source in registry |
| `ev-energy-led-project` | placeholder | No source in registry |
| `ev-water-audit-2025` | placeholder | No source in registry |
| `ev-water-conservation` | placeholder | No source in registry |
| `ev-waste-audit-2025` | placeholder | No source in registry |
| `ev-ghg-reduction-plan` | placeholder | No source in registry |
| `ev-iaq-survey-2025` | placeholder | No source in registry |
| `ev-iaq-ventilation-logs` | placeholder | No source in registry |
| `ev-iaq-green-cleaning` | placeholder | No source in registry |
| `ev-transport-commute-2025` | placeholder | No source in registry |
| `ev-transport-policy` | placeholder | No source in registry |
| `ev-innovation-pilot-2025` | placeholder | No source in registry |
| `ev-innovation-staff-2025` | placeholder | No source in registry |
| `ev-innovation-partnerships` | placeholder | No source in registry |

---

## Registry Orphans

| Registry ID | Source | Source status | Blocker |
|-------------|--------|---------------|---------|
| `doc-paper-usage-2025` | `docs/1.4_Paper.xlsx` | **Off-disk, untracked** — never in git; SHA256 from prior inspection | No matching evidence slot; do not link to `ev-about-committee-order`; review-022 pending PO decision on 3.3.1/3.3.2 slot creation |

Disposition: `docs/evidence/WS-B_PAPER_USAGE_ORPHAN_QA.md`

---

## Files Changed

- `src/data/evidence-index.json` — v0.7.0
- `src/data/document-registry.json` — v0.4.0, `secondaryEvidenceIds` on shared workbooks
- `docs/evidence/WS-B_EVIDENCE_MAPPING_V1.md` — this report

---

## Validation

Run: `node scripts/validate-evidence.mjs`
