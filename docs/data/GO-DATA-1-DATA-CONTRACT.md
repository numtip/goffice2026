# GO-DATA-1: Canonical Data Contract

**Date:** 2026-07-23 (updated 2026-07-24 — GO-DATA-1A corrective sprint)  
**Status:** CORRECTED — see `docs/releases/GOFFICE2026_GO-DATA-1A_REPORT.md`

---

## 1. Schema

The canonical environmental metric schema is defined in `src/utils/multi-year-schema.ts` as the `MultiYearMetric` interface.

### Top-Level Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `metric` | `string` | ✅ | Unique key: `energy`, `water`, `fuel`, `paper`, `waste`, `ghg` |
| `label` | `string` | ✅ | English display name |
| `labelTh` | `string` | ✅ | Thai display name |
| `unit` | `string` | ✅ | Display unit: `kWh`, `m³`, `L`, `kg`, `%`, `tCO₂e` |
| `kpiField` | `string` | ✅ | Data field used for KPI display |
| `status` | `DataStatus` | ✅ | Overall pipeline status |
| `baselineYear` | `number` | ✅ | Always `2568` |
| `currentYear` | `number` | ✅ | Always `2569` |
| `years` | `Record<string, YearData>` | ✅ | Year-keyed data objects |
| `target` | `Target \| undefined` | | Target definition |
| `targetStatus` | `MetricTargetStatus` | ✅ | `on-track`, `off-track`, `no-target`, `insufficient-data` |
| `yoyChange` | `YoyChange` | ✅ | Pre-computed year-over-year |
| `relatedIndicators` | `IndicatorMapping[]` | ✅ | Criteria indicator references |
| `sourceEvidence` | `string[]` | ✅ | Evidence document references |

### YearData

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `year` | `number` | ✅ | Buddhist year |
| `isBaseline` | `boolean` | ✅ | `true` for 2568 |
| `months` | `MonthlyValue[]` | ✅ | 1–12 monthly values |
| `total` | `number` | ✅ | Sum of monthly values |
| `average` | `number` | ✅ | Average monthly value |
| `dataStatus` | `DataStatus` | ✅ | Pipeline state |
| `source` | `string` | ✅ | Source workbook reference |
| `aggregation` | `'sum' \| 'average'` | | How `total` is derived from `months`. **Required to be `'average'` for `%`-unit metrics** (GO-DATA-1A) — summing percentage rates is invalid. |
| `quality` | `DataQuality \| undefined` | ✅ | Validation and reconciliation info |
| `dataClassification` | `DataClassification` | | Explicit provenance tier (GO-DATA-1A) — see below. Replaces fragile string-matching on the word "placeholder". |
| `updated` | `string` | ✅ | Date of last update (ISO date only, no time) |

### DataClassification (added in GO-DATA-1A)

| Value | Meaning |
|-------|---------|
| `CONFIRMED_XLSX` | Verified directly against a source XLSX confirmed present in git history (water, energy, GHG 2568 baselines) |
| `DERIVED_FROM_CSV` | Imported from CSV only, no XLSX available for reconciliation — unverified (energy, water 2569) |
| `PRESERVED_LEGACY` | Carried over from an earlier extraction; source XLSX was never committed to git and cannot be re-verified (fuel, paper, waste 2568 baselines) |
| `PLACEHOLDER` | Known placeholder/demo values, not real measurements (fuel, paper, waste, GHG 2569) |
| `MANUAL_ENTRY` | Entered directly by staff, not derived from a workbook |
| `UNKNOWN` | Origin cannot be determined |

### DataQuality

| Field | Type | Description |
|-------|------|-------------|
| `valid` | `boolean` | Passes all validation checks |
| `warnings` | `string[]` | Non-blocking issues |
| `reconciliationDifference` | `number \| null` | Calculated total minus workbook total |

### Target

| Field | Type | Description |
|-------|------|-------------|
| `year` | `number` | Target year (2569) |
| `targetValue` | `number \| null` | `null` until staff-approved |
| `targetType` | `string` | `reduction`, `increase`, `stable`, `compliance` |
| `status` | `DataStatus` | `TARGET_PENDING_APPROVAL` initially |

---

## 2. Metric Types

| Metric ID | Unit | Source Workbook | Criteria | KPI Field | Aggregation |
|-----------|------|----------------|----------|-----------|-------------|
| `energy` | kWh | 12-elect.xlsx | 3.2.2 | `kwh` | sum |
| `water` | m³ | 1.1-Water.xlsx | 3.1.2 | `cubic_meters` | sum |
| `fuel` | L | 1.3_Gassolene.xlsx | 3.2.5 | `liters` | sum |
| `paper` | kg | 1.4_Paper.xlsx | 3.3.2 | `kg_estimated` | sum |
| `waste` | % | 1.5_Waste.xlsx | 4.1 (detailed sub-mapping pending) | `recycle_pct` | **average** (GO-DATA-1A correction — summing % rates is invalid) |
| `ghg` | tCO₂e | 1.5_GreenhouseGas.xlsx | 1.5.1 / 1.5.2 | `total_tco2e` | sum |

---

## 3. Normalization Rules

- **Months:** 1–12 integer, sorted ascending.
- **Values:** Positive numbers or zero. `null` for truly missing data.
- **Units:** Explicit per metric. Never ambiguous.
- **Years:** Buddhist calendar (2568, 2569). CE = BE − 543.
- **Totals:** Derived from monthly sum, not independent.
- **Target:** `null` unless staff-approved. Never fabricated.

---

## 4. Reconciliation Tolerance

| Unit | Tolerance (±) |
|------|--------------|
| kWh | 5 |
| m³ | 0.5 |
| L | 0.5 |
| kg | 0.5 |
| % | 0.5 |
| tCO₂e | 0.5 |
