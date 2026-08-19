# GO-CAT1-1.4 — FY2568 Legal Reconciliation

**Date:** 2026-08-19  
**Status:** RECONCILIATION COMPLETE (historical-baseline)  
**Verdict:** FY2568 legal register normalized; 47 requirements + 47 assessments wired; 1 explicit 1.3↔1.4 mapping; 5 source anomalies documented; no FY2569 leakage.

---

## 1. VERDICT

FY2568 Category 1 / 1.4 historical baseline is **verified and normalized** into canonical contracts. Row-level data lives in `1.4 ทะเบียนกฎหมาย ปี 2568.docx`; 1.4.1 provides topic summaries and law index; 1.4.2 is narrative-only (no compliance table). Implementation adds `legal-requirement`, `legal-compliance-assessment`, and `aspect-legal-mapping` record kinds without duplicating law titles across files. Questionable TDS row (702 vs ≤500) is `needs_review`, not final compliant.

---

## 2. Sources Inspected

| File | Role | Row data |
|------|------|----------|
| `docs/1.4. ทะเบียนกฎหมาย ปี 2568.docx` | Master register | **47 rows** (√ marks + evidence) |
| `docs/1.4.1 กฎหมาย…68 รวม (06.03.2569).docx` | GO narrative + topic summary | 9 topic counts + law index |
| `docs/1.4.2 ประเมินความสอดคล้อง…docx` | Audit criteria narrative | **0 tables** |
| `public/documents/fy2568/cat1/1.4/*` | Published copies | Byte-identical to `docs/` |
| `src/data/category1/environmental-aspects-2568.json` | Canonical 1.3 (102 aspects) | Mapping target |

---

## 3. Canonical Counts

| Metric | Count |
|--------|------:|
| Legal topics | **9** |
| Legal requirements (register rows) | **47** |
| Register rows marked √ | **47** |
| Compliance assessments (derived) | **47** |
| Assessment status: `compliant` | **46** |
| Assessment status: `needs_review` | **1** (`lca-1.3` TDS) |
| Requirements with evidence text | **22** |
| Requirements without evidence | **25** |
| External URLs in evidence | **2** |
| Local bylaws (Maejo) | **2** (`lr-3.7`, `lr-3.8`) |
| Explicit aspect↔law mappings | **1** (`ea-79` → `lr-3.2`) |

**Review dates (source):** 9 ก.ค. 2568 · 18 ก.ย. 2568 (register header) · 28 ส.ค. 2568 (water measurement) · 25 มี.ค. 2568 (Order 344/2568) · 06.03.2569 (1.4.1 filename only)

**Responsible persons:** Compiler นางสาวชณันภัสร์ กีรติอำนวยศรี (Order 344/2568); Reviewer ผศ.ภานุวัฒน์ เมฆะ; Approver ผศ.ดร.ณัฐพล เลาห์รอดพันธุ์ (signatures 18 ก.ย. 2568).

---

## 4. Version / Source Disposition

| Layer | Canonical source | Contract location |
|-------|------------------|-------------------|
| Topic summaries | 1.4.1 | `laws.json` `kind: legal-item` (law-1…law-9) |
| Register requirements | 1.4 register | `laws.json` `kind: legal-requirement` (lr-1.1…lr-9.3) |
| Aspect↔law links | 1.4 evidence (explicit only) | `laws.json` `kind: aspect-legal-mapping` |
| Row compliance | 1.4 register √ column | `compliance.json` `kind: legal-compliance-assessment` |
| Process narrative | 1.4.2 | `compliance.json` `kind: evaluation` (comp-1) |

1.4.1 filename date (06.03.2569) is metadata only — content is FY2568 baseline, not FY2569 data.

---

## 5. 1.3 ↔ 1.4 Mapping Coverage

| Category | Count |
|----------|------:|
| Canonical aspects (ea-*) | 102 |
| Explicit source mappings | **1** |
| Unmapped aspects | **101** |
| Unmapped laws (no aspect ID in source) | **46** |

**Explicit mapping:** `ea-79` (ของเสียจากห้องปฏิบัติการ) → `lr-3.2` (พ.ร.บ.รักษาความสะอาดฯ 2560) — evidence: หนังสือ อว 69.2.6/ว 69 (13 มิ.ย. 2568).

1.4.1(3) provides **topic→statute lists** (9 topics) but not `ea-*` IDs. Do not infer aspect links from generic label overlap.

---

## 6. Anomalies / Blockers

| ID | Issue | Disposition |
|----|-------|-------------|
| ANOM-TDS-702 | Row 1.3: TDS **702** vs std **≤500**; register √ | `lca-1.3` = `needs_review` |
| ANOM-REVIEW-DATES | 1.4.2 §(4) cites 9 Jul only; register cites 9 Jul + 18 Sep | Both dates preserved; contradiction noted |
| ANOM-SUMMARY-vs-ROWS | Topics 7 & 8: 1.4.1 summary = ไม่สอดคล้อง (5+3); register all √ | Topic counts from 1.4.1; row marks from register |
| STRUCT-142-NO-TABLE | 1.4.2 has no row table | Assessments derived from 1.4 register |
| VERSION-141-DATE | 1.4.1 filename 06.03.2569 vs register signed 18 Sep 2568 | Filename metadata only |

**Not blockers:** 101 unmapped aspects (source gap, not data defect). No restructuring required.

---

## 7. Files Changed

| File | Change |
|------|--------|
| `src/data/category1/laws.json` | +47 `legal-requirement`, +1 `aspect-legal-mapping`, anomalies, `historical-baseline` |
| `src/data/category1/compliance.json` | +47 `legal-compliance-assessment`, enriched comp-1, `historical-baseline` |
| `src/data/category1/category1-manifest.json` | Updated laws/compliance status notes |
| `src/utils/category1-presentation.ts` | Laws/compliance snapshot facts for new record kinds |
| `scripts/build-cat1-legal-2568.mjs` | Rebuild script from `.tmp_legal_final.json` |
| `scripts/test-category1-contracts.mjs` | Regression tests for 1.4 counts |
| `docs/data/GO-CAT1-1.4-FY2568-LEGAL-RECONCILIATION.md` | This report |

Source DOCX files **not modified**.

---

## 8. Validation Results

Run after implementation:

- `node scripts/validate-category1-contracts.mjs`
- `npm test`
- `npm run check`
- `npm run build`
- `git diff --check`

1.3 runtime (`environmental-aspects-2568.json`) unchanged. No FY2569 values introduced.

---

## 9. Recommended Next Phase

1. **PO review** of ANOM-TDS-702 and ANOM-SUMMARY-vs-ROWS before any UI claims compliant/non-compliant.
2. **Aspect↔law matrix UI** (Phase E) — show 1 explicit mapping + 101 unmapped honestly; optional PO-approved inference layer separate from source-derived data.
3. **Evidence slots** for 22 rows with cited evidence (link to `public/documents/fy2568/cat1/1.4/`).
4. **1.4.2(1) interview** placeholder remains `-สัมภาษณ์-` — comp-1 stays `partial`.
5. Do **not** ingest 1.4.1 filename date as FY2569 operational data.
