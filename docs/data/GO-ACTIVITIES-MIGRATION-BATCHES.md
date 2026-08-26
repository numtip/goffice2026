# GO-ACTIVITIES-MIGRATION-BATCHES

**Date:** 2026-08-26 (Phase D reconciliation)
**Status:** Joomla `project2` historical cohort **COMPLETE** (19 published). Legacy archives pending Phase A/B.
**Authority:** ACTIVITY_CONTENT_CONTRACT_V1

---

## Batch order (historical, newest first)

| Batch | Fiscal years | Source | Est. records | Gate |
|-------|--------------|--------|--------------|------|
| **B0** | FY2569 | OneDrive `Data2569`, action-plan actuals | 3 verified done + plan rows | PO-approved publish only |
| **B1** | FY2568 | Joomla `project2` HTML listing | **9 records** (IDs 57–68; #62→#63) | **COMPLETE** — merged PR #56 batch |
| **B2** | FY2567/FY2566 | Joomla `project2` subset | **8 records** (#55,#43,#39+#40,#36,#32,#31,#29,#28) | **COMPLETE** |
| **B3** | FY2567 edge | Joomla #30, #56 | **2 records** | **COMPLETE** — `B3_LIVE_ACCEPTANCE_PASS` |
| **D-next** | Pre-2566 / legacy | Legacy filesystem (`746 activity_image`) | TBD | **BLOCKED** — requires Phase A audit + Phase B disposition |
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

**New FY2569+ manual content:**

1. `npm run activity:new -- --title "..." --date YYYY-MM-DD --year 2569 --slug ascii-slug --category <id> [--dry-run]`
2. Edit draft in `activities.json`; add media under `public/images/activities/{year}/{slug}/`
3. `node scripts/validate-activities.mjs`
4. Set `status: published` when PO approves → `node scripts/generate-search-index.mjs`
5. `npm run build` → `DEPLOY_TARGET=github-pages npm run validate` → PR/CI

**Historical Joomla migration (complete):**

1. `node scripts/audit-joomla-activities.mjs` — refresh inventory
2. PO assigns KEEP / MERGE / EXCLUDE per item
3. B1/B2/B3 migrators (frozen — do not rerun without PO)

**No auto-publish. No OneDrive writes.**

---

## Phase D closeout (2026-08-26)

Reconciliation: `node scripts/reconcile-activities-phase-d.mjs`

| Year (BE) | Source total | KEEP | MERGE | EXCLUDE | REVIEW | Migrated | Remaining eligible |
|-----------|-------------|------|-------|---------|--------|----------|-------------------|
| 2568 | 9 | 0* | 0* | 0 | 9* | 9 | 0 |
| 2567 | 10 | 8 | 1 | 0 | 1* | 10 | 0 |
| 2566 | 2 | 2 | 0 | 0 | 0 | 2 | 0 |
| unknown | 1 | 0 | 0 | 1 | 0 | 0 | 0 |

\*FY2568 articles were PO-approved via B1 while inventory still marked REVIEW; disposition file updated at Phase 2A for HTML-only cohort. #21 EXCLUDE (no event date, insufficient for contract).

**Verdict:** `PHASE_D_HISTORICAL_BLOCKED` for Joomla `project2` — all dispositioned KEEP/MERGE records are canonical. Next historical intake = legacy archive audit, not FY2569 new content (B0).
