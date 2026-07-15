# Round 4 — Final Platform Completion & Production Readiness

## Contracts

### A. Canonical Taxonomy (Immutable)
- Categories: 7 (codes cat1–cat7)
- Issues: 24
- Indicators: 65
- Official weights: cat1=25, cat2=15, cat3=15, cat4=15, cat5=15, cat6=15; cat7=null (separate 7.1=40, 7.2=60)
- Source: `src/data/criteria/categories.json`, `issues.json`, `indicators.json`

### B. Evidence Reality
- 21 records, all `traceabilityLevel: "category"`, all `verification: "unresolved"`
- Source: `src/data/evidence-index.json` (v0.3.0)
- No false indicator-level mapping permitted

### C. Locale
- Default: `th`, Supported: `en`, No `/th/` prefix, `/en/` namespace

### D. Static Platform
- Astro static output, GitHub Pages compatible, no required server runtime

### E. Old Legacy Data
- `src/data/categories.json` (v0.1.0, English-only) — used by 5 files that should migrate to canonical `src/data/criteria/categories.json`

---

## Parallel Ownership Map

| Worker | Owns | Key Files |
|--------|------|-----------|
| A (Search) | `/search*`, search components, search index | `src/pages/search.astro` |
| B (Integration) | Dashboard→indicator, evidence→category backlinks | `src/pages/dashboard/[id].astro`, `src/pages/categories/` |
| C (Bilingual) | `/en/categories/`, `/en/indicators/`, `/en/evidence/` | New route files |
| D (UX/A11y/SEO) | Audit reports, layout meta fixes, hreflang | `src/layouts/BaseLayout.astro`, all pages |
| E (Validation) | `npm run validate`, release checklist | `scripts/*`, `docs/*` |

No worker modifies canonical taxonomy or evidence-index without Head approval.
