# GOFFICE2026 — NEW PROJECT MASTER REFERENCE PACK

**Project:** Green Office 2026 — Environmental Intelligence & Evidence Platform  
**Repository:** `https://github.com/numtip/goffice2026`  
**Preview:** `https://numtip.github.io/goffice2026/`  
**Local Working Path:** `G:\ProjectAI\goffice2026`  
**Status:** ACTIVE — MASTER REFERENCE FOR NEW CHATGPT PROJECT  
**Pack Version:** 1.1  
**Updated:** 2026-07-27  
**Architecture Decision:** ADR-0001 — Approval Engine removed from scope  

---

# 0. HOW TO USE THIS FILE

ไฟล์นี้รวบรวมเอกสารอ้างอิงหลักสำหรับสร้าง ChatGPT Project ใหม่ของ Green Office 2026

## Agent Reading Order

1. **SECTION A — Project Entry Context**
2. **SECTION B — Platform Blueprint V5** — `GREENOFFICE2026_PLATFORM_BLUEPRINT_V5.md`
3. **SECTION C — Content Architecture V2**
4. **SECTION D — Green Office 2569 Criteria**
5. **SECTION E — Governance / Constitution**
6. **SECTION F — Data Source Map**
7. **SECTION G — Design References**
8. **SECTION H — Historical Context**

## Authority Order

### Architecture / Product (per Blueprint V5)
1. `GREENOFFICE2026_PLATFORM_BLUEPRINT_V5` — **CANONICAL**
2. `GOFFICE2026_CONTENT_ARCHITECTURE_V2`
3. `PROJECT CONSTITUTION`
4. `GREENOFFICE2026_PLATFORM_BLUEPRINT_V4` — Superseded by V5 where inconsistent; operational reference
5. `GREENOFFICE2026_PLATFORM_BLUEPRINT_V3` — Superseded by V4/V5; historical reference only
6. ADR-0001 — Approval Engine removed from scope

### Green Office Criteria
1. Official Green Office 2569 PDF
2. 2026 Green Office Assessment Criteria Markdown working reference

### Data
1. Validated project data / generated JSON
2. Source Excel files
3. Historical files

---

# SECTION A — PROJECT ENTRY CONTEXT

## A1. Project Identity

This project is:

> **Green Office 2026 — Environmental Intelligence & Evidence Platform**

It is not a Joomla project and not a generic CMS project.

The platform combines:

- Public Story
- Environmental Performance
- Executive Dashboard
- Digital Evidence Navigator
- Green Office Knowledge & Activity Hub

Core principle:

> **Show. Measure. Prove. Improve.**

---

## A2. Current Technology

- Astro
- Tailwind CSS
- Markdown / MDX
- JSON
- CSV
- GitHub as Source of Truth
- GitHub Pages for Preview only
- Linux VPS + Nginx for Production

---

## A3. Development Roles

### Product Owner
Defines vision, priorities, scope, approval, release decision.

### GPT
Acts as Chief Architect:
- architecture
- governance
- scope control
- risk assessment
- review
- prevents over-engineering

### Cursor Agent
Acts as Worker:
- implementation
- refactoring
- testing
- build
- runtime QA

---

## A4. Legacy Boundary

Legacy Joomla is retired from the active development direction.

The Joomla security incident, forensic evidence, recovery reports, and Joomla deployment details remain historical/security references only.

They must not influence the new Astro architecture except for these lessons:

- Security first
- Evidence first
- Preserve before change
- Avoid unnecessary attack surface
- Prefer static architecture where possible

---

## A5. Active Source of Truth

Repository:

`https://github.com/numtip/goffice2026`

Preview:

`https://numtip.github.io/goffice2026/`

Local working path:

`G:\ProjectAI\goffice2026`

---

## A6. Required Work Pattern

```text
Architecture Review
→ Current Repository Audit
→ Gap Analysis
→ Implementation Plan
→ Cursor Agent Execution
→ Build Verification
→ Runtime QA
→ GitHub Pages Preview
→ Product Owner Approval
→ Production
```

Do not directly modify Production.

---

# SECTION B — GREENOFFICE2026 PLATFORM BLUEPRINT V5

> **This section is replaced by the canonical reference:**
> `GREENOFFICE2026_PLATFORM_BLUEPRINT_V5.md`
>
> Read that file directly instead of this embedded extract.
>
> **Status:** V5 is ACTIVE — CANONICAL OPERATIONAL BASELINE
> **Supersedes:** Blueprint V4 where inconsistent (V4 remains the operational reference for baseline capabilities)
> **Blueprint V3:** SUPERSEDED — kept only as historical reference
> **Architecture Decision:** ADR-0001 — Approval Engine removed from scope

## Canonical Product Definition (from V5)

> **Green Office 2026 คือแพลตฟอร์มสื่อสารข้อมูลสิ่งแวดล้อมและศูนย์รวมหลักฐานการประเมิน ไม่ใช่ระบบธุรกรรมหรือระบบอนุมัติองค์กร**

## Four Pillars (from V5)

1. **Present** — นำเสนอข้อมูลการใช้ทรัพยากรและผลการดำเนินงานให้ผู้บริหารเข้าใจได้รวดเร็ว
2. **Evidence** — จัดหมวดหมู่และเชื่อมโยงหลักฐาน 7 หมวดให้ผู้ตรวจประเมินค้นพบได้ง่าย
3. **Communicate** — ประชาสัมพันธ์ข่าว กิจกรรม ผลงาน และความก้าวหน้าของ Green Office
4. **Engage** — เป็นแหล่งความรู้ สื่อรณรงค์ และกิจกรรมสร้างจิตสำนึกด้านการอนุรักษ์ทรัพยากร

Core principle: **Present. Prove. Communicate. Engage.**

## Key Architecture Decisions

| Decision | Reference |
|---|---|
| Static-first Astro SSG | V4 §7.1 |
| VPS/Nginx production + GitHub Pages preview | V4 §7.4 |
| SharePoint for evidence files only | V4 §4.2 |
| Entra ID for authentication only | V4 §4.2 |
| No Power Automate, no approval workflows | ADR-0001 |
| No microservices, GraphQL, Redis, Kubernetes | V4 §4.3 |
| No custom CMS or admin backend | V4 §4.3 |
| Evidence publication: 3 modes (public metadata, public copy, direct SP access) | V4 §8 |
| Bilingual TH/EN by design | V4 §9.7 |
| Quality gates: build, links, TH/EN parity, data validation, responsive, a11y, SEO, Lighthouse | V4 §12 |

---

# SECTION C — GOFFICE2026 CONTENT ARCHITECTURE V2

# GOFFICE2026_CONTENT_ARCHITECTURE_V2

**Project:** Green Office 2026\
**Document Type:** Canonical Content Architecture\
**Version:** 2.0\
**Status:** ACTIVE REFERENCE\
**Updated:** 2026-07-27\
**Parent Reference:** `GREENOFFICE2026_PLATFORM_BLUEPRINT_V4.md`\
**Architecture Decision:** ADR-0001 — Approval Engine removed from scope

------------------------------------------------------------------------

## 1. Purpose

เอกสารนี้กำหนดโครงสร้างเนื้อหา เส้นทางการค้นพบข้อมูล ความสัมพันธ์ระหว่างเกณฑ์ ตัวชี้วัด
Dashboard กิจกรรม และหลักฐานของ Green Office 2026

เป้าหมายคือให้ระบบรองรับผู้ใช้ 4 กลุ่มโดยไม่บังคับให้ทุกคนใช้เส้นทางเดียวกัน:

-   Public
-   Executive
-   Auditor
-   Green Office Staff

------------------------------------------------------------------------

## 2. Content Architecture Model

``` text
CONTENT LAYER
│
├── PUBLIC STORY
├── PERFORMANCE
├── CRITERIA
├── EVIDENCE
├── ENGAGEMENT
└── DISCOVERY
```

ทุก layer เชื่อมกันผ่าน metadata และ canonical IDs

------------------------------------------------------------------------

