/** Production metadata constants — v1.1.1 */
export const SITE_META = {
  productionUrl: 'https://goffice.mju.ac.th',
  applicationName: 'Green Office 2026',
  author: 'Maejo University — Research and Extension Office',
  keywords: [
    'Green Office',
    'Maejo University',
    'มหาวิทยาลัยแม่โจ้',
    'สำนักงานสีเขียว',
    'ความยั่งยืน',
    'sustainability',
    'environmental dashboard',
    'green office certification',
  ],
  themeColor: '#003527',
  backgroundColor: '#f8f9ff',
  colorScheme: 'light' as const,
  ogDefaultImagePath: '/images/og-default.png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterCard: 'summary_large_image' as const,
  locale: 'th_TH',
  alternateLocale: 'en_US',
  version: '1.1.1',
} as const;

export function resolveSiteOrigin(site: URL | string | undefined, fallbackOrigin: string): string {
  if (!site) return fallbackOrigin.replace(/\/$/, '');
  const value = typeof site === 'string' ? site : site.href;
  return value.replace(/\/$/, '');
}

export function withTrailingSlash(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) return pathname;
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

export function buildCanonicalUrl(origin: string, pathname: string): string {
  const base = origin.replace(/\/$/, '');
  const path = withTrailingSlash(pathname);
  return `${base}${path === '/' ? '/' : path}`;
}

export function assetUrl(origin: string, baseUrl: string, assetPath: string): string {
  const base = baseUrl.replace(/\/$/, '');
  const asset = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  if (base && base !== '/') {
    return `${origin}${base}${asset}`;
  }
  return `${origin}${asset}`;
}
