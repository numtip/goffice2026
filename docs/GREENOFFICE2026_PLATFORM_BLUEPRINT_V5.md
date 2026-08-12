# GREEN OFFICE 2026 — PLATFORM BLUEPRINT V5.0

**Project:** Green Office 2026 — Environmental Communication & Assessment Evidence Platform \
**Repository:** `numtip/goffice2026` \
**Status:** ACTIVE — CANONICAL OPERATIONAL BASELINE \
**Updated:** 2026-08-12 (Asia/Bangkok) \
**Supersedes:** Blueprint V4.0 where inconsistent \
**Production baseline:** v1.5.1 / `2bfd7cadebe5c7472205c6316a94ab6e56f547bd` \
**Revision (2026-08-12):** adds **GO-MOTION-V1** — Motion & Interaction Enhancement Layer (Section 11); reconciles production baseline to v1.5.1 and the Engage canonical web / Knowledge 8-practice unification (daily close `bad9d1a`, 2026-08-11).

---

## 1. Product Boundary

> Green Office 2026 is a public environmental communication, performance-visualisation, and assessment-evidence navigation platform. It is not an organisational transaction, approval, or document-management system.

The platform presents approved public information, helps users navigate from a Green Office criterion to supporting evidence, and directs authenticated documents to Microsoft 365. Document Center remains the document registry and document-management boundary.

**Out of scope:** approval workflows, custom CMS/admin backend, ERP-like processes, custom DMS features, runtime database on the VPS, microservices, queues, GraphQL, Redis, and Kubernetes. Any exception requires an ADR and Product Owner approval.

## 2. Operating Architecture

| Concern | Canonical implementation |
|---|---|
| Public frontend | Astro static site, Tailwind CSS, minimal client JavaScript |
| Motion & interaction | GO-MOTION-V1 progressive-enhancement layer — additive, reduced-motion mandatory (Section 11) |
| Public data | Markdown/MDX, JSON/CSV, generated JSON from validated Excel |
| Resource pipeline | Excel → normalize → validate → generated JSON → dashboard |
| Evidence files | SharePoint / OneDrive; access controlled there |
| Evidence navigation | Static metadata, canonical IDs, public-safe links and availability states |
| Preview | GitHub Pages — `https://numtip.github.io/goffice2026/` |
| Production | Linux VPS + Nginx — `https://goffice.mju.ac.th/` |
| Release model | Immutable release directory plus atomic `current` symlink cutover |

No public page may expose an unavailable local/spreadsheet path as a working file link. A missing file must render as unavailable, with truthful metadata retained where appropriate.

## 3. Information Model and User Journeys

The official taxonomy is **7 categories / 24 issues / 65 indicators**. The public evidence path is:

```text
Category → Indicator → Evidence metadata → authorised document access
```

Required journeys:

1. **Executive:** Dashboard → KPI/trend → interpretation → related evidence.
2. **Auditor:** Category or indicator → requirement/implementation summary → evidence status → authorised document access.
3. **Staff/public:** Landing/news/knowledge → action or outcome → relevant category/evidence.

Thai is the default public experience and English lives under `/en/`. Any feature that changes data interpretation, navigation, evidence status, or filtering must preserve TH/EN parity.

## 4. Production Capabilities at v1.5.1

| Capability | Operational state |
|---|---|
| Bilingual landing, about, communication and knowledge routes | Deployed |
| Executive and resource dashboards | Deployed; ECharts 6 experience and dashboard V2 work included |
| Taxonomy navigation | 7 / 24 / 65 structure deployed |
| Indicator and evidence hubs | Deployed with traceability markers and source-availability states |
| Evidence filters | Client-side query filters for category/indicator, including `?indicator=3.2.2` |
| Public-link safety | Deployed; unavailable sources do not render bogus `.xlsx` links |
| Engage visual system | Deployed — 8 canonical web WebP assets (`web/<id>-master.webp`), uniform card grid, TH/EN parity; legacy `*2.webp` retained as rollback-only |
| Knowledge hub | Deployed — Landing and Knowledge unified on one canonical 8-practice system |
| GitHub Pages preview and VPS production | Deployed from the v1.5.1 source baseline |
| Data sync | Separate controlled pipeline; not part of a release cutover |

