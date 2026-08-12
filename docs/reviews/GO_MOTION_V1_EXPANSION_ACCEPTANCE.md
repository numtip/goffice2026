# GO-MOTION-V1 — Expansion Acceptance & Contract Reconciliation

**Date:** 2026-08-13 (Asia/Bangkok)
**Baseline:** `02e4eaf` / origin/master (clean tracked state)
**Latest independent QA (Codex):** `ACCEPT_WITH_NOTES` — current acceptance authority
**Status:** `GO_MOTION_V1_EXPANSION_PREVIEW_ACCEPTED_WITH_NOTES`

---

## 1. Acceptance Lineage

| SHA | Change | Acceptance |
|---|---|---|
| `f864513` | GitHub Preview acceptance | `GO_MOTION_V1_GITHUB_PREVIEW_READY_FOR_PO` |
| `4c73a75` | Expansion prototype — Knowledge Hub practice-grid reveal/stagger | preview acceptance candidate |
| `02e4eaf` | Targeted fix — stagger 8th card + truthful static evidence totals | after independent `TARGETED_FIX` |
| `02e4eaf` (HEAD) | — | latest independent Codex `ACCEPT_WITH_NOTES` |

Historical reports (`GO_MOTION_V1_PHASE_D_QA_REPORT.md`, `GO_MOTION_V1_PHASE_E_ACCEPTANCE.md`, `GO_MOTION_V1_GITHUB_PREVIEW_ACCEPTANCE.md`) remain historical evidence and are not rewritten.

## 2. Canonical Motion Contract (reconciled in Blueprint V5 §11)

Accepted implementation is the source of truth for motion timing:

- **Reveal duration:** 750ms (`.landing-reveal` transition `0.75s`), not 200–400ms.
- **Stagger:** 8 steps, 80ms interval, 0→560ms (`.landing-stagger > .landing-reveal:nth-child(1..8)`), not "cap 6".
- **Easing:** single canonical `cubic-bezier(0.16, 1, 0.3, 1)` (`.ease-out-expo`) — unchanged.

Blueprint V5 §11.1, §11.2, §11.9 updated accordingly. No source changes made to satisfy stale docs.

## 3. Canonical Node Contract (reconciled in Blueprint V5 §6)

- **Compatibility floor:** `engines: node >=20` (package.json).
- **Canonical CI/release runtime:** Node 24 (`.github/workflows/deploy-pages.yml` — currently passing).
- **Production release runtime:** recorded historically as Node 20 (v1.5.1) / Node 22 (v1.5.0); runbook says "Use Node 20".

Blueprint V5 §6 wording corrected to state floor and CI runtime separately; no runtime/toolchain changed.

## 4. Post-VPS Backlog (recorded, NOT fixed here)

- EN Knowledge eyebrow renders Thai (`hub.eyebrowTh` used unconditionally in `KnowledgeHub.astro`).
- Hover image scale 1.05 (`group-hover:scale-105`) vs older documented `scale(1.03)` in Blueprint §11.4.

Favicon root probe (`https://numtip.github.io/favicon.svg` → 404) = no action (GitHub Pages base-path artefact).

---

**PRODUCTION STATUS:** UNTOUCHED. VPS promotion readiness requires PO approval + independent Codex re-QA after the targeted fix.
