#!/usr/bin/env node
/**
 * sync-workbooks.mjs — Phase 2 (GO-DATA-3)
 * ========================================
 * Idempotent OneDrive → staging sync with canonical-range fingerprinting
 * and datasetState derivation.
 *
 * Design:
 *   - Source (OneDrive) is strictly READ-ONLY. Files are copied to staging
 *     only when the SHA-256 differs from the staged copy (idempotent).
 *   - A canonical-range fingerprint (SHA-256 over (value, display, formula)
 *     of the FY2569 input range) is the "meaningful data change" signal.
 *     Formatting/metadata-only edits do NOT change the fingerprint.
 *   - Waste/GHG FY2569 workbooks were created by copying FY2568 templates.
 *     Their template baseline = canonical fingerprint of the FY2568 file.
 *     Fingerprint equal to baseline ⇒ no observations ⇒ WAITING_FOR_INPUT.
 *   - States: WAITING_FOR_INPUT / PUBLISHABLE_PARTIAL / COMPLETE /
 *     INVALID_SOURCE_DATA. Missing months (display '-') are never treated
 *     as zero.
 *
 * Usage:
 *   node scripts/sync-workbooks.mjs                        (default paths)
 *   node scripts/sync-workbooks.mjs --source=<dir> --out=<dir> --manifest=<path>
 *
 * Deterministic: no runtime timestamps are written to the manifest.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync, copyFileSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import * as XLSX from 'xlsx';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const DEFAULT_SOURCE = join('E:', 'OneDrive', 'Research', 'OneDrive - Maejo university', 'RAE-Document-Center', '07-GreenOffice', 'resource');
// Authoritative FY2568 GHG baseline lives under Data2568 (owner-replaced
// 2026-08-28) — not in Resource.
const DEFAULT_FY2568_GHG_SOURCE = join('E:', 'OneDrive', 'Research', 'OneDrive - Maejo university', 'RAE-Document-Center', '07-GreenOffice', 'Data2568', 'หมวด1', '1.5Green house gass', '1.5_greenhousegass_update2.xlsx');
const DEFAULT_OUT = join(PROJECT_ROOT, 'data', 'staging', 'source');
const DEFAULT_MANIFEST = join(PROJECT_ROOT, 'data', 'staging', 'manifest.json');

const THAI_MONTHS = { 'ม.ค.': 1, 'ก.พ.': 2, 'มี.ค.': 3, 'เม.ย.': 4, 'พ.ค.': 5, 'มิ.ย.': 6, 'ก.ค.': 7, 'ส.ค.': 8, 'ก.ย.': 9, 'ต.ค.': 10, 'พ.ย.': 11, 'ธ.ค.': 12 };

// ── Parser types & canonical FY2569 ranges (GO-DATA-3 §4) ────────────────────
const FILES = [
  { fileName: '1.1Water.xlsx',            metric: 'water',      yearBE: 2569, parser: 'col6' },
  { fileName: '1.2electric.xlsx',         metric: 'electricity', yearBE: 2569, parser: 'col6' },
  { fileName: '1.3Gassolene.xlsx',        metric: 'fuel',       yearBE: 2569, parser: 'col6' },
  { fileName: '1.4paper.xlsx',            metric: 'paper',      yearBE: 2569, parser: 'col6' },
  { fileName: '1.5waste2025.xlsx',        metric: 'waste',      yearBE: 2568, parser: 'waste' },
  { fileName: '1.5waste2026.xlsx',        metric: 'waste',      yearBE: 2569, parser: 'waste', templateOf: '1.5waste2025.xlsx' },
  // Authoritative FY2568 GHG baseline (owner-replaced 2026-08-28); source is
  // the Data2568 path, not Resource.
  { fileName: '1.5_greenhousegass_update2.xlsx', metric: 'ghg', yearBE: 2568, parser: 'ghg', sourceOverride: DEFAULT_FY2568_GHG_SOURCE },
  // Authoritative FY2569 GHG source (owner-replaced 2026-08-28).
  { fileName: '1.6GreenHouseGas2026_New.xlsx', metric: 'ghg',   yearBE: 2569, parser: 'ghg', templateOf: '1.5_greenhousegass_update2.xlsx' },
];

function sha256(filePath) {
  const h = createHash('sha256');
  h.update(readFileSync(filePath));
  return h.digest('hex');
}

function readWB(filePath) {
  return XLSX.read(readFileSync(filePath), { type: 'buffer', cellDates: false });
}

/** Display-aware cell read: formatted display (w) is authoritative. */
function displayOf(cell) {
  if (!cell) return '';
  if (cell.w !== undefined) return String(cell.w).trim();
  return String(cell.v ?? '').trim();
}

function isObserved(disp) {
  if (disp === '' || disp === '-') return false;
  const n = Number(disp.replace(/[, ]/g, ''));
  // Negative cached formula values (e.g. energy/water 2569 Aug) are corrupt —
  // not observed consumption.
  return !Number.isNaN(n) && n > 0;
}

