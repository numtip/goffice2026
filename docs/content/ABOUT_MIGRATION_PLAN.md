# About Center — Migration Plan

Generated: 2026-07-24

## Philosophy

- **Reuse before generate** — Use existing criteria data, glossary, and evidence before creating new content
- **No pages yet** — This sprint prepares structure only; pages will be created after content is obtained
- **Static-first** — Prefer Markdown/JSON over database entries
- **Bilingual from day one** — Every route has TH and EN variants

---

## Phase 1: Content Acquisition (Blocked on External)

| Page | Required Content | Owner | Status |
|---|---|---|---|
| about-policy | Signed environmental policy PDF | Senior management | MISSING |
| about-committee | Committee appointment order | HR/Admin | MISSING |
| about-committee | Committee photo | Communications | MISSING |
| about-scope | Scope definition document | Green Office team | MISSING |
| about-goals | Goals and indicators document | Green Office team | MISSING |
| about-action-plan | Action plan document | Green Office team | MISSING |
| about-certification | Green Office certificate | TGO | MISSING |
| about-certification | Certification badge image | TGO | MISSING |

**Decision:** Generate Missing Content Report (done). Wait for user to obtain documents.

---

## Phase 2: Content Preparation (Ready to Proceed)

### 2.1 Reuse Existing Data

| Source | Destination | Method |
|---|---|---|
| `src/data/criteria/categories.json` | About page descriptions | Import cat1, cat7 summaries |
| `src/data/criteria/indicators.json` | About page requirements | Import indicator 1.1.x–1.5.x, 2.2.4 |
| `src/data/i18n/glossary.ts` | About page terminology | Reference authoritative terms |
| `src/data/evidence-index.json` | About page evidence links | Link to relevant evidence items |
| `public/images/LogoGreen2025.png` | about-index | Reuse as organization logo |

### 2.2 Convert Reference Documents

| Document | Action | Output |
|---|---|---|
| Green Office Criteria TH PDF | Keep as download link | `/documents/reference/เกณฑ์...` |
| Green Office Criteria EN PDF | Keep as download link | `/documents/reference/green-office...` |

**Decision:** No PDF-to-HTML conversion needed. Criteria remain as downloadable PDFs.

---

## Phase 3: Page Structure (Future Sprint)

### Recommended Page Templates

| Page | Sections (Proposed) |
|---|---|
| about-index | Organization intro, Platform overview, Quick links to sub-pages |
| about-scope | Scope definition, Organizational context, Activity assessment summary |
| about-policy | Policy statement (HTML), Download signed PDF, Review history |
| about-goals | Current targets, Progress summary, Historical data link |
| about-committee | Committee members, Roles, Org chart, Appointment document |
| about-action-plan | Active projects, Progress tracker, Completed initiatives |
| about-certification | Current status, Certificate display, Renewal timeline |
| about-feedback | Feedback channels, Submitted suggestions, Improvement log |

---

## Phase 4: Implementation Order (Future Sprint)

1. **about-index** — Lowest dependency, can use existing content
2. **about-certification** — Can use criteria PDFs as reference
3. **about-policy** — Requires signed policy PDF
4. **about-committee** — Requires appointment order + photos
5. **about-scope** — Requires scope document
6. **about-goals** — Can reuse dashboard target data
7. **about-action-plan** — Requires action plan document
8. **about-feedback** — Can be implemented as static form/page

---

## Archive/Not Applicable

| Item | Reason |
|---|---|
| Operational data workbooks (Water, Electricity, etc.) | Internal metrics, not About content |
| Technical blueprint documents | Developer-facing, not public |
| Foundation/round reports | Project history, not Green Office operations |
| Dashboard decorative images | Functional for dashboard only |

---

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Signed policy not obtainable | Display draft policy with disclaimer |
| Committee photo not available | Use placeholder with text description |
| Certificate pending | Display "In Progress" status |
| Content in Thai only | Provide English summary where possible |

---

## Decision Log

1. **No About pages created in this sprint** — Content is missing, pages would be empty
2. **JSON schema prepared** — Ready for page creation when content arrives
3. **Missing content catalogued** — User has exact list of required documents
4. **No file moves/renames** — All existing files stay in place
5. **No CSS changes** — Pages will reuse existing design system