## 3. Top-Level Sitemap

``` text
/
├── /about
│   ├── /scope
│   ├── /policy
│   ├── /goals
│   ├── /committee
│   ├── /action-plan
│   ├── /certification
│   └── /feedback
│
├── /dashboard
│   ├── /electricity
│   ├── /water
│   ├── /fuel
│   ├── /paper
│   ├── /waste
│   └── /ghg
│
├── /categories
│   ├── /1
│   ├── /2
│   ├── /3
│   ├── /4
│   ├── /5
│   ├── /6
│   └── /7
│
├── /indicators
│   └── /[indicator-code]
│
├── /evidence
│   └── /[evidence-id]
│
├── /documents
│
├── /activities
│   └── /[slug]
│
├── /knowledge
│   └── /[slug]
│
└── /search
```

> หมายเหตุ: route จริงต้อง audit repository ก่อน implementation หาก route
> ปัจจุบันต่างจากนี้ ให้ใช้ redirect หรือ compatibility strategy แทนการทำลาย URL
> ที่มีอยู่โดยไม่จำเป็น

------------------------------------------------------------------------

## 4. Canonical Taxonomy

### Level 1 --- Category

``` text
1 การกำหนดนโยบาย การวางแผนการดำเนินงานสำนักงานสีเขียว
2 การสื่อสารและสร้างจิตสำนึก
3 การใช้ทรัพยากรและพลังงาน
4 การจัดการของเสีย
5 สภาพแวดล้อมและความปลอดภัย
6 การจัดซื้อและจัดจ้าง
7 การดำเนินงานสำนักงานสีเขียวเพื่อความต่อเนื่อง
```

### Level 2 --- Issue / Section

ตัวอย่าง:

``` text
1
├── 1.1 การกำหนดแนวทางการดำเนินงานสำนักงานสีเขียว
├── 1.2 คณะทำงานด้านสิ่งแวดล้อม
├── 1.3 การระบุประเด็นปัญหาทรัพยากรและสิ่งแวดล้อม
├── 1.4 กฎหมายและข้อกำหนดอื่นๆ
├── 1.5 ข้อมูลก๊าซเรือนกระจก
├── 1.6 แผนและโครงการลดก๊าซเรือนกระจก
└── 1.7 การทบทวนฝ่ายบริหาร
```

### Level 3 --- Indicator

ตัวอย่าง:

``` text
1.5.1 การเก็บข้อมูลก๊าซเรือนกระจก
1.5.2 การบรรลุเป้าหมาย สรุปและวิเคราะห์ผล
1.5.3 ความรู้ความเข้าใจเกี่ยวกับก๊าซเรือนกระจก
```

Indicator code เป็น canonical key สำหรับเชื่อมข้อมูลข้ามระบบ

------------------------------------------------------------------------

## 5. Content Entity Model

### 5.1 Category

``` yaml
id: "1"
title: "การกำหนดนโยบาย..."
summary: "..."
weight: 25
issues:
  - "1.1"
  - "1.2"
relatedDashboards:
  - "ghg"
```

### 5.2 Issue

``` yaml
id: "1.5"
category: "1"
title: "ข้อมูลก๊าซเรือนกระจก"
indicators:
  - "1.5.1"
  - "1.5.2"
  - "1.5.3"
```

### 5.3 Indicator

``` yaml
id: "1.5.2"
category: "1"
issue: "1.5"
title: "ปริมาณก๊าซเรือนกระจกบรรลุเป้าหมาย สรุปและการวิเคราะห์ผล"
summary: "..."
responsibleTeam: "หมวด 1"
relatedDashboards:
  - "ghg"
```

### 5.4 Evidence

``` yaml
id: "GO-2569-1.5.2-001"
title: "รายงานการปล่อยก๊าซเรือนกระจก ประจำปี 2569"
year: 2569
category: "1"
issue: "1.5"
indicators:
  - "1.5.2"
type: "report"
status: "approved"
date: "2026-06-30"
file: "/documents/..."
tags:
  - "GHG"
relatedDashboards:
  - "ghg"
```

### 5.5 Dashboard Dataset

``` yaml
id: "ghg-2569"
metric: "ghg"
year: 2569
unit: "tCO2e"
baselineYear: 2568
target: 0
sourceEvidence:
  - "GO-2569-1.5.2-001"
```

### 5.6 Activity

``` yaml
id: "ACT-2569-001"
title: "..."
date: "2026-..."
categories:
  - "2"
indicators:
  - "2.2.2"
evidence:
  - "GO-2569-2.2.2-001"
```

------------------------------------------------------------------------

## 6. Relationship Graph

``` text
CATEGORY
   ↓
ISSUE
   ↓
INDICATOR
   ├──────────────→ EVIDENCE
   │                    ↑
   │                    │
   ├──→ DASHBOARD ──────┘
   │
   └──→ ACTIVITY / KNOWLEDGE
```

หลักการสำคัญ:

-   Evidence ต้องรู้ว่ารองรับ indicator ใด
-   Dashboard ต้องรู้ว่า source evidence คืออะไร
-   Activity สามารถเป็นทั้ง public story และ evidence
-   Indicator เป็นจุดรวมข้อมูลสำหรับ auditor

------------------------------------------------------------------------

## 7. Page Architecture

## 7.1 Home Page

### Goal

สื่อสาร impact และเปิดทางไปยัง Performance กับ Evidence

### Required Sections

1.  Hero
2.  Environmental Pulse
3.  7 Green Office Dimensions
4.  Performance Story
5.  Featured Project
6.  Latest Evidence
7.  Activities & Knowledge
8.  Footer / Trust

### Primary CTA

-   ดูผลการดำเนินงาน
-   ค้นหาหลักฐาน

------------------------------------------------------------------------

## 7.2 About Hub

### Goal

รวม foundational content ขององค์กร

### Child Content

-   Context & Scope
-   Environmental Policy
-   Goals & Targets
-   Committee
-   Annual Action Plan
-   Certification
-   Feedback

### Related Criteria

โดยเฉพาะหมวด 1 และ 2

------------------------------------------------------------------------

## 7.3 Executive Dashboard

### Goal

ให้ผู้บริหารเข้าใจสถานะรวมโดยไม่ต้องเปิดรายงานหลายไฟล์

### Required Blocks

-   KPI cards
-   target status
-   year comparison
-   trend
-   notable improvement
-   areas requiring attention
-   link to detailed dashboards

------------------------------------------------------------------------

## 7.4 Metric Dashboard Page

### Template

``` text
Metric Hero
→ Current Value
→ Target
→ Status
→ Monthly Trend
→ Baseline / Previous Year
→ Analysis
→ Improvement Action
→ Related Indicators
→ Related Evidence
```

### Metrics

-   electricity
-   water
-   fuel
-   paper
-   waste
-   ghg

------------------------------------------------------------------------

## 7.5 Category Page

### Template

``` text
Category Header
→ Purpose / Overview
→ Progress or Readiness Summary
→ Issues
→ Indicators
→ Related Performance
→ Featured Evidence
→ Activities
```

### Auditor Mode

ต้องมองเห็น indicator code ชัดเจน

------------------------------------------------------------------------

## 7.6 Indicator Page

### Canonical Template

``` text
[Indicator Code] [Indicator Title]

Status | Year | Responsible Team

A. Requirement Summary
B. Our Implementation
C. Performance / KPI
D. Evidence
E. Historical Evidence
F. Related Dashboard
G. Related Activity / Knowledge
```

### Status Model

Recommended presentation status:

-   Ready
-   In Progress
-   Needs Update
-   Not Available

สถานะนี้เป็น presentation metadata ไม่ใช่คะแนนประเมินอย่างเป็นทางการ

------------------------------------------------------------------------

## 7.7 Evidence Library

### Browse Dimensions

-   Category
-   Issue
-   Indicator
-   Year
-   Type
-   Status
-   Tag

### Card / Row Content

-   title
-   evidence ID
-   indicator
-   year
-   type
-   updated date
-   status

### Detail View

