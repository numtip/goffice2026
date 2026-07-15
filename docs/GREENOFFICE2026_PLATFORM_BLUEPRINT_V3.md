# GREEN OFFICE 2026 --- PLATFORM BLUEPRINT V3.0

**Project:** Green Office 2026 --- Environmental Intelligence & Evidence
Platform\
**Repository:** `numtip/goffice2026`\
**Status:** ACTIVE --- CANONICAL REFERENCE\
**Version:** 3.0\
**Updated:** 2026-07-15\
**Supersedes:** Earlier Green Office website-oriented blueprint where
inconsistent with this document

------------------------------------------------------------------------

## 1. Mission

สร้างแพลตฟอร์ม Green Office รุ่นใหม่ของสำนักวิจัยและส่งเสริมวิชาการการเกษตร
มหาวิทยาลัยแม่โจ้ ที่ทำหน้าที่พร้อมกัน 4 ด้าน:

1.  **Show** ---
    สื่อสารผลงานและผลกระทบด้านสิ่งแวดล้อมให้ประชาชนและบุคลากรเข้าใจง่าย
2.  **Measure** --- แสดงผลการดำเนินงาน ตัวชี้วัด เป้าหมาย
    และแนวโน้มให้ผู้บริหารใช้ตัดสินใจ
3.  **Prove** --- เชื่อมโยงเกณฑ์ ตัวชี้วัด และหลักฐานให้ผู้ตรวจประเมินค้นพบได้รวดเร็ว
4.  **Improve** --- ทำให้ทีมงานเห็นช่องว่าง วิเคราะห์สาเหตุ
    และปรับปรุงการดำเนินงานอย่างต่อเนื่อง

แพลตฟอร์มนี้ไม่ใช่เพียงเว็บไซต์ประชาสัมพันธ์และไม่ใช่ CMS ทั่วไป แต่เป็น:

> **Green Office 2026 --- Environmental Intelligence & Evidence
> Platform**

------------------------------------------------------------------------

## 2. Strategic Positioning

### 2.1 Primary Identity

แพลตฟอร์มประกอบด้วย 4 capability หลัก:

-   **Public Story Platform**
-   **Environmental Performance Portal**
-   **Digital Evidence Navigator**
-   **Green Office Knowledge & Activity Hub**

### 2.2 Primary Audiences

  --------------------------------------------------------------------------
  Audience                Primary Question           Platform Response
  ----------------------- -------------------------- -----------------------
  ประชาชน                 หน่วยงานทำอะไรด้านสิ่งแวดล้อม   Impact story,
                                                     activities, public
                                                     results

  บุคลากร                  ต้องรู้และปฏิบัติอะไร            Policy, measures,
                                                     knowledge media,
                                                     activities

  ผู้บริหาร                  ผลงานเป็นอย่างไร             Executive Dashboard,
                          เทียบเป้าหมายหรือไม่           trends, analysis

  ผู้ตรวจประเมิน             หลักฐานของตัวชี้วัดอยู่ที่ไหน       Indicator pages,
                                                     evidence metadata,
                                                     search

  ทีม Green Office         อะไรยังขาดและต้องปรับปรุง      Evidence status,
                                                     analysis, historical
                                                     continuity
  --------------------------------------------------------------------------

------------------------------------------------------------------------

## 3. Canonical Governance Basis

โครงสร้างข้อมูลและการนำเสนอของระบบต้องอ้างอิงเกณฑ์ Green Office ปี 2569 เป็นหลัก
โดยสำหรับการต่ออายุหรือยกระดับให้รองรับ:

-   **7 หมวด**
-   **24 ประเด็น**
-   **65 ตัวชี้วัด**

Canonical taxonomy:

``` text
Category
  → Issue / Section
    → Indicator
      → Requirement Summary
      → Performance / Implementation
      → Evidence
      → Historical Data
```

ห้ามออกแบบ navigation หรือ content model
ที่ทำให้ความสัมพันธ์ระหว่างเกณฑ์กับหลักฐานสูญหาย

------------------------------------------------------------------------

## 4. Architecture Principles

### 4.1 Simple First

เลือกวิธีที่ง่ายที่สุดที่ตอบโจทย์จริง

### 4.2 Static First

ประเมิน Markdown, MDX, JSON และ CSV ก่อน Database, API หรือ Backend

### 4.3 Content First

เนื้อหา โครงสร้างเกณฑ์ และคุณภาพหลักฐานสำคัญกว่าเทคโนโลยี

