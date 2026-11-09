"""Tempo-Kalibrierung: nur die Stimme einer Episode für mehrere Tempo-Werte erzeugen, Dauer und
Wörter/s messen, besten Wert empfehlen. Kein Whisper, keine Musik, schreibt nicht nach public/.

  .venv/bin/python scripts/calibrate_speed.py episodes/roman-empire.json            # automatisch
  .venv/bin/python scripts/calibrate_speed.py episodes/x.json --speeds 1.30,1.33,1.36
  .venv/bin/python scripts/calibrate_speed.py episodes/x.json --wav   # Tonspuren zum Anhören behalten

Automatik: 1 Probe beim Tempo aus dem Drehbuch -> lineare Schätzung für die Zielmitte (3,45 W/s)
-> weitere Werte im Abstand --step um die Schätzung (insgesamt --n Werte).
Hintergrund: Kokoros Tempo wirkt nicht linear (Rom: 1.33 -> 99,8 s, 1.34 -> 91,5 s, 1.35 -> 89,4 s),
deshalb wird gemessen statt gerechnet. Empfohlen wird ein Wert im Zielband, dessen Nachbarn
möglichst auch im Band liegen (robust gegen Sprünge), am nächsten an der Zielmitte.
Die Synthese selbst kommt aus make_episode.synth_track (gleiche Logik wie die echte Tonspur;
`voiceStyle.post` wird übersprungen, es ändert die Länge nicht).
Ausgabe: out/calibrate/<id>/results.json (+ speed-<x>.wav mit --wav).
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from make_episode import make_voice, synth_track  # noqa: E402
from tts import SAMPLE_RATE, write_wav  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
LO, HI = 3.3, 3.6  # Ziel-Sprechtempo laut docs/clip-regeln.md
MID = (LO + HI) / 2


def measure(ep: dict, voice, speed: float, wav_dir: Path | None) -> dict:
    ep = {**ep, "speed": speed}
    voice.speed = speed
    t = time.time()
    track, _, words = synth_track(ep, voice, post=False, log=None)
    secs = len(track) / SAMPLE_RATE
    if wav_dir:
        write_wav(wav_dir / f"speed-{speed:.3f}.wav", track)
    return {
        "speed": round(speed, 4),
        "voiceSec": round(secs, 2),
        "videoSec": round(secs + 0.6, 2),  # timeline.durationMs = Tonspur + 600 ms
        "words": len(words),
        "wps": round(len(words) / secs, 3),
        "synthSec": round(time.time() - t, 1),
    }


def recommend(rows: list[dict]) -> dict | None:
    rows = sorted(rows, key=lambda r: r["speed"])
    inband = lambda r: LO <= r["wps"] <= HI  # noqa: E731
    best = None
    for i, r in enumerate(rows):
        if not inband(r):
            continue
        nb = [rows[j] for j in (i - 1, i + 1) if 0 <= j < len(rows)]
        score = (sum(not inband(n) for n in nb), abs(r["wps"] - MID))
        if best is None or score < best[0]:
            best = (score, r)
    return best[1] if best else None


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("episode", type=Path)
    ap.add_argument("--speeds", help="Komma-Liste, z. B. 1.30,1.33,1.36 (sonst automatisch)")
    ap.add_argument("--n", type=int, default=4, help="Anzahl Werte im Automatik-Modus (Standard 4, inkl. Probe)")
    ap.add_argument("--step", type=float, default=0.01, help="Abstand der Werte (Standard 0.01)")
    ap.add_argument("--wav", action="store_true", help="Tonspuren in out/calibrate/<id>/ behalten")
    ap.add_argument("--out", type=Path, help="Ausgabeordner (Standard out/calibrate/<id>)")
    a = ap.parse_args()

    ep = json.loads(a.episode.read_text())
    out = a.out or ROOT / "out" / "calibrate" / ep["id"]
    out = out.resolve()
    if (ROOT / "public").resolve() in out.parents:
        raise SystemExit("Ausgabe nach public/ ist nicht erlaubt.")
    out.mkdir(parents=True, exist_ok=True)
    wav_dir = out if a.wav else None

    t0 = time.time()
    voice = make_voice(ep)
    rows: list[dict] = []

    def run(s: float) -> None:
        s = round(s, 4)
        if any(r["speed"] == s for r in rows) or not 0.5 <= s <= 2.0:
            return
        r = measure(ep, voice, s, wav_dir)
        rows.append(r)
        print(f"  Tempo {r['speed']:.3f}: {r['voiceSec']:6.2f} s, {r['wps']:.2f} W/s  ({r['synthSec']} s Rechenzeit)", flush=True)

    if a.speeds:
        for s in a.speeds.split(","):
            run(float(s))
    else:
        probe = float(ep.get("speed", 1.0))
        run(probe)
        # W/s ~ Tempo (lineare Näherung) -> Schätzung, dann Werte drumherum
        est = round(probe * MID / rows[0]["wps"] / a.step) * a.step
        print(f"  Schätzung (linear) für {MID:.2f} W/s: {est:.3f}")
        k = 0
        while len(rows) < a.n and k < 4 * a.n:
            off = (k + 1) // 2 * (1 if k % 2 else -1) if k else 0
            run(est + off * a.step)
            k += 1

    rows.sort(key=lambda r: r["speed"])
    print(f"\n{ep['id']}: {rows[0]['words']} Skript-Wörter, Ziel {LO}–{HI} W/s")
    print(f"{'Tempo':>7} {'Stimme s':>9} {'Video s':>8} {'W/s':>6}  Band  Sprung zum Vorgänger")
    for i, r in enumerate(rows):
        jump = ""
        if i:
            p = rows[i - 1]
            pct = (r["voiceSec"] - p["voiceSec"]) / p["voiceSec"] * 100
            expect = -(r["speed"] - p["speed"]) / r["speed"] * 100  # Dauer ~ 1/Tempo
            jump = f"{pct:+.1f} % (linear {expect:+.1f} %)" + ("  <- Sprung" if abs(pct - expect) > 2 else "")
        band = "ja" if LO <= r["wps"] <= HI else "–"
        print(f"{r['speed']:7.3f} {r['voiceSec']:9.2f} {r['videoSec']:8.2f} {r['wps']:6.2f}  {band:>4}  {jump}")

    best = recommend(rows)
    if best:
        print(f"\nEmpfehlung: --speed {best['speed']:g}  ({best['wps']:.2f} W/s, Video {best['videoSec']:.1f} s)")
        print(f"  übernehmen: .venv/bin/python scripts/make_episode.py {a.episode} --speed {best['speed']:g} --save")
    else:
        print("\nKein Wert im Zielband – mit --speeds weiter suchen (höher = schneller).")
    (out / "results.json").write_text(json.dumps(
        {"episode": ep["id"], "target": [LO, HI], "rows": rows, "recommended": best and best["speed"]}, indent=1) + "\n")
    print(f"Gesamt {time.time() - t0:.0f} s · {(out / 'results.json').relative_to(ROOT) if ROOT in out.parents else out}")


if __name__ == "__main__":
    main()
