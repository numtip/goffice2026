# GO-BE-PREFLIGHT Audit Report

**Host:** `raeserver` · **User:** `rae_admin` · **Date:** 2026-07-26 · **Mode:** Read-only audit  
**Production domain:** `goffice.mju.ac.th`  
**Canonical Git:** `https://github.com/numtip/goffice2026`

---

## 1. Verdict

**READY_WITH_BLOCKERS**

The canonical Astro source and live production path are identified and aligned at **v1.1.3**. Docker and Nginx are present and capable. Supabase is **not yet used** by the app (greenfield backend). Self-host is feasible on this VPS only after resolving **memory/load pressure**, **Postgres stack conflicts**, **backup/monitoring gaps**, and **DNS/routing design** for `api.goffice.mju.ac.th`.

---

## 2. Canonical Project Identification

| Folder | Git Remote | Branch | HEAD | Status | Production Use | Classification |
|---|---|---:|---|---|---|---|
| `/home/rae_admin/goffice2026` | `https://github.com/numtip/goffice2026.git` | `master` | `5ca7abf` | 1 commit ahead of tag; untracked `docs/migration/` | Build source | **CANONICAL_SOURCE** |
| `/var/www/goffice/current` → `releases/v1.1.3` | not git | — | `df06179` (via `.release-meta`) | Live static site | **ACTIVE_DEPLOYMENT** |
| `/home/rae_admin/goffice2026-release-v1.1.3` | same canonical remote | detached @ `v1.1.3` | `df06179` | clean detached | Matches prod | **RELEASE_COPY** |
| `/home/rae_admin/goffice2026-release-v1.1.2` | same | detached @ `v1.1.2` | `8030a4e` | clean detached | superseded | **RELEASE_COPY** |
| `/home/rae_admin/goffice2026-release-v1.1.1` | same | detached @ `v1.1.1` | `1c73215` | clean detached | superseded | **RELEASE_COPY** |
| `/home/rae_admin/green-office-2026` | `https://github.com/numtip/rae-nextjs.git` (parent: `/home/rae_admin`) | `pass-09-vps-dedicated-governance-sync` | `1eddd78` | planning docs only (108K) | none | **LEGACY / PLANNING** |
| `/home/rae_admin/joomla-greenoffice` | `https://github.com/numtip/goffice.git` | `main` | `9fc09cf` | dirty working tree | legacy side paths only | **LEGACY** |
| `/opt/joomla-greenoffice` | not git | — | — | has `docker-compose.yml` | legacy stack | **LEGACY** |
| `/var/www/app/goffice` | not git | — | — | 4K empty | none | **UNKNOWN** |
| `/var/www/html/goffice` | not git | — | — | 8K | none | **LEGACY** |

### Decision Summary

| Item | Value |
|---|---|
| **Canonical source folder** | `/home/rae_admin/goffice2026` |
| **Active production folder** | `/var/www/goffice/current` → `/var/www/goffice/releases/v1.1.3` |
| **Same folder?** | **No** — production is rsynced static `dist/` artifacts; source is the Git working tree |
| **Canonical remote match** | Yes — `https://github.com/numtip/goffice2026.git` |
| **Preferred branch** | `master` (canonical source) |

### Version Drift

| Location | Commit | Tag / Note |
|---|---|---|
| Production (`.release-meta`) | `df06179f87b48b085fb561dd49b2cd766b45fdc0` | `v1.1.3`, deployed 2026-07-20 |
| Source `master` | `5ca7abff1782ccf0f88ebc00130a0a9807bba21f` | 1 docs-only commit after `v1.1.3` |
| Release copy v1.1.3 | `df06179` | matches production |
| Release copy v1.1.2 | `8030a4e` | superseded |
| Release copy v1.1.1 | `1c73215` | superseded |

- **Runtime drift:** none (prod matches tag `v1.1.3`)
- **Git drift:** 1 non-deployed docs commit on `master` (`5ca7abf`)
- **Network fetch:** not performed (audit mode forbids repository mutation/sync)

---

## 3. Production Serving Path

