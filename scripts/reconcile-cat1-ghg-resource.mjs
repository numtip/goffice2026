#!/usr/bin/env node
/** Sync category1/ghg.json FY2568 inventory/monthly rows from authoritative Resource workbook pipeline. */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ghgPath = join(ROOT, 'src/data/category1/ghg.json');
const generated = JSON.parse(readFileSync(join(ROOT, 'src/data/generated/ghg.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(join(ROOT, 'data/staging/manifest.json'), 'utf8'));
const ghg = JSON.parse(readFileSync(ghgPath, 'utf8'));

const SOURCE_REF = '1.6GreenHouseGas2025.xlsx';
const SOURCE_LOGICAL = '07-GreenOffice/Resource/1.6GreenHouseGas2025.xlsx';
const sha = manifest.files.find((f) => f.fileName === SOURCE_REF)?.sha256;

const y2568 = generated.years['2568'];
ghg.updated = '2026-09-10';
ghg.note =
  'FY2568 GHG baseline from authoritative OneDrive Resource workbook 1.6GreenHouseGas2025.xlsx (2026-09-10 PO policy). Totals from sheet สรุปการคำนวณ ปี 2568 row รวม (r25) via extract-workbook.mjs. Supersedes interim Data2568 copy 1.5_greenhousegass_update2.xlsx (222.68 tCO2e).';
ghg.sources = [
  { ref: SOURCE_REF, role: 'primary', inspection: 'content-verified', disposition: 'authoritative-resource-onedrive' },
  { ref: '1.5Green house gass/1.5.1 (9-3-69).pdf', role: 'supporting', inspection: 'content-verified' },
  { ref: '1.5Green house gass/1.5.2 (9-3-69).pdf', role: 'supporting', inspection: 'content-verified' },
];

for (const rec of ghg.records) {
  if (rec.sourceRef?.includes('greenhousegass_update2')) rec.sourceRef = SOURCE_REF;
}

const inv = ghg.records.find((r) => r.kind === 'inventory');
if (inv) {
  inv.totalTCO2e = y2568.total;
  inv.verification = {
    status: 'reviewed',
    basis: `Authoritative OneDrive Resource ${SOURCE_REF}; row รวม total ${y2568.total} tCO2e (12/12 months). SHA-256 ${sha}.`,
  };
}

for (const rec of ghg.records.filter((r) => r.kind === 'monthly')) {
  const m = y2568.months.find((x) => x.month === rec.month);
  if (m) rec.tCO2e = m.value;
}

const perf = ghg.records.find((r) => r.kind === 'performance');
if (perf) {
  perf.note = `FY2568 GHG total ${y2568.total} tCO2e from ${SOURCE_REF}; target reduction 1% — verify vs FY2567 in PO review.`;
}

const anomIdx = ghg.records.findIndex((r) => r.code === 'ANOM-NARRATIVE-STALE');
if (anomIdx >= 0) {
  ghg.records[anomIdx] = {
    id: 'ghg-anom-superseded-update2',
    year: 2568,
    indicatorCodes: ['1.5.1'],
    issueCodes: ['1.5'],
    categoryCode: 'cat1',
    evidenceIds: [],
    sourceRef: SOURCE_REF,
    verification: { status: 'reviewed', basis: 'OneDrive Resource authority reconciliation 2026-09-10.' },
    availability: 'content-verified',
    kind: 'anomaly',
    code: 'ANOM-SUPERSEDED-UPDATE2',
    reason:
      'Interim Data2568 workbook 1.5_greenhousegass_update2.xlsx (222.68 tCO2e) superseded by authoritative Resource 1.6GreenHouseGas2025.xlsx (231.23 tCO2e). Public download uses Resource distribution copy only.',
    status: 'documented',
  };
}

writeFileSync(ghgPath, JSON.stringify(ghg, null, 2) + '\n', 'utf8');
console.log(`✅ Reconciled ${ghgPath} → ${y2568.total} tCO2e from ${SOURCE_REF}`);
