# GOFFICE2026 — DASHBOARD & CRITERIA PROGRESS BLUEPRINT V1

**Project:** Green Office 2026 — Environmental Communication & Assessment Evidence Platform  
**Document Type:** Domain Blueprint — Dashboard, Criteria Progress & Readiness  
**Version:** 1.0  
**Status:** PROPOSED CANONICAL REFERENCE  
**Date:** 2026-08-26  
**Parent Baseline:** `GREENOFFICE2026_PLATFORM_BLUEPRINT_V5`  
**Legacy Reference:** `LEGACY_2568_CRITERIA_DASHBOARD_AUDIT.md`  
**Primary Visualization Engine:** Apache ECharts 6  
**Architecture Principle:** One Source, Many Views

---

## 1. Purpose

Blueprint นี้กำหนดแนวทางมาตรฐานสำหรับการทำ Dashboard ของ Green Office 2026 โดยรวม Dashboard สองกลุ่มที่มีความหมายต่างกันอย่างชัดเจน:

1. **Criteria Progress / Readiness Dashboard**  
   แสดงความคืบหน้าการดำเนินงานตามเกณฑ์ Green Office ระดับหมวด ประเด็น และตัวชี้วัด

2. **Environmental Performance Dashboard**  
   แสดงผลการใช้ทรัพยากร พลังงาน ของเสีย และก๊าซเรือนกระจกจากข้อมูลเชิงตัวเลขที่ผ่าน validation

เป้าหมายคือทำให้ผู้บริหาร ทีม Green Office และผู้ตรวจประเมินตอบคำถามได้ง่ายว่า:

> ทำไปแล้วเท่าไร → ค้างตรงไหน → หลักฐานพร้อมหรือยัง → ผลการดำเนินงานจริงเป็นอย่างไร → ต้องทำอะไรต่อ

ระบบต้องไม่ทำให้ **ความพร้อมของหลักฐาน**, **ความคืบหน้าการดำเนินงาน**, และ **คะแนนประเมินอย่างเป็นทางการ** ถูกตีความว่าเป็นสิ่งเดียวกัน

---

## 2. Background and Legacy 2568 Lessons

Legacy Green Office 2568 ใช้สองระบบแยกกัน:

### Track A — Evidence Readiness

```text
Joomla issue article
→ go-status
→ progress calculation
→ category / overall readiness
```

ค่าเดิม:

```text
0 = รอ / รอดำเนินการ
1 = มีหลักฐาน
2 = กำลังดำเนินการ
```

สูตรเดิม:

```text
progress = done / total × 100
```

โดยนับเฉพาะ `status = 1` เป็น done

### Track B — Resource KPI Dashboard

```text
Excel / CSV
→ validation / analysis JSON
→ static dashboard
→ Chart.js
```

มี resource dashboard เช่น:

- Water
- Electricity / Energy
- Fuel
- Paper
- Waste
- GHG
- Executive rollup
- Awareness

### Key Legacy Lessons

Reuse แนวคิด:

- 7-category / 24-issue hierarchy
- progress aggregation
- status semantics
- per-category progress view
- executive summary
- category → dashboard relationship
- static JSON data contracts

Do not reuse runtime coupling:

- Joomla custom fields
- MariaDB field queries
- PHP progress helper
- Joomla plugins/modules
- duplicated hardcoded criteria definitions
- stale fallback percentages
- Chart.js CDN dependency

Legacy 2568 เป็น **reference architecture**, ไม่ใช่ runtime dependency ของระบบ 2569

---

## 3. Canonical Dashboard Architecture

Green Office 2026 ใช้ Dashboard สอง track ที่ต้องแยก semantics อย่างชัดเจน:

```text
                    GREEN OFFICE 2026
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
      CRITERIA PROGRESS          ENVIRONMENTAL PERFORMANCE
      / READINESS                       DASHBOARD
              │                         │
              │                         │
   Criteria + metadata          Validated Excel / JSON
              │                         │
              ▼                         ▼
        Progress Engine            KPI Data Model
              │                         │
              └────────────┬────────────┘
                           ▼
                       ECharts 6
                           │
                           ▼
               Astro Dashboard Views
```

---

## 4. Track A — Criteria Progress / Readiness

### 4.1 Canonical Level

สถานะต้องเก็บที่ **Indicator level** เป็นหลัก:

```text
7 Categories
→ 24 Issues
→ 65 Indicators
```

การ aggregate ทำจากล่างขึ้นบน:

```text
Indicator
→ Issue
→ Category
→ Overall
```

ห้ามเก็บเปอร์เซ็นต์ของแต่ละหมวดด้วยมือเป็นค่าซ้ำหลายจุด

---

## 5. Progress Status Model

### 5.1 Progress Status

