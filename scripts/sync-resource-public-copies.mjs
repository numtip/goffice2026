#!/usr/bin/env node
/**
 * Copy byte-identical resource workbooks from staging → public distribution paths.
 * Reads src/data/resource-source-files.json (never writes absolute OneDrive paths).
 */
import { readFileSync, copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MAP = JSON.parse(readFileSync(join(ROOT, 'src/data/resource-source-files.json'), 'utf8'));

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function publishRow(row) {
  const staging = join(ROOT, row.stagingPath);
  const publicAbs = join(ROOT, 'public', row.publicPath.replace(/^\//, '').split('?')[0]);
  if (!existsSync(staging)) throw new Error(`staging missing: ${row.stagingPath}`);
  mkdirSync(dirname(publicAbs), { recursive: true });
  copyFileSync(staging, publicAbs);
  const pubSha = sha256(publicAbs);
  if (pubSha !== row.sha256) {
    throw new Error(`${row.canonicalWorkbook}: public SHA ${pubSha} != expected ${row.sha256}`);
  }
  return publicAbs;
}

let count = 0;
for (const domain of MAP.domains) {
  publishRow({
    canonicalWorkbook: domain.canonicalWorkbook,
    stagingPath: domain.stagingPath,
    publicPath: domain.publicPath,
    sha256: domain.sha256,
  });
  count += 1;
  if (domain.currentYearWorkbook) {
    const cur = domain.currentYearWorkbook;
    publishRow({
      canonicalWorkbook: cur.canonicalWorkbook,
      stagingPath: cur.stagingPath,
      publicPath: cur.publicPath,
      sha256: cur.sha256,
    });
    count += 1;
  }
}
console.log(`✅ Published ${count} resource workbook(s) to public/`);
