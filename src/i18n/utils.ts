/**
 * Detect the locale from an Astro URL.
 * - '/' or '/anything' (no /en/ prefix) → 'th'
 * - '/en/' or '/en/anything' → 'en'
 *
 * Works with Astro base paths (e.g. /goffice2026/en/categories).
 */
export function stripBasePath(pathname: string): string {
  const base = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
  if (base && base !== '/' && pathname.startsWith(base)) {
    const rest = pathname.slice(base.length);
    return rest.startsWith('/') ? rest : `/${rest}`;
  }
  return pathname;
}

export function getLocale(url: URL): 'th' | 'en' {
  const pathname = stripBasePath(url.pathname);
  if (pathname.startsWith('/en/') || pathname === '/en') {
    return 'en';
  }
  return 'th';
}

/**
 * Given a locale and a path relative to the site root, return the localized
 * path with the correct locale prefix under the Astro base URL.
 *
 * - locale='th': no prefix (e.g. /categories → /goffice2026/categories)
 * - locale='en': /en/ prefix (e.g. /categories → /goffice2026/en/categories)
 */
export function getLocalizedPath(locale: 'th' | 'en', path: string): string {
  const base = import.meta.env.BASE_URL ? import.meta.env.BASE_URL.replace(/\/$/, '') : '';
  const pathNoSlash = path.replace(/^\/+/, '');
  const pathWithSlash = pathNoSlash ? `/${pathNoSlash}` : '';

  if (locale === 'en') {
    return `${base}/en${pathWithSlash}`;
  }
  if (pathWithSlash === '' || pathWithSlash === '/') {
    return base || '/';
  }
  return `${base}${pathWithSlash}`;
}

export function switchLocale(current: 'th' | 'en'): 'th' | 'en' {
  return current === 'th' ? 'en' : 'th';
}

/**
 * Strip the locale prefix from a URL path to get the canonical path.
 * '/en/categories' → '/categories'
 */
export function stripLocalePrefix(pathname: string): string {
  const appPath = stripBasePath(pathname);
  if (appPath.startsWith('/en/')) {
    return appPath.slice(3) || '/';
  }
  if (appPath === '/en') {
    return '/';
  }
  return appPath;
}

/**
 * Language switcher target href for the current page.
 */
export function getSwitcherHref(currentUrl: URL, targetLocale: 'th' | 'en'): string {
  const canonicalPath = stripLocalePrefix(currentUrl.pathname);
  return getLocalizedPath(targetLocale, canonicalPath);
}

/** Localized internal link helper (alias). */
export function localizedHref(locale: 'th' | 'en', path: string): string {
  return getLocalizedPath(locale, path);
}
