// generate-patt-bw.mjs
// Converts logo to high-contrast B&W then generates AR.js .patt + printable marker

import Jimp from 'jimp';
import fs from 'fs';

const inputPath  = process.argv[2] || 'public/logo-badge-marker-src.jpg';
const pattPath   = process.argv[3] || 'public/logo.patt';
const markerPath = process.argv[4] || 'public/logo-marker.png';

const PATT_SIZE   = 16;
const BORDER_FRAC = 0.25;
const THRESHOLD   = 180; // pixels brighter than this → white, darker → black

async function run() {
  console.log('Reading:', inputPath);
  let img = await Jimp.read(inputPath);
  const imgW = img.getWidth();
  const imgH = img.getHeight();

  // ── 1. Make square ────────────────────────────────────────────────────────
  const size = Math.max(imgW, imgH);
  const squared = await new Jimp(size, size, 0xffffffff);
  squared.composite(img, Math.floor((size - imgW) / 2), Math.floor((size - imgH) / 2));

  // ── 2. Convert to high-contrast B&W ───────────────────────────────────────
  squared.greyscale();
  // Threshold: bright pixels → white, dark pixels → black
  squared.scan(0, 0, squared.getWidth(), squared.getHeight(), function (x, y, idx) {
    const lum = this.bitmap.data[idx]; // greyscale so R=G=B
    const val = lum < THRESHOLD ? 0 : 255;
    this.bitmap.data[idx]     = val; // R
    this.bitmap.data[idx + 1] = val; // G
    this.bitmap.data[idx + 2] = val; // B
    // alpha unchanged
  });

  // ── 3. Add black border (AR.js requirement) ────────────────────────────────
  const border = Math.round(size * BORDER_FRAC);
  const markerSize = size + border * 2;
  const markerImg = await new Jimp(markerSize, markerSize, 0x000000ff);
  markerImg.composite(squared, border, border);

  // ── 4. Save printable marker PNG ──────────────────────────────────────────
  await markerImg.writeAsync(markerPath);
  console.log('Saved marker PNG:', markerPath);

  // ── 5. Sample interior at 16×16 for .patt generation ──────────────────────
  const interior = squared.clone().resize(PATT_SIZE, PATT_SIZE, Jimp.RESIZE_BICUBIC);
  // Re-threshold after resize to keep it crisp
  interior.scan(0, 0, PATT_SIZE, PATT_SIZE, function (x, y, idx) {
    const val = this.bitmap.data[idx] < 128 ? 0 : 255;
    this.bitmap.data[idx] = this.bitmap.data[idx + 1] = this.bitmap.data[idx + 2] = val;
  });

  function getPixels(jimpImg) {
    const rows = [];
    for (let y = 0; y < PATT_SIZE; y++) {
      const row = [];
      for (let x = 0; x < PATT_SIZE; x++) {
        const hex = jimpImg.getPixelColor(x, y);
        row.push({
          r: (hex >>> 24) & 0xff,
          g: (hex >>> 16) & 0xff,
          b: (hex >>>  8) & 0xff,
        });
      }
      rows.push(row);
    }
    return rows;
  }

  function channelBlock(pixels, ch) {
    return pixels.map(row => row.map(p => p[ch]).join(' ')).join('\n');
  }

  const blocks = [];
  for (const deg of [0, 90, 180, 270]) {
    const rotated = interior.clone().rotate(-deg);
    const px = getPixels(rotated);
    blocks.push([channelBlock(px, 'r'), channelBlock(px, 'g'), channelBlock(px, 'b')].join('\n\n'));
  }

  fs.writeFileSync(pattPath, blocks.join('\n\n') + '\n', 'utf8');
  console.log('Saved .patt file:', pattPath);
  console.log('Done! High-contrast B&W marker generated.');
}

run().catch(err => { console.error(err); process.exit(1); });