-   metadata
-   preview / open file
-   related indicators
-   related dashboard
-   related evidence
-   history when available

------------------------------------------------------------------------

## 7.8 Activities

### Purpose

แสดงการดำเนินงานจริงในภาษาที่ประชาชนเข้าใจ

### Activity Types

-   training
-   campaign
-   project
-   meeting
-   exercise / emergency drill
-   community / network
-   innovation

### Relationship

Activity ต้องสามารถ link กลับไปยัง category / indicator / evidence
ได้เมื่อเกี่ยวข้อง

------------------------------------------------------------------------

## 7.9 Knowledge Media

### Content

-   posters
-   infographics
-   guides
-   videos
-   awareness content
-   Green Meeting guidance
-   resource-saving measures

### Purpose

รองรับการสื่อสารและสร้างจิตสำนึก โดยไม่ปะปนกับ formal evidence library

------------------------------------------------------------------------

## 7.10 Search

### Search Results May Include

-   indicator
-   evidence
-   document
-   activity
-   knowledge content
-   dashboard

### Search Priority Example

Query: `3.2.2`

Expected: 1. Indicator 3.2.2 2. Electricity dashboard 3. Evidence mapped
to 3.2.2 4. Related analysis reports

------------------------------------------------------------------------

## 8. Homepage Content Priority

ลำดับความสำคัญ:

``` text
Impact
→ Performance
→ 7 Categories
→ Evidence
→ Action
→ Knowledge
```

ไม่ใช้:

``` text
Welcome Message
→ Long Organization History
→ News List
→ PDF List
```

เป็นโครงสร้างหลักของหน้าแรก

------------------------------------------------------------------------

## 9. Evidence Discovery Journeys

### Auditor Journey

``` text
Search "1.5.2"
→ Indicator Page
→ Requirement Summary
→ Current Evidence
→ Historical Evidence
→ GHG Dashboard
```

### Executive Journey

``` text
Home
→ Environmental Pulse
→ Executive Dashboard
→ GHG Exception
→ Analysis
→ Supporting Evidence
```

### Public Journey

``` text
Home
→ Impact Story
→ Activity
→ Related Environmental Result
```

### Staff Journey

``` text
Category
→ Indicator
→ Evidence Status
→ Missing / Needs Update
```

------------------------------------------------------------------------

## 10. Data-to-Content Flow

``` text
SOURCE DATA
├── Excel
├── CSV
├── Documents
├── Images
└── Markdown
       ↓
NORMALIZE + VALIDATE
       ↓
CANONICAL DATA
├── criteria
├── evidence
├── dashboard
├── activities
└── knowledge
       ↓
ASTRO BUILD
       ↓
MULTIPLE VIEWS
├── Home
├── Dashboard
├── Category
├── Indicator
├── Evidence
└── Search
```

------------------------------------------------------------------------

## 11. Historical Continuity

สำหรับข้อมูลที่ต้องแสดงย้อนหลัง:

``` text
Indicator
├── Current Year 2569
├── 2568
├── 2567
└── Earlier Years
```

Evidence metadata ต้องใช้ `year` อย่างสม่ำเสมอ

Dashboard ต้องแยก:

-   baseline
-   previous year
-   current year
-   target

ห้ามผสมปีข้อมูลโดยไม่มี label ชัดเจน

------------------------------------------------------------------------

## 12. Naming and ID Conventions

### Indicator

`1.5.2`

### Evidence

`GO-{YEAR}-{INDICATOR}-{SEQUENCE}`

Example: `GO-2569-1.5.2-001`

### Activity

`ACT-{YEAR}-{SEQUENCE}`

### Dashboard Dataset

`{metric}-{year}`

Example: `electricity-2569`

------------------------------------------------------------------------

## 13. Content Ownership

Recommended ownership fields:

-   responsibleTeam
-   contentOwner
-   source
-   updatedAt
-   reviewDate

ไม่จำเป็นต้องแสดงทุก field ต่อสาธารณะ แต่ควรมีใน source metadata
หากใช้ในการดูแลข้อมูล

------------------------------------------------------------------------

## 14. Content Quality Rules

ทุก published indicator page ต้อง:

-   มีรหัสตัวชี้วัดถูกต้อง
-   มีชื่อ canonical
-   มี summary ที่เข้าใจง่าย
-   แยก requirement ออกจาก implementation
-   ไม่กล่าวอ้างว่ามี evidence หากไม่มีไฟล์หรือ record
-   แสดงปีข้อมูลชัดเจน
-   เชื่อม evidence ที่เกี่ยวข้อง

ทุก dashboard ต้อง:

-   แสดงหน่วย
-   แสดงช่วงเวลา
-   แสดง target เมื่อมี
-   แสดง source / related evidence
-   มีข้อความสรุปสำหรับ accessibility

------------------------------------------------------------------------

## 15. Recommended Repository Mapping

Target logical structure:

``` text
src/
├── components/
│   ├── home/
│   ├── dashboard/
│   ├── criteria/
│   ├── evidence/
│   └── shared/
│
├── content/
│   ├── about/
│   ├── activities/
│   ├── indicators/
│   └── knowledge/
│
├── data/
│   ├── criteria/
│   ├── evidence/
│   ├── dashboard/
│   └── generated/
│
└── pages/
```

**Do not blindly restructure the repository.**\
ต้อง audit ของปัจจุบันก่อน แล้ว map ของเดิมเข้าสู่ architecture นี้โดย reuse-first

------------------------------------------------------------------------

## 16. Migration / Upgrade Rules

1.  Inventory existing routes
2.  Inventory existing components
3.  Inventory existing data files
4.  Identify reusable pieces
5.  Identify missing entities
6.  Add canonical metadata
7.  Build shared templates
8.  Migrate content incrementally
9.  Preserve working URLs where practical
10. Verify runtime before removing legacy structures

------------------------------------------------------------------------

## 17. Minimum Completion Definition

Content Architecture V2 ถือว่า implement ขั้นพื้นฐานเมื่อ:

-   7 categories มี canonical data
-   indicator taxonomy รองรับเกณฑ์ 2569
-   indicator page template ใช้งานได้
-   evidence metadata เชื่อม indicator ได้
-   dashboard เชื่อม related evidence ได้
-   search ค้น indicator code ได้
-   homepage ใช้ impact-first structure
-   historical year metadata พร้อมใช้งาน
-   build and runtime QA pass

------------------------------------------------------------------------

## 18. Architecture Guardrails

ห้าม:

-   สร้างหน้า PDF list แยกซ้ำในหลายหมวด
-   hardcode document links ซ้ำหลาย component
-   ทำ dashboard ที่ไม่มี source traceability
-   ผสม activity กับ formal evidence โดยไม่มี metadata
-   เปลี่ยน taxonomy ตาม UI โดยไม่อ้าง canonical criteria
-   เพิ่ม backend เพียงเพราะ static content model ยังไม่ได้ออกแบบให้ดี

------------------------------------------------------------------------

## 19. Reference Relationship

``` text
GREENOFFICE2026_PLATFORM_BLUEPRINT_V3
        ↓
GOFFICE2026_CONTENT_ARCHITECTURE_V2
        ↓
Repository Audit + Gap Analysis
        ↓
Implementation Plan
        ↓
Cursor Agent Execution
        ↓
Runtime QA
        ↓
GitHub Pages Preview
        ↓
Product Owner Approval
        ↓
Production
```

------------------------------------------------------------------------

## 20. Core Principle

> **The website must not merely contain Green Office information.\
> It must make Green Office performance understandable, evidence
> discoverable, and continuous improvement visible.**


---

# SECTION D — GREEN OFFICE 2569 CRITERIA

## D1. Official Source

The official canonical criteria file should also be uploaded to the new project:

`เกณฑ์การประเมินสำนักงานสีเขียว-ปี-2569.pdf`

This PDF is the authoritative source for formal criteria interpretation.

## D2. AI Working Reference

﻿เกณฑ์การประเมินสำนักงานสีเขียว (Green Office)ประจำปี 2569 

