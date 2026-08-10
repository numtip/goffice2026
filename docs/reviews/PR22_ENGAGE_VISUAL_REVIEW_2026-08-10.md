# PR #22 — Engage Visual System · PO Visual Review

Date: 2026-08-10
Branch: `feat/engage-visual-system`
Head: `3a386bd` — `docs(engage): add PR22 visual review package` (before PO visual replacement)
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

## PO Decision: Full Visual Replacement Requested

**2026-08-10** — Product Owner requested a **full visual replacement** of all Engage assets with a new approved image set (8 visuals incl. green procurement, 2048×1152 masters).

Replacement executed in commit `feat(engage): replace visuals with PO-approved assets`:

| Old asset | New asset |
|-----------|-----------|
| `energy.webp` | `energy2.webp` |
| `water.webp` | `water2.webp` |
| `waste.webp` | `waste2.webp` |
| `paper.webp` | `paper2.webp` |
| `ghg.webp` | `ghg2.webp` |
| `green-meeting.webp` | `green-meeting2.webp` |
| `5s.webp` | `5s2.webp` |
| — | `procurement2.webp` (new: Green Procurement, cat6) |

Section count 7 → 8; TH heading updated to "8 วิถีปฏิบัติ Green Office ในสำนักงาน"; grid extended to 8-card editorial layout.

---

## Final Verdict

```
PO_VISUAL_ACCEPTANCE_PASS
```

**2026-08-10 (final acceptance)** — Product Owner approved the 8-asset visual set. Verified TH + EN on desktop/mobile: all 8 visuals render, crop/focal point acceptable, consistent rhythm, heading does not imply assessment categories, alt text accurate, no old references, no placeholders. PR marked Ready for review — not merged, not deployed.

---

## What Changed

- Engage visual section added between Evidence and Improvement on TH/EN landing
- **8 PO-approved WebP assets** integrated (`public/images/engage/2026/`), 93–149 KB each, lazy-loaded
- TH/EN copy and alt text included for all 8 visuals (incl. Green Procurement)
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
| 1 | Desktop visual mood | Editorial grid: feature card + pair + row of three + row of two (8 cards) |
| 2 | Mobile crop | Cards stack 1-col; `object-cover` crops 2048×1152 source — verify center crop on small screens |
| 3 | Premium/WOW but institutional | Confirm tone balances visual impact with institutional trust |
| 4 | Category meaning clear | Energy/Water/Waste/Paper/GHG/Green Meeting/5S/Green Procurement mapping to metrics & categories |
| 5 | No misleading text/logo/building | Images must contain no embedded text, logos, or recognizable buildings |
| 6 | Section rhythm | Engage sits between Evidence and Improvement; check flow |

---

## Decision Options

- **APPROVE_VISUAL_AND_READY_PR** — visuals approved; PR can be marked ready for review
- **REQUEST_MINOR_LAYOUT_TWEAK** — layout adjustments (e.g. crop, spacing, card hierarchy)
- **REQUEST_IMAGE_REGEN_FOR_SPECIFIC_ASSET** — regenerate one or more Magnific assets

---

## QA (at head `3a386bd` / before visual replacement)

- `npm run check` — PASS (0 errors, 0 warnings)
- `npm run build` — PASS (254 pages)
- `npm run validate` — PASS (8 phases, 4,616 links)
- `git diff --check` — PASS

> QA re-run after PO-approved visual replacement recorded in the replacement commit report.
