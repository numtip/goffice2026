# GO-CAT1-1.6 — FY2568 Plan & Project Source Reconciliation

**Date:** 2026-08-19  
**Status:** RECONCILIATION COMPLETE (historical-baseline)  
**Verdict:** FY2568 **1.6.1 plan** partially supported; **two canonical projects** verified for **1.6.2** with truthful GHG impact classification. **No measured project-level tCO₂e reductions.** **1.6 UI not built in this phase.**

---

## 1. VERDICT

FY2568 Category 1 indicators **1.6.1** and **1.6.2** are reconcilable as **historical-baseline** when:

- **1.6.1** — Annual written Green Office plan FY2568 exists, **1-year duration**, executive approval narrative supported; detailed activity list in **external ERP attachment** (not in repo).
- **1.6.2** — **Two projects** (`proj-1` 5S/Big Cleaning, `proj-2` Rat/IPM) with source-verified KPIs; **proj-2 reused** for **1.3.3** and **1.6.2** (single registry).
- **GHG truthfulness** — Neither project reports measured kWh/tCO₂e reduction; classify **5S as `ghg_supporting_action`**, **Rat/IPM as `environmental_improvement`**.
- **1.5.2 link** — Org-level performance gap (+4.81%, target not met) **not explicitly linked** to any project in sources; do not infer causality.

---

## 2. Source Inventory / Version Disposition

### Working inventory (`docs/1-6/`)

| File | Disposition | Role |
|------|-------------|------|
| `ประกอบข้อ 1.6.docx` | **CANONICAL master** | 1.6.1 + 1.6.2 narratives, project KPI basis |
| `1.6.1 (9-3-69).pdf` | **CANONICAL** (duplicate of docx section) | 1.6.1 indicator evidence |
| `1.6.2 (9-3-69).pdf` | **CANONICAL** | 1.6.2 indicator evidence (5S summary; 2 pp) |
| `รายงานโครงการ 5ส Green Office 2568.pdf` | **CANONICAL** | proj-1 full KPI report (29 pp) |
| `รายงานโครงการลดปัญหาหนู…Green Office.pdf` | **CANONICAL** | proj-2 full KPI report (15 pp) |

### Published mirror (`public/documents/fy2568/cat1/1.6…/`)

| File | Disposition |
|------|-------------|
| All above + `ย.002 โครงการ 5ส.pdf`, `ย.002 โครงการลดหนู.pdf` | **docs ≡ public** (byte-identical pairs verified) |
| `ประกอบข้อ 1.6.pdf` | **DUPLICATE** archive of docx |

### Referenced but not in repo

| Reference | Impact |
|-----------|--------|
| ERP `openFile.aspx?id=NzY5NTQz` | 1.6.1 detailed annual plan/activities attachment |
| ERP forms pid 23342 (5S), 24099 (Rat) | Supporting approval metadata — in public folder |

**FY2569 note:** Filenames dated `(9-3-69)` are Green Office **2569 criteria form versions** used to document **FY2568** evidence — do not treat as FY2569 operational data.

---

## 3. 1.6.1 Plan Findings (`proj-plan-1`)

| Element | Status | Source |
|---------|--------|--------|
| Written annual plan FY2568 | **Supported** | `1.6.1 (9-3-69).pdf`; cross-ref `1.1.4 (9-3-69).pdf` |
| Duration ≥ 1 year | **Supported** | “การดำเนินงาน 1 ปี”, ปี 2568 |
| Executive approval | **Supported (narrative)** | 1.6.1 §(3); 1.1.4 approval by 4 units |
| Named activities | **External / not in repo** | ERP `id=NzY5NTQz` |
| Policy §8 GHG reduction intent | **Supported** | Policy signed **25 มี.ค. 2568** |
| Link to **1.1.3** targets | **Supported** | 1.6.1 cites ประกาศเป้าหมายสิ่งแวดล้อม 2568 (base 2567) |
| Carbon Neutrality / Net Zero | **Criterion text only** | 1.6.1 §(4) references CN/NZ; **not separately evidenced** beyond policy §8 GHG campaign wording |
| Link to **1.5.2** gap (+4.81%) | **Not in sources** | No explicit plan→performance bridge |

**Plan status:** **PARTIAL** — framework and approval supported; activity-level schedule missing locally.

---

## 4. Project Count

| Kind | Count | IDs |
|------|------:|-----|
| FY2568 projects | **2** | `proj-1`, `proj-2` |
| FY2568 plans | **1** | `proj-plan-1` |

No duplicate project registry. No FY2569 projects created.

---

## 5. Project Canonical Records

### proj-1 — Green Office & 5S (Big Cleaning Day)

| Field | Value |
|-------|-------|
| Indicators | **1.6.2** only |
| Period | **19–21 May 2568** (event 19 May 08:30–16:30) |
| Owner | ศ.ดร.สุรชัย ชำนาญวงศ์ |
| Approval | ย.002 pid **23342**, **19/05/2568** |
| Budget | 11,000 THB (spent 10,725) |
| `ghgImpactStatus` | **`ghg_supporting_action`** |
| `targetStatus` | **met** |

### proj-2 — Rat / IPM (shared 1.3.3 + 1.6.2)

| Field | Value |
|-------|-------|
| Indicators | **1.3.3**, **1.6.2** |
| Period | **1 Oct – 31 Dec 2568** |
| Owners | ริมฤทัย พุทธวงค์ / สุปราณี แก้วเทียน / จุมพล ศรีอุดมสุวรรณ |
| Linked aspects | **ea-101**, **ea-102** (via `environmental-aspects-2568.json` projectLinks) |
| `ghgImpactStatus` | **`environmental_improvement`** |
| `targetStatus` | **met** |

