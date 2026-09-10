#!/usr/bin/env node
/** Build src/data/publication-manifest.json from resource-source-files.json (+ FY2569 form inventory stub). */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
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
  updated: new Date().toISOString().slice(0, 10),
  note:
    'Canonical publication records for PO-approved public-static sources. OneDrive Resource and Data2569 are authoritative; staging/public are distribution copies only. Never store absolute Windows drive paths in public metadata.',
  records,
};

writeFileSync(join(ROOT, 'src/data/publication-manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(`✅ publication-manifest.json — ${records.length} record(s) (${fy2569Forms.length} FY2569 forms)`);