**หมวดที่ 1: การกำหนดนโยบาย การวางแผน การดำเนินงานสำนักงานสีเขียว**
- 1.1 การกำหนดแนวทางการดำเนินงานสำนักงานสีเขียว
  - 1.1.1 มีบริบทองค์กรและขอบเขตของการจัดการสิ่งแวดล้อมในสำนักงาน
  - 1.1.2 การกำหนดนโยบายด้านสิ่งแวดล้อมจากผู้บริหารระดับสูง ที่สอดคล้องและครอบคลุมประเด็นตามเกณฑ์สำนักงานสีเขียวโดยแสดงความมุ่งมั่นอย่างต่อเนื่อง
  - 1.1.3 มีการกำหนดเป้าหมาย และตัวชี้วัดที่ชัดเจนด้านการใช้ทรัพยากร พลังงาน และของเสีย และปริมาณก๊าซเรือนกระจก
  - 1.1.4 มีการกำหนดแผนการดำเนินงานสำนักงานสีเขียวประจำปี
- 1.2 คณะทำงานด้านสิ่งแวดล้อม
  - 1.2.1 มีการแต่งตั้งคณะกรรมการหรือทีมงานด้านสิ่งแวดล้อม
  - 1.2.2 ร้อยละของคณะกรรมการ หรือทีมงานด้านสิ่งแวดล้อมที่มีความเข้าใจในบทบาท และหน้าที่รับผิดชอบ
- 1.3 การระบุประเด็นปัญหาทรัพยากรและสิ่งแวดล้อม
  - 1.3.1 กิจกรรมทั้งหมดของสำนักงานภายใต้ขอบเขตการขอการรับรองสำนักงานสีเขียวจะต้องได้รับการระบุและประเมินปัญหาสิ่งแวดล้อม
  - 1.3.2 การวิเคราะห์และแนวทางการแก้ไขปัญหาสิ่งแวดล้อมที่มีนัยสำคัญ
  - 1.3.3 แผนงานโครงการที่จัดทำขึ้นเพื่อแก้ไขปัญหาสิ่งแวดล้อมที่มีนัยสำคัญ หรือโครงการที่สอดคล้องกับนโยบายสิ่งแวดล้อม หรือกฎหมายสิ่งแวดล้อม
- 1.4 กฎหมายและข้อกำหนดอื่นๆ ที่เกี่ยวข้อง
  - 1.4.1 มีการรวบรวมกฎหมายสิ่งแวดล้อมและความปลอดภัยที่เกี่ยวข้องกับสำนักงาน
  - 1.4.2 ประเมินความสอดคล้องของกฎหมายกับการดำเนินงานการจัดการสิ่งแวดล้อมของสำนักงาน
- 1.5 ข้อมูลก๊าซเรือนกระจก
  - 1.5.1 การเก็บข้อมูลก๊าซเรือนกระจกจากกิจกรรมในสำนักงาน
  - 1.5.2 ปริมาณก๊าซเรือนกระจกบรรลุเป้าหมาย สรุปและการวิเคราะห์ผล
  - 1.5.3 บุคลากร/ผู้ที่เกี่ยวข้อง (Outsource) มีความรู้ ความเข้าใจเกี่ยวกับก๊าซเรือนกระจกในภาพรวมของสำนักงาน
- 1.6 แผนการดำเนินงานและโครงการเพื่อมุ่งสู่การลดก๊าซเรือนกระจกของหน่วยงาน
  - 1.6.1 จัดทำแผนการดำเนินงานขับเคลื่อนสู่การลดก๊าซเรือนกระจกของหน่วยงาน
  - 1.6.2 โครงการที่นำไปสู่การลดก๊าซเรือนกระจกของหน่วยงาน
- 1.7 การทบทวนฝ่ายบริหาร
  - 1.7.1 การกำหนดองค์ประชุมทบทวนฝ่ายบริหาร
  - 1.7.2 มีการกำหนดวาระการประชุม และทำการประชุมทบทวนฝ่ายบริหาร

**หมวดที่ 2: การสื่อสารและสร้างจิตสำนึก**
- 2.1 การอบรมให้ความรู้และประเมินความเข้าใจ
  - 2.1.1 กำหนดแผนการฝึกอบรม ดำเนินการอบรม การประเมินผล และบันทึกประวัติการฝึกอบรม
  - 2.1.2 กำหนดผู้รับผิดชอบด้านการอบรมแต่ละหลักสูตรมีความเหมาะสม
- 2.2 การรณรงค์และประชาสัมพันธ์แก่บุคลากร
  - 2.2.1 มีการกำหนดผู้รับผิดชอบและแนวทางสื่อสารด้านสิ่งแวดล้อมทั้งภายในและภายนอกสำนักงาน
  - 2.2.2 มีการรณรงค์สื่อสารและให้ความรู้ตามที่กำหนดในข้อ 2.2.1
  - 2.2.3 ร้อยละความเข้าใจนโยบายสิ่งแวดล้อมและการดำเนินงานสำนักงานสีเขียว (สุ่มอย่างน้อย 4 คน)
  - 2.2.4 มีช่องทางรับข้อเสนอแนะ/ข้อคิดเห็นด้านสิ่งแวดล้อม และนำมาปรับปรุงแก้ไข

**หมวดที่ 3: การใช้ทรัพยากรและพลังงาน**
- 3.1 การใช้น้ำ
  - 3.1.1 มาตรการหรือแนวทางใช้น้ำมีความเหมาะสมกับสำนักงาน
  - 3.1.2 มีการจัดทำข้อมูลการใช้น้ำต่อหน่วยเปรียบเทียบกับเป้าหมาย และวิเคราะห์ผล
  - 3.1.3 การปฏิบัติตามมาตรการประหยัดน้ำในพื้นที่ทำงาน (ประเมินจากพฤติกรรมของบุคลากรในพื้นที่)
- 3.2 การใช้พลังงาน
  - 3.2.1 มาตรการหรือแนวทางการใช้ไฟฟ้าเหมาะสมกับสำนักงาน
  - 3.2.2 มีการจัดทำข้อมูลการใช้ไฟฟ้าต่อหน่วยเปรียบเทียบกับเป้าหมาย และวิเคราะห์ผล
  - 3.2.3 การปฏิบัติตามมาตรการประหยัดไฟฟ้าในพื้นที่ทำงาน
  - 3.2.4 มาตรการหรือแนวทางการใช้น้ำมันเชื้อเพลิงในการเดินทางที่เหมาะสมกับสำนักงาน
  - 3.2.5 มีการจัดทำข้อมูลการใช้น้ำมันเชื้อเพลิงต่อระยะทางเปรียบเทียบกับเป้าหมาย และวิเคราะห์ผล
- 3.3 การใช้ทรัพยากรอื่นๆ
  - 3.3.1 มาตรการหรือแนวทางการใช้กระดาษที่เหมาะสมกับสำนักงาน
  - 3.3.2 มีการจัดทำข้อมูลการใช้กระดาษต่อหน่วยเปรียบเทียบกับเป้าหมาย และวิเคราะห์ผล
  - 3.3.3 การปฏิบัติตามมาตรการประหยัดกระดาษในพื้นที่ทำงาน
  - 3.3.4 มาตรการหรือแนวทางการใช้หมึกพิมพ์ อุปกรณ์เครื่องเขียน วัสดุอุปกรณ์เหมาะสมกับสำนักงาน
  - 3.3.5 การดำเนินตามมาตรการประหยัดการใช้หมึกพิมพ์ อุปกรณ์เครื่องเขียน วัสดุอุปกรณ์สำนักงาน
- 3.4 การประชุมและการจัดนิทรรศการ
  - 3.4.1 มาตรการหรือแนวทางการจัดการประชุมและนิทรรศการที่เป็นมิตรกับสิ่งแวดล้อม
  - 3.4.2 การจัดการประชุมและนิทรรศการที่มีการใช้วัสดุที่เป็นมิตรกับสิ่งแวดล้อม ลดการใช้ทรัพยากร-พลังงาน และลดของเสียที่เกิดขึ้น

