import { readFileSync } from 'node:fs';

const th = readFileSync('dist/about/action-plan/index.html', 'utf8');
const en = readFileSync('dist/en/about/action-plan/index.html', 'utf8');

const checks = [
  ['TH h2 canonical', th.includes('<h2 id="ap-categories" class="text-lg font-semibold text-gray-900 mb-2">7 หมวด 24 ประเด็น 65 ตัวชี้วัด</h2>')],
  ['TH h2 old absent', !th.includes('7 หมวดตามแผนงาน')],
  ['TH 6/22/63 absent', !th.includes('6 หมวด 22 ประเด็น 63 ตัวชี้วัด')],
  ['TH description canonical', th.includes('สำหรับหน่วยงานขอต่ออายุการรับรองหรือขอยกระดับการรับรอง: 7 หมวด 24 ประเด็น 65 ตัวชี้วัด')],
  ['EN h2 canonical', en.includes('<h2 id="ap-categories" class="text-lg font-semibold text-gray-900 mb-2">7 categories, 24 issues and 65 indicators</h2>')],
  ['EN h2 old absent', !en.includes('Seven plan categories')],
  ['EN 6/22/63 absent', !en.includes('6 categories, 22 issues and 63 indicators')],
  ['EN description canonical', en.includes('For renewal or certification-level upgrade: 7 categories, 24 issues and 65 indicators.')],
];

let ok = true;
for (const [name, pass] of checks) {
  console.log(`${pass ? 'OK  ' : 'FAIL'} ${name}`);
  if (!pass) ok = false;
}
process.exit(ok ? 0 : 1);
