#!/usr/bin/env node
/**
 * Validates publication-manifest.json ↔ on-disk public files ↔ resource-source-files.json
 */
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = JSON.parse(readFileSync(join(ROOT, 'src/data/publication-manifest.json'), 'utf8'));
const MAP = JSON.parse(readFileSync(join(ROOT, 'src/data/resource-source-files.json'), 'utf8'));
const EVIDENCE = JSON.parse(readFileSync(join(ROOT, 'src/data/evidence-index.json'), 'utf8')).items;
const LEAK = [/F:\\/i, /E:\\/i, /OneDrive - Maejo/i, /projectAi/i];

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

const errors = [];
const ids = new Set();

for (const rec of MANIFEST.records) {
  if (ids.has(rec.id)) errors.push(`duplicate manifest id: ${rec.id}`);
  ids.add(rec.id);

  for (const pat of LEAK) {
    const blob = JSON.stringify(rec);
    if (pat.test(blob)) errors.push(`${rec.id}: absolute path leak in manifest record`);
  }

  if (rec.publicationMode !== 'public-static') continue;
  if (!rec.publicPath) {
    errors.push(`${rec.id}: public-static without publicPath`);
    continue;
  }
  const abs = join(ROOT, 'public', rec.publicPath.replace(/^\//, ''));
  if (!existsSync(abs)) errors.push(`${rec.id}: missing public file ${rec.publicPath}`);
  else if (rec.sha256 && sha256(abs) !== rec.sha256) {
    errors.push(`${rec.id}: public SHA mismatch for ${rec.publicPath}`);
  }

  if (rec.evidenceId) {
    const ev = EVIDENCE.find((e) => e.id === rec.evidenceId);
    if (!ev) errors.push(`${rec.id}: evidence ${rec.evidenceId} missing`);
    else if (ev.publicationMode !== 'public-static') {
      errors.push(`${rec.evidenceId}: must be public-static`);
    } else if (ev.path !== rec.publicPath) {
      errors.push(`${rec.evidenceId}: evidence path ${ev.path} != manifest ${rec.publicPath}`);
    }
  }
}

for (const alias of MAP.staleAliasPaths) {
  const abs = join(ROOT, 'public', alias.replace(/^\//, ''));
  if (existsSync(abs)) errors.push(`stale alias still on disk: ${alias}`);
  const rendered = EVIDENCE.filter((e) => e.publicationMode === 'public-static' && e.path === alias);
  if (rendered.length) errors.push(`stale alias still public-static in evidence: ${alias}`);
}

const resourceIds = new Set(
  MAP.domains.flatMap((d) => [d.evidenceId, d.currentYearWorkbook?.evidenceId].filter(Boolean)),
);
for (const id of resourceIds) {
  const rows = MANIFEST.records.filter((r) => r.evidenceId === id && r.publicationMode === 'public-static');
  if (!rows.length) errors.push(`resource evidence ${id} missing from publication manifest`);
}

if (errors.length) {
  console.error('❌ publication manifest validation failed:\n' + errors.map((e) => `  • ${e}`).join('\n'));
  process.exit(1);
}
console.log(`✅ publication manifest OK (${MANIFEST.records.length} records, 0 duplicates, 0 leaks)`);
