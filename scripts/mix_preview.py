#!/usr/bin/env python3
"""Ton-Mischung einer Episode ohne Bild-Render (für Hörprüfung, Station 2).

Bildet die Audio-Spuren aus src/episode/Episode.tsx nach: voice.wav (1,0), music.wav (0,13, ab End-Card linear auf
0,35 × 0,13), bed.wav (EPISODE_CONFIG bed.volume, hier 1,0), whoosh.wav (0,25) 4 Bilder vor jedem Szenenstart ab der
zweiten Szene, Cue-SFX (boom 0,45, sonst 0,35). Remotion rendert auch für reine WAV-Ausgabe alle 3D-Bilder – das
dauert > 10 min; dieses Skript braucht Sekunden.

    .venv/bin/python scripts/mix_preview.py <episode-id> [--out out/<id>-mix.wav] [--bed-volume 1.0]
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
FPS = 30


def load(p: Path) -> np.ndarray:
    x, sr = sf.read(str(p), dtype="float32", always_2d=True)
    x = x.mean(axis=1)
    if sr != SR:
        n = int(round(len(x) * SR / sr))
        x = np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x).astype("float32")
    return x


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("id")
    ap.add_argument("--out")
    ap.add_argument("--bed-volume", type=float, default=1.0)
    a = ap.parse_args()
    pub = ROOT / "public" / "episodes" / a.id
    tl = json.loads((pub / "timeline.json").read_text())
    last = tl["scenes"][-1]["endMs"]
    end_card = tl.get("endCard")
    total_s = max(tl["durationMs"], last + (end_card["seconds"] * 1000 if end_card else 0)) / 1000
    frames = int(np.ceil(total_s * FPS))
    n = int(frames / FPS * SR)
    mix = np.zeros(n, dtype="float32")

    def add(x: np.ndarray, at_s: float, gain) -> None:
        i = int(round(at_s * SR))
        if i >= n:
            return
        x = x[: n - i]
        g = gain(np.arange(len(x)) + i) if callable(gain) else gain
        mix[i : i + len(x)] += x * g

    add(load(pub / "voice.wav"), 0, 1.0)
    end_from = min(frames - 1, round(last / 1000 * FPS)) if end_card else None

    def music_gain(idx: np.ndarray):
        if end_from is None:
            return 0.13
        f = idx / SR * FPS
        k = np.clip((f - end_from) / max(1, (frames - 2) - end_from), 0, 1)
        return 0.13 * (1 - 0.65 * k)

    add(load(pub / "music.wav"), 0, music_gain)
    if (pub / "bed.wav").exists():
        add(load(pub / "bed.wav"), 0, a.bed_volume)
    sfx = ROOT / "public" / "sfx"
    wh = load(sfx / "whoosh.wav")[: int(20 / FPS * SR)]
    starts = [round(s["startMs"] / 1000 * FPS) for s in tl["scenes"]]
    for s in starts[1:]:
        add(wh, max(0, s - 4) / FPS, 0.25)
    for c in tl.get("cues", []):
        if c.get("sfx"):
            x = load(sfx / f"{c['sfx']}.wav")[: int(40 / FPS * SR)]
            add(x, round(c["atMs"] / 1000 * FPS) / FPS, 0.45 if c["sfx"] == "boom" else 0.35)
    out = Path(a.out) if a.out else ROOT / "out" / f"{a.id}-mix.wav"
    out.parent.mkdir(parents=True, exist_ok=True)
    sf.write(str(out), mix, SR, subtype="PCM_24")
    print(f"{out}: {n / SR:.2f} s, Spitze {20 * np.log10(np.abs(mix).max() + 1e-9):.1f} dBFS")


if __name__ == "__main__":
    main()
