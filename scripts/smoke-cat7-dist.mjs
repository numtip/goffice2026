import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');

const failures = [];
const ok = (name) => console.log(`  PASS  ${name}`);

function read(rel) {
  return readFileSync(resolve(DIST, rel), 'utf8');
}

function expectContains(rel, needles, label) {
  const html = read(rel);
  const missing = needles.filter((n) => !html.includes(n));
  if (missing.length === 0) {
    ok(`${label} contains [${needles.join(', ')}]`);
  } else {
    failures.push(`${label}: missing ${missing.join(', ')}`);
    console.log(`  FAIL  ${label}: missing ${missing.join(', ')}`);
  }
  return html;
}

function expectNotContains(html, needles, label) {
  const hits = needles.filter((n) => html.includes(n));
  if (hits.length === 0) {
    ok(`${label} excludes [${needles.join(', ')}]`);
  } else {
    failures.push(`${label}: unexpected ${hits.join(', ')}`);
    console.log(`  FAIL  ${label}: unexpected ${hits.join(', ')}`);
  }
}

console.log('=== CAT7 DIST SMOKE (TH/EN) ===');

// 1. Category page — continuity evidence-control view
let html = expectContains('categories/cat7/index.html', ['7.1', '7.2', 'EVIDENCE_GAP', 'การควบคุมหลักฐาน'], 'cat7 category TH');
expectNotContains(html, ['ผ่านเกณฑ์แล้ว', 'ได้รับคะแนน', 'certified'], 'cat7 category TH (no result leak)');
html = expectContains('en/categories/cat7/index.html', ['7.1', '7.2', 'EVIDENCE_GAP', 'evidence control'], 'cat7 category EN');
expectNotContains(html, ['passed', 'PASS:', 'score:', 'certified'], 'cat7 category EN (no result leak)');

// 2. 7.1 indicator — limited FY2568 request evidence
html = expectContains('indicators/7.1/index.html', ['7.1', 'internal-audit request', 'baseline'], '7.1 indicator TH');
// 7.1 must link its single eligible evidence entry
expectContains('indicators/7.1/index.html', ['/evidence/ev-cat7-internal-audit-request-fy2568/'], '7.1 indicator TH evidence link');
expectNotContains(html, ['ผ่านเกณฑ์แล้ว', 'ผลการตรวจผ่าน', 'ได้คะแนน', 'ได้รับรอง'], '7.1 indicator TH (no PASS/score/result leak)');
html = expectContains('en/indicators/7.1/index.html', ['7.1', 'internal-audit request', 'baseline'], '7.1 indicator EN');
expectContains('en/indicators/7.1/index.html', ['/en/evidence/ev-cat7-internal-audit-request-fy2568/'], '7.1 indicator EN evidence link');
expectNotContains(html, ['passed', 'PASS:', 'score:', 'certified'], '7.1 indicator EN (no PASS/score/result leak)');

// 3. 7.2 indicator — explicit evidence gap; NO cat7 evidence link
expectNotContains(read('indicators/7.2/index.html'), ['/evidence/ev-cat7'], '7.2 indicator TH (no cat7 evidence link)');
expectNotContains(read('en/indicators/7.2/index.html'), ['/evidence/ev-cat7'], '7.2 indicator EN (no cat7 evidence link)');
html = expectContains('indicators/7.2/index.html', ['7.2', 'EVIDENCE_GAP', 'ไม่พบหลักฐานการดำเนินงานปี 2568', 'MAEJO PGS'], '7.2 indicator TH');
expectNotContains(html, ['ผ่านเกณฑ์แล้ว', 'ได้คะแนน'], '7.2 indicator TH (no result leak)');
html = expectContains('en/indicators/7.2/index.html', ['7.2', 'EVIDENCE_GAP', 'No verified FY2568 execution evidence', 'MAEJO PGS'], '7.2 indicator EN');
expectNotContains(html, ['passed', 'PASS:', 'score:'], '7.2 indicator EN (no result leak)');

// 4. Evidence page — single eligible entry, honest description, no FY2569 result
html = expectContains('evidence/ev-cat7-internal-audit-request-fy2568/index.html', ['7.1', 'internal-audit request', 'FY2568'], '7.1 evidence page TH');
expectNotContains(html, ['ผ่านเกณฑ์แล้ว', 'ได้คะแนน'], '7.1 evidence page TH (no result leak)');

// 5. No cat7 page links to a cat7 FY2569 evidence route (none exist for 7.2)
const cat7Files = ['categories/cat7/index.html', 'en/categories/cat7/index.html',
  'indicators/7.1/index.html', 'indicators/7.2/index.html',
  'en/indicators/7.1/index.html', 'en/indicators/7.2/index.html'];
for (const f of cat7Files) {
  if (f.includes('7.2')) {
    expectNotContains(read(f), ['/evidence/ev-cat7'], `${f} (no cat7 evidence route link — mandatory gap)`);
  }
}

console.log('---');
if (failures.length === 0) {
  console.log('CAT7 DIST SMOKE: PASS');
  process.exit(0);
} else {
  console.log(`CAT7 DIST SMOKE: ${failures.length} FAILURE(S)`);
  failures.forEach((f) => console.log(`  ✗ ${f}`));
  process.exit(1);
}
