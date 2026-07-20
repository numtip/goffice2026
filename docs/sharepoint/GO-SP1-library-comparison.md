# GO-SP-1 — Library Comparison

Generated: 2026-07-20T15:15:00+07:00 (corrected GO-SP-1R)  
Decision scope: Green Office Evidence Library on **canonical RAE site** `https://maejo365.sharepoint.com/sites/msteams_54adc4`

---

## Options Evaluated

### Option A — Reuse an Existing Library

| Candidate | Items | Versioning | Metadata | Permissions | Green Office fit |
|-----------|------:|:----------:|----------|-------------|------------------|
| **Documents** | 4 | Yes | OOB only | **Unique** | **Poor** — mixed unrelated content |
| **three** | 0 | Yes | OOB only | Inherited | **Poor** — non-descriptive name, no schema |
| Form Templates | 1 | No | InfoPath | Inherited | **No** — template storage |
| Site Assets | 0 | No | OOB | Inherited | **No** — page assets |
| Style Library | 5 | Yes | OOB | Inherited | **No** — system styles |

#### Option A — Documents Library (deep dive)

**Pros**

- Already exists with versioning enabled
- Familiar to RAE users
- Unique permissions already configured (could isolate evidence with folder-level ACLs)

**Cons**

- Contains unrelated files (research admin samples, non-evidence PDFs)
- No indicator/category columns
- Unique permissions would require careful folder break inheritance
- Name "Documents" / "Shared Documents" is ambiguous for auditors
- Mixing certification evidence with general RAE admin docs increases mis-file risk
- Does not match OneDrive path convention (`GreenOffice/Data2568`)

**Verdict for Documents:** Reuse is **technically possible** but **not recommended**.

#### Option A — `three` Library (deep dive)

**Pros**

- Empty — no migration conflict
- Versioning already on

**Cons**

- Name provides no organizational meaning
- No custom columns or content types
- Would require rename ( disruptive ) or accept permanent confusing URL segment `/three`
- No established RAE convention

**Verdict for three:** **Reject**.

---

### Option B — Create New Library: **หลักฐานสำนักงานสีเขียว** (Green Office Evidence)

**Selected and implemented (GO-SP-2)**

| Property | Value |
|----------|-------|
| Site | `https://maejo365.sharepoint.com/sites/msteams_54adc4` |
| Display name | หลักฐานสำนักงานสีเขียว |
| Internal URL | `GreenOfficeEvidence` |
| Permissions | Inherit RAE site (Owners/Members/Visitors) |

**Pros**

- Clear purpose for auditors, PO, and migration tooling
- Clean metadata schema mapped to `indicators.json` + `resource-indicator-map.json`
- Folder taxonomy can mirror certification structure (`cat1/` … `cat7/`, `2568/`, `2569/`)
- Staged filename convention `GO-2569-{indicator}-{seq}-{slug}` can be enforced
- Independent permissions — evidence curators vs general RAE contributors
- Stable org URLs replace personal OneDrive sharing links
- Aligns with EP-3 Document Center integration plan
- No risk of contaminating existing RAE document stores

**Cons**

- Requires one-time library + column + (optional) content type creation
- Requires permission model definition
- Requires migration from personal OneDrive (134 URLs)
- PO/admin action needed (out of scope for this assessment round)

---

## Side-by-Side Matrix

| Criterion | Reuse Documents | Reuse three | **New Green Office Evidence Library** |
|-----------|:-----------------:|:-----------:|:-------------------------------------:|
| Naming clarity | Low | Very low | **High** |
| Metadata readiness | None | None | **Designed to spec** |
| Permission isolation | Partial (folder) | Inherited site | **Dedicated ACL** |
| Auditor discoverability | Low | Very low | **High** |
| Migration cleanliness | Low | Medium | **High** |
| Matches OneDrive taxonomy | No | No | **Can mirror** |
| Document Center integration | Ambiguous URL | Poor URL | **Clean endpoint** |
| Risk of accidental deletion | Medium | Low | **Low (scoped)** |
| Reuses RAE architecture | Yes | Yes | **Yes (same site collection)** |

---

## Recommendation

### **Option B — Create new library: `Green Office Evidence Library`**

### Rationale

1. **No existing library** on the accessible RAE SharePoint surface is purpose-built for Green Office certification evidence.
2. The **Documents** library already holds unrelated content and has **unique permissions** — reuse would commingle evidence with general RAE files.
3. Current authoritative evidence (micro pilot confirmed) lives under **`Mju/GreenOffice/Data2568/`** on personal OneDrive — organizational storage needs a **clean, named target**, not a generic shared library.
4. goffice2026 taxonomy (`3.1.2`, `3.2.2`, `1.5.1`, etc.) requires **custom columns** not present in any existing library.
5. Reuse of RAE architecture is still achieved by hosting the new library on the **same site collection** (`maejo365.sharepoint.com`) where RAE e-Form infrastructure already exists — no greenfield site design required.

### Hosting location

| Item | Recommendation |
|------|----------------|
| Site collection | `https://maejo365.sharepoint.com` (Maejo university Team Site) |
| Library name | `Green Office Evidence Library` |
| URL segment (proposed) | `/GreenOfficeEvidence` or `/GreenOfficeEvidenceLibrary` |
| Alternative | Create under dedicated RAE subsite **if** PO grants access to `/sites/Research` |

---

## PO Review Questions

1. Is tenant root the canonical RAE SharePoint site, or does a separate site exist at a different URL?
2. Should auditors receive read-only access at library level or site level?
3. Approve library URL segment and display name (English vs bilingual)?
