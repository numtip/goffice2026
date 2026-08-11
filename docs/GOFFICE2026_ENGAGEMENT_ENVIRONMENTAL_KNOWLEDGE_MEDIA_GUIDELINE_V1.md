# GOFFICE2026 — ENGAGEMENT ENVIRONMENTAL KNOWLEDGE MEDIA GUIDELINE

**Project:** Green Office 2026 — Environmental Communication & Assessment Evidence Platform  
**Document Type:** Agent Implementation Guideline  
**Status:** PROPOSED IMPLEMENTATION REFERENCE  
**Version:** 1.0  
**Date:** 2026-08-11  
**Target Repository:** `numtip/goffice2026`  
**Canonical Architecture Basis:** `GREENOFFICE2026_PLATFORM_BLUEPRINT_V4` (V5 not found in repo — see Reconciliation Note in References)  
**Primary Area:** `ENGAGEMENT → Environmental Knowledge Media`

---

# 1. Purpose

เอกสารฉบับนี้กำหนดแนวทางสำหรับ Agent ในการพัฒนา **ENGAGEMENT → Environmental Knowledge Media** ของ Green Office 2026

เป้าหมายคือยกระดับ `/knowledge/` จากพื้นที่รวมบทความหรือสื่อแบบเดิม ให้เป็น **Environmental Knowledge Media Hub** ที่ช่วยให้บุคลากรและประชาชน:

1. เข้าใจประเด็นสิ่งแวดล้อมที่เกี่ยวข้องกับสำนักงาน
2. รู้ว่าควรปฏิบัติอะไรในชีวิตการทำงานประจำวัน
3. เห็นความเชื่อมโยงระหว่างพฤติกรรมกับผลกระทบด้านสิ่งแวดล้อม
4. เชื่อมต่อไปยัง Dashboard, Green Office Criteria และ Evidence ที่เกี่ยวข้อง
5. เข้าถึงเนื้อหาแบบ TH/EN ที่ใช้งานง่ายบน Mobile

แนวคิดหลัก:

> **Learn → Understand → Act → See Impact → Explore Evidence**

Environmental Knowledge Media ต้องเป็น **Engagement Experience** ไม่ใช่เพียงคลังบทความ

---

# 2. Architecture Alignment

งานนี้ต้องอยู่ภายใต้หลักของ Green Office 2026 Platform:

```text
Green Office 2026
= Public Environmental Communication
+ Environmental Performance
+ Assessment Evidence Navigation
+ Environmental Engagement
```

Environmental Knowledge Media อยู่ในส่วน:

```text
ENGAGEMENT
├── Activities
├── Campaigns
├── Training
└── Environmental Knowledge Media
```

Knowledge Media ต้อง:

- แยกจาก Formal Evidence Library
- สามารถเชื่อมกับ Category / Indicator / Dashboard / Activity ได้
- ใช้ static-first architecture
- reuse content และ component ที่มีอยู่ก่อนสร้างใหม่
- ไม่เพิ่ม backend ที่ไม่จำเป็น
- รักษา TH/EN parity
- ใช้ข้อมูลจริงและไม่กล่าวอ้างเกิน source

---

# 3. Product Concept

ใช้แนวคิดหลัก:

# 8 วิถี Green Office
## 8 Everyday Green Practices

ข้อความสื่อสารหลัก:

> **เปลี่ยนสิ่งที่เราทำทุกวัน ให้สำนักงานใช้ทรัพยากรอย่างคุ้มค่า และเป็นมิตรกับสิ่งแวดล้อมมากขึ้น**

ไม่ควรจัดหน้า Knowledge ตามโครงสร้างเกณฑ์ 1–7 โดยตรง เพราะเป้าหมายของส่วน Engagement คือให้ผู้ใช้เข้าใจและลงมือทำ

อย่างไรก็ตาม ทุก Practice ต้องสามารถเชื่อมกลับไปยัง Green Office Criteria ที่เกี่ยวข้องได้

---

# 4. Canonical 8 Green Office Practices