| Item | Evidence |
|---|---|
| **Domain** | `goffice.mju.ac.th` |
| **Nginx vhost** | `/etc/nginx/sites-enabled/goffice.mju.ac.th.conf` → `/etc/nginx/sites-available/goffice.mju.ac.th.conf` |
| **Mechanism** | Nginx serves **static files directly** (not proxied, not containerized in prod) |
| **Document root** | `root /var/www/goffice/current;` (symlink → `/var/www/goffice/releases/v1.1.3`) |
| **Index** | `index.html` |
| **TLS cert** | `/etc/ssl/mju/mju_ac_th.fullchain.crt` |
| **TLS key** | `/etc/ssl/mju/mju_ac_th.key` (path only; contents not read) |
| **Security** | PHP/Joomla paths blocked (`404`); headers via `/etc/nginx/snippets/goffice-security-headers.conf` |
| **Health endpoint** | `location = /health` → `200 OK` |
| **Access log** | `/var/log/nginx/goffice-access.log` |
| **Error log** | `/var/log/nginx/goffice-error.log` |

### Deploy Pipeline

- **Manual VPS deploy:** `/home/rae_admin/joomla-greenoffice/ops/prod1/deploy-prod1.sh`
- **Build source:** `/home/rae_admin/goffice2026` → `dist/`
- **Release layout:** `/var/www/goffice/releases/v1.1.0` … `v1.1.3`
- **Current symlink:** `/var/www/goffice/current` → `/var/www/goffice/releases/v1.1.3` (updated 2026-07-20 04:53 UTC)
- **CI (preview only):** `/home/rae_admin/goffice2026/.github/workflows/deploy-pages.yml` — GitHub Pages preview; production remains manual VPS

### Production Release Metadata

File: `/var/www/goffice/releases/v1.1.3/.release-meta`

```
version=v1.1.3
tag=v1.1.3
commit=df06179f87b48b085fb561dd49b2cd766b45fdc0
build_sha=df06179f87b48b085fb561dd49b2cd766b45fdc0
deployed_at=2026-07-20T05:00:00+00:00
deployed_by=rae_admin
site_url=https://goffice.mju.ac.th
pages=226
hotfix=logo
```

### Container / Legacy Notes

| Component | Status |
|---|---|
| `goffice-static-v110` (nginx:alpine) | **Exited (0) 6 days ago** — not serving production |
| `goffice-j6` (Joomla) | **Exited (0) 3 weeks ago** |
| `goffice-j6-db` (MariaDB) | Up 6 weeks (healthy) |
| `raemanagemju.net` Nginx | Still proxies to `127.0.0.1:8081` — **port 8081 not listening** |

---

## 4. VPS Baseline

| Item | Result | Assessment |
|---|---|---|
| Hostname | `raeserver` | — |
| User | `rae_admin` | — |
| OS | Ubuntu 22.04.5 LTS (Jammy Jellyfish) | Supported |
| Kernel | Linux 5.15.0-181-generic x86_64 | Supported |
| Architecture | x86-64 (Hyper-V VM) | — |
| Uptime | 43 days, 22+ hours | — |
| Timezone | UTC (`Etc/UTC`) | OK |
| CPU | 8 vCPU — Intel Xeon Gold 6526Y (4 cores, 2 threads/core) | Adequate raw compute |
| RAM | 7.6 GiB total; ~3.7 GiB used; ~3.7 GiB available; **1.7 GiB swap in use** | **Constrained under load** |
| Swap | 4 GiB file `/swap.img`, ~43% used | Memory pressure indicator |
| Load average | 7.19 / 7.60 / 7.04 (8 cores) | **High sustained load** |
| Root disk | 490G total, 211G used, **258G free** (46%), ext4 | Adequate |
| Boot disk | `/dev/sda2` 2.0G, 15% used | OK |
| Inodes | 15% used (27M free on `/`) | Adequate |
| Docker | 29.1.5, root `/var/lib/docker`, overlay2 | Ready |
| Compose | v5.0.1 | Ready |
| Git | 2.34.1 | Ready |
| Nginx | 1.18.0 (Ubuntu), active | Ready for new vhost |
| Firewall | `ufw` service **active**; verbose rules unreadable without sudo | Partially verified |
| SSH | `PermitRootLogin no`, `PasswordAuthentication no`, `PubkeyAuthentication yes` | Good |

### Listening TCP Ports (selected)

| Port | Bind | Notes |
|---|---|---|
| 80, 443 | 0.0.0.0 | Nginx (public) |
| 22, 2222 | 0.0.0.0 | SSH |
| 3306 | 127.0.0.1 | MariaDB (docker-raeserver) |
| 5432 | internal only | `rae-postgres` — not publicly bound |
| 8080–8086 | 127.0.0.1 | Various app containers |
| 10000 | 0.0.0.0 | Webmin (likely) |
| 8081 | **not listening** | Legacy Joomla proxy target |

