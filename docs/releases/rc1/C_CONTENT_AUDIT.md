# C — Content RC-1 Audit

**Date:** 2026-07-27  
**Auditor:** Subagent C (Content)  
**Branch:** `rapid/rc-release` (`ffb7749` — workspace at audit time; requested baseline `rapid/rc-content` @ `61b5fa9`)  
**Scope:** TH/EN route parity (`src/pages` vs `src/pages/en`), translation gaps, user-visible placeholders, hub routes (`/news`, `/activities`, `/knowledge`, `/about/*`), OCR warnings, About hub content consistency  
**Method:** File-tree diff, grep (`summaryEn`, `Placeholder|TODO|Demo|Lorem`, `OCR`), source review of About pages + `document-summaries.json`, `content.json`, `hubs.json`, `pages.json`  
**Constraint:** Audit only — no content invented.

---

## Executive Verdict

> **FAIL**

**Reason:** Required About metadata routes are incomplete (`/about/feedback/` marked CREATED in `pages.json` but no page files exist). One document summary lacks English translation (`summaryEn: null`). TH About sub-pages omit per-section OCR banners present on EN equivalents for policy, committee, and goals. Intentional pending/placeholder copy is correctly labeled on hubs and landing but remains PO-visible.

**P0 count:** 1  
**P1 count:** 4  
**P2 count:** 5  

---

## 1. TH/EN Route Parity (`src/pages`)

### Content routes (RC-1 scope)

| Route pattern | TH file | EN file | Status |
|---------------|---------|---------|--------|
| `/news/` | `src/pages/news/index.astro` | `src/pages/en/news/index.astro` | ✅ PASS |
| `/activities/` | `src/pages/activities/index.astro` | `src/pages/en/activities/index.astro` | ✅ PASS |
| `/knowledge/` | `src/pages/knowledge/index.astro` | `src/pages/en/knowledge/index.astro` | ✅ PASS |
| `/about/` | `src/pages/about/index.astro` | `src/pages/en/about/index.astro` | ✅ PASS |
| `/about/scope/` | `src/pages/about/scope.astro` | `src/pages/en/about/scope.astro` | ✅ PASS |
| `/about/policy/` | `src/pages/about/policy.astro` | `src/pages/en/about/policy.astro` | ✅ PASS |
| `/about/goals/` | `src/pages/about/goals.astro` | `src/pages/en/about/goals.astro` | ✅ PASS |
| `/about/committee/` | `src/pages/about/committee.astro` | `src/pages/en/about/committee.astro` | ✅ PASS |
| `/about/action-plan/` | `src/pages/about/action-plan.astro` | `src/pages/en/about/action-plan.astro` | ✅ PASS |
| `/about/feedback/` | **missing** | **missing** | ❌ FAIL |
| `/about/certification/` | **missing** | **missing** | ⚠️ Expected (`NOT_CREATED` in `pages.json`) |

All three hub routes share `_HubPage.astro` + `hubs.json` with full TH/EN strings — no invented events.

### Structural differences (non-blocking)

| TH-only | EN-only | Notes |
|---------|---------|-------|
| `dashboard.astro` | `dashboard/index.astro` | Same URL, different file layout |
| `documents.astro` | `documents/index.astro` | Same URL, different file layout |
| `evidence.astro` | `evidence/index.astro` | Same URL, different file layout |
| `news/_HubPage.astro` | — | Shared partial imported by EN hubs |

---

## 2. Missing Translations

### `document-summaries.json` — `summaryEn: null`

| documentId | relatedPage | reviewStatus | Impact |
|------------|-------------|--------------|--------|
| `doc-feedback-channels` | `about-feedback` | `VERIFIED_TEXT` | EN route would fall back to Thai body if page existed; page itself missing |

**All other summaries (7/8):** `summaryEn` populated.

### Locale files (`th.json` / `en.json`)

Key structure is symmetric for `home.nav.*` (including `news`, `activities`, `knowledge`, `about`). No missing hub nav keys detected. Minor ordering-only diff in flattened key compare — no RC-blocking locale gap for audited routes.

---

## 3. User-Visible Placeholder Scan

**Pattern:** `Placeholder|TODO|Demo|Lorem` in `src/` (UI-facing)

| Hit | User-visible? | Assessment |
|-----|---------------|------------|
| `ActivitiesScene.astro` — "Pending official publication", "Historical information", dashed cards | ✅ Yes (landing) | Intentional pending-state copy; localized via `th.json` / `en.json` when props passed |
| `news/_HubPage.astro` + `hubs.json` — pending banners and dashed slot cards | ✅ Yes | Intentional; no invented articles |
| `about/committee.astro` (TH+EN) — committee photo/org chart pending | ✅ Yes | Explicit ⏳ pending notice |
| `about/scope.astro` (TH+EN) — workspace photo pending | ✅ Yes | Explicit ⏳ pending notice |
| Evidence pages — `status === 'placeholder'` UI | ✅ Yes | By design; dashed cards + pending labels |
| `search.astro` — HTML `placeholder=` attribute | No | Form hint, not content placeholder |
| `evidence-index.json`, `generated/*.json`, review queue | No | Data/metadata, not rendered as lorem |

**No hits:** `Lorem ipsum`, `TODO:`, `FIXME`, `Demo mode` in UI source.

---

## 4. OCR Warnings

### Data layer (`document-summaries.json`)

