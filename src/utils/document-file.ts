import { existsSync } from 'node:fs';
import { join } from 'node:path';
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
  const relPath = pathPublic.replace(/^\/+/, '');
  // อ้างจากรากโปรเจกต์เป็นหลัก (เหมือน resolvePublicFileOnDisk) เพราะ Astro 7/Vite 8
  // ทำให้ `import.meta.url` ชี้ไปยังโมดูลที่ถูกบันเดิลแล้ว จึงเทียบ `../../public/...` ไม่ได้อีก
  const candidates = [join(process.cwd(), 'public', relPath)];
  try {
    candidates.push(new URL(`../../public/${relPath}`, import.meta.url).pathname);
  } catch {
    /* import.meta.url ใช้ไม่ได้ในบริบทนี้ — ข้ามไป */
  }
  for (const candidate of candidates) {
    try {
      if (existsSync(candidate)) return true;
    } catch {
      /* path ไม่ถูกต้อง — ลองตัวถัดไป */
    }
  }
  return false;
}

/** Base-prefixed href for a document, or null when its public file is missing. */
export function documentHref(pathPublic?: string): string | null {
  if (!documentFileExists(pathPublic) || !pathPublic) return null;
  return withBase(pathPublic);
}
