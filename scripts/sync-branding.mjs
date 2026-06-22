#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const BRANDING = path.join(ROOT, "assets/branding");

const FILES = ["logo-icon.png", "logo-full.png"];

for (const app of ["player", "admin"]) {
  const appDir = path.join(ROOT, `apps/${app}`);
  for (const file of FILES) {
    fs.copyFileSync(path.join(BRANDING, file), path.join(appDir, "public", file));
  }
  fs.copyFileSync(path.join(BRANDING, "logo-icon.png"), path.join(appDir, "src/app/icon.png"));
  fs.copyFileSync(path.join(BRANDING, "logo-icon.png"), path.join(appDir, "src/app/apple-icon.png"));
  console.log("Synced branding to", app);
}