| reviewStatus | Count | Documents |
|--------------|-------|-----------|
| `OCR_DERIVED_NEEDS_VERIFICATION` | 6 | policy, policy-review, committee-order, goals, scope, action-plan |
| `DUPLICATE_FILE_NEEDS_REVIEW` | 1 | committee-understanding |
| `VERIFIED_TEXT` | 1 | feedback-channels |

Global note in JSON: *"Summaries are based on OCR-derived content and require human verification."*

### Page rendering — per-section OCR banner (`isOcr` block)

| Page | TH | EN |
|------|----|----|
| `about/policy` | ❌ Missing (hub notice only) | ✅ Present |
| `about/goals` | ❌ Missing (FY baseline notice only) | ✅ Present |
| `about/committee` | ❌ Missing | ✅ Present |
| `about/action-plan` | ✅ Present | ✅ Present |
| `about/scope` | ✅ Present | ✅ Present |

**Hub-level OCR notices** in `content.json` cover policy, scope, and action-plan pages. Committee and goals rely on page-level gaps on TH.

**Feedback document:** Embedded text — correctly marked `VERIFIED_TEXT`; notes flag PII redaction before publication (no OCR banner needed).

---

## 5. About Hub Content Consistency

| Check | Status | Notes |
|-------|--------|-------|
| Shared `content.json` page defs | ✅ | TH/EN index use same 5 topic links (scope, policy, goals, committee, action-plan) |
| `AboutPageShell` breadcrumb nav | ✅ | 6 pages (index + 5 topics); excludes feedback/certification |
| EN summary rendering | ✅ | `summaryEn ?? summaryTh` on EN about sub-pages |
| TH summary rendering | ✅ | `summaryTh` only (correct for TH locale) |
| `keyPoints` lists | ⚠️ | English-only bullets on committee/action-plan/scope (both locales) |
| Duplicate role doc warning | ✅ | Committee TH+EN surfaces duplicate-file pending for indicator 1.4.2 |
| Scope indicator 1.1.2 gap | ✅ | Pending note on scope section (document not in intake) |
| Feedback page vs metadata | ❌ | `pages.json` status `CREATED`; summary + PDF ready; **no route or `content.json` entry** |
| Certification page | ⚠️ | `NOT_CREATED` — acknowledged gap |

---

## Findings Summary

### P0 — Blockers

| ID | Issue | Evidence |
|----|-------|----------|
| C-P0-01 | **`/about/feedback/` route missing (TH+EN)** | `pages.json` L133–150 status `CREATED`; no `src/pages/about/feedback.astro` or `src/pages/en/about/feedback.astro`; `doc-feedback-channels` summary exists |

### P1 — High (PO review before RC sign-off)

| ID | Issue | Evidence |
|----|-------|----------|
| C-P1-01 | **`summaryEn: null` for feedback channels** | `document-summaries.json` L138 |
| C-P1-02 | **TH About pages missing per-section OCR banners** | `policy.astro`, `goals.astro`, `committee.astro` (TH) lack `isOcr` block present on EN twins |
| C-P1-03 | **PII in feedback source doc** | Summary keyPoints + `documents.json` notes: personal email, phone — redaction required before public page |
| C-P1-04 | **Committee role-understanding duplicate** | `DUPLICATE_FILE_NEEDS_REVIEW`; PO must confirm correct doc for indicator 1.4.2 |

### P2 — Medium

| ID | Issue | Evidence |
|----|-------|----------|
| C-P2-01 | Landing activities scene shows placeholder cards | `ActivitiesScene.astro` — intentional pending UX |
| C-P2-02 | Committee photo / org chart pending | Both locales |
| C-P2-03 | Scope workspace photo pending | Both locales |
| C-P2-04 | `keyPoints` not localized on TH pages | English bullets on TH committee/scope/action-plan |
| C-P2-05 | EN goals historical notice shorter than TH OCR FY notice | Minor copy parity gap |

---

## Required PO Review Items

1. **Approve or defer `/about/feedback/`** — create TH+EN pages using existing `doc-feedback-channels` summary, or downgrade `pages.json` status to `NOT_CREATED`.
2. **Provide English summary** for feedback channels (`summaryEn`) or accept Thai fallback on EN route.
3. **Redact PII** (email `raemju@gmail.com`, phone `0 5387 3400`, named contact) before public feedback page.
4. **Verify OCR-derived values** on signed PDFs: policy dates, goals targets (2568 baseline), scope area (8,533 sq.m.), action-plan dates/names.
5. **Confirm committee role-understanding document** for indicator 1.4.2 (duplicate SHA vs meeting minutes).
6. **Supply or defer** committee photo, org chart, scope building photo.
7. **Acknowledge intentional pending hubs** (news/activities/knowledge) and landing activity placeholders for RC release notes.

---

## Pass Checks

| Check | Status |
|-------|--------|
| `/news`, `/activities`, `/knowledge` TH+EN exist | ✅ PASS |
| `/about/*` core 6 routes TH+EN exist | ✅ PASS |
| Hub content uses pending slots only (no invented events) | ✅ PASS |
| OCR data flagged in summaries JSON | ✅ PASS |
| No Lorem/TODO/Demo in user-facing UI | ✅ PASS |
| `/about/feedback/` TH+EN | ❌ FAIL |
| EN translation completeness (summaries) | ❌ FAIL (1 null) |
| TH/EN OCR banner parity on About sub-pages | ❌ FAIL |

---

*End of Content RC-1 Audit.*
