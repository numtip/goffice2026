# GOFFICE2026_CATEGORY1_MANAGEMENT_BLUEPRINT_V1

**Project:** Green Office 2026 — Environmental Communication & Assessment Evidence Platform  
**Document Type:** Domain Blueprint — Category 1 Management System  
**Version:** 1.0  
**Status:** DRAFT FOR PRODUCT OWNER REVIEW  
**Date:** 2026-08-18  
**Parent Baseline:** `GREENOFFICE2026_PLATFORM_BLUEPRINT_V5`  
**Audit Basis:** `GO-CAT1-BASELINE — Category 1 FY2568 Audit (Reconciled)`  
**Operational Principle:** FY2568 = historical working baseline; FY2569 = current-year layer when verified  
**CAT1 FY2568:** `FROZEN READ-ONLY BASELINE` — authority: `docs/releases/GOFFICE2026_CAT1_FY2568_FREEZE.md` (2026-08-19)

---

## 1. Purpose

Blueprint นี้กำหนดสถาปัตยกรรมข้อมูล ความสัมพันธ์ หลักฐาน และแนวทางการนำเสนอของ **หมวด 1 การกำหนดนโยบาย การวางแผน การดำเนินงานสำนักงานสีเขียว** ครบทั้ง 7 ประเด็น / 18 ตัวชี้วัด

เป้าหมายคือทำให้หมวด 1 ทำงานเป็น **management system เดียวกัน** แทนการเป็นชุดหน้า indicator ที่แยกออกจากกัน

แนวคิดหลัก:

> **Define → Govern → Identify → Comply → Measure → Improve → Review**

ปี 2568 ใช้เป็นข้อมูลจริงย้อนหลังสำหรับสร้าง canonical model และทดสอบการนำเสนอ  
ปี 2569 เมื่อข้อมูลครบ ให้ import เข้าสู่ model เดิมโดยไม่ออกแบบระบบใหม่

---

## 2. Authority and Source Order

### 2.1 Formal Criteria Authority

1. เกณฑ์การประเมินสำนักงานสีเขียว (Green Office) ปี 2569
2. Canonical criteria registry ของ repository
3. FY2568 criteria ใช้เพื่อ historical continuity เท่านั้น

### 2.2 Project Architecture Authority

1. `GREENOFFICE2026_PLATFORM_BLUEPRINT_V5`
2. `GOFFICE2026_CATEGORY1_MANAGEMENT_BLUEPRINT_V1`
3. Content/data contracts และ implementation docs ที่ออกตาม Blueprint นี้

### 2.3 FY2568 Working Data Source

Read-only source:

`G:\GreenData_Res\OneDrive - Maejo university\RAE-Document-Center\07-GreenOffice\Data2568\หมวด1`

Audit ยืนยัน:
- 38 files
- 28 PDF
- 7 DOCX
- 3 XLSX
- 1.3 workbook และ 1.5 GHG workbook เป็นแหล่งข้อมูลเชิงโครงสร้างที่แข็งแรงที่สุด
- indicator 1.2.2 และ 1.5.3 ยังไม่พบ dedicated FY2568 source

---

## 3. Category 1 Operating Model

```text
┌───────────────────────────────────────┐
│ 1.1 DEFINE                            │
│ Context • Policy • Targets • Plan     │
└──────────────────┬────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────┐
│ 1.2 GOVERN                            │
│ Committee • Roles • Responsibility    │
└──────────────────┬────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────┐
│ 1.3 IDENTIFY & PRIORITIZE             │
│ Activities → Aspects → Significance   │
└──────────────┬────────────────────────┘
               │
        ┌──────┴───────┐
        ▼              ▼
┌───────────────┐  ┌────────────────────┐
│ 1.4 COMPLY    │  │ 1.5 MEASURE        │
│ Laws          │  │ GHG Inventory      │
│ Compliance    │  │ Target / Analysis  │
└───────┬───────┘  └─────────┬──────────┘
        │                    │
        └─────────┬──────────┘
                  ▼
┌───────────────────────────────────────┐
│ 1.6 IMPROVE                          │
│ Reduction Plan • Projects             │
└──────────────────┬────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────┐
│ 1.7 REVIEW                            │
│ Management Review • Decisions         │
└──────────────────┬────────────────────┘
                   │
                   └────→ 1.1 NEXT CYCLE
```

