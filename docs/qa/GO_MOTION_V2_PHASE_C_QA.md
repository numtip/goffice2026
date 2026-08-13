# GO-MOTION-V2 Phase C — Hero/LCP Optimization QA Record

**Date:** 2026-08-13 (Asia/Bangkok)  
**Starting SHA:** `0ae59b9`  
**Preview:** GitHub Pages only — production VPS untouched  
**Verdict:** `GO_MOTION_V2_PHASE_C_PREVIEW_READY_FOR_PO`

---

## 1. Hero asset

| | Before | After |
|---|---|---|
| File | `Executive Dashboard Hero.jpg` | `Executive Dashboard Hero.webp` (JPG preserved) |
| Dimensions | 2048×1152 | 2048×1152 |
| Bytes | 447,052 (~437 KB) | ~225 KB (−48%) |
| Crop / CSS | `object-cover object-[center_30%]` | unchanged |

Generated with existing `scripts/optimize-wow2-images.mjs` + `sharp` (q80, effort 6). No new image library. No Magnific.

## 2. Loading contract

- Landing hero: `loading="eager"` + `fetchpriority="high"` + existing `width`/`height`.
- No `<link rel="preload">` (avoids duplicate download).
- `alt=""` + `aria-hidden="true"` unchanged (decorative background).
- Shared `heroImageUrl` now points at WebP (Landing, CommandHero, MissionScene).

## 3. Optional backlog (accepted)

| Item | Verdict | Change |
|---|---|---|
| EN Knowledge eyebrow | SAFE_NOW | `KnowledgeHub.astro` uses `hub.eyebrowEn` |
| Hover 1.05 → 1.03 | SAFE_NOW | Engage landing + Knowledge cards `scale-[1.03]` |
| Evidence status labels | SAFE_NOW | Presentation map only; canonical `item.status` unchanged |

## 4. JS / performance

- Additive JS: **0 KB**. `landing-motion.ts` unchanged.
- No new dependencies.

## 5. Gates

| Gate | Result |
|---|---|
| `git diff --check` | PASS |
| `npm run check` | PASS — 0 errors, 14 pre-existing hints |
| `npm test` | PASS — 121 + 18 |
| `npm run build` | PASS — 270 pages |
| `npm run validate` | PASS |

## 6. Runtime / LCP

Local preview `http://localhost:4321`:

| Check | Result |
|---|---|
| Hero loads | PASS — WebP 2048×1152, `complete`, `fetchpriority=high` |
| Duplicate download | PASS — 1× `.webp`, 0× `.jpg`, no preload |
| LCP element | PASS — hero `<img>` WebP (localhost startTime 160 ms) |
| Transfer | ~231 KB (vs 447 KB JPG) |
| `/` `/en/` reveals | PASS — 64 each |
| Overflow 360/768/1280/1440 | PASS |
| No-JS | PASS — static HTML, no `motion-ready` |
| Reduced motion | PASS — 0 hidden reveals |
| EN Knowledge eyebrow | PASS — `Environmental Knowledge & Engagement` |
| Evidence labels | PASS — TH พร้อมใช้งาน/ยังไม่เผยแพร่; EN Available/Unpublished |

No Lighthouse CLI in repo — not measured.

## 7. Out of scope (honoured)

No Magnific, no layout redesign, no Dashboard rewrite, no dataset/evidence mapping, no VPS.
