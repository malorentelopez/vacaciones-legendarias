#!/usr/bin/env node
/**
 * Generates square PWA icons from logo-icon.png.
 * Run: pnpm pwa:icons
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const BRANDING = path.join(ROOT, "assets/branding");
const SOURCE = path.join(BRANDING, "logo-icon.png");
const THEME_FILE = path.join(ROOT, "apps/player/src/config/theme.json");
const OUTPUT_DIR = path.join(BRANDING, "pwa");

const ICONS = [
  { name: "icon-192.png", size: 192, inset: 0.12 },
  { name: "icon-512.png", size: 512, inset: 0.12 },
  { name: "icon-512-maskable.png", size: 512, inset: 0.22 },
  { name: "apple-touch-icon.png", size: 180, inset: 0.12 },
];

async function generateIcon(background, { name, size, inset }) {
  const logoSize = Math.round(size * (1 - inset * 2));
  const logo = await sharp(SOURCE)
    .resize(logoSize, logoSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const offset = Math.round((size - logoSize) / 2);
  const icon = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })
    .composite([{ input: logo, top: offset, left: offset }])
    .png({ compressionLevel: 9 })
    .toBuffer();

  return { name, icon };
}

async function main() {
  if (!fs.existsSync(SOURCE)) {
    console.error("Missing source icon:", SOURCE);
    process.exit(1);
  }

  const { themeColor } = JSON.parse(fs.readFileSync(THEME_FILE, "utf8"));
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const generated = await Promise.all(ICONS.map((icon) => generateIcon(themeColor, icon)));

  for (const { name, icon } of generated) {
    fs.writeFileSync(path.join(OUTPUT_DIR, name), icon);
  }

  console.log("Generated PWA icons:", generated.map(({ name }) => name).join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
