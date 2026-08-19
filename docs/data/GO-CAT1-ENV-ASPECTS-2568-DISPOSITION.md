# GO-CAT1-ENV-ASPECTS-2568 — Phase A/B Source Disposition & Contract

**Date:** 2026-08-19
**Status:** COMPLETE — pipeline implemented
**Scope:** CAT1-1.3 Canonical Data Pipeline — source audit, version disposition, contract design
**Read-only source:** `docs/ผลประเมินปัญหา2568.xlsx` (primary structured FY2568 source) + `docs/เกณฑ์การประเมินสำนักงานสีเขียว ปี 2568_1-3.pdf` (historical criteria)
**Governance:** `GOFFICE2026_CATEGORY1_MANAGEMENT_BLUEPRINT_V1`; FY2569 criteria = `2026 Green Office Assessment Criteria.MD`

---

## 1. Workbook structure (`docs/ผลประเมินปัญหา2568.xlsx`, 6 sheets)

| Sheet | Form | Rows | Role in criteria | Disposition |
|---|---|---|---|---|
| `ตารางวิเคราะห์กระบวนการ` | 1.3(1) | 86 process rows / 17 activities | 1.3.1 activity/process identification | **SUPPORTING** |
| `Input` | 1.3(2) | 51 data rows | 1.3.1 resource (input) register | **SUPPORTING** |
| `Output` | 1.3(3) | 55 data rows | 1.3.1 pollution (output) register | **SUPPORTING** |
| `จัดลำดับ (Input)` | 1.3(4) | 47 ranked records | 1.3.2 input prioritization | **CANONICAL** (input) |
| `จัดลำดับ(Output)` | 1.3(4) | 55 records, unranked | 1.3.2 output prioritization (draft) | **SUPERSEDED** |
| `จัดลำดับ(Output) (29 สค68)` | 1.3(4) | 55 ranked records | 1.3.2 output prioritization (final) | **CANONICAL** (output) |

Column layouts (verified structurally):
- **Registers (Input/Output):** A=process, B=problem, C–F=impact types, G=Direct, H=Indirect, I=condition (N/A/E), J/K=applicable law (Y/N), L–P/L–R=likelihood factors (L1–L5/L1–L7), Q/S=likelihood total, R–T/T–W=severity factors (C1–C3/C1–C4), U/X=severity total, V/Y=LxC risk score, W–Y/Z–AB=L/M/H significance, Z/AC=control/prevention.
- **Priority sheets (1.3(4)):** A=rank, B=activity, C=direct/indirect, D=condition, E=problem, F=score, G=significance (L/M/H), H=control/prevention.

## 2. Version disposition — `จัดลำดับ(Output)` vs `จัดลำดับ(Output) (29 สค68)`

| Criterion | `จัดลำดับ(Output)` | `จัดลำดับ(Output) (29 สค68)` |
|---|---|---|
| Rank numbers | ✗ (unranked) | ✓ rank 1–55 (score-descending) |
| Activity column filled | 16 / 55 | 55 / 55 |
| Significance tally | H=2, M=2, L=51 | H=2, M=2, L=51 |
| Name-matched content diffs vs register | 9 | 10 |
| Control text (project refs) | partial | **contains documented project ref** ("ดำเนินโครงการลดปัญหาหนู…") |
| Evidence of finality | none | dated 29 สค68, complete activities |

**Disposition: `จัดลำดับ(Output) (29 สค68)` = CANONICAL. `จัดลำดับ(Output)` = SUPERSEDED.** Evidence-based (rank numbers + complete activity column + project reference + dated), not chosen from filename/mtime alone.

**Year leakage check:** `Output!A2` (title cell) reads "ปี 2567" — a **FY2567 label leak**. All data rows, dates ("9 กรกฎาคม 2568") and the 29 สค68 sheet are FY2568. The canonical artifact therefore records `year: 2568` and treats the FY2567 label as an anomaly (documented in `anomalies`), never as a data year.

## 3. Register-vs-priority reconciliation (source-truth note)

The registers (1.3(2)/1.3(3)) and the priority sheets (1.3(4)) are not always identical:

- **Input:** 16 diffs between `Input` register and `จัดลำดับ (Input)` — mostly Direct/Indirect reclassification (8), several ไฟฟ้า rows marked M in register but L in priority, one น้ำ row L→M.
- **Output:** 10 diffs between `Output` register and `จัดลำดับ(Output) (29 สค68)` — mostly Direct/Indirect reclassification (7) and two score/significance changes (กระดาษที่พิมพ์เสีย L→M; กระดาษที่ใช้แล้ว 42→35).

**Contract rule (preserve-source):** each aspect record carries BOTH `assessment.significance` (canonical = priority-sheet value when the problem appears in the canonical priority sheet, else register value) AND `assessment.registerSignificance` when they differ, plus a `significanceSource` marker. No formula is invented; source classifications are preserved and flagged.

## 4. Criteria-to-workbook mapping (FY2568 PDF)