---

## 4. Indicator Architecture

### 4.1 — Define

#### 1.1.1 Context and Scope
Canonical entities:
- `officeScope`
- `officeArea`
- `officeActivity`

Primary relationship:  
`1.1.1 Scope → Activity Registry → 1.3.1 Environmental Assessment`

Presentation:
- ขอบเขตพื้นที่
- ขอบเขตกิจกรรม
- กิจกรรมที่อยู่ใน scope
- วันที่อนุมัติ / ผู้อนุมัติ
- CTA ไป 1.3.1

#### 1.1.2 Environmental Policy
Canonical entities:
- `environmentalPolicy`
- `policyCommitment`

Recommended commitment dimensions:
- resource/energy efficiency
- pollution/waste prevention
- green procurement
- legal compliance
- environmental awareness
- greenhouse-gas reduction

Policy ต้องเชื่อมไปยัง:  
`targets`, `significantIssues`, `laws`, `projects`, `knowledge`

#### 1.1.3 Targets and Indicators
Canonical entity:
- `environmentalTarget`

Canonical target domains:
- electricity
- fuel
- water
- paper
- reused/recycled waste
- general waste
- GHG

One-source rule:  
Target values ที่แสดงใน 1.1.3, dashboards, 1.5.2 และ management review ต้องมาจาก source เดียว

#### 1.1.4 Annual Plan
Canonical entity:
- `annualPlanItem`

Minimum fields:
- year
- category / issue / indicator
- activity
- owner
- schedule / frequency
- status
- evidence links

FY2569 repository มี action-plan 61 Category 1 activities แล้ว ต้อง reuse ก่อนสร้าง model ใหม่

---

### 4.2 — Govern

#### 1.2.1 Committee / Environmental Team
Canonical entities:
- `committee`
- `committeeMember`
- `responsibilityAssignment`

Relationship:  
`role → category / indicator / plan item / data owner`

Public view:
- โครงสร้างคณะกรรมการ
- หน้าที่
- coverage ของทุกหมวด

Formal evidence:
- signed appointment order

#### 1.2.2 Role Understanding
Canonical entity:
- `roleUnderstandingAssessment`

Source type:
- interview / sampling result

Rule:  
ห้ามสรุป PASS จากคำสั่งแต่งตั้งเพียงอย่างเดียว

FY2568 status:  
`MISSING_DEDICATED_SOURCE`

---

### 4.3 — Identify & Prioritize

#### 1.3.1 Environmental Aspect Identification
Canonical entities:
- `officeActivity`
- `environmentalAspect`
- `aspectAssessment`
- `aspectReview`

Data chain:

```text
Activity
→ Input / Output
→ Environmental Aspect
→ Direct / Indirect
→ Normal / Abnormal / Emergency
→ Applicable Law
→ Assessment
→ L / M / H
```

FY2568 strongest source:  
`ทะเบียน..._1.3(1)-1.3(4).xlsx`

Presentation pattern:
1. Assessment coverage
2. Process → Input → Output
3. Significance overview
4. Assessment explorer
5. Related laws
6. Related controls
7. Formal evidence

#### 1.3.2 Significant Environmental Issues
Canonical entities:
- `significantIssue`
- `controlMeasure`

Rule:  
Significant issues derive from 1.3.1; do not manually create a disconnected second list.

Presentation:  
`M/H issue → cause/context → control → implementation evidence → related criterion`

#### 1.3.3 Environmental Projects
Canonical entity:
- `environmentalProject`

Project origin can be:
- significant environmental issue
- environmental policy
- applicable law
- improvement opportunity

Relationship:  
`1.3.3 ↔ 1.6.2` where project scope overlaps GHG reduction

Do not duplicate project metadata between indicators.

---

### 4.4 — Comply

#### 1.4.1 Legal Register
Canonical entities:
- `legalRequirement`
- `aspectLegalMapping`

Core relationship:

```text
Environmental Aspect ↔ Applicable Law
```

Minimum fields:
- law id
- title
- source
- effective/current status
- review date
- related aspects
- related office activities

Rule:  
ไม่ใช้เพียง `law = yes/no` หากมี legal register จริง

#### 1.4.2 Legal Compliance Evaluation
Canonical entity:
- `legalComplianceAssessment`

