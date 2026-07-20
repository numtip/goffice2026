#!/usr/bin/env node

/**
 * Smoke-test static preview routes after `npm run preview`.
 * Supports GitHub Pages base path via PREVIEW_BASE_URL (e.g. http://127.0.0.1:4321/goffice2026).
 */

const baseUrl = (process.env.PREVIEW_BASE_URL ?? 'http://127.0.0.1:4321').replace(/\/$/, '');

const thRoutes = [
  '/',
  '/dashboard/',
  '/dashboard/energy/',
  '/dashboard/water/',
  '/dashboard/fuel/',
  '/dashboard/paper/',
  '/dashboard/waste/',
  '/dashboard/ghg/',
  '/categories/',
  '/categories/cat1/',
  '/categories/cat2/',
  '/categories/cat3/',
  '/categories/cat4/',
  '/categories/cat5/',
  '/categories/cat6/',
  '/categories/cat7/',
  '/evidence/',
  '/documents/',
  '/documents/cat1/',
  '/documents/cat2/',
  '/documents/cat3/',
  '/documents/cat4/',
  '/documents/cat5/',
  '/documents/cat6/',
  '/documents/cat7/',
  '/search/',
  '/404/',
];

const enRoutes = [
  '/en/',
  '/en/404/',
  '/en/dashboard/',
  '/en/categories/',
  '/en/evidence/',
  '/en/documents/',
  '/en/search/',
];

const routes = [...thRoutes, ...enRoutes];
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
