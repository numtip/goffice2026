# ACTIVITY_CONTENT_CONTRACT_V1

**Status:** ACTIVE — Round 1 baseline  
**Updated:** 2026-08-25  
**Authority:** Blueprint V5, Content Architecture V2 §12–§14, Round 1 Shared Contracts  
**Scope:** Public activities (`/activities/`) and news (`/news/`) — static JSON, no CMS/backend

---

## 1. Purpose

Define the canonical data shape, routing, and migration metadata for Green Office **activities** (กิจกรรม) and **news** (ข่าวสาร). Round 1 delivers runtime + contract + authoring helper + migration inventory. **No mass migration** until PO validates disposition.

---

## 2. Content kinds

| Kind | Route hub | Detail route | ID prefix |
|------|-----------|--------------|-----------|
| `activity` | `/activities/` | `/activities/{slug}/` | `ACT-{FY}-{SEQ}` |
| `news` | `/news/` | `/news/` | `NEWS-{FY}-{SEQ}` |

- Thai default at root; English under `/en/`.
- Sort **published** items by `publishDate` DESC (ISO `YYYY-MM-DD`).
- `fiscalYear` (พ.ศ.) is metadata only — never used as sort key when `publishDate` exists.

---

## 3. Canonical record shape

See `src/data/content/activities.json` and `src/data/content/news.json` for live examples. Required published fields: `id`, `slug`, `kind`, `status`, `titleTh`, `titleEn`, `summaryTh`, `summaryEn`, `publishDate`, `fiscalYear`, `source`, `updatedAt`.

---

## 4. Category and type vocabularies

Defined in `src/data/content/activity-categories.json`. **Do not map to indicator codes unless verified.**

---

## 5. File locations

| File | Purpose |
|------|---------|
| `src/data/content/activities.json` | Activity records |
| `src/data/content/news.json` | News records |
| `src/data/content/activity-categories.json` | Facet vocabularies |
| `src/data/migration/joomla-activities-inventory.json` | Joomla audit (not runtime) |
| `docs/data/GO-ACTIVITIES-MIGRATION-BATCHES.md` | Batch plan FY2568 → older |

---

## 6. Runtime rules

1. Latest-first by `publishDate` DESC  
2. Filters: `?year=`, `?category=`, `?type=` (activities)  
3. Detail pages from published records only  
4. Empty hub shows pending slots from `hubs.json` — no fake content  
5. Homepage: latest 3 published activities via shared util  

---

## 7. Joomla migration metadata

Preserve `joomlaArticleId`, `joomlaUrl`, `joomlaCategory` on every migrated record. See full contract in repo commit message / Round 1 report.

---

## 8. Authoring

**New activities (FY2569+):**

```bash
npm run activity:new -- \
  --title "ชื่อกิจกรรม" \
  --date 2026-03-17 \
  --year 2569 \
  --slug ascii-slug \
  --category meeting \
  [--type committee] \
  [--dry-run]
```

See `docs/blueprint/GOFFICE2026_ACTIVITY_NEW_CONTENT_WORKFLOW_V1.md` for publish sequence (draft → edit → `published` → regenerate search index → validate/build → PR).

**Legacy stub (news or quick draft — prefer `activity:new` for activities):**

```bash
npm run news:new -- --kind activity --title "..." --year 2569
node scripts/validate-activities.mjs
```

---

## 9. Round 1 non-goals

No mass Joomla import, no OneDrive writes, no indicator auto-mapping, no backend/CMS.