Recommended canonical values:

```text
ready
in_progress
not_started
unavailable
not_applicable
```

ความหมาย:

| Status | Meaning |
|---|---|
| `ready` | การดำเนินงานตาม scope ปัจจุบันครบและพร้อมนำเสนอ |
| `in_progress` | อยู่ระหว่างดำเนินงานหรือยังไม่ครบ |
| `not_started` | ยังไม่เริ่มดำเนินงาน |
| `unavailable` | ยังไม่มีข้อมูลเพียงพอที่จะประเมิน progress |
| `not_applicable` | ไม่ใช้กับบริบทของหน่วยงาน โดยต้องมีเหตุผลรองรับ |

### 5.2 Evidence Status

Evidence readiness ต้องเป็น field แยก:

```text
verified
available_unverified
pending
unavailable
not_applicable
```

ตัวอย่าง:

```yaml
indicator: "1.5.2"
year: 2569
progressStatus: "in_progress"
evidenceStatus: "available_unverified"
```

### 5.3 Why Two Status Fields

เพราะ:

- งานอาจดำเนินการแล้ว แต่หลักฐานยังไม่ครบ
- มีเอกสารแล้ว แต่ยังไม่ verify
- มีไฟล์แต่ mapping indicator ผิด
- มี evidence แต่ยังไม่มีการปฏิบัติจริงครบตามเกณฑ์

ดังนั้น:

```text
Progress ≠ Evidence
Evidence ≠ Official Score
```

---

## 6. Official Score Boundary

ระบบห้ามคำนวณหรือแสดงเปอร์เซ็นต์ readiness เป็นคะแนน Green Office อย่างเป็นทางการ

Green Office official assessment ใช้คะแนน 0–4 ต่อ indicator ตามเกณฑ์ ซึ่งอาจพิจารณา:

- ความครบถ้วนของข้อกำหนด
- วันที่ปัจจุบัน
- การลงนามอนุมัติ
- การปฏิบัติจริง
- historical continuity
- interview / sampling
- specific evidence conditions

ดังนั้น UI ใช้คำว่า:

- ความคืบหน้าการดำเนินงาน
- ความพร้อมข้อมูล
- ความพร้อมหลักฐาน
- Indicator coverage

ห้ามใช้:

- คะแนน Green Office 75%
- ผ่านเกณฑ์ 80%
- Assessment Score

เว้นแต่เป็นคะแนนที่มาจากกระบวนการประเมินจริงและมี source authority ชัดเจน

---

## 7. Progress Calculation

### 7.1 Base Formula

Recommended default:

```text
ready_rate = ready / applicable_total × 100
```

โดย:

```text
applicable_total =
total indicators
- not_applicable indicators
```

### 7.2 Display Breakdown

ทุก progress chart ต้องแสดง count ควบคู่เปอร์เซ็นต์:

```text
12 Ready
4 In Progress
2 Not Started
= 18 indicators
```

ไม่ควรแสดงเพียง:

```text
67%
```

เพราะเปอร์เซ็นต์อย่างเดียวไม่บอกว่าค้างแบบใด

### 7.3 Overall Aggregation

```text
Overall
= aggregate of 65 indicators

Category
= aggregate of indicators in category

Issue
= aggregate of indicators in issue
```

ห้าม average จากเปอร์เซ็นต์แต่ละหมวด เพราะจำนวน indicator ต่อหมวดไม่เท่ากัน

---

## 8. Canonical Progress Data Contract

Recommended source registry:

```yaml
indicator: "1.5.2"
year: 2569

progressStatus: "in_progress"
evidenceStatus: "available_unverified"

owner: "หมวด 1"
source:
  type: "repository"
  ref: "src/data/..."

updatedAt: "2026-08-26"

notes: "..."
```

Minimum fields:

```text
indicator
year
progressStatus
evidenceStatus
source
updatedAt
```

Recommended fields:

```text
owner
reviewedBy
reviewDate
notes
relatedEvidence
relatedActivity
relatedDashboard
```

---

## 9. Generated Progress Dataset

Source registry ต้องถูก validate และ generate เป็น read-only output สำหรับ runtime:

```text
src/data/progress/
  indicator-progress-2569.*

        ↓ validator / generator

src/data/generated/
  category-progress-2569.json
```

ตัวอย่าง:

```json
{
  "year": 2569,
  "overall": {
    "total": 65,
    "applicable": 65,
    "ready": 42,
    "inProgress": 15,
    "notStarted": 6,
    "unavailable": 2,
    "readyRate": 64.6
  },
  "categories": [
    {
      "id": "1",
      "total": 18,
      "ready": 12,
      "inProgress": 4,
      "notStarted": 2,
      "unavailable": 0,
      "readyRate": 66.7
    }
  ]
}
```

