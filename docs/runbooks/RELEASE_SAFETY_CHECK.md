# Release Safety Check Runbook

Skill: **RELEASE_SAFETY_CHECK**

## When to Run

Before first GitHub push, any deploy discussion, or sprint close.

## Checklist

### Production safety

- [ ] No production servers edited
- [ ] No production deploy commands run
- [ ] No `.env` or secrets committed
- [ ] Changes are local/static site only

### Git hygiene

- [ ] `git status` reviewed
- [ ] Commit messages describe intent
- [ ] Remote is correct: `https://github.com/numtip/goffice2026.git`
- [ ] Push not performed until QA pass + explicit approval

### Build readiness

- [ ] `npm run check` pass
- [ ] `npm run build` pass
- [ ] Preview smoke test pass

### MVP constraints

- [ ] No database added
- [ ] No API/backend added
- [ ] Static-first preserved

## Push (only when approved)

```powershell
git push -u origin master
```

Do **not** push automatically after QA unless Product Owner instructs.

## Related

- `docs/context-packs/RELEASE_CONTEXT.md`
- `00-GREENOFFICE_PROJECT_CONSTITUTION.MD` — Rule: No Production Edit
