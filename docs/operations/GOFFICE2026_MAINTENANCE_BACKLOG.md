# GOFFICE2026 Maintenance Backlog

**Created:** 2026-08-05 (v1.3.0 release closeout)
**Scope:** Post-release maintenance only. No dependency changes during release closeout.
**Next candidate release:** `v1.3.1` (maintenance/patch line)

---

## 1. Dependency advisories — `npm audit --omit=dev` (read-only, 2026-08-05)

Source: `npm audit` under Node v20.19.5 · package.json/lockfile at `1.3.0`.
**Not fixed in v1.3.0** — build-time advisories only; production is a static
Astro build served by Nginx (no dev server / SSR exposed in production).
All are queued for `v1.3.1` (or an Astro line upgrade).

| Package | Severity | Advisory |
|---|---|---|
| `astro` | high | `X-Forwarded-Host` reflected without validation; URL manipulation via host header |
| `vite` | high | Path traversal in optimized deps `.map` handling; `launch-editor` NTLMv2 hash disclosure |
| `js-yaml` | high | Quadratic-complexity DoS in merge-key handling via repeated aliases |
| `postcss` | high | Path traversal in previous source-map auto-loading (`sourceMappingURL`) |
| `sharp` | high | Inherited libvips vulnerabilities (CVE-2026-33327/33328/35590, …) |
| `esbuild` | moderate | Dev server request exfiltration from any website |

### Remediation plan (deferred to v1.3.1)

1. Bump Astro line (currently `^4.0.0`) to a patched 4.x/5.x and re-verify
   `npm run check` / `build` / `validate` / `qa:*` gates.
2. Re-run `npm audit --omit=dev` and confirm 0 known high/critical.
3. Re-build, re-deploy as `v1.3.1` only with PO approval.

> Do **not** run `npm audit fix` (auto-fix can introduce breaking changes to
> the Astro build) without a dedicated upgrade task + full QA.

---

## 2. Open housekeeping (non-blocking, from v1.3.0 closeout)

- [ ] Classify/commit remaining untracked docs — see
  `docs/releases/GOFFICE2026_RELEASE_PREP_2026-08-05.md` §6 (NEEDS_PO_REVIEW list)
- [ ] Review large generated migration data dumps (25 MB under `docs/migration/`)
      — PO decides commit vs archive vs delete
- [ ] Baseline RUNTIME_QA / Lighthouse ≥95 retest after v1.3.0 deploy