Core fields:
- law id
- year
- evaluation date
- compliant / non-compliant / not-applicable / pending
- evidence
- cause / corrective action when non-compliant

Relationship:  
`1.4.1 Legal Register → 1.4.2 Compliance`

FY2568 source requires version disposition before canonical import.

---

### 4.5 — Measure Greenhouse Gas

#### 1.5.1 GHG Inventory
Canonical entities:
- `ghgActivityData`
- `emissionFactor`
- `ghgEmissionRecord`
- `ghgInventory`

One-source rule:  
GHG Dashboard และ 1.5.1 ต้องใช้ validated generated data เดียวกัน

FY2568 source:  
`1.5_GreenhouseGas2568.xlsx`

#### 1.5.2 Target Achievement and Analysis
Canonical entity:
- `ghgPerformanceAnalysis`

Relationship:

```text
1.1.3 GHG Target
→ 1.5.1 Actual GHG
→ 1.5.2 Target Comparison / Analysis
→ 1.6 Improvement
→ 1.7 Review
```

Presentation:
- actual
- target
- previous year
- variance
- interpretation
- corrective/improvement action

#### 1.5.3 GHG Understanding
Canonical entity:
- `ghgKnowledgeAssessment`

Related content may include:
- training
- knowledge media
- campaign
- interview result

Rule:  
Knowledge material ≠ proof of staff understanding by itself.

FY2568 status:  
`MISSING_DEDICATED_SOURCE`

---

### 4.6 — Improve

#### 1.6.1 GHG Reduction Plan
Canonical entity:
- `ghgReductionPlan`

Minimum model:
- baseline
- objective
- target
- planned actions
- owner
- timeline
- expected reduction
- progress
- evidence

#### 1.6.2 GHG Reduction Projects
Reuse canonical:
- `environmentalProject`

Add GHG-specific outcome fields only where relevant:
- expected reduction
- measured reduction
- method
- result status

Relationship:  
`1.3.3 Projects ↔ 1.6.2 Projects`

No duplicate project record.

---

### 4.7 — Review

#### 1.7.1 Management Review Quorum
Canonical entities:
- `managementReview`
- `reviewParticipant`
- `reviewQuorum`

#### 1.7.2 Agenda and Management Review
Canonical entities:
- `managementReviewAgenda`
- `managementDecision`
- `followUpAction`

Inputs should include, when available:
- policy status
- target performance
- annual-plan progress
- significant issues
- legal compliance
- GHG result
- project progress
- complaints / nonconformities
- corrective actions

Output loop:

```text
Management Decision
→ revise policy / target / plan
→ assign owner
→ create action/project
→ next annual cycle
```

The 1.7 → next-cycle 1.1 relationship is an architectural PDCA rule until documentary evidence confirms a specific FY2568 record.

---

## 5. Canonical Relationship Model

```text
1.1.1 Scope
   └─→ Office Activities
          └─→ 1.3.1 Environmental Aspects
                    ├─→ 1.4.1 Applicable Laws
                    │        └─→ 1.4.2 Compliance
                    │
                    └─→ Significant M/H
                             └─→ 1.3.2 Controls
                                      └─→ 1.3.3 Project
                                                │
1.1.2 Policy ───────────────────────────────────┤
1.1.3 Targets ─→ Dashboards ─→ 1.5.2 ─────────┤
1.1.4 Annual Plan ──────────────────────────────┤
1.2 Roles / Owners ─────────────────────────────┤
1.5.1 GHG Inventory ─→ 1.5.2 Analysis ─────────┤
                                                ▼
                                           1.6 Improve
                                                │
                                                ▼
                                           1.7 Review
                                                │
                                                └─→ Next 1.1 cycle
```

---

## 6. Canonical Entity Set

Recommended domain-level entities:

```text
Category1
├── scope
├── activities
├── policies
├── policyCommitments
├── targets
├── annualPlans
├── committee
├── responsibilities
├── roleAssessments
├── environmentalAspects
├── aspectAssessments
├── significantIssues
├── controlMeasures
├── legalRequirements
├── aspectLegalMappings
├── legalCompliance
├── ghgInventory
├── ghgPerformanceAnalysis
├── ghgKnowledgeAssessment
├── projects
├── ghgReductionPlans
├── managementReviews
├── managementDecisions
└── evidenceLinks
```