| # | Thai | English | Primary Scope |
|---|---|---|---|
| 01 | รู้ก่อนเขียว | Green Office Mindset | Green Office / Environmental Awareness / GHG Awareness |
| 02 | ใช้พลังงานอย่างฉลาด | Energy Smart | Electricity / Energy Saving |
| 03 | ใช้น้ำรู้คุณค่า | Water Wise | Water Conservation |
| 04 | ลดกระดาษ ใช้ทรัพยากรอย่างคุ้มค่า | Paper Smart | Paper / Printer / Office Supplies |
| 05 | ลดขยะ แยกให้ถูก ใช้ให้คุ้ม | Zero Waste | 3Rs / Waste Separation / Reuse |
| 06 | เดินทางแบบรักษ์โลก | Green Mobility | Travel / Fuel / Bicycle / Trip Planning |
| 07 | ประชุมและจัดซื้ออย่างเป็นมิตร | Green Meeting & Procurement | Green Meeting / Procurement / Services |
| 08 | สำนักงานน่าอยู่ ปลอดภัย มีระเบียบ | Green Workplace | 5S / Health / Safety / No Smoking |

---

# 5. Cross-Cutting Greenhouse Gas Principle

**GHG ไม่ต้องสร้างเป็น Practice ที่ 9**

ให้ Greenhouse Gas เป็น cross-cutting environmental impact เชื่อมหลาย Practices:

```text
Energy Smart
      ┐
Water Wise
      │
Paper Smart
      │
Zero Waste
      ├──→ Environmental Impact → Greenhouse Gas
Green Mobility
      │
Green Meeting
      │
Green Workplace
      ┘
```

Knowledge ที่เกี่ยวกับ:

- ก๊าซเรือนกระจกคืออะไร
- ภาวะโลกร้อน
- Carbon Footprint
- การลดการปล่อยก๊าซเรือนกระจก

ให้เชื่อมจาก `Green Office Mindset` และ Practices ที่เกี่ยวข้อง รวมถึง GHG Dashboard เมื่อเหมาะสม

---

# 6. Source Strategy

Agent ต้อง **Audit และ Reuse ก่อนสร้างใหม่**

## 6.1 Legacy Joomla Knowledge Source

ใช้ `j2xmllearning` เป็น legacy content source สำหรับ inventory และ rewrite

ตัวอย่างเนื้อหาที่มีอยู่:

- วางแผนการเดินทาง
- รณรงค์ประหยัดหมึกพิมพ์
- รณรงค์เดินทางโดยใช้รถจักรยาน
- การประหยัดพลังงานที่ออฟฟิศด้วยตนเอง
- รณรงค์ลดการใช้กระดาษ
- 5ส เครื่องมือสร้างความเป็นระเบียบเรียบร้อยของสำนักงาน
- การจัดซื้อจัดจ้างที่เป็นมิตรกับสิ่งแวดล้อม
- รณรงค์การเลิกสูบบุหรี่
- ก๊าซเรือนกระจกคืออะไร
- เนื้อหาอื่นที่เกี่ยวข้องกับทรัพยากร พลังงาน ของเสีย และสำนักงานสีเขียว

Legacy Joomla content ถือเป็น **source material** เท่านั้น

### ห้าม

- copy Joomla HTML มา publish แบบ 1:1
- reuse layout table เก่า
- ย้ายบทความทุกชิ้นเป็น route ใหม่โดยอัตโนมัติ
- ถือว่าข้อมูลเดิมทั้งหมดเป็น current fact

---

# 7. Video / Media Sources

Media ที่มีอยู่สามารถ reuse ได้เมื่อ link ยังใช้งานได้และเหมาะสม เช่น:

- Green Office คืออะไร?
- แยกขยะให้ถูกถัง เพิ่มพลังให้โลก
- 4 วิธีพิชิต Green Office “รักษ์โลก ให้โลกรู้”
- กิจกรรม 5ส.

Agent ต้อง inventory media ก่อน implementation และระบุ:

```text
Title
Media Type
Source URL
Practice
Language
Status
Reuse Decision
```

---

# 8. Legacy Content Classification

ทุก legacy item ต้องถูกจัดเป็นหนึ่งในสถานะ:

```text
REUSE
REWRITE
MERGE
DROP
```

## REUSE

ใช้เมื่อ:

- เนื้อหายังถูกต้อง
- concise พอ
- แหล่งอ้างอิงชัด
- เหมาะกับ UX ใหม่

## REWRITE

ใช้เมื่อ:

- หัวข้อยังสำคัญ
- ภาษาเก่า/ยาว
- ไม่เหมาะกับ Mobile
- ต้องปรับให้ action-oriented

