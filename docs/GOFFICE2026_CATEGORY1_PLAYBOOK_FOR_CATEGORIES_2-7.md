# GOFFICE2026 — Category 1 Playbook for Categories 2–7

**Document Type:** Playbook / Working Template
**Version:** 1.0
**Status:** ACTIVE — baseline for replicating the Category 1 approach across Categories 2–7
**Date:** 2026-08-21
**Parent Authority:** `docs/00-GREENOFFICE_PROJECT_CONSTITUTION.MD` · `docs/GOFFICE2026_CATEGORY1_MANAGEMENT_BLUEPRINT_V1.md` · `docs/releases/GOFFICE2026_CAT1_FY2568_CLOSEOUT_2026-08-19.md`
**GitHub Pages:** https://numtip.github.io/goffice2026/ (deployed via `.github/workflows/deploy-pages.yml` on push to `master`)

---

## 1. Purpose

This document summarizes **everything done in Category 1** and converts it into a **repeatable working template** for applying the same approach to Categories 2–7.

Category 1 was implemented as an **interconnected environmental management domain**, not as 18 isolated evidence pages. The core loop:

> **Define → Govern → Identify → Comply → Measure → Improve → Review**

Category 2–7 work should **reuse the same contracts, presentation utilities, shared components, and design conventions** instead of inventing new patterns per category.

---

## 2. Category 1 — Final State (the summary)

### 2.1 Scope delivered

| Item | Value |
|------|-------|
| Indicators | 7 issues / **18 indicators** (1.1.1–1.7.2) |
| Runtime journeys | **18 / 18** (TH + EN) |
| Evidence completeness | **16 / 18** (2 honest gaps: 1.2.2, 1.5.3 — never fabricated) |
| Category page | `/categories/cat1/` — management cycle + FY2568 domain snapshot + issue/indicator list |
| About hub | `/about/` foundation pages consume the same canonical contracts |
| Data layer | 9 canonical JSON contracts under `src/data/category1/` |
| FY2568 baseline | `FROZEN READ-ONLY` — never presented as FY2569 |

### 2.2 The 7-issue management loop (with updated official titles)

| Issue | Title (TH/EN) | Leading indicator |
|-------|---------------|-------------------|
| 1.1 | การกำหนดแนวทางการดำเนินงานสำนักงานสีเขียว / Defining Green Office Operational Guidelines | 1.1.1 |
| 1.2 | คณะทำงานด้านสิ่งแวดล้อม / Environmental Working Team | 1.2.1 |
| 1.3 | การระบุประเด็นปัญหาทรัพยากรและสิ่งแวดล้อม / Identification of Resource and Environmental Issues | 1.3.1 |
| 1.4 | กฎหมายและข้อกำหนดอื่นๆ ที่เกี่ยวข้อง / Relevant Laws and Regulations | 1.4.1 |
| 1.5 | ข้อมูลก๊าซเรือนกระจก / Greenhouse Gas Data | 1.5.1 |
| 1.6 | แผนการดำเนินงานและโครงการเพื่อมุ่งสู่การลดก๊าซเรือนกระจกของหน่วยงาน / GHG Reduction Plans and Projects | 1.6.1 |
| 1.7 | การทบทวนฝ่ายบริหาร / Management Review | 1.7.1 |

---

## 3. Architecture Pattern (what makes it work)

### 3.1 Three-layer pattern

```text
src/data/category1/*.json          → canonical, normalized, verified facts (Static First)
        ↓
src/utils/category1-*.ts           → read-only view-models / presentation helpers
        ↓
src/components/**/*.astro          → Astro views (category page, indicator journeys)
```

**Rule:** Indicator pages are **views of canonical entities**, never independent data silos. Dashboards reuse the same numeric source (one-source rule for targets/GHG).

### 3.2 Canonical data contracts

Location: `src/data/category1/`

| File | Domain | Indicators |
|------|--------|-----------|
| `category1-manifest.json` | Contract index + statuses + missing indicators | all |
| `activities-aspects.json` | 1.1 scope (canonical) · 1.3 legacy rows | 1.1.1, 1.3.x |
| `environmental-aspects-2568.json` | Canonical FY2568 1.3 register (L/M/H) | 1.3.1–1.3.3 |
| `laws.json` | Legal register | 1.4.1 |
| `compliance.json` | Compliance evaluation | 1.4.2 |
| `targets.json` | 1.1.3 targets (6 domains) | 1.1.3 |
| `ghg.json` | GHG inventory + performance | 1.5.1–1.5.2 |
| `projects.json` | 1.6.1 / 1.6.2 projects (1.3.3 links resolve here) | 1.6.x |
| `management-review.json` | 1.7.1 quorum · 1.7.2 agenda/decisions | 1.7.x |
| `environmental-committee.json` | 1.2 committee roster | 1.2.1 |

