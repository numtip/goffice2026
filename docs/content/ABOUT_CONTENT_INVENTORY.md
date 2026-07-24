# About Center — Content Inventory

Generated: 2026-07-24

## Scope
Inventory of existing repository content with potential relevance to About Center pages.

## Method
Searched src/pages, src/content, src/data, src/components, src/config, public, docs for About-related keywords in Thai and English.

## Findings Summary

| Category | Count | Assessment |
|---|---|---|
| Existing About pages | 0 | No /about/ route exists |
| About-related components | 0 | No dedicated About components |
| Reusable data sources | 3 | criteria, i18n glossary, evidence-index |
| Reference documents | 2 | Green Office criteria PDFs |
| Images with About relevance | 1 | LogoGreen2025.png |

## Detailed Findings

### 1. Pages (src/pages)
- **No About pages exist.** The page tree contains: index, dashboard, categories, evidence, documents, search, indicators, 404.
- No `/about/` or `/en/about/` directories.

### 2. Data Sources (src/data)

#### 2.1 Criteria Data (`src/data/criteria/`)
**Classification: REUSE**

| File | Relevance | Notes |
|---|---|---|
| `categories.json` | High | Category 1 (Policy & Planning) contains all About-related indicators |
| `indicators.json` | High | Indicators 1.1.x–1.5.x directly map to About pages |
| `issues.json` | Medium | Issue descriptions can inform page content |

Key indicators for About pages:
- 1.1.1 — Organizational context and scope
- 1.1.2 — Environmental issue assessment
- 1.2.1 — Environmental policy
- 1.2.2 — Policy review
- 1.3.1 — Targets and indicators
- 1.3.2 — Target achievement analysis
- 1.3.3 — Target communication
- 1.4.1 — Committee appointment
- 1.4.2 — Committee understanding
- 1.5.1 — Action plans
- 1.5.2 — Action results
- 2.2.4 — Feedback channel

#### 2.2 i18n Glossary (`src/data/i18n/glossary.ts`)
**Classification: REUSE**

Contains authoritative translations for:
- การรับรอง (Certification)
- การต่ออายุการรับรอง (Renewal)
- การยกระดับการรับรอง (Certification Level Upgrade)
- นโยบายสิ่งแวดล้อม (Environmental Policy)
- เป้าหมาย (Target)
- ข้อเสนอแนะ (Feedback)

#### 2.3 Evidence Index (`src/data/evidence-index.json`)
**Classification: MERGE**

Evidence items related to About content:
- `ev-ghg-reduction-plan` — Strategic plan (Action Plan page)
- `ev-transport-policy` — Sustainable transport policy (Policy page reference)
- Various policy-related evidence items

#### 2.4 Dashboard KPI (`src/data/dashboard-kpi.json`)
**Classification: NOT_APPLICABLE**

Operational metrics, not About content.

### 3. Components (src/components)
**Classification: NOT_APPLICABLE**

No About-specific components exist. Landing components are tied to homepage.

### 4. Documents (public/documents, docs/)

#### 4.1 Public Documents
**Classification: REUSE**

| File | Path | About Page |
|---|---|---|
| Green Office Criteria TH | `public/documents/reference/เกณฑ์การประเมินสำนักงานสีเขียว-ปี-2569.pdf` | about-certification |
| Green Office Criteria EN | `public/documents/reference/green-office-assessment-criteria-2569.pdf` | about-certification |

#### 4.2 Internal Documents (docs/)
**Classification: NEEDS_REVIEW**

| File | Assessment |
|---|---|
| `00-GREENOFFICE_PROJECT_CONSTITUTION.MD` | Internal governance. May inform About index but requires review. |
| `GREENOFFICE2026_PLATFORM_BLUEPRINT_V3.md` | Technical spec. Not for About pages. |
| Foundation reports (ROUND1–4) | Internal project documentation. Not for public About pages. |

### 5. Images (public/images)
**Classification: REUSE**

| File | Current Usage | About Relevance |
|---|---|---|
| `LogoGreen2025.png` | Site logo | about-index (organization logo) |
| Dashboard/category images | Dashboard/Categories | None — decorative only |

## Classification Summary

| Item | Classification | Count |
|---|---|---|
| Criteria data (categories, indicators, issues) | REUSE | 3 files |
| i18n glossary terms | REUSE | 6+ terms |
| Evidence index items | MERGE | 2+ items |
| Green Office criteria PDFs | REUSE | 2 files |
| Project constitution | NEEDS_REVIEW | 1 file |
| Logo image | REUSE | 1 file |
| Dashboard/landing images | NOT_APPLICABLE | 15+ files |
| Technical documents | NOT_APPLICABLE | 5+ files |

## Recommendations

1. **REUSE** criteria JSON as the authoritative source for indicator descriptions
2. **REUSE** i18n glossary for consistent terminology
3. **REUSE** LogoGreen2025.png on About index
4. **REUSE** criteria PDFs as downloadable references
5. **NEEDS_REVIEW** project constitution before any public use
6. **MERGE** relevant evidence items into About pages where appropriate