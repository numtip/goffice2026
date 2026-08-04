#!/usr/bin/env node
const base = (process.env.PREVIEW_BASE_URL ?? 'http://127.0.0.1:4321').replace(/\/$/, '');
const routes = ['/about/action-plan/', '/en/about/action-plan/'];
const checks = [
  ['timeline section', 'id="ap-timeline"'],
  ['gantt summary', 'ap-gantt-summary'],
  ['search input', 'id="ap-search"'],
  ['category filter', 'id="ap-category-filter"'],
  ['print control', 'id="ap-print"'],
  ['result count', 'id="ap-result-count"'],
  ['category anchor', 'href="#cat-1"'],
  ['category accordions', 'id="ap-categories"'],
  ['details elements', '<details'],
  ['keyboard focus on summary', 'focus-visible:outline'],
  ['download link', 'green-office-action-plan-2569.xlsx'],
  ['summary cards grid', 'grid-cols-2'],
  ['print stylesheet', '@media print'],
];

// Regression guard (GO-UX-5 follow-up): the 7-category heading must state the
// canonical renewal/upgrade scope and must never regress to the new-certification
// counts (6/22/63) or the old "7 หมวดตามแผนงาน" label.
const scopeChecks = [
  ['TH heading canonical', '/about/action-plan/', '7 หมวด 24 ประเด็น 65 ตัวชี้วัด', true],
  ['TH heading old label absent', '/about/action-plan/', '7 หมวดตามแผนงาน', false],
  ['TH new-cert counts absent', '/about/action-plan/', '6 หมวด 22 ประเด็น 63 ตัวชี้วัด', false],
  ['TH card shows indicator count', '/about/action-plan/', '18 ตัวชี้วัด', true],
  ['TH summary shows 65 value', '/about/action-plan/', '>65</p>', true],
  ['TH summary no 147 value', '/about/action-plan/', '>147</p>', false],
  ['EN heading canonical', '/en/about/action-plan/', '7 categories, 24 issues and 65 indicators', true],
  ['EN heading old label absent', '/en/about/action-plan/', 'Seven plan categories', false],
  ['EN new-cert counts absent', '/en/about/action-plan/', '6 categories, 22 issues and 63 indicators', false],
  ['EN card shows indicator count', '/en/about/action-plan/', '18 indicators', true],
  ['EN summary shows 65 value', '/en/about/action-plan/', '>65</p>', true],
  ['EN summary no 147 value', '/en/about/action-plan/', '>147</p>', false],
];

let ok = true;
for (const route of routes) {
  const res = await fetch(`${base}${route}`);
  console.log(`${route} → ${res.status}`);
  if (!res.ok) ok = false;
  const html = await res.text();
  for (const [name, needle] of checks) {
    const pass = html.includes(needle);
    console.log(`  ${pass ? 'OK' : 'FAIL'} ${name}`);
    if (!pass) ok = false;
  }
  const detailsCount = (html.match(/<details/g) || []).length;
  console.log(`  details count: ${detailsCount} (expect ≥7)`);
  if (detailsCount < 7) ok = false;
}

for (const [name, route, needle, expectPresent] of scopeChecks) {
  const html = await (await fetch(`${base}${route}`)).text();
  const present = html.includes(needle);
  const pass = expectPresent ? present : !present;
  console.log(`  ${pass ? 'OK' : 'FAIL'} ${name} (${expectPresent ? 'expect present' : 'expect absent'})`);
  if (!pass) ok = false;
}

const xlsx = await fetch(`${base}/documents/about/2569/green-office-action-plan-2569.xlsx`);
console.log(`xlsx → ${xlsx.status} ${xlsx.headers.get('content-type') ?? ''}`);
if (!xlsx.ok) ok = false;

if (!ok) process.exit(1);
console.log('Action plan runtime smoke: PASS');
