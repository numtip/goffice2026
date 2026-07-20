# RTK Usage Runbook

RTK (Rust Token Killer) is a local CLI proxy that compresses terminal command output before it reaches AI agent context. In **goffice2026**, it supports the Token Savior workflow and build verification without changing project code.

**Upstream:** [rtk-ai/rtk](https://github.com/rtk-ai/rtk)

---

## What RTK Is Used For in This Project

| Use case | RTK command | Why |
|----------|-------------|-----|
| Build verification | `rtk npm run build` | Compact Astro build output |
| Type/check | `rtk npm run check` | Grouped diagnostics, less noise |
| Git status during agent work | `rtk git status` | Short branch + change summary |
| Git history | `rtk git log -5 --oneline` | One-line commits only |
| File discovery | `rtk ls src/pages` | Token-optimized directory listing |
| Read large files | `rtk read docs/KB/...` | Filtered file content |
| Diff review | `rtk diff` | Changed lines only |

RTK does **not** replace project scripts. It wraps them to save tokens in Cursor Agent sessions.

---

## Installation Status (This Workstation)

RTK is already installed at user level (no admin required):

| Environment | Binary | Version check |
|-------------|--------|---------------|
| Windows (native) | `G:\rtk\rtk.exe` | `rtk --version` |
| WSL (Ubuntu) | `~/.local/bin/rtk` | `rtk --version` |
| Cursor terminal | Same as host shell | `rtk --version` |

### Reinstall (only if missing)

**WSL (recommended — full hook support):**

```bash
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
rtk init --agent cursor -g
```

**Windows (user-level, no admin):**

1. Download `rtk-x86_64-pc-windows-msvc.zip` from [GitHub Releases](https://github.com/rtk-ai/rtk/releases).
2. Extract `rtk.exe` to a user PATH location (this machine: `G:\rtk\rtk.exe`).
3. Optional: `rtk init --agent cursor -g` (Windows uses injection mode; WSL preferred for hooks).

Verify:

```powershell
rtk --version
rtk gain
```

---

## Project Paths

**Linux VPS (primary development):**

```
/home/rae_admin/goffice2026
```

**Windows:**

```
G:\ProjectAI\goffice2026
```

**WSL (same repo):**

```
/mnt/g/ProjectAI/goffice2026
```

**GitHub remote:**

```
https://github.com/numtip/goffice2026
```

---

## Common Commands (goffice2026)

Run from the project root in either shell.

### Build & check

```powershell
# Windows / Cursor (PowerShell)
cd G:\ProjectAI\goffice2026
rtk npm run check
rtk npm run build
```

```bash
# WSL
cd /mnt/g/ProjectAI/goffice2026
rtk npm run check
rtk npm run build
```

### Git (compact output)

```powershell
rtk git status
rtk git log -5 --oneline
rtk git diff --stat
```

### Exploration

```powershell
rtk ls src/pages
rtk ls src/data
rtk read src/data/categories.json
```

### Token savings summary

```powershell
rtk gain
```

---

## PowerShell Wrapper Note

On this workstation, PowerShell may define `npm` and `git` as functions that forward to RTK. That works for `npm run …` but can break plain `npm install`.

**Prefer explicit forms:**

```powershell
# Build scripts (RTK-wrapped)
rtk npm run build

# Install / other npm subcommands (direct npm)
& "G:\nodejs\node.exe" "C:\Users\PrinyaPainusa\AppData\Roaming\npm\node_modules\npm\bin\npm-cli.js" install

# Or native git when full output is needed
& "G:\Git\cmd\git.exe" status
```

---

## Cursor Agent Guidance

- Prefer `rtk git`, `rtk npm run …`, `rtk ls`, and `rtk read` during agent tasks.
- Do not paste large command output into prompts; use RTK-wrapped commands instead.
- RTK is a **local helper only** — it does not deploy or modify remote systems.

---

## Safety Warning

> **Do not use RTK to edit production directly.**

RTK optimizes command **output** for AI context. It does not grant production access. For goffice2026:

- No direct production editing (constitution Rule: No Production Edit).
- No deploy commands via RTK or otherwise unless explicitly approved.
- QA and builds run against local/static output only (`dist/`, `npm run preview`).

---

## Related Docs

- `docs/KB/TOKEN_SAVIOR_WORKFLOW.md` — token-saving workflow
- `00-GREENOFFICE_PROJECT_CONSTITUTION.MD` — BUILD_VERIFICATION, RUNTIME_QA policies
- `docs/KB/SKILLS_REGISTRY.md` — skills and supporting tools (when present)