| Indicator | Criteria requirement | Workbook source |
|---|---|---|
| 1.3.1 | Identify & assess environmental aspects from all activities (forms 1.3(1)–1.3(3)) | `ตารางวิเคราะห์กระบวนการ` + `Input` + `Output` |
| 1.3.2 | Prioritize significant issues (M/H) and controls (form 1.3(4)) | `จัดลำดับ (Input)` + `จัดลำดับ(Output) (29 สค68)` |
| 1.3.3 | Environmental projects addressing significant issues | control text project ref → canonical `projects.json` (only 2 records: ฉี่/ขี้หนู + ซากหนู → `proj-2` โครงการลดหนู) |

## 5. FY2569 criteria comparison (materiality)

FY2569 criteria (`2026 Green Office Assessment Criteria.MD`) retain 1.3.1/1.3.2/1.3.3 with the same identification → prioritization → projects structure. **No material difference affecting the data contract.** This pipeline emits only FY2568 data (`year: 2568`); no FY2568→FY2569 copying, no FY2569 claims.

## 6. Contract (Phase B) — `src/data/category1/environmental-aspects-2568.json`

Minimum reusable contract per the task (domains → records):

| Contract entity | Record kind | Fields |
|---|---|---|
| officeActivity | `activity` | `id, name, sourceTrace` |
| environmentalAspect | `aspect` | `id, activity, inputOutput, aspect, impact, directIndirect, condition, applicableLaw, assessment, controlMeasure, projectReference, sourceTrace` |
| aspectAssessment | (nested in `aspect`) | `{ likelihoodFactors[], likelihoodTotal, severityFactors[], severityTotal, riskScore, priorityScore, registerSignificance, significance, significanceSource, discrepancy }` |
| significantIssue | `significantIssue` | `aspectId, significance (M/H), controlMeasure, relatedIndicatorCodes` — **DERIVED** from canonical aspects, not a second registry |
| controlMeasure | (in `aspect` + `significantIssue`) | control/prevention text + `controlSource` |
| projectReference | `projectReference` | `aspectId, text, projectId (canonical projects.json only)` — only 2 rows (documented) |
| sourceTrace | (every record) | `{ sourceFile, sheet, sourceRow, sourceVersion, sourceDisposition }` |

Top-level additions: `sources`, `dispositions` (the table in §1/§2), `anomalies` (FY2567 label leak + register/priority discrepancies), `summary` (counts by I/O, D/I, N/A/E, L/M/H), `gaps`.

**Validation split:** structural/reference checks reuse `scripts/validate-category1-contracts.mjs` (extended for the new domain); schema + semantic checks in the dedicated `scripts/validate-environmental-aspects-2568.mjs` (see repo scripts).

## 7. Normalization & validation summary (Phase C)

Generated artifact: `src/data/category1/environmental-aspects-2568.json` via `scripts/normalize-environmental-aspects-2568.mjs`.

| Metric | Count |
|---|---|
| Activities | 20 |
| Aspects | 102 (input 47 / output 55) |
| Direct / Indirect | 65 / 37 |
| Normal / Abnormal / Emergency | 100 / 2 / 0 |
| Significance L / M / H | 68 / 31 / 3 |
| Significant issues (M/H, derived) | 34 |
| Documentary project links (1.3.3) | 2 |
| Register/priority classification diffs | 2 (all output) |
| Superseded rows excluded | 55 (จัดลำดับ(Output) draft) |
| Anomalies recorded | 9 (year-label leak + register-priority diffs + parse warnings + activity-label divergences) |
| Unmatched priority rows | 0 (graded name matching + input positional fallback) |

Validation layers:
- **Shared contract validator** (`scripts/validate-category1-contracts.mjs`): structural/reference integrity for the new `environmental-aspects-2568` domain.
- **Dedicated validator** (`scripts/validate-environmental-aspects-2568.mjs`): schema (IDs, year=2568, required fields/types/enums, source trace) + semantic (no superseded-sheet duplicates, activity resolution, D/I + N/A/E validity, significance consistency, M/H control retention, legal refs preserved, projectReference only for canonical projects, no FY2567/2569 leakage).
- **Regression tests** (`scripts/test-environmental-aspects-2568.mjs`): source disposition, duplicate prevention, year isolation, significance derivation, 1.3.2 derived from canonical 1.3.1 data, 1.3.3 not inventing projects, source traceability.
- **Search index** gains one aggregate `assessment-dataset` entry (`env-aspects-2568`, route `/indicators/1.3.1/`) with dataset counts — no aspect-level duplication.

Significance distribution (canonical, priority-sheet value when present): L=68, M=31, H=3. The register double-marked `กระดาษที่พิมพ์เสีย` (L+M) is resolved to the canonical priority value M and flagged as a parse warning; `กระดาษที่ใช้แล้ว` score 42→35 in the priority sheet is preserved as priority (canonical) with the register value kept in `assessment.registerSignificance`. Project links (2) exist only where control text names a project confirmed in `projects.json` (1.3.3) — the หนู/ซากหนู rows linking to `proj-2`.

## 8. Guardrails honored

Source strictly read-only. No official scoring. No FY2568→FY2569 copying. No invented projects (1.3.3 links only where control text documents a project and `projects.json` confirms it). No inferred evidence. FY2567 label leak documented as anomaly, not propagated.
