#!/usr/bin/env node

/**
 * validate-search-index.mjs
 * ==========================
 * First-class quality gate for the canonical search index
 * (src/data/search-index.json), introduced by GO-SEARCH-1.
 *
 * Phase 1 — Structural checks:
 *   - top-level keys version / updated / note / items; version === "1.0.0"
 *   - per-item required fields:
 *       id        non-empty string, unique across all items
 *       section   one of about|dashboard|assessment|evidence|documents|
 *                 news|activities|knowledge
 *       type      non-empty string
 *       title     array of exactly 2 non-empty strings
 *       context   null OR array of exactly 2 strings — the generator contract
 *                 (generate-search-index.mjs) emits null for types without a
 *                 context (issues, documents), so null is structurally valid;
 *                 when present it must be exactly 2 strings
 *       keywords  array of exactly 2 strings
 *       route     string starting with '/'
 *       routeKind 'page' | 'file'
 *   - routeKind "file" → route starts with "/documents/" AND ends with a
 *     file extension (.pdf/.xlsx/.md)
 *   - routeKind "page" → route ends with '/' (canonical trailing slash)
 *   - optional fields: category ([2 strings] or null), year (number or null),
 *     fileType (string or null)
 *   - section coverage: every one of the 8 sections has >= 1 item
 *   - duplicates: no two items share (id); no two items share
 *     (section + type + title-en) — scoped to same type because the canonical
 *     taxonomy legitimately reuses English titles across levels (e.g. category
 *     cat4 "Waste Management" vs its issue 4.1 "Waste Management"), which is
 *     expected metadata, not a duplicate entry
 *
 * Phase 2 — Drift check:
 *   Regenerates the index by spawning `node scripts/generate-search-index.mjs
 *   --output <temp>` (the committed file is NEVER written by this validator)
 *   and deep-compares item-by-item (keyed by id) with the committed file.
 *   The top-level `updated` stamp is a generation timestamp, not content, so
 *   a differing stamp is reported informationally only and never fails the
 *   gate. Any other difference fails with a compact diff summary
 *   (changed-item count + first 3 changed ids).
 *
 * Usage: node scripts/validate-search-index.mjs
 * Exit code: 0 on full pass, 1 on any failure.
 */

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const INDEX_PATH = resolve(ROOT, 'src', 'data', 'search-index.json');
const GENERATOR = resolve(ROOT, 'scripts', 'generate-search-index.mjs');

const SECTIONS = [
  'about', 'dashboard', 'assessment', 'evidence',
  'documents', 'news', 'activities', 'knowledge',
];
const FILE_EXT_RE = /\.(pdf|xlsx|md)$/i;

const errors = [];
const push = (msg) => errors.push(msg);

function readIndex() {
  let raw;
  try {
    raw = readFileSync(INDEX_PATH, 'utf8');
  } catch (err) {
    console.error(`FATAL: cannot read ${INDEX_PATH}: ${err.message}`);
    process.exit(1);
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error(`FATAL: ${INDEX_PATH} is not valid JSON: ${err.message}`);
    process.exit(1);
  }
}

// ── Phase 1: Structural checks ──────────────────────────────

function checkTopLevel(index) {
  console.log('--- Phase 1: Structural checks ---');
  for (const key of ['version', 'updated', 'note', 'items']) {
    if (!(key in index)) push(`top-level key "${key}" missing`);
  }
  if (index.version !== '1.0.0') {
    push(`top-level version must be "1.0.0", got ${JSON.stringify(index.version)}`);
  }
  if (typeof index.updated !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(index.updated)) {
    push(`top-level updated must be an ISO date (YYYY-MM-DD), got ${JSON.stringify(index.updated)}`);
  }
  if (!Array.isArray(index.items)) {
    push('top-level items must be an array');
  }
}

