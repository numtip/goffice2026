# Changelog

All notable changes to the Green Office 2026 platform (`goffice2026`).

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Planned (EP-2)

- Real Maejo imagery replacing external placeholder CDN assets
- Real activities/news content integration
- Navigation and footer visual alignment with Stitch landing
- Document Center integration hook preparation

---

## [0.2.0] — 2026-06-26

### Added

- **Design Freeze v1 landing** — Eight Stitch-aligned homepage components under `src/components/landing/`
- **Stitch design tokens** — Extended Tailwind config and global CSS utilities (glass panels, mesh backgrounds)
- **EP-1 Experience Polish** — Scroll reveal, stagger animation, KPI count-up, glass hover, scene bridges
- **Landing motion module** — `src/scripts/landing-motion.ts` (lightweight, reduced-motion aware)
- **Accessibility improvements** — Skip link, section landmarks, ARIA labels, focus-visible rings
- **Performance polish** — Hero fetchpriority, image dimensions, aspect ratios, font preconnect, meta description
- **Documentation** — EP-1 performance review, session summary, project memory, next sprint plan, executive handoff

### Changed

- Homepage (`src/pages/index.astro`) replaced prior home components with Stitch landing stack
- `BaseLayout.astro` — Preconnect hints, skip-to-content link, meta description

### Fixed

- GitHub Pages preview deployment stability (base path, preview badge, link prefixing)

### Security / Governance

- No production, VPS, or DNS changes
- GitHub Pages remains preview-only per ADR-0002

---

## [0.1.0] — 2026-06-15

### Added

- Initial Astro static platform (dashboards, categories, evidence, documents, search)
- Multi-year CSV/JSON data pipeline (2568 baseline + 2569 current)
- Seven Green Office category structure
- Dashboard KPI configuration and sparkline components
- Core documentation suite and runbooks

---

[Unreleased]: https://github.com/numtip/goffice2026/compare/4c07989...HEAD
[0.2.0]: https://github.com/numtip/goffice2026/compare/976b149...4c07989
[0.1.0]: https://github.com/numtip/goffice2026/releases/tag/v0.1.0
