# GO-CAT1-1.1 — FY2568 Source Reconciliation

**Verdict:** `PASS_WITH_GAPS`  
**Date:** 2026-08-19  
**Scope:** Indicators 1.1.1–1.1.4 (Define stage)  
**Authority:** Signed/approved sources in `Data2568/หมวด1/1.1/`; cross-check 1.5 / 1.6 / 1.7 contracts

> FY2568 historical baseline only. No UI built. No official Green Office score claims.

---

## 1. Source inventory

| File | Size | Role | Canonical for |
|------|------|------|---------------|
| `1.1.1 (9-3-69).pdf` | 11 pp | Primary scope declaration | **1.1.1** |
| `1.1.2 (9-3-69).pdf` | 52 pp | Primary policy + committee minutes | **1.1.2** |
| `1.1.3 (9-3-69).pdf` | 1 p | Indicator wrapper (criteria narrative) | 1.1.3 evidence shell |
| `1.1.4 (9-3-69).pdf` | 9 pp | Primary annual plan | **1.1.4** (+ shared 1.6.1) |

**Duplicate resolution:** `(9-3-69)` = export stamp 9 Mar **2569**, not content effective date. No competing DOCX in folder. Numeric targets trace to separate `about/Green_Office_Goals.pdf` (published copy), not the 1.1.3 wrapper PDF.

---

## 2. Runtime status (before → after reconciliation)

| Indicator | Before | After contracts | Presentation |
|-----------|--------|-----------------|--------------|
| **1.1.1** | Generic `Cat1ContractContext`; scope = 9,873 only | Scope + floors + orgs + FY2567 feedback note | **Generic** (no journey) |
| **1.1.2** | No domain mapping; no policy records | 10 commitments + approval dates + PARTIAL interview gap | **Generic** |
| **1.1.3** | Targets contract (6 absolutes, pending OCR) | + targetPercent, supersedes (paper), split sourceRef | **Generic** |
| **1.1.4** | No domain mapping; plan only under 1.6.1 | `proj-plan-1` shared 1.1.4 + 1.6.1 | **Generic** |

**Correction:** Prior CAT1 closeout “16/18 implemented” was **overstated**. Accurate count: **12/18** with dedicated journeys (1.3.1–1.3.3, 1.4.x, 1.5.1/1.5.2, 1.6.x, 1.7.x); **1.1.1–1.1.4** remain contract-backed **generic** pages; **1.2.2 / 1.5.3** MISSING.

---

## 3. 1.1.1 — Context & scope

### Verified (source)

| Fact | Value | Status |
|------|-------|--------|
| Total certified scope | **9,873 m²** | ✓ prose + arithmetic |
| External area | **1,934 m²** | ✓ |
| Floor 1 / 2 / 3 | **3,075 / 2,726 / 2,138 m²** | ✓ |
| Sum check | 1,934 + 3,075 + 2,726 + 2,138 = **9,873** | ✓ |
| Participating organizations | **4** | ✓ §1.1.1(2) |
| FY2567 feedback remediation | m² units + per-room activities added | ✓ page 1 |

**Organizations (exact):**
1. สำนักวิจัยและส่งเสริมวิชาการการเกษตร
2. สถาบันบริการตรวจสอบคุณภาพและมาตรฐานผลิตภัณฑ์ (IQS)
3. สถาบันรับรองระบบการผลิตผลิตภัณฑ์การเกษตร (ICAP)
4. ศูนย์ปรับปรุงพันธุ์ข้าว คณะวิทยาศาสตร์ มหาวิทยาลัยแม่โจ้

**Naming anomaly:** Room tables use **โครงการข้าวฯ** (8 rooms, 762 m², floor 2) for org #4 formal name — alias recorded, not merged.

**Partial:** Floor 1 (ICAP) and floor 3 room registers image-degraded; detail tables not fully machine-readable. External sub-areas listed but not room-enumerated.

**Cross-link:** MR decision D4 (9,873 m² / 4 units) ↔ `scope-1` — consistent.

---

## 4. 1.1.2 — Environmental policy

### Verified

| Fact | Value |
|------|-------|
| Policy statements | **10** (numbered 1–10, FY2568 table) |
| Executive Committee review | **7 มี.ค. 2568** — meeting **1/2568** |
| Signed announcement | **25 มี.ค. 2568** — อธิการบดี |
| Policy retained from FY2567 cycle | Yes (MR + source consistent) |

**Critical distinction preserved:**
- **Review/retention** = 7 Mar 2568 (committee + MR same calendar date, different bodies)
- **Final announcement signed** = 25 Mar 2568 (18 days later)

### 1.1.2(4) — Interview vs documentary

| Element | Status |
|---------|--------|
| Interview requirement stated | ✓ |
| Interview record (transcript/Q&A) | **NOT FOUND** |
| Documentary committee participation | ✓ minutes/photos (image layers) |

**Gap:** `1.1.2` = **PARTIAL** — interview not completed; do not infer from committee attendance.

---

## 5. 1.1.3 — Environmental targets

### Verified target pattern (vs FY2567 baseline)

| Domain | targetPercent | Absolute (repo) | Unit |
|--------|---------------|-----------------|------|
| Electricity | **−1%** | 5,252.55 | kWh/person |
| Fuel | **−3%** | 255.52 | liters* |
| Water | **−1%** | 53.30 | m³/person |
| Paper | **−3%** (post-MR) | 23.13 | kg/person |
| General waste | **−3%** | 50.00 | kg/person |
| GHG | **−1%** | 203.15 | kgCO₂e/person |

