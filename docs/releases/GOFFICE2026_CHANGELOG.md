# Green Office 2026 — Release Changelog

Cumulative release history for the `goffice2026` repository.  
Format inspired by [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

For day-to-day development changes see also [CHANGELOG.md](../../CHANGELOG.md) at repository root.

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