**หมวดที่ 4: การจัดการของเสีย**
- 4.1 การจัดการขยะ
  - 4.1.1 มาตรการหรือแนวทางจัดการขยะที่เหมาะสมกับสำนักงาน มีการสร้างความตระหนัก และการมีส่วนร่วมของบุคลากร
  - 4.1.2 มีการดำเนินงานตามแนวทางการคัดแยก รวบรวม และกำจัดขยะอย่างเหมาะสม
  - 4.1.3 การนำขยะกลับมาใช้ประโยชน์ หรือนำกลับมาใช้ใหม่ ส่งผลให้ขยะที่จะส่งไปกำจัดมีปริมาณน้อยลง
- 4.2 การจัดการน้ำเสีย
  - 4.2.1 การจัดการน้ำเสียของสำนักงาน และคุณภาพน้ำทิ้งจะต้องอยู่ในมาตรฐานกฎหมายที่เกี่ยวข้อง
  - 4.2.2 การจัดการดูแลการบำบัดน้ำเสีย

**หมวดที่ 5: สภาพแวดล้อมและความปลอดภัย**
- 5.1 อากาศในสำนักงาน
  - 5.1.1 การควบคุมมลพิษทางอากาศในสำนักงาน
  - 5.1.2 มีการรณรงค์ไม่สูบบุหรี่หรือมีการกำหนดพื้นที่สูบบุหรี่ที่เหมาะสมและปฏิบัติตามที่กำหนด
  - 5.1.3 การจัดการมลพิษทางอากาศจากการก่อสร้าง ปรับปรุง อาคารหรืออื่นๆ ในสำนักงานที่ส่งผลต่อบุคลากร
- 5.2 แสงในสำนักงาน
  - 5.2.1 มีการตรวจวัดความเข้มของแสงสว่าง และดำเนินการแก้ไขตามที่มาตรฐานกำหนด
- 5.3 เสียง
  - 5.3.1 การควบคุมมลพิษทางเสียงภายในอาคารสำนักงาน
  - 5.3.2 การจัดการเสียงดังจากการก่อสร้าง ปรับปรุง อาคารหรืออื่นๆ ในสำนักงานที่ส่งผลต่อบุคลากร
- 5.4 ความน่าอยู่
  - 5.4.1 มีการวางแผนจัดการความน่าอยู่ของสำนักงาน
  - 5.4.2 ร้อยละการใช้สอยพื้นที่เป็นไปตามวัตถุประสงค์ที่สำนักงานกำหนด
  - 5.4.3 ร้อยละการดูแลบำรุงรักษาพื้นที่ต่างๆ
  - 5.4.4 มีการควบคุมสัตว์พาหะนำโรคและดำเนินการได้ตามที่กำหนด
- 5.5 การเตรียมพร้อมต่อสภาวะฉุกเฉิน
  - 5.5.1 การอบรมฝึกซ้อมดับเพลิงและอพยพหนีไฟตามแผนที่กำหนด
  - 5.5.2 มีแผนฉุกเฉินที่เป็นปัจจุบันและเหมาะสม และร้อยละของบุคลากรที่เข้าใจแผนฉุกเฉิน
  - 5.5.3 ความเพียงพอและการพร้อมใช้งานของอุปกรณ์ระบบดับเพลิงและป้องกันอัคคีภัย และระบบสัญญาณแจ้งเหตุเพลิงไหม้ และร้อยละของบุคลากรทราบวิธีการใช้และตรวจสอบอุปกรณ์

**หมวดที่ 6: การจัดซื้อและจัดจ้าง**
- 6.1 การจัดซื้อสินค้า
  - 6.1.1 การจัดซื้อสินค้าที่เป็นมิตรกับสิ่งแวดล้อม
  - 6.1.2 รายงานการจัดซื้อสินค้าประเภทวัสดุอุปกรณ์ในสำนักงานที่เป็นมิตรกับสิ่งแวดล้อม
  - 6.1.3 ร้อยละของปริมาณและประเภทของวัสดุอุปกรณ์ในสำนักงานที่เป็นมิตรกับสิ่งแวดล้อม
- 6.2 การจัดจ้าง
  - 6.2.1 การจัดจ้างหน่วยงานหรือบุคคลที่มีการดำเนินงานที่เป็นมิตรกับสิ่งแวดล้อม
  - 6.2.2 การตรวจสอบด้านการดูแลสิ่งแวดล้อมในพื้นที่ปฏิบัติงาน ของหน่วยงานหรือบุคคลที่เข้ามาดำเนินการ
  - 6.2.3 แนวทางของการเลือกใช้บริการที่เป็นมิตรกับสิ่งแวดล้อม (นอกสำนักงาน)

**หมวด 7: การดำเนินงานสำนักงานสีเขียวเพื่อความต่อเนื่อง (สำหรับหน่วยงานขอต่ออายุและขอยกระดับการรับรอง)**
- 7.1 การตรวจประเมินสำนักงานสีเขียวเพื่อให้เกิดการปรับปรุงอย่างต่อเนื่อง (ร้อยละ 40)
- 7.2 การพัฒนาหรือต่อยอดการดำเนินงานสำนักงานสีเขียว (ร้อยละ 60)

---

# SECTION E — GOVERNANCE / PROJECT CONSTITUTION

## E1. Status

The following constitution is retained as a governance reference.

Where it conflicts with Platform Blueprint V3 or Content Architecture V2, the newer documents take precedence.

# GREEN OFFICE PROJECT CONSTITUTION

Version: 2.0
Status: ACTIVE
Project: Green Office Next Generation Platform
Last Updated: 2026-06

---

# 1. Mission

สร้าง Green Office Platform รุ่นใหม่ที่

* โหลดเร็ว
* ดูทันสมัย
* ดูแลรักษาง่าย
* ใช้งานได้จริง
* รองรับเกณฑ์ Green Office 2569+
* ลดภาระการดูแลระบบ
* ลด Token Consumption
* รองรับ AI-Assisted Development

---

# 2. Project Vision

This project is NOT a CMS project.

This project is a:

* Green Office Platform
* Executive Dashboard
* Evidence Library
* Environmental Data Portal

The objective is simplicity, speed, maintainability and usability.

---

# 3. Technology Blueprint

## Approved Stack

### Design Layer

Dyad

Purpose:

* Rapid UI Prototyping
* Layout Exploration
* Design Validation

---

### Frontend Layer

Astro

Purpose:

* Static Site Generation
* High Performance
* SEO
* Long-Term Maintainability

---

### Styling

Tailwind CSS

---

### Data Layer

CSV
JSON
Markdown
MDX

Database is NOT required in MVP.

---

### Version Control

GitHub

GitHub is the ONLY Source of Truth.

---

### Hosting

Linux VPS
Nginx

---

# 4. Architecture Principles

## Principle 1

Simple First

Choose the simplest solution that works.

---

## Principle 2

Static First

Always evaluate:

* Markdown
* JSON
* CSV

Before considering:

* Database
* API
* Backend Services

---

## Principle 3

Content First

Content is more important than technology.

---

## Principle 4

Performance First

Every decision must consider loading speed.

---

## Principle 5

Maintainability First

Future staff must be able to maintain the platform.

---

# 5. Team Responsibilities

## Product Owner

Responsibilities:

* Vision
* Approval
* Prioritization
* Release Approval

Does NOT write code.

---

## GPT

Role:

Chief Architect

Responsibilities:

* Architecture
* Governance
* Scope Control
* Technical Review
* Risk Assessment

GPT must prevent:

* Over Engineering
* Scope Creep
* Technology Bloat

---

## Cursor Agent

Role:

Worker

Responsibilities:

* Coding
* Refactoring
* Testing
* Build
* Deployment

Cursor Agent must follow this Constitution.

---

# 6. GitHub Source of Truth Policy

All project assets must originate from GitHub.

Workflow:

Idea
→ Dyad
→ Cursor Agent
→ GitHub
→ QA
→ Production

Direct production editing is prohibited.

