// generate-qr-marker.mjs
// Generates a QR code with the MenuVerse logo in the center
// The QR encodes the AR marker page URL so scanning it opens the dish AR experience

import QRCode from 'qrcode';
import Jimp from 'jimp';
import fs from 'fs';

const logoPath    = process.argv[2] || 'public/logo-badge-marker-src.jpg';
const outputPath  = process.argv[3] || 'public/logo-marker.png';
// The QR will encode a generic marker URL; per-dish QR codes are generated client-side
const qrData      = process.argv[4] || 'https://menuverse.app/ar';

const QR_SIZE = 800;         // total output size in px
const LOGO_FRAC = 0.28;      // logo takes up 28% of QR size

async function run() {
  console.log('Generating QR code...');

  // 1. Generate raw QR code as PNG buffer
  const qrBuffer = await QRCode.toBuffer(qrData, {
    errorCorrectionLevel: 'H', // High = 30% damage tolerance (needed for logo cutout)
    width: QR_SIZE,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  });

  // 2. Load QR into Jimp
  const qrImg = await Jimp.read(qrBuffer);

  // 3. Load and process logo
  let logo = await Jimp.read(logoPath);
  const logoSize = Math.round(QR_SIZE * LOGO_FRAC);

  // Make logo square
  const maxDim = Math.max(logo.getWidth(), logo.getHeight());
  const squaredLogo = await new Jimp(maxDim, maxDim, 0xffffffff);
  squaredLogo.composite(logo,
    Math.floor((maxDim - logo.getWidth()) / 2),
    Math.floor((maxDim - logo.getHeight()) / 2)
  );

  // Resize logo to target size
  squaredLogo.resize(logoSize, logoSize, Jimp.RESIZE_BICUBIC);

  // Add white padding around logo (so QR modules around it are readable)
  const padding = Math.round(logoSize * 0.08);
  const paddedSize = logoSize + padding * 2;
  const paddedLogo = await new Jimp(paddedSize, paddedSize, 0xffffffff);
  paddedLogo.composite(squaredLogo, padding, padding);

  // 4. Overlay padded logo centered on QR
  const ox = Math.floor((QR_SIZE - paddedSize) / 2);
  const oy = Math.floor((QR_SIZE - paddedSize) / 2);
  qrImg.composite(paddedLogo, ox, oy);

  // 5. Save
  await qrImg.writeAsync(outputPath);
  console.log('Saved QR marker:', outputPath);
  console.log('Done!');
}

run().catch(err => { console.error(err); process.exit(1); });
