import { readFileSync } from "node:fs";
import { BAU_SHOTS, bauCuts } from "/home/user/Clips/src/episode/scenes/bauarbeiterCuts.ts";
const t = JSON.parse(readFileSync("/home/user/Clips/public/episodes/bauarbeiter/timeline.json", "utf8"));
const caps = JSON.parse(readFileSync("/home/user/Clips/public/episodes/bauarbeiter/captions.json", "utf8"));
const plan = JSON.parse(readFileSync("/home/user/Clips/episodes/bauarbeiter.json", "utf8"));
const F = 30, toF = (ms: number) => Math.round((ms / 1000) * F);
const last = t.scenes[t.scenes.length - 1].endMs;
const total = Math.ceil((Math.max(t.durationMs, last + t.endCard.seconds * 1000) / 1000) * F);
const endCard = toF(last);
const starts = t.scenes.map((s: any, i: number) => (i === 0 ? 0 : toF(s.startMs)));
const all: number[] = [];
let n = 0;
t.scenes.forEach((s: any, i: number) => {
  const end = i + 1 < starts.length ? starts[i + 1] : endCard; // Szene bis End-Card (End-Card zählt nicht als Shot)
  const dur = (i + 1 < starts.length ? starts[i + 1] : total) - starts[i];
  const beats: Record<string, number> = {};
  for (const c of t.cues) if (c.scene === s.id && c.beat) beats[c.beat] = toF(c.atMs) - starts[i];
  const cuts = bauCuts(s.id, (b) => (b in beats ? beats[b] : 1e9), dur);
  const edges = [0, ...cuts, end - starts[i]];
  for (let k = 0; k + 1 < edges.length; k++) {
    const len = (edges[k + 1] - edges[k]) / F;
    all.push(len);
    n++;
    console.log(`${String(n).padStart(2)} ${s.id.padEnd(8)} ${((starts[i] + edges[k]) / F).toFixed(2).padStart(6)}s  ${len.toFixed(2)} s  ${BAU_SHOTS[s.id].names[k] ?? "?"}${len > 4 ? "  <-- > 4 s" : ""}`);
  }
});
const avg = all.reduce((a, b) => a + b, 0) / all.length;
console.log(`Shots ${all.length}, Ø ${avg.toFixed(2)} s, max ${Math.max(...all).toFixed(2)} s, min ${Math.min(...all).toFixed(2)} s, > 4 s: ${all.filter((x) => x > 4).length}`);
// Phrasen
const ph: string[] = plan.scenes.flatMap((s: any) => s.captions);
const words = caps.filter((c: any) => c.text.replace(/[^A-Za-z0-9]/g, "") !== "");
let i = 0;
const lens: number[] = [], durs: number[] = [];
for (let k = 0; k < ph.length; k++) {
  const w = ph[k].split(/\s+/).filter((x) => x.replace(/[^A-Za-z0-9]/g, "") !== "").length;
  const seg = words.slice(i, i + w);
  const next = words[i + w];
  const endMs = next ? Math.min(next.startMs, seg[seg.length - 1].endMs + 500) : seg[seg.length - 1].endMs + 500;
  lens.push(w); durs.push((endMs - seg[0].startMs) / 1000); i += w;
}
const hist: Record<number, number> = {};
lens.forEach((l) => (hist[l] = (hist[l] ?? 0) + 1));
console.log(`Phrasen ${ph.length}, Wörter ${lens.reduce((a, b) => a + b, 0)} / captions ${words.length} (Abgleich ${i === words.length ? "OK" : "FEHLER"}), Wörter je Phrase min ${Math.min(...lens)} max ${Math.max(...lens)} Ø ${(lens.reduce((a, b) => a + b, 0) / lens.length).toFixed(2)}, Verteilung ${JSON.stringify(hist)}`);
console.log(`Anzeigedauer je Phrase: min ${Math.min(...durs).toFixed(2)} s, max ${Math.max(...durs).toFixed(2)} s, Ø ${(durs.reduce((a, b) => a + b, 0) / durs.length).toFixed(2)} s`);
console.log("außerhalb 2–5:", ph.filter((_, k) => lens[k] < 2 || lens[k] > 5).join(" | "));
