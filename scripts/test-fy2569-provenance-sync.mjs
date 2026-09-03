/**
 * test-fy2569-provenance-sync.mjs
 * ===============================
 * Assert fy2569-dataset-provenance.json ↔ generated JSON ↔ extract-sources ↔ manifest
 * stay consistent for dashboard metric records (SHA, coverage, extractionDate).
 *
 * Run: node --test scripts/test-fy2569-provenance-sync.mjs
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const METRIC_MAP = {
  energy: 'energy-2569',
  water: 'water-2569',
  fuel: 'fuel-2569',
  paper: 'paper-2569',
  waste: 'waste-2569',
  ghg: 'ghg-2569',
};

function readJson(rel) {
  return JSON.parse(readFileSync(join(ROOT, rel), 'utf-8'));
}

const registry = readJson('src/data/audit/fy2569-dataset-provenance.json');
const extractSources = readJson('data/staging/extract-sources.json');
const manifest = readJson('data/staging/manifest.json');

function manifestSha(workbook) {
      const entry = manifest.files?.find((f) => f.fileName === workbook);
  return entry?.sha256 ?? null;
}

function registryEntry(metricId) {
  return registry.find((r) => r.id === `metric:${metricId}` && r.fiscalYear === 2569);
}

describe('FY2569 provenance registry ↔ canonical artifacts', () => {
  for (const [metricId, extractKey] of Object.entries(METRIC_MAP)) {
    it(`${metricId}: SHA, coverage, extractionDate match generated + extract-sources + manifest`, () => {
      const generated = readJson(`src/data/generated/${metricId}.json`);
      const y2569 = generated.years['2569'];
      const prov = y2569.provenance;
      const reg = registryEntry(metricId);
      const ext = extractSources[extractKey];

      assert.ok(reg, `registry metric:${metricId}`);
      assert.ok(ext, `extract-sources ${extractKey}`);
      assert.ok(prov?.sourceSha256, `${metricId} generated provenance SHA`);

      assert.equal(reg.sourceSha256, prov.sourceSha256, 'registry ↔ generated SHA');
      assert.equal(ext.sourceSha256, prov.sourceSha256, 'extract-sources ↔ generated SHA');
      assert.equal(reg.sourceSha256, ext.sourceSha256, 'registry ↔ extract-sources SHA');

      const workbook = prov.sourceWorkbook ?? ext.sourceWorkbook;
      assert.equal(manifestSha(workbook), prov.sourceSha256, 'manifest ↔ generated SHA');

      assert.equal(reg.extractionDate, prov.extractionDate, 'registry ↔ generated extractionDate');
      if (metricId === 'energy' || metricId === 'water') {
        assert.equal(ext.extractionDate, prov.extractionDate, 'extract-sources ↔ generated extractionDate (energy/water)');
      } else {
        assert.ok(ext.extractionDate, `${metricId} extract-sources extractionDate present`);
      }

      assert.equal(reg.verificationState, 'available_unverified');
      assert.equal(prov.verification?.status, 'available_unverified');

      const monthCount = prov.observedMonths?.length ?? ext.observedMonths?.length;
      assert.ok(monthCount >= 7, `${metricId} has observed months`);
      assert.match(reg.coverage, new RegExp(`${monthCount} of 12`), 'registry coverage month count');
      assert.equal(ext.coverage, `${monthCount} of 12 months`, 'extract-sources coverage');
    });
  }

  it('energy + water registry reflects Jan–Aug (8/12) after sync', () => {
    for (const id of ['energy', 'water']) {
      const reg = registryEntry(id);
      assert.equal(reg.extractionDate, '2026-09-01');
      assert.match(reg.coverage, /8 of 12 months \(Jan-Aug\)/);
    }
  });
});
