# GO-DATA-1 — รายงานสรุปฉบับสมบูรณ์
## Environmental Data Pipeline Consolidation

| รายการ | รายละเอียด |
|--------|-----------|
| Sprint | GO-DATA-1 |
| วันที่ | 2026-07-23 |
| Commit | `ab8d9e6` feat(data): consolidate environmental data pipeline |
| Branch | master → origin/master |
| สถานะ | **REOPENED** (ตาม QC Audit) |

---

## ส่วนที่ 1 — สิ่งที่ดำเนินการใน Sprint นี้

### 1.1 Canonical Data Contract (Phase 3)

อัปเดต `src/utils/multi-year-schema.ts` เพิ่ม interface ใหม่ที่จำเป็น:

| Interface ใหม่ | วัตถุประสงค์ |
|----------------|-------------|
| `DataQuality` | ติดตาม valid, warnings, reconciliationDifference ต่อปี |
| `MetricTargetStatus` | `on-track`, `off-track`, `no-target`, `insufficient-data` |
| `SourceRef` | อ้างอิงแหล่งข้อมูลแบบ repository-relative |
| `IndicatorMapping` | เชื่อมโยงตัวชี้วัดกับเกณฑ์ Green Office |
| `ExecutiveKpiEntry` | รายการ KPI สำหรับ homepage |
| `DataQualitySummary` | สรุปคุณภาพข้อมูลทุก metric |

### 1.2 Scripts ที่สร้างใหม่ (Phase 4 & 5)

| Script | หน้าที่ |
|--------|---------|
| `scripts/data-pipeline.mjs` | Pipeline หลัก: `import`, `validate`, `generate`, `check`, `build` |
| `scripts/generate-canonical-data.mjs` | เพิ่ม fields ใหม่ให้ JSON ที่มีอยู่แล้ว |

### 1.3 npm Scripts ใหม่ (package.json)

```bash
npm run data:import    # Import CSV → generated JSON
npm run data:validate  # Validate schema
npm run data:generate  # สร้าง KPI summary + quality report
npm run data:check     # Validate + generate + determinism check
npm run data:build     # Full pipeline: import → validate → generate → check
```

### 1.4 Generated Outputs ใหม่

| ไฟล์ | คำอธิบาย |
|------|---------|
| `src/data/generated/kpi-summary.json` | สรุป KPI ทุก metric จาก canonical data |
| `src/data/generated/data-quality.json` | รายงานคุณภาพข้อมูลทุก metric + ทุกปี |

### 1.5 Schema Fields ที่เพิ่มใน Generated JSON

ทุก metric JSON (`energy.json`, `water.json`, ฯลฯ) ได้รับ fields เพิ่มเติม:

```json
{
  "labelTh": "การใช้ไฟฟ้า",
  "targetStatus": "no-target",
  "relatedIndicators": [
    { "indicatorId": "3.2.2", "label": "Electricity consumption", "relevance": "primary" }
  ],
  "sourceEvidence": [],
  "years": {
    "2568": {
      "quality": {
        "valid": true,
        "warnings": [],
        "reconciliationDifference": null
      }
    }
  }
}
```

### 1.6 Criteria/Indicator Mappings (Phase 7)

| Metric | Indicator | ประเภท |
|--------|-----------|--------|
| Water | 3.1.2 | Primary |
| Energy | 3.2.2 | Primary |
| Fuel | 3.2.5 | Primary |
| Paper | 3.3.2 | Primary |
| Waste | 4.1.x | Primary |
| GHG | 1.5.1, 1.5.2 | Primary, Supporting |

---

## ส่วนที่ 2 — สถานะข้อมูลรายตัวชี้วัด

### 2.1 ข้อมูล 2568 Baseline

