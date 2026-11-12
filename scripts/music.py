"""Musik-Presets je Stimmung – vollständig selbst synthetisiert (numpy), daher lizenzfrei.

Vorgaben Nutzer 12.11.2026: Musik passend zum Thema und zeitgemäß, „nie dieselbe Musik“, „gerne rap & r&b lastig …
eben das was angenehm zu hören ist“. Aufruf über make_audio.make_music(path, seconds, bpm, mood, seed).
Regeln: docs/clip-regeln.md → „Musik je Thema“.

Grundcharakter aller Presets: moderne Rap-/R&B-Produktion – warme Rhodes/E-Piano/Gitarre mit Neo-Soul-Harmonien
(maj7, m9, m11, 9, 13), weicher 808-Bass mit Glide (nur leicht gesättigt), knackige, nicht aggressive Drums,
Swing auf den Hi-Hats, Hat-Rolls sparsam (höchstens alle 4–8 Takte), keine harte Verzerrung.

Presets (Zähl-BPM, Grundtonart vor Seed-Transposition):
  dark      dunkles Moll-R&B/Trap, 140 (half-time 70), f-Moll  – i m9 · VI maj7 · iv m9 · V 7b9 u. a., Akkord je 2 Takte
  hype      treibender Rap-Beat,   148 (half-time 74), g-Moll  – Gitarren-/Rhodes-Stabs, hüpfender 808, Ghost-Snares
  funny     bouncy R&B-Pop,        100,               F-Dur   – Imaj7 · vi9 · ii9 · V13 u. a., Offbeat-Stabs, Snaps
  epic      cineastischer Rap,      88,               d-Moll  – Klavier/Rhodes + Streicher-Fläche, Boom-Bap-Drums, Taikos
  chill     R&B/Lo-fi,              82,               Es-Dur  – IVmaj7 · iii m7 · ii9 · Imaj9 u. a., Gitarre, Knistern
  upbeat    alter Loop (make_audio._music_upbeat), unverändert – nur Rückfall für alte Drehbücher ohne "music"
  Aliase: cinematic → epic, rnb/lofi → chill, trap → dark, rap → hype.

Gemeinsam: Einstieg in den ersten 2 s (Akkord ab 0 s, Drums spätestens 2 s), Abschnitte à 4 Takte
(A · B mit Motiv · A2 mit Variation · C Breakdown), Senke −7 dB im Stimmband 1–4 kHz, Lautheit auf den alten Loop
abgeglichen (gleicher Abstand zur Stimme bei volume 0.13 in Episode.tsx).
Der Seed (CRC32 der Episoden-ID) wählt Transposition (±2), Akkordfolge aus der Bank, Motiv und Tempo-Nuance (±3 %)
→ zwei Videos klingen nie identisch. Alle Akkordfolgen sind Allerweltsfolgen, Motive zufällig aus Tonleitern – keine
fremden Melodien.
"""

from __future__ import annotations

import zlib
from itertools import pairwise

import numpy as np

SR = 44100
MOODS = ("dark", "hype", "funny", "epic", "chill", "upbeat")
ALIASES = {"cinematic": "epic", "trap": "dark", "rnb": "chill", "r&b": "chill", "lofi": "chill", "rap": "hype"}
DEFAULT_BPM = {"dark": 140, "hype": 148, "funny": 100, "epic": 88, "chill": 82}
KEYS = {"dark": 5, "hype": 7, "funny": 5, "epic": 2, "chill": 3}  # Tonklasse: f, g, F, d, Es
TARGET_LUFS = -18.3  # K-Näherung; ffmpeg-ebur128 misst damit ≈ −19 LUFS wie der alte Loop (12.11.2026)


def seed_from(text: str) -> int:
    return zlib.crc32(text.encode()) & 0xFFFF


# ---------------------------------------------------------------- Grundbausteine
def _t(sec: float) -> np.ndarray:
    return np.arange(max(1, int(SR * sec))) / SR


def _hz(m: float) -> float:
    return 440.0 * 2 ** ((m - 69) / 12)


