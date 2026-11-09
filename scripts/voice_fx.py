"""Lebendigere Sprecherstimme: Satzmelodie verstärken, Akzentwörter betonen, mehr Druck.

Kokoro-82M klingt gemessen deutlich flacher als die Referenzvideos des Nutzers
(Tonhöhen-Streuung ~3–3,6 statt ~5,6–5,9 Halbtöne, siehe docs/clip-regeln.md, „Stimme“).
Dieses Modul bearbeitet die fertige Sprachspur, OHNE das Timing zu ändern
(Untertitel und Cues bleiben synchron):

1. `liven`: WORLD-Vocoder (pyworld, MIT) zerlegt die Stimme in Tonhöhe, Klangfarbe und
   Rauschanteil. Die Abweichung der Tonhöhe von einer langsam gleitenden Grundlinie wird
   je Szene mit einem Faktor `expr` verstärkt (1.0 = unverändert). Akzentwörter bekommen
   zusätzlich einen Tonhöhen-Bogen (+Halbtöne) und mehr Lautstärke.
2. `power`: ffmpeg-Kette – Tiefen entschlacken, Präsenz anheben, komprimieren, begrenzen.

    python scripts/voice_fx.py in.wav out.wav --expr 2.0          # Test an einer Datei
"""

from __future__ import annotations

import subprocess
import tempfile
import warnings
from pathlib import Path

import numpy as np

# Sprechweisen: Tempo-Faktor (auf `speed` des Drehbuchs) und Melodie-Faktor `expr`.
# Werte sind Startwerte aus dem Hörvergleich, keine Messgrößen – per Szene überschreibbar.
DELIVERY = {
    "normal": {"speed": 1.00, "expr": 2.0, "exag": 0.0},
    "hype": {"speed": 1.08, "expr": 2.3, "exag": 0.15},   # aufgedreht, schnell
    "tense": {"speed": 0.92, "expr": 1.6, "exag": -0.05},  # leise Spannung, langsamer
    "punch": {"speed": 0.94, "expr": 2.3, "exag": 0.1},  # Pointe / Wendepunkt
    "calm": {"speed": 0.95, "expr": 1.4, "exag": -0.15},   # ruhig, erklärend
}
# Sprechstil eines ganzen Videos (Dashboard-/Drehbuch-Feld `voicePreset`). Die Stile müssen klar hörbar verschieden sein
# (Rückmeldung des Nutzers 09.11.2026: „hören sich in jedem Sprechstil gleich an“). Je Stil:
#   delivery  Standard-Sprechweise der Szenen        speed   Tempo-Faktor zusätzlich zur Sprechweise
#   scale     Stärke der Melodie (1.0 = DELIVERY)     shift   Stimmlage in Halbtönen (+ höher, − tiefer)
#   emph_*    Betonung der *Akzentwörter*             pause_ms Länge der „ | “-Pausen
#   power     Klangkette: "punch" (Druck) oder "soft" (weich, nah)
# Chatterbox (Standard für neue Videos seit 09.11.2026): `exaggeration`/`cfg` je Stil, `exag` je Sprechweise als Zuschlag.
# Diese Werte klangen in den vom Nutzer freigegebenen Hörproben so (Dashboard, 09.11.2026).
STYLES = {
    "lebendig": {"delivery": "normal", "speed": 1.00, "scale": 1.0, "shift": 0.0, "emph_st": 2.5, "emph_db": 3.0, "pause_ms": 350, "power": "punch", "exaggeration": 0.6, "cfg": 0.4},
    "spannend": {"delivery": "tense", "speed": 0.86, "scale": 0.9, "shift": -2.0, "emph_st": 3.5, "emph_db": 4.0, "pause_ms": 650, "power": "soft", "exaggeration": 0.45, "cfg": 0.3},
    "witzig": {"delivery": "hype", "speed": 1.12, "scale": 1.35, "shift": 2.0, "emph_st": 3.5, "emph_db": 3.0, "pause_ms": 220, "power": "punch", "exaggeration": 0.85, "cfg": 0.3},
    "ruhig": {"delivery": "calm", "speed": 0.90, "scale": 0.55, "shift": -0.7, "emph_st": 1.2, "emph_db": 1.5, "pause_ms": 450, "power": "soft", "exaggeration": 0.3, "cfg": 0.5},
}