| Metric | ไฟล์ต้นฉบับ | Annual Total | Unit | เดือน | สถานะ |
|--------|------------|-------------|------|--------|-------|
| Water | `docs/1.1-Water.xlsx` ✅ | 8,337.5 | m³ | 12/12 | **REAL** — ยืนยันจาก XLSX โดยตรง |
| Energy | `docs/1.2-elect.xlsx` ❌ หาย | 403,036.8 | kWh | 12/12 | **PRESERVED-LEGACY** — ไม่สามารถ re-derive ได้ |
| Fuel | `docs/1.3_Gassolene.xlsx` ❌ หาย | 339.83 | L | 12/12 | **PRESERVED-LEGACY** — ไม่สามารถ re-derive ได้ |
| Paper | `docs/1.4_Paper.xlsx` ❌ หาย | 2,197.8 | kg | 12/12 | **PRESERVED-LEGACY** — ไม่สามารถ re-derive ได้ |
| Waste | `docs/1.5_Waste.xlsx` ❌ หาย | 258.83 | % | 12/12 | **PRESERVED-LEGACY + ข้อผิดพลาดเชิง Semantic** |
| GHG | `docs/1.6_GreenhouseGas.xlsx` ❌ หาย | 231.6 | tCO₂e | 12/12 | **PRESERVED-LEGACY** — ชื่อไฟล์ยังเป็นปัญหา |

### 2.2 ข้อมูล 2569 Current Year

| Metric | Annual Total | Unit | เดือน | แหล่งที่มา | quality.valid |
|--------|-------------|------|--------|-----------|--------------|
| Energy | 149,100 | kWh | 8/12 | `energy-2569.csv` committed Jun 2026 เพื่อ "demonstrate pipeline" | ✅ (ผิดพลาด) |
| Water | 31,200 | m³ | 6/12 | `water-2569.csv` committed Jun 2026 เพื่อ "demonstrate pipeline" | ✅ (ผิดพลาด) |
| Fuel | 16,200 | L | 9/12 | Placeholder จาก legacy data | ❌ flagged |
| Paper | 916 | kg | 6/12 | Placeholder จาก legacy data | ❌ flagged |
| Waste | 846 | % | 10/12 | Placeholder จาก legacy data | ❌ flagged |
| GHG | 349 | tCO₂e | 8/12 | Placeholder จาก legacy data | ❌ flagged |

---

## ส่วนที่ 3 — ผลการ QC Audit (Independent Review)

### 3.1 Verdict: FAIL — Reopen GO-DATA-1

QC Audit พบ defect สำคัญที่ทำให้ Sprint ไม่สามารถ Accept ได้

### 3.2 Critical Defects ที่พบ

#### D-1 🔴 (CRITICAL) — False Clean Quality Status บน Energy/Water 2569
- **ปัญหา:** `energy 2569` และ `water 2569` มี `quality.valid=true` และ `warnings=[]`
- **ความจริง:** ข้อมูลมาจาก CSV ที่ commit เมื่อ 12 มิ.ย. 2569 ด้วยเป้าหมายเพื่อ "demonstrate pipeline" เท่านั้น ไม่ใช่ข้อมูลจากบิลไฟฟ้าหรือมิเตอร์จริง
- **หลักฐาน:** commit `37a9074` message: "Demonstrate pipeline: imported energy-2569.csv"
- **ผลกระทบ:** Water 2569 monthly avg = 5,200 m³ เทียบกับ baseline 695 m³/month (7.5×) — ค่านี้ไม่สมเหตุสมผล

#### D-2 🔴 (CRITICAL) — Validator รายงาน "0 Warnings" โดยไม่ตรวจ quality.valid
- **ปัญหา:** `validateGenerated()` ใน `data-pipeline.mjs` ไม่ตรวจสอบ `yearData.quality.valid`
- **ความจริง:** `data-quality.json` แสดงว่า 4 จาก 12 metric-year pairs มี `quality.valid=false`
- **ผลกระทบ:** รายงาน "✅ PASS — 0 errors, 0 warnings" เป็นสัญญาณที่ทำให้เข้าใจผิด

#### D-3 🔴 (HIGH) — Waste Unit Semantic Error
- **ปัญหา:** `waste.total` เป็นผลรวมของ monthly recycling rate (%) ซึ่งไม่มีความหมายทางคณิตศาสตร์
- **ตัวอย่าง:** 2568 total = 258.83%, 2569 total = 846% — ค่าเหล่านี้ไม่ใช่ annual recycling rate
- **ผลลัพธ์ผิดพลาด:** YoY change = +227% (ไม่มีความหมาย)
- **ที่ถูกต้อง:** ควรใช้ average หรือ mass-based calculation

