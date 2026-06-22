#!/usr/bin/env node
/**
 * Syncs avatar images from assets/avatars to player and admin public folders.
 * Run after adding or replacing images in assets/avatars/.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const ASSETS = path.join(ROOT, "assets/avatars");

function copyDir(src, dest) {
  if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true });
  fs.mkdirSync(dest, { recursive: true });
  for (const theme of fs.readdirSync(src)) {
    if (theme.startsWith(".") || theme.endsWith(".md")) continue;
    const themeSrc = path.join(src, theme);
    if (!fs.statSync(themeSrc).isDirectory()) continue;
    const themeDest = path.join(dest, theme);
    fs.mkdirSync(themeDest, { recursive: true });
    for (const file of fs.readdirSync(themeSrc)) {
      fs.copyFileSync(path.join(themeSrc, file), path.join(themeDest, file));
    }
  }
}

for (const app of ["player", "admin"]) {
  const dest = path.join(ROOT, `apps/${app}/public/avatars`);
  copyDir(ASSETS, dest);
  console.log("Synced to", dest);
}
