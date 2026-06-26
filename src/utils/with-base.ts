/** Prefix an internal app path with Astro's configured base URL. */
export function withBase(path: string): string {
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return `${import.meta.env.BASE_URL}${normalized}`;
}
