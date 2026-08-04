# ADR-005: Metadata-Driven Knowledge Graph Navigation

## Status

ACCEPTED

## Context

As of release GO-EVIDENCE-1, the Green Office 2026 platform connects four content domains through a single canonical metadata model: **About** (policy, goals, scope, committee, action plan, feedback), **Dashboard** (six resource metrics), **Evidence** (24 certification evidence records), and **Documents** (public PDF/XLSX artifacts). GO-EVIDENCE-1 introduced the first cross-module link registry (`src/data/evidence-links.json`) and shared navigation components (`JourneyLinks`, `RelatedResources`, `Breadcrumb`, `DocumentCard`).

The platform now needs a unified search experience spanning all content domains (About, Dashboard, Evidence, Documents, News, Activities, Knowledge) without introducing a search backend, without duplicating content, and without hand-maintained search data.

The sprint brief requested this record as "ADR-0002". The repository already holds an accepted **ADR-002: Document Center M365-Backed, Evidence Separate**. Per the append-only ADR convention (see `docs/architecture/adr/README.md`), this decision is recorded as **ADR-005** and references the brief's intent. Zero-padded numbering ("ADR-0002") is not used to avoid colliding with the accepted ADR-002.

## Decision

Freeze the architecture established through GO-ABOUT-2 and GO-EVIDENCE-1 as the canonical baseline, and implement Global Search as a **metadata-driven static index** layered on that baseline. No architectural redesign is permitted in this sprint.

Specifically:

1. **One canonical search index.** `src/data/search-index.json` is generated at build time by `scripts/generate-search-index.mjs` from existing canonical metadata only (categories, issues, indicators, evidence-index, about pages/documents/summaries, dashboard KPI metadata, hubs). The index is the single source for all search UI; no page rebuilds the index inline.

2. **Metadata-driven, not hand-maintained.** The generator reads only frozen canonical sources. It never invents relationships, keywords, or routes. Any editorial addition must live in the source metadata first.

3. **Client-side static search.** Search runs in the browser over the embedded static index. No backend, no API, no external service. Minimal JavaScript — a single search module.

4. **Shared search components.** Search UI is built from reusable components (`SearchBox`, `SearchResultCard`, `SearchCategoryChip`, `SearchSection`, `SearchHighlight`) under `src/components/search/`, consumed by one page component (`SearchPage`) rendered by thin TH/EN route wrappers.

5. **Knowledge graph navigation preserved.** `evidence-links.json`, `JourneyLinks`, `RelatedResources`, and `Breadcrumb` from GO-EVIDENCE-1 remain canonical and are reused, not redesigned.

## Rationale

- **Static-first / no backend (Constitution §4, Blueprint V4 §7):** search must work on GitHub Pages and the static VPS bundle with zero server dependency.
- **No duplicated data:** a single generated index guarantees every search result is derived from exactly one canonical source. The pre-existing inline index in `search.astro` (duplicated across TH/EN) is the duplication this decision removes.
- **No duplicated UI:** one component library + one page component eliminates the TH/EN duplication of the current search page.
- **Reuse before build (Constitution §8 Rule 1):** search reuses `EvidenceCard` patterns, `getLocalizedPath`/`withBase` routing, and the GO-EVIDENCE-1 component conventions.
- **Auditor & staff ergonomics:** a single static index is trivial to regenerate (`npm run build` or the generator script) when source metadata changes.

## Consequences

**Positive**

- Search coverage is automatically complete: any new indicator, evidence record, about page, or hub slot appears in search after regenerating the index.
- TH/EN parity is structural: the index stores `[th, en]` pairs, and one page component renders both locales.
- No runtime dependency, no backend cost, no data-copy drift.
- Grouped results (About / Dashboard / Assessment / Evidence / Documents / News / Activities / Knowledge) mirror the frozen information architecture, reinforcing the knowledge-graph navigation introduced by GO-EVIDENCE-1.

**Negative**

- The static index must be regenerated when source metadata changes (automated in `npm run build` via the generator, so this is a build-step concern, not a runtime one).
- Search is limited to fields present in canonical metadata; free-text document body search (full-text of PDFs) is out of scope and would require a backend or client-side corpus — explicitly deferred (see Future extension).
- Document-level entries are indexed only when the physical `pathPublic` file exists on disk at generation time (missing files are skipped with a logged note).

## Constraints

- Do not add a backend, API, or external search service (MVP forbidden list, Constitution §12).
- Do not modify the frozen architecture from GO-ABOUT-2 / GO-EVIDENCE-1 except bug fixes.
- Do not hand-edit `search-index.json`; regenerate it.
- Do not duplicate search data or search UI across TH/EN route files.
- Keep client JavaScript minimal and keyboard-accessible.

## Future extension

- **Full-text document search:** index extracted PDF/XLSX text as a generated side-corpus when OCR/`markitdown` pipelines produce verified text (see `docs/KB/` markdown-first policy). Same static architecture, larger index.
- **Typo tolerance / Thai normalization:** add a client-side normalizer (e.g. Thai character folding, token ranking) without backend changes.
- **Search entry points:** reuse the search module inside the global navigation (command-palette style `/` shortcut already present) and in future hub pages.
- **Federated sources:** if SharePoint metadata exports become available, they can feed the generator as an additional canonical input — still producing the same static index.

## Related documents

- [ADR-001](./ADR-001-ASTRO-STATIC-FIRST.md)
- [ADR-002](./ADR-002-DOCUMENT-CENTER-BOUNDARY.md)
- [Project Constitution](../../00-GREENOFFICE_PROJECT_CONSTITUTION.MD)
- [Platform Blueprint V4](../../GREENOFFICE2026_PLATFORM_BLUEPRINT_V4.md)
- [Architecture Freeze V1](../ARCHITECTURE_FREEZE_V1.md)
- [GO-EVIDENCE-1 integration commits](https://github.com/numtip/goffice2026) — `evidence-links.json`, shared UI components
