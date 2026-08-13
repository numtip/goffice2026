# GO-MOTION-V2 — Signature Visual Experience Discovery

**Status:** `GO_MOTION_V2_DISCOVERY_READY_FOR_PO`  
**Date:** 2026-08-13 (Asia/Bangkok)  
**Baseline:** `master` @ `ce31b4b` = `origin/master`  
**Preview:** https://numtip.github.io/goffice2026/  
**Production:** OUT OF SCOPE — VPS untouched  
**Scope:** Discovery + visual architecture only. No implementation. No deploy. No merge.

Visual direction image probes were skipped: this brief is architecture-fidelity; Product Owner owns Magnific media; no generated or replacement assets.

---

## 0. Mission and constraints

GO-MOTION-V1 shipped a correct progressive-enhancement layer (reveal 750ms, stagger 8×80ms, count-up, reduced-motion, no-JS truth). Daily close 2026-08-12 recorded that the **WOW / signature experience is still incomplete**.

GO-MOTION-V2 must invent a recognisable Green Office signature — not Magic UI pasted onto Astro.

Hard constraints (carried from Blueprint V5 §11 + this brief):

- Astro + Tailwind canonical. No React conversion.
- No Magic UI package. No Framer Motion / GSAP / AOS / Motion One.
- Reuse GO-MOTION-V1 classes/scripts before creating anything.
- Custom motion = `opacity` / `transform` only.
- Preserve no-JS truth + `prefers-reduced-motion`.
- Preserve TH/EN parity.
- No dataset / evidence / M365 changes.
- No VPS / SSH / Nginx / Cloudflare.
- Do not generate or replace media. PO creates media in Magnific; this doc may only name slots and prompt requirements.
- Avoid generic glassmorphism / particle-demo aesthetics.

Recorded, **do not expand scope**:

- EN Knowledge eyebrow currently uses Thai (`hub.eyebrowTh` unconditional in `KnowledgeHub.astro`; `practices.json` already has `eyebrowEn`).
- Knowledge / Engage hover scale is `group-hover:scale-105` vs Blueprint §11.4 `scale(1.03)`.

---

## 1. Current-state audit

### 1.1 Landing composition (GitHub Pages, TH, `ce31b4b`)

`LandingPage.astro` is a nine-section scroll. Order:

| # | Component | Role today | Motion | Verdict |
|---|---|---|---|---|
| 1 | `LandingHero` | Full-bleed campus/foliage hero + glass badge/copy + 2 CTAs | `.landing-reveal` + `.landing-stagger` + `.hero-bg-zoom` | Working first-screen. Strong place identity. Glass overlay + tracked badge are template-adjacent. CTAs skip Evidence. |
| 2 | `ExecutiveKPIPreview` | 3 summary hero-metrics + 6 `ResourcePerformanceCard` | **None** — no `.landing-reveal` | Data-true (generated JSON). Layout is SaaS KPI template. Duplicate of later Command Center. |
| 3 | `DashboardShowcase` | Capability bullets + dashboard screenshot | Reveal + **infinite float** (`showcase-float` 6s) | Screenshot is useful proof. Float is ambient #3 beyond Blueprint §11.8 “2 existing ambient elements”. |
| 4 | `ExecutiveCommandCenter` | Dark “Resource Command Center” + 6 metric columns | Reveal + stagger + `.landing-metric-bar` | Dark register is closer to DESIGN.md “Evidence Control Room”. **Decorative sparkline bars are hardcoded `[3,5,4,7,5,8,6,9]` — not data.** Pulse “Live snapshot” is costume. |
| 5 | `AssessmentFramework` | 7 category cards from canonical taxonomy | Reveal + glass-panel cards | Working. Taxonomy-true. Do not redesign without clear benefit. |
| 6 | `EvidenceGateway` | Totals 24/10 (static HTML + count-up) + 3 preview titles + skeleton lines | Reveal + count-up | Totals are truthful (V1 targeted fix). Visual “document” panel uses skeleton bars, not evidence imagery. |
| 7 | `EngageVisualSection` | Canonical 8-practice 16:9 grid from `engageVisuals.ts` | Reveal + stagger 8 + hover `scale-105` | Working signature asset system. Keep. |
| 8 | `ImprovementJourney` | 7-stage certification pathway | Reveal + ambient mesh | Working narrative of **certification process**, not of **this website’s journey**. Do not conflate with Landing → Dashboard → Evidence. |
| 9 | `LandingCTA` | Dark mesh footer with 5 destination pills | Reveal + stagger + `eco-mesh-bg-ambient` | Working closer. Reuses `.landing-btn-*`. |

