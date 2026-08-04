import { existsSync } from 'node:fs';
import { withBase } from './with-base';

/**
 * Build-time helper for public document files (PRESENTATION layer only).
 *
 * Metadata (src/data/**) is FROZEN, so components use this helper to avoid
 * rendering 404-prone download links for files that are not present on disk
 * under public/ at build time.
 */

/** True when the public file referenced by `pathPublic` exists on disk. */
export function documentFileExists(pathPublic?: string): boolean {
  if (!pathPublic) return false;
  try {
    const relPath = pathPublic.replace(/^\/+/, '');
    return existsSync(new URL(`../../public/${relPath}`, import.meta.url));
  } catch {
    return false;
  }
}

/** Base-prefixed href for a document, or null when its public file is missing. */
export function documentHref(pathPublic?: string): string | null {
  if (!documentFileExists(pathPublic) || !pathPublic) return null;
  return withBase(pathPublic);
}
