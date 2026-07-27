# Git Tag Recommendation — RC-1

**Status:** Recommended only — **do not create or push until Product Owner approval**  
**Date:** 2026-07-27  
**RC acceptance:** Product Owner accepted RC-1 for preview release  
**Target commit:** `dbac61c` (`docs(release): finalize RC-1 accepted release pack for PO push gate`)

---

## Recommended Tag

| Field | Value |
|-------|-------|
| **Semantic version** | `1.2.0-rc.1` |
| **Git tag name** | `v1.2.0-rc.1` |
| **Package.json** | `1.2.0` (pre-release suffix on tag only) |
| **Prior production tag** | `v1.1.3` |

---

## Commands (execute after PO push approval)

```powershell
# 1. Verify HEAD matches RC commit
git.exe -C "G:/ProjectAI/goffice2026" log --oneline -1 dbac61c

# 2. Create annotated tag (local)
git.exe -C "G:/ProjectAI/goffice2026" tag -a v1.2.0-rc.1 HEAD -m "Green Office 2026 RC-1 — Rapid Completion preview candidate"

# 3. Push master + tag (PO approval required)
git.exe -C "G:/ProjectAI/goffice2026" push origin master
git.exe -C "G:/ProjectAI/goffice2026" push origin v1.2.0-rc.1
```

---

## Verification after tag

```powershell
git.exe show v1.2.0-rc.1 --no-patch
git.exe tag -l "v1.2*"
```

---

## Notes

- Tag marks the **preview** release candidate, not production VPS deploy.
- Production remains `v1.1.3` at `https://goffice.mju.ac.th/` until stable `v1.2.0` PO sign-off.
- See [GITHUB_PAGES_PUBLISH_CHECKLIST_RC1.md](./GITHUB_PAGES_PUBLISH_CHECKLIST_RC1.md) for Pages deploy steps.
