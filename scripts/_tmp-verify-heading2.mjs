import { readFileSync } from 'node:fs';

const th = readFileSync('dist/about/action-plan/index.html', 'utf8');
const en = readFileSync('dist/en/about/action-plan/index.html', 'utf8');

const mTh = th.match(/<h2 id="ap-categories"[^>]*>[^<]*<\/h2>/);
const mEn = en.match(/<h2 id="ap-categories"[^>]*>[^<]*<\/h2>/);
console.log('TH h2:', mTh?.[0]);
console.log('EN h2:', mEn?.[0]);

const checks = [
  ['TH h2 contains canonical', th.includes('>7 หมวด 24 ประเด็น 65 ตัวชี้วัด</h2>')],
  ['TH h2 old absent', !th.includes('7 หมวดตามแผนงาน')],
  ['EN h2 contains canonical', en.includes('>7 categories, 24 issues and 65 indicators</h2>')],
  ['EN h2 old absent', !en.includes('Seven plan categories')],
];
let ok = true;
for (const [n, pass] of checks) {
  console.log(`${pass ? 'OK  ' : 'FAIL'} ${n}`);
  if (!pass) ok = false;
}
process.exit(ok ? 0 : 1);
