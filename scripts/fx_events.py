"""Zusatz-Klänge ins Bett + Stimme stummschalten (Fluch-Stadt, 22.11.2026) – nach make_sound_bed.py aufrufen.

Liest `soundBed.fx` aus episodes/<id>.json: Liste von Ereignissen
  {"scene": "twist", "word": "fuck", "nth": 1, "at": "start|end", "offsetMs": 0, "kind": "bleep|poof|mute", "ms": 400, "db": -16, "hz": 1000}
Wortzeiten aus public/episodes/<id>/captions.json (nth = n-tes Vorkommen in der Szene, Standard 1).
  bleep: Sinus mit 6/12-ms-Rampen ins Bett        poof: gefiltertes Rauschen (Wusch, fallend) ins Bett
  mute:  Stimme (voice.wav) in [t, t+ms] mit 10-ms-Rampen stumm (Fluchwort)
Schreibt bed.wav und (bei mute) voice.wav an Ort und Stelle; idempotent nur für bed (make_sound_bed neu erzeugt es),
mute vorher nur einmal laufen lassen (--no-mute für Wiederholungen).

    .venv/bin/python scripts/fx_events.py episodes/fluch-stadt.json [--no-mute]
"""
import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
norm = lambda w: "".join(c for c in w.lower() if c.isalnum() or c == "'")


def main(p: Path, mute: bool) -> None:
    ep = json.loads(p.read_text())
    d = ROOT / "public" / "episodes" / ep["id"]
    tl = json.loads((d / "timeline.json").read_text())
    caps = json.loads((d / "captions.json").read_text())
    bed, sr = sf.read(d / "bed.wav", dtype="float32")
    voice, vsr = sf.read(d / "voice.wav", dtype="float32")
    rng = np.random.default_rng(7)
    vchanged = False
    for e in ep["soundBed"].get("fx", []):
        sc = next(s for s in tl["scenes"] if s["id"] == e["scene"])
        hits = [c for c in caps if sc["startMs"] - 60 <= c["startMs"] < sc["endMs"] and norm(c["text"]) == norm(e["word"])]
        w = hits[e.get("nth", 1) - 1]
        t = (w["endMs"] if e.get("at") == "end" else w["startMs"]) + e.get("offsetMs", 0)
        ms = e.get("ms", 300)
        if e["kind"] == "mute":
            if not mute:
                continue
            i0, n = int(vsr * t / 1000), int(vsr * ms / 1000)
            r = int(vsr * 0.01)
            g = np.ones(n, np.float32)
            g[:r] = np.linspace(1, 0, r)
            g[r:] = 0
            g[-r:] = np.linspace(0, 1, r)
            seg = voice[i0 : i0 + n]
            voice[i0 : i0 + n] = seg * (g[: len(seg), None] if voice.ndim == 2 else g[: len(seg)])
            vchanged = True
            print(f"stumm {t / 1000:.2f}–{(t + ms) / 1000:.2f} s ({e['word']})")
            continue
        n = int(sr * ms / 1000)
        tt = np.arange(n) / sr
        if e["kind"] == "bleep":
            y = np.sin(2 * np.pi * e.get("hz", 1000.0) * tt)
            env = np.minimum(1, tt / 0.006) * np.minimum(1, (ms / 1000 - tt) / 0.012)
        else:  # poof: Rauschen, Tiefpass fällt (einfacher gleitender Mittelwert), schneller Anstieg, langer Ausklang
            x = rng.standard_normal(n)
            k = 12
            y = np.convolve(x, np.ones(k) / k, mode="same") * 3
            env = np.minimum(1, tt / 0.015) * np.exp(-tt / (ms / 1000 / 3))
        y = (y * env * 10 ** (e.get("db", -18) / 20)).astype(np.float32)
        i0 = int(sr * t / 1000)
        i1 = min(len(bed), i0 + n)
        if bed.ndim == 2:
            bed[i0:i1] += y[: i1 - i0, None]
        else:
            bed[i0:i1] += y[: i1 - i0]
        print(f"{e['kind']} {t / 1000:.2f} s, {ms} ms, {e.get('db', -18)} dB ({e['scene']}/{e['word']})")
    sf.write(d / "bed.wav", bed, sr)
    if vchanged:
        sf.write(d / "voice.wav", voice, vsr)


if __name__ == "__main__":
    main(Path(sys.argv[1]), "--no-mute" not in sys.argv)