## 5. Data and Evidence Truthfulness Rules

1. Resource KPIs come only from the validated generated dataset; components must not duplicate or invent KPI values.
2. Partial-year data must be labelled as partial, pending, or requiring verification; it must not be presented as a conclusive full-year outcome.
3. FY2569 water and electricity are publishable partial data through July; fuel and paper have no FY2569 input at this baseline. Waste/GHG FY2569 forms may be templates and are not evidence of completed data.
4. An evidence record is not verified merely because it belongs to a category. Indicator-level mapping must be explicit.
5. Only **10 of 65** indicators currently have direct indicator-level mapping. This is a completion gap, not a reason to hide or overstate the evidence centre.
6. SharePoint permission, version history, and document access remain governed by Microsoft 365, not the public site.

## 6. Quality and Release Gates

Every production promotion must have a known commit SHA, a clean tracked tree, and a documented rollback target. The required gates are:

- dependency install consistent with the supported runtime (Node 22 for the current TypeScript toolchain);
- unit tests, build, repository validation, and `git diff --check` pass;
- GitHub Pages preview successfully deploys from the same source lineage;
- smoke tests cover home, dashboard, evidence, indicators, core about/documents routes, and both locales where a changed feature applies;
- evidence links and unavailable-state behaviour are checked;
- motion QA for any motion-bearing change: `prefers-reduced-motion` emulation, no-JS fallback, TH/EN parity (GO-MOTION-V1 §11.7–§11.8);
- production cutover is atomic and the previous release remains available for rollback;
- a closeout records source SHA, validation, live release path, rollback path, and known limitations.

## 7. Current Completion Status and Priorities

The platform is **production-operational**, not evidence-complete. The next work must prioritise operational data and documentary quality over new UI surface area.

| Priority | Outcome | Completion evidence |
|---|---|---|
| P0 | Expand verified indicator-level evidence mapping from 10/65 | Explicit indicator IDs, ownership, year, visibility, and verified source state |
| P0 | Maintain monthly FY2569 data integrity | Validate updated source files; clearly distinguish partial, missing, and published data |
| P1 | Continue dashboard/evidence UX refinement | Preserve ECharts fallback tables, mobile accessibility, and TH/EN parity |
| P1 | Release hygiene | Release notes, rollback evidence, reproducible Node 22 quality gates |
| P2 | Add content and awareness materials | Public-safe, bilingual, linked to relevant categories/indicators |

## 8. Governance

- **Product Owner:** prioritises scope and approves releases.
- **Chief Architect / Head Agent:** protects platform boundaries, verifies evidence claims, integrates bounded work, and maintains release records.
- **Content/data owners:** supply and verify source data and evidence; own whether an item is public, authenticated, or unavailable.
- **Microsoft 365 owners:** manage file permissions and lifecycle.

## 9. Definition of Done

For an incremental release, “done” means the release scope is built, validated, previewed, deployed with rollback, and documented without false claims about data or evidence completeness.

For programme completion, the platform additionally needs verified direct evidence coverage for all required indicators, current approved resource data, maintained TH/EN parity, and an operational content/update handoff.

## 10. Architecture Statement

```text
Green Office 2026
= public environmental communication
+ data presentation
+ assessment-evidence navigation
+ motion & interaction enhancement (GO-MOTION-V1, additive)

Microsoft 365 / Document Center
= authorised documents, metadata operations, permissions, and lifecycle
```

---

## 11. GO-MOTION-V1 — Motion & Interaction Enhancement Layer

> **Status:** ARCHITECTED (Blueprint + Architecture phase). Rollout A (repo/motion audit) and B (architecture + token/component contract) are covered by this section. Phases C–E (prototype, QA, preview review) require implementation and PO approval before any production promotion. **Production is not modified by this blueprint.**

> **Canonical constraint:** motion is **progressive enhancement only**. Astro static-first and minimal client JS remain canonical. No React conversion, no Magic UI wholesale, no animation framework dependency (no Framer Motion / GSAP / AOS / Motion One). No changes to datasets, evidence mappings, the data/sync pipeline, the M365 boundary, release architecture, or P0 evidence/data priorities.

### 11.1 Motion Principles and Performance Budget

