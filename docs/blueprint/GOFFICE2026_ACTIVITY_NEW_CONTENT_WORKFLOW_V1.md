# GOFFICE2026 — Activity New-Content Workflow Design V1

**Date:** 2026-08-26  
**Status:** IMPLEMENTED — `npm run activity:new` (Phase E foundation)  
**Authority:** `ACTIVITY_CONTENT_CONTRACT_V1`, live `activities.json` (19 published), B1/B2/B3 migrators  
**Baseline:** Historical Joomla `project2` migration complete (`B3_LIVE_ACCEPTANCE_PASS`)

---

## 1. Current canonical Activity contract

### 1.1 Collection envelope

| Field | Required | Notes |
|-------|----------|-------|
| `version` | yes | Semver string (currently `1.3.0`) |
| `updated` | yes | ISO date `YYYY-MM-DD` |
| `note` | optional | Human audit trail |
| `items` | yes | Array of activity records |

### 1.2 Record fields (runtime + validator)

| Field | Required | Validator | Runtime usage |
|-------|----------|-----------|---------------|
| `id` | yes | unique | Search index id; traceability |
| `slug` | yes | `^[a-z0-9]+(?:-[a-z0-9]+)*$`, unique | Route `/activities/{slug}/` |
| `kind` | yes | must be `activity` | Collection guard |
| `status` | yes | `published` \| `draft` \| `archived` | Static paths + search index filter on `published` only |
| `translationPending` | de facto yes for migrated | not validated | EN pages show TH fallback + amber banner when true |
| `titleTh` | yes | non-empty | Card, detail, search |
| `titleEn` | if published and not `translationPending` | non-empty when required | EN card/detail |
| `summaryTh` | yes | non-empty | Card, detail meta, search context |
| `summaryEn` | if published and not `translationPending` | non-empty when required | EN search/card |
| `bodyTh` | optional | — | Detail body (falls back to `summaryTh`) |
| `bodyEn` | optional | — | EN detail (falls back to `summaryEn`) |
| `publishDate` | yes | ISO `YYYY-MM-DD` | Sort key (DESC); display via `formatPublishDate` |
| `fiscalYear` | yes | number (BE) | Filter `?year=`; display only — **not** sort key |
| `category` | de facto yes (19/19 published) | **not validated** | Filter `?category=`; card label; `{id,labelTh,labelEn}` |
| `activityType` | optional | **not validated** | Filter `?type=`; 17/19 published have it |
| `media` | optional | **not validated** | Array of `{type,src,altTh,altEn}`; `type`: `image` \| `video` |
| `relatedIndicators` | optional | format `^\d+\.\d+\.\d+$` if present | Detail unused today; contract hook |
| `relatedLinks` | optional | **not validated** | Detail related-links section |
| `source` | yes | `source.system` required | Traceability block on detail |
| `contentOwner` | optional | — | All migrated = `"Green Office team"` |
| `updatedAt` | yes (contract doc) | **not validated** | Audit metadata |

### 1.3 ID generation rules (observed)

- Pattern: `ACT-{FY}-{SEQ}` where `FY` = fiscal year (BE), `SEQ` = 3-digit zero-padded per FY prefix.
- Examples: `ACT-2568-001`, `ACT-2567-009`, `ACT-2566-002`.
- SEQ is **not** strictly chronological; B1 assigned IDs in PO cohort order, not publish-date order.
- Next FY2569 ID: **`ACT-2569-001`** (no FY2569 records exist yet).
- Existing stub helper (`new-activity.mjs`) uses the same pattern via `nextId(items, ACT-${year})`.

### 1.4 Slug rules (observed)

- Migrated slugs come from Joomla URL slug (ASCII), e.g. `simina3`, `traininggreen`, `bigcleaning2025-1`.
- Validator: lowercase alphanumeric + hyphens only.
- **No Thai transliteration** in migrators; Thai titles do not drive slugs.
- Collision handling in B2/B3: throw on duplicate slug before append.
- Existing `slugify()` in `new-activity.mjs` strips non-ASCII → Thai-only titles produce `draft-{timestamp}` (**broken for production**).

### 1.5 Date / year rules (observed)

- `publishDate`: ISO Gregorian event date (canonical truth for sorting/display).
- `fiscalYear`: BE metadata; typically `publishDate CE year + 543` but **not enforced** by validator.
- TH display: `{d}/{m}/{y+543}` via `formatPublishDate`.
- EN display: `9 Jan 2024` (en-GB, UTC).
- Joomla migration date governance (`joomla-activity-dates.mjs`): body narrative wins over header on conflict; `source.dateResolution` preserves raw header evidence (**migration-only**).