function checkItems(items) {
  const seenIds = new Set();
  const seenSectionTypeTitle = new Set();
  items.forEach((it, i) => {
    const at = `item[${i}] (${it && typeof it === 'object' && typeof it.id === 'string' ? it.id : '?'})`;

    if (typeof it.id !== 'string' || it.id.trim() === '') {
      push(`${at}: id must be a non-empty string`);
    } else if (seenIds.has(it.id)) {
      push(`${at}: duplicate id "${it.id}"`);
    } else {
      seenIds.add(it.id);
    }

    if (!SECTIONS.includes(it.section)) {
      push(`${at}: section must be one of ${SECTIONS.join('|')}, got ${JSON.stringify(it.section)}`);
    }

    if (typeof it.type !== 'string' || it.type.trim() === '') {
      push(`${at}: type must be a non-empty string`);
    }

    if (!Array.isArray(it.title) || it.title.length !== 2 || !it.title.every((s) => typeof s === 'string' && s !== '')) {
      push(`${at}: title must be an array of exactly 2 non-empty strings`);
    } else {
      const key = `${it.section}|${it.type}|${it.title[1]}`;
      if (seenSectionTypeTitle.has(key)) {
        push(`${at}: duplicate (section + type + title-en) "${key}"`);
      } else {
        seenSectionTypeTitle.add(key);
      }
    }

    if (it.context !== null && (!Array.isArray(it.context) || it.context.length !== 2 || !it.context.every((s) => typeof s === 'string'))) {
      push(`${at}: context must be null or an array of exactly 2 strings`);
    }

    if (!Array.isArray(it.keywords) || it.keywords.length !== 2 || !it.keywords.every((s) => typeof s === 'string')) {
      push(`${at}: keywords must be an array of exactly 2 strings`);
    }

    if (typeof it.route !== 'string' || !it.route.startsWith('/')) {
      push(`${at}: route must be a string starting with "/", got ${JSON.stringify(it.route)}`);
    }

    if (it.routeKind === 'page') {
      if (typeof it.route === 'string' && !it.route.endsWith('/')) {
        push(`${at}: page route must end with "/" (canonical trailing slash), got ${JSON.stringify(it.route)}`);
      }
    } else if (it.routeKind === 'file') {
      if (typeof it.route === 'string') {
        if (!it.route.startsWith('/documents/')) {
          push(`${at}: file route must start with "/documents/", got ${JSON.stringify(it.route)}`);
        }
        if (!FILE_EXT_RE.test(it.route)) {
          push(`${at}: file route must end with a file extension (.pdf/.xlsx/.md), got ${JSON.stringify(it.route)}`);
        }
      }
    } else {
      push(`${at}: routeKind must be "page" or "file", got ${JSON.stringify(it.routeKind)}`);
    }

    if (it.category !== null && (!Array.isArray(it.category) || it.category.length !== 2 || !it.category.every((s) => typeof s === 'string'))) {
      push(`${at}: category must be null or an array of exactly 2 strings`);
    }

    if (it.year !== null && typeof it.year !== 'number') {
      push(`${at}: year must be null or a number, got ${JSON.stringify(it.year)}`);
    }

    if (it.fileType !== null && typeof it.fileType !== 'string') {
      push(`${at}: fileType must be null or a string, got ${JSON.stringify(it.fileType)}`);
    }
  });
}

function checkSectionCoverage(items) {
  const counts = {};
  for (const it of items) {
    counts[it.section] = (counts[it.section] || 0) + 1;
  }
  for (const s of SECTIONS) {
    if (!counts[s]) push(`section coverage: "${s}" has 0 items (every section needs >= 1)`);
  }
  return counts;
}

// ── Phase 2: Drift check ────────────────────────────────────

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (typeof a === 'object') {
    const ak = Object.keys(a).sort();
    const bk = Object.keys(b).sort();
    if (ak.length !== bk.length || !ak.every((k, i) => k === bk[i])) return false;
    return ak.every((k) => deepEqual(a[k], b[k]));
  }
  return false;
}

