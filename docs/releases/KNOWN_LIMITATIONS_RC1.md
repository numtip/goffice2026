# Known Limitations — RC-1

**Release candidate:** RC-1  
**Baseline commit:** `61b5fa9`  
**Last updated:** 2026-07-27

Each gate item must pass or be explicitly listed here before RC-1 is accepted for preview sign-off.

---

## Summary

| # | Category | Severity | Count / scope |
|---|----------|----------|---------------|
| 1 | FY2569 operational data pending | High | 6 resource domains |
| 2 | PDF redaction before publication | High | 2+ documents |
| 3 | Evidence / document orphans | Medium | 1 documented orphan + 14 evidence placeholders |
| 4 | OCR-derived content quality | Medium | 7+ About PDF summaries |

**Total limitation categories:** 4 (primary RC-1 blockers for production)

---

## 1. FY2569 Data Pending

Official FY2569 operational workbooks are not yet available in the repository.

| Resource | FY2568 baseline | FY2569 status |
|----------|-----------------|---------------|
| Water | Preserved | `Waiting for Official FY2569 Data` |
| Electricity | Preserved | Cleared — pending official source |
| Fuel | Preserved | Cleared — pending official source |
| Paper | Preserved | Cleared — pending official source |
| Waste | Preserved | Correctly empty |
| GHG | Preserved | Cleared — pending official source |
| Recycling rate | Preserved | Cleared — pending official source |

**Impact:** Dashboard FY2569 charts and KPI cards show pending state or omit current-year values.  
**Evidence:** `src/data/generated/*.json`, `data/reconciliation-status.json`, Day 1 QA report.  
**Remediation:** PO supplies XLSX workbooks (5/6 absent from `docs/` as of 2026-07-27); run `npm run data:build`.

---

## 2. PDF Redaction Required

Several About-source PDFs contain personal contact information or require review before public download.

| Document | Issue | Status |
|----------|-------|--------|
| `Details of the feedback channels.pdf` | Personal email and phone | `public-after-redaction` |
| About PDFs generally | Not yet copied to `public/` | Metadata only — download links pending |

**Impact:** Feedback channel page shows summary content; direct PDF download blocked until redaction.  
**Evidence:** `docs/content/ABOUT_DOCUMENT_INVENTORY.md`, `src/data/about/pages.json`.  
**Remediation:** Redact PII, copy approved PDFs to `public/documents/`, update document registry publication status.

---

## 3. Orphans & Unlinked Artifacts

### 3a. Paper usage orphan (documented)

| Field | Value |
|-------|-------|
| Registry ID | `doc-paper-usage-2025` |
| Status | `orphan` — explicitly not linked |
| Source | `docs/1.4_Paper.xlsx` — **missing from disk** |
| Rationale | No valid evidence slot; must not link to committee order (1.4.1) |

**Impact:** Paper consumption operational data unavailable on site; baseline JSON retains legacy derived values with provenance flag.  
**Evidence:** `docs/evidence/WS-B_PAPER_USAGE_ORPHAN_QA.md`

### 3b. Evidence placeholders

- 14 evidence slots remain placeholder/unpublished (down from 17 at sprint start)
- Validator expects 21 evidence routes; actual 24 after About PDF additions — threshold update pending

### 3c. Missing About content

- Activity-level environmental assessment (indicator 1.1.2) — not supplied
- Goals achievement and communication evidence (1.3.2, 1.3.3) — not supplied
- Green Office certification PDF — not supplied
- Committee role-understanding uses duplicate of policy review PDF — dedicated instrument may be needed

---

## 4. OCR-Derived Content

About Center summaries are derived from PDF OCR extraction.

| Limitation | Detail |
|------------|--------|
| Human verification | OCR text requires manual review before treating as authoritative |
| EN translation | EN About routes previously showed Thai OCR text; partial fix applied — full EN prose translation pass pending |
| Publication banners | Pages display pending/historical banners where OCR confidence is low |
| Missing images | Committee photo, certification imagery — not supplied |

**Impact:** Content is navigable and structurally complete; prose quality and bilingual parity incomplete.  
**Evidence:** `docs/content/ABOUT_MISSING_CONTENT.md`, `docs/qa/RAPID_COMPLETION_DAY1_REPORT.md`

---

## 5. Additional Accepted Limitations (MVP scope)

| # | Limitation | Impact |
|---|-----------|--------|
| 5 | Static search index (build-time only) | No live/API search |
| 6 | SharePoint library not bulk-migrated | Metadata contract only; 134-file CSV not synced |
| 7 | Backend / Supabase removed from MVP | Admin workflow deferred |
| 8 | Production VPS unchanged (v1.1.3) | RC-1 is preview-only until PO acceptance |
| 9 | Smoke test requires manual preview server | Windows needs `PREVIEW_BASE_URL=http://localhost:4321` |

---

## Acceptance Criteria for Production Promotion

RC-1 may advance beyond preview when:

1. FY2569 workbooks imported and validated
2. Feedback channel PDF redacted and published
3. Validator thresholds updated for 24 evidence items
4. EN About translation pass complete (or explicitly deferred by PO)
5. OCR summaries human-verified for policy and committee pages
6. PO sign-off on orphan dispositions and remaining placeholders

---

## References

- [RELEASE_NOTES_RC1.md](./RELEASE_NOTES_RC1.md)
- [DEPLOYMENT_CHECKLIST_RC1.md](./DEPLOYMENT_CHECKLIST_RC1.md)
- [docs/qa/RAPID_COMPLETION_DAY1_REPORT.md](../qa/RAPID_COMPLETION_DAY1_REPORT.md)
