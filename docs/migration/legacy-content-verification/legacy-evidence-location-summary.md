# Legacy Evidence Location Verification Summary

Generated: 2026-07-20T13:32:01.114403+07:00

## Verdict
**EVIDENCE_PARTIALLY_LOCATED**

## Phase 1 — File Type Detection

| Category | Count |
|----------|------:|
| Files scanned (content dirs) | 4741 |
| PDF normal `.pdf` extension | 0 |
| PDF uppercase/mixed extension | 0 |
| Extensionless PDF (`%PDF-` signature) | 0 |
| Misnamed PDF (non-.pdf ext, PDF signature) | 0 |
| Office docs normal extension | 1 |
| Office docs misnamed (signature-detected) | 0 |

**Detection method:** Read-only first-byte / magic-number signature scan (`%PDF-`, OLE `D0 CF 11 E0`, ZIP OOXML markers). Previous audit used extension-only counting across the entire `joomla_data` tree.

**Finding:** No PDF files exist in Joomla content directories by extension **or** signature. One Office file detected: `images/data/energy/12-elect.xlsx`.

## Phase 2 — Symlinks and Mounts

| Item | Result |
|------|--------|
| Bind mounts resolving outside tree | None detected (`findmnt` shows single ext4 root) |
| Symlinks inside `joomla_data/` | 0 |
| Symlinks in `joomla-greenoffice/` | 2 (Apache config backup references in `joomlagreenv2/backups-before-restore/`) |

## Phase 3 — Targeted Filesystem Search

| Content root | Document files found |
|--------------|---------------------:|
| `/home/rae_admin/joomla-greenoffice` | 46 |
| `/home/rae_admin/goffice2026` | 6 |
| `/var/www` | 16 |

**Inside `joomla_data`:** 1 `.xlsx` (+ duplicates in backups). **Outside `joomla_data`:** 45+ PDF/DOCX files (ThaiCERT incident package, criteria PDFs in `/var/www/goffice/releases/`, `goffice2026/doc/`).

## Phase 4 — Joomla Database Link Discovery

Read-only query via `docker exec rgreenoff-db` (no credentials printed).

| Pattern | Articles with matches |
|---------|----------------------:|
| SharePoint/OneDrive href links | ~23 category/issue pages |
| Local `/files/` or `.pdf` paths | 0 |
| Google Drive | 0 (live DB) |

**Primary evidence pattern:** `https://maejo365-my.sharepoint.com/...` links to `.xlsx` forms (e.g. article 43 "3.1 การใช้น้ำ" has 8 SharePoint hrefs for water/energy/paper forms).

Total Joomla document link records extracted: **143**
Unique external/cloud links: **134**

## Phase 5 — Archive Content Listing (no extraction)

Archives with document entries: **3**
PDF entries inside archives: **0**
Office entries inside archives: **3**

Backup archives contain only `12-elect.xlsx` — no PDFs. `images/Img3/img1.zip` contains images only.

## Phase 6 — Live URL Reconciliation

Production `https://goffice.mju.ac.th/` serves **Green Office 2026 Astro static site** (not legacy Joomla). Legacy Joomla is not publicly served at this URL.