### 4.4 Evidence First

Evidence เป็น first-class citizen ไม่ใช่เพียงไฟล์ดาวน์โหลดท้ายหน้า

### 4.5 Performance First

เว็บไซต์ต้องเร็ว ใช้ JavaScript เท่าที่จำเป็น และรองรับ Mobile First

### 4.6 Maintainability First

เจ้าหน้าที่ในอนาคตต้องสามารถเพิ่มข้อมูล เอกสาร และข้อมูล Dashboard
ได้โดยไม่ต้องเข้าใจระบบซับซ้อน

### 4.7 Reuse Before Build

ก่อนสร้าง component, workflow หรือระบบใหม่ ต้องตรวจของที่มีอยู่ใน repository และ
ecosystem ก่อน

### 4.8 One Source, Many Views

ข้อมูลหนึ่งชุดต้องถูก reuse ไปยังหลายหน้าได้โดยไม่ copy เนื้อหาซ้ำ

ตัวอย่าง:

``` text
Evidence Metadata
  ├── Indicator Page
  ├── Evidence Library
  ├── Search
  ├── Latest Evidence
  └── Related Dashboard
```

------------------------------------------------------------------------

## 5. Approved Technology Blueprint

### Design

-   Dyad / design references / rapid prototyping

### Frontend

-   Astro
-   Tailwind CSS

### Content & Data

-   Markdown / MDX
-   JSON
-   CSV
-   Generated JSON from normalized source data

### Source of Truth

-   GitHub repository

### Hosting

-   GitHub Pages = Preview only
-   Linux VPS + Nginx = Production

### MVP Backend Policy

ไม่ใช้ Database, Authentication, RBAC, Workflow Engine หรือ custom CMS
เว้นแต่มี ADR และ Product Owner อนุมัติ

------------------------------------------------------------------------

## 6. Platform Information Architecture

``` text
GREEN OFFICE 2026
│
├── HOME
│
├── PUBLIC STORY
│   ├── About Green Office
│   ├── Organization Context & Scope
│   ├── Environmental Policy
│   ├── Goals & Targets
│   ├── Committee & Working Teams
│   ├── Annual Action Plan
│   ├── Awards & Certification
│   └── Feedback / Contact
│
├── PERFORMANCE
│   ├── Executive Dashboard
│   ├── Electricity
│   ├── Water
│   ├── Fuel
│   ├── Paper
│   ├── Waste
│   └── Greenhouse Gas
│
├── AUDIT & EVIDENCE
│   ├── Categories 1–7
│   ├── Issues / Sections
│   ├── Indicator Pages
│   ├── Evidence Library
│   ├── Document Center
│   └── Search
│
└── ENGAGEMENT
    ├── Activities
    ├── Campaigns
    ├── Training
    └── Environmental Knowledge Media
```

------------------------------------------------------------------------

## 7. Homepage Blueprint --- Impact First

หน้าแรกต้องตอบคำถามภายในไม่กี่วินาทีว่า:

-   เราคือใคร
-   กำลังทำอะไร
-   ผลลัพธ์เป็นอย่างไร
-   จะดูข้อมูลหรือหลักฐานต่อได้ที่ไหน

### Required Homepage Sections

1.  **Hero**
    -   Green Office 2026 identity
    -   concise mission statement
    -   CTA: ดูผลการดำเนินงาน
    -   CTA: ค้นหาหลักฐาน
2.  **Environmental Pulse**
    -   KPI snapshot ของตัวชี้วัดสำคัญ
3.  **7 Dimensions of Green Office**
    -   7 category cards
4.  **Performance Story**
    -   trend / target / year comparison
5.  **Featured Action or Project**
    -   โครงการเด่นหรือนวัตกรรม
6.  **Latest Evidence**
    -   เอกสารหรือหลักฐานที่เพิ่ม/อัปเดตล่าสุด
7.  **Activities & Knowledge**
    -   กิจกรรม การอบรม สื่อรณรงค์
8.  **Trust & Navigation Footer**
    -   organization, contact, related links, accessibility

### Homepage Rule

ห้ามใช้หน้าแรกเป็นรายการข่าวยาวหรือ directory ของทุกเมนู

------------------------------------------------------------------------

## 8. Environmental Performance Blueprint

### 8.1 Executive Dashboard

ต้องมี KPI หลักอย่างน้อย 7 ด้าน:

1.  Electricity
2.  Fuel
3.  Water
4.  Paper
5.  Recycled / Reused Waste
6.  General Waste
7.  Greenhouse Gas

