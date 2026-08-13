# GO-MOTION-V2 — Preview Acceptance Record

**Date:** 2026-08-13 (Asia/Bangkok)  
**Accepted code baseline:** `011c9fe` (`feat(perf): GO-MOTION-V2 Phase C hero LCP WebP`)  
**Preview URL:** https://numtip.github.io/goffice2026/  
**GitHub Pages run:** `31715072246` — PASS (quality/build/deploy ✓)  
**PO decision:** **APPROVED FOR PRODUCTION**  
**Status:** `ACCEPTED`

---

## 1. Preview Lineage

| Phase | SHA | QA record |
|---|---|---|
| A — Evidence Control Room landing | `fbf86d1` | `docs/qa/GO_MOTION_V2_PHASE_A_QA.md` |
| B — Visual refinement | `0ae59b9` | `docs/qa/GO_MOTION_V2_PHASE_B_QA.md` |
| C — Hero LCP WebP | `011c9fe` | `docs/qa/GO_MOTION_V2_PHASE_C_QA.md` |

Rollback baseline (current production): `v1.5.1` / `2bfd7ca` at `/var/www/goffice/releases/v1.5.1`.

## 2. Acceptance Criteria

| Criterion | Result |
|---|---|
| Evidence Control Room landing composition | ✓ — Hero → Journey → KPI → Showcase → Evidence → Engage/Knowledge |
| Hero CTAs (Dashboard + Evidence) | ✓ — TH/EN parity |
| No fake Command Center sparklines on landing | ✓ — `#command-center-title` absent |
| Hero WebP served (LCP) | ✓ — `Executive Dashboard Hero.webp` 2048×1152 (~225 KB) |
| TH/EN content parity | ✓ — 64 `.landing-reveal` each; eyebrow EN fixed in Phase C |
| Reduced-motion / no-JS fallback | ✓ — static HTML visible; 14/72 and 10/24 truthful |
| Motion JS budget | ✓ — 1.25 KB raw / 0.67 KB gzip; 0 additive JS in V2 |
| Evidence unavailable states truthful | ✓ — canonical status from `evidence-index.json` |
| GitHub Pages preview deploy | ✓ — run `31715072246` success |

## 3. Quality Gates (baseline `011c9fe`)

| Gate | Result |
|---|---|
| `git diff --check` | PASS |
| `npm run check` | PASS — 0 errors, 14 pre-existing hints |
| `npm test` | PASS — 121 + 18 |
| `npm run build` | PASS — 270 pages |
| `npm run validate` | PASS |

## 4. Known MINOR Backlog (non-blocking)

1. GitHub Actions Node 20 deprecation annotations — P2; no failure.
2. 14 pre-existing `astro check` hints — P2.
3. No Lighthouse CLI in repo — LCP improvement not formally measured on preview.
4. Unused locale keys retained for rollback (`home.hero.cta_categories`, etc.).

## 5. Production Authorization

**APPROVED FOR PRODUCTION** — promote accepted baseline `011c9fe` via immutable VPS release workflow.  
Production URL: https://goffice.mju.ac.th/  
Nginx / Cloudflare / M365 / data-sync / datasets: **unchanged**.

---

**Decision recorded by:** AI-assisted production promotion session  
**Acceptance status:** `ACCEPTED`
