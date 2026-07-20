# GO-SP-1 — Recommended Architecture

Generated: 2026-07-20T15:15:00+07:00 (corrected GO-SP-1R)  
Principle: **Reuse canonical RAE SharePoint site; add purpose-built evidence library**

---

## Target Architecture

```text
Microsoft 365 Tenant (maejo365)
└── SharePoint Online
    └── Site: สำนักวิจัยฯ (RAE)
        │   URL: https://maejo365.sharepoint.com/sites/msteams_54adc4
        │   Owner context: สำนักวิจัยและส่งเสริมวิชาการการเกษตร
        │
        ├── [EXISTING] Documents, RAE Document Registry, e-Form lists
        │
        └── [NEW] หลักฐานสำนักงานสีเขียว (GreenOfficeEvidence)  ← implemented GO-SP-2
                ├── Metadata: GO_* site columns (hybrid, no mandatory MMS)
                ├── Folders: 2568/, 2569/
                └── Views: Thai operational views
```

---

## Library Design

| Property | Value |
|----------|-------|
| Display name | หลักฐานสำนักงานสีเขียว (Green Office Evidence) |
| Internal URL | GreenOfficeEvidence |
| Site URL | https://maejo365.sharepoint.com/sites/msteams_54adc4 |
| Description | Canonical organizational store for Green Office 2569+ certification evidence |
| Template | Document Library (101) |
| Versioning | Major versions ON; minor OFF; checkout OFF |
| Content approval | Optional phase 2 |
| Default view | Group by Indicator Category, filter by Fiscal Year |

---

## Folder Taxonomy (proposed)

Mirror goffice2026 category model and existing OneDrive path:

```text
Green Office Evidence Library/
├── 2568/
│   ├── cat1-นโยบายและการดำเนินงาน/
│   ├── cat3-ทรัพยากรและพลังงาน/
│   ├── cat5-สภาพแวดล้อม/
│   └── …
├── 2569/
│   └── (same category folders)
└── _staging/          ← import quarantine (optional, restricted)
```

Aligns with personal OneDrive path observed: `Mju/GreenOffice/Data2568/`.

---

## Metadata Model

### Site columns (new — library scoped)

| Column | Type | Source |
|--------|------|--------|
| GO Indicator Code | Choice (or managed metadata) | `indicators.json` codes |
| GO Category | Choice | cat1–cat7 |
| GO Issue Code | Text | e.g. 3.1, 3.2 |
| GO Resource Domain | Choice | water, energy, fuel, paper, waste, ghg |
| GO Fiscal Year | Number | 2568, 2569, … |
| GO Evidence Status | Choice | draft, validated, published, superseded |
| GO Source System | Choice | joomla_migration, manual_upload, dashboard_export |
| GO SHA256 | Text | migration validation hash |
| GO Joomla Article ID | Number | traceability (nullable) |
| GO Export Batch ID | Text | e.g. micro-pilot, bulk-001 |

### Content type (new)

| Content type | Base | Purpose |
|--------------|------|---------|
| Green Office Evidence Document | Document | PDF, DOCX, XLSX evidence files |
| Green Office Evidence Workbook | Document | XLSX forms with structured sheets |

Reuse OOB **Document** as parent — extend, do not replace site content type hub.

---

## Naming Convention

Adopt micro-pilot staged pattern as library convention:

```text
GO-{fiscal_year}-{indicator_code}-{sequence}-{slug}.{ext}
```

Examples (from successful micro pilot):

- `GO-2569-3.1.2-01-4-2-1-1-2568.pdf`
- `GO-2569-3.2.2-02-3-2-2.pdf`
- `GO-2569-1.5.1-03-1-5-1-2567.xlsx`

---

## Permissions Model (proposed — not implemented)

| Group | Role | Scope |
|-------|------|-------|
| RAE Evidence Curators | Contribute | Library |
| RAE Evidence Approvers | Edit + approve (phase 2) | Library |
| Green Office Auditors | Read | Library |
| goffice2026 Service Account | Read (Graph app) | Library |
| All other site visitors | No access | — |

Library-level unique permissions recommended (matches Documents library pattern).

---

## Integration Points

### Document Center (EP-3)

| Component | Integration |
|-----------|-------------|
| goffice2026 `/documents` | Link-out to library views filtered by category |
| Graph API | `/sites/{site-id}/lists/{list-id}/drive` for read-only preview |
| Evidence Gateway CTA | Replace placeholder with library URL |

### Public Registry

Replace Joomla personal OneDrive URLs with:

```text
https://maejo365.sharepoint.com/GreenOfficeEvidence/2569/cat3/GO-2569-3.2.2-02-3-2-2.pdf
```

### Power Automate (future)

| Flow | Trigger | Action |
|------|---------|--------|
| Evidence validation | File uploaded to `_staging` | SHA256 check, metadata prompt, move to category folder |
| Dashboard sync | Scheduled | Optional CSV export notification |

Reuse **Tracking** list pattern only if PO confirms existing flow ownership.

---

## What We Reuse vs Create

| Component | Action |
|-----------|--------|
| Site collection | **Reuse** |
| Versioning pattern from Documents | **Reuse settings** |
| Document base content type | **Reuse / extend** |
| Enterprise Keywords infrastructure | **Extend** (add term set) |
| RAE e-Form lists | **Do not touch** |
| Documents library | **Do not reuse for evidence** |
| Green Office Evidence Library | **Create new** |
| GO metadata columns | **Create new** |
| GO content types | **Create new** |
| Term set for indicators | **Create new** (recommended) |

---

## Migration Path (reference only)

1. Complete registry CSV sync (134 URLs)
2. Bulk export from personal OneDrive (authorized)
3. Validate SHA256 + MIME (micro pilot pattern)
4. Upload to `_staging` → promote with metadata
5. Update Joomla replacement link map
6. Connect EP-3 Document Center

**No migration executed in GO-SP-1.**