Unused on current landing (do not resurrect in Phase A): `MissionScene.astro`, `ActivitiesScene.astro`.

### 1.2 Motion inventory (reuse before build)

Canonical, already shipped:

| Capability | Where | Contract |
|---|---|---|
| Shared IO + count-up | `src/scripts/landing-motion.ts` | `html.motion-ready`, thresholds `[0.12, 0.4]`, reduced-motion short-circuit |
| Reveal / stagger | `src/styles/global.css` | 750ms, `translateY(1.25rem)`, 8 steps 0–560ms, easing `cubic-bezier(0.16,1,0.3,1)` |
| Metric bar | `.landing-metric-bar` | `scaleX` 1s, compositor-only |
| Hover / focus | `.landing-card-interactive`, `.landing-btn-*`, `.card-surface-hover`, `.dashboard-metric-highlight`, `.focus-ring` | lift ≤ 4px; reduced-motion `transform: none !important` |
| Count-up | `[data-count-up]` on EvidenceGateway 24/10 | static HTML is canonical; JS is enhancement |
| Dashboard chart motion | `src/scripts/echarts-init.ts` | built-in ECharts only; disabled under reduced motion |

Pages already importing `landing-motion.ts`: Landing (`/` `/en/`), Knowledge hub.

### 1.3 Dashboard / Knowledge (adjacent, not Phase A rewrite)

- **Dashboard** (`CommandHero` + `ResourcePulseGrid` + explorers) is already the stronger “command center.” Coverage radial is **data coverage, never a score**. Do not duplicate the ECharts radial onto Landing (would add chart JS to the home budget).
- **Knowledge hub** already reuses Engage 16:9 assets + V1 stagger. Keep. Recorded i18n/hover contract drift stays backlog.

### 1.4 Visual / anti-pattern notes (Landing only)

Observed on live preview + source:

- Place photography (wow2 Executive Dashboard Hero) is distinctive. Keep.
- Repeated uppercase tracked eyebrows (hero badge, showcase kicker, engage label, CTA label) = AI section grammar.
- Hero glass panels (`backdrop-blur-xl`) + Engage `backdrop-blur-sm` cards — DESIGN.md already flags glass as legacy; do not expand.
- Three colored summary tiles (emerald / sky / violet) = hero-metric template.
- Six identical resource cards immediately followed by six identical command-center columns = duplicate storytelling.
- Command Center fake sparklines violate Blueprint §11.1 data truthfulness.
- Nav is dense (10 items). Out of V2 motion scope; do not “fix” as part of signature work.

### 1.5 Performance (recorded, not a V2 redesign target)

Daily close: eager hero JPG ~436 KB (`wow2-images` `Executive Dashboard Hero.jpg`, 2048×1152) + render-blocking CSS → Lighthouse Perf ~82–83 vs constitution ≥95. Motion JS is not the bottleneck (`landing-motion.ts` ~1.22 KB raw / 0.65 KB gzip). LCP compression is a Magnific/asset slot, not a motion script.

---

## 2. Experience gaps

What V1 did **not** solve:

1. **No signature first-screen idea.** Hero is a competent photo + overlay. It does not state *what this office is doing this year* (coverage, evidence readiness, or a practice). Visitor lands in mood, not in a claim.
2. **Landing → Performance → Evidence is not a path.** Hero CTAs = Dashboard + Categories. Evidence appears as section 6. Dashboard is linked 4+ times (hero, KPI CTA, showcase, command center, footer) so the journey has no single spine.
3. **KPI storytelling is repeated, then contradicted.** True resource cards (section 2) are restated as a dark costume panel (section 4) with invented sparkline heights.
4. **Engage assets arrive too late to author the page.** The 8 Magnific 16:9 images are the only unique Green Office visual system in the repo. They currently decorate the lower third.
5. **Motion is uniform, not authored.** Every section uses the same reveal. V1 succeeded as a layer; V2 must assign *which beat is signature* and leave the rest quiet.
6. **Product vs brand register clash.** PRODUCT.md / DESIGN.md north star is “Evidence Control Room” (calm, accountable, auditor-grade). Current landing still performs as a SaaS marketing page (badges, capability bullets, floating screenshot).

