# GOFFICE2026 — Engage Canonical Web · Production-Ready Checkpoint

**Status:** `CHECKPOINT_READY` (preview QA PASS — awaiting PO approval for production)
**Date:** 2026-08-11 (Asia/Bangkok)
**Preview URL:** https://numtip.github.io/goffice2026/ (GitHub Pages)
**Production URL:** https://goffice.mju.ac.th/ — **NOT deployed. Requires PO approval.**
**Commit deployed to preview:** `83768a55447bb65af6844154d319f2741d970d72` — `feat(engage): migrate runtime to canonical web WebP assets`

> This document is a **production-ready checkpoint only**. It records that the Engage canonical
> web migration has passed preview QA on GitHub Pages and is ready to cut over to the VPS.
> It is NOT a deploy record — production was not modified.

---

## 1. What was verified (Engage Preview Release QA)

| # | Gate | Result |
|---|------|--------|
| A | 8 Engage cards TH/EN on live GitHub Pages preview | **PASS** — 8/8 cards, canonical ids only, no procurement, no legacy `*2.webp` |
| B | Mobile QA: crop / lazy-load / CLS / alt text | **PASS** — see details below |
| C | No runtime reference to legacy `*2.webp` or `procurement` | **PASS** — scan of `src/`, `scripts/`, workflows clean (see section 4) |
| — | `npm run check` | PASS — 0 errors, 0 warnings (14 hints, pre-existing) |
| — | `npm test` | PASS — 121 + 18 dashboard tests |
| — | `npm run build` (DEPLOY_TARGET=github-pages) | PASS — 270 pages, base `/goffice2026/`, all 8 web assets resolved |
| — | GitHub Actions `deploy-pages` run `31473974595` | PASS — quality / build / deploy ✓ |

---

## 2. A — Live card verification (TH + EN)

- **TH** (`/`): section heading "8 วิถีปฏิบัติ Green Office ในสำนักงาน"; 8 cards rendered from
  `web/<id>-master.webp`; no broken images (all 2048×1152, complete).
- **EN** (`/en/`): section heading "Eight Green Practices in the Office"; same 8 canonical cards.
- Canonical id set confirmed exactly: `mindset, energy, water, waste, paper, ghg, green-meeting, 5s`.
- No `procurement` card; zero `*2.webp` references in any page image.
- Card titles (TH): รู้ก่อนเขียว · พลังงาน · น้ำ · ขยะ · กระดาษ · ก๊าซเรือนกระจก · การประชุมสีเขียว · 5ส
- Card titles (EN): Green Office Mindset · Energy · Water · Waste · Paper · GHG · Green Meeting · 5S

---

## 3. B — Mobile QA (390×844, DPR 3)

| Check | Result |
|-------|--------|
| Image crop | PASS — rendered 348×196 = natural 2048×1152 (16:9) on all 8, no crop/letterbox/stretch |
| Lazy-load | PASS — `loading="lazy"` on all 8; incremental load confirmed on fresh TH load |
| CLS | PASS — `aspect-[16/9]` reserves box; measured CLS **0.0** on both pages |
| Alt text | PASS — all 8 non-empty and localized (Thai on TH, English on EN) |
| Grid | PASS — 1 column at 390px → 4 columns/row on desktop (`lg:col-span-3`) |

---

## 4. C — Runtime reference scan (legacy `*2.webp` / `procurement`)

- `src/data/engageVisuals.ts`: all 8 entries use `web/<id>-master.webp` only; `mindset` entry present;
  no `procurement`; sole `*2.webp` mention is a doc comment.
- `scripts/` and `.github/workflows/`: no legacy webp references (two script hits are Excel
  workbook filenames `1.5waste2026.xlsx` containing the substring "waste2" — not assets).
- Components/locales: no `.webp` literals; "Green Procurement" label is the unrelated cat6 /
  journey-stage label, not a manifest id.
- All 8 `public/images/engage/2026/web/<id>-master.webp` exist on disk.

---

## 5. Runtime mapping (source of truth)

| id | Runtime asset | TH title | EN title | Link target |
|----|---------------|----------|----------|-------------|
| mindset | `web/mindset-master.webp` | รู้ก่อนเขียว | Green Office Mindset | `/categories/cat2` |
| energy | `web/energy-master.webp` | พลังงาน | Energy | `/dashboard/energy` |
| water | `web/water-master.webp` | น้ำ | Water | `/dashboard/water` |
| waste | `web/waste-master.webp` | ขยะ | Waste | `/dashboard/waste` |
| paper | `web/paper-master.webp` | กระดาษ | Paper | `/dashboard/paper` |
| ghg | `web/ghg-master.webp` | ก๊าซเรือนกระจก | GHG | `/dashboard/ghg` |
| green-meeting | `web/green-meeting-master.webp` | การประชุมสีเขียว | Green Meeting | `/categories/cat2` |
| 5s | `web/5s-master.webp` | 5ส | 5S | `/categories/cat5` |

Note: `mindset` and `green-meeting` both map to `cat2` — pre-existing PO-approved mapping, not a regression.

---

## 6. Size comparison (runtime WebP, per card)

Optimized via `scripts/optimize-engage-images.mjs` (sharp, `quality: 80, effort: 6`).
WebP derivatives are the committed runtime assets; the large PNG masters (~98 MB) remain
uncommitted sources managed by the Product Owner.

| Card | New `web/<id>-master.webp` | Legacy `<id>2.webp` |
|------|---------------------------|---------------------|
| 5s | 226 KB | 140 KB |
| energy | 103 KB | 103 KB |
| ghg | 175 KB | 141 KB |
| green-meeting | 93 KB | 93 KB |
| mindset | 193 KB | *(n/a — procurement2.webp 149 KB retired)* |
| paper | 140 KB | 139 KB |
| waste | 183 KB | 139 KB |
| water | 148 KB | 149 KB |
| **Total (8 runtime)** | **1,261 KB** | 1,052 KB (9 files incl. procurement2.webp) |

The canonical assets carry the higher-detail Magnific PNG masters (2048×1152, 16:9);
per-card delta is modest (+0–86 KB). All are well under typical LCP budgets and load
lazy. If total weight matters post-cutover, a `quality: 70` re-pass is a cheap follow-up.

---

## 7. Remaining legacy cleanup (blocked — do NOT do yet)

- The 8 legacy `*2.webp` files + `procurement2.webp` remain on disk as a compatibility /
  rollback layer. They are **no longer referenced by runtime code**.
- Deletion/renaming of legacy assets is explicitly deferred pending PO approval and a
  successful production cutover.

---

## 8. Production cutover checklist (for PO approval — NOT executed)

- [ ] PO reviews live preview: https://numtip.github.io/goffice2026/ and `/en/`
- [ ] PO approves production deploy of commit `83768a5`
- [ ] VPS deploy via existing release flow (build `PUBLIC_SITE_URL=https://goffice.mju.ac.th`,
      immutable release dir, atomic symlink, rollback target = v1.5.1)
- [ ] Post-deploy smoke on https://goffice.mju.ac.th (8 cards TH/EN, 0 placeholders)
- [ ] Only after successful production cutover: legacy `*2.webp` cleanup (separate task)

---

## 9. Known P2 (non-blocking)

1. GitHub Actions Node 20 deprecation annotations (`actions/checkout@v4`, `setup-node@v4`,
   `deploy-pages@v4` forced to Node 24) — no failure; upgrade tracked separately.
2. `astro check` 14 hints (pre-existing unused vars / inline-script hints) — 0 errors / 0 warnings.

**Verdict:** `CHECKPOINT_READY` — preview QA PASS. Production deploy requires PO approval.
