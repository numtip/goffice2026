# Changelog

All notable changes to the Green Office 2026 platform (`goffice2026`).

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Planned (EP-3 / GO-SP-3)

- SharePoint column cleanup and content-type binding confirmation
- Controlled evidence pilot upload to `GreenOfficeEvidence`
- Full 134-file registry sync and migration planning
- goffice2026 Document Center deep links to stable SharePoint URLs

---

## [1.8.0] — 2026-08-21

**Production VPS deploy** — promotes `origin/master` @ `1b11c48` (2 commits after live `v1.7.0` / `380bf3b`). Immutable release `/var/www/goffice/releases/v1.8.0`; rollback `v1.7.0`. Cinematic hero (H1.5) and CAT1 presentation polish are now live.

See [deploy record](docs/releases/GOFFICE2026_RELEASE_v1.8.0_DEPLOY.md).

---

## [1.7.0] — 2026-08-20

**Production VPS deploy** — promotes `origin/master` @ `380bf3b` (42 commits after live `v1.6.0` / `011c9fe`). Immutable release `/var/www/goffice/releases/v1.7.0`; rollback `v1.6.0`. CAT1 FY2568 freeze (1.1–1.7) is now live.

---

## [1.5.1] — 2026-08-11

**Production VPS deploy** — promotes `origin/master` @ `2bfd7ca` (2 commits after live `v1.5.0` / `c796611`). Immutable release `/var/www/goffice/releases/v1.5.1`; rollback `v1.5.0`.

### Added

- **Engage visual system (production)** — 8 PO-approved local WebP visuals (2048×1152, native 16:9) with bilingual TH/EN copy on the landing page

### Fixed

- Engage card grid — uniform 4-column desktop layout (`lg:col-span-3` × 8), 16:9 visuals with no crop/letterboxing

---

## [1.5.0] — 2026-08-10

**Production VPS deploy** — promotes `origin/master` @ `c796611` (16 commits after live `v1.4.0` / `075866b`). Immutable release `/var/www/goffice/releases/v1.5.0`; rollback `v1.4.0`.

### Added

- **GO-EVIDENCE-1 (production)** — indicator index/detail traceability UI, linked evidence, client-side evidence list filters (`?indicator=` / `?category=`) for static hosting
- **GO-DASH-V2** — command hero, resource pulse, performance explorer, partial YoY explorer; Apache ECharts 6 with localized TH insights
- Indicator listing pages (`/indicators/`, `/en/indicators/`)

### Fixed

- Evidence Thai source availability metadata parity; unavailable sources without fake file download links
- Preview hardening — demo KPI data quarantined; explicit FY2569 pending/readiness wording
- Dashboard GO-DASH-V2 Phase B–C QA/i18n; exec summary TH confidence strings
- Astro check — evidence filter scripts marked inline

### Changed

- Dashboard composition cleanup (legacy chart/sparkline components removed in favor of ECharts pipeline)
- Demo dashboard JSON moved under `archive/demo-data/` (not served as live KPI source)

### Deployment status

- **PRODUCTION_SUCCESS** — 2026-08-10 (Asia/Bangkok) · https://goffice.mju.ac.th/
- **Preview:** https://numtip.github.io/goffice2026/ (unchanged workflow; not used as production artifact)
- **No Git tag `v1.5.0`** at documentation time — VPS release label only

See [docs/releases/GOFFICE2026_RELEASE_v1.5.0_DEPLOY.md](docs/releases/GOFFICE2026_RELEASE_v1.5.0_DEPLOY.md).

---

## [1.3.0] — 2026-08-05

**Production release prep (approved by PO 2026-08-05)** — 18 commits ต่อจาก v1.2.0 (934e960). Built from `441de66`, QA ผ่านครบภายใต้ Node 20.19.5, 252 pages.

### Added

- **GO-SEARCH-1** — Global search platform (TH/EN): canonical `search-index.json`, search engine, shared components, dedicated search pages
- **GO-EVIDENCE-1** — Evidence integration: canonical evidence-links metadata + shared UI components, interconnected About / Dashboard / Evidence / Documents
- **GO-ABOUT-2** — Action Plan V2: filter, search, Gantt, print, FY2569 action plan จาก Excel pipeline
- **GO-UX-5** — Presentation layer modernization (nav, breadcrumb, hero, cards, typography, motion, BackToTop, action-plan UX, dashboard KPI readability)
- Site logo wording อัปเดตเป็น official Green Office identity (441de66)

### Fixed

- About pages: summary card แสดง total indicators (65) แทน activities; indicator counts ต่อ category บน Action Plan cards; canonical category heading; Green Office 2569 category/assessment scope; dead `monthCount` label
- CI: unblock Pages deploy (validateGenerated non-metric artifacts + astro check type errors)

### Changed

- `package.json` / lockfile / locales → `1.3.0`
- docs(playbook): GOFFICE2026_AI_AGENT_PLAYBOOK_V1 — consolidated operational constitution

### Deployment status

- **PREPARED_PENDING_DEPLOY** — pushed/tagged only; production remains `v1.2.0` (`934e960`)

See [docs/releases/GOFFICE2026_RELEASE_PREP_2026-08-05.md](docs/releases/GOFFICE2026_RELEASE_PREP_2026-08-05.md).

---

## [1.2.0] — 2026-07-20

**Green Office Evidence Platform Foundation** — repository release (no VPS deploy).

### Added

- Central SharePoint evidence library on canonical RAE site (`GreenOfficeEvidence`)
- GO-SP-1/1R/2 SharePoint documentation and schema manifest
- M365 Agent Bootstrap (persistent Edge profiles, canonical site auth verification)
- `scripts/go-sp2-library-create.mjs` library automation

### Changed

- Canonical RAE site corrected to `/sites/msteams_54adc4` (was incorrectly assessed as tenant root)
- M365 bootstrap default URL and auth probe for `researchmju`

### Known limitations

- SharePoint column internal name encoding; duplicate columns pending cleanup
- No bulk evidence migration; VPS remains v1.1.3

See [docs/releases/GOFFICE2026_RELEASE_v1.2.0.md](docs/releases/GOFFICE2026_RELEASE_v1.2.0.md).

---

## [1.1.3] — 2026-07-20

### Changed

- Official Green Office logo across site (production hotfix)

See [docs/releases/GOFFICE2026_RELEASE_v1.1.3.md](docs/releases/GOFFICE2026_RELEASE_v1.1.3.md).

---

## [1.1.2] — 2026-07-20

### Added

- CI quality gates and Node engines

### Fixed

- Dashboard mappings and bilingual 404 pages

---

## [Unreleased — prior EP-2 planning]

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
[1.3.0]: https://github.com/numtip/goffice2026/compare/v1.2.0...v1.3.0
[0.2.0]: https://github.com/numtip/goffice2026/compare/976b149...4c07989
[0.1.0]: https://github.com/numtip/goffice2026/releases/tag/v0.1.0