---

## 5. Existing Docker Workloads

### Running Containers (selected)

| Container | Image | Status | Ports |
|---|---|---|---|
| learning-center-db | mariadb:10.11 | Up 5 weeks (healthy) | 3306/tcp |
| learning-center-web | nginx:alpine | Up 5 weeks (healthy) | 127.0.0.1:8086→80 |
| learning-center-app | learning-center-app | Up 5 weeks (healthy) | 9000/tcp |
| goffice-j6-db | mariadb:10.11 | Up 6 weeks (healthy) | 3306/tcp |
| rgreenoff-db | mariadb:10.11 | Up 6 weeks | 3306/tcp |
| rae-postgres | postgres:15-alpine | Up 6 weeks (healthy) | 5432/tcp (internal) |
| mariadb | mariadb:10.6 | Up 6 weeks (healthy) | 127.0.0.1:3306→3306 |
| metabase | metabase/metabase:latest | Up 6 weeks (healthy) | 127.0.0.1:3100→3000 |
| open-webui-new | open-webui:main | Up 6 weeks (healthy) | 127.0.0.1:3001→8080 |
| raenew2026-web/db/app/redis | raenew2026-* | Up 6 weeks | 127.0.0.1:8084, internal |
| litellm-gateway (4 services) | litellm-gateway-* | Up 6 weeks | internal |
| nginx | nginx:alpine | Up 6 weeks (**unhealthy**) | 127.0.0.1:8082/8443 |
| n8n | n8nio/n8n:latest | **Restarting** | — |
| wordpress-greenoffice-db | mariadb:10.11 | **Restart loop** | 3306/tcp |

### Stopped / Legacy Green Office Containers

| Container | Status |
|---|---|
| goffice-static-v110 | Exited (0) |
| goffice-j6 | Exited (0) |
| rgreenoff | Exited (0) |
| wordpress-greenoffice-web | Created (never started) |

### Compose Projects

| Project | Config | State |
|---|---|---|
| docker-raeserver | `/home/rae_admin/docker-raeserver/docker-compose.yml` | restarting(1), running(6) |
| learning-center | `/home/rae_admin/learning-center/docker-compose.yml` | running(4) |
| litellm-gateway | `/home/rae_admin/litellm-gateway/docker-compose.yml` | running(4) |
| raenew2026 | `/opt/raenew2026/docker-compose.yml` | running(4) |
| metabase | `/opt/metabase/docker-compose.yml` | running(1) |
| rae-landing | `/home/rae_admin/rae-landing/docker-compose.yml` | running(1) |
| raemju-project | `/home/rae_admin/raemju-project/docker-compose.yml` | running(1) |
| goffice_j6_restore | `joomla-greenoffice/joomlagreenv2/docker-compose.yml` | running(1) |
| joomla-greenoffice | worktree compose | restarting(1) |

### Docker Networks

15 bridge networks including: `goffice-j6-net`, `rae-internal`, `docker-raeserver_backend`, `docker-raeserver_frontend`, `learning-center-net`, `raenew2026-net`, `litellm-gateway_default`, `metabase_metabase-network`

### Docker Volumes

| Volume | Purpose |
|---|---|
| docker-raeserver_mariadb_data | MariaDB |
| raemju-project_postgres_data | Postgres |
| learning-center_* (3 volumes) | App, DB, storage |
| docker-raeserver_open_webui_data | Open WebUI |

### Resource Snapshot

- **Memory pressure:** ~3.5 GiB actively used; swap 1.7/4 GiB; load ~7 on 8 cores
- **Heavy consumers:** Metabase ~826 MiB, Open WebUI ~378 MiB, canva-service ~78 MiB
- **Docker socket:** `/var/run/docker.sock` — `root:docker`, mode `660`

---

## 6. Supabase Readiness

