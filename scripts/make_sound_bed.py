"""Ambient-Bett für eine Episode: Uhr-Ticken + Stadt-Raum, Basstreffer vor jeder Enthüllung, ein Akzent beim Twist.

Liest das Drehbuch-Feld `soundBed` (episodes/<id>.json) und die Wortzeiten (public/episodes/<id>/captions.json),
rendert die Einzelklänge aus der earshot-Klangbank (`earshot sfx render`, keine Modelle) und schreibt
public/episodes/<id>/bed.wav (48 kHz, mono). Abgespielt wird es über `EPISODE_CONFIG[<id>].bed` (scenes/index.ts).

Aufruf (earshot-venv hat numpy + soundfile):
  .venv-earshot/bin/python scripts/make_sound_bed.py episodes/zeit-welt.json

`soundBed` (alle Zeiten aus Wörtern, nie fest):
  tick:        {"sound": "fit/tick/domino", "tock": "knock/wood", "db": -34, "period": 1.0}
  room:        {"db": -40, "rain_db": -44}             # Stadt-Raum: tiefes Brummen + ferner Regen (Rauschen, Seed = id)
  reveals:     [{"scene": "hook", "word": "life"}, ...]  # Basstreffer, Spitze 80 ms VOR dem Wort
  revealSound: {"sound": "pro_impact/deep", "db": -16}
  twist:       {"scene": "painted", "word": "painted", "sounds": ["mallet/glock", "pro_tap/glass"], "db": -14}
  tickLouder:  [{"scene": "rehook", "db": 8}]          # Ticken lauter (Re-Hook)
  tickOff:     [{"scene": "unpaid"}]                    # Ticken aus (Zeit ohne Preis)
  silence:     [{"scene": "painted", "word": "painted", "ms": 500}]  # Bett 0,5 s still vor dem Twist-Akzent
  knocks:      [{"scene": "pipe", "word": "three", "count": 3, "gapsMs": [220, 600], "sound": "knock/desk", "db": -11, "muffle": true}]
  tailMs:      2000                                     # End-Card: Bett blendet aus
"""
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
EARSHOT = [str(ROOT / ".venv-earshot" / "bin" / "python"), "-m", "earshot"]


def norm(w: str) -> str:
    return "".join(ch for ch in w.lower() if ch.isalnum() or ch in "'-")


def render(sound_id: str, tmp: Path) -> np.ndarray:
    out = tmp / (sound_id.replace("/", "_") + ".wav")
    if not out.exists():
        subprocess.run([*EARSHOT, "sfx", "render", sound_id, "-o", str(out)], check=True, capture_output=True)
    x, sr = sf.read(str(out), dtype="float32")
    if x.ndim > 1:
        x = x.mean(axis=1)
    if sr != SR:  # einfache lineare Umrechnung (Bank rendert 48 kHz, nur zur Sicherheit)
        t = np.arange(int(len(x) * SR / sr)) / SR
        x = np.interp(t, np.arange(len(x)) / sr, x).astype(np.float32)
    return x


def db(v: float) -> float:
    return float(10 ** (v / 20))


def place(buf: np.ndarray, x: np.ndarray, at_s: float, gain: float) -> None:
    i = int(round(at_s * SR))
    if i < 0:
        x, i = x[-i:], 0
    n = min(len(x), len(buf) - i)
    if n > 0:
        buf[i : i + n] += x[:n] * gain


