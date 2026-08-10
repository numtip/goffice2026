import { readFileSync } from 'node:fs';

const th = readFileSync('dist/about/action-plan/index.html', 'utf8');
const en = readFileSync('dist/en/about/action-plan/index.html', 'utf8');

const thCards = [...th.matchAll(/<p class="text-2xl font-bold text-green-700"[^>]*>([^<]+)<\/p>\s*<p class="mt-1[^"]*"[^>]*>([^<]+)<\/p>/g)].map((m) => `${m[1]} ${m[2]}`);
const enCards = [...en.matchAll(/<p class="text-2xl font-bold text-green-700"[^>]*>([^<]+)<\/p>\s*<p class="mt-1[^"]*"[^>]*>([^<]+)<\/p>/g)].map((m) => `${m[1]} ${m[2]}`);
console.log('TH summary cards:', JSON.stringify(thCards));
console.log('EN summary cards:', JSON.stringify(enCards));

const checks = [
  ['TH card 2 = 65 ตัวชี้วัด', thCards[1] === '65 ตัวชี้วัด'],
  ['TH no 147 in summary card', !thCards.some((c) => c.startsWith('147'))],
  ['EN card 2 = 65 indicators', enCards[1] === '65 indicators'],
  ['EN no 147 in summary card', !enCards.some((c) => c.startsWith('147'))],
  ['TH resultCount still 147 กิจกรรม', th.includes('147 กิจกรรม')],
];
let ok = true;
for (const [n, pass] of checks) {
  console.log(`${pass ? 'OK  ' : 'FAIL'} ${n}`);
  if (!pass) ok = false;
}
process.exit(ok ? 0 : 1);
