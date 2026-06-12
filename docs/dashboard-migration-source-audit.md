# Dashboard Migration Source Audit

**Date:** 2026-06-12
**Author:** Cursor Agent
**Source URLs:**
- https://goffice.mju.ac.th/ (Home)
- https://goffice.mju.ac.th/green-office-7cat-2568 (7 Categories Overview)
- https://goffice.mju.ac.th/images/data/executive/unified-executive-dashboard.html (Executive Dashboard)

---

## 1. Source URL Structure

### 1.1 Home Page (goffice.mju.ac.th)
- **Platform:** Joomla with Helix Ultimate framework
- **Content:** Green Office landing page, 7 Thai category headers, resource consumption summary, news feed, campaign media
- **Layout:** Category cards → Resource KPIs → News → Campaigns → Footer

### 1.2 7 Categories Page (/green-office-7cat-2568)
- **Platform:** Joomla article with embedded HTML widgets
- **Content:** 7 หมวดหมู่ / 24 ประเด็น / 65 ตัวชี้วัด — Category overview with resource change percentages
- **Dashboard area:** 6 resource cards with color-coded changes (🔴🟢🟡) and percentage values
- **Links:** Executive Dashboard, Documents/Evidence page, Feedback form

### 1.3 Executive Dashboard (unified-executive-dashboard.html)
- **Platform:** Standalone HTML page (not Joomla)
- **Content:** Green Score, 6 category KPI cards with trends, impact levels, detail links
- **Dashboard structure:**
  - Green Score (overall)
  - 6 KPI cards: น้ำ (Water), ไฟฟ้า (Electricity), น้ำมัน (Fuel), กระดาษ (Paper), ขยะ (Waste), ก๊าซเรือนกระจก (GHG)
  - Each card: label, value, trend indicator (↑↓→), impact level, "ดูรายละเอียด" link
  - Legend section explaining Green Score, KPI cards, Trend Indicator, Impact Level
  - Footer: "ระบบ Green Office Monitoring"

---

## 2. Extracted KPI Structure

### 2.1 Category-to-KPI Mapping

| Old Site Label (TH) | English | Category | Resource Metric | Old Site KPI | Notes |
|---------------------|---------|----------|----------------|--------------|-------|
 | การใช้น้ำ | Water Usage | cat1/Energy or cat2/Water | น้ำประปา (cubic meters) | +47.4% (🔴) | Real 2025 data: 66,700 units |
| การใช้ไฟฟ้า | Electricity Usage | cat1 (Energy) | ไฟฟ้า (kWh) | +4.65% (🟡) | Real 2025 data: 218,459 units |
| การใช้น้ำมัน | Fuel Usage | — (no cat) | น้ำมันเชื้อเพลิง (liters) | -22.7% (🟢) | Real 2025 data: 22,928 liters |
| การใช้กระดาษ | Paper Usage | — (no cat) | กระดาษ (kg) | +16.8% (🟡) | Real 2025 data: 2,197 kg |
| การจัดการขยะ | Waste Management | cat3 (Waste) | ขยะทั่วไป (kg) | 21.7% (🟢) | Real 2025 data: 4,381 kg |
| ก๊าซเรือนกระจก | GHG Emissions | cat4 (GHG) | tCO2e | +4.81% (🟡) | Real 2025 data: 241.22 tCO2e |

### 2.2 Executive Dashboard Card Fields
- Label (Thai)
- Value (numeric with unit)
- Trend (↑เพิ่มขึ้น ↓ลดลง →ทรงตัว)
- Impact Level (via colored dot: 🔴🟡🟢)
- Detail link ("ดูรายละเอียด")

### 2.3 Resource Consumption Values (2025 Real Data)
| Resource | Value | Unit |
|----------|-------|------|
| Water (น้ำประปา) | 66,700.00 | cubic meters |
| Electricity (ไฟฟ้า) | 218,459.46 | kWh |
| Fuel (น้ำมันเชื้อเพลิง) | 22,928.23 | liters |
| Paper (กระดาษ) | 2,197.80 | kg |
| General Waste (ขยะทั่วไป) | 4,381.00 | kg |
| GHG (ก๊าซเรือนกระจก) | 241.22 | tCO2e |

### 2.4 Resource Change Percentages (YoY)
| Resource | Change | Color | Direction |
|----------|--------|-------|-----------|
| Water | +47.4% | 🔴 | Up (bad) |
| Electricity | +4.65% | 🟡 | Up (warning) |
| Fuel | -22.7% | 🟢 | Down (good) |
| Paper | +16.8% | 🟡 | Up (warning) |
| Waste | 21.7% (recycling rate) | 🟢 | Good |
| GHG | +4.81% | 🟡 | Up (warning) |

---

## 3. Comparison: Old Site vs Current Astro dashboard-kpi.json

### 3.1 Category Alignment

