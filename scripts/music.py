"""Musik-Presets je Stimmung – vollständig selbst synthetisiert (numpy), daher lizenzfrei.

Vorgabe Nutzer 12.11.2026: Musik passend zum Thema und zeitgemäß/trendig, nie dieselbe Musik.
Aufruf über make_audio.make_music(path, seconds, bpm, mood, seed). Regeln: docs/clip-regeln.md → „Musik je Thema“.

Presets (BPM-Standard, Grundtonart vor Seed-Transposition):
  dark      Trap/Phonk, 140 half-time, f-Moll    – 808 mit Glide, Clap auf 3, Hi-Hat-Rolls/Triolen, Bell + Cowbell
  hype      Drill/Trap, 144 half-time, g-Moll    – rutschender 808, Drill-Snares, Pizz-Strings, Riser + Impacts
  funny     bouncy Pop, 112, F-Dur               – Marimba + Pizzicato, hüpfender Bass, Claps/Snaps
  epic      Trailer-Puls, 120, d-Moll            – 16tel-Ostinato, Braams, Taikos, Hits, Riser („cinematic“ = epic)
  chill     Lo-fi, 82, Es-Dur-Septakkorde        – Rhodes, Swing-Hats, Vinyl-Knistern, Sidechain-Pumpen
  upbeat    alter Loop (make_audio._music_upbeat), unverändert für alte Drehbücher

Gemeinsam: Drop spätestens nach 2 s, Abschnitte à 4 Takte (A · B · A' · Breakdown), Fills/Riser am Abschnittsende,
Senke −7 dB im Stimmband 1–4 kHz, Lautheit auf den alten Loop abgeglichen (gleicher Abstand zur Stimme bei volume 0.13).
Der Seed (aus der Episoden-ID) wählt Transposition, Akkordfolge-Variante und Motiv → zwei Videos klingen nie gleich.
"""

from __future__ import annotations

import zlib

import numpy as np

SR = 44100
MOODS = ("dark", "hype", "funny", "epic", "chill", "upbeat")
ALIASES = {"cinematic": "epic", "trap": "dark", "phonk": "dark", "lofi": "chill", "drill": "hype"}
DEFAULT_BPM = {"dark": 140, "hype": 144, "funny": 112, "epic": 120, "chill": 82}
TARGET_LUFS = -18.3  # = Lautheit des alten Loops (K-Näherung, gemessen 12.11.2026) → gleicher Abstand zur Stimme


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
        self.bus = {k: np.zeros(self.n) for k in ("drums", "bass", "music", "fx", "verb")}
        self.kicks: list[float] = []

    def add(self, bus: str, start: float, sig: np.ndarray, gain: float = 1.0) -> None:
        i = int(round(start * SR))
        if i >= self.n or i + len(sig) <= 0:
            return
        if i < 0:
            sig, i = sig[-i:], 0
        sig = sig[: self.n - i]
        self.bus[bus][i : i + len(sig)] += sig * gain


