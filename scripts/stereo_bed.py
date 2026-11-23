#!/usr/bin/env python3
"""Musik/Geräuschbett in Stereo + mehr Sub (Audit meckern-stadt 23.11.2026: earshot „fast mono −38 dB, wenig Sub −20,8 dB“).

Stimme bleibt mono in der Mitte; nur Musik und Bett werden breit gemacht:
- Bass unter --split Hz bleibt mono (Mono-Kompatibilität, Druck in der Mitte) und wird um --sub dB angehoben (unter 90 Hz),
- darüber Mid/Side: S = Hochpass(x) um --delay ms verzögert, L = M + w·S, R = M − w·S (L+R = 2·M → mono-sicher),
- Spitze danach auf den Ausgangswert zurückgesetzt (Lautheit/Abstände der Kette bleiben gleich).
Nach duck_music.py / fx_events.py laufen lassen (diese schreiben mono).

    .venv/bin/python scripts/stereo_bed.py <episode-id> [--files music.wav bed.wav] [--width 0.55] [--sub 3] [--split 150] [--delay 11]
"""
from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent


def _fft_filter(x: np.ndarray, sr: int, gain_fn) -> np.ndarray:
    """Nullphasen-Filter über FFT (keine scipy-Abhängigkeit in .venv)."""
    X = np.fft.rfft(x)
    fr = np.fft.rfftfreq(len(x), 1 / sr)
    return np.fft.irfft(X * gain_fn(fr), n=len(x))


def _lp(x, sr, fc, order=4):
    return _fft_filter(x, sr, lambda f: 1 / np.sqrt(1 + (f / fc) ** (2 * order)))


def _hp(x, sr, fc, order=2):
    return _fft_filter(x, sr, lambda f: 1 / np.sqrt(1 + (fc / np.maximum(f, 1e-6)) ** (2 * order)))


def widen(x: np.ndarray, sr: int, width: float, sub_db: float, split: float, delay_ms: float) -> np.ndarray:
    lo = _lp(x, sr, split)
    hi = x - lo
    sub = _lp(x, sr, 90, 2)
    lo = lo + sub * (10 ** (sub_db / 20) - 1)
    d = int(sr * delay_ms / 1000)
    side = np.concatenate([np.zeros(d), _hp(hi, sr, 400)[:-d or None]])
    left = lo + hi + width * side
    right = lo + hi - width * side
    out = np.stack([left, right], axis=1)
    pk_in, pk_out = np.abs(x).max(), np.abs(out).max()
    return out * (pk_in / pk_out if pk_out > 0 else 1.0)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("id")
    ap.add_argument("--files", nargs="+", default=["music.wav", "bed.wav"])
    ap.add_argument("--width", type=float, default=0.55)
    ap.add_argument("--sub", type=float, default=3.0)
    ap.add_argument("--split", type=float, default=150.0)
    ap.add_argument("--delay", type=float, default=11.0)
    a = ap.parse_args()
    for name in a.files:
        p = ROOT / "public" / "episodes" / a.id / name
        x, sr = sf.read(str(p), dtype="float64", always_2d=True)
        mono = x.mean(axis=1)
        out = widen(mono, sr, a.width, a.sub, a.split, a.delay)
        sf.write(str(p), out.astype(np.float32), sr, subtype="PCM_16")
        l, r = out[:, 0], out[:, 1]
        corr = float(np.corrcoef(l, r)[0, 1]) if l.std() > 0 else 1.0
        side_db = 20 * np.log10(np.sqrt(np.mean(((l - r) / 2) ** 2)) / max(1e-12, np.sqrt(np.mean(((l + r) / 2) ** 2))))
        print(f"{name}: stereo, L/R-Korrelation {corr:.2f}, Side/Mid {side_db:.1f} dB, Sub +{a.sub:.1f} dB < 90 Hz")


if __name__ == "__main__":
    main()
