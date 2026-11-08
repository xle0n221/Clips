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


def resolve_voice(name_or_id: str) -> str:
    """'Lily' oder 'af_heart' -> 'af_heart'."""
    key = name_or_id.strip()
    if key in VOICES:
        return key
    if key.lower() in VOICE_NAMES:
        return VOICE_NAMES[key.lower()]
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

        path = KOKORO_DIR / f"{name}.bin"
        if not path.exists():
            setup([name])
        # Format: float32, (510, 1, 256) – ein Stil-Vektor pro Token-Länge.
        self.style = np.fromfile(path, dtype=np.float32).reshape(-1, 1, 256)
        self.lang = "en-gb" if name.startswith("b") else "en-us"
        self.speed = speed
        self.gap = gap
        self.tok = Tokenizer()
        self.sess = ort.InferenceSession(str(KOKORO_DIR / "model.onnx"))

    def _chunk(self, phonemes: str) -> np.ndarray:
        tokens = self.tok.tokenize(phonemes)
        inputs = {
            "input_ids": np.array([[0, *tokens, 0]], dtype=np.int64),
            "style": self.style[len(tokens)],
            "speed": np.array([self.speed], dtype=np.float32),
        }
        return self.sess.run(None, inputs)[0].reshape(-1)

    def synth(self, text: str) -> np.ndarray:
        """Text -> Audio (24 kHz, float32).

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
            audio, _ = trim_audio(self._chunk(ph))
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
    ap.add_argument("--voice", default=VOICE_INFO["default"], help="Name oder ID, z. B. Lily / af_heart")
    ap.add_argument("--speed", type=float, default=1.0)
    ap.add_argument("--text")
    ap.add_argument("--out", type=Path)
    a = ap.parse_args()
    if a.setup:
        setup()
    if a.text and a.out:
        audio = Voice(resolve_voice(a.voice), a.speed).synth(a.text)
        write_wav(a.out, audio)
        print(f"{a.out}: {len(audio) / SAMPLE_RATE:.2f} s")