Rule:  
Indicator pages are **views of these entities**, not independent data silos.

---

## 7. Year and Historical Model

### 7.1 FY2568

Status:  
`historical-baseline`

Allowed presentation:
- actual 2568 facts verified from source
- historical evidence
- baseline comparison
- current/previous indicator context

### 7.2 FY2569

Per record status:
- `published`
- `partial`
- `pending`
- `unavailable`

Critical rule:  
FY2568 values must never be copied forward and presented as FY2569.

### 7.3 Year Selector

Where useful:

```text
2569 | 2568
```

If FY2569 unavailable:

> ข้อมูลปี 2569 อยู่ระหว่างรวบรวม — แสดงข้อมูลย้อนหลังปี 2568 ที่ตรวจสอบแล้ว

---

## 8. Evidence Architecture

### 8.1 Evidence Is a Shared Record

```text
Evidence Metadata
├─ Indicator Page
├─ Category 1 Overview
├─ Evidence Library
├─ Document Center
├─ Dashboard
└─ Historical View
```

One file → one canonical metadata record → many views.

### 8.2 Evidence Status

Recommended:
- `verified`
- `available_unverified`
- `pending`
- `unavailable`

Do not use UI readiness as an official assessment score.

### 8.3 Known FY2568 Mapping Fixes

Confirmed remapping required:
- policy → **1.1.2**
- targets → **1.1.3**
- committee → **1.2.1**
- scope → **1.1.1**
- GHG inventory → **1.5.1** remains correct

Known misclassification to review:
- cat3 energy-domain evidence incorrectly tagged Category 1
- electricity usage document feeding 3.2.2 but tagged cat1

---

## 9. Presentation Architecture

### 9.1 `/about/`
Purpose:  
**Public / organisational explanation**

Reuse current completed content:
- scope
- policy
- goals
- committee
- action plan

Do not turn `/about/` into an auditor interface.

### 9.2 `/categories/cat1/`
Purpose:  
**Category 1 Management Cycle Overview**

Recommended sections:
1. Hero + category intent
2. FY2568 / FY2569 status selector
3. Management Cycle diagram
4. 7 issue cards: 1.1 → 1.7
5. Key environmental issues
6. Target & GHG performance snapshot
7. Legal/compliance snapshot
8. Improvement projects
9. Management review status
10. Evidence coverage

Canonical route remains `/categories/cat1/`.  
Do not introduce `/categories/1/` as a second canonical route.

### 9.3 `/indicators/1.x.x/`
Purpose:  
**Auditor drill-down**

Standard:
- Requirement
- Implementation
- Year/status
- domain-specific data view
- evidence
- historical evidence
- cross-indicator relationships

Indicator pages should support domain-specific presentation instead of forcing every indicator into identical PDF-list UI.

### 9.4 `/dashboard/`
Purpose:  
**Performance**

Only numeric/resource performance.  
Do not duplicate evidence or legal register logic.

### 9.5 `/evidence/`
Purpose:  
**Formal evidence discovery**

Filter by:
- category
- issue
- indicator
- year
- type
- status

---

## 10. FY2568 Baseline Reconciliation

Audit verdict:  
`BASELINE_READY_WITH_GAPS`

### Strongest FY2568 domains

1. **1.3 Environmental Aspects**
   - structured workbook
   - process/input/output/prioritisation

2. **1.5 GHG**
   - structured workbook
   - summary + septic/wastewater + EF references
   - correct existing indicator mapping for 1.5.1

### Significant gaps

- 1.2.2 dedicated source not found
- 1.5.3 dedicated source not found
- most PDF/DOCX content not yet inspected deeply
- legal-register version pairs unresolved
- duplicate/version disposition incomplete
- 13/18 indicators lack proper site evidence
- Category 1 site evidence contains systematic wrong indicator mappings

---

## 11. Data Quality Rules

1. Filenames are not proof of content or approval.
2. File modified date is not canonical version truth.
3. PDF/DOCX pairs require disposition before import.
4. `1.5_greenhousegass_update.xlsx` must not be assumed FY2568 because its primary sheet opens on FY2567.
5. An evidence record must map to explicit indicator codes.
6. Category-level membership is insufficient for indicator evidence.
7. Missing interview/training evidence must remain missing.
8. No auto-generated official 0–4 Green Office score.
9. UI may show evidence coverage/readiness only.
10. All derived values must preserve source traceability.

