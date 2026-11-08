import path from "node:path";

// Hier wird Whisper.cpp installiert (per .gitignore vom Repo ausgeschlossen).
export const WHISPER_PATH = path.join(process.cwd(), "whisper.cpp");

// Whisper.cpp-Version (Standard aus dem offiziellen Remotion-TikTok-Template).
// "large-v3-turbo" setzt Whisper.cpp >= 1.7.2 voraus.
export const WHISPER_VERSION = "1.6.0";

// Modell – Größe / RAM laut Remotion-Template:
// | tiny    75 MB  ~390 MB | base   142 MB ~500 MB | small 466 MB ~1.0 GB |
// | medium 1.5 GB  ~2.6 GB | large-v3 2.9 GB ~4.7 GB                      |
// Modelle mit ".en" sind NUR Englisch – für Deutsch ein Modell ohne ".en" wählen.
/** @type {import('@remotion/install-whisper-cpp').WhisperModel} */
export const WHISPER_MODEL = "medium";

// Sprache der Aufnahme ("de" = Deutsch, "en" = Englisch, ...).
/** @type {import('@remotion/install-whisper-cpp').Language} */
export const WHISPER_LANG = "de";
