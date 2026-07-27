# Version Recommendation — RC-1

**Date:** 2026-07-27  
**Baseline commit:** `dbac61c` (RC release pack)  
**Prepared by:** Subagent E — Release Manager · updated Head Agent 2026-07-27  
**RC status:** Accepted by Product Owner — push/tag pending approval

---

## Recommendation

| Field | Value |
|-------|-------|
| **Semantic version** | `1.2.0-rc.1` |
| **Git tag name** | `v1.2.0-rc.1` |
| **Package.json alignment** | `1.2.0` (current) — RC suffix denotes pre-release |
| **Production baseline** | `v1.1.3` (unchanged) |
| **Next stable target** | `1.2.0` (after PO acceptance and limitation remediation) |

---

## Rationale

1. **Package version is already `1.2.0`** — RC-1 extends the documented v1.2.0 scope (SharePoint foundation) with Rapid Completion deliverables (About Center, evidence expansion, data reconciliation).
2. **No `v1.2.0` tag exists** — latest production tag is `v1.1.3`. The `-rc.1` pre-release suffix signals preview-ready state without implying production deployment.
3. **SemVer pre-release convention** — `1.2.0-rc.1` follows [SemVer 2.0.0](https://semver.org/) pre-release identifier rules (`-rc.N` for release candidates).
4. **Alternative considered: `1.3.0-rc.1`** — rejected for RC-1 gate because package metadata and v1.2.0 release notes already anchor the 1.2 line; minor bump deferred until PO accepts stable release and limitations are closed.

---

## Tag Instructions (do not execute in RC-1 gate)

```powershell
# FOR REFERENCE ONLY — RC-1 gate prohibits tagging and pushing
git.exe tag -a v1.2.0-rc.1 HEAD -m "Green Office 2026 RC-1 — Rapid Completion preview candidate"
git.exe push origin master
git.exe push origin v1.2.0-rc.1
```

---

## Version Progression Plan

| Stage | Version | Tag | Deploy target |
|-------|---------|-----|---------------|
| RC-1 (current) | `1.2.0-rc.1` | `v1.2.0-rc.1` | GitHub Pages preview only |
| RC-2 (if needed) | `1.2.0-rc.2` | `v1.2.0-rc.2` | Preview after limitation fixes |
| Stable | `1.2.0` | `v1.2.0` | VPS production (PO approval) |
| Hotfix | `1.2.1` | `v1.2.1` | Production patch |

If Rapid Completion scope expands significantly before stable release, reassess bump to `1.3.0-rc.1`.

---

## RC-1 Gate Constraints

- **Do not tag** during RC-1 artifact preparation
- **Do not push** tags or deploy to production VPS
- Tag creation deferred to Product Owner release approval gate

---

## References

- [RELEASE_NOTES_RC1.md](./RELEASE_NOTES_RC1.md)
- [KNOWN_LIMITATIONS_RC1.md](./KNOWN_LIMITATIONS_RC1.md)
- [GOFFICE2026_CHANGELOG.md](./GOFFICE2026_CHANGELOG.md)
