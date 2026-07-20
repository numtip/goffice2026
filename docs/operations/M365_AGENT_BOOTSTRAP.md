# M365 Agent Bootstrap — Green Office 2026

Persistent Microsoft Edge profiles for authorized Agent work against SharePoint, OneDrive, Document Center, Green Office evidence export, and Power Automate planning.

**No passwords, cookies, tokens, or MFA codes are stored in Git.**

---

## Purpose

Future Agents must reuse **dedicated persistent Edge profiles** instead of ephemeral Playwright browsers that lose Maejo365 SSO between runs.

This bootstrap:

- Opens Edge with `--user-data-dir` per authorized account
- Preserves login sessions across runs
- Prevents silent account switching
- Logs non-sensitive operational events under `.local/m365-bootstrap/logs/`
- Pauses for Product Owner login/MFA when required

---

## Account Responsibility

| Alias | UPN | Use for |
|-------|-----|---------|
| **researchmju** (default) | `researchmju@mju.ac.th` | RAE SharePoint site, Document Center, central libraries, permissions, Power Automate |
| **prinya** | `prinya_mju_ac_th@maejo365` | Legacy Green Office evidence read/export from personal OneDrive |

**Never switch accounts automatically.** Pass `-Account` explicitly when more than one account could apply.

---

## File Locations

| Item | Path |
|------|------|
| Bootstrap (PowerShell) | `scripts/m365-agent-bootstrap.ps1` |
| Bootstrap (CMD) | `scripts/m365-agent-bootstrap.cmd` |
| Session check | `scripts/m365-session-check.ps1` |
| Optional auth probe | `scripts/m365-auth-probe.mjs` |
| Config template | `config/m365-bootstrap.example.json` |
| Local config (optional) | `config/m365-bootstrap.json` (**gitignored**) |
| Operational logs | `.local/m365-bootstrap/logs/` (**gitignored**) |
| Profile: researchmju | `D:\AgentProfiles\M365\researchmju` (**outside repo**) |
| Profile: prinya | `D:\AgentProfiles\M365\prinya` (**outside repo**) |

---

## Canonical RAE SharePoint Site

**Important:** An earlier GO-SP-1 assessment incorrectly used the Maejo365 **tenant root** (`https://maejo365.sharepoint.com`). That URL must **not** be used as the default for `researchmju`.

| Item | Value |
|------|-------|
| Canonical RAE site | `https://maejo365.sharepoint.com/sites/msteams_54adc4` |
| Site title | สำนักวิจัยฯ (สำนักวิจัยและส่งเสริมวิชาการการเกษตร) |
| Default landing | `https://maejo365.sharepoint.com/sites/msteams_54adc4/SitePages/Home.aspx` |
| Green Office library | `GreenOfficeEvidence` on the canonical site only |

All Green Office central-library operations (assessment, creation, migration, permissions) must use **`/sites/msteams_54adc4`**, not the tenant root, `/sites/RAE`, or `/sites/Research`.

Auth verification returns **`WRONG_SITE_CONTEXT`** if the session resolves to the tenant root or any path outside `/sites/msteams_54adc4`.

---

## Default URLs

| Account | Landing URL | Source |
|---------|-------------|--------|
| researchmju | `https://maejo365.sharepoint.com/sites/msteams_54adc4/SitePages/Home.aspx` | Canonical RAE site (PO-approved) |
| prinya | `https://maejo365-my.sharepoint.com/personal/prinya_mju_ac_th/Documents/Forms/All.aspx` | Legacy evidence OneDrive (micro pilot) |

Override with `-Url "https://..."` when needed. Only host/path are logged — sensitive query parameters are stripped from logs.

---

## Security Rules

1. **Never** commit `config/m365-bootstrap.json` if it contains machine-specific secrets (template has none).
2. **Never** commit `.local/` logs or browser profiles.
3. **Never** clear cookies, local storage, or token caches from bootstrap scripts.
4. **Never** log out of either authorized account from automation.
5. **Never** store passwords, MFA codes, cookies, or authorization headers in logs.
6. **Never** use a temporary/incognito/ephemeral browser profile for M365 Agent work.
7. If the wrong account is active, **stop** and ask Product Owner to sign in to the requested account — do not switch silently.

---

## First-Time Setup

1. Copy config template (optional):

   ```powershell
   Copy-Item config\m365-bootstrap.example.json config\m365-bootstrap.json
   ```

2. Ensure Microsoft Edge is installed (standard Windows locations).

3. Create profile directories (bootstrap creates them automatically):

   ```text
   D:\AgentProfiles\M365\researchmju
   D:\AgentProfiles\M365\prinya
   ```

4. Launch default account and complete PO login/MFA once:

   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts\m365-agent-bootstrap.ps1 -Account researchmju
   ```

5. Repeat for legacy evidence account if export work is planned:

   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts\m365-agent-bootstrap.ps1 -Account prinya
   ```

6. (Optional) Install Playwright for auth verification during `-CheckOnly`:

   ```powershell
   npm install playwright-core --no-save
   ```

---

## Daily Usage

### Default — RAE SharePoint (researchmju)

```powershell
.\scripts\m365-agent-bootstrap.ps1
```

### Explicit account

```powershell
.\scripts\m365-agent-bootstrap.ps1 -Account researchmju
```

```powershell
.\scripts\m365-agent-bootstrap.ps1 -Account prinya -Url "https://maejo365-my.sharepoint.com/"
```

