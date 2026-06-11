# Token Savior Workflow

Adapted for Astro + Tailwind static platform from rae-nextjs-main patterns.

## Core Principle
Reduce token consumption by 70%+ through structured reuse and context management.

## Workflow Steps

### 1. Reuse Before Generate
- Search existing components in `src/components/`
- Check `docs/KB/` for existing documentation
- Look at `data/` for existing data structures
- Review `public/documents/` for evidence templates

### 2. Context Pack First
- Use files in `docs/context-packs/` for task context
- Each pack < 500 lines, focused on single domain
- Reference packs by name, don't inline content

### 3. Chunk Not Dump
- Large documents: split into `docs/KB/` atomic files
- Use `docs/architecture/DECISIONS.md` for decision log
- Link via relative paths, don't copy content

### 4. Skill First
- Check `.cursor/rules/` for applicable rules
- Use available skills before inventing workflows
- Document new patterns in `docs/KB/SKILLS_REGISTRY.md`

### 5. Build → QA → Commit
- `npm run build` must pass
- `npm run preview` for runtime verification
- Run QA checklists from `docs/runbooks/`
- Commit only after all checks pass

## Token Budget per Task
- Context packs: ~2000 tokens max
- Agent instructions: ~1000 tokens max
- Code changes: ~3000 tokens max

## Anti-Patterns to Avoid
- ❌ Pasting entire files into prompts
- ❌ Re-explaining known architecture
- ❌ Creating duplicate components
- ❌ Adding dependencies without justification
- ❌ Skipping QA for "simple" changes