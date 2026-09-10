# FY2568 publication byte-normalization (PR98 reconciliation)

**Status:** PO accepted 2026-09-10 · LF served copies are the canonical published record  
**Scope:** `public/documents/fy2568/cat4/**/*.txt` (13 files) · `src/data/fy2568-publication.json` · `src/data/evidence-index.json` · `src/data/category4/*.json`

## Finding

Thirteen Category 4 `.txt` records had historical manifest hashes calculated from CRLF copies while the committed/served blobs use LF. The only byte-level difference is line-ending normalization; content is otherwise equivalent. The served copies were therefore smaller by the number of CR characters removed.

| document | recorded CRLF bytes | served LF bytes | Δ bytes |
|---|---:|---:|---:|
| 4.1.2 (1) .txt | 3039 | 3029 | −10 |
| 4.1.2 (2).txt | 953 | 947 | −6 |
| 4.1.2 (3) .txt | 1888 | 1885 | −3 |
| 4.1.2 (6) .txt | 779 | 778 | −1 |
| 4.1.2 (7) .txt | 856 | 855 | −1 |
| 4.1.3 (3).txt | 2878 | 2875 | −3 |
| 4.1.3 (4).txt | 894 | 893 | −1 |
| 4.2.1 (2).txt | 2044 | 2041 | −3 |
| 4.2.1 (3).txt | 2335 | 2327 | −8 |
| 4.2.1 (4).txt | 2407 | 2404 | −3 |
| 4.2.2 (1).txt | 1866 | 1864 | −2 |
| 4.2.2 (2).txt | 1095 | 1093 | −2 |
| 4.2.2 (4).txt | 190 | 185 | −5 |

## Accepted publication contract

1. The **currently served LF bytes** are the accepted FY2568 public record for these 13 text documents.
2. `scripts/reconcile-fy2568-publication.mjs` derives per-document size/SHA-256 and aggregate counts from the published tree; current served SHA-256 is therefore canonical for public integrity checks.
3. The previous CRLF hash is retained in `manifestSha256Note` for provenance. It is not silently discarded or represented as the served hash.
4. `.gitattributes` marks `public/documents/fy2568/**/*.txt binary` so future Git operations cannot silently re-normalize line endings.
5. If a source-tree CRLF original is intentionally re-ingested later, that is a **new provenance/publication event**: update the public bytes, manifest, hash and audit record together. Do not silently swap bytes under an existing hash.

## PO decision

Accepted by the Product Owner on **2026-09-10** as part of the final PR #98 completion round. No restoration of the 13 files is required for this PR because the difference is line-ending representation only and the already-served LF record is now explicitly the approved public byte representation.