**Common schema:**

```json
{
  "schemaVersion": "1.0.0",
  "domain": "<domain-id>",
  "updated": "YYYY-MM-DD",
  "year": 2568,
  "status": "normalized-verified | normalized-partial | reference-only",
  "governance": "<blueprint ref>",
  "sources": [{ "ref": "<relative path>", "role": "primary|supporting", "inspection": "content-verified|header-verified|filename-only" }],
  "records": [],
  "gaps": [{ "indicator": "1.2.2", "status": "MISSING", "note": "..." }]
}
```

**Truthfulness rules (enforced by validator):**
1. No invented data — every value traces to a source file.
2. MISSING stays MISSING (appears only in `gaps`, never as records).
3. No FY2569 leakage — all contracts are `year: 2568`.
4. No official Green Office score — coverage/readiness only.
5. No local drive paths — `sourceRef` relative only.
6. Anomalies documented, not resolved by inference.

### 3.3 Presentation utilities

Location: `src/utils/category1-*.ts`

| File | Purpose |
|------|---------|
| `category1-presentation.ts` | `CAT1_MANAGEMENT_CYCLE`, `buildCat1DomainSnapshot`, indicator→domain map, journey links, `CAT1_YEAR` |
| `category1-foundation-presentation.ts` | 1.1 scope/policy/targets/plan views |
| `category1-committee-presentation.ts` | 1.2 committee/roles |
| `category1-legal-presentation.ts` | 1.4 laws/compliance presentation |
| `category1-ghg-presentation.ts` | 1.5 GHG inventory + performance (`buildGhgPerformance`) |
| `category1-projects-presentation.ts` | 1.6 plan/projects (`buildProjectPortfolio`, `ghgImpactPresentation`) |
| `category1-management-review-presentation.ts` | 1.7 quorum/meetings |

---

## 4. Reusable Components (the template to replicate)

### 4.1 Category page components

| Component | Route | What it renders |
|-----------|-------|-----------------|
| `src/components/categories/Cat1ManagementCycle.astro` | `/categories/cat1/` | 7-step semantic `<ol>` card grid (`md:grid-cols-2`, 1-col mobile), each step → leading indicator |
| `src/components/categories/Cat1DomainSnapshot.astro` | `/categories/cat1/` | FY2568 verified-fact cards per issue (1.1–1.7), 2-col grid on `md+`, labeled "coverage context, never a score" |

Both are wired in `src/pages/categories/[id].astro` and `src/pages/en/categories/[id].astro` inside `{category.code === 'cat1' && (...)}`.

### 4.2 Indicator page components

| Component | Purpose |
|-----------|---------|
| `src/components/indicators/IndicatorTraceabilityExperience.astro` | Shared wrapper for ALL indicator pages — requirement → presentation → source docs → evidence → nav |
| `Cat1ContractContext.astro` | FY2568 contract fact panel + honest MISSING notice for 1.2.2/1.5.3 |
| `Cat1SourceDocuments.astro` | **Shared "เอกสารต้นฉบับสำหรับการตรวจสอบ" section** — per issue group (1.1–1.7), driven by `fy2568-publication.json` manifest + editorial `DOC_DESCRIPTIONS` (TH/EN per file) |
| `Cat1FoundationPresentation.astro` | 1.1.x domain presentation |
| `Cat1GovernancePresentation.astro` | 1.2.x presentation |
| `Cat1EnvironmentalAssessment.astro` / `Cat1EnvironmentalAssessmentJourney.astro` | 1.3.x presentation (incl. 1.3.1 Excel source button) |
| `Cat1LegalPresentation.astro` / `Cat1LegalRegisterJourney.astro` / `Cat1LegalComplianceJourney.astro` | 1.4.x presentation |
| `Cat1GhgPresentation.astro` / `Cat1GhgInventoryJourney.astro` / `Cat1GhgPerformanceJourney.astro` | 1.5.x presentation |
| `Cat1ProjectsPresentation.astro` / `Cat1ProjectsPlanJourney.astro` / `Cat1ProjectsImprovementJourney.astro` | 1.6.x presentation (GHG gap ↔ projects ↔ management review linkage) |
| `Cat1ManagementReviewPresentation.astro` / `Cat1ManagementReviewQuorumJourney.astro` / `Cat1ManagementReviewMeetingJourney.astro` | 1.7.x presentation |
| `Cat1AnnualPlanJourney.astro` | 1.1.4 annual plan (FY2569 Excel + FY2568) |

