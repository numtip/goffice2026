# Evidence Mapping Report — Round 3

**Date:** 2026-07-15  
**Status:** Initial category-level mapping complete

## Overview

- **Total records:** 21
- **Traceability levels:** all "category" (21/21)
- **Verification statuses:** all "unresolved" (21/21)
- **Source availability:** 0% real — 100% placeholder (21/21)

## Mapping Methodology

- Pre-Round-3 evidence-index.json had `categoryId` values matching canonical category codes (cat1–cat7)
- No exact indicator-level or issue-level mapping was possible — all 21 records remain at category-level
- Free-text `indicator` field preserved but NOT promoted to canonical indicator codes
- All records marked `verification.status: "unresolved"` — no actual verification exists
- `categoryCodes` array derived directly from existing `categoryId` field
- `indicatorCodes` and `issueCodes` set to empty arrays for all records

## Per-Category Distribution

| Category | Records | Evidence IDs |
|----------|---------|-------------|
| cat1 | 3 | ev-energy-audit-2025, ev-energy-metering-2025, ev-energy-led-project |
| cat2 | 3 | ev-water-meter-q1, ev-water-audit-2025, ev-water-conservation |
| cat3 | 3 | ev-waste-recycling-2025, ev-waste-audit-2025, ev-waste-monthly-2025 |
| cat4 | 3 | ev-ghg-inventory-2025, ev-ghg-reduction-plan, ev-ghg-emission-factors |
| cat5 | 3 | ev-iaq-survey-2025, ev-iaq-ventilation-logs, ev-iaq-green-cleaning |
| cat6 | 3 | ev-transport-commute-2025, ev-transport-fleet-2025, ev-transport-policy |
| cat7 | 3 | ev-innovation-pilot-2025, ev-innovation-staff-2025, ev-innovation-partnerships |

## Schema Changes Applied

Each record evolved with:

```json
{
  "traceabilityLevel": "category",
  "indicatorCodes": [],
  "issueCodes": [],
  "categoryCodes": ["<canonical-category>"],
  "verification": {
    "status": "unresolved",
    "basis": "Pre-Round-3 data — category-level association only. No exact indicator or issue mapping established."
  }
}
```

- Version bumped from `0.2.0` to `0.3.0`
- No existing fields removed or renamed
- Free-text `indicator` field preserved as-is

## Unresolved Mappings

- **21/21 records** have no exact indicator or issue mapping
- Free-text indicators (e.g. "Energy audit and monitoring") are descriptive labels only — they do NOT correspond to canonical indicator codes
- Future work requires explicit source-to-indicator metadata from auditors or certified documentation
- Possible fuzzy-match candidates exist (e.g. "GHG inventory" → cat4 issue 1.5/indicator 1.5.1), but cannot be confirmed without verification

## Known Limitations

- No actual source documents exist (100% placeholder paths)
- No verification from auditors or office staff has been conducted
- Free-text `indicator` field cannot be promoted to canonical codes without explicit mapping
- `categoryId` values align with canonical codes but represent pre-canonical operational data
- Evidence IDs are human-readable names rather than stable UUIDs — future migration recommended
- No issue-level or indicator-level traceability — all evidence is category-level only
