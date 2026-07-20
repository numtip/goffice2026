# GO-SP-2 — Green Office Evidence Library Creation Report

Generated: 2026-07-20T15:15:00+07:00  
Account: `researchmju@mju.ac.th`  
Canonical site: `https://maejo365.sharepoint.com/sites/msteams_54adc4`

---

## Verdict: **GO_SP2_READY_WITH_LIMITATIONS**

Library shell, metadata columns, fiscal-year folders, and Thai views are operational. Column internal names differ from the spec due to SharePoint display-name encoding, and a duplicate column set from a partial retry should be cleaned before migration.

---

## M365 Bootstrap

| Item | Value |
|------|-------|
| CheckOnly (pre-task) | `SESSION_PRESENT_AUTH_UNVERIFIED` → interactive login completed in Edge |
| Profile | `D:\AgentProfiles\M365\researchmju` |
| Post-task CheckOnly | `SESSION_PRESENT_AUTH_UNVERIFIED` (profile present; REST session verified separately) |
| Account gate | **PASS** — `researchmju@mju.ac.th` |

---

## Site Verification

| Check | Result |
|-------|--------|
| URL | `https://maejo365.sharepoint.com/sites/msteams_54adc4` |
| Site title | สำนักวิจัยฯ |
| Create library permission | Full Control (effective) |
| Document Center untouched | **Yes** |

---

## Library Created

| Property | Value |
|----------|-------|
| Display name | หลักฐานสำนักงานสีเขียว |
| English name | Green Office Evidence |
| Internal URL | `GreenOfficeEvidence` |
| List GUID | `558b5abf-dfea-4b19-9d43-bf5341fc0bdf` |
| Library URL | https://maejo365.sharepoint.com/sites/msteams_54adc4/GreenOfficeEvidence |
| Description | คลังหลักฐานกลางสำหรับการดำเนินงานและการประเมินสำนักงานสีเขียวของสำนักวิจัยและส่งเสริมวิชาการการเกษตร |

---

## Settings Applied

| Setting | Value |
|---------|-------|
| Versioning | **Enabled** |
| Major versions | **Enabled** (limit: 50) |
| Minor versions | Off |
| Require checkout | No |
| Content approval | No |
| Folder creation | Yes (2568, 2569 created) |
| Permission inheritance | **Active** (`HasUniqueRoleAssignments: false`) |
| Anonymous access | Not enabled |
| External sharing links | Not created |

---

## Columns (19 spec fields → present on library)

All required fields exist. SharePoint assigned encoded internal names from display titles (e.g. `GO_x0020_Category` instead of `GO_Category`). See `GO-SP2-schema-manifest.json` for mapping.

Choice values match specification for Categories 1–6, resource domains, evidence types/status, mapping confidence, and visibility.

**Limitation:** A duplicate column set (`*0` suffix fields) exists from a partial automation retry. Remove duplicates before migration import.

---

## Content Types

| Content type | Status |
|--------------|--------|
| Green Office Evidence Document | Exists at site level (inherits Document) |
| Green Office Evidence Workbook | Exists at site level (inherits Document) |

Site-level creation succeeded on retry; library-level association should be confirmed in SharePoint UI before migration.

---

## Views Created

1. หลักฐานทั้งหมด
2. ตามหมวด
3. ตามตัวชี้วัด
4. รอตรวจสอบ
5. พร้อมเผยแพร่
6. ปี 2568
7. ปี 2569

Default system views (All Documents, etc.) also present.

---

## Validation

| # | Check | Result |
|---|-------|--------|
| 1 | Library URL returns successfully | **PASS** |
| 2 | Correct site collection | **PASS** |
| 3 | Correct display name | **PASS** |
| 4 | Versioning enabled | **PASS** |
| 5 | Permission inheritance active | **PASS** |
| 6 | Required columns exist | **PASS** (with naming limitation) |
| 7 | Choice values correct | **PASS** |
| 8 | Views accessible | **PASS** |
| 9 | No files uploaded | **PASS** (ItemCount: 2 folders only) |
| 10 | Unrelated libraries unmodified | **PASS** |
| 11 | No anonymous sharing | **PASS** |
| 12 | Active account remains researchmju | **PASS** |

---

## Not Performed (by design)

- Evidence file upload
- 134-file registry migration
- Document Center modification
- goffice2026 deployment
- Tenant retention policy changes
- Power Automate flow changes

---

## Automation Artifacts

| File | Purpose |
|------|---------|
| `scripts/go-sp2-library-create.mjs` | Verification + creation script |
| `docs/sharepoint/go-sp2-run-raw.json` | Full REST run log |
| `docs/sharepoint/GO-SP2-schema-manifest.json` | Schema manifest for import tooling |
| `docs/sharepoint/GO-SP2-validation-checklist.md` | Post-creation checklist |

---

## Risks and Follow-up

1. **Column internal names** — Import scripts must map spec `GO_*` names to SharePoint-encoded names or columns should be recreated with strict StaticName via CSOM/PnP.
2. **Duplicate columns** — Remove `*0` suffix fields in library settings before migration.
3. **Content type binding** — Associate GO content types with library in UI if not visible on upload form.
4. **View columns** — Tune view field lists in SharePoint UI to hide traceability fields from general views.
