# GOFFICE2026 Resource-Indicator Mapping

**Version:** 1.0.0
**Date:** 2026-07-15
**Reference:** `src/data/resource-indicator-map.json`

---

## 1. Overview

This document explains the mapping between the **6 resource monitoring domains** in the Green Office 2026 dashboard platform and the **Green Office certification indicators** defined in the canonical taxonomy.

The mapping enables a complete **dashboard → indicator → evidence** traceability chain, connecting operational monitoring data to the formal Green Office assessment criteria.

---

## 2. Mapping Summary

| # | Resource Domain | Dashboard ID | Unit | Primary Category | Mapped Indicators |
|---|----------------|-------------|------|-----------------|-------------------|
| 1 | Water Consumption | `water` | m³ | cat1 — การจัดการสิ่งแวดล้อมในสำนักงาน | 3.2.1 |
| 2 | Electricity Consumption | `energy` | kWh | cat1 — การจัดการสิ่งแวดล้อมในสำนักงาน | 3.2.2 |
| 3 | Fuel Consumption | `fuel` | L | cat1 — การจัดการสิ่งแวดล้อมในสำนักงาน | 3.2.4, 3.2.5 |
| 4 | Paper Consumption | `paper` | kg | cat1 — การจัดการสิ่งแวดล้อมในสำนักงาน | 3.3.4 |
| 5 | Waste Management | `waste` | % (recycling) | cat3 — การจัดการของเสีย | 4.1.1, 4.1.2 |
| 6 | GHG Emissions | `ghg` | tCO₂e | cat1 — การจัดการสิ่งแวดล้อมในสำนักงาน | 1.5.1, 1.6.1 |

**Total:** 6 resource domains mapped to 9 indicators across 2 certification categories.

---

## 3. Detailed Mappings

### 3.1 Water → 3.2.1 (ปริมาณการใช้น้ำ)

- **Indicator 3.2.1** directly measures water consumption volume in cubic meters (m³)
- The `water` dashboard tracks monthly water usage extracted from `docs/1.1-Water.xlsx`
- Evidence files support this indicator with water meter records and conservation plans

### 3.2 Energy → 3.2.2 (ปริมาณการใช้ไฟฟ้า)

- **Indicator 3.2.2** directly measures electricity consumption in kWh
- The `energy` dashboard tracks monthly electricity usage from `docs/1.2-elect.xlsx`
- Supporting evidence includes energy audit reports and LED retrofit project documentation

### 3.3 Fuel → 3.2.4 (ปริมาณการใช้น้ำมันเชื้อเพลิง) + 3.2.5 (มาตรการลดการใช้น้ำมันเชื้อเพลิง)

- **Indicator 3.2.4** measures fuel consumption in liters (direct measurement)
- **Indicator 3.2.5** evaluates fuel reduction measures (policy/measurement indicator)
- The `fuel` dashboard tracks fleet fuel usage from `docs/1.3_Gassolene.xlsx`
- Evidence includes transport policy documents, commute surveys, and fleet records

### 3.4 Paper → 3.3.4 (ปริมาณการใช้กระดาษ)

- **Indicator 3.3.4** directly measures paper consumption in kg
- The `paper` dashboard tracks monthly usage from `docs/1.4_Paper.xlsx`
- Reduction initiatives are tracked through procurement and digital transformation records

### 3.5 Waste → 4.1.1 (การคัดแยกขยะ) + 4.1.2 (การนำขยะกลับมาใช้ใหม่)

- **Indicator 4.1.1** evaluates waste segregation practices
- **Indicator 4.1.2** evaluates recycling and reuse efforts
- The `waste` dashboard tracks recycling rates (%) from `docs/1.5_Waste.xlsx`
- Evidence includes waste audit reports, monthly segregation records, and recycling documentation

### 3.6 GHG → 1.5.1 (ปริมาณก๊าซเรือนกระจก) + 1.6.1 (การตรวจวัดก๊าซเรือนกระจก)

- **Indicator 1.5.1** measures total GHG emissions in tCO₂e
- **Indicator 1.6.1** evaluates GHG monitoring methodology
- The `ghg` dashboard tracks emissions calculated from energy/fuel data using emission factors
- Evidence includes GHG inventory reports, emission factor documentation, and reduction plans

---

## 4. Dashboard → Indicator → Evidence Chain

The full traceability chain for each resource domain:

```
Resource Monitoring (Dashboard)
    → Resource Data (src/data/generated/{metric}.json)
        → Certification Indicator ({code})
            → Evidence Files (src/pages/evidence/ev-*)
```

**Example (Energy):**

1. **Dashboard:** `src/pages/dashboard/energy/` — interactive energy monitoring
2. **Data:** `src/data/generated/energy.json` — 2568 baseline + ongoing 2569 entry
3. **Indicator:** `3.2.2` — ปริมาณการใช้ไฟฟ้า (certification assessment point)
4. **Evidence:**
   - `ev-energy-audit-2025` — energy audit report
   - `ev-energy-led-project` — LED retrofit project documentation
   - `ev-energy-metering-2025` — metering records

---

## 5. Category Alignment

| Category | Code | Label | Mapped Resources |
|----------|------|-------|-----------------|
| การจัดการสิ่งแวดล้อมในสำนักงาน | cat1 | Environmental Management | Water, Energy, Fuel, Paper, GHG |
| การจัดการของเสีย | cat3 | Waste Management | Waste |

Categories cat2, cat4, cat5, cat6, cat7 are not directly linked to resource monitoring dashboards but connect through evidence and indicator relationships.

---

## 6. Governance

- This mapping is **frozen** as of 2026-07-15 alongside the 2568 baseline
- Changes require an explicit governance process documented in `GOFFICE2026_BASELINE_FREEZE.md`
- The canonical taxonomy (`categories.json`, `indicators.json`, `issues.json`) remains the authoritative source for indicator definitions
- This mapping document is a **supplement** — it does not modify the canonical taxonomy

---

*Document version: 1.0.0 — aligned with baseline freeze v1.0.0.*

## 7. Related Documents

- `docs/foundation/GOFFICE2026_BASELINE_FREEZE.md` — baseline freeze declaration
- `src/data/resource-indicator-map.json` — machine-readable mapping
- `src/data/criteria/indicators.json` — canonical indicator definitions
- `src/data/dashboard-config.ts` — dashboard configuration
- `docs/foundation/GOFFICE2026_FINAL_PLATFORM_BASELINE.md` — platform baseline report
