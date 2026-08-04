#!/usr/bin/env node
const base = (process.env.PREVIEW_BASE_URL ?? 'http://127.0.0.1:4321').replace(/\/$/, '');

const pages = ['policy', 'goals', 'scope', 'committee'];
const downloads = [
  '/documents/about/policy/GreenOfficePolicy2026.pdf',
  '/documents/about/policy/Evidenceofpolicyreview.pdf',
  '/documents/about/goals/Green_Office_Goals.pdf',
  '/documents/about/scope/Scope_of_Work_and_Activities.pdf',
  '/documents/about/committee/Order_appointing_the_committee.pdf',
];

const checks = (lang) => [
  ['hero', 'about-doc-experience'],
  ['fact sheet', 'about-doc-facts'],
  ['related indicators', lang === '/en' ? 'Related indicators' : 'ตัวชี้วัดที่เกี่ยวข้อง'],
  ['download section', 'about-doc-download'],
  ['download link', 'download'],
  ['keyboard focus', 'focus-visible:outline'],
  ['responsive grid', 'sm:grid-cols-2'],
];

let ok = true;

for (const p of pages) {
  for (const lang of ['', '/en']) {
    const route = `${lang}/about/${p}/`;
    const res = await fetch(`${base}${route}`);
    console.log(`${route} → ${res.status}`);
    if (!res.ok) { ok = false; continue; }
    const html = await res.text();
    for (const [name, needle] of checks(lang)) {
      const pass = html.includes(needle);
      console.log(`  ${pass ? 'OK' : 'FAIL'} ${name}`);
      if (!pass) ok = false;
    }
  }
}

for (const route of ['/about/', '/en/about/']) {
  const res = await fetch(`${base}${route}`);
  console.log(`${route} (hub) → ${res.status}`);
  if (!res.ok) { ok = false; continue; }
  const html = await res.text();
  const pass = html.includes('about-hub-docs');
  console.log(`  ${pass ? 'OK' : 'FAIL'} hub doc cards`);
  if (!pass) ok = false;
}

for (const d of downloads) {
  const res = await fetch(`${base}${d}`);
  console.log(`${d} → ${res.status}`);
  if (!res.ok) ok = false;
}

if (!ok) process.exit(1);
console.log('GO-ABOUT-2 runtime smoke: PASS');
