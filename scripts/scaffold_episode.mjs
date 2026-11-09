// Episoden-Gerüst: aus episodes/<id>.json eine Szenen-Vorlage mit einer Komponente pro Szene.
//
//   node scripts/scaffold_episode.mjs episodes/<id>.json
//   npm run scaffold -- episodes/<id>.json [--out src/episode/scenes/<name>.tsx] [--prefix Name]
//
// Jede Funktion bekommt als Kommentar: Sprechtext, `visual`, Cues (Wort, Zeit in s, Sticker/Beat/…).
// Zeiten kommen aus public/episodes/<id>/timeline.json (nach make_episode.py); fehlt die Datei,
// stehen nur die Wörter da. Beats werden als `beat("…")`-Schnitte vorbereitet (shotIndex).
// Standard-Ausgabe: src/episode/scenes/<id>-template.tsx. Überschreibt NIE eine vorhandene Datei.
// Danach: Datei umbenennen/aufteilen, Kulissen aus dem Bau-Kit einsetzen, in scenes/index.ts unter
// SCENE_SETS["<id>"] eintragen und die Komposition in src/Root.tsx registrieren (wie RomanEmpire).
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const { values: o, positionals } = parseArgs({
  allowPositionals: true,
  options: { out: { type: "string" }, prefix: { type: "string" } },
});
if (positionals.length !== 1) {
  console.error("Aufruf: node scripts/scaffold_episode.mjs episodes/<id>.json [--out datei.tsx] [--prefix Name]");
  process.exit(1);
}
const epPath = path.resolve(positionals[0]);
const ep = JSON.parse(readFileSync(epPath, "utf8"));
const out = path.resolve(o.out ?? path.join(ROOT, "src/episode/scenes", `${ep.id}-template.tsx`));
if (existsSync(out)) {
  console.error(`Abbruch: ${path.relative(ROOT, out)} existiert bereits (wird nie überschrieben).`);
  process.exit(1);
}