# ---------------------------------------------------------------- Instrumente
class Kit:
    def __init__(self, rng):
        self.rng = rng
        t = _t(0.5)
        self.kick = np.sin(2 * np.pi * np.cumsum(48 + 130 * np.exp(-t * 35)) / SR) * _env(t, 0.001, 7)
        self.kick = np.tanh(self.kick * 1.8)
        tc = _t(0.35)
        clap = np.zeros(len(tc))
        for k, off in enumerate((0, 0.011, 0.022)):
            i = int(off * SR)
            clap[i:] += rng.standard_normal(len(tc) - i) * np.exp(-tc[: len(tc) - i] * (90 if k < 2 else 16))
        self.clap = _bp(clap, 900, 9000)
        ts = _t(0.25)
        snare = rng.standard_normal(len(ts)) * np.exp(-ts * 22)
        snare = _hp(snare, 1800) + 0.5 * np.sin(2 * np.pi * 190 * ts) * np.exp(-ts * 30)
        self.snare = snare
        th = _t(0.09)
        self.hat = _hp(rng.standard_normal(len(th)), 7500, 3) * np.exp(-th * 70)
        tho = _t(0.35)
        self.ohat = _hp(rng.standard_normal(len(tho)), 7000, 3) * np.exp(-tho * 11)
        trim = _t(0.05)
        self.rim = (np.sin(2 * np.pi * 1700 * trim) * 0.4 + _bp(rng.standard_normal(len(trim)), 2500, 6000)) * np.exp(-trim * 120)
        tt = _t(0.9)
        self.tom = np.sin(2 * np.pi * np.cumsum(70 + 60 * np.exp(-tt * 20)) / SR) * _env(tt, 0.002, 5)
        self.tom = np.tanh(1.5 * self.tom) + 0.25 * _lp(rng.standard_normal(len(tt)), 600) * np.exp(-tt * 25)
        tsn = _t(0.12)
        self.snap = _bp(rng.standard_normal(len(tsn)), 2500, 8000) * np.exp(-tsn * 60)

    def roll(self, mix, start, length, div, gain=0.32, crescendo=True):
        """Hi-Hat-Roll: div Schläge je Sekunde-Länge gleichmäßig verteilt."""
        k = max(1, int(div))
        for j in range(k):
            g = gain * (0.55 + 0.45 * j / k if crescendo else 1)
            mix.add("drums", start + length * j / k, self.hat, g)


def i808(f_from, f_to, dur, punch=True, drive=2.4):
    t = _t(dur)
    glide = f_to + (f_from - f_to) * np.exp(-t / 0.07)
    f = glide * (1 + (0.6 * np.exp(-t * 40) if punch else 0))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    env = np.minimum(1, t / 0.004) * np.exp(-t * 0.9) * np.minimum(1, (t[-1] - t) / 0.015)
    return _lp(np.tanh(drive * s) * env, 700)


def bell(f, dur=1.6, bright=1.0):
    t = _t(dur)
    idx = 2.2 * bright * np.exp(-t * 3)
    s = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * 3.5 * f * t))
    return _lp(s * _env(t, 0.002, 2.6), 2600)


def keys(f, dur=1.0, dark=True):
    """Weiches Klavier/Rhodes: Teiltöne mit eigener Abklingzeit."""
    t = _t(dur)
    s = sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t * d) for k, a, d in ((1, 1, 2.2), (2, 0.45, 4), (3, 0.2, 7), (4, 0.08, 9)))
    s = s * np.minimum(1, t / 0.004) * np.minimum(1, (t[-1] - t) / 0.03)
    return _lp(s, 1500 if dark else 2400)


def pluck(f, dur=0.35, fc=2200):
    t = _t(dur)
    return _lp(_saw(f, t) * _env(t, 0.002, 9), fc)


def marimba(f, dur=0.45):
    t = _t(dur)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 9) + 0.2 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t * 30)
    return s * np.minimum(1, t / 0.001)


def pad(freqs, dur, rng, fc=1100, att=0.35):
    t = _t(dur)
    s = sum(_saw(f, t, voices=3, detune=0.006, rng=rng) for f in freqs) / max(1, len(freqs))
    env = np.minimum(1, t / att) * np.minimum(1, (t[-1] - t) / 0.3)
    return _lp(s, fc) * env


def braam(root, dur, rng):
    t = _t(dur)
    s = sum(_saw(_hz(m), t, voices=3, detune=0.008, rng=rng) for m in (root, root + 7, root + 12))
    cut = 150 + 1200 * np.minimum(1, t / (dur * 0.35))
    # zeitvariabler Filter grob in 4 Blöcken
    out = np.zeros_like(s)
    edges = np.linspace(0, len(s), 6).astype(int)
    for a, b in zip(edges[:-1], edges[1:]):
        out[a:b] = _lp(s, float(cut[min(b - 1, len(cut) - 1)]))[a:b]
    env = np.minimum(1, t / 0.08) * np.minimum(1, (t[-1] - t) / 0.4)
    return np.tanh(1.5 * out) * env