---

# 7. Knowledge Management Policy

## Priority Order

Priority 1

GitHub Repository

---

Priority 2

KB Directory

/docs/KB/

---

Priority 3

Markitdown-Lab

Cross-project standard for:

* Document ingestion
* Markdown conversion
* Chunking
* Retrieval
* Context Engineering
* Token Reduction

---

Priority 4

Project Documentation

README
Architecture
Runbooks
QA Reports

---

# 8. Token Optimization Policy

## Rule 1

Reuse Before Generate

Before creating anything new:

Check:

* Existing Components
* Existing Documents
* Existing Templates
* Existing Assets

---

## Rule 2

Markdown First

Knowledge must be stored in Markdown.

Do not rely on chat history.

---

## Rule 3

Context Pack First

Use curated context.

Avoid large prompt dumps.

---

## Rule 4

Chunk Not Dump

Large files must be:

* Chunked
* Indexed
* Retrieved

Never paste large documents directly into AI.

---

## Rule 5

Skill First

Agent must use available skills before inventing new workflows.

---

# 9. Mandatory Agent Skills

Required Skills

* TOKEN_SAVIOR_WORKFLOW
* BUILD_VERIFICATION
* RUNTIME_QA
* RELEASE_SAFETY_CHECK
* HOMEPAGE_REVIEW
* A11Y_REVIEW

Future skills must be added to the Skills Registry.

---

# 10. Runtime QA Policy

Build Success does NOT mean Release Ready.

Required:

* Build Verification
* Route Verification
* Mobile Verification
* Dashboard Verification
* Broken Link Check
* Runtime Log Review

Production must remain untouched during QA.

---

# 11. MVP Scope

Required:

* Home Page
* Dashboard
* Categories 1-7
* Evidence Library
* Document Center
* Search

---

Not Included:

* Login
* Authentication
* RBAC
* Workflow Engine
* AI Chatbot
* Database
* Mobile App

Unless approved by Product Owner.

---

# 12. Forbidden Architecture

The following are prohibited during MVP:

* Kubernetes
* Microservices
* Redis
* Message Queue
* GraphQL
* PostgreSQL
* MongoDB
* Elasticsearch

Unless a written architectural decision is approved.

---

# 13. Evidence Strategy

Evidence is a first-class citizen.

Structure:

public/documents/

Store:

* PDF
* XLSX
* DOCX
* Images
* Videos

Evidence metadata:

JSON

No database required.

---

# 14. Dashboard Strategy

Data Sources:

* CSV
* JSON

Preferred Flow:

Excel
→ CSV
→ GitHub
→ Astro
→ Dashboard

Avoid unnecessary backend processing.

---

# 15. Performance Targets

Lighthouse ≥ 95

Homepage Load < 2 Seconds

Mobile First

Responsive 100%

Minimal JavaScript

---

# 16. Release Workflow

Architecture Review
→ Agent Execution
→ Runtime QA
→ GitHub Commit
→ Release Approval
→ Production Deployment

No exceptions.

---

# 17. Success Criteria

The platform is successful when:

* Executive users understand it immediately
* Auditors can locate evidence easily
* Staff can maintain it easily
* Dashboard is accurate
* Site loads quickly
* Joomla is no longer required

---

# 18. Project Motto

Dyad designs fast.

Astro loads fast.

Cursor builds.

GitHub preserves truth.

GPT prevents chaos.

Product Owner decides.


---

# SECTION F — DASHBOARD DATA SOURCE MAP

## F1. Current Source Files

### Water
- File: `1.1-Water.xlsx`
- Domain: Water consumption
- Intended use:
  - monthly trend
  - annual comparison
  - target comparison
  - dashboard source
  - related criteria evidence

### Electricity
- File: `12-elect.xlsx`
- Domain: Electricity consumption
- Intended use:
  - monthly electricity use
  - annual trend
  - target comparison
  - related GHG calculation
  - dashboard source

### Greenhouse Gas
- File: `1.5_GreenhouseGas.xlsx`
- Domain: Greenhouse gas inventory / calculation
- Intended use:
  - Scope / category calculation
  - annual and monthly comparison
  - baseline comparison
  - target tracking
  - evidence for GHG indicators

## F2. Required Data Pipeline

```text
Excel
→ Normalize
→ Validate
→ Generated JSON
→ Astro
→ Dashboard
→ Related Indicator
→ Evidence
```

## F3. Data Rules

- Do not hardcode chart values in UI components.
- Maintain year labels clearly.
- Distinguish baseline year, previous year, current year, and target.
- Dashboard values must have traceable source data.
- Data transformation scripts and generated JSON should be committed to GitHub when appropriate.
- Excel remains source data; generated JSON is runtime-consumable data.

---

# SECTION G — DESIGN REFERENCE INDEX

The following images are visual references only. They are not architecture truth.

## G1. Smart Environmental Dashboard

File:
`แดชบอร์ดข้อมูลสิ่งแวดล้อมอัจฉริยะ.png`

Use for:
- executive dashboard inspiration
- KPI hierarchy
- modern environmental visual language

## G2. Environmental Performance Dashboard

File:
`แดชบอร์ดติดตามประสิทธิภาพด้านสิ่งแวดล้อม.png`

Use for:
- trend visualization
- target/status presentation
- performance storytelling

## G3. Environmental Management Strategy

File:
`แผนยุทธศาสตร์ระบบบริหารสิ่งแวดล้อมอัจฉริยะ.png`

Use for:
- strategic communication
- architecture storytelling
- executive presentation

## G4. Green Office Data Diagram

File:
`แผนภาพข้อมูลสำหรับสำนักงานสีเขียว.png`

Use for:
- data flow thinking
- information architecture
- evidence-to-dashboard relationship

## Design Reference Rule

Do not copy these images literally.

Use them as inspiration for:
- hierarchy
- information density
- visual storytelling
- environmental identity

Final UI must follow:
- Astro implementation
- Platform Blueprint V3
- Content Architecture V2
- accessibility
- mobile first
- performance first

---

# SECTION H — HISTORICAL CONTEXT

## H1. 2568 → 2569 Criteria Reference

The following historical working file may be used for comparison only:

`เกณฑ์ตรวจประเมิน2568_Update9369.txt`

It must not override the official 2569 criteria.

### Key known direction

Green Office 2569 for renewal / upgrade continues to use:

- 7 categories
- 24 issues
- 65 indicators

The 2569 structure places explicit emphasis on:
- measurable targets
- historical continuity
- greenhouse gas analysis
- continuous improvement
- category 7 continuity and development

### Historical Working Content