def scene_expr(delivery_expr: float, style: dict) -> float:
    """Melodie-Faktor einer Szene: Sprechweise, skaliert mit dem Stil des Videos."""
    return 1.0 + (delivery_expr - 1.0) * style["scale"]


FRAME_MS = 5.0


def _moving_avg(x: np.ndarray, n: int) -> np.ndarray:
    if n <= 1:
        return x
    k = np.ones(n) / n
    pad = np.pad(x, (n // 2, n - 1 - n // 2), mode="edge")
    return np.convolve(pad, k, mode="valid")


def liven(
    audio: np.ndarray,
    sr: int,
    segments: list[tuple[float, float, float]] | None = None,
    emphasis: list[tuple[float, float]] | None = None,
    expr: float = 2.0,
    emph_st: float = 2.5,
    emph_db: float = 3.0,
    max_dev_st: float = 9.0,
    shift: float = 0.0,
) -> np.ndarray:
    """Satzmelodie verstärken.

    segments: [(start_s, end_s, expr)] – eigener Faktor je Abschnitt (z. B. je Szene), sonst `expr`.
    emphasis: [(start_s, end_s)] – Akzentwörter: Tonhöhen-Bogen +emph_st Halbtöne, +emph_db dB.
    """
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        import pyworld as pw

    x = audio.astype(np.float64)
    f0, t = pw.harvest(x, sr, f0_floor=60.0, f0_ceil=500.0, frame_period=FRAME_MS)
    sp = pw.cheaptrick(x, f0, t, sr)
    ap = pw.d4c(x, f0, t, sr)
    voiced = f0 > 0
    if voiced.sum() < 10:
        return audio

    # Tonhöhe in Halbtönen; Lücken (stimmlos) linear füllen, damit die Grundlinie glatt bleibt
    st = np.full(len(f0), np.nan)
    st[voiced] = 12 * np.log2(f0[voiced])
    idx = np.arange(len(st))
    filled = np.interp(idx, idx[voiced], st[voiced])
    base = _moving_avg(filled, int(600 / FRAME_MS))  # ~0,6 s gleitende Grundlinie (gemessen besser als 1,2/2,5 s)

    k = np.full(len(f0), expr)
    for s0, s1, e in segments or []:
        k[int(s0 * 1000 / FRAME_MS):int(s1 * 1000 / FRAME_MS)] = e
    k = _moving_avg(k, int(150 / FRAME_MS))  # weiche Übergänge zwischen Szenen

    # Nach oben stärker als nach unten: zu tiefe Lagen klingen beim Vocoder knarrend
    d = filled - base
    dev = np.clip(np.where(d > 0, k * d, (1 + (k - 1) * 0.5) * d), -max_dev_st, max_dev_st)
    new = base + dev

    gain_db = np.zeros(len(f0))
    for w0, w1 in emphasis or []:
        a, b = int(w0 * 1000 / FRAME_MS), int(w1 * 1000 / FRAME_MS)
        if b <= a:
            continue
        win = np.sin(np.linspace(0, np.pi, b - a)) ** 0.7
        new[a:b] += emph_st * win
        gain_db[a:b] = np.maximum(gain_db[a:b], emph_db * win)

    new = new + shift  # Stimmlage des Stils
    f0n = np.where(voiced, 2 ** (new / 12), 0.0)
    y = pw.synthesize(f0n, sp, ap, sr, frame_period=FRAME_MS)[: len(x)]
    if len(y) < len(x):
        y = np.pad(y, (0, len(x) - len(y)))
    # Lautstärke-Bogen auf Abtastrate hochrechnen
    g = np.interp(np.arange(len(y)) / sr * 1000 / FRAME_MS, idx, gain_db)
    y = y * 10 ** (g / 20)
    peak = np.max(np.abs(y)) or 1.0
    return (y / max(peak, 1.0)).astype(np.float32)


POWER_CHAINS = {
    # Druck: Mulm raus, Präsenz rauf, kräftig komprimieren
    "punch": ",".join([
        "highpass=f=70",
        "equalizer=f=280:t=q:w=1.0:g=-2",
        "equalizer=f=3200:t=q:w=1.2:g=3.5",
        "equalizer=f=9000:t=q:w=1.0:g=1.5",
        "acompressor=threshold=-22dB:ratio=3.5:attack=4:release=80:makeup=5",
        "alimiter=limit=0.95:level=disabled",
    ]),
    # weich und nah (Erzähler-Ton): etwas Wärme, Höhen sanfter, leichte Kompression
    "soft": ",".join([
        "highpass=f=60",
        "equalizer=f=180:t=q:w=1.0:g=2",
        "equalizer=f=3200:t=q:w=1.2:g=0.5",
        "equalizer=f=8000:t=q:w=1.0:g=-2.5",
        "acompressor=threshold=-26dB:ratio=2:attack=12:release=150:makeup=3",
        "alimiter=limit=0.95:level=disabled",
    ]),
}
POWER_CHAIN = POWER_CHAINS["punch"]


def power(in_wav: Path, out_wav: Path, chain: str = "punch") -> None:
    """Klangkette (ffmpeg). Lautheit normalisiert später scripts/finalize.sh."""
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(in_wav), "-af", POWER_CHAINS[chain], str(out_wav)], check=True)


