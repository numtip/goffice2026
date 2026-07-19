# Green Office 2026 — Release v1.0.1

**Release Date:** 2026-07-19  
**Baseline Commit:** `75064b8`  
**Release Commit:** `[set during commit]`  
**Tag:** `v1.0.1`

---

## Summary

Patch release following PH-1 GitHub Pages production hotfix and REL-1 evidence review. No fabricated Product Owner approvals. Four indicator-level traceability mappings remain **`verification.status: pending`**.

---

## Changes Since v1.0.0

### PH-1 — Production Hotfix (`75064b8`)

- Trailing-slash URL normalization for GitHub Pages (`trailingSlash: always`)
- Thai default landing and navigation localization
- Sticky header visibility fix (desktop and mobile)
- Automated production link checker (`scripts/check-production-links.mjs`)
- 224 static pages (TH + EN routes)

### REL-1 — Evidence Review

| Evidence ID | Indicator | Audit result | verification.status |
|---|---|---|---|
| ev-energy-metering-2025 | 3.2.2 | Source + mapping confirmed | **pending** |
| ev-water-meter-q1 | 3.1.2 | Source + mapping confirmed | **pending** |
| ev-waste-monthly-2025 | 4.1.2 | Source + mapping confirmed | **pending** |
| ev-ghg-inventory-2025 | 1.5.1 | Source + mapping confirmed | **pending** |

- **17** evidence records remain `unresolved` (category-level)
- **19** review-queue items remain `decision: pending`
- Queue: `docs/evidence/GOFFICE2026_EVIDENCE_REVIEW_QUEUE.md` v0.2.0
- Evidence index: `src/data/evidence-index.json` v0.5.1

---

## Validation Results

| Check | Result |
|---|---|
| `npm run validate` | PASS |
| `npm run check` | PASS |
| `DEPLOY_TARGET=github-pages npm run build` | PASS (224 pages) |
| `npm run qa:links` | PASS |
| `npm run qa:routes` | PASS |

---

## Deployment

- **GitHub Pages:** https://numtip.github.io/goffice2026/
- Operational XLSX/CSV source files remain local (`docs/`, `data/import/`) — not published

---

## PO Action Required

To move any of the four indicator mappings to `verified`, Product Owner must record explicit approval. Until then, platform displays pending verification state only.
