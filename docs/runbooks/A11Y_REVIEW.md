# Accessibility Review Runbook

Skill: **A11Y_REVIEW**

## When to Run

After layout, navigation, form, or typography changes.

## Scope (MVP baseline)

Static MVP — manual/heuristic review; no automated axe CI yet.

## Checklist

### Document structure

- [ ] `<html lang="en">` set (`BaseLayout.astro`)
- [ ] `<meta name="viewport">` present
- [ ] One `<h1>` per page
- [ ] Logical heading order (h1 → h2 sections)

### Navigation

- [ ] Nav links are keyboard-focusable (`<a href>`)
- [ ] Link text is descriptive (not "click here")

### Forms (search page)

- [ ] Search input has associated `<label>`
- [ ] Disabled placeholder form clearly marked non-functional

### Color and contrast

- [ ] Body text readable on `bg-gray-50`
- [ ] Green links/buttons visible (spot check)

### Images

- [ ] N/A for current MVP (no content images) — recheck when assets added

## Manual Steps

1. Tab through nav and primary links on `/` and `/dashboard`.
2. Resize to 375px width — no horizontal overflow on main content.
3. Optional: browser Lighthouse accessibility audit (record score in sprint summary).

## Known Gaps (Sprint 0.x)

- Skip link not yet implemented
- Focus styles rely on browser defaults
- No automated a11y CI

Document gaps in sprint summary; do not block MVP commit if baseline passes.

## Related

- `docs/runbooks/HOMEPAGE_REVIEW.md`
- `docs/context-packs/QA_CONTEXT.md`
