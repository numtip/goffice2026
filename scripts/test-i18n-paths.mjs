/**
 * Unit tests for i18n path helpers (must match src/i18n/utils.ts).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

function normalizeInternalPath(path) {
  if (!path || path === '/') return '/';
  const withLeading = path.startsWith('/') ? path : `/${path}`;
  if (/\.[a-zA-Z0-9]+$/.test(withLeading)) return withLeading;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
}

function stripBasePath(pathname, base = '') {
  if (base && base !== '/' && pathname.startsWith(base)) {
    const rest = pathname.slice(base.length);
    return rest.startsWith('/') ? rest : `/${rest}`;
  }
  return pathname;
}

function getLocalizedPath(locale, path, base = '') {
  const normalized = normalizeInternalPath(path);
  if (locale === 'en') {
    if (normalized === '/') return `${base}/en/`;
    return `${base}/en${normalized}`;
  }
  if (normalized === '/') return base ? `${base}/` : '/';
  return `${base}${normalized}`;
}

function stripLocalePrefix(pathname, base = '') {
  const appPath = stripBasePath(pathname, base);
  if (appPath.startsWith('/en/')) {
    const rest = appPath.slice(3) || '/';
    return normalizeInternalPath(rest);
  }
  if (appPath === '/en' || appPath === '/en/') return '/';
  return normalizeInternalPath(appPath);
}

function getSwitcherHref(pathname, targetLocale, base = '') {
  const appPath = stripBasePath(pathname, base);
  if (
    appPath === '/404/' ||
    appPath === '/404' ||
    appPath === '/en/404/' ||
    appPath === '/en/404'
  ) {
    return getLocalizedPath(targetLocale, '/', base);
  }
  const canonicalPath = stripLocalePrefix(pathname, base);
  return getLocalizedPath(targetLocale, canonicalPath, base);
}

describe('getLocalizedPath', () => {
  it('prefixes EN paths', () => {
    assert.equal(getLocalizedPath('en', '/dashboard/'), '/en/dashboard/');
    assert.equal(getLocalizedPath('th', '/dashboard/'), '/dashboard/');
  });

  it('handles GitHub Pages base', () => {
    assert.equal(getLocalizedPath('en', '/categories/', '/goffice2026'), '/goffice2026/en/categories/');
  });
});

describe('getSwitcherHref on 404', () => {
  it('TH 404 → EN home', () => {
    assert.equal(getSwitcherHref('/404/', 'en'), '/en/');
  });

  it('EN 404 → TH home', () => {
    assert.equal(getSwitcherHref('/en/404/', 'th'), '/');
  });

  it('404 with GHP base → locale home', () => {
    assert.equal(getSwitcherHref('/goffice2026/en/404/', 'th', '/goffice2026'), '/goffice2026/');
    assert.equal(getSwitcherHref('/goffice2026/404/', 'en', '/goffice2026'), '/goffice2026/en/');
  });
});

describe('getSwitcherHref on normal pages', () => {
  it('switches category detail', () => {
    assert.equal(getSwitcherHref('/categories/cat3/', 'en'), '/en/categories/cat3/');
    assert.equal(getSwitcherHref('/en/categories/cat3/', 'th'), '/categories/cat3/');
  });
});
