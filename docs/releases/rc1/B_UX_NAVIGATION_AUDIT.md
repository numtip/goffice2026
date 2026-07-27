# B — UX / Navigation RC-1 Audit

**Date:** 2026-07-27  
**Auditor:** Subagent B (UX/Navigation)  
**Branch:** `rapid/rc1-revalidate` (`master@b94e802`)  
**Scope:** Navigation.astro, AboutPageShell.astro, BaseLayout.astro, footer (inline), header/footer breakpoints, hub discoverability, TH/EN parity, accessibility smoke, layout anti-patterns  
**Method:** Source review + `npm run build` (PASS, 252 pages) + dist HTML/JS grep  

---

## Revalidation (2026-07-27)

> **P0 REMEDIATED** — commit `210cad2` (`fix(nav): localize mobile navigation labels`)

| Check | Result |
|-------|--------|
| dist grep `{navLabels.menu}` | **0 hits** |
| Mobile nav toggle labels | Localized via `define:vars` |
| Build | PASS (252 pages) |

B-P0-01 closed. Category verdict upgraded to **PASS (P0 remediated)**; P1/P2 items remain open.

---

## Executive Verdict

> **PASS (P0 remediated)**

**Original reason (pre-fix):** Mobile navigation toggle script shipped broken localized labels in production bundle. **Remediated in `210cad2`.**

**P0 count:** 0 (was 1)  
**P1 count:** 4  
**P2 count:** 6  

---

## Screens / Surfaces Reviewed

| Surface | File(s) | Desktop (≥1024) | Tablet (768–1023) | Mobile (<768) |
|---------|---------|-----------------|-------------------|---------------|
| Global header | `Navigation.astro` | 10-item inline nav (`lg:flex`) | Hamburger (`lg:hidden`) | Hamburger |
| Utility bar | `Navigation.astro` + `LanguageSwitcher.astro` | University + TH/EN switcher | Same | Platform label hidden until `sm` |
| Global footer | `BaseLayout.astro` (inline) | 2-col link grid + copy | Stacked flex | Stacked flex |
| About sub-nav | `AboutPageShell.astro` | Horizontal breadcrumb trail | Wrap | Wrap |
| Hub pages | `news/_HubPage.astro`, hubs.json | BaseLayout shell | Same | Same |

---

## Findings

### P0 — Blockers

| ID | Issue | Evidence | Impact |
|----|-------|----------|--------|
| B-P0-01 | **Mobile nav toggle labels not interpolated** | ~~`Navigation.astro` L163–164~~ **REMEDIATED `210cad2`** — `define:vars` injects localized open/close labels; dist grep 0 hits for `{navLabels.menu}` | ~~On menu open, visible label and `aria-label` break~~ **Fixed** |

**Fix:** Pass labels via `define:vars={{ openLabel: navLabels.menu, closeLabel: ... }}` or data attributes on `#mobile-nav`.

---

### P1 — High (pre-release recommended)

| ID | Issue | Evidence | Impact |
|----|-------|----------|--------|
| B-P1-01 | **Hardcoded English ARIA on global chrome** | `Navigation.astro` L64 `aria-label="Primary navigation"`; `LanguageSwitcher.astro` L9–32 English-only labels | TH pages expose English-only landmarks/controls to assistive tech |
| B-P1-02 | **Footer omits RC hub routes** | `BaseLayout.astro` L147–153 — only documents, evidence, dashboard, search, external org | News / Activities / Knowledge / About not discoverable from footer; secondary nav gap vs primary header |
| B-P1-03 | **Desktop nav density at `lg`** | 10 `whitespace-nowrap` items in `max-w-6xl` with logo (L74–90) | At 1024–1280px, Thai labels risk horizontal crowding/clipping; no overflow fallback |
| B-P1-04 | **Landing CTA nav omits new hubs** | `LandingCTA.astro` — dashboard, categories, evidence, documents, search only | Home page secondary paths skip News/Activities/Knowledge/About despite primary nav inclusion |

---

### P2 — Medium / polish

