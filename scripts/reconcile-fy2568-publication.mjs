#!/usr/bin/env node
/**
 * reconcile-fy2568-publication.mjs
 * ================================
 * Make `src/data/fy2568-publication.json` describe EXACTLY what is published
 * under `public/documents/fy2568/` — no legacy alias entries, no phantom totals.
 *
 * Why this exists: the FY2568 manifest is the document-center contract. A file
 * removed from `public/` (e.g. the legacy `1.5_greenhousegass_update2.xlsx`
 * alias deleted in PR98) or a published file that was never registered leaves
 * the manifest claiming documents that 404 (or hiding documents that exist).
 *
 * Guarantees applied:
 *   1. Every manifest entry exists on disk; size + SHA-256 are recomputed and
 *      must match the file (byte-identity proof for the published copy).
 *   2. Every published file under each category is registered (no hidden extras).
 *   3. Per-category `count`/`bytes` and the manifest `total`/`totalBytes` are the
 *      arithmetic sums of the documents present — never hand-maintained.
 *   4. Canonical JSON (2-space indent, LF, single trailing newline) so the file
 *      round-trips byte-identically (asserted by test-fy2568-publication.mjs).
 *
 * Usage:
 *   node scripts/reconcile-fy2568-publication.mjs          # rewrite the manifest
 *   node scripts/reconcile-fy2568-publication.mjs --check   # exit 1 on drift, write nothing
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serializeJson, writeJsonFile } from './lib/serialize-json.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const PUB_ROOT = join(PROJECT_ROOT, 'public', 'documents', 'fy2568');
const MANIFEST_PATH = join(PROJECT_ROOT, 'src', 'data', 'fy2568-publication.json');

const CHECK_ONLY = process.argv.includes('--check');

function byCodeUnit(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function listFilesRecursive(dir, base, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => byCodeUnit(a.name, b.name))) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) listFilesRecursive(full, base, out);
    else if (entry.isFile()) out.push(full.slice(base.length + 1).split('\\').join('/'));
  }
  return out;
}

function sha256File(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

function docEntry(code, relPath) {
  const abs = join(PUB_ROOT, code, ...relPath.split('/'));
  if (!existsSync(abs)) return null;
  return {
    path: relPath,
    title: relPath.split('/').pop(),
    type: (relPath.split('.').pop() ?? '').toLowerCase(),
    sizeBytes: statSync(abs).size,
    sha256: sha256File(abs),
    url: `/documents/fy2568/${code}/${relPath.split('/').map(encodeURIComponent).join('/')}`,
  };
}

const existing = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
const categoryCodes = Object.keys(existing.categories);

const rebuilt = { version: existing.version, year: existing.year, categories: {} };
const dropped = [];
const added = [];

for (const code of categoryCodes) {
  const catDir = join(PUB_ROOT, code);
  if (!existsSync(catDir)) {
    console.error(`❌ published category directory missing: public/documents/fy2568/${code}`);
    process.exit(1);
  }
  const onDisk = listFilesRecursive(catDir, catDir).sort(byCodeUnit);
  const inManifest = new Map((existing.categories[code]?.documents ?? []).map((d) => [d.path, d]));

  const documents = onDisk.map((rel) => {
    const entry = docEntry(code, rel);
    if (!entry) return null;
    const previous = inManifest.get(rel);
    if (!previous) added.push(`${code}/${rel}`);
    else if (previous.sizeBytes !== entry.sizeBytes || previous.sha256 !== entry.sha256) {
      added.push(`${code}/${rel} (size/hash refreshed)`);
    }
    return entry;
  });
  if (documents.includes(null)) process.exit(1);

  for (const path of inManifest.keys()) {
    if (!onDisk.includes(path)) dropped.push(`${code}/${path}`);
  }

  rebuilt.categories[code] = {
    count: documents.length,
    bytes: documents.reduce((s, d) => s + d.sizeBytes, 0),
    documents,
  };
}

rebuilt.total = Object.values(rebuilt.categories).reduce((s, c) => s + c.count, 0);
rebuilt.totalBytes = Object.values(rebuilt.categories).reduce((s, c) => s + c.bytes, 0);

const before = serializeJson(existing);
const after = serializeJson(rebuilt);

if (before === after) {
  console.log(`✅ fy2568-publication.json already matches the published tree (${rebuilt.total} documents, ${rebuilt.totalBytes} bytes)`);
  process.exit(0);
}

if (CHECK_ONLY) {
  console.error('❌ fy2568-publication.json is out of sync with public/documents/fy2568/');
  if (dropped.length) console.error(`   • stale entries (no file on disk): ${dropped.join(', ')}`);
  if (added.length) console.error(`   • missing/refreshed entries: ${added.join(', ')}`);
  console.error(`   • declared total ${existing.total} → computed ${rebuilt.total}`);
  console.error('   → run: node scripts/reconcile-fy2568-publication.mjs');
  process.exit(1);
}

writeJsonFile(MANIFEST_PATH, rebuilt);
console.log(`✅ fy2568-publication.json reconciled: ${rebuilt.total} documents (${rebuilt.totalBytes} bytes)`);
if (dropped.length) console.log(`   • removed stale entries: ${dropped.join(', ')}`);
if (added.length) console.log(`   • registered published files: ${added.join(', ')}`);
