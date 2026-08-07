# DEMO / UNVERIFIED DATA

> **DO NOT USE FOR PRODUCTION**

This directory holds **demo / unverified data files** that were once referenced by
the Green Office 2026 platform but are **not backed by any validated source**
(no Excel, CSV, or generated pipeline provenance).

## Quarantined files

| File | Original location | Why quarantined |
|---|---|---|
| `dashboard-kpi.json` | `src/data/dashboard-kpi.json` | Hand-authored demo file (v0.2.0). Contained an invented overall score (85) and 9 KPI entries including **fuel (22,928 L)** and **paper (2,198 kg)** mislabeled as category scores (`cat3`), plus unverified "Energy/Water/Waste/Emissions Score" values. |
| `categories.json` | `src/data/categories.json` | Hand-authored demo file (v0.1.0). Contained 7 invented category scores (85/78/92/71/88/74/80) with no assessment evidence. |

## Disposition date

2026-08-07 — quarantined during Production Release Hardening
(commit to be recorded in `docs/releases/`).

## Do not restore

- Do **not** move these files back into `src/data/`.
- Do **not** use these values as certification scores or readiness figures.
- If a verified Green Office 2569 assessment becomes available, introduce it via
  the normal data pipeline (`Excel → CSV → generated JSON`) with source traceability.

## What replaced them

- Executive dashboards and the homepage now show **real** derived readiness:
  monthly data coverage (`14/72` for 2569), canonical category framework
  (7 categories / 24 issues / 65 indicators), and Evidence Readiness
  (`10/24` from `src/data/evidence-index.json`).
- Search-index dashboard metadata now comes from `src/data/dashboard-meta.json`
  (canonical mirror of `src/data/dashboard-config.ts`).
