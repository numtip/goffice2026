#!/usr/bin/env node
/**
 * verify-ghg-official-pdf.mjs
 * ===========================
 * Standalone reconciliation of the published FY2568 GHG values against the
 * OFFICIAL signed reporting form (1.5.2 (9-3-69).pdf).
 *
 * Two independent checks:
 *   1. the PDF on disk hashes to the pinned SHA-256 (the transcription cannot be
 *      moved to a different document without failing);
 *   2. when `pdftotext` is available the numbers are re-read from the PDF text
 *      layer and compared against the pin (10.85 / 201.48 / 19.29 / 231.62 and
 *      2.44 tCO2e/คน).
 *
 * Also asserts the scope invariant (scope1+scope2+scope3 === total) on both the
 * pin and the published contract.
 *
 * Usage: node scripts/verify-ghg-official-pdf.mjs   (npm run ghg:verify-official)
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  officialPdfPath,
  readOfficialGhgValues,
  reconcileOfficialPdfText,
  verifyOfficialPdfHash,
} from './lib/ghg-official.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const values = readOfficialGhgValues();
const { scope1, scope2, scope3, total } = values.official;
const errors = [];

console.log('=== FY2568 GHG official-form reconciliation ===');
console.log(`official form : ${values.source.ref}`);
console.log(`published at  : ${values.source.publicPath}`);
console.log(`pinned SHA-256: ${values.source.sha256}`);

const hash = verifyOfficialPdfHash(values);
errors.push(...hash.errors);
console.log(`PDF hash      : ${hash.ok ? 'MATCH ✅' : 'MISMATCH ❌'}`);
console.log(`file on disk  : ${officialPdfPath(values)}`);

const scopeSum = Math.round((scope1 + scope2 + scope3) * 100) / 100;
if (Math.abs(scopeSum - total) > 0.005) {
  errors.push(`scope invariant violated in the pin: ${scope1}+${scope2}+${scope3}=${scopeSum} != ${total}`);
}
console.log(`scope invariant: ${scope1} + ${scope2} + ${scope3} = ${scopeSum} (official total ${total})`);

const text = reconcileOfficialPdfText(values);
if (text.checked) {
  errors.push(...text.errors);
  console.log('text extraction: pdftotext — pinned lines all present ✅');
} else {
  console.log('text extraction: pdftotext unavailable — hash + pinned transcription only ℹ');
}

const contract = JSON.parse(readFileSync(join(ROOT, 'src/data/category1/ghg.json'), 'utf8'));
const inv = contract.records.find((r) => r.kind === 'inventory');
if (!inv) errors.push('category1/ghg.json has no inventory record');
else {
  const published = {
    scope1: inv.scope1TCO2e,
    scope2: inv.scope2TCO2e,
    scope3: inv.scope3TCO2e,
    total: inv.totalTCO2e,
    perCapitaKg: inv.perCapitaKgCO2e,
  };
  console.log(
    `published     : scope1 ${published.scope1} + scope2 ${published.scope2} + scope3 ${published.scope3} = ${published.total} tCO2e · ${published.perCapitaKg} kgCO2e/คน`,
  );
  for (const key of ['scope1', 'scope2', 'scope3', 'total']) {
    if (Math.abs(published[key] - values.official[key]) > 0.01) {
      errors.push(`published ${key} ${published[key]} != official ${values.official[key]}`);
    }
  }
  const publishedSum = Math.round((published.scope1 + published.scope2 + published.scope3) * 100) / 100;
  if (Math.abs(publishedSum - published.total) > 0.01) {
    errors.push(`published scope invariant violated: ${publishedSum} != ${published.total}`);
  }
}

console.log(
  `conflicts disclosed: workbook ${values.workbookCalculated.totalTCO2e} tCO2e (Δ${values.workbookCalculated.officialVsWorkbookDeltaTCO2e}) · narrative ${values.workbookCalculated.narrativeTotalTCO2e} tCO2e (Δ${values.workbookCalculated.narrativeVsTableDeltaTCO2e} vs workbook table) · superseded ${values.superseded.totalTCO2e} tCO2e`,
);

if (errors.length) {
  console.error('\n❌ official-form reconciliation failed:');
  for (const e of errors) console.error(`   • ${e}`);
  process.exit(1);
}
console.log('\n✅ official form, pin and published contract agree');