### 4.3 Publication manifest (source of truth for document lists)

`src/data/fy2568-publication.json` — deterministic manifest of every published FY2568 document (path, title, type, sizeBytes, sha256, url), grouped by category. `Cat1SourceDocuments` filters it by folder prefix per issue group. **Never hardcode filenames on indicator pages; always read from the manifest.**

---

## 5. Design / UX Conventions (standardize these in Cat 2–7)

1. **Responsive 2-column layout:** content grids use `grid grid-cols-1 gap-* md:grid-cols-2` (1 column on mobile).
2. **Button readability:** all primary buttons use `text-white` on `bg-primary` — **never** `text-on-primary` (that token is not defined in the palette and produces unreadable text).
3. **Documents open in new tab:** all original-file links use `target="_blank" rel="noopener noreferrer"` — **no `download` attribute** (evaluators need to view, not download). Button labels say "เปิดเอกสารต้นฉบับ / Open original document".
4. **One source-document section per page:** shared `Cat1SourceDocuments` supplies the section; inline duplicate "เอกสารต้นฉบับ" sections were **removed** from 1.4.1/1.4.2 journeys to avoid duplication. 1.3.1 keeps its own inline Excel button.
5. **Semantic + a11y:** `ol`/`ul` with `role="list"`, `focus-visible` rings on links, `min-h-11` tap targets, `prefers-reduced-motion` respected, TH/EN inline bilingual labels via `t(th, en)`.
6. **Honesty first:** missing evidence renders a calm amber "not available" notice from contract `gaps` — never filled in.
7. **Per-file descriptions:** every document in the source-document section carries a TH/EN `description` (in `DOC_DESCRIPTIONS`) so evaluators understand what the file is.

---

## 6. Step-by-Step Playbook for Categories 2–7

Follow the same phases as Category 1. For each category `N` (2→7):

### Step 0 — Source disposition (audit first)
- Inventory the FY2568 source folder (like `GO-CAT1-PHASE-A-SOURCE-DISPOSITION.md`).
- Resolve duplicate PDF/DOCX pairs; confirm canonical files.
- Record which indicators have **no dedicated source** → they become honest `MISSING` gaps.

### Step 1 — Criteria + indicator mapping
- Read `src/data/criteria/issues.json` + `indicators.json` for the category (issue list + indicator codes).
- Confirm canonical indicator→issue→category mapping; repair any wrong evidence tags (P0).

### Step 2 — Canonical data contracts
- Create `src/data/categoryN/` with one JSON contract per domain, following the common schema in §3.2.
- Register in a `categoryN-manifest.json` (index + statuses + gaps).
- Add a validator script `scripts/validate-categoryN-contracts.mjs` (mirror `validate-category1-contracts.mjs`).

### Step 3 — Presentation utilities
- Create `src/utils/categoryN-presentation.ts` (and domain helpers as needed) — read-only view-models over the contracts.
- Define the category's own management-cycle step list (`CATN_MANAGEMENT_CYCLE`) using the **official issue titles** from `issues.json`.

### Step 4 — Category page panels
- Create `CatNManagementCycle.astro` and `CatNDomainSnapshot.astro` (copy the Cat1 components, swap data source).
- Wire into `src/pages/categories/[id].astro` + `src/pages/en/categories/[id].astro` with `{category.code === 'catN' && (...)}`.

### Step 5 — Indicator journeys
- For each indicator create a `CatN*Journey.astro` (or a shared `CatN*Presentation.astro` for simpler indicators).
- Wire into `IndicatorTraceabilityExperience.astro` using the same conditional pattern:
  `{indicator.categoryCode === 'catN' && catNxCanonical && (...)}`.
- Add the shared **source-documents** section: generalize `Cat1SourceDocuments` → `CatNSourceDocuments` (or make it category-aware via a `categoryCode` prop and `fy2568-publication.json` grouping).