| Principle | Rule |
|---|---|
| Progressive enhancement | Motion is additive on top of fully visible static content (canonical GO-UX-4 `html.motion-ready` gate in `src/scripts/landing-motion.ts`). No-JS / no-IO / slow JS ⇒ content stays fully visible. |
| Data truthfulness | Animation never changes data or evidence meaning. Count-up ends exactly at the source value; KPI values, status, and evidence availability are never animated or rounded misleadingly. |
| Reduced motion by default | `prefers-reduced-motion: reduce` must disable every new effect via the global CSS media block (`src/styles/global.css`) and a JS `matchMedia` short-circuit. Mandatory gate. |
| Compositor-only | Animate `opacity` and `transform` only. No layout-triggering properties, no scroll-jacking, no parallax beyond the existing ambient mesh. |
| Duration / easing | Reveals 200–400ms, hovers 150–300ms, single canonical easing `cubic-bezier(0.16, 1, 0.3, 1)` (`.ease-out-expo`). |
| No feedback on data | Charts use ECharts built-in animation only, disabled under reduced motion in `src/scripts/echarts-init.ts`. |

Performance budget (additive):

| Metric | Budget |
|---|---|
| Client JS, landing (gzip) | ≤ ~20 KB total (current `landing-motion.ts` ≈ 1.5 KB) |
| New animation frameworks / dependencies | 0 |
| Animation cost | One shared IntersectionObserver + rAF-throttled scroll handlers (BackToTop pattern); no per-section observers |
| Layout shift | CLS 0 from reveal (transform-only; content occupies final space before JS) |
| Lighthouse | ≥ 95 (constitution target) — motion layer must not regress |

### 11.2 Hero and Section Reveal

- **Reuse:** `.landing-reveal` + `src/scripts/landing-motion.ts` (IntersectionObserver threshold 0.12, rootMargin −5%, `motion-ready` gate, `.is-visible`). Canonical; do not rebuild.
- Hero markup is fully visible static (SEO + no-JS); reveal activates only after `html.motion-ready` is set.
- Stagger: `.landing-stagger` cascade (0–480ms, 80ms steps) is the contract; cap at 6 visible elements.
- Reveal distance ≤ `translateY(1.25rem)`; no scale/blur reveals on readable content.
- New sections register through existing classes — no per-section motion script.

### 11.3 KPI / Dashboard Micro-interactions

- **Reuse:** `[data-count-up]` / `data-count-suffix` / `data-count-prefix` / `data-count-duration`; reduced motion renders the final value instantly. Extend to KPI cards with `.num-tabular` (tabular-nums).
- Hover/focus: `.dashboard-metric-highlight` and `.card-surface-hover` (lift ≤ 4px + `focus-visible` ring) — uniform across KPI cards.
- ECharts: built-in chart animation only; disable animation under reduced motion. No per-frame JS count-ups.
- KPI values come from generated JSON (`kpi-summary.json` / `generated/*.json`) only — never hardcoded in components.

### 11.4 Knowledge / Engagement Cards

- **Reuse:** `.landing-card-interactive`, `.landing-glass-hover`, `.card-surface-hover` for hover lift + `focus-visible` ring.
- Engage 8-card canonical grid (ids: mindset, energy, water, waste, paper, ghg, green-meeting, 5s; runtime `web/<id>-master.webp`): hover = subtle image scale (`transform: scale(1.03)` on the `img` inside an `overflow-hidden` container) + card lift; no content reflow.
- Legacy `*2.webp` / `procurement2.webp` are rollback-only assets, never runtime; motion work must not re-introduce them.
- Reduced motion: global media block sets `transform: none !important` for these interactive classes.
- Touch: hover effects apply only under `@media (hover: hover)`; tap targets ≥ 44×44px.

### 11.5 Evidence Navigation Feedback

- Evidence filter chips (static-hosting `URLSearchParams` filters, e.g. `?indicator=3.2.2`): active/pressed/focus states only; animation is never the primary cue.
- `EvidenceCard` / linked evidence lists: same `.card-surface-hover` + reveal contract; stable URLs untouched.
- Unavailable sources render as unavailable ("ไฟล์ต้นฉบับไม่อยู่ในระบบ") — no animation, no fabricated links (P0).
- Reveal must not move focus; no `aria-hidden` on readable content.

