# Evidence Onboarding Sprint — Contract

**Date:** 2026-07-16  
**Starting HEAD:** `f89b590`  
**Platform Baseline:** Round 4 Final Platform Baseline

---

## A. Evidence Provenance Requirements

Every onboarded source must document:
- What is this file?
- Where did it come from?
- What is its original filename?
- Has the file changed? (SHA-256)
- Which evidence record references it?
- What taxonomy relationship is claimed?
- Basis for that claim
- Has a human reviewed it?

## B. Source Identity Rules

- Each unique source file is assigned a stable `sourceId`
- Source IDs form: `src-{type}-{descriptor}` (e.g. `src-xlsx-water-usage`)
- Duplicate detection via SHA-256

## C. Candidate Mapping Confidence Model

| Level | Criteria |
|-------|----------|
| **high** | Explicit canonical indicator code in source, or unambiguous structured metadata |
| **medium** | Strong document context supports relationship, but no explicit canonical code |
| **low** | Keyword/title similarity only |

**Rule:** Automated candidate mapping must NOT become `traceabilityLevel: indicator` + `verification.status: verified` without human review.

## D. Human Review Boundary

- System may perform: schema validation, source existence, hash validation, taxonomy reference validation
- System may prepare: review candidates with confidence ratings
- System must NOT: impersonate an authorized reviewer, mark records as verified

## E. Verification Boundary

- `verification.status: verified` requires human authorized reviewer action
- `verification.status: unresolved/pending` is default for all automated candidates

## F. Duplicate Detection Policy

- SHA-256 hash comparison
- Exact filename comparison
- Same-content, different-name files flagged as potential duplicates
- No evidence record should reference the same source file under two different IDs

## G. File Integrity Policy

- Every source file records SHA-256 at ingestion
- Evidence records reference sources by `sourceId`, not by path alone
- Path changes must not break the evidence–source link

## H. Placeholder Replacement Policy

For each existing placeholder, determine whether a real source:
A. Replaces it (same scope, superseded by real document)
B. Supplements it (real data coexists with placeholder structure)
C. Is unrelated

If uncertain: do NOT replace automatically. Create a review candidate.

---

## Source Inventory (Pre-Sprint)

| File | Size | Type | Classification |
|------|------|------|---------------|
| `docs/1.1-Water.xlsx` | 97KB | XLSX | operational-data |
| `docs/1.2-elect.xlsx` | 92KB | XLSX | operational-data |
| `docs/1.3_Gassolene.xlsx` | 249KB | XLSX | operational-data |
| `docs/1.4_Paper.xlsx` | 202KB | XLSX | operational-data |
| `docs/1.5_Waste.xlsx` | 43KB | XLSX | operational-data |
| `docs/1.6_GreenhouseGas.xlsx` | 516KB | XLSX | operational-data |
| `doc/เกณฑ์การประเมินสำนักงานสีเขียว-ปี-2569.pdf` | 1MB | PDF | assessment-reference |

## Evidence Baseline (Pre-Sprint)

- 21 placeholder records
- 100% `traceabilityLevel: category`
- 100% `verification.status: unresolved`
- 0 exact indicator-level mappings
- 0 real source documents linked
