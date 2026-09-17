// One-off (and reusable) image optimization pass.
// Run with: node scripts/optimize-images.mjs
//
// Resizes/recompresses source images to sizes that actually match where
// they're displayed in the app, without changing crop or aspect ratio.

import sharp from 'sharp';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// Hero background slides: full-bleed, object-cover. 1920px wide covers any
// realistic viewport; converted to WebP for a large size reduction.
const heroImages = [
  'assets/msk_bigg_6-bearbeitet.jpg',
  'assets/dslr_camera_lens_original_669131.jpg',
  'assets/Dashboard.jpg',
  'assets/Mond.jpg',
];

// Small UI icons rendered at 40x40 or smaller — resize to 2x for retina and
// compress hard, keep PNG for transparency.
const smallIcons = [
  { file: 'assets/cammicon.png', size: 80 },
  { file: 'assets/cam.png', size: 80 },
  { file: 'assets/editing.png', size: 80 },
  { file: 'assets/house.png', size: 80 },
  { file: 'public/Zahnrad.png', size: 80 },
];

async function optimizeHeroImage(relPath) {
  const absPath = path.join(root, relPath);
  const outPath = absPath.replace(/\.(jpe?g|png)$/i, '.webp');
  const buffer = await readFile(absPath);
  const before = buffer.length;

  const optimized = await sharp(buffer)
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 75 })
    .toBuffer();

  await writeFile(outPath, optimized);
  await unlink(absPath);

  console.log(
    `${relPath} -> ${path.basename(outPath)}: ${(before / 1024).toFixed(0)}KB -> ${(optimized.length / 1024).toFixed(0)}KB`
  );
}

async function optimizeIcon({ file, size }) {
  const absPath = path.join(root, file);
  const buffer = await readFile(absPath);
  const before = buffer.length;

  const optimized = await sharp(buffer)
    .resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true })
    .png({ quality: 80, compressionLevel: 9 })
    .toBuffer();

  await writeFile(absPath, optimized);

  console.log(`${file}: ${(before / 1024).toFixed(0)}KB -> ${(optimized.length / 1024).toFixed(0)}KB`);
}

for (const img of heroImages) {
  await optimizeHeroImage(img);
}

for (const icon of smallIcons) {
  await optimizeIcon(icon);
}

console.log('Done.');