Do **not** treat as V2 gaps (already working, no clear benefit):

- Assessment 7-category framework
- Improvement Journey 7 stages (certification process)
- Engage 8-card grid structure and asset mapping
- Knowledge hub practice navigator (aside from recorded backlog)
- Dashboard CommandHero / explorers (already the operational command surface)
- Evidence totals 24/10 static truth

---

## 3. Direction A — Evidence Control Room

**Visual concept/name:** Evidence Control Room  
**Register:** Product, with a committed dark-green first screen. Aligns with DESIGN.md north star.  
**Scene sentence:** An assessor and an office lead sit together in late-afternoon institutional light, checking whether this year’s numbers and files are ready — not browsing a campaign site.  
**Named anchors:** GO dashboard `CommandHero` (already in-repo), a museum object-label (one claim, one caption), a building management panel (coverage, not score).

### A. Hero / first screen

Keep the existing wow2 hero photograph. Remove the glass description panel and the costume badge-as-section-grammar. Replace the overlay with **one truthful claim** already computed on Landing: FY2569 month coverage (`coveredMonthSlots / totalMonthSlots`) and evidence ready (`available / total`), as static HTML — the same numbers `ExecutiveKPIPreview` already shows. Primary CTA remains Dashboard; secondary CTA becomes Evidence (not Categories). Categories stay reachable from nav and Assessment.

### B. Environmental Command Center / KPI storytelling

**One** resource command surface on Landing — not two. Promote `ExecutiveKPIPreview` (data-true cards) as that surface. Demote or retire `ExecutiveCommandCenter` on Landing; its dark costume and fake sparklines do not earn a second telling of the same six metrics. Do not port `MonthlyCoverageRadial` (ECharts) onto `/`.

### C. Transition Landing → Performance → Evidence

Insert a **three-stop spine** immediately under the hero, using the `JourneyLinks` module pattern (already used on dashboard): Performance (`/dashboard`) → Evidence (`/evidence`) → Practices (`/knowledge`). This is a real sequence, so numbering is allowed **once**, here only.

### D. Visual / data storytelling

Numbers are labels on real coverage and real evidence counts. Resource cards keep existing monthly mini-bars from genuine `monthlyValues`. No decorative charts. Showcase screenshot stays as optional proof of the dashboard, without the infinite float.

### E. Engage / Knowledge assets

Keep the 8-card grid as Act 3 (practice). Do not crop, replace, or restage Magnific `web/<id>-master.webp`. Knowledge hub unchanged in this direction.

### F. Restrained signature motion (reuse V1)

- First-screen: existing hero stagger (badge/claim/CTAs) — this is the only authored entrance.
- KPI cards: **add** `.landing-reveal` / `.landing-stagger` (currently missing) — same contract, no new JS.
- Metric bars already scaleX; keep.
- Drop `showcase-float` infinite animation (ambient budget).
- Hover: existing card/button lifts only under `@media (hover: hover)`.
- No new observers, no scroll-jacking, no blur reveals.

**Reusable existing components:** `LandingHero`, `ExecutiveKPIPreview`, `ResourcePerformanceCard`, `EvidenceGateway` (totals), `EngageVisualSection`, `JourneyLinks`, `landing-motion.ts`, global V1 utilities, `CommandHero` *copy/coverage semantics* (not the ECharts radial).

**New component contract (only if required):** `LandingJourneySpine.astro` — three static links + one `aria-label`. Skip if `JourneyLinks` can be reused with a `home` current state. No new CSS motion class.

**Mobile:** Stack claim under photo; spine as three full-width rows ≥44px; 6 resource cards 1-col; Engage already 1-col → 2-col → 4-col.

**A11y / reduced-motion:** Existing global block + JS short-circuit. Coverage/evidence numbers visible in HTML. Spine is links, not animation. `scroll-behavior: auto` already under reduce.

**JS / performance:** +0 KB JS if spine is markup-only. Possible *reduction* by removing showcase float CSS. LCP unchanged unless PO later supplies a compressed hero WebP (Magnific slot, not Phase A).

**Risks / tradeoffs:** Retiring the dark Command Center *looks* like a loss of “premium” until the remaining KPI surface is authored. Changing hero secondary CTA is IA, not decoration — PO must accept Evidence over Categories. Must not imply coverage % is a Green Office *score* (dashboard copy already forbids this).

---

## 4. Direction B — Campus Living Proof

