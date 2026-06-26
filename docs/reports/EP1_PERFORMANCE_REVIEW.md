# EP-1 Experience Polish — Performance Review

**Date:** 2026-06-26  
**Project:** Green Office 2026 (`goffice2026`)  
**Sprint:** EP-1 Experience Polish  
**Scope:** Homepage landing polish only — no redesign, no architecture changes

---

## Summary

EP-1 improved motion language, micro-interactions, responsive behavior, accessibility, and performance characteristics of the approved Stitch landing page without altering information architecture, navigation, or visual design direction.

**QA status:** PASS  
- `npm run check` — 0 errors  
- `npm run build` — 26 pages  
- GitHub Pages build (`DEPLOY_TARGET=github-pages`, `PUBLIC_PREVIEW_BADGE=true`) — 26 pages, preview badge present, `/goffice2026/` base paths verified

**Preview URL:** https://numtip.github.io/goffice2026/

---

## Performance Observations

| Area | Before | After EP-1 | Notes |
|------|--------|------------|-------|
| Hero LCP | External hero image, no dimensions | `fetchpriority="high"`, explicit `width`/`height`, eager load | Reduces layout shift and prioritizes LCP candidate |
| Below-fold images | Lazy loaded | Lazy + `decoding="async"` + aspect ratios | Stable card/image boxes at all breakpoints |
| Fonts | CSS `@import` only | Preconnect hints in layout + `display=swap` | Faster font discovery; render not blocked indefinitely |
| JavaScript | None on homepage | ~1.5 KB motion module (reveal + count-up) | No animation libraries; tree-shaken client bundle |
| CLS | Variable image heights | `aspect-[4/3]` on mission/evidence/activity media | Reserved space before image paint |
| CSS | Ad-hoc utilities | Shared landing component classes | Smaller duplication; consistent transition timing |

### Estimated Lighthouse impact (homepage)

| Category | Target | Expected |
|----------|--------|----------|
| Performance | >95 | **92–96** — external Google CDN hero/activity images remain the main LCP/latency factor |
| Accessibility | >95 | **96–100** — skip link, landmarks, ARIA labels, focus rings |
| Best Practices | >95 | **95+** — static site, HTTPS on Pages |
| SEO | >95 | **95+** — meta description added |

> Full Lighthouse scores should be re-run in Chrome DevTools against the deployed GitHub Pages preview for authoritative numbers.

---

## Accessibility Observations

**Improvements applied:**

- Skip-to-content link targeting `#main-content`
- Section landmarks with `aria-labelledby` on all landing scenes
- Hero preview labeled `aria-label="Executive dashboard preview"` with explicit “Preview only” copy
- Command center metrics use descriptive `aria-label` per link
- Assessment cards announce category number, title, and score
- Evidence section distinguishes capability list from interactive CTAs
- Global `:focus-visible` outline (emerald, 2px offset)
- Reduced-motion path disables scroll reveal, count-up animation, ambient gradients, and hover transforms

**Remaining gaps:**

- Navigation header/footer outside landing scope still use legacy gray styling (unchanged per sprint lock)
- Activity cards are editorial only — no links yet; consider future `aria-describedby` if they become interactive
- External hero images use empty `alt` when decorative; acceptable but could add `role="presentation"`

---

## Responsive Observations

Breakpoints audited: **320, 375, 768, 1024, 1280, 1440, ultrawide**

| Breakpoint | Fixes |
|------------|-------|
| 320px | Hero title scale via `.landing-hero-title`; tighter padding; 2-col preview grid |
| 375px | Standard mobile spacing via `px-margin-mobile` |
| 768px | Mission/activities 2-column grids; command center 3-col metrics |
| 1024px | Full mission split; activities 2-col |
| 1280px | Assessment 4-col grid; journey 3-col |
| 1440px | `max-w-container-max` caps content width |
| Ultrawide | `overflow-x-clip` on landing wrapper prevents horizontal scroll |

**Journey timeline:** 7 columns only at `xl` (1280px+) to avoid cramped cards; 2–3 column fallbacks below.

---

## Motion Observations

**Added (CSS-first + lightweight JS):**

- Scroll reveal (`.landing-reveal` + IntersectionObserver)
- Stagger delays (`.landing-stagger` children, 80ms steps)
- KPI count-up (`data-count-up` on hero score, category scores, evidence totals)
- Metric bar scale-in on reveal
- Glass hover elevation (`.landing-glass-hover`, `.landing-card-interactive`)
- Dashboard metric highlight ring/glow on hover/focus
- Ambient mesh gradient drift on journey + CTA backgrounds
- Scene bridge gradients between sections for storytelling continuity

**Reduced motion:** All animations disabled or instant when `prefers-reduced-motion: reduce`.

---

## Visual Consistency Observations

**Standardized via `@layer components`:**

- `.landing-section` — vertical rhythm (`py-section-gap`)
- `.landing-container` — horizontal gutters
- `.landing-heading` — section title scale
- `.landing-btn-primary` / `.landing-btn-ghost` / `.landing-btn-glass`
- `.landing-card-interactive` — unified hover lift + shadow
- `.glass-panel` + `.landing-glass-hover` — consistent glass opacity/border

**Section transitions:** Soft gradient bridges between light → dark (command center), light → light (evidence), and mesh → CTA scenes.

**Icon sizing:** Normalized to `h-4 w-4` (CTAs) and `h-5/h-6 w-5/w-6` (section headers).

---

## Dashboard Preview (Priority 7)

- Remains **preview only** — “Preview only — not live dashboard data” label added
- Links unchanged: `/dashboard`, `/dashboard/{energy|water|fuel|paper|waste|ghg}`
- Polished hover/focus on metric cells without simulating live dashboard behavior

---

## Evidence Preview (Priority 8)

- Remains **Document Center preview** — no upload, permission, or metadata UI
- Visual polish: skeleton document cards, count-up stats, glass hover on preview tiles
- CTAs unchanged: “Open Document Center” → `/documents`, “Browse Evidence Library” → `/evidence`

---

## Remaining Improvements (Future Sprints)

1. **Self-host or optimize Stitch CDN images** — largest performance win for LCP
2. **Subset Inter weights** — load only 400/600/700 woff2 locally
3. **Navigation/footer polish** — align with Stitch tokens (separate sprint; IA locked)
4. **Activity deep links** — when content routes exist
5. **Automated Lighthouse CI** — run on GitHub Pages deploy for regression tracking
6. **Hero `srcset`** — responsive image sizes if assets move to `/public`

---

## Safety Confirmation

| Item | Status |
|------|--------|
| VPS changes | None |
| DNS changes | None |
| Production changes | None |
| Custom domain changes | None |
| Backend / API / CMS | None added |
| Homepage redesign | None — polish only |
| Navigation IA | Unchanged |

---

## Files Changed (EP-1)

- `src/styles/global.css` — motion, components, reduced-motion, consistency utilities
- `src/scripts/landing-motion.ts` — reveal + count-up (new)
- `src/pages/index.astro` — motion script, overflow guard
- `src/layouts/BaseLayout.astro` — preconnect, skip link, meta description
- `src/components/landing/*.astro` — all eight landing components polished
