/**
 * test-no-internal-path-leak.mjs
 * ==============================
 * Blocks internal path leakage in PUBLISHABLE data/docs.
 *
 * Fails on:
 *   - Windows drive paths (e.g. `E:\...`, `G:\ProjectAI\...`, `E:/...`)
 *   - `OneDrive - Maejo university` anywhere in publishable data/docs
 *
 * Scope = publishable/shipped artifacts only:
 *   - src/data (site data incl. generated JSON + provenance registries)
 *   - data JSON (staging manifests/registries; source binaries excluded)
 *   - public (static published assets)
 *   - docs/audit and the FY2569 audit report docs
 *
 * Operational tooling (scripts/*) is intentionally out of scope — those are
 * not published; their runtime default source path is a tool concern.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const SCOPES = [
  join(ROOT, 'src', 'data'),
  join(ROOT, 'data'),
  join(ROOT, 'public'),
  join(ROOT, 'docs', 'audit'),
];

const EXTRA_FILES = [
  join(ROOT, 'docs', 'reports', 'GOFFICE2026_FY2569_CAT1_CAT7_SOURCE_AUDIT.md'),
  join(ROOT, 'docs', 'reports', 'GOFFICE2026_FY2569_RESOURCE_DELTA_AUDIT.md'),
];

const TEXT_EXTENSIONS = new Set(['.json', '.md', '.csv', '.ts', '.astro']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.astro']);

// Windows drive path: `C:\...` (backslash) or `C:/...` when NOT part of a URL
// scheme like `https://` (the `s:` in `https:` must not match).
const WINDOWS_DRIVE_BACKSLASH = /[A-Za-z]:\\/g;
const WINDOWS_DRIVE_FORWARD = /(?<![A-Za-z])[A-Za-z]:\//g;
const ONEDRIVE_MAEJO = /OneDrive - Maejo university/g;

function collectFiles() {
  const files = [];
  const walk = (dir) => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (SKIP_DIRS.has(entry.name)) continue;
      const p = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(p);
      } else if (TEXT_EXTENSIONS.has(extname(p))) {
        files.push(p);
      }
    }
  };
  for (const scope of SCOPES) walk(scope);
  for (const f of EXTRA_FILES) {
    if (existsSync(f)) files.push(f);
  }
  return files;
}

function findLeaks(file, patterns) {
  const text = readFileSync(file, 'utf8');
  const hits = [];
  for (const re of patterns) {
    for (const m of text.matchAll(re)) {
      const line = text.slice(0, m.index).split('\n').length;
      hits.push({ pattern: re.source, line, sample: text.slice(Math.max(0, m.index - 40), m.index + 40).replace(/\n/g, '\\n') });
    }
  }
  return hits;
}

describe('publishable data/docs must not leak internal paths', () => {
  const files = collectFiles();
  it('scope contains files to check', () => {
    assert.ok(files.length > 30, `expected a meaningful set of files, got ${files.length}`);
  });

  it('no Windows drive paths (backslash or forward slash)', () => {
    const violations = [];
    for (const file of files) {
      const hits = findLeaks(file, [WINDOWS_DRIVE_BACKSLASH, WINDOWS_DRIVE_FORWARD]);
      for (const h of hits) violations.push(`${relative(ROOT, file)}:${h.line} ${h.sample}`);
    }
    assert.deepEqual(violations, [], 'Windows drive paths must not appear in publishable data/docs');
  });

  it('no "OneDrive - Maejo university" path fragments', () => {
    const violations = [];
    for (const file of files) {
      const hits = findLeaks(file, [ONEDRIVE_MAEJO]);
      for (const h of hits) violations.push(`${relative(ROOT, file)}:${h.line} ${h.sample}`);
    }
    assert.deepEqual(violations, [], '"OneDrive - Maejo university" must not appear in publishable data/docs');
  });

  it('FY2569 provenance registry uses sourceId + artifactPath, never sourcePath', () => {
    const registryPath = join(ROOT, 'src', 'data', 'audit', 'fy2569-dataset-provenance.json');
    const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
    assert.ok(Array.isArray(registry) && registry.length > 0);
    for (const record of registry) {
      assert.ok(!('sourcePath' in record), `${record.id} must not carry an absolute sourcePath`);
      assert.ok('sourceId' in record, `${record.id} must carry a safe sourceId`);
      assert.ok(record.sourceSha256, `${record.id} must carry SHA-256`);
      assert.ok(record.verificationState, `${record.id} must carry a verification state`);
    }
  });
});
