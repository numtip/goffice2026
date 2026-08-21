# Green Office 2026 — Release Changelog

Cumulative release history for the `goffice2026` repository.  
Format inspired by [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

For day-to-day development changes see also [CHANGELOG.md](../../CHANGELOG.md) at repository root.

---

## [1.8.0] — 2026-08-21

**Release title:** Cinematic hero + CAT1 presentation polish (VPS)
**Branch:** `master`
**Deployed commit:** `1b11c48b5297fe9ac798a16a6a5c760539b48d34`
**Previous production:** `v1.7.0` / `380bf3b`
**Status:** `PRODUCTION_SUCCESS` · `V1.8.0_PRODUCTION_DEPLOYED`

Promotes 2 commits after v1.7.0 (`380bf3b` → `1b11c48`): cinematic Green Office hero (H1.5 — JS-gated MP4 loop + eager WebP posters, 6.6 MB under the 10 MB cap) and Category 1 presentation polish (domain snapshot, source documents, projects plan, indicator journeys) with a playbook for categories 2–7. See [v1.8.0 deploy record](GOFFICE2026_RELEASE_v1.8.0_DEPLOY.md).

### Deployment

- Live: `/var/www/goffice/current` → `/var/www/goffice/releases/v1.8.0`
- Rollback: `/var/www/goffice/releases/v1.7.0`
- Record: [GOFFICE2026_RELEASE_v1.8.0_DEPLOY.md](./GOFFICE2026_RELEASE_v1.8.0_DEPLOY.md)

---

## [1.7.0] — 2026-08-20

**Release title:** CAT1 FY2568 freeze (VPS)  
**Branch:** `master`  
**Deployed commit:** `380bf3bd7060585555d5ac7104693a84f0176f70`  
**Previous production:** `v1.6.0` / `011c9fe`  
**Status:** `PRODUCTION_SUCCESS` · `CAT1_FY2568_PRODUCTION_DEPLOYED`

Promotes 42 commits after GO-MOTION-V2 (`011c9fe` → `380bf3b`): Category 1 FY2568 frozen baseline (1.1–1.7), nine canonical contracts, About hub reconciliation, and FY2568 evidence. See [v1.7.0 deploy record](GOFFICE2026_RELEASE_v1.7.0_DEPLOY.md).

---

## [1.5.1] — 2026-08-11

**Release title:** Engage visual system (VPS)
**Branch:** `master`
**Deployed commit:** `2bfd7cadebe5c7472205c6316a94ab6e56f547bd`
**Pull requests:** [#22](https://github.com/numtip/goffice2026/pull/22) `feat(engage): add visual system section` · [#23](https://github.com/numtip/goffice2026/pull/23) `fix(engage): uniform card grid and 16:9 visuals`
**Previous production:** `v1.5.0` / `c796611`
**Status:** `PRODUCTION_SUCCESS` · `RELEASE_CLOSED`

### Added

- Engage visual system on landing: 8 PO-approved local WebP visuals (2048×1152, native 16:9) with bilingual TH/EN copy
- Central asset manifest `src/data/engageVisuals.ts` — components never hardcode image paths

### Fixed

- Engage card grid — uniform 4-column desktop layout (`lg:col-span-3` × 8), 16:9 visuals with no crop/letterboxing

### Deployment

- Live: `/var/www/goffice/current` → `/var/www/goffice/releases/v1.5.1`
- Rollback: `/var/www/goffice/releases/v1.5.0`
- Record: [GOFFICE2026_RELEASE_v1.5.1_DEPLOY.md](./GOFFICE2026_RELEASE_v1.5.1_DEPLOY.md)

> **Next priorities (Blueprint V5):** verified indicator-level evidence onboarding · FY2569 data maintenance · P2 maintenance (GitHub Actions Node 20 deprecation + Astro check hints). No new UI work.

---

## [1.5.0] — 2026-08-10

**Release title:** Production traceability + dashboard v2 (VPS)  
**Branch:** `master`  
**Deployed commit:** `c7966115c4540bf060e19800b3016119d2fa03f4`  
**Previous production:** `v1.4.0` / `075866b`  
**Status:** `PRODUCTION_SUCCESS` · `RELEASE_CLOSED`

### Added

- GO-EVIDENCE-1 indicator/evidence traceability experience (TH/EN indicator pages, linked evidence, static-hosting query filters)
- GO-DASH-V2 dashboard phases (command hero, resource pulse, performance explorer, partial YoY)
- Apache ECharts 6 chart pipeline and indicator index routes

### Fixed

- Evidence metadata/offline-source presentation (no fabricated document links)
- Preview/demo score hardening and FY2569 readiness copy
- Astro check compatibility for inline evidence filter scripts

### Deployment

- Live: `/var/www/goffice/current` → `/var/www/goffice/releases/v1.5.0`
- Rollback: `/var/www/goffice/releases/v1.4.0`
- Record: [GOFFICE2026_RELEASE_v1.5.0_DEPLOY.md](./GOFFICE2026_RELEASE_v1.5.0_DEPLOY.md)

---

## [1.2.0] — 2026-07-20

**Release title:** Green Office Evidence Platform Foundation  
**Branch:** `master`  
**Commits:** `902081a`, `bc13502`, release notes commit

### Added

- **SharePoint central evidence library** — หลักฐานสำนักงานสีเขียว (`GreenOfficeEvidence`) on canonical RAE site `/sites/msteams_54adc4`
- **GO-SP-1 / GO-SP-1R / GO-SP-2** assessment, correction, creation, and validation reports under `docs/sharepoint/`
- **GO-SP2 schema manifest** — column mapping and library settings for import tooling
- **M365 Agent Bootstrap** — persistent Edge profiles, `m365-agent-bootstrap.ps1`, session check, auth probe
- **GO-SP-2 library automation** — `scripts/go-sp2-library-create.mjs`
- **M365 operational runbook** — `docs/operations/M365_AGENT_BOOTSTRAP.md`
- **Release v1.2.0 documentation** — this file and `GOFFICE2026_RELEASE_v1.2.0.md`

### Changed

- **Canonical RAE SharePoint site** — corrected from tenant root to `https://maejo365.sharepoint.com/sites/msteams_54adc4`
- **GO-SP-1 reports** — updated site URL, hosting decision, permission/metadata model, verdict `READY_TO_CREATE_LIBRARY`
- **M365 bootstrap default URL** — `researchmju` opens RAE site home, not Maejo365 tenant root
- **Auth probe** — verifies UPN, canonical path, rejects `WRONG_SITE_CONTEXT` for tenant-root sessions

### Fixed

- **GO-SP-1R** — incorrect assessment that RAE host was tenant root `maejo365.sharepoint.com`
- **Bootstrap false READY** — no longer reports ready when authenticated only to tenant root

### Validated

- **Micro Pilot** — 5 legacy evidence files exported from authorized OneDrive (prior session)
- **GO-SP-2 library** — versioning, inheritance, folders 2568/2569, 7 Thai views, 19 metadata fields
- **M365 bootstrap CheckOnly** — `READY` on canonical RAE site with `researchmju@mju.ac.th`

### Known limitations

- SharePoint column internal names differ from spec (`GO_x0020_*` encoding)
- Duplicate column set (`*0` suffix) requires cleanup before migration
- 134-file registry CSV not fully synced; no bulk evidence upload
- VPS production site unchanged (v1.1.3)

### Security

- No cookies, tokens, or browser profiles committed
- `config/m365-bootstrap.json` remains gitignored

---

## [1.1.3] — 2026-07-20

**Release title:** Logo hotfix (production)

### Changed

- Official Green Office logo (`LogoGreen2025.png`) across header, favicon, PWA, OG image

### Deployed

- Production VPS: https://goffice.mju.ac.th/ at tag `v1.1.3` (`df06179`)

See [GOFFICE2026_RELEASE_v1.1.3.md](./GOFFICE2026_RELEASE_v1.1.3.md).

---

## [1.1.2] — 2026-07-20

**Release title:** Dashboard alignment and CI quality gates

### Added

- CI quality gates, Node engines, REL-1.1.2 implementation reports

### Fixed

- Dashboard mappings and unified data-status display
- Bilingual 404 pages and error-page navigation

See [GOFFICE2026_RELEASE_v1.1.2.md](./GOFFICE2026_RELEASE_v1.1.2.md).

---

## [1.1.1] — 2026-07-19

**Release title:** SEO / metadata / PWA baseline

See [GOFFICE2026_RELEASE_v1.1.1.md](./GOFFICE2026_RELEASE_v1.1.1.md).

---

## [1.1.0] — 2026-07-18

**Release title:** Production baseline (VPS)

See [GOFFICE2026_RELEASE_v1.1.0.md](./GOFFICE2026_RELEASE_v1.1.0.md).

---

## Earlier releases

| Version | Document |
|---------|----------|
| v1.0.1 | [GOFFICE2026_RELEASE_V1_0_1.md](./GOFFICE2026_RELEASE_V1_0_1.md) |
| v1.0.0 | [GOFFICE2026_RELEASE_V1_0_0.md](./GOFFICE2026_RELEASE_V1_0_0.md) |

---

[1.2.0]: ./GOFFICE2026_RELEASE_v1.2.0.md
[1.1.3]: ./GOFFICE2026_RELEASE_v1.1.3.md
[1.1.2]: ./GOFFICE2026_RELEASE_v1.1.2.md
[1.1.1]: ./GOFFICE2026_RELEASE_v1.1.1.md
[1.1.0]: ./GOFFICE2026_RELEASE_v1.1.0.md
