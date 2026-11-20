"""Hupe (eigene Synthese, die earshot-Bank hat keine) ins Ambient-Bett mischen.

Liest `soundBed.horn` ({"scene", "word", "offsetMs", "ms", "db"}) aus episodes/<id>.json und die Wortzeiten aus
public/episodes/<id>/captions.json; schreibt bed.wav an Ort und Stelle. Nach jedem make_sound_bed.py-Lauf erneut aufrufen.
  .venv/bin/python scripts/add_horn.py episodes/gaehn-stadt.json
"""
import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent


def main(p: Path) -> None:
    ep = json.loads(p.read_text())
    h = ep["soundBed"]["horn"]
    d = ROOT / "public" / "episodes" / ep["id"]
    tl = json.loads((d / "timeline.json").read_text())
    caps = json.loads((d / "captions.json").read_text())
    sc = next(s for s in tl["scenes"] if s["id"] == h["scene"])
    norm = lambda w: "".join(c for c in w.lower() if c.isalnum())
    w = next(c for c in caps if sc["startMs"] <= c["startMs"] < sc["endMs"] and norm(c["text"]) == norm(h["word"]))
    bed, sr = sf.read(d / "bed.wav", dtype="float32")
    n = int(sr * h["ms"] / 1000)
    t = np.arange(n) / sr
    tone = np.zeros(n, np.float32)
    for f0 in (370.0, 466.0):  # zwei Hupen-Töne (große Terz), ungerade Obertöne = quäkig
        for k in (1, 3, 5, 7):
            tone += np.sin(2 * np.pi * f0 * k * t * (1 + 0.003 * np.sin(2 * np.pi * 6 * t))) / k
    env = np.minimum(1, t / 0.012) * np.minimum(1, (h["ms"] / 1000 - t) / 0.08)
    tone = np.tanh(tone * 1.5) * env
    tone *= 10 ** (h["db"] / 20) / max(1e-6, np.abs(tone).max())
    i0 = int(sr * (w["startMs"] + h["offsetMs"]) / 1000)
    i1 = min(len(bed), i0 + n)
    bed[i0:i1] += tone[: i1 - i0]
    sf.write(d / "bed.wav", bed, sr)
    print(f"Hupe bei {(w['startMs'] + h['offsetMs']) / 1000:.2f} s, {h['ms']} ms, {h['db']} dB")


if __name__ == "__main__":
    main(Path(sys.argv[1]))
