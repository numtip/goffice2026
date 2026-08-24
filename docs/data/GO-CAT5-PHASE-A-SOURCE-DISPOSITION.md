# GO-CAT5-PHASE-A: Source Disposition + Decision Freeze

**Date:** 2026-08-24 (Asia/Bangkok)
**Status:** DECISION FREEZE — reads only; no runtime/data mutation of FY2568 sources
**Repository HEAD baseline:** `74d1abbd17fb77d9295f0993e0d83494f943fe25` (= origin/master, Cat4 baseline merged)
**Authority:** official Green Office 2569 criteria (`src/data/criteria/indicators.json` cat5, 13 indicators) · frozen FY2568 Cat5 sources as the baseline layer for FY2569 · Cat3/Cat4 source-disposition templates (format only — no facts copied)
**Scope:** Resolve Cat5 (หมวด 5 สภาพแวดล้อมและความปลอดภัย) FY2568 evidence/version/criterion decisions before Phase B/C implementation. **Independent verification — Cat2/Cat3/Cat4 findings not assumed.**

---

## 0. FY2568 source baseline reconciliation

Source (read-only, private OneDrive location): `Data2568/หมวด5` — **47 physical files**, ~165.7 MB total.

- **Manifest reconcile: 47/47 manifest docs match source by SHA-256 + size** (verified live; `src/data/fy2568-publication.json` `categories.cat5` = 47 docs, 165,673,052 B).
- **Repo mirror `public/documents/fy2568/cat5/` = complete and byte-identical: 47/47 SHA-256 verified.**
- **Duplicates: none** (no shared SHA-256 or size groups across the 47 files).
- **1 misplaced / FY2569-contamination file EXCLUDED from the FY2568 baseline** — see §6.
- **23 files are image-only scans** classified `filename_folder_only` (no OCR/transcription performed in this phase); the remaining files have a readable text layer or are content-verified via the annual report DOCX.
- The annual report DOCX `รายงานกรีนหมวด 5 (68) อาคารสมเด็จพระเทพฯ.docx` is the **only fully content-verified source** (text extracted read-only; covers all 13 indicators). Its PDF export is a convenience copy and never a record sourceRef.

### Deterministic 47-file inventory (relative path · type · bytes · SHA-256)

The full table is deterministic and machine-checkable against `fy2568-publication.json → categories.cat5.documents` (path + sha256 + sizeBytes per entry); it is not duplicated here to avoid transcription drift. Grouping:

| Group | Files | Notes |
|---|---|---|
| 5.1 air | 11 | 9× `5.1.1(n)` maintenance packs (plans/forms/photos), 1× no-smoking pack, 1× section summary `5.1.pdf` |
| 5.2 lighting | 2 | `รายงานวัดค่าแสง ปี68.pdf` (44 pp measurement report) + `5.2.pdf` |
| 5.3 noise | 2 | measures document + `5.3.pdf` |
| 5.4 livability | 10 | area-care plan, vector-control plans ×3, green area, Big Cleaning Day, 5S photos, cleaning contracts ×2 (งบ 68 canonical / งบ 69 excluded), `5.4.pdf` |
| 5.5 emergency | 20 | drill project approval/floor plan/signage/flags/assembly/photos/certificate ×7, emergency plans ×2, equipment summary + extinguisher logs/reports ×6, hose-cabinet reports ×3 (-1/-2/-4), `5.5.pdf` |
| Annual report | 2 | DOCX (canonical supporting report) + PDF export |

---

## 1. 13-indicator evidence matrix