---

## 12. Recommended Data Pipeline

```text
FY2568 OneDrive sources (READ-ONLY)
        ↓
Inventory / Version Disposition
        ↓
Normalize
        ↓
Validate
        ↓
Canonical Category 1 JSON
        ↓
Evidence Metadata Mapping
        ↓
Astro Views
├─ About
├─ Category 1
├─ Indicators
├─ Dashboard
├─ Evidence
└─ Documents
```

FY2569:

```text
FY2569 sources
        ↓
same normalization contracts
        ↓
validation
        ↓
year=2569 records
        ↓
comparison + current presentation
```

---

## 13. Implementation Phases

### Phase A — Source Disposition
- resolve duplicate PDF/DOCX pairs
- confirm canonical FY2568 files
- inspect missing 1.2.2 / 1.5.3 with data owner
- verify approvals/dates where required

### Phase B — Indicator Mapping Repair
P0:
- policy → 1.1.2
- targets → 1.1.3
- committee → 1.2.1
- scope → 1.1.1
- remove/reclassify wrong cat1 energy records

### Phase C — Canonical Data Contracts
Start only with reusable domains:
- activities/aspects
- laws/compliance
- targets
- GHG
- projects
- management review

Do not create all possible schemas upfront.

### Phase D — FY2568 Normalisation
Priority:
1. 1.3 workbook
2. 1.5 workbook
3. legal register/compliance
4. projects
5. management review
6. remaining static evidence

### Phase E — Category 1 Presentation
- enhance `/categories/cat1/`
- enhance domain-specific indicator views
- retain existing `/about/`
- preserve current stable routes

### Phase F — Cross-Linking
- Scope → 1.3
- Aspect ↔ Law
- Significant issue → Control/Project
- Targets → Dashboard/GHG
- GHG → Reduction
- Results → Management Review

### Phase G — GitHub Pages Acceptance
- build
- validation
- TH/EN parity where applicable
- mobile/a11y
- evidence-link correctness
- no false FY2569 claims

### Phase H — Production
Only after Product Owner approves preview.  
Production/VPS remains untouched before acceptance.

---

## 14. Guardrails

Do not:

- redesign `/about/` from scratch
- duplicate canonical data per indicator
- import OneDrive sources by modifying them
- create a database/backend for Category 1
- auto-score Green Office official scores
- claim missing evidence as complete
- treat FY2568 as FY2569
- expose local file paths publicly
- create a separate Project Registry for 1.3.3 and 1.6.2
- create a separate target source for dashboards
- change canonical `/categories/cat1/` without compatibility decision
- implement UI before mapping/data truth is repaired

---

## 15. Quality Gates

### Data
- all imported records have year
- source traceability retained
- duplicate versions resolved
- explicit indicator mappings
- no FY2568→FY2569 leakage

### Content
- requirements match official 2569 criteria
- implementation summary separated from requirement
- missing evidence shown truthfully
- no unsupported compliance/pass claims

### Runtime
- `/about/*` remains functional
- `/categories/cat1/` functional
- all 18 indicator routes functional
- evidence filters functional
- dashboard links valid

### UX
- public view remains understandable
- auditor drill-down ≤ 3 clicks from category
- mobile accessible
- tables have readable fallback
- diagrams have text alternatives

---

## 16. Definition of Done — Category 1

Category 1 baseline is considered operational when:

1. all 18 indicators have correct canonical mapping
2. FY2568 source disposition is complete
3. 1.3 and 1.5 structured datasets are normalized and traceable
4. applicable laws link explicitly to environmental aspects
5. compliance data is separated from legal-register data
6. projects reuse one canonical project entity
7. target/GHG/dashboard values come from one source
8. management review can reference upstream results
9. `/about/`, `/categories/cat1/`, `/indicators/*`, `/evidence/`, `/dashboard/` have clear roles
10. FY2569 can be added as a new year without redesigning the domain model

---

## 17. Architectural Decision

> **Category 1 will be implemented as an interconnected environmental management domain, not as 18 independent evidence pages.**

FY2568 is the reference baseline for validating the model.  
FY2569 will extend the same canonical entities and relationships.

Core loop:

> **Define → Govern → Identify → Comply → Measure → Improve → Review → Improve the next cycle**
