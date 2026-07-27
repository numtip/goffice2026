# Rollback Checklist — RC-1

**Release candidate:** RC-1  
**Current production:** v1.1.3 at `https://goffice.mju.ac.th/`  
**RC-1 status:** Not deployed to production — rollback applies to preview and pre-tag workspace only.

---

## 1. When to Roll Back

| Scenario | Action |
|----------|--------|
| RC-1 preview (GitHub Pages) shows regressions | Revert commit on `master` or redeploy prior green workflow run |
| RC-1 accidentally deployed to VPS | Restore prior release symlink (v1.1.3) |
| RC-1 tag created prematurely | Delete local tag only; do not force-push without PO approval |
| Post-merge integration failure | Reset feature branch; keep production untouched |

---

## 2. Production Rollback (VPS)

**Current live release:** v1.1.3  
**Preserved releases:** v1.1.3, v1.1.2, v1.1.1, v1.1.0

```bash
# On VPS — restore previous symlink (example: v1.1.3)
docker run --rm -v /var/www:/var/www alpine:3.20 \
  ln -sfn /var/www/goffice/releases/v1.1.3 /var/www/goffice/current
```

### Verification after production rollback

- [ ] `https://goffice.mju.ac.th/` returns 200
- [ ] Header logo is `LogoGreen2025.png`
- [ ] Dashboard pages load with v1.1.3 data
- [ ] Nginx serves `/var/www/goffice/current` (confirm symlink target)
- [ ] No 500 errors in access logs

**Do not delete** versioned release directories under `/var/www/goffice/releases/`.

---

## 3. GitHub Pages Preview Rollback

Preview deploys automatically from `master` via GitHub Actions.

### Option A — Revert offending commit

```powershell
git.exe revert <bad-commit-sha>
git.exe push origin master
```

Wait for `Deploy GitHub Pages Preview` workflow to complete.

### Option B — Redeploy prior workflow run

1. Open GitHub Actions → **Deploy GitHub Pages Preview**
2. Find last green run before regression
3. Re-run workflow on that commit (workflow_dispatch or revert)

### Verification

- [ ] https://numtip.github.io/goffice2026/ loads
- [ ] Preview badge present (if expected)
- [ ] Core routes return 200

---

## 4. Git / Tag Rollback (local only — RC-1 gate)

**Per RC-1 gate instructions: do not push tags.**

If RC-1 tag was created locally by mistake:

```powershell
git.exe tag -d v1.2.0-rc.1
```

If RC-1 branch needs reset to prior baseline:

```powershell
git.exe checkout rapid/rc-release
git.exe reset --hard <prior-stable-sha>
```

**Do not** `git push --force` to `master` without Product Owner approval.

---

## 5. Workspace Rollback (development)

```powershell
git.exe stash
git.exe checkout master
git.exe reset --hard 61b5fa9   # or prior known-good SHA
npm ci
npm run build
npm run validate
```

- [ ] Build PASS
- [ ] Validate PASS (or known limitation documented)

---

## 6. Data Rollback

Generated JSON under `src/data/generated/` is build-time input.

- [ ] Restore prior commit for generated files if bad data merge occurred
- [ ] Re-run `npm run data:build` after restoring XLSX sources in `docs/`
- [ ] Confirm FY2568 baseline unchanged after rollback

---

## 7. Communication

After any rollback:

- [ ] Notify Product Owner and QA lead
- [ ] Document incident in release notes or daily report
- [ ] Update [KNOWN_LIMITATIONS_RC1.md](./KNOWN_LIMITATIONS_RC1.md) if new limitation discovered
- [ ] Record rollback SHA and timestamp

---

## 8. Rollback Decision Matrix

| Layer | Rollback target | RTO estimate | Data loss risk |
|-------|-----------------|--------------|----------------|
| Production VPS | v1.1.3 symlink | < 5 min | None — static files |
| GitHub Pages | Prior green commit | 10–15 min | None |
| Local branch | `git reset --hard` | Immediate | Uncommitted work lost |
| Database/API | N/A — MVP static | — | — |

---

## References

- Production rollback example: [GOFFICE2026_RELEASE_v1.1.3.md](./GOFFICE2026_RELEASE_v1.1.3.md)
- Operations runbook: [../runbooks/OPERATIONS_RUNBOOK.md](../runbooks/OPERATIONS_RUNBOOK.md)