### 11.6 CTA / Hover / Focus Interactions

- **Reuse:** `.landing-btn-primary` / `.landing-btn-ghost` / `.landing-btn-glass` (hover lift `-translate-y-0.5`, `focus-visible:ring-2`) and the global `:focus-visible` outline.
- Standardize `.focus-ring` utility on new interactive elements.
- No hover-only affordance may be required to complete a task (keyboard parity).

### 11.7 Reduced Motion + Accessibility Fallback

Mandatory per new component:

1. CSS `@media (prefers-reduced-motion: reduce)` override in the canonical global block.
2. JS `window.matchMedia('(prefers-reduced-motion: reduce)')` short-circuit (existing `landing-motion.ts` / `BackToTop` pattern).
3. No-JS full visibility (default CSS = visible; `motion-ready` gates only the hidden pre-animation state).

Accessibility contract: keyboard reachable, visible focus, no motion conveying meaning, contrast unchanged, `scroll-smooth` → `scroll-behavior: auto` under reduce.

### 11.8 Mobile / Performance Constraints

- One shared IntersectionObserver + rAF-throttled scroll handlers only; no scroll libraries.
- Infinite ambient animations limited to the 2 existing elements; none where battery/GPU sensitive.
- Images remain lazy-loaded (Engage `web/*-master.webp`, ~93–226 KB each) — motion adds no preload pressure.
- Responsive QA ladder: 360 / 768 / 1280 / 1440 px (GO-UX-4 pattern).

### 11.9 Component Reuse Strategy

| Capability | Reuse (existing) | New contract (only if needed) |
|---|---|---|
| Reveal | `.landing-reveal`, `.is-visible`, `html.motion-ready`, IO script | none — extend existing |
| Stagger | `.landing-stagger` (7-step, 80ms) | cap 6 items |
| Count-up | `[data-count-up]` + suffix/prefix/duration | `data-count-format` only if Intl grouping needed |
| Hover/focus | `.landing-card-interactive`, `.landing-btn-*`, `.card-surface-hover`, `.focus-ring`, global `:focus-visible` | none |
| Motion tokens | `.ease-out-expo`, `duration-300`, `transition` utilities | centralize under `global.css` §GO-MOTION-V1 |

Rule: before any new motion utility, grep `src/styles/global.css`, `src/scripts/landing-motion.ts`, and `src/components/ui/BackToTop.astro`; extend only where the existing contract cannot express the effect.

### 11.10 Phased Rollout + QA Gates

| Phase | Scope | Exit gate |
|---|---|---|
| A — Repo/motion audit | Inventory of existing motion (Section 11.9) | Audit recorded in this blueprint (done) |
| B — Architecture + token/component contract | This blueprint + centralized motion tokens | Blueprint approved |
| C — Small Landing prototype | Hero + section reveal + CTA hover/focus on `/` and `/en/` | `npm run build` / `check` / `validate` PASS |
| D — QA | TH/EN parity, mobile ladder, keyboard + reduced-motion, Lighthouse ≥ 95, runtime smoke, broken links | QA report PASS |
| E — Preview review | GitHub Pages preview + PO review | PO sign-off |
| Production | Immutable release flow only, with PO approval | existing release gates |

QA gates (additive to Section 6):

- `git diff --check` clean · `npm run build` PASS (254+ static pages) · `npm run check` 0 errors · `npm run validate` PASS · runtime smoke `/` + `/en/`.
- Reduced-motion checklist: emulate `prefers-reduced-motion: reduce` → all content visible, zero transforms/animations.
- No-JS checklist: disable JS → all sections readable, CTAs functional (GO-UX-4 §8 pattern).
- TH/EN parity: every motion-bearing section present with identical content on `/` and `/en/`.
- Mobile: 360px no horizontal overflow, no stuck hover states.

### 11.11 Out of Scope (do not touch)

Datasets, evidence mappings, data/sync pipeline, M365 boundary (Entra ID / SharePoint), release/rollback architecture, P0 evidence/data priorities, taxonomy 7/24/65, stable URLs, and the runtime Engage asset mapping (`src/data/engageVisuals.ts`). GO-MOTION-V1 is presentation-layer only.
