# Context Pack: Evidence & Documents

Use for evidence library, document center, and placeholder content.

## Routes

| Route | File | Data |
|-------|------|------|
| `/evidence` | `src/pages/evidence.astro` | `src/data/evidence-index.json` |
| `/documents` | `src/pages/documents.astro` | `src/data/categories.json` |

## Evidence Index Schema

```json
{
  "items": [{
    "id": "string",
    "title": "string",
    "categoryId": "cat1",
    "type": "report|data|survey|project",
    "status": "available|pending|in-review",
    "path": "/documents/cat1/placeholder.md"
  }]
}
```

## Static Documents

- Location: `public/documents/cat1/` … `cat7/`
- Served as static files after build
- Placeholders are Markdown stubs for MVP

## Models (stubs)

- `docs/KB/GREENOFFICE_EVIDENCE_MODEL.md`
- `docs/KB/GREENOFFICE_CONTENT_MODEL.md`

## Constraints

- No upload pipeline or backend storage
- Evidence paths must match files under `public/documents/`

## Future

- Build-time search over evidence titles (see `/search` placeholder)
