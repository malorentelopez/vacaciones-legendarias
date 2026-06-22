#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const BRANDING = path.join(ROOT, "assets/branding");

const PUBLIC_FILES = ["logo-icon.png", "logo-full.png", "logo-favicon.png"];

for (const app of ["player", "admin"]) {
  const appDir = path.join(ROOT, `apps/${app}`);
  for (const file of PUBLIC_FILES) {
    fs.copyFileSync(path.join(BRANDING, file), path.join(appDir, "public", file));
  }
  fs.copyFileSync(path.join(BRANDING, "logo-favicon.png"), path.join(appDir, "src/app/icon.png"));
  fs.copyFileSync(path.join(BRANDING, "logo-favicon.png"), path.join(appDir, "src/app/apple-icon.png"));
  console.log("Synced branding to", app);
}
