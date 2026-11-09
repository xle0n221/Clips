// Kontaktabzug einer Komposition: N Standbilder per renderStill, beschriftet, als ein JPG.
//
//   npm run contactsheet -- --comp SolarSystem --every 10 --scale 0.25
//   npm run contactsheet -- --comp RomanEmpire --per-scene 3
//   npm run contactsheet -- --comp SolarSystem --at 0.8,7.75,11 --out out/sticker-check.jpg
//   npm run contactsheet -- --comp OverlayDemo --every 1 --bundle out/bundle   (Bundle wiederverwenden)
//
// Optionen
//   --comp <id>          Komposition (Standard SolarSystem)
//   --props '<json>'     Input-Props, z. B. '{"episode":"roman-empire"}'
//   --every <s>          ein Bild alle s Sekunden (ab s/2, damit nicht nur Szenenanfänge kommen)
//   --per-scene <n>      n Bilder je Szene aus public/episodes/<episode>/timeline.json
//                        (bei (k+0.5)/n der Szenendauer); braucht eine Episode-Komposition
//   --at <s,s,...>       genau diese Sekunden
//   --scale <x>          Bildgröße (Standard 0.25 → 270×480 bei 1080×1920)
//   --cols <n>           Spalten (Standard 6)
//   --out <datei.jpg>    Standard out/contactsheet-<comp>.jpg
//   --bundle <dir>       vorhandenes Bundle (npx remotion bundle --out-dir <dir>) statt neu bündeln
//   --keep <dir>         Einzelbilder zusätzlich in diesem Ordner behalten
//
// Bündelt höchstens einmal pro Aufruf und nutzt einen Browser für alle Bilder.
// Browser: vorinstalliertes Chromium-Headless-Shell (CHROME_PATH überschreibt), GL "swangle" (ohne GPU).
import { bundle } from "@remotion/bundler";
import {
  openBrowser,
  renderStill,
  selectComposition,
} from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DEFAULT_CHROME =
  "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";

const { values: o } = parseArgs({
  options: {
    comp: { type: "string", default: "SolarSystem" },
    props: { type: "string", default: "{}" },
    every: { type: "string" },
    "per-scene": { type: "string" },
    at: { type: "string" },
    scale: { type: "string", default: "0.25" },
    cols: { type: "string", default: "6" },
    out: { type: "string" },
    bundle: { type: "string" },
    keep: { type: "string" },
  },
});

const modes = ["every", "per-scene", "at"].filter((k) => o[k] !== undefined);
if (modes.length !== 1) {
  console.error("Genau eine von --every, --per-scene, --at angeben.");
  process.exit(1);
}
const scale = Number(o.scale);
const cols = Math.max(1, Number(o.cols));
const out = path.resolve(o.out ?? `out/contactsheet-${o.comp}.jpg`);
const inputProps = JSON.parse(o.props);
const chrome = process.env.CHROME_PATH ?? DEFAULT_CHROME;
const t0 = Date.now();
const secs = (t) => ((Date.now() - t) / 1000).toFixed(1);

// 1. Bundle (einmal) ------------------------------------------------------------
let serveUrl = o.bundle ? path.resolve(o.bundle) : null;
if (!serveUrl) {
  const tb = Date.now();
  serveUrl = await bundle({
    entryPoint: path.join(ROOT, "src/index.ts"),
    rspack: true, // wie remotion.config.ts (Config.setRspack)
    onProgress: () => {},
  });
  console.log(`Bundle: ${secs(tb)} s`);
}

const browser = await openBrowser("chrome", {
  browserExecutable: chrome,
  chromiumOptions: { gl: "swangle" },
});
const renderOpts = { browserExecutable: chrome, chromiumOptions: { gl: "swangle" } };