# Rückmeldung des Nutzers (09.11.2026): „Stimmen hören sich unnatürlich an.“ Die Tonhöhen-Bearbeitung per
# WORLD-Vocoder (liven) ist deshalb standardmäßig AUS; nur Lautstärke-Akzente und Klangkette bleiben.
VOCODER_DEFAULT = False


def accent_gain(x: np.ndarray, sr: int, emphasis, emph_db: float) -> np.ndarray:
    """Akzentwörter nur lauter machen (kein Eingriff in die Tonhöhe, klingt natürlich)."""
    g = np.zeros(len(x))
    for w0, w1 in emphasis or []:
        a, b = int(w0 * sr), int(w1 * sr)
        if b > a:
            g[a:b] = np.maximum(g[a:b], emph_db * np.sin(np.linspace(0, np.pi, b - a)) ** 0.7)
    y = x * 10 ** (g / 20)
    return (y / max(np.max(np.abs(y)), 1.0)).astype(np.float32)


def process(in_wav: Path, out_wav: Path, segments=None, emphasis=None, expr=2.0, emph_st=2.5, emph_db=3.0,
            shift: float = 0.0, chain: str = "punch", vocoder: bool = VOCODER_DEFAULT) -> None:
    import soundfile as sf

    x, sr = sf.read(str(in_wav), dtype="float32")
    if x.ndim > 1:
        x = x.mean(axis=1)
    y = liven(x, sr, segments, emphasis, expr, emph_st, emph_db, shift=shift) if vocoder else accent_gain(x, sr, emphasis, emph_db)
    with tempfile.TemporaryDirectory() as tmp:
        mid = Path(tmp) / "liven.wav"
        sf.write(str(mid), y, sr)
        power(mid, out_wav, chain)


if __name__ == "__main__":
    import argparse

    ap = argparse.ArgumentParser(description="Sprachspur lebendiger machen (Timing bleibt gleich)")
    ap.add_argument("inp", type=Path)
    ap.add_argument("out", type=Path)
    ap.add_argument("--expr", type=float, default=2.0, help="Melodie-Faktor (1.0 = unverändert)")
    ap.add_argument("--no-power", action="store_true")
    a = ap.parse_args()
    if a.no_power:
        import soundfile as sf

        x, sr = sf.read(str(a.inp), dtype="float32")
        sf.write(str(a.out), liven(x if x.ndim == 1 else x.mean(1), sr, expr=a.expr), sr)
    else:
        process(a.inp, a.out, expr=a.expr)
    print(f"Fertig: {a.out}")
