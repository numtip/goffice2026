# GOFFICE2026 Release Status — 2026-08-22

> จัดทำโดย: Hardening Sprint H1 (branch `chore/hardening-h1`)
> ขอบเขต: ข้อมูลจาก repository ภายในเท่านั้น — ไม่มีการเข้าถึง/แก้ไข production (VPS)

---

## 1. Release tags (verified from git)

ตรวจสอบจาก git โดยตรง (branch master, 21 ส.ค. 2026):

| Tag | SHA (annotated tag → commit) | วันที่ commit | Release |
|-----|------------------------------|--------------|---------|
| v1.5.0 | `c7966115c4540bf060e19800b3016119d2fa03f4` | 2026-08-10 | production deploy (recorded) |
| v1.5.1 | `2bfd7cadebe5c7472205c6316a94ab6e56f547bd` | 2026-08-11 | production deploy (recorded) |
| v1.6.0 | `011c9fee0b1dd6a84f6599348db6a46a95754f94` | 2026-08-13 | GO-MOTION-V2 (VPS cutover) |
| v1.7.0 | `380bf3bd7060585555d5ac7104693a84f0176f70` | 2026-08-19 | CAT1 FY2568 |
| v1.8.0 | `1b11c48b5297fe9ac798a16a6a5c760539b48d34` | 2026-08-21 | cinematic hero + CAT1 presentation |

- Tags ทั้ง 5 เป็น **annotated tags** (สร้างย้อนหลัง 21 ส.ค. 2026 จาก deploy commits จริง)
- วิธีตรวจ: `git rev-list -n1 <tag>` ต่อ tag — ตรงกับ SHA ในตารางทุกตัว ✅

## 2. Latest successful preview workflow (GitHub Pages)

- **Run:** #32504745370 — **success** ✅
- **Trigger:** `push` ไป master | **Commit:** `2aa6547` (chore(security): add Dependabot config)
- **เวลา:** 2026-08-21T16:47:24Z | ระยะเวลา: ~4 นาที
- **Workflow:** `Deploy GitHub Pages Preview` (`.github/workflows/deploy-pages.yml`)
- **ผล deploy:** jobs quality → build → deploy ผ่านครบ (preview site: https://numtip.github.io/goffice2026/)

> ⚠️ **หมายเหตุ:** GitHub Pages = **PREVIEW เท่านั้น** (ตาม comment ใน workflow:
> "Preview deployment only — production remains on goffice.mju.ac.th (manual VPS)")

## 3. Production status (goffice.mju.ac.th)

### ⚠️ UNVERIFIED — requires VPS release manifest

- **ไม่มีหลักฐานจาก VPS ในขอบเขต H1** — ยังไม่มีการตรวจ release manifest บน production host
- หลักฐานใน repo ที่พบ (**self-reported เท่านั้น**): commits `docs(release): record production deploy at <sha>` และไฟล์ `docs/releases/GOFFICE2026_RELEASE_vX.Y.Z_DEPLOY.md` อ้างว่า deploy production ที่:
  - v1.8.0 → `1b11c48` (21 ส.ค.)
  - v1.7.0 → `380bf3b` (19 ส.ค.)
  - v1.6.0 → `011c9fe` (13 ส.ค.)
  - v1.5.1 → `2bfd7ca` (10 ส.ค.)
  - v1.5.0 → `c796611` (10 ส.ค.)
- **ข้อห้าม:** HTTP 200 จาก goffice.mju.ac.th **ไม่ถือเป็นหลักฐาน** ว่า production รัน release ใด
- **สิ่งที่ต้องทำ (นอกขอบเขต H1):** ตรวจ VPS release manifest (deploy log / version file / checksum บน host) เพื่อยืนยัน production SHA/path/rollback

## 4. Open hardening follow-ups (งานค้าง)

| # | รายการ | สถานะ | หมายเหตุ |
|---|--------|--------|----------|
| 1 | **Branch protection** บน master (require PR + status checks) | ยังไม่ทำ (แนะนำไว้เท่านั้น) | รอการตัดสินใจ workflow ของทีม |
| 2 | **Dependency PR review** — 14 PR ของ Dependabot (#24–#37) | เปิดค้าง รอ review/merge | รวม astro 4→7 (#37), tailwind 3→4 (#33), typescript→7 (#32), actions majors (#24–#28) |
| 3 | **xlsx replacement** | ยังไม่ทำ | แพ็คเกจไม่มี fix (dev-only) — เสนอ @e965/xlsx หรือ exceljs |
| 4 | PR CI (ci.yml) | ✅ ทำใน Sprint นี้ | PR ใหม่ทุกตัวจะมี CI gate แล้ว |

## 5. Evidence sources

- Tags: `git rev-list -n1` ต่อ tag ทั้ง 5 ตัว
- Preview runs: `gh run list` (GitHub Actions API)
- Workflow triggers: `.github/workflows/deploy-pages.yml` (push master/main + workflow_dispatch เท่านั้น — ไม่มี pull_request trigger)
- เอกสารนี้สร้างจาก repository-local evidence เท่านั้น — ไม่มีการอ้าง production เกินกว่าหลักฐานที่มี