### 1.6 Category / type enums

Source: `src/data/content/activity-categories.json`

**Categories:** `meeting`, `training`, `campaign`, `assessment`, `award`, `preparedness`, `historical`

**Activity types:** `committee`, `workshop`, `community`, `cleaning`, `eco-event`

Stored as embedded facet objects `{id, labelTh, labelEn}` — not bare string ids.

### 1.7 Status enum

| Status | Static detail route | Hub listing | Search index | Homepage latest-3 |
|--------|--------------------|-------------|--------------|-----------------|
| `published` | yes | yes | yes | yes |
| `draft` | no | no | no | no |
| `archived` | no | no | no | no |

Homepage “featured” = **latest 3 by `publishDate` DESC** (`getLatestPublished`) — no `featured` field exists.

### 1.8 Media structure

```json
{
  "type": "image",
  "src": "/images/activities/migrated/{joomlaId}-{joomlaSlug}/{file}.jpg",
  "altTh": "{title} — ภาพที่ {n}",
  "altEn": ""
}
```

- Public path prefix `/images/activities/…` resolved via `withBase()`.
- Migrated media lives under `public/images/activities/migrated/`.
- First image used as card thumbnail.

### 1.9 Source / traceability fields

| `source.system` | Fields used | Context |
|-----------------|-------------|---------|
| `joomla` | `joomlaArticleId`, `joomlaUrl`, `joomlaCategory`, `migratedAt`, optional `mergedSources[]`, optional `dateResolution` | B1/B2/B3 |
| `manual` | `{ system: "manual" }` only (stub) | Intended for new content |
| `onedrive` | typed in TS, unused in live data | Future |

**Migration-only fields (must NOT appear on new manual records unless PO extends contract):**

- `joomlaArticleId`, `joomlaUrl`, `joomlaCategory`, `migratedAt`, `mergedSources`, `dateResolution`

### 1.10 TH/EN behavior

- Default locale TH at `/activities/`; EN at `/en/activities/`.
- `pickLocalizedContent(locale, th, en, translationPending)`: when `translationPending && !en`, EN UI shows TH + banner.
- All 19 published migrated records: `translationPending: true`, empty `titleEn`/`summaryEn`/`bodyEn` — **valid and live**.

### 1.11 Category / indicator / evidence fields

- **Category/type:** presentation facets only; not indicator mappings.
- **`relatedIndicators`:** optional string codes (`1.2.3`); all migrated = `[]`; validator checks format only.
- **`relatedLinks`:** optional `{route, labelTh, labelEn}`; all migrated = `[]`.
- **No evidence-id field** on activity records.

---

## 2. B1 / B2 / B3 logic reconciliation

### 2.1 Shared logic (triplicated)

| Concern | Location | Notes |
|---------|----------|-------|
| Body cleaning | `cleanBody()` | Strip HTML, truncate broken tags |
| Summary | `summarize(body, title, 220)` | Thin-body fallback |
| Media filter | `imagePaths(fetch)` | jpg/png/webp only |
| Media download | `downloadImages()` | Joomla → `public/images/activities/migrated/{id}-{slug}/` |
| Facet embed | `facet(id, kind)` | Loads labels from `activity-categories.json` |
| Record shape | `buildRecord()` | Same core fields |
| JSON write | `writeJsonFile()` | Canonical 2-space LF |

### 2.2 Intentional differences