def riser(dur, rng):
    t = _t(dur)
    x = t / t[-1]
    noise = rng.standard_normal(len(t))
    out = np.zeros_like(t)
    edges = np.linspace(0, len(t), 9).astype(int)
    for k, (a, b) in enumerate(zip(edges[:-1], edges[1:])):
        out[a:b] = _bp(noise, 400 + 900 * k, 1500 + 1800 * k)[a:b]
    tone = np.sin(2 * np.pi * np.cumsum(200 + 900 * x**2) / SR) * 0.25
    return (out + tone) * x**2


def impact(rng):
    t = _t(1.8)
    boom = np.sin(2 * np.pi * np.cumsum(40 + 90 * np.exp(-t * 25)) / SR) * np.exp(-t * 2.5)
    crash = _hp(rng.standard_normal(len(t)), 4000) * np.exp(-t * 3.5) * 0.35
    return np.tanh(1.6 * boom) + crash


def crackle(n, rng):
    out = 0.02 * _bp(rng.standard_normal(n), 1000, 6000)
    pos = rng.integers(0, n - 200, size=int(n / SR * 9))
    click = np.exp(-np.arange(60) / 6) * 0.5
    for p in pos:
        out[p : p + 60] += click * rng.choice([-1, 1]) * rng.uniform(0.3, 1)
    return _hp(out, 900)


