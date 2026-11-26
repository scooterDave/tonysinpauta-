// One-off brand media preparation. Reads originals from assets-src/ and writes
// web-ready sources to src/assets/ (Astro optimizes these further at build time)
// plus the static share/touch icons in public/. Re-run with: npm run media:prepare
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

const SRC = 'assets-src/brand-references';
const OUT = 'src/assets';
const BG = { r: 8, g: 10, b: 18 }; // --bg-canvas #080A12

await mkdir(`${OUT}/brand`, { recursive: true });
await mkdir(`${OUT}/interviews`, { recursive: true });
await mkdir('public', { recursive: true });

// The only logo file is a JPEG baked onto black. Treat black as transparency:
// alpha comes from brightness and colour is un-multiplied so glows keep their tint.
async function extractLogo() {
  const { data, info } = await sharp(`${SRC}/channel-avatar-logo.jpg`)
    .extract({ left: 12, top: 226, width: 884, height: 418 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, o = 0; i < data.length; i += info.channels, o += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const m = Math.max(r, g, b);
    const a = m <= 14 ? 0 : Math.min(1, (m - 14) / 56);
    out[o] = a ? Math.min(255, r / a) : 0;
    out[o + 1] = a ? Math.min(255, g / a) : 0;
    out[o + 2] = a ? Math.min(255, b / a) : 0;
    out[o + 3] = Math.round(a * 255);
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ threshold: 1 })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

const logo = await extractLogo();
await writeFile(`${OUT}/brand/logo-tony-sin-pauta.png`, logo);

// Crops stop above the poster's own baked-in logo so the page never shows it twice.
await sharp(`${SRC}/promo-nyc-skyline-live.jpg`)
  .extract({ left: 238, top: 0, width: 804, height: 452 })
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile(`${OUT}/brand/tony-poster-nyc.jpg`);

await sharp(`${SRC}/promo-weekend-schedule-live.jpg`)
  .extract({ left: 0, top: 96, width: 520, height: 624 })
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(`${OUT}/brand/tony-traje.jpg`);

await sharp(`${SRC}/thumb-interview-fuertes-declaraciones.jpg`)
  .extract({ left: 0, top: 60, width: 640, height: 360 })
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(`${OUT}/interviews/EgkuvLNsaxM.jpg`);

await sharp(`${SRC}/thumb-studio-l-manuel.jpg`)
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(`${OUT}/interviews/Q31mv5iZtQQ.jpg`);

// No local reference exists for the Daniel Monción interview; use YouTube's 640px still.
const monRes = await fetch('https://i.ytimg.com/vi/6dUjwZ8fNdU/sddefault.jpg');
if (!monRes.ok) throw new Error(`thumbnail download failed: ${monRes.status}`);
await sharp(Buffer.from(await monRes.arrayBuffer()))
  .extract({ left: 0, top: 60, width: 640, height: 360 })
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(`${OUT}/interviews/6dUjwZ8fNdU.jpg`);

await sharp(`${SRC}/promo-nyc-skyline-live.jpg`)
  .extract({ left: 210, top: 0, width: 861, height: 452 })
  .resize(1200, 630, { fit: 'cover' })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile('public/og-image.jpg');

const touchLogo = await sharp(logo).resize({ width: 164 }).toBuffer();
const touchMeta = await sharp(touchLogo).metadata();
await sharp({ create: { width: 180, height: 180, channels: 4, background: { ...BG, alpha: 1 } } })
  .composite([{ input: touchLogo, left: 8, top: Math.round((180 - touchMeta.height) / 2) }])
  .png({ compressionLevel: 9 })
  .toFile('public/apple-touch-icon.png');

console.log('media prepared');
