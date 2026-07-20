# GO-SP-1 — Metadata Gap Analysis

Generated: 2026-07-20T15:15:00+07:00 (corrected GO-SP-1R)  
Reference taxonomy: `src/data/criteria/indicators.json`, `src/data/resource-indicator-map.json`  
Canonical site: `https://maejo365.sharepoint.com/sites/msteams_54adc4`

---

## Post GO-SP-2 Status

GO-SP-2 created the **หลักฐานสำนักงานสีเขียว** library with hybrid site columns addressing critical gaps (indicator, category, fiscal year, resource domain, evidence status, traceability). Managed Metadata term sets remain optional for phase 2.

**Metadata model:** Hybrid SharePoint site columns without mandatory Managed Metadata dependency (PO-approved).
|-------|---------------------------|---------------------------|:------------:|
| Indicator codes | Not present | All canonical codes | **Critical** |
| Category/issue hierarchy | Not present | cat1–cat7 + issue codes | **Critical** |
| Resource domain | Not present | water, energy, fuel, paper, waste, ghg | **High** |
| Fiscal year | Not present | 2568, 2569, … | **High** |
| Evidence status / validation | Not present | draft, validated, published | **High** |
| SHA256 integrity | Not present | Migration hash | **Medium** |
| Joomla traceability | Not present | Article ID, original URL | **Medium** |
| Managed metadata term sets | OOB Keywords only | Indicator + category terms | **High** |
| Content types | OOB Document only | GO Evidence Document/Workbook | **Medium** |
| Naming convention | Unstructured | `GO-{year}-{indicator}-{seq}-{slug}` | **Medium** |

---

## Required Metadata vs Available Columns

### Required (from goffice2026 canonical model)

| Field | Example | Used by |
|-------|---------|---------|
| Indicator code | `3.1.2`, `1.5.1` | Criteria pages, dashboards, audit |
| Category | `cat3` — การใช้ทรัพยากรและพลังงาน | Navigation, filters |
| Issue code | `3.1` — การใช้น้ำ | Issue grouping |
| Resource domain | `water`, `energy` | Dashboard binding |
| Fiscal year | `2569` | Multi-year evidence |
| Evidence status | `validated` | Import pipeline |
| MIME / format | `application/pdf`, OOXML | Validation rules |
| SHA256 | `b51f1116…` | Integrity |
| Source URL (legacy) | OneDrive sharing link | Migration audit |
| Staged filename | `GO-2569-3.2.2-02-…` | Import manifest |

### Available on assessed site (reusable)

| Field | Internal name | Gap note |
|-------|---------------|----------|
| Title | Title | File name only — not indicator code |
| Categories | Categories | Free text; not controlled vocabulary |
| Keywords | Keywords | Unstructured |
| Enterprise Keywords | TaxKeyword | **No term set configured** |
| Status | `_Status` | Generic; not evidence lifecycle |
| Modified / Created | OOB | Audit trail only |
| Author / Editor | OOB | Identity only |

---

## Content Type Gap

| Required | Exists | Gap |
|----------|--------|-----|
| Green Office Evidence Document | Document (generic) | No GO-specific field bundle |
| Green Office Evidence Workbook | Document (generic) | No sheet validation metadata |
| Folder (category/year) | Folder | OK — use as-is |

**Action:** Create `Green Office Evidence Document` content type inheriting Document with required columns bound.

---

## Managed Metadata Gap

| Term set (proposed) | Purpose | Status |
|---------------------|---------|--------|
| GO Indicator Codes | Controlled indicator vocabulary | **Missing** |
| GO Categories | cat1–cat7 labels (TH/EN) | **Missing** |
| GO Resource Domains | water, energy, fuel, paper, waste, ghg | **Missing** |
| GO Evidence Status | Lifecycle states | **Missing** |

**Alternative (faster, less ideal):** Choice columns populated from `indicators.json` export — acceptable for MVP if term store admin access is limited.

---

## Naming Convention Gap

| Source | Pattern | Structured? |
|--------|---------|:-----------:|
| Org Documents library | `ตลาดเงิน.docx`, `Document.docx` | No |
| Personal OneDrive | `3.2.2 มีการจัดทำข้อมูล…pdf` | Partial (indicator in filename) |
| Micro pilot staging | `GO-2569-3.2.2-02-3-2-2.pdf` | **Yes** |

**Action:** Enforce staged naming on import; optional column `GO Original Filename` preserves legacy name.

---

## Validation Metadata Gap (from micro pilot)

Micro pilot produced these validation fields **not representable in SharePoint today**:

| Field | Example | Proposed column |
|-------|---------|-----------------|
| validation_status | VALID | GO Evidence Status |
| mime_type | application/pdf | auto (SharePoint) + GO Validated MIME |
| office_zip_valid | yes | GO Format Check (choice) |
| pdf_signature_valid | yes | GO Format Check |
| content_review (XLSX sheets) | sheet names | GO Review Notes (multiline) |
| duplicate_of | duplicate_candidate | GO Related Document (lookup) |

---

## Traceability Gap (Joomla migration)

| Registry field | In SharePoint | Gap |
|----------------|:-------------:|:---:|
| sharepoint_item_id | No | **Yes** |
| joomla_article_id | No | **Yes** |
| source_url | No | **Yes** |
| mapping_status | No | **Yes** |
| access_status | No | **Yes** |

Registry CSVs (`sharepoint-evidence-registry.csv`, 143 rows) must drive column population on import.

---

## Privacy / Compliance Metadata Gap

| Requirement | Current | Gap |
|-------------|---------|:---:|
| PII scan flag | Not present | Yes |
| Retention label | Unknown | Yes |
| Sensitivity label | Not assessed | Yes |

Recommend M365 sensitivity labels for evidence containing personal data (registration forms — observed in micro pilot PDF).

---

## Gap Closure Priority

| Priority | Item | Effort |
|:--------:|------|--------|
| P0 | GO Indicator Code column | Low |
| P0 | GO Category + Resource Domain | Low |
| P0 | GO Fiscal Year | Low |
| P0 | Library creation with folder taxonomy | Medium |
| P1 | GO Evidence Status + SHA256 | Low |
| P1 | Content type: GO Evidence Document | Medium |
| P1 | Joomla traceability columns | Low |
| P2 | Managed metadata term sets | Medium–High |
| P2 | Retention / sensitivity labels | Admin |
| P2 | Power Automate validation flow | Medium |

---

## Metadata Source of Truth

| System | Role |
|--------|------|
| `indicators.json` | Canonical indicator codes and titles |
| `resource-indicator-map.json` | Resource domain ↔ indicator binding |
| `sharepoint-evidence-registry.csv` | Legacy URL ↔ article mapping (when synced) |
| Micro pilot manifest | Proven validation + naming patterns |
| SharePoint library columns | Operational storage (after creation) |

**No metadata was written to SharePoint during GO-SP-1.**
