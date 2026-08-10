# GREEN OFFICE 2026 — RAPID COMPLETION PLAN V1.0

**Objective:** ทำแพลตฟอร์มให้พร้อมใช้งานจริงอย่างรวดเร็ว โดยไม่สร้างระบบเกินความจำเป็น  
**Architecture Basis:** `GREENOFFICE2026_PLATFORM_BLUEPRINT_V4.md`  
**Execution Model:** Head Agent + parallel workers, audit-first, reuse-first, bounded output  
**Target:** Feature-complete candidate ภายใน 10 วันทำงาน และ production release หลัง Product Owner acceptance

---

## 1. Delivery Strategy

ใช้ 4 หลัก:

1. **Freeze scope ก่อนลงมือ** — ไม่เพิ่ม workflow/backend ใหม่
2. **Audit และ reuse ของเดิม** — ไม่สร้างซ้ำ
3. **Parallel execution** — แบ่งงานที่ไม่ชนไฟล์กันให้ workers
4. **Daily integration** — merge, build, QA และ push ทุกวัน

Critical path:

```text
Repository Audit
→ Scope/Route Freeze
→ Data + Evidence + Content in Parallel
→ Page Integration
→ QA/Fix
→ Preview Acceptance
→ Production
```

---

## 2. Workstreams

### WS-A — Architecture & Repository Reconciliation

**Owner:** Head Agent  
**Duration:** Day 1

Deliverables:

- นำ Blueprint V4 เข้า repository
- อัปเดต master reference และ content architecture ให้สอดคล้อง
- ตรวจ route, components, datasets, documents, open issues
- ทำ gap matrix: Existing / Reuse / Missing / Remove
- ปิดงาน approval workflow และลิงก์ ADR-0001
- Freeze release scope

Acceptance:

- Architecture documents ไม่ขัดกัน
- ไม่มี task ใหม่เกี่ยวกับ approval engine
- มี prioritized backlog เดียว

### WS-B — Resource Data & Executive Dashboard

**Owner:** Data Worker  
**Duration:** Day 1–4

Scope:

- Water
- Electricity
- Fuel
- Paper
- Waste
- GHG

Tasks:

- ตรวจ Excel source และปี/เดือน/unit
- normalize → validate → generated JSON
- ตรวจยอดรวมและ missing values
- เชื่อม dashboard จริงทุกหน้า
- เพิ่ม baseline/year comparison และ interpretation ที่จำเป็น

Acceptance:

- ไม่มี hard-coded duplicate KPI
- validator ผ่าน
- dashboard ทุก resource แสดงข้อมูลจริง
- mobile chart/table อ่านได้

### WS-C — 7 Categories & Evidence Navigator

**Owner:** Evidence Worker  
**Duration:** Day 1–5

Tasks:

- ตรวจ taxonomy 7 หมวด / 24 ประเด็น / 65 ตัวชี้วัดกับเกณฑ์ 2569
- สร้าง/เติม canonical routes
- standardize indicator page template
- เชื่อม evidence metadata กับ SharePoint URL
- เพิ่ม filter: category, indicator, year, type
- แยก visibility: public / authenticated

Acceptance:

- ผู้ตรวจเข้าถึงหมวด → ตัวชี้วัด → หลักฐานได้ไม่เกิน 3 clicks
- รหัสตัวชี้วัดค้นหาได้
- broken evidence link = 0 ในชุดที่เผยแพร่

### WS-D — Landing, News & Awareness Content

**Owner:** Content Worker  
**Duration:** Day 2–5

Tasks:

- ปรับ Landing ตาม Blueprint V4
- ทำ TH/EN parity
- เติมข่าว/กิจกรรมจริงชุดแรก
- เติม knowledge/awareness media ชุดแรก
- เชื่อม featured items กับ category/indicator
- ตรวจ CTA และ navigation

Acceptance:

- หน้าแรกตอบได้ว่า “คืออะไร / ผลงานเป็นอย่างไร / ดูหลักฐานที่ไหน”
- ไม่มี placeholder สำคัญ
- TH/EN มีโครงสร้างและ CTA เทียบเท่ากัน

### WS-E — UX, Accessibility, SEO & Performance

**Owner:** UX/QA Worker  
**Duration:** Day 4–7

Tasks:

- mobile-first QA
- keyboard navigation
- contrast/semantic headings/alt text
- metadata, canonical, sitemap, robots
- optimize images and client JS
- fix navigation/header/footer consistency

Acceptance:

- ไม่มี critical accessibility issue
- no horizontal overflow บน mobile
- page titles/descriptions/canonical ครบ
- performance regression ไม่มี

### WS-F — SharePoint & Entra Integration Boundary

**Owner:** M365 Worker (single authenticated session when browser required)  
**Duration:** Day 3–6

Tasks:

- ยืนยัน SharePoint libraries และ registry ที่ใช้จริง
- map 7 categories → storage locations
- ตรวจ public/authenticated link behavior
- จัดทำ metadata export contract
- ยืนยัน Entra ID scope เฉพาะ authentication/permission
- ห้ามสร้าง Power Automate approval flow เพิ่ม

Acceptance:

- Document access path ชัดเจน
- metadata contract พร้อม
- ไม่มี dependency ต่อ approval engine

### WS-G — Integration, Testing & Release

