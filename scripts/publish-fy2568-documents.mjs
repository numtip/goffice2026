/**
 * Publish the FY2568 evidence documents into the Astro static site.
 *
 * Reads the local evidence tree (source root via `GOFFICE_FY2568_SOURCE_ROOT`
 * or the first CLI argument) and creates a byte-identical static copy under
 * `public/documents/fy2568/catN/` (preserving the original relative structure
 * and filenames). The source tree is never modified.
 *
 * Also writes a deterministic manifest `src/data/fy2568-publication.json`
 * listing every published document with its original title, type, size, and
 * SHA-256 (byte-identity proof), plus per-category counts/bytes and totals.
 * The manifest is fully deterministic: sorted by path, no timestamps.
 *
 * Published URLs are percent-encoded static paths served from `public/`.
 */
import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeJsonFile } from './lib/serialize-json.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const DEST_ROOT = join(PROJECT_ROOT, 'public', 'documents', 'fy2568');
const MANIFEST_PATH = join(PROJECT_ROOT, 'src', 'data', 'fy2568-publication.json');

function byCodeUnit(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function resolveSourceRoot() {
  const fromArg = process.argv[2];
  const fromEnv = process.env.GOFFICE_FY2568_SOURCE_ROOT;
  const root = fromArg || fromEnv;
  if (!root) {
    throw new Error(
      'Missing source root. Set GOFFICE_FY2568_SOURCE_ROOT or pass it as the first argument.',
    );
  }
  return root;
}

const DATA_ROOT = resolveSourceRoot();

function discoverCategoryFolders(root) {
  let entries;
  try {
    entries = readdirSync(root, { withFileTypes: true });
  } catch (err) {
    throw new Error(`Cannot read source root: ${err.message}`);
  }
  const byDigit = new Map();
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const match = /([1-7])$/.exec(entry.name);
    if (!match) continue;
    const digit = match[1];
    if (byDigit.has(digit)) {
      throw new Error(`Duplicate source directory maps to digit ${digit}`);
    }
    byDigit.set(digit, entry.name);
  }
  const folders = [];
  for (let i = 1; i <= 7; i += 1) {
    const name = byDigit.get(String(i));
    if (!name) throw new Error(`Missing source directory for digit ${i}`);
    folders.push(name);
  }
  return folders;
}

function collectFiles(dir, base, out) {
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => byCodeUnit(a.name, b.name))) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(full, base, out);
    } else if (entry.isFile()) {
      out.push(relative(base, full).split('\\').join('/'));
    }
  }
  return out;
}

function extensionOf(relPath) {
  const name = relPath.split('/').pop() ?? '';
  const dot = name.lastIndexOf('.');
  if (dot <= 0) return '(none)';
  return name.slice(dot + 1).toLowerCase();
}

function encodeUrlPath(relPath) {
  return relPath.split('/').map(encodeURIComponent).join('/');
}

const categories = {};
let total = 0;
let totalBytes = 0;

const folders = discoverCategoryFolders(DATA_ROOT);
folders.forEach((folderName, index) => {
  const code = `cat${index + 1}`;
  const srcDir = join(DATA_ROOT, folderName);
  const rels = collectFiles(srcDir, srcDir, []).sort(byCodeUnit);
  const documents = [];
  let catBytes = 0;

  for (const rel of rels) {
    const srcFile = join(srcDir, rel);
    const destFile = join(DEST_ROOT, code, rel);
    const sizeBytes = statSync(srcFile).size;
    const sha256 = createHash('sha256').update(readFileSync(srcFile)).digest('hex');
    mkdirSync(dirname(destFile), { recursive: true });
    copyFileSync(srcFile, destFile);

    documents.push({
      path: rel,
      title: rel.split('/').pop(),
      type: extensionOf(rel),
      sizeBytes,
      sha256,
      url: `/documents/fy2568/${code}/${encodeUrlPath(rel)}`,
    });
    catBytes += sizeBytes;
  }

  documents.sort((a, b) => byCodeUnit(a.path, b.path));
  categories[code] = { count: documents.length, bytes: catBytes, documents };
  total += documents.length;
  totalBytes += catBytes;
});

const manifest = {
  version: 1,
  year: 2568,
  categories,
  total,
  totalBytes,
};

writeJsonFile(MANIFEST_PATH, manifest);
console.log(`Published ${total} files / ${totalBytes} bytes under ${DEST_ROOT}`);
console.log(`Manifest written: ${MANIFEST_PATH}`);