### 8.2 Every Dashboard Must Answer

> ใช้เท่าไร → เป้าหมายเท่าไร → แนวโน้มเป็นอย่างไร → เพราะอะไร → ทำอะไรต่อ

### 8.3 Dashboard Content Pattern

``` text
KPI Summary
→ Target Status
→ Monthly / Annual Trend
→ Baseline Comparison
→ Analysis
→ Corrective / Improvement Action
→ Related Evidence
```

### 8.4 Data Pipeline

``` text
Excel
  → Normalize
  → Validate
  → Generated JSON
  → Astro
  → Dashboard
  → Auditor / Executive View
```

ห้ามกรอกค่ากราฟซ้ำด้วยมือใน component หากสามารถ generate จาก source data ได้

------------------------------------------------------------------------

## 9. Categories and Indicator Pages

### 9.1 Category Page

แต่ละหมวดต้องมี:

-   ชื่อและคำอธิบายหมวด
-   เป้าหมายของหมวด
-   รายการประเด็น
-   รายการตัวชี้วัด
-   Evidence readiness summary
-   Related KPI / dashboard
-   Related activities
-   Year filter เมื่อเหมาะสม

### 9.2 Indicator Page

ตัวชี้วัดแต่ละข้อควรมี canonical route และโครงสร้างมาตรฐาน:

``` text
Indicator Code + Title
Status
Year
Responsible Team

1. Requirement Summary
2. Our Implementation
3. Performance / KPI
4. Evidence
5. Historical Evidence
6. Related Indicators / Dashboard
```

### 9.3 Indicator Route Principle

URL ต้อง predictable และ stable เพื่อใช้เป็น reference
ในรายงานและการตรวจประเมิน

------------------------------------------------------------------------

## 10. Evidence Library Blueprint

Evidence Library ไม่ใช่หน้า Download

### Required Metadata

``` json
{
  "id": "GO-2569-1.5.2-001",
  "title": "รายงานการปล่อยก๊าซเรือนกระจก ประจำปี 2569",
  "year": 2569,
  "category": "1",
  "indicator": "1.5.2",
  "type": "report",
  "status": "approved",
  "date": "2026-06-30",
  "file": "/documents/..."
}
```

### Recommended Additional Fields

-   description
-   issue / section
-   responsibleTeam
-   tags
-   visibility
-   source
-   updatedAt
-   relatedDashboard
-   relatedEvidence

### Evidence Capabilities

-   Browse by category
-   Browse by indicator
-   Filter by year
-   Filter by document type
-   Search
-   Latest updated
-   Historical continuity
-   Direct link from indicator page

### Evidence Rule

เอกสารหนึ่งชิ้นต้องมี metadata หนึ่งแหล่ง และสามารถถูกแสดงหลายบริบทโดยไม่สร้างข้อมูลซ้ำ

------------------------------------------------------------------------

## 11. Public Story & Engagement

ระบบต้องแยก "หลักฐาน" ออกจาก "เรื่องเล่าเพื่อสาธารณะ" แต่เชื่อมโยงกันได้

### Public Content Types

-   Activities
-   Campaigns
-   Training
-   Knowledge Media
-   Featured Projects
-   Success Stories
-   Innovation / Continuous Improvement

### Content Principle

กิจกรรมหนึ่งรายการสามารถเชื่อมกับ:

-   Category
-   Indicator
-   Evidence
-   Environmental objective

------------------------------------------------------------------------

## 12. Search and Discovery

Search ต้องรองรับอย่างน้อย:

-   ชื่อเอกสาร
-   รหัสตัวชี้วัด
-   หมวด
-   ปี
-   ประเภทหลักฐาน
-   keyword / tag

### Priority Search Use Case

ผู้ตรวจพิมพ์ `3.2.2` แล้วต้องพบ:

-   หน้าตัวชี้วัด
-   หลักฐานที่เกี่ยวข้อง
-   Dashboard ไฟฟ้า
-   รายงานวิเคราะห์ผล

------------------------------------------------------------------------

## 13. Content Model Strategy

Recommended source structure:

``` text
src/
  content/
    about/
    activities/
    knowledge/
    indicators/

src/data/
  criteria/
  evidence/
  dashboard/
  generated/

public/
  documents/
  images/
```

รายละเอียดจริงต้องตรวจ repository ปัจจุบันก่อนเปลี่ยน path
เพื่อหลีกเลี่ยงการรื้อของเดิมโดยไม่จำเป็น

------------------------------------------------------------------------

