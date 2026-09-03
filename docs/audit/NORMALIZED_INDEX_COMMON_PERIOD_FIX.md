# Normalized Index — Common Period Fix (PR #88)

**Common period:** Jan–Jul FY2569 vs Jan–Jul FY2568 (7 months) — intersection across all six dashboard resources.

**Formula:** `(FY2569 Jan–Jul sum ÷ FY2568 Jan–Jul sum) × 100` — never partial FY2569 total vs full-year FY2568 total.

## Before → after index table

| Resource | Before (wrong: partial ÷ full-year) | After (Jan–Jul common period) |
|----------|-------------------------------------|----------------------------------|
| Energy | 75 | **113** |
| Water | 74 | **123** |
| Fuel | 117 | **117** (unchanged — same 7 months both sides; `available_unverified`) |
| Paper | 56 | **97** |
| Waste | 69 | **114** |
| GHG | 65 | **112** |

Energy and water Aug FY2569 data are excluded from the normalized index because fuel/paper/waste/ghg stop at Jul.

## Fuel note

Fuel index **117** is mathematically consistent with published JSON but **not verified**. See `docs/audit/FY2569_FUEL_SOURCE_RECONCILIATION.md` — `FUEL_SOURCE_RECONCILIATION_REQUIRED — values unchanged`.