| Aspect | B1 | B2 | B3 |
|--------|----|----|-----|
| Mode | Replace collection | Append | Append |
| Cohort | FY2568 PO IDs | FY2567/FY2566 | #30, #56 edge |
| Merge support | yes (#62→#63) | yes (#40→#39) | no |
| Date resolution | raw `fetch.publishDate` | raw `fetch.publishDate` | `resolveCanonicalEventDate()` |
| `source.dateResolution` | no | no | yes (#56 conflict) |
| Idempotency | none | skip existing `actId` | skip + count guard |
| Sort after write | yes (publishDate DESC) | yes | yes |
| Slug source | Joomla slug | Joomla slug | Joomla slug |

### 2.3 Legacy-only vs new-content fields

| Field | Migrated | New manual |
|-------|----------|------------|
| `source.system=joomla` + Joomla ids | yes | **no** |
| `source.dateResolution` | yes (#56) | **no** |
| `translationPending: true` | all 19 | optional (recommended default for FY2569 intake) |
| `category` / `activityType` | always set (type optional for 2) | user must supply |
| Media under `migrated/` | yes | use separate convention (see §6) |

**Do not refactor B1/B2/B3.** Extract shared helpers only when implementing `activity:new`, without changing migrators.

---

## 3. Existing reusable helpers / tests

### 3.1 Helpers

| Asset | Path | Reuse for `activity:new` |
|-------|------|--------------------------|
| Draft stub (partial) | `scripts/new-activity.mjs` | ID/slug/skeleton — needs fixes |
| JSON I/O | `scripts/lib/serialize-json.mjs` | yes |
| Facet vocab | `src/data/content/activity-categories.json` | yes — validate category/type ids |
| Presentation types | `src/utils/content-presentation.ts` | sort/filter/date helpers |
| Thai date parse | `scripts/lib/joomla-activity-dates.mjs` | optional for `--date` BE input only |
| Search generator | `scripts/generate-search-index.mjs` | post-publish step |

### 3.2 Validators / tests defining the contract

| Gate | What it enforces |
|------|------------------|
| `scripts/validate-activities.mjs` | id/slug/kind/status/titleTh/summaryTh/publishDate/fiscalYear/source.system; EN fields when published without `translationPending`; sort order |
| `scripts/test-activities-contract.mjs` | 19 count, #30/#56 dates, media counts, sort/filter utils |
| `scripts/test-joomla-activity-dates.mjs` | Migration date governance (not needed for manual) |
| `scripts/test-activities-phase-d.mjs` | Historical migration completeness |
| `scripts/smoke-routes.mjs` | Activity routes 200 |
| `scripts/generate-search-index.mjs` + `validate-search-index.mjs` | Published-only search entries |
| `npm run validate` | Platform gate includes search-index drift check |

### 3.3 Search index integration

- **Derived, not manual.** `scripts/generate-search-index.mjs` reads `src/data/content/activities.json`.
- Includes only `status === 'published'` items (§9b).
- Route: `/activities/{slug}/`; EN title/context fall back to TH when EN empty (matches runtime).
- Committed `src/data/search-index.json` must be regenerated after publish; `validate-search-index.mjs` detects drift.
- **Not wired into `npm run build`** — separate CI step via `npm run validate`.

---

## 4. Contract risks / gaps

| Risk | Evidence | Impact on `activity:new` |
|------|----------|------------------------|
| Existing stub fails validator | `new-activity.mjs` sets `summaryTh: ''` | Draft must include non-empty `summaryTh` or validator relaxed for draft-only |
| Thai slug broken | `slugify()` strips Thai → `draft-{ts}` | Require explicit `--slug` for Thai titles |
| Category not validated | 19/19 live have category | Helper should require `--category`; warn if missing at publish |
| `fiscalYear` vs `publishDate` unchecked | no cross-field rule | Helper validates `fiscalYear === CE year + 543` (warn, not block, if mismatch) |
| `translationPending` not in validator | all migrated rely on it | Default `true` for FY2569 intake to match live pattern |
| `archived` status unused | no live examples | Helper may omit; document only |
| Sort order on insert | stub uses `unshift` | Must re-sort collection after insert (publishDate DESC) |
| No delete/rollback tool | — | Document manual revert procedure |
| ID SEQ gaps | ACT-2568-002 exists but sort ≠ ID order | Accept gaps; allocate `max(SEQ)+1` per FY |

---

## 5. `activity:new` proposed workflow

```
PO / author
  → npm run activity:new -- [flags]
  → edit activities.json + add media under public/images/activities/…
  → node scripts/validate-activities.mjs
  → node scripts/generate-search-index.mjs   (when status=published)
  → npm test / npm run check / npm run validate / npm run build
  → git commit → PR → CI → merge (no direct deploy)
```

- New FY2569+ records append to **same** `src/data/content/activities.json` collection as migrated items.
- Default status: **`draft`** until PO sets `published`.
- No auto-publish, no deploy, no CMS.

---

## 6. CLI / input / output design

### A. Command name and syntax

**Primary (new):**

```bash
npm run activity:new -- \
  --title "ชื่อกิจกรรม" \
  --year 2569 \
  --date 2026-03-17 \
  --slug management-review-mar2569 \
  --category meeting \
  [--type committee] \
  [--summary "สรุปสั้น"] \
  [--status draft] \
  [--translation-pending] \
  [--dry-run]
```

**Keep alias (deprecate later, do not remove in v1 impl):**

```bash
npm run news:new -- --kind activity ...
```

Add to `package.json`:

```json
"activity:new": "node scripts/activity-new.mjs"
```

### B. Interactive vs non-interactive

| Mode | When |
|------|------|
| **Non-interactive (default)** | All required flags on CLI — suitable for CI/docs |
| **Interactive (`--interactive`)** | Prompt for missing required fields; confirm slug/id before write |

### C. Required vs optional inputs

| Input | Required | Default |
|-------|----------|---------|
| `--title` | yes | — |
| `--year` (BE fiscal) | yes | — |
| `--date` (ISO or BE Thai date) | yes for publish-ready; optional for draft | today ISO |
| `--slug` | yes if title is Thai-only; else derived from ASCII title | slugify(ascii title) |
| `--category` | yes | — |
| `--type` | no | omit (matches assessment/award pattern) |
| `--summary` | yes (validator) | first 220 chars of title |
| `--status` | no | `draft` |
| `--translation-pending` | no | `true` |
| `--content-owner` | no | `Green Office team` |
| `--owner` / `--created-by` | — | **PROPOSED_EXTENSION** |

### D. Fields auto-generated by helper

| Field | Rule |
|-------|------|
| `id` | `ACT-{year}-{nextSeq3}` per FY prefix |
| `slug` | `--slug` or ASCII slugify + collision suffix |
| `kind` | `activity` |
| `status` | `draft` (unless `--status published` blocked without gate — see H) |
| `titleTh` | `--title` |
| `titleEn` | `""` |
| `summaryTh` | `--summary` or truncated title |
| `summaryEn` | `""` |
| `bodyTh` / `bodyEn` | `""` |
| `publishDate` | from `--date` |
| `fiscalYear` | `--year` |
| `category` | facet object from vocab |
| `activityType` | facet object if `--type` |
| `media` | `[]` (+ optional `--media-dir` scan — see F) |
| `relatedIndicators` | `[]` |
| `relatedLinks` | `[]` |
| `source` | `{ system: "manual", createdAt: ISO date }` — `createdAt` is **PROPOSED_EXTENSION**; minimal canonical = `{ system: "manual" }` only |
| `updatedAt` | today ISO |
| `translationPending` | `true` unless `--no-translation-pending` |
| Collection `updated` | today ISO |

### E. Media folder / path convention

**New content (not migrated):**

```
public/images/activities/{fiscalYear}/{slug}/{filename}.jpg
→ src: /images/activities/{fiscalYear}/{slug}/{filename}.jpg
```

- Do **not** write under `migrated/` (reserved for Joomla traceability).
- Helper optionally creates empty directory and prints copy instructions.
- Optional `--media-dir ./local-photos/` → copy files + build `media[]` with alt pattern `{titleTh} — ภาพที่ {n}`.

### F. ID allocation strategy

1. Scan `activities.json` for `^ACT-{year}-(\d{3})$`.
2. `nextSeq = max + 1`, zero-pad to 3 digits.
3. Fail if `nextSeq > 999` (PROPOSED_EXTENSION: widen SEQ — not in current contract).

### G. Slug collision handling

1. If slug exists → append `-{seq}` suffix (same as current `new-activity.mjs`).
2. `--dry-run` prints would-be id/slug without write.
3. Never overwrite existing record.

### H. Date / year validation

1. Accept `--date` as ISO `YYYY-MM-DD` **or** BE Thai `D MMMM 2569` (reuse `parseThaiDate`).
2. Compute expected FY = CE year + 543; warn if `--year` differs.
3. Do not auto-correct FY without user flag.

### I. Category / indicator / evidence validation

| Field | Rule |
|-------|------|
| `--category` | must exist in `activity-categories.json` |
| `--type` | must exist in `activityTypes` if provided |
| `--indicators` | **not in v1** — if added later, validate `^\d+\.\d+\.\d+$`; never auto-map from category |
| evidence | **no field** — out of scope |

### J. Draft / published behavior

| Status | Helper behavior |
|--------|-----------------|
| `draft` (default) | Write record; skip search-index regen hint |
| `published` | **Reject unless `--allow-publish`** and validator pre-check passes (summaryTh, etc.) |
| `archived` | Reject in v1 helper |

Publishing is a **manual JSON edit** or future `activity:publish` — not default helper path.

### K. Search-index integration

After setting `status: published`:

```bash
node scripts/generate-search-index.mjs
node scripts/validate-search-index.mjs
```

Helper prints these commands on `--allow-publish` success. Never hand-edit `search-index.json`.

### L. Validation commands after creation

```bash
node scripts/validate-activities.mjs
npm test   # includes test-activities-contract.mjs
npm run check
DEPLOY_TARGET=github-pages npm run validate
npm run build
node scripts/smoke-routes.mjs   # after build + preview, or live
```

### M. Rollback / delete for abandoned draft

No automated tool in v1. Manual procedure:

1. Remove record from `activities.json` by `id`.
2. Delete `public/images/activities/{year}/{slug}/` if created.
3. Re-run `validate-activities.mjs`.
4. If was ever published: regenerate search index.

**PROPOSED_EXTENSION:** `activity:delete --id ACT-2569-001 --dry-run`

### N. Minimal tests before implementation

| Test | Assert |
|------|--------|
| `test-activity-new.mjs` | ID allocation FY2569 → `ACT-2569-001` |
| | Thai title + explicit slug |
| | Thai title without slug → error |
| | Category/type facet embedding |
| | Created draft passes `validate-activities.mjs` |
| | Slug collision suffix |
| | Sort order after insert |
| | `translationPending: true` allows empty EN when published |
| | Draft excluded from search-index generation |
| `--dry-run` | no file mutation |

---

## 7. Validation + failure handling

| Failure | Helper response |
|---------|-----------------|
| Duplicate slug | auto-suffix or exit with suggestion |
| Invalid category/type | exit 1 with vocab list |
| Missing summary | auto-fill from title (never empty) |
| Publish without EN and no `translationPending` | exit 1 with hint |
| Write would break sort order | re-sort before save |
| activities.json parse error | exit 1, no partial write |
| `--dry-run` | stdout JSON preview, exit 0 |

All writes via `writeJsonFile` — atomic single-file replace.

---

## 8. PROPOSED_EXTENSION items

Not in current canonical contract — do **not** implement without PO approval:

| Extension | Rationale |
|-----------|-----------|
| `source.createdAt` / `source.createdBy` | audit trail for manual entries |
| `source.approvedAt` / `source.approvedBy` | PO publish gate |
| `featured: boolean` | explicit homepage pinning (today = latest-3 only) |
| `evidenceIds: string[]` | link to evidence-index entries |
| `activity:publish` / `activity:delete` subcommands | lifecycle beyond stub |
| Widen ID SEQ > 999 | high-volume FY |
| Validator: require `category` on published | tighten contract |
| `--indicators` auto-suggest from category | violates “do not infer indicator” rule |

---

## 9. Recommended implementation scope

### Phase 1 (minimal viable `activity:new`)

1. Add `scripts/activity-new.mjs` (do not modify B1/B2/B3).
2. Extract **read-only** shared utilities from migrator patterns into `scripts/lib/activity-record.mjs`:
   - `nextActivityId`, `resolveSlug`, `buildFacet`, `sortActivitiesCollection`, `summarize`
3. Add `npm run activity:new` script.
4. Fix stub gaps: non-empty `summaryTh`, explicit slug for Thai, `translationPending`, category facet, sort after insert.
5. Add `scripts/test-activity-new.mjs`; wire into `npm test`.
6. Update `ACTIVITY_CONTENT_CONTRACT_V1.md` §8 authoring section (pointer only).

### Out of scope for v1

- CMS/backend/OneDrive writes
- Auto indicator/evidence mapping
- Media download from external URLs
- Publish/deploy automation
- Changes to migrated records or migrators
- EN translation workflow

---

## 10. Final verdict

**`PHASE_E_NEW_CONTENT_FOUNDATION_READY_FOR_MERGE`** (pending CI)

Implementation: `scripts/activity-new.mjs` + `scripts/lib/activity-record.mjs` + `scripts/test-activity-new.mjs`.

Reconciled contract notes (implementation matches design):

- `source` for manual records is `{ system: "manual" }` only — no `createdAt` extension.
- `--allow-publish` is rejected by default; publishing remains manual JSON edit + search regen.
- Media skeleton path: `public/images/activities/{fiscalYear}/{slug}/` (not `migrated/`).
- Default `translationPending: true`; override with `--no-translation-pending`.
- Interactive mode deferred — non-interactive CLI only in v1.

The canonical Activity contract remains unchanged. Historical Joomla migration tooling stays frozen.
