# GO-BE-CONTAINER-CLEANUP Report

**Host:** `raeserver` · **Date:** 2026-07-26 · **Reference:** `docs/GO-BE-PREFLIGHT-AUDIT-REPORT.md`  
**Evidence:** `docs/backend/evidence/cleanup-baseline-20260726T075229Z.txt`

---

## 1. Verdict

**PARTIAL**

Restart-loop noise eliminated and ~300 MiB swap reclaimed. Production `goffice.mju.ac.th` verified OK. Unhealthy `nginx` container (raeservice dependency) and broken n8n/WordPress stacks left for repair — not stopped.

---

## 2. Baseline Resources (pre-cleanup)

| Metric | Value |
|---|---|
| Load avg | 9.19 / 8.03 / 7.57 |
| RAM | 7.6 GiB total · 4.2 GiB used · 171 MiB free · 3.1 GiB avail |
| Swap | 1.7 / 4.0 GiB used |
| Disk `/` | 258 GiB free (46% used) |
| Restart loops | `n8n`, `wordpress-greenoffice-db` |

---

## 3. Container Classification

| Container | Compose / Config | Purpose | Nginx Dep? | Data Preserve? | Class | Action |
|---|---|---|---|---|---|---|
| `n8n` | `docker-raeserver/docker-compose.yml` | Workflow automation | Yes — `raeservice.mju.ac.th/n8n/` → :5679 | Yes — bind `~/.n8n` | **REPAIR_REQUIRED** | Stop + `restart=no` |
| `wordpress-greenoffice-db` | worktree `joomla-greenoffice/docker-compose.yml` | WP MariaDB | No | Yes — bind `wordpress_db_data` | **SAFE_TO_STOP** | Stop + `restart=no` |
| `wordpress-greenoffice-web` | same | WP app | No | Yes — bind `wordpress_data` | **SAFE_TO_STOP** | `restart=no` (never ran) |
| `nginx` | `docker-raeserver/docker-compose.yml` | raeservice static/API proxy :8082 | Yes — `raeservice.mju.ac.th` ×6 paths | N/A | **KEEP_ACTIVE** | **Untouched** |
| `goffice-j6-db` | `joomlagreenv2/docker-compose.yml` | Legacy Joomla DB (:8096 stack) | No (8081 down) | Yes — bind `dbdata/` | **LEGACY_PRESERVE** | Stop + `restart=no` |
| `goffice-j6` | same | Legacy Joomla web | No (Exited 3 wks) | Yes — bind `webroot/` | **LEGACY_PRESERVE** | `restart=no` |
| `goffice-static-v110` | manual (no compose) | Obsolete static test | No | No | **SAFE_TO_STOP** | `restart=no` |
| `rgreenoff` | worktree compose | Legacy Joomla | No | Yes — bind `joomla_data/` | **LEGACY_PRESERVE** | Untouched (already stopped) |
| `rgreenoff-db` | manual / legacy | Legacy Joomla DB | No | Yes — bind `mariadb_data/` | **LEGACY_PRESERVE** | Stop + `restart=no` |

---

## 4. Root Causes

| Container | Error (last logs) |
|---|---|
| `n8n` | `EACCES: permission denied, open '/home/node/.n8n/config'` — bind mount ownership |
| `wordpress-greenoffice-db` | InnoDB tablespace missing (`innodb_table_stats`, `wp_options.ibd`) — corrupt/partial datadir |
| `nginx` | Healthcheck failing (exit 1, streak 126221+) — container runs, check misconfigured |
| `goffice-j6-db` / `rgreenoff-db` | No error — running idle while app containers stopped |

---

## 5. Actions Performed

```text
docker update --restart=no <container> && docker stop <container>
```

Applied to: `n8n`, `wordpress-greenoffice-db`, `wordpress-greenoffice-web`, `goffice-j6-db`, `goffice-j6`, `goffice-static-v110`, `rgreenoff-db`

**Not done:** no volume/image/network/file deletion; no compose config edits; no Nginx changes; no Supabase install.

---

## 6. Containers Intentionally Untouched

| Container / Service | Reason |
|---|---|
| `nginx` (docker) | Active `raeservice.mju.ac.th` proxy target :8082 |
| `rgreenoff` | Already stopped; `restart=no` |
| `learning-center` stack (4) | Protected |
| `raenew2026` stack (4) | Protected |
| `litellm-gateway` (4) | Protected |
| `metabase`, `open-webui-new`, `rae-postgres` | Protected |
| Host `nginx.service` | Production + raeservice |
| `/var/www/goffice/current` | Production Astro static site |

---

## 7. Before / After Metrics (two samples, 5 min apart)

| Metric | Before | T+0 (~1 min) | T+5 min |
|---|---:|---:|---:|
| Load avg (1m) | 9.19 | 8.31 | 7.39 |
| RAM free | 171 MiB | 831 MiB | 811 MiB |
| RAM available | 3.1 GiB | 3.8 GiB | 3.8 GiB |
| Swap used | 1.7 GiB | 1.4 GiB | 1.4 GiB |
| Restart loops | 2 | 0 | 0 |

**Note:** Swap reduction (~300 MiB) sustained across both post samples. Load trending down but still high (~7–8 on 8 cores). Single-sample improvement not claimed.

---

## 8. Production Verification

| Check | Result |
|---|---|
| `curl -fsSI https://goffice.mju.ac.th/` | **HTTP/2 200** · 78202 bytes · `last-modified: 2026-07-20` |
| `curl -fsS https://goffice.mju.ac.th/health` | **OK** |
| `sudo nginx -t` | **Blocked** — sudo password required |
| `/var/www/goffice/current` | Unchanged → `releases/v1.1.3` (`df06179`) |

---

## 9. Remaining Blockers

1. **Load still ~7–8** — Metabase (~825 MiB), OpenWebUI (~369 MiB), 20+ other containers
2. **`nginx` container unhealthy** — raeservice :8082 paths need healthcheck repair (not stop)
3. **`n8n` broken** — fix `~/.n8n` permissions before re-enable; `/n8n/` on raeservice currently down
4. **`wordpress-greenoffice-db` corrupt** — InnoDB tablespace recovery or rebuild before restart
5. **Legacy Joomla 8081** — `raemanagemju.net` still proxies to dead :8081 (separate from goffice prod)
6. **RAM still 7.6 GiB** — insufficient headroom for Supabase without upgrade

---

## 10. RAM Upgrade Readiness

| Criterion | Status |
|---|---|
| Restart-loop noise | **Cleared** |
| Legacy DB RAM freed | **~65 MiB** (goffice-j6-db + rgreenoff-db) |
| Swap pressure | **Improved** 1.7 → 1.4 GiB (sustained) |
| Production safety | **Verified** |
| Ready for 16 GiB upgrade | **Yes — proceed with RAM upgrade, then GO-BE-DESIGN** |

---

## 11. Recommendation for GO-BE-DESIGN

1. **Upgrade RAM to ≥16 GiB** before Supabase install on this VPS.
2. **Repair `nginx` healthcheck** in `docker-raeserver/docker-compose.yml` — do not remove container.
3. **Fix or decommission n8n** — chown `~/.n8n` for uid 1000, or remove raeservice `/n8n/` block if retired.
4. **Keep legacy DB bind mounts** stopped until Joomla decommission decision; data intact at:
   - `joomla-greenoffice/joomlagreenv2/dbdata/`
   - worktree `joomla-greenoffice/mariadb_data/`
5. **Plan Supabase on dedicated subdomain** `api.goffice.mju.ac.th` — separate from static goffice prod.

---

CLEANUP_COMPLETE — SUPABASE NOT INSTALLED
