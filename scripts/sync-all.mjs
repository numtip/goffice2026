#!/usr/bin/env node
/**
 * sync-all.mjs — Phase 3 (GO-DATA-3) One-command Sync
 * ====================================================
 * Orchestrates the existing sync pipeline end-to-end, reusing the Phase 2
 * scripts without redesign:
 *
 *   OneDrive (read-only) → staging → change detection → extract → data build
 *   (import → validate → generate) → determinism
 *
 * Behavior:
 *   - Idempotent: when no meaningful change is detected (identical SHA-256 +
 *     canonical-range fingerprints + dataset states vs the previous manifest),
 *     extraction/build/regeneration are SKIPPED entirely. Exit 0.
 *   - Meaningful change: files copied or fingerprints/states changed → run the
 *     full extract → build → validate flow.
 *   - Validation failure stops BEFORE generation: `data-pipeline.mjs build`
 *     aborts (non-zero) if import or validation reports errors, so generated
 *     data is never rewritten/publishable from a failed run.
 *   - OneDrive is strictly read-only: only sync-workbooks.mjs copies files into
 *     the staging directory; nothing ever writes back to the source.
 *
 * Usage:
 *   node scripts/sync-all.mjs                          (default paths)
 *   node scripts/sync-all.mjs --source=<dir> --out=<dir> --manifest=<path>
 *   node scripts/sync-all.mjs --force                  (always run full flow)
 *
 * Exit codes: 0 = OK (synced or no-change) · 1 = change detected but
 * extract/build/validate failed (generated data NOT publishable).
 */

import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const DEFAULT_MANIFEST = join(PROJECT_ROOT, 'data', 'staging', 'manifest.json');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { source: null, out: null, manifest: null, force: false };
  for (const a of args) {
    if (!a.startsWith('--')) continue;
    const eq = a.indexOf('=');
    const key = eq === -1 ? a.slice(2) : a.slice(2, eq);
    const val = eq === -1 ? true : a.slice(eq + 1);
    if (key === 'source' || key === 'out' || key === 'manifest') opts[key] = String(val);
    else if (key === 'force') opts.force = true;
  }
  return opts;
}

function runNode(script, args, label) {
  const rel = join(PROJECT_ROOT, 'scripts', script);
  console.log(`\n───────── ${label} ─────────\n`);
  const res = spawnSync(process.execPath, [rel, ...args], { cwd: PROJECT_ROOT, stdio: 'inherit' });
  if (res.status !== 0) {
    console.error(`\n❌ ${label} failed (exit ${res.status ?? res.error?.message}).`);
    return false;
  }
  return true;
}

/** Meaningful-change signature: SHA-256 + canonical fingerprint + state per file. */
function changeSignature(manifestPath) {
  if (!existsSync(manifestPath)) return null; // first run — treat as change
  let m;
  try {
    m = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  } catch {
    return null;
  }
  if (!Array.isArray(m.files)) return null;
  return m.files
    .map((f) => [f.fileName, f.sha256, f.canonicalFingerprint, f.datasetState, (f.observedMonths || []).join(',')].join('::'))
    .sort()
    .join('|');
}

function main() {
  const opts = parseArgs();
  const manifestPath = opts.manifest || DEFAULT_MANIFEST;

  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  data:sync — One-command Sync (GO-DATA-3 Phase 3)    ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  if (opts.force) console.log('⚡ --force: full flow will run regardless of change detection.');

  // ── 1. Sync: OneDrive → staging (idempotent copy + fingerprint + states) ──
  const syncArgs = [];
  if (opts.source) syncArgs.push(`--source=${opts.source}`);
  if (opts.out) syncArgs.push(`--out=${opts.out}`);
  if (opts.manifest) syncArgs.push(`--manifest=${opts.manifest}`);

  const sigBefore = changeSignature(manifestPath);
  if (!runNode('sync-workbooks.mjs', syncArgs, '1/3 Sync — OneDrive → staging (read-only source)')) process.exit(1);
  const sigAfter = changeSignature(manifestPath);

  // ── 2. Change detection: skip regeneration when nothing meaningful changed ──
  const unchanged = !opts.force && sigBefore !== null && sigBefore === sigAfter;
  if (unchanged) {
    console.log('\n──────────────────────────────────────────────────────────');
    console.log('ℹ No meaningful change detected (SHA-256 + canonical fingerprints + states identical).');
    console.log('ℹ Skipping extraction/build/validate — no unnecessary regeneration. Idempotent run. ✅');
    console.log('──────────────────────────────────────────────────────────');
    return;
  }
  console.log('\nℹ Meaningful change detected — running full extract → build → validate.');

  // ── 3. Extract (display-aware) ──
  const extractArgs = [];
  if (opts.out) extractArgs.push(`--staging=${opts.out}`);
  if (!runNode('extract-workbook.mjs', extractArgs, '2/3 Extract — display-aware → CSV (missing months never zero)')) process.exit(1);

  // ── 4. Data build (import → validate → generate → determinism) ──
  // build aborts internally (non-zero) when import or validation reports errors,
  // BEFORE generateOutputs rewrites any publishable generated file.
  if (!runNode('data-pipeline.mjs', ['build'], '3/3 Build — import → validate → generate → determinism')) {
    console.error('\n❌ data:sync FAILED — validation/import errors. Generated data is NOT publishable.');
    process.exit(1);
  }

  console.log('\n✅ data:sync complete — generated data valid and publishable.');
}

main();
