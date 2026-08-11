# GREEN OFFICE 2026 — PLATFORM BLUEPRINT V4.0

**Project:** Green Office 2026 — Environmental Communication & Assessment Evidence Platform  
**Repository:** `numtip/goffice2026`  
**Status:** ACTIVE — CANONICAL REFERENCE  
**Version:** 4.0  
**Updated:** 2026-07-27 (status addendum 2026-08-11)
**Supersedes:** `GREENOFFICE2026_PLATFORM_BLUEPRINT_V3.md` where inconsistent  
**Architecture Decision:** ADR-0001 — Approval Engine removed from scope

---

## 0. Release Status & Next Priorities (addendum 2026-08-11)

> **Canonical pointer (2026-08-11):** Platform Blueprint **V5** is now the ACTIVE canonical operational baseline — `GREENOFFICE2026_PLATFORM_BLUEPRINT_V5.md` (committed). V4 remains the operational reference for baseline capabilities; V5 supersedes it where inconsistent.

### Current production state

| Item | Value |
|------|-------|
| Release | **v1.5.1** — `RELEASE_CLOSED` / `PRODUCTION_DEPLOYED` |
| Production source SHA | `2bfd7ca` (Engage visual system) |
| Repository `master` HEAD | `5507223` (after closeout docs) |
| Production URL | https://goffice.mju.ac.th/ |
| Release path | `/var/www/goffice/releases/v1.5.1` |
| Rollback | `v1.5.0` / `c796611` — `/var/www/goffice/releases/v1.5.0` (preserved) |
| Smoke | Production routes + Engage TH/EN 8/8 images, uniform 4-col cards, native 16:9 — PASS |
| P0/P1 | none |
| P2 | GitHub Actions Node 20 deprecation · Astro check hints (11, 0 errors) |

> **Not implied:** This status does **not** claim complete evidence coverage or complete FY2569 datasets. Evidence onboarding and FY2569 data remain workstreams below.

### Next priorities (Blueprint V5 direction — PO-confirmed, 2026-08-11)

1. **Verified indicator-level evidence onboarding** — progress GO-EVIDENCE-1 from structure to verified, auditor-ready evidence at indicator level (SharePoint sources, stable links).
2. **FY2569 data maintenance** — maintain/refresh dashboard datasets through the validated Excel → CSV → JSON pipeline; keep partial-year caveats until data is complete.
3. **P2 maintenance (separately)** — GitHub Actions Node 20 deprecation upgrade and Astro check hint cleanup; tracked separately from feature work.

> **Scope guard:** no new UI work. Do not start new landing/dashboard/visual features without PO approval; reuse existing components and the Engage visual system already shipped.

---

---

## 1. Canonical Product Definition

> **Green Office 2026 คือแพลตฟอร์มสื่อสารข้อมูลสิ่งแวดล้อมและศูนย์รวมหลักฐานการประเมิน ไม่ใช่ระบบธุรกรรมหรือระบบอนุมัติองค์กร**

ระบบมีหน้าที่ทำให้ข้อมูลผลการใช้ทรัพยากร ข่าวสาร สื่อสร้างจิตสำนึก และหลักฐานตามเกณฑ์ Green Office เข้าถึงได้ง่าย เชื่อถือได้ และพร้อมใช้สำหรับผู้บริหาร บุคลากร ประชาชน และผู้ตรวจประเมิน

---

## 2. Product Mission

แพลตฟอร์มทำหน้าที่ 4 ด้านหลัก:

1. **Present** — นำเสนอข้อมูลการใช้ทรัพยากรและผลการดำเนินงานให้ผู้บริหารเข้าใจได้รวดเร็ว
2. **Evidence** — จัดหมวดหมู่และเชื่อมโยงหลักฐาน 7 หมวดให้ผู้ตรวจประเมินค้นพบได้ง่าย
3. **Communicate** — ประชาสัมพันธ์ข่าว กิจกรรม ผลงาน และความก้าวหน้าของ Green Office
4. **Engage** — เป็นแหล่งความรู้ สื่อรณรงค์ และกิจกรรมสร้างจิตสำนึกด้านการอนุรักษ์ทรัพยากร