| Indicator | Primary source path(s) | Strength | Verification | Gap |
|---|---|---|---|---|
| 5.1.1 Indoor air pollution control | `5.1/5.1.1.../(1)–(9)` + annual report §3.1–3.6 | Strong | verified_content (report text); packs are scans | Scan contents pending OCR |
| 5.1.2 No-smoking campaign | `5.1.2 (1)-(4)....pdf` + report §(1)–(5) | Medium | text layer present + report cross-reference | Signage photos are images |
| 5.1.3 Construction air pollution | report §5.1.3 narrative | Medium | verified_content (narrative only) | No standalone evidence file |
| 5.2.1 Light measurement | `รายงานวัดค่าแสง ปี68.pdf` + report §5.2.1 | Strong | text layer + report cross-reference | Per-point lux values need human review |
| 5.3.1 Internal noise control | `มาตรการควบคุมการใช้พลังงานและทรัพยากร ปี 68.pdf` + report §5.3.1 | Medium | text layer + report cross-reference | **CONTEXTUAL_NA_PENDING_ASSESSOR** (no sound-level measurement declared) |
| 5.3.2 Construction noise | report §5.3.2 narrative (backup rooms floors 1–3) | Weak-Medium | verified_content (narrative only) | No standalone evidence file |
| 5.4.1 Livability plan | `5.4(1)แผนการดูแลพื้นที่ของสำนักงาน ปี68.pdf` + report §5.4.1 | Medium | report verified; plan is a scan | Plan itself scan-only |
| 5.4.2 Space utilization % | report §5.4.2 narrative | Weak | verified_content (narrative) | **PERCENT_NOT_EVIDENCED** |
| 5.4.3 Area maintenance % | `5.4-3`, `5.4-4`, `5.4-5` + report §5.4.3 | Medium | report verified; activity packs scans | **PERCENT_NOT_EVIDENCED** |
| 5.4.4 Vector control | `5.4(2)-(3)` plans floors 1–3 + report §5.4.4 | Medium | report verified; plans scans | Inspection forms scan-only |
| 5.5.1 Fire drill training | `5.5.1-1…7` + report §5.5.1 | Strong | verified_content (drill 30 May 2568; 104 attendees ≈78.35% vs ≥40%) | Certificate/approval scans pending OCR |
| 5.5.2 Emergency plan | `5.5.2(1),(2)` + report §5.5.2 | Strong | text layers + report cross-reference | **PERCENT_NOT_EVIDENCED** (personnel understanding) |
| 5.5.3 Fire equipment readiness | `5.5(2)-1…7`, `5.5.3-1,-2,-4` + report §5.5.3 | Strong | verified_content (26 extinguishers, 12 hose points, alarm system, per-floor logs) | **EXPECTED_SOURCE_UNCONFIRMED**: `5.5.3-3` absent |

**Coverage: 13/13 indicators resolve to ≥1 valid manifest document** (enforced deterministically by `scripts/validate-category5-contracts.mjs`).

## 2. Verified facts safe for FY2568 presentation

Extracted read-only from the content-verified annual report DOCX:

- Building: อาคารเฉลิมพระเกียรติสมเด็จพระเทพรัตนราชสุดาฯ, 4 units, assessed area 9,881 m² (outside 1,934 / inside 7,947 m²).
- Green area: 282 m² outside (14.58% of outdoor area; 2.91% of total) + 6 m² indoor.
- AC maintenance: 148 units, 2 rounds/year (round 1 Jan–Mar 2568 self-clean; round 2 May–Oct 2568 incl. contractor).
- Light measurement: 7–8 Jul 2568 by กองกายภาพและสิ่งแวดล้อม ม.แม่โจ้; measurer ผศ.ดร.ชนวัฒน์ นิทัศน์วิจิตร (จป.วิชาชีพ).
- Fire drill: 30 May 2568; 97 building staff, 104 attendees (≈78.35% vs ≥40%) + 28 external participants; assembly point front of building, backup at ลานจัตุรัสนานาชาติ.
- Fire equipment: 26 extinguishers, 12 hose points, alarm system + heat detectors, unobstructed access, per-floor inspection logs.
- Noise: building declares no sound-level measurement needed (no significant noise source).

**NOT safe / unverified:** any figure inside the 23 scan-only files until OCR/manual verification; anything implying FY2569 results.

## 3. Locked disclosures (decision freeze)

