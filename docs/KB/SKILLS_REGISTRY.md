# Skills Registry

Mandatory agent skills for Green Office 2026. Each skill maps to a runbook and optional context pack.

| Skill ID | Purpose | Runbook | Context Pack |
|----------|---------|---------|--------------|
| TOKEN_SAVIOR_WORKFLOW | Reduce token use via reuse, packs, chunking | — | `docs/context-packs/QA_CONTEXT.md` |
| BUILD_VERIFICATION | Static build and type check before commit | `docs/runbooks/BUILD_VERIFICATION.md` | `docs/context-packs/GREENOFFICE_MVP_CONTEXT.md` |
| RUNTIME_QA | Preview smoke test and route verification | `docs/runbooks/RUNTIME_QA.md` | `docs/context-packs/QA_CONTEXT.md` |
| RELEASE_SAFETY_CHECK | Confirm no production/deploy without approval | `docs/runbooks/RELEASE_SAFETY_CHECK.md` | `docs/context-packs/RELEASE_CONTEXT.md` |
| HOMEPAGE_REVIEW | Home page links, messaging, layout | `docs/runbooks/HOMEPAGE_REVIEW.md` | `docs/context-packs/GREENOFFICE_MVP_CONTEXT.md` |
| A11Y_REVIEW | Basic accessibility checklist | `docs/runbooks/A11Y_REVIEW.md` | `docs/context-packs/QA_CONTEXT.md` |
| RTK_WORKFLOW | Token-efficient shell commands for agents | `docs/runbooks/RTK_USAGE.md` | — |

## Supporting Tools

| Tool | Role | Notes |
|------|------|-------|
| RTK | Compress shell output for agent context | Use `rtk npm run …`, `rtk git …`; see RTK_WORKFLOW |
| Astro check | Type and template diagnostics | `npm run check` |
| Astro preview | Local static runtime QA | `npm run preview` |

## Related KB

- `docs/KB/INDEX.md` — knowledge map
- `docs/KB/TOKEN_SAVIOR_WORKFLOW.md` — workflow detail
- `00-GREENOFFICE_PROJECT_CONSTITUTION.MD` — governance source

## Adding Skills

1. Add row to this registry.
2. Create or update runbook under `docs/runbooks/`.
3. Add context pack if task domain is non-trivial.
4. Reference skill in agent handoff or sprint summary.