def _filt(x: np.ndarray, gain_fn) -> np.ndarray:
    """Phasenneutraler FFT-Filter mit Nullpolster (kein Umlauf)."""
    n = len(x)
    m = 1 << int(np.ceil(np.log2(n + SR // 8)))
    f = np.fft.rfftfreq(m, 1 / SR)
    return np.fft.irfft(np.fft.rfft(x, m) * gain_fn(f), m)[:n]


def _lp(x, fc, order=2):
    return _filt(x, lambda f: 1 / np.sqrt(1 + (f / fc) ** (2 * order)))


def _hp(x, fc, order=2):
    return _filt(x, lambda f: 1 / np.sqrt(1 + (fc / np.maximum(f, 1e-3)) ** (2 * order)))


def _bp(x, lo, hi):
    return _hp(_lp(x, hi), lo)


def _env(t, a=0.003, d=4.0):
    return np.minimum(1, t / a) * np.exp(-t * d)


def _saw(f, t, voices=1, detune=0.0, rng=None):
    out = np.zeros_like(t)
    for v in range(voices):
        fv = f * (1 + detune * (v - (voices - 1) / 2))
        ph = (fv * t + (rng.random() if rng is not None else 0)) % 1
        out += 2 * ph - 1
    return out / voices


class Mix:
    def __init__(self, seconds: float):
        self.n = int(SR * seconds)
        self.bus = {k: np.zeros(self.n) for k in ("drums", "bass", "music", "fx")}
        self.kicks: list[float] = []

    def add(self, bus: str, start: float, sig: np.ndarray, gain: float = 1.0) -> None:
        i = round(start * SR)
        if i >= self.n or i + len(sig) <= 0:
            return
        if i < 0:
            sig, i = sig[-i:], 0
        sig = sig[: self.n - i]
        self.bus[bus][i : i + len(sig)] += sig * gain


# ---------------------------------------------------------------- Instrumente
class Kit:
    """Weiches, modernes Drum-Kit: runder Kick, Clap+Snare-Layer, leise Hats (keine harte Sättigung)."""

    def __init__(self, rng):
        t = _t(0.5)
        k = np.sin(2 * np.pi * np.cumsum(50 + 110 * np.exp(-t * 32)) / SR) * _env(t, 0.001, 7.5)
        self.kick = np.tanh(1.2 * k) + 0.15 * _bp(rng.standard_normal(len(t)), 1500, 5000) * np.exp(-t * 120)
        tc = _t(0.35)
        clap = np.zeros(len(tc))
        for j, off in enumerate((0, 0.010, 0.021)):
            i = int(off * SR)
            clap[i:] += rng.standard_normal(len(tc) - i) * np.exp(-tc[: len(tc) - i] * (90 if j < 2 else 18))
        self.clap = _bp(clap, 1000, 8000)
        ts = _t(0.28)
        body = np.sin(2 * np.pi * np.cumsum(185 + 40 * np.exp(-ts * 40)) / SR) * np.exp(-ts * 28)
        self.snare = 0.6 * body + _bp(rng.standard_normal(len(ts)), 1500, 7000) * np.exp(-ts * 20) * 0.7
        th = _t(0.08)
        self.hat = _hp(rng.standard_normal(len(th)), 7000, 3) * np.exp(-th * 75)
        tho = _t(0.3)
        self.ohat = _hp(rng.standard_normal(len(tho)), 6500, 3) * np.exp(-tho * 12)
        trim = _t(0.05)
        self.rim = (np.sin(2 * np.pi * 1700 * trim) * 0.4 + _bp(rng.standard_normal(len(trim)), 2500, 6000)) * np.exp(-trim * 120)
        tt = _t(0.9)
        tom = np.sin(2 * np.pi * np.cumsum(65 + 45 * np.exp(-tt * 18)) / SR) * _env(tt, 0.002, 4.5)
        self.taiko = np.tanh(1.2 * tom) + 0.2 * _lp(rng.standard_normal(len(tt)), 500) * np.exp(-tt * 25)
        tsn = _t(0.12)
        self.snap = _bp(rng.standard_normal(len(tsn)), 2000, 7000) * np.exp(-tsn * 60)

    def hats(self, mix, t0, beat, steps, swing, gain, skip=(), accent=4):
        """steps Hats je Takt (8 oder 16), Swing verschiebt jeden zweiten Schlag nach hinten."""
        step = 4 * beat / steps
        for j in range(steps):
            if j in skip:
                continue
            g = gain * (1.0 if j % accent == 0 else 0.62 if j % 2 == 0 else 0.48)
            mix.add("drums", t0 + j * step + (swing * step if j % 2 else 0), self.hat, g)

    def roll(self, mix, start, length, hits, gain=0.22):
        """Sparsamer Hat-Roll (Triolen/32tel), leicht anschwellend."""
        for j in range(hits):
            mix.add("drums", start + length * j / hits, self.hat, gain * (0.5 + 0.5 * j / hits))


def i808(f_from, f_to, dur, drive=1.3):
    """Weicher 808: Sinus mit Glide, nur leicht gesättigt (keine harte Verzerrung)."""
    t = _t(dur)
    glide = f_to + (f_from - f_to) * np.exp(-t / 0.06)
    f = glide * (1 + 0.35 * np.exp(-t * 45))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    env = np.minimum(1, t / 0.004) * np.exp(-t * 0.8) * np.minimum(1, (t[-1] - t) / 0.02)
    return _lp(np.tanh(drive * s) / np.tanh(drive) * env, 400)


def rhodes(f, dur=1.5, bright=0.8):
    """E-Piano (FM-Tine): warmer Grundton, kurzer Anschlag-„Bark“, abklingende Helligkeit."""
    t = _t(dur)
    idx = 0.2 + 1.3 * bright * np.exp(-t * 6)
    s = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * t))
    s += 0.08 * bright * np.sin(2 * np.pi * f * 7 * t) * np.exp(-t * 30)
    env = np.minimum(1, t / 0.003) * np.exp(-t * (0.7 + f / 1500)) * np.minimum(1, (t[-1] - t) / 0.05)
    return s * env


def guitar(f, dur=1.0, pos=0.2):
    """Clean-Gitarre (gezupft, additiv): Obertöne je nach Anschlagpunkt, höhere klingen schneller ab."""
    t = _t(dur)
    s = np.zeros_like(t)
    for k in range(1, 11):
        if f * k > 6000:
            break
        s += np.sin(np.pi * k * pos) / k**1.1 * np.sin(2 * np.pi * f * k * t) * np.exp(-t * (1.6 + 0.9 * k))
    return s * np.minimum(1, t / 0.002) * np.minimum(1, (t[-1] - t) / 0.03)


def bell(f, dur=1.4):
    t = _t(dur)
    s = np.sin(2 * np.pi * f * t + 1.6 * np.exp(-t * 3) * np.sin(2 * np.pi * 3.5 * f * t))
    return s * _env(t, 0.002, 2.8)


def keys(f, dur=1.0):
    """Weiches Klavier: Teiltöne mit eigener Abklingzeit."""
    t = _t(dur)
    s = sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t * d) for k, a, d in ((1, 1, 1.8), (2, 0.4, 3.5), (3, 0.18, 6), (4, 0.07, 9)))
    return s * np.minimum(1, t / 0.004) * np.minimum(1, (t[-1] - t) / 0.04)


