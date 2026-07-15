# Green Office 2026 — Round 3 Contracts

**Date:** 2026-07-15  
**Starting HEAD:** `75ad6d2`  
**Branch:** `master`  
**Round 2 baseline:** `b63e2d6` (correction), `eb62587` (implementation)

---

## 1. Evidence Reality (Pre-Round-3 Audit)

| Property | Value |
|----------|-------|
| Total records | 21 |
| Per-category distribution | 3 per cat (cat1-cat7) |
| Current mapping level | Category-only (via `categoryId`) |
| Indicator field | Free-text (NOT canonical codes) |
| Source availability | 0% real files — 100% placeholder |
| Verification status | Not specified |
| Stable IDs | No — human-readable names used |
| Traceability levels | Not defined |

## 2. Evidence Schema Contract

Evolve existing `evidence-index.json` — do not create a parallel source of truth.

### Required Schema Changes

Add to each record:
- `traceabilityLevel`: `"category" | "issue" | "indicator" | "unmapped"`
- `indicatorCodes`: `string[]` — canonical indicator codes (e.g. `["1.1.1"]`)
- `issueCodes`: `string[]` — canonical issue codes (e.g. `["1.1"]`)
- `verification.status`: `"unresolved" | "pending" | "reviewed" | "verified"`
- `verification.basis`: string describing basis for mapping (optional)

Preserve existing fields: `id`, `title`, `description`, `year`, `path`, `fileType`, `status` (source status).

### ID Strategy

Keep existing `id` values for now (they are unique within the index). Do not renumber unless duplicates or conflicts exist. Flag for future migration in the mapping report.

### Mapping Rules

- `indicatorCodes` populated ONLY when evidence can be explicitly linked to a canonical indicator code
- `issueCodes` populated when evidence can be linked to an issue (may or may not have indicator-level)
- `categoryCodes` uses the existing `categoryId` field (maps to canonical category codes)
- All referenced codes must validate against canonical taxonomy
- No fuzzy keyword matching as final truth
- Candidates from fuzzy matching must be marked `unresolved`
- Free-text `indicator` field is NOT a substitute for canonical codes

## 3. Traceability Level Contract

| Level | Meaning |
|-------|---------|
| `indicator` | Explicitly linked to ≥1 canonical indicator codes. Must have `indicatorCodes` populated. |
| `issue` | Linked to canonical issue. Must have `issueCodes`. No exact indicator mapping established. |
| `category` | Associated only with a category via `categoryId`. This is the pre-Round-3 state for all records. |
| `unmapped` | Exists but no trustworthy canonical taxonomy relationship. |

## 4. Verification Status Contract

| Status | Meaning |
|--------|---------|
| `verified` | Relationship confirmed by trustworthy project evidence. |
| `reviewed` | Record reviewed, not necessarily formal certification approval. |
| `pending` | Requires review or completion. |
| `unresolved` | Relationship/source cannot yet be established reliably. |

All 21 existing records: `verification.status = "unresolved"` (no actual verification exists).

## 5. Route Contract

### Existing
- `/evidence/` — Evidence library index (rewrite for traceability)

### New
- `/evidence/{evidence-id}/` — Evidence detail (static generation)

### Indicator Integration
- `/indicators/{indicator-code}/` — Updated only where exact indicator-level mapping exists

## 6. Source Contract

All 21 records are placeholder. Source behavior:
- Show "ยังไม่มีไฟล์ต้นฉบับสำหรับเปิดดู" for placeholder paths
- No fake download links
- No fabricated URLs
- Path field preserved for future real asset mapping

## 7. Validation Requirements

New: `node scripts/validate-evidence.mjs`
- Unique IDs
- Valid traceabilityLevel
- Valid verification status
- All referenced category/issue/indicator codes exist canonically
- No impossible hierarchy combinations
- indicator-level records have indicatorCodes
- issue-level records have issueCodes
- category-level records have categoryCode
- unmapped records have no false traceability claims

Must also pass existing validators.

## 8. File Ownership

### Worker A
- `src/data/evidence-index.json` (evolve schema)
- `scripts/validate-evidence.mjs` (create)
- `docs/evidence/GOFFICE2026_EVIDENCE_MAPPING_REPORT.md` (create)

### Worker B
- `src/pages/evidence.astro` (rewrite)
- `src/pages/evidence/[id].astro` (create)
- New components under `src/components/evidence/`

### Head (indicator integration)
- `src/pages/indicators/[code].astro` (update evidence section)

### Not modified
- Canonical taxonomy (`src/data/criteria/*`)
- Dashboard pipeline
- Deployment workflow
