# GOFFICE2026 Release Prep — 2026-08-05

**Final status:** `PRODUCTION_SUCCESS`
**Version approved by PO:** `1.3.0` (2026-08-05)
**Release commit:** `743774325eda4d2a33f8bc914e60eca80286504a` (master = tag `v1.3.0`)
**Build baseline:** tag `v1.3.0` (= `441de66` + version bump)
**Deployed:** 2026-08-05T09:15:15+00:00 (UTC) — deploy_via `sudo /home/rae_admin/goffice2026-stage/deploy-v1.3.0.sh`
**Previous production:** `v1.2.0` / `934e960` — preserved as rollback target (NOT deleted)
**Node runtime used:** v20.19.5 (nvm) · npm 10.8.2

> Per `VERSION_RECOMMENDATION_RC1.md` gate rules and `RELEASE_SAFETY_CHECK`:
> **Deployment completed successfully — see section 5. Production was not modified
> outside the versioned immutable release flow.**

---

## 1. Version proposal

| Item | Value |
|---|---|
| **Approved version** | **`1.3.0`** (PO อนุมัติ 2026-08-05) |
| Rationale | 18 commits หลัง v1.2.0 เป็น feature expansion (GO-SEARCH-1, GO-EVIDENCE-1, GO-ABOUT-2, GO-UX-5) — SemVer minor bump ตาม VERSION_RECOMMENDATION_RC1.md |
| Package.json | bumped `1.2.0` → `1.3.0` (พร้อม lockfile + locales platform_version) |

**Release commit:** `7437743` — `chore(release): bump to v1.3.0 — production release prep (PO approved 2026-08-05)`

**Pushed to GitHub (2026-08-05):**
- `master` → `7437743` ✓
- tag `v1.3.0` (annotated, `3a9e9b4` tag object → `7437743`) ✓

---

## 2. Content delta vs production (deployed v1.2.0 → master 441de66)

18 commits ครอบคลุม:

- **GO-UX-5** — presentation layer ใหม่ (nav, breadcrumb, hero, cards, typography, motion, BackToTop, dashboard KPI readability)
- **GO-EVIDENCE-1** — evidence integration (foundation + interconnect About/Dashboard/Evidence/Documents)
- **GO-SEARCH-1** — global search TH/EN + search-index.json
- **GO-ABOUT-2** — action plan V2 (filter, Gantt, print) + FY2569 จาก Excel
- **About fixes** — indicator counts, category headings, scope ของ Action Plan pages
- **Logo wording** — official Green Office identity (441de66, 2026-08-04)

---

## 3. Build & QA evidence (ทั้งหมด PASS — Node 20.19.5)

| Gate | Result | Detail |
|---|---|---|
| `npm ci` | PASS | package-lock 1.2.0 |
| `npm run check` | PASS | 0 errors · 0 warnings (9 hints) |
| `npm test` | PASS | 18/18 |
| `npm run build` | PASS | **252 pages** · `PUBLIC_SITE_URL=https://goffice.mju.ac.th` |
| `npm run validate` | PASS | 7 categories / 24 issues / 65 indicators / 24 evidence / 251 routes |
| `npm run qa:seo` | PASS | 26 OK · 0 FAIL |
| `npm run qa:routes` | PASS | 36/36 (v1.2.0 เคยได้ 34/34) |
| `npm run qa:links` | PASS | 10,506 hrefs / 4,312 unique links |

Artifact: `/home/rae_admin/goffice2026-release-v1.3.0/dist/` — built จาก clean worktree ที่ tag `v1.3.0` (`7437743`) เมื่อ 2026-08-05 (252 pages, validate PASS) → staged เป็น tarball `v1.3.0.tar.gz` (sha256 `c4cb6632…`) → **deployed ไปยัง `/var/www/goffice/releases/v1.3.0` แล้ว (ดู section 5)**

---

## 4. Dependency advisory (ไม่บล็อก — บันทึกไว้)

`npm audit --omit=dev`: 6 รายการ (astro/vite/js-yaml/postcss/sharp=high, esbuild=moderate)
เป็น build-time advisory ของ static site (Nginx serve static เท่านั้น ไม่มี dev-server/SSR ใน prod)
→ ควรวางแผน upgrade Astro line แยกเป็นงานถัดไป

---

## 5. Deploy result (completed 2026-08-05)

| Step | Result |
|---|---|
| Stage tarball | `v1.3.0.tar.gz` · 311 files · sha256 `c4cb6632…` ✓ |
| Checksum + build identity preflight | PASS (abort-on-mismatch) |
| Immutable release dir | `/var/www/goffice/releases/v1.3.0` (new) ✓ |
| Staging validation | 311/311 files · `index.html` · `404.html` · `_astro` ✓ |
| `.release-meta` | version=v1.3.0 · tag=v1.3.0 · commit=7437743 · deployed_at=2026-08-05T09:15:15+00:00 · pages=252 · artifact_sha256 ✓ |
| Ownership | `chown -R www-data:www-data` ✓ |
| Atomic switch | `current → /var/www/goffice/releases/v1.3.0` (`ln -sfn`) ✓ |
| Nginx | `nginx -t` PASS · reload only (0 real errors after) ✓ |
| Rollback target | `v1.2.0` recorded in `rollback-target.txt` — release kept, NOT deleted ✓ |

### Smoke test (Phase 4) — 10/10 routes HTTP 200

`/` `/en/` `/dashboard/` `/categories/` `/documents/` `/evidence/` `/search/` `/about/` `/categories/cat1/` `/dashboard/energy/`

- Content identity: logo wording v1.3.0 present; content-length 98634 → 101869; legacy markers (Joomla/JoomShaper/Helix) = 0
- Assets: CSS/JS/fonts/images 200; live asset sha256 = built artifact sha256 (identity match)
- TH/EN nav ทำงานทั้งสองทิศ · 404 page ถูกต้อง · robots/sitemap 200
- Nginx error delta: 0 real errors (1 notice = reload signal from activation)

**Rollback decision:** ไม่ต้อง rollback — ทุกเกณฑ์ผ่าน

**Rollback verification:** `rollback-v1.3.0.sh` พร้อมใช้ · `v1.2.0` release intact · `rollback-target.txt` = `/var/www/goffice/releases/v1.2.0` (ไม่ได้ทดสอบการ switch กลับจริง ตามหลักปฏิบัติไม่ทำหลัง deploy สำเร็จ)

---

## 6. สิ่งที่ยังค้าง

- [x] PO อนุมัติเวอร์ชัน **1.3.0** (2026-08-05)
- [x] PO อนุมัติ push + tag → master `7437743` + tag `v1.3.0` อยู่บน GitHub แล้ว
- [x] **PO อนุมัติ deploy** → **PRODUCTION_SUCCESS** 2026-08-05T09:15:15+00:00 (10/10 routes PASS)
- [ ] จัดประเภทไฟล์ untracked ใน workspace (docs/backend/, docs/migration/, docs/plans/DC-GO_*, GO-BE-PREFLIGHT-AUDIT-REPORT.md, audit report)
- [ ] อัปเดต `GOFFICE2026_VPS_VERSION_AUDIT_2026-08-05.md` (สรุปเดิมผิดจาก stale ref)
- [ ] วางแผน upgrade npm audit (6 advisories)

*Report: /home/rae_admin/goffice2026 · 2026-08-05*