# ---------------------------------------------------------------- Arrangement
class Song:
    """Zeitraster: kurzes Intro (≤ 2 s) → Drop → Abschnitte à 4 Takte."""

    def __init__(self, seconds, bpm, beats_intro_max=4):
        self.beat = 60 / bpm
        self.bar = 4 * self.beat
        ib = 4 if 4 * self.beat <= 2.0 else 2
        self.intro = ib * self.beat
        self.nbars = int(np.ceil((seconds - self.intro) / self.bar)) + 1

    def t(self, bar, beat=0.0):
        return self.intro + bar * self.bar + beat * self.beat

    @staticmethod
    def section(bar):
        return ("A", "B", "A2", "C")[(bar // 4) % 4]


def _var(seed, n):
    return np.random.default_rng(seed).integers(0, n)


def _chords_minor(root, variant):
    """Moll-Folgen (Stufen relativ zum Grundton), Auswahl per Seed."""
    banks = [
        [0, 8, 5, 7],   # i–VI–iv–V
        [0, 8, 3, 10],  # i–VI–III–VII
        [0, 5, 8, 7],   # i–iv–VI–V
        [0, 10, 8, 7],  # i–VII–VI–V (andalusisch)
    ]
    return [root + d for d in banks[variant % len(banks)]]


def _triad(root, minor):
    return [root, root + (3 if minor else 4), root + 7]


def _minor_q(deg):  # in natürlichem Moll: welche Stufen sind Moll-Akkorde
    return deg % 12 in (0, 5, 7) and deg % 12 != 7  # V als Dur (harmonisch)


def _motif(rng, length=8, scale=(0, 3, 5, 7, 10, 12)):
    notes = [int(rng.choice(scale)) for _ in range(length)]
    rhythm = [bool(rng.random() < 0.65) for _ in range(length)]
    rhythm[0] = True
    return notes, rhythm


def gen_dark(mix, song, key, var, rng, kit, phonk=True):
    roots = _chords_minor(key, var)
    notes, rhythm = _motif(rng)
    b = song
    # Intro: Bell-Motiv gefiltert + Riser, Drop mit 808 auf Takt 0
    for j in range(8):
        if rhythm[j]:
            mix.add("music", j * b.intro / 8, bell(_hz(key + 24 + notes[j]), 1.2), 0.18)
    mix.add("fx", 0, riser(b.intro, rng), 0.10)
    prev = roots[0]
    for bar in range(b.nbars):
        sec = song.section(bar)
        r = roots[bar % 4]
        t0 = b.t(bar)
        last = bar % 4 == 3
        drums = not (sec == "C" and bar % 4 == 0)
        # Bell/Piano-Motiv (8tel), in A2 eine Oktave höher und Variation
        for j in range(8):
            if rhythm[(j + (2 if sec == "A2" else 0)) % 8] and (j % 2 == 0 or sec != "A"):
                m = r + 24 + notes[j] + (12 if sec == "A2" and j % 4 == 0 else 0)
                mix.add("music", t0 + j * b.beat / 2, bell(_hz(m), 1.1), 0.15)
        mix.add("music", t0, pad([_hz(r + 12), _hz(r + 15), _hz(r + 19)], b.bar, rng, fc=900), 0.10)
        if phonk and sec in ("B", "A2"):  # Phonk-Cowbell
            for j in (0, 3, 6):
                m = r + 36 + (7 if j == 3 else 0)
                t = _t(0.2)
                cb = (np.sign(np.sin(2 * np.pi * _hz(m) * t)) + np.sign(np.sin(2 * np.pi * _hz(m) * 1.48 * t))) * np.exp(-t * 18)
                mix.add("music", t0 + j * b.beat / 2 + b.beat * 2, _lp(cb, 2500), 0.035)
        if not drums:
            mix.add("fx", t0, riser(b.bar, rng), 0.09)
            continue
        # 808: Grundton auf 1, Glide-Nachschlag
        mix.add("bass", t0, i808(_hz(prev - 12), _hz(r - 12), b.beat * 2.5), 0.55)
        mix.add("bass", t0 + b.beat * 2.75, i808(_hz(r - 12), _hz(r - 12 + (12 if bar % 2 else 7)), b.beat * 1.2), 0.45)
        prev = r
        mix.add("drums", t0, kit.kick, 0.6)
        mix.kicks.append(t0)
        if bar % 2:
            mix.add("drums", t0 + b.beat * 2.75, kit.kick, 0.45)
        mix.add("drums", t0 + b.beat * 2, kit.clap, 0.42)  # half-time Clap auf 3
        # Hats: 8tel, mit 16tel/Triolen/32tel-Rolls
        for j in range(8):
            tj = t0 + j * b.beat / 2
            if j == 7 and (last or sec == "B"):
                kit.roll(mix, tj, b.beat / 2, 6 if bar % 2 else 4)  # Triole oder 32tel
            elif j == 3 and sec in ("B", "A2"):
                kit.roll(mix, tj, b.beat / 2, 3, crescendo=False)
            else:
                mix.add("drums", tj, kit.hat, 0.30 if j % 2 == 0 else 0.2)
        if last:
            mix.add("fx", t0 + b.beat * 2, riser(b.beat * 2, rng), 0.07)


def gen_hype(mix, song, key, var, rng, kit):
    roots = _chords_minor(key, var + 1)
    notes, rhythm = _motif(rng, scale=(0, 2, 3, 7, 8, 12))
    b = song
    mix.add("fx", 0, riser(b.intro, rng), 0.16)
    for j in range(4):
        mix.add("drums", b.intro - b.beat + j * b.beat / 4, kit.snare, 0.15 + 0.08 * j)
    prev = roots[0]
    for bar in range(b.nbars):
        sec = song.section(bar)
        r = roots[bar % 4]
        t0 = b.t(bar)
        if bar % 4 == 0:
            mix.add("fx", t0, impact(rng), 0.30)
        # Pizzicato-Streicher (16tel-Ostinato) + Bell-Melodie in B/A2
        for j in range(16):
            m = r + 12 + (0, 7, 12, 7)[j % 4] + (3 if j >= 8 and sec != "A" else 0)
            mix.add("music", t0 + j * b.beat / 4, pluck(_hz(m), 0.18, 1800), 0.10 if j % 4 else 0.14)
        if sec in ("B", "A2"):
            for j in range(8):
                if rhythm[j]:
                    mix.add("music", t0 + j * b.beat / 2, bell(_hz(r + 24 + notes[j]), 0.9), 0.12)
        mix.add("music", t0, pad([_hz(r), _hz(r + 3), _hz(r + 7)], b.bar, rng, fc=700), 0.09)
        if sec == "C" and bar % 4 == 0:
            mix.add("fx", t0, riser(b.bar, rng), 0.12)
            continue
        # Drill: Kick 1 + „3+“; Snare auf 3 + Ghost-Snares; 808-Slides
        mix.add("drums", t0, kit.kick, 0.6)
        mix.kicks.append(t0)
        mix.add("drums", t0 + b.beat * 1.5, kit.kick, 0.4)
        mix.add("drums", t0 + b.beat * 2, kit.snare, 0.45)
        mix.add("drums", t0 + b.beat * 2, kit.clap, 0.25)
        mix.add("drums", t0 + b.beat * 3.75, kit.snare, 0.18)
        if bar % 2:
            mix.add("drums", t0 + b.beat * 0.75, kit.snare, 0.15)
        tgt = r - 12 + (0 if bar % 2 == 0 else 12)
        mix.add("bass", t0, i808(_hz(prev - 12), _hz(r - 12), b.beat * 1.4), 0.55)
        mix.add("bass", t0 + b.beat * 1.5, i808(_hz(r - 12), _hz(tgt + 3), b.beat * 1.2, punch=False), 0.45)
        mix.add("bass", t0 + b.beat * 3, i808(_hz(tgt + 3), _hz(tgt), b.beat, punch=False), 0.45)
        prev = r
        # Triolen-Hats (Drill-Feel)
        for j in range(12):
            if j % 3 != 1 or sec != "A":
                mix.add("drums", t0 + j * b.beat / 3, kit.hat, 0.28 if j % 3 == 0 else 0.18)
        if bar % 4 == 3:
            kit.roll(mix, t0 + b.beat * 3, b.beat, 8)
            mix.add("fx", t0 + b.beat * 2, riser(b.beat * 2, rng), 0.12)


def gen_funny(mix, song, key, var, rng, kit):
    banks = [[0, 9, 2, 7], [0, 5, 7, 0], [0, 4, 5, 7], [0, 9, 5, 7]]
    degs = banks[var % 4]
    notes, rhythm = _motif(rng, scale=(0, 2, 4, 7, 9, 12))
    b = song
    # Intro: Marimba-Aufgang + Snaps, Drop nach 2 Schlägen
    for j in range(4):
        mix.add("music", j * b.intro / 4, marimba(_hz(key + 12 + (0, 4, 7, 12)[j])), 0.30)
        mix.add("drums", j * b.intro / 4, kit.snap, 0.2)
    for bar in range(b.nbars):
        sec = song.section(bar)
        r = key + degs[bar % 4]
        minor = degs[bar % 4] in (2, 9, 4)
        tri = _triad(r, minor)
        t0 = b.t(bar)
        # Marimba-Melodie (8tel, staccato), in A2 Frage/Antwort versetzt
        for j in range(8):
            if rhythm[(j + (3 if sec == "A2" else 0)) % 8]:
                m = key + 12 + notes[j] + (12 if sec == "B" and j in (3, 7) else 0)
                mix.add("music", t0 + j * b.beat / 2, marimba(_hz(m)), 0.24)
        # Pizzicato-Akkorde auf den Offbeats
        for j in (1, 3, 5, 7):
            for m in tri:
                mix.add("music", t0 + j * b.beat / 2, pluck(_hz(m + 12), 0.15, 2000), 0.06)
        if sec == "C" and bar % 4 == 0:
            mix.add("fx", t0, riser(b.bar, rng), 0.07)
            for j in range(4):
                mix.add("drums", t0 + j * b.beat, kit.snap, 0.25)
            continue
        # Hüpfender Bass (Oktavsprünge, Tuba-artig)
        for j, (off, oc) in enumerate(((0, 0), (1, 12), (2, 7), (3, 12))):
            tb = _t(b.beat * 0.45)
            sq = np.sign(np.sin(2 * np.pi * _hz(r - 24 + oc) * tb))
            mix.add("bass", t0 + off * b.beat, _lp(sq * _env(tb, 0.004, 7), 600), 0.30)
        mix.add("drums", t0, kit.kick, 0.55)
        mix.kicks.append(t0)
        mix.add("drums", t0 + b.beat * 2.5, kit.kick, 0.4)
        mix.add("drums", t0 + b.beat, kit.clap, 0.30)
        mix.add("drums", t0 + b.beat * 3, kit.clap, 0.30)
        for j in range(8):
            mix.add("drums", t0 + j * b.beat / 2, kit.hat, 0.2 if j % 2 else 0.12)
        if bar % 4 == 3:  # Fill: Tom-Lauf
            for j in range(4):
                tom = kit.tom[: int(SR * 0.3)]
                mix.add("drums", t0 + b.beat * 3 + j * b.beat / 4, tom, 0.18)


def gen_epic(mix, song, key, var, rng, kit):
    roots = _chords_minor(key, var + 2)
    b = song
    mix.add("music", 0, braam(key - 12, b.intro + 0.3, rng), 0.22)
    mix.add("fx", 0, riser(b.intro, rng), 0.12)
    for bar in range(b.nbars):
        sec = song.section(bar)
        r = roots[bar % 4]
        t0 = b.t(bar)
        if bar % 4 == 0:
            mix.add("fx", t0, impact(rng), 0.32)
            mix.add("music", t0, braam(r - 12, b.bar * 1.5, rng), 0.16)
        # 16tel-Streicher-Ostinato (Trailer-Puls), wächst über die Abschnitte
        pat = (0, 0, 12, 0, 7, 0, 12, 7)
        for j in range(16):
            m = r + pat[j % 8] + (12 if sec in ("A2", "B") and j % 2 else 0)
            mix.add("music", t0 + j * b.beat / 4, pluck(_hz(m), 0.16, 1400), 0.13 if j % 4 == 0 else 0.08)
        mix.add("music", t0, pad([_hz(r + 12), _hz(r + 15), _hz(r + 19)], b.bar, rng, fc=1000, att=0.6), 0.10)
        mix.add("bass", t0, _lp(_saw(_hz(r - 24), _t(b.bar)) * np.minimum(1, _t(b.bar) / 0.05), 200), 0.20)
        if sec == "C" and bar % 4 == 0:
            mix.add("fx", t0, riser(b.bar, rng), 0.14)
            continue
        # Taiko-Muster + Kick-Puls
        for off, g in ((0, 0.5), (1.5, 0.3), (2, 0.45), (3, 0.3), (3.5, 0.3)):
            mix.add("drums", t0 + off * b.beat, kit.tom, g)
        mix.add("drums", t0, kit.kick, 0.5)
        mix.kicks.append(t0)
        if sec != "A":
            mix.add("drums", t0 + b.beat * 2, kit.snare, 0.3)
        if bar % 4 == 3:
            for j in range(8):
                mix.add("drums", t0 + b.beat * 2 + j * b.beat / 4, kit.tom, 0.12 + 0.04 * j)
            mix.add("fx", t0 + b.beat * 2, riser(b.beat * 2, rng), 0.12)


def gen_chill(mix, song, key, var, rng, kit):
    banks = [[0, 9, 2, 7], [5, 4, 2, 0], [0, 5, 9, 7], [2, 7, 0, 9]]
    degs = banks[var % 4]
    qual = {0: (0, 4, 7, 11), 2: (0, 3, 7, 10), 4: (0, 3, 7, 10), 5: (0, 4, 7, 11), 7: (0, 4, 7, 10), 9: (0, 3, 7, 10)}
    notes, rhythm = _motif(rng, scale=(0, 2, 4, 7, 9, 12, 14))
    b = song
    sw = 0.08 * b.beat  # Swing
    for m in qual[degs[0]]:
        mix.add("music", 0, keys(_hz(key + degs[0] + m), b.intro + 0.4), 0.10)
    for bar in range(b.nbars):
        sec = song.section(bar)
        d = degs[bar % 4]
        r = key + d
        t0 = b.t(bar)
        # Rhodes-Akkord (leicht verschleppt), Melodie nur in B/A2
        for k, m in enumerate(qual[d]):
            mix.add("music", t0 + 0.012 * k, keys(_hz(r + m), b.bar * 0.9), 0.09)
        if sec in ("B", "A2"):
            for j in range(8):
                if rhythm[j] and j % 2 == 0 or (sec == "A2" and j == 5):
                    mix.add("music", t0 + j * b.beat / 2, keys(_hz(key + 12 + notes[j]), 0.6, dark=False), 0.08)
        mix.add("bass", t0, _lp(np.sin(2 * np.pi * _hz(r - 24) * _t(b.beat * 2.5)) * _env(_t(b.beat * 2.5), 0.01, 1.5), 400), 0.40)
        mix.add("bass", t0 + b.beat * 2.5, _lp(np.sin(2 * np.pi * _hz(r - 24 + 7) * _t(b.beat)) * _env(_t(b.beat), 0.01, 2), 400), 0.30)
        if sec == "C" and bar % 4 == 0:
            continue
        mix.add("drums", t0, kit.kick, 0.45)
        mix.kicks.append(t0)
        mix.add("drums", t0 + b.beat * 2.5, kit.kick, 0.35)
        mix.kicks.append(t0 + b.beat * 2.5)
        mix.add("drums", t0 + b.beat, _lp(kit.snare, 5000), 0.28)
        mix.add("drums", t0 + b.beat * 3, _lp(kit.snare, 5000), 0.28)
        for j in range(8):
            mix.add("drums", t0 + j * b.beat / 2 + (sw if j % 2 else 0), _lp(kit.hat, 9000), 0.16 if j % 2 else 0.22)
        if bar % 4 == 3:
            mix.add("drums", t0 + b.beat * 3.5 + sw, kit.rim, 0.2)


GEN = {"dark": gen_dark, "hype": gen_hype, "funny": gen_funny, "epic": gen_epic, "chill": gen_chill}
KEYS = {"dark": 65, "hype": 67, "funny": 65, "epic": 62, "chill": 63}  # f, g, F, d, Es (MIDI, Oktave 4)


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


def render(seconds: float, mood: str, bpm: float | None = None, seed: int = 0) -> np.ndarray:
    mood = ALIASES.get(mood, mood)
    rng = np.random.default_rng(seed)
    bpm = bpm or DEFAULT_BPM[mood]
    song = Song(seconds, bpm)  # dark/hype: Half-time-Gefühl über Clap/Snare nur auf Schlag 3, Hats im vollen Tempo
    key = KEYS[mood] + int(rng.integers(-2, 3))  # Transposition je Video
    var = int(rng.integers(0, 4))
    mix = Mix(seconds)
    kit = Kit(rng)
    GEN[mood](mix, song, key, var, rng, kit)
    # Hall auf die Musik-Spur (Faltung mit abklingendem Rauschen)
    ir_t = _t(1.6 if mood in ("epic", "dark") else 0.9)
    ir = _lp(rng.standard_normal(len(ir_t)), 5000) * np.exp(-ir_t * 4.5)
    ir /= np.sqrt(np.sum(ir**2))
    m = mix.bus["music"] + 0.5 * mix.bus["fx"]
    m_len = len(m) + len(ir)
    size = 1 << int(np.ceil(np.log2(m_len)))
    wet = np.fft.irfft(np.fft.rfft(m, size) * np.fft.rfft(ir, size), size)[: len(m)]
    music = mix.bus["music"] + 0.22 * wet
    # Sidechain-Pumpen auf Musik (+ Bass bei chill)
    duck = np.ones(mix.n)
    depth = {"chill": 0.55, "dark": 0.3, "hype": 0.35, "funny": 0.2, "epic": 0.25}[mood]
    tt = _t(0.3)
    shape = 1 - depth * np.exp(-tt / 0.09)
    for k in mix.kicks:
        i = int(k * SR)
        seg = duck[i : i + len(shape)]
        duck[i : i + len(seg)] = np.minimum(seg, shape[: len(seg)])
    bass = mix.bus["bass"] * (duck if mood == "chill" else 1)
    out = music * duck + bass + mix.bus["drums"] + mix.bus["fx"]
    if mood == "chill":
        out += crackle(mix.n, rng)
        out = _lp(out, 7000)  # Lo-fi: obere Höhen weg
    out = _filt(out, _voice_dip)  # Stimmband 1–4 kHz freihalten
    out = _hp(out, 30)
    # Lautheit angleichen + weicher Limiter
    out *= 10 ** ((TARGET_LUFS - _kweight_lufs(out)) / 20)
    out = np.tanh(out / 0.95) * 0.95
    n = mix.n
    fade = np.minimum(1, np.minimum(np.arange(n) / (SR * 0.03), (n - np.arange(n)) / (SR * 1.5)))
    return out * fade