/** Regenerate to a temp file; returns the regenerated object or null on failure. */
function regenerateIndex() {
  console.log('\n--- Phase 2: Drift check (regenerated comparison) ---');
  const tmpDir = mkdtempSync(join(tmpdir(), 'go-search-index-'));
  try {
    const out = join(tmpDir, 'search-index.json');
    const stdout = execFileSync(process.execPath, [GENERATOR, '--output', out], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    console.log('Regenerated to a temp file (committed src/data/search-index.json untouched):');
    console.log(stdout.trim());
    return JSON.parse(readFileSync(out, 'utf8'));
  } catch (err) {
    const detail = (err.stderr || err.stdout || err.message || '').toString().trim();
    push(`drift: regeneration failed — ${detail}`);
    return null;
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
}

function compareDrift(committed, regenerated) {
  if (committed.version !== regenerated.version) {
    push(`drift: top-level version mismatch — committed ${JSON.stringify(committed.version)} vs regenerated ${JSON.stringify(regenerated.version)}`);
  }
  if (committed.note !== regenerated.note) {
    push(`drift: top-level note mismatch — committed ${JSON.stringify(committed.note)} vs regenerated ${JSON.stringify(regenerated.note)}`);
  }

  const committedItems = committed.items || [];
  const regeneratedItems = regenerated.items || [];
  const byId = (list) => new Map(list.map((i) => [i.id, i]));

  const committedById = byId(committedItems);
  const regeneratedById = byId(regeneratedItems);

  const changed = [];
  for (const [id, reg] of regeneratedById) {
    const com = committedById.get(id);
    if (!com || !deepEqual(com, reg)) changed.push(id);
  }
  for (const id of committedById.keys()) {
    if (!regeneratedById.has(id)) changed.push(id);
  }
  changed.sort();

  if (changed.length > 0) {
    const preview = changed.slice(0, 3).join(', ');
    const more = changed.length > 3 ? `, … (+${changed.length - 3} more)` : '';
    push(`drift: regenerated index differs from committed file — ${changed.length} item(s) changed: ${preview}${more}`);
  }

  const committedOrder = committedItems.map((i) => i.id).join('\n');
  const regeneratedOrder = regeneratedItems.map((i) => i.id).join('\n');
  if (committedOrder !== regeneratedOrder) {
    push('drift: item order differs from regenerated output (committed file was reordered by hand)');
  }

  if (committed.updated !== regenerated.updated) {
    console.log(`\nℹ  updated stamp differs — committed ${committed.updated} vs regenerated ${regenerated.updated}`);
    console.log('   (informational: generation timestamp, not content — run generate-search-index.mjs to refresh)');
  }
}

// ── Main ────────────────────────────────────────────────────

function main() {
  const index = readIndex();
  const items = Array.isArray(index.items) ? index.items : [];

  console.log('========================================');
  console.log('  SEARCH-INDEX METADATA VALIDATOR');
  console.log('========================================\n');

  checkTopLevel(index);
  const sectionCounts = checkSectionCoverage(items);
  checkItems(items);

  const regenerated = regenerateIndex();
  if (regenerated) compareDrift(index, regenerated);

  // ── Report ──────────────────────────────────────────────
  console.log('\n--- Summary ---');
  console.log(`Total items      : ${items.length}`);
  console.log(`Sections covered : ${SECTIONS.map((s) => `${s}=${sectionCounts[s] || 0}`).join(', ')}`);
  console.log(`Regeneration     : ${regenerated ? 'compared' : 'FAILED'}`);

  if (errors.length > 0) {
    console.log('\nFAILURES:');
    for (const e of errors) console.log(`  ✗ ${e}`);
    console.log(`\nVALIDATION: FAIL (${errors.length} issue(s))`);
    process.exit(1);
  }
  console.log('\nVALIDATION: PASS ✓');
}

main();