## 14. UX Principles

### For Public

-   เข้าใจง่าย
-   visual storytelling
-   mobile friendly
-   ไม่ใช้ภาษาราชการมากเกินจำเป็น

### For Executive

-   KPI first
-   target and trend visible
-   exception / problem visible

### For Auditor

-   indicator code visible
-   evidence reachable in minimal clicks
-   historical data traceable
-   stable URLs

### For Staff

-   content update workflow simple
-   metadata template standardized

------------------------------------------------------------------------

## 15. What We Will Not Build During Current Scope

ห้ามเพิ่มโดยไม่มี ADR และ approval:

-   Custom CMS
-   New Admin Backend
-   Database only for metadata
-   Authentication / RBAC
-   Workflow Engine
-   Microservices
-   GraphQL
-   Elasticsearch
-   Kubernetes
-   Redis
-   Message Queue
-   AI Chatbot

Search และ content management ให้เริ่มจาก static architecture ก่อน

------------------------------------------------------------------------

## 16. Quality Gates

### Build

-   Astro build PASS
-   type / content validation PASS

### Runtime

-   all required routes accessible
-   mobile verification
-   dashboard verification
-   broken link check
-   document link check

### Content

-   category taxonomy complete
-   indicator code valid
-   evidence metadata valid
-   no orphan critical evidence

### Performance

-   Lighthouse target ≥ 95
-   Homepage target load \< 2 seconds under defined test conditions
-   minimal client-side JavaScript

### Accessibility

-   keyboard navigation
-   semantic headings
-   readable contrast
-   alt text
-   accessible charts / data summaries

------------------------------------------------------------------------

## 17. Implementation Strategy

### Phase 1 --- Audit Before Change

ตรวจ repository ปัจจุบัน:

-   routes
-   components
-   content
-   dashboard pipeline
-   evidence schema
-   search
-   reusable assets

### Phase 2 --- Gap Analysis

เปรียบเทียบ current state กับ Blueprint V3.0 และ Content Architecture V2

### Phase 3 --- Foundation Upgrade

ปรับ:

-   taxonomy
-   content model
-   shared page templates
-   evidence metadata

### Phase 4 --- Experience Upgrade

ปรับ:

-   homepage impact-first
-   executive dashboard
-   category and indicator UX
-   search and discovery

### Phase 5 --- Content Migration / Completion

นำเนื้อหาและหลักฐานจริงเข้าสู่ canonical structure

### Phase 6 --- QA and Preview

GitHub Pages preview → runtime QA → Product Owner approval

### Phase 7 --- Production

deploy to VPS only after approval

------------------------------------------------------------------------

## 18. Decision Rules

เมื่อมีแนวคิดใหม่ ให้ถามตามลำดับ:

1.  สอดคล้องกับ Green Office 2569 หรือไม่
2.  ช่วย Public, Executive, Auditor หรือ Staff อย่างไร
3.  มีของเดิม reuse ได้หรือไม่
4.  ทำแบบ static ได้หรือไม่
5.  เพิ่ม maintenance burden หรือไม่
6.  ทำให้ evidence traceability ดีขึ้นหรือแย่ลง
7.  ต้องมี ADR หรือไม่

หาก feature ใหม่ไม่ตอบโจทย์ผู้ใช้หรือเกณฑ์ และเพิ่ม complexity ให้ defer

------------------------------------------------------------------------

## 19. Success Criteria

แพลตฟอร์มสำเร็จเมื่อ:

-   ประชาชนเข้าใจผลงานด้านสิ่งแวดล้อมได้ทันที
-   ผู้บริหารเห็นสถานะเทียบเป้าหมายและแนวโน้ม
-   ผู้ตรวจค้นหลักฐานตามตัวชี้วัดได้รวดเร็ว
-   ทีมงานดูแลข้อมูลโดยไม่ต้องใช้ระบบซับซ้อน
-   ข้อมูลหนึ่งชุดถูก reuse ได้หลายบริบท
-   Dashboard เชื่อมกับหลักฐานและการวิเคราะห์
-   ข้อมูลย้อนหลังตรวจสอบได้
-   เว็บไซต์เร็ว ปลอดภัย และดูแลรักษาง่าย

------------------------------------------------------------------------

## 20. Canonical Project Motto

> **Show. Measure. Prove. Improve.**

**Astro delivers speed.\
Data shows performance.\
Evidence proves compliance.\
GitHub preserves truth.\
Architecture prevents chaos.\
Product Owner decides.**
