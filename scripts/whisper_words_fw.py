"""Wort-Zeitstempel mit faster-whisper – Rückfall, wenn whisper.cpp (scripts/whisper-words.mjs) fehlt.
    .venv/bin/python scripts/whisper_words_fw.py <in.wav 16 kHz mono> <out.json> [sprache] [modell]
Ausgabe wie @remotion/captions: [{text, startMs, endMs, timestampMs, confidence}].
Audio wird mit soundfile geladen und als Array übergeben (Dateipfad scheitert in Cloud-Containern an `av`)."""
import json
import sys

import numpy as np
import soundfile as sf
from faster_whisper import WhisperModel

src, dst = sys.argv[1], sys.argv[2]
lang = sys.argv[3] if len(sys.argv) > 3 else "en"
name = sys.argv[4] if len(sys.argv) > 4 else ("small.en" if lang == "en" else "small")
audio, sr = sf.read(src, dtype="float32")
if audio.ndim > 1:
    audio = audio.mean(axis=1)
if sr != 16000:
    raise SystemExit(f"{src}: erwartet 16 kHz, hat {sr}")
model = WhisperModel(name, device="cpu", compute_type="int8")
segs, _ = model.transcribe(np.ascontiguousarray(audio), language=lang, word_timestamps=True, beam_size=5)
out = []
for s in segs:
    for w in s.words or []:
        a, b = round(w.start * 1000), round(w.end * 1000)
        out.append({"text": w.word if out else w.word.lstrip(), "startMs": a, "endMs": b,
                    "timestampMs": (a + b) // 2, "confidence": round(float(w.probability), 3)})
json.dump(out, open(dst, "w"), indent=1)
print(f"{dst}: {len(out)} Wörter (faster-whisper {name})")
