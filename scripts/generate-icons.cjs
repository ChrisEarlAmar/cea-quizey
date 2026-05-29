const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE = path.resolve(__dirname, '..', 'public', 'logo.png');
const RES_DIR = path.resolve(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

// Android mipmap densities and their icon sizes (px)
const DENSITIES = {
  'mipmap-ldpi': 36,
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

// Adaptive icon foreground: inner 66.6% of the icon size (leaving 16.7% inset each side)
const ADAPTIVE_FOREGROUND_SCALE = 0.666;

async function generateIcons() {
  const logo = sharp(SOURCE);
  const meta = await logo.metadata();
  console.log(`Source: ${meta.width}x${meta.height}`);

  for (const [density, size] of Object.entries(DENSITIES)) {
    const dir = path.join(RES_DIR, density);
    fs.mkdirSync(dir, { recursive: true });

    // --- ic_launcher.png (simple launcher icon) ---
    await sharp(SOURCE)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(path.join(dir, 'ic_launcher.png'));
    console.log(`  ${density}/ic_launcher.png (${size}x${size})`);

    // --- ic_launcher_round.png (round icon, same as launcher) ---
    await sharp(SOURCE)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(path.join(dir, 'ic_launcher_round.png'));
    console.log(`  ${density}/ic_launcher_round.png (${size}x${size})`);

    // --- ic_launcher_foreground.png (adaptive icon foreground, with safe-zone padding) ---
    const fgSize = Math.round(size * ADAPTIVE_FOREGROUND_SCALE);
    await sharp(SOURCE)
      .resize(fgSize, fgSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .extend({
        top: Math.round((size - fgSize) / 2),
        bottom: Math.round((size - fgSize) / 2),
        left: Math.round((size - fgSize) / 2),
        right: Math.round((size - fgSize) / 2),
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toFile(path.join(dir, 'ic_launcher_foreground.png'));
    console.log(`  ${density}/ic_launcher_foreground.png (${fgSize}x${fgSize} padded to ${size}x${size})`);

    // --- ic_launcher_background.png (solid white background for adaptive icon) ---
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .png()
      .toFile(path.join(dir, 'ic_launcher_background.png'));
    console.log(`  ${density}/ic_launcher_background.png (${size}x${size} white)`);
  }

  console.log('\nDone! All icons regenerated from Quizey logo.');
}

generateIcons().catch(console.error);