## MERGE

ใช้เมื่อ:

- หลายบทความพูดเรื่องเดียวกัน
- สามารถรวมเป็น Practice page เดียวได้
- ลด content duplication

## DROP

ใช้เมื่อ:

- ซ้ำ
- ล้าสมัย
- ไม่มีคุณค่าเพิ่มเติม
- claim ไม่มี source รองรับ
- ไม่สอดคล้องกับ architecture ปัจจุบัน

---

# 9. Truthfulness Rule

ห้ามนำตัวเลขหรือข้อกล่าวอ้างจาก legacy content ไป publish โดยอัตโนมัติ

ตัวอย่างที่ต้องตรวจสอบก่อนใช้:

- ร้อยละการประหยัดพลังงาน
- ค่าใช้จ่ายต่อครั้ง
- ราคากระดาษ
- ปริมาณทรัพยากร
- ตัวเลข Carbon Reduction
- ตัวเลขที่อ้างว่า “ลดได้ X%”

ถ้า source ปัจจุบันไม่รองรับ:

> ให้ตัดตัวเลขออก หรือระบุเป็นข้อความเชิงหลักการแทน

ห้ามแต่ง source หรือ estimate เอง

---

# 10. Target Information Architecture

## Knowledge Hub

```text
/knowledge/
```

## Recommended Practice Routes

```text
/knowledge/green-office-mindset/
/knowledge/energy-smart/
/knowledge/water-wise/
/knowledge/paper-smart/
/knowledge/zero-waste/
/knowledge/green-mobility/
/knowledge/green-meeting/
/knowledge/green-workplace/
```

English:

```text
/en/knowledge/
/en/knowledge/green-office-mindset/
/en/knowledge/energy-smart/
...
```

**สำคัญ:** Agent ต้อง audit route convention ปัจจุบันก่อน

หาก repository มี route ที่ใช้งานอยู่แล้ว:

- preserve
- adapt
- redirect เมื่อจำเป็น
- ห้ามทำลาย stable URL โดยไม่จำเป็น

---

# 11. `/knowledge/` Hub Architecture

Recommended page flow:

```text
Hero
↓
8 Practice Navigator
↓
Featured Knowledge / Video
↓
Everyday Green Challenge
↓
Environmental Impact Connection
↓
Related Dashboard / Activities
↓
Knowledge Media Library
```

## Hero

### TH

**8 วิถี Green Office**

เปลี่ยนสิ่งที่เราทำทุกวัน ให้สำนักงานใช้ทรัพยากรอย่างคุ้มค่า และเป็นมิตรกับสิ่งแวดล้อมมากขึ้น

### EN

**8 Green Office Practices**

Everyday actions for a resource-smart and environmentally responsible workplace.

---

# 12. Practice Navigation Cards

แต่ละ Practice card ต้องประกอบด้วย:

```text
Practice Number
Visual / Icon
Thai Title
English Title
Short Tagline
One-line Action
CTA
```

ตัวอย่าง:

```text
02
ENERGY SMART
ใช้พลังงานอย่างฉลาด

ปิดเมื่อไม่ใช้ ใช้พลังงานอย่างรู้คุณค่า

Explore Practice →
```

ห้ามทำ cards ที่เป็นเพียง:

```text
Title
Read more
```

โดยไม่มี message หรือ action value

---

# 13. Standard Practice Page Template

ทุก Practice ต้องใช้ shared template เดียวกัน

```text
1. Practice Hero
2. Why It Matters
3. Do This Today
4. Watch / Learn
5. Quick Knowledge
6. Green Challenge
7. Environmental Impact
8. Our Performance
9. Related Green Office Criteria
10. Related Knowledge
```

---

# 14. Practice Hero

Hero ต้องตอบภายในไม่กี่วินาที:

- เรื่องนี้คืออะไร
- เกี่ยวข้องกับเราอย่างไร
- ทำอะไรได้ทันที

ข้อความต้อง concise และไม่เป็นภาษาราชการยาว

---

# 15. Why It Matters

อธิบายผลกระทบต่อ:

- การใช้ทรัพยากร
- ค่าใช้จ่าย
- ของเสีย
- สภาพแวดล้อม
- Carbon Footprint
- สุขภาวะสำนักงาน

แนะนำไม่เกิน 2–3 paragraphs

---

# 16. Do This Today

