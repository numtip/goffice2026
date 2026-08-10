# Engage Visual System — Asset Destination (2026)

8 **PO-approved visual assets**, optimized to local WebP.

Full creative/source metadata: [`docs/design/ENGAGE_VISUAL_ASSETS_2026.md`](../../../docs/design/ENGAGE_VISUAL_ASSETS_2026.md)

## Files (naming contract)

| # | Asset | Filename | Size |
|---|-------|----------|------|
| 1 | Energy | `energy2.webp` | ~103 KB |
| 2 | Water | `water2.webp` | ~149 KB |
| 3 | Waste | `waste2.webp` | ~139 KB |
| 4 | Paper | `paper2.webp` | ~139 KB |
| 5 | GHG | `ghg2.webp` | ~141 KB |
| 6 | Green Meeting | `green-meeting2.webp` | ~93 KB |
| 7 | 5S | `5s2.webp` | ~140 KB |
| 8 | Green Procurement | `procurement2.webp` | ~149 KB |

## Rules

- **Local WebP only.** Never hotlink remote Magnific URLs in code.
- **No text embedded in image** — all labels/alt text are rendered in HTML.
- Source master PNGs (2048×1152, ~2.6–4.5 MB each) are **not committed** — WebP derivatives only.
- Do **not** rename files — `src/data/engageVisuals.ts` resolves paths from this contract.
- Future generated visuals must register metadata in `docs/design/ENGAGE_VISUAL_ASSETS_2026.md` before integration.

## Status

- [x] `energy2.webp`
- [x] `water2.webp`
- [x] `waste2.webp`
- [x] `paper2.webp`
- [x] `ghg2.webp`
- [x] `green-meeting2.webp`
- [x] `5s2.webp`
- [x] `procurement2.webp`

All assets present — `EngageVisualSection.astro` renders real lazy-loaded WebP images.
