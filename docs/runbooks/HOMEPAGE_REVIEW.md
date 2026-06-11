# Homepage Review Runbook

Skill: **HOMEPAGE_REVIEW**

## When to Run

After changes to home page, navigation, or global layout.

## Target

- Route: `/`
- File: `src/pages/index.astro`
- Layout: `src/layouts/BaseLayout.astro`

## Checklist

### Content

- [ ] Page title: "Green Office Platform"
- [ ] Welcome message present and accurate
- [ ] No placeholder/lorem text

### Quick links (5)

- [ ] `/dashboard`
- [ ] `/categories`
- [ ] `/evidence`
- [ ] `/documents`
- [ ] `/search`

### Navigation (global)

- [ ] Home, Dashboard, Categories, Evidence, Documents, Search in header
- [ ] All nav hrefs resolve (see RUNTIME_QA)

### Layout

- [ ] Responsive grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- [ ] Readable at mobile width (375px) — manual or DevTools
- [ ] Footer renders with copyright year

## Pass Criteria

All links return 200 in preview; layout usable at mobile and desktop widths.

## Related

- `docs/context-packs/GREENOFFICE_MVP_CONTEXT.md`
- `docs/runbooks/RUNTIME_QA.md`
