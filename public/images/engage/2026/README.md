# Engage Visual System — 2026

Status: **MIGRATED** (2026-08-11) — runtime now serves `web/` optimized WebP; legacy root `*2.webp` retained for compatibility.

This directory stores approved Green Office 2026 engagement visual assets. The repository has migrated from the flat legacy WebP set to the canonical folder contract (`master → derived → optimized-web`). The runtime manifest now resolves `web/<practice>-master.webp` for all 8 practice cards.

- Metadata source of truth: `docs/design/ENGAGE_VISUAL_ASSETS_2026.md`
- Runtime manifest: `src/data/engageVisuals.ts` (resolves `web/<id>-master.webp`)

## Folder structure

| Path | Content | Ratio | Naming pattern |
|------|---------|-------|----------------|
| `master/` | approved PNG source masters from Magnific | 16:9 | `<practice>-master.png` |
| `campaign/` | campaign derivatives | 4:5 | `<practice>-4x5.png` |
| `social/` | social / reels derivatives | 9:16 | `<practice>-9x16.png` |
| `cards/` | card / thumbnail derivatives | 1:1 | `<practice>-1x1.png` |
| `web/` | optimized WebP production assets (runtime card source) | all | `<practice>-<variant>.webp` |
| root `*.webp` | legacy production WebP — compatibility layer (retained) | 16:9 | `<practice>2.webp` |

## Canonical practice set

The 8 canonical practices (alphabetical): `mindset`, `energy`, `water`, `waste`, `paper`, `ghg`, `green-meeting`, `5s`.

## Canonical asset contract

Filenames are lowercase English with hyphens. Every practice follows `<practice>-<ratio>.png`:

| id | master (16:9) | campaign (4:5) | social (9:16) | cards (1:1) | web (runtime) | legacy webp (compat) |
|----|---------------|----------------|---------------|-------------|---------------|----------------------|
| mindset | `master/mindset-master.png` | `campaign/mindset-4x5.png` | `social/mindset-9x16.png` | `cards/mindset-1x1.png` | `web/mindset-master.webp` | — |
| energy | `master/energy-master.png` | `campaign/energy-4x5.png` | `social/energy-9x16.png` | `cards/energy-1x1.png` | `web/energy-master.webp` | `energy2.webp` |
| water | `master/water-master.png` | `campaign/water-4x5.png` | `social/water-9x16.png` | `cards/water-1x1.png` | `web/water-master.webp` | `water2.webp` |
| waste | `master/waste-master.png` | `campaign/waste-4x5.png` | `social/waste-9x16.png` | `cards/waste-1x1.png` | `web/waste-master.webp` | `waste2.webp` |
| paper | `master/paper-master.png` | `campaign/paper-4x5.png` | `social/paper-9x16.png` | `cards/paper-1x1.png` | `web/paper-master.webp` | `paper2.webp` |
| ghg | `master/ghg-master.png` | `campaign/ghg-4x5.png` | `social/ghg-9x16.png` | `cards/ghg-1x1.png` | `web/ghg-master.webp` | `ghg2.webp` |
| green-meeting | `master/green-meeting-master.png` | `campaign/green-meeting-4x5.png` | `social/green-meeting-9x16.png` | `cards/green-meeting-1x1.png` | `web/green-meeting-master.webp` | `green-meeting2.webp` |
| 5s | `master/5s-master.png` | `campaign/5s-4x5.png` | `social/5s-9x16.png` | `cards/5s-1x1.png` | `web/5s-master.webp` | `5s2.webp` |

Metadata (TH/EN titles, descriptions, alt text, related metric/category) is registered in `docs/design/ENGAGE_VISUAL_ASSETS_2026.md` and consumed via `src/data/engageVisuals.ts`. Optimized web assets (`.webp`) are generated from the approved PNG sources by `scripts/optimize-engage-images.mjs` (sharp `quality: 80, effort: 6`, ~95% average size reduction).

## Legacy compatibility

- The 8 legacy `*2.webp` files remain committed for compatibility but are **no longer referenced** by the runtime manifest (now `web/<id>-master.webp`).
- `procurement2.webp` is retained as-is for compatibility. `procurement` is **not** part of the canonical 8 — it was replaced by `mindset` in the runtime manifest.
- Do **not** delete the legacy `*2.webp` files until the next release cycle confirms no rollback need.

## Runtime migration status (2026-08-11) — MIGRATED

- `web/` optimized WebP generated for all 8 practices × 4 ratios (32 assets, ~95% size reduction) via `scripts/optimize-engage-images.mjs`.
- Runtime manifest (`src/data/engageVisuals.ts`) updated: `procurement` → `mindset`; all 8 cards resolve `web/<id>-master.webp`. TH/EN parity, `engageImageAvailable()` build-time existence check, and accent-placeholder fallback preserved.
- Legacy `*2.webp` files untouched on disk; no rollback path lost.

## Visual production policy

- Creative media (masters and derived PNG ratios) is created manually by the Product Owner in Magnific. Repository workflows must never generate creative media.
- GPT provides architecture, prompt engineering, QA guidance, and asset mapping only.
- Automated optimization/transcoding (WebP/AVIF) of approved PNG assets is permitted via the repository integration workflow — this is not "media generation".
- No readable Thai or English text should be embedded in images.
- Labels, titles, captions, and alt text belong in HTML/content data.
- Keep all visual assets within the same approved Green Office 2026 visual system.

## Integration

Before integrating an asset into the runtime:

1. Master asset passes visual QA.
2. Required derivatives are created (`campaign/`, `social/`, `cards/`).
3. Metadata is registered in `docs/design/ENGAGE_VISUAL_ASSETS_2026.md`.
4. Optimized WebP derivatives are generated from the approved PNG (`node scripts/optimize-engage-images.mjs`).
5. Website code references optimized production assets, never remote Magnific URLs.

## Known deviations (tracked)

- None outstanding — `social/mindset-9x16.png` renamed per contract (2026-08-11).

## Source of truth

- Magnific PNG = creative master
- Approved PNG sources stored under `master/`, `campaign/`, `social/`, `cards/` (PO media upload — kept out of git to avoid ~98 MB binary payload)
- Optimized `web/` WebP + README are committed; legacy `*2.webp` retained as compatibility layer