def pad(freqs, dur, rng, fc=1000, att=0.4):
    t = _t(dur)
    s = sum(_saw(f, t, voices=3, detune=0.006, rng=rng) for f in freqs) / max(1, len(freqs))
    env = np.minimum(1, t / att) * np.minimum(1, (t[-1] - t) / 0.35)
    return _lp(s, fc) * env


def soft_bass(f, dur):
    """Runder Sinus-Bass (funny/chill), kurzer Biss über 2. Teilton."""
    t = _t(dur)
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t) * np.exp(-t * 12)
    return s * np.minimum(1, t / 0.006) * np.exp(-t * 2.2) * np.minimum(1, (t[-1] - t) / 0.02)


def braam(root, dur, rng):
    """Cineastische Fläche (weich, ohne harte Verzerrung): Grundton/Quinte/Oktave, Filter öffnet sich."""
    t = _t(dur)
    s = sum(_saw(_hz(m), t, voices=3, detune=0.007, rng=rng) for m in (root, root + 7, root + 12)) / 3
    out = np.zeros_like(s)
    edges = np.linspace(0, len(s), 6).astype(int)
    for k, (a, b) in enumerate(pairwise(edges)):
        out[a:b] = _lp(s, 180 + 180 * k)[a:b]
    return out * np.minimum(1, t / 0.1) * np.minimum(1, (t[-1] - t) / 0.5)


def riser(dur, rng):
    t = _t(dur)
    x = t / t[-1]
    noise = rng.standard_normal(len(t))
    out = np.zeros_like(t)
    edges = np.linspace(0, len(t), 7).astype(int)
    for k, (a, b) in enumerate(pairwise(edges)):
        out[a:b] = _bp(noise, 300 + 700 * k, 1200 + 1500 * k)[a:b]
    return out * x**2


def crackle(n, rng):
    out = 0.02 * _bp(rng.standard_normal(n), 1000, 6000)
    pos = rng.integers(0, n - 200, size=int(n / SR * 8))
    click = np.exp(-np.arange(60) / 6) * 0.5
    for p in pos:
        out[p : p + 60] += click * rng.choice([-1, 1]) * rng.uniform(0.3, 1)
    return _hp(out, 900)


