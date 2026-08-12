# GO-MOTION-V1 — Phase D Motion QA / Acceptance Report

**Date:** 2026-08-12 (Asia/Bangkok)
**Baseline:** `da317a3` (Phase C landing prototype)
**Scope:** `/` and `/en/` — hero entrance, section reveal, CTA hover/focus, `landing-motion.ts` + directly related styles. QA/fix only — no new animation/features.
**Verdict:** `PASS_WITH_NOTES`

---

## 1. Gates (all PASS)

| Gate | Result |
|---|---|
| `git diff --check` | PASS (clean) |
| `npm run check` | PASS — 0 errors, 0 warnings, 14 pre-existing hints |
| `npm run build` | PASS — 270 pages |
| `npm run validate` | PASS — 8/8 phases (taxonomy, resource-indicator, evidence-links, action-plan, search-index, evidence, routes 269, production link check) |
| Route smoke | PASS — 60/60 routes |
| Runtime reduced-motion | PASS — `motion-ready` absent, 59/59 reveals visible, transitions none |
| Runtime no-JS | PASS — static HTML has zero `motion-ready`; all 59 reveals present, fully visible |
| Viewport overflow | PASS — 360/360, 768/768, 1280/1280, 1440/1440 (no horizontal overflow) |
| Keyboard/focus | PASS — Tab reaches `.landing-btn-*` with `:focus-visible` ring |

## 2. Visual Motion Quality

- **Consistency:** single canonical easing `cubic-bezier(0.16, 1, 0.3, 1)`; reveal 0.75s, hover 300ms; stagger 80ms steps (0–480ms, 7 steps) — matches Blueprint §11.1/§11.2.
- **Compositor-safe:** computed `transition-property` = `opacity, transform` only; no layout properties animated.
- **No flash/jump:** content visible by default; `html.motion-ready` gate added only after JS confirms motion allowed (GO-UX-4 pattern). CLS 0.001–0.005.
- **Hierarchy:** reveals are opacity + translateY(1.25rem) only; no scale/blur on readable content.
- **No distracting motion:** single shared IntersectionObserver; no scroll-jacking; ambient animations pre-existing and reduced-motion-gated.

## 3. Responsive QA

| Viewport | Overflow | CTA clip |
|---|---|---|
| 360 | PASS | 0 clipped / 5 present |
| 768 | PASS | 0 clipped / 5 present |
| 1280 | PASS | 0 clipped / 5 present |
| 1440 | PASS | 0 clipped / 5 present |

## 4. TH/EN Parity

- Identical motion hooks: 59 `.landing-reveal`, 5 `.landing-btn-*`, 1 hero-zoom on both locales.
- `motion-ready` activates on both; reduced-motion disables on both.
- Different text lengths verified: EN H1 wraps correctly, no clipped CTA/text, no locale-specific layout regression.
- Accessibility semantics unchanged: skip link, `main` landmark, `h1`, `aria-labelledby` present; `lang` attributes correct (th/en).

## 5. Accessibility

- Keyboard: Tab reaches all CTAs with visible `:focus-visible` ring.
- `prefers-reduced-motion: reduce`: all non-essential motion disabled; content fully visible; count-ups render final values instantly; hero zoom disabled.
- JS-disabled: static content fully visible and usable (skip link, CTAs, all sections).
- Semantic/content accessibility unchanged (no `aria-hidden` on readable content, no focus movement by animation).

## 6. Performance

| Metric | Result | Budget (Blueprint §11.1) |
|---|---|---|
| Landing motion JS | 1.22 KB / 0.65 KB gzip | ≤ 20 KB |
| New dependencies | 0 | 0 |
| IntersectionObservers | 1 (motion) + 1 (BackToTop footer-lift, pre-existing) | 1 shared |
| CLS | 0.001–0.005 (Lighthouse score 1) | 0 |
| TBT | 0 ms (score 1) | — |
| FCP (runtime) | 136–192 ms | — |
| Lighthouse (local preview) | Perf 82–83 · A11y 96 · SEO 98 · BP 93 | ≥ 95 target |

**Note (non-motion):** Lighthouse performance is limited by pre-existing factors — the 436 KB hero JPG (`wow2-images`, eager-loaded, 2048×1152) and two render-blocking CSS files. These are out of Phase D scope (media/CSS unchanged). Motion layer itself adds no regression.

## 7. Regression

- Routes 60/60; static export 270 pages; platform validation 8/8.
- SEO/content visibility: static HTML contains full content (no JS-dependent hiding); meta/semantics intact.
- Existing landing functionality unchanged (no source edits in Phase D).

## 8. Gate E Recommendation

**READY_FOR_PREVIEW_REVIEW.** Deploy checkpoint to GitHub Pages preview for PO review. Production promotion requires explicit PO approval (not performed).

---

**Report author:** AI-assisted QA session
**Status:** `COMPLETE`
