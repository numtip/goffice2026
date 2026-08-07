# GOFFICE2026 VPS Version Audit — 2026-08-05

**Audit status:** `SUPERSEDED_CORRECTED` — original audit held on stale Git refs; superseded by v1.3.0 production deploy (see correction below)
**Audit date:** 2026-08-05 (UTC+7)
**Production URL:** https://goffice.mju.ac.th/

> ## ⚠ CORRECTION (2026-08-05 closeout) — original conclusions superseded
>
> The original audit below was executed against a **stale `origin/master` ref**.
> Root cause: `.git/config` fetch refspec had been modified to
> `+refs/tags/v1.1.0:refs/tags/v1.1.0`, so `git fetch`/`pull` never updated
> `refs/remotes/origin/master`. The audit therefore compared local `master`
> against an outdated GitHub snapshot (`8030a4e`) and incorrectly concluded
> "GitHub is behind local".
>
> **Corrected facts (verified 2026-08-05):**
> - Real GitHub `origin/master` = `7437743` (v1.3.0) — local is **0 commits**
>   behind/0 ahead after the refspec fix and sync.
> - Release **v1.3.0** (commit `7437743`, artifact sha256 `c4cb6632…`) was
>   **deployed to production on 2026-08-05T09:15:15+00:00** — `PRODUCTION_SUCCESS`.
> - QA gates passed under Node.js v20.19.5 (nvm): check 0 errors, test 18/18,
>   validate PASS, qa:routes 36/36, qa:links PASS, build 252 pages.
> - Symlink: `current` → `/var/www/goffice/releases/v1.3.0` (was v1.2.0).
>   Rollback target: `v1.2.0` (`934e960`) — preserved.
> - Smoke test: 10/10 routes HTTP 200 · Nginx error delta 0 real errors.
>
> The original body below is preserved for the historical record.

## Original executive summary (as recorded — superseded)

The production VPS is healthy and is serving the immutable `v1.2.0`
release. No deployment was performed during this audit.

The local working copy cannot currently be promoted safely because it is not
aligned with GitHub `origin/master`, and the working tree contains untracked
files. The repository also cannot complete its configured QA gates with the
currently active Node.js runtime (`v12.22.9`); the project requires Node.js
20 or newer.

**Decision:** keep production on `v1.2.0` until the repository state is
reconciled with GitHub, untracked work is explicitly classified, and the
release QA gates pass under a supported Node.js version.

## Version parity

| Location | Version / commit | Status |
|---|---|---|
| VPS active release | `v1.2.0` / `934e96075544c131024ba4ef1bd99949e187beb6` | Healthy |
| Local `master` | `1.2.0` / `9df80596d86c6e2dfe08ab361e22f0df0e496400` | Diverged |
| GitHub `origin/master` | commit `8030a4e0a37a1ed3c07a576ed9400b7b2aac4e08` | Behind local |
| `package.json` | `1.2.0` | No version bump detected |

VPS release metadata confirms:

```text
version=v1.2.0
tag=v1.2.0
commit=934e96075544c131024ba4ef1bd99949e187beb6
build_sha=934e96075544c131024ba4ef1bd99949e187beb6
pages=252
```

The live site returned `HTTP 200`; the response headers identify Nginx and
the last modification time is consistent with the 2026-08-02 deployment.

## Repository divergence

After fetching `origin`:

- Local `master` is **149 commits ahead** of `origin/master`.
- Local `master` is not a fast-forward equivalent of GitHub `origin/master`.
- The comparison contains approximately **442 changed paths**, with about
  **96,220 additions** and **2,803 deletions**.
- The local working tree has untracked files under `docs/GO-BE-*`,
  `docs/backend/evidence/`, `docs/migration/`, and `docs/plans/`.
- The local commits include the production release freeze and deploy record,
  but those commits are not present on `origin/master`.

This means the local branch is not currently a safe release source under the
project's GitHub-as-source-of-truth policy.

## QA gate result

The configured checks were attempted without modifying production:

| Check | Result | Cause |
|---|---|---|
| `npm run check` | `BLOCKED` | Active Node.js is `v12.22.9`; Astro requires `>=18.14.1` |
| `npm test` | `BLOCKED` | Node 12 does not support `node --test` |
| `npm run validate` | `BLOCKED` | Node 12 cannot parse optional chaining (`?.`) |

The release documentation records Node.js `v20.19.5` for the successful
`v1.2.0` build. QA must be rerun with that supported runtime or another
Node.js 20+ runtime before any future release decision.

## Deployment safety decision

No deployment is authorized by this audit. The VPS remains on the known-good
`v1.2.0` release, with versioned releases preserved under:

```text
/var/www/goffice/releases/
```

The next release process should be:

1. Reconcile local `master` with `origin/master` and confirm which commits and
   untracked files are intended project assets.
2. Push or otherwise establish the approved release commit on GitHub.
3. Use Node.js 20+ to run `npm ci`, `npm run check`, `npm test`,
   `npm run validate`, build, and runtime QA.
4. Obtain separate Product Owner approval for production deployment.
5. Build a versioned immutable release, update the `current` symlink
   atomically, and run live smoke tests plus rollback verification.

**Current verdict:** `PRODUCTION_SUCCESS` — release v1.3.0 (`7437743`) deployed 2026-08-05T09:15:15+00:00 · original `PRODUCTION_HEALTHY_RELEASE_HELD_FOR_RECONCILIATION` superseded (stale ref cause, see correction above)