### Step 6 — About hub mapping (when the category has an About page)
- Map `/about/*` foundation pages to the same canonical contracts (no duplicate registries).

### Step 7 — Tests + validation
- Mirror the Category 1 test scripts:
  - `scripts/test-categoryN-*.mjs` — structural TH/EN parity, a11y markers, honesty (MISSING stays missing), view-model assertions.
- Add the scripts to `package.json` `test` chain.

### Step 8 — Quality gates (reuse the full checklist)
- `npm run check` · `npm test` · `npm run build` · `npm run validate` · `npm run qa:seo` · `git diff --check`.
- Runtime QA: smoke all routes TH + EN, mobile, links.
- Confirm no FY2568→FY2569 leakage, no official scoring, no local paths.

### Step 9 — Release
- Commit to `master` → GitHub Pages auto-deploys via `deploy-pages.yml` (quality → build → deploy).
- Record in `docs/releases/` (mirror `GOFFICE2026_CAT1_FY2568_CLOSEOUT_2026-08-19.md`).
- Production (`goffice.mju.ac.th`) remains untouched until Product Owner approval.

---

## 7. Category-Specific Notes (2–7)

| Category | Issues | Indicators | Reuse hooks |
|----------|--------|------------|-------------|
| 2 การสื่อสารและสร้างจิตสำนึก | 2.1–2.2 | 2.1.x–2.2.x | Training registry, campaigns, PR materials; evidence may be mostly PDF/photo — many `MISSING` until sources verified |
| 3 การใช้ทรัพยากรและพลังงาน | 3.1–3.4 | 3.1.x–3.4.x | **Generated dashboards already exist**: `energy.json`, `water.json`, `fuel.json`, `paper.json`, `recycling_rate.json` → one-source rule with dashboards is the strongest hook |
| 4 การจัดการของเสีย | 4.1–4.2 | 4.1.x–4.2.x | `waste.json` dashboard; waste + wastewater domains |
| 5 สภาพแวดล้อมและความปลอดภัย | 5.1–5.5 | 5.1.x–5.5.x | Indoor air/light/noise/livability/emergency — measurement data likely needed from sources |
| 6 การจัดซื้อและจัดจ้าง | 6.1–6.2 | 6.1.x–6.2.x | Green procurement records; procurement evidence |
| 7 ความต่อเนื่อง/ยกระดับ | 7.1–7.2 | 7.1.x–7.2.x | Separate scoring model; internal audit + advancement — build last, reuse pattern only |

---

## 8. Known Gaps / Guardrails (apply to every category)

- **Do not fabricate.** Missing source = honest amber gap journey, not a filled page.
- **Do not treat FY2568 as FY2569** — year selector must never copy FY2568 values forward.
- **Do not auto-score.** UI shows evidence coverage/readiness only.
- **No backend/database** for Category data — Static First (JSON contracts).
- **No production edit** — GitHub Pages preview only until PO approves.
- **Do not duplicate registries** (projects, committee, targets) between category pages, About hub, and dashboards — one canonical file, many views.

---

## 9. Definition of Done (per category)

1. All indicators have correct canonical mapping.
2. FY2568 source disposition complete; `MISSING` indicators disclosed.
3. Canonical contracts validated by script; no invented values.
4. Category page shows management cycle + domain snapshot (TH + EN).
5. Every indicator has a runtime journey or honest evidence-gap journey (TH + EN).
6. Shared source-documents section present on indicator pages, opening files in a new tab.
7. One-source rule honored (targets/GHG/dashboard share the same values).
8. Tests + build + validate pass; GitHub Pages deployed; release recorded in `docs/releases/`.

---

## 10. Related Documents

- `docs/00-GREENOFFICE_PROJECT_CONSTITUTION.MD`
- `docs/GOFFICE2026_CATEGORY1_MANAGEMENT_BLUEPRINT_V1.md`
- `docs/architecture/GOFFICE2026_CATEGORY1_DATA_CONTRACTS.md`
- `docs/releases/GOFFICE2026_CAT1_FY2568_FREEZE.md`
- `docs/releases/GOFFICE2026_CAT1_FY2568_CLOSEOUT_2026-08-19.md`
- Reconciliation reports under `docs/data/GO-CAT1-*.md`
- `.github/workflows/deploy-pages.yml`
