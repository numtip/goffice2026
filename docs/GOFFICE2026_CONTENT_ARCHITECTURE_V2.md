# GOFFICE2026_CONTENT_ARCHITECTURE_V2

**Project:** Green Office 2026\
**Document Type:** Canonical Content Architecture\
**Version:** 2.0\
**Status:** ACTIVE REFERENCE\
**Updated:** 2026-07-15\
**Parent Reference:** `GREENOFFICE2026_PLATFORM_BLUEPRINT_V3.md`

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