\*Fuel stored as org total liters — schema inconsistency retained with note.

### Chronology conflict (resolved in contract)

```
Announcement draft paper −1%  →  MR #1 (7 Mar 2568) amend to −3%  →  repo effective −3%
```

Only **paper** amended at MR; other domains show no draft→final change in available sources.

### Cross-domain flags

| Link | Status |
|------|--------|
| Paper −3% ↔ `mr-decision-m1-08` | ✓ `supersedes` on `target-paper` |
| GHG −1% ↔ `ghg-perf-1` (+4.81%, not met) | Separate metric families — **203.15 ≠ 2440 kg/person** |
| Targets ↔ dashboard resources | Per-capita absolutes; dashboard uses operational monthly data |

**Gap:** Numeric PDF **OCR_REQUIRED** on `Green_Office_Goals.pdf`; percentages derived from repo math + MR minutes until human verifies scan.

---

## 6. 1.1.4 — Annual action plan

### Verified

| Element | Status |
|---------|--------|
| Written FY2568 plan | ✓ |
| 7 Green Office categories | ✓ §1.1.4(1) |
| Activities / timing / owners | ✓ image tables pp.3–8 |
| Planned vs actual columns separate | ✓ — do not treat plan checkmark as completed |
| Approved by 4 organizations' management | ✓ §1.1.4(3) + p.9 signature block |

### Dedup with 1.6.1

**Same document entity:** `proj-plan-1` now shared by **1.1.4** + **1.6.1**.
- Primary `sourceRef`: `1.1/1.1.4 (9-3-69).pdf`
- Co-source: `1.6.1 (9-3-69).pdf` (GHG criterion packaging)
- No second annual-plan record created

**Gap:** Plan row detail not ingested (`annualPlanItem` deferred); ERP attachment `NzY5NTQz` external.

---

## 7. Cross-indicator reuse (source-supported only)

| Link | Evidence |
|------|----------|
| 1.1.1 scope ↔ MR D4 | 9,873 m² / 4 orgs |
| 1.1.2 policy ↔ MR D3 | Policy retained |
| 1.1.3 paper ↔ MR D8 | −1% → −3% |
| 1.1.3 ↔ 1.5.2 GHG | Target −1% vs actual +4.81% (not met; not reviewed at MR #1) |
| 1.1.4 plan ↔ proj-plan-1 ↔ 1.6.1 | Same FY2568 plan document |

No inferred causal links added.

---

## 8. Anomalies / accepted gaps

| ID | Finding |
|----|---------|
| GAP-1.1.2-INTERVIEW | Executive interview not evidenced |
| GAP-1.1.3-OCR | Target numerics OCR_REQUIRED |
| GAP-1.1.3-GHG-METRIC | 203.15 vs 2440 kg/person unresolved |
| GAP-1.1.4-TABLES | Plan/actual rows image-only |
| GAP-RICE-ALIAS | โครงการข้าวฯ vs formal org name |
| GAP-SCOPE-ROOMS | Partial floor 1/3 room registers |

---

## 9. Files changed

| File | Change |
|------|--------|
| `src/data/category1/activities-aspects.json` | Scope breakdown, 4 orgs, 10 policy commitments, approval dates, 1.1.2 PARTIAL gap |
| `src/data/category1/targets.json` | historical-baseline, targetPercent, supersedes, split sources |
| `src/data/category1/projects.json` | proj-plan-1 → 1.1.4 + 1.6.1 shared entity |
| `src/data/category1/category1-manifest.json` | 1.1.1/1.1.2/1.1.4 manifest notes |
| `src/utils/category1-presentation.ts` | INDICATOR_DOMAIN 1.1.2/1.1.4; snapshot facts |
| `scripts/validate-category1-contracts.mjs` | 1.1 scope/policy/target/plan invariants |
| `scripts/test-category1-scope-policy-2568.mjs` | New regression suite |
| `scripts/test-category1-projects-2568.mjs` | proj-plan-1 shared plan test |
| `package.json` | Register new test |

**Not changed:** UI journeys, source PDFs, VPS/production, Category 2/7.

---

## 10. Validation

```bash
node scripts/validate-category1-contracts.mjs
node --test scripts/test-category1-scope-policy-2568.mjs
npm test && npm run check && npm run build && git diff --check
```

---

## 11. Recommended presentation phase (after PO approval)

1. **1.1.1 journey** — scope hero, floor/org breakdown, rice alias disclosure, MR cross-link
2. **1.1.2 journey** — 10 commitments, review vs announcement timeline, interview gap panel
3. **1.1.3 journey** — target table with % + absolutes, paper amendment story, GHG metric-family disclaimer
4. **1.1.4 journey** — plan structure, planned vs actual honesty, shared 1.6.1 identity

---

## 12. CAT1 closeout correction

**Prior closeout (`CAT1 FY2568 BASELINE_CLOSED`) is PROVISIONAL.**

Revised indicator coverage:

| State | Indicators |
|-------|------------|
| Dedicated journey | 1.3.1–1.3.3, 1.4.1–1.4.2, 1.5.1–1.5.2, 1.6.1–1.6.2, 1.7.1–1.7.2 (**12**) |
| Contract generic | 1.1.1–1.1.4 (**4**) |
| MISSING | 1.2.2, 1.5.3 (**2**) |

Define stage (1.1) now has **normalized contracts** but **no presentation journeys** — not “implemented” in the same sense as 1.3–1.7.

---

**Governance:** `GOFFICE2026_CATEGORY1_MANAGEMENT_BLUEPRINT_V1` §3 Define, §13 Phase D.
