# Engage Visual Assets 2026 — Asset Metadata

Status: MIGRATING (legacy WebP active in runtime; new PNG folder contract staged)
Branch: `master`
Last Updated: 2026-08-11

---

## Purpose

Document the creative and production provenance of the 8 PO-approved Engage visual assets used in the Green Office 2026 landing page (`EngageVisualSection.astro`). This document is the canonical metadata reference — any future generated visual **must** register its metadata here before integration.

---

## Storage Model

| Stage | Location | Role |
|-------|----------|------|
| **Creative master (source)** | Magnific MCP (external) → exported to `public/images/engage/2026/master/*.png` | Original generation output — 2048×1152 PNG masters (16:9) |
| **Derived PNG ratios** | `public/images/engage/2026/{campaign,social,cards}/` | 4:5 / 9:16 / 1:1 derivatives from the master |
| **Production derivative (legacy, active)** | `public/images/engage/2026/*.webp` | Optimized WebP served by the static site today (compatibility layer) |
| **Optimized web (planned)** | `public/images/engage/2026/web/` | WebP/AVIF generated from approved PNG by the integration workflow |

Rules of the model:

- Magnific holds the creative/source master. Approved PNG masters and derived ratios are committed under `public/images/engage/2026/{master,campaign,social,cards}/` (migration state 2026-08-11).
- Legacy `*2.webp` derivatives remain committed and are the active runtime set referenced by `src/data/engageVisuals.ts`; do not delete/rename them until the runtime manifest is migrated.
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

## Migration State (2026-08-11)

The runtime (`src/data/engageVisuals.ts`) still resolves the legacy `*2.webp` set (asset table above). The new folder contract is staged and asset-only — the PNG folders below are committed but not yet referenced by any code. Legacy WebP is retained as the compatibility layer; do not delete/rename it until runtime migration.

### Canonical 8 vs legacy 8

- Canonical practice set: `mindset`, `energy`, `water`, `waste`, `paper`, `ghg`, `green-meeting`, `5s`.
- Legacy set adds `procurement` (`procurement2.webp`, cat6) and lacks `mindset`. `procurement` is retained for runtime compatibility but is **not** part of the canonical 8 — the canonical set replaces it with `mindset`.

### Canonical naming + metadata mapping

Files are lowercase English with hyphens (`<practice>-<ratio>.png`). Titles, descriptions, and alt text continue to live in `src/data/engageVisuals.ts`.

| id | master (16:9) | campaign (4:5) | social (9:16) | cards (1:1) | TH semantic | EN semantic | related metric | related category | manifest entry |
|----|---------------|----------------|---------------|-------------|-------------|-------------|----------------|------------------|----------------|
| mindset | `master/mindset-master.png` | `campaign/mindset-4x5.png` | `social/mindset-9x16.png` | `cards/mindset-1x1.png` | TBD (register with manifest) | TBD (register with manifest) | — | — | PENDING |
| energy | `master/energy-master.png` | `campaign/energy-4x5.png` | `social/energy-9x16.png` | `cards/energy-1x1.png` | ประหยัดพลังงานไฟฟ้าในสำนักงาน | Saving office electricity | `energy` | cat3 | legacy webp (`energy2.webp`) |
| water | `master/water-master.png` | `campaign/water-4x5.png` | `social/water-9x16.png` | `cards/water-1x1.png` | การอนุรักษ์น้ำอย่างเป็นระบบ | Systematic water conservation | `water` | cat3 | legacy webp (`water2.webp`) |
| waste | `master/waste-master.png` | `campaign/waste-4x5.png` | `social/waste-9x16.png` | `cards/waste-1x1.png` | การคัดแยกขยะและนำกลับมาใช้ใหม่ | Waste sorting and reuse | `waste` | cat4 | legacy webp (`waste2.webp`) |
| paper | `master/paper-master.png` | `campaign/paper-4x5.png` | `social/paper-9x16.png` | `cards/paper-1x1.png` | การทำงานไร้กระดาษ | Paperless workflow | `paper` | cat3 | legacy webp (`paper2.webp`) |
| ghg | `master/ghg-master.png` | `campaign/ghg-4x5.png` | `social/ghg-9x16.png` | `cards/ghg-1x1.png` | การวัดและลดก๊าซเรือนกระจก | GHG measurement and low-carbon awareness | `ghg` | cat3 | legacy webp (`ghg2.webp`) |
| green-meeting | `master/green-meeting-master.png` | `campaign/green-meeting-4x5.png` | `social/green-meeting-9x16.png` | `cards/green-meeting-1x1.png` | การประชุมสีเขียวแบบไร้กระดาษ | Sustainable green meetings | — | cat2 | legacy webp (`green-meeting2.webp`) |
| 5s | `master/5s-master.png` | `campaign/5s-4x5.png` | `social/5s-9x16.png` | `cards/5s-1x1.png` | การจัดระเบียบสำนักงานด้วยหลัก 5ส | Organized office following 5S | — | cat5 | legacy webp (`5s2.webp`) |

Known deviation: `social/mindset9x16.png` is missing its contract hyphen (should be `social/mindset-9x16.png`) — Product Owner to rename on the next asset pass.

