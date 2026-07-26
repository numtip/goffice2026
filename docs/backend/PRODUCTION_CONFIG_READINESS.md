# Production Configuration Readiness (GO-BE-2C)

**Date:** 2026-07-26  
**Status:** PREPARED — local/static only; live Supabase mode not activated

---

## Owner department mappings

Evidenced organizational units appear in source workbooks (`1.3_Gassolene.xlsx`, `1.4_Paper.xlsx`, `1.5_Waste.xlsx`). No standalone org-chart document exists in-repo; mappings below use workbook labels only.

| Metric | Proposed owner code | Workbook evidence | Confidence |
|--------|---------------------|-------------------|------------|
| `energy` | `SAMNG` | Office-wide consolidated sheet `2568` in `12-elect.xlsx` | Medium — consolidation unit not named on sheet |
| `water` | `SAMNG` | Office-wide consolidated sheet `2568` in `1.1-Water.xlsx` | Medium |
| `fuel` | `IQS` | Dedicated department sheets `IQS`, `สำนักวิจัย` in `1.3_Gassolene.xlsx`; IQS holds primary fleet diesel logs | **High** |
| `paper` | `SAMNG` | Row label `สำนักงาน` on sheet `แต่ละหน่วยงาน`; office total on sheet `2568` | Medium |
| `waste` | `SAMNG` | Form 4.1(1) office-wide totals on `1.5_Waste.xlsx` | **High** |
| `recycling_rate` | `SAMNG` | Same workbook, `%` row on sheet `คำนวณ%` | **High** |
| `ghg` | `SAMNG` | Office-wide TGO summary `สรุปการคำนวณ ปี 2568` in `1.6_GreenhouseGas.xlsx` | **High** |

### Department codes (seed)

| Code | name_th (workbook label) | Source |
|------|--------------------------|--------|
| `IQS` | IQS | `1.3_Gassolene.xlsx` sheet name |
| `SRCH` | สำนักวิจัย | `1.3_Gassolene.xlsx` sheet name |
| `SAMNG` | สำนักงาน | `1.4_Paper.xlsx` sheet `แต่ละหน่วยงาน` row label |

`DEV-*` departments remain for local development. Public dashboard still publishes fixed `OFFICE` label (migration 008).

**Not assigned:** reviewer profile UUIDs (no approved auth accounts in repo).

---

## Waste mass (2568)

**Source:** `docs/1.5_Waste.xlsx` → sheet `คำนวณ%` → row `รวมขยะทั้งหมด` (kg)

| Month | kg |
|-------|-----|
| Jan–Dec | 468.1, 418.2, 516.3, 463.4, 562.7, 538.4, 462.0, 464.1, 440.9, 458.9, 415.3, 417.4 |
| **Annual sum** | **5,625.7 kg** |

Unit validated against column header: `ปริมาณ (ระบุหน่วยเป็น ก.ก. หรือ ลิตร ) ปี 2568`.

Static output: `src/data/generated/waste.json` (2568 verified). `recycling_rate.json` unchanged.

---

## GHG calculation (2568)

**Source workbook:** `docs/1.6_GreenhouseGas.xlsx` (local copy; git history references `1.5_GreenhouseGas.xlsx` — same TGO calculator layout)

**Methodology:** TGO AR5 Carbon Footprint Calculator (`EF TGO AR5` sheet; note references TGO review 8 Feb 2568)

**Monthly total row:** `GHG ปี 2568 (kgCO2e)` (row 67, cols 3–14)

| Component (sheet) | EF / basis |
|-------------------|------------|
| การใช้พลังงานไฟฟ้า | Grid mix EF from TGO |
| การใช้กระดาษ A4 และ A3 | Paper EF |
| ขยะของเสีย (ฝังกลบ) | **2.32 kg CO2e/kg** × waste kg |
| CH4 Septic tank | Sheet `CH4จาก Septic tank 2568` |
| CH4 Wastewater | Sheet `CH4จากบ่อบำบัดไม่เติมอากาศ 2568` |
| ขยะของเสีย (เผากำจัดโดยใช้น้ำมันดีเซล) | Zero in 2568 |

**2568 annual total:** 231,620.30 kgCO2e = **231.62 tCO2e** (matches `ghg.json` baseline)

### Formula activation status: **INACTIVE**

`metric_formulas.tgo_baseline_v1` remains `is_active = false`.

| Blocker | Detail |
|---------|--------|
| No runtime engine | MVP has no server-side formula evaluator; static `ghg.json` holds verified output |
| Cross-metric linkage | Automated pipeline does not yet feed live activity rows into GHG derivation |
| PO sign-off | Production EF version and ownership require authorized approval before activation |
| Live mode | `PUBLIC_DASHBOARD_DATA_MODE` remains `static` |

---

## GO-BE-2D prerequisites

1. Assign reviewer UUIDs per metric (`workflow.metric_reviewer_map`)
2. PO confirm `SAMNG` as owner for office-wide metrics (or override per metric)
3. Import 2569 waste mass when source data available
4. Activate GHG formula after runtime derivation approved
5. Optional: commit source XLSX to git for reproducible `CONFIRMED_XLSX` classification