// ── Canonical range extraction per parser ────────────────────────────────────

function col6Range(ws) {
  const cells = [];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: true });
  for (let r = 4; r <= 15; r++) {
    const m = THAI_MONTHS[String(rows[r]?.[0] ?? '').trim()];
    if (!m) continue;
    const cell = ws[XLSX.utils.encode_cell({ r, c: 6 })];
    cells.push({ addr: `r${r}c6`, v: cell?.v, w: displayOf(cell), f: cell?.f ?? '' });
  }
  return cells;
}

function wasteRange(ws) {
  const cells = [];
  for (let r = 3; r <= 18; r++) {
    for (let c = 1; c <= 12; c++) {
      const cell = ws[XLSX.utils.encode_cell({ r, c })];
      cells.push({ addr: `r${r}c${c}`, v: cell?.v, w: displayOf(cell), f: cell?.f ?? '' });
    }
  }
  return cells;
}

function ghgRange(wb) {
  const sn = wb.SheetNames.find((s) => s.includes('ปี 2569')) || wb.SheetNames.find((s) => s.includes('ปี 2568'));
  const ws = wb.Sheets[sn];
  const cells = [];
  for (let r = 7; r <= 24; r++) {
    for (let c = 6; c <= 28; c += 2) {
      const cell = ws[XLSX.utils.encode_cell({ r, c })];
      cells.push({ addr: `r${r}c${c}`, v: cell?.v, w: displayOf(cell), f: cell?.f ?? '' });
    }
  }
  return cells;
}

function rangeFor(parser, wb) {
  if (parser === 'col6') return col6Range(wb.Sheets['2569']);
  if (parser === 'waste') return wasteRange(wb.Sheets['ปริมาณขยะรายเดือน ']);
  if (parser === 'ghg') return ghgRange(wb);
  return [];
}

function fingerprint(cells) {
  const s = cells.map((c) => `${c.addr}=${JSON.stringify([c.v, c.w, c.f])}`).join('|');
  return createHash('sha256').update(s).digest('hex').slice(0, 16);
}

/** Observed month coverage per parser. Returns Set<month>. */
function observedMonths(parser, wb, fp, baselineFp) {
  // Waste/GHG FY2569 template copies: fingerprint == FY2568 baseline ⇒ 0 observations.
  if (baselineFp && fp === baselineFp) return new Set();

  const covered = new Set();
  if (parser === 'col6') {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets['2569'], { header: 1, defval: '', raw: true });
    for (let r = 4; r <= 15; r++) {
      const m = THAI_MONTHS[String(rows[r]?.[0] ?? '').trim()];
      if (!m) continue;
      const disp = displayOf(wb.Sheets['2569'][XLSX.utils.encode_cell({ r, c: 6 })]);
      if (isObserved(disp)) covered.add(m);
    }
  } else if (parser === 'waste') {
    const ws = wb.Sheets['ปริมาณขยะรายเดือน '];
    for (let c = 1; c <= 12; c++) {
      for (let r = 3; r <= 18; r++) {
        if (isObserved(displayOf(ws[XLSX.utils.encode_cell({ r, c })]))) { covered.add(c); break; }
      }
    }
  } else if (parser === 'ghg') {
    const sn = wb.SheetNames.find((s) => s.includes('ปี 2569')) || wb.SheetNames.find((s) => s.includes('ปี 2568'));
    const ws = wb.Sheets[sn];
    let monthIdx = 1;
    for (let c = 6; c <= 28; c += 2) {
      for (let r = 7; r <= 25; r++) {
        const v = parseFloat(String(displayOf(ws[XLSX.utils.encode_cell({ r, c })])).replace(/[, ]/g, ''));
        if (!Number.isNaN(v) && v > 0) { covered.add(monthIdx); break; }
      }
      monthIdx++;
    }
  }
  return covered;
}

function deriveState(monthCount) {
  if (monthCount === 0) return 'WAITING_FOR_INPUT';
  if (monthCount < 12) return 'PUBLISHABLE_PARTIAL';
  return 'COMPLETE';
}

// ── Main ─────────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {};
  for (const a of args) {
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq === -1) opts[a.slice(2)] = true;
      else opts[a.slice(2, eq)] = a.slice(eq + 1);
    }
  }
  return opts;
}

/** Repository-independent source label — never a local drive/OneDrive path. */
function safeSourceLabel(dir) {
  const marker = '07-GreenOffice\\';
  const idx = dir.indexOf(marker);
  if (idx !== -1) {
    return dir.slice(idx).replace(/\\/g, '/');
  }
  // Fallback: strip the drive prefix and any leading parent segments.
  return dir.replace(/^[A-Za-z]:[\\/]/i, '').replace(/\\/g, '/');
}

