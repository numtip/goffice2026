# Context Pack: QA

Use for verification, review, and pre-commit QA tasks.

## Required Checks (MVP)

1. **Build:** `npm run check` → 0 errors
2. **Build:** `npm run build` → all routes generated
3. **Preview:** `npm run preview` → smoke test routes
4. **Reviews:** homepage, a11y, broken links (runbooks below)

## Runbooks

| Check | Runbook |
|-------|---------|
| Build/check | `docs/runbooks/BUILD_VERIFICATION.md` |
| Preview/routes | `docs/runbooks/RUNTIME_QA.md` |
| Home page | `docs/runbooks/HOMEPAGE_REVIEW.md` |
| Accessibility | `docs/runbooks/A11Y_REVIEW.md` |
| Release safety | `docs/runbooks/RELEASE_SAFETY_CHECK.md` |

## Routes to Verify (13)

`/`, `/dashboard`, `/categories`, `/categories/cat1`–`cat7`, `/evidence`, `/documents`, `/search`

## Policy

- Build PASS ≠ release ready (constitution)
- No production touch during QA
- Commit only after local QA passes
- Push only after explicit approval post-QA

## RTK

Prefer `rtk npm run build`, `rtk git status` for agent sessions. See `docs/runbooks/RTK_USAGE.md`.
