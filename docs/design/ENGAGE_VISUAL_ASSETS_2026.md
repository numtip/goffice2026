# Engage Visual Assets 2026 — Asset Metadata

Status: MIGRATED (runtime on `web/` optimized WebP; legacy root `*2.webp` retained for compatibility)
Branch: `master`
Last Updated: 2026-08-11

---

## Purpose

Document the creative and production provenance of the 8 PO-approved Engage visual assets used in the Green Office 2026 landing page (`EngageVisualSection.astro`). This document is the canonical metadata reference — any future generated visual **must** register its metadata here before integration.

---

## Storage Model

| Stage | Location | Role |
|-------|----------|------|
| **Creative master (source)** | Magnific MCP (external) → `public/images/engage/2026/master/*.png` | Original generation output — 2048×1152 PNG masters (16:9) |
| **Derived PNG ratios** | `public/images/engage/2026/{campaign,social,cards}/` | 4:5 / 9:16 / 1:1 derivatives from the master |
| **Optimized web (runtime)** | `public/images/engage/2026/web/*.webp` | WebP served by the static site — generated from approved PNG by `scripts/optimize-engage-images.mjs` |
| **Production derivative (legacy, compat)** | `public/images/engage/2026/*.webp` | Retired runtime set — retained on disk for rollback compatibility |

Rules of the model:

- Magnific holds the creative/source master. Approved PNG masters and derived ratios are stored under `public/images/engage/2026/{master,campaign,social,cards}/` (PO media upload; kept out of git commits to avoid a ~98 MB binary payload).
- Runtime serves optimized WebP from `web/`; legacy `*2.webp` files remain committed but are no longer referenced by `src/data/engageVisuals.ts`.
- The naming contract below is referenced by `src/data/engageVisuals.ts`; do not rename files.

---

## Asset Table

| id | filename | visual role | intended page/section | TH semantic | EN semantic | related metric/category | source model | source size | final format | final size | prompt summary | usage note |
|----|----------|-------------|------------------------|-------------|-------------|--------------------------|--------------|-------------|--------------|------------|----------------|------------|
| energy | `energy2.webp` | Feature card — energy saving | Landing · Engage section | ประหยัดพลังงานไฟฟ้าในสำนักงาน | Saving office electricity | metric: `energy` · cat3 | Magnific MCP | 2048×1152 | WebP | 102.9 KB | Editorial illustration of an energy-efficient office | Lazy-loaded card 1 (large feature span) |
| water | `water2.webp` | Card — water conservation | Landing · Engage section | การอนุรักษ์น้ำอย่างเป็นระบบ | Systematic water conservation | metric: `water` · cat3 | Magnific MCP | 2048×1152 | WebP | 148.5 KB | Editorial illustration of office water conservation | Lazy-loaded card |
| waste | `waste2.webp` | Card — waste sorting/reuse | Landing · Engage section | การคัดแยกขยะและนำกลับมาใช้ใหม่ | Waste sorting and reuse | metric: `waste` · cat4 | Magnific MCP | 2048×1152 | WebP | 139.3 KB | Editorial illustration of segregated waste bins and reuse | Lazy-loaded card |
| paper | `paper2.webp` | Card — paperless workflow | Landing · Engage section | การทำงานไร้กระดาษ | Paperless workflow | metric: `paper` · cat3 | Magnific MCP | 2048×1152 | WebP | 138.6 KB | Editorial illustration of digital paperless office workflow | Lazy-loaded card |
| ghg | `ghg2.webp` | Card — GHG measurement | Landing · Engage section | การวัดและลดก๊าซเรือนกระจก | GHG measurement and low-carbon awareness | metric: `ghg` · cat3 | Magnific MCP | 2048×1152 | WebP | 140.8 KB | Editorial illustration of GHG measurement and low-carbon habits | Lazy-loaded card |
| green-meeting | `green-meeting2.webp` | Card — sustainable meetings | Landing · Engage section | การประชุมสีเขียวแบบไร้กระดาษ | Sustainable green meetings | cat2 | Magnific MCP | 2048×1152 | WebP | 93.4 KB | Editorial illustration of hybrid paperless green meeting | Lazy-loaded card |
| 5s | `5s2.webp` | Card — organized office | Landing · Engage section | การจัดระเบียบสำนักงานด้วยหลัก 5ส | Organized office following 5S | cat5 | Magnific MCP | 2048×1152 | WebP | 139.6 KB | Editorial illustration of a clean, safe, organized office (5S) | Lazy-loaded card |
| procurement | `procurement2.webp` | Card — green procurement | Landing · Engage section | การจัดซื้อจัดจ้างสีเขียว | Green procurement | cat6 | Magnific MCP | 2048×1152 | WebP | 149.2 KB | Editorial illustration of environmentally preferred purchasing | Lazy-loaded card |

---

## Explicit Rules

