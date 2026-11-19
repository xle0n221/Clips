#!/usr/bin/env python3
"""Musik unter der Stimme ducken (Hörprüfung 19.11.2026: Musik lag an Höhepunkten auf Stimmenniveau).

Hält im Video-Mix (Musik × 0,13 wie Episode.tsx) einen Mindestabstand Stimme − Musik von --gap dB, solange gesprochen
wird: 50-ms-RMS beider Spuren, nötige Absenkung = gap − (Stimme − Musik), höchstens --max dB, Attack 60 ms /
Release 400 ms (Glättung), dann auf music.wav angewendet (überschreibt). Nach make_episode/retime_pauses erneut laufen
lassen, da diese music.wav neu schreiben.

    .venv/bin/python scripts/duck_music.py <episode-id> [--gap 10] [--max 8] [--music-gain 0.13]
"""
from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent


def rms_db(x: np.ndarray, hop: int) -> np.ndarray:
    n = len(x) // hop
    r = np.sqrt((x[: n * hop].reshape(n, hop) ** 2).mean(axis=1) + 1e-12)
    return 20 * np.log10(r)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("id")
    ap.add_argument("--gap", type=float, default=10.0)
    ap.add_argument("--max", type=float, default=8.0)
    ap.add_argument("--music-gain", type=float, default=0.13)
    a = ap.parse_args()
    pub = ROOT / "public" / "episodes" / a.id
    v, sr = sf.read(str(pub / "voice.wav"), dtype="float32", always_2d=True)
    m, msr = sf.read(str(pub / "music.wav"), dtype="float32", always_2d=True)
    vm = v.mean(axis=1)
    mm = m.mean(axis=1) * a.music_gain
    # 50-ms-Raster je Spur in ihrer eigenen Abtastrate (Stimme 24 kHz, Musik 44,1 kHz)
    hop, mhop = int(0.05 * sr), int(0.05 * msr)
    n = len(mm) // mhop + 1
    vdb = np.full(n, -120.0)
    e = rms_db(vm, hop)[:n]
    vdb[: len(e)] = e
    mdb = np.full(n, -120.0)
    e = rms_db(mm, mhop)
    mdb[: len(e)] = e
    speech = vdb > (np.percentile(vdb[vdb > -100], 90) - 30)
    # Sprache leicht ausdehnen (100 ms), damit Satzanfänge nicht unter der Musik starten
    sp = speech.copy()
    sp[:-2] |= speech[2:]
    sp[2:] |= speech[:-2]
    need = np.where(sp, np.clip(a.gap - (vdb - mdb), 0, a.max), 0.0)
    # Glättung: Attack 60 ms, Release 400 ms (in 50-ms-Schritten)
    att, rel = np.exp(-50 / 60), np.exp(-50 / 400)
    g = np.zeros(n)
    cur = 0.0
    for i in range(n):
        k = att if need[i] > cur else rel
        cur = k * cur + (1 - k) * need[i]
        g[i] = cur
    # vorausschauend: Absenkung 100 ms vorziehen
    g = np.maximum(g, np.concatenate([g[2:], [0, 0]]))
    gain = 10 ** (-np.interp(np.arange(len(m)) / mhop, np.arange(n), g) / 20)
    sf.write(str(pub / "music.wav"), (m * gain[:, None]).astype("float32"), msr, subtype="PCM_16")
    after = vdb - (mdb - g)
    s = sp & (vdb > -100)
    print(f"{a.id}: Absenkung max {g.max():.1f} dB, Ø in Sprache {g[s].mean():.1f} dB; Abstand Stimme−Musik in Sprache "
          f"vorher P10 {np.percentile((vdb - mdb)[s], 10):.1f} / Median {np.median((vdb - mdb)[s]):.1f} dB → "
          f"nachher P10 {np.percentile(after[s], 10):.1f} / Median {np.median(after[s]):.1f} dB")


if __name__ == "__main__":
    main()
