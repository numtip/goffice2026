import { normalizeInternalPath } from '../i18n/utils';

/** Prefix an internal app path with Astro's configured base URL (trailing-slash safe). */
export function withBase(path: string): string {
  if (/^(https?:|mailto:|tel:|#)/.test(path)) {
    return path;
  }

  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const normalized = normalizeInternalPath(path);

  if (path.startsWith(import.meta.env.BASE_URL)) {
    return path.endsWith('/') || /\.[a-zA-Z0-9]+$/.test(path) ? path : `${path}/`;
  }

  if (normalized === '/') {
    return base ? `${base}/` : '/';
  }
  return `${base}${normalized}`;
}
