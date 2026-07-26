# Production Configuration Readiness (GO-BE-2C / GO-BE-2D / GO-GATE-1)

**Date:** 2026-07-26
**Status:** **`PO_OWNER_SIGNOFF_COMPLETE`**
**Live mode:** `static` during Cloud Dev (PO approved)
**Gate:** [PO Sign-off Checklist](./PO_SIGNOFF_CHECKLIST.md)

---

## GO-GATE-1 readiness (GO-BE-5 prerequisite)

| Input | State |
|-------|-------|
| Technical audit (GO-QA-1) | **READY_WITH_CONDITIONS** — [Production Readiness Audit](./PRODUCTION_READINESS_AUDIT.md) |
| Backend V1 freeze | **FROZEN** — [BACKEND_V1_FREEZE.md](./BACKEND_V1_FREEZE.md) |
| Owner mapping (7 metrics) | **PO_OWNER_SIGNOFF_COMPLETE** — all APPROVED |
| Workflow policy | **Approved** — one reviewer/metric; multi-metric same person YES |
| Reviewer identities | **Name/email recorded** — UUID pending Cloud Auth |
| Cloud Dev activation | **Unblocked** for provisioning (GO-BE-5) |

---

## PO-approved owner department mappings

Authorized approver: **Prinya Painussa** · Approval date: **2026-07-26**

| Metric | Owner (PO) | Code | PO status |
|--------|------------|------|-----------|
| `energy` | IQS | `IQS` | **APPROVED** |
| `water` | IQS | `IQS` | **APPROVED** |
| `fuel` | IQS | `IQS` | **APPROVED** |
| `paper` | สำนักวิจัยฯ | `SRCH` | **APPROVED** |
| `waste` | สำนักวิจัยฯ | `SRCH` | **APPROVED** |
| `recycling_rate` | สำนักวิจัยฯ | `SRCH` | **APPROVED** |
| `ghg` | สำนักวิจัยฯ | `SRCH` | **APPROVED** |

`seed.sql` still holds pre-signoff workbook defaults until GO-BE-5 config apply.

### Department codes (reference)

| Code | name_th | PO-assigned metrics |
|------|---------|---------------------|
| `IQS` | IQS | energy, water, fuel |
| `SRCH` | สำนักวิจัย | paper, waste, recycling_rate, ghg |

---

## Workflow configuration (PO approved)

| Policy | Value |
|--------|-------|
| Reviewers per metric | One |
| Same person, multiple metrics | **YES** (Prinya Painussa — all 7) |
| Correction method | Archive + replacement |
| GHG formula | Inactive during Cloud Dev |
| Dashboard mode | Static |

---

## Reviewer assignment (PO recorded)

| Field | Value |
|-------|-------|
| Name | Prinya Painussa |
| Email | raemju@gmail.com |
| Metrics | energy, water, fuel, paper, waste, recycling_rate, ghg |
| Profile UUID | _TODO — after Cloud Auth_ |

---

## Deliverable status

| Deliverable | Location | State |
|-------------|----------|-------|
| PO owner approval | [PO_SIGNOFF_CHECKLIST.md](./PO_SIGNOFF_CHECKLIST.md) | **7/7 APPROVED** |
| Reviewer procedure | [REVIEWER_ASSIGNMENT_RUNBOOK.md](./REVIEWER_ASSIGNMENT_RUNBOOK.md) | Name/email set; UUID pending |
| GHG formula | `metric_formulas.tgo_baseline_v1` | **INACTIVE** (PO confirmed) |

---

## Waste mass (2568)

**Source:** `1.5_Waste.xlsx` → `คำนวณ%` → `รวมขยะทั้งหมด` (kg) · **Annual sum:** **5,625.7 kg**

Static: `src/data/generated/waste.json` (2568 verified).

---

## GHG calculation (2568)

**Source:** `1.6_GreenhouseGas.xlsx` — TGO AR5 · **231.62 tCO2e**

Formula `tgo_baseline_v1`: **INACTIVE** (PO confirmed for Cloud Dev).

---

## GO-BE-5 (Cloud Dev provisioning)

**Status:** **COMPLETE** (2026-07-26) — see [Cloud Dev Provisioning](./CLOUD_DEV_PROVISIONING.md)

| Step | Status |
|------|--------|
| Link project `aryshyzolpdxxvmyhedx` | **Done** |
| Apply migrations `001–011` | **Done** |
| Schema + RLS verification | **Done** |
| Free Plan / zero-cost | **Confirmed** |

## Next gate (GO-BE-6)

1. Create Auth + profile for `raemju@gmail.com`; record UUID securely
2. Apply PO owner map + reviewer map to cloud (config commit)
3. Smoke-test admin against Cloud Dev; keep `PUBLIC_DASHBOARD_DATA_MODE=static`
