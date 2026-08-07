# Implementation Plan (PROPOSAL) — DC→GO Reuse

**Status:** PROPOSAL — P0/P1/P2 plan only, nothing implemented
**Date:** 2026-08-02
**Blocked by:** PO decisions (checklist doc) + Evidence Gate (GATE 1 BLOCKED)

---

## P0 — Evidence completeness (pre-integration, must precede reuse)

| # | Item | Depends on | Gate |
|---|---|---|---|
| P0-1 | Restore 6 source workbooks + 3 policy PDFs, verify SHA | PO A1–A8 | Evidence Gate |
| P0-2 | PO decisions B1–B4 (mapping 3.2.4 / 3.3.2 / 1.6.1, accept 1.5.2 TRUE_MISSING) | PO B1–B4 | Evidence Gate |
| P0-3 | Re-GATE 1 (re-verify SHA + traceability) | P0-1, P0-2 | GATE 1 |

## P1 — DC→GO integration (only after GATE 1 passes)

| # | Item | File(s) | Notes |
|---|---|---|---|
| P1-1 | Pull full DC public export (627) | `data/document-registry.public.json` (DC) | DC stays frozen; consume artifact |
| P1-2 | GO-side adapter script (spec'd) | GO `scripts/dc-import-manifest.mjs` (new) | read-only on DC, produces manifest |
| P1-3 | Public metadata manifest | GO `src/data/dc-public-manifest.json` (new) + `.sha256` | v0.1 contract; `excludeFromPublic` enforced |
| P1-4 | ID bridge `dcEvidenceMap` | GO `src/data/dc-evidence-map.json` (new) | RAE-* → ev-*; additive |
| P1-5 | Category/status translation + validator | GO `src/data/` + `scripts/` | mirror `validate-public-export.py` rules |
| P1-6 | TH title adoption + EN strategy | GO locale files | no machine EN |

## P2 — Presentation & polish

| # | Item | Notes |
|---|---|---|
| P2-1 | Evidence navigator shows DC-linked public metadata | only public fields |
| P2-2 | Provenance panel shows DC export sha reference | traceability |
| P2-3 | Per-file SHA after restore (already P0) | Evidence Gate scope |
| P2-4 | EN translation of new DC titles | human |

---

## Sequencing Rules

1. **P0 must fully complete** (GATE 1 passes) before any P1 file is created.
2. P1 files are **additive only** — no edits to existing `src/data/evidence-index.json`,
   `source-manifest.json`, or any schema.
3. P2 optional; gated on P1 landing cleanly.
4. No deploy/tag/push at any step without separate PO approval.

## Compatibility / Rollback

- Every new file is independently removable → reverts to today's state exactly.
- No schema changes to frozen DC; no changes to GO routes/page counts until approved.

**Verdict: PLAN_READY — execution blocked on PO checklist + Evidence Gate.**
