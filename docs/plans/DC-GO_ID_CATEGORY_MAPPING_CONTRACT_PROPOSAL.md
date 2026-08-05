# DC → GO ID & Category Mapping Contract (PROPOSAL)

**Status:** PROPOSAL — no implementation
**Author:** Head Agent / Orchestrator
**Date:** 2026-08-02
**Canonical:** Document Center = source of truth · Green Office = presentation layer
**Related:** GATE 2 (Integration) — not opened

---

## 1. Purpose

Define how Document Center (DC) records map to Green Office (GO) evidence/indicator
records **without** touching either repo's data. This contract is a reference table
only; nothing is applied until PO approval + GATE 2.

---

## 2. ID Mapping Strategy

DC uses `DocumentID` (`RAE-00001` …), GO uses evidence `id` (`ev-water-meter-q1`).

### 2.1 Proposed naming rule (PROPOSAL)
| Scope | Rule |
|-------|------|
| DC record | unchanged `RAE-XXXXX` (source of truth) |
| GO evidence id | keep existing `ev-*` semantic ids (stable, used by routes) |
| Bridge | **`dcEvidenceMap`** — one-way mapping `RAE-XXXXX → ev-*` (GO side only) |
| New GO evidence from DC | `ev-<slug>-<year>` following existing convention |

### 2.2 Proposed ID mapping table (illustrative — from known records)

> ⚠️ **Not populated.** Requires the full 627-record DC export + GO 24 evidence items
> reconciled. The 5 records below are placeholders to fix the shape only — do NOT
> treat as verified.

| DC DocumentID | DC Title | GO evidenceId | Category (DC→GO) | Status |
|---|---|---|---|---|
| `RAE-XXXXX` | <title from DC export> | `ev-<id>` | Admin→catN | PENDING_RECONCILE |
| … | … | … | … | … |

**Validation rule (future):** every mapped pair must pass `validate-evidence.mjs`
(unique id, valid traceabilityLevel, indicatorCodes exist in taxonomy).

---

## 3. Category Mapping Table

DC taxonomy (6) vs GO categories (7) — different taxonomies, **mapping is NOT 1:1**.

| DC Category | GO categoryId | Coverage note | Confidence |
|---|---|---|---|
| `Administration` | cat2 (Water?) / none | งานบริหาร ≠ GO resource domain | LOW — needs PO |
| `FinanceProcurement` | none | procurement/energy overlap? | LOW — needs PO |
| `PlanningPolicy` | cat1/cat4 (policy overlap) | about-policy evidence | MEDIUM |
| `SOPManuals` | none | ops docs — not evidence | LOW |
| `AcademicServices` | none | extension services | LOW |
| `Research` | cat7 (innovation?) | RAE research → green innovation? | LOW — needs PO |

**Decision needed:** 6 DC categories are organizational (บริหาร/วิจัย); GO categories
are **resource domains** (พลังงาน/น้ำ/ขยะ/GHG/อากาศ/การเดินทาง/นวัตกรรม). The bridge
must be **document-type → resource-domain**, decided per record, not by category alone.

---

## 4. Status / DownloadMode Translation

| DC `Status` | GO `status` | Note |
|---|---|---|
| `current` | `available` | approved+published → real evidence |
| `current` | `placeholder` | metadata-only, file not restored yet |
| (future) `superseded` | `placeholder` | keep historical |

| DC `DownloadMode` | GO `publicationMode` | Public? |
|---|---|---|
| `AUTHENTICATED_SHAREPOINT` | `internal-metadata-only` | **EXCLUDE_FROM_PUBLIC** |
| `PUBLIC_SHAREPOINT_LINK` | (new) `public-link` | ✅ allowed if owner grants |
| `PUBLIC_DISTRIBUTION_URL` | (new) `public-download` | ✅ allowed |

**Rule:** never expose `StorageURL` with `AUTHENTICATED_SHAREPOINT` on the public site.

---

## 5. TH-only / EN Relation Strategy

- DC `Title` is Thai-only. GO requires TH/EN parity (evidence pages build both).
- **Proposal:** GO keeps authoritative `title`/`titleTh`; DC Title is the TH source.
  EN translation stays a GO-side responsibility (existing i18n workflow, `locales/en.json`).
- **Rule:** DC Title → GO `titleTh`; GO `title` (EN) is NOT derived automatically —
  flagged for human translation (no machine-invented EN).
- `UpdatedDate` (DC) → GO `updated`; no locale dependency.

---

## 6. IndicatorCode Derivation Boundary

- DC has **no IndicatorCode**. GO derives `indicatorCodes` from `resource-indicator-map.json`
  + `review-*` records only.
- **Boundary:** IndicatorCode is **NEVER derived from DC data**. It is assigned by
  GO-side evidence mapping (review queue), then PO sign-off.
- This keeps the Evidence Gate separate from the DC reuse mapping.

---

## 7. Validation Checklist (future adapter)

- [ ] ID uniqueness across combined namespace
- [ ] Category mapping covers 100% of used DC categories
- [ ] Status/DownloadMode translation total == records
- [ ] No authenticated StorageURL in public output
- [ ] `validate-evidence.mjs` + `validate-provenance.mjs` pass on merged view
- [ ] DC export `.sha256` verified before any consumption

---

## 8. Rollback / Compatibility

- Mapping tables live in GO `docs/` (proposal) → later `src/data/dc-evidence-map.json` (new file, additive).
- Removing the map = GO returns to current behavior (no DC dependency). **No migration needed.**
- DC stays frozen; GO consumes DC **export artifacts only** (never live SharePoint).

**Verdict: PLANNING_READY (shape confirmed; population blocked on full DC export + PO decisions)**
