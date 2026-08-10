# PR #22 — Engage Visual System · PO Visual Review

Date: 2026-08-10
Branch: `feat/engage-visual-system`
Head: `cd48690` — `fix(engage): render span layout classes on engage cards`
PR: [numtip/goffice2026#22 — feat(engage): add visual system section](https://github.com/numtip/goffice2026/pull/22)
Status: **DRAFT** (not ready for review)

---

## Local Preview Checked

| Route | HTTP | Result |
|-------|------|--------|
| `/` (TH landing) | 200 | Engage section between Evidence and Improvement |
| `/en/` (EN landing) | 200 | TH/EN parity confirmed |

> No GitHub Pages preview is available for PR branches — workflow `deploy-pages.yml` triggers only on `master`/`main`. Local preview via `npm run preview` used instead.

---

## Final Verdict

```
TECHNICAL_PREVIEW_PASS_PO_VISUAL_PENDING
```

---

## What Changed

- Engage visual section added between Evidence and Improvement on TH/EN landing
- 7 optimized WebP assets integrated (`public/images/engage/2026/`), 28–45 KB each, lazy-loaded
- TH/EN copy and alt text included for all 7 visuals
- Creative/source metadata documented (`docs/design/ENGAGE_VISUAL_ASSETS_2026.md`)
- Central manifest `src/data/engageVisuals.ts` as single source of truth

## Blocker Found / Fixed

- **Astro class interpolation issue** — `<li class="... {v.spanClass}">` rendered as literal text, breaking the desktop asymmetrical grid (all cards equal width)
- Fixed in `cd48690` — `fix(engage): render span layout classes on engage cards`
- Verified post-fix: `lg:col-span-7 lg:row-span-2` + `lg:col-span-5`×2 + `lg:col-span-3`×4 render correctly; Tailwind CSS generated for all classes

---

## PO Checklist

| # | Check | Notes |
|---|-------|-------|
| 1 | Desktop visual mood | Editorial grid: feature card + pair + row of four |
| 2 | Mobile crop | Cards stack 1-col; `object-cover` crops 1344×768 source — verify center crop on small screens |
| 3 | Premium/WOW but institutional | Confirm tone balances visual impact with institutional trust |
| 4 | Category meaning clear | Energy/Water/Waste/Paper/GHG/Green Meeting/5S mapping to metrics & categories |
| 5 | No misleading text/logo/building | Images must contain no embedded text, logos, or recognizable buildings |
| 6 | Section rhythm | Engage sits between Evidence and Improvement; check flow |

---

## Decision Options

- **APPROVE_VISUAL_AND_READY_PR** — visuals approved; PR can be marked ready for review
- **REQUEST_MINOR_LAYOUT_TWEAK** — layout adjustments (e.g. crop, spacing, card hierarchy)
- **REQUEST_IMAGE_REGEN_FOR_SPECIFIC_ASSET** — regenerate one or more Magnific assets

---

## QA (at head `cd48690`)

- `npm run check` — PASS (0 errors, 0 warnings)
- `npm run build` — PASS (254 pages)
- `npm run validate` — PASS (8 phases, 4,616 links)
- `git diff --check` — PASS
