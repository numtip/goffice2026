# ADR-0002: GitHub Pages as Preview Only

**Status:** Accepted  
**Date:** 2026-06-26  
**Decision makers:** Green Office 2026 project governance

---

## Context

Green Office 2026 needs a shareable pre-production environment for stakeholder review without coupling preview infrastructure to the production VPS at `greenoffice.mju.ac.th`.

The project constitution requires static-first delivery, GitHub as source of truth, and no unapproved backend services.

---

## Decision

Use **GitHub Pages** exclusively as the **preview** environment.

Use the **VPS at `greenoffice.mju.ac.th`** exclusively as **production**.

These roles must not be mixed.

---

## Architecture

```text
Developer push
  → GitHub Actions build (DEPLOY_TARGET=github-pages)
  → GitHub Pages preview (https://numtip.github.io/goffice2026/)
  → Manual approval
  → Manual VPS deployment
  → greenoffice.mju.ac.th (production)
```

---

## Rules

1. **GitHub Pages is preview-only.** It exists for QA, executive review, and stakeholder validation.
2. **Production is VPS-only.** Canonical public site remains `greenoffice.mju.ac.th`.
3. **No automatic deploy from GitHub Pages to VPS.** Preview success does not trigger production release.
4. **No DNS changes for preview.** Do not configure a custom domain on GitHub Pages.
5. **Do not point `greenoffice.mju.ac.th` to GitHub Pages.**
6. **Manual approval required** before any VPS production deployment.
7. **No backend/API/database** may be introduced to support preview hosting.

---

## Consequences

### Positive

- Fast, repeatable preview builds from `master`
- Clear separation between preview and production
- Lower risk of accidental production changes during review

### Negative / trade-offs

- Preview URLs use the GitHub Pages subpath (`/goffice2026/`)
- Production release remains a separate manual process
- First-time Pages enablement may require a one-time GitHub Settings step

---

## Implementation references

- Workflow: `.github/workflows/deploy-pages.yml`
- Astro config: `astro.config.mjs`
- Base-path helper: `src/utils/with-base.ts`
- Preview badge: `src/components/ui/PreviewBadge.astro`
- Runbook: `docs/runbooks/PREVIEW_RELEASE.md`
- Setup report: `docs/reports/GITHUB_PAGES_PREVIEW_SETUP.md`

---

## Compliance

| Requirement | Status |
|-------------|--------|
| Preview on GitHub Pages | Yes |
| Production on VPS | Yes |
| No DNS/custom domain for preview | Required |
| Manual VPS approval before production | Required |
| No automatic GitHub Pages → VPS deploy | Required |
