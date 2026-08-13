# GO-MOTION-V2 Phase A — Implementation + QA Record

**Date:** 2026-08-13 (Asia/Bangkok)  
**Starting SHA:** `ce31b4b`  
**Direction:** A — Evidence Control Room (PO accepted)  
**Preview:** GitHub Pages only — production VPS untouched  
**Verdict:** `GO_MOTION_V2_PHASE_A_PREVIEW_READY_FOR_PO`

---

## 1. Composition changes

Landing order is now:

1. Hero (claim strip + Dashboard / Evidence CTAs)
2. Journey spine (Dashboard → Evidence → Knowledge)
3. KPI / Performance (`ExecutiveKPIPreview`)
4. Dashboard screenshot (`DashboardShowcase`, no float)
5. Evidence gateway
6. Engage / Knowledge 8-practice grid
7. Assessment framework (unchanged)
8. Improvement journey (unchanged)
9. Landing CTA (unchanged)

`ExecutiveCommandCenter` is unplugged from Landing and kept in-tree for rollback. Dashboard `CommandHero` remains the operational command surface.

## 2. Removed data-untrue decoration

- Landing Command Center hardcoded sparkline bars `[3,5,4,7,5,8,6,9]` — gone from `/` and `/en/`.
- `showcase-float` infinite animation — removed.
- Hero glass description panel and tracked badge — removed.
- Resource card SVG sparklines that remain are built from canonical `monthlyValues` (energy/water Jan–Jul only).

Hero figures are static HTML from the same LandingPage computation: FY2569 month slots `14/72` and evidence `10/24`, labelled as coverage not a score.

## 3. CTA change

Hero secondary CTA: Categories → Evidence.

| Locale | Primary | Secondary |
|---|---|---|
| TH | `/dashboard/` สำรวจแดชบอร์ด | `/evidence/` สำรวจคลังหลักฐาน |
| EN | `/en/dashboard/` Explore Dashboard | `/en/evidence/` Browse Evidence Library |

## 4. JS / performance

- `landing-motion.ts` unchanged.
- Build client: landing motion chunk still `1.25 kB` / `0.67 kB` gzip (`hoisted.BtzcAclt.js`).
- Additive JS: **0 KB**. No new dependencies.

## 5. Gates

| Gate | Result |
|---|---|
| `git diff --check` | PASS |
| `npm run check` | PASS — 0 errors, 14 pre-existing hints |
| `npm test` | PASS — 121 + 18 |
| `npm run build` | PASS — 270 pages |
| `npm run validate` | PASS |

## 6. Runtime review (local preview `http://localhost:4321`)

| Check | Result |
|---|---|
| `/` and `/en/` section parity | PASS — 65 `.landing-reveal` each; identical spine |
| Hero CTA destinations | PASS — Dashboard + Evidence only |
| No-JS | PASS — static HTML has no `motion-ready`; 14/72 and 10/24 visible |
| Reduced motion | PASS — browser `prefers-reduced-motion: reduce`; 0 hidden reveals; `motion-ready` absent |
| Overflow 360 / 768 / 1280 / 1440 | PASS — `scrollWidth === clientWidth` |
| Keyboard | PASS — hero/spine links have `focus-visible` rings; tap targets `min-h-11` |
| Command Center on Landing | PASS — `#command-center-title` absent |

## 7. Known notes (not expanded)

- EN Knowledge eyebrow still uses Thai (`hub.eyebrowTh`).
- Engage/Knowledge hover remains `scale-105` vs Blueprint §11.4 `1.03`.
- Hero LCP still the wow2 JPG (~436 KB) — Magnific WebP is Phase C.
- `home.hero.cta_categories` locale key retained unused for rollback.

## 8. Out of scope (honoured)

Dashboard pages, Assessment, Journey, Engage asset mapping, datasets, evidence JSON, M365, VPS, Impeccable update, `.browser-profile/`, `.vscode/`.