**Owner:** Head Agent  
**Duration:** Day 6–10

Tasks:

- integrate ทุก workstream
- build and route QA
- broken links and evidence validation
- verify GitHub Pages preview
- stakeholder acceptance fixes
- deploy VPS/Nginx
- smoke test production
- create release note and handoff

Acceptance:

- build ผ่าน
- preview และ production parity
- working tree clean
- release tagged/versioned

---

## 3. Ten-Day Execution Schedule

| Day | Main Outcome |
|---|---|
| 1 | Blueprint V4 committed, repo audit, scope freeze, gap matrix |
| 2 | Data pipeline and taxonomy work in parallel; landing/content starts |
| 3 | Dashboard real-data integration; SharePoint mapping; indicator templates |
| 4 | All resource dashboards functional; category/evidence routes mostly complete |
| 5 | Landing TH/EN, news, awareness, evidence navigator feature-complete |
| 6 | Full integration build; search/filter; M365 boundary verification |
| 7 | UX, accessibility, SEO, performance fixes |
| 8 | End-to-end QA and broken-link/data validation |
| 9 | GitHub Pages acceptance candidate; Product Owner review and targeted fixes |
| 10 | Production deploy, smoke test, release note, final handoff |

หากงานเดิมใน repository สมบูรณ์กว่าที่คาด สามารถยุบเหลือ 7 วันได้ แต่ห้ามข้าม quality gates

---

## 4. Agent Parallelization

### Head Agent — DeepSeek-V4-Pro

- อ่าน Blueprint V4, ADR, repo status และ gap matrix เท่านั้นในรอบแรก
- แจกงาน bounded scope
- ห้าม workers แก้ไฟล์เดียวกันพร้อมกัน
- integrate และตรวจ consistency ทุกวัน

### Workers — DeepSeek-V4-Flash

| Worker | Scope | Write Boundary |
|---|---|---|
| A | Data/dashboard | data pipeline, generated JSON, dashboard pages |
| B | Criteria/evidence | category, indicator, evidence modules |
| C | Content/i18n | landing, activities, knowledge, translations |
| D | UX/SEO/a11y | shared UI, metadata, QA fixes |
| E | Validation/release | tests, link checks, reports, deployment docs |

M365 interactive workใช้ Worker เดียวเพื่อรักษา authentication session

---

## 5. Priority Rules

### P0 — Must Finish

- Production-safe build
- Real resource dashboards
- 7-category evidence navigation
- SharePoint document access
- Landing TH/EN
- News and awareness sections
- Mobile and critical accessibility

### P1 — Finish Before Final Release Where Possible

- Advanced filters
- richer historical comparison
- featured story enhancements
- enhanced search ranking

### P2 — Post-release Backlog

- optional analytics
- additional visualization styles
- richer content authoring helpers
- nonessential animation

ไม่อนุญาตให้ P1/P2 ขัดขวาง P0 release

---

## 6. Stop/Go Gates

### Gate 1 — Architecture Freeze

Go เมื่อ Blueprint V4, ADR และ scope ตรงกัน

### Gate 2 — Feature Complete

Go เมื่อ P0 ทุกข้อมี implementation และ build ผ่าน

### Gate 3 — Acceptance Candidate

Go เมื่อ data/evidence/link/mobile QA ผ่าน

### Gate 4 — Production

Go เมื่อ Product Owner อนุมัติ preview และมี rollback point

---

## 7. Definition of Done Checklist

- [ ] Blueprint V4 committed and referenced
- [ ] Approval engine work closed/de-scoped
- [ ] Real datasets validated for all resource types
- [ ] Executive dashboard complete
- [ ] 7 categories / 24 issues / 65 indicators represented
- [ ] Evidence metadata and SharePoint links operational
- [ ] Search/filter operational
- [ ] Landing TH/EN complete
- [ ] News/activities contain real content
- [ ] Awareness media section contains real content
- [ ] Mobile, a11y, SEO, performance gates pass
- [ ] GitHub Pages preview approved
- [ ] VPS production deployed and smoke-tested
- [ ] Release note, update guide, and handoff completed

---

## 8. Required Final Deliverables

1. `GREENOFFICE2026_PLATFORM_BLUEPRINT_V4.md`
2. Updated content architecture and master reference
3. Repository gap matrix
4. Data validation report
5. Evidence/link validation report
6. Accessibility/SEO/performance QA report
7. Release notes
8. Content/data update guide for staff
9. Production deployment and rollback record

---

## 9. Execution Command for Head Agent

```text
Implement the Green Office 2026 rapid completion plan using Blueprint V4 as the canonical architecture.

Start with a targeted repository audit and create one gap matrix. Reuse existing work. Do not redesign from scratch. De-scope all approval workflow work per ADR-0001. Keep Microsoft 365 limited to Entra ID identity and SharePoint evidence storage.

Run parallel workers with non-overlapping write boundaries for data/dashboard, criteria/evidence, content/i18n, UX/SEO/a11y, and validation/release. Integrate daily. Prioritize P0 only until the acceptance candidate passes build, data validation, evidence links, TH/EN parity, mobile, accessibility, SEO, and preview QA.

Use concise reads and bounded reports. Commit and push verified checkpoints. Stop only at Product Owner acceptance candidate or a clearly evidenced blocker.
```