---

## 6. KPI Target vs Actual

### proj-1 — 5S / Big Cleaning

| KPI | Target | Actual | Met? |
|-----|--------|--------|------|
| Participation (owning unit) | ≥ 85% | **97.78%** (44/45) | Yes |
| Participation (building, 4 units) | ≥ 85% | **91.80%** (112/122) | Yes |
| Measured kWh reduction | — | **None** | N/A |
| Measured tCO₂e reduction | — | **None** | N/A |

### proj-2 — Rat / IPM

| KPI | Target | Actual | Met? |
|-----|--------|--------|------|
| Trap/prevention points | ≥ 80% | **100%** (6/6) | Yes |
| Staff satisfaction | ≥ 80% | **88.60%** (4.43/5) | Yes |
| Access points sealed | ≥ 10 | **11** (from 35 surveyed) | Yes |
| Measured tCO₂e reduction | — | **None** | N/A |

**Truthfulness rule applied:** Participation/sanitation success **≠** GHG reduction success.

---

## 7. GHG Measurement Support

| Project | Classification | Measured reduction | Basis |
|---------|----------------|-------------------|-------|
| proj-1 (5S) | `ghg_supporting_action` | **None** | Objectives cite energy/GHG/waste; activities include turning off unused electricity, 3Rs; **no kWh/tCO₂e reported**; report §5.2 **recommends** future quantitative indicators |
| proj-2 (Rat) | `environmental_improvement` | **None** | IPM/sanitation/chemical-risk focus; conclusion mentions future energy/GHG integration — **aspirational only** |
| Org FY2568 (1.5.2) | — | **+4.81% vs target −1%** | **Not met** — projects do not close this gap with measured reductions |

---

## 8. 1.3.3 Reuse / Mapping

| Check | Result |
|-------|--------|
| Single canonical `proj-2` for 1.3.3 + 1.6.2 | **PASS** |
| `projectLinks` in environmental-aspects-2568 | **2 links** → `proj-2` only (ea-101, ea-102) |
| proj-1 linked to 1.3.3 | **No** — correct (no aspect control text names 5S project) |
| Duplicate project metadata | **None** |

---

## 9. 1.5.2 Relationship

| Link | Supported? |
|------|------------|
| 1.5.2 performance record (`ghg-perf-1`) | Target **−1%**, actual **+4.81%**, **not met** |
| Source-explicit project → closes 1.5.2 gap | **No** |
| Architectural UI chain 1.5.2 → 1.6.2 | Presentation navigation only — **not source causality** |

**Rule:** `1.5.2 Performance Gap → 1.6 Plan/Projects` applies only where source supports explicit linkage. Current sources support **organizational context only**, not measured gap closure.

---

## 10. Anomalies / Gaps

| ID | Description | Blocks reconciliation? |
|----|-------------|---------------------|
| GAP-PLAN-ERP | ERP plan attachment `NzY5NTQz` not in repo | Partial — 1.6.1 activities unauditable locally |
| GAP-PLAN-ACTIVITIES | 1.1.4 plan table pp.3–8 image-only | Partial — no machine-readable activity list |
| ANOM-RAT-10v11 | Rat report KPI table **10** vs narrative **11** access points | No — use **11** per §2.3/conclusion |
| GAP-5S-GHG | 5S objectives mention GHG but no quantitative outcome | No — correctly classified |
| GAP-NO-GAP-LINK | No source link plan/projects → 1.5.2 +4.81% | No — documented absence |
| CN-NZ-WEAK | Carbon Neutrality/Net Zero not separately evidenced | Partial for 1.6.1 criterion (4) |

---

## 11. Files Changed

| File | Change |
|------|--------|
| `docs/data/GO-CAT1-1.6-FY2568-RECONCILIATION.md` | This report |
| `src/data/category1/projects.json` | KPIs, ghgImpactStatus, results, plan metadata, corrected verification basis |
| `scripts/test-category1-projects-2568.mjs` | Dedup, reuse, KPI, GHG truthfulness tests |
| `scripts/validate-category1-contracts.mjs` | Project invariants (1.6) |
| `package.json` | Include new test in `npm test` |

---

## 12. Validation

Run: category1 contract validator, `npm test`, `npm run check`, `npm run build`, `git diff --check`.

Regression: no 1.3/1.4/1.5 contract changes; no FY2569 data; no 1.6 UI.

---

## 13. Recommended Presentation Phase (not implemented)

1. **1.6.1 journey** — Plan existence, duration, approval, 1.1.3 link; flag ERP attachment missing; **no CN/NZ overclaim**.
2. **1.6.2 journey** — Two project cards from canonical records; KPI target/actual; **ghgImpactStatus badges**; continuity recommendations.
3. **Cross-links** — 1.5.2 → 1.6.x navigation with “gap not closed by measured reduction” disclaimer; 1.3.3 → proj-2 reuse visible.
4. **Do not** present participation % or sanitation KPIs as tCO₂e reductions.

---

**Authority:** Phase A disposition, `projects.json`, `environmental-aspects-2568.json`, `ghg.json` (`ghg-perf-1`), FY2568 source PDFs in `docs/1-6/`.

**Guardrails honored:** No 1.6 UI, no invented CO₂ values, no workbook edits, no FY2569 data, no VPS/production changes.