**Visual concept/name:** Campus Living Proof  
**Register:** Brand-led. Maejo campus and the 8 practices *are* the interface.  
**Scene sentence:** A visitor walks the Chelon Phra Kiat building garden at humid noon; the website should feel like that walk, then prove the walk is measured.  
**Named anchors:** the existing wow2 foliage hero, Magnific 8-practice 16:9 set, a botanical plate (image first, caption second).

### A. Hero / first screen

Asymmetric split: photograph owns ≥60% width; type sits in a solid institutional-green column (no glass). No tracked badge. Headline names the office, not “intelligence platform.” CTA pair: Knowledge (practices) + Dashboard.

### B. Command Center / KPI

KPI cards appear **after** the 8-practice grid, each practice image already carrying `relatedMetric` / `relatedCategory` in `engageVisuals.ts`. The command center is “these practices, those meters” — not a separate dark dashboard costume.

### C. Transition

Path becomes Place (hero) → Practice (Engage) → Performance (KPI) → Proof (Evidence). Opposite of auditor order. Strong for staff/public; weaker for assessors who want numbers first.

### D. Visual / data storytelling

Images author the page. Numbers are captions. Evidence gateway keeps 24/10 but loses skeleton fake-documents; titles already in the 3-item preview are enough.

### E. Engage / Knowledge assets

Engage grid moves up to section 2 (immediately after hero). Knowledge hub remains the detail surface. Runtime mapping `engageVisuals.ts` is **not** modified (Blueprint §11.11).

### F. Motion

V1 stagger on the 8 cards becomes the signature beat. Hero zoom stays but only under `hover: hover` and reduced-motion off (already). No new JS.

**Reusable:** `LandingHero`, `EngageVisualSection`, `ExecutiveKPIPreview`, `EvidenceGateway`, `engageVisuals.ts` (read-only), V1 motion.

**New contract:** none required for a reorder. Optional later: a `PracticeToMetricCaption` micro-pattern (text only) if pairing copy is not already in dictionary.

**Mobile:** Photo crops via existing `object-[center_30%]`; type below. 8 cards remain 1-col. Do not pin a side column.

**A11y:** Image alts already bilingual in the manifest. Reduced-motion: existing. Do not use motion to explain the practice→metric link — the caption must.

**JS / performance:** +0 KB JS. LCP still the hero JPG unless Magnific supplies WebP. Moving 8 lazy images higher on the page adds *some* early image work — keep `loading="lazy"`; do not preload all eight.

**Risks / tradeoffs:** Fights PRODUCT.md (tool, not campaign). Assessors may bounce. Reorder is a large IA change relative to benefit if Command Center remains the PO’s desired first impression. Highest temptation to request new Magnific hero crops — resist in Phase A.

---

## 5. Direction C — Certification Narrative Spine

**Visual concept/name:** Certification Narrative Spine  
**Register:** Mixed. One numbered 3-act page that *is* the product story.  
**Scene sentence:** A Green Office committee chair scrolls a briefing in a fluorescent meeting room and needs to see Performance, then Evidence, then Practice without hunting.  
**Named anchors:** Improvement Journey’s honesty about sequence (but not its 7 stages), a briefing pack (act tabs), dashboard `JourneyLinks`.

### A. Hero / first screen

Hero becomes Act 0: title card only (photo + H1 + one sentence). No KPI, no glass. The spine (Act 1–3) starts in the first scroll.

### B. Command Center / KPI

Act 1 = `DashboardShowcase` screenshot + `ExecutiveKPIPreview` cards as a single “Performance” chapter. Command Center duplicate is removed.

### C. Transition

Acts are the transition: **1 Performance** (`/dashboard`) → **2 Evidence** (`/evidence`) → **3 Practice** (`/knowledge`). Assessment Framework and Improvement Journey remain below as reference appendices, not competing stories.

### D. Visual / data storytelling

Each act has one visual: screenshot (performance), real evidence titles + 24/10 (proof), 8 Magnific frames (practice). No third metric costume.

### E. Engage / Knowledge

Engage = Act 3, unchanged assets. Knowledge hub is the continuation, not a restyle.

### F. Motion

Fewer, larger beats: one reveal per act header, then existing stagger inside the act. Cap still 8 children. No new JS. Drop uniform per-section kicker animation.

**Reusable:** all current landing sections, just regrouped; V1 classes; `JourneyLinks`.

