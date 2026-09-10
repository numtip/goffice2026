/**
 * Operational resource workbooks published as evidence source files.
 * These map to indicators on evidence/dashboard pages but are NOT frozen
 * Cat3/Cat4 assessment-form contract records (those stay on PDF/form sources).
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

let cachedIds;

export function resourceSourcePublicationEvidenceIds() {
  if (cachedIds) return cachedIds;
  const map = JSON.parse(
    readFileSync(resolve(ROOT, 'src/data/resource-source-files.json'), 'utf8'),
  );
  const ids = new Set();
  for (const domain of map.domains || []) {
    if (typeof domain.evidenceId === 'string' && domain.evidenceId.startsWith('ev-resource-xlsx-')) {
      ids.add(domain.evidenceId);
    }
    const current = domain.currentYearWorkbook;
    if (typeof current?.evidenceId === 'string' && current.evidenceId.startsWith('ev-resource-xlsx-')) {
      ids.add(current.evidenceId);
    }
  }
  cachedIds = ids;
  return ids;
}

export function isResourceSourcePublicationEvidence(ev) {
  return typeof ev?.id === 'string' && resourceSourcePublicationEvidenceIds().has(ev.id);
}