Bounded HEAD checks on SharePoint sample (10 URLs):
- Article 30: `authentication_required` (HTTP n/a) — หมวดที่ 5 — สภาพแวดล้อมและความปลอดภัย
- Article 32: `authentication_required` (HTTP n/a) — หมวดที่ 7 — การดำเนินงานสำนักงานสีเขียวเพื่อความต่อเนื่อง
- Article 33: `cloud_sharepoint_reachable` (HTTP 200) — 1.1 การกำหนดแนวทางการดำเนินงานสำนักงานสีเขียว
- Article 35: `cloud_sharepoint_reachable` (HTTP 200) — 1.3 การระบุประเด็นปัญหาทรัพยากรและสิ่งแวดล้อม
- Article 35: `authentication_required` (HTTP n/a) — 1.3 การระบุประเด็นปัญหาทรัพยากรและสิ่งแวดล้อม
- Article 35: `authentication_required` (HTTP n/a) — 1.3 การระบุประเด็นปัญหาทรัพยากรและสิ่งแวดล้อม
- Article 35: `authentication_required` (HTTP n/a) — 1.3 การระบุประเด็นปัญหาทรัพยากรและสิ่งแวดล้อม
- Article 35: `authentication_required` (HTTP n/a) — 1.3 การระบุประเด็นปัญหาทรัพยากรและสิ่งแวดล้อม
- Article 35: `authentication_required` (HTTP n/a) — 1.3 การระบุประเด็นปัญหาทรัพยากรและสิ่งแวดล้อม
- Article 35: `cloud_sharepoint_reachable` (HTTP 200) — 1.3 การระบุประเด็นปัญหาทรัพยากรและสิ่งแวดล้อม

## Phase 8 — Reconciliation with Previous Audit


The first audit scoped **`joomla_data/` only** and classified file types by **extension** (`.pdf`). Signature scanning of content directories (`images/`, `files/`, `media/`, `tmp/`, `ops/`) confirms **zero `%PDF-` files** — including extensionless or misnamed candidates.

Green Office operational evidence in this Joomla instance is primarily:
1. **SharePoint / OneDrive URLs** embedded in Joomla article HTML (not local files)
2. **CSV/JSON/XLSX dashboard data** under `images/data/` (1 local `.xlsx`: `12-elect.xlsx`)
3. **Activity images** (JPG/PNG), not PDF policy documents
4. **Separate document stores** outside `joomla_data/` (`joomla-greenoffice/docs/`, `/var/www/goffice/releases/`) containing PDFs unrelated to Joomla-uploaded Green Office evidence

The Product Owner expectation of PDF evidence likely refers to **SharePoint-hosted Office documents** linked from category pages, or documents held **outside the Joomla web root**, not files stored inside `joomla_data/`.


### Source-of-Truth Map (pattern)

| Legacy Joomla page | DB record | URL/path | Storage | Type | Availability | Migration action |
|--------------------|-----------|----------|---------|------|--------------|------------------|
| 3.1 การใช้น้ำ | j6_content #43 | SharePoint `:x:` link | maejo365-my.sharepoint.com | xlsx (cloud) | auth may be required | export from SharePoint, map to indicator 3.1.2 |
| 3.2 การใช้พลังงาน | j6_content #44 | SharePoint links | cloud | xlsx | external | export + map 3.2.2 |
| Dashboard energy data | N/A (filesystem) | images/data/energy/12-elect.xlsx | local joomla_data | xlsx | exists | pilot candidate (already in audit) |
| Category criteria PDF | N/A | /var/www/goffice/releases/*/documents/reference/*.pdf | deployment tree | pdf | exists | already in GO2026 production build |
| ThaiCERT docs | N/A | joomla-greenoffice/docs/thaicert_submission/*.pdf | ops/docs | pdf | exists | not Green Office evidence — incident package |

## Validation

- No source modifications: **YES**
- No database writes: **YES** (SELECT only)
- No archive extraction: **YES**
- No secret contents in outputs: **YES**
- No files copied to public/: **YES**
- Outputs limited to `docs/migration/legacy-content-verification/`: **YES**
- Local paths checked for existence: **YES**
- URL classifications include resolution status: **YES**

## Recommended Next Steps

1. Product Owner to confirm SharePoint (`maejo365-my.sharepoint.com/personal/prinya_mju_ac_th/`) as authoritative evidence store
2. Authorized export of linked `.xlsx` forms from SharePoint for migration pilot
3. Do not expect PDF inventory from `joomla_data/` — evidence model is cloud-linked + dashboard CSV/JSON
4. Update migration manifest with external link registry before pilot
