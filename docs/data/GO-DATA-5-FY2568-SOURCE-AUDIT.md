# GO-DATA-5: FY2568 Source Audit

**Date:** 2026-08-15
**Status:** SOURCE AUDIT (aggregate, read-only)
**Scope:** Reconcile the FY2568 baseline evidence tree against the frozen category-level baseline. No public-page changes, no data edits, no deployment.

---

## 1. Method and limits

- Reads the FY2568 evidence tree only, in a single read-only pass across the seven category folders.
- Emits **aggregate JSON only**: category counts, per-category byte totals, extension mixes, SHA-256 duplicate-group count, and unreadable-file count.
- **No** source paths, filenames, document contents, URLs, or personal data are recorded or published.

Limits:

- This audit is a **technical reconciliation** of file inventory, not an evidence or content validation.
- Extension and size are the only reliable document signals read here; document purpose is inferred from explicit folder/signal structure only, never from file contents.
- The SHA-256 step groups byte-identical files; it does not judge which copy is authoritative.

## 2. Authoritative reconciliation

| Category | Source files | Total bytes | Type mix (extension → count) |
|----------|-------------:|------------:|------------------------------|
| cat1 | 38 | 118,659,884 | pdf 28 · xlsx 3 · docx 7 |
| cat2 | 29 | 141,145,034 | pdf 24 · xlsx 2 · docx 2 · xls 1 |
| cat3 | 32 | 112,657,378 | pdf 26 · docx 6 |
| cat4 | 28 | 144,189,887 | xlsx 1 · pdf 10 · txt 15 · docx 2 |
| cat5 | 47 | 165,673,052 | pdf 46 · docx 1 |
| cat6 | 32 | 106,547,663 | pdf 31 · docx 1 |
| cat7 | 3 | 1,262,951 | pdf 3 |
| **Total** | **209** | **790,135,849** | — |

The seven category file counts and the total **exactly match** the frozen FY2568 baseline (209).

## 3. Category taxonomy (official)

| Category | Thai | English |
|----------|------|---------|
| 1 | การกำหนดนโยบาย การวางแผนการดำเนินงานสำนักงานสีเขียว | Environmental Policy and Green Office Planning |
| 2 | การสื่อสารและสร้างจิตสำนึก | Communication and Awareness Cultivation |
| 3 | การใช้ทรัพยากรและพลังงาน | Resource and Energy Utilization |
| 4 | การจัดการของเสีย | Waste Management |
| 5 | สภาพแวดล้อมและความปลอดภัย | Environment and Safety |
| 6 | การจัดซื้อและจัดจ้าง | Procurement and Hiring |
| 7 | การดำเนินงานสำนักงานสีเขียวเพื่อความต่อเนื่อง | Green Office Operations for Continuity |

Category 7 is assessed separately from Categories 1–6 and applies only to renewal or upgrade certification.

## 4. Document-purpose/detail coverage by category

Coverage is inferred from **explicit source structure only** (sub-folder granularity and file type). It separates **confirmed** from **ambiguous** signals.

- **cat1** — Confirmed: seven issue-level folders (policy/planning, working team, resource and environmental issues, legal registry, GHG data, GHG reduction projects, management review). Ambiguous: three extension families (report, register, record) require content review before indicator-level claims.
- **cat2** — Confirmed: the source tree contains three subfolders (2.1, 2.2, 2.3), while the canonical taxonomy defines only two issues (2.1, 2.2). The extra 2.3 subfolder has no corresponding canonical issue; it is flagged as an **unresolved anomaly**, not confirmed coverage. Ambiguous: some loose supporting files at category root.
- **cat3** — Confirmed: water, energy, other resources, and meetings/exhibitions folders. Ambiguous: target/indicator and control-measure documents are not yet mapped to individual indicators.
- **cat4** — Confirmed: solid-waste and wastewater folders plus category waste-management report. Ambiguous: a loose quantity record whose parent indicator is unverified.
- **cat5** — Confirmed: five source subfolders (air, lighting, noise, livability, emergency preparedness) plus a category report file. Ambiguous: the category report is not yet split to the five indicators at the source-structure level.
- **cat6** — Confirmed: procurement and hiring folders plus a category report. Ambiguous: no sub-indicator file breakdown recorded at this level.
- **cat7** — Confirmed: **zero source subfolders**; three file records at category root only. There is **no verified individual-indicator mapping**; the three records are not yet attributed to the two canonical renewal/upgrade indicators. Ambiguous: indicator attribution for all three records.

## 5. Disposition items

- **4 duplicate-content groups** were detected by identical SHA-256 hash. Each requires **human disposition** (choose authoritative copy, deduplicate, or retain intentionally as distinct references). The audit does not resolve this.
- **0 unreadable files** is a **technical result only** — every file could be opened and hashed. It is **not** evidence validation and does not confirm content correctness, currency, or completeness.

## 6. Boundary clarifications

- **FY2568 baseline** is recorded at **category level only** (`CATEGORY_LEVEL_RECORDED`). Indicator-level mapping is **not verified** by this audit.
- This audit is **not** a 2569 comparison or current-data report. 2569 partial/current data lives in a separate pipeline and is excluded here.
- No per-indicator, per-document, or per-file conclusion should be drawn from these aggregate counts.

## 7. Public presentation recommendation

- Publish the category-level counts, total, and the taxonomy table exactly as in Sections 2–3.
- Publish the duplicate-group and unreadable counts **only** as aggregate status, with the explicit caveat that neither implies content validation.
- Do **not** publish individual source titles, paths, or content excerpts.
- Label all 2568 figures as **category-level baseline**, distinct from 2569 comparison/current data and from direct indicator mapping.

### Public-document decision and comparison workflow (2026-08-15)

- **FY2568 is a frozen public baseline.** Source documents are physically published inside the Astro site (Document Center) with no authentication and no access restrictions. All prior Microsoft 365 / OneDrive / SharePoint access-restriction wording is removed from the public pages.
- Every category detail page presents a paired comparison panel: **FY2568 (ปีฐาน / Year Base)** with the audited record count, safe document-type aggregate, and a public link to the category Document Center; and **FY2569 (ปีประเมิน / Assessment Year)** with status **รอการอัปเดต / Awaiting update**.
- The committee reviews the FY2568 baseline together with the FY2569 assessment; no FY2569 counts, evidence, results, or indicator mappings are invented in this release.

### Evidence publication (physically in Astro)

- **All 209 audited FY2568 documents are published** byte-identically under `public/documents/fy2568/cat1..cat7` (original titles, relative structure, and content preserved; source tree never modified). This closes the prior gap where the Document Center listed route shells without the actual documents.
- Document Center pages enumerate and directly link each published document with its **original title, type, and file size**.
- `src/data/fy2568-publication.json` is the deterministic manifest (path, title, type, size, SHA-256, percent-encoded URL); regenerate via `scripts/publish-fy2568-documents.mjs`. `scripts/test-fy2568-publication.mjs` proves all 209 files and category totals.
