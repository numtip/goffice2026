# GOFFICE2026 — Category 3 Resource Blueprint V1.0

**Document Type:** Category Blueprint (C1-frozen baseline for Cat3 implementation)
**Version:** 1.0
**Status:** ACTIVE — C1 decision freeze (2026-08-23); Phase C gates C2–C7 pending
**Date:** 2026-08-23 (Asia/Bangkok)
**Repository HEAD baseline:** `b4ee4724512fbb2b87e3ce8797eaef61a5da5b54` (= origin/master, Cat2 baseline merged)
**Parent authority:**
- `docs/00-GREENOFFICE_PROJECT_CONSTITUTION.MD`
- `docs/GREENOFFICE2026_PLATFORM_BLUEPRINT_V5.md`
- `docs/GOFFICE2026_CATEGORY1_PLAYBOOK_FOR_CATEGORIES_2-7.md`
- `docs/GOFFICE2026_CATEGORY2_COMMUNICATION_BLUEPRINT_V1.md` (format template)
- `docs/data/GO-CAT3-PHASE-A-SOURCE-DISPOSITION.md` (C1 decisions — this blueprint's authority)

**Scope:** Category 3 = หมวดที่ 3 การใช้ทรัพยากรและพลังงาน / Resource and Energy Utilization (weight 15%). C1-only frozen blueprint — **no runtime/data implementation in this phase**.

---

## 1. Authority & Scope

| Item | Value |
|---|---|
| Category | 3 — การใช้ทรัพยากรและพลังงาน / Resource and Energy Utilization |
| Weight | 15% |
| Issues | 4 (3.1 การใช้น้ำ · 3.2 การใช้พลังงาน · 3.3 การใช้ทรัพยากรอื่นๆ · 3.4 การประชุมและการจัดนิทรรศการ) |
| Indicators | 15 (3.1.1–3.1.3, 3.2.1–3.2.5, 3.3.1–3.3.5, 3.4.1–3.4.2) |
| FY2568 baseline | 32 published source documents, **frozen** category-level baseline (`CATEGORY_LEVEL_RECORDED`, public access) |
| FY2569 layer | Not yet present — cat3 category page shows "รอการอัปเดต / Awaiting update" until verified sources arrive |
| Boundary | Static-first (JSON contracts, manifest + sha256); no DB/API/backend; evidence governed by GitHub public publication |

Official criteria verified against the FY2568 criteria PDF (`G:\...\Data2568\เกณฑ์การประเมินสำนักงานสีเขียว ปี 2568 (030368).pdf`, pages 27–31) and `src/data/criteria/indicators.json` — **indicators.json is a faithful canonical representation; no re-title work needed.** The 15 indicators are **not assumed** to have valid evidence — each was independently verified against actual source content in C1 (all 15 confirmed; 3.2.2 is MEDIUM strength).

## 2. Domain Model

> **Plan → Measure → Analyze → Comply → Improve**

| Stage | Meaning | Canonical indicators |
|---|---|---|
| **Plan** | Resource targets (reduce 1%/domain vs 2024) + conservation measures | all domains; 3.1.1, 3.2.1, 3.2.4, 3.3.1, 3.3.4, 3.4.1 |
| **Measure** | Data per unit vs target (meters, kWh, litres, kg) | 3.1.2, 3.2.2, 3.2.5, 3.3.2 |
| **Analyze** | Compare vs target, compute % and met/not-met | 3.1.2, 3.2.2, 3.2.5, 3.3.2 |
| **Comply** | Behavior/workspace compliance (surveys) | 3.1.3, 3.2.3, 3.3.3, 3.3.5 |
| **Improve** | Green meetings/exhibitions, material + energy/waste reduction | 3.4.1, 3.4.2 |

### Canonical entity / relationship model

```text
Entity                         ↔ Indicators        ↔ Repo assets (proposed)
──────────────────────────────────────────────────────────────────────────
ResourceTargets (2568)          all (target clause) (contract: targets.json domain)
ResourceMeasures                3.1.1/3.2.1/3.2.4/3.3.1/3.3.4/3.4.1 (contract: measures.json)
WaterData per unit              3.1.2               (dashboard water + generated/water.json)
ElectricityData per unit        3.2.2               (dashboard energy + generated/energy.json)
FuelData per distance           3.2.5               (dashboard fuel + generated/fuel.json)
PaperData per unit              3.3.2               (dashboard paper + generated/paper.json)
ComplianceSurvey (behavior)     3.1.3/3.2.3/3.3.3/3.3.5 (contract: compliance.json)
GreenMeeting/Exhibition         3.4.1/3.4.2         (contract: meetings.json)
Cat3 Annual Report              category-level       (manifest ANNUAL_REPORT)
```

Rules:
- **One canonical contract file per domain**, many views; no duplicate registries.
- **One-source rule** (Cat1 convention): dashboard KPI values and contract records must share the same numeric source — never hardcode KPI values in components.
- Evidence index carries indicator-level records referencing manifest paths + sha256; document lists always read from `fy2568-publication.json`.

## 3. Four Issues / Fifteen Indicators (C1-frozen evidence map)

| Issue | Indicator | FY2568 evidence (content-verified) | Strength |
|---|---|---|---|
| 3.1 การใช้น้ำ / Water | **3.1.1** | Measures: stickers, 08.00–09.00 schedule, timer-app watering, AC-water reuse, sensor faucets (#5, #8, #1; #11 photos scan) | **STRONG** |
| | **3.1.2** | Data: 8,337.50 u (+47.1%), 87.76 u/person (+47.71%) → **NOT met** (#6, #8, #1) | **STRONG** |
| | **3.1.3** | Compliance: no leaks/drips found (#7, #8, #1) | **STRONG** |
| 3.2 การใช้พลังงาน / Energy | **3.2.1** | Measures: LED T8 ×150, solar ×4, motion sensors (#16, #14, #1) | **STRONG** |
| | **3.2.2** | Data: 403,036.80 u (+4.6%) → **NOT met**; per-unit tables image-only (#17, #14, #1) | **MEDIUM** |
| | **3.2.3** | Compliance: no lights left on (#18, #14, #1) | **STRONG** |
| | **3.2.4** | Fuel measures + scanned vehicle log (#19, #20 scan, #14, #1) | **STRONG** |
| | **3.2.5** | Data: 695.82 L (−205 L, −22.7%) → **MET**; #21 starts at item (2) (#21, #15, #19, #14, #1) | **STRONG** |
| 3.3 การใช้ทรัพยากรอื่นๆ / Other resources | **3.3.1** | Paper measures: reuse, double-side, e-docs (#24, #22, #1) | **STRONG** |
| | **3.3.2** | Data: 2,197.80 kg (+117), 23.13 kg/unit (+2, +5.6%) → **NOT met** (#25, #22, #1) | **STRONG** |
| | **3.3.3** | Compliance: no wasteful paper use (#26, #22, #1) | **STRONG** |
| | **3.3.4** | Ink/stationery measures: shared printers & supplies (#27, #22, #1) | **STRONG** |
| | **3.3.5** | Compliance: no wasteful ink/stationery use (#28, #22, #1) | **STRONG** |
| 3.4 การประชุมและการจัดนิทรรศการ / Meetings & exhibitions | **3.4.1** | Green-meeting measures: e-meeting, QR-Code, online invite (#31, #29, #1) | **STRONG** |
| | **3.4.2** | Eco materials + energy/waste reduction; complete in #30/#2; #32 partial (item 3 only) | **STRONG** |

**All 15 indicators have dedicated evidence — no GAP/MISSING.** Numeric measurement + target + analysis artifacts exist for 3.1.2, 3.2.2, 3.2.5, 3.3.2. The remaining criteria are MEASURE or COMPLIANCE (survey) evidence.

## 4. FY2568 → FY2569 Year Model

Mirrors the proven Cat1/Cat2 overlay pattern:

| Layer | Source files | Status |
|---|---|---|
| **FY2568 baseline** | `src/data/category3/*.json` (year 2568, `FROZEN_READ_ONLY_BASELINE`) + `fy2568-publication.json` + `baseline-2568.ts` (cat3 = 32) | Frozen; never mutated; never presented as FY2569 |
| **FY2569 overlay** | Separate `src/data/category3/*-2569.json` + presentation (mirror Cat2 `*-2569.json` pattern) | Build **only when verified FY2569 sources exist**; until then cat3 page keeps "รอการอัปเดต" |
| Presentation | FY2569 primary when present, FY2568 baseline in collapsed details | Applied in Phase C journeys |

Rules:
- FY2569 facts must come from verified FY2569 sources (none on disk for cat3).
- No copying FY2568 values (including the 1% targets and actual +47.1%/−22.7% outcomes) into FY2569 records.
- No invented FY2569 activities.

## 5. Evidence Mapping Rules

### 5.1 Mapping design (conceptual — file edits happen in C3)

- **3.1.1** → #5 (canonical measures), #10 (near-duplicate, keep as supporting only), #11 (scan photo evidence, `filename_folder_only`)
- **3.1.2** → #6 (canonical data), #12 (near-duplicate re-export, exclude from mapping)
- **3.1.3** → #7 (canonical), #13 (re-export duplicate, exclude)
- **3.2.1** → #16 · **3.2.2** → #17 · **3.2.3** → #18 · **3.2.4** → #19 (misbounded — map with anomaly note) + #20 (scan log) · **3.2.5** → #21 (incomplete — map with note; complete copy in #15)
- **3.3.1** → #24 · **3.3.2** → #25 · **3.3.3** → #26 · **3.3.4** → #27 · **3.3.5** → #28
- **3.4.1** → #31 · **3.4.2** → #32 (partial) — complete content in #30
- **Category reports** → #8, #14, #22, #29 (canonical DOCX per issue) + #1 (GO หมวด 3 master) + #2 (export) → category-level evidence
- **Targets/measures** → #4 (canonical CRITERIA_TARGETS_MEASURES) + #3 (export) → cross-category target evidence

### 5.2 Evidence truthfulness constraints

1. **Scan/garbled artifacts are honest**: #11, #20 (image scans → `filename_folder_only`), #3 (garbled text → content pending OCR). Never claim semantic verification for them.
2. **Near-duplicates (G1/G2/G3)**: canonical = folder-level #5/#6/#7; subfolder re-exports excluded from indicator mapping (flag `duplicateOf`).
3. **No signed/approved claim**: no signature block exists; #4 has a typed-name placeholder only.
4. **3.2.2 is MEDIUM** — per-unit numbers are image-only; only the summary (403,036.80 u, +4.6%) is text-verifiable.
5. **Anomalies #1–#10** (misbounded #19, incomplete #21/#32, stale lastPrinted, version proliferation) are documented, not resolved by inference.

### 5.3 Stale cat3 legacy evidence-index entries

Current `evidence-index.json` cat3-tagged entries are **legacy/pre-Round-3 or cross-category** and must be reconciled in C3:
- `ev-energy-audit-2025`, `ev-energy-led-project` — category-level placeholders (no file)
- `ev-energy-metering-2025` (3.2.2) — source off-disk
- `ev-water-meter-q1` (3.1.2) — path mislocated under `/documents/cat2/`
- `ev-waste-audit-2025` — legacy misassociation under cat3
- `ev-transport-fleet-2025` (3.2.5) — `categoryCodes [cat3, cat6]`
- Stale water placeholders (`ev-water-audit-2025`, `ev-water-conservation`) — left untouched until an explicit Cat3 target exists (Cat3 C3 may now provide that target — to be decided by PO)

## 6. FY2569 Action-Plan Taxonomy Reconciliation

**Not performed in C1** — Cat3 action-plan activities (cat-3 = 6 activities per `action-plan-2569.json`) exist under the FY2569 plan; mapping to canonical 3.x codes by meaning is a **Phase C gate (C4)** activity, mirroring Cat2 C4. No FY2569 activities are invented in this phase.

## 7. Knowledge / Activity / Evidence Reuse

| Asset | Existing | Cat3 reuse |
|---|---|---|
| Knowledge practices | `practices.json`: `energy-smart` (3.2.1/3.2.2/3.2.3), `water-wise` (3.1.1/3.1.2/3.1.3), `paper-smart` (3.3.1–3.3.5), `green-mobility` (3.2.4/3.2.5), `green-meeting` (3.4.1/3.4.2) | **Reuse as-is** — all 15 cat3 indicators already linked to practices |
| Dashboards | `energy.json`, `water.json`, `fuel.json`, `paper.json` + `resource-indicator-map.json` | **Reuse with one-source rule** — strongest hook for 3.2.2/3.1.2/3.2.5/3.3.2 |
| Evidence | `evidence-index.json` + `fy2568-publication.json` | Add indicator-level cat3 entries in C3; reconcile legacy entries |
| Activities hub | `content/hubs.json` activities (pending slots) | Reuse as-is |
| Document center | `documents/[id].astro` enumerates `fy2568/cat3` 32 docs | Reuse as-is |

No duplicate content model, backend, CMS, or workflow engine is introduced.

## 8. Presentation Roles

| Route | Role | Notes |
|---|---|---|
| `/categories/cat3/` | Category hub: FY2568/FY2569 comparison panel + issues/indicators | Add `Cat3ManagementCycle` + `Cat3DomainSnapshot` (mirror Cat1/Cat2) in C5 |
| `/indicators/3.x.x/` | Indicator journeys 3.1.1–3.4.2 via `IndicatorTraceabilityExperience` | Add `cat3xCanonical` conditionals + `Cat3*Presentation` + shared `Cat3SourceDocuments`; 3.2.2 renders MEDIUM/image-only note |
| `/dashboard/` | Resource dashboards (energy/water/fuel/paper) | Already linked via `relatedDashboards`; one-source rule enforced |
| `/knowledge/` | 8-practice hub | Already links all 15 cat3 indicators |
| `/evidence/` | Evidence library (`?category=cat3`) | Gains indicator-level entries in C3 |

## 9. Phased Implementation Plan (Phase C gates)

1. **C1 — Source disposition + decision freeze**: this blueprint + `GO-CAT3-PHASE-A-SOURCE-DISPOSITION.md`. **DONE (2026-08-23).**
2. **C2 — Canonical contracts**: `src/data/category3/` → `targets.json`, `measures.json`, `data.json` (3.1.2/3.2.2/3.2.5/3.3.2), `compliance.json`, `meetings.json` + `category3-manifest.json` + `scripts/validate-category3-contracts.mjs` (mirror Cat2).
3. **C3 — Evidence mapping**: indicator-level `evidence-index.json` entries per §5.1 (status pending, provenance manifest sha); reconcile legacy cat3 entries (§5.3); PO decision on stale water placeholder Cat3 target.
4. **C4 — Action-plan taxonomy**: map cat-3 activities (6) to canonical 3.x codes by meaning + validator invariant.
5. **C5 — Presentation**: `src/utils/category3-presentation.ts`; `Cat3ManagementCycle`/`Cat3DomainSnapshot`; `Cat3*Presentation`/journeys + `Cat3SourceDocuments`; wire TH/EN category + indicator pages.
6. **C6 — About/Knowledge hooks**: verify reuse; regenerate search index.
7. **C7 — Tests + QA + freeze**: focused tests; `npm run check`/`test`/`build`/`validate`/`git diff --check`; runtime smoke TH/EN; closeout `docs/releases/GOFFICE2026_CAT3_FY2568_CLOSEOUT_*.md`.

## 10. Guardrails

- No fabrication: missing/thin/image-only evidence renders honestly; no invented baseline values, scores, approvals, or FY2569 activities.
- FY2568 = frozen historical baseline; FY2569 = current layer **only when verified**.
- No auto-scoring; coverage/readiness only (target outcomes shown as met/not-met context, never a score).
- Static First — JSON contracts; no database/API/backend/workflow/CMS.
- No local drive paths in public data; manifest + sha256 referenced.
- No production/VPS edits; GitHub Pages preview until PO approval.
- No duplicate registries (targets/measures/data/compliance/meetings) across category page, About, dashboards, evidence.
- One-source rule: dashboard and contract share the same numeric source.

## 11. Definition of Done (Phase C)

1. All 15 cat3 indicators correctly mapped; 3.2.2 MEDIUM and scan/garbled artifacts honestly disclosed.
2. `src/data/category3/` contracts + manifest validated; no invented values.
3. Indicator-level evidence entries for all 15 (pending verification); legacy entries reconciled.
4. `/categories/cat3/` shows management cycle + domain snapshot (TH+EN).
5. Every indicator has a runtime journey or honest evidence presentation (TH+EN).
6. Shared source-documents section on indicator pages; files open in new tab.
7. Action-plan cat3 activities mapped to canonical codes.
8. Search index regenerated; TH/EN parity maintained.
9. Tests + build + validate pass; GitHub Pages deployed; freeze closeout recorded.

## 12. Related Documents

- `docs/00-GREENOFFICE_PROJECT_CONSTITUTION.MD`
- `docs/GREENOFFICE2026_PLATFORM_BLUEPRINT_V5.md`
- `docs/GOFFICE2026_CATEGORY1_PLAYBOOK_FOR_CATEGORIES_2-7.md`
- `docs/data/GO-CAT3-PHASE-A-SOURCE-DISPOSITION.md`
- `src/data/criteria/{categories,issues,indicators}.json` · `src/data/fy2568-publication.json` · `src/data/criteria/baseline-2568.ts`
