# GOFFICE2026 Release v1.2.0

**Release title:** Green Office Evidence Platform Foundation  
**Release status:** RELEASED (repository)  
**Release date:** 2026-07-20 (UTC+7)  
**Repository:** `D:\ProjectAi\goffice2026` / https://github.com/numtip/goffice2026  
**Branch:** `master`  
**Previous version:** v1.1.3  
**Current version:** v1.2.0  
**Release commit:** _(set at publish — see Git section below)_  
**Production URL (unchanged):** https://goffice.mju.ac.th/ (VPS remains v1.1.3 until separate deploy)

---

## Summary

v1.2.0 documents and delivers the **organizational evidence platform foundation** for Green Office 2026: SharePoint site correction, central evidence library creation on the canonical RAE site, persistent M365 agent bootstrap, and micro-pilot export validation. **No VPS deployment** and **no public site code changes** are included in this release — it is an infrastructure and documentation milestone.

**Verdict:** `RELEASE_v1.2.0_COMPLETE`

---

## Engineering Summary (2026-07-20, chronological)

| # | Work stream | Outcome |
|---|-------------|---------|
| 1 | **Legacy evidence investigation** | Confirmed legacy Green Office evidence resides in personal OneDrive (`prinya_mju_ac_th@maejo365` → `Mju/GreenOffice/Data2568/`); mapped against goffice2026 registry and review queue |
| 2 | **SharePoint evidence registry progress** | Registry CSV structure and pilot candidate lists prepared under `docs/migration/`; Linux sync of full 134-file registry blocked (SSH) — documented as follow-up |
| 3 | **Five-file Micro Pilot** | **MICRO_PILOT_SUCCESS** — 5 files exported from authorized OneDrive via Playwright/Edge; staging under `docs/migration/sharepoint-export-micro-pilot/` |
| 4 | **RAE SharePoint Site assessment (GO-SP-1)** | Read-only assessment under `researchmju@mju.ac.th`; initial verdict `READY_WITH_REVIEW` (later corrected — see #5) |
| 5 | **Canonical site correction (GO-SP-1R)** | PO approved canonical RAE site: `https://maejo365.sharepoint.com/sites/msteams_54adc4`; corrected GO-SP-1 reports; verdict **`READY_TO_CREATE_LIBRARY`** |
| 6 | **Green Office Evidence Library (GO-SP-2)** | Created **หลักฐานสำนักงานสีเขียว** (`GreenOfficeEvidence`) on canonical site with versioning, 19 metadata columns, folders 2568/2569, 7 Thai views |
| 7 | **Library validation** | 11/12 checks pass; verdict **`GO_SP2_READY_WITH_LIMITATIONS`** (column internal naming, duplicate column cleanup pending) |
| 8 | **M365 Agent Bootstrap** | Persistent Edge profiles, bootstrap/session-check scripts, auth probe, operational runbook — **`M365_BOOTSTRAP_READY`** |
| 9 | **Canonical URL correction** | Bootstrap `researchmju` default URL and auth probe target canonical RAE path; rejects tenant-root `READY` — **`M365_BOOTSTRAP_CANONICAL_READY`** |
| 10 | **Remaining limitations** | Duplicate SharePoint columns; encoded internal names; content-type library binding TBD; registry CSV sync; no evidence migration yet |
| 11 | **Recommended next phase** | Column cleanup → controlled pilot upload → 134-file registry migration → goffice2026 Document Center URL binding |

---

## Git Commits (v1.1.3 → v1.2.0)

| Commit | Message |
|--------|---------|
| `902081a` | feat(sharepoint): create Green Office evidence library |
| `bc13502` | fix(m365): target canonical RAE SharePoint site |
| _(release)_ | docs(release): publish v1.2.0 release notes |

Prior baseline: `5ca7abf` — docs(release): freeze v1.1.3 logo hotfix production release

---

## Important Milestones

| Milestone | Status |
|-----------|--------|
| Canonical RAE SharePoint site verified | ✅ `/sites/msteams_54adc4` |
| Green Office Evidence library live | ✅ `GreenOfficeEvidence` |
| M365 persistent bootstrap operational | ✅ `researchmju` + `prinya` profiles |
| Micro pilot export (5 files) | ✅ |
| Full registry migration (134 files) | ⏳ Not started |
| VPS production deploy of v1.2.0 | ⏳ N/A — no frontend changes |

---

## New Capabilities

### SharePoint / M365

- **Central evidence library** on RAE SharePoint: [GreenOfficeEvidence](https://maejo365.sharepoint.com/sites/msteams_54adc4/GreenOfficeEvidence)
- **GO-SP-1 / GO-SP-1R / GO-SP-2** documentation suite under `docs/sharepoint/`
- **Schema manifest** for import tooling: `docs/sharepoint/GO-SP2-schema-manifest.json`
- **M365 Agent Bootstrap** — `scripts/m365-agent-bootstrap.ps1`, persistent profiles, canonical site auth verification
- **Library creation automation** — `scripts/go-sp2-library-create.mjs`

### Migration / Pilot

- Micro-pilot export workflow and staging layout (local; partial files untracked pending PO sync policy)
- Evidence registry and review-queue alignment with canonical category model

---

## Breaking Changes

**None** for the public goffice2026 site (VPS unchanged at v1.1.3).

**Operational breaking change for agents:** `researchmju` bootstrap must **not** use tenant root `https://maejo365.sharepoint.com`. Auth probe returns `WRONG_SITE_CONTEXT` if session is not under `/sites/msteams_54adc4`.

---

## Known Limitations

| Area | Limitation |
|------|------------|
| SharePoint columns | Internal names encoded (`GO_x0020_*`); duplicate `*0` suffix columns from partial retry |
| Content types | Site-level GO content types exist; library binding should be confirmed in UI |
| Registry | Full 134-file CSV registry not synced from Linux audit host |
| Migration | No evidence files uploaded to central library in GO-SP-2 |
| Production site | goffice.mju.ac.th remains v1.1.3; v1.2.0 is evidence-platform foundation only |
| Untracked scripts | GO-SP-1 discovery scripts and micro-pilot export script remain local-untracked pending PO review |

---

## Next Milestone

**EP-3 / GO-SP-3 — Controlled Evidence Pilot Upload**

1. Remove duplicate SharePoint columns in `GreenOfficeEvidence`
2. Confirm content type binding and view column layouts
3. Upload micro-pilot staging files to central library with metadata
4. Sync and validate full evidence registry CSV
5. Plan goffice2026 Document Center deep links to stable SharePoint URLs

---

## Quality Check (release gate)

| Check | Result |
|-------|--------|
| Working tree | Documentation-only commit; unrelated untracked files not staged |
| Branch | `master` |
| Remote sync | Push to `origin/master` after release commit |
| Secrets scan | No cookies, tokens, or profiles in committed docs |
| Documentation links | Release notes reference `docs/sharepoint/`, `docs/operations/M365_AGENT_BOOTSTRAP.md` |

---

## Key Documentation

| Document | Path |
|----------|------|
| GO-SP-1R correction | [GO-SP1R-correction-report.md](../sharepoint/GO-SP1R-correction-report.md) |
| GO-SP-2 library creation | [GO-SP2-library-creation-report.md](../sharepoint/GO-SP2-library-creation-report.md) |
| GO-SP-2 validation | [GO-SP2-validation-checklist.md](../sharepoint/GO-SP2-validation-checklist.md) |
| Schema manifest | [GO-SP2-schema-manifest.json](../sharepoint/GO-SP2-schema-manifest.json) |
| M365 bootstrap | [M365_AGENT_BOOTSTRAP.md](../operations/M365_AGENT_BOOTSTRAP.md) |
| Release changelog | [GOFFICE2026_CHANGELOG.md](./GOFFICE2026_CHANGELOG.md) |

---

## Git

After release commit:

```text
git log -1 --oneline
git status
```

**Suggested tag (optional, PO):** `v1.2.0` at release commit — not required for repository documentation release.

**Verdict:** `RELEASE_v1.2.0_COMPLETE`