แต่ละ Practice ต้องมี practical actions ประมาณ 4–6 ข้อ

ตัวอย่าง Energy Smart:

```text
✓ ปิดไฟในพื้นที่ที่ไม่ใช้งาน
✓ ปิดจอหรืออุปกรณ์เมื่อเลิกใช้
✓ ใช้เครื่องปรับอากาศอย่างเหมาะสม
✓ ใช้แสงธรรมชาติเมื่อทำได้
✓ ตรวจอุปกรณ์ก่อนออกจากสำนักงาน
```

เป้าหมายคือ:

> อ่านแล้วทำได้ทันที

ไม่ใช่บทความเชิงทฤษฎีอย่างเดียว

---

# 17. Watch / Learn

รองรับ media:

```text
YouTube
Video
Infographic
Poster
Guide
Short Article
```

Requirements:

- ไม่ autoplay
- video ต้องมี accessible title
- มี fallback link
- media ต้อง responsive
- ไม่ block page load โดยไม่จำเป็น

---

# 18. Quick Knowledge

ใช้ digestible content เช่น:

- fact card
- myth / fact
- checklist
- short explanation
- small infographic

ประมาณ 3–5 items

ห้ามกลายเป็น long-form text wall

---

# 19. Green Challenge

แต่ละ Practice ควรมี simple engagement prompt

ตัวอย่าง Energy:

> ก่อนกลับบ้านวันนี้ ลองตรวจ 4 จุด: ไฟ จอ เครื่องปรับอากาศ และปลั๊กไฟ

ตัวอย่าง Zero Waste:

> วันนี้ลองแยกขยะทุกชิ้นก่อนทิ้ง และตรวจว่ามีอะไรที่นำกลับมาใช้ซ้ำได้

ไม่สร้าง:

- login
- badge
- point
- leaderboard
- gamification backend

---

# 20. Environmental Impact

ให้แสดงความเชื่อมโยงระหว่าง Practice กับ environmental metrics

ตัวอย่าง:

```text
Energy Smart
→ Electricity
→ Energy Efficiency
→ Greenhouse Gas
```

```text
Water Wise
→ Water Consumption
→ Resource Efficiency
```

```text
Zero Waste
→ Waste
→ Reuse / Recycling
→ Greenhouse Gas
```

---

# 21. Our Performance

ถ้ามี Dashboard ที่เกี่ยวข้องจริง ให้ link จาก Practice

Recommended mapping:

```text
Energy Smart
→ Electricity Dashboard
→ GHG Dashboard

Water Wise
→ Water Dashboard

Paper Smart
→ Paper Dashboard
→ GHG Dashboard where appropriate

Zero Waste
→ Waste Dashboard
→ GHG Dashboard

Green Mobility
→ Fuel Dashboard
→ GHG Dashboard
```

ห้ามสร้าง dashboard logic ใหม่ใน Knowledge

ห้าม duplicate KPI

ให้ใช้ existing dashboard route/data

---

# 22. Related Green Office Criteria

Knowledge page ควรแสดง criteria แบบ lightweight

ตัวอย่าง:

```text
เกี่ยวข้องกับ Green Office 2569

หมวด 3 — การใช้ทรัพยากรและพลังงาน
3.2.1 มาตรการหรือแนวทางการใช้ไฟฟ้า
3.2.3 การปฏิบัติตามมาตรการประหยัดไฟฟ้า
```

CTA:

```text
ดูเกณฑ์
ดูหลักฐานที่เกี่ยวข้อง
```

## Critical Rule

> ห้ามเดา Indicator ID

ทุก mapping ต้องตรวจจาก canonical Green Office 2569 criteria

---

# 23. Knowledge Relationship Model

Knowledge ต้องสามารถเชื่อมกับ platform entities:

```text
PRACTICE
├── CATEGORY
├── INDICATOR
├── DASHBOARD
├── ACTIVITY
├── KNOWLEDGE MEDIA
└── EVIDENCE
```

Expected flow:

```text
Knowledge
→ Related Indicator
→ Requirement
→ Evidence
```

หรือ:

```text
Knowledge
→ Related Dashboard
→ Performance
→ Related Evidence
```

---

# 24. Required Mapping Matrix

ก่อน implementation ให้ Agent สร้าง mapping:

```text
Legacy Source
→ Practice
→ Category
→ Indicator
→ Dashboard
→ Media Type
→ REUSE / REWRITE / MERGE / DROP
```

Example:

```text
การประหยัดพลังงานที่ออฟฟิศ
→ Energy Smart
→ Category 3
→ Verified 3.2.x indicators
→ Electricity / GHG
→ Guide
→ REWRITE
```

```text
กิจกรรม 5ส
→ Green Workplace
→ Category 5
→ Verified relevant indicators
→ None
→ Video
→ REUSE
```

---

# 25. Content Model

Agent ต้อง audit existing content/data structure ก่อน

ถ้ามี model ที่ reuse ได้ ให้ extend ของเดิม

หากไม่มี suitable model ให้ใช้ lightweight static model เช่น:

```yaml
id: energy-smart
order: 2
slug: energy-smart

titleTh: ใช้พลังงานอย่างฉลาด
titleEn: Energy Smart

summaryTh: ...
summaryEn: ...

practice: energy
status: published

categories:
  - "3"

indicators:
  - "3.2.1"
  - "3.2.3"

relatedDashboards:
  - electricity
  - ghg

media:
  - type: video
    url: ...
  - type: infographic
    src: ...

actions:
  - th: ...
    en: ...
```

---

# 26. One Source, Many Views

Knowledge source หนึ่งชุดต้อง reuse ได้ในหลายบริบท:

```text
Knowledge Hub
├── Practice Detail
├── Homepage
├── Search
├── Category
├── Indicator
└── Related Content
```

ห้าม copy content ซ้ำหลาย component

---

# 27. Search Integration

Knowledge content ต้องเข้าสู่ existing search architecture หากระบบรองรับอยู่แล้ว

ตัวอย่าง query:

```text
ประหยัดไฟ
ประหยัดน้ำ
แยกขยะ
5ส
Green Meeting
paper
water
3.2.1
```

Expected search result อาจรวม:

```text
Knowledge
Indicator
Dashboard
Evidence
Activity
Document
```

ห้ามสร้าง search engine ใหม่ถ้าของเดิมรองรับได้

---

# 28. TH/EN Parity

ทุก Practice ต้องมี TH/EN parity อย่างน้อย:

- title
- summary
- why it matters
- actions
- CTA
- media title
- image alt
- metadata
- related criteria label
- related dashboard links

English ไม่จำเป็นต้องแปลแบบ word-for-word

แต่ต้องรักษา:

- meaning
- action intent
- navigation
- content completeness

---

# 29. Visual Direction

ทั้ง 8 Practices ต้องอยู่ใน **Master Visual Universe เดียวกัน**

Visual keywords:

```text
Contemporary Eco Office
Human-Centered
Premium Editorial
Clean
Optimistic
Action-Oriented
Modern Green Office
```

ใช้ subject/object แยก Practice:

```text
Mindset
→ People + Environmental System

Energy
→ Lighting + AC + Computer

Water
→ Faucet + Water Flow

Paper
→ Printer + Document + Tablet

Waste
→ Sorting Station + Reusable Objects

Mobility
→ Bicycle + Shared Travel

Meeting
→ Digital Document + Reusable Meeting Setup

Workplace
→ Organized Office + Plants + 5S
```

หลีกเลี่ยง:

```text
Generic Clipart
Old Government Poster Look
Text-Heavy Poster
Random Stock Art Style
Different Visual Universe Per Practice
```

---

# 30. Media Asset Boundary

Media production และ web implementation ให้แยก concerns

Web Agent ต้องเตรียม:

```text
asset slot
aspect ratio
responsive treatment
alt text contract
fallback
loading strategy
```

Visual asset ที่ยังไม่พร้อม:

- ห้าม block architecture
- ใช้ placeholder/fallback ที่ production-safe
- บันทึกเป็น remaining asset

---

# 31. Accessibility

ขั้นต่ำต้องมี:

- semantic headings
- keyboard navigation
- readable contrast
- meaningful alt text
- video titles
- responsive media
- no horizontal overflow
- reduced-motion friendly behavior
- accessible links/buttons
- fallback text สำหรับ visual content

---

# 32. Performance

ต้องรักษา static-first architecture

Guidelines:

- minimal client JavaScript
- lazy-load media เมื่อเหมาะสม
- optimize image size
- ไม่ autoplay YouTube
- ไม่โหลด video iframe ทั้งหมดพร้อมกันถ้าไม่จำเป็น
- reuse shared components
- ไม่มี runtime database/API dependency ใหม่