| Old Site Category | Cat # | Astro dashboard-kpi.json | Match? |
|------------------|-------|--------------------------|--------|
| การใช้น้ำ (Water) | cat2 | Water Score 78% | ✅ Label mismatch |
| การใช้ไฟฟ้า (Electricity) | cat1 | Energy Score 85% | ✅ Partial (Energy includes electricity + fuel) |
| การใช้น้ำมัน (Fuel) | — | Not a separate KPI | ❌ Missing |
| การใช้กระดาษ (Paper) | — | Not a separate KPI | ❌ Missing |
| การจัดการขยะ (Waste) | cat3 | Waste Score 92% | ✅ |
| ก๊าซเรือนกระจก (GHG) | cat4 | Emissions Score 71% | ✅ Label mismatch |
| — | cat5 | Indoor Quality Score 88% | Extra (not in old executive dashboard) |
| — | cat6 | Transportation Score 74% | Extra (not in old executive dashboard) |
| — | cat7 | Innovation Score 80% | Extra (not in old executive dashboard) |

### 3.2 Key Differences

1. **Scope:** Old executive dashboard uses 6 resource-based categories. Astro uses 7 Green Office certification categories.
2. **Fuel:** Missing from Astro KPI schema entirely.
3. **Paper:** Missing from Astro KPI schema entirely.
4. **Labels:** Old site uses resource-action labels ("Water Usage", "Electricity Usage"); Astro uses certification labels ("Water Score", "Energy Score").
5. **Data sources:** Old site uses real-time MySQL/PHP backend; Astro uses static JSON/CSV.
6. **KPI format:** Old site shows YoY change percentages; Astro shows certification scores (0-100%).
7. **Architecture:** Old executive dashboard is a standalone HTML file with embedded JS; Astro is fully static.

---

## 4. Dashboard Structure References

### 4.1 Old Site Executive Dashboard Layout (Reference)
```
┌─────────────────────────────────────┐
│ Green Score (—)  Updated: —         │
├─────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐           │
│ │ Water    │ │Electricity│           │
│ │ +47.4% 🔴│ │ +4.65% 🟡│           │
│ │ ดูราย     │ │ ดูราย     │           │
│ └──────────┘ └──────────┘           │
│ ┌──────────┐ ┌──────────┐           │
│ │ Fuel     │ │  Paper   │           │
│ │ -22.7% 🟢│ │ +16.8% 🟡│           │
│ └──────────┘ └──────────┘           │
│ ┌──────────┐ ┌──────────┐           │
│ │ Waste    │ │   GHG    │           │
│ │ 21.7% 🟢 │ │ +4.81% 🟡│           │
│ └──────────┘ └──────────┘           │
├─────────────────────────────────────┤
│ Legend: Green Score / KPI / Trend   │
└─────────────────────────────────────┘
```

### 4.2 Old Site 7-Category Page Structure (Reference)
```
┌─────────────────────────────────────┐
│ 7 หมวดหมู่ · 24 ประเด็น · 65 ตัวชี้วัด  │
├─────────────────────────────────────┤
│ Dashboard cards with resource       │
│ change % and color indicators       │
├─────────────────────────────────────┤
│ Progress tracking (counts)          │
│ Data completeness: 0%               │
├─────────────────────────────────────┤
│ Links: Executive Dashboard          │
│ Documents/Evidence                  │
└─────────────────────────────────────┘
```

---

## 5. Terminology Mapping

| Old Site (Thai) | Old Site (English on page) | Recommended Astro Label |
|----------------|---------------------------|----------------------|
 | การใช้น้ำ | Water Usage | Water Consumption |
| การใช้ไฟฟ้า | Electricity Usage | Electricity Consumption |
| การใช้น้ำมัน | Fuel Usage | Fuel Consumption |
| การใช้กระดาษ | Paper Usage | Paper Consumption |
| การจัดการขยะ | Waste Management | Waste Management |
| ก๊าซเรือนกระจก | GHG Emissions | GHG Emissions |
| Green Score | Green Score | Green Score |

---

## 6. Data File References Found

| File Path on Old Server | Content | Status |
|------------------------|---------|--------|
| `/images/data/executive/unified-executive-dashboard.html` | Executive dashboard (standalone HTML) | Active |
| `/images/data/...` (other data files) | Presumed CSV/JSON data files | Not inspected |
| In-page article content | Static KPI values displayed via PHP/widgets | Active |

---

## 7. Recommendations

1. **Fuel Dashboard** — Create sample CSV and route. Old site has real fuel consumption data (22,928 L).
2. **Paper Dashboard** — Create sample CSV and route. Old site has real paper consumption data (2,197 kg).
3. **KPI Label Alignment** — Update dashboard-kpi.json labels to match old-site terminology for user familiarity.
4. **Dashboard Description** — Mirror old-site wording for Thai users (add i18n consideration).
5. **Impact Colors** — Consider adding 🔴🟡🟢 impact indicators per old-site convention.
6. **Executive Dashboard Layout** — Use 6-card grid (Water, Electricity, Fuel, Paper, Waste, GHG) matching old site.
7. **Data Freshness** — Document that real data must be ported from old-site MySQL to CSV/JSON for static site.
8. **CSV Sample Update** — Replace fictional CSV samples with realistic data patterns based on old-site scale.

---

## 8. Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Real data values change yearly | Medium | CSV/JSON updated during certification cycle |
| Thai label support needed | Low | Keep English for now, add i18n later |
| Fuel/Paper not in 7-category schema | Medium | Add as sub-metrics under Energy (cat1) or standalone sections |
| Old site has 6-card executive layout vs 7-category Astro | Low | Astro dashboard can show both views |

---

*Source: goffice.mju.ac.th — Green Office Platform, Maejo University. Used for reference only.*
