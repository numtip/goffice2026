# GO-SP-1 — Implementation Plan

Generated: 2026-07-20T15:15:00+07:00 (corrected GO-SP-1R)  
Scope: GO-SP-1 planning corrected; **GO-SP-2 library shell executed**

---

## Verdict

**READY_TO_CREATE_LIBRARY** → **Executed in GO-SP-2** (see `GO-SP2-library-creation-report.md`)

Canonical site confirmed: `https://maejo365.sharepoint.com/sites/msteams_54adc4`

---

## Preconditions (PO / Admin)

- [x] Confirm canonical RAE site URL (`msteams_54adc4`)
- [x] Grant site owner rights to `researchmju@mju.ac.th`
- [x] Approve metadata model (hybrid site columns)
- [ ] Confirm auditor read-access model (library-scoped vs site-scoped)
- [ ] Sync registry CSVs from Linux audit host to Windows repo

---

## Implementation Sequence

### Phase 0 — Governance (1–2 days)

| Step | Action | Owner |
|------|--------|-------|
| 0.1 | PO approves Option B (new library) | PO |
| 0.2 | Confirm site URL and library name | PO + SharePoint admin |
| 0.3 | Define permission groups (curators, auditors) | PO |
| 0.4 | Approve metadata model (choice vs managed metadata) | PO + dev |

**Exit criteria:** Signed architecture approval referencing `GO-SP1-recommended-architecture.md`

---

### Phase 1 — Library Shell (half day)

| Step | Action | Details |
|------|--------|---------|
| 1.1 | Create document library | Display name: **หลักฐานสำนักงานสีเขียว**; URL: `GreenOfficeEvidence` — **DONE (GO-SP-2)** |
| 1.2 | Configure versioning | Major ON (50), minor OFF, checkout OFF — **DONE** |
| 1.3 | Permission inheritance | Inherit RAE site — **DONE** |
| 1.4 | Create folder taxonomy | `2568/`, `2569/` — **DONE** |
| 1.5 | Create default views | 7 Thai views — **DONE** |

**Exit criteria:** Empty library browsable by curators; auditors read-only

---

### Phase 2 — Metadata Schema (1 day)

| Step | Action | Details |
|------|--------|---------|
| 2.1 | Create site columns | Per metadata gap analysis |
| 2.2 | Create content types | GO Evidence Document, GO Evidence Workbook |
| 2.3 | Bind columns to content types | Required: Indicator, Category, Fiscal Year |
| 2.4 | (Optional) Create term sets | Indicator codes, categories |
| 2.5 | Export schema manifest to repo | `docs/sharepoint/GO-SP1-library-schema.json` |

**Exit criteria:** Upload test document with all required metadata fields

---

### Phase 3 — Migration Pipeline (2–3 days)

| Step | Action | Details |
|------|--------|---------|
| 3.1 | Import registry CSVs | 143 Joomla links |
| 3.2 | Run authorized bulk export | From personal OneDrive (post micro pilot) |
| 3.3 | Validate SHA256 + MIME | Reuse micro pilot script patterns |
| 3.4 | Upload to `_staging` folder | Quarantine invalid files |
| 3.5 | Promote validated files | Apply metadata + rename convention |
| 3.6 | Generate import manifest | Match micro-export-manifest format |

**Exit criteria:** ≥95% of P0 indicator evidence in library with metadata

---

### Phase 4 — Integration (EP-3, 2–3 days)

| Step | Action | Details |
|------|--------|---------|
| 4.1 | Register library in Document Center project | Graph site/list IDs |
| 4.2 | Update goffice2026 `/documents` CTAs | Stable library URLs |
| 4.3 | Replace Joomla OneDrive links | Public registry update |
| 4.4 | (Optional) Power Automate upload validation | SHA256 + metadata prompt |

**Exit criteria:** Landing page "Open Document Center" reaches live library

---

### Phase 5 — Hardening (ongoing)

| Step | Action |
|------|--------|
| 5.1 | Apply retention / sensitivity labels |
| 5.2 | Enable audit logging review |
| 5.3 | Document curator runbook |
| 5.4 | Decommission personal OneDrive as source of truth |

---

## Dependencies

| Dependency | Status | Blocker? |
|------------|--------|:--------:|
| Account `researchmju@mju.ac.th` | Confirmed | No |
| Micro pilot export pattern | SUCCESS (5 files) | No |
| Registry CSV sync | **Missing** | Yes for bulk migration |
| RAE site URL confirmation | **Ambiguous** | Yes for PO sign-off |
| SharePoint admin rights | Unknown | Yes for creation |
| Graph app registration (EP-3) | Not started | No for Phase 1–2 |

---

## Risk Register

| ID | Risk | Mitigation |
|----|------|------------|
| R1 | `/sites/Research` exists but inaccessible | PO requests access or confirms root site |
| R2 | Personal OneDrive remains primary store | Phase 3 migration + link replacement |
| R3 | No retention policy | Compliance review before audit season |
| R4 | Duplicate flows in Power Automate | Inventory before Phase 4.4 |
| R5 | Metadata drift from indicators.json | Schema export + validation script |

---

## Effort Estimate

| Phase | Duration | Roles |
|-------|----------|-------|
| 0 Governance | 1–2 days | PO, admin |
| 1 Library shell | 0.5 day | SharePoint admin |
| 2 Metadata | 1 day | Admin + dev |
| 3 Migration | 2–3 days | Dev + curator |
| 4 Integration | 2–3 days | Dev |
| **Total** | **~7–10 days** | After PO approval |

---

## Out of Scope (GO-SP-1)

- Library creation
- File upload
- Permission changes
- Production deployment
- Bulk export (>5 files)

---

## Next Action

PO review meeting to confirm:

1. Site URL (`maejo365.sharepoint.com` vs dedicated RAE site)
2. Option B approval
3. Permission groups
4. Proceed to Phase 1 implementation ticket

Upon approval without open questions → upgrade verdict to **READY_TO_CREATE_LIBRARY**.