| Code | Disclosure |
|---|---|
| `FY2569_CONTAMINATION_EXCLUDED` | `5.4 ความน่าอยู่/5.4-1 สัญญาจ้างทำความสะอาดอาคาร งบ 69.pdf` is a FY2569-budget document; **excluded from all FY2568 records**. The FY2568 twin `5.4-5 ... งบ 68.pdf` is canonical for 5.4.3. |
| `NOISE_MEASUREMENT_CONTEXTUAL_NA` | 5.3.1 = **CONTEXTUAL_NA_PENDING_ASSESSOR** — building declares no sound-level measurement performed; assessor acceptance pending; re-affirm or measure in FY2569. |
| `LIVABILITY_PERCENT_NOT_EVIDENCED` | 5.4.2 utilization % and 5.4.3 maintenance % are **not evidenced numerically** anywhere in FY2568 sources. |
| `EMERGENCY_UNDERSTANDING_PERCENT_NOT_EVIDENCED` | 5.5.2 personnel-understanding % is **not evidenced**. |
| `HOSE_CABINET_REPORT_3_UNCONFIRMED` | `5.5.3-3` hose-cabinet report absent (**EXPECTED_SOURCE_UNCONFIRMED**); floor 3 covered by `5.5.3-4`; data-owner confirmation required. |
| `SCAN_ONLY_FILES` | 23 image-only scans stay `filename_folder_only`; **no OCR/transcription in this phase**. |

## 4. FY2569 baseline-layer principle

FY2568 Cat5 is the **baseline layer for FY2569**:

- Every contract record carries `baselineYearLabel` ("ข้อมูลฐานปี 2568") and `fy2569Status: "awaiting-update"`.
- Recurring evidence streams are declared per-record via `fy2569Recurrence` (AC maintenance ×2/year, light measurement annual, drill annual, vector inspections continuous, cleaning campaigns yearly, N/A declarations annual).
- **Never relabel a FY2568 result, measurement, interview, percentage, or inspection as a FY2569 result.** The FY2568 drill attendance (78.35%) and light-measurement date (7–8 Jul 2568) are permanently FY2568 facts.
- Static infrastructure (plans, signage, floor plans, assembly points, equipment inventory) is reusable baseline unless areas/responsibilities change.
- `Data2569/Cat5/` folder skeleton exists (13 indicator folders) but is empty at decision time — collection owners must be assigned.

## 5. Implementation artifacts (Phase B)

- `src/data/category5/category5-manifest.json` + `air.json`, `lighting.json`, `noise.json`, `livability.json`, `emergency.json` — canonical static contracts (schema mirrors Cat4).
- `src/data/evidence-index.json` — 13 new indicator-level entries `ev-cat5-*-fy2568`.
- `scripts/validate-category5-contracts.mjs` — deterministic gate (manifest↔contract↔evidence path/hash equality, 13/13 coverage, locked disclosures).
- **FY2569 action-plan canonical mapping (semantic correction, criteria-based):** 14 of 17 cat-5 activities mapped by criteria meaning — 5.1.1=5 (incl. carpet cleaning), 5.2.1=1 (light measurement), 5.4.1=1 (green-area expansion), 5.4.3=4 (rest/green/shared/workspace + surrounding-area care), 5.4.4=1 (vector-trail inspection), 5.5.1=1 (fire drill), 5.5.3=1 (alarm/emergency-light/extinguisher survey). **5.4.2 and 5.5.2 are deliberately 0** (space-utilization % and emergency-understanding % have no plan activity — disclosed FY2569 GAPs, never backfilled). Bookshelf/journal cleaning, work-result reporting and the Cat5 committee meeting stay unmapped. Enforced by `scripts/validate-action-plan-2569.mjs` (`validateActionPlanCat5Canonical`).
- Presentation wiring reusing the Cat3/Cat4 architecture: management cycle + domain snapshot on the category page, contract context + source documents on indicator pages. No score, no PASS claim.

## 6. Gaps / data-owner questions

1. **งบ 69 contract** — confirm exclusion from FY2568 (it belongs to FY2569 procurement; candidate first FY2569 evidence for 5.4.3).
2. **`5.5.3-3`** — confirm whether the missing hose-cabinet report exists or numbering was intentional.
3. **OCR scope** — approve OCR/manual transcription for the 23 scan-only files before their contents may be quoted.
4. **Percentages** — decide how 5.4.2/5.4.3/5.5.2 percentages will be produced for FY2569 (survey instrument, inspection tally, interview form).
5. **Noise stance** — confirm assessor accepts the CONTEXTUAL_NA declaration for 5.3.1 or schedule a measurement.
