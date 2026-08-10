// Verify live heading fix on GitHub Pages
const BASE = 'https://numtip.github.io/goffice2026';
const checks = [
  ['/about/action-plan/', 'TH heading canonical', '7 หมวด 24 ประเด็น 65 ตัวชี้วัด', true],
  ['/about/action-plan/', 'TH old heading absent', '7 หมวดตามแผนงาน', false],
  ['/about/action-plan/', 'TH 6/22/63 absent', '6 หมวด 22 ประเด็น 63 ตัวชี้วัด', false],
  ['/en/about/action-plan/', 'EN heading canonical', '7 categories, 24 issues and 65 indicators', true],
  ['/en/about/action-plan/', 'EN old heading absent', 'Seven plan categories', false],
];
let ok = true;
for (const [path, name, needle, expectPresent] of checks) {
  const res = await fetch(`${BASE}${path}`);
  const html = await res.text();
  const present = html.includes(needle);
  const pass = expectPresent ? present : !present;
  console.log(`${pass ? 'OK  ' : 'FAIL'} ${name} | ${path} | present=${present}`);
  if (!pass) ok = false;
}
console.log(ok ? 'LIVE VERIFICATION: PASS' : 'LIVE VERIFICATION: FAIL');
process.exit(ok ? 0 : 1);
