#!/usr/bin/env node

/**
 * Smoke-test the static preview routes after `rtk npm run preview` is running.
 * This script does not start a server and does not modify files.
 */

const baseUrl = (process.env.PREVIEW_BASE_URL ?? 'http://127.0.0.1:4321').replace(/\/$/, '');

const routes = [
  '/',
  '/dashboard',
  '/dashboard/energy',
  '/dashboard/water',
  '/dashboard/fuel',
  '/dashboard/paper',
  '/dashboard/waste',
  '/dashboard/ghg',
  '/categories',
  '/categories/cat1',
  '/categories/cat2',
  '/categories/cat3',
  '/categories/cat4',
  '/categories/cat5',
  '/categories/cat6',
  '/categories/cat7',
  '/evidence',
  '/documents',
  '/documents/cat1',
  '/documents/cat2',
  '/documents/cat3',
  '/documents/cat4',
  '/documents/cat5',
  '/documents/cat6',
  '/documents/cat7',
  '/search',
];

const failures = [];

for (const route of routes) {
  const url = `${baseUrl}${route}`;
  try {
    const response = await fetch(url, { redirect: 'manual' });
    const ok = response.status >= 200 && response.status < 400;
    console.log(`${ok ? 'PASS' : 'FAIL'} ${response.status} ${route}`);
    if (!ok) failures.push(`${route} returned ${response.status}`);
  } catch (error) {
    console.log(`FAIL ERR ${route}`);
    failures.push(`${route} failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failures.length > 0) {
  console.error('\nRoute smoke test failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`\nRoute smoke test passed: ${routes.length}/${routes.length} routes.`);
