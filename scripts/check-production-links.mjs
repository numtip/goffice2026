#!/usr/bin/env node

/**
 * Crawl dist/ HTML and verify every internal href resolves to a built file.
 * Fails on missing targets or directory routes without trailing slashes.
 *
 * Usage:
 *   DEPLOY_TARGET=github-pages npm run build
 *   node scripts/check-production-links.mjs
 *
 * Env:
 *   GHP_BASE — site base path without trailing slash (default: /goffice2026)
 *   DIST_DIR — output directory (default: dist)
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, process.env.DIST_DIR ?? 'dist');

/** Auto-detect base path: prod/local = '', GitHub Pages = /{repo} */
function resolveGhpBase() {
  if (process.env.GHP_BASE !== undefined) {
    return process.env.GHP_BASE.replace(/\/$/, '');
  }
  if (process.env.DEPLOY_TARGET === 'github-pages') {
    const repo = (process.env.GITHUB_REPOSITORY ?? 'numtip/goffice2026').split('/')[1] ?? 'goffice2026';
    return `/${repo}`;
  }
  return '';
}

const GHP_BASE = resolveGhpBase();

const A_HREF_RE = /<a\b[^>]*\shref=["']([^"'#?]+)["']/gi;
const SKIP_SCHEMES = /^(https?:|mailto:|tel:|javascript:)/i;

function walkHtmlFiles(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkHtmlFiles(full, files);
    } else if (entry.name.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

/** dist/dashboard/index.html → /dashboard/ */
function fileToRoute(htmlPath) {
  const rel = htmlPath.slice(DIST.length).replace(/\\/g, '/');
  if (rel === '/index.html') return '/';
  const withoutIndex = rel.replace(/\/index\.html$/, '/');
  return withoutIndex || '/';
}

function routeToCandidates(routePath) {
  const normalized = routePath === '/' ? '/' : routePath.replace(/\/+$/, '') + '/';
  const rel = normalized === '/' ? 'index.html' : `${normalized.slice(1)}index.html`;
  return [
    join(DIST, rel),
    join(DIST, normalized.slice(1).replace(/\/$/, '.html')),
  ];
}

function resolveHref(fromRoute, href) {
  if (!href || SKIP_SCHEMES.test(href)) return null;

  let target = href;
  if (target.startsWith(GHP_BASE)) {
    target = target.slice(GHP_BASE.length) || '/';
  } else if (target.startsWith('/')) {
    // Absolute without base — only valid for local builds
    if (GHP_BASE && !target.startsWith(`${GHP_BASE}/`)) {
      return { appPath: target, externalBase: true };
    }
  } else {
    // Relative href
    const baseDir = fromRoute === '/' ? '/' : fromRoute;
    const parts = `${baseDir}/${target}`.split('/').filter(Boolean);
    const resolved = [];
    for (const part of parts) {
      if (part === '.') continue;
      if (part === '..') resolved.pop();
      else resolved.push(part);
    }
    target = `/${resolved.join('/')}${target.endsWith('/') ? '/' : ''}`;
  }

  if (!target.startsWith('/')) target = `/${target}`;
  return { appPath: target };
}

function isDirectoryRoute(path) {
  return path === '/' || (!/\.[a-zA-Z0-9]+$/.test(path) && path.endsWith('/'));
}

/** Only validate navigable HTML routes — skip repository file downloads (.xlsx, .md, …). */
function isPageRoute(appPath) {
  return !(/\.[a-zA-Z0-9]+$/.test(appPath) && !/\.html$/.test(appPath));
}

function main() {
  if (!existsSync(DIST)) {
    console.error(`dist/ not found at ${DIST}. Run DEPLOY_TARGET=github-pages npm run build first.`);
    process.exit(1);
  }

  const htmlFiles = walkHtmlFiles(DIST);
  const failures = [];
  const checked = new Set();
  let linkCount = 0;

  for (const htmlPath of htmlFiles) {
    const fromRoute = fileToRoute(htmlPath);
    const html = readFileSync(htmlPath, 'utf-8');
    let match;
    A_HREF_RE.lastIndex = 0;

    while ((match = A_HREF_RE.exec(html)) !== null) {
      const href = match[1].trim();
      const resolved = resolveHref(fromRoute, href);
      if (!resolved) continue;

      const { appPath, externalBase } = resolved;
      if (!isPageRoute(appPath)) continue;

      linkCount += 1;
      const key = `${fromRoute} -> ${href}`;
      if (checked.has(key)) continue;
      checked.add(key);

      if (externalBase && GHP_BASE) {
        failures.push(`${fromRoute}: href "${href}" missing base prefix (expected ${GHP_BASE}/…)`);
        continue;
      }

      if (!isDirectoryRoute(appPath) && !/\.html$/.test(appPath)) {
        failures.push(`${fromRoute}: href "${href}" missing trailing slash (${appPath})`);
        continue;
      }

      const candidates = routeToCandidates(appPath);
      const found = candidates.some((p) => existsSync(p));
      if (!found) {
        failures.push(`${fromRoute}: href "${href}" → ${appPath} (no file in dist/)`);
      }
    }
  }

  console.log(`Checked ${linkCount} internal hrefs across ${htmlFiles.length} HTML files (base: ${GHP_BASE || '/'})`);

  if (failures.length > 0) {
    console.error(`\nProduction link check FAILED (${failures.length} issue(s)):`);
    for (const f of failures.slice(0, 50)) console.error(`  ✗ ${f}`);
    if (failures.length > 50) {
      console.error(`  … and ${failures.length - 50} more`);
    }
    process.exit(1);
  }

  console.log(`\nProduction link check PASSED (${checked.size} unique internal links).`);
}

main();
