# Context Pack: Green Office 2569

Use for category content, criteria alignment, and certification evidence planning.

## Seven Categories

| ID | Title |
|----|-------|
| cat1 | Energy Management |
| cat2 | Water Management |
| cat3 | Waste Management |
| cat4 | GHG Emissions |
| cat5 | Indoor Environmental Quality |
| cat6 | Transportation |
| cat7 | Innovation and Additional Features |

## Data Source

- **Canonical category data:** `src/data/categories.json`
  - Fields: `id`, `number`, `title`, `description`, `purpose`, `criteriaSummary[]`, `evidenceChecklist[]`, `score`
- **Criteria detail (stub):** `docs/KB/GREENOFFICE_2569_CRITERIA.md`
- **Full criteria PDF/text:** `doc/` and `2026 Green Office Assessment Criteria.MD` — chunk, do not paste wholesale

## Pages

- Index: `/categories`
- Detail: `/categories/{id}` via `[id].astro`
- Documents link: `/documents/{id}` → `public/documents/{id}/`

## Agent Rules

- Extend JSON before duplicating page copy
- Keep criteria summaries concise (bullet lists)
- Do not dump full 2569 criteria into prompts — link and chunk

## Related

- `docs/context-packs/EVIDENCE_CONTEXT.md`
- `docs/KB/GREENOFFICE_EVIDENCE_MODEL.md`
