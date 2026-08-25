# GO-ACTIVITIES-MIGRATION-BATCHES

**Date:** 2026-08-25 (updated after subagent audits)  
**Status:** Round 1 — inventory + batch plan only (no mass migration)  
**Authority:** ACTIVITY_CONTENT_CONTRACT_V1

---

## Batch order (historical, newest first)

| Batch | Fiscal years | Source | Est. records | Gate |
|-------|--------------|--------|--------------|------|
| **B0** | FY2569 | OneDrive `Data2569`, action-plan actuals | 3 verified done + plan rows | PO-approved publish only |
| **B1** | FY2568 | Joomla `project2` HTML listing | **22 articles** (IDs 21–68, gaps) | Disposition review complete |
| **B2** | FY2567 | Joomla + legacy archives | Subset of B1 + Data2568 | After B1 validated |
| **B3** | FY2566 and earlier | Joomla (e.g. ID 28 Big Cleaning 2023) | TBD | After B2 validated |
| **B-knowledge** | Mixed | Joomla `content1` (แหล่งเรียนรู้) | ~10 articles | Separate from activities — link to `/knowledge/` |

---

## B1 — Joomla `project2` (กิจกรรม)

**Inventory:** `src/data/migration/joomla-activities-inventory.json`  
**Audit:** `node scripts/audit-joomla-activities.mjs` (HTML listing + RSS merge)

| Fact | Detail |
|------|--------|
| Authoritative count | **22** via `?limit=100` HTML listing |
| RSS metadata | **10** items only — identical bogus `pubDate` on all |
| Article IDs | 21, 28, 29, 30, 31, 32, 36, 39, 40, 43, 55, 56, 57, 59, 60, 62, 63, 64, 65, 66, 67, 68 |
| Event dates | Parse `วันที่:` from article body — ignore Joomla `pubDate` |
| Media | `images/activity/{folder}/` via Lightgallery; legacy Widgetkit on ID 21 |
| EN content | None on legacy site |

**Repo legacy refs (not project2-specific scrape):**
- `docs/j2xmllearning.xml` — `content1` exports, not `project2`
- `docs/migration/legacy-content/legacy-audit-summary.md` — 746 `activity_image` files
- `docs/migration/legacy-content/legacy-pilot-candidates.csv` — filesystem paths

---

## B0 — FY2569 OneDrive `Data2569`

**Path:** `E:\OneDrive\Research\OneDrive - Maejo university\RAE-Document-Center\07-GreenOffice\Data2569`

| Priority | Source | Status | Disposition |
|----------|--------|--------|-------------|
| P0 | Cat1 action plan xlsx (147 activities) | In repo as `action-plan-2569.json` | Plan evidence — not auto-published as news |
| P1 | Cat2 training plan docx + curriculum xlsx | **Not yet in repo** | Migrate to `public/documents/fy2569/cat2/` before activity posts |
| P2 | Cat3 measures doc/pdf | Not yet in repo | Compliance — EXCLUDE from activities unless PO promotes |
| P3 | Cat2/2.2.x, Cat4–7 folders | Empty skeletons | Await `_EVIDENCE` media uploads — future news source |
| — | Cat4–7 empty | 0 files | EXCLUDE until collection |

**Only 3 workbook activities have verified actual dates** (candidates for first FY2569 posts after PO approval):

| Date (BE) | Activity | Category |
|-----------|----------|----------|
| 5 Mar & 30 Mar 2569 | Management review committee + meetings | Cat1 / 1.7 |
| 17 Mar 2569 | Internal Green Office audit (all categories) | Cat7 / 7.1 |

Governance announcements (policy 1 Apr, committee 31 Mar, scope 5 Apr, plan approved 20 Apr) are **compliance docs** already migrated to `public/documents/fy2569/cat1/` — publish as news only if PO approves.

---

## B-knowledge — Joomla `content1` (out of B1 scope)

~10 knowledge articles under **แหล่งเรียนรู้สำนักงานสีเขียว** at `/index.php/content1`.  
Do not merge into `project2` activity migration — reconcile with existing `/knowledge/` practices instead.

---

## Workflow

1. `node scripts/audit-joomla-activities.mjs` — refresh inventory
2. PO assigns KEEP / MERGE / EXCLUDE per item
3. `npm run news:new -- --kind activity --title "..." --year 2569`
4. Fill TH/EN, `source.joomla*`, media under `public/`
5. `node scripts/validate-activities.mjs` → `npm run build` → `npm run validate`

**No auto-publish. No OneDrive writes.**