# ---------------------------------------------------------------- Harmonik (Neo-Soul)
QUAL = {
    "maj7": (0, 4, 7, 11), "maj9": (0, 4, 7, 11, 14), "6/9": (0, 4, 7, 9, 14),
    "m7": (0, 3, 7, 10), "m9": (0, 3, 7, 10, 14), "m11": (0, 3, 7, 10, 14, 17),
    "9": (0, 4, 7, 10, 14), "13": (0, 4, 10, 14, 21), "7b9": (0, 4, 7, 10, 13), "sus9": (0, 5, 7, 10, 14),
}
# Folgen als (Stufe in Halbtönen über dem Grundton, Akkordqualität); je Preset eine Bank, Auswahl per Seed.
BANKS = {
    "dark": [
        [(0, "m9"), (8, "maj7"), (5, "m9"), (7, "7b9")],
        [(0, "m11"), (5, "m9"), (10, "9"), (3, "maj7")],
        [(0, "m9"), (1, "maj7"), (5, "m9"), (7, "7b9")],   # phrygisches bII – düster
        [(8, "maj9"), (7, "7b9"), (0, "m9"), (0, "m11")],
        [(0, "m9"), (3, "maj7"), (8, "maj7"), (7, "sus9")],
    ],
    "hype": [
        [(0, "m7"), (8, "maj7"), (10, "9"), (0, "m9")],
        [(0, "m9"), (3, "maj7"), (5, "m7"), (7, "7b9")],
        [(0, "m7"), (10, "sus9"), (8, "maj7"), (7, "m7")],
        [(0, "m11"), (8, "maj7"), (5, "m9"), (10, "9")],
    ],
    "funny": [
        [(0, "maj7"), (9, "m9"), (2, "m9"), (7, "13")],
        [(5, "maj7"), (4, "m7"), (2, "m9"), (0, "6/9")],
        [(0, "maj9"), (5, "maj7"), (4, "m7"), (9, "m9")],
        [(0, "6/9"), (2, "m9"), (5, "maj7"), (7, "sus9")],
    ],
    "epic": [
        [(0, "m9"), (8, "maj7"), (3, "maj7"), (10, "sus9")],
        [(0, "m11"), (5, "m9"), (8, "maj9"), (7, "7b9")],
        [(0, "m9"), (10, "9"), (8, "maj7"), (7, "sus9")],
        [(8, "maj7"), (10, "9"), (0, "m9"), (0, "m11")],
    ],
    "chill": [
        [(5, "maj7"), (4, "m7"), (2, "m9"), (0, "maj9")],
        [(0, "maj9"), (9, "m9"), (2, "m9"), (7, "13")],
        [(2, "m9"), (7, "13"), (0, "maj7"), (9, "m7")],
        [(0, "maj7"), (5, "maj9"), (4, "m7"), (9, "m9")],
    ],
}


def voicing(root: int, qual: str, lo: int = 55) -> list[int]:
    """Enge Lage ohne Grundton (den spielt der Bass) im Fenster [lo, lo+13): weich, mittig, Stimme bleibt frei."""
    iv = QUAL[qual]
    tones = iv[1:] if len(iv) > 3 else iv
    out = set()
    for d in tones:
        m = root + d
        while m < lo:
            m += 12
        while m >= lo + 13:
            m -= 12
        out.add(m)
    return sorted(out)


def bass_note(root: int) -> int:
    m = 24 + root % 12
    return m + 12 if m < 28 else m  # 808-Lage E1–D#2 (41–78 Hz)


def play_chord(mix, inst, start, notes, dur, gain, strum=0.012, **kw):
    for k, m in enumerate(notes):
        mix.add("music", start + strum * k, inst(_hz(m), dur, **kw), gain)


def _motif(rng, length=8, scale=(0, 3, 5, 7, 10, 12)):
    notes = [int(rng.choice(scale)) for _ in range(length)]
    rhythm = [bool(rng.random() < 0.55) for _ in range(length)]
    rhythm[0] = True
    return notes, rhythm