---

# 33. SEO

ทุก Practice page ต้องมีอย่างน้อย:

```text
title
description
canonical
Open Graph metadata
language alternate / locale parity
meaningful heading hierarchy
```

---

# 34. Scope Guardrails

## ห้ามสร้าง

- Custom CMS
- Runtime Database
- New Authentication
- Admin Backend
- Gamification Backend
- Quiz Engine
- Points
- Leaderboard
- Approval Workflow
- New DMS
- New Dashboard Engine
- New Search Backend
- Duplicated Evidence Metadata

Environmental Knowledge Media คือ **content experience** ไม่ใช่ application ใหม่

---

# 35. Implementation Phases

> **Reconciliation Note:** This guideline originally referenced `GREENOFFICE2026_PLATFORM_BLUEPRINT_V5`. Repository verification (2026-08-11) confirms **V5 does not exist** in tracked content or git history. The active canonical blueprint is `GREENOFFICE2026_PLATFORM_BLUEPRINT_V4` (per `GOFFICE2026_NEW_PROJECT_MASTER_REFERENCE.md`). All V5 references herein resolve to V4 sections; the engagement architecture implemented follows V4 + `GOFFICE2026_CONTENT_ARCHITECTURE_V2`.

## Phase A — Audit & Mapping

### Read Only

ตรวจเฉพาะ:

```text
current /knowledge routes
knowledge components
knowledge data/content
TH/EN route convention
search integration
legacy j2xmllearning source
YouTube media source list
Green Office 2569 criteria
existing dashboard routes
existing indicator routes
Blueprint V4 relevant sections (V5 absent — see Reconciliation Note)
```

### Deliverable

```text
Existing
Reuse
Rewrite
Missing
Mapping
Risks
```

ยังไม่แก้ไฟล์

---

# 36. Phase B — Foundation

เมื่อ audit ผ่าน:

สร้าง/ปรับ:

```text
Knowledge data model
Shared Practice Components
/knowledge/ hub
8 Practice route skeletons
TH/EN parity
Search integration
Related route contracts
```

ยังไม่จำเป็นต้องมี visual asset final ทุกชิ้น

---

# 37. Phase C — Content Integration

นำ legacy source เข้า 8 Practices:

```text
Legacy Inventory
→ Classify
→ Rewrite / Merge
→ Add Actions
→ Add Media
→ Verify Criteria
→ Link Dashboard
→ Add Environmental Impact
→ Add Related Content
```

ห้าม copy Joomla article แบบตรง ๆ

---

# 38. Phase D — QA & Preview

ตรวจ:

```text
Build
Validation
TH/EN Parity
Broken Links
Mobile
Accessibility
SEO
Search
Dashboard Links
Indicator Links
Media Links
```

Deploy:

> **Preview only**

ห้าม production ก่อน Product Owner approval

---

# 39. Definition of Done

งานถือว่า `READY_FOR_PO_REVIEW` เมื่อ:

- [ ] `/knowledge/` เป็น 8 Green Office Practices Hub
- [ ] มี 8 Practice pages ภาษาไทย
- [ ] มี 8 Practice pages ภาษาอังกฤษ
- [ ] TH/EN parity ผ่าน
- [ ] Legacy content ถูก classify ครบ
- [ ] ไม่มี Joomla HTML dump
- [ ] ทุก Practice มี actionable guidance
- [ ] ทุก Practice มี verified criteria mapping เมื่อเกี่ยวข้อง
- [ ] Related dashboard link ใช้ existing routes
- [ ] Knowledge เข้าสู่ existing search
- [ ] Media link ใช้งานได้
- [ ] Unsupported numeric claims ถูกตัดหรือแก้ไข
- [ ] Mobile responsive
- [ ] Accessibility smoke PASS
- [ ] SEO metadata ครบ
- [ ] Build PASS
- [ ] Repository validation PASS
- [ ] Broken link check PASS
- [ ] Preview deployed
- [ ] Production untouched

---

# 40. Agent Reporting Contract

Final report ต้องสั้นและตรวจสอบได้:

```text
VERDICT

1. Files changed
2. 8-Practice mapping
3. Legacy migration decisions
4. TH/EN parity result
5. Criteria mappings
6. Dashboard mappings
7. Search integration
8. Build / validation / link QA
9. Preview URL
10. Remaining media assets
11. Blockers / known limitations
```

