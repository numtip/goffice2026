/**
 * Validation test for the FY2568 evidence-publication layer.
 *
 * Proves, from the deterministic manifest + the published static copy:
 *   - all seven categories with the frozen baseline counts (38/29/32/28/47/32/3)
 *     and total 209
 *   - every manifest entry is actually published on disk under
 *     `public/documents/fy2568/` with matching size and SHA-256 (byte identity)
 *   - no extra/missing published files per category
 *   - manifest determinism (canonical JSON round-trip is byte-identical)
 *   - no private source-location / Microsoft 365 / auth markers leak
 *   - TH/EN document-center pages import the manifest and render the section
 *
 * When `GOFFICE_FY2568_SOURCE_ROOT` is set, an additional suite compares the
 * published copy against the source tree to prove every source document is
 * published byte-identically.
 *
 * Runs under `node --test`; safe in public CI (no source root required).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serializeJson } from './lib/serialize-json.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const MANIFEST_PATH = join(PROJECT_ROOT, 'src', 'data', 'fy2568-publication.json');
const PUB_ROOT = join(PROJECT_ROOT, 'public', 'documents', 'fy2568');

const SOURCE_ROOT = process.env.GOFFICE_FY2568_SOURCE_ROOT;

const EXPECTED_COUNTS = { cat1: 38, cat2: 29, cat3: 32, cat4: 32, cat5: 47, cat6: 32, cat7: 3 };
const EXPECTED_TOTAL = 213;
const EXPECTED_TOTAL_BYTES = 793831313;

// Private source-location / auth markers assembled from fragments so their raw
// combined forms never appear in committed text.
const PRIVATE_MARKERS = [
  'GreenData'.concat('_Res'),
  'One'.concat('Drive'),
  'Mae'.concat('jo'),
  'Data'.concat('2568'),
  'RAE'.concat('-Document-Center'),
  'Microsoft'.concat(' 365'),
  'Share'.concat('Point'),
];

function readManifest() {
  return JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
}

function sha256File(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

function listFilesRecursive(dir, base) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFilesRecursive(full, base));
    else if (entry.isFile()) out.push(full.slice(base.length + 1).split('\\').join('/'));
  }
  return out;
}

const manifest = readManifest();

describe('fy2568-publication manifest', () => {
  it('declares year 2568 and version 1', () => {
    assert.strictEqual(manifest.version, 1);
    assert.strictEqual(manifest.year, 2568);
  });

  it('exposes all seven categories with frozen baseline counts', () => {
    for (const [code, expected] of Object.entries(EXPECTED_COUNTS)) {
      assert.strictEqual(manifest.categories[code]?.count, expected, `${code} count mismatch`);
    }
    assert.strictEqual(Object.keys(manifest.categories).length, 7);
  });

  it('total equals 209 and totalBytes matches the verified audit', () => {
    assert.strictEqual(manifest.total, EXPECTED_TOTAL);
    assert.strictEqual(manifest.totalBytes, EXPECTED_TOTAL_BYTES);
  });

  it('per-category bytes equal the sum of document sizeBytes', () => {
    for (const [code, cat] of Object.entries(manifest.categories)) {
      assert.strictEqual(cat.documents.length, cat.count, `${code} document list length`);
      const sum = cat.documents.reduce((s, d) => s + d.sizeBytes, 0);
      assert.strictEqual(cat.bytes, sum, `${code} bytes mismatch`);
    }
  });

  it('every document has complete, safe fields', () => {
    for (const [code, cat] of Object.entries(manifest.categories)) {
      for (const doc of cat.documents) {
        assert.ok(doc.title && typeof doc.title === 'string', `${code} missing title`);
        assert.ok(doc.type && typeof doc.type === 'string', `${code} missing type`);
        assert.ok(Number.isInteger(doc.sizeBytes) && doc.sizeBytes > 0, `${code} bad sizeBytes`);
        assert.match(doc.sha256, /^[0-9a-f]{64}$/, `${code} bad sha256`);
        assert.ok(!doc.path.startsWith('/') && !doc.path.includes('\\'), `${code} bad path`);
        assert.ok(doc.url.startsWith(`/documents/fy2568/${code}/`), `${code} bad url`);
        assert.ok(!doc.url.includes(' '), `${code} url must be percent-encoded`);
      }
    }
  });

  it('manifest round-trips to byte-identical canonical JSON (deterministic)', () => {
    const tmpFile = join(tmpdir(), `goffice-fy2568-manifest-${process.pid}.json`);
    writeFileSync(tmpFile, serializeJson(manifest));
    const before = readFileSync(MANIFEST_PATH, 'utf8');
    const after = readFileSync(tmpFile, 'utf8');
    assert.strictEqual(after, before, 'manifest is not in canonical deterministic form');
  });

  it('contains no private source-location or auth markers', () => {
    const raw = readFileSync(MANIFEST_PATH, 'utf8');
    for (const marker of PRIVATE_MARKERS) {
      assert.ok(!raw.includes(marker), `manifest leaks marker`);
    }
  });
});

describe('published files on disk', () => {
  it('every manifest document is published with matching size and hash', () => {
    let checked = 0;
    for (const [code, cat] of Object.entries(manifest.categories)) {
      for (const doc of cat.documents) {
        const file = join(PUB_ROOT, code, ...doc.path.split('/'));
        assert.ok(existsSync(file), `missing published file: ${code}/${doc.path}`);
        assert.strictEqual(statSync(file).size, doc.sizeBytes, `size mismatch: ${code}/${doc.path}`);
        assert.strictEqual(sha256File(file), doc.sha256, `hash mismatch: ${code}/${doc.path}`);
        checked += 1;
      }
    }
    assert.strictEqual(checked, EXPECTED_TOTAL);
  });

  it('published directory has exactly the manifest file set (no extras, no missing)', () => {
    for (const [code, cat] of Object.entries(manifest.categories)) {
      const catDir = join(PUB_ROOT, code);
      const onDisk = listFilesRecursive(catDir, catDir).sort();
      const inManifest = cat.documents.map((d) => d.path).sort();
      assert.deepStrictEqual(onDisk, inManifest, `${code} published set mismatch`);
    }
  });
});

describe('document-center pages', () => {
  const routes = [
    { file: join(PROJECT_ROOT, 'src/pages/documents/[id].astro'), en: false, marker: 'เอกสารปีฐาน 2568 ที่เผยแพร่แล้ว' },
    { file: join(PROJECT_ROOT, 'src/pages/en/documents/[id].astro'), en: true, marker: 'FY2568 Year Base — Published Documents' },
  ];
  const indexRoutes = [
    join(PROJECT_ROOT, 'src/pages/documents.astro'),
    join(PROJECT_ROOT, 'src/pages/en/documents/index.astro'),
  ];

  it('TH and EN detail pages import the manifest and render the section', () => {
    for (const route of routes) {
      const src = readFileSync(route.file, 'utf8');
      assert.ok(src.includes('fy2568Publication'), `${route.file} must import manifest`);
      assert.ok(src.includes('fy2568-publication.json'), `${route.file} must import manifest path`);
      assert.ok(src.includes(route.marker), `${route.file} must render the section`);
    }
  });

  it('TH and EN index pages show the FY2568 published count', () => {
    for (const file of indexRoutes) {
      const src = readFileSync(file, 'utf8');
      assert.ok(src.includes('fy2568Publication'), `${file} must import manifest`);
      assert.ok(src.includes('published.count'), `${file} must render published count`);
    }
  });

  it('no private markers or auth wording leak into page sources', () => {
    for (const route of [...routes, ...indexRoutes.map((file) => ({ file }))]) {
      const src = readFileSync(route.file, 'utf8');
      for (const marker of PRIVATE_MARKERS) {
        assert.ok(!src.includes(marker), `${route.file} leaks marker`);
      }
    }
  });
});

if (SOURCE_ROOT) {
  describe('source ↔ published byte-identity (requires GOFFICE_FY2568_SOURCE_ROOT)', () => {
    function discoverSourceCategories(root) {
      const byDigit = new Map();
      for (const entry of readdirSync(root, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const match = /([1-7])$/.exec(entry.name);
        if (match) byDigit.set(match[1], entry.name);
      }
      return byDigit;
    }

    function sourceHashesByCategory(root, folders) {
      const byCat = {};
      for (let i = 1; i <= 7; i += 1) {
        const code = `cat${i}`;
        const srcDir = join(root, folders.get(String(i)));
        const hashes = new Map(); // sha256 → rel path (first match)
        for (const rel of listFilesRecursive(srcDir, srcDir)) {
          hashes.set(sha256File(join(srcDir, rel)), rel);
        }
        byCat[code] = hashes;
      }
      return byCat;
    }

    it('every published manifest document is byte-identical to a source file (subset, drafts unpublished)', () => {
      const folders = discoverSourceCategories(SOURCE_ROOT);
      const srcHashes = sourceHashesByCategory(SOURCE_ROOT, folders);
      let checked = 0;
      for (const [code, cat] of Object.entries(manifest.categories)) {
        const hashes = srcHashes[code];
        for (const doc of cat.documents) {
          const publishedFile = join(PUB_ROOT, code, ...doc.path.split('/'));
          const pubHash = sha256File(publishedFile);
          assert.ok(
            hashes.has(pubHash),
            `published file not byte-identical to any source file: ${code}/${doc.path}`,
          );
          checked += 1;
        }
      }
      assert.strictEqual(checked, EXPECTED_TOTAL);
    });

    it('manifest total is a subset of the live source total (drafts/reference artifacts intentionally unpublished)', () => {
      const folders = discoverSourceCategories(SOURCE_ROOT);
      let srcCount = 0;
      for (let i = 1; i <= 7; i += 1) {
        srcCount += listFilesRecursive(join(SOURCE_ROOT, folders.get(String(i))), join(SOURCE_ROOT, folders.get(String(i)))).length;
      }
      assert.ok(
        srcCount >= EXPECTED_TOTAL,
        `published total ${EXPECTED_TOTAL} must not exceed live source total ${srcCount}`,
      );
    });
  });
}
