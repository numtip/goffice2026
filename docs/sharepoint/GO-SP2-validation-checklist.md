# GO-SP-2 — Validation Checklist

Generated: 2026-07-20T15:15:00+07:00  
Library: หลักฐานสำนักงานสีเขียว (`GreenOfficeEvidence`)

---

## Post-Creation Validation

| # | Requirement | Status | Evidence |
|---|-------------|:------:|----------|
| 1 | Library URL returns successfully | ✅ | https://maejo365.sharepoint.com/sites/msteams_54adc4/GreenOfficeEvidence |
| 2 | Correct site collection (`msteams_54adc4`) | ✅ | `go-sp2-run-raw.json` → server path |
| 3 | Display name หลักฐานสำนักงานสีเขียว | ✅ | REST Title field |
| 4 | Versioning enabled (50 major versions) | ✅ | EnableVersioning=true, MajorVersionLimit=50 |
| 5 | Permission inheritance active | ✅ | HasUniqueRoleAssignments=false |
| 6 | Required GO_* columns exist | ⚠️ | 19 fields present; internal names encoded |
| 7 | Choice values match spec | ✅ | Categories 1–6, domains, statuses verified |
| 8 | Seven Thai views accessible | ✅ | All 7 views created (201) |
| 9 | No evidence files uploaded | ✅ | ItemCount=2 (folders only) |
| 10 | Document Center / unrelated lists unmodified | ✅ | Documents=3, RAE Registry=627 |
| 11 | No anonymous sharing enabled | ✅ | Not configured |
| 12 | Account remains researchmju@mju.ac.th | ✅ | currentuser gate |

**Overall:** 11/12 full pass; 1 partial (column internal naming).

---

## Folder Structure

| Folder | Status |
|--------|:------:|
| 2568 | ✅ Created |
| 2569 | ✅ Created |

Category/indicator subfolders intentionally **not** created (metadata-first design).

---

## Pre-Migration Gate (manual)

- [ ] Remove duplicate `*0` suffix columns from library
- [ ] Confirm content types visible on upload form
- [ ] Tune view columns (hide SHA256, legacy URLs from general views)
- [ ] PO sign-off on canonical column internal name mapping

---

## Verdict

**GO_SP2_READY_WITH_LIMITATIONS** — Library ready for controlled pilot upload after column cleanup.
