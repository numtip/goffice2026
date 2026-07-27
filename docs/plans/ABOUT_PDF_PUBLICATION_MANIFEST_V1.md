# About PDF Publication Manifest v1

**Date:** 2026-07-27  
**Branch:** `rapid/ws-about-pdf`  
**Status:** DRAFT — no files published  
**Privacy assessment:** `docs/evidence/ABOUT_PDF_PRIVACY_READINESS_V1.md`

---

## Publication Policy

| Rule | Value |
|------|-------|
| Source of truth (pre-publication) | `doc/` |
| Publication target root | `public/documents/about/` |
| Copy gate | Classification = `PUBLIC_READY` only |
| Current copies executed | **0** |

---

## Manifest

| Document ID | Source (`doc/`) | Target path (`public/`) | Public URL | Classification | Migration action |
|-------------|-----------------|-------------------------|------------|----------------|------------------|
| doc-policy-signed | GreenOfficePolicy2026.pdf | `public/documents/about/policy/GreenOfficePolicy2026.pdf` | `/documents/about/policy/GreenOfficePolicy2026.pdf` | HOLD | BLOCKED — OCR + human review |
| doc-policy-review | Evidenceofpolicyreview.pdf | `public/documents/about/policy/Evidenceofpolicyreview.pdf` | `/documents/about/policy/Evidenceofpolicyreview.pdf` | REDACTION_REQUIRED | BLOCKED — committee names |
| doc-goals | Green Office Goals.pdf | `public/documents/about/goals/Green_Office_Goals.pdf` | `/documents/about/goals/Green_Office_Goals.pdf` | HOLD | BLOCKED — OCR + human review |
| doc-committee-order | Order_appointing_the_committee.pdf | `public/documents/about/committee/Order_appointing_the_committee.pdf` | `/documents/about/committee/Order_appointing_the_committee.pdf` | REDACTION_REQUIRED | BLOCKED — full member roster |
| doc-committee-understanding | Evidence clarifying the role and understanding of the committee.pdf | `public/documents/about/committee/Evidence_clarifying_role_understanding.pdf` | `/documents/about/committee/Evidence_clarifying_role_understanding.pdf` | HOLD | BLOCKED — duplicate + wrong artifact |
| doc-scope | Scope of Work and Activities.pdf | `public/documents/about/scope/Scope_of_Work_and_Activities.pdf` | `/documents/about/scope/Scope_of_Work_and_Activities.pdf` | HOLD | BLOCKED — OCR + human review |
| doc-action-plan | Action plan and performance results.pdf | `public/documents/about/action-plan/Action_plan_and_performance_results.pdf` | `/documents/about/action-plan/Action_plan_and_performance_results.pdf` | REDACTION_REQUIRED | BLOCKED — named responsible persons |
| doc-feedback-channels | Details of the feedback channels.pdf | `public/documents/about/feedback/Details_of_the_feedback_channels.pdf` | `/documents/about/feedback/Details_of_the_feedback_channels.pdf` | REDACTION_REQUIRED | BLOCKED — email + phone redaction |

---

## Target Directory Layout (when cleared)

```
public/documents/about/
├── policy/
│   ├── GreenOfficePolicy2026.pdf
│   └── Evidenceofpolicyreview.pdf
├── goals/
│   └── Green_Office_Goals.pdf
├── committee/
│   ├── Order_appointing_the_committee.pdf
│   └── Evidence_clarifying_role_understanding.pdf
├── scope/
│   └── Scope_of_Work_and_Activities.pdf
├── action-plan/
│   └── Action_plan_and_performance_results.pdf
└── feedback/
    └── Details_of_the_feedback_channels.pdf
```

---

## Next Steps (PO / Content)

1. PO privacy review — waive or require redaction for committee names in order/minutes/action plan.
2. Redact feedback channels PDF — replace `raemju@gmail.com` and confirm phone line classification.
3. Resolve duplicate — obtain distinct committee role-understanding evidence or de-scope manifest entry.
4. Complete OCR + human verification for seven scanned PDFs.
5. Re-run classification; copy only `PUBLIC_READY` files to manifest target paths.
6. Update `src/data/about/documents.json` `privacyReviewStatus` and `migrationAction` after PO sign-off.
