"""Synthetische Musik + Soundeffekte (keine Fremdaufnahmen -> keine Lizenzfragen).

  .venv/bin/python scripts/make_audio.py   # erzeugt public/sfx/*.wav und eine Testmusik
"""

from __future__ import annotations

from pathlib import Path

import numpy as np

SR = 44100
ROOT = Path(__file__).resolve().parent.parent


def _write(path: Path, x: np.ndarray, normalize: bool = True) -> None:
    import soundfile as sf

    path.parent.mkdir(parents=True, exist_ok=True)
    peak = (np.max(np.abs(x)) or 1.0) if normalize else 0.9
    sf.write(str(path), (x / peak * 0.9).astype(np.float32), SR)


def _t(seconds: float) -> np.ndarray:
    return np.arange(int(SR * seconds)) / SR


def _lowpass(x: np.ndarray, cutoff: np.ndarray | float) -> np.ndarray:
    """Einfacher 1-Pol-Tiefpass mit (optional) zeitvariabler Grenzfrequenz."""
    cutoff = np.broadcast_to(np.asarray(cutoff, dtype=np.float64), x.shape)
    a = 1 - np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def make_sfx(folder: Path) -> None:
    rng = np.random.default_rng(7)
    # Whoosh: Rauschen, Filter öffnet und schließt sich
    t = _t(0.45)
    env = np.sin(np.pi * t / t[-1]) ** 2
    sweep = 300 + 5000 * np.sin(np.pi * t / t[-1]) ** 3
    noise = rng.standard_normal(len(t))
    whoosh = _lowpass(noise, sweep) - _lowpass(noise, sweep * 0.25)
    _write(folder / "whoosh.wav", whoosh * env)
    # Pop: kurzer Ton mit Tonhöhensprung nach oben
    t = _t(0.12)
    f = 500 + 900 * (t / t[-1])
    _write(folder / "pop.wav", np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 35))
    # Boom: tiefer Einschlag mit Rauschanteil
    t = _t(1.0)
    f = 90 * np.exp(-t * 4) + 38
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.5)
    boom += 0.35 * _lowpass(rng.standard_normal(len(t)), 400) * np.exp(-t * 9)
    _write(folder / "boom.wav", boom)
    # Ding: Glocke aus unharmonischen Teiltönen
    t = _t(1.2)
    ding = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, a, d in [(1320, 1, 3), (2640, 0.5, 5), (3960, 0.25, 7), (1980, 0.3, 4)])
    _write(folder / "ding.wav", ding)


def make_music(path: Path, seconds: float, bpm: float | None = None, mood: str = "upbeat", seed: int | str = 0,
               sparse_until: float = 0.0) -> None:
    """Musikbett je Stimmung (Presets in scripts/music.py). "upbeat" = alter Loop, bitgleich wie bisher.

    seed: Zahl oder Text (Episoden-ID) – variiert Tonart, Akkordfolge und Motiv, damit kein Video wie das andere klingt.
    """
    if mood in ("upbeat", "", None):
        _music_upbeat(path, seconds, bpm or 104)
        return
    import sys

    sys.path.insert(0, str(Path(__file__).resolve().parent))
    import music

    s = music.seed_from(seed) if isinstance(seed, str) else int(seed)
    _write(path, music.render(seconds, mood, bpm, s, sparse_until), normalize=False)  # Lautheit regelt music.py


def _music_upbeat(path: Path, seconds: float, bpm: float = 104) -> None:
    """Leichter, positiver Loop: Akkorde C–G–Am–F, gezupfte Arpeggios, Kick, Hi-Hat, Bass."""
    rng = np.random.default_rng(3)
    n = int(SR * seconds)
    out = np.zeros(n)
    beat = 60 / bpm
    chords = [[60, 64, 67, 72], [55, 59, 62, 67], [57, 60, 64, 69], [53, 57, 60, 65]]
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)  # noqa: E731

    def add(start: float, sig: np.ndarray, gain: float) -> None:
        i = int(start * SR)
        if i >= n:
            return
        sig = sig[: n - i]
        out[i : i + len(sig)] += sig * gain

    step = beat / 2  # Achtel
    t_pluck = _t(0.6)
    t_kick = _t(0.35)
    t_hat = _t(0.06)
    hat = rng.standard_normal(len(t_hat))
    hat = (hat - _lowpass(hat, 6000)) * np.exp(-t_hat * 60)
    kick = np.sin(2 * np.pi * np.cumsum(50 + 110 * np.exp(-t_kick * 30)) / SR) * np.exp(-t_kick * 9)
    i = 0
    while i * step < seconds:
        tpos = i * step
        chord = chords[int(tpos // (beat * 4)) % 4]
        note = chord[[0, 2, 1, 3, 2, 1, 3, 2][i % 8]] + 12
        f = hz(note)
        pluck = (np.sin(2 * np.pi * f * t_pluck) + 0.3 * np.sin(4 * np.pi * f * t_pluck)) * np.exp(-t_pluck * 7)
        add(tpos, pluck, 0.16)
        add(tpos, hat, 0.05 if i % 2 else 0.025)
        if i % 2 == 0:  # Viertel
            if (i // 2) % 2 == 0:
                add(tpos, kick, 0.5)
            bass_t = _t(beat)
            add(tpos, np.sin(2 * np.pi * hz(chord[0] - 24) * bass_t) * np.exp(-bass_t * 2.5), 0.22)
        i += 1
    # Pad: weiche Akkordfläche
    for bar in range(int(seconds // (beat * 4)) + 1):
        chord = chords[bar % 4]
        tp = _t(beat * 4)
        env = np.minimum(1, tp / 0.4) * np.minimum(1, (tp[-1] - tp) / 0.4)
        pad = sum(np.sin(2 * np.pi * hz(m) * tp) for m in chord) * env
        add(bar * beat * 4, pad, 0.035)
    fade = np.minimum(1, np.minimum(np.arange(n) / (SR * 0.5), (n - np.arange(n)) / (SR * 1.5)))
    _write(path, out * fade)


if __name__ == "__main__":
    make_sfx(ROOT / "public" / "sfx")
    make_music(ROOT / "out" / "music-test.wav", 20)
    print("ok")