**New contract:** `LandingActHeader.astro` (kicker number + title + one sentence + primary link). Numbers earn their place because the page **is** a sequence. Forbidden: repeating 01/02/03 on Assessment and Journey as well.

**Mobile:** Act headers sticky is **forbidden** (scroll-jacking / focus risk). Stack only.

**A11y:** Act headers are `h2`; spine links in each header. Reduced-motion: instant visibility. No-JS: acts are ordinary sections.

**JS / performance:** +0 KB JS. Slightly less CSS if kickers are centralized.

**Risks / tradeoffs:** Easy to slip into AI numbered-section grammar if Act headers are also applied to Assessment/Journey/CTA. Longer first-screen emptiness may feel under-designed next to the current lush hero. More copy work (TH/EN act titles) than Direction A.

---

## 6. Comparison matrix

| Criterion | A Evidence Control Room | B Campus Living Proof | C Certification Spine |
|---|---|---|---|
| Fits PRODUCT.md / DESIGN.md | Strongest | Weak (campaign-led) | Medium |
| Auditor / executive first use | Strong | Weak | Strong |
| Staff / public first use | Medium | Strongest | Medium |
| Reuses V1 motion as-is | Yes | Yes | Yes |
| New JS | 0 | 0 | 0 |
| New motion CSS | None expected | None expected | Act header only if not expressible with existing heading classes |
| New components | Spine optional (`JourneyLinks` first) | None | `LandingActHeader` |
| Magnific media (Phase A) | None | None required; later hero crop optional | None |
| Touches working Engage/Knowledge | No | Reorders Engage only | Reorders Engage only |
| Fixes data-untrue sparklines | Yes (retire) | Yes (retire) | Yes (retire) |
| Fixes missing KPI reveal | Yes | Yes | Yes |
| Landing IA churn | Low–medium | High | Medium–high |
| Risk of Magic-UI / glass expansion | Low if glass is reduced, not added | Medium (image-led temptation) | Low |
| LCP impact | Neutral | Neutral / slightly worse if 8 images rise | Neutral |
| Recommended for Phase A | **Yes** | No (keep as alternate) | No (keep as alternate) |

---

## 7. Recommended direction + reasoning

**Recommend Direction A — Evidence Control Room.**

Reasons:

1. It matches the already-approved creative north star (“Evidence Control Room”) instead of inventing a second brand.
2. It fixes the two defects that actually break trust: duplicated KPI storytelling and untrue sparkline decoration.
3. It creates a Landing → Performance → Evidence spine without redesigning Assessment, Journey, Engage, Knowledge, or Dashboard.
4. Signature motion is *selection*, not invention: one authored first-screen, KPI cards join V1 reveal, ambient float is removed. Budget stays inside Blueprint §11.
5. Phase A can ship with **zero new JS, zero new media, zero dataset changes**.
6. Directions B and C remain valid later variants if PO wants a public-campaign or briefing-pack landing; they are not the first bounded cut.

PO override: if the first-screen must stay “lush campaign hero + Categories CTA,” reject A’s hero CTA change and still accept A’s Command Center de-duplication — that subset is the minimum integrity fix.

---

## 8. Proposed bounded Phase A implementation scope

**Phase A is composition + honesty + V1 class application. Not a visual system rewrite.**

In scope:

1. Hero overlay: drop glass description panel; show two static truthful figures (FY coverage months + evidence ready) already computed in `ExecutiveKPIPreview`. Secondary CTA → Evidence. Keep existing photograph.
2. Add a three-link spine (Dashboard / Evidence / Knowledge) via `JourneyLinks` or a 20-line static nav. Copy in `dictionary.ts` (TH/EN).
3. Apply `.landing-reveal` / `.landing-stagger` to `ExecutiveKPIPreview` (currently motion-blind).
4. Remove Landing `ExecutiveCommandCenter` **or** strip it to a single “Open Dashboard” band with no duplicate metrics and **no** hardcoded sparklines. Prefer removal on Landing; Dashboard `CommandHero` remains the real command surface.
5. Disable `showcase-float` infinite animation; keep the screenshot.
6. Leave Assessment, Improvement Journey, Engage grid, Knowledge hub, Dashboard pages, datasets, and `engageVisuals.ts` untouched.

Out of scope (explicit):

- Full visual system, new tokens, new typefaces, dark-mode, Magic UI, ECharts on `/`.
- Hero image replacement / WebP recompress (Magnific; see §10).
- EN Knowledge eyebrow; hover 1.03 vs 1.05.
- Nav information architecture.
- Production / VPS.
- Any new client script.