Values above are illustrative only. Runtime values must be generated from verified project data.

---

## 10. ECharts 6 Visualization Standard

Apache ECharts 6 เป็น chart engine หลักของ platform สำหรับ dashboard visualization

### 10.1 `/categories/`

Recommended:

#### Overall Progress

- donut / progress ring
- `ready / applicable`
- percentage
- text summary

#### Category Comparison

- horizontal stacked bars
- Ready / In Progress / Not Started / Unavailable

Example:

```text
Cat 1  ████████████▒▒▒░░  12 / 18
Cat 2  ████████▒▒░░        4 / 6
Cat 3  █████████████▒▒     12 / 15
...
```

### 10.2 `/categories/catX/`

Recommended:

1. category progress donut
2. issue-level horizontal bar chart
3. status summary cards
4. readiness/evidence comparison
5. related performance dashboards
6. gap / next-action section

### 10.3 Indicator Page

ไม่จำเป็นต้องใช้ chart ทุก indicator

ใช้ ECharts เฉพาะเมื่อข้อมูลมีความหมายเชิง:

- trend
- comparison
- distribution
- progress
- quantitative performance

ห้ามทำ chart เพียงเพราะต้องการให้หน้า “ดูเป็น dashboard”

---

## 11. Cat1 Pilot Pattern

Category 1 เป็น pilot ที่เหมาะสมที่สุด เพราะมี 18 indicators และมี Category 1 Management Blueprint อยู่แล้ว

Issue model:

```text
1.1 Define
1.2 Govern
1.3 Identify & Prioritize
1.4 Comply
1.5 Measure
1.6 Improve
1.7 Review
```

Recommended presentation:

```text
หมวด 1 — ความคืบหน้าปี 2569

[ Category donut ]

Ready          12
In Progress     4
Not Started     2

1.1 Define       4 / 4
1.2 Govern       1 / 2
1.3 Identify     3 / 3
1.4 Comply       2 / 2
1.5 Measure      1 / 3
1.6 Improve      1 / 2
1.7 Review       0 / 2
```

Numbers above are UI examples only and must not be treated as current project facts.

---

## 12. Track B — Environmental Performance Dashboard

Resource dashboards remain independent from Criteria Progress.

Canonical pipeline:

```text
Excel
→ Normalize
→ Validate
→ Generated JSON
→ Astro
→ ECharts 6
```

Core metrics:

- Electricity
- Water
- Fuel
- Paper
- Waste
- Greenhouse Gas

Dashboard pattern:

```text
Current Value
→ Target
→ Previous/Baseline
→ Trend
→ Interpretation
→ Improvement Action
→ Related Evidence
```

---

## 13. Category ↔ Performance Relationship

Category progress pages may link to relevant performance dashboards, but must not duplicate KPI datasets.

Examples:

```text
Cat 1.5
→ GHG Dashboard

Cat 3.1
→ Water Dashboard

Cat 3.2
→ Electricity / Fuel Dashboard

Cat 3.3
→ Paper Dashboard

Cat 4
→ Waste Dashboard
```

Relationship must come from metadata/configuration, not hardcoded scattered component logic.

---

## 14. Executive Dashboard Integration

Executive view should show both tracks while visually separating them:

```text
EXECUTIVE GREEN OFFICE 2569

A. Criteria Progress
   - Overall readiness
   - category gaps
   - indicators requiring attention

B. Environmental Performance
   - Water
   - Electricity
   - Fuel
   - Paper
   - Waste
   - GHG
```

Do not merge both into one synthetic score unless an approved ADR defines semantics and governance.

---

## 15. UI and Accessibility Requirements

Every chart must have:

- visible title
- unit / period / year
- accessible text summary
- fallback table or equivalent readable data
- responsive layout
- keyboard-safe controls where interactive
- no information encoded by color alone

Recommended ECharts implementation:

```text
Chart
+ textual summary
+ fallback data table
```

Mobile requirements:

- no horizontal overflow
- labels remain readable
- long issue names wrap or use accessible tooltip
- charts reduce decorative elements before reducing information

---

## 16. Year Model

Progress must always be year-scoped.

Example:

```text
2569 | 2568
```

Do not copy status from 2568 to 2569.

If 2569 has no verified status:

```text
ข้อมูลปี 2569 ยังไม่พร้อม
```

Historical FY2568 may be displayed separately as baseline/reference.

---

## 17. Source Truthfulness Rules

1. Progress status must have source traceability.
2. Evidence presence alone must not automatically set `progressStatus=ready`.
3. A filename is not proof of approval or completion.
4. Missing evidence must remain missing.
5. Unverified evidence must not be presented as verified.
6. FY2568 facts must not be relabeled as FY2569.
7. Generated progress values must be reproducible.
8. No manual percentage duplication in UI components.
9. No official score inference.
10. All aggregation must derive from canonical indicator records.

