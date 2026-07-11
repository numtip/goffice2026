# Next Sprint Plan — Green Office 2026

**Updated:** 2026-07-11  
**Current milestone complete:** Design Freeze v1 + EP-1 + EP-2 Local Integrity  
**Preview:** https://numtip.github.io/goffice2026/

---

## Sprint Roadmap Overview

| Sprint | Name | Status | Focus |
|--------|------|--------|-------|
| Design Freeze v1 | Stitch Landing | ✅ Complete | Approved homepage implementation |
| EP-1 | Experience Polish | ✅ Complete | Motion, a11y, responsive, performance |
| **EP-2** | **Real Content Integration** | **In Progress** | Replace placeholders with real Maejo content |
| EP-2a | Readiness Advancement | ✅ Complete | Evidence UX, data provenance, pipeline templates, route QA |
| EP-3 | Document Center Integration | Planned | Microsoft 365 preview hooks from landing |

---

## EP-2 — Real Content Integration

**Goal:** Replace placeholder and external assets with authentic Maejo Green Office content while preserving the approved Design Freeze layout and IA.

**Architecture lock:** No redesign. No navigation IA changes. No backend. Homepage and supporting data files only unless PO approves scope expansion.

### Tasks

#### 1. Replace placeholder imagery with real Maejo assets

- [x] Audit all external Google Stitch CDN URLs in `src/components/landing/`
- [ ] Source approved Maejo campus, facility, and activity photography
- [ ] Add optimized assets to `public/images/` (WebP + fallback, sized variants)
- [ ] Update landing components with `srcset` / responsive sizes
- [x] Remove dependency on third-party CDN for LCP-critical hero image
- [ ] Re-run Lighthouse on GitHub Pages preview; target Performance >95

#### 2. Dashboard data provenance & completeness

- [x] Wire Executive Command Center preview to generated dashboard JSON / `dashboard-config.ts` values
- [x] Ensure preview labels clearly distinguish static snapshot vs live dashboard
- [x] Validate links to `/dashboard`, `/dashboard/energy`, etc. (26/26 routes verified)
- [x] Confirm multi-year 2568→2569 data displays correctly on actual dashboard pages
- [x] Add month completeness heatmap visualization (dashboard overview)
- [x] Add partial-year YoY caveat banners (dashboard + detail pages)
- [x] Enhanced source provenance section with import pipeline references

#### 3. Integrate real activities / news

- [ ] Define static content model for activities (Markdown or JSON — static-first)
- [x] Remove unsupported editorial claims from `ActivitiesScene.astro`
- [ ] Replace source-pending cards in `ActivitiesScene.astro` after verified content is available
- [ ] Add optional links to external Maejo news sources or internal static pages
- [ ] PO review of copy and dates

#### 4. Prepare Document Center integration hooks

- [x] Define current preview contract: landing shows placeholder-classified repository index only
- [ ] Document URL/env placeholders for future M365 Document Center (no live API in EP-2)
- [x] Align Evidence Gateway copy with current repository evidence state
- [ ] List required SharePoint / Graph fields for EP-3 (read-only preview)

#### 5. Navigation / footer visual alignment

- [x] Align `Navigation.astro` and footer with Stitch landing tokens (visual only — links unchanged)
- [x] Preview badge behavior verified
- [x] Responsive nav review: `overflow-x-auto` on mobile, flex-wrap on desktop
- [x] Evidence placeholder UX: source-pending banners, improved card treatment
- [x] Import pipeline CSV templates created in `data/import/` with documentation
- [ ] Do not add new nav items without PO approval

#### 6. Executive review preparation

- [ ] Stakeholder walkthrough script for preview URL
- [ ] Before/after screenshots for executive briefing
- [ ] Confirm preview badge and production separation messaging
- [ ] Schedule review against `EXECUTIVE_HANDOFF.md`

### EP-2 QA Gate

```bash
npm run check
npm run build
# GitHub Pages mode
$env:DEPLOY_TARGET='github-pages'
$env:PUBLIC_PREVIEW_BADGE='true'
npm run build
```

Verify: 26 pages, preview badge, `/goffice2026/` paths, no broken links, mobile layout acceptable.

### EP-2 Deliverables

- Self-hosted optimized images
- Real activity/news content file(s), after source approval
- Dashboard preview wired to real generated dashboard JSON
- Nav/footer visual alignment
- Updated performance report or EP-2 review doc

---

## EP-3 — Document Center Integration

**Goal:** Connect landing Evidence Gateway preview to the separate Document Center platform backed by Microsoft 365 — preview and link-out only from goffice2026.

**Scope boundary:** Document management (upload, permissions, versioning, metadata editing) lives in the **Document Center project**, not in goffice2026.

### Platform Stack (Document Center — separate project)

| Service | Role |
|---------|------|
| **SharePoint** | Document storage, libraries, access control |
| **Microsoft Graph** | Read-only metadata / listing API (when approved) |
| **OneDrive** | Personal/working copies where applicable |

### Tasks

- [ ] Finalize Document Center project repository and deployment model
- [ ] Define read-only preview API or static export contract for landing highlights
- [ ] Implement landing hook: fetch or embed latest/highlighted documents (preview only)
- [ ] Maintain CTA: **Open Document Center** — external or sub-app URL
- [ ] Security review: no credentials in goffice2026 static repo
- [ ] PO sign-off before any Graph API integration

### EP-3 Rules (Locked)

- Landing shows **preview only** — no upload UI, no permission UI, no version history UI
- goffice2026 remains Astro static — no backend unless PO approves exception
- Production Document Center may live on M365 / separate subdomain — not VPS coupling without ADR

---

## Backlog (Post EP-3)

- Automated Lighthouse CI on GitHub Pages deploy
- Category and dashboard page visual alignment with Stitch tokens
- Thai language content layer (if PO approves)
- Production VPS release runbook execution (manual, PO-approved)

---

## References

- [PROJECT_MEMORY.md](./PROJECT_MEMORY.md)
- [EP1_PERFORMANCE_REVIEW.md](./EP1_PERFORMANCE_REVIEW.md)
- [GITHUB_PAGES_PREVIEW_SETUP.md](./GITHUB_PAGES_PREVIEW_SETUP.md)
- [ADR-0002](../adr/ADR-0002_GITHUB_PAGES_PREVIEW.md)
- [PREVIEW_RELEASE.md](../runbooks/PREVIEW_RELEASE.md)
