/**
 * Optimize Engage 2026 canonical PNG assets to WebP.
 * Creates WebP derivatives in public/images/engage/2026/web/ from the
 * approved canonical PNGs (master 16:9, campaign 4:5, social 9:16, cards 1:1).
 * Preserves original PNGs. Mirrors scripts/optimize-wow2-images.mjs.
 *
 * Usage: node scripts/optimize-engage-images.mjs
 */

import { mkdirSync, statSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENGAGE_DIR = resolve(__dirname, '../public/images/engage/2026/');
const OUTPUT_DIR = join(ENGAGE_DIR, 'web');

const SOURCES = [
  { folder: 'master', variant: 'master' },
  { folder: 'campaign', variant: '4x5' },
  { folder: 'social', variant: '9x16' },
  { folder: 'cards', variant: '1x1' },
];

const PRACTICES = ['mindset', 'energy', 'water', 'waste', 'paper', 'ghg', 'green-meeting', '5s'];

if (!existsSync(ENGAGE_DIR)) {
  console.error('Engage directory not found:', ENGAGE_DIR);
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });

const results = [];

for (const practice of PRACTICES) {
  for (const { folder, variant } of SOURCES) {
    const inputName = `${practice}-${variant}.png`;
    const inputPath = join(ENGAGE_DIR, folder, inputName);
    const outputName = `${practice}-${variant}.webp`;
    const outputPath = join(OUTPUT_DIR, outputName);

    if (!existsSync(inputPath)) {
      console.error(`  ✗ source missing: ${inputName}`);
      continue;
    }

    const inputSize = statSync(inputPath).size;

    try {
      const image = sharp(inputPath);
      const metadata = await image.metadata();

      // Use quality 80 — good balance for editorial illustration
      await image
        .webp({ quality: 80, effort: 6 })
        .toFile(outputPath);

      const outputSize = statSync(outputPath).size;
      const savings = ((1 - outputSize / inputSize) * 100).toFixed(1);

      results.push({
        file: outputName,
        width: metadata.width,
        height: metadata.height,
        inputKB: (inputSize / 1024).toFixed(0),
        outputKB: (outputSize / 1024).toFixed(0),
        savings: `${savings}%`,
      });

      console.log(`  ✓ ${inputName} → web/${outputName}  (${(inputSize / 1024).toFixed(0)} KB → ${(outputSize / 1024).toFixed(0)} KB, -${savings}%)`);
    } catch (err) {
      console.error(`  ✗ ${inputName}: ${err.message}`);
    }
  }
}

console.log('');
console.log('--- Summary ---');
let totalIn = 0, totalOut = 0;
for (const r of results) {
  totalIn += parseInt(r.inputKB);
  totalOut += parseInt(r.outputKB);
  console.log(`  ${r.file.padEnd(26)} ${r.width}×${r.height}  ${r.inputKB.padStart(5)} KB → ${r.outputKB.padStart(5)} KB  (-${r.savings})`);
}
const totalSavings = ((1 - totalOut / totalIn) * 100).toFixed(1);
console.log(`  ${'─'.repeat(72)}`);
console.log(`  ${'Total:'.padEnd(26)} ${totalIn.toString().padStart(5)} KB → ${totalOut.toString().padStart(5)} KB  (-${totalSavings}%)`);