#### D-4 🟠 (HIGH) — XLSX Filename Conflicts ที่ยืนยันไม่ได้
- **Electricity:** docs เดิม → `12-elect.xlsx`, pipeline ปัจจุบัน → `1.2-elect.xlsx`
- **GHG:** docs เดิม → `1.5_GreenhouseGas.xlsx`, pipeline ปัจจุบัน → `1.6_GreenhouseGas.xlsx`
- **ไฟล์ทั้งหมดหายไปแล้ว** — ไม่สามารถยืนยันชื่อที่ถูกต้องได้

#### D-5 🟠 (HIGH) — Fuel 2569 Implausible (48× Baseline)
- **Fuel 2568:** 339.83 L ต่อปี
- **Fuel 2569 (placeholder):** 16,200 L ใน 9 เดือน = 48× เพิ่มขึ้น
- สถานะ: flagged ถูกต้อง (`quality.valid=false`) แต่ค่านี้ยังปรากฏใน KPI Summary และ Dashboard

#### D-6 🟡 (MEDIUM) — Baseline CSVs ไม่ถูก Commit
- ไฟล์ `*-2568.csv` ที่ extract จาก XLSX ไม่เคยถูก commit ลงใน git
- ไม่สามารถ re-derive ข้อมูล baseline ได้โดยไม่มี XLSX ต้นฉบับ
- **ยกเว้น Water:** สามารถ re-extract ได้จาก `docs/1.1-Water.xlsx` ที่ยังมีอยู่

#### D-7 🟡 (MEDIUM) — Indicator ID `4.1.x` ไม่ใช่ valid ID
- Waste mapping ใช้ `4.1.x` (wildcard) ไม่ใช่ indicator ID จริงจากเกณฑ์ Green Office 2569

#### D-8 🟡 (MEDIUM) — `sourceEvidence` ว่างทุก metric
- field มีอยู่ใน schema แต่ไม่มีข้อมูล
- Validator ไม่เตือนเมื่อ array ว่าง

### 3.3 Validation Gaps

| Gap | คำอธิบาย |
|-----|---------|
| G-1 | Validator ไม่ตรวจ `yearData.quality.valid` |
| G-2 | ไม่มี range check เทียบ 2569 vs 2568 baseline (outlier detection) |
| G-3 | ไม่เตือนเมื่อ `sourceEvidence` ว่าง |
| G-4 | ไม่ตรวจ semantic validity ของ unit % กับ sum aggregation |
| G-5 | `reconcileTotal()` ถูกเรียกด้วย `null` เสมอ — dead code สำหรับ workflow ปัจจุบัน |
| G-6 | 13 tests ทดสอบ display logic เท่านั้น ไม่มีการ assert ค่าตัวเลขจริง |

---

## ส่วนที่ 4 — Quality Gate Summary

| Check | ผลลัพธ์ | Coverage ที่แท้จริง |
|-------|--------|-------------------|
| `npm run data:build` | ✅ PASS | ❌ อ่าน demo CSV เท่านั้น |
| `npm run data:validate` | ✅ PASS "0 warnings" | ❌ ซ่อน 4 invalid quality entries |
| TypeScript `astro check` | ✅ 0 errors | ✅ Schema types ถูกต้อง |
| 13/13 existing tests | ✅ PASS | ❌ Mock objects เท่านั้น ไม่อ่าน JSON จริง |
| Astro static build | ✅ 208 pages | ✅ Routes ครบ |
| Deterministic output | ✅ PASS | ✅ parse→serialize stable |
| No absolute paths in JSON | ✅ PASS | ✅ ยืนยันแล้ว |
| Water 2568 XLSX live read | ✅ ค่าตรง | ✅ ยืนยันจากไฟล์จริง |

---

## ส่วนที่ 5 — Git State

