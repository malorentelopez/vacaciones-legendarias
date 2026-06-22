#!/usr/bin/env node
/**
 * Removes baked-in backgrounds from logo PNGs (black, navy, checkerboard fake transparency).
 * Run: pnpm branding:process
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BRANDING = path.join(__dirname, "../assets/branding");

const FILES = ["logo-full.png", "logo-icon.png", "logo-favicon.png"];

function isBackground(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const spread = max - min;

  // Pure/near black or dark navy
  if (max < 40) return true;
  if (max < 55 && spread < 25) return true;

  // AI "transparent" checkerboard: light gray + white tiles (low saturation, high lightness)
  if (min >= 168 && spread <= 10) return true;
  if (max >= 200 && spread <= 6) return true;

  return false;
}

async function makeTransparent(filePath) {
  const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  let removed = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (isBackground(data[i], data[i + 1], data[i + 2])) {
      data[i + 3] = 0;
      removed++;
    }
  }

  const tmp = filePath + ".tmp";
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(tmp);
  fs.renameSync(tmp, filePath);
  console.log(`Transparent: ${path.basename(filePath)} (${removed} px removed)`);
}

async function main() {
  for (const file of FILES) {
    const filePath = path.join(BRANDING, file);
    if (fs.existsSync(filePath)) {
      await makeTransparent(filePath);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