การตรวจสอบเอกสาร เกณฑ์การประเมินสำนักงานสีเขียว (Green Office) ปี 2568 สำหรับหน่วยงานที่ขอต่ออายุการรับรองหรือขอยกระดับการรับรอง (7 หมวด 24 ประเด็น 65 ตัวชี้วัด) สามารถสรุปหัวข้อหมวด ประเด็น และตัวชี้วัดได้ดังนี้ครับ
________________________________________
หมวดที่ 1: การกำหนดนโยบาย การวางแผนการดำเนินงานสำนักงานสีเขียว
1.1 การกำหนดแนวทางการดำเนินงานสำนักงานสีเขียว 
1.1.1 มีบริบทองค์กรและขอบเขตของการจัดการสิ่งแวดล้อมในสำนักงาน 
1.1.2 การกำหนดนโยบายด้านสิ่งแวดล้อมจากผู้บริหารระดับสูง ที่สอดคล้องและครอบคลุมประเด็นตามเกณฑ์สำนักงานสีเขียวโดยแสดงความมุ่งมั่นอย่างต่อเนื่อง
1.1.3 มีการกำหนดเป้าหมาย และตัวชี้วัดที่ชัดเจนด้านการใช้ทรัพยากร พลังงาน และของเสีย และปริมาณก๊าซเรือนกระจก 
1.1.4 มีการกำหนดแผนการดำเนินงานสำนักงานสีเขียวประจำปี 
1.2 คณะทำงานด้านสิ่งแวดล้อม 
1.2.1 มีการแต่งตั้งคณะกรรมการหรือทีมงานด้านสิ่งแวดล้อม 
1.2.2 ร้อยละของคณะกรรมการ หรือทีมงานด้านสิ่งแวดล้อมที่มีความเข้าใจในบทบาท และหน้าที่รับผิดชอบ 
1.3 การระบุประเด็นปัญหาทรัพยากรและสิ่งแวดล้อม 
1.3.1 กิจกรรมทั้งหมดของสำนักงานภายใต้ขอบเขตการขอการรับรอง จะต้องได้รับการระบุและประเมินปัญหาสิ่งแวดล้อม 
1.3.2 การวิเคราะห์และแนวทางการแก้ไขปัญหาสิ่งแวดล้อมที่มีนัยสำคัญ 
1.3.3 แผนงานโครงการที่จัดทำขึ้นเพื่อแก้ไขปัญหาสิ่งแวดล้อมที่มีนัยสำคัญ หรือโครงการที่สอดคล้องกับนโยบาย/กฎหมาย 
1.4 กฎหมายและข้อกำหนดอื่นๆ ที่เกี่ยวข้อง 
1.4.1 มีการรวบรวมกฎหมายสิ่งแวดล้อมและความปลอดภัยที่เกี่ยวข้องกับสำนักงาน 
1.4.2 ประเมินความสอดคล้องของกฎหมายกับการดำเนินงานการจัดการสิ่งแวดล้อมของสำนักงาน 
ข้อมูลก๊าซเรือนกระจก 
1.5 ข้อมูลก๊าซเรือนกระจก
1.5.1 การเก็บข้อมูลก๊าซเรือนกระจกจากกิจกรรมในสำนักงาน 
1.5.2 ปริมาณก๊าซเรือนกระจกบรรลุเป้าหมาย สรุปและการวิเคราะห์ผล 
1.5.3 บุคลากร/ผู้ที่เกี่ยวข้อง (Outsource) มีความรู้ ความเข้าใจเกี่ยวกับก๊าซเรือนกระจกในภาพรวมของสำนักงาน 
1.6 แผนการดำเนินงานและโครงการเพื่อมุ่งสู่การลดก๊าซเรือนกระจกของหน่วยงาน 
1.6.1 จัดทำแผนการดำเนินงานขับเคลื่อนสู่การลดก๊าซเรือนกระจกของหน่วยงาน 
1.6.2 โครงการที่นำไปสู่การลดก๊าซเรือนกระจกของหน่วยงาน 
1.7 การทบทวนฝ่ายบริหาร 
1.7.1 การกำหนดองค์ประชุมทบทวนฝ่ายบริหาร 
1.7.2 มีการกำหนดวาระการประชุมและทำการประชุมทบทวนฝ่ายบริหาร 
________________________________________
หมวดที่ 2: การสื่อสารและสร้างจิตสำนึก
2.1 การอบรมให้ความรู้และประเมินความเข้าใจ 
2.1.1 กำหนดแผนการฝึกอบรม ดำเนินการอบรม การประเมินผล และบันทึกประวัติการฝึกอบรม 
2.1.2 กำหนดผู้รับผิดชอบด้านการอบรมแต่ละหลักสูตรมีความเหมาะสม 
2.2 การรณรงค์และประชาสัมพันธ์แก่บุคลากร 
2.2.1 มีการกำหนดผู้รับผิดชอบและแนวทางสื่อสารด้านสิ่งแวดล้อมทั้งภายในและภายนอกสำนักงาน 
2.2.2 มีการรณรงค์สื่อสารและให้ความรู้ตามที่กำหนดตามในข้อ 2.2.1
2.2.3 ร้อยละความเข้าใจนโยบายสิ่งแวดล้อมและการดำเนินงานสำนักงานสีเขียว(สุ่มอย่างน้อย 4 คน) 
2.2.4 มีช่องทางรับข้อเสนอแนะ/ข้อคิดเห็นด้านสิ่งแวดล้อม และนำมาปรับปรุงแก้ไข 
________________________________________
หมวดที่ 3: การใช้ทรัพยากรและพลังงาน
3.1 การใช้น้ำ 
3.1.1 มาตรการหรือแนวทางใช้น้ำมีความเหมาะสมกับสำนักงาน 
3.1.2 มีการจัดทำข้อมูลการใช้น้ำต่อหน่วยเปรียบเทียบกับเป้าหมาย และวิเคราะห์ผล 
3.1.3 การปฏิบัติตามมาตรการประหยัดน้ำในพื้นที่ทำงาน 
3.2 การใช้พลังงาน 
3.2.1 มาตรการหรือแนวทางการใช้ไฟฟ้าเหมาะสมกับสำนักงาน 
3.2.2 มีการจัดทำข้อมูลการใช้ไฟฟ้าต่อหน่วยเปรียบเทียบกับเป้าหมาย และวิเคราะห์ผล 
3.2.3 การปฏิบัติตามมาตรการประหยัดไฟฟ้าในพื้นที่ทำงาน 
3.2.4 มาตรการหรือแนวทางการใช้น้ำมันเชื้อเพลิงในการเดินทางที่เหมาะสมกับสำนักงาน 
3.2.5 มีการจัดทำข้อมูลการใช้น้ำมันเชื้อเพลิงต่อระยะทางเปรียบเทียบกับเป้าหมาย และวิเคราะห์ผล 
3.3 การใช้ทรัพยากรอื่นๆ 
3.3.1 มาตรการหรือแนวทางการใช้กระดาษที่เหมาะสมกับสำนักงาน 
3.3.2 มีการจัดทำข้อมูลการใช้กระดาษต่อหน่วยเปรียบเทียบกับเป้าหมาย และวิเคราะห์ผล 
3.3.3 การปฏิบัติตามมาตรการประหยัดกระดาษในพื้นที่ทำงาน 
3.3.4 มาตรการหรือแนวทางการใช้หมึกพิมพ์ อุปกรณ์เครื่องเขียน วัสดุอุปกรณ์เหมาะสมกับสำนักงาน 
3.3.5 การดำเนินตามมาตรการประหยัดการใช้หมึกพิมพ์ อุปกรณ์เครื่องเขียน วัสดุอุปกรณ์สำนักงาน 
3.4 การประชุมและการจัดนิทรรศการ 
3.4.1 มาตรการหรือแนวทางการจัดการประชุมและนิทรรศการที่เป็นมิตรกับสิ่งแวดล้อม 
3.4.2 การจัดการประชุมและนิทรรศการที่มีการใช้วัสดุที่เป็นมิตรกับสิ่งแวดล้อม ลดการใช้ทรัพยากร-พลังงานและลดของเสีย 
________________________________________
หมวดที่ 4: การจัดการของเสีย
4.1 การจัดการขยะ 
4.1.1 มาตรการหรือแนวทางจัดการขยะที่เหมาะสมกับสำนักงาน 
4.1.2 มีการดำเนินงานตามแนวทางการคัดแยก รวบรวม และกำจัดขยะอย่างเหมาะสม 
4.1.3 การนำขยะกลับมาใช้ประโยชน์หรือนำกลับมาใช้ใหม่ ส่งผลให้ขยะที่จะส่งไปกำจัดมีปริมาณน้อยลง
4.2 การจัดการน้ำเสีย 
4.2.1 การจัดการน้ำเสียของสำนักงาน และคุณภาพน้ำทิ้งจะต้องอยู่ในมาตรฐานกฎหมายที่เกี่ยวข้อง 
4.2.2 การจัดการดูแลการบำบัดน้ำเสีย 
________________________________________
หมวดที่ 5: สภาพแวดล้อมและความปลอดภัย
5.1 อากาศในสำนักงาน 
5.1.1 การควบคุมมลพิษทางอากาศในสำนักงาน 
5.1.2 มีการรณรงค์ไม่สูบบุหรี่หรือมีการกำหนดพื้นที่สูบบุหรี่ที่เหมาะสมและปฏิบัติตามที่กำหนด 
5.1.3 การจัดการมลพิษทางอากาศจากการก่อสร้าง ปรับปรุง อาคาร หรืออื่นๆ ในสำนักงานที่จะส่งผลต่อบุคลากร
5.2 แสงในสำนักงาน 
5.2.1 มีการตรวจวัดความเข้มของแสงสว่าง(โดยอุปกรณ์การตรวจวัดฯ)และดำเนินการแก้ไขตามที่มาตรฐานกำหนด 
5.3 เสียง 
5.3.1 การควบคุมมลพิษทางเสียงภายในอาคารสำนักงาน 
5.3.2 การจัดการเสียงดังจากการก่อสร้าง ปรับปรุง อาคารหรืออื่นๆในสำนักงานที่จะส่งผลต่อบุคลการ
5.4 ความน่าอยู่ 
5.4.1 มีการวางแผนจัดการความน่าอยู่ของสำนักงาน 
5.4.2 ร้อยละการใช้สอยพื้นที่เป็นไปตามวัตถุประสงค์ที่สำนักงานกำหนด 
5.4.3 ร้อยละการดูแลบำรุงรักษาพื้นที่ต่างๆ เช่นพื้นที่สีเขียว พื้นที่พักผ่อนหย่อยใจ
5.4.4 มีการควบคุมสัตว์พาหะนำโรคและดำเนินการได้ตามที่กำหนด 
5.5 การเตรียมพร้อมต่อสภาวะฉุกเฉิน 
5.5.1 การอบรมฝึกซ้อมดับเพลิงและอพยพหนีไฟตามแผนที่กำหนด 
5.5.2 มีแผนฉุกเฉินที่เป็นปัจจุบันและเหมาะสม และร้อยละของบุคลากรที่เข้าใจแผนฉุกเฉิน(สุ่มสอบถามอย่างน้อย 4 คน) 
5.5.3 ความเพียงพอและการพร้อมใช้งานของอุปกรณ์ระบบดับเพลิงและป้องกันอัคคีภัย และสัญญาณแจ้งเหตุเพลิงไหม้ และร้อยละของบุคลากรทราบวิธีการใช้และตรวจสอบอุปกรณ์ดังกล่าว(สุ่มสอบถามอย่างน้อย 4 คน) 
________________________________________
หมวดที่ 6: การจัดซื้อและจัดจ้าง
6.1 การจัดซื้อสินค้า 
6.1.1 การจัดซื้อสินค้าที่เป็นมิตรกับสิ่งแวดล้อม 
6.1.2 รายงานการจัดซื้อสินค้าประเภทวัสดุอุปกรณ์ในสำนักงานที่เป็นมิตรกับสิ่งแวดล้อม 
6.1.3 ร้อยละของปริมาณและประเภทของวัสดุอุปกรณ์ในสำนักงานที่เป็นมิตรกับสิ่งแวดล้อม 
6.2 การจัดจ้าง 
6.2.1 การจัดจ้างหน่วยงานหรือบุคคลที่มีการดำเนินงานที่เป็นมิตรกับสิ่งแวดล้อม 
6.2.2 การตรวจสอบด้านการดูแลสิ่งแวดล้อมในพื้นที่ปฏิบัติงาน ของหน่วยงานหรือบุคคลที่เข้ามาดำเนินการ เช่น ผู้รับจ้าง ผู้รับจ้างช่วง แม่บ้าน รปภ. บุคลากรส่งเอกสาร เป็นต้น
6.2.3 แนวทางของการเลือกใช้บริการที่เป็นมิตรกับสิ่งแวดล้อม (นอกสำนักงาน) 
________________________________________
หมวดที่ 7: การดำเนินงานสำนักงานสีเขียวเพื่อความต่อเนื่อง (สำหรับต่ออายุ/ยกระดับ) 
7.1 การตรวจประเมินสำนักงานสีเขียวเพื่อให้เกิดการปรับปรุงอย่างต่อเนื่อง 
ประกอบด้วยเกณฑ์ย่อย 5 ข้อ (การแต่งตั้งคณะกรรมการ, ความถี่, ข้อกำหนด, ผู้ตรวจประเมิน, การดำเนินการตรวจประเมินภายใน) 
7.2 การพัฒนาหรือต่อยอดการดำเนินงานสำนักงานสีเขียว (เริ่มใช้ปี 2569) 
ประกอบด้วยเกณฑ์ย่อย 4 ข้อ (การต่อยอดสู่มาตรฐานอื่น, การส่งเสริมความรู้ให้หน่วยงานอื่น, การสร้างเครือข่าย/พี่เลี้ยง, กิจกรรมร่วมกับชุมชน)



