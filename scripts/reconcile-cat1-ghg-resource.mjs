#!/usr/bin/env node
/**
 * reconcile-cat1-ghg-resource.mjs
 * ===============================
 * Sync src/data/category1/ghg.json FY2568 records from the two authoritative
 * inputs, keeping official and calculated values SEPARATE and DISCLOSED:
 *
 *   • Official signed form  1.5.2 (9-3-69).pdf → canonical reported scopes/total
 *                          (10.85 / 201.48 / 19.29 = 231.62 tCO2e, 2.44 tCO2e/คน)
 *   • Resource workbook     1.6GreenHouseGas2025.xlsx → 12/12 monthly series and
 *                          workbook-calculated total 231.23 tCO2e
 *
 * Never silently reconciles the conflicts: the narrative cell (221.65), the
 * workbook-vs-official delta (0.39) and the per-capita basis delta (4 kg) are all
 * written as explicit `kind: "anomaly"` disclosure records, and the scope
 * invariant (scope1 + scope2 + scope3 === total) is enforced here as well as in
 * scripts/validate-category1-contracts.mjs.
 *
 * Usage: node scripts/reconcile-cat1-ghg-resource.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readOfficialGhgValues } from './lib/ghg-official.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ghgPath = join(ROOT, 'src/data/category1/ghg.json');
const generated = JSON.parse(readFileSync(join(ROOT, 'src/data/generated/ghg.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(join(ROOT, 'data/staging/manifest.json'), 'utf8'));
const ghg = JSON.parse(readFileSync(ghgPath, 'utf8'));
const official = readOfficialGhgValues();

const SOURCE_REF = official.workbookCalculated.ref;
const OFFICIAL_REF = official.source.ref;
const SOURCE_LOGICAL = `07-GreenOffice/Resource/${SOURCE_REF}`;
const sha = manifest.files.find((f) => f.fileName === SOURCE_REF)?.sha256;

const { scope1, scope2, scope3, total } = official.official;
const wb = official.workbookCalculated;

if (Math.abs(scope1 + scope2 + scope3 - total) > 0.005) {
  throw new Error(`scope invariant violated in ${official.source.ref}: ${scope1}+${scope2}+${scope3} != ${total}`);
}

const y2568 = generated.years['2568'];
ghg.updated = '2026-09-10';
ghg.note =
  `FY2568 GHG canonical values follow the OFFICIAL signed form ${OFFICIAL_REF}: ` +
  `Scope1 ${scope1} + Scope2 ${scope2} + Scope3 ${scope3} = ${total} tCO2e, ${official.official.perCapitaTCO2e} tCO2e/คน (official). ` +
  `The OneDrive Resource workbook ${SOURCE_REF} (${SOURCE_LOGICAL}) supplies the 12/12 monthly series and calculates ${wb.totalTCO2e} tCO2e ` +
  `(row ${wb.totalRow} column ${wb.totalColumn} = ${wb.totalKgCO2e} kgCO2e), i.e. Δ${wb.officialVsWorkbookDeltaTCO2e} tCO2e (${wb.officialVsWorkbookDeltaPct}%) below the official figure — disclosed, not silently reconciled. ` +
  `The workbook narrative cell still reads ${wb.narrativeTotalTCO2e} tCO2e (Δ${wb.narrativeVsTableDeltaTCO2e} vs its own table) and is not used. ` +
  `Superseded interim Data2568 workbook ${official.superseded.ref} (${official.superseded.totalTCO2e} tCO2e) is no longer published. ` +
  `Monthly values are workbook-calculated; the official annual total is the reported figure.`;
ghg.sources = [
  { ref: SOURCE_REF, role: 'primary', inspection: 'content-verified', disposition: 'authoritative-resource-onedrive' },
  { ref: OFFICIAL_REF, role: 'official-reported', inspection: 'content-verified', sha256: official.source.sha256 },
  { ref: '1.5Green house gass/1.5.1 (9-3-69).pdf', role: 'supporting', inspection: 'content-verified' },
];

for (const rec of ghg.records) {
  if (rec.sourceRef?.includes('greenhousegass_update2')) rec.sourceRef = SOURCE_REF;
}

const inv = ghg.records.find((r) => r.kind === 'inventory');
if (inv) {
  inv.totalTCO2e = total;
  inv.scope1TCO2e = scope1;
  inv.scope2TCO2e = scope2;
  inv.scope3TCO2e = scope3;
  inv.perCapitaKgCO2e = official.perCapita.canonicalKgCO2e;
  inv.sourceRef = OFFICIAL_REF;
  inv.verification = {
    status: 'reviewed',
    basis:
      `Canonical scopes/total read from the official signed form ${OFFICIAL_REF} (SHA-256 ${official.source.sha256}); ` +
      `scope invariant ${scope1}+${scope2}+${scope3}=${total} holds. Monthly series + calculated total ${wb.totalTCO2e} tCO2e from ${SOURCE_REF} (SHA-256 ${sha}). ` +
      `Official minus calculated = ${wb.officialVsWorkbookDeltaTCO2e} tCO2e (disclosed).`,
  };
}

for (const rec of ghg.records.filter((r) => r.kind === 'monthly')) {
  const m = y2568.months.find((x) => x.month === rec.month);
  if (m) rec.tCO2e = m.value;
}

const perf = ghg.records.find((r) => r.kind === 'performance');
if (perf) {
  perf.sourceRef = OFFICIAL_REF;
  perf.actualChangePct = 4.82;
  perf.note =
    `Official FY2568 reported total ${total} tCO2e (${OFFICIAL_REF}); workbook-calculated ${wb.totalTCO2e} tCO2e. ` +
    `Target reduction 1% — FY2567 comparison and target verdict pending PO review.`;
}

// ── Disclosure records (never silently reconciled) ────────────────────────────
const anomalyTemplate = (extra) => ({
  year: 2568,
  indicatorCodes: ['1.5.1'],
  issueCodes: ['1.5'],
  categoryCode: 'cat1',
  evidenceIds: [],
  verification: { status: 'reviewed', basis: 'OneDrive Resource + official form reconciliation 2026-09-10.' },
  availability: 'content-verified',
  kind: 'anomaly',
  status: 'documented',
  ...extra,
});

const DISCLOSURES = [
  anomalyTemplate({
    id: 'ghg-anom-official-vs-workbook',
    sourceRef: OFFICIAL_REF,
    code: 'ANOM-OFFICIAL-VS-WORKBOOK-0.39',
    reason:
      `Official signed form ${OFFICIAL_REF} reports ${total} tCO2e while the authoritative workbook ${SOURCE_REF} calculates ${wb.totalTCO2e} tCO2e ` +
      `from its 12/12 monthly table — Δ${wb.officialVsWorkbookDeltaTCO2e} tCO2e (${wb.officialVsWorkbookDeltaPct}%), concentrated in Scope 1 ` +
      `(official ${scope1} vs workbook ${wb.scope1}). Scope 2 and Scope 3 agree. ` +
      `The reported/canonical total follows the official form; the workbook figure stays visible and is never presented as the reported total.`,
  }),
  anomalyTemplate({
    id: 'ghg-anom-narrative-221-65',
    sourceRef: SOURCE_REF,
    code: 'ANOM-NARRATIVE-221-65',
    reason:
      `Workbook ${SOURCE_REF} narrative cell states "${wb.narrativeTotalTCO2e} tCO2e" while its own calculation table totals ${wb.totalTCO2e} tCO2e ` +
      `(Δ${wb.narrativeVsTableDeltaTCO2e} tCO2e). The narrative figure is stale text carried over from an earlier version and is NOT used for any published value. ` +
      `Disclosed verbatim for transparency.`,
  }),
  anomalyTemplate({
    id: 'ghg-anom-per-capita-basis',
    sourceRef: OFFICIAL_REF,
    code: 'ANOM-PER-CAPITA-BASIS',
    reason:
      `Published per-capita is ${official.perCapita.canonicalKgCO2e} kgCO2e/person (${official.perCapita.canonicalBasis}). ` +
      `The official form prints ${official.perCapita.officialFormTCO2e} tCO2e/person, which from the official total (÷95) is ~${official.perCapita.officialFormKgFromOfficialTotal} kg — ` +
      `Δ${official.perCapita.deltaKg} kg because per-capita is derived from the workbook-calculated total while the reported total follows the official form. PO to confirm the preferred basis.`,
  }),
  anomalyTemplate({
    id: 'ghg-anom-superseded-update2',
    sourceRef: SOURCE_REF,
    code: 'ANOM-SUPERSEDED-UPDATE2',
    reason:
      `Interim Data2568 workbook ${official.superseded.ref} (${official.superseded.totalTCO2e} tCO2e) superseded by the authoritative Resource workbook ${SOURCE_REF} (${wb.totalTCO2e} tCO2e). ` +
      `${official.superseded.disclosure} The legacy alias is removed from the FY2568 publication manifest and its public file deleted, so no published link points at it.`,
  }),
];

ghg.records = [
  ...ghg.records.filter((r) => r.kind !== 'anomaly'),
  ...DISCLOSURES,
];

writeFileSync(ghgPath, JSON.stringify(ghg, null, 2) + '\n', 'utf8');
console.log(
  `✅ Reconciled ${ghgPath}\n   official ${OFFICIAL_REF}: ${scope1}+${scope2}+${scope3}=${total} tCO2e\n   workbook ${SOURCE_REF}: ${wb.totalTCO2e} tCO2e (Δ${wb.officialVsWorkbookDeltaTCO2e})\n   disclosures: ${DISCLOSURES.map((d) => d.code).join(', ')}`,
);
