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
├── activities-aspects.json      # 1.1.1 scope (canonical); 1.3 activity/aspect records LEGACY/SUPPORTING
├── laws.json                    # 1.4.1 legal register
├── compliance.json              # 1.4.2 legal compliance evaluation
├── targets.json                 # 1.1.3 targets (6 domains)
├── ghg.json                     # 1.5.1 inventory · 1.5.2 performance
├── projects.json                # 1.6.1 / 1.6.2 projects & reduction
├── management-review.json       # 1.7.1 quorum · 1.7.2 agenda/meetings/decisions
└── environmental-aspects-2568.json  # Canonical FY2568 CAT1-1.3 runtime (1.3.1 / 1.3.2 / 1.3.3)
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

- **activities-aspects** — `scope {officeAreaSqm, basis}` (canonical 1.1.1). Activity/aspect rows are retained as legacy/supporting; runtime 1.3 is `environmental-aspects-2568.json`.
- **environmental-aspects-2568** — canonical FY2568 1.3.1/1.3.2/1.3.3: activities, aspects with nested assessment (priority-sheet L/M/H canonical; register values preserved), derived significant issues, documentary project links.
- **laws** — `items [{id, topic, title, counts {compliant, nonCompliant, forInformation}, reviewDate}]`; `summary {totalItems}`
- **compliance** — `evaluations [{id, date, reviewer, scope, result: compliant|partial|unverified, basis}]`
- **targets** — `targets [{id, domain, unit, value, operator: lte, comparisonBasis: "FY2567", sourceType: ocr-derived|confirmed, verification}]`
- **ghg** — `inventory {totalTCO2e, scope1TCO2e, scope2TCO2e, scope3TCO2e, perCapitaKgCO2e, methodology, septicAnomalyExcluded: true}`; `monthly [{month, tCO2e}]`; `performance [{targetReductionPct, actualChangePct, met, note}]`; `exclusions [{item, reason, status}]`
- **projects** — `projects [{id, title, indicatorCodes, period, objectives, results, sourceRef}]` (1.6.1 / 1.6.2; 1.3.3 documentary links resolve here)
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

---

## 7. Phase E/F — Category 1 management presentation (plan + implementation)

### 7.1 Visual / content / interaction plan

- **Route scope:** only the existing stable routes are extended — `/categories/cat1/` (TH + EN) and all 18 `/indicators/1.x.x/` (TH + EN via the shared `IndicatorTraceabilityExperience`). No new top-level routes; no redesign of `/about/` or other categories.
- **Category page (`/categories/cat1/`):**
  1. **Management cycle panel** (`Cat1ManagementCycle`) — a 7-step ordered flow (Define → Govern → Identify → Comply → Measure → Improve → Review) rendered as semantic `<ol>` cards (grid on ≥sm, single column on mobile). Each step links to its leading indicator. No JS; static; no animation beyond CSS hover states already gated by the global `prefers-reduced-motion` rule.
  2. **Domain snapshot panel** (`Cat1DomainSnapshot`) — a grid of domain cards (scope, laws, compliance, targets, GHG, projects, management review, **FY2568 aspects register**) showing FY2568 facts derived **only** from the contracts. The scope card is 1.1.1 only; 1.3 counts come solely from `environmental-aspects-2568.json`. Each card links to its primary indicator. Explicitly labeled as coverage context, never a score.
  3. **Journeys** — explicit cross-links (Scope→1.3.1, Aspects↔Laws, Targets→1.5.2, Projects 1.3.3↔1.6.2, GHG→Reduction, Review→next-cycle) rendered as pill links in the cycle panel.
- **Indicator pages (cat1 only):** `Cat1ContractContext` panel placed after the requirement — shows the matching contract domain's FY2568 facts, source-file count, verification status and contract status, plus related-indicator links. For **1.2.2 and 1.5.3** the panel renders a calm amber "not available" notice sourced from the contracts' gaps — never filled.
- **Interaction/a11y:** no pointer-only interactions; all links have `focus-visible` rings; cycle and lists are semantic (`ol`/`ul` with `role="list"`); reduced-motion respected by the global stylesheet; TH/EN strings are inline bilingual labels chosen by locale, matching the existing pattern.
- **Honesty:** no FY2569 values, no official scoring, no local paths, septic anomaly only ever displayed as an excluded-record count (from the contract), never as a reported value.

### 7.2 Implementation artifacts

| File | Purpose |
|---|---|
| `src/utils/category1-presentation.ts` | Read-only view-model: cycle steps, journeys, indicator→domain map, domain snapshots, relations. Single source of presentation facts over the contracts. |
| `src/components/categories/Cat1ManagementCycle.astro` | Cycle + journey links (category page). |
| `src/components/categories/Cat1DomainSnapshot.astro` | FY2568 domain snapshot grid (category page). |
| `src/components/indicators/Cat1ContractContext.astro` | FY2568 contract context + missing notice + relations (indicator pages). |
| `src/pages/categories/[id].astro` + `src/pages/en/categories/[id].astro` | Wire the two panels for `cat1` only. |
| `src/components/indicators/IndicatorTraceabilityExperience.astro` | Wire `Cat1ContractContext` for cat1 indicators (shared TH/EN). |
| `scripts/test-category1-presentation.mjs` | Structural TH/EN parity, a11y focus/reduced-motion markers, missing-notice honesty, view-model assertions. |

### 7.3 Validation for this phase

`git diff --check`, `npm test` (includes the new presentation tests), `npm run check`, `npm run build`, `npm run validate`.
