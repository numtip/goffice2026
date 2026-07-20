# Context Pack: Release

Use before first GitHub push, tag, or any deploy discussion.

## Source of Truth

- GitHub: https://github.com/numtip/goffice2026
- Development (Linux VPS): `/home/rae_admin/goffice2026`
- Build output: `/home/rae_admin/goffice2026/dist/`
- Production releases: `/var/www/goffice/releases/<version>/`
- Local path (Windows): `G:\ProjectAI\goffice2026`
- Remote: `origin` → `https://github.com/numtip/goffice2026.git`

## Pre-Push Checklist

1. `git status` clean (or intentional staged changes)
2. `npm run check` pass
3. `npm run build` pass
4. `npm run preview` + route smoke test pass
5. Runbooks: BUILD_VERIFICATION, RUNTIME_QA, RELEASE_SAFETY_CHECK
6. Confirm **no production** edited or deployed

## Explicit Non-Goals (MVP)

- No production deploy in Sprint 0.x unless PO approves
- No database/API/backend
- No force-push to main without approval

## Push Workflow (when approved)

```powershell
git push -u origin master
```

Use branch protection and PR workflow when team process requires it.

## Reports

- `docs/reports/SPRINT_SUMMARY_TEMPLATE.md`
- `docs/reports/AGENT_HANDOFF_TEMPLATE.md`
