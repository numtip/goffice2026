/**
 * regenerate-category-progress-2569.mjs
 * ======================================
 * Regenerates src/data/generated/category-progress-2569.json from
 * src/data/progress/indicator-progress-2569.json truth source.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const PROGRESS_JSON = new URL('../src/data/progress/indicator-progress-2569.json', import.meta.url);
const GENERATED_JSON = new URL('../src/data/generated/category-progress-2569.json', import.meta.url);

const progress = JSON.parse(readFileSync(PROGRESS_JSON, 'utf8'));
const items = progress.items;

// Group by category prefix (cat1, cat2, etc.)
const cats = {};
for (const item of items) {
  const code = item.indicator;
  // Determine category: "1.x.y" → "1", "2.x.y" → "2", "7.x" → "7"
  const parts = code.split('.');
  const catId = parts[0];
  if (!cats[catId]) {
    cats[catId] = {
      id: catId,
      code: `cat${catId}`,
      total: 0, applicable: 0, ready: 0, inProgress: 0,
      notStarted: 0, unavailable: 0, notApplicable: 0,
      evidenceVerified: 0, evidenceAvailableUnverified: 0, evidenceUnavailable: 0,
      issues: {},
    };
  }
  const cat = cats[catId];
  cat.total++;
  cat.applicable++;
  const ps = item.progressStatus;
  if (ps === 'ready') cat.ready++;
  else if (ps === 'in_progress') cat.inProgress++;
  else if (ps === 'not_started') cat.notStarted++;
  else if (ps === 'unavailable') cat.unavailable++;

  const es = item.evidenceStatus;
  if (es === 'verified') cat.evidenceVerified++;
  else if (es === 'available_unverified') cat.evidenceAvailableUnverified++;
  else if (es === 'unavailable') cat.evidenceUnavailable++;

  // Issue grouping (e.g., "1.1" from "1.1.1")
  const issueId = parts.length > 2 ? `${parts[0]}.${parts[1]}` : `${parts[0]}.${parts[1]}`;
  if (!cat.issues[issueId]) {
    cat.issues[issueId] = {
      id: issueId,
      title: '', // will be filled from indicators.json
      total: 0, applicable: 0, ready: 0, inProgress: 0,
      notStarted: 0, unavailable: 0, notApplicable: 0,
      readyRate: 0,
    };
  }
  const iss = cat.issues[issueId];
  iss.total++;
  iss.applicable++;
  if (ps === 'ready') iss.ready++;
  else if (ps === 'in_progress') iss.inProgress++;
  else if (ps === 'not_started') iss.notStarted++;
  else if (ps === 'unavailable') iss.unavailable++;
}

// Calculate ready rates
for (const catId of Object.keys(cats)) {
  const cat = cats[catId];
  cat.readyRate = cat.applicable > 0 ? Math.round((cat.ready / cat.applicable) * 1000) / 10 : 0;
  for (const issId of Object.keys(cat.issues)) {
    const iss = cat.issues[issId];
    iss.readyRate = iss.applicable > 0 ? Math.round((iss.ready / iss.applicable) * 1000) / 10 : 0;
  }
}

// Overall totals
let overallReady = 0, overallInProg = 0, overallNotStarted = 0, overallUnavailable = 0;
let overallEvidenceVerified = 0, overallEvidenceAU = 0, overallEvidenceUA = 0;
for (const catId of Object.keys(cats)) {
  const cat = cats[catId];
  overallReady += cat.ready;
  overallInProg += cat.inProgress;
  overallNotStarted += cat.notStarted;
  overallUnavailable += cat.unavailable;
  overallEvidenceVerified += cat.evidenceVerified;
  overallEvidenceAU += cat.evidenceAvailableUnverified;
  overallEvidenceUA += cat.evidenceUnavailable;
}

const categories = Object.values(cats).map(cat => {
  const issueList = Object.values(cat.issues).sort((a, b) => a.id.localeCompare(b.id));
  return {
    ...cat,
    readyRate: cat.readyRate,
    evidence: {
      verified: cat.evidenceVerified,
      availableUnverified: cat.evidenceAvailableUnverified,
      pending: 0,
      unavailable: cat.evidenceUnavailable,
      notApplicable: 0,
    },
    issues: issueList,
  };
}).sort((a, b) => parseInt(a.id) - parseInt(b.id));

const output = {
  schemaVersion: '1.0.0',
  year: 2569,
  generatedAt: new Date().toISOString().split('T')[0],
  overall: {
    total: items.length,
    applicable: items.length,
    ready: overallReady,
    inProgress: overallInProg,
    notStarted: overallNotStarted,
    unavailable: overallUnavailable,
    notApplicable: 0,
    readyRate: items.length > 0 ? Math.round((overallReady / items.length) * 1000) / 10 : 0,
    evidence: {
      verified: overallEvidenceVerified,
      availableUnverified: overallEvidenceAU,
      pending: 0,
      unavailable: overallEvidenceUA,
      notApplicable: 0,
    },
  },
  categories,
};

writeFileSync(GENERATED_JSON, JSON.stringify(output, null, 2) + '\n', 'utf8');
console.log('✓ Regenerated category-progress-2569.json');
console.log(`Overall: ${overallReady} ready, ${overallInProg} inProgress, ${overallNotStarted} notStarted, ${overallUnavailable} unavailable`);
console.log(`Evidence: ${overallEvidenceVerified} verified, ${overallEvidenceAU} avail-unver, ${overallEvidenceUA} unavailable`);