const pascal = (s) =>
  s.split(/[^A-Za-z0-9]+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join("");
const prefix = o.prefix ?? pascal(ep.id);
const constName = `${ep.id.replace(/[^A-Za-z0-9]+/g, "_").toUpperCase()}_SCENES`;
const comment = (s) => String(s).replace(/\*\//g, "* /");
const wrap = (text, width = 92, lead = " *   ") => {
  const lines = [];
  let line = "";
  for (const w of comment(text).split(/\s+/)) {
    if (line && (line + " " + w).length > width) {
      lines.push(line);
      line = w;
    } else line = line ? `${line} ${w}` : w;
  }
  if (line) lines.push(line);
  return lines.map((l) => lead + l).join("\n");
};

// Zeiten aus der Timeline (falls vorhanden). Pro Szene stehen dort zuerst die Drehbuch-Cues in
// Reihenfolge, danach die Akzent-Cues aus *Wort* – daher Zuordnung über die Position.
const tlPath = path.join(ROOT, "public/episodes", ep.id, "timeline.json");
let tl = null;
if (existsSync(tlPath)) {
  tl = JSON.parse(readFileSync(tlPath, "utf8"));
  if (statSync(tlPath).mtimeMs < statSync(epPath).mtimeMs) {
    console.warn("Hinweis: timeline.json ist älter als das Drehbuch – Zeiten evtl. veraltet (make_episode.py neu laufen lassen).");
  }
}
const sec = (ms) => (ms / 1000).toFixed(2);

const describeCue = (c) =>
  Object.entries(c)
    .filter(([k]) => k !== "word")
    .map(([k, v]) => `${k} ${typeof v === "object" ? JSON.stringify(v) : JSON.stringify(v)}`)
    .join(", ");

const blocks = ep.scenes.map((sc, i) => {
  const name = `${prefix}${pascal(sc.id)}`;
  const tScene = tl?.scenes.find((s) => s.id === sc.id);
  const tCues = tl ? tl.cues.filter((c) => c.scene === sc.id) : [];
  const cues = sc.cues ?? [];
  const head = tScene
    ? ` (${sec(tScene.startMs)}–${sec(tScene.endMs)} s, ${sec(tScene.endMs - tScene.startMs)} s)`
    : "";
  const cueLines = cues.map((c, k) => {
    // Episode.tsx lässt die erste Szene bei Frame 0 beginnen (nicht beim Vorlauf)
    const t0 = i === 0 ? 0 : tScene?.startMs;
    const t = tScene && tCues[k] ? `${sec(tCues[k].atMs)} s, lokal ${sec(tCues[k].atMs - t0)} s` : "Zeit offen";
    return wrap(`„${c.word}“ (${t}): ${describeCue(c)}`, 92, " *   ");
  });
  const beats = cues.filter((c) => c.beat).map((c) => c.beat);
  const beatDecl = beats.length
    ? `  // Schnitte an den Beats (lokale Frames): Einstellung 0 bis "${beats[0]}", dann 1, …\n` +
      `  const shot = shotIndex(frame, [${beats.map((b) => `beat("${b}")`).join(", ")}]);\n`
    : "  const shot = 0; // keine Beats in dieser Szene – Einstellungen frei nach frame/duration\n";
  return `/* ${i + 1} — ${sc.id}${head}
 * Text:
${wrap(sc.text)}
 * Visual:
${sc.visual ? wrap(sc.visual) : " *   (kein visual im Drehbuch)"}
 * Cues:
${cueLines.length ? cueLines.join("\n") : " *   (keine)"}
 */
export const ${name}: React.FC = () => {
  const { frame, duration${beats.length ? ", beat" : ""} } = useScene();
${beatDecl}  // TODO: Kulisse/Figuren aus dem Bau-Kit (src/episode/kit/), Hauptfigur im Kostüm des Themas
  return (
    <>
      <color attach="background" args={["#87A8C8"]} />
      <Lights />
      <Toonie frame={frame} position={[0, 0, 0]} />
      <Shot
        frame={frame}
        duration={duration}
        from={[0, 1.6, 8 - shot]}
        to={[0, 1.5, 7 - shot]}
        look={[0, 1.2, 0]}
        fov={40}
      />
    </>
  );
};
`;
});

const usesBeats = ep.scenes.some((sc) => (sc.cues ?? []).some((c) => c.beat));
const key = (id) => (/^[A-Za-z_$][\w$]*$/.test(id) ? id : JSON.stringify(id));
const file = `/**
 * Gerüst für ${path.relative(ROOT, epPath).startsWith("..") ? epPath : path.relative(ROOT, epPath)} („${comment(ep.title ?? ep.id)}“), erzeugt von
 * scripts/scaffold_episode.mjs am ${new Date().toISOString().slice(0, 10)}.${tl ? "" : "\n * Ohne timeline.json erzeugt: Cue-Zeiten offen (erst make_episode.py laufen lassen)."}
 * Vorlage, kein fertiges Video: Platzhalter-Szenen ersetzen; Regeln in docs/clip-regeln.md.
 */
import React from "react";
import { Shot } from "../kit/camera";
import { Lights } from "../kit/props";
import { Toonie } from "../kit/Toonie";
import { ${usesBeats ? "shotIndex, " : ""}useScene } from "../types";

${blocks.join("\n")}
// In scenes/index.ts: SCENE_SETS["${ep.id}"] = ${constName}
export const ${constName}: Record<string, React.FC> = {
${ep.scenes.map((sc) => `  ${key(sc.id)}: ${prefix}${pascal(sc.id)},`).join("\n")}
};
`;

writeFileSync(out, file, { flag: "wx" }); // wx: schlägt fehl, falls die Datei inzwischen existiert
console.log(`Gerüst: ${path.relative(ROOT, out)} (${ep.scenes.length} Szenen${tl ? ", Zeiten aus timeline.json" : ""})`);