| Area | Status | Evidence | Risk |
|---|---|---|---|
| CPU/RAM | **BLOCKER** | 8 cores but load ~7; swap 1.7/4 GiB; Metabase+OpenWebUI+multiple DBs | Supabase stack (~2–4 GiB) may cause OOM |
| Disk | **OK** | 258 GiB free; ext4; Docker root `/var/lib/docker` | Low |
| Docker | **OK** | 29.1.5 + Compose 5.0.1 | Standard |
| Reverse proxy | **OK** | Nginx active; 443 available; can add `api.goffice.mju.ac.th` vhost | Route design needed |
| TLS | **OK** | MJU certs in `/etc/ssl/mju/` | Reuse or separate cert for API subdomain |
| Firewall | **PARTIAL** | UFW active; rules not fully audited | Confirm inbound policy before exposure |
| Backups | **BLOCKER** | Joomla backups under `joomla-greenoffice/backups/`; no Supabase/Postgres backup cron found | Data-loss risk |
| Monitoring | **WEAK** | No dedicated alerting stack; ops logs in `joomla-greenoffice/ops/logs/` | Blind spots post-install |
| Port conflicts | **MEDIUM** | `rae-postgres` (5432/tcp internal); multiple MariaDB; Kong needs internal ports | Name/port/network planning required |
| DNS | **UNKNOWN** | `api.goffice.mju.ac.th` not verified on host | Must be provisioned before go-live |
| Studio privacy | **PLAN REQUIRED** | No VPN/IP-restricted vhost observed | Studio must not be public |

### Security Posture

| Check | Result |
|---|---|
| SSH root login | Disabled |
| SSH password auth | Disabled |
| SSH pubkey auth | Enabled |
| Docker socket | Restricted to `docker` group |
| `.env` in canonical project | None found at project root |
| Unattended security upgrades | Installed and enabled (`unattended-upgrades 2.8ubuntu1`) |
| Secrets in this report | Masked / not displayed |

### Operations

| Check | Result |
|---|---|
| Automatic security updates | Enabled via apt periodic |
| Backup mechanism (existing) | Joomla manual backups in `joomla-greenoffice/backups/backup2026/` |
| Offsite backup | Not verified in this audit |
| Database restore procedure | Documented for Joomla (`backups/backup2026/RESTORE.md`) — not for Supabase |
| Log rotation | Standard system; app-specific ops logs present |
| Maintenance window | Possible but load already high |

---

## 7. Current Supabase Usage in Green Office

### Dependencies

`package.json` — Astro/Tailwind only; **no `@supabase/supabase-js`**

```json
"dependencies": {
  "@astrojs/sitemap": "3.2.1",
  "@astrojs/tailwind": "^6.0.2",
  "astro": "^4.0.0",
  ...
}
```

### Code Search Results

Search scope: `/home/rae_admin/goffice2026` (excluding `node_modules`, `dist`, `.env*`)

**Zero matches** for: `supabase`, `createClient`, `SUPABASE_*`, `service_role`, `anon_key`

### Data Architecture Today

| Layer | Location | Type |
|---|---|---|
| Dashboard config | `src/data/dashboard-config.ts` | Static TS |
| Generated metrics | `src/data/generated/*.json` | Build-time JSON |
| CSV sources | `src/data/csv/*.csv` | Import pipeline input |
| Criteria | `src/data/criteria/*.json` | Static JSON |
| Dashboard pages | `src/pages/dashboard/[id].astro` | SSG — imports JSON at build time |

**No runtime API calls** found in `src/`. Site is fully static Astro SSG.

### Auth / Storage / Realtime / Edge Functions

Not implemented.

### Migrations / Schema

- **SQL migration files in Git:** 0
- **RLS policies:** none
- **`docs/migration/`:** SharePoint and legacy Joomla content migration — **not Supabase-related**

### Migration Complexity

| Dimension | Rating |
|---|---|
| Frontend rewrite | **LOW** — Supabase would be additive |
| Operational setup | **MEDIUM** — new backend, auth, RLS, backups on shared VPS |

---

## 8. Blockers Before Installation

Ordered by severity:

1. **Memory/load pressure** — sustained load ~7, 1.7 GiB swap used; Supabase (~15+ containers) on 7.6 GiB VPS is high OOM risk
2. **No backup/restore procedure** for a new Postgres/Supabase stack on this host
3. **Existing `rae-postgres`** (`postgres:15-alpine`, 5432/tcp internal) — potential service/port/network naming conflict
4. **Unstable containers** (`n8n`, `wordpress-greenoffice-db` restart loops) — shared blast radius
5. **`api.goffice.mju.ac.th` DNS** — not verified; required before API routing
6. **Studio exposure plan** — must remain private (VPN, IP allowlist, or internal-only bind)
7. **No frontend Supabase integration yet** — scope undefined (auth, storage, dashboards API, etc.)
8. **Firewall rules not fully audited** — confirm UFW allows only intended public surfaces post-install

