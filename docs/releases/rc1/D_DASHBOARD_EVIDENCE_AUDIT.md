# RC-1 Gate Audit — Subagent D: Dashboard / Evidence

**Date:** 2026-07-27  
**Branch:** `rapid/rc-dashboard` (`master@61b5fa9`)  
**Auditor:** Subagent D (Dashboard/Evidence RC Audit)  
**Scope:** Generated metrics JSON, reconciliation status, publication copy, evidence traceability, dashboard truthfulness, SharePoint metadata readiness  
**Type:** Audit only — no application changes

---

## Executive Verdict

> **FAIL**

RC-1 dashboard data posture is correct: FY2569 is uniformly pending with zero invented current-year values, FY2568 baselines are preserved and aligned, and `node scripts/validate-evidence.mjs` exits 0. Two evidence records falsely assert on-disk source availability, which breaks traceability truthfulness and blocks RC-1.

---

## Blocking Issues

| ID | Severity | Finding |
|---|---|---|
| **D-B1** | **BLOCKER** | `ev-energy-metering-2025` has `realSourceAvailable: true` but `docs/1.2-elect.xlsx` is **not on disk**. |
| **D-B2** | **BLOCKER** | `ev-waste-monthly-2025` has `realSourceAvailable: true` but `docs/1.5_Waste.xlsx` is **not on disk**. |

---

## Non-Blocking Observations

| ID | Severity | Finding |
|---|---|---|
| D-N1 | Info | 5/6 operational workbooks off-disk; `reconciliation-status.json` correctly reports `xlsxOnDisk: 1` (water only). |
| D-N2 | Info | 4 evidence items correctly flag `realSourceAvailable: false` (fleet, GHG inventory, GHG EF, waste recycling). |
| D-N3 | Info | `doc-paper-usage-2025` documented as registry orphan (`registryLinkStatus: orphan`, review-022); no erroneous evidence link. |
| D-N4 | Info | 0/24 evidence records at `verification.status: verified`; 10 pending, 14 unresolved — expected pre-PO signoff. |
| D-N5 | Info | All 10 `available` evidence items have `sharePointUrlPending: true` and `sharePointUrl: null` — metadata contract ready, URLs not yet assigned. |
| D-N6 | Info | 14 evidence placeholders remain; dashboard and KPI copy consistently show waiting state. |

---

## 1. Generated Metrics JSON (`src/data/generated/*.json`)

**Files audited:** `energy.json`, `water.json`, `fuel.json`, `paper.json`, `waste.json`, `recycling_rate.json`, `ghg.json`, `kpi-summary.json`, `data-quality.json`

| Check | Result |
|---|---|
| FY2569 `dataStatus` | All 7 metrics: `CURRENT_DATA_PENDING` |
| FY2569 month arrays | All empty (`months: []`) |
| FY2569 totals | All `0` — no invented consumption values |
| FY2569 classification | All `PLACEHOLDER` |
| FY2569 warnings | All: `"Waiting for Official FY2569 Data"` |
| FY2568 baseline | All 7 metrics: 12 months, `VERIFIED_BASELINE`, `quality.valid: true` |
| Target values | All `targetValue: null`, `targetStatus: no-target` / `TARGET_PENDING_APPROVAL` |
| YoY for 2569 | All `0% stable` (no false trend claims) |

**Verdict:** PASS — no invented FY2569 operational data.

---

## 2. Reconciliation Status (`data/reconciliation-status.json`)

| Field | Value |
|---|---|
| `baselineVerified` | 7/7 |
| `currentYearVerified` | 0/7 |
| `currentYearPending` | 7/7 |
| `dataClassification` (all current) | `PLACEHOLDER` |
| Baseline totals | Match `kpi-summary.json` baseline values (cross-checked programmatically) |

**Verdict:** PASS — reconciliation state matches generated JSON.

---

## 3. Publication States (`src/utils/publication-states.ts`)

Exports consistent bilingual copy:

- `WAITING_FY2569` — EN/TH waiting labels
- `NO_PUBLISHED_EVIDENCE`, `PENDING_OFFICIAL_PUBLICATION`, `HISTORICAL_INFORMATION`
- `pubLabel()` helper for locale resolution

Used by `DataStatusBadge.astro`, `DataEvidencePanel.astro`, `data-status.ts`, and `MetricDashboard.astro`.

**Verdict:** PASS — no internal schema terms exposed; copy aligned with pipeline enums.

---

## 4. Evidence Index & Document Registry

### 4.1 Counts

| Metric | Count |
|---|---|
| Total evidence records | **24** |
| `status: available` | 10 |
| `status: placeholder` | **14** |
| `traceabilityLevel: indicator` | 10 |
| `traceabilityLevel: category` | 14 |
| `verification: pending` | 10 |
| `verification: unresolved` | 14 |
| `sharePointUrlPending: true` | 10 (all available items) |

### 4.2 Structural Validation

```
node scripts/validate-evidence.mjs
RESULT: PASS ✓ (exit code 0)
```

- 0 duplicate IDs, 0 unmapped records, 0 hierarchy violations
- All indicator codes resolve to canonical taxonomy

### 4.3 Indicator Mapping (10 indicator-level records)

