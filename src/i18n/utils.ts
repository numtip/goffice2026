/**
 * Detect the locale from an Astro URL.
 * - '/' or '/anything' (no /en/ prefix) → 'th'
 * - '/en/' or '/en/anything' → 'en'
 */
export function getLocale(url: URL): 'th' | 'en' {
  const pathname = url.pathname;
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
  // Thai — no prefix; homepage is just base
  if (pathWithSlash === '' || pathWithSlash === '/') {
    return base || '/';
  }
  return `${base}${pathWithSlash}`;
}

/**
 * Return the other locale.
 */
export function switchLocale(current: 'th' | 'en'): 'th' | 'en' {
  return current === 'th' ? 'en' : 'th';
}

/**
 * Strip the locale prefix from a URL path to get the canonical path.
 * '/en/categories' → '/categories'
 * '/categories' → '/categories'
 * '/' → '/'
 */
export function stripLocalePrefix(pathname: string): string {
  if (pathname.startsWith('/en/')) {
    return pathname.slice(3) || '/';
  }
  if (pathname === '/en') {
    return '/';
  }
  return pathname;
}

/**
 * Get the target locale-switch path for the language switcher.
 * For example, if we're on /en/categories (English), switching to Thai gives /categories.
 * If we're on /categories (Thai), switching to English gives /en/categories.
 */
export function getSwitcherHref(currentUrl: URL, targetLocale: 'th' | 'en'): string {
  const canonicalPath = stripLocalePrefix(currentUrl.pathname);
  return getLocalizedPath(targetLocale, canonicalPath);
}
