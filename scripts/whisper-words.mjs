// Wort-Zeitstempel für eine WAV-Datei (16 kHz mono) mit Whisper.cpp.
//   node scripts/whisper-words.mjs <in.wav> <out.json> [sprache]
// Ausgabe: Caption[] aus @remotion/captions.
import { writeFileSync } from "node:fs";
import { toCaptions, transcribe } from "@remotion/install-whisper-cpp";
import { WHISPER_MODEL, WHISPER_PATH, WHISPER_VERSION } from "./whisper-config.mjs";

const [input, output, language = "en"] = process.argv.slice(2);
if (!input || !output) {
  console.error("Aufruf: node scripts/whisper-words.mjs <in.wav> <out.json> [sprache]");
  process.exit(1);
}

const whisperCppOutput = await transcribe({
  inputPath: input,
  model: WHISPER_MODEL,
  whisperPath: WHISPER_PATH,
  whisperCppVersion: WHISPER_VERSION,
  tokenLevelTimestamps: true,
  splitOnWord: true,
  translateToEnglish: false,
  language,
  printOutput: false,
});
const { captions } = toCaptions({ whisperCppOutput });
writeFileSync(output, JSON.stringify(captions, null, 2) + "\n");
console.log(`${output}: ${captions.length} Wörter`);