| Evidence ID | Indicator | Source Workbook |
|---|---|---|
| `ev-energy-metering-2025` | 3.2.2 | `docs/1.2-elect.xlsx` ⚠️ flag mismatch |
| `ev-water-meter-q1` | 3.1.2 | `docs/1.1-Water.xlsx` ✓ |
| `ev-waste-recycling-2025` | 4.1.3 | `docs/1.5_Waste.xlsx` (off-disk, flagged false) |
| `ev-waste-monthly-2025` | 4.1.2 | `docs/1.5_Waste.xlsx` ⚠️ flag mismatch |
| `ev-ghg-inventory-2025` | 1.5.1 | `docs/1.6_GreenhouseGas.xlsx` (off-disk) |
| `ev-ghg-emission-factors` | 1.5.1 | `docs/1.6_GreenhouseGas.xlsx` (off-disk) |
| `ev-transport-fleet-2025` | 3.2.5 | `docs/1.3_Gassolene.xlsx` (off-disk) |
| `ev-about-policy-signed` | 1.2.1 | `doc/GreenOfficePolicy2026.pdf` ✓ |
| `ev-about-goals-2568` | 1.3.1 | `doc/Green Office Goals.pdf` ✓ |
| `ev-about-committee-order` | 1.4.1 | `doc/Order_appointing_the_committee.pdf` ✓ |

### 4.4 Orphan: `doc-paper-usage-2025`

Document registry entry:

- `evidenceId: null`, `registryLinkStatus: orphan`
- `orphanReason` documented: indicator 1.4.1 covered by committee PDF, not paper workbook
- `reviewQueueId: review-022`, `poDecisionRequired: true`
- Cross-ref: `docs/evidence/WS-B_PAPER_USAGE_ORPHAN_QA.md`

**Verdict:** Orphan correctly documented — not a structural defect.

### 4.5 Source Availability Cross-Check

On-disk workbooks at audit time:

| Path | On Disk |
|---|---|
| `docs/1.1-Water.xlsx` | Yes |
| `docs/1.2-elect.xlsx` | **No** |
| `docs/1.3_Gassolene.xlsx` | No |
| `docs/1.4_Paper.xlsx` | No |
| `docs/1.5_Waste.xlsx` | **No** |
| `docs/1.6_GreenhouseGas.xlsx` | No |

**Verdict:** FAIL — 2 `realSourceAvailable` flags contradict filesystem state (D-B1, D-B2).

---

## 5. Dashboard Component Truthfulness

| Component | FY2569 Behavior | Result |
|---|---|---|
| `MetricDashboard.astro` | Shows "None" / waiting label when `!currentVerified`; suppresses YoY | PASS |
| `DataStatusBadge.astro` | Pending badge uses FY2569 waiting copy | PASS |
| `DataEvidencePanel.astro` | `PLACEHOLDER` classification → waiting copy | PASS |
| `data-status.ts` | `resolveDisplayStatus`: 0 months + `CURRENT_DATA_PENDING` → `pending`; `shouldShowYoy` returns false | PASS |
| `dashboard-executive.ts` | 0 coverage → "No current-year data"; PLACEHOLDER caps confidence at Medium; no High for unverified | PASS |
| `ExecutiveSummary.astro` | Delegates to deterministic confidence/insight engine | PASS |

Dashboard UI does not present FY2569 zeros as verified operational data.

**Verdict:** PASS for dashboard metrics display; FAIL for evidence source-availability metadata (D-B1, D-B2).

---

## 6. FY2568 Baseline Preservation

| Metric | Baseline (2568) | Reconciliation | kpi-summary | Match |
|---|---|---|---|---|
| energy | 403,036.8 kWh | ✓ | ✓ | ✓ |
| water | 8,337.5 m³ | ✓ | ✓ | ✓ |
| fuel | 339.83 L | ✓ | ✓ | ✓ |
| paper | 2,197.8 kg | ✓ | ✓ | ✓ |
| waste | 5,625.7 kg | ✓ | ✓ | ✓ |
| recycling_rate | 21.57% | ✓ | ✓ | ✓ |
| ghg | 231.6 tCO₂e | ✓ | ✓ | ✓ |

All baselines retain 12-month monthly arrays with `CONFIRMED_XLSX` or equivalent provenance.

**Verdict:** PASS.

---

## 7. SharePoint Metadata Readiness

All 10 `available` evidence items include:

```json
"publicationMode": "internal-metadata-only" | "public-metadata-pending-copy",
"sharePointUrl": null,
"sharePointUrlPending": true
```

Contract aligns with `docs/evidence/SHAREPOINT_METADATA_LINK_CONTRACT.md`.

**Verdict:** PASS — flags present; URL population deferred (expected).

---

## 8. Validation Script Output

```
=== EVIDENCE VALIDATION REPORT ===
Total records: 24
Traceability: indicator 10 | category 14 | unmapped 0
Verification: pending 10 | unresolved 14 | verified 0
Source Types: MD 4 | PDF 12 | XLSX 8
RESULT: PASS ✓ (exit code 0)
```

**Verdict:** PASS (structural only — does not validate filesystem or SharePoint URLs).

---

## Remediation Required Before RC-1 Pass

1. **D-B1:** Set `ev-energy-metering-2025.realSourceAvailable` to `false` (or restore `docs/1.2-elect.xlsx` to disk and re-validate SHA256).
2. **D-B2:** Set `ev-waste-monthly-2025.realSourceAvailable` to `false` (or restore `docs/1.5_Waste.xlsx` to disk and re-validate SHA256).

---

## Summary Table

| Audit Area | Verdict |
|---|---|
| FY2569 waiting state (generated JSON) | PASS |
| No invented FY2569 values | PASS |
| `reconciliation-status.json` | PASS |
| `publication-states.ts` | PASS |
| Evidence structural validation | PASS |
| Evidence source availability truthfulness | **FAIL** |
| `doc-paper-usage-2025` orphan handling | PASS |
| Dashboard metric truthfulness | PASS |
| FY2568 baseline preservation | PASS |
| SharePoint metadata flags | PASS |
| **Overall RC-1 Gate (Subagent D)** | **FAIL** |

---

*Audit completed 2026-07-27. No application files modified.*