หลักคิดย่อ:

> **Present. Prove. Communicate. Engage.**

---

## 3. Primary Audiences

| Audience | Primary Need | Platform Response |
|---|---|---|
| ผู้บริหาร | เห็นภาพรวมและแนวโน้มการใช้ทรัพยากร | Executive dashboard, KPI, trend, comparison |
| ผู้ตรวจประเมิน | ค้นหลักฐานตามหมวด/ประเด็น/ตัวชี้วัด | Evidence navigator, stable links, SharePoint documents |
| บุคลากร | รู้แนวทางและเข้าถึงสื่อหรือกิจกรรม | Knowledge, campaigns, activities, policies |
| ประชาชน | เข้าใจผลงานและความมุ่งมั่นด้านสิ่งแวดล้อม | Public story, news, highlights, outcomes |
| ทีม Green Office | อัปเดตข้อมูลและหลักฐานได้ง่าย | Standard metadata, reusable content, simple publishing |

---

## 4. Scope

### 4.1 Core Scope

- หน้า Landing Page สองภาษา ไทย–อังกฤษ
- Executive Dashboard สำหรับข้อมูลการใช้ทรัพยากร
- Dashboard รายทรัพยากร: น้ำ ไฟฟ้า น้ำมัน กระดาษ ขยะ และก๊าซเรือนกระจก
- โครงสร้างเกณฑ์ Green Office 7 หมวด / 24 ประเด็น / 65 ตัวชี้วัด
- Evidence Navigator และ Document Center
- ข่าว กิจกรรม โครงการเด่น และผลงาน
- Knowledge & Awareness Media
- Search และ Filter
- Responsive, Accessibility, SEO และ Performance
- Production บน VPS/Nginx พร้อม Preview บน GitHub Pages

### 4.2 Microsoft 365 Scope

ใช้เฉพาะสิ่งที่สำคัญและคุ้มค่า:

#### Microsoft Entra ID

- Authentication สำหรับผู้ดูแล/เจ้าหน้าที่
- Identity และ permission ตามบัญชีมหาวิทยาลัย
- รองรับ secure access ไปยังเอกสาร SharePoint

#### SharePoint

- ที่เก็บเอกสารหลักฐาน 7 หมวด
- Metadata, version history และ permission
- ลิงก์เปิดเอกสารตามสิทธิ์
- Registry/List สำหรับ metadata เมื่อจำเป็น

### 4.3 Explicitly Out of Scope

- Power Automate approval engine
- Multi-stage approval workflow
- Approve/Reject orchestration
- Escalation และ workflow notification
- Transaction processing
- ERP-like functions
- Complex audit engine
- Custom CMS หรือ admin backend ใหม่
- Microservices, GraphQL, Redis, queue, Kubernetes

การเพิ่มสิ่งเหล่านี้ต้องมี ADR และ Product Owner อนุมัติเท่านั้น

---

## 5. Product Capabilities

### 5.1 Executive Environmental Dashboard

ต้องตอบได้ภายในหน้าเดียว:

> ใช้เท่าไร → แนวโน้มเป็นอย่างไร → เทียบปีฐาน/เป้าหมายอย่างไร → จุดใดควรจับตา

KPI หลัก:

1. Electricity
2. Water
3. Fuel
4. Paper
5. Waste
6. Greenhouse Gas

รูปแบบมาตรฐาน:

```text
KPI Summary
→ Monthly Trend
→ Year/Baseline Comparison
→ Interpretation
→ Related Evidence
```

### 5.2 Assessment Evidence Center

โครงสร้าง canonical:

```text
Category
  → Issue / Section
    → Indicator
      → Requirement Summary
      → Implementation Summary
      → Evidence Metadata
      → SharePoint Document Link
```

ความสามารถขั้นต่ำ:

- Browse by category
- Browse by indicator
- Search by code/title/tag
- Filter by year/type
- Stable URLs
- Related evidence and dashboard links

### 5.3 Public Communication