1. **No text embedded in images.** All visible TH/EN text (titles, descriptions, labels) is rendered as HTML/CSS content, never baked into the asset.
2. **No hotlinking Magnific URLs.** Assets are served exclusively from local optimized WebP under `public/images/engage/2026/`. Remote Magnific URLs must never appear in code.
3. **Alt text parity.** Every asset has TH/EN alt text defined in `src/data/engageVisuals.ts` (`altTh` / `altEn`).
4. **Metadata before integration.** Any future generated visual must be registered in this document's asset table **before** code integration, and committed in the same change set.
5. **Optimization target.** Production derivatives should target ≤ 150 KB each; regenerate via sharp/WebP/AVIF tooling from the approved PNG sources.

---

## Migration State (2026-08-11) — MIGRATED

The runtime (`src/data/engageVisuals.ts`) now resolves `web/<id>-master.webp` for all 8 canonical practice cards. `procurement` was replaced by `mindset`. Legacy `*2.webp` files remain committed but are no longer referenced.

### Canonical 8 (active)

- Canonical practice set: `mindset`, `energy`, `water`, `waste`, `paper`, `ghg`, `green-meeting`, `5s`.
- `procurement2.webp` is retained on disk (compatibility) but is **not** part of the canonical 8 — the runtime replaced it with `mindset`.

### Canonical naming + metadata mapping

Files are lowercase English with hyphens (`<practice>-<ratio>.png`, `web/<practice>-<variant>.webp`). Titles, descriptions, and alt text live in `src/data/engageVisuals.ts`.

| id | master (16:9) | campaign (4:5) | social (9:16) | cards (1:1) | web (runtime) | TH semantic | EN semantic | related metric | related category | manifest entry |
|----|---------------|----------------|---------------|-------------|---------------|-------------|-------------|----------------|------------------|----------------|
| mindset | `master/mindset-master.png` | `campaign/mindset-4x5.png` | `social/mindset-9x16.png` | `cards/mindset-1x1.png` | `web/mindset-master.webp` | รู้ก่อนเขียว — ทำความรู้จัก Green Office | Green Office Mindset — understand before acting | — | cat2 | `web/mindset-master.webp` |
| energy | `master/energy-master.png` | `campaign/energy-4x5.png` | `social/energy-9x16.png` | `cards/energy-1x1.png` | `web/energy-master.webp` | ประหยัดพลังงานไฟฟ้าในสำนักงาน | Saving office electricity | `energy` | cat3 | `web/energy-master.webp` |
| water | `master/water-master.png` | `campaign/water-4x5.png` | `social/water-9x16.png` | `cards/water-1x1.png` | `web/water-master.webp` | การอนุรักษ์น้ำอย่างเป็นระบบ | Systematic water conservation | `water` | cat3 | `web/water-master.webp` |
| waste | `master/waste-master.png` | `campaign/waste-4x5.png` | `social/waste-9x16.png` | `cards/waste-1x1.png` | `web/waste-master.webp` | การคัดแยกขยะและนำกลับมาใช้ใหม่ | Waste sorting and reuse | `waste` | cat4 | `web/waste-master.webp` |
| paper | `master/paper-master.png` | `campaign/paper-4x5.png` | `social/paper-9x16.png` | `cards/paper-1x1.png` | `web/paper-master.webp` | การทำงานไร้กระดาษ | Paperless workflow | `paper` | cat3 | `web/paper-master.webp` |
| ghg | `master/ghg-master.png` | `campaign/ghg-4x5.png` | `social/ghg-9x16.png` | `cards/ghg-1x1.png` | `web/ghg-master.webp` | การวัดและลดก๊าซเรือนกระจก | GHG measurement and low-carbon awareness | `ghg` | cat3 | `web/ghg-master.webp` |
| green-meeting | `master/green-meeting-master.png` | `campaign/green-meeting-4x5.png` | `social/green-meeting-9x16.png` | `cards/green-meeting-1x1.png` | `web/green-meeting-master.webp` | การประชุมสีเขียวแบบไร้กระดาษ | Sustainable green meetings | — | cat2 | `web/green-meeting-master.webp` |
| 5s | `master/5s-master.png` | `campaign/5s-4x5.png` | `social/5s-9x16.png` | `cards/5s-1x1.png` | `web/5s-master.webp` | การจัดระเบียบสำนักงานด้วยหลัก 5ส | Organized office following 5S | — | cat5 | `web/5s-master.webp` |

Web asset sizes (sharp `quality: 80, effort: 6`): 90–226 KB per asset; ~95.4% average reduction from PNG source.

---

## Generation Workflow (for future assets)

1. Generate creative master in Magnific MCP (target 2048×1152).
2. Export PNG master and commit to `public/images/engage/2026/master/<practice>-master.png`.
3. Create derived ratios: `campaign/<practice>-4x5.png`, `social/<practice>-9x16.png`, `cards/<practice>-1x1.png`.
4. Register metadata in this document (canonical mapping table above).
5. Run `node scripts/optimize-engage-images.mjs` to generate `web/<practice>-<variant>.webp` derivatives.
6. Add/reuse entry in `src/data/engageVisuals.ts` pointing at the optimized web asset.
7. Verify TH/EN render via build + HTML inspection.

---

## Reference

- Manifest: `src/data/engageVisuals.ts`
- Component: `src/components/landing/EngageVisualSection.astro`
- Asset destination: `public/images/engage/2026/`
