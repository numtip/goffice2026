#!/usr/bin/env node
/**
 * Build src/data/publication-manifest.json from resource-source-files.json
 * (+ FY2569 form inventory stub).
 *
 * Deterministic by construction: the `updated` field mirrors
 * resource-source-files.json (never `new Date()`), so a test/CI run cannot rewrite
 * a tracked file just because the calendar moved.
 *
 * Usage:
 *   node scripts/generate-publication-manifest.mjs           # write the manifest
 *   node scripts/generate-publication-manifest.mjs --check    # verify only, exit 1 on drift
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serializeJson } from './lib/serialize-json.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST_PATH = join(ROOT, 'src/data/publication-manifest.json');
const CHECK_ONLY = process.argv.includes('--check');
const MAP = JSON.parse(readFileSync(join(ROOT, 'src/data/resource-source-files.json'), 'utf8'));
const FY2569_INV = join(ROOT, 'src/data/fy2569-form-inventory.json');

const records = [];

function pushResourceRow(domain, row, years, evidenceId, indicatorCodes, categoryCode) {
  for (const year of years) {
    records.push({
      id: `pub-resource:${domain.metric}:${year}`,
      year,
      category: categoryCode ?? null,
      issue: null,
      indicatorCodes,
      originalFilename: row.canonicalWorkbook,
      sourceRelativePath: row.sourceRelativePath ?? domain.sourceRelativePath,
      sha256: row.sha256,
      publicPath: row.publicPath,
      fileType: 'XLSX',
      publicationMode: 'public-static',
      sourceAuthority: 'OneDrive',
      sourceRootLogical: 'Resource',
      evidenceId,
      mappingStatus: 'mapped',
    });
  }
}

for (const domain of MAP.domains) {
  const cat =
    domain.metric === 'ghg' || domain.metric === 'paper'
      ? 'cat1'
      : domain.metric === 'waste'
        ? 'cat4'
        : 'cat3';
  pushResourceRow(
    domain,
    {
      canonicalWorkbook: domain.canonicalWorkbook,
      sourceRelativePath: domain.sourceRelativePath,
      sha256: domain.sha256,
      publicPath: domain.publicPath,
    },
    domain.yearsCovered,
    domain.evidenceId,
    domain.indicatorCodes,
    cat,
  );
  if (domain.currentYearWorkbook) {
    const cur = domain.currentYearWorkbook;
    pushResourceRow(
      domain,
      {
        canonicalWorkbook: cur.canonicalWorkbook,
        sourceRelativePath: cur.sourceRelativePath,
        sha256: cur.sha256,
        publicPath: cur.publicPath,
      },
      cur.yearsCovered,
      cur.evidenceId,
      domain.indicatorCodes,
      cat,
    );
  }
}

let fy2569Forms = [];
try {
  const inv = JSON.parse(readFileSync(FY2569_INV, 'utf8'));
  fy2569Forms = (inv.forms ?? []).filter((f) => f.publicationMode === 'public-static');
  for (const form of fy2569Forms) {
    records.push({
      id: form.id,
      year: 2569,
      category: form.category,
      issue: form.issue ?? null,
      indicatorCodes: form.indicatorCodes ?? [],
      originalFilename: form.originalFilename,
      sourceRelativePath: form.sourceRelativePath,
      sha256: form.sha256 ?? null,
      publicPath: form.publicPath ?? null,
      fileType: form.fileType,
      publicationMode: form.publicationMode,
      sourceAuthority: 'OneDrive',
      sourceRootLogical: 'Data2569',
      evidenceId: form.evidenceId ?? null,
      mappingStatus: form.mappingStatus ?? 'NEEDS_MAPPING',
    });
  }
} catch {
  /* inventory optional until Phase 2 follow-up PR */
}

const manifest = {
  version: '1.0.0',
  // Deterministic: mirrors the source map's `updated` date instead of today's
  // clock, so `--check` never reports drift merely because a day passed.
  updated: MAP.updated,
  note:
    'Canonical publication records for PO-approved public-static sources. OneDrive Resource and Data2569 are authoritative; staging/public are distribution copies only. Never store absolute Windows drive paths in public metadata.',
  records,
};

const serialized = serializeJson(manifest);
const current = (() => {
  try {
    return readFileSync(MANIFEST_PATH, 'utf8');
  } catch {
    return null;
  }
})();

if (current === serialized) {
  console.log(`✅ publication-manifest.json already current — ${records.length} record(s) (${fy2569Forms.length} FY2569 forms)`);
  process.exit(0);
}

if (CHECK_ONLY) {
  console.error('❌ src/data/publication-manifest.json is out of date with resource-source-files.json');
  console.error(`   generated ${records.length} record(s); committed file differs (updated field or records).`);
  console.error('   → run: node scripts/generate-publication-manifest.mjs');
  process.exit(1);
}

writeFileSync(MANIFEST_PATH, serialized, 'utf8');
console.log(`✅ publication-manifest.json — ${records.length} record(s) (${fy2569Forms.length} FY2569 forms)`);
