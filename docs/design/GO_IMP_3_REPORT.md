# GO-IMP-3 Report — Controlled Visual Cleanup

**Branch:** master  
**Date:** 2025-07-11  
**Agent:** Main Agent only  
**Build:** 226 pages ✓  

---

## Scope

Findings addressed: **2, 3, 5, 9**  
Files changed: 5  
No new dependencies, no animation changes, no layout/content/route changes.

---

## Changes

### Finding 2 — Landing hero gradient text (`LandingHero.astro:54`)

**Before:** `<span class="text-gradient-stitch">` — gradient CSS via `background-clip: text; color: transparent`  
**After:** `<span class="text-primary">` — plain institutional green, full contrast  
**Rationale:** DESIGN.md §6 explicitly forbids gradient text on meaningful headings. `text-primary` (`#003527`) preserves visual weight and passes contrast.

---

### Finding 3 — Repeated glassmorphism surfaces

Three surfaces replaced across two components:

| Location | Before | After |
|---|---|---|
| `LandingHero.astro` badge pill | `glass-panel landing-glass-hover` + `backdrop-blur` | `border-outline-variant/30 bg-surface-container` |
| `LandingHero.astro` description `<p>` | `border-white/40 bg-surface-container-lowest/60 backdrop-blur-md` | `border-outline-variant/20 bg-surface-container` |
| `LandingHero.astro` preview aside | `dark-glass` + `bg-slate-950/75` | `bg-inverse-surface` + `bg-primary-container/60` |
| `EvidenceGateway.astro` document list items | `glass-panel landing-glass-hover` | `border-outline-variant/20 bg-surface-container-lowest` |
| `EvidenceGateway.astro` stat cards (×2) | `glass-panel landing-glass-hover` | `border-outline-variant/20 bg-surface-container` |
| `ExecutiveCommandCenter.astro` main panel | `dark-glass border-white/10 shadow-2xl` | `border-outline/20 bg-primary-container/50 shadow-lg` |

**Rationale:** `glass-panel` and `dark-glass` are legacy treatments DESIGN.md §4 flags for audit. Replaced with tonal surface tokens from DESIGN.md §2. `backdrop-filter` removed from content surfaces; layout and component behaviour unchanged.

---

### Finding 5 — Category side-tab accent border

**Files:** `src/pages/categories/[id].astro`, `src/pages/en/categories/[id].astro`  
**Before:** `border-l-4 border-l-green-600` / `border-l-amber-400`  
**After:** `border border-outline-variant/40` / `border-amber-200/80`  
**Rationale:** DESIGN.md §6 lists thick side-stripe borders as a banned card accent. Full perimeter border maintains containment without the side-tab trope. TH/EN parity confirmed.

---

### Finding 9 — Repeated uppercase mono labels

Stripped `font-mono + uppercase + tracking-*` from section-grammar labels across three components. Kept mono where it carries genuine data-label semantics (file-type badge, score counter):

| Location | Removed classes |
|---|---|
| `LandingHero` badge span | kept `font-mono uppercase tracking-widest` (single badge — acceptable) |
| `LandingHero` preview panel header | `font-mono uppercase tracking-widest` removed |
| `LandingHero` metric labels | `uppercase tracking-wide` removed |
| `LandingHero` preview_only footer | `font-mono uppercase tracking-wider` removed |
| `ExecutiveCommandCenter` section label | `font-mono uppercase tracking-wider` removed |
| `ExecutiveCommandCenter` overview chip | `font-mono uppercase tracking-widest` removed |
| `ExecutiveCommandCenter` metric labels | `font-mono uppercase` removed |
| `ExecutiveCommandCenter` status labels | `font-mono uppercase tracking-wide` removed |
| `ExecutiveCommandCenter` CTA button | `font-mono uppercase tracking-wider` removed; uses design-token button style |
| `EvidenceGateway` stat card `<dt>` labels (×2) | `font-mono uppercase` removed |

**Rationale:** DESIGN.md §3 permits `ui-monospace` for compact data labels and file metadata only. Section headings and repeated grammar labels must use the standard label scale.

---

## Verification

| Check | Result |
|---|---|
| Build passes | ✓ exit code 0 |
| Page count | ✓ 226 HTML files |
| TH landing hero | gradient span → `text-primary`; badge and description use tonal surface |
| EN landing hero | same (shared component) |
| TH category page | no `border-l-4`; tonal border + `bg-surface-container` |
| EN category page | same fix applied independently |
| Diff scope | 5 files, 0 unintended changes |
| No new dependencies | ✓ |
| No animation changes | ✓ |
| No dashboard/content changes | ✓ |

---

## Out of Scope (not touched)

- Finding 1 (JS reveal opacity) — requires motion-script change, separate phase
- Finding 4 (heatmap color-first) — accessibility rework, separate phase
- Finding 6 (gray-on-green hover) — requires indicator page contrast audit
- Finding 7 (mobile menu state) — navigation behaviour change
- Finding 8 (footer traceability) — content/layout addition
- Finding 10 (empty state actions) — dashboard content change

---

## Verdict

**READY_TO_COMMIT**