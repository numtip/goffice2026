# GOFFICE2026 — Category 1 FY2568 Freeze Contract

**Status:** `CAT1 FY2568 = FROZEN READ-ONLY BASELINE`  
**Freeze date:** 2026-08-19 (Asia/Bangkok)  
**Supersedes provisional wording only; does not alter verified FY2568 facts.**

> Durable authority so future agents do not reinterpret or overwrite the CAT1 FY2568 baseline.  
> Prior closeout: `docs/releases/GOFFICE2026_CAT1_FY2568_CLOSEOUT_2026-08-19.md` (`CAT1 FY2568 BASELINE_RE-CLOSED`).

---

## Accepted authority (frozen at re-close)

| Item | Value |
|------|-------|
| Re-close SHA | `ac1ecac` |
| Live HEAD at freeze | `68e29eb` |
| Pages workflow | **32273509983** — SUCCESS |
| Preview URL | https://numtip.github.io/goffice2026/ |
| Production | https://goffice.mju.ac.th/ — **deployed v1.7.0** @ `380bf3b` (2026-08-20) |

---

## Scope

**Category 1 only** — indicators **1.1.1 through 1.7.2** (18 indicators), domains 1.1–1.7.

Out of scope for this freeze: Category 2, Category 7, VPS/production, FY2569 implementation.

---

## Coverage (frozen semantics)

| Layer | Count | Rule |
|-------|-------|------|
| **Runtime presentation** | **18 / 18** | Every indicator has a dedicated journey or explicit evidence-gap journey (TH + EN) |
| **Evidence completeness** | **16 / 18** | Two indicators remain **evidence-incomplete** — not fabricated |

**Evidence gaps (must remain gaps until real sources):**

- **1.2.2** — role-understanding interview / sampling (stub `-สัมภาษณ์-` only)
- **1.5.3** — GHG knowledge / training evidence

Do **not** convert these to complete or call them “implemented evidence.”

---

## Canonical `/about/` foundation mapping

`/about/` = Green Office Management Foundation Hub — organizational views over the same CAT1 contracts as indicator pages.

| Route | CAT1 | Contract |
|-------|------|----------|
| `/about/scope/` | 1.1.1 | `activities-aspects.json` |
| `/about/policy/` | 1.1.2 | `activities-aspects.json` |
| `/about/goals/` | 1.1.3 | `targets.json` |
| `/about/action-plan/` | 1.1.4 (+ FY2569 Excel UI section, year-separated) | `projects.json` (`proj-plan-1`) |
| `/about/committee/` | 1.2.1 (+ 1.2.2 gap disclosure) | `environmental-committee.json` |
| `/about/feedback/` | — | Own domain |

No duplicate committee, target, or plan registries.

---

## Canonical contracts and manifest

**Manifest:** `src/data/category1/category1-manifest.json` — **9 domains**

| Domain | File | Primary indicators |
|--------|------|-------------------|
| activities-aspects | `activities-aspects.json` | 1.1.1, 1.1.2 |
| targets | `targets.json` | 1.1.3 |
| projects | `projects.json` | 1.1.4, 1.6.1, 1.6.2 |
| environmental-committee | `environmental-committee.json` | 1.2.1 |
| environmental-aspects-2568 | `environmental-aspects-2568.json` | 1.3.1–1.3.3 |
| laws | `laws.json` | 1.4.1 |
| compliance | `compliance.json` | 1.4.2 |
| ghg | `ghg.json` | 1.5.1, 1.5.2 |
| management-review | `management-review.json` | 1.7.1, 1.7.2 |

**Validator:** `scripts/validate-category1-contracts.mjs`  
**Reconciliation reports:** `docs/data/GO-CAT1-1.*` and `GO-CAT1-PHASE-A-SOURCE-DISPOSITION.md`  
**Blueprint:** `docs/GOFFICE2026_CATEGORY1_MANAGEMENT_BLUEPRINT_V1.md`

---

## Year separation

| Year | Role |
|------|------|
| **FY2568** | **Frozen read-only baseline** — all `src/data/category1/*.json` contracts are year **2568** only |
| **FY2569** | Future **overlay** — reuse schema and presentation; add **separate year-qualified records** only after verification. Must not replace or overwrite FY2568 canonical records. |

FY2569 Excel / dashboard UI sections are operational overlays, not CAT1 contract facts.

---

## Known gaps and anomalies (frozen disclosure)

**Gaps (do not infer):** 1.2.2 interview · 1.5.3 GHG training · committee roster OCR (pages 2–7) · MR #2 occurrence-only · GHG +4.81% not reviewed at MR #1 · proj names absent from MR minutes · Dec GHG derived · lr-1.3 TDS anomaly · 1.6.1 ERP schedule external.

**Anomalies (documented, not silently fixed):** septic/E42 0.02 tCO₂e delta · ea row register vs priority · proj-2 KPI table 10 vs 11 · no measured kWh/tCO₂e on projects · compliance interview stub unavailable.

---

## Mutation policy

### FY2568 CAT1 MAY change ONLY for

1. Newly supplied **source evidence** (with reconciliation doc update)
2. **Verified factual correction** (with trace to source)
3. **Broken link / runtime defect**
4. **Contract inconsistency** against this freeze or validator
5. **Security / accessibility defect**

Each change must update reconciliation or freeze metadata if authority shifts.

### FY2568 CAT1 MUST NOT change for

- Style or presentation preference alone
- Speculative normalization or inference
- **FY2569 data** written into FY2568 contracts
- Inferred facts, imputed percentages, or interview results
- Official Green Office **score fabrication**
- **Duplicate registry creation** (committee, targets, plan, projects)
- Removing or downgrading explicit **1.2.2 / 1.5.3** evidence gaps without source proof
- Replacing FY2568 canonical records with FY2569 records

---

## FY2569 reuse policy

1. Reuse contract schema, manifest shape, and presentation journeys.
2. Import verified FY2569 records into **new year-qualified entries** or approved overlay paths — never mutate frozen FY2568 JSON in place for current-year facts.
3. Fill 1.2.2 / 1.5.3 only when dedicated FY2568 or FY2569 sources exist and reconciliation is written.
4. Category 2 / 7 work proceeds independently of this freeze.

---

## Regression guards

- `scripts/validate-category1-contracts.mjs` — 9 domains, year 2568, missing indicators in gaps only
- `scripts/test-category1-fy2568-freeze.mjs` — freeze doc + manifest authority + evidence gaps preserved
- `scripts/test-about-cat1-reconciliation.mjs` — About hub mapping

---

## Verdict

**`CAT1 FY2568 AUTHORITY_FROZEN`** — Category 1 FY2568 baseline is locked as read-only authority: 18/18 runtime journeys, 16/18 evidence-complete, honest gaps for 1.2.2 and 1.5.3, About hub and nine contracts canonical. Next allowed work: **Category 2** or **FY2569 overlay** per reuse policy above.