---

## 18. Repository Architecture

Recommended logical structure:

```text
src/
├── data/
│   ├── criteria/
│   ├── progress/
│   ├── evidence/
│   ├── dashboard/
│   └── generated/
│
├── components/
│   ├── dashboard/
│   ├── criteria/
│   └── shared/
│
└── pages/
    ├── categories/
    ├── indicators/
    └── dashboard/
```

Do not restructure blindly. Audit current repo before changing paths.

---

## 19. Reuse Before Build

Before implementing new dashboard code, inspect existing project assets for:

- ECharts loader/wrapper
- responsive chart components
- fallback tables
- dashboard layout components
- generated JSON utilities
- category metadata
- indicator registry
- evidence status model
- year selector
- TH/EN translations

Do not add Chart.js, D3, ApexCharts, Highcharts, or another chart engine unless approved by ADR.

---

## 20. Implementation Plan

### Phase D0 — Repository Audit

Inspect:

- current `/categories/`
- category routes
- indicator registry
- evidence metadata
- current ECharts components
- dashboard generated data
- existing status fields
- Cat1 contracts
- FY2569 action-plan data

Deliver:

```text
Existing / Reuse / Missing / Conflict
```

No UI implementation yet.

### Phase D1 — Progress Contract

Define and validate:

```text
indicator
year
progressStatus
evidenceStatus
source
updatedAt
```

### Phase D2 — Cat1 Pilot Data

Populate 18 Category 1 indicators using verified project information only.

Unknown values remain:

```text
unavailable
```

Do not infer.

### Phase D3 — Cat1 Visualization

Implement:

```text
/categories/
/categories/cat1/
```

using existing ECharts 6 infrastructure.

### Phase D4 — Product Owner Acceptance

Verify:

- semantics
- labels
- colors
- chart types
- progress formulas
- evidence distinction
- mobile behavior

### Phase D5 — Generalize Cat2–Cat7

Only after Cat1 contract and UX are accepted.

### Phase D6 — Executive Integration

Add criteria progress summary to executive dashboard without mixing it with resource performance scoring.

---

## 21. Validation Gates

### Data

- 65 canonical indicators accounted for
- valid category/issue mapping
- valid year
- valid status enums
- traceable source
- no duplicated indicator records
- no FY2568 → FY2569 leakage

### Calculation

- overall count equals sum of indicators
- per-category totals match criteria registry
- not-applicable excluded correctly
- no averaging of category percentages
- generated percentage reproducible from counts

### Runtime

- `/categories/`
- `/categories/cat1/` through `/categories/cat7/`
- indicator drill-down
- TH/EN routes where applicable
- related dashboard links

### UX

- ECharts render correctly
- fallback content present
- mobile no overflow
- readable labels
- accessible summaries
- no misleading score terminology

---

## 22. Guardrails

Do not:

- resurrect Joomla runtime logic
- query Joomla/MariaDB in production
- use Joomla article IDs as canonical IDs
- copy 2568 status forward to 2569
- auto-mark ready from existence of PDF
- auto-score official Green Office 0–4
- hardcode percentages in components
- introduce a second chart library
- make readiness and resource performance one score
- hide missing/unavailable status
- redesign all 7 categories before validating the Cat1 pilot

---

## 23. Definition of Done

Criteria Progress Dashboard is operational when:

1. canonical 65-indicator registry is authoritative
2. every indicator can carry year-scoped progress and evidence status
3. progress data is source-traceable
4. Cat1 pilot is accepted
5. aggregation works Indicator → Issue → Category → Overall
6. `/categories/` shows truthful overview progress
7. category pages show useful issue-level breakdown
8. ECharts 6 uses existing platform infrastructure
9. fallback/accessibility views exist
10. no official score is inferred
11. resource dashboards remain separate
12. executive dashboard can present both tracks without semantic confusion

---

## 24. Architectural Decision

> **Green Office 2026 will use one canonical indicator-level progress model to generate criteria readiness views across the platform, while environmental performance remains a separate validated KPI domain.**

Legacy 2568 contributes the proven ideas of:

- progress status
- aggregation
- category readiness
- executive overview

Green Office 2569 improves the model by moving from:

```text
24 Joomla issue articles
→ evidence uploaded or not
```

to:

```text
65 canonical indicators
→ progress status
→ evidence status
→ issue/category aggregation
→ ECharts 6 visualization
→ auditor/executive/staff views
```

Core principle:

> **Progress shows where work stands.  
> Evidence shows what can be proven.  
> Performance shows environmental results.  
> Assessment score belongs to the formal assessment process.**
