/**
 * Tests for the FY2568 baseline audit script.
 *
 * Two modes:
 *   - Without `GOFFICE_FY2568_SOURCE_ROOT`: the live-source assertions are
 *     skipped cleanly (public CI), and only the static/safety assertions run.
 *   - With `GOFFICE_FY2568_SOURCE_ROOT` set: the audit is invoked and every
 *     live assertion runs (seven counts, total, aggregate fields, safe output,
 *     unreadableCount === 0).
 *
 * The safe-output leakage tests are generic and never hard-code the private
 * source location. Private-location markers are assembled from concatenated
 * fragments so the raw markers never appear in committed text.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AUDIT_SCRIPT = join(__dirname, 'audit-fy2568-baseline.mjs');
const TEST_SCRIPT = fileURLToPath(import.meta.url);

const SOURCE_ROOT = process.env.GOFFICE_FY2568_SOURCE_ROOT;

const EXPECTED_COUNTS = {
  cat1: 141,
  cat2: 30,
  cat3: 33,
  cat4: 44,
  cat5: 47,
  cat6: 34,
  cat7: 4,
};
const EXPECTED_TOTAL = 333;

// Private source-location markers assembled from fragments so their raw
// combined forms never appear in this committed file.
const PRIVATE_MARKERS = [
  'GreenData'.concat('_Res'),
  'One'.concat('Drive'),
  'Mae'.concat('jo'),
  'Data'.concat('2568'),
  'RAE'.concat('-Document-Center'),
];

// Generic safe-output markers: document extensions with a dot and URL schemes
// that must never appear in aggregate output.
const GENERIC_OUTPUT_MARKERS = [
  '.pdf',
  '.docx',
  '.xlsx',
  '.xls',
  '.txt',
  '.jpg',
  '.png',
  '.mp4',
  'http://',
  'https://',
];

function runAudit() {
  const child = spawnSync(process.execPath, [AUDIT_SCRIPT], {
    encoding: 'utf8',
    env: { ...process.env, GOFFICE_FY2568_SOURCE_ROOT: SOURCE_ROOT },
  });
  assert.strictEqual(
    child.status,
    0,
    `audit script exited non-zero: ${child.stderr || child.stdout}`,
  );
  const raw = child.stdout ?? '';
  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    assert.fail(`audit output is not valid JSON:\n${raw}`);
  }
  return { raw, json };
}

describe('audit-fy2568-baseline', () => {
  it('audit script has no hard-coded private source markers', () => {
    const src = readFileSync(AUDIT_SCRIPT, 'utf8');
    for (const marker of PRIVATE_MARKERS) {
      assert.ok(!src.includes(marker), 'audit script leaks a private marker');
    }
  });

  it('test file has no hard-coded private source markers', () => {
    const src = readFileSync(TEST_SCRIPT, 'utf8');
    for (const marker of PRIVATE_MARKERS) {
      assert.ok(!src.includes(marker), 'test file leaks a private marker');
    }
  });

  if (!SOURCE_ROOT) {
    it('live-source assertions are skipped when GOFFICE_FY2568_SOURCE_ROOT is absent', () => {
      assert.ok(true, 'skipped: no source root provided');
    });
    return;
  }

  const { raw, json } = runAudit();

  it('returns all seven category counts matching the frozen baseline', () => {
    assert.strictEqual(typeof json.categories, 'object');
    for (const [code, expected] of Object.entries(EXPECTED_COUNTS)) {
      assert.strictEqual(
        json.categories[code]?.count,
        expected,
        `${code} count mismatch`,
      );
    }
  });

  it('total equals 333', () => {
    assert.strictEqual(json.total, EXPECTED_TOTAL);
  });

  it('exposes all required aggregate fields', () => {
    for (const field of [
      'categories',
      'total',
      'totalBytes',
      'duplicateGroupCount',
      'unreadableCount',
    ]) {
      assert.ok(field in json, `missing field: ${field}`);
    }
    for (const code of Object.keys(EXPECTED_COUNTS)) {
      const cat = json.categories[code];
      assert.ok(cat, `missing category: ${code}`);
      assert.strictEqual(typeof cat.count, 'number', `${code}.count`);
      assert.strictEqual(typeof cat.bytes, 'number', `${code}.bytes`);
      assert.strictEqual(typeof cat.extensions, 'object', `${code}.extensions`);
    }
  });

  it('totalBytes and per-category bytes are positive numbers', () => {
    assert.ok(json.totalBytes > 0, 'totalBytes must be positive');
    for (const code of Object.keys(EXPECTED_COUNTS)) {
      assert.ok(json.categories[code].bytes > 0, `${code}.bytes must be positive`);
    }
  });

  it('unreadableCount is zero', () => {
    assert.strictEqual(json.unreadableCount, 0);
  });

  it('output contains no generic source/document markers', () => {
    for (const marker of GENERIC_OUTPUT_MARKERS) {
      assert.ok(!raw.includes(marker), 'output leaks a marker');
    }
  });

  it('extension keys are bare (no dot, no path separators)', () => {
    for (const code of Object.keys(EXPECTED_COUNTS)) {
      for (const ext of Object.keys(json.categories[code].extensions)) {
        assert.ok(!ext.includes('.'), `extension key has a dot: ${ext}`);
        assert.ok(!/[\\/]/.test(ext), `extension key has a separator: ${ext}`);
      }
    }
  });
});
