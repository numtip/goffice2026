# Engage Visual Assets 2026 — Asset Metadata

Status: ACTIVE
Branch: `feat/engage-visual-system`
Last Updated: 2026-08-10

---

## Purpose

Document the creative and production provenance of the 8 PO-approved Engage visual assets used in the Green Office 2026 landing page (`EngageVisualSection.astro`). This document is the canonical metadata reference — any future generated visual **must** register its metadata here before integration.

---

## Storage Model

| Stage | Location | Role |
|-------|----------|------|
| **Creative master (source)** | Magnific MCP (external, not in repo) | Original generation output — 2048×1152 PNG masters |
| **Production derivative** | `public/images/engage/2026/*.webp` (this repo, GitHub) | Optimized WebP served by the static site |

Rules of the model:

- Magnific holds the creative/source master. GitHub holds only optimized production derivatives.
- Do **not** commit the large PNG masters (~2.6–4.5 MB each) — WebP derivatives only.
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
5. **Optimization target.** Production derivatives should target ≤ 150 KB each; regenerate via sharp/WebP tooling, never commit source PNG masters.

---

## Generation Workflow (for future assets)

1. Generate creative master in Magnific MCP (target 2048×1152).
2. Export PNG master (keep external — do not commit).
3. Optimize to WebP (`sharp.webp({ quality: 80, effort: 6 })`, reduce quality while > 150 KB).
4. Register metadata in this document.
5. Add/reuse entry in `src/data/engageVisuals.ts`.
6. Verify TH/EN render via build + HTML inspection.

---

## Reference

- Manifest: `src/data/engageVisuals.ts`
- Component: `src/components/landing/EngageVisualSection.astro`
- Asset destination: `public/images/engage/2026/`
