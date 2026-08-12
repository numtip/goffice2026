# GO-MOTION-V1 — Phase E Preview Acceptance Review

**Date:** 2026-08-12 (Asia/Bangkok)
**Baseline:** `dcfd166` / origin/master (clean tracked state; `.browser-profile/` + `.vscode/` untracked only)
**Preview:** https://numtip.github.io/goffice2026/
**QA report reviewed:** `docs/qa/GO_MOTION_V1_PHASE_D_QA_REPORT.md` (PASS_WITH_NOTES)
**Decision:** **ACCEPT**

---

## 1. Preview Lineage

- Deployed motion bundle `_astro/hoisted.BtzcAclt.js` SHA-256 = `9b6662061d6dcb…` — byte-identical to local build at `dcfd166`.
- `dcfd166` is docs-only (Phase D report); motion source unchanged since `da317a3` (Phase C prototype).
- Preview deploy run `31617390900` succeeded (quality/build/deploy ✓).

## 2. Runtime Acceptance (live preview, headless Chrome CDP)

| Criterion | TH | EN |
|---|---|---|
| `motion-ready` activation | ✓ | ✓ |
| Reveal count | 59 | 59 |
| CTA count (primary+glass) | 5 | 5 |
| H1 present | ✓ | ✓ |
| Overflow 360/768/1280/1440 | none | — |
| Keyboard focus → CTA with `:focus-visible` | ✓ | — |

- **prefers-reduced-motion:** `motion-ready` absent, 59/59 reveals visible, count-ups render final values instantly (`["24","10"]`).
- **No-JS static fallback:** deployed HTML has zero `motion-ready` (content visible without JS); 59 reveals, skip-link, `main` landmark, `h1`, `lang="th"` all present.
- **Count-up correctness:** incremental scroll yields `["24","10"]` — matches evidence registry totals, no data distortion.
- **Compositor-safe:** computed `transition-property = opacity, transform`; `0.75s` + canonical `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Routes:** `/ /en/ /dashboard/ /evidence/ /indicators/ /documents/ /about/ /search/ /knowledge/` all HTTP 200 on deployed preview.

## 3. Acceptance Criteria Checklist

| Criteria | Result |
|---|---|
| Hero motion intentional + restrained | ✓ — opacity/translate only, 0.75s expo-out, no scale/blur |
| Section reveals improve hierarchy without delay | ✓ — content visible by default; reveal is enhancement |
| CTA hover/focus clear + keyboard-safe | ✓ — `:focus-visible` ring verified via Tab |
| TH/EN equivalent behavior/layout | ✓ — identical hooks, both locales activate motion |
| Mobile 360/768 + desktop 1280/1440 clean | ✓ — no overflow, no clipped CTAs (Phase D report §3) |
| prefers-reduced-motion works | ✓ — verified live |
| no-JS fully usable/visible | ✓ — static HTML fully visible |
| No horizontal overflow / meaningful layout shift | ✓ — CLS 0.001–0.005 (Phase D), no overflow |
| No SEO/content visibility regression | ✓ — static content, skip link, h1, lang intact |
| Motion JS within budget | ✓ — 1.25 KB raw / 0.65 KB gzip (budget ≤ 20 KB) |
| No new motion/framework dependency | ✓ — package.json/lock unchanged across Phase C/D/E |
| Routes/navigation unaffected | ✓ — 60/60 route smoke (Phase D), deployed spot-check 200 |
| Phase D gates reproducible | ✓ — re-verified live: reduced-motion, no-JS, overflow, focus, count-ups |

## 4. Known Notes (non-blocking, out of motion scope)

- Lighthouse overall Perf 82–83 is limited by pre-existing factors (436 KB eager hero JPG, render-blocking CSS) — no motion regression.
- 14 pre-existing `astro check` hints; Node 20 GitHub Actions deprecation annotation.

## 5. Production Status

**NOT deployed.** Production promotion requires explicit Product Owner approval. This is an acceptance record only; the release flow remains untouched.

---

**Decision recorded by:** AI-assisted QA session
**Status:** `ACCEPTED`
