// Erzeugt Captions (Wort-Zeitstempel) aus Audio-/Videodateien mit Whisper.cpp.
// Basiert auf `sub.mjs` aus dem offiziellen Remotion-TikTok-Template.
//
//   npm run transcribe                      -> alle Dateien in public/audio/
//   npm run transcribe -- public/audio/x.mp3 -> nur diese Datei(en)
//
// Ausgabe: public/captions/<dateiname>.json  (Format: Caption[] aus @remotion/captions)
import { execFileSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  downloadWhisperModel,
  installWhisperCpp,
  toCaptions,
  transcribe,
} from "@remotion/install-whisper-cpp";
import {
  WHISPER_LANG,
  WHISPER_MODEL,
  WHISPER_PATH,
  WHISPER_VERSION,
} from "./whisper-config.mjs";

const MEDIA = /\.(mp3|wav|m4a|aac|ogg|flac|mp4|mov|mkv|webm)$/i;
const CAPTIONS_DIR = path.join(process.cwd(), "public", "captions");
const force = process.argv.includes("--force");
const args = process.argv.slice(2).filter((a) => a !== "--force");

const collect = (p) => {
  if (lstatSync(p).isDirectory()) {
    return readdirSync(p).flatMap((e) => collect(path.join(p, e)));
  }
  return MEDIA.test(p) ? [p] : [];
};

const inputs = (args.length ? args : ["public/audio"])
  .map((a) => path.resolve(a))
  .flatMap(collect);

if (inputs.length === 0) {
  console.log(
    "Keine Audio-/Videodateien gefunden. Lege Dateien in public/audio/ ab.",
  );
  process.exit(0);
}

await installWhisperCpp({ to: WHISPER_PATH, version: WHISPER_VERSION });
await downloadWhisperModel({ folder: WHISPER_PATH, model: WHISPER_MODEL });
mkdirSync(CAPTIONS_DIR, { recursive: true });

const tmp = mkdtempSync(path.join(os.tmpdir(), "clips-whisper-"));
try {
  for (const file of inputs) {
    const name = path.basename(file).replace(MEDIA, "");
    const outPath = path.join(CAPTIONS_DIR, `${name}.json`);
    if (existsSync(outPath) && !force) {
      console.log(
        `Übersprungen (existiert, --force zum Überschreiben): ${outPath}`,
      );
      continue;
    }
    console.log(`Transkribiere ${path.relative(process.cwd(), file)} ...`);

    // Whisper.cpp erwartet 16-kHz-WAV. Remotion bringt ein eigenes ffmpeg mit.
    const wav = path.join(tmp, `${name}.wav`);
    execFileSync(
      "npx",
      ["remotion", "ffmpeg", "-i", file, "-ar", "16000", "-ac", "1", wav, "-y"],
      {
        stdio: ["ignore", "ignore", "inherit"],
      },
    );

    const whisperCppOutput = await transcribe({
      inputPath: wav,
      model: WHISPER_MODEL,
      whisperPath: WHISPER_PATH,
      whisperCppVersion: WHISPER_VERSION,
      tokenLevelTimestamps: true,
      splitOnWord: true,
      translateToEnglish: false,
      language: WHISPER_LANG,
      printOutput: false,
    });
    const { captions } = toCaptions({ whisperCppOutput });
    writeFileSync(outPath, JSON.stringify(captions, null, 2) + "\n");
    console.log(
      `-> ${path.relative(process.cwd(), outPath)} (${captions.length} Wörter)`,
    );
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
