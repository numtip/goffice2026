/**
 * Extract six individual resource icons from the combined Resource Icons image.
 *
 * Assumes a 3-column × 2-row grid layout in the 2048×1152 source.
 * Output: electricity.webp water.webp fuel.webp paper.webp waste.webp ghg.webp
 */

import sharp from 'sharp';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WOW2_DIR = resolve(__dirname, '../public/images/dashboard/wow2/');
const SRC = join(WOW2_DIR, 'Resource Icons.jpg');

const COLS = 3;
const ROWS = 2;
const ICON_W = 2048 / COLS; // ~682
const ICON_H = 1152 / ROWS; // 576

const icons = [
  { name: 'electricity', col: 0, row: 0 },
  { name: 'water', col: 1, row: 0 },
  { name: 'fuel', col: 2, row: 0 },
  { name: 'paper', col: 0, row: 1 },
  { name: 'waste', col: 1, row: 1 },
  { name: 'ghg', col: 2, row: 1 },
];

async function extract() {
  for (const icon of icons) {
    const left = Math.round(icon.col * ICON_W);
    const top = Math.round(icon.row * ICON_H);
    const outPath = join(WOW2_DIR, `${icon.name}.webp`);

    console.log(`Extracting ${icon.name} (${left},${top} ${Math.round(ICON_W)}x${Math.round(ICON_H)})...`);

    await sharp(SRC)
      .extract({ left, top, width: Math.round(ICON_W), height: Math.round(ICON_H) })
      .webp({ quality: 85 })
      .toFile(outPath);

    console.log(`  → ${outPath}`);
  }
  console.log('\nDone! 6 icons extracted.');
}

extract().catch((err) => {
  console.error('Extraction failed:', err);
  process.exit(1);
});
