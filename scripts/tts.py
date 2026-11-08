"""Lokale Sprachausgabe mit Kokoro-82M (Apache-2.0) – ohne API-Schlüssel.

Modell + Stimmen: https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX
Phonemizer/Tokenizer: Paket `kokoro-onnx` (nur dessen Tokenizer wird genutzt; dessen
`create()` übergibt bei dieser Modellversion `speed` fälschlich als int32).

  python scripts/tts.py --voice Lily --text "Hello there" --out out/hello.wav
  python scripts/tts.py --setup     # Modell + Stimmen nach voices/kokoro laden
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path

import numpy as np
from kokoro_onnx.trim import trim as trim_audio

ROOT = Path(__file__).resolve().parent.parent
KOKORO_DIR = ROOT / "voices" / "kokoro"
HF = "https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main"
SAMPLE_RATE = 24000
MAX_PHONEMES = 510
CHUNK_PHONEMES = 380
# Zentrale Stimmenliste mit Namen (Lily, Bella, Finn, Max) – geteilt mit dem Dashboard
VOICE_INFO = json.loads((Path(__file__).resolve().parent / "voices.json").read_text())
VOICES = [v["id"] for v in VOICE_INFO["voices"]]
VOICE_NAMES = {v["name"].lower(): v["id"] for v in VOICE_INFO["voices"]}


# Weitere Kokoro-Stimmen (nicht in voices.json, daher ohne Dashboard-Namen) dürfen per ID genutzt
# werden, z. B. am_echo, bm_fable. Format laut Modell-Repo: <Sprache><Geschlecht>_<name>.
KOKORO_ID = re.compile(r"^[abefhijpz][fm]_[a-z]+$")


def resolve_voice(name_or_id: str) -> str:
    """'Lily' oder 'af_heart' -> 'af_heart'. Mischung: 'Finn:0.7+Max:0.3' -> 'am_fenrir:0.7+am_puck:0.3'."""
    key = name_or_id.strip()
    if "+" in key or ":" in key:
        return "+".join(f"{resolve_voice(v)}:{w:g}" for v, w in parse_blend(key).items())
    if key in VOICES:
        return key
    if key.lower() in VOICE_NAMES:
        return VOICE_NAMES[key.lower()]
    if KOKORO_ID.match(key):
        return key
    raise ValueError(f"Unbekannte Stimme {name_or_id!r}. Erlaubt: " + ", ".join(f"{v['name']} ({v['id']})" for v in VOICE_INFO["voices"]))


def setup(voices: list[str] = VOICES) -> None:
    """Lädt Modell und Stimmen (per curl, damit ein HTTPS-Proxy genutzt wird)."""
    KOKORO_DIR.mkdir(parents=True, exist_ok=True)
    files = {"model.onnx": f"{HF}/onnx/model.onnx"}
    files.update({f"{v}.bin": f"{HF}/voices/{v}.bin" for v in voices})
    for name, url in files.items():
        target = KOKORO_DIR / name
        if not target.exists():
            print(f"Lade {name} ...")
            subprocess.run(["curl", "-fsSL", "-o", str(target), url], check=True)


def parse_blend(spec: str | dict) -> dict[str, float]:
    """'am_fenrir:0.7+am_puck:0.3' oder {"am_fenrir": 0.7, "am_puck": 0.3} -> normierte Gewichte.
    Ohne Gewicht zählt eine Stimme 1 ('am_fenrir+am_puck' = 50/50)."""
    if isinstance(spec, dict):
        items = [(str(k), float(v)) for k, v in spec.items()]
    else:
        items = []
        for part in spec.split("+"):
            name, _, w = part.strip().partition(":")
            items.append((name.strip(), float(w) if w else 1.0))
    total = sum(w for _, w in items)
    if total <= 0 or any(w < 0 for _, w in items):
        raise ValueError(f"Ungültige Stimmen-Mischung {spec!r}")
    return {n: w / total for n, w in items}


def load_style(spec: str | dict) -> np.ndarray:
    """Stil-Vektoren laden; bei Mischung gewichteter Mittelwert (Kokoro: ein 256er-Vektor pro
    Token-Länge, Form (510, 1, 256)). Fehlende Stimmen werden geladen."""
    weights = parse_blend(spec)
    style = None
    for name, w in weights.items():
        path = KOKORO_DIR / f"{name}.bin"
        if not path.exists():
            setup([name])
        vec = np.fromfile(path, dtype=np.float32).reshape(-1, 1, 256) * w
        style = vec if style is None else style + vec
    return style.astype(np.float32)


# Nachbearbeitung der Stimme (ffmpeg-Filter). Länge bleibt gleich (keine Tempo-/Hall-Fahne).
# Gemessen/begründet in docs/stimme-casting.md.
POST_PRESETS = {
    # Präsenz +3 dB um 3,5 kHz, Schlamm −2 dB um 300 Hz, sanfter Kompressor 3:1
    "lively": "highpass=f=80,equalizer=f=300:t=q:w=1:g=-2,equalizer=f=3500:t=q:w=1.2:g=3,"
              "acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=2",
    # wie lively + leichter kurzer Raum (frühe Reflexionen 23/41 ms, leise)
    "lively-room": "highpass=f=80,equalizer=f=300:t=q:w=1:g=-2,equalizer=f=3500:t=q:w=1.2:g=3,"
                   "acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=2,"
                   "aecho=0.9:0.9:23|41:0.12|0.07",
}


def post_process(audio: np.ndarray, post: str) -> np.ndarray:
    """Audio durch einen ffmpeg-Filter schicken: Preset-Name aus POST_PRESETS oder roher -af-String.
    Ergebnis wird auf die Eingangslänge gebracht (Timing der Untertitel bleibt gültig)."""
    import tempfile

    filt = POST_PRESETS.get(post, post)
    with tempfile.TemporaryDirectory() as tmp:
        src, dst = Path(tmp) / "in.wav", Path(tmp) / "out.wav"
        write_wav(src, audio)
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(src), "-af", filt,
                        "-ar", str(SAMPLE_RATE), "-ac", "1", str(dst)], check=True)
        import soundfile as sf

        out, _ = sf.read(str(dst), dtype="float32")
    out = out[: len(audio)]
    if len(out) < len(audio):
        out = np.pad(out, (0, len(audio) - len(out)))
    peak = float(np.max(np.abs(out))) if len(out) else 0.0
    return out / peak * 0.97 if peak > 0.97 else out


_ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
_TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()


def number_words(n: int) -> str:
    """Ganze Zahl -> englische Wörter (0 .. 999 999 999)."""
    if n < 20:
        return _ONES[n]
    if n < 100:
        return _TENS[n // 10] + ("" if n % 10 == 0 else "-" + _ONES[n % 10])
    if n < 1000:
        rest = n % 100
        return _ONES[n // 100] + " hundred" + ("" if rest == 0 else " " + number_words(rest))
    for size, name in ((1_000_000, "million"), (1000, "thousand")):
        if n >= size:
            rest = n % size
            return number_words(n // size) + " " + name + ("" if rest == 0 else " " + number_words(rest))
    raise ValueError(n)


def year_words(n: int) -> str:
    """Jahreszahl wie gesprochen: 1453 -> "fourteen fifty-three", 476 -> "four seventy-six",
    410 -> "four ten", 1900 -> "nineteen hundred", 2009 -> "two thousand nine"."""
    if n < 100 or n % 1000 < 10 and n >= 1000:
        return number_words(n)
    hi, lo = divmod(n, 100)
    if lo == 0:
        return number_words(hi) + " hundred"
    return number_words(hi) + " " + (("oh " + _ONES[lo]) if lo < 10 else number_words(lo))


def apply_say(text: str, years: list[int] | None = None, say: dict[str, str] | None = None) -> str:
    """Nur für die Sprachausgabe einer Episode (Drehbuch-Felder `years` und `say`):
    - `years`: diese Zahlen als Jahr lesen ("1453" -> "fourteen fifty-three"); "1,453" bleibt eine Menge.
    - `say`: Aussprache-Tabelle, z. B. {"Odoacer": "Odo-acer"} (ganze Wörter, Groß/klein genau).
    Untertitel zeigen weiterhin den Drehbuch-Text."""
    for y in years or []:
        text = re.sub(rf"(?<!\d)(?<!\d[,.]){y}(?!\d|[,.]\d)", year_words(int(y)), text)
    for word, spoken in (say or {}).items():
        text = re.sub(rf"\b{re.escape(word)}\b", spoken, text)
    return text


def speakable(text: str) -> str:
    """Zahlen für die Sprachausgabe ausschreiben.

    Gemessen: Kokoro liest "1,000" als "one zero zero zero". Deshalb werden
    "1,000" -> "one thousand" und "4.6" -> "four point six" umgewandelt.
    Untertitel zeigen weiterhin die Ziffern aus dem Skript.
    """

    def dec(m: re.Match) -> str:
        whole, frac = m.group(1).replace(",", ""), m.group(2)
        return number_words(int(whole)) + " point " + " ".join(_ONES[int(d)] for d in frac)

    text = re.sub(r"(\d[\d,]*)\.(\d+)", dec, text)
    return re.sub(r"\d{1,3}(?:,\d{3})+|\d+", lambda m: number_words(int(m.group(0).replace(",", ""))), text)


class Voice:
    def __init__(self, name: str, speed: float = 1.0, gap: float = 0.12) -> None:
        import onnxruntime as ort
        from kokoro_onnx.tokenizer import Tokenizer

        # Format: float32, (510, 1, 256) – ein Stil-Vektor pro Token-Länge.
        # `name` darf eine Mischung sein: "am_fenrir:0.7+am_puck:0.3" oder ein dict.
        self.style = load_style(name)
        first = next(iter(parse_blend(name)))
        self.lang = "en-gb" if first.startswith("b") else "en-us"
        self.speed = speed
        self.gap = gap
        self.tok = Tokenizer()
        self.sess = ort.InferenceSession(str(KOKORO_DIR / "model.onnx"))

    def _chunk(self, phonemes: str, speed: float | None = None) -> np.ndarray:
        tokens = self.tok.tokenize(phonemes)
        inputs = {
            "input_ids": np.array([[0, *tokens, 0]], dtype=np.int64),
            "style": self.style[len(tokens)],
            "speed": np.array([speed or self.speed], dtype=np.float32),
        }
        return self.sess.run(None, inputs)[0].reshape(-1)

    def synth(self, text: str, speed: float | None = None) -> np.ndarray:
        """Text -> Audio (24 kHz, float32). `speed` überschreibt das Tempo nur für diesen Aufruf.

        Laut VOICES.md des Modells klingen Stimmen bei 100–200 Tokens am besten und
        schwächeln bei sehr kurzen Äußerungen. Deshalb werden Sätze zu Blöcken bis
        CHUNK_PHONEMES gebündelt statt einzeln erzeugt.
        """
        text = speakable(text)
        sentences = [s for s in re.split(r"(?<=[.!?])\s+", text.strip()) if s]
        chunks: list[str] = []
        for s in sentences:
            ph = self.tok.phonemize(s, self.lang)
            if len(ph) > MAX_PHONEMES - 2:
                raise ValueError(f"Satz zu lang für Kokoro: {s!r}")
            if chunks and len(chunks[-1]) + 1 + len(ph) <= CHUNK_PHONEMES:
                chunks[-1] += " " + ph
            else:
                chunks.append(ph)
        parts = []
        for ph in chunks:
            audio, _ = trim_audio(self._chunk(ph, speed))
            parts.append(audio)
            parts.append(np.zeros(int(SAMPLE_RATE * self.gap), dtype=np.float32))
        return np.concatenate(parts[:-1]) if parts else np.zeros(0, dtype=np.float32)


def write_wav(path: Path, audio: np.ndarray, sr: int = SAMPLE_RATE) -> None:
    import soundfile as sf

    path.parent.mkdir(parents=True, exist_ok=True)
    sf.write(str(path), audio, sr)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--setup", action="store_true")
    ap.add_argument("--voice", default=VOICE_INFO["default"],
                    help="Name oder ID, z. B. Lily / af_heart; Mischung: 'am_fenrir:0.7+am_puck:0.3'")
    ap.add_argument("--speed", type=float, default=1.0)
    ap.add_argument("--post", help="Nachbearbeitung: " + ", ".join(POST_PRESETS) + " oder ffmpeg -af-String")
    ap.add_argument("--text")
    ap.add_argument("--out", type=Path)
    a = ap.parse_args()
    if a.setup:
        setup()
    if a.text and a.out:
        audio = Voice(resolve_voice(a.voice), a.speed).synth(a.text)
        if a.post:
            audio = post_process(audio, a.post)
        write_wav(a.out, audio)
        print(f"{a.out}: {len(audio) / SAMPLE_RATE:.2f} s")
