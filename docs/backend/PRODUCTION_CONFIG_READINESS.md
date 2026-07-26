# Production Configuration Readiness (GO-BE-2C / GO-BE-2D)

**Date:** 2026-07-26  
**Status:** **SIGNOFF_PENDING** — data and config prepared; PO owner confirmation and reviewer UUIDs outstanding  
**Live mode:** `static` only — no Supabase cloud project

---

## GO-BE-2D status

| Deliverable | Location | State |
|-------------|----------|-------|
| PO owner approval matrix | [PO_SIGNOFF_CHECKLIST.md](./PO_SIGNOFF_CHECKLIST.md) | 4 APPROVED / 3 NEEDS_CONFIRMATION |
| Reviewer assignment procedure | [REVIEWER_ASSIGNMENT_RUNBOOK.md](./REVIEWER_ASSIGNMENT_RUNBOOK.md) | Template ready; UUIDs null |
| GHG formula | `metric_formulas.tgo_baseline_v1` | **INACTIVE** (unchanged) |

---

## Owner department mappings

Evidenced organizational units appear in source workbooks. See [PO Sign-off Checklist](./PO_SIGNOFF_CHECKLIST.md) for PO status per metric.

| Metric | Owner code | Workbook evidence | PO status |
|--------|------------|-------------------|-----------|
| `energy` | `SAMNG` | Office-wide `2568` in `12-elect.xlsx` | NEEDS_CONFIRMATION |
| `water` | `SAMNG` | Office-wide `2568` in `1.1-Water.xlsx` | NEEDS_CONFIRMATION |
| `fuel` | `IQS` | `IQS` sheet in `1.3_Gassolene.xlsx` | **APPROVED** |
| `paper` | `SAMNG` | `สำนักงาน` row / `2568` in `1.4_Paper.xlsx` | NEEDS_CONFIRMATION |
| `waste` | `SAMNG` | Form 4.1(1) `1.5_Waste.xlsx` | **APPROVED** |
| `recycling_rate` | `SAMNG` | `%` row `1.5_Waste.xlsx` | **APPROVED** |
| `ghg` | `SAMNG` | TGO summary `1.6_GreenhouseGas.xlsx` | **APPROVED** |

### Department codes (seed)

| Code | name_th | Source |
|------|---------|--------|
| `IQS` | IQS | `1.3_Gassolene.xlsx` |
| `SRCH` | สำนักวิจัย | `1.3_Gassolene.xlsx` |
| `SAMNG` | สำนักงาน | `1.4_Paper.xlsx` |

`DEV-*` departments remain for local development. Public views publish fixed `OFFICE` label.

---

## Waste mass (2568)

**Source:** `1.5_Waste.xlsx` → `คำนวณ%` → `รวมขยะทั้งหมด` (kg)

| Month | kg |
|-------|-----|
| Jan–Dec | 468.1 … 417.4 |
| **Annual sum** | **5,625.7 kg** |

Static: `src/data/generated/waste.json` (2568 verified). `recycling_rate.json` unchanged.

---

## GHG calculation (2568)

**Source:** `1.6_GreenhouseGas.xlsx` — TGO AR5 calculator  
**Annual total:** 231,620.30 kgCO2e = **231.62 tCO2e**

Formula `tgo_baseline_v1`: **INACTIVE** — documented in seed; activation is a separate PO decision (GO-BE-3+).

---

## Next gate (GO-BE-3)

1. PO completes [PO Sign-off Checklist](./PO_SIGNOFF_CHECKLIST.md) (resolve 3 NEEDS_CONFIRMATION rows)
2. PO assigns reviewer UUIDs per [Reviewer Assignment Runbook](./REVIEWER_ASSIGNMENT_RUNBOOK.md)
3. Local/Dev Supabase: `supabase start` + `supabase db reset`
4. Optional: 2569 waste mass import, source XLSX commit policy
