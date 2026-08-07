# PO Decision Checklist (PROPOSAL)

**Status:** PROPOSAL — awaits PO decisions
**Date:** 2026-08-02
**Context:** Source restoration + DC→GO reuse mapping (GATE 1 still BLOCKED)

---

## Section A — Source Restoration (evidence completeness)

- [ ] **A1** — Authorize access: who grants read/share for `prinya_mju_ac_th` personal OneDrive (129/143 rows ACCESS_DENIED)?
- [ ] **A2** — Restore `1.2-elect.xlsx` (declared SHA `576B2E3E…21D`, 93,921 B) → `docs/`
- [ ] **A3** — Restore `1.3_Gassolene.xlsx` (`8FD700F2…085`, 254,868 B)
- [ ] **A4** — Restore `1.4_Paper.xlsx` (`CCE54E1A…924`, 207,178 B)
- [ ] **A5** — Restore `1.5_Waste.xlsx` (`5BC46053…333`, 44,014 B)
- [ ] **A6** — Restore `1.6_GreenhouseGas.xlsx` (`8A0B9C0D…E12`, 528,383 B) — note: >500KB, LFS decision needed
- [ ] **A7** — Recover 3 policy PDFs (`GreenOfficePolicy2026`, `Green Office Goals`, `Order_appointing_the_committee`) — **human privacy review required** (personal names)
- [ ] **A8** — Confirm SHA-256 of each restored file matches declared manifest hash

## Section B — Evidence Mapping (per indicator)

- [ ] **B1** — 3.2.4: approve adding `indicatorCodes: ["3.2.4","3.2.5"]` to `ev-transport-fleet-2025` (review-017)
- [ ] **B2** — 3.3.2: approve creating `ev-paper-usage-2025` from restored `1.4_Paper.xlsx` (review-022)
- [ ] **B3** — 1.6.1: provide real GHG reduction plan document (review-011, sourceId currently null)
- [ ] **B4** — 1.5.2: confirm TRUE_MISSING and accept as documented gap (or provide new evidence)

## Section C — DC→GO Mapping (reuse)

- [ ] **C1** — Approve DC as source of truth + GO as presentation (ADR-002 alignment)
- [ ] **C2** — Approve ID bridge `dcEvidenceMap` (RAE-* → ev-*) as GO-side additive file
- [ ] **C3** — Approve category mapping strategy (document-type → resource-domain, per-record, not by taxonomy alone)
- [ ] **C4** — Approve TH-title adoption + EN stays GO-side human-translated (no machine EN)
- [ ] **C5** — Approve `excludeFromPublic` rule for `AUTHENTICATED_SHAREPOINT` URLs
- [ ] **C6** — Approve indicatorCode derivation boundary (GO-side review queue only, never from DC data)

## Section D — Governance

- [ ] **D1** — Approve manifest contract v0.1 (additive, rollback-safe) — or request changes
- [ ] **D2** — Approve adapter location (GO-side script, DC stays READ-MOSTLY)
- [ ] **D3** — Approve next Re-GATE 1 procedure after A1–A8 + B1–B4 complete

---

## Decision Log (to be filled by PO)

| # | Decision | Owner | Date | Result |
|---|---|---|---|---|
| A1 | OneDrive access grant | PO / data owner | — | ⏳ |
| B4 | 1.5.2 TRUE_MISSING accepted | PO | — | ⏳ |
| C2 | ID bridge approved | PO | — | ⏳ |
| D2 | Adapter GO-side approved | PO | — | ⏳ |

**Verdict: AWAITING_PO_DECISIONS — nothing actionable until A1–A8 and B1–B4 resolve.**
