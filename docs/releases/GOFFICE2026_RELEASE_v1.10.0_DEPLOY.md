# GOFFICE2026 v1.10.0 — FY2569 Publish Batch Production Deploy Record

**Deploy status:** `PRODUCTION_SUCCESS`  
**Production URL:** https://goffice.mju.ac.th/  
**GitHub Pages preview (acceptance source):** https://numtip.github.io/goffice2026/  
**Deployed commit (source of truth):** `400105b8236a8fa4ec4e984ca46d748b47987fa4`  
**Commit subject:** Merge pull request #62 from numtip/feat/fy2569-publish-batch  
**PO approval:** 2026-08-26 — explicit production promotion for SHA `400105b` only  
**Deployment date:** 2026-08-26 (Asia/Bangkok)  
**Deployment timestamp:** 2026-08-26T08:58:30+00:00 (UTC) — deployed_by `rae_admin`  
**Previous release:** `v1.9.0` / `da3450985784ecce283e0df341532efa06d88905` — preserved as rollback target  
**Git tag:** none; VPS release label `v1.10.0` only

> **Scope:** Publish-only promotion of six FY2569 activities (ACT-2569-001..006) from accepted GitHub Pages SHA. Canonical state: **25 total / 25 published / 0 draft**. `relatedIndicators=[]` on all FY2569 records. EN translation pending.

---

## Pre-production gate

| Check | Result |
|-------|--------|
| `origin/master` == accepted SHA `400105b` | ✓ PASS |
| Production not advanced beyond accepted SHA | ✓ PASS (was `v1.9.0` @ `da34509`) |
| GitHub Pages acceptance @ `400105b` | ✓ PASS (workflow run #32948138567) |
| Working tree clean at build | ✓ PASS (detached checkout @ `400105b`) |

| Item | Value |
|------|-------|
| Accepted SHA | `400105b8236a8fa4ec4e984ca46d748b47987fa4` |
| Pre-deploy production SHA | `da3450985784ecce283e0df341532efa06d88905` (`v1.9.0`) |
| Rollback target | `/var/www/goffice/releases/v1.9.0` |

---

## Build (development checkout)

| Item | Value |
|------|-------|
| Source workspace | `/home/rae_admin/goffice2026` |
| Deployed source SHA | `400105b8236a8fa4ec4e984ca46d748b47987fa4` |
| Node (check/build) | v22.x (nvm) |
| Install / Build | `npm ci` · `PUBLIC_SITE_URL=https://goffice.mju.ac.th npm run build` |
| Build output | **502 pages** · **1068 files** in `dist/` |
| Stage artifact | `/home/rae_admin/goffice2026-stage/v1.10.0.tar.gz` |
| Artifact sha256 | `b88774ac67f69eeceeb7f16d3c30ae4a55b3bd954232c15b5914dbb00ebe510a` |

### Validation gates (all PASS)

| Gate | Result |
|------|--------|
| `git diff --check` | PASS |
| `npm run check` | PASS |
| `npm test` | PASS (Node 22) |
| `npm run validate` | PASS |
| `npm run build` | PASS — canonical URL `https://goffice.mju.ac.th/` |

---

## Deployment

| Item | Value |
|------|-------|
| Release dir | `/var/www/goffice/releases/v1.10.0` (new, immutable) |
| Symlink | `/var/www/goffice/current` → `/var/www/goffice/releases/v1.10.0` |
| Rollback record | `/home/rae_admin/goffice2026-stage/rollback-target-v1.10.0.txt` |
| Deploy method | Docker volume mount (Alpine 3.20) — tar extract + symlink |
| Metadata | `/var/www/goffice/releases/v1.10.0/.release-meta` |
| Nginx | **config unchanged**; reload not required |

---

## Smoke test (live production)

| Check | Result |
|-------|--------|
| `health-check.sh` primary routes | all **200** |
| TH Activities hub | **200** — **25** published activity links |
| EN Activities hub | **200** |
| FY2569 TH+EN detail routes (6×2) | **12/12 HTTP 200** |
| Historical routes (`activity1`, `traininggreen`, `simina3`) | **6/6 HTTP 200** |
| Year filter `2569` | **6** FY2569 entries |
| Search `compost` | FY2569 slug found |
| EN detail fallback | `translation is pending` banner present |
| Activity media | `/images/activities/2569/.../01.jpg` **200** |
| Audit metadata leak | none (`intakeId` / `poAuthorityBody` absent) |
| Live vs build parity (`index.html` MD5) | **MATCH** (`9ae188480eac97c8709ebcc461cf0e6e`) |

---

## Rollback

```bash
docker run --rm -v /var/www:/var/www alpine:3.20 \
  ln -sfn /var/www/goffice/releases/v1.9.0 /var/www/goffice/current
```

Not executed. Rollback target `v1.9.0` verified present.

---

## Remaining backlog (non-blocking)

- EN translation for six FY2569 activities
- Indicator mapping (`relatedIndicators` deferred)
- November Big Cleaning ครั้งที่ 2 intake
- Evidence schema extension
- Facebook overlay albums

**Verdict:** `FY2569_PRODUCTION_PROMOTION_SUCCESS` · **Release closed:** `V1.10.0_PRODUCTION_DEPLOYED`