---

## 9. Recommended Deployment Shape

```
goffice.mju.ac.th          → Nginx static (existing)
                             /var/www/goffice/current

api.goffice.mju.ac.th      → Nginx HTTPS terminate
                             → proxy to Supabase Kong (Docker internal network)
                             → PostgREST / Auth / Storage / Realtime

studio (private)           → bind 127.0.0.1 or VPN-only
                             NOT public internet
```

| Decision | Recommendation |
|---|---|
| Same VPS acceptable? | **Conditionally** — only with RAM upgrade to **≥16 GiB** and load reduction, or after relocating heavy workloads |
| Resource upgrade required? | **Yes, strongly recommended** before production Supabase on this host |
| Separate VPS preferred? | **Yes for production DB/API** — isolates blast radius from 20+ existing containers |

---

## 10. Proposed Next Step

**Stop here.** Request **Product Owner review** of:

1. Supabase feature scope (auth, DB tables, storage, realtime)
2. Hosting decision: upgrade this VPS vs. dedicated Supabase VPS
3. DNS + TLS plan for `api.goffice.mju.ac.th`
4. Studio access policy (VPN/IP restriction)
5. Backup RPO/RTO targets before any install phase

After approval → proceed to **GO-BE-DESIGN** (architecture + resource sizing + Nginx vhost draft). No install until explicitly authorized.

---

## Appendix A — Folder Inventory Details

| Folder | Size | Owner | Perms | Modified |
|---|---|---|---|---|
| `/home/rae_admin/goffice2026` | 284M | rae_admin | 775 | 2026-07-20 |
| `/home/rae_admin/goffice2026-release-v1.1.3` | 254M | rae_admin | 775 | 2026-07-20 |
| `/home/rae_admin/goffice2026-release-v1.1.2` | 253M | rae_admin | 775 | 2026-07-20 |
| `/home/rae_admin/goffice2026-release-v1.1.1` | 253M | rae_admin | 775 | 2026-07-20 |
| `/home/rae_admin/green-office-2026` | 108K | rae_admin | 775 | 2026-06-26 |
| `/home/rae_admin/joomla-greenoffice` | 4.6G | rae_admin | 775 | 2026-07-02 |
| `/opt/joomla-greenoffice` | 390M | rae_admin | 755 | 2026-02-03 |
| `/var/www/goffice` | 34M | www-data | 755 | 2026-07-20 |

### Project Structure (canonical source)

Present in `/home/rae_admin/goffice2026`:

- `package.json`, `astro.config.mjs`
- `src/`, `public/`, `dist/`
- No `Dockerfile`, no `docker-compose.yml`, no `.env` files

---

## Appendix B — Key Config Paths

| Purpose | Path |
|---|---|
| Nginx production vhost | `/etc/nginx/sites-available/goffice.mju.ac.th.conf` |
| Nginx security headers | `/etc/nginx/snippets/goffice-security-headers.conf` |
| Nginx backup (pre-PROD-2) | `/etc/nginx/backups/goffice/goffice.mju.ac.th.conf.pre-prod2-20260720-032408.bak` |
| TLS certificate | `/etc/ssl/mju/mju_ac_th.fullchain.crt` |
| Deploy script (PROD-1) | `/home/rae_admin/joomla-greenoffice/ops/prod1/deploy-prod1.sh` |
| PROD-2 hardening report | `/home/rae_admin/joomla-greenoffice/docs/PROD-2_HARDENING_REPORT.md` |
| GitHub Pages CI (preview) | `/home/rae_admin/goffice2026/.github/workflows/deploy-pages.yml` |
| Production releases | `/var/www/goffice/releases/v1.1.0` … `v1.1.3` |
| Legacy Joomla compose | `/opt/joomla-greenoffice/docker-compose.yml` |

---

## Appendix C — Audit Constraints

- Audit only — no installation, no production changes
- No container/service restarts
- No git pull/fetch/reset/checkout/clean
- No secrets exposed in this report
- Network repository sync not performed

---

AUDIT_COMPLETE — NO CHANGES MADE