> Historical content may be truncated in this master pack. Use the original file only when detailed comparison is required.

---

## H2. Legacy Website Content

Legacy Green Office website content is historical migration input only.

Original file:
`Website-สำนักงานสีเขียว-(Green-Office)-ปี2566-67-เว็บเดิม.txt`

Use for:
- content inventory
- identifying reusable public content
- identifying historical evidence links
- migration planning

Do not use the legacy website structure as the architecture for the new platform.

### Legacy Content Sample / Reference

https://researchex.mju.ac.th/goffice/

> Legacy content may be truncated in this master pack. The original file should only be added when active migration work requires it.

---

# SECTION I — FILES TO UPLOAD TO THE NEW CHATGPT PROJECT

## Mandatory

1. `GOFFICE2026_NEW_PROJECT_MASTER_REFERENCE.md`
2. `เกณฑ์การประเมินสำนักงานสีเขียว-ปี-2569.pdf`

## Recommended Data Sources

3. `1.1-Water.xlsx`
4. `12-elect.xlsx`
5. `1.5_GreenhouseGas.xlsx`

## Recommended Design References

6. `แดชบอร์ดข้อมูลสิ่งแวดล้อมอัจฉริยะ.png`
7. `แดชบอร์ดติดตามประสิทธิภาพด้านสิ่งแวดล้อม.png`
8. `แผนยุทธศาสตร์ระบบบริหารสิ่งแวดล้อมอัจฉริยะ.png`
9. `แผนภาพข้อมูลสำหรับสำนักงานสีเขียว.png`

## Optional Historical Reference

10. `Website-สำนักงานสีเขียว-(Green-Office)-ปี2566-67-เว็บเดิม.txt`
11. `เกณฑ์ตรวจประเมิน2568_Update9369.txt`

---

# SECTION J — FILES NOT TO ADD TO THE NEW ACTIVE PROJECT CONTEXT

Do not add unless a specific historical or security task requires them:

- Joomla plugin reports
- Joomla Docker stack documentation
- Joomla AGENTS.md
- Joomla Cursor rules
- Security Incident KB
- ThaiCERT incident dossier
- forensic reports
- 2700.pdf
- legacy production operations notes

These belong to the historical/security workstream, not the active Astro platform context.

---

# SECTION K — START PROMPT FOR A NEW CHATGPT PROJECT

Use this as the first project instruction or first chat message:

> This project is the active development context for Green Office 2026 — Environmental Intelligence & Evidence Platform.
>
> Read `GOFFICE2026_NEW_PROJECT_MASTER_REFERENCE.md` first.
>
> The active repository is `numtip/goffice2026`.
> GitHub Pages is Preview only. Production is Linux VPS + Nginx.
>
> Follow:
> 1. Platform Blueprint V3
> 2. Content Architecture V2
> 3. Official Green Office 2569 criteria
>
> Use the principles:
> - Reuse Before Build
> - Static First
> - Evidence First
> - Content First
> - Performance First
> - Maintainability First
>
> Do not reintroduce Joomla, CMS complexity, database, authentication, workflow engines, or backend services unless explicitly approved through an architectural decision.
>
> Before implementing major changes:
> 1. Audit the current repository
> 2. Reuse existing components and data
> 3. Produce a gap analysis
> 4. Implement incrementally
> 5. Verify build and runtime
>
> Core product principle:
> **Show. Measure. Prove. Improve.**

---

# END OF MASTER REFERENCE PACK
