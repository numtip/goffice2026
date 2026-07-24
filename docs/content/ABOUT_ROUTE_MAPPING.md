# About Center — Route Mapping

Generated: 2026-07-24

## Target Routes

| Route (TH) | Route (EN) | Page ID | Title (TH) | Title (EN) | Status | Classification |
|---|---|---|---|---|---|---|
| `/about/` | `/en/about/` | about-index | เกี่ยวกับเรา | About | NOT_CREATED | MISSING |
| `/about/scope/` | `/en/about/scope/` | about-scope | ขอบเขตการดำเนินงาน | Scope | NOT_CREATED | MISSING |
| `/about/policy/` | `/en/about/policy/` | about-policy | นโยบายสิ่งแวดล้อม | Environmental Policy | NOT_CREATED | MISSING |
| `/about/goals/` | `/en/about/goals/` | about-goals | เป้าหมายและตัวชี้วัด | Goals and Indicators | NOT_CREATED | MISSING |
| `/about/committee/` | `/en/about/committee/` | about-committee | คณะกรรมการและทีมงาน | Committee and Team | NOT_CREATED | MISSING |
| `/about/action-plan/` | `/en/about/action-plan/` | about-action-plan | แผนปฏิบัติการ | Action Plan | NOT_CREATED | MISSING |
| `/about/certification/` | `/en/about/certification/` | about-certification | การรับรองสำนักงานสีเขียว | Green Office Certification | NOT_CREATED | MISSING |
| `/about/feedback/` | `/en/about/feedback/` | about-feedback | ข้อเสนอแนะและการติดต่อ | Feedback and Contact | NOT_CREATED | MISSING |

## Route Dependencies

```
about-index
├── about-scope
├── about-policy
├── about-goals
├── about-committee
│   └── about-action-plan
├── about-certification
└── about-feedback
```

## Content Source Mapping

| Page ID | Primary Source | Secondary Sources |
|---|---|---|
| about-index | — | i18n glossary, criteria categories |
| about-scope | criteria indicators 1.1.x | evidence-index |
| about-policy | criteria indicators 1.2.x | evidence-index (ev-transport-policy) |
| about-goals | criteria indicators 1.3.x | dashboard-config targets |
| about-committee | criteria indicators 1.4.x | — |
| about-action-plan | criteria indicators 1.5.x | evidence-index (ev-ghg-reduction-plan) |
| about-certification | criteria categories cat7 | glossary (certification, renewal) |
| about-feedback | criteria indicators 2.2.4 | — |

## Related Criteria Categories

| Page | Primary Category | Related Indicators |
|---|---|---|
| about-scope | cat1 | 1.1.1, 1.1.2 |
| about-policy | cat1 | 1.2.1, 1.2.2 |
| about-goals | cat1 | 1.3.1, 1.3.2, 1.3.3 |
| about-committee | cat1 | 1.4.1, 1.4.2 |
| about-action-plan | cat1 | 1.5.1, 1.5.2 |
| about-certification | cat7 | 7.1, 7.2 |
| about-feedback | cat2 | 2.2.4 |

## Breadcrumb Structure (Proposed)

```
Home > About
Home > About > Scope
Home > About > Policy
Home > About > Goals
Home > About > Committee
Home > About > Action Plan
Home > About > Certification
Home > About > Feedback
```

## Navigation Placement (Proposed)

About Center pages should be accessible from:
- Main navigation dropdown under "About" (when implemented)
- Footer quick links
- Related category pages (e.g., Category 1 page links to About Policy)