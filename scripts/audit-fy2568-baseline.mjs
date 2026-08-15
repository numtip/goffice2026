/**
 * FY2568 baseline evidence audit.
 *
 * Reads ONLY a local evidence tree (the seven category directories) and emits
 * a SAFE aggregate JSON summary. The output intentionally contains no source
 * paths, filenames, document contents, URLs, or personal data — only numeric
 * aggregates.
 *
 * The source root is provided externally via:
 *   - the `GOFFICE_FY2568_SOURCE_ROOT` environment variable, or
 *   - the first command-line argument.
 * No local source path is hard-coded or defaulted.
 *
 * The seven category directories are discovered at runtime from the supplied
 * root by their trailing digit (1..7). Exactly one directory must map to each
 * digit. Discovered names are never printed.
 *
 * Aggregate fields:
 *   categories.<catN>.count      — file count for that category directory
 *   categories.<catN>.bytes      — total bytes for that category directory
 *   categories.<catN>.extensions — extension → count map (lowercased)
 *   total                       — sum of all category counts
 *   totalBytes                  — sum of all category bytes
 *   duplicateGroupCount         — number of SHA-256 hash groups containing >1 file
 *   unreadableCount             — files that could not be read (size/hash error)
 */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

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

/**
 * Discover the seven category directories from the supplied root by their
 * trailing ASCII digit (1..7). Throws if a digit is missing or duplicated.
 * Returns directory names ordered by digit; names are never printed.
 */
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
    if (!name) {
      throw new Error(`Missing source directory for digit ${i}`);
    }
    folders.push(name);
  }
  return folders;
}

const CATEGORY_FOLDERS = discoverCategoryFolders(DATA_ROOT);

function listFilesRecursive(dir) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listFilesRecursive(full));
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

function extensionOf(filePath) {
  const name = filePath.split(/[\\/]/).pop() ?? '';
  const dot = name.lastIndexOf('.');
  if (dot <= 0) return '';
  return name.slice(dot + 1).toLowerCase();
}

function sha256Of(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

const categories = {};
let total = 0;
let totalBytes = 0;
let unreadableCount = 0;
const hashGroups = new Map();

CATEGORY_FOLDERS.forEach((folderName, index) => {
  const code = `cat${index + 1}`;
  const files = listFilesRecursive(join(DATA_ROOT, folderName));
  const extensions = {};
  let bytes = 0;
  let count = 0;

  for (const filePath of files) {
    count += 1;
    const ext = extensionOf(filePath) || '(none)';
    extensions[ext] = (extensions[ext] ?? 0) + 1;

    try {
      const buf = readFileSync(filePath);
      bytes += buf.length;
      const hash = sha256Of(buf);
      if (!hashGroups.has(hash)) hashGroups.set(hash, []);
      hashGroups.get(hash).push(filePath);
    } catch {
      try {
        bytes += statSync(filePath).size;
      } catch {
        // ignored — unreadable for both content and size
      }
      unreadableCount += 1;
    }
  }

  categories[code] = { count, bytes, extensions };
  total += count;
  totalBytes += bytes;
});

let duplicateGroupCount = 0;
for (const files of hashGroups.values()) {
  if (files.length > 1) duplicateGroupCount += 1;
}

const result = {
  categories,
  total,
  totalBytes,
  duplicateGroupCount,
  unreadableCount,
};

process.stdout.write(JSON.stringify(result, null, 2) + '\n');
