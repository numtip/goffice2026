# GO-SP-1R — Site Correction Report

Generated: 2026-07-20T15:15:00+07:00  
Task: Correct GO-SP-1 assessment after Product Owner canonical site approval  
Account: `researchmju@mju.ac.th` (masked: `rese***@mju.ac.th`)

---

## Correction Summary

GO-SP-1 incorrectly assessed the **tenant root** (`https://maejo365.sharepoint.com` — *Maejo university Team Site*) as the RAE operational host. The Product Owner confirmed the canonical RAE SharePoint site is:

| Item | Corrected value |
|------|-----------------|
| **Canonical site URL** | `https://maejo365.sharepoint.com/sites/msteams_54adc4` |
| **Site title** | สำนักวิจัยฯ |
| **Organizational context** | สำนักวิจัยและส่งเสริมวิชาการการเกษตร (RAE) |
| **Account** | `researchmju@mju.ac.th` |
| **Site admin access** | Confirmed (Full Control effective permissions) |

### Incorrect GO-SP-1 assumptions (corrected)

| Incorrect | Correct |
|-----------|---------|
| Primary site: tenant root | Primary site: `/sites/msteams_54adc4` |
| `/sites/RAE` probe used as negative signal | Never use `/sites/RAE` or `/sites/Research` |
| RAE artifacts on root site collection | RAE Document Registry (627 items), Documents (3), class docs on canonical site |
| Verdict: `READY_WITH_REVIEW` | Verdict: **`READY_TO_CREATE_LIBRARY`** |

---

## Product Owner Approvals (recorded)

| Decision | Approved value |
|----------|----------------|
| Canonical site | `https://maejo365.sharepoint.com/sites/msteams_54adc4` |
| Library display name | หลักฐานสำนักงานสีเขียว |
| English name | Green Office Evidence |
| Internal URL | `GreenOfficeEvidence` |
| Permission model | Owners: Full Control; Members: Edit; Visitors: Read; **inherit RAE site permissions initially** |
| Metadata model | Hybrid SharePoint site columns (no mandatory Managed Metadata) |

---

## Phase A Re-verification (2026-07-20)

| Check | Result |
|-------|--------|
| Exact URL reachable | **PASS** |
| Active account `researchmju@mju.ac.th` | **PASS** |
| Site title identifies RAE operational site | **PASS** (สำนักวิจัยฯ) |
| Permission to create document library | **PASS** |
| Document Center objects unmodified | **PASS** (Documents: 3 items; RAE Document Registry: 627 items — unchanged) |
| `GreenOfficeEvidence` pre-existed at verify time | **PASS** (absent at first verify; created in GO-SP-2) |

---

## Updated GO-SP-1 Verdict

**`READY_TO_CREATE_LIBRARY`**

Proceeding to GO-SP-2 library creation on the canonical site was authorized and executed.

---

## Files Updated

- `docs/sharepoint/GO-SP1-site-assessment.md`
- `docs/sharepoint/GO-SP1-library-comparison.md`
- `docs/sharepoint/GO-SP1-recommended-architecture.md`
- `docs/sharepoint/GO-SP1-metadata-gap-analysis.md`
- `docs/sharepoint/GO-SP1-implementation-plan.md`

---

## References

- Raw verification: `docs/sharepoint/go-sp2-verify-raw.json`
- Library creation: `docs/sharepoint/GO-SP2-library-creation-report.md`
