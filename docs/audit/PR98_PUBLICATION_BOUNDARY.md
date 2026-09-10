# PR #98 Publication Boundary

## In scope (this PR — `fix/resource-xlsx-source-publication`)

- Reconcile six resource domains against OneDrive **Resource** authority
- Byte-identical staging + public distribution copies for all resource XLSX
- GHG FY2568 authority: `1.6GreenHouseGas2025.xlsx` (supersedes Data2568 `update2`)
- Metadata: `resource-source-files.json`, `publication-manifest.json`, evidence/registry/source-manifest
- Cat1 GHG contract + dashboard generated JSON alignment (231.23 tCO₂e baseline)
- Automated checks: `validate-publication-manifest.mjs`, updated resource publication tests
- Audit matrices for resources; FY2569 form **inventory only** (no bulk publish)

## Out of scope (follow-up PR recommended)

- Full FY2569 form publication for Cat1–Cat7 under `public/documents/fy2569/`
- Indicator/issue mapping for all Data2569 forms (`NEEDS_MAPPING` rows)
- UI wiring: category → issue → แบบฟอร์ม for every mapped form
- Personnel/CV/private withhold review per file

## Stop line

**PUBLIC_SOURCE_PREVIEW_READY** — local preview + HTTP checks; no merge, no GitHub Pages, no production deploy.
