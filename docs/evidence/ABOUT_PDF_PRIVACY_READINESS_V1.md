# About PDF Privacy Readiness Assessment v1

**Date:** 2026-07-27  
**Branch:** `rapid/ws-about-pdf` (from `master@98f423e`)  
**Worker:** Subagent C — About PDF Privacy  
**Source inventory:** `doc/` (8 PDFs)  
**Metadata cross-reference:** `src/data/about/documents.json`

---

## Summary

| Classification | Count | Copy to `public/documents/about/` |
|----------------|-------|-----------------------------------|
| PUBLIC_READY | 0 | No |
| REDACTION_REQUIRED | 4 | No — blocked until redacted |
| HOLD | 4 | No — pending OCR / human review / artifact resolution |

**Decision:** No PDFs copied to `public/documents/about/` in this sprint. All eight remain in `doc/` only.

---

## Per-Document Classification

| # | Source file (`doc/`) | Document ID | Pages | SHA-256 (prefix) | Text layer | Classification | PII / privacy signals |
|---|----------------------|-------------|-------|------------------|------------|----------------|------------------------|
| 1 | GreenOfficePolicy2026.pdf | doc-policy-signed | 2 | `710369045BDA41D0` | OCR_REQUIRED (scanned) | **HOLD** | Director name + visible signature/stamp (Asst.Prof.Dr. Nattapon Laoharodphan per metadata). Official policy; human privacy sign-off pending. |
| 2 | Evidenceofpolicyreview.pdf | doc-policy-review | 9 | `6FE5777710B93AF7` | OCR_REQUIRED (scanned) | **REDACTION_REQUIRED** | Full names of committee members throughout meeting minutes. |
| 3 | Green Office Goals.pdf | doc-goals | 1 | `6CDBD93692E3E8C4` | OCR_REQUIRED (scanned) | **HOLD** | Director name + signature on signed announcement. Numeric targets need OCR verification. |
| 4 | Order_appointing_the_committee.pdf | doc-committee-order | 6 | `235C6CC5405D2D5B` | OCR_REQUIRED (scanned) | **REDACTION_REQUIRED** | Full names and positions of Oversight + Operations committee members; signed official order. |
| 5 | Evidence clarifying the role and understanding of the committee.pdf | doc-committee-understanding | 9 | `6FE5777710B93AF7` | OCR_REQUIRED (scanned) | **HOLD** | **Duplicate file** — identical SHA-256 to #2. Not a distinct role-understanding instrument; PO must confirm correct artifact. |
| 6 | Scope of Work and Activities.pdf | doc-scope | 7 | `F10222BE108D2672` | OCR_REQUIRED (scanned) | **HOLD** | Director name + signature; personnel count (53) and floor-plan detail. OCR verification required. |
| 7 | Action plan and performance results.pdf | doc-action-plan | 21 | `0A155F7E398D1FB8` | OCR_REQUIRED (scanned) | **REDACTION_REQUIRED** | Named responsible persons across categories; 21-page scanned workbook. |
| 8 | Details of the feedback channels.pdf | doc-feedback-channels | 3 | `0521E0FE77DC001B` | EMBEDDED_TEXT | **REDACTION_REQUIRED** | Personal email `raemju@gmail.com`; phone `0 5387 3400` (embedded text confirmed). |

---

## PII Scan Method

- Embedded-text extraction via `pypdf` on all eight files (2026-07-27).
- Seven scanned PDFs returned zero extractable text → classified `OCR_REQUIRED`; PII assessment relies on `documents.json` metadata and prior intake notes.
- Feedback channels PDF: automated scan confirmed email and phone on pages 1–2.

No national ID numbers (13-digit) detected in extractable text. Signatures present on scanned official orders/policy/goals/scope (image-only; not machine-readable).

---

## Blockers

1. **Zero PUBLIC_READY** — no file cleared for copy without PO privacy approval and/or redaction.
2. **OCR backlog** — 7/8 PDFs are image scans; text and numeric values unverified.
3. **Duplicate artifact** — `Evidence clarifying…` is byte-identical to `Evidenceofpolicyreview.pdf`; dedicated committee role-understanding evidence may still be missing.
4. **Contact PII** — feedback channels PDF requires email/phone redaction or replacement with official institutional contacts.
5. **Committee roster exposure** — appointment order and meeting minutes contain extensive personal names; redaction or PO waiver required before publication.
6. **`public/documents/about/` empty** — download links cannot go live until classifications move to PUBLIC_READY.

---

## Mapping Notes (`documents.json`)

All eight intake PDFs are registered with `pathPublic` targets under `/documents/about/…`. Registry `publicStatus` values (`PUBLIC_READY`, `PUBLIC_AFTER_REDACTION`) reflect content suitability for About pages, **not** completed privacy clearance. This assessment supersedes copy timing until blockers are resolved.
