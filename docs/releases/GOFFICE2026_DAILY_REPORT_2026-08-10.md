# Green Office 2026 — Daily Operations Report

**Date:** 10 August 2026 (10 สิงหาคม 2569, Asia/Bangkok)  
**Branch:** `master`  
**Repository:** https://github.com/numtip/goffice2026  
**Production URL:** https://goffice.mju.ac.th/  
**Preview URL:** https://numtip.github.io/goffice2026/

---

## 1. Executive Summary

วันนี้ดำเนินการ **Production cutover v1.5.0** จาก GitHub baseline `c796611` (16 commits หลัง live `v1.4.0` / `075866b`) รวม **GO-EVIDENCE-1** traceability บน indicator/evidence และ **GO-DASH-V2** จากนั้นบันทึก release เป็นเอกสาร, commit/push ขึ้น `master`, และ commit/push ชุด **`docs/migration/`** ที่ค้าง untracked

**Verdict รวม:** `PRODUCTION_SUCCESS` · release docs `RELEASE_CLOSED` · GitHub `master` @ `82abb05`

---

## 2. Production Deploy — v1.5.0

| Item | Value |
|------|-------|
| Deployed SHA | `c7966115c4540bf060e19800b3016119d2fa03f4` |
| Tip commit message | `fix(pages): mark client filter scripts inline for astro check` |
| Previous live | `v1.4.0` @ `075866b43e7e05e21aee9733fac5b744c0e8f6fe` |
| New release dir | `/var/www/goffice/releases/v1.5.0` |
| Active symlink | `/var/www/goffice/current` → `v1.5.0` |
| Rollback | `/var/www/goffice/releases/v1.4.0` (preserved) |
| Deploy time (UTC) | `2026-08-10T07:45:27+00:00` (~14:45 ICT) |
| Pages / files | 254 pages · 315 files |
| Artifact sha256 | `1084ee5917cb74f1e9d2d06d351de332fd3314954a5a46c65a4c03b0fa4cb1d5` |
| Git tag `v1.5.0` | **None** at record time (VPS label only) |

### Preflight (read-only)

- Local `HEAD` หลัง sync: `c796611` (= verified `origin/master` ก่อน deploy)
- Fast-forward จาก `075866b` · tracked tree สะอาด · `docs/migration/` untracked ไม่ถูกลบ

### QA / build (checkout @ `c796611`)

| Gate | Result | Notes |
|------|--------|--------|
| `npm ci` | PASS | Node 22 สำหรับ test suites ที่ import `.ts` |
| `npm test` | PASS | 121 + 18 executive checks |
| `npm run build` | PASS | `PUBLIC_SITE_URL=https://goffice.mju.ac.th` |
| `npm run validate` | PASS | Platform validation + link check |
| `git diff --check` | clean | |

### Cutover method

- Staged tarball: `/home/rae_admin/goffice2026-stage/v1.5.0.tar.gz`
- Script มาตรฐาน: `goffice2026-stage/deploy-v1.5.0.sh` (modeled on `deploy-v1.4.0.sh`)
- รันจริง: Docker-equivalent staging ตาม OPERATIONS_RUNBOOK (host `sudo` ต้องรหัสผ่าน)
- **Nginx / Cloudflare:** ไม่แก้ config · **data-sync / Excel:** ไม่แตะ

### Smoke test (production)

| Route | HTTP |
|-------|------|
| `/` | 200 |
| `/indicators/` `/en/indicators/` | 200 |
| `/evidence/?indicator=3.2.2` (+ EN) | 200 + client filter |
| `/indicators/3.2.2/` (+ EN) | 200 + traceability |
| `/dashboard/` `/evidence/` `/about/` `/documents/` | 200 |

- Offline evidence: แสดง unavailable · ไม่มีลิงก์ไฟล์ปลอม
- `index.html` MD5: live `current` ตรงกับ local `dist/`

### Commits promoted (`075866b..c796611`, 16)

รวม GO-DASH-V2 (ECharts 6, Phase A–C, partial YoY), GO-EVIDENCE-1 (traceability, client-side filters, indicator index), preview hardening, Astro inline-script fix — รายละเอียดเต็มใน [GOFFICE2026_RELEASE_v1.5.0_DEPLOY.md](./GOFFICE2026_RELEASE_v1.5.0_DEPLOY.md)

---

## 3. Documentation & Git (same day)

### Release documentation (docs-only)

| Commit | Message |
|--------|---------|
| `81805b9` | `docs(release): record production v1.5.0 deploy at c796611` |

**Files:**

- `docs/releases/GOFFICE2026_RELEASE_v1.5.0_DEPLOY.md` (new)
- `CHANGELOG.md` — section `[1.5.0]`
- `docs/releases/GOFFICE2026_CHANGELOG.md` — section `[1.5.0]`
- `README.md` — production pointer + release link

Pushed: `81805b9` → `origin/master`

### Migration artifacts

| Commit | Message |
|--------|---------|
| `82abb05` | `docs(migration): add legacy and SharePoint evidence migration artifacts` |

**Scope:** 29 files under `docs/migration/` (legacy verification, SharePoint evidence registry, export-pilot manifests, quarantine HTML)

Pushed: `82abb05` → `origin/master`

---

## 4. Constraints Observed

| Rule | Status |
|------|--------|
| No application source edits for deploy/docs sprint | ✅ |
| No force push | ✅ |
| No GitHub Pages as production artifact | ✅ |
| No Nginx/Cloudflare config changes | ✅ |
| No data-sync / Excel / dashboard data pipeline runs | ✅ |
| Preserve `v1.4.0` for rollback | ✅ |
| No new Git tag without prior check | ✅ (tag list empty) |
| Do not overwrite prior release history docs | ✅ (append-only changelog) |

---

## 5. Repository State (end of day)

```text
master @ 82abb05 (synced with origin/master)
Production live @ c796611 (VPS v1.5.0)
Working tree: clean (migration committed)
```

---

## 6. References

- Deploy record: [GOFFICE2026_RELEASE_v1.5.0_DEPLOY.md](./GOFFICE2026_RELEASE_v1.5.0_DEPLOY.md)
- Rollback script: `/home/rae_admin/goffice2026-stage/rollback-v1.5.0.sh`
- Deploy log: `/home/rae_admin/goffice2026-stage/deploy-v1.5.0.log`
- Operations: `docs/runbooks/OPERATIONS_RUNBOOK.md` · `joomla-greenoffice/docs/OPERATIONS_RUNBOOK.md`

---

**Report author:** AI-assisted session (rae_admin VPS)  
**Status:** `COMPLETE`