Allowed verdict:

```text
READY_FOR_PO_REVIEW
BLOCKED_WITH_EVIDENCE
```

ห้ามประกาศ:

```text
PRODUCTION_READY
PRODUCTION_DEPLOYED
```

จนกว่า Product Owner จะอนุมัติขั้นตอน production

---

# 41. Head Agent Execution Prompt

```text
Implement the ENGAGEMENT → Environmental Knowledge Media workstream for Green Office 2026.

Goal:
Turn /knowledge/ into an “8 Green Office Practices” engagement hub, not a legacy article archive.

Canonical practices:
1 Green Office Mindset
2 Energy Smart
3 Water Wise
4 Paper Smart
5 Zero Waste
6 Green Mobility
7 Green Meeting & Procurement
8 Green Workplace

Phase A first:
Read only the current knowledge routes/components/data/search/i18n structure, legacy j2xmllearning source, YouTube media list, current Green Office 2569 criteria mapping, existing dashboard/indicator routes, and relevant Blueprint V4/content-architecture sections (V5 absent — see Reconciliation Note).

Produce a concise:
Existing / Reuse / Rewrite / Missing / Mapping / Risks matrix.

Do not edit yet.

After audit approval, implement reuse-first:
- one /knowledge/ hub
- 8 practice pages
- TH/EN parity
- shared reusable content model/components
- Learn → Understand → Act → See Impact → Explore Evidence UX
- related dashboard links where valid
- verified category/indicator links
- existing search integration
- mobile/a11y/SEO

Do not migrate Joomla articles 1:1.
Classify legacy content as REUSE / REWRITE / MERGE / DROP.
Do not reuse unsupported numeric claims.
Do not guess indicator IDs.
Do not build CMS, DB, auth, gamification, workflow, new search backend, or other backend.
Do not duplicate dashboard or evidence data.
Preserve existing routes/components where practical.

Use concise targeted reads.
Use subagents only for non-overlapping scopes.
Keep write boundaries explicit.
Stop at preview acceptance candidate.
Do not deploy production.

Final report:
1. files changed
2. 8-practice mapping
3. legacy migration decisions
4. TH/EN parity
5. criteria/dashboard/search links
6. validation results
7. preview URL
8. blockers/remaining media assets

Verdict:
READY_FOR_PO_REVIEW
or
BLOCKED_WITH_EVIDENCE
```

---

# 42. Recommended Subagent Split

หากงานมีขนาดใหญ่ สามารถใช้ subagents แบบ non-overlapping:

### Agent A — Content Audit

Scope:

```text
legacy XML
video list
content classification
8-practice mapping
```

No implementation writes.

### Agent B — Architecture / Data Model

Scope:

```text
knowledge schema
shared components
routes
TH/EN architecture
```

### Agent C — Criteria / Dashboard Mapping

Scope:

```text
verify indicators
verify category links
verify dashboard links
```

ห้ามเดา mapping

### Agent D — QA

Scope:

```text
build
links
a11y
mobile
SEO
search
TH/EN parity
```

Head Agent เป็นผู้ integrate และตัดสิน final verdict

---

# 43. Priority

งานนี้เป็น **content and engagement enhancement**

Priority order:

```text
P0 Architecture Integrity
P0 Truthfulness
P0 TH/EN Parity
P0 Reuse Existing Platform
P1 UX / Engagement
P1 Media Integration
P1 Search / Cross-linking
P2 Additional Visual Assets
P2 Optional Enhancement
```

P2 ต้องไม่ block release candidate

---

# 44. Final Principle

> **Environmental Knowledge Media must help people understand Green Office, change everyday behaviour, and see how those actions connect to real environmental performance.**

หรือในรูปแบบสั้น:

> **Learn. Act. See Impact.**

---

# References

- `GREENOFFICE2026_PLATFORM_BLUEPRINT_V4` (active canonical; V5 not found in repo)
- `GOFFICE2026_CONTENT_ARCHITECTURE_V2`
- `เกณฑ์การประเมินสำนักงานสีเขียว ปี 2569`
- Legacy Joomla knowledge export (`j2xmllearning`)
- Existing Green Office YouTube media list
- Current Green Office 2026 production architecture and routes

