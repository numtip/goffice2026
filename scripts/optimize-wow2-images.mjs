/**
 * Optimize WOW2 category images to WebP.
 * Preserves original PNGs — creates WebP derivatives alongside them.
 *
 * Usage: node scripts/optimize-wow2-images.mjs
 */

import { readdirSync, statSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WOW2_DIR = resolve(__dirname, '../public/images/dashboard/wow2/');

if (!existsSync(WOW2_DIR)) {
  console.error('WOW2 directory not found:', WOW2_DIR);
  process.exit(1);
}

const files = readdirSync(WOW2_DIR).filter(f => /^catagory\d+\.png$/i.test(f));

if (files.length === 0) {
  console.log('No catagory PNG files found.');
  process.exit(0);
}

console.log(`Found ${files.length} category PNGs to optimize.`);
console.log('');

const results = [];

for (const file of files) {
  const inputPath = join(WOW2_DIR, file);
  const outputName = file.replace(/\.png$/i, '.webp');
  const outputPath = join(WOW2_DIR, outputName);

  const inputSize = statSync(inputPath).size;

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // Use quality 80 — good balance for environmental photography
    await image
      .webp({ quality: 80, effort: 6 })
      .toFile(outputPath);

    const outputSize = statSync(outputPath).size;
    const savings = ((1 - outputSize / inputSize) * 100).toFixed(1);

    results.push({
      file,
      webp: outputName,
      width: metadata.width,
      height: metadata.height,
      inputKB: (inputSize / 1024).toFixed(0),
      outputKB: (outputSize / 1024).toFixed(0),
      savings: `${savings}%`,
    });

    console.log(`  ✓ ${file} → ${outputName}  (${(inputSize / 1024).toFixed(0)} KB → ${(outputSize / 1024).toFixed(0)} KB, -${savings}%)`);
  } catch (err) {
    console.error(`  ✗ ${file}: ${err.message}`);
  }
}

console.log('');
console.log('--- Summary ---');
let totalIn = 0, totalOut = 0;
for (const r of results) {
  totalIn += parseInt(r.inputKB);
  totalOut += parseInt(r.outputKB);
  console.log(`  ${r.file.padEnd(18)} ${r.width}×${r.height}  ${r.inputKB.padStart(5)} KB → ${r.outputKB.padStart(5)} KB  (-${r.savings})`);
}
const totalSavings = ((1 - totalOut / totalIn) * 100).toFixed(1);
console.log(`  ${'─'.repeat(58)}`);
console.log(`  ${'Total:'.padEnd(18)} ${totalIn.toString().padStart(5)} KB → ${totalOut.toString().padStart(5)} KB  (-${totalSavings}%)`);
