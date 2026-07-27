# WS-B Paper Usage Orphan Resolution — QA Note

**Date:** 2026-07-27  
**Branch:** `rapid/ws-evidence-orphan`  
**Worker:** Subagent B — Evidence Orphan  
**Registry ID:** `doc-paper-usage-2025`  
**Source:** `src-xlsx-paper-usage` / `docs/1.4_Paper.xlsx`  
**Review queue:** `review-022`

---

## Decision

**Status:** ORPHAN — explicitly documented, not linked.

| Field | Value |
|-------|-------|
| `registryLinkStatus` | `orphan` |
| `publicationStatus` | `pending` (unpublished) |
| `evidenceId` | `null` |
| `categoryCode` | `null` |
| `fileOnDisk` | `false` |
| `gitTracked` | `false` |

**Do not link** to `ev-about-committee-order` — indicator 1.4.1 is the committee appointment PDF, not paper consumption data.

---

## Source File Status

| Check | Result |
|-------|--------|
| File at `docs/1.4_Paper.xlsx` | **Missing** — not present on disk (2026-07-27) |
| Git tracked | **No** — never committed to repository history |
| SHA256 on record | `CCE54E1A…48924` (from prior inspection; unverifiable until file restored) |
| Baseline data | `PRESERVED_LEGACY` in generated JSON — derived values retained, workbook absent |

Registry retains metadata from source inventory for when the workbook is restored and tracked.

---

## Rationale

1. **No valid evidence slot exists** in `evidence-index.json` for paper usage operational data. Grep confirms zero paper-related evidence records.
2. **Indicator 1.4.1 is already covered** by `ev-about-committee-order` (committee appointment PDF). The paper workbook is operational consumption data — a different artifact class. Linking would conflate governance evidence with metering data.
3. **Proposed mapping (review-022)** suggests indicators 3.3.1 / 3.3.2 (cat3 paper conservation/consumption). This is a *candidate* mapping only — no placeholder or available slot exists. Inventing a slot would violate the no-invented-mapping rule.
4. **Source file unavailable** — cannot promote, verify, or publish until workbook is restored to `docs/` and optionally git-tracked.

---

## Required Product Owner Decision

Before any link or new evidence record:

1. **Indicator scope** — Confirm 3.3.1 / 3.3.2 (paper conservation + consumption) vs alternative mapping.
2. **Slot creation** — Approve new evidence record in `evidence-index.json` or designate an existing placeholder (none today).
3. **Publication path** — Internal-only vs SharePoint publication when file is restored.

Until PO sign-off, registry entry remains `orphan` with `evidenceId: null`.

---

## Blockers for Future Link

| Blocker | Owner |
|---------|-------|
| PO decision on indicator scope (3.3.1/3.3.2 vs other) | Product Owner |
| PO approval for new evidence slot | Product Owner |
| Workbook restored on disk / git tracking | Data Worker |
| SharePoint URL when published | WS-B Evidence |

---

## Validation

```bash
node scripts/validate-evidence.mjs
```

Evidence index unchanged — structural validation expected PASS.

---

## Related

- `docs/evidence/WS-B_EVIDENCE_MAPPING_V1.md` — initial orphan identification
- `src/data/evidence-review-queue.json` — `review-022`
