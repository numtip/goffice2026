#!/usr/bin/env node
const base = (process.env.PREVIEW_BASE_URL ?? 'http://127.0.0.1:4321').replace(/\/$/, '');
const routes = ['/about/action-plan/', '/en/about/action-plan/'];
const checks = [
  ['timeline section', 'id="ap-timeline"'],
  ['timeline overflow', 'overflow-x-auto'],
  ['category accordions', 'id="ap-categories"'],
  ['details elements', '<details'],
  ['keyboard focus on summary', 'focus-visible:outline'],
  ['download link', 'green-office-action-plan-2569.xlsx'],
  ['summary cards grid', 'grid-cols-2'],
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

const xlsx = await fetch(`${base}/documents/about/2569/green-office-action-plan-2569.xlsx`);
console.log(`xlsx → ${xlsx.status} ${xlsx.headers.get('content-type') ?? ''}`);
if (!xlsx.ok) ok = false;

if (!ok) process.exit(1);
console.log('Action plan runtime smoke: PASS');