---

## Runtime Migration Prep (2026-08-11)

Optimized web assets do **not** exist yet (no `web/` folder under `public/images/engage/2026/`). The runtime therefore stays on the legacy `*2.webp` set. The `procurement → mindset` swap is **gated** on optimized assets existing + PO approval — do not rewire `src/data/engageVisuals.ts` until then.

### Canonical web asset mapping (planned)

Generated by the repository integration workflow from the approved PNG sources, mirroring `scripts/optimize-wow2-images.mjs` (same stem, `.png → .webp`, sharp `quality: 80, effort: 6`, original preserved). The runtime card consumes the 16:9 `master` variant; the other ratios serve campaign/social/cards use.

| id | web 16:9 (runtime card) | campaign 4:5 | social 9:16 | cards 1:1 |
|----|-------------------------|--------------|-------------|-----------|
| mindset | `web/mindset-master.webp` | `web/mindset-4x5.webp` | `web/mindset-9x16.webp` | `web/mindset-1x1.webp` |
| energy | `web/energy-master.webp` | `web/energy-4x5.webp` | `web/energy-9x16.webp` | `web/energy-1x1.webp` |
| water | `web/water-master.webp` | `web/water-4x5.webp` | `web/water-9x16.webp` | `web/water-1x1.webp` |
| waste | `web/waste-master.webp` | `web/waste-4x5.webp` | `web/waste-9x16.webp` | `web/waste-1x1.webp` |
| paper | `web/paper-master.webp` | `web/paper-4x5.webp` | `web/paper-9x16.webp` | `web/paper-1x1.webp` |
| ghg | `web/ghg-master.webp` | `web/ghg-4x5.webp` | `web/ghg-9x16.webp` | `web/ghg-1x1.webp` |
| green-meeting | `web/green-meeting-master.webp` | `web/green-meeting-4x5.webp` | `web/green-meeting-9x16.webp` | `web/green-meeting-1x1.webp` |
| 5s | `web/5s-master.webp` | `web/5s-4x5.webp` | `web/5s-9x16.webp` | `web/5s-1x1.webp` |

### Prepared mindset manifest entry (staged — not active)

Full metadata mapped from the knowledge hub (`src/data/knowledge/practices.json`, route `/knowledge/green-office-mindset/`) ready for the swap.

| field | value |
|-------|-------|
| id | `mindset` |
| file (future) | `web/mindset-master.webp` |
| titleTh | `รู้ก่อนเขียว` |
| titleEn | `Green Office Mindset` |
| descriptionTh | `ทำความรู้จัก Green Office ว่าคืออะไร เชื่อมโยงพฤติกรรมในสำนักงานกับผลกระทบต่อสิ่งแวดล้อมและก๊าซเรือนกระจกอย่างไร` |
| descriptionEn | `Understand what Green Office means and how everyday office behaviour connects to environmental impact and greenhouse gas.` |
| altTh | `ภาพประกอบแนวคิด Green Office สำนักงานสีเขียวเริ่มต้นจากความคิดของทุกคน` |
| altEn | `Illustration of the Green Office mindset — a green office starts with how we think` |
| relatedMetric | none (category-only, like `green-meeting` / `5s`) |
| relatedCategory | `cat2` (Communication and Awareness Cultivation); `cat1` secondary via GHG indicators |
| accent (proposed) | `#0891b2` / `#cffafe` — avoids collision with ghg card (`#0f766e`) |

Procurement content is not lost by the swap: it is covered by the `green-meeting` knowledge practice (cat6 indicators 6.1.x) and the `การจัดซื้อสีเขียว` journey stage label; the Engage card copy exists only in `engageVisuals.ts`.

### Swap checklist

1. [ ] PO renames `social/mindset9x16.png` → `social/mindset-9x16.png` (contract).
2. [ ] Integration workflow generates `web/mindset-master.webp` + ratio variants.
3. [ ] PO approves mindset card copy + accent proposal.
4. [ ] Replace the `procurement` entry with the prepared `mindset` entry in `src/data/engageVisuals.ts`; keep `procurement2.webp` on disk (no deletion).
5. [ ] Build + preview QA — TH/EN parity and placeholder fallback intact.

---

## Generation Workflow (for future assets)

1. Generate creative master in Magnific MCP (target 2048×1152).
2. Export PNG master and commit to `public/images/engage/2026/master/<practice>-master.png`.
3. Create derived ratios: `campaign/<practice>-4x5.png`, `social/<practice>-9x16.png`, `cards/<practice>-1x1.png`.
4. Register metadata in this document (canonical mapping table above).
5. On runtime migration, add/reuse entry in `src/data/engageVisuals.ts` pointing at optimized web assets.
6. Generate optimized WebP/AVIF (`sharp.webp({ quality: 80, effort: 6 })`, reduce quality while > 150 KB).
7. Verify TH/EN render via build + HTML inspection.

---

## Reference

- Manifest: `src/data/engageVisuals.ts`
- Component: `src/components/landing/EngageVisualSection.astro`
- Asset destination: `public/images/engage/2026/`
