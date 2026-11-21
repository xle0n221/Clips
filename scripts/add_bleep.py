"""Zensur-Piep (eigene Synthese) ins Ambient-Bett mischen – Fluchen plattformtauglich (Ghost-Pepper, 21.11.2026).

Liest `soundBed.bleep` ({"scene", "word", "offsetMs", "ms", "db", "hz"}) aus episodes/<id>.json und die Wortzeiten
aus public/episodes/<id>/captions.json; offsetMs zählt ab Wort-ENDE. Schreibt bed.wav an Ort und Stelle.
Nach jedem make_sound_bed.py-Lauf erneut aufrufen:  .venv/bin/python scripts/add_bleep.py episodes/ghost-pepper.json
"""
import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent


def main(p: Path) -> None:
    ep = json.loads(p.read_text())
    b = ep["soundBed"]["bleep"]
    d = ROOT / "public" / "episodes" / ep["id"]
    tl = json.loads((d / "timeline.json").read_text())
    caps = json.loads((d / "captions.json").read_text())
    sc = next(s for s in tl["scenes"] if s["id"] == b["scene"])
    norm = lambda w: "".join(c for c in w.lower() if c.isalnum())
    w = next(c for c in caps if sc["startMs"] <= c["startMs"] < sc["endMs"] and norm(c["text"]) == norm(b["word"]))
    bed, sr = sf.read(d / "bed.wav", dtype="float32")
    n = int(sr * b["ms"] / 1000)
    t = np.arange(n) / sr
    tone = np.sin(2 * np.pi * b.get("hz", 1000.0) * t).astype(np.float32)
    env = np.minimum(1, t / 0.006) * np.minimum(1, (b["ms"] / 1000 - t) / 0.012)
    tone = tone * env * 10 ** (b["db"] / 20)
    at = w["endMs"] + b["offsetMs"]
    i0 = int(sr * at / 1000)
    i1 = min(len(bed), i0 + n)
    if bed.ndim == 2:
        bed[i0:i1] += tone[: i1 - i0, None]
    else:
        bed[i0:i1] += tone[: i1 - i0]
    sf.write(d / "bed.wav", bed, sr)
    print(f"Piep bei {at / 1000:.2f} s, {b['ms']} ms, {b['db']} dB")


if __name__ == "__main__":
    main(Path(sys.argv[1]))