- ข่าวและกิจกรรม
- ผลงานเด่นและรางวัล
- โครงการ/มาตรการลดทรัพยากร
- Success stories
- ภาพและวิดีโอประชาสัมพันธ์

### 5.4 Knowledge & Awareness

- Infographic
- คู่มือและบทความ
- วิดีโอและสื่อรณรงค์
- แนวทางปฏิบัติภายในสำนักงาน
- Campaign assets

---

## 6. Canonical Information Architecture

```text
GREEN OFFICE 2026
│
├── HOME
│
├── ABOUT
│   ├── Context & Scope
│   ├── Policy
│   ├── Goals
│   ├── Committee
│   └── Action Plan
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
├── ASSESSMENT & EVIDENCE
│   ├── Categories 1–7
│   ├── Issues / Sections
│   ├── Indicator Pages
│   ├── Evidence Search
│   └── SharePoint Document Center
│
├── NEWS & ACTIVITIES
│
├── KNOWLEDGE & AWARENESS
│
└── CONTACT / FEEDBACK
```

---

## 7. Approved Architecture

### 7.1 Frontend

- Astro
- Tailwind CSS
- Static-first rendering
- Minimal client JavaScript

### 7.2 Content and Data

- Markdown / MDX
- JSON / CSV
- Generated JSON from validated Excel sources
- Canonical IDs for categories, indicators, evidence, activities, and datasets

### 7.3 Source of Truth

| Domain | Source of Truth |
|---|---|
| Source code and public content | GitHub repository |
| Resource usage data | Validated Excel → normalized generated JSON |
| Evidence document files | SharePoint |
| Evidence metadata | SharePoint Registry or repository export, depending on publication mode |
| Identity | Microsoft Entra ID |

### 7.4 Hosting

- GitHub Pages: preview and acceptance testing
- Linux VPS + Nginx: production
- No production editing directly on server

### 7.5 Integration Pattern

```text
Validated Excel
  → Normalize / Validate
  → Generated JSON
  → Astro Dashboard

SharePoint Libraries / Registry
  → Metadata export or secure links
  → Astro Evidence Navigator

Microsoft Entra ID
  → Staff authentication / secure document access
```

---

## 8. Evidence Publication Modes

เลือกใช้ตามประเภทเอกสาร:

### Mode A — Public Metadata + Secure SharePoint File

เว็บไซต์แสดงชื่อ หมวด ปี คำอธิบาย และลิงก์ ส่วนไฟล์เปิดผ่านสิทธิ์ SharePoint

### Mode B — Public Distribution Copy

เอกสารที่อนุญาตเผยแพร่สาธารณะถูก export เป็น public artifact และเชื่อมจาก Evidence Navigator

### Mode C — Direct SharePoint Library Access

ใช้กับผู้ตรวจประเมินหรือบุคลากรที่มีสิทธิ์ โดยเว็บไซต์ทำหน้าที่เป็น navigation layer

ไม่มี approval workflow ในแพลตฟอร์ม การกำหนด `Draft / Published / Archived` เป็นหน้าที่ของเจ้าของเนื้อหาหรือผู้ดูแล

---

## 9. Content and Data Principles

1. **Simple First** — เลือกวิธีง่ายที่สุดที่ตอบโจทย์
2. **Static First** — ใช้ static architecture ก่อน backend
3. **One Source, Many Views** — ข้อมูลหนึ่งชุดใช้ได้หลายหน้า
4. **Evidence First** — หลักฐานเป็น first-class content
5. **Stable URLs** — route ที่ผู้ตรวจอ้างอิงต้องไม่เปลี่ยนโดยไม่จำเป็น
6. **No Manual KPI Duplication** — ห้ามกรอกตัวเลขซ้ำใน component
7. **Bilingual by Design** — เส้นทาง TH/EN ต้องมี parity
8. **Accessible by Default** — WCAG-oriented UX, keyboard, contrast, semantics
9. **Performance Budget** — minimal JS, optimized images, fast mobile rendering
10. **Reuse Before Build** — audit ของเดิมก่อนสร้างใหม่