| รายการ | ค่า |
|--------|-----|
| Starting HEAD | `952b3a1` docs(release): summarize Green Office work for 2026-07-22 |
| Sprint HEAD | `ab8d9e6` feat(data): consolidate environmental data pipeline |
| Push | ✅ origin/master ตรงกับ local master |
| Pre-existing untracked | `build_output.txt`, `docs/design/GO_DASH_1_REPORT.md`, `docs/design/GO_UX_1_REPORT.md`, `docs/prompt3.MD` |
| Working tree (หลัง commit) | Clean |

### Files Changed in Commit `ab8d9e6`

| ประเภท | ไฟล์ |
|--------|------|
| Scripts | `scripts/data-pipeline.mjs` (new), `scripts/generate-canonical-data.mjs` (new) |
| Package | `package.json` (+5 npm scripts) |
| Schema | `src/utils/multi-year-schema.ts` |
| Generated Data | `src/data/generated/*.json` (6 metric files updated + 2 new summary files) |
| Documentation | `docs/data/GO-DATA-1-DATA-CONTRACT.md`, `docs/data/GO-DATA-1-SOURCE-MAP.md`, `docs/data/GO-DATA-1-VALIDATION-REPORT.md`, `docs/releases/GOFFICE2026_GO-DATA-1_REPORT.md` |

---

## ส่วนที่ 6 — Required Corrections (ต้องแก้ก่อน Accept)

| # | Priority | การแก้ไข |
|---|---------|---------|
| RC-1 | 🔴 บังคับ | เปลี่ยน `energy 2569` และ `water 2569` เป็น `quality.valid=false` พร้อม warning ระบุต้นกำเนิด demo CSV |
| RC-2 | 🔴 บังคับ | แก้ Waste aggregation — ใช้ average แทน sum สำหรับ monthly % rates |
| RC-3 | 🔴 บังคับ | Validator ต้องตรวจ `yearData.quality.valid` และแสดง WARNING เมื่อพบ `valid=false` |
| RC-4 | 🔴 บังคับ | ยืนยันและ fix ชื่อไฟล์ electricity (`12-elect.xlsx` หรือ `1.2-elect.xlsx`) และ GHG (`1.5_` หรือ `1.6_`) |
| RC-5 | 🟠 แนะนำ | Commit ไฟล์ `*-2568.csv` ที่ extract จาก XLSX หรือระบุอย่างชัดเจนว่าไม่สามารถ re-derive ได้ |
| RC-6 | 🟡 ดี | แทน `4.1.x` ด้วย indicator ID จริงจากเกณฑ์ Green Office 2569 |

---

## ส่วนที่ 7 — สิ่งที่ดีที่ควรรักษาไว้

แม้ Sprint จะต้อง Reopen แต่ infrastructure ต่อไปนี้มีคุณภาพดีและควรรักษาไว้:

- ✅ TypeScript schema ที่ครอบคลุม (`multi-year-schema.ts`)
- ✅ Deterministic JSON generation — ไม่มี runtime timestamps ใน data
- ✅ Astro integration ที่ถูกต้อง — TH/EN ใช้ numeric source เดียวกัน
- ✅ Water 2568 baseline ยืนยันจาก XLSX จริง (8,337.5 m³)
- ✅ Fuel/Paper/Waste/GHG 2569 ถูก flag เป็น placeholder อย่างถูกต้อง
- ✅ Pipeline command structure (`data:import`, `data:validate`, ฯลฯ)
- ✅ ไม่มี absolute paths ใน public output

---

## ส่วนที่ 8 — Recommended Next Steps

1. **แก้ไข RC-1 ถึง RC-4** ทันที (ไม่ต้องรอ GO-DATA-2)
2. **รวบรวม XLSX ต้นฉบับ** ทั้ง 5 ไฟล์ที่หายไป จากทีม Green Office
3. **ยืนยันชื่อไฟล์** electricity และ GHG กับเจ้าของข้อมูลก่อน re-extract
4. **รับข้อมูล 2569 จริง** จากบิล/มิเตอร์ แล้วแทนที่ demo CSV
5. หลังจาก RC-1–RC-4 เสร็จ → **รัน GO-DATA-2** ที่เน้น evidence traceability

---

*สร้างโดย: QC Audit — 2026-07-23*  
*Commit ที่ตรวจสอบ: `ab8d9e6`*