Suggested later phases (not this discovery):

- **Phase B:** EvidenceGateway skeleton → real document titles only (already have 3); optional Magnific evidence stills.
- **Phase C:** LCP hero WebP from PO; Lighthouse re-measure.
- **Phase D:** If PO picks Direction B or C instead, reorder only — still no new JS.

---

## 9. Exact affected files / components (Phase A, Direction A)

| File | Change |
|---|---|
| `src/components/landing/LandingPage.astro` | Section order; drop or stub Command Center; optional spine include |
| `src/components/landing/LandingHero.astro` | Overlay composition; CTA targets; static coverage/evidence figures passed as props |
| `src/components/landing/ExecutiveKPIPreview.astro` | Add V1 reveal/stagger; pass the same figures to hero (single computation stays here or lifts to `LandingPage`) |
| `src/components/landing/ExecutiveCommandCenter.astro` | Unplug from Landing (keep file for rollback) **or** delete sparkline block |
| `src/components/landing/DashboardShowcase.astro` | Remove `@keyframes showcase-float` |
| `src/components/landing/EvidenceGateway.astro` | No required change in Phase A |
| `src/components/landing/EngageVisualSection.astro` | No change |
| `src/components/ui/JourneyLinks.astro` | Reuse if a `home`/`landing` current id is enough; else do not modify — add a landing-only spine instead |
| `src/i18n/dictionary.ts` | TH/EN strings for spine + hero claim labels |
| `src/styles/global.css` | Only if a spine cannot use existing heading/button classes — default **no edit** |
| `src/scripts/landing-motion.ts` | **No edit** |
| `src/data/engageVisuals.ts` | **No edit** |
| Dashboard / Knowledge / evidence JSON | **No edit** |

Rollback: revert the landing composition commits; `ExecutiveCommandCenter.astro` remains in tree if unplugged rather than deleted.

---

## 10. QA / performance gates (Phase A)

Additive to Blueprint V5 §11.10. Production is not a gate.

- `git diff --check` clean
- `npm run check` 0 errors
- `npm test` PASS
- `npm run build` PASS
- `npm run validate` PASS
- Runtime smoke: `/` and `/en/` — identical section set, TH/EN copy parity on new spine/hero claims
- No-JS: coverage and evidence numbers visible (static HTML, not count-up-only)
- Reduced motion: emulate `prefers-reduced-motion: reduce` → no transforms, no float, content visible
- Keyboard: spine + hero CTAs show `focus-visible` rings; no hover-only path
- Mobile ladder 360 / 768 / 1280 / 1440: no horizontal overflow; tap targets ≥44px
- Data truth: zero decorative series; coverage labelled as month coverage, never “score”
- JS budget: landing motion gzip still ≪ 20 KB; no new dependencies
- Do not declare Lighthouse ≥95 as a Phase A exit (hero JPG is a known pre-existing limiter)

---

## 11. Magnific media requirements

**Phase A (Direction A): none.** Do not generate, crop, or replace files.

Optional later slots (PO only, if Phase C opens):

| Slot | Why | Prompt requirement | Must not |
|---|---|---|---|
| `public/images/dashboard/wow2/Executive Dashboard Hero` WebP | LCP: current eager JPG ~436 KB at 2048×1152 | Same framing (campus foliage, dark center for type), 16:9, ≤1600px long edge, quality for 80–120 KB WebP, no extra “HUD/particle” overlays | Do not add glass, dashboards, or glowing orbs into the photograph |
| Evidence stills (3) | Only if EvidenceGateway skeleton is later replaced | Real Maejo document/desk/file stills, 16:9, no fake UI chrome | Do not illustrate invented documents |
| Hero crop 4:5 | Only if Direction B is chosen later | Same master, tighter building/garden crop | Do not change Engage `web/<id>-master.webp` runtime set |

Engage 8-practice masters are canonical. V2 must not re-introduce legacy `*2.webp`.

---

## 12. Verdict

`GO_MOTION_V2_DISCOVERY_READY_FOR_PO`

PO decision needed:

1. Accept **Direction A** (recommended), or override to B / C.
2. Approve Phase A bounded scope (composition + sparkline removal + V1 class on KPI + spine).
3. Confirm hero secondary CTA may move from Categories → Evidence.

Do not implement until PO confirms. Do not deploy. Do not touch production.