def main(path: Path) -> None:
    ep = json.loads(path.read_text())
    cfg = ep.get("soundBed")
    if not cfg:
        raise SystemExit("Drehbuch hat kein Feld `soundBed`")
    out_dir = ROOT / "public" / "episodes" / ep["id"]
    tl = json.loads((out_dir / "timeline.json").read_text())
    caps = json.loads((out_dir / "captions.json").read_text())
    scenes = {s["id"]: s for s in tl["scenes"]}
    last_end = tl["scenes"][-1]["endMs"]
    total_ms = max(tl["durationMs"], last_end + cfg.get("tailMs", 0))
    n = int(total_ms / 1000 * SR) + SR // 2
    rng = np.random.default_rng(sum(map(ord, ep["id"])))  # Seed = Episoden-ID (deterministisch)

    def word_s(scene: str, word: str) -> float:
        s = scenes[scene]
        for c in caps:
            if s["startMs"] - 60 <= c["startMs"] < s["endMs"] and norm(c["text"]) == norm(word):
                return c["startMs"] / 1000
        raise SystemExit(f"Wort {word!r} nicht in Szene {scene!r}")

    def span(scene: str) -> tuple[float, float]:
        s = scenes[scene]
        return s["startMs"] / 1000, s["endMs"] / 1000

    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td)
        bed = np.zeros(n, dtype=np.float32)

        # 1) Stadt-Raum: Brummen (Brown-Rauschen, Tiefpass) + ferner Regen (Hochpass-Rauschen), langsam atmend
        room = cfg.get("room", {})
        if room:
            white = rng.standard_normal(n).astype(np.float32)
            brown = np.cumsum(white) / SR * 40
            brown -= np.convolve(brown, np.ones(4801) / 4801, mode="same")  # Gleichanteil weg
            brown /= np.max(np.abs(brown)) + 1e-9
            rain = white - np.convolve(white, np.ones(9) / 9, mode="same")  # grober Hochpass
            rain = np.convolve(rain, np.ones(3) / 3, mode="same")
            rain /= np.max(np.abs(rain)) + 1e-9
            t = np.arange(n) / SR
            breathe = 1 + 0.25 * np.sin(2 * np.pi * t / 9.0) + 0.15 * np.sin(2 * np.pi * t / 3.7 + 1.0)
            bed += (brown * db(room.get("db", -40)) + rain * db(room.get("rain_db", -44)) * breathe).astype(np.float32)

        # 2) Uhr-Ticken (tick/tock im Wechsel), Lautstärke-Hüllkurve je Szene
        tick = cfg.get("tick")
        if tick:
            a = render(tick["sound"], tmp)
            b = render(tick.get("tock", tick["sound"]), tmp)
            env = np.ones(int(total_ms / 1000 / tick.get("period", 1.0)) + 2, dtype=np.float32)
            period = tick.get("period", 1.0)
            for k in range(len(env)):
                ts = k * period
                g = 0.0
                for L in cfg.get("tickLouder", []):
                    s0, s1 = span(L["scene"])
                    if s0 <= ts < s1:  # steigt über die Szene an
                        g = max(g, L["db"] * (ts - s0) / max(0.1, s1 - s0))
                gain = db(tick.get("db", -34) + g)
                for off in cfg.get("tickOff", []):
                    s0, s1 = span(off["scene"])
                    if s0 - 0.5 <= ts < s1:
                        gain = 0.0
                if ts > last_end / 1000:
                    gain *= max(0.0, 1 - (ts - last_end / 1000) / 1.0)
                place(bed, a if k % 2 == 0 else b * 0.8, ts, gain)

        # 3) Stille vor dem Twist (Bett aus, weicher Rand 40 ms)
        for sl in cfg.get("silence", []):
            w = word_s(sl["scene"], sl["word"])
            i1 = int(w * SR)
            i0 = max(0, i1 - int(sl.get("ms", 500) / 1000 * SR))
            ramp = int(0.04 * SR)
            bed[i0 + ramp : i1] = 0
            bed[i0 : i0 + ramp] *= np.linspace(1, 0, ramp, dtype=np.float32)

        # 4) Basstreffer: Spitze 80 ms vor dem Enthüllungs-Wort
        rs = cfg.get("revealSound", {"sound": "pro_impact/deep", "db": -16})
        hit = render(rs["sound"], tmp)
        peak = int(np.argmax(np.abs(hit))) / SR
        hits = []
        for r in cfg.get("reveals", []):
            w = word_s(r["scene"], r["word"])
            place(bed, hit, w - 0.08 - peak, db(rs.get("db", -16)))
            hits.append((r["scene"], r["word"], round(w - 0.08, 3)))

        # 5) Twist-Akzent (scharf, genau auf dem Wort)
        tw = cfg.get("twist")
        if tw:
            w = word_s(tw["scene"], tw["word"])
            for sid in tw["sounds"]:
                x = render(sid, tmp)
                place(bed, x, w, db(tw.get("db", -14)))

        # 5b) Story-Klopfer: `count` Schläge ab dem Wort (+ offsetMs), Abstände `gapsMs` (Liste) oder gleichmäßig `gapMs`;
        #     "muffle": true = gedämpft (grober Tiefpass, z. B. aus dem Rohr)
        knocks = []
        for kn in cfg.get("knocks", []):
            w = word_s(kn["scene"], kn["word"]) + kn.get("offsetMs", 0) / 1000
            x = render(kn["sound"], tmp)
            if kn.get("muffle") or "Tiefpass" in kn.get("note", ""):
                x = np.convolve(x, np.ones(24) / 24, mode="same").astype(np.float32)
                x *= (np.max(np.abs(render(kn["sound"], tmp))) / (np.max(np.abs(x)) + 1e-9))
            gaps = kn.get("gapsMs") or [kn.get("gapMs", 300)] * (kn.get("count", 3) - 1)
            t = w
            for i in range(kn.get("count", 3)):
                place(bed, x, t, db(kn.get("db", -12)))
                if i < len(gaps):
                    t += gaps[i] / 1000
            knocks.append((kn["scene"], kn["word"], round(w, 3)))

        # 6) End-Card: Bett blendet in den letzten tailMs aus
        tail = cfg.get("tailMs", 0)
        if tail:
            i0 = int(last_end / 1000 * SR)
            i1 = min(n, int(total_ms / 1000 * SR))
            bed[i0:i1] *= np.linspace(1, 0, i1 - i0, dtype=np.float32)
            bed[i1:] = 0

        pk = float(np.max(np.abs(bed)))
        if pk > db(-1):
            bed *= db(-1) / pk
        sf.write(str(out_dir / "bed.wav"), bed, SR, subtype="PCM_16")
    print(f"bed.wav: {total_ms / 1000:.2f} s, {len(hits)} Basstreffer {hits}, {len(knocks)} Klopf-Folgen, Spitze {20 * np.log10(max(pk, 1e-9)):.1f} dBFS")


if __name__ == "__main__":
    main(Path(sys.argv[1]))