---

## 10. Required Content Models

### Evidence

```yaml
id: GO-2569-1.5.2-001
title: รายงานการปล่อยก๊าซเรือนกระจก ประจำปี 2569
year: 2569
category: "1"
issue: "1.5"
indicators: ["1.5.2"]
type: report
visibility: authenticated
status: published
storageUrl: https://...sharepoint.com/...
updatedAt: 2026-06-30
```

### Dashboard Dataset

```yaml
id: electricity-2568
metric: electricity
year: 2568
unit: kWh
sourceFile: 1.2-elect.xlsx
sourceEvidence: [GO-2568-3.x.x-001]
```

### News / Activity

```yaml
id: ACT-2569-001
slug: green-office-campaign-2569
title: ...
date: 2026-...
categories: ["2"]
relatedIndicators: ["2.x.x"]
```

---

## 11. Homepage Blueprint

1. Hero + clear identity
2. Executive environmental pulse
3. Resource KPI preview
4. 7 Green Office categories
5. Featured environmental action
6. Evidence center entry point
7. Latest news and activities
8. Knowledge and awareness media
9. Awards / trust signals
10. Contact and related links

หน้าแรกต้องไม่เป็น directory ยาวหรือรายการข่าวล้วน

---

## 12. Quality Gates

ทุก release ต้องผ่าน:

- Build success
- Broken-link check
- Route parity TH/EN
- Data validation
- Responsive QA
- Accessibility smoke test
- SEO metadata check
- Lighthouse/performance review
- Evidence link validation
- Git clean and pushed
- Preview verification before production

---

## 13. Governance

### Product Owner

- กำหนดเป้าหมาย ลำดับความสำคัญ และอนุมัติ release

### GPT Chief Architect

- คุม scope และ architecture
- วางแผนงาน
- ตรวจ consistency และความเสี่ยง
- ป้องกัน over-engineering

### Head Agent

- Orchestrate workers
- รวมผล
- ตรวจ integration และ quality gates

### Workers

- ทำงานแบบ parallel ตาม bounded scope
- อ่านเฉพาะไฟล์/ช่วงที่จำเป็น
- ส่งผลลัพธ์แบบกระชับพร้อมหลักฐาน

---

## 14. Definition of Done

แพลตฟอร์มถือว่าเสร็จเมื่อ:

1. Landing TH/EN สมบูรณ์และสวยงาม
2. Dashboard ใช้ข้อมูลจริงครบทุก resource และผ่าน validation
3. 7 หมวด/24 ประเด็น/65 ตัวชี้วัดมี route และโครงสร้างพร้อมใช้
4. Evidence Navigator เชื่อม SharePoint ได้ตามโหมดที่กำหนด
5. ข่าว กิจกรรม และ Knowledge Media มี content จริง
6. Search/filter ใช้งานได้
7. Mobile, accessibility, SEO, performance ผ่านเกณฑ์
8. GitHub Pages preview และ VPS production ตรงกัน
9. เอกสารส่งมอบและคู่มืออัปเดตข้อมูลพร้อม
10. ไม่มี dependency ต่อ Power Automate approval workflow

---

## 15. Final Architecture Statement

```text
Green Office 2026 Platform
= Environmental Data Presentation
+ Assessment Evidence Access
+ Public Communication
+ Environmental Awareness

Microsoft 365
= Entra ID Identity
+ SharePoint Document Repository
```

---

## 16. Related Documents

Normative references for implementation and operation:

- [Project Constitution](00-GREENOFFICE_PROJECT_CONSTITUTION.MD) — governance, MVP scope, forbidden architecture
- [AI Agent Playbook V1](architecture/GOFFICE2026_AI_AGENT_PLAYBOOK_V1.md) — **operational constitution for all AI agents** (workflow, subagent orchestration, quality gates, release process, prompt/folder conventions)
- [Architecture Freeze V1](architecture/ARCHITECTURE_FREEZE_V1.md) — canonical frozen implementation baseline
- [Architecture Decision Records](architecture/adr/README.md) — ADR-001..005

