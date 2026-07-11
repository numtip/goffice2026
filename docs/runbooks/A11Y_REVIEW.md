# Accessibility Review Runbook

Skill: **A11Y_REVIEW**

## When to Run

After layout, navigation, form, or typography changes.

## Scope (MVP baseline)

Static MVP — manual/heuristic review; no automated axe CI yet.

## Checklist

### Document structure

- [ ] `<html lang>` reflects the primary page language (`BaseLayout.astro`)
- [ ] `<meta name="viewport">` present
- [ ] One `<h1>` per page
- [ ] Logical heading order (h1 → h2 sections)

### Navigation

- [ ] Nav links are keyboard-focusable (`<a href>`)
- [ ] Link text is descriptive (not "click here")

### Forms (search page)

- [ ] Search input has associated `<label>`
- [ ] Search form has a working client-side filter and visible empty state

### Color and contrast

- [ ] Body text readable on `bg-gray-50`
- [ ] Green links/buttons visible (spot check)

### Images

- [ ] Decorative images use empty alt text
- [ ] Content or placeholder images use accurate, non-fabricated alt text

## Manual Steps

1. Tab through nav and primary links on `/` and `/dashboard`.
2. Resize to 375px width — no horizontal overflow on main content.
3. Optional: browser Lighthouse accessibility audit (record score in sprint summary).

## Known Gaps (Sprint 0.x)

- Skip link implemented; verify it remains visible on focus after layout changes
- Focus styles are present on navigation and primary controls; continue spot checks
- No automated a11y CI

Document gaps in sprint summary; do not block MVP commit if baseline passes.

## Related

- `docs/runbooks/HOMEPAGE_REVIEW.md`
- `docs/context-packs/QA_CONTEXT.md`