### Check only (no launch, optional auth probe)

```powershell
.\scripts\m365-agent-bootstrap.ps1 -Account researchmju -CheckOnly
```

```powershell
.\scripts\m365-session-check.ps1 -Account prinya -NoLaunch -VerifyAuth
```

### CMD wrapper

```cmd
scripts\m365-agent-bootstrap.cmd
scripts\m365-agent-bootstrap.cmd researchmju
scripts\m365-agent-bootstrap.cmd prinya
scripts\m365-agent-bootstrap.cmd researchmju -CheckOnly
```

---

## Session Status Codes

| Status | Meaning |
|--------|---------|
| `READY` | Canonical site reachable; login page not shown; account and path verified (when probe runs) |
| `LOGIN_REQUIRED` | Profile missing or Microsoft login/MFA required — **pause for PO** |
| `PROFILE_IN_USE` | Edge already running with this profile — reuse window or close instance |
| `WRONG_SITE_CONTEXT` | Session authenticated but **not** on canonical RAE path (`/sites/msteams_54adc4`) — e.g. tenant root |
| `WRONG_ACCOUNT` | Signed-in UPN does not match configured account |
| `EDGE_NOT_FOUND` | Edge executable missing |
| `INVALID_ACCOUNT` | Alias not `researchmju` or `prinya` |
| `CONFIGURATION_ERROR` | Missing config/scripts/repo root |
| `SESSION_PRESENT_AUTH_UNVERIFIED` | Profile exists; auth not confirmed — PO should verify in Edge |

Exit codes: 0=READY, 1=LOGIN_REQUIRED, 2=PROFILE_IN_USE, 6=SESSION_PRESENT_AUTH_UNVERIFIED, 7=WRONG_SITE_CONTEXT, 8=WRONG_ACCOUNT.

---

## MFA Behavior

When `LOGIN_REQUIRED` is returned or Edge shows Microsoft login/MFA:

1. **Stop** automated M365 actions.
2. Ask Product Owner to complete login in the **already opened** Edge window.
3. Do **not** retry with a new ephemeral browser.
4. Re-run `-CheckOnly` after PO confirms login.

---

## Troubleshooting

### Profile already in use

```
STATUS=PROFILE_IN_USE
```

**Recovery:** Reuse the existing Edge window for that profile, or close the Edge process using `D:\AgentProfiles\M365\<alias>` before relaunching. Do not delete the profile directory.

### Wrong account signed in

Stop. Report masked active account. Ask PO to sign in to the requested UPN in the **correct profile's** Edge window. Never switch silently.

### Auth probe unavailable

If `playwright-core` is not installed, `-CheckOnly` may return `SESSION_PRESENT_AUTH_UNVERIFIED`. Manually confirm login in Edge, or install Playwright for automated probe.

### RAE site URL changes

Update `defaultUrl` in `config/m365-bootstrap.json` (local) or `config/m365-bootstrap.example.json` (template for repo) and document the change in `docs/sharepoint/`.

---

## How Agents Must Use Bootstrap

Before **any** Microsoft 365 operation (SharePoint, OneDrive, export, assessment):

```powershell
powershell -ExecutionPolicy Bypass -File scripts/m365-agent-bootstrap.ps1 -Account <researchmju|prinya> -CheckOnly
```

Then:

- **researchmju** — RAE SharePoint, Document Center, libraries, permissions, Power Automate
- **prinya** — legacy evidence read/export from personal OneDrive

If `LOGIN_REQUIRED` or MFA → pause for Product Owner.

If `PROFILE_IN_USE` → attach to existing Edge session (same user-data-dir).

If `READY` or confirmed `SESSION_PRESENT_AUTH_UNVERIFIED` with PO OK → proceed with browser automation using the **same profile path**, not a temp profile.

---

## Agent Integration Block (copy into prompts)

```text
MICROSOFT 365 BOOTSTRAP

Before any Microsoft 365 operation, run:

powershell -ExecutionPolicy Bypass -File scripts/m365-agent-bootstrap.ps1 -Account <researchmju|prinya> -CheckOnly

Use:
- researchmju for canonical RAE SharePoint Site (/sites/msteams_54adc4), Document Center, central libraries, permissions, and Power Automate.
- prinya for reading or exporting legacy Green Office evidence from the original personal OneDrive.

Never use https://maejo365.sharepoint.com (tenant root) as the RAE default.
Never switch accounts automatically.
Never create a temporary browser profile.
Pause for Product Owner action when LOGIN_REQUIRED or MFA is shown.
```

---

## Changing Default URL Safely

1. Edit `config/m365-bootstrap.json` locally (preferred) or propose a change to `m365-bootstrap.example.json`.
2. Use `-Url` for one-off overrides without editing config.
3. Do not embed credentials or sharing tokens in URLs committed to Git.
4. Document site URL changes in `docs/sharepoint/` when RAE hosting changes.

---

## Prohibited Actions (Bootstrap Scope)

Bootstrap scripts must **not**:

- Upload, move, delete, or rename SharePoint/OneDrive documents
- Change permissions or create libraries
- Clear browser data or log out users
- Store credentials in Git

---

## Related Documentation

- `docs/sharepoint/GO-SP1R-correction-report.md` — canonical RAE site correction
- `docs/sharepoint/GO-SP2-library-creation-report.md` — Green Office evidence library
- `docs/migration/sharepoint-export-micro-pilot/` — legacy evidence export pilot
