# GO-SP-1 — RAE SharePoint Site Assessment

Generated: 2026-07-20T15:15:00+07:00 (corrected GO-SP-1R)  
Assessor account: `researchmju@mju.ac.th` (masked: `rese***@mju.ac.th`)  
Tenant: `maejo365.sharepoint.com`  
Method: Read-only SharePoint REST via authenticated browser session (no writes in GO-SP-1; library created in GO-SP-2)

## Executive Summary

**GO-SP-1R correction:** The original assessment incorrectly used the tenant root site. The **canonical RAE SharePoint site** (PO-approved) is:

`https://maejo365.sharepoint.com/sites/msteams_54adc4` — **สำนักวิจัยฯ** (สำนักวิจัยและส่งเสริมวิชาการการเกษตร)

Account `researchmju@mju.ac.th` has Site Admin / Full Control access on this site. Existing RAE artifacts include **RAE Document Registry** (627 items), **Documents** (3 items), and class document library — not on the tenant root.

Green Office evidence library **หลักฐานสำนักงานสีเขียว** (`GreenOfficeEvidence`) was created in GO-SP-2 on this site.

**Corrected verdict: `READY_TO_CREATE_LIBRARY`** (executed in GO-SP-2)

---

## Account Gate

| Check | Result |
|-------|--------|
| Required account | `researchmju@mju.ac.th` |
| Detected account | `researchmju@mju.ac.th` |
| Account gate | **PASS** |
| User profile title | สำนักวิจัยและส่งเสริมวิชาการการเกษตร |

---

## Assessed Site (corrected)

| Item | Value |
|------|-------|
| **Canonical RAE URL** | `https://maejo365.sharepoint.com/sites/msteams_54adc4` |
| Site title | สำนักวิจัยฯ |
| Organizational name | สำนักวิจัยและส่งเสริมวิชาการการเกษตร |
| Account access | Full Control (Site Admin) |

### URLs not used

| URL | Note |
|-----|------|
| `https://maejo365.sharepoint.com` (tenant root) | **Incorrect** — not RAE operational site |
| `/sites/RAE` | Do not use |
| `/sites/Research` | Do not use |

---

## 1. Document Libraries

| Library | Items | Versioning | Checkout | Unique Permissions | Assessment |
|---------|------:|:----------:|:--------:|:------------------:|------------|
| **Documents** | 4 | Yes | No | **Yes** | General shared docs; unrelated sample content |
| Form Templates | 1 | No | No | No | InfoPath legacy |
| Site Assets | 0 | No | No | No | Empty |
| Style Library | 5 | Yes (major+minor) | Yes | No | System/styles |
| **three** | 0 | Yes | No | No | Empty custom library; non-descriptive name |

**RAE-related lists (non-library):**

| List | Template | Items | Notes |
|------|----------|------:|-------|
| eform_rae | 100 (Custom) | 0 | RAE e-form registry shell |
| ระบบ e-Form สำนักวิจัยและส่งเสริมวิชาการการเกษตร | 115 | 0 | RAE e-Form system |
| Document Request Invite speakers | 100 | 3 | Workflow/request tracking |
| Tracking | 1100 | 1 | Possible Power Automate integration point |

---

## 2. Content Types

- **100 content types** enumerated; all are **stock SharePoint** (Document, Folder, Task, Status Indicator, etc.).
- **No custom Green Office Evidence content type** found.
- **No site-specific content type group** for certification or indicator metadata.

Reusable: base **Document** content type (`0x0101`) as parent for a future custom type.

---

## 3. Site Columns

- **150 non-hidden, non-read-only fields** sampled.
- Columns are predominantly **out-of-box** (contact, task, status indicator, document core).
- **No Green Office–specific columns** (indicator code, fiscal year, resource domain, evidence status).

Potentially reusable OOB columns:

| Column | Internal name | Reuse potential |
|--------|---------------|-----------------|
| Categories | Categories | Low — free text |
| Keywords | Keywords | Low — unstructured |
| Status | `_Status` | Medium — could map evidence review state |
| Enterprise Keywords | TaxKeyword | Medium — if term set configured |

---

## 4. Managed Metadata

| Item | Status |
|------|--------|
| Enterprise Keywords field (TaxKeyword) | Present (OOB) |
| Custom term sets for Green Office | **Not found** |
| Indicator taxonomy term set | **Not found** |
| Category/issue term hierarchy | **Not found** |

