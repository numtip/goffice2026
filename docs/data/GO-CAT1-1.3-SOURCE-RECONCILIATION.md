# GO-CAT1-1.3 — Source Reconciliation & Closeout

**Date:** 2026-08-19
**Status:** CLOSEOUT COMPLETE
**Verdict:** No normalization/data defect. Count gaps are source-label grouping + classification-authority differences.
**Canonical FY2568 CAT1-1.3 runtime:** `src/data/category1/environmental-aspects-2568.json`
**Legacy/supporting (retained, not deleted):** `src/data/category1/activities-aspects.json` — 1.1.1 scope remains canonical; 1.3 activity/aspect records are historical.

---

## 1. Verdict

Both files contain the **same 102 aspects** (47 input / 55 output). Aspect+inputOutput identity matches 1:1. Nothing is missing or invented.

| Count | `activities-aspects.json` (legacy 1.3) | `environmental-aspects-2568.json` (canonical 1.3) |
|---|---|---|
| Source workbook | `1.3/ทะเบียนระบุและประเมินปัญหาสิ่งแวดล้อม_1.3(1) - 1.3(4).xlsx` | `docs/ผลประเมินปัญหา2568.xlsx` |
| Activities | **17** (process sheet 1.3(1)) | **20** (unique register activity-cell labels) |
| Aspects | 102 | 102 |
| Significant M/H | **35** (register M on one disputed row) | **34** (priority-sheet L on that row) |
| L / M / H | 67 / 32 / 3 | 68 / 31 / 3 |

Runtime presentation now uses only the canonical file for 1.3.1 / 1.3.2 / 1.3.3 and the Cat1 1.3 snapshot. Priority-sheet L/M/H remains canonical; register values stay on `assessment.registerSignificance`. No scoring formula is invented.

---

## 2. Why 17 → 20 (activities)

The 17 names are the 1.3(1) process-sheet activity blocks. The canonical file counts **unique activity-cell values** in the Input/Output registers. Three extra labels are **not** additional office processes:

| Extra label (canonical) | Source trace | Relationship to the 17 |
|---|---|---|
| `เครื่องคอมพิวเตอร์` | Input row 18 | Stray activity cell inside the `การจัดประชุมภายนอก (Indirect)` block. Priority sheet groups those 3 aspects under `การจัดประชุมภายนอก (Indirect)`. Legacy file already recorded this and folded the label. Canonical file preserves the register cell and flags `register-priority-activity-label-divergence`. |
| `การรับประทานอาหาร (ถังดักไขมัน)` | Output row 36 | Parenthetical variant of `การรับประทานอาหาร`. |
| `การดูแลยานพาหนะ (รถยนต์ รถจักรยานยนต์)` | Output row 55 | Parenthetical variant of `การดูแลยานพาหนะ`. |

102 aspects still map; only activity grouping differs.

---

## 3. Why 35 → 34 (significant M/H)

Exactly **one** aspect changes classification. The three `เครื่องคอมพิวเตอร์` rows are the same three M aspects as the legacy `การจัดประชุมภายนอก (Indirect)` rows — they do not change the M/H tally.

| Field | Legacy (`activities-aspects.json`) | Canonical (`environmental-aspects-2568.json`) |
|---|---|---|
| Activity / aspect | `การดูแลยานพาหนะ` / `น้ำ` (input) | same |
| Source | Input register (older workbook) | Input row 46 + `จัดลำดับ (Input)` row 45 |
| Register significance | **M** (used as record value) | **M** (`assessment.registerSignificance`) |
| Priority significance | L (noted as anomaly, not used) | **L** (`assessment.significance`, `significanceSource: priority`) |
| Score | 48 | 48 (`riskScore` / `priorityScore`) |

Legacy already documented: *Input register row การดูแลยานพาหนะ/น้ำ (score 48) marked M in register but L in จัดลำดับ(Input).* Closeout rule keeps **priority-sheet L/M/H as canonical**, so this row is L and M/H = 34.

---

## 4. Defect check

| Question | Result |
|---|---|
| Duplicate/missing aspects? | No. 102 = 102 by aspect + Input/Output. |
| Superseded sheet ingested? | No. Canonical excludes `จัดลำดับ(Output)` (55 draft rows). |
| Invented score/formula? | No. Source L/M/H only. |
| Invented projects? | No. 1.3.3 links only the two documentary หนู rows → `proj-2`. |
| Year leakage as data? | No. FY2567 `Output!A2` remains an anomaly. |

**Not a defect.** Do not rewrite activity grouping in this closeout (would change validated canonical JSON without a source error).

---

## 5. Runtime disposition

| Dataset | Role |
|---|---|
| `environmental-aspects-2568.json` | **Canonical FY2568 CAT1-1.3 runtime** for 1.3.1, 1.3.2, 1.3.3 and the Cat1 1.3 domain card |
| `activities-aspects.json` | **Canonical 1.1.1 scope** (9,873 ตร.ม.). 1.3 activity/aspect records = **legacy/supporting**, retained |
| `projects.json` | Canonical project registry for 1.6.1 / 1.6.2 (1.3.3 documentary links still resolve here) |

Cat1 snapshot: `activities-aspects` card shows 1.1.1 scope only (route `/indicators/1.1.1/`). 1.3 counts appear only on the `environmental-aspects-2568` card.