| ID | Issue | Evidence | Impact |
|----|-------|----------|--------|
| B-P2-01 | **Invalid About breadcrumb markup** | `AboutPageShell.astro` L39–57 — `<ol>` with `<>` fragments placing `<span>/</span>` outside `<li>` | WCAG/HTML validity; list semantics degraded |
| B-P2-02 | **Nested navigation landmarks (mobile)** | Mobile dropdown L103 `role="navigation"` inside outer `<nav>` | Redundant/confusing landmark structure |
| B-P2-03 | **About metadata pages not routed** | `pages.json` lists `about-feedback`, `about-certification` as CREATED/NOT_CREATED — no `src/pages` | Inventory/content drift; no user-facing feedback route |
| B-P2-04 | **`siteName` not localized** | `Navigation.astro` L31 hardcoded `'Green Office 2026'` | Minor TH/EN parity gap in logo block |
| B-P2-05 | **Tablet uses phone menu until 1024px** | Breakpoint gap: `md` unused for nav; `lg:hidden` / `lg:flex` only | iPad landscape gets hamburger despite ample width |
| B-P2-06 | **Accessibility footer link is non-functional** | `BaseLayout.astro` L153 — `role="note"` stub “in progress” | Expected for RC placeholder; document in release notes |

---

## Pass Checks (Smoke)

| Check | Status | Notes |
|-------|--------|-------|
| Skip link → `#main-content` | ✅ PASS | Localized via `dict.site.skip_to_content`; focus styles present |
| Viewport meta | ✅ PASS | `width=device-width, initial-scale=1.0` in dist |
| `main` landmark | ✅ PASS | `<main id="main-content">` |
| Mobile nav present | ✅ PASS | `#mobile-nav` exists; toggle labels localized (`210cad2`) |
| TH/EN nav labels | ✅ PASS | `th.json` / `en.json` `home.nav.*` parity |
| TH/EN hub routes | ✅ PASS | `/news`, `/activities`, `/knowledge` + `/en/*` built |
| About scope / action-plan discoverability | ✅ PASS | Primary nav → About; index links + breadcrumb include scope & action-plan |
| Build | ✅ PASS | 250 static pages, no compile errors |

---

## TH/EN Parity Matrix (Primary Nav)

| Route | TH label | EN label | TH route | EN route |
|-------|----------|----------|----------|----------|
| Home | หน้าแรก | Home | `/` | `/en/` |
| Dashboard | แดชบอร์ด | Dashboard | `/dashboard/` | `/en/dashboard/` |
| Categories | หมวดหมู่ | Categories | `/categories/` | `/en/categories/` |
| News | ข่าวสาร | News | `/news/` | `/en/news/` |
| Activities | กิจกรรม | Activities | `/activities/` | `/en/activities/` |
| Knowledge | ความรู้ | Knowledge | `/knowledge/` | `/en/knowledge/` |
| Evidence | หลักฐาน | Evidence | `/evidence/` | `/en/evidence/` |
| Documents | เอกสาร | Documents | `/documents/` | `/en/documents/` |
| About | เกี่ยวกับเรา | About | `/about/` | `/en/about/` |
| Search | ค้นหา | Search | `/search/` | `/en/search/` |

Active-state: `/about/*` correctly highlights About via `isActive` prefix match.

---

## Recommended Gate Actions

1. ~~**Must fix before RC-1:** B-P0-01 (mobile nav `define:vars` or data-attribute injection).~~ **Done (`210cad2`)**
2. **Should fix:** B-P1-01 (i18n aria keys), B-P1-02 (footer hub links), B-P1-03 (nav overflow strategy — mega-menu, two-row, or `xl` breakpoint).
3. **Defer post-RC1:** B-P2-* except breadcrumb markup if quick win.

---

## Audit Artifacts

- Source: `src/components/ui/Navigation.astro`, `src/layouts/BaseLayout.astro`, `src/components/about/AboutPageShell.astro`, `src/components/ui/LanguageSwitcher.astro`
- Dist verification: `dist/index.html`, `dist/_astro/hoisted.BJwpUBTY.js`, `dist/about/scope/index.html`
- Build log: `npm run build` exit 0 @ 2026-07-27
