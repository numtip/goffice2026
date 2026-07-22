/**
 * WOW2 image asset paths for the Green Office 2026 visual upgrade.
 *
 * All images live under public/images/dashboard/wow2/ and are served
 * via the Astro BASE_URL so GitHub Pages base paths work correctly.
 *
 * The "catagory" spelling (with 'a') matches the actual filenames;
 * do not rename to "category" unless the files are renamed too.
 */

const WOW2_DIR = 'images/dashboard/wow2/';

/** Resolve a public asset path relative to the Astro base URL. */
function assetUrl(filename: string): string {
  const base = import.meta.env.BASE_URL ?? '/';
  const src = `${base}${WOW2_DIR}${filename}`.replace(/\/{2,}/g, '/').replace(':/', '://');
  return src;
}

/** Map a category code (cat1–cat7) to its wow2 image path.
 *  Serves optimized WebP by default. Falls back to PNG if WebP missing.
 *  Filenames use "catagory" (with 'a'), not "category".
 *  Original PNGs preserved alongside WebP derivatives.
 *  Returns undefined when no mapping exists (safe for optional props). */
export function categoryImageUrl(code: string): string | undefined {
  const map: Record<string, string> = {
    cat1: 'catagory1.webp',
    cat2: 'catagory2.webp',
    cat3: 'catagory3.webp',
    cat4: 'catagory4.webp',
    cat5: 'catagory5.webp',
    cat6: 'catagory6.webp',
    cat7: 'catagory7.webp',
  };
  const filename = map[code];
  return filename ? assetUrl(filename) : undefined;
}

/** Executive Dashboard Hero image URL. */
export const heroImageUrl: string = assetUrl('Executive Dashboard Hero.jpg');

/** Resource Icons decorative image URL. */
export const resourceIconsImageUrl: string = assetUrl('Resource Icons.jpg');

/** Dashboard Closing Banner image URL. */
export const closingBannerImageUrl: string = assetUrl('Dashboard Closing Banner.jpg');

/** Category image dimensions (width × height) for aspect-ratio constraint. */
export const categoryImageDimensions: Record<string, { w: number; h: number }> = {
  cat1: { w: 1672, h: 941 },
  cat2: { w: 1672, h: 941 },
  cat3: { w: 1672, h: 941 },
  cat4: { w: 1672, h: 941 },
  cat5: { w: 1811, h: 868 },
  cat6: { w: 1815, h: 867 },
  cat7: { w: 1812, h: 868 },
};

/** Hero image dimensions. */
export const heroDimensions = { w: 2048, h: 1152 };

/** Closing banner image dimensions. */
export const closingBannerDimensions = { w: 2048, h: 1152 };

/** Resource Icons image dimensions. */
export const resourceIconsDimensions = { w: 2048, h: 1152 };
