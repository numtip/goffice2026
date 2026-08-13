# GO-MOTION-V2 Phase B — Visual Refinement QA Record

**Date:** 2026-08-13 (Asia/Bangkok)  
**Starting SHA:** `fbf86d1`  
**Direction:** A — Evidence Control Room (visual refinement)  
**Preview:** GitHub Pages only — production VPS untouched  
**Verdict:** `GO_MOTION_V2_PHASE_B_PREVIEW_READY_FOR_PO`

---

## 1. Six refinements

1. **Hero hierarchy** — `title_line1` demoted; `title_line2` is the display title; tighter copy; 2-col claims at 360; shorter `min-h`; Evidence CTA `border` not `border-2`. Badge and Categories CTA not restored.
2. **Journey spine** — `max-w-5xl` aligned with hero; `border-t-2` threshold; desktop `divide-x`; first stop ringed as the current path.
3. **KPI continuity** — violet evidence tile removed (counts stay in EvidenceGateway); remaining two tiles are stitch/label cards, not score gradients; `landing-section` / `landing-container`; Dashboard CTA demoted to ghost.
4. **Showcase** — dropped Evidence/Assessment bullets (4 remain); quieter kicker matching Evidence; in-page `#evidence-gateway-title`; filled Dashboard CTA kept.
5. **EvidenceGateway** — skeleton bars removed; existing `status` + `updated` shown; Evidence CTA promoted to `landing-btn-primary`; Documents stays ghost.
6. **Motion/JS** — `landing-motion.ts` unchanged; additive JS **0 KB**.

## 2. Data truth

Hero still shows FY2569 coverage `14/72` and evidence `10/24` as static HTML. KPI readiness uses `totalMonthSlots` zero-guard. Evidence preview status strings come from `evidence-index.json` (`available` / `placeholder`) — not invented.

## 3. JS / performance

- `landing-motion.ts` unchanged.
- Build client: landing motion chunk still `1.25 kB` / `0.67 kB` gzip (`hoisted.BtzcAclt.js`).
- Additive JS: **0 KB**. No new dependencies.

## 4. Gates

| Gate | Result |
|---|---|
| `git diff --check` | PASS |
| `npm run check` | PASS — 0 errors, 14 pre-existing hints |
| `npm test` | PASS — 121 + 18 |
| `npm run build` | PASS — 270 pages |
| `npm run validate` | PASS |

## 5. Runtime review (local preview `http://localhost:4321`)

| Check | Result |
|---|---|
| `/` and `/en/` section parity | PASS — 64 `.landing-reveal` each |
| Hero CTA destinations | PASS — Dashboard + Evidence only |
| Showcase Evidence CTA | PASS — `#evidence-gateway-title` |
| Evidence primary CTA | PASS — `/evidence/` and `/en/evidence/` |
| No-JS | PASS — static HTML has no `motion-ready`; 14/72 and 10/24 visible |
| Reduced motion | PASS — browser `prefers-reduced-motion: reduce`; 0 hidden reveals; `motion-ready` absent |
| Overflow 360 / 768 / 1280 / 1440 | PASS — TH and EN `scrollWidth === clientWidth` |
| Keyboard | PASS — hero/spine links `min-h-11+`; focus rings retained |
| Command Center on Landing | PASS — `#command-center-title` absent |

## 6. Known notes (not expanded)

- EN Knowledge eyebrow still uses Thai (`hub.eyebrowTh`).
- Engage/Knowledge hover remains `scale-105` vs Blueprint §11.4 `1.03`.
- Hero LCP still the wow2 JPG (~436 KB) — Magnific WebP is Phase C.
- Evidence preview status chips render canonical English `available` / `placeholder` on both locales.
- Unused locale keys retained for rollback: `home.hero.cta_categories`, `home.showcase.bullet_evidence`, `home.showcase.bullet_assessment`, `home.executiveKpi.score_evidence`.

## 7. Out of scope (honoured)

No Magnific, no Dashboard rewrite, no dataset/evidence/M365 changes, no Impeccable update, no VPS deploy.
