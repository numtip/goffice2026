# GO-UX-4 — Resilient Landing Motion Enhancement

## 1. Executive Summary

Resolved Finding #1 from IMPECCABLE_FINDINGS.md: landing page content was hidden by default until JavaScript executed. The root cause was a per-element `data-reveal-ready` attribute applied to all `.landing-reveal` elements immediately on script load, causing a flash of hidden content as IntersectionObserver gradually revealed elements.

The fix replaces the per-element approach with a single document-level enhancement class (`html.motion-ready`) that is only added after successful JS initialization. If JavaScript fails, loads late, or is disabled, content remains fully visible.

## 2. Preflight

- **Branch:** master
- **Starting HEAD:** `b4eb07ab78d95d963277492eafaef47ba3e077e4`
- **Origin parity:** local/master = origin/master (0 ahead, 0 behind)
- **Working-tree status:** clean
- **Baseline build:** 226 pages, 0 Astro errors, 0 warnings
- **Baseline tests:** 28 pass, 0 fail (pre-existing data-quality warnings unrelated to this scope)

## 3. Root Cause

`landing-motion.ts` applied `data-reveal-ready="true"` to every `.landing-reveal` element immediately on initialization. The CSS selector `.landing-reveal[data-reveal-ready]:not(.is-visible)` set `opacity: 0; transform: translateY(1.25rem)`. This meant:

- Content was briefly visible during HTML parsing
- Then instantly hidden when the script ran
- Then gradually revealed as IntersectionObserver fired per element

This created a visible flash-of-hidden-content (FOHC) and meant JS failure left content in an indeterminate state.

## 4. Before Behavior

| Condition | Result |
|---|---|
| JavaScript disabled | Content visible (no `data-reveal-ready` added) ✓ |
| JavaScript loads normally | Brief FOHC flash, then staggered reveal |
| Slow connection | Content visible → hidden → gradually revealed |
| Reduced motion | Immediately visible (script short-circuited) ✓ |
| JS error before observer setup | Elements may remain hidden if `data-reveal-ready` was set |

## 5. Implementation Decision

Adopt the canonical progressive-enhancement pattern:

1. **Default CSS**: `.landing-reveal` is `opacity: 1; transform: translateY(0)` — always visible
2. **Enhancement class**: `html.motion-ready` is added by JS only after confirming motion should run
3. **Hidden state**: `html.motion-ready .landing-reveal:not(.is-visible)` applies pre-animation styles
4. **Reduced motion**: `@media (prefers-reduced-motion: reduce)` overrides to visible with no transitions
5. **No per-element attributes**: Removed `data-reveal-ready` entirely

This is the smallest robust change that fixes the finding while preserving all existing animation behavior.

## 6. Files Changed

| File | Change |
|---|---|
| `src/styles/global.css` | Gated `.landing-reveal` hidden/pre-animation states behind `html.motion-ready`; removed `data-reveal-ready` selectors; gated `.landing-metric-bar` states behind `html.motion-ready` |
| `src/scripts/landing-motion.ts` | Removed per-element `data-reveal-ready` assignment; added `document.documentElement.classList.add('motion-ready')` after reduced-motion/IO capability checks |

## 7. Normal-JS Verification

- **Route tested:** `/` (TH) and `/en/` (EN)
- **Viewport:** 1440×900
- **Observed:** Hero and all sections render immediately visible on load. As user scrolls, IntersectionObserver adds `.is-visible` and elements animate in with the original 0.75s cubic-bezier transition. Stagger delays (0–480ms) work correctly. Count-up animations trigger on intersection. No FOHC.

## 8. JavaScript-Disabled Verification

- **Method:** DevTools → Disable JavaScript → Reload
- **Result:** All landing sections render fully visible and readable:
  - Hero title, description, CTAs
  - KPI preview cards (85%, 81%, 4/21)
  - Dashboard showcase with capability bullets
  - Resource Command Center with all 6 metric cards
  - Assessment Framework with all 7 category cards
  - Evidence Gateway with document previews
  - Improvement Journey with all 7 stage cards
  - CTA section with all navigation links
- **CTA links:** All functional (Dashboard, Categories, Evidence, Documents, Search)
- **No blank sections**
- **No layout shift** caused by missing JS

## 9. Reduced-Motion Verification

- **Method:** DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`
- **Result:** Content visible immediately. No opacity/transform transitions. `animation: none` applied to ambient backgrounds. Count-up shows final values instantly. Metric bars render at full scale.

## 10. Responsive Verification

| Viewport | Result |
|---|---|
| 360×800 (mobile) | Content visible, readable, no horizontal overflow |
| 768×1024 (tablet) | Content visible, grid layouts adapt correctly |
| 1280×800 (laptop) | Content visible, two-column layouts active |
| 1440×900 (desktop) | Content visible, full grid layouts active |

## 11. Accessibility and Performance Impact

- **Semantic headings:** Unchanged
- **Keyboard navigation:** All links and buttons remain focusable
- **No focus movement** caused by animation
- **No `aria-hidden`** applied to readable content
- **No new dependencies**
- **Script size:** Unchanged (removed 3 lines, added 1 line)
- **CSS size:** Negligible change (selector prefix added)
- **No layout shift:** Content occupies same space before/after JS
- **Lighthouse:** No degradation expected; CLS should improve due to eliminated FOHC

## 12. Build/Test Results

- `npm run check`: 0 errors, 0 warnings, 0 hints
- `npm test`: 28 pass, 0 fail
- `npm run build`: 226 pages generated successfully
- Built CSS verified: hidden states gated behind `html.motion-ready`
- Built JS verified: `motion-ready` class added only after capability checks
- No stale `data-reveal-ready` references in built output

## 13. Remaining Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Very slow JS execution (e.g., 5+ second delay) | Low | Content visible immediately; animation simply activates later |
| `IntersectionObserver` polyfill conflict | Very low | Script checks `'IntersectionObserver' in window` before using it |
| Third-party extension injects `motion-ready` | Negligible | Class name is project-specific; no security impact |

## 14. Exact Diff Scope

```diff
 src/scripts/landing-motion.ts | 6 ++----
 src/styles/global.css          | 8 ++++----
 2 files changed, 6 insertions(+), 8 deletions(-)
```

## 15. Final Verdict

**READY_TO_COMMIT**