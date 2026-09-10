/**
 * ghg-official.mjs
 * ================
 * Reconciliation helpers for the OFFICIAL signed FY2568 GHG reporting form.
 *
 * The published Category 1 GHG values must be traceable to the official signed
 * form, not only to the working workbook. Two independent checks are provided:
 *
 *   1. Transcription pin — `src/data/category1/ghg-official-1.5.2-values.json`
 *      records the numbers plus the SHA-256 of the exact PDF they were read from.
 *      A changed/edited PDF breaks the hash and fails validation.
 *   2. Live text extraction — when `pdftotext` is available the numbers are read
 *      straight out of the PDF text layer again and compared to the pin. When the
 *      binary is missing (e.g. minimal CI images) the check reports `checked:false`
 *      instead of pretending to have verified anything.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const OFFICIAL_VALUES_PATH = join(ROOT, 'src/data/category1/ghg-official-1.5.2-values.json');

export function readOfficialGhgValues() {
  return JSON.parse(readFileSync(OFFICIAL_VALUES_PATH, 'utf8'));
}

/** Absolute path of the official PDF inside the published tree. */
export function officialPdfPath(values = readOfficialGhgValues()) {
  const rel = values.source.publicPath.replace(/^\//, '').split('/').map(decodeURIComponent);
  return join(ROOT, 'public', ...rel);
}

export function sha256File(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

/**
 * Verify the official PDF is the exact document the transcription was pinned to.
 * @returns {{ok: boolean, errors: string[]}}
 */
export function verifyOfficialPdfHash(values = readOfficialGhgValues()) {
  const errors = [];
  const pdf = officialPdfPath(values);
  if (!existsSync(pdf)) {
    errors.push(`official GHG PDF missing: public${values.source.publicPath}`);
    return { ok: false, errors };
  }
  const actual = sha256File(pdf);
  if (actual !== values.source.sha256) {
    errors.push(`official GHG PDF hash changed: ${actual} != pinned ${values.source.sha256}`);
  }
  return { ok: errors.length === 0, errors };
}

/**
 * Extract the official PDF text layer with pdftotext (layout mode).
 * @returns {{available: boolean, text: string|null}}
 */
export function extractOfficialPdfText(values = readOfficialGhgValues()) {
  const pdf = officialPdfPath(values);
  const probe = spawnSync('pdftotext', ['-v'], { encoding: 'utf8' });
  if (probe.error || probe.status === null) return { available: false, text: null };
  const out = spawnSync('pdftotext', ['-layout', pdf, '-'], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  if (out.status !== 0 || !out.stdout) return { available: false, text: null };
  return { available: true, text: out.stdout };
}

/**
 * Reconcile the pinned numbers against the live PDF text layer.
 * @returns {{checked: boolean, missing: string[], errors: string[]}}
 */
export function reconcileOfficialPdfText(values = readOfficialGhgValues()) {
  const { available, text } = extractOfficialPdfText(values);
  if (!available) return { checked: false, missing: [], errors: [] };

  const errors = [];
  const missing = [];
  const normalise = (s) => s.replace(/\s+/g, ' ').trim();
  const flat = normalise(text);
  for (const [key, snippet] of Object.entries(values.source.extractedLines)) {
    if (!flat.includes(normalise(snippet))) {
      missing.push(key);
      errors.push(`official GHG PDF text no longer contains the pinned ${key} line: "${normalise(snippet)}"`);
    }
  }
  return { checked: true, missing, errors };
}
