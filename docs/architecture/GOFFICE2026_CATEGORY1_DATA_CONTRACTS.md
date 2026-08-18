# GOFFICE2026_CATEGORY1_DATA_CONTRACTS

**Version:** 1.0.0 — 2026-08-19
**Governance:** `GOFFICE2026_CATEGORY1_MANAGEMENT_BLUEPRINT_V1` (Phase C — data contracts, Phase D — FY2568 normalization)
**Status:** PHASE C+D COMPLETE — presentation/cross-linking/release NOT started
**Parent baseline:** `GREENOFFICE2026_PLATFORM_BLUEPRINT_V5` (Static First: Markdown/JSON/CSV, no backend/database)

---

## 1. Purpose

Static, reusable canonical data contracts for Category 1 (7 issues / 18 indicators). They normalize the **verified FY2568 sources** into one machine-readable shape that the Astro views (Phase E) can consume without duplicating logic. They are **not** a backend, not a database, and not presentation.

Operational principle from the Blueprint: FY2568 = historical working baseline; FY2569 = current-year layer when verified. **FY2568 values must never be presented as FY2569.**

## 2. Location

```
src/data/category1/
├── category1-manifest.json      # index of contracts + statuses + missing indicators
├── activities-aspects.json      # 1.1.1 scope · 1.3.1 activities/aspects
├── laws.json                    # 1.4.1 legal register
├── compliance.json              # 1.4.2 legal compliance evaluation
├── targets.json                 # 1.1.3 targets (6 domains)
├── ghg.json                     # 1.5.1 inventory · 1.5.2 performance
├── projects.json                # 1.3.3 / 1.6.1 / 1.6.2 projects & reduction
└── management-review.json       # 1.7.1 quorum · 1.7.2 agenda/meetings/decisions
```

## 3. Contract Schema (all files)

```json
{
  "schemaVersion": "1.0.0",
  "domain": "<domain-id>",
  "updated": "YYYY-MM-DD",
  "year": 2568,
  "status": "normalized-verified | normalized-partial | reference-only",
  "governance": "GOFFICE2026_CATEGORY1_MANAGEMENT_BLUEPRINT_V1",
  "sources": [
    { "ref": "<relative path under Data2568\\หมวด1>", "role": "primary|supporting", "inspection": "content-verified|header-verified|filename-only" }
  ],
  "records": [ /* see per-domain fields */ ],
  "gaps": [
    { "indicator": "1.2.2", "status": "MISSING", "note": "..." },
    { "indicator": "1.5.3", "status": "MISSING", "note": "..." }
  ]
}
```

### Common record fields (present in every record)

| Field | Rule |
|---|---|
| `id` | unique, `<domain>-<n>` |
| `year` | `2568` |
| `indicatorCodes` | non-empty; valid codes from `src/data/criteria/indicators.json` |
| `issueCodes` | must match the indicator→issue map |
| `categoryCode` | `cat1` |
| `evidenceIds` | only ids that exist in `src/data/evidence-index.json` |
| `sourceRef` | relative source under `Data2568\หมวด1` (no drive paths) |
| `verification` | `{status: verified|reviewed|pending|unavailable, basis: string}` |
| `availability` | `source-available|source-offline|content-verified` |

### Per-domain record fields

- **activities-aspects** — `scope {officeAreaSqm, basis}`; `activities [{id, name}]`; `aspects [{id, activity, inputOutput: input|output, aspect, impact, directIndirect, condition: normal|abnormal|emergency, significance: L|M|H|unknown, applicableLaw?}]`; `summary {activityCount, aspectCount, significantCount}`
- **laws** — `items [{id, topic, title, counts {compliant, nonCompliant, forInformation}, reviewDate}]`; `summary {totalItems}`
- **compliance** — `evaluations [{id, date, reviewer, scope, result: compliant|partial|unverified, basis}]`
- **targets** — `targets [{id, domain, unit, value, operator: lte, comparisonBasis: "FY2567", sourceType: ocr-derived|confirmed, verification}]`
- **ghg** — `inventory {totalTCO2e, scope1TCO2e, scope2TCO2e, scope3TCO2e, perCapitaKgCO2e, methodology, septicAnomalyExcluded: true}`; `monthly [{month, tCO2e}]`; `performance [{targetReductionPct, actualChangePct, met, note}]`; `exclusions [{item, reason, status}]`
- **projects** — `projects [{id, title, indicatorCodes, period, objectives, results, sourceRef}]`
- **management-review** — `quorum {documented, totalMembers, attended, attendancePct, basis}`; `meetings [{id, date, agenda[], participantsCount?, outcome, plannedPerYear}]`; `decisions [{id, text}]`

## 4. Truthfulness rules (enforced)

1. **No invented data.** Every value traces to a source file or an existing canonical data file (`about-documents.json` targets, `evidence-index.json`, `generated/ghg.json`).
2. **No septic anomaly as reported value.** `ghg.json` records the anomaly in `exclusions` only; `inventory` uses the official verified totals (231.62 tCO2e) that match `1.5.2 (9-3-69).pdf`.
3. **MISSING stays MISSING.** Indicators 1.2.2 and 1.5.3 appear only in `gaps` arrays, never as records.
4. **No FY2569 leakage.** All contracts are `year: 2568`; no 2569 values or claims.
5. **No official scoring.** Coverage/availability only.
6. **No local paths.** `sourceRef` values are relative; no `F:\`, no `projectAi`, no full OneDrive paths.
7. **Year + evidence traceability preserved** on every record.

## 5. Validation

```bash
node scripts/validate-category1-contracts.mjs   # structural + reference integrity
npm test                                        # includes scripts/test-category1-contracts.mjs
```

Validator checks: required keys, valid domain set, `year === 2568`, valid indicator/issue/category codes, matching hierarchy (indicator→issue→category), valid `evidenceIds`, no local-path patterns, ghg exclusion invariant, MISSING indicators only in gaps, and the septic-anomaly value absent from records.

## 6. Coverage / gaps (Phase D result)

See `category1-manifest.json` and the `gaps` array of each contract. Summary: all six Blueprint domains normalized from verified FY2568 sources (priority 1.3 → 1.5 → legal/compliance → projects → management review); static evidence and numeric target values marked with their true verification state; 1.2.2 and 1.5.3 remain MISSING.