try {
  const composition = await selectComposition({
    serveUrl,
    id: o.comp,
    inputProps,
    puppeteerInstance: browser,
    ...renderOpts,
  });
  const { fps, durationInFrames } = composition;
  const props = { ...composition.props, ...inputProps };

  // Szenen aus der Timeline (für Beschriftung und --per-scene), falls Episode-Komposition
  let scenes = [];
  const tlPath = props.episode
    ? path.join(ROOT, "public/episodes", props.episode, "timeline.json")
    : null;
  if (tlPath && existsSync(tlPath)) {
    scenes = JSON.parse(readFileSync(tlPath, "utf8")).scenes;
  }
  const sceneAt = (ms) =>
    scenes.find((s, i) => ms < s.endMs || i === scenes.length - 1)?.id ?? "";

  // 2. Zeitpunkte -----------------------------------------------------------------
  let times = []; // Sekunden
  if (o.every) {
    const step = Number(o.every);
    for (let t = step / 2; t * fps < durationInFrames; t += step) times.push(t);
  } else if (o.at) {
    times = o.at.split(",").map(Number);
  } else {
    if (!scenes.length) {
      console.error(`--per-scene braucht public/episodes/<episode>/timeline.json (Prop episode: ${props.episode ?? "–"})`);
      process.exit(1);
    }
    const n = Number(o["per-scene"]);
    for (const s of scenes) {
      for (let k = 0; k < n; k++) {
        times.push((s.startMs + ((s.endMs - s.startMs) * (k + 0.5)) / n) / 1000);
      }
    }
  }
  const frames = times
    .map((t) => Math.min(durationInFrames - 1, Math.max(0, Math.round(t * fps))))
    .filter((f, i, a) => a.indexOf(f) === i);

  // 3. Standbilder ------------------------------------------------------------------
  const tmp = mkdtempSync(path.join(os.tmpdir(), "contactsheet-"));
  const tr = Date.now();
  for (const [i, frame] of frames.entries()) {
    const raw = path.join(tmp, `raw_${String(i).padStart(4, "0")}.jpg`);
    await renderStill({
      composition,
      serveUrl,
      frame,
      output: raw,
      imageFormat: "jpeg",
      jpegQuality: 85,
      scale,
      inputProps: props,
      puppeteerInstance: browser,
      ...renderOpts,
    });
    // Beschriftung: Szenen-ID + Sekunde (+ Frame), oben links
    const sec = (frame / fps).toFixed(1);
    const label = [sceneAt((frame / fps) * 1000), `${sec}s`, `f${frame}`]
      .filter(Boolean)
      .join("  ")
      .replace(/[:'\\%]/g, "");
    const size = Math.max(14, Math.round(1920 * scale * 0.04));
    const font = existsSync(FONT) ? `fontfile=${FONT}:` : "";
    execFileSync("ffmpeg", [
      "-loglevel", "error", "-y", "-i", raw,
      "-vf", `drawtext=${font}text='${label}':fontsize=${size}:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=6:x=8:y=8`,
      path.join(tmp, `lab_${String(i).padStart(4, "0")}.jpg`),
    ]);
    process.stdout.write(`\r  Bild ${i + 1}/${frames.length} (Frame ${frame})   `);
  }
  console.log(`\nStandbilder: ${frames.length} in ${secs(tr)} s (${(((Date.now() - tr) / 1000) / frames.length).toFixed(1)} s/Bild)`);

  // 4. Kachel-Bild ------------------------------------------------------------------
  const rows = Math.ceil(frames.length / cols);
  const c = Math.min(cols, frames.length);
  mkdirSync(path.dirname(out), { recursive: true });
  execFileSync("ffmpeg", [
    "-loglevel", "error", "-y", "-framerate", "1",
    "-i", path.join(tmp, "lab_%04d.jpg"),
    "-vf", `tile=${c}x${rows}:padding=4:margin=4:color=0x202020`,
    "-frames:v", "1", "-q:v", "3", out,
  ]);
  if (o.keep) {
    mkdirSync(o.keep, { recursive: true });
    for (const [i] of frames.entries()) {
      const name = `lab_${String(i).padStart(4, "0")}.jpg`;
      copyFileSync(path.join(tmp, name), path.join(o.keep, name));
    }
  }
  rmSync(tmp, { recursive: true, force: true });
  console.log(`Kontaktabzug: ${path.relative(process.cwd(), out)} (${c}×${rows}, ${frames.length} Bilder), gesamt ${secs(t0)} s`);
} finally {
  await browser.close({ silent: true });
}
