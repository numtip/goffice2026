# Legacy Content Audit Summary

Generated: 2026-07-20T13:27:08.463110+07:00

## Audit Mode
Read-only filesystem audit. No source modifications performed.

## Source Snapshot
| Metric | Before | After |
|--------|--------|-------|
| Directories | 5265 | 5265 |
| Files | 18778 | 18778 |
| Total size (bytes) | 1862735716 | 1862735716 |
| Newest modified | 2026-06-02T12:01:11.356330+07:00 | 2026-06-02T12:01:11.356330+07:00 |
| Oldest modified | 2017-05-01T16:36:40+07:00 | 2017-05-01T16:36:40+07:00 |

**Source unchanged:** YES

## Inventory Summary
- Total regular files: 18778
- Total directories: 5265
- Total size: 1,862,735,716 bytes (1776.4 MB)
- PDF: 0
- Images: 2044
- Spreadsheets: 42
- Documents: 0
- Videos: 0
- Archives: 767
- Other: 15925
- Unreadable: 0
- Zero-byte: 37

## Classification Summary
- activity_image: 746
- backup: 26
- cache: 319
- dashboard_source: 84
- duplicate: 1564
- public_story_asset: 45
- sensitive: 361
- system_file: 15465
- thumbnail: 164
- unknown: 4

## Duplicate Summary
- Exact duplicate groups: 860
- Duplicate files (non-canonical): 1564
- Recoverable space: 40,778,710 bytes
- Suspicious files: 0

## Taxonomy Mapping
- needs_review: 773
- not_applicable: 17764
- probable: 230
- unmapped: 11

### By Category
- Category 1: 155
- Category 2: 780
- Category 3: 47
- Category 4: 5

## Pilot Candidates
- Count: 26
- Mix: formal evidence substitutes (MD/JSON/HTML reports — **no PDF files exist in legacy source**), policy/plan/awareness assets, dashboard CSV/JSON spreadsheets, activity images, knowledge HTML/MD, ambiguous review files
- Selection rationale: Prioritized unique, readable files under `images/data/` (dashboard domain) and dated activity images under `images/2026/` and `images/Img4/plan2025/`; excluded duplicates, system files, cache, and sensitive exclusions
- Major risks:
  - Legacy source contains **zero PDF files**; formal evidence pilot uses MD/JSON/HTML substitutes
  - High proportion of files are Joomla system/core assets (~80%) with `not_applicable` taxonomy mapping
  - 860 duplicate groups (~40 MB recoverable) may complicate canonical selection during migration
  - Generic image filenames under `images/img1/th/` require manual taxonomy review

## Validation
- Inventory = classified: True
- All source paths present: True
- Readable files have SHA-256: True
- Duplicate refs resolve: True
- Source unchanged: True

## Verdict
**READY_WITH_REVIEW**
