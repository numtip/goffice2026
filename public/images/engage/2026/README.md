# Engage Visual System — Asset Destination (2026)

Place the 7 **approved Magnific-generated master assets** (WebP, locally optimized) here.

## Naming contract

| # | Asset | Required filename |
|---|-------|-------------------|
| 1 | Energy | `energy.webp` |
| 2 | Water | `water.webp` |
| 3 | Waste | `waste.webp` |
| 4 | Paper | `paper.webp` |
| 5 | GHG | `ghg.webp` |
| 6 | Green Meeting | `green-meeting.webp` |
| 7 | 5S | `5s.webp` |

## Rules

- **Local WebP only.** Never hotlink remote Magnific URLs in code.
- **No text embedded in image** — all labels/alt text are rendered in HTML.
- Optimize for web (target < 150 KB per asset, aspect-ratio 4:3 or 16:10).
- Do **not** rename files after drop-in — `src/data/engageVisuals.ts` resolves paths from this contract.

## Status

- [ ] `energy.webp`
- [ ] `water.webp`
- [ ] `waste.webp`
- [ ] `paper.webp`
- [ ] `ghg.webp`
- [ ] `green-meeting.webp`
- [ ] `5s.webp`

While assets are pending, `EngageVisualSection.astro` renders a styled accent placeholder automatically (no broken images).