# ---------------------------------------------------------------- Arrangement
class Song:
    """Zeitraster: kurzes Intro (≤ 2 s, Akkord ab 0 s) → Drums → Abschnitte à 4 Takte."""

    def __init__(self, seconds, bpm):
        self.beat = 60 / bpm
        self.bar = 4 * self.beat
        self.intro = (4 if 4 * self.beat <= 2.0 else 2) * self.beat
        self.nbars = int(np.ceil((seconds - self.intro) / self.bar)) + 1

    def t(self, bar, beat=0.0):
        return self.intro + bar * self.bar + beat * self.beat

    @staticmethod
    def section(bar):
        return ("A", "B", "A2", "C")[(bar // 4) % 4]


def gen_dark(mix, s, key, prog, rng, kit):
    """Dunkles Moll-R&B/Trap: Rhodes-Flächen (Akkord je 2 Takte), Bell-Motiv, 808 mit Glide, Clap auf 3."""
    notes, rhythm = _motif(rng, scale=(0, 3, 5, 7, 10, 12, 15))
    sw = 0.16
    r0 = 48 + key + prog[0][0]
    play_chord(mix, rhodes, 0, voicing(r0, prog[0][1]), s.intro + 0.6, 0.11, bright=0.5)
    mix.add("fx", 0, riser(s.intro, rng), 0.05)
    prev = bass_note(r0)
    for bar in range(s.nbars):
        sec = s.section(bar)
        deg, q = prog[(bar // 2) % 4]
        r = 48 + key + deg
        t0 = s.t(bar)
        if bar % 2 == 0:
            play_chord(mix, rhodes, t0, voicing(r, q), s.bar * 2, 0.10, strum=0.018, bright=0.55)
            mix.add("music", t0, pad([_hz(m) for m in voicing(r, q, 50)[:3]], s.bar * 2, rng, fc=700, att=0.8), 0.05)
        elif sec in ("B", "A2"):
            play_chord(mix, rhodes, t0 + s.beat * 1.5, voicing(r, q)[-3:], s.beat * 2, 0.06, bright=0.4)
        if sec in ("B", "A2"):  # Motiv: Bell, in A2 versetzt und eine Oktave höher am Taktanfang
            for j in range(8):
                if rhythm[(j + (3 if sec == "A2" else 0)) % 8] and j % 2 == 0:
                    m = 72 + key + notes[j] + (12 if sec == "A2" and j == 0 else 0)
                    mix.add("music", t0 + j * s.beat / 2, bell(_hz(m), 1.1), 0.07)
        if sec == "C" and bar % 4 < 2:  # Breakdown: nur Rhodes + Riser
            if bar % 4 == 1:
                mix.add("fx", t0, riser(s.bar, rng), 0.06)
            continue
        b = bass_note(r)
        mix.add("bass", t0, i808(_hz(prev), _hz(b), s.beat * 2.6), 0.60)
        if bar % 2:
            mix.add("bass", t0 + s.beat * 2.75, i808(_hz(b), _hz(b + (12 if bar % 4 == 3 else 7)), s.beat * 1.2), 0.42)
        prev = b
        mix.add("drums", t0, kit.kick, 0.55)
        mix.kicks.append(t0)
        if bar % 2:
            mix.add("drums", t0 + s.beat * 2.75, kit.kick, 0.38)
        mix.add("drums", t0 + s.beat * 2, kit.clap, 0.30)
        mix.add("drums", t0 + s.beat * 2, kit.snare, 0.20)
        roll = bar % 8 == 7
        kit.hats(mix, t0, s.beat, 8, sw, 0.24, skip=(7,) if roll else ())
        if roll:
            kit.roll(mix, t0 + s.beat * 3.5, s.beat / 2, 6)
        if sec == "A2" and bar % 2:
            mix.add("drums", t0 + s.beat * 3.5, kit.ohat, 0.10)


def gen_hype(mix, s, key, prog, rng, kit):
    """Treibender Rap-Beat: Akkord je Takt, synkopierte Gitarren-/Rhodes-Stabs, hüpfender 808, Ghost-Snares."""
    notes, rhythm = _motif(rng, scale=(0, 3, 5, 7, 10, 12))
    sw = 0.12
    stab = (0, 3, 6) if rng.random() < 0.5 else (0, 3, 5)  # Stab-Rhythmus in 8teln, Seed-abhängig
    r0 = 48 + key + prog[0][0]
    play_chord(mix, rhodes, 0, voicing(r0, prog[0][1]), s.intro, 0.10, bright=0.7)
    for j in range(4):
        mix.add("drums", s.intro - s.beat + j * s.beat / 4, kit.snare, 0.08 + 0.05 * j)
    prev = bass_note(r0)
    for bar in range(s.nbars):
        sec = s.section(bar)
        deg, q = prog[bar % 4]
        r = 48 + key + deg
        t0 = s.t(bar)
        vc = voicing(r, q, 57)
        for j in stab:
            play_chord(mix, guitar, t0 + j * s.beat / 2, vc, s.beat * 0.9, 0.09, strum=0.008)
        play_chord(mix, rhodes, t0, voicing(r, q), s.bar, 0.06, bright=0.5)
        if sec in ("B", "A2"):
            for j in range(8):
                if rhythm[(j + (2 if sec == "A2" else 0)) % 8]:
                    mix.add("music", t0 + j * s.beat / 2, rhodes(_hz(72 + key + notes[j]), 0.5, 0.9), 0.07)
        if sec == "C" and bar % 4 == 0:
            mix.add("fx", t0, riser(s.bar, rng), 0.07)
            continue
        b = bass_note(r)
        mix.add("bass", t0, i808(_hz(prev), _hz(b), s.beat * 1.4), 0.58)
        mix.add("bass", t0 + s.beat * 1.5, i808(_hz(b), _hz(b + 12), s.beat * 0.9), 0.38)
        mix.add("bass", t0 + s.beat * 2.5, i808(_hz(b + 12), _hz(b + (3 if bar % 2 else 7)), s.beat * 1.4), 0.42)
        prev = b
        mix.add("drums", t0, kit.kick, 0.58)
        mix.kicks.append(t0)
        mix.add("drums", t0 + s.beat * 1.5, kit.kick, 0.40)
        if bar % 2:
            mix.add("drums", t0 + s.beat * 3.25, kit.kick, 0.30)
        mix.add("drums", t0 + s.beat * 2, kit.snare, 0.30)
        mix.add("drums", t0 + s.beat * 2, kit.clap, 0.25)
        mix.add("drums", t0 + s.beat * 3.75, kit.snare, 0.09)  # Ghost
        roll = bar % 4 == 3
        kit.hats(mix, t0, s.beat, 16 if sec != "A" else 8, sw, 0.20, skip=(14, 15) if roll else ())
        if roll:
            kit.roll(mix, t0 + s.beat * 3.5, s.beat / 2, 4)


def gen_funny(mix, s, key, prog, rng, kit):
    """Bouncy R&B-Pop: Offbeat-Rhodes-Stabs, hüpfender Sinus-Bass, Snaps auf 2 und 4, Swing-16tel."""
    notes, rhythm = _motif(rng, length=8, scale=(0, 2, 4, 7, 9, 12, 14))
    sw = 0.22
    for j in range(4):
        mix.add("music", j * s.intro / 4, rhodes(_hz(60 + key + (0, 4, 7, 11)[j]), 0.4, 0.9), 0.12)
        mix.add("drums", j * s.intro / 4, kit.snap, 0.14)
    for bar in range(s.nbars):
        sec = s.section(bar)
        deg, q = prog[bar % 4]
        r = 48 + key + deg
        t0 = s.t(bar)
        vc = voicing(r, q, 58)
        for j in (1, 3, 4, 6) if bar % 2 else (1, 3, 5, 7):  # Offbeat-Stabs (kurz) – „Bounce“
            play_chord(mix, rhodes, t0 + j * s.beat / 2 + sw * s.beat / 4, vc, s.beat * 0.3, 0.07, strum=0.006, bright=0.9)
        if sec in ("B", "A2"):
            for j in range(8):
                if rhythm[(j + (3 if sec == "A2" else 0)) % 8]:
                    m = 72 + key + notes[j] + (12 if sec == "A2" and j in (3, 7) else 0)
                    mix.add("music", t0 + j * s.beat / 2, bell(_hz(m), 0.5), 0.08)
        if sec == "C" and bar % 4 == 0:
            for j in range(4):
                mix.add("drums", t0 + j * s.beat, kit.snap, 0.2)
            mix.add("fx", t0, riser(s.bar, rng), 0.05)
            continue
        b = bass_note(r)
        for off, oc, d in ((0, 0, 0.8), (1.5, 12, 0.4), (2, 0, 0.6), (3, 7, 0.4), (3.5, 12, 0.4)):
            mix.add("bass", t0 + off * s.beat, soft_bass(_hz(b + 12 + oc), s.beat * d), 0.42)
        mix.add("drums", t0, kit.kick, 0.50)
        mix.kicks.append(t0)
        mix.add("drums", t0 + s.beat * 2.5, kit.kick, 0.36)
        for j in (1, 3):
            mix.add("drums", t0 + j * s.beat, kit.clap, 0.22)
            mix.add("drums", t0 + j * s.beat, kit.snap, 0.16)
        kit.hats(mix, t0, s.beat, 16, sw, 0.14)
        if bar % 8 == 7:
            kit.roll(mix, t0 + s.beat * 3.5, s.beat / 2, 3, 0.18)


def gen_epic(mix, s, key, prog, rng, kit):
    """Cineastischer Rap-Beat: Klavier + Streicherfläche, Boom-Bap-Drums (2 & 4), Taikos an Abschnittsgrenzen."""
    notes, rhythm = _motif(rng, scale=(0, 2, 3, 7, 8, 12))
    sw = 0.14
    r0 = 48 + key + prog[0][0]
    mix.add("music", 0, braam(r0 - 12, s.intro + 0.5, rng), 0.10)
    play_chord(mix, keys, 0, voicing(r0, prog[0][1]), s.intro + 0.5, 0.11)
    for bar in range(s.nbars):
        sec = s.section(bar)
        deg, q = prog[bar % 4]
        r = 48 + key + deg
        t0 = s.t(bar)
        vc = voicing(r, q)
        mix.add("music", t0, pad([_hz(m) for m in vc[:3]] + [_hz(r - 12)], s.bar, rng, fc=1100, att=0.5), 0.09)
        play_chord(mix, keys, t0, vc, s.bar * 0.9, 0.08)
        if bar % 4 == 0:
            mix.add("music", t0, braam(r - 12, s.bar * 1.2, rng), 0.07)
            mix.add("drums", t0, kit.taiko, 0.40)
        if sec in ("B", "A2"):  # Klavier-Motiv, in A2 mit 16tel-Ostinato darunter
            for j in range(8):
                if rhythm[(j + (2 if sec == "A2" else 0)) % 8]:
                    mix.add("music", t0 + j * s.beat / 2, keys(_hz(72 + key + notes[j]), 0.8), 0.09)
            if sec == "A2":
                for j in range(16):
                    mix.add("music", t0 + j * s.beat / 4, guitar(_hz(r + (0, 7, 12, 7)[j % 4]), 0.25, 0.3), 0.06)
        b = bass_note(r)
        mix.add("bass", t0, i808(_hz(b), _hz(b), s.bar * 0.95, drive=1.1), 0.50)
        if sec == "C" and bar % 4 == 0:
            mix.add("fx", t0, riser(s.bar, rng), 0.07)
            continue
        mix.add("drums", t0, kit.kick, 0.58)
        mix.kicks.append(t0)
        mix.add("drums", t0 + s.beat * 2.5, kit.kick, 0.42)
        for j in (1, 3):
            mix.add("drums", t0 + j * s.beat, kit.snare, 0.34)
            mix.add("drums", t0 + j * s.beat, kit.clap, 0.16)
        kit.hats(mix, t0, s.beat, 8, sw, 0.16)
        if bar % 4 == 3:
            for j in range(4):
                mix.add("drums", t0 + s.beat * 3 + j * s.beat / 4, kit.taiko, 0.12 + 0.05 * j)


def gen_chill(mix, s, key, prog, rng, kit):
    """R&B/Lo-fi: Rhodes-Akkorde verschleppt, Gitarren-Arpeggio in B/A2, runder Bass, Swing-Hats, Knistern."""
    _notes, rhythm = _motif(rng, scale=(0, 2, 4, 7, 9, 12, 14))
    sw = 0.25
    r0 = 48 + key + prog[0][0]
    play_chord(mix, rhodes, 0, voicing(r0, prog[0][1]), s.intro + 0.4, 0.11, strum=0.025, bright=0.5)
    for bar in range(s.nbars):
        sec = s.section(bar)
        deg, q = prog[bar % 4]
        r = 48 + key + deg
        t0 = s.t(bar)
        vc = voicing(r, q)
        play_chord(mix, rhodes, t0 + 0.02, vc, s.bar * 0.95, 0.10, strum=0.025, bright=0.5)
        if sec in ("B", "A2"):
            arp = vc + [vc[0] + 12]
            for j in range(8):
                if rhythm[j] or sec == "A2":
                    tj = t0 + j * s.beat / 2 + (sw * s.beat / 2 if j % 2 else 0)
                    mix.add("music", tj, guitar(_hz(arp[(j * (2 if sec == "A2" else 1)) % len(arp)]), 0.9), 0.08)
        b = bass_note(r)
        mix.add("bass", t0, soft_bass(_hz(b + 12), s.beat * 2.4), 0.48)
        mix.add("bass", t0 + s.beat * 2.5, soft_bass(_hz(b + 12 + 7), s.beat * 1.2), 0.32)
        if sec == "C" and bar % 4 == 0:
            continue
        mix.add("drums", t0, kit.kick, 0.45)
        mix.kicks.append(t0)
        mix.add("drums", t0 + s.beat * 2.5, kit.kick, 0.32)
        mix.kicks.append(t0 + s.beat * 2.5)
        for j in (1, 3):
            mix.add("drums", t0 + j * s.beat, _lp(kit.snare, 5000), 0.26)
        kit.hats(mix, t0, s.beat, 8, sw, 0.17)
        if bar % 4 == 3:
            mix.add("drums", t0 + s.beat * 3.5, kit.rim, 0.14)


BASS_GAIN = {"dark": 0.5, "hype": 0.5, "funny": 0.9, "epic": 0.5, "chill": 0.75}  # Messung 12.11.2026, s. werkzeugbau.md
GEN = {"dark": gen_dark, "hype": gen_hype, "funny": gen_funny, "epic": gen_epic, "chill": gen_chill}


# ---------------------------------------------------------------- Mastering
def _kweight_lufs(x: np.ndarray) -> float:
    """Näherung der integrierten Lautheit (K-Filter im Frequenzbereich, 400-ms-Blöcke, Gate −70/−10)."""
    y = _filt(x, lambda f: (1 / np.sqrt(1 + (60 / np.maximum(f, 1e-3)) ** 4)) * (1 + 0.585 / (1 + (1500 / np.maximum(f, 1)) ** 2)))
    blk = int(0.4 * SR)
    hop = blk // 4
    p = np.array([np.mean(y[i : i + blk] ** 2) for i in range(0, max(1, len(y) - blk), hop)]) + 1e-12
    l = -0.691 + 10 * np.log10(p)
    p = p[l > -70]
    rel = -0.691 + 10 * np.log10(p.mean()) - 10
    p = p[-0.691 + 10 * np.log10(p) > rel]
    return float(-0.691 + 10 * np.log10(p.mean()))


def _voice_dip(f: np.ndarray, depth_db: float = 7.0) -> np.ndarray:
    """Senke im Stimmband: voll zwischen 1 und 4 kHz, weiche Flanken über je eine halbe Oktave."""
    o = np.log2(np.maximum(f, 1) / 1000)
    w = np.clip(np.minimum((o + 0.5) / 0.5, (2.5 - o) / 0.5), 0, 1)
    w = np.sin(w * np.pi / 2) ** 2
    return 10 ** (-depth_db * w / 20)


def describe(mood: str, seed: int, bpm: float | None = None) -> dict:
    """Was der Seed wählt (für Log/Drehbuch-Begründung): Tonart, BPM, Akkordfolge."""
    mood = ALIASES.get(mood, mood)
    rng = np.random.default_rng(seed)
    nuance = 1 + float(rng.uniform(-0.03, 0.03))
    key = (KEYS[mood] + int(rng.integers(-2, 3))) % 12
    var = int(rng.integers(0, len(BANKS[mood])))
    names = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"]
    return {
        "mood": mood,
        "bpm": round(bpm or DEFAULT_BPM[mood] * nuance, 1),
        "key": names[key] + (" minor" if mood in ("dark", "hype", "epic") else " major"),
        "chords": " – ".join(names[(key + d) % 12] + q for d, q in BANKS[mood][var]),
        "_rng": rng, "_key": key, "_var": var,
    }


def render(seconds: float, mood: str, bpm: float | None = None, seed: int = 0) -> np.ndarray:
    d = describe(mood, seed, bpm)
    mood, rng = d["mood"], d["_rng"]
    print(f"Musik: {mood}, {d['bpm']} BPM, {d['key']}, {d['chords']} (Seed {seed})")
    song = Song(seconds, d["bpm"])
    mix = Mix(seconds)
    kit = Kit(rng)
    GEN[mood](mix, song, d["_key"], BANKS[mood][d["_var"]], rng, kit)
    # Hall auf die Musik-Spur (Faltung mit abklingendem Rauschen)
    ir_t = _t(1.8 if mood in ("epic", "dark") else 1.0)
    ir = _lp(rng.standard_normal(len(ir_t)), 4500) * np.exp(-ir_t * 4.0)
    ir /= np.sqrt(np.sum(ir**2))
    m = mix.bus["music"] + 0.5 * mix.bus["fx"]
    size = 1 << int(np.ceil(np.log2(len(m) + len(ir))))
    wet = np.fft.irfft(np.fft.rfft(m, size) * np.fft.rfft(ir, size), size)[: len(m)]
    music = mix.bus["music"] + 0.25 * wet
    # Sidechain-Pumpen (dezent) auf die Musik
    duck = np.ones(mix.n)
    depth = {"chill": 0.35, "dark": 0.25, "hype": 0.3, "funny": 0.15, "epic": 0.2}[mood]
    shape = 1 - depth * np.exp(-_t(0.3) / 0.09)
    for k in mix.kicks:
        i = int(k * SR)
        seg = duck[i : i + len(shape)]
        duck[i : i + len(seg)] = np.minimum(seg, shape[: len(seg)])
    # Bass-Anteil: 808 trägt, darf Rhodes/Gitarre aber nicht zudecken (Handy-Lautsprecher geben < 100 Hz kaum wieder)
    out = music * duck + BASS_GAIN[mood] * mix.bus["bass"] + mix.bus["drums"] + mix.bus["fx"]
    if mood == "chill":
        out += crackle(mix.n, rng)
        out = _lp(out, 7000)  # Lo-fi: obere Höhen weg
    out = _filt(out, _voice_dip)  # Stimmband 1–4 kHz freihalten
    out = _hp(out, 30)
    out *= 10 ** ((TARGET_LUFS - _kweight_lufs(out)) / 20)
    out = np.tanh(out / 0.95) * 0.95  # weicher Limiter, keine harte Begrenzung
    n = mix.n
    fade = np.minimum(1, np.minimum(np.arange(n) / (SR * 0.02), (n - np.arange(n)) / (SR * 1.5)))
    return out * fade
