#!/usr/bin/env node
/** QA gate for v1.1.1 SEO / metadata / PWA artifacts in dist/ */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = resolve(ROOT, 'dist');
let fail = 0;

function ok(label) {
  console.log(`OK  ${label}`);
}

function bad(label, detail = '') {
  console.log(`FAIL ${label}${detail ? ` — ${detail}` : ''}`);
  fail = 1;
}

function mustExist(rel) {
  const p = resolve(DIST, rel);
  if (existsSync(p)) ok(rel);
  else bad(rel, 'missing');
  return p;
}

console.log('=== SEO / PWA QA (dist) ===');

mustExist('robots.txt');
mustExist('sitemap-index.xml');
mustExist('manifest.webmanifest');
mustExist('favicon.svg');
mustExist('favicon.ico');
mustExist('404.html');
mustExist('en/404/index.html');
mustExist('icons/icon-192.png');
mustExist('icons/icon-512.png');
mustExist('icons/apple-touch-icon.png');
mustExist('images/LogoGreen2025.png');
mustExist('images/og-default.png');

const robots = readFileSync(resolve(DIST, 'robots.txt'), 'utf8');
if (/Sitemap:/i.test(robots)) ok('robots.txt has Sitemap');
else bad('robots.txt Sitemap directive');

const sitemapFiles = readdirSync(DIST).filter((f) => f.startsWith('sitemap') && f.endsWith('.xml'));
if (sitemapFiles.length > 0) ok(`sitemap files (${sitemapFiles.length})`);
else bad('sitemap xml files');

const index = readFileSync(resolve(DIST, 'index.html'), 'utf8');
const checks = [
  ['canonical', /rel="canonical"/],
  ['hreflang th', /hreflang="th"/],
  ['hreflang en', /hreflang="en"/],
  ['og:title', /property="og:title"/],
  ['og:image', /property="og:image"/],
  ['twitter:card', /name="twitter:card"/],
  ['theme-color', /name="theme-color"/],
  ['manifest link', /rel="manifest"/],
  ['application-name', /name="application-name"/],
];

for (const [name, re] of checks) {
  if (re.test(index)) ok(`index.html ${name}`);
  else bad(`index.html ${name}`);
}

const notFound = readFileSync(resolve(DIST, '404.html'), 'utf8');
if (/noindex/i.test(notFound)) ok('404.html noindex');
else bad('404.html noindex');

const enNotFound = readFileSync(resolve(DIST, 'en/404/index.html'), 'utf8');
if (/noindex/i.test(enNotFound)) ok('en/404 noindex');
else bad('en/404 noindex');
if (/Page not found/i.test(enNotFound)) ok('en/404 English content');
else bad('en/404 English content');

process.exit(fail);