function main() {
  const opts = parseArgs();
  const sourceDir = opts.source || DEFAULT_SOURCE;
  const outDir = opts.out || DEFAULT_OUT;
  const manifestPath = opts.manifest || DEFAULT_MANIFEST;

  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  Sync Workbooks — OneDrive → Staging (GO-DATA-3)    ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`Source:   ${sourceDir}`);
  console.log(`Staging:  ${outDir}`);

  if (!existsSync(sourceDir)) {
    console.error(`❌ Source directory not found: ${sourceDir}`);
    process.exit(1);
  }
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const manifest = {
    version: '3.0.0',
    phase: 'PHASE2-SYNC',
    generated: '2026-08-07',
    // Provenance labels must never leak local drive/OneDrive paths into the
    // committed manifest. sourceRoot keeps the repository-independent relative
    // path under 07-GreenOffice; stagingRoot is repo-relative.
    sourceRoot: safeSourceLabel(sourceDir),
    stagingRoot: 'data/staging/source',
    readOnlyPolicy: 'Source folder strictly read-only. Files copied to staging only when SHA-256 differs.',
    datasetStates: {
      WAITING_FOR_INPUT: 'No FY2569 observations in canonical ranges (template untouched or formatting-only changes).',
      PUBLISHABLE_PARTIAL: '1-11 valid months observed in canonical ranges.',
      COMPLETE: 'All 12 required months observed and valid.',
      INVALID_SOURCE_DATA: 'Canonical range contains unparseable/inconsistent values.',
    },
    files: [],
  };

  let copied = 0;
  let changed = 0;
  let errors = 0;

  // Template baselines computed from the FY2568 files (self-consistent).
  const fpCache = {};
  const fpOf = (f) => {
    if (fpCache[f]) return fpCache[f];
    const wb = readWB(join(outDir, f));
    fpCache[f] = fingerprint(rangeFor(FILES.find((x) => x.fileName === f).parser, wb));
    return fpCache[f];
  };

  for (const spec of FILES) {
    const srcPath = spec.sourceOverride || join(sourceDir, spec.fileName);
    const outPath = join(outDir, spec.fileName);
    try {
      if (!existsSync(srcPath)) {
        console.error(`  ❌ ${spec.fileName}: missing in source`);
        errors++;
        continue;
      }
      const st = statSync(srcPath);
      const srcHash = sha256(srcPath);

      // Idempotent copy: only when absent or different.
      if (!existsSync(outPath) || sha256(outPath) !== srcHash) {
        copyFileSync(srcPath, outPath);
        copied++;
        changed++;
        console.log(`  ⤵ ${spec.fileName}: copied (staged)`);
      }

      const wb = readWB(outPath);
      const cells = rangeFor(spec.parser, wb);
      const fp = fingerprint(cells);
      const baselineFp = spec.templateOf ? fpOf(spec.templateOf) : null;
      const covered = observedMonths(spec.parser, wb, fp, baselineFp);
      const monthCount = covered.size;
      const state = deriveState(monthCount);

      if (fp !== fpCache[spec.fileName] && fpCache[spec.fileName]) {
        console.log(`  🔎 ${spec.fileName}: canonical-range fingerprint CHANGED (${fpCache[spec.fileName]} → ${fp})`);
      }
      fpCache[spec.fileName] = fp;

      manifest.files.push({
        fileName: spec.fileName,
        metric: spec.metric,
        yearBE: spec.yearBE,
        sha256: srcHash,
        sizeBytes: st.size,
        modifiedTime: st.mtime.toISOString(),
        canonicalFingerprint: fp,
        templateBaselineFingerprint: baselineFp,
        observedMonths: [...covered].sort((a, b) => a - b),
        monthCount,
        datasetState: state,
        status: state === 'INVALID_SOURCE_DATA' ? 'BLOCKED' : 'STAGED',
      });
      console.log(`  ✅ ${spec.fileName}: ${state} (${monthCount}/12 months observed)`);
    } catch (e) {
      console.error(`  ❌ ${spec.fileName}: ${e.message}`);
      errors++;
    }
  }

  manifest.summary = {
    totalFiles: FILES.length,
    copiedNow: copied,
    allStaged: errors === 0,
    states: FILES.reduce((acc, s) => {
      const f = manifest.files.find((x) => x.fileName === s.fileName);
      if (f) acc[f.datasetState] = (acc[f.datasetState] || 0) + 1;
      return acc;
    }, {}),
  };

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
  console.log(`\n📋 Manifest: ${manifestPath}`);
  console.log(`   Copied: ${copied} | Files: ${FILES.length} | Errors: ${errors}`);
  console.log(`   States: ${JSON.stringify(manifest.summary.states)}`);
  if (errors > 0) process.exit(1);
  console.log('✅ Sync complete (deterministic, idempotent).');
}

main();
