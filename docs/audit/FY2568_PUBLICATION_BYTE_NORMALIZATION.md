# FY2568 publication byte-normalization (PR98 reconciliation)

**Status:** disclosed finding · requires PO confirmation of the accepted published record
**Scope:** `public/documents/fy2568/cat4/**/*.txt` (13 files) · `src/data/fy2568-publication.json` · `src/data/evidence-index.json` · `src/data/category4/*.json`

## What was found

`src/data/fy2568-publication.json` recorded size + SHA-256 for 13 Category 4 `.txt`
evidence documents that did **not** match the committed (and therefore served)
bytes. Each recorded hash corresponded to a copy that was 1–10 bytes larger than
the committed blob:

| document | recorded | served | Δ bytes |
|---|---|---|---|
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

**Cause:** the recorded hashes were computed from CRLF copies (one byte per line),
while the committed blobs are LF — the deltas equal the line count of each file.
`.gitattributes` now marks `public/documents/fy2568/**/*.txt binary` to keep such
records stable, but the pre-existing records were never refreshed.

**Consequence:** `scripts/test-fy2568-publication.mjs`'s byte-identity assertion
(manifest hash ↔ file on disk) failed for these files. It went unnoticed because the
suite failed earlier on the removed `1.5_greenhousegass_update2.xlsx` entry and the
suite was not wired into `npm test`.

## What PR98 does

1. `scripts/reconcile-fy2568-publication.mjs` regenerates the manifest **from the
   published tree**, so per-document size/SHA-256 and the per-category
   counts/bytes/totals are arithmetic facts — not hand-maintained numbers.
2. The 13 affected records now carry the **served** hash (`manifestSha256`) in
   `src/data/evidence-index.json` and the Category 4 contracts, with the previously
   recorded hash preserved verbatim in a new `manifestSha256Note` field so nothing
   is silently dropped.
3. `test-fy2568-publication.mjs` is wired into `npm test`, with semantic invariants
   (counts/totals = sums, every url resolves to a file on disk, no legacy alias)
   added on top of the documented inventory snapshot.

## PO action required

- Confirm the LF-normalised copies are the accepted published record for these 13
  documents, or restore the CRLF originals from the source tree
  (`GOFFICE_FY2568_SOURCE_ROOT`) and re-run
  `node scripts/reconcile-fy2568-publication.mjs`.
- Until that confirmation, the served bytes (what a visitor downloads) are the
  reference for every published hash.