Managed metadata infrastructure exists at tenant level but **no Green Office term set is bound** to this site.

---

## 5. Permissions

| Item | Result |
|------|--------|
| Site-level role assignments via REST | **Not returned** (insufficient API visibility or restricted) |
| Documents library | **Has unique permissions** (breaks inheritance) |
| Other libraries | Inherit from site (assumed) |

**Review required:** PO/SharePoint admin must confirm RAE owner group, contributor group, and external auditor read access before library creation.

---

## 6. Retention Policies

| Item | Result |
|------|--------|
| Site retention label | **Not visible** via standard REST (requires Compliance Center / admin) |
| Library retention | **Unknown** |
| Records management features | Document routing columns present (inactive) |

**Assumption:** No evidence-specific retention policy is applied. PO should confirm with M365 compliance admin.

---

## 7. Versioning

| Library | Major versions | Minor versions | Notes |
|---------|:-------------:|:--------------:|-------|
| Documents | Yes | No | Suitable pattern for evidence |
| three | Yes | No | Empty; could mirror settings |
| Style Library | Yes | Yes | Not applicable |

**Recommendation:** Enable major versioning on new library; minor versions optional; checkout **disabled** for evidence upload efficiency.

---

## 8. Naming Conventions (Observed)

### Organizational SharePoint (Documents library)

- Mixed Thai/English filenames
- No consistent prefix pattern
- Examples: `Document.docx`, `ตลาดเงิน.docx`, `Pirisa Korea chicken sauce.pdf`

### Personal OneDrive (current Green Office evidence — from micro pilot)

- Folder: `Mju/GreenOffice/Data2568/`
- Filenames often include **indicator codes** (e.g. `3.2.2 …`, `1.5(1) …`)
- Staged export pattern: `GO-2569-{indicator}-{seq}-{slug}.{ext}`

**Gap:** Org SharePoint has no enforced naming convention aligned to Green Office taxonomy.

---

## 9. Folder Structures

| Location | Structure |
|----------|-----------|
| Documents library | Flat (only `Forms/` system folder) |
| Personal OneDrive evidence | `Mju/GreenOffice/Data2568/` (+ subfolders via REST discovery) |
| Org site | No Green Office folder hierarchy |

---

## 10. Power Automate Connections

| Signal | Finding |
|--------|---------|
| Tracking list (template 1100) | Present — suggests flow may write tracking rows |
| eform_rae / RAE e-Form lists | Present — likely InfoPath/e-form era automation |
| Flow inventory | **Not accessible** without Power Platform admin |

**Review required:** Inventory existing RAE flows before adding evidence upload automation.

---

## 11. Document Center Integration

| Item | Status |
|------|--------|
| goffice2026 `/documents` route | Static preview pages only |
| Live SharePoint/Graph API | **Not connected** |
| CTA | "Open Document Center" — placeholder |
| EP-3 plan | Separate M365-backed Document Center project |

No live Document Center → SharePoint bridge exists yet. New library URL will become the EP-3 target endpoint.

---

## 12. Public Registry Integration

| Item | Status |
|------|--------|
| Public evidence registry on SharePoint | **Not found** |
| Joomla legacy links | Personal OneDrive sharing URLs (134 unique) |
| goffice2026 evidence pages | Static/dashboard JSON — no SharePoint registry |

Future library should expose stable org URLs to replace personal OneDrive dependencies.

---

## Reusable Assets Summary

| Asset | Reusable? |
|-------|-----------|
| Tenant root site collection | Yes — hosting location |
| Document content type (base) | Yes — extend |
| Documents library versioning pattern | Yes — copy settings |
| RAE e-Form lists | No — different purpose |
| `three` empty library | **No** — poor naming, no metadata |
| Enterprise Keywords infrastructure | Partial — needs term set |
| Personal OneDrive folder taxonomy | Reference only — not org storage |

---

## Risks

1. **No confirmed dedicated RAE site URL** — `/sites/RAE` missing; `/sites/Research` blocked
2. **Evidence on personal OneDrive** — continuity risk (prior audit: critical)
3. **Documents library unique permissions** — mixing evidence would complicate ACLs
4. **No custom metadata** — import from goffice2026 taxonomy required
5. **Retention/compliance unknown** — needs admin confirmation
6. **Power Automate inventory incomplete** — risk of duplicate/conflicting flows

---

## Assessment Verdict Input

Proceed to library comparison with **Option B recommended** (new dedicated library) pending PO confirmation of site URL and permissions.
