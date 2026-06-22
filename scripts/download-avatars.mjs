#!/usr/bin/env node
/**
 * Downloads public-domain avatar images from Wikimedia Commons.
 * Sources and licenses: assets/avatars/ATTRIBUTIONS.md
 * Run: node scripts/download-avatars.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const ASSETS = path.join(ROOT, "assets/avatars");
const UA = "VeranoLegendario/1.0 (https://github.com/malorentelopez/vacaciones-legendarias)";

/** asset path -> Wikimedia Commons filename */
const FILES = {
  "adventure/wizard-boy.jpg": "Arthur-Pyle The Enchanter Merlin.JPG",
  "adventure/wizard-girl.jpg": "Wicked Witch2.jpg",
  "adventure/warrior-boy.jpg": "Victor Vasnetsov - Knight at the Crossroads - Google Art Project.jpg",
  "adventure/warrior-girl.jpg": "Jeanne d' Arc (Eugene Thirion).jpg",
  "adventure/archer-boy.jpg": "Howard Pyle pirate illustration.jpg",
  "adventure/archer-girl.jpg": "Diana the Huntress - School of Fontainebleau, attributed to Luca Penni.jpg",
  "adventure/explorer-boy.jpg": "Pirate-cptr1.jpg",
  "adventure/explorer-girl.png": "Alice par John Tenniel 06.png",
  "adventure/mystic-boy.jpg": "Jiraiya - kuniyoshi - japanese heroes for the twelve signs.jpg",
  "adventure/mystic-girl.jpg": "Flying Witch Image.jpg",
  "manga/hero-boy.jpg": "Yamanba and kintaro sakazuki.jpg",
  "manga/hero-girl.png": "Glinda.png",
  "manga/samurai-boy.jpg": "Jiraiya - kuniyoshi - japanese heroes for the twelve signs.jpg",
  "manga/samurai-girl.jpg": "Tomoe Gozen.jpg",
  "manga/mecha-boy.jpg": "Robot by Josef Capek 1921.jpg",
  "manga/mecha-girl.png": "Glinda.png",
  "manga/shinobi-boy.jpg": "Jiraiya - kuniyoshi - japanese heroes for the twelve signs.jpg",
  "manga/shinobi-girl.jpg": "Beauties Playing Cat's Cradle-by Suzuki Harunobu-Tokyo National Museum.jpg",
  "manga/student-boy.jpg": "Yamanba and kintaro sakazuki.jpg",
  "manga/student-girl.png": "Alice par John Tenniel 06.png",
  "ocean/pirate-boy.jpg": "Pirate-cptr1.jpg",
  "ocean/pirate-girl.jpg": "Pirate-cptr1.jpg",
  "ocean/captain-boy.jpg": "Pirate-cptr1.jpg",
  "ocean/captain-girl.jpg": "Pirate-cptr1.jpg",
  "ocean/diver-boy.jpg": "Pirate-cptr1.jpg",
  "ocean/diver-girl.jpg": "Pirate-cptr1.jpg",
  "ocean/angler-boy.jpg": "Pirate-cptr1.jpg",
  "ocean/angler-girl.jpg": "Expo 2010 Denmark Pavilion- Little Mermaid Statue from Copenhagen Harbor 01.jpg",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function fetchBuffer(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function resolveUrl(filename) {
  const api = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(`File:${filename}`)}&prop=imageinfo&iiprop=url&format=json`;
  const data = await fetchJson(api);
  const pages = Object.values(data.query.pages);
  const page = pages[0];
  if (page.missing) return null;
  return page.imageinfo?.[0]?.url ?? null;
}

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

async function main() {
  const urlCache = new Map();
  let ok = 0;
  let fail = 0;

  for (const [assetPath, filename] of Object.entries(FILES)) {
    const out = path.join(ASSETS, assetPath);
    fs.mkdirSync(path.dirname(out), { recursive: true });

    let url = urlCache.get(filename);
    if (!url && !urlCache.has(filename)) {
      await sleep(600);
      url = await resolveUrl(filename);
      urlCache.set(filename, url);
      if (url) console.log("Resolved:", filename);
      else console.warn("Not found on Commons:", filename);
    }

    if (!url) {
      fail++;
      continue;
    }

    try {
      await sleep(400);
      const buf = await fetchBuffer(url);
      fs.writeFileSync(out, buf);
      console.log("OK:", assetPath, `(${Math.round(buf.length / 1024)}KB)`);
      ok++;
    } catch (e) {
      console.warn("FAIL:", assetPath, e.message);
      fail++;
    }
  }

  // Fill gaps by copying closest available image in same theme
  for (const theme of ["adventure", "manga", "ocean"]) {
    const dir = path.join(ASSETS, theme);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".jpg") || f.endsWith(".png"));
    if (files.length === 0) continue;
    const fallback = path.join(dir, files[0]);
    for (const [assetPath] of Object.entries(FILES)) {
      if (!assetPath.startsWith(`${theme}/`)) continue;
      const out = path.join(ASSETS, assetPath);
      if (!fs.existsSync(out)) {
        fs.copyFileSync(fallback, out);
        console.log("FALLBACK:", assetPath, "<-", files[0]);
      }
    }
  }

  console.log(`\nDownloaded ${ok}, failed ${fail}`);

  for (const app of ["player", "admin"]) {
    const dest = path.join(ROOT, `apps/${app}/public/avatars`);
    copyDir(ASSETS, dest);
    console.log("Copied to", dest);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